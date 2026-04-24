import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { createServer } from '@/lib/supabase-server';
import { ensureProfile } from '@/lib/ensure-profile';

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

  return NextResponse.json({ id: data.id });
}
