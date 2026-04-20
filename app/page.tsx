import { createServer } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import LandingPage from '@/components/LandingPage';

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

  // NOTE: auth errors (expired magic links etc.) are currently silent on the
  // landing — they were previously surfaced on the bare sign-in page. If we
  // start seeing user reports, surface searchParams.auth_error in the landing's
  // Hero component (pass it in as a prop).
  void searchParams;

  return <LandingPage />;
}
