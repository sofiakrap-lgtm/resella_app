'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { Product, addedLabel, formatPrice, marketById } from '@/lib/mockData';
import { distanceKm, formatDistance } from '@/lib/geo';
import { originFor } from '@/lib/search';
import { useApp } from '@/lib/state';
import { useStagger, useTapScale } from '@/lib/motion';
import { productPhotoUrl } from '@/lib/assets';
import { SafeImage } from '@/components/ui/SafeImage';
import { IconButton } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Chip';
import { HeartIcon, LocationIcon, TagIcon } from '@/components/ui/Icons';

interface ProductCardProps {
  product: Product;
  layout?: 'card' | 'row';
  index?: number;
  onQuickView?: (product: Product) => void;
  showDistance?: boolean;
  /** Stretches the card to its container, used in grids. */
  fullWidth?: boolean;
}

export function ProductCard({
  product,
  layout = 'card',
  index = 0,
  onQuickView,
  showDistance = true,
  fullWidth = false,
}: ProductCardProps) {
  const { t, city, wishlist, toggleWishlist } = useApp();
  const transition = useStagger(index);
  const tap = useTapScale(0.985);
  const market = marketById(product.marketId);
  const saved = wishlist.includes(product.id);
  const holdTimer = useRef<number | null>(null);
  const holdStart = useRef<{ x: number; y: number } | null>(null);

  const distance = market ? distanceKm(originFor(city), market) : null;

  const startHold = (event: { clientX: number; clientY: number }) => {
    if (!onQuickView) return;
    holdStart.current = { x: event.clientX, y: event.clientY };
    holdTimer.current = window.setTimeout(() => onQuickView(product), 550);
  };
  const cancelHold = () => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
    holdStart.current = null;
  };
  /** A scroll gesture must not turn into a quick view. */
  const moveHold = (event: { clientX: number; clientY: number }) => {
    const start = holdStart.current;
    if (!start) return;
    if (Math.abs(event.clientX - start.x) > 8 || Math.abs(event.clientY - start.y) > 8) cancelHold();
  };

  const statusOverlay =
    product.status === 'available' ? null : (
      <span className="absolute inset-0 flex items-center justify-center bg-black/45">
        <span className="rounded-full bg-surface px-3 py-1 t-caption1 font-semibold text-ink">
          {product.status === 'reserved' ? t('product.reserved') : t('product.sold')}
        </span>
      </span>
    );

  const heart = (
    <IconButton
      ariaLabel={saved ? t('a11y.unsaveProduct') : t('a11y.saveProduct')}
      active={saved}
      onClick={() => toggleWishlist(product.id)}
    >
      {/* The circle reads small, the touch target stays 44pt. */}
      <span className="glass flex h-9 w-9 items-center justify-center rounded-full">
        <HeartIcon size={18} filled={saved} />
      </span>
    </IconButton>
  );

  const photo = (
    <SafeImage
      src={productPhotoUrl(product.photos[0])}
      alt={`${product.title}, ${t('a11y.productImage')}`}
      className="h-full w-full object-cover"
    />
  );

  if (layout === 'row') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        whileTap={tap}
        onPointerDown={startHold}
        onPointerMove={moveHold}
        onPointerUp={cancelHold}
        onPointerCancel={cancelHold}
        onPointerLeave={cancelHold}
        onContextMenu={(event) => {
          if (onQuickView) {
            event.preventDefault();
            onQuickView(product);
          }
        }}
      >
        <div className="relative flex items-start gap-3 border-b border-separator px-4 py-3">
        <Link href={`/product/${product.id}`} className="flex min-w-0 flex-1 gap-3">
          <span className="relative block h-[92px] w-[92px] shrink-0 overflow-hidden rounded-[14px] bg-surface-2">
            {photo}
            {statusOverlay}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-start justify-between gap-2">
              <span className="t-headline line-clamp-2">{product.title}</span>
              <span className="t-headline shrink-0">{formatPrice(product.price)}</span>
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-1.5">
              {product.size ? <Tag tone="accent">{`${t('product.size')} ${product.size}`}</Tag> : null}
              <Tag>{product.condition}</Tag>
            </span>
            <span className="t-footnote mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-ink-secondary">
              <span className="inline-flex max-w-full items-center gap-1">
                <LocationIcon size={14} className="shrink-0" />
                <span className="truncate">{market?.name}</span>
              </span>
              <span className="inline-flex max-w-full items-center gap-1">
                <TagIcon size={14} className="shrink-0" />
                <span className="truncate">{product.spot}</span>
              </span>
              {showDistance && distance !== null ? <span>{formatDistance(distance)}</span> : null}
            </span>
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
      onPointerDown={startHold}
      onPointerMove={moveHold}
      onPointerUp={cancelHold}
      onPointerCancel={cancelHold}
      onPointerLeave={cancelHold}
      onContextMenu={(event) => {
        if (onQuickView) {
          event.preventDefault();
          onQuickView(product);
        }
      }}
    >
      <div className="relative">
        <span className="absolute right-1.5 top-1.5 z-10">{heart}</span>
      <Link href={`/product/${product.id}`} className="block">
        <span className="relative block aspect-[4/5] w-full overflow-hidden rounded-[16px] bg-surface-2 shadow-card">
          {photo}
          {statusOverlay}
          {product.addedDaysAgo === 0 && product.status === 'available' ? (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-accent px-2 py-0.5 t-caption2 font-semibold text-on-accent">
              {addedLabel(0)}
            </span>
          ) : null}
        </span>
        <span className="mt-2 block">
          <span className="t-subhead block truncate font-semibold">{product.title}</span>
          <span className="t-subhead mt-0.5 block">{formatPrice(product.price)}</span>
          <span className="t-caption1 mt-1 flex flex-wrap items-center gap-1">
            {product.size ? <Tag tone="accent">{product.size}</Tag> : null}
            <Tag>{product.condition}</Tag>
          </span>
          <span className="t-caption1 mt-1 block truncate text-ink-secondary">
            {market?.name}, {product.spot}
          </span>
          {showDistance && distance !== null ? (
            <span className="t-caption1 block text-ink-secondary">{formatDistance(distance)}</span>
          ) : null}
        </span>
      </Link>
      </div>
    </motion.div>
  );
}
