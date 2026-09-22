'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { Market } from '@/lib/mockData';
import { boundsFor, project, type LatLng } from '@/lib/geo';
import { useTransition } from '@/lib/motion';
import { MarketPin } from './MarketPin';

interface MapViewProps {
  markets: Market[];
  selectedId?: string | null;
  onSelect?: (marketId: string) => void;
  /** Named starting point, for example the user or a hotel. */
  origin?: (LatLng & { label?: string }) | null;
  /** Ordered market ids drawn as a route line. */
  route?: string[];
  className?: string;
  /** Groups nearby pins into a count bubble, used on the zoomed out map. */
  cluster?: boolean;
}

/**
 * Mock map. Deliberately offline: a stylised drawing with pins positioned by a
 * simple linear projection, so the demo works without tiles or API keys.
 */
export function MapView({
  markets,
  selectedId,
  onSelect,
  origin,
  route,
  className = '',
  cluster = false,
}: MapViewProps) {
  const transition = useTransition();

  const points = useMemo(() => {
    const all: LatLng[] = origin ? [...markets, origin] : markets;
    const bounds = boundsFor(all.length ? all : [{ lat: 60.17, lng: 24.94 }]);
    return {
      bounds,
      markets: markets.map((market) => ({ market, position: project(market, bounds) })),
      origin: origin ? project(origin, bounds) : null,
    };
  }, [markets, origin]);

  const clustered = useMemo(() => {
    if (!cluster) return points.markets.map((entry) => ({ ...entry, count: 1, members: [entry.market] }));
    const cells = new Map<string, { market: Market; position: { x: number; y: number }; members: Market[] }>();
    for (const entry of points.markets) {
      const key = `${Math.round(entry.position.x * 7)}-${Math.round(entry.position.y * 7)}`;
      const existing = cells.get(key);
      if (existing) {
        existing.members.push(entry.market);
      } else {
        cells.set(key, { ...entry, members: [entry.market] });
      }
    }
    return Array.from(cells.values()).map((entry) => ({ ...entry, count: entry.members.length }));
  }, [points.markets, cluster]);

  const routePoints = (route ?? [])
    .map((id) => points.markets.find((entry) => entry.market.id === id))
    .filter(Boolean) as Array<{ market: Market; position: { x: number; y: number } }>;

  return (
    <div className={`relative overflow-hidden bg-surface-2 ${className}`}>
      <MapCanvas />

      {/* route line */}
      {routePoints.length > 1 ? (
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          <polyline
            points={[
              ...(points.origin ? [`${points.origin.x * 100}%,${points.origin.y * 100}%`] : []),
              ...routePoints.map((entry) => `${entry.position.x * 100}%,${entry.position.y * 100}%`),
            ].join(' ')}
            fill="none"
            stroke="var(--color-accent-2)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="1 7"
          />
        </svg>
      ) : null}

      {points.origin ? (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${points.origin.x * 100}%`, top: `${points.origin.y * 100}%` }}
        >
          <span className="relative flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-2 opacity-40" />
            <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-accent-2 shadow" />
          </span>
          {origin?.label ? (
            <span className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded-full bg-surface px-2 py-0.5 t-caption2 shadow-card">
              {origin.label}
            </span>
          ) : null}
        </div>
      ) : null}

      {clustered.map((entry, index) => (
        <motion.div
          key={entry.market.id}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...transition, delay: Math.min(index * 0.03, 0.3) }}
          className="absolute -translate-x-1/2 -translate-y-full"
          style={{ left: `${entry.position.x * 100}%`, top: `${entry.position.y * 100}%` }}
        >
          <MarketPin
            market={entry.market}
            count={entry.count}
            selected={selectedId === entry.market.id}
            routeIndex={route ? route.indexOf(entry.market.id) : -1}
            onClick={() => onSelect?.(entry.market.id)}
          />
        </motion.div>
      ))}
    </div>
  );
}

/** Stylised, deterministic map drawing. */
function MapCanvas() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 700" preserveAspectRatio="none" aria-hidden="true">
      <rect width="400" height="700" fill="var(--color-surface-2)" />
      <path d="M-20 520 C 90 470, 150 560, 260 500 S 420 470, 440 520 L440 760 L-20 760 Z" fill="var(--color-accent-soft)" opacity="0.55" />
      <circle cx="90" cy="180" r="58" fill="var(--color-accent-soft)" opacity="0.7" />
      <circle cx="320" cy="300" r="42" fill="var(--color-accent-soft)" opacity="0.6" />
      <g stroke="var(--color-surface)" strokeWidth="9" strokeLinecap="round" opacity="0.95">
        <path d="M-10 120 H 410" />
        <path d="M-10 330 H 410" />
        <path d="M-10 590 H 410" />
        <path d="M70 -10 V 710" />
        <path d="M250 -10 V 710" />
      </g>
      <g stroke="var(--color-surface)" strokeWidth="4" strokeLinecap="round" opacity="0.8">
        <path d="M-10 230 H 410" />
        <path d="M-10 440 H 410" />
        <path d="M160 -10 V 710" />
        <path d="M340 -10 V 710" />
        <path d="M-10 40 L 410 190" />
        <path d="M-10 660 L 410 500" />
      </g>
    </svg>
  );
}
