import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { createServer, createServiceRole } from '@/lib/supabase-server';
import { ensureProfile } from '@/lib/ensure-profile';
import { matchIntentPatterns, matchesProject } from '@/lib/patterns';

const BACKFILL_WINDOW_HOURS = 48;
const BACKFILL_POOL_LIMIT = 1000;
const BACKFILL_MAX_LEADS = 20;

const Body = z.object({
  name: z.string().min(1).max(80),
  description: z.string().min(1).max(1000),
  product_url: z.string().url().nullable().optional(),
  icp: z.string().max(200).nullable().optional(),
  target_subreddits: z.array(z.string().min(1).max(50)).min(1).max(20),
  keywords: z.array(z.string().min(1).max(50)).max(20).default([]),
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  await ensureProfile(userId);
  const supabase = createServer();

  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'invalid input' },
      { status: 400 }
    );
  }

  const { data: canCreate, error: limitErr } = await supabase.rpc(
    'user_can_create_project',
    { uid: userId }
  );
  if (limitErr) {
    return NextResponse.json({ error: limitErr.message }, { status: 500 });
  }
  if (!canCreate) {
    return NextResponse.json(
      { error: 'Plan limit reached. Upgrade to Pro for more projects.' },
      { status: 402 }
    );
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      name: parsed.data.name,
      description: parsed.data.description,
      product_url: parsed.data.product_url ?? null,
      icp: parsed.data.icp ?? null,
      target_subreddits: parsed.data.target_subreddits,
      keywords: parsed.data.keywords,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await backfillLeads(data.id, parsed.data);
  await triggerFirstScan(data.id);

  return NextResponse.json({ id: data.id });
}

async function triggerFirstScan(projectId: string): Promise<void> {
  const url = process.env.SCANNER_WEBHOOK_URL;
  const secret = process.env.SCANNER_WEBHOOK_SECRET;
  if (!url || !secret) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ projectId }),
      signal: AbortSignal.timeout(3000),
    });
  } catch (err) {
    console.error('[triggerFirstScan] failed:', err);
  }
}

async function backfillLeads(
  projectId: string,
  project: {
    target_subreddits: string[];
    keywords: string[];
  }
): Promise<void> {
  try {
    const admin = createServiceRole();
    const subSet = new Set<string>();
    for (const s of project.target_subreddits) {
      subSet.add(s);
      subSet.add(s.toLowerCase());
    }

    const since = new Date(
      Date.now() - BACKFILL_WINDOW_HOURS * 60 * 60 * 1000
    ).toISOString();

    const { data: pool } = await admin
      .from('raw_posts')
      .select('id, title, body, subreddit')
      .in('subreddit', Array.from(subSet))
      .gte('posted_at', since)
      .order('posted_at', { ascending: false })
      .limit(BACKFILL_POOL_LIMIT);

    if (!pool || pool.length === 0) return;

    const projectForMatch = {
      target_subreddits: project.target_subreddits,
      keywords: project.keywords,
      exclude_keywords: [] as string[],
    };

    const scored: {
      raw_post_id: string;
      score: number;
      matched: string[];
    }[] = [];
    for (const post of pool) {
      if (!matchesProject(post, projectForMatch)) continue;
      const { score, matchedPatterns } = matchIntentPatterns(
        `${post.title}\n\n${post.body || ''}`
      );
      if (score > 0) {
        scored.push({ raw_post_id: post.id, score, matched: matchedPatterns });
      }
    }
    if (scored.length === 0) return;

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, BACKFILL_MAX_LEADS);

    const rows = top.map((s) => ({
      project_id: projectId,
      raw_post_id: s.raw_post_id,
      pattern_score: s.score,
      matched_patterns: s.matched,
    }));

    await admin
      .from('leads')
      .upsert(rows, { onConflict: 'project_id,raw_post_id', ignoreDuplicates: true });
  } catch (err) {
    console.error('[backfillLeads] failed:', err);
  }
}
