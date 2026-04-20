import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Karmora — High-intent conversations, on tap',
  description:
    'Karmora learns your product, maps your ICP, watches the right subreddits hourly, and hands you high-intent conversations to reply to with value.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black">{children}</body>
    </html>
  );
}
