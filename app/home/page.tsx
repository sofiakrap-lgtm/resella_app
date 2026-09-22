'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/state';
import { useTransition } from '@/lib/motion';
import { markets, newToday, products, type Product } from '@/lib/mockData';
import { distanceKm } from '@/lib/geo';
import { originFor } from '@/lib/search';
import { ScreenHeader, LargeTitle } from '@/components/ui/ScreenHeader';
import { ProductRow } from '@/components/product/ProductRow';
import { QuickView } from '@/components/product/QuickView';
import { MarketCard } from '@/components/market/MarketCard';
import { Mascot } from '@/components/ui/Mascot';
import { Button, IconButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/StateViews';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { SearchIcon, SparkleIcon, SettingsIcon, ChevronRight } from '@/components/ui/Icons';

export default function HomePage() {
  const { t, name, city, tasteCategories, favoriteMarkets, recentSearches, wishlist } = useApp();
  const transition = useTransition();
  const [loading, setLoading] = useState(true);
  const [quickView, setQuickView] = useState<Product | null>(null);

  // The demo fakes a short fetch so the skeletons are visible at least once.
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 550);
    return () => window.clearTimeout(timer);
  }, []);

  const origin = originFor(city);

  // "New today" follows the chosen city, with a national fallback so the row
  // is never empty in a smaller town.
  const todays = useMemo(() => {
    const inCity = newToday().filter(
      (product) => markets.find((market) => market.id === product.marketId)?.city === city,
    );
    return (inCity.length ? inCity : newToday()).slice(0, 10);
  }, [city]);
  const nearby = useMemo(
    () =>
      products
        .filter((product) => product.status === 'available')
        .map((product) => {
          const market = markets.find((entry) => entry.id === product.marketId)!;
          return { product, distance: distanceKm(origin, market) };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10)
        .map((entry) => entry.product),
    [origin],
  );

  const forYou = useMemo(() => {
    if (!tasteCategories.length) return [];
    const matching = products.filter(
      (product) => tasteCategories.includes(product.category) && product.status === 'available',
    );
    const inCity = matching.filter(
      (product) => markets.find((market) => market.id === product.marketId)?.city === city,
    );
    return (inCity.length ? inCity : matching).slice(0, 10);
  }, [tasteCategories, city]);

  const favorites = markets.filter((market) => favoriteMarkets.includes(market.id));
  const isNewUser = !tasteCategories.length && !recentSearches.length && !wishlist.length;

  return (
    <div>
      <ScreenHeader
        title={t('app.name')}
        largeTitleBelow
        transparent
        right={
          <IconButton ariaLabel={t('settings.title')} href="/settings">
            <SettingsIcon size={22} />
          </IconButton>
        }
      />

      <div className="flex items-start justify-between gap-3 pr-4 pt-1">
        <div className="min-w-0">
          <LargeTitle>{t('app.name')}</LargeTitle>
          <p className="t-subhead px-4 text-ink-secondary">
            {t('home.greeting')} {name}, {city}
          </p>
        </div>
        <Mascot pose="wave" size={56} className="mt-2 shrink-0" />
      </div>

      <div className="mt-3 px-4">
        <Link
          href="/search"
          className="flex min-h-11 items-center gap-2 rounded-full bg-surface px-4 py-2.5 shadow-card"
        >
          <SearchIcon size={19} className="text-ink-secondary" />
          <span className="t-body truncate text-ink-secondary">{t('home.searchPlaceholder')}</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className="mt-3 px-4"
      >
        <Link
          href="/ai-search"
          className="flex items-center gap-3 rounded-[18px] bg-accent px-4 py-3 text-on-accent shadow-card"
        >
          <SparkleIcon size={22} />
          <span className="min-w-0 flex-1">
            <span className="t-headline block">{t('home.aiTeaser')}</span>
            <span className="t-footnote block opacity-90">{t('home.aiTeaserBody')}</span>
          </span>
          <ChevronRight size={18} />
        </Link>
      </motion.div>

      {loading ? (
        <section className="mt-6">
          <div className="px-4">
            <div className="shimmer h-6 w-40 rounded-md" />
          </div>
          <div className="hide-scrollbar mt-2 flex gap-3 overflow-x-auto px-4">
            {[0, 1, 2].map((key) => (
              <ProductCardSkeleton key={key} />
            ))}
          </div>
        </section>
      ) : (
        <>
          <ProductRow
            title={t('home.newToday')}
            products={todays}
            href="/results?sort=newest"
            onQuickView={setQuickView}
          />

          {favorites.length ? (
            <section className="mt-6">
              <div className="flex items-baseline justify-between px-4">
                <h3 className="t-title3">{t('home.favoriteMarkets')}</h3>
                <Link href="/map" className="t-subhead inline-flex min-h-11 items-center text-accent">
                  {t('common.showAll')}
                </Link>
              </div>
              <div className="hide-scrollbar mt-2 flex gap-3 overflow-x-auto px-4 pb-1">
                {favorites.map((market, index) => (
                  <MarketCard key={market.id} market={market} index={index} />
                ))}
              </div>
            </section>
          ) : null}

          {forYou.length ? (
            <ProductRow
              title={t('home.forYou')}
              products={forYou}
              href={`/results?cat=${encodeURIComponent(tasteCategories.join(','))}`}
              onQuickView={setQuickView}
            />
          ) : isNewUser ? (
            <section className="mt-4">
              <EmptyState
                title={t('home.emptyTitle')}
                body={t('home.emptyBody')}
                pose="search"
                action={
                  <Button href="/search" icon={<SearchIcon size={18} />}>
                    {t('common.search')}
                  </Button>
                }
              />
            </section>
          ) : null}

          <ProductRow
            title={t('home.nearYou')}
            products={nearby}
            href={`/results?city=${encodeURIComponent(city)}&sort=distance`}
            onQuickView={setQuickView}
          />
        </>
      )}

      <QuickView product={quickView} onClose={() => setQuickView(null)} />
    </div>
  );
}
