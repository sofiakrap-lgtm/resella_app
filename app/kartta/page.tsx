'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { markets, cities } from '@/data/markets';
import { CITY_CENTERS, haversineKm } from '@/lib/format';
import { isOpenNow } from '@/lib/time';
import { useApp, useNow } from '@/lib/state';
import { MarketMap } from '@/components/MarketMap';
import { MarketCard, OpenStatus } from '@/components/MarketHeader';
import { Sheet } from '@/components/ui/Sheet';
import { Chip } from '@/components/ui/Chip';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { Button } from '@/components/ui/Button';

export default function KarttaPage() {
  return (
    <Suspense fallback={<Skeleton className="h-full min-h-[560px] w-full rounded-none" />}>
      <KarttaContent />
    </Suspense>
  );
}

function KarttaContent() {
  const params = useSearchParams();
  const { city } = useApp();
  const now = useNow();
  const listRef = useRef<HTMLDivElement | null>(null);
  const [cityFilter, setCityFilter] = useState<string | null>(city);
  const [openNow, setOpenNow] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(params.get('demo') === 'error');

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 420);
    return () => window.clearTimeout(timer);
  }, []);

  const visible = useMemo(() => {
    let list = markets;
    if (cityFilter) list = list.filter((market) => market.city === cityFilter);
    if (openNow && now) list = list.filter((market) => isOpenNow(market, now));
    const origin = CITY_CENTERS[cityFilter ?? city] ?? CITY_CENTERS.Helsinki;
    return [...list].sort((a, b) => haversineKm(origin, a) - haversineKm(origin, b));
  }, [cityFilter, openNow, now, city]);

  const selectedMarket = visible.find((market) => market.id === selected) ?? null;

  const select = (marketId: string) => {
    setSelected(marketId);
    listRef.current?.querySelector(`[data-market="${marketId}"]`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
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
        <MarketMap
          markets={visible}
          selectedId={selected}
          onSelect={select}
          sheetInset={0.34}
          className="min-h-[560px] w-full flex-1"
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 px-3 pt-3">
        <div className="hide-scrollbar pointer-events-auto flex gap-2 overflow-x-auto pb-1">
          <Chip
            selected={!cityFilter}
            onClick={() => setCityFilter(null)}
            className={!cityFilter ? 'shadow-card' : 'glass'}
          >
            Koko Suomi
          </Chip>
          {cities.map((option) => (
            <Chip
              key={option}
              selected={cityFilter === option}
              onClick={() => setCityFilter(option)}
              className={cityFilter === option ? 'shadow-card' : 'glass'}
            >
              {option}
            </Chip>
          ))}
          <Chip
            selected={openNow}
            onClick={() => setOpenNow((current) => !current)}
            className={openNow ? 'shadow-card' : 'glass'}
          >
            Avoinna nyt
          </Chip>
        </div>
      </div>

      <Sheet
        open
        onClose={() => undefined}
        dismissible={false}
        backdrop={false}
        zIndexClass="z-30"
        detents={[0.3, 0.6, 0.92]}
        initialDetentIndex={0}
        ariaLabel="Kirpputorit kartalla"
        title={`${visible.length} kirpputoria`}
      >
        <div ref={listRef} className="pb-[120px]">
          {selectedMarket ? (
            <div className="border-b border-separator px-4 pb-4">
              <div className="rounded-[16px] bg-cream-panel p-4 shadow-card">
                <p className="t-headline truncate">{selectedMarket.name}</p>
                <p className="t-subhead mt-0.5 truncate text-brown-70">
                  {selectedMarket.address}, {selectedMarket.city}
                </p>
                <OpenStatus market={selectedMarket} className="mt-1" />
                <div className="mt-4 flex items-center gap-3">
                  <Button href={`/kirpputori/${selectedMarket.id}`}>Katso kirpputori</Button>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="t-subhead min-h-11 px-2 text-brown-70"
                  >
                    Sulje
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {visible.length === 0 ? (
            <EmptyState
              title="Ei kirpputoreja"
              body="Kokeile toista kaupunkia."
              action={
                <Button
                  onClick={() => {
                    setOpenNow(false);
                    setCityFilter(null);
                  }}
                >
                  Tyhjennä rajaukset
                </Button>
              }
            />
          ) : (
            visible.map((market, index) => (
              <div
                key={market.id}
                data-market={market.id}
                className={selected === market.id ? 'bg-cream-panel transition-colors' : 'transition-colors'}
              >
                <MarketCard market={market} index={index} />
              </div>
            ))
          )}
        </div>
      </Sheet>
    </div>
  );
}
