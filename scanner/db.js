// Supabase service-role client for the scanner.
// Bypasses RLS — never include this file in the Next.js app.

import { createClient } from '@supabase/supabase-js';

export const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

/**
 * Insert raw posts, skipping duplicates (by reddit_id).
 * @returns number of newly inserted posts
 */
export async function upsertRawPosts(posts) {
  if (posts.length === 0) return 0;

  const { data, error } = await db
    .from('raw_posts')
    .upsert(posts, { onConflict: 'reddit_id', ignoreDuplicates: true })
    .select('id');

  if (error) {
    console.error('[db] upsert raw_posts error:', error);
    return 0;
  }
  return data?.length || 0;
}

export async function getActiveProjects() {
  const { data, error } = await db
    .from('projects')
    .select('*')
    .eq('status', 'active');
  if (error) throw error;
  return data || [];
}

export async function getUnclassifiedPosts(limit = 200) {
  const { data, error } = await db
    .from('raw_posts')
    .select('*')
    .is('classified_at', null)
    .order('fetched_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function markClassified(ids) {
  if (ids.length === 0) return;
  const { error } = await db
    .from('raw_posts')
    .update({ classified_at: new Date().toISOString() })
    .in('id', ids);
  if (error) console.error('[db] markClassified error:', error);
}

export async function insertLead(lead) {
  const { error } = await db.from('leads').upsert(lead, {
    onConflict: 'project_id,raw_post_id',
    ignoreDuplicates: true,
  });
  if (error) console.error('[db] insertLead error:', error);
}

export async function logScanRun(run) {
  const { error } = await db.from('scan_runs').insert(run);
  if (error) console.error('[db] logScanRun error:', error);
}

export async function updateProjectLastScanned(projectId) {
  await db
    .from('projects')
    .update({ last_scanned_at: new Date().toISOString() })
    .eq('id', projectId);
}
