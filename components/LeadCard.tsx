'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LeadStatus, SafetyMode } from '@/lib/types';

type Props = {
  lead: {
    id: string;
    pattern_score: number;
    llm_score: number | null;
    combined_score: number;
    matched_patterns: string[];
    llm_reasoning: string | null;
    pain_point: string | null;
    status: LeadStatus;
    raw_post: {
      title: string;
      body: string | null;
      subreddit: string;
      author: string | null;
      url: string;
      posted_at: string;
      num_comments: number | null;
    };
    cached_opener?: { mode: SafetyMode; content: string } | null;
  };
};

export function LeadCard({ lead }: Props) {
  const router = useRouter();
  const [opener, setOpener] = useState<string | null>(
    lead.cached_opener?.content ?? null
  );
  const [generating, setGenerating] = useState(false);
  const [acting, setActing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function generateOpener() {
    setGenerating(true);
    setErrorMsg(null);
    const res = await fetch('/api/openers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: lead.id, mode: 'safe' }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErrorMsg(body.error || 'Failed to generate');
      setGenerating(false);
      return;
    }
    const { content } = await res.json();
    setOpener(content);
    setGenerating(false);
  }

  async function setStatus(status: LeadStatus) {
    setActing(true);
    setErrorMsg(null);
    const res = await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErrorMsg(body.error || 'Failed');
      setActing(false);
      return;
    }
    router.refresh();
  }

  function copyOpener() {
    if (!opener) return;
    navigator.clipboard.writeText(opener);
  }

  const postedAgo = formatRelative(lead.raw_post.posted_at);

  return (
    <article className="border border-neutral-800 rounded-lg p-5 space-y-3">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <a
            href={lead.raw_post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block font-medium hover:text-accent line-clamp-2"
          >
            {lead.raw_post.title}
          </a>
          <p className="text-xs text-muted mt-1">
            r/{lead.raw_post.subreddit} ·{' '}
            {lead.raw_post.author ? `u/${lead.raw_post.author} · ` : ''}
            {postedAgo} · {lead.raw_post.num_comments ?? 0} comments
          </p>
        </div>
        <ScoreBadge score={lead.combined_score} />
      </header>

      {lead.llm_reasoning && (
        <p className="text-sm text-fg/80 italic border-l-2 border-neutral-800 pl-3">
          {lead.llm_reasoning}
        </p>
      )}

      <div className="flex flex-wrap gap-2 text-xs">
        {lead.pain_point && (
          <span className="px-2 py-0.5 rounded bg-neutral-900 text-fg/80">
            pain: {lead.pain_point}
          </span>
        )}
        {lead.matched_patterns.map((p) => (
          <span
            key={p}
            className="px-2 py-0.5 rounded bg-neutral-900 text-muted"
          >
            {p}
          </span>
        ))}
      </div>

      {opener && (
        <div className="border border-neutral-800 rounded p-3 bg-neutral-950 text-sm whitespace-pre-wrap">
          {opener}
          <div className="mt-3 flex gap-2">
            <button
              onClick={copyOpener}
              className="text-xs px-2 py-1 border border-neutral-800 rounded hover:border-accent"
            >
              Copy
            </button>
            <button
              onClick={generateOpener}
              disabled={generating}
              className="text-xs px-2 py-1 border border-neutral-800 rounded hover:border-accent disabled:opacity-50"
            >
              {generating ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {!opener && (
          <button
            onClick={generateOpener}
            disabled={generating}
            className="text-sm px-3 py-1.5 bg-accent text-black rounded font-medium disabled:opacity-50"
          >
            {generating ? 'Writing...' : 'Generate opener'}
          </button>
        )}
        <button
          onClick={() => setStatus('engaged')}
          disabled={acting || lead.status === 'engaged'}
          className="text-sm px-3 py-1.5 border border-neutral-800 rounded hover:border-accent disabled:opacity-50"
        >
          {lead.status === 'engaged' ? 'Engaged ✓' : 'Mark engaged'}
        </button>
        <button
          onClick={() => setStatus('dismissed')}
          disabled={acting}
          className="text-sm px-3 py-1.5 border border-neutral-800 rounded text-muted hover:text-fg disabled:opacity-50"
        >
          Dismiss
        </button>
        <a
          href={lead.raw_post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm px-3 py-1.5 border border-neutral-800 rounded hover:border-accent ml-auto"
        >
          Open on Reddit ↗
        </a>
      </div>

      {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}
    </article>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 15
      ? 'bg-accent text-black'
      : score >= 8
      ? 'bg-yellow-600 text-black'
      : 'bg-neutral-800 text-fg';
  return (
    <span
      className={`shrink-0 ${color} text-xs font-mono px-2 py-1 rounded`}
      title="combined_score = pattern_score + llm_score × 2"
    >
      {score}
    </span>
  );
}

function formatRelative(iso: string) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}
