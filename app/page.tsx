import { createServer } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { SignInForm } from '@/components/SignInForm';

export default async function Home({
  searchParams,
}: {
  searchParams: { auth_error?: string; auth_error_desc?: string };
}) {
  const supabase = createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect('/dashboard');

  const authError = searchParams.auth_error;
  const authErrorDesc = searchParams.auth_error_desc;

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold mb-2">Karmora</h1>
        <p className="text-muted mb-8">
          Reddit customer discovery for founders. High-intent leads, AI-scored,
          human-approved.
        </p>
        {authError && (
          <div className="mb-4 border border-red-900 bg-red-950/30 rounded p-3 text-sm">
            <div className="font-medium text-red-400">
              Sign-in failed: {authError}
            </div>
            {authErrorDesc && (
              <div className="text-red-300/80 mt-1">{authErrorDesc}</div>
            )}
            <div className="text-muted mt-2 text-xs">
              Click the link in the same browser you submitted from, within 5
              minutes. Request a fresh link below.
            </div>
          </div>
        )}
        <SignInForm />
        <p className="text-xs text-muted mt-6">
          We email you a one-time link. No password.
        </p>
      </div>
    </main>
  );
}
