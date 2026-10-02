import type { Metadata, Viewport } from 'next';
import { Inter_Tight, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/state';
import { AppShell } from '@/components/ui/AppShell';

/**
 * Self hosted at build time, so the demo needs no font CDN at runtime and
 * nothing reflows while a web font arrives. Inter Tight carries the titles,
 * Plus Jakarta Sans everything that is read as text.
 */
const display = Inter_Tight({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700'],
  variable: '--font-display-face',
  display: 'swap',
});

const sans = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans-face',
  display: 'swap',
});

/** Set when the demo is served from a subfolder, for example GitHub Pages. */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const metadata: Metadata = {
  title: 'ReSella',
  description:
    'ReSella, löydä aarteesi läheltä. Selaa kirpputorien tuotteita ja näe heti, missä kaapissa ne odottavat.',
  manifest: `${BASE_PATH}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    title: 'ReSella',
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
  themeColor: '#fffdfa',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <body>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
