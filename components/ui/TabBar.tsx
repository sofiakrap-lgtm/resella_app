'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTapScale, useTransition } from '@/lib/motion';
import { HomeIcon, SearchIcon, HeartIcon, PersonIcon } from './Icons';

const tabs = [
  { href: '/koti', label: 'Koti', Icon: HomeIcon },
  { href: '/selaa', label: 'Selaa', Icon: SearchIcon },
  { href: '/toivelista', label: 'Toivelista', Icon: HeartIcon },
  { href: '/oma', label: 'Oma', Icon: PersonIcon },
] as const;

/**
 * iOS 26 style tab bar: a Liquid Glass capsule floating above the content that
 * minimizes when the content scrolls down and returns on the way up.
 */
export function TabBar() {
  const pathname = usePathname();
  const tap = useTapScale(0.94);
  const transition = useTransition('press');
  const sheetTransition = useTransition('sheet');
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    const container = document.getElementById('app-scroll');
    if (!container) return;
    let previous = container.scrollTop;
    const onScroll = () => {
      const current = container.scrollTop;
      if (current < 80) setMinimized(false);
      else if (current > previous + 6) setMinimized(true);
      else if (current < previous - 6) setMinimized(false);
      previous = current;
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      aria-label="Päävalikko"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center px-[21px] pb-[max(10px,env(safe-area-inset-bottom))]"
    >
      <motion.div
        animate={{ scale: minimized ? 0.92 : 1, y: minimized ? 6 : 0 }}
        transition={sheetTransition}
        className="glass pointer-events-auto flex w-full items-stretch justify-between rounded-full px-1.5 py-1"
      >
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <motion.div key={href} whileTap={tap} transition={transition} className="min-w-0 flex-1">
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className="flex min-h-[46px] flex-col items-center justify-center gap-0.5 rounded-full px-1"
                style={{ color: active ? 'var(--color-terracotta-ink)' : 'var(--color-brown-70)' }}
              >
                {href === '/toivelista' ? (
                  <HeartIcon size={23} filled={active} />
                ) : (
                  <Icon size={23} />
                )}
                <motion.span
                  className="t-caption max-w-full truncate"
                  animate={{ opacity: minimized ? 0 : 1, height: minimized ? 0 : 'auto' }}
                  transition={sheetTransition}
                  style={{ fontWeight: active ? 600 : 400 }}
                >
                  {label}
                </motion.span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </nav>
  );
}
