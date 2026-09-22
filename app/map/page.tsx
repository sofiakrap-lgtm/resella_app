'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { markets as allMarkets, type Market } from '@/lib/mockData';
import { CITY_CENTERS, SCANDIC_OULU, distanceKm } from '@/lib/geo';
import { useApp, useNow } from '@/lib/state';
import { isOpenNow } from '@/lib/time';
import { MapView } from '@/components/map/MapView';
import { MarketCard } from '@/components/market/MarketCard';
import { Sheet } from '@/components/ui/Sheet';
import { Chip } from '@/components/ui/Chip';
import { Button, IconButton } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { LocationIcon, RouteIcon, SearchIcon, CloseIcon } from '@/components/ui/Icons';

export default function MapPage() {
  return (
    <Suspense fallback={<Skeleton className="h-full min-h-[560px] w-full rounded-none" />}>
      <MapContent />
    </Suspense>
  );
}

function MapContent() {
  const params = useSearchParams();
  const { t, city, locationEnabled, locationPromptSeen, set, pushToast } = useApp();
  const now = useNow();
  const listRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string | null>(city);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [route, setRoute] = useState<string[]>(params.get('route')?.split(',').filter(Boolean) ?? []);
  const [askLocation, setAskLocation] = useState(false);
  // Demo switch: append ?demo=error to show the error state.
  const [failed, setFailed] = useState(params.get('demo') === 'error');

  const origin = params.get('origin') === 'scandic'
    ? { ...SCANDIC_OULU, label: SCANDIC_OULU.name }
    : { ...(CITY_CENTERS[cityFilter ?? city] ?? CITY_CENTERS.Helsinki), label: cityFilter ?? city };

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  // Location permission is asked in context, after the map has shown its value.
  useEffect(() => {
    if (loading || locationEnabled || locationPromptSeen) return;
    const timer = window.setTimeout(() => setAskLocation(true), 1600);
    return () => window.clearTimeout(timer);
  }, [loading, locationEnabled, locationPromptSeen]);

  useEffect(() => {
    const routeParam = params.get('route');
    if (routeParam) {
      const ids = routeParam.split(',').filter(Boolean);
      setRoute(ids);
      const first = allMarkets.find((market) => market.id === ids[0]);
      if (first) setCityFilter(first.city);
    }
  }, [params]);

  const visibleMarkets = useMemo(() => {
    let list: Market[] = allMarkets;
    if (cityFilter) list = list.filter((market) => market.city === cityFilter);
    if (categoryFilter) list = list.filter((market) => market.tags.includes(categoryFilter));
    if (openNowOnly && now) list = list.filter((market) => isOpenNow(market, now));
    return [...list].sort((a, b) => distanceKm(origin, a) - distanceKm(origin, b));
  }, [cityFilter, categoryFilter, openNowOnly, now, origin]);

  const planRoute = () => {
    const stops = visibleMarkets
      .filter((market) => (now ? isOpenNow(market, now) : true))
      .slice(0, 3)
      .map((market) => market.id);
    setRoute(stops.length ? stops : visibleMarkets.slice(0, 3).map((market) => market.id));
    pushToast({ title: t('map.routeTitle'), body: t('map.routeHint') });
  };

  const onSelect = (marketId: string) => {
    setSelected(marketId);
    const node = listRef.current?.querySelector(`[data-market="${marketId}"]`);
    node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="relative flex flex-1 flex-col">
      {failed ? (
        <div className="flex flex-1 items-center">
          <ErrorState
            onRetry={() => {
              setFailed(false);
              setLoading(true);
            }}
          />
        </div>
      ) : loading ? (
        <Skeleton className="h-full min-h-[560px] w-full flex-1 rounded-none" />
      ) : (
        <MapView
          markets={visibleMarkets}
          selectedId={selected}
          onSelect={onSelect}
          origin={origin}
          route={route}
          cluster={!cityFilter}
          sheetInset={0.34}
          className="min-h-[560px] w-full flex-1"
        />
      )}

      {/* Floating controls on the navigation layer */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 px-3 pt-3">
        <div className="hide-scrollbar pointer-events-auto flex gap-2 overflow-x-auto pb-1">
          <Chip
            selected={Boolean(cityFilter)}
            onClick={() => setCityFilter(cityFilter ? null : city)}
            icon={<SearchIcon size={16} />}
            className={cityFilter ? 'shadow-card' : 'glass'}
          >
            {cityFilter ?? t('map.searchArea')}
          </Chip>
          <Chip
            selected={openNowOnly}
            onClick={() => setOpenNowOnly((current) => !current)}
            className={openNowOnly ? 'shadow-card' : 'glass'}
          >
            {t('map.openNow')}
          </Chip>
          {['Lastentarvikkeet', 'Astiat', 'Vaatteet', 'Vintage'].map((tag) => (
            <Chip
              key={tag}
              selected={categoryFilter === tag}
              onClick={() => setCategoryFilter(categoryFilter === tag ? null : tag)}
              className={categoryFilter === tag ? 'shadow-card' : 'glass'}
            >
              {tag}
            </Chip>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute right-3 top-[68px] z-30 flex flex-col gap-2">
        <IconButton
          ariaLabel={t('map.planRoute')}
          onClick={planRoute}
          className="glass pointer-events-auto"
        >
          <RouteIcon size={20} />
        </IconButton>
        {route.length ? (
          <IconButton
            ariaLabel={t('map.clearRoute')}
            onClick={() => setRoute([])}
            className="glass pointer-events-auto"
          >
            <CloseIcon size={20} />
          </IconButton>
        ) : null}
      </div>

      {/* Market list, synced with the pins */}
      <Sheet
        open
        onClose={() => undefined}
        dismissible={false}
        backdrop={false}
        zIndexClass="z-30"
        detents={[0.3, 0.6, 0.92]}
        initialDetentIndex={0}
        ariaLabel={t('map.title')}
        title={`${visibleMarkets.length} ${t('map.markets')}`}
      >
        <div ref={listRef} className="pb-[120px]">
          {route.length ? (
            <div className="border-b border-separator bg-accent-soft px-4 py-3">
              <p className="t-subhead font-semibold text-accent">{t('map.routeTitle')}</p>
              <p className="t-caption1 text-ink-secondary">{t('map.routeHint')}</p>
              <ol className="mt-2 space-y-1">
                {route.map((id, index) => {
                  const market = allMarkets.find((entry) => entry.id === id);
                  if (!market) return null;
                  return (
                    <li key={id} className="t-subhead flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent t-caption1 text-on-accent">
                        {index + 1}
                      </span>
                      {market.name}
                    </li>
                  );
                })}
              </ol>
              <Button className="mt-3" size="sm" variant="secondary" onClick={() => setRoute([])}>
                {t('map.clearRoute')}
              </Button>
            </div>
          ) : (
            <div className="px-4 py-3">
              <Button size="sm" variant="secondary" icon={<RouteIcon size={18} />} onClick={planRoute}>
                {t('map.planRoute')}
              </Button>
            </div>
          )}

          {visibleMarkets.length === 0 ? (
            <EmptyState
              title={t('results.emptyTitle')}
              body={t('results.relaxTitle')}
              action={
                <Button
                  onClick={() => {
                    setOpenNowOnly(false);
                    setCategoryFilter(null);
                  }}
                >
                  {t('search.clearFilters')}
                </Button>
              }
            />
          ) : (
            visibleMarkets.map((market, index) => (
              <div key={market.id} data-market={market.id}>
                <MarketCard
                  market={market}
                  index={index}
                  layout="row"
                  origin={origin}
                  selected={selected === market.id}
                  onSelect={() => setSelected(market.id)}
                />
              </div>
            ))
          )}
        </div>
      </Sheet>

      {/* Contextual location permission, shown only after the map has proven useful */}
      <Sheet
        open={askLocation}
        onClose={() => setAskLocation(false)}
        detents={[0.36]}
        title={t('map.locationTitle')}
      >
        <div className="px-4 pb-8 pt-2">
          <p className="t-subhead text-ink-secondary">{t('map.locationBody')}</p>
          <div className="mt-4 flex flex-col gap-2">
            <Button
              full
              icon={<LocationIcon size={18} />}
              onClick={() => {
                set('locationEnabled', true);
                set('locationPromptSeen', true);
                setAskLocation(false);
              }}
            >
              {t('map.locationAllow')}
            </Button>
            <Button
              full
              variant="plain"
              onClick={() => {
                set('locationPromptSeen', true);
                setAskLocation(false);
              }}
            >
              {t('map.locationLater')}
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
