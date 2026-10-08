'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTapScale, useTransition } from '@/lib/motion';
import { useSheetOpen } from '@/lib/sheets';
import { HomeIcon, SearchIcon, HeartIcon, PersonIcon } from './Icons';

const tabs = [
  { href: '/koti', label: 'Koti', Icon: HomeIcon },
  { href: '/selaa', label: 'Selaa', Icon: SearchIcon },
  { href: '/toivelista', label: 'Toivelista', Icon: HeartIcon },
  { href: '/oma', label: 'Oma', Icon: PersonIcon },
] as const;

/**
 * iOS 26 style tab bar: a glass capsule floating 21px clear of the edges.
 *
 * It does not minimize on scroll. Minimizing is opt in on iOS, and with four
 * tabs and no search field it only costs a tap to get back, while a tab bar's
 * whole value is that it is always there.
 */
export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const sheetOpen = useSheetOpen();
  const tap = useTapScale(0.96);
  const transition = useTransition('press');
  const marker = useTransition('press');

  if (sheetOpen) return null;

  return (
    <nav
      aria-label="Päävalikko"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center px-[21px] pb-[max(21px,env(safe-area-inset-bottom))]"
    >
      <div className="glass pointer-events-auto flex w-full items-stretch justify-between rounded-full p-1">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <motion.div key={href} whileTap={tap} transition={transition} className="min-w-0 flex-1">
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                onClick={(event) => {
                  // Tapping the tab you are already on returns to its root.
                  if (!active) return;
                  event.preventDefault();
                  document.getElementById('app-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
                  if (pathname !== href) router.push(href);
                }}
                className="relative flex min-h-[54px] flex-col items-center justify-center gap-[2px] rounded-full px-1"
                style={{
                  color: active ? 'var(--color-terracotta-ink)' : 'var(--color-brown)',
                }}
              >
                {/* The selected marker wraps the whole item, icon and label together. */}
                {active ? (
                  <motion.span
                    layoutId="tab-selected"
                    transition={marker}
                    className="absolute inset-0 rounded-full bg-[rgba(60,36,21,0.07)]"
                  />
                ) : null}
                <span className="relative">
                  <Icon size={26} filled={active} />
                </span>
                <span
                  className="t-tab relative max-w-full truncate"
                  style={{ fontWeight: active ? 600 : 500 }}
                >
                  {label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </nav>
  );
}
