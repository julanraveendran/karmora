'use client';

import { useState } from 'react';

type Props = { plan: 'free' | 'pro' };

export function PlanButtons({ plan }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go(endpoint: '/api/stripe/checkout' | '/api/stripe/portal') {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || 'Billing unavailable');
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError('Network error');
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-xs px-2 py-0.5 rounded border ${
          plan === 'pro'
            ? 'border-accent text-accent'
            : 'border-neutral-700 text-muted'
        }`}
      >
        {plan === 'pro' ? 'Pro' : 'Free'}
      </span>
      {plan === 'pro' ? (
        <button
          type="button"
          onClick={() => go('/api/stripe/portal')}
          disabled={loading}
          className="text-sm px-3 py-1.5 rounded border border-neutral-800 hover:border-accent disabled:opacity-40"
        >
          {loading ? 'Opening…' : 'Manage subscription'}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => go('/api/stripe/checkout')}
          disabled={loading}
          className="text-sm px-3 py-1.5 rounded bg-accent text-black font-medium disabled:opacity-40"
        >
          {loading ? 'Redirecting…' : 'Upgrade to Pro'}
        </button>
      )}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
