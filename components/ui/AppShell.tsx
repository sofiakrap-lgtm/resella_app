'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { KonstaProvider } from 'konsta/react';
import { StatusBarMock } from './StatusBar';
import { TabBar } from './TabBar';
import { ToastHost } from './Toasts';

/**
 * Device frame: a realistic iPhone on desktop, full screen on a phone.
 * The scroll container is shared by every screen so the navigation bars can
 * pick up the scroll edge blur.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const chromeless = pathname === '/' || pathname.startsWith('/onboarding');
  /** The map fills the frame and lets the tab bar float above it. */
  const fullBleed = pathname.startsWith('/map');

  return (
    <KonstaProvider theme="ios" dark>
    <div className="md:flex md:min-h-screen md:items-center md:justify-center md:bg-[radial-gradient(120%_120%_at_50%_0%,#f3e4c8_0%,#e2d0b2_55%,#cfbb9b_100%)] md:py-10 dark:md:bg-[radial-gradient(120%_120%_at_50%_0%,#2c1e12_0%,#1c1209_60%,#0d0805_100%)]">
      <div className="md:flex md:flex-col md:items-center">
        <div
          className="relative h-[100dvh] w-full overflow-hidden bg-bg md:h-[874px] md:w-[402px] md:rounded-[54px] md:border-[12px] md:border-[#0b0b0d] md:shadow-[0_40px_90px_rgba(0,0,0,0.35)]"
        >
          <div className="flex h-full flex-col pt-[env(safe-area-inset-top)] md:pt-0">
            <StatusBarMock />
            <main
              id="app-scroll"
              className="hide-scrollbar flex flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain"
            >
              <div className={`flex flex-1 flex-col ${chromeless || fullBleed ? '' : 'pb-[104px]'}`}>
                {children}
              </div>
            </main>
          </div>
          {chromeless ? null : <TabBar />}
          <ToastHost />
        </div>
        <p className="t-caption1 mt-4 hidden text-center text-ink-secondary md:block">ReSello, demo</p>
      </div>
    </div>
    </KonstaProvider>
  );
}
