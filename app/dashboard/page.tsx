import { createServer } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/SignOutButton';

export default async function DashboardPage() {
  const supabase = createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/');

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, last_scanned_at, status, target_subreddits')
    .order('created_at', { ascending: false });

  const projectIds = (projects ?? []).map((p) => p.id);
  const counts = await loadNewLeadCounts(supabase, projectIds);

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Karmora</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted">{user.email}</span>
          <SignOutButton />
        </div>
      </header>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your projects</h2>
          {(projects?.length ?? 0) > 0 && (
            <a
              href="/onboarding"
              className="text-sm bg-accent text-black rounded px-3 py-1.5 font-medium"
            >
              + New project
            </a>
          )}
        </div>

        {projects?.length === 0 ? (
          <div className="border border-neutral-800 rounded-lg p-8 text-center">
            <p className="text-muted mb-4">No projects yet.</p>
            <a
              href="/onboarding"
              className="inline-block px-4 py-2 bg-accent text-black rounded font-medium"
            >
              Create your first project
            </a>
          </div>
        ) : (
          <ul className="space-y-2">
            {projects?.map((p) => (
              <li key={p.id}>
                <a
                  href={`/dashboard/${p.id}`}
                  className="block border border-neutral-800 rounded-lg p-4 hover:border-accent"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="text-xs text-muted mt-1">
                        {p.target_subreddits.length} subs ·{' '}
                        {p.last_scanned_at
                          ? `scanned ${new Date(p.last_scanned_at).toLocaleString()}`
                          : 'never scanned'}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-mono">
                        {counts[p.id] ?? 0}
                      </div>
                      <div className="text-xs text-muted">new leads</div>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

async function loadNewLeadCounts(
  supabase: ReturnType<typeof createServer>,
  projectIds: string[]
): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  for (const id of projectIds) {
    const { count } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', id)
      .eq('status', 'new');
    result[id] = count ?? 0;
  }
  return result;
}
