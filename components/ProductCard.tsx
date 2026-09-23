'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import type { Product } from '@/lib/types';
import { marketById } from '@/data/markets';
import { price, distance, haversineKm, CITY_CENTERS } from '@/lib/format';
import { productImage } from '@/lib/imagePath';
import { useApp } from '@/lib/state';
import { useStagger, useTapScale } from '@/lib/motion';
import { SafeImage } from './ui/SafeImage';
import { IconButton } from './ui/Button';
import { HeartIcon } from './ui/Icons';

interface ProductCardProps {
  product: Product;
  layout?: 'card' | 'row';
  index?: number;
  fullWidth?: boolean;
  /** Hide the market name on a market page where every card repeats it. */
  hideMarket?: boolean;
  /** Drop the new arrival badge where the section heading already says it. */
  hideNewBadge?: boolean;
}

/**
 * Product tile. Three lines at most: title, price, and one line of context.
 * Table, seller and condition live on the product page, where there is room
 * for them; on a card they crowd out the photo and the price.
 */
export function ProductCard({
  product,
  layout = 'card',
  index = 0,
  fullWidth = false,
  hideMarket = false,
  hideNewBadge = false,
}: ProductCardProps) {
  const { city, wishlist, toggleWishlist, reservedIds } = useApp();
  const transition = useStagger(index);
  const tap = useTapScale(0.985);
  const market = marketById(product.marketId);
  const saved = wishlist.includes(product.id);
  const [photo, setPhoto] = useState(0);
  const touchStart = useRef<number | null>(null);

  const status = reservedIds.includes(product.id) ? 'Varattu' : product.status;
  const unavailable = status !== 'Saatavilla';

  /**
   * One line of context. A narrow tile fits the market name or the distance,
   * not both, and the name is the more useful of the two; the wide layouts
   * have room for the pair.
   */
  const km = market ? haversineKm(CITY_CENTERS[city] ?? CITY_CENTERS.Helsinki, market) : null;
  const roomForBoth = fullWidth || layout === 'row';
  const context = (
    hideMarket
      ? [km === null ? null : distance(km)]
      : roomForBoth
        ? [market?.name, km === null ? null : distance(km)]
        : [market?.name]
  )
    .filter(Boolean)
    .join(' · ');

  /**
   * One badge per card, in priority order: a blocked item first, because it
   * changes whether the card is worth tapping, then the new arrival.
   */
  const badge = unavailable
    ? status
    : product.addedDaysAgo === 0 && !hideNewBadge
      ? 'Uutta tänään'
      : null;

  const heart = (
    <IconButton
      ariaLabel={saved ? 'Poista toivelistalta' : 'Tallenna toivelistalle'}
      active={saved}
      onClick={() => toggleWishlist(product.id)}
    >
      <span className="glass flex h-9 w-9 items-center justify-center rounded-full">
        <HeartIcon size={18} filled={saved} />
      </span>
    </IconButton>
  );

  /** Swiping the thumbnail steps through the images without leaving the list. */
  const onTouchStart = (event: React.TouchEvent) => {
    touchStart.current = event.touches[0].clientX;
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(delta) > 30) {
      setPhoto((current) =>
        delta < 0 ? Math.min(current + 1, product.images.length - 1) : Math.max(current - 1, 0),
      );
    }
    touchStart.current = null;
  };

  const image = (
    <SafeImage
      src={productImage(product.images[photo])}
      alt={`${product.title}, tuotekuva ${photo + 1}/${product.images.length}`}
      label={product.title}
      fallbackType="tuote"
      className="h-full w-full object-cover"
    />
  );

  const dots =
    product.images.length > 1 ? (
      <span className="absolute inset-x-0 bottom-2 flex justify-center gap-1" aria-hidden="true">
        {product.images.map((name, dotIndex) => (
          <span
            key={name}
            className="h-1.5 w-1.5 rounded-full bg-cream"
            style={{ opacity: dotIndex === photo ? 1 : 0.45 }}
          />
        ))}
      </span>
    ) : null;

  const statusOverlay = unavailable ? (
    <span className="absolute inset-0 bg-[rgba(60,36,21,0.4)]" aria-hidden="true" />
  ) : null;

  if (layout === 'row') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        whileTap={tap}
      >
        <div className="flex items-center gap-3 border-b border-separator px-4 py-3">
          <Link href={`/tuote/${product.id}`} className="flex min-w-0 flex-1 items-center gap-3">
            <span
              className="relative block h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[12px] bg-cream-sink"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {image}
              {dots}
              {statusOverlay}
            </span>
            <span className="min-w-0 flex-1">
              <span className="t-headline block truncate">{product.title}</span>
              <span className="t-headline mt-0.5 block">{price(product.priceEur)}</span>
              <span className="t-subhead mt-0.5 block truncate text-brown-70">{context}</span>
              {badge ? <Badge>{badge}</Badge> : null}
            </span>
          </Link>
          <span className="flex shrink-0 items-center">{heart}</span>
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
      className={fullWidth ? 'w-full' : 'w-[168px] shrink-0'}
    >
      <div className="relative">
        <span className="absolute right-1 top-1 z-10">{heart}</span>
        <Link href={`/tuote/${product.id}`} className="block">
          <span
            className="relative block aspect-[3/4] w-full overflow-hidden rounded-[16px] bg-cream-sink shadow-card"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {image}
            {dots}
            {statusOverlay}
            {badge ? (
              <span className="absolute left-2 top-2 rounded-full bg-cream px-2 py-0.5 t-caption font-semibold text-brown">
                {badge}
              </span>
            ) : null}
          </span>
          <span className="mt-2 block">
            <span className="t-headline block truncate">{product.title}</span>
            <span className="t-headline mt-0.5 block">{price(product.priceEur)}</span>
            <span className="t-subhead mt-0.5 block truncate text-brown-70">{context}</span>
          </span>
        </Link>
      </div>
    </motion.div>
  );
}

/** Inline badge for the row layout, where there is no image corner to sit in. */
function Badge({ children }: { children: string }) {
  return (
    <span className="mt-1 inline-flex rounded-full bg-cream-sink px-2 py-0.5 t-caption font-semibold text-brown">
      {children}
    </span>
  );
}

/** Horizontally scrolling row used on the home feed and detail pages. */
export function ProductRow({
  title,
  products,
  href,
  hideMarket = false,
  hideNewBadge = false,
}: {
  title: string;
  products: Product[];
  href?: string;
  hideMarket?: boolean;
  hideNewBadge?: boolean;
}) {
  if (!products.length) return null;
  return (
    <section className="section">
      <div className="flex items-baseline justify-between gap-3 screen-x">
        <h3 className="t-title3">{title}</h3>
        {href ? (
          <Link
            href={href}
            className="t-subhead inline-flex min-h-11 shrink-0 items-center text-terracotta-ink"
          >
            Katso kaikki
          </Link>
        ) : null}
      </div>
      <div className="hide-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1 screen-x">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            hideMarket={hideMarket}
            hideNewBadge={hideNewBadge}
          />
        ))}
      </div>
    </section>
  );
}
