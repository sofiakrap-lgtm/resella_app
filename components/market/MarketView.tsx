'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { marketById, newToday, productsByMarket } from '@/lib/mockData';
import { distanceKm, formatDistance } from '@/lib/geo';
import { originFor } from '@/lib/search';
import { marketPhotoUrl } from '@/lib/assets';
import { useApp, useNow } from '@/lib/state';
import { useTransition } from '@/lib/motion';
import { isOpenNow, nextOpenDay, opensLaterToday, WEEKDAY_LABELS } from '@/lib/time';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SafeImage } from '@/components/ui/SafeImage';
import { Button, IconButton } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Chip';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { ProductRow } from '@/components/product/ProductRow';
import { OpeningHoursList } from '@/components/market/OpeningHours';
import { MapView } from '@/components/map/MapView';
import { HeartIcon, ShareIcon, RouteIcon, LocationIcon, ChevronDown } from '@/components/ui/Icons';

export function MarketView() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const { t, city, language, favoriteMarkets, toggleFavoriteMarket, pushToast } = useApp();
  const transition = useTransition();
  const now = useNow();
  const [loading, setLoading] = useState(true);
  // Demo switch: append ?demo=error to show the error state.
  const [failed, setFailed] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);

  useEffect(() => {
    setFailed(search.get('demo') === 'error');
  }, [search]);

  const market = marketById(params.id);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 380);
    return () => window.clearTimeout(timer);
  }, [params.id]);

  if (!market) {
    return (
      <div>
        <ScreenHeader title={t('map.title')} back />
        <EmptyState
          title={t('results.emptyTitle')}
          action={<Button onClick={() => router.push('/map')}>{t('map.title')}</Button>}
        />
      </div>
    );
  }

  const favorite = favoriteMarkets.includes(market.id);
  const distance = distanceKm(originFor(city), market);
  const closed = now ? !isOpenNow(market, now) : false;
  const laterToday = now ? opensLaterToday(market, now) : null;
  const next = now ? nextOpenDay(market, now) : null;
  const items = productsByMarket(market.id).filter((product) => product.status !== 'sold');

  if (failed) {
    return (
      <div>
        <ScreenHeader title={market.name} back />
        <ErrorState
          onRetry={() => {
            setFailed(false);
            setLoading(true);
          }}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <ScreenHeader title={market.name} back />
        <Skeleton className="h-[220px] w-full rounded-none" />
        <div className="space-y-3 px-4 pt-4">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-[100px] w-full rounded-[18px]" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader
        title={market.name}
        back
        transparent
        largeTitleBelow
        right={
          <>
            <IconButton
              ariaLabel={favorite ? t('market.favorited') : t('market.favorite')}
              active={favorite}
              onClick={() => toggleFavoriteMarket(market.id)}
            >
              <HeartIcon size={21} filled={favorite} />
            </IconButton>
            <IconButton
              ariaLabel={t('market.share')}
              onClick={() => pushToast({ title: t('market.share'), body: market.name })}
            >
              <ShareIcon size={20} />
            </IconButton>
          </>
        }
      />

      <div className="relative h-[220px] w-full bg-surface-2">
        <SafeImage
          src={marketPhotoUrl(market.photo)}
          alt={`${market.name}, ${t('a11y.marketImage')}`}
          label={market.name}
          className="h-full w-full object-cover"
          priority
        />
      </div>

      {closed ? (
        <div className="bg-accent-soft px-4 py-2.5">
          <p className="t-subhead text-warning">
            {t('market.closedNow')}
            {laterToday
              ? `, ${t('market.opensAt')} ${t('common.today').toLowerCase()} ${laterToday.open}`
              : next
                ? `, ${t('market.opensAt')} ${WEEKDAY_LABELS[next.day][language].toLowerCase()} ${next.hours.open}`
                : ''}
          </p>
        </div>
      ) : null}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
        <div className="px-4 pt-4">
          <h1 className="t-title2">{market.name}</h1>
          <p className="t-subhead mt-1 text-ink-secondary">
            {market.address}, {market.postalCode} {market.city}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Tag tone="accent">{`${market.rating.toFixed(1).replace('.', ',')} / 5`}</Tag>
            <Tag>{`${market.reviewCount} ${t('market.reviews')}`}</Tag>
            <Tag>{`${market.tableCount} ${t('market.tables')}`}</Tag>
            <Tag>{formatDistance(distance)}</Tag>
          </div>
          <p className="t-subhead mt-3">{market.description}</p>
        </div>

        <section className="mt-5">
          <button
            type="button"
            onClick={() => setHoursOpen((current) => !current)}
            aria-expanded={hoursOpen}
            className="flex min-h-11 w-full items-center justify-between px-4"
          >
            <h2 className="t-headline">{t('market.openingHours')}</h2>
            <ChevronDown
              size={18}
              className="text-ink-secondary transition-transform"
              style={{ transform: hoursOpen ? 'rotate(180deg)' : undefined }}
            />
          </button>
          <div className="mt-1 overflow-hidden rounded-[18px] bg-surface shadow-card">
            {hoursOpen ? (
              <OpeningHoursList market={market} />
            ) : (
              <div className="px-4 py-3">
                <OpeningHoursTodayOnly marketId={market.id} />
              </div>
            )}
          </div>
        </section>

        <ProductRow title={t('market.newToday')} products={newToday(market.id)} />

        <div className="mt-5 px-4">
          <Button full variant="secondary" href={`/results?market=${market.id}&city=${encodeURIComponent(market.city)}`}>
            {t('market.browseAll')} ({items.length})
          </Button>
        </div>

        <section className="mt-5 px-4">
          <div className="overflow-hidden rounded-[18px] bg-surface shadow-card">
            <MapView markets={[market]} className="h-[180px] w-full" />
            <div className="flex items-center gap-2 px-4 py-3">
              <Button
                variant="secondary"
                size="sm"
                icon={<RouteIcon size={18} />}
                onClick={() => pushToast({ title: t('market.directions'), body: market.address })}
              >
                {t('market.directions')}
              </Button>
              <span className="t-footnote inline-flex items-center gap-1 text-ink-secondary">
                <LocationIcon size={15} />
                {formatDistance(distance)}
              </span>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}

function OpeningHoursTodayOnly({ marketId }: { marketId: string }) {
  const { t, language } = useApp();
  const now = useNow();
  const market = marketById(marketId)!;
  if (!now) return <span className="t-subhead text-ink-secondary">{t('common.loading')}</span>;
  const key = (['ma', 'ti', 'ke', 'to', 'pe', 'la', 'su'] as const)[(now.getDay() + 6) % 7];
  const hours = market.hours[key];
  return (
    <span className="t-subhead">
      <span className="font-semibold">{WEEKDAY_LABELS[key][language]}</span>
      {': '}
      {hours ? `${hours.open} - ${hours.close}` : t('common.closed')}
    </span>
  );
}
