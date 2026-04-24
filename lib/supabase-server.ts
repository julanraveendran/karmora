import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

// Server-side Supabase client for server components + API routes.
// Clerk issues the session; we forward its JWT to Supabase so RLS
// policies using (auth.jwt() ->> 'sub') see the Clerk user ID.
// Requires Clerk configured as a third-party auth provider in Supabase.
export function createServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      async accessToken() {
        const { getToken } = await auth();
        return (await getToken()) ?? null;
      },
    }
  );
}

// For background tasks that need to bypass RLS — NEVER expose to browser
export function createServiceRole() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
