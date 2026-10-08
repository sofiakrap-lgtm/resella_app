'use client';

import Link from 'next/link';
import { animate, motion, useMotionValue } from 'framer-motion';
import type { AnimationPlaybackControls } from 'framer-motion';
import { useRef, useState } from 'react';
import type { Product } from '@/lib/types';
import { marketById } from '@/data/markets';
import { price } from '@/lib/format';
import { productImage } from '@/lib/imagePath';
import { useApp } from '@/lib/state';
import { spring, useStagger, useTapScale, useMotionAllowed } from '@/lib/motion';
import { HYSTERESIS, VelocityTracker, project, rubberband, capture, release } from '@/lib/physics';
import { SafeImage } from './ui/SafeImage';
import { Button, IconButton } from './ui/Button';
import { Sheet } from './ui/Sheet';
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
  const { wishlist, toggleWishlist, reservedIds } = useApp();
  const transition = useStagger(index);
  const tap = useTapScale(0.985);
  const market = marketById(product.marketId);
  const saved = wishlist.includes(product.id);
  const [photo, setPhoto] = useState(0);
  const [quickOpen, setQuickOpen] = useState(false);
  const peek = useRef<number | undefined>(undefined);
  const motionAllowed = useMotionAllowed();
  const frameRef = useRef<HTMLSpanElement | null>(null);
  const strip = useMotionValue(0);
  const playback = useRef<AnimationPlaybackControls | null>(null);
  const tracker = useRef(new VelocityTracker());
  const swipe = useRef({ active: false, pointerId: -1, startX: 0, startY: 0, startOffset: 0, decided: false, moved: false });

  const status = reservedIds.includes(product.id) ? 'Varattu' : product.status;
  const unavailable = status !== 'Saatavilla';

  /**
   * One line of context: where the item is. On a market page every card is in
   * the same place, so the line is dropped rather than repeated.
   */
  const context = hideMarket ? '' : (market?.name ?? '');

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
      <span className="glass-chip flex h-9 w-9 items-center justify-center rounded-full">
        <HeartIcon size={18} filled={saved} />
      </span>
    </IconButton>
  );

  /**
   * Swiping the thumbnail steps through the images without leaving the list.
   * The strip tracks the finger the whole way rather than jumping a frame at
   * the end of the gesture, and a flick lands on the photo the throw was
   * heading for, which is how a small input becomes a big output.
   */
  const frameWidth = () => frameRef.current?.clientWidth || 1;
  const pages = product.images.length;
  const offsetFor = (index: number) => -index * frameWidth();

  const onPointerDown = (event: React.PointerEvent) => {
    if (pages < 2) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    playback.current?.stop();
    tracker.current.reset();
    tracker.current.add(event.clientX);
    swipe.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: strip.get(),
      decided: false,
      moved: false,
    };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const state = swipe.current;
    if (!state.active || event.pointerId !== state.pointerId) return;
    tracker.current.add(event.clientX);
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;

    if (!state.decided) {
      if (Math.abs(dx) < HYSTERESIS && Math.abs(dy) < HYSTERESIS) return;
      if (Math.abs(dy) >= Math.abs(dx)) {
        // Vertical won, so this pointer belongs to the scroll, not to us.
        state.active = false;
        return;
      }
      state.decided = true;
      state.moved = true;
      state.startX = event.clientX;
      state.startOffset = strip.get();
      capture(frameRef.current, event.pointerId);
    }

    const width = frameWidth();
    const raw = state.startOffset + (event.clientX - state.startX);
    const min = offsetFor(pages - 1);
    const resisted =
      raw > 0 ? rubberband(raw, width) : raw < min ? min - rubberband(min - raw, width) : raw;
    strip.set(resisted);
    // The dots report the photo under the finger as it crosses, not only once
    // the gesture has finished, so the feedback is continuous.
    const crossed = Math.min(Math.max(Math.round(-resisted / width), 0), pages - 1);
    if (crossed !== photo) setPhoto(crossed);
  };

  const onPointerUp = (event: React.PointerEvent) => {
    const state = swipe.current;
    if (!state.active || event.pointerId !== state.pointerId) return;
    state.active = false;
    release(frameRef.current, event.pointerId);
    if (!state.decided) return;

    const width = frameWidth();
    const velocity = tracker.current.velocity();
    const projected = strip.get() + project(velocity);
    const index = Math.min(Math.max(Math.round(-projected / width), 0), pages - 1);
    setPhoto(index);
    const target = offsetFor(index);
    if (!motionAllowed) {
      strip.set(target);
      return;
    }
    playback.current = animate(strip, target, { ...spring.sheet, velocity });
  };

  /** A swipe must not also open the product page on release. */
  const guardSwipeClick = (event: React.MouseEvent) => {
    if (!swipe.current.moved) return;
    swipe.current.moved = false;
    event.preventDefault();
  };

  const frameProps = {
    ref: frameRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    style: pages > 1 ? ({ touchAction: 'pan-y' } as const) : undefined,
  };

  const image = (
    <motion.span className="flex h-full w-full" style={{ x: strip }}>
      {product.images.map((name, imageIndex) => (
        <span key={name} className="block h-full w-full shrink-0">
          <SafeImage
            src={productImage(name)}
            alt={`${product.title}, tuotekuva ${imageIndex + 1}/${pages}`}
            label={product.title}
            fallbackType="tuote"
            className="h-full w-full object-cover"
          />
        </span>
      ))}
    </motion.span>
  );

  const dots =
    product.images.length > 1 ? (
      <span className="absolute inset-x-0 bottom-2 flex justify-center gap-1" aria-hidden="true">
        {product.images.map((name, dotIndex) => (
          <span
            key={name}
            className="h-1.5 w-1.5 rounded-full bg-surface"
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
        <div className="flex items-center gap-3 border-b border-separator px-4 py-3 last:border-b-0">
          <Link
            href={`/tuote/${product.id}`}
            onClick={guardSwipeClick}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <span
              {...frameProps}
              className="relative block h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[12px] bg-cream-sink"
            >
              {image}
              {dots}
              {statusOverlay}
            </span>
            <span className="min-w-0 flex-1">
              <span className="t-card-title block truncate">{product.title}</span>
              <span className="t-card-price mt-0.5 block">{price(product.priceEur)}</span>
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
      <div
        className="relative"
        onPointerDown={() => {
          // A long press opens the quick view instead of the product page.
          peek.current = window.setTimeout(() => setQuickOpen(true), 500);
        }}
        onPointerUp={() => window.clearTimeout(peek.current)}
        onPointerMove={() => window.clearTimeout(peek.current)}
        onPointerLeave={() => window.clearTimeout(peek.current)}
        onContextMenu={(event) => event.preventDefault()}
      >
        <span className="absolute right-1 top-1 z-10">{heart}</span>
        <Link
          href={`/tuote/${product.id}`}
          className="block"
          onClick={(event) => {
            if (quickOpen) event.preventDefault();
            guardSwipeClick(event);
          }}
        >
          <span
            {...frameProps}
            className="relative block aspect-[4/5] w-full overflow-hidden rounded-[12px] bg-cream-sink shadow-card"
          >
            {image}
            {dots}
            {statusOverlay}
            {badge ? (
              <span className="absolute left-2 top-2 rounded-full bg-surface px-2 py-0.5 t-caption font-semibold text-brown">
                {badge}
              </span>
            ) : null}
          </span>
          <span className="mt-2 block">
            <span className="t-card-title block truncate">{product.title}</span>
            <span className="t-card-price mt-0.5 block">{price(product.priceEur)}</span>
            <span className="t-subhead mt-0.5 block truncate text-brown-70">{context}</span>
          </span>
        </Link>
      </div>

      <Sheet
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        title={product.title}
        detents={[0.5]}
        ariaLabel="Pikakatselu"
      >
        <div className="px-4 pb-6">
          <span className="block aspect-[4/5] w-full overflow-hidden rounded-[12px] bg-cream-sink">
            {image}
          </span>
          <p className="t-price-lg mt-3">{price(product.priceEur)}</p>
          <p className="t-subhead mt-1 text-brown-70">
            {market?.name}
            {product.size ? `, koko ${product.size}` : ''}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button full href={`/tuote/${product.id}`} onClick={() => setQuickOpen(false)}>
              Avaa tuote
            </Button>
            <Button
              full
              variant="bordered"
              onClick={() => {
                toggleWishlist(product.id);
                setQuickOpen(false);
              }}
            >
              {saved ? 'Poista toivelistalta' : 'Tallenna toivelistalle'}
            </Button>
          </div>
        </div>
      </Sheet>
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

/**
 * Vertical list of products under a heading. Used everywhere except the one
 * hero carousel per screen: two scroll directions at once is what makes a
 * feed feel busy.
 */
export function ProductList({
  title,
  products,
  href,
  limit = 4,
  hideMarket = false,
}: {
  title: string;
  products: Product[];
  href?: string;
  limit?: number;
  hideMarket?: boolean;
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
      <div className="mt-3 overflow-hidden rounded-[16px] bg-surface shadow-card mx-4">
        {products.slice(0, limit).map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            layout="row"
            index={index}
            hideMarket={hideMarket}
          />
        ))}
      </div>
    </section>
  );
}
