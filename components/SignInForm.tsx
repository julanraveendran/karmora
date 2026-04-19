'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/api/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      return;
    }
    setStatus('sent');
  }

  if (status === 'sent') {
    return (
      <div className="border border-neutral-800 rounded-lg p-6 text-sm">
        Check <span className="font-mono text-fg">{email}</span> for the magic
        link. It expires in 1 hour.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@founder.com"
        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-fg placeholder:text-muted focus:outline-none focus:border-accent"
        disabled={status === 'sending'}
      />
      <button
        type="submit"
        disabled={status === 'sending' || !email}
        className="w-full bg-accent text-black rounded px-4 py-2 font-medium disabled:opacity-50"
      >
        {status === 'sending' ? 'Sending...' : 'Send magic link'}
      </button>
      {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}
    </form>
  );
}
