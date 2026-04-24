import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServer, createServiceRole } from '@/lib/supabase-server';

// DELETE /api/projects/:id — Pro plan only. Cascades to leads via FK.
// Free users get 402 and should be routed to the upgrade flow.
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const admin = createServiceRole();
  const { data: profile } = await admin
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.plan !== 'pro') {
    return NextResponse.json(
      { error: 'Removing projects is a Pro feature. Upgrade to continue.' },
      { status: 402 }
    );
  }

  const supabase = createServer();
  const { error, count } = await supabase
    .from('projects')
    .delete({ count: 'exact' })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!count) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
