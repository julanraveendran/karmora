'use client';

import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';

const AUTO_REFRESH_MS = 30_000;

export function RefreshLeadsButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRefresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') {
        startTransition(() => router.refresh());
      }
    };
    const id = setInterval(tick, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [router]);

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={isPending}
      className="text-sm px-3 py-1.5 rounded border border-neutral-800 hover:border-accent disabled:opacity-40 flex items-center gap-2"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isPending ? 'animate-spin' : ''}
      >
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
        <path d="M3 21v-5h5" />
      </svg>
      {isPending ? 'Refreshing…' : 'Refresh leads'}
    </button>
  );
}
