import { createServer } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/');

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, last_scanned_at, status')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Karmora</h1>
        <span className="text-sm text-muted">{user.email}</span>
      </header>

      <section>
        <h2 className="text-lg font-semibold mb-4">Your projects</h2>
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
              <li
                key={p.id}
                className="border border-neutral-800 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-sm text-muted">
                    {p.last_scanned_at
                      ? `scanned ${new Date(p.last_scanned_at).toLocaleString()}`
                      : 'never scanned'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
