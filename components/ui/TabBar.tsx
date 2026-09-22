'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/state';
import { useTapScale, useTransition } from '@/lib/motion';
import { HomeIcon, SearchIcon, MapIcon, HeartIcon, PersonIcon } from './Icons';

const tabs = [
  { href: '/home', key: 'tab.home', Icon: HomeIcon },
  { href: '/search', key: 'tab.search', Icon: SearchIcon },
  { href: '/map', key: 'tab.map', Icon: MapIcon },
  { href: '/saved', key: 'tab.saved', Icon: HeartIcon },
  { href: '/profile', key: 'tab.profile', Icon: PersonIcon },
] as const;

/**
 * iOS 26 style floating tab bar: a Liquid Glass capsule inset from the edges,
 * hovering above the content layer.
 */
export function TabBar() {
  const { t } = useApp();
  const pathname = usePathname();
  const tap = useTapScale(0.94);
  const transition = useTransition('press');

  return (
    <nav
      aria-label={t('a11y.openMenu')}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center px-[21px] pb-[max(10px,env(safe-area-inset-bottom))]"
    >
      <div className="glass pointer-events-auto flex w-full items-stretch justify-between rounded-full px-1.5 py-1">
        {tabs.map(({ href, key, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <motion.div key={href} whileTap={tap} transition={transition} className="flex-1">
              <Link
                href={href}
                aria-label={t(key)}
                aria-current={active ? 'page' : undefined}
                className="flex min-h-[46px] flex-col items-center justify-center gap-0.5 rounded-full px-1"
                style={{ color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
              >
                {key === 'tab.saved' ? (
                  <HeartIcon size={23} filled={active} />
                ) : (
                  <Icon size={23} />
                )}
                <span className="t-caption2" style={{ fontWeight: active ? 600 : 400 }}>
                  {t(key)}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </nav>
  );
}
