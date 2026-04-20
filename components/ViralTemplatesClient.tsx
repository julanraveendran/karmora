'use client';

import { useEffect, useState } from 'react';
import type { ViralTemplate } from '@/lib/viral-templates';
import { REDDIT_TIPS } from '@/lib/viral-templates';

type Props = { templates: ViralTemplate[] };

export function ViralTemplatesClient({ templates }: Props) {
  const [selected, setSelected] = useState<ViralTemplate | null>(null);
  const [tipsOpen, setTipsOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelected(null);
        setTipsOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Viral Post Templates</h1>
          <p className="text-muted text-sm mt-1">
            Click a template to customize it for your product, then copy-paste to
            Reddit.
          </p>
        </div>
        <button
          onClick={() => setTipsOpen(true)}
          className="shrink-0 border border-amber-500/60 text-amber-400 px-3 py-1.5 rounded text-sm hover:bg-amber-500/10"
        >
          💡 Reddit Tips
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t)}
            className="text-left border border-neutral-800 rounded-lg p-4 hover:border-accent transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="font-medium leading-snug line-clamp-3">
                {t.template.title}
              </h3>
              <TypeBadge type={t.type} />
            </div>
            <div className="flex gap-3 text-xs text-muted">
              <span>↑ {t.stats.upvotes.toLocaleString()} upvotes</span>
              <span>💬 {t.stats.comments.toLocaleString()} comments</span>
            </div>
          </button>
        ))}
      </div>

      {selected && <TemplateEditorModal template={selected} onClose={() => setSelected(null)} />}
      {tipsOpen && <RedditTipsModal onClose={() => setTipsOpen(false)} />}
    </>
  );
}

function TypeBadge({ type }: { type: 'sell' | 'engagement' }) {
  const isSell = type === 'sell';
  return (
    <span
      className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${
        isSell
          ? 'bg-amber-500/20 text-amber-300'
          : 'bg-sky-500/20 text-sky-300'
      }`}
    >
      {isSell ? 'Sell' : 'Engagement'}
    </span>
  );
}

function TemplateEditorModal({
  template,
  onClose,
}: {
  template: ViralTemplate;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(template.template.title);
  const [body, setBody] = useState(template.template.body);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-start md:items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0a0a0a] border border-neutral-800 rounded-xl w-full max-w-5xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 p-5 border-b border-neutral-800">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <TypeBadge type={template.type} />
              <span className="text-xs text-muted">
                ↑ {template.stats.upvotes.toLocaleString()} ·{' '}
                {template.stats.comments.toLocaleString()} comments
              </span>
            </div>
            <h2 className="text-lg font-semibold leading-snug">
              {template.original.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 text-muted hover:text-fg text-2xl leading-none"
          >
            ×
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
          <section>
            <h3 className="text-sm font-semibold mb-3 text-amber-400">
              Edit Template
            </h3>
            <FieldLabel label="Post Title" onCopy={() => copy(title)} />
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={2}
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm mb-4 resize-none"
            />
            <FieldLabel label="Post Text" onCopy={() => copy(body)} />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={14}
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm whitespace-pre-wrap font-mono text-xs leading-relaxed"
            />
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-3 text-sky-400">
              Original Post
            </h3>
            <FieldLabel
              label="Post Title"
              onCopy={() => copy(template.original.title)}
            />
            <div className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm mb-4 min-h-[52px] whitespace-pre-wrap">
              {template.original.title}
            </div>
            <FieldLabel
              label="Post Text"
              onCopy={() => copy(template.original.body)}
            />
            <div className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[340px] overflow-y-auto">
              {template.original.body}
            </div>
          </section>
        </div>

        <footer className="border-t border-neutral-800 px-5 py-3 text-xs text-muted">
          <span className="font-medium text-fg">Best places to post:</span>{' '}
          {template.bestSubs.join(', ')}
        </footer>
      </div>
    </div>
  );
}

function FieldLabel({ label, onCopy }: { label: string; onCopy: () => void }) {
  const [copied, setCopied] = useState(false);
  function handle() {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }
  return (
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-muted">{label}</span>
      <button
        onClick={handle}
        className="text-xs text-muted hover:text-accent"
      >
        {copied ? 'Copied ✓' : '📋 Copy'}
      </button>
    </div>
  );
}

function RedditTipsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-start md:items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0a0a0a] border border-neutral-800 rounded-xl w-full max-w-xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-5 border-b border-neutral-800">
          <h2 className="text-lg font-semibold">Reddit Engagement Tips</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-fg text-2xl leading-none"
          >
            ×
          </button>
        </header>
        <div className="p-5 space-y-4">
          <TipsSection title="Best Posting Times" items={REDDIT_TIPS.postingTimes} />
          <TipsSection title="Best Posting Practices" items={REDDIT_TIPS.postingPractices} />
          <TipsSection title="Reddit Account Tips" items={REDDIT_TIPS.accountTips} />
          <TipsSection title="Community Engagement" items={REDDIT_TIPS.communityEngagement} />
        </div>
      </div>
    </div>
  );
}

function TipsSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-amber-500/5 border border-amber-500/20 rounded p-3">
      <h3 className="font-semibold text-amber-400 text-sm mb-2">{title}</h3>
      <ul className="text-sm space-y-1 list-disc pl-5">
        {items.map((item, i) => (
          <li key={i} className="text-fg/90">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
