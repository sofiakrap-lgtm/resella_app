'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Market } from '@/lib/types';
import { marketImage } from '@/lib/imagePath';
import { openStatusLabel } from '@/lib/time';
import { useApp, useNow } from '@/lib/state';
import { useStagger, useTapScale } from '@/lib/motion';
import { SafeImage } from './ui/SafeImage';
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
  const transition = useStagger(index);
  const tap = useTapScale(0.985);

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
          <span className="t-subhead mt-2 block truncate font-semibold">{market.name}</span>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={transition} whileTap={tap}>
      <Link
        href={`/kirpputori/${market.id}`}
        className="flex items-center gap-3 border-b border-separator px-4 py-3 last:border-b-0"
      >
        <span className="block h-[68px] w-[68px] shrink-0 overflow-hidden rounded-[14px] bg-cream-sink">
          {photo}
        </span>
        <span className="t-headline min-w-0 flex-1 truncate">{market.name}</span>
        <ChevronRight size={18} className="shrink-0 text-brown-50" />
      </Link>
    </motion.div>
  );
}
