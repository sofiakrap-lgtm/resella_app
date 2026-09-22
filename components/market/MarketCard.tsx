'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Market } from '@/lib/mockData';
import { distanceKm, formatDistance, type LatLng } from '@/lib/geo';
import { marketPhotoUrl } from '@/lib/assets';
import { useApp } from '@/lib/state';
import { originFor } from '@/lib/search';
import { useStagger, useTapScale } from '@/lib/motion';
import { SafeImage } from '@/components/ui/SafeImage';
import { OpenStatus } from './OpeningHours';
import { ChevronRight } from '@/components/ui/Icons';

interface MarketCardProps {
  market: Market;
  index?: number;
  layout?: 'card' | 'row';
  origin?: LatLng;
  note?: string;
  /**
   * Map list behaviour: the row body selects the market and centres its pin,
   * and the chevron opens the market profile.
   */
  onSelect?: () => void;
  selected?: boolean;
}

export function MarketCard({
  market,
  index = 0,
  layout = 'card',
  origin,
  note,
  onSelect,
  selected = false,
}: MarketCardProps) {
  const { t, city } = useApp();
  const transition = useStagger(index);
  const tap = useTapScale(0.985);
  const distance = distanceKm(origin ?? originFor(city), market);

  const photo = (
    <SafeImage
      src={marketPhotoUrl(market.photo)}
      alt={`${market.name}, ${t('a11y.marketImage')}`}
      label={market.name}
      className="h-full w-full object-cover"
    />
  );

  if (layout === 'row') {
    const body = (
      <>
        <span className="block h-[68px] w-[68px] shrink-0 overflow-hidden rounded-[14px] bg-surface-2">{photo}</span>
        <span className="min-w-0 flex-1 text-left">
          <span className="t-headline block truncate">{market.name}</span>
          <span className="t-footnote block truncate text-ink-secondary">
            {market.district}, {market.city}, {formatDistance(distance)}
          </span>
          <OpenStatus market={market} className="mt-0.5" />
          {note ? <span className="t-caption1 mt-0.5 block text-accent">{note}</span> : null}
        </span>
      </>
    );

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={transition} whileTap={tap}>
        <div
          className={`flex items-center gap-3 border-b border-separator px-4 py-3 transition-colors ${
            selected ? 'bg-accent-soft' : ''
          }`}
        >
          {onSelect ? (
            <button
              type="button"
              onClick={onSelect}
              aria-pressed={selected}
              aria-label={market.name}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              {body}
            </button>
          ) : (
            <Link href={`/market/${market.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              {body}
            </Link>
          )}
          <Link
            href={`/market/${market.id}`}
            aria-label={`${market.name}, ${t('market.browseAll')}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center"
          >
            <ChevronRight size={18} className="text-ink-tertiary" />
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
      whileTap={tap}
      className="w-[228px] shrink-0"
    >
      <Link href={`/market/${market.id}`} className="block">
        <span className="block h-[124px] w-full overflow-hidden rounded-[16px] bg-surface-2 shadow-card">{photo}</span>
        <span className="mt-2 block">
          <span className="t-subhead block truncate font-semibold">{market.name}</span>
          <span className="t-caption1 block truncate text-ink-secondary">
            {market.district}, {formatDistance(distance)}
          </span>
          <OpenStatus market={market} className="mt-0.5" />
          {note ? <span className="t-caption1 mt-0.5 block text-accent">{note}</span> : null}
        </span>
      </Link>
    </motion.div>
  );
}
