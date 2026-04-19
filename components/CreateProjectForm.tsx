'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SUGGESTED_SUBS = [
  'SaaS',
  'startups',
  'Entrepreneur',
  'smallbusiness',
  'SideProject',
  'indiehackers',
  'webdev',
  'marketing',
];

export function CreateProjectForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [icp, setIcp] = useState('');
  const [subreddits, setSubreddits] = useState<string[]>([]);
  const [keywords, setKeywords] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function toggleSub(sub: string) {
    setSubreddits((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (subreddits.length === 0) {
      setErrorMsg('Pick at least one subreddit.');
      return;
    }

    setSubmitting(true);
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        product_url: productUrl || null,
        icp: icp || null,
        target_subreddits: subreddits,
        keywords: keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErrorMsg(body.error || `Failed (${res.status})`);
      setSubmitting(false);
      return;
    }

    const { id } = await res.json();
    router.push(`/dashboard/${id}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Field label="Product name" hint="e.g. Karmora">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2"
          maxLength={80}
        />
      </Field>

      <Field
        label="What does it do?"
        hint="One paragraph. The scanner uses this to score relevance."
      >
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 min-h-[100px]"
          maxLength={1000}
        />
      </Field>

      <Field label="Product URL" hint="optional">
        <input
          type="url"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          placeholder="https://"
          className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2"
        />
      </Field>

      <Field label="Ideal customer" hint="optional. e.g. 'indie SaaS founders pre-revenue'">
        <input
          value={icp}
          onChange={(e) => setIcp(e.target.value)}
          className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2"
        />
      </Field>

      <Field
        label="Target subreddits"
        hint="Click to toggle. Pick 3-8 to start."
      >
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_SUBS.map((sub) => {
            const on = subreddits.includes(sub);
            return (
              <button
                key={sub}
                type="button"
                onClick={() => toggleSub(sub)}
                className={`px-3 py-1 rounded text-sm border ${
                  on
                    ? 'bg-accent text-black border-accent'
                    : 'border-neutral-800 text-fg hover:border-neutral-600'
                }`}
              >
                r/{sub}
              </button>
            );
          })}
        </div>
        {subreddits.length > 0 && (
          <p className="text-xs text-muted mt-2">
            Picked: {subreddits.map((s) => `r/${s}`).join(', ')}
          </p>
        )}
      </Field>

      <Field
        label="Extra keywords"
        hint="Comma-separated. Catches posts in non-target subs that mention these."
      >
        <input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="reddit leads, customer discovery, lead gen"
          className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2"
        />
      </Field>

      {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-accent text-black rounded px-5 py-2 font-medium disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create project'}
        </button>
        <a
          href="/dashboard"
          className="px-5 py-2 text-muted hover:text-fg"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {hint && <p className="text-xs text-muted mb-2">{hint}</p>}
      {children}
    </div>
  );
}
