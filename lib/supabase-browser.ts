import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Browser Supabase client used from client components.
// Clerk is the session authority — we forward its token so RLS policies
// using (auth.jwt() ->> 'sub') see the Clerk user ID.
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      async accessToken() {
        if (typeof window === 'undefined') return null;
        // @ts-expect-error Clerk injects window.Clerk on the client
        const clerk = window.Clerk;
        if (!clerk?.session) return null;
        return (await clerk.session.getToken()) ?? null;
      },
    }
  );
}
