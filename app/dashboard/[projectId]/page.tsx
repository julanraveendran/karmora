import { createServer } from '@/lib/supabase-server';
import { redirect, notFound } from 'next/navigation';
import { LeadCard } from '@/components/LeadCard';
import type { LeadStatus, SafetyMode } from '@/lib/types';

type SearchParams = { status?: string };

const VALID_STATUSES: LeadStatus[] = ['new', 'reviewed', 'engaged', 'dismissed'];

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: { projectId: string };
  searchParams: SearchParams;
}) {
  const supabase = createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.projectId)
    .maybeSingle();

  if (!project) notFound();

  const filter: LeadStatus = VALID_STATUSES.includes(
    searchParams.status as LeadStatus
  )
    ? (searchParams.status as LeadStatus)
    : 'new';

  const { data: leads } = await supabase
    .from('leads')
    .select(
      `id, pattern_score, llm_score, combined_score, matched_patterns,
       llm_reasoning, pain_point, status,
       raw_post:raw_posts!inner ( title, body, subreddit, author, url, posted_at, num_comments ),
       openers ( mode, content, created_at )`
    )
    .eq('project_id', params.projectId)
    .eq('status', filter)
    .order('combined_score', { ascending: false })
    .limit(100);

  const counts = await loadStatusCounts(supabase, params.projectId);

  type LeadRow = {
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
    openers: { mode: SafetyMode; content: string; created_at: string }[];
  };

  const rows: LeadRow[] = ((leads ?? []) as unknown as LeadRow[]).map((l) => ({
    ...l,
    openers: l.openers ?? [],
  }));

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <a href="/dashboard" className="text-sm text-muted hover:text-fg">
          ← All projects
        </a>
        <div className="flex items-center justify-between mt-3">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-xs text-muted mt-1">
              {project.target_subreddits.length} subreddits ·{' '}
              {project.last_scanned_at
                ? `last scan ${new Date(
                    project.last_scanned_at
                  ).toLocaleString()}`
                : 'never scanned (next scan within an hour)'}
            </p>
          </div>
        </div>
      </header>

      <nav className="flex gap-2 mb-6 border-b border-neutral-800">
        {VALID_STATUSES.map((s) => {
          const active = filter === s;
          return (
            <a
              key={s}
              href={`/dashboard/${project.id}?status=${s}`}
              className={`px-3 py-2 text-sm border-b-2 -mb-px ${
                active
                  ? 'border-accent text-fg'
                  : 'border-transparent text-muted hover:text-fg'
              }`}
            >
              {labelFor(s)}{' '}
              <span className="text-xs text-muted">({counts[s] ?? 0})</span>
            </a>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <div className="border border-neutral-800 rounded-lg p-8 text-center">
          <p className="text-muted">
            {filter === 'new'
              ? 'No new leads yet. The scanner runs hourly — first leads usually arrive within an hour of project creation.'
              : `No ${filter} leads.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((lead) => {
            const safeOpener = lead.openers.find((o) => o.mode === 'safe');
            return (
              <LeadCard
                key={lead.id}
                lead={{
                  ...lead,
                  cached_opener: safeOpener
                    ? { mode: safeOpener.mode, content: safeOpener.content }
                    : null,
                }}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}

function labelFor(s: LeadStatus): string {
  return { new: 'New', reviewed: 'Reviewed', engaged: 'Engaged', dismissed: 'Dismissed' }[s];
}

async function loadStatusCounts(
  supabase: ReturnType<typeof createServer>,
  projectId: string
): Promise<Record<LeadStatus, number>> {
  const counts: Record<LeadStatus, number> = {
    new: 0,
    reviewed: 0,
    engaged: 0,
    dismissed: 0,
  };
  for (const s of VALID_STATUSES) {
    const { count } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('status', s);
    counts[s] = count ?? 0;
  }
  return counts;
}
