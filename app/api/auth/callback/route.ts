import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/dashboard';

  const err = url.searchParams.get('error_code') || url.searchParams.get('error');
  const errDesc = url.searchParams.get('error_description');
  if (err) {
    const target = new URL('/', url.origin);
    target.searchParams.set('auth_error', err);
    if (errDesc) target.searchParams.set('auth_error_desc', errDesc);
    return NextResponse.redirect(target);
  }

  if (code) {
    const supabase = createServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const target = new URL('/', url.origin);
      target.searchParams.set('auth_error', 'exchange_failed');
      target.searchParams.set('auth_error_desc', error.message);
      return NextResponse.redirect(target);
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
