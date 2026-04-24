import { currentUser } from '@clerk/nextjs/server';
import { createServiceRole } from '@/lib/supabase-server';

// Ensures a profiles row exists for the current Clerk user.
// Called lazily from protected pages/routes in place of a Clerk webhook.
// Cached per-request via React's request memoization (this module is only
// used in server components / route handlers, not reused across requests).
const ensured = new Set<string>();

export async function ensureProfile(userId: string): Promise<void> {
  if (ensured.has(userId)) return;
  const user = await currentUser();
  const email =
    user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? user?.emailAddresses[0]?.emailAddress;
  if (!email) return;
  const db = createServiceRole();
  const { error } = await db
    .from('profiles')
    .upsert({ id: userId, email }, { onConflict: 'id', ignoreDuplicates: true });
  if (error) {
    console.error('[ensureProfile] upsert failed:', error);
    return;
  }
  ensured.add(userId);
}
