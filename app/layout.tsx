import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/state';
import { AppShell } from '@/components/ui/AppShell';

/** Set when the demo is served from a subfolder, for example GitHub Pages. */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const metadata: Metadata = {
  title: 'ReSello',
  description:
    'ReSello, löydä aarteesi läheltä. Selaa kirpputorien tuotteita ja näe heti, missä kaapissa ne odottavat.',
  manifest: `${BASE_PATH}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    title: 'ReSello',
    statusBarStyle: 'default',
  },
  icons: {
    icon: `${BASE_PATH}/icon.svg`,
    apple: `${BASE_PATH}/icon.svg`,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#fffbf4',
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
