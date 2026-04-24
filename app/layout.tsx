import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
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
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#e8602c',
          colorBackground: '#0a0a0a',
          colorText: '#ffffff',
          colorInputBackground: 'rgba(255,255,255,0.04)',
          colorInputText: '#ffffff',
          borderRadius: '0.75rem',
        },
      }}
    >
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
    </ClerkProvider>
  );
}
