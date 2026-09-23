'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/state';
import { categories } from '@/data/categories';
import { markets, cities } from '@/data/markets';
import { sellers } from '@/data/sellers';
import { products } from '@/data/products';
import { CITY_CENTERS, haversineKm } from '@/lib/format';
import { isOpenNow } from '@/lib/time';
import { useNow } from '@/lib/state';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Segmented } from '@/components/ui/Segmented';
import { Chip } from '@/components/ui/Chip';
import { MarketCard } from '@/components/MarketHeader';
import { SellerCard } from '@/components/SellerHeader';
import { StyleView } from '@/components/views/StyleView';
import { MarketMap } from '@/components/MarketMap';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { RowSkeleton } from '@/components/ui/Skeleton';
import { SearchIcon, MapIcon, GridIcon, FilterIcon, categoryIcons } from '@/components/ui/Icons';

type Segment = 'kategoriat' | 'kirpputorit' | 'myyjat' | 'tyyli';

export default function SelaaPage() {
  return (
    <Suspense fallback={null}>
      <SelaaContent />
    </Suspense>
  );
}

function SelaaContent() {
  const params = useSearchParams();
  const { city } = useApp();
  const now = useNow();
  const [segment, setSegment] = useState<Segment>(
    (params.get('nakyma') as Segment) ?? 'kategoriat',
  );
  const [marketView, setMarketView] = useState<'lista' | 'kartta'>('lista');
  const [cityFilter, setCityFilter] = useState<string | null>(city);
  const [openNow, setOpenNow] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(params.get('demo') === 'error');

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 380);
    return () => window.clearTimeout(timer);
  }, [segment]);

  const visibleMarkets = useMemo(() => {
    let list = markets;
    if (cityFilter) list = list.filter((market) => market.city === cityFilter);
    if (openNow && now) list = list.filter((market) => isOpenNow(market, now));
    const origin = CITY_CENTERS[cityFilter ?? city] ?? CITY_CENTERS.Helsinki;
    return [...list].sort((a, b) => haversineKm(origin, a) - haversineKm(origin, b));
  }, [cityFilter, openNow, now, city]);

  /** Shown on the filter button so the viewer knows the list is narrowed. */
  const marketFilterCount = (cityFilter ? 1 : 0) + (openNow ? 1 : 0);

  const activeSellers = useMemo(
    () =>
      [...sellers].sort((a, b) => {
        if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
        return b.followerCount - a.followerCount;
      }),
    [],
  );

  if (failed) {
    return (
      <div>
        <ScreenHeader title="Selaa" />
        <ErrorState
          onRetry={() => {
            setFailed(false);
            setLoading(true);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader title="Selaa" transparent />

      <div className="sticky top-[44px] z-20 glass px-4 pb-3 pt-2">
        <Link
          href="/haku"
          className="flex min-h-11 items-center gap-2 rounded-full bg-surface px-4 py-2.5 shadow-card"
        >
          <SearchIcon size={19} className="text-brown-70" />
          <span className="t-body truncate text-brown-70">Hae tai kysy, esim. villapaita koko M</span>
        </Link>
        <div className="mt-2">
          <Segmented
            ariaLabel="Selaustapa"
            value={segment}
            onChange={setSegment}
            options={[
              { value: 'kategoriat', label: 'Kategoriat' },
              { value: 'kirpputorit', label: 'Kirpputorit' },
              { value: 'myyjat', label: 'Myyjät' },
              { value: 'tyyli', label: 'Tyyli' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-2">
          {[0, 1, 2, 3].map((key) => (
            <RowSkeleton key={key} />
          ))}
        </div>
      ) : segment === 'kategoriat' ? (
        <section className="mt-4 grid grid-cols-2 gap-3 screen-x">
          {categories.map((category) => {
            const count = products.filter(
              (product) => product.category === category.slug && product.status !== 'Myyty',
            ).length;
            const Icon = categoryIcons[category.icon];
            return (
              <Link
                key={category.slug}
                href={`/selaa/kategoria/${category.slug}`}
                className="flex min-h-[112px] flex-col justify-between rounded-[16px] bg-surface p-4 shadow-card"
              >
                {Icon ? <Icon size={28} className="text-brown" /> : null}
                <span className="mt-3 block">
                  <span className="t-headline block">{category.name}</span>
                  <span className="t-subhead mt-0.5 block text-brown-70">{count} tuotetta</span>
                </span>
              </Link>
            );
          })}
        </section>
      ) : segment === 'kirpputorit' ? (
        <section className="mt-4">
          <div className="flex items-center gap-2 screen-x">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFiltersOpen(true)}
              icon={<FilterIcon size={18} />}
            >
              Suodata{marketFilterCount ? ` (${marketFilterCount})` : ''}
            </Button>
            <span className="t-subhead flex-1 truncate text-brown-70">
              {visibleMarkets.length} kirpputoria
            </span>
            <button
              type="button"
              onClick={() => setMarketView(marketView === 'lista' ? 'kartta' : 'lista')}
              aria-label={marketView === 'lista' ? 'Näytä kartalla' : 'Näytä listana'}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface shadow-card"
            >
              {marketView === 'lista' ? <MapIcon size={20} /> : <GridIcon size={20} />}
            </button>
          </div>

          {visibleMarkets.length === 0 ? (
            <EmptyState
              title="Ei kirpputoreja"
              body="Kokeile toista kaupunkia."
              action={
                <Button
                  onClick={() => {
                    setCityFilter(null);
                    setOpenNow(false);
                  }}
                >
                  Näytä kaikki kaupungit
                </Button>
              }
            />
          ) : marketView === 'kartta' ? (
            <div className="mt-3">
              <MarketMap
                markets={visibleMarkets}
                selectedId={selectedMarket}
                onSelect={setSelectedMarket}
                className="h-[320px] w-full"
              />
              <div className="mt-2">
                {visibleMarkets.map((market, index) => (
                  <MarketCard key={market.id} market={market} index={index} />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-3">
              {visibleMarkets.map((market, index) => (
                <MarketCard key={market.id} market={market} index={index} />
              ))}
            </div>
          )}
        </section>
      ) : segment === 'tyyli' ? (
        <StyleView />
      ) : (
        <section className="mt-4">
          <div className="grid grid-cols-2 gap-3 screen-x">
            {activeSellers.slice(0, 6).map((seller, index) => (
              <SellerCard key={seller.id} seller={seller} index={index} layout="grid" />
            ))}
          </div>
          <div className="mt-4">
            {activeSellers.slice(6).map((seller, index) => (
              <SellerCard key={seller.id} seller={seller} index={index} />
            ))}
          </div>
        </section>
      )}

      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Suodata kirpputorit"
        detents={[0.55]}
        ariaLabel="Kirpputorien suodattimet"
      >
        <div className="px-4 pb-8">
          <h3 className="t-headline">Kaupunki</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip selected={!cityFilter} onClick={() => setCityFilter(null)}>
              Kaikki
            </Chip>
            {cities.map((option) => (
              <Chip
                key={option}
                selected={cityFilter === option}
                onClick={() => setCityFilter(option)}
              >
                {option}
              </Chip>
            ))}
          </div>

          <h3 className="t-headline mt-6">Aukiolo</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip selected={openNow} onClick={() => setOpenNow((current) => !current)}>
              Avoinna nyt
            </Chip>
          </div>

          <div className="mt-8">
            <Button full size="lg" onClick={() => setFiltersOpen(false)}>
              {`Näytä ${visibleMarkets.length} kirpputoria`}
            </Button>
            {marketFilterCount ? (
              <button
                type="button"
                onClick={() => {
                  setCityFilter(null);
                  setOpenNow(false);
                }}
                className="t-subhead mt-2 min-h-11 w-full text-brown-70"
              >
                Tyhjennä suodattimet
              </button>
            ) : null}
          </div>
        </div>
      </Sheet>
    </div>
  );
}
