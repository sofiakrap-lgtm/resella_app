'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Seller } from '@/lib/types';
import { sellerImage } from '@/lib/imagePath';
import { marketById } from '@/data/markets';
import { rating as formatRating } from '@/lib/format';
import { useStagger, useTapScale } from '@/lib/motion';
import { SafeImage } from './ui/SafeImage';
import { Tag } from './ui/Chip';
import { ChevronRight, StarIcon } from './ui/Icons';

export function SellerAvatar({ seller, size = 44 }: { seller: Seller; size?: number }) {
  return (
    <span
      className="block shrink-0 overflow-hidden rounded-full bg-cream-sink"
      style={{ width: size, height: size }}
    >
      <SafeImage
        src={sellerImage(seller.avatar)}
        alt={`${seller.name}, profiilikuva`}
        fallbackType="myyja"
        className="h-full w-full object-cover"
      />
    </span>
  );
}

/** One line that says where the seller sells right now. */
export function SellerWhere({ seller, className = '' }: { seller: Seller; className?: string }) {
  const market = seller.currentMarketId ? marketById(seller.currentMarketId) : undefined;
  if (!seller.isActive || !market) {
    return (
      <span className={`t-footnote text-brown-70 ${className}`}>Ei aktiivista pöytää juuri nyt.</span>
    );
  }
  // Table first: it is the fact that gets someone to the right shelf.
  return (
    <span className={`t-footnote text-brown-70 ${className}`}>
      {seller.tableNumber}, {market.name}
      {seller.tableValidUntil ? `, myynnissä ${seller.tableValidUntil} asti` : ''}
    </span>
  );
}

export function SellerCard({
  seller,
  index = 0,
  layout = 'row',
}: {
  seller: Seller;
  index?: number;
  layout?: 'row' | 'grid';
}) {
  const transition = useStagger(index);
  const tap = useTapScale(0.985);
  const market = seller.currentMarketId ? marketById(seller.currentMarketId) : undefined;

  if (layout === 'grid') {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={transition} whileTap={tap}>
        <Link
          href={`/myyja/${seller.id}`}
          className="flex h-full flex-col items-center gap-2 rounded-[18px] bg-surface p-4 text-center shadow-card"
        >
          <SellerAvatar seller={seller} size={56} />
          <span className="t-subhead font-semibold">{seller.name}</span>
          <span className="t-caption text-brown-70">
            {market ? `${market.name}, ${seller.tableNumber}` : 'Ei pöytää juuri nyt'}
          </span>
          <span className="mt-auto inline-flex items-center gap-1 t-caption text-brown-70">
            <StarIcon size={13} />
            {formatRating(seller.rating)} · {seller.followerCount} seuraajaa
          </span>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={transition} whileTap={tap}>
      <Link href={`/myyja/${seller.id}`} className="flex items-center gap-3 border-b border-separator px-4 py-3">
        <SellerAvatar seller={seller} size={52} />
        <span className="min-w-0 flex-1">
          <span className="t-headline block truncate">{seller.name}</span>
          <SellerWhere seller={seller} className="block truncate" />
          <span className="mt-1 inline-flex items-center gap-1.5">
            <Tag tone="accent">{`${formatRating(seller.rating)} / 5`}</Tag>
            <Tag>{`${seller.followerCount} seuraajaa`}</Tag>
          </span>
        </span>
        <ChevronRight size={18} className="shrink-0 text-brown-50" />
      </Link>
    </motion.div>
  );
}
