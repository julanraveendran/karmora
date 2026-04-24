'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  projectId: string;
  projectName: string;
  plan: 'free' | 'pro';
};

export function DeleteProjectButton({ projectId, projectName, plan }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isPro = plan === 'pro';

  async function handleDelete() {
    if (!isPro) return;
    const ok = window.confirm(
      `Delete "${projectName}"? This removes the project and all its leads. Cannot be undone.`
    );
    if (!ok) return;

    setError(null);
    const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: 'failed' }));
      setError(msg || 'Delete failed');
      return;
    }
    startTransition(() => {
      router.push('/dashboard');
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={!isPro || isPending}
        title={isPro ? 'Remove this project' : 'Upgrade to Pro to remove projects'}
        className="text-sm px-3 py-1.5 rounded border border-neutral-800 hover:border-red-500 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? 'Removing…' : 'Remove project'}
      </button>
      {!isPro && (
        <span className="text-xs text-muted">Pro only</span>
      )}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
