import { auth } from '@clerk/nextjs/server';
import { createServer, createServiceRole } from '@/lib/supabase-server';
import { redirect, notFound } from 'next/navigation';
import { LeadCard } from '@/components/LeadCard';
import { DeleteProjectButton } from '@/components/DeleteProjectButton';
import { PlanButtons } from '@/components/PlanButtons';
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
  const { userId } = await auth();
  if (!userId) redirect('/');
  const supabase = createServer();

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.projectId)
    .maybeSingle();

  if (!project) notFound();

  const admin = createServiceRole();
  const { data: profile } = await admin
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .maybeSingle();
  const plan: 'free' | 'pro' = profile?.plan === 'pro' ? 'pro' : 'free';

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
        <div className="flex items-start justify-between mt-3 gap-4 flex-wrap">
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
          <div className="flex items-center gap-3">
            <PlanButtons plan={plan} />
            <DeleteProjectButton
              projectId={project.id}
              projectName={project.name}
              plan={plan}
            />
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="md:col-span-2 border border-neutral-800 rounded-lg p-4">
          <div className="text-xs uppercase tracking-wide text-muted mb-2">
            What Karmora is watching
          </div>
          {project.description && (
            <p className="text-sm text-fg/80 mb-3 whitespace-pre-wrap">
              {project.description}
            </p>
          )}
          {project.icp && (
            <p className="text-xs text-muted mb-3">
              <span className="text-fg/60">ICP:</span> {project.icp}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {project.target_subreddits.map((s: string) => (
              <span
                key={s}
                className="text-xs border border-neutral-800 rounded-full px-2 py-0.5 text-muted"
              >
                r/{s.replace(/^r\//, '')}
              </span>
            ))}
          </div>
        </div>
        <div className="border border-neutral-800 rounded-lg p-4">
          <div className="text-xs uppercase tracking-wide text-muted mb-2">
            Scanner status
          </div>
          <div className="flex items-center gap-2 text-sm font-medium mb-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                project.last_scanned_at
                  ? 'bg-green-500'
                  : (counts.new ?? 0) > 0
                  ? 'bg-amber-500'
                  : 'bg-amber-500'
              }`}
            />
            {project.last_scanned_at
              ? 'Active'
              : (counts.new ?? 0) > 0
              ? 'Initial matches ready · fresh scan pending'
              : 'Queued for first scan'}
          </div>
          <p className="text-xs text-muted">
            {project.last_scanned_at
              ? 'Karmora scans your subreddits every hour. New leads appear here automatically.'
              : (counts.new ?? 0) > 0
              ? 'These are pattern matches from the last 48 hours. A deeper, LLM-scored scan runs within the hour and will add higher-quality leads.'
              : 'Karmora scans your subreddits every hour. First leads usually arrive within 60 minutes of project creation.'}
          </p>
        </div>
      </section>

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
