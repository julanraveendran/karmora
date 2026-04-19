import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Karmora — Reddit customer discovery copilot',
  description:
    'Find high-intent leads on Reddit. AI-scored, human-approved. Built for founders.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
