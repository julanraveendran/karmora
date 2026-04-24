import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { CreateProjectForm } from '@/components/CreateProjectForm';
import { ensureProfile } from '@/lib/ensure-profile';

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');
  await ensureProfile(userId);

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <header className="mb-8">
        <a href="/dashboard" className="text-sm text-muted hover:text-fg">
          ← Dashboard
        </a>
        <h1 className="text-2xl font-bold mt-4">New project</h1>
        <p className="text-muted mt-1 text-sm">
          The scanner runs hourly. First leads typically appear within an hour
          of creating a project.
        </p>
      </header>

      <CreateProjectForm />
    </main>
  );
}
