import { createServer } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { VIRAL_TEMPLATES } from '@/lib/viral-templates';
import { ViralTemplatesClient } from '@/components/ViralTemplatesClient';

export default async function TemplatesPage() {
  const supabase = createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <nav className="mb-6">
        <a href="/dashboard" className="text-sm text-muted hover:text-fg">
          ← Dashboard
        </a>
      </nav>

      <ViralTemplatesClient templates={VIRAL_TEMPLATES} />
    </main>
  );
}
