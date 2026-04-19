import { createServer } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { SignInForm } from '@/components/SignInForm';

export default async function Home() {
  const supabase = createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect('/dashboard');

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold mb-2">Karmora</h1>
        <p className="text-muted mb-8">
          Reddit customer discovery for founders. High-intent leads, AI-scored,
          human-approved.
        </p>
        <SignInForm />
        <p className="text-xs text-muted mt-6">
          We email you a one-time link. No password.
        </p>
      </div>
    </main>
  );
}
