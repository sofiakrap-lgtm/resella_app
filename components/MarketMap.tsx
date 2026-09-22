'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { Market } from '@/lib/types';
import { useTapScale, useTransition } from '@/lib/motion';

/**
 * Offline map. A stylised drawing with a simple linear projection, so the demo
 * works without tiles or API keys.
 */
export function MarketMap({
  markets,
  selectedId,
  onSelect,
  className = '',
  sheetInset = 0,
}: {
  markets: Market[];
  selectedId?: string | null;
  onSelect?: (marketId: string) => void;
  className?: string;
  sheetInset?: number;
}) {
  const transition = useTransition();

  const points = useMemo(() => {
    const lats = markets.map((market) => market.lat);
    const lngs = markets.map((market) => market.lng);
    const north = Math.max(...lats, 60.2);
    const south = Math.min(...lats, 60.1);
    const east = Math.max(...lngs, 25);
    const west = Math.min(...lngs, 24.8);
    const padLat = Math.max((north - south) * 0.35, 0.01);
    const padLng = Math.max((east - west) * 0.35, 0.02);
    const bounds = {
      north: north + padLat,
      south: south - padLat,
      east: east + padLng,
      west: west - padLng,
    };
    const bottom = 1 - Math.min(0.55, sheetInset);
    return markets.map((market) => ({
      market,
      x: Math.min(0.92, Math.max(0.08, (market.lng - bounds.west) / (bounds.east - bounds.west))),
      y:
        0.08 +
        Math.min(0.92, Math.max(0.08, (bounds.north - market.lat) / (bounds.north - bounds.south))) *
          (bottom - 0.14),
    }));
  }, [markets, sheetInset]);

  const selected = points.find((point) => point.market.id === selectedId);
  const clamp = (value: number) => Math.max(-26, Math.min(26, value));
  const pan = selected
    ? {
        x: clamp((0.5 - selected.x) * 100),
        y: clamp(((1 - Math.min(0.55, sheetInset)) / 2 - selected.y) * 100),
      }
    : { x: 0, y: 0 };

  return (
    <div className={`relative overflow-hidden bg-cream-sink ${className}`}>
      <motion.div
        className="absolute inset-0"
        animate={{ x: `${pan.x}%`, y: `${pan.y}%` }}
        transition={transition}
      >
        <svg
          className="absolute inset-[-40%] h-[180%] w-[180%]"
          viewBox="0 0 400 700"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <rect width="400" height="700" fill="var(--color-cream-sink)" />
          <path
            d="M-20 520 C 90 470, 150 560, 260 500 S 420 470, 440 520 L440 760 L-20 760 Z"
            fill="var(--color-cream-panel)"
          />
          <circle cx="90" cy="180" r="58" fill="var(--color-cream-panel)" />
          <circle cx="320" cy="300" r="42" fill="var(--color-cream-panel)" />
          <g stroke="var(--color-cream)" strokeWidth="9" strokeLinecap="round">
            <path d="M-10 120 H 410" />
            <path d="M-10 330 H 410" />
            <path d="M-10 590 H 410" />
            <path d="M70 -10 V 710" />
            <path d="M250 -10 V 710" />
          </g>
          <g stroke="var(--color-cream)" strokeWidth="4" strokeLinecap="round" opacity="0.85">
            <path d="M-10 230 H 410" />
            <path d="M-10 440 H 410" />
            <path d="M160 -10 V 710" />
            <path d="M340 -10 V 710" />
          </g>
        </svg>

        {points.map((point, index) => (
          <motion.div
            key={point.market.id}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...transition, delay: Math.min(index * 0.03, 0.3) }}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
          >
            <MarketPin
              market={point.market}
              selected={selectedId === point.market.id}
              onClick={() => onSelect?.(point.market.id)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function MarketPin({
  market,
  selected,
  onClick,
}: {
  market: Market;
  selected: boolean;
  onClick: () => void;
}) {
  const tap = useTapScale(0.9);
  const transition = useTransition('press');
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={tap}
      transition={transition}
      aria-label={`${market.name}, sijainti kartalla`}
      aria-pressed={selected}
      className="flex min-h-11 min-w-11 items-end justify-center"
    >
      <span className="relative flex flex-col items-center">
        <span
          className="flex h-9 min-w-9 items-center justify-center rounded-full border-2 px-2 t-caption font-semibold shadow-card"
          style={{
            background: selected ? 'var(--color-terracotta-ink)' : 'var(--color-cream)',
            color: selected ? 'var(--color-on-terracotta)' : 'var(--color-terracotta-ink)',
            borderColor: selected ? 'var(--color-terracotta-ink)' : 'var(--color-cream)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 9.5 12 4l7 5.5V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V9.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </span>
        <span
          className="h-2.5 w-2.5 -translate-y-1 rotate-45"
          style={{ background: selected ? 'var(--color-terracotta-ink)' : 'var(--color-cream)' }}
        />
      </span>
    </motion.button>
  );
}
