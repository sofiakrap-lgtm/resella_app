'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Market } from '@/lib/types';
import { marketImage } from '@/lib/imagePath';
import { distance, haversineKm, CITY_CENTERS } from '@/lib/format';
import { newTodayCount } from '@/data/products';
import { openStatusLabel } from '@/lib/time';
import { useApp, useNow } from '@/lib/state';
import { useStagger, useTapScale } from '@/lib/motion';
import { SafeImage } from './ui/SafeImage';
import { Tag } from './ui/Chip';
import { ChevronRight, ClockIcon } from './ui/Icons';

/** Open or closed, resolved after mount so the markup never mismatches. */
export function OpenStatus({ market, className = '' }: { market: Market; className?: string }) {
  const now = useNow();
  if (!now) return null;
  const status = openStatusLabel(market, now);
  return (
    <span
      className={`inline-flex items-center gap-1 t-footnote ${className}`}
      style={{ color: status.open ? 'var(--color-positive)' : 'var(--color-brown-70)' }}
    >
      <ClockIcon size={14} />
      {status.label}
    </span>
  );
}

export function MarketCard({
  market,
  index = 0,
  layout = 'row',
}: {
  market: Market;
  index?: number;
  layout?: 'row' | 'card';
}) {
  const { city } = useApp();
  const transition = useStagger(index);
  const tap = useTapScale(0.985);
  const origin = CITY_CENTERS[city] ?? CITY_CENTERS.Helsinki;
  const km = haversineKm(origin, market);
  const fresh = newTodayCount(market.id);

  const photo = (
    <SafeImage
      src={marketImage(market.coverImage)}
      alt={`${market.name}, kuva kirpputorilta`}
      label={market.name}
      fallbackType="kirpputori"
      compact={layout === 'row'}
      className="h-full w-full object-cover"
    />
  );

  if (layout === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        whileTap={tap}
        className="w-[228px] shrink-0"
      >
        <Link href={`/kirpputori/${market.id}`} className="block">
          <span className="block h-[124px] w-full overflow-hidden rounded-[16px] bg-cream-sink shadow-card">
            {photo}
          </span>
          <span className="mt-2 block">
            <span className="t-subhead block truncate font-semibold">{market.name}</span>
            <span className="t-caption block truncate text-brown-70">
              {market.city}, {distance(km)}
            </span>
            <OpenStatus market={market} className="mt-0.5" />
          </span>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={transition} whileTap={tap}>
      <Link
        href={`/kirpputori/${market.id}`}
        className="flex items-center gap-3 border-b border-separator px-4 py-3"
      >
        <span className="block h-[68px] w-[68px] shrink-0 overflow-hidden rounded-[14px] bg-cream-sink">
          {photo}
        </span>
        <span className="min-w-0 flex-1">
          <span className="t-headline block truncate">{market.name}</span>
          <span className="t-footnote block truncate text-brown-70">
            {market.address}, {market.city}, {distance(km)}
          </span>
          <OpenStatus market={market} className="mt-0.5" />
          {fresh > 0 ? (
            <span className="mt-1 inline-flex">
              <Tag tone="accent">{`${fresh} uutta tänään`}</Tag>
            </span>
          ) : null}
        </span>
        <ChevronRight size={18} className="shrink-0 text-brown-50" />
      </Link>
    </motion.div>
  );
}
