import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/state';
import { AppShell } from '@/components/ui/AppShell';

export const metadata: Metadata = {
  title: 'ReSello',
  description:
    'ReSello, löydä aarteesi läheltä. Hae tuotteita kaikilta kirpputoreilta ja näe, missä pöydässä ne ovat.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'ReSello',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf7f2' },
    { media: '(prefers-color-scheme: dark)', color: '#14120f' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi" suppressHydrationWarning>
      <body>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
