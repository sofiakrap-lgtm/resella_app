'use client';

import { motion } from 'framer-motion';
import type { Market } from '@/lib/mockData';
import { useApp } from '@/lib/state';
import { useTapScale, useTransition } from '@/lib/motion';

interface MarketPinProps {
  market: Market;
  selected?: boolean;
  count?: number;
  /** Position in a planned route, -1 when the market is not part of one. */
  routeIndex?: number;
  onClick?: () => void;
}

/** ReSello branded map pin. Doubles as a cluster bubble when count is above 1. */
export function MarketPin({ market, selected = false, count = 1, routeIndex = -1, onClick }: MarketPinProps) {
  const { t } = useApp();
  const tap = useTapScale(0.9);
  const transition = useTransition('press');
  const isCluster = count > 1;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={tap}
      transition={transition}
      aria-label={`${market.name}, ${t('a11y.mapPin')}`}
      aria-pressed={selected}
      className="flex min-h-11 min-w-11 items-end justify-center"
    >
      <span className="relative flex flex-col items-center">
        <span
          className="flex h-9 min-w-9 items-center justify-center rounded-full border-2 px-2 t-caption1 font-semibold shadow-card"
          style={{
            background: selected ? 'var(--color-accent)' : 'var(--color-surface)',
            color: selected ? 'var(--color-on-accent)' : 'var(--color-accent)',
            borderColor: selected ? 'var(--color-accent)' : 'var(--color-surface)',
          }}
        >
          {isCluster ? count : routeIndex >= 0 ? routeIndex + 1 : <PinGlyph />}
        </span>
        <span
          className="h-2.5 w-2.5 -translate-y-1 rotate-45"
          style={{ background: selected ? 'var(--color-accent)' : 'var(--color-surface)' }}
        />
      </span>
    </motion.button>
  );
}

function PinGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 9.5 12 4l7 5.5V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V9.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
