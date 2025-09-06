import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/lib/auth-context';
import { ClubsProvider } from '@/lib/clubs-context';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load heavy header interactions
const Header = dynamic(() => import('@/components/layout/header').then(m => ({ default: m.Header })), {
  ssr: true,
  loading: () => <div className="h-16 w-full" aria-hidden />,
});

export const metadata: Metadata = {
  title: 'NexusConnect',
  description: 'An elegant, high-impact, and fully responsive website for a University Student Association.',
  metadataBase: new URL('https://example.com'),
  openGraph: { title: 'NexusConnect', description: 'Student Association Platform', url: 'https://example.com', siteName: 'NexusConnect', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'NexusConnect', description: 'Student Association Platform' },
  icons: { shortcut: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" />
      </head>
      <body className={cn('font-body antialiased')}>
        <AuthProvider>
          <ClubsProvider>
            <Suspense fallback={<div className="h-16" />}> 
              <header>
                <Header />
              </header>
            </Suspense>
            {children}
          </ClubsProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
