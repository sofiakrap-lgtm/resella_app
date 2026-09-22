'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { addedLabel, formatPrice, marketById, productById } from '@/lib/mockData';
import { distanceKm, formatDistance } from '@/lib/geo';
import { originFor, similarProducts } from '@/lib/search';
import { useApp } from '@/lib/state';
import { useTransition } from '@/lib/motion';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import { Button, IconButton } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Chip';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { ProductRow } from '@/components/product/ProductRow';
import { MapView } from '@/components/map/MapView';
import { OpenStatus } from '@/components/market/OpeningHours';
import {
  HeartIcon,
  ShareIcon,
  LocationIcon,
  TagIcon,
  LeafIcon,
  ChevronRight,
  BellIcon,
} from '@/components/ui/Icons';

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const { t, city, wishlist, toggleWishlist, pushToast } = useApp();
  const transition = useTransition();
  const [loading, setLoading] = useState(true);
  // Demo switch: append ?demo=error to show the error state.
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(search.get('demo') === 'error');
  }, [search]);

  const product = productById(params.id);
  const market = product ? marketById(product.marketId) : undefined;

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 380);
    return () => window.clearTimeout(timer);
  }, [params.id]);

  if (!product || !market) {
    return (
      <div>
        <ScreenHeader title={t('results.title')} back />
        <EmptyState
          title={t('results.emptyTitle')}
          body={t('results.emptyBody')}
          action={<Button onClick={() => router.push('/search')}>{t('common.search')}</Button>}
        />
      </div>
    );
  }

  const saved = wishlist.includes(product.id);
  const distance = distanceKm(originFor(city), market);
  const unavailable = product.status !== 'available';

  if (failed) {
    return (
      <div>
        <ScreenHeader title={product.title} back />
        <ErrorState
          onRetry={() => {
            setFailed(false);
            setLoading(true);
          }}
        />
      </div>
    );
  }

  if (loading) return <ProductSkeleton title={product.title} />;

  return (
    <div className="pb-[120px]">
      <ScreenHeader
        title={product.title}
        back
        transparent
        largeTitleBelow
        right={
          <>
            <IconButton
              ariaLabel={saved ? t('a11y.unsaveProduct') : t('a11y.saveProduct')}
              active={saved}
              onClick={() => toggleWishlist(product.id)}
            >
              <HeartIcon size={21} filled={saved} />
            </IconButton>
            <IconButton
              ariaLabel={t('common.share')}
              onClick={() => pushToast({ title: t('common.share'), body: product.title })}
            >
              <ShareIcon size={20} />
            </IconButton>
          </>
        }
      />

      <ImageCarousel
        photos={product.photos}
        alt={product.title}
        label={product.title}
        layoutId={`product-image-${product.id}`}
        className="h-[360px] w-full"
        overlay={
          unavailable ? (
            <span className="absolute inset-0 flex items-center justify-center bg-black/45">
              <span className="rounded-full bg-surface px-4 py-2 t-headline">
                {product.status === 'reserved' ? t('product.reserved') : t('product.sold')}
              </span>
            </span>
          ) : null
        }
      />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
        <div className="px-4 pt-4">
          <h1 className="t-title2">{product.title}</h1>
          <p className="t-title1 mt-1">{formatPrice(product.price)}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.size ? <Tag tone="accent">{`${t('product.size')} ${product.size}`}</Tag> : null}
            <Tag>{product.condition}</Tag>
            <Tag>{product.category}</Tag>
            {product.brand ? <Tag>{product.brand}</Tag> : null}
            <Tag>{`${t('product.added')}: ${addedLabel(product.addedDaysAgo)}`}</Tag>
          </div>
        </div>

        {/* Location card, the part no other second hand app can show */}
        <section className="mt-5 px-4">
          <h2 className="t-headline mb-2">{t('product.location')}</h2>
          <div className="overflow-hidden rounded-[18px] bg-surface shadow-card">
            <Link href={`/market/${market.id}`} className="flex items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1">
                <span className="t-headline block truncate">{market.name}</span>
                <span className="t-footnote block truncate text-ink-secondary">
                  {market.address}, {market.postalCode} {market.city}
                </span>
                <OpenStatus market={market} className="mt-0.5" />
              </span>
              <ChevronRight size={18} className="shrink-0 text-ink-tertiary" />
            </Link>
            <div className="flex items-center gap-4 border-t border-separator px-4 py-3">
              <span className="t-subhead inline-flex items-center gap-1.5 font-semibold text-accent">
                <TagIcon size={16} />
                {product.spot}
              </span>
              <span className="t-subhead inline-flex items-center gap-1.5 text-ink-secondary">
                <LocationIcon size={16} />
                {formatDistance(distance)}
              </span>
            </div>
            <p className="t-caption1 px-4 pb-2 text-ink-secondary">{t('product.spotHint')}</p>
            <Link href={`/market/${market.id}`} aria-label={market.name} className="block">
              <MapView markets={[market]} className="h-[140px] w-full" />
            </Link>
          </div>
        </section>

        <section className="mt-4 px-4">
          <div className="flex items-start gap-2 rounded-[16px] bg-accent-soft px-4 py-3">
            <LeafIcon size={18} className="mt-0.5 shrink-0 text-accent" />
            <span>
              <span className="t-subhead block font-semibold text-accent">{t('product.sustainable')}</span>
              <span className="t-caption1 block text-ink-secondary">{product.sustainabilityNote}</span>
            </span>
          </div>
        </section>

        {unavailable ? (
          <div className="mt-5 px-4">
            <Button
              full
              variant="secondary"
              icon={<BellIcon size={18} />}
              onClick={() => pushToast({ title: t('product.notifySimilar'), body: product.title, href: '/saved' })}
            >
              {t('product.notifySimilar')}
            </Button>
          </div>
        ) : null}

        <ProductRow title={t('product.similar')} products={similarProducts(product)} />
      </motion.div>

      {!unavailable ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 px-4 pb-[94px]">
          <div className="glass pointer-events-auto flex gap-2 rounded-full p-1.5">
            <Button full size="sm" href={`/reserve/${product.id}`} className="whitespace-nowrap">
              {t('product.reserve')}
            </Button>
            <Button
              full
              size="sm"
              variant="secondary"
              href={`/reserve/${product.id}?buy=1`}
              className="whitespace-nowrap"
            >
              {t('product.buy')}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProductSkeleton({ title }: { title: string }) {
  return (
    <div>
      <ScreenHeader title={title} back />
      <Skeleton className="h-[360px] w-full rounded-none" />
      <div className="space-y-3 px-4 pt-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-7 w-1/3" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-[120px] w-full rounded-[18px]" />
      </div>
    </div>
  );
}
