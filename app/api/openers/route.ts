import { NextResponse } from 'next/server';
import { z } from 'zod';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import OpenAI from 'openai';
import { createServer, createServiceRole } from '@/lib/supabase-server';
import type { SafetyMode } from '@/lib/types';

export const runtime = 'nodejs';

const Body = z.object({
  lead_id: z.string().uuid(),
  mode: z.enum(['safe', 'soft', 'promo']).default('safe'),
});

const PROMPT_FILES: Record<SafetyMode, string> = {
  safe: 'opener-safe.txt',
  soft: 'opener-soft.txt',
  promo: 'opener-promo.txt',
};

let promptCache: Partial<Record<SafetyMode, string>> = {};
function loadPrompt(mode: SafetyMode): string {
  if (promptCache[mode]) return promptCache[mode]!;
  const path = join(process.cwd(), 'prompts', PROMPT_FILES[mode]);
  const text = readFileSync(path, 'utf-8');
  promptCache[mode] = text;
  return text;
}

export async function POST(request: Request) {
  const supabase = createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid input' }, { status: 400 });
  }
  const { lead_id, mode } = parsed.data;

  const { data: lead, error: leadErr } = await supabase
    .from('leads')
    .select(
      `id, pain_point, project_id,
       project:projects!inner ( id, user_id, name, description, product_url ),
       raw_post:raw_posts!inner ( title, body, subreddit )`
    )
    .eq('id', lead_id)
    .maybeSingle();

  if (leadErr || !lead) {
    return NextResponse.json({ error: 'lead not found' }, { status: 404 });
  }

  type LeadRow = {
    id: string;
    pain_point: string | null;
    project: { id: string; user_id: string; name: string; description: string; product_url: string | null };
    raw_post: { title: string; body: string | null; subreddit: string };
  };
  const row = lead as unknown as LeadRow;

  if (row.project.user_id !== user.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  if (mode === 'promo') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('reddit_karma')
      .eq('id', user.id)
      .maybeSingle();
    const karma = profile?.reddit_karma ?? 0;
    if (karma < 1000) {
      return NextResponse.json(
        {
          error:
            'Promo mode requires reported Reddit karma ≥ 1000. Update your profile or use safe/soft mode.',
        },
        { status: 403 }
      );
    }
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.startsWith('sk-placeholder')) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY not configured' },
      { status: 500 }
    );
  }
  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL_OPENER || 'gpt-4o';

  const systemPrompt = loadPrompt(mode);
  const userPayload = {
    product: {
      name: row.project.name,
      description: row.project.description,
      url: row.project.product_url,
    },
    post: {
      subreddit: row.raw_post.subreddit,
      title: row.raw_post.title,
      body: (row.raw_post.body || '').slice(0, 2500),
    },
    pain_point: row.pain_point,
  };

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(userPayload) },
    ],
    temperature: 0.7,
    max_tokens: 400,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    return NextResponse.json({ error: 'empty completion' }, { status: 502 });
  }

  const service = createServiceRole();
  const { error: insertErr } = await service.from('openers').insert({
    lead_id,
    mode,
    content,
    model,
  });
  if (insertErr) {
    console.error('[openers] cache insert failed:', insertErr);
  }

  return NextResponse.json({ content, mode });
}
