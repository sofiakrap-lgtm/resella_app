'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import type { Product } from '@/lib/types';
import { marketById } from '@/data/markets';
import { sellerById } from '@/data/sellers';
import { price } from '@/lib/format';
import { productImage } from '@/lib/imagePath';
import { useApp } from '@/lib/state';
import { useStagger, useTapScale } from '@/lib/motion';
import { SafeImage } from './ui/SafeImage';
import { IconButton } from './ui/Button';
import { Tag } from './ui/Chip';
import { HeartIcon, TagIcon, LocationIcon } from './ui/Icons';

interface ProductCardProps {
  product: Product;
  layout?: 'card' | 'row';
  index?: number;
  fullWidth?: boolean;
  /** Hide the market line on a market page where it would repeat. */
  hideMarket?: boolean;
}

/** Product tile. Every item carries where it physically is: market and table. */
export function ProductCard({
  product,
  layout = 'card',
  index = 0,
  fullWidth = false,
  hideMarket = false,
}: ProductCardProps) {
  const { wishlist, toggleWishlist, reservedIds } = useApp();
  const transition = useStagger(index);
  const tap = useTapScale(0.985);
  const market = marketById(product.marketId);
  const seller = sellerById(product.sellerId);
  const saved = wishlist.includes(product.id);
  const [photo, setPhoto] = useState(0);
  const touchStart = useRef<number | null>(null);

  const status = reservedIds.includes(product.id) ? 'Varattu' : product.status;
  const unavailable = status !== 'Saatavilla';

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
        delta < 0
          ? Math.min(current + 1, product.images.length - 1)
          : Math.max(current - 1, 0),
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
    <span className="absolute inset-0 flex items-center justify-center bg-[rgba(60,36,21,0.45)]">
      <span className="rounded-full bg-cream px-3 py-1 t-caption font-semibold text-brown">
        {status}
      </span>
    </span>
  ) : null;

  if (layout === 'row') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={transition} whileTap={tap}>
        <div className="flex items-start gap-3 border-b border-separator px-4 py-3">
          <Link href={`/tuote/${product.id}`} className="flex min-w-0 flex-1 gap-3">
            <span
              className="relative block h-[92px] w-[92px] shrink-0 overflow-hidden rounded-[14px] bg-cream-sink"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {image}
              {dots}
              {statusOverlay}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-2">
                <span className="t-headline line-clamp-2">{product.title}</span>
                <span className="t-headline shrink-0">{price(product.priceEur)}</span>
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-1.5">
                {product.size ? <Tag tone="accent">{`Koko ${product.size}`}</Tag> : null}
                <Tag>{product.condition}</Tag>
              </span>
              {hideMarket ? (
                <span className="t-footnote mt-1.5 block text-brown-70">
                  {seller?.name}, {product.tableNumber}
                </span>
              ) : (
                <span className="t-footnote mt-1.5 flex flex-wrap items-center gap-x-2 text-brown-70">
                  <span className="inline-flex max-w-full items-center gap-1">
                    <LocationIcon size={14} className="shrink-0" />
                    <span className="truncate">{market?.name}</span>
                  </span>
                  <span className="inline-flex max-w-full items-center gap-1">
                    <TagIcon size={14} className="shrink-0" />
                    <span className="truncate">{product.tableNumber}</span>
                  </span>
                </span>
              )}
            </span>
          </Link>
          <span className="flex shrink-0 items-start">{heart}</span>
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
        <span className="absolute right-1.5 top-1.5 z-10">{heart}</span>
        <Link href={`/tuote/${product.id}`} className="block">
          <span
            className="relative block aspect-[4/5] w-full overflow-hidden rounded-[16px] bg-cream-sink shadow-card"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {image}
            {dots}
            {statusOverlay}
            {product.addedDaysAgo === 0 && !unavailable ? (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-terracotta-ink px-2 py-0.5 t-caption font-semibold text-on-terracotta">
                Tänään
              </span>
            ) : null}
          </span>
          <span className="mt-2 block">
            <span className="t-subhead block truncate font-semibold">{product.title}</span>
            <span className="t-subhead mt-0.5 block">{price(product.priceEur)}</span>
            <span className="mt-1 flex flex-wrap items-center gap-1">
              {product.size ? <Tag tone="accent">{product.size}</Tag> : null}
              <Tag>{product.condition}</Tag>
            </span>
            <span className="t-caption mt-1 block truncate text-brown-70">
              {hideMarket ? seller?.name : market?.name}, {product.tableNumber}
            </span>
          </span>
        </Link>
      </div>
    </motion.div>
  );
}

/** Horizontally scrolling row used on the home feed and profile pages. */
export function ProductRow({
  title,
  products,
  href,
  hideMarket = false,
}: {
  title: string;
  products: Product[];
  href?: string;
  hideMarket?: boolean;
}) {
  if (!products.length) return null;
  return (
    <section className="mt-6">
      <div className="flex items-baseline justify-between gap-3 px-4">
        <h3 className="t-title3">{title}</h3>
        {href ? (
          <Link href={href} className="t-subhead inline-flex min-h-11 items-center text-terracotta-ink">
            Näytä kaikki
          </Link>
        ) : null}
      </div>
      <div className="hide-scrollbar mt-2 flex gap-3 overflow-x-auto px-4 pb-1">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} hideMarket={hideMarket} />
        ))}
      </div>
    </section>
  );
}
