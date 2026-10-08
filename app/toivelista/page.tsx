'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { productById } from '@/data/products';
import { marketById, markets } from '@/data/markets';
import { applyFilters, emptyFilters, filtersToQuery } from '@/lib/filters';
import { useApp } from '@/lib/state';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Segmented } from '@/components/ui/Segmented';
import { ProductCard } from '@/components/ProductCard';
import { MarketCard } from '@/components/MarketHeader';
import { Button, IconButton } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Chip';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { CloseIcon, SearchIcon, BellIcon, ShareIcon } from '@/components/ui/Icons';

type Segment = 'tuotteet' | 'hakuvahdit' | 'seuratut';

/** Alerts that already reported a match in this session. */
const notified = new Set<string>();

export default function ToivelistaPage() {
  return (
    <Suspense fallback={null}>
      <ToivelistaContent />
    </Suspense>
  );
}

function ToivelistaContent() {
  const params = useSearchParams();
  const {
    ready,
    wishlist,
    savedSearches,
    removeSavedSearch,
    followedMarkets,
    pushToast,
  } = useApp();
  const [segment, setSegment] = useState<Segment>('tuotteet');
  /**
   * The skeleton stands in only until the stored state is actually in hand,
   * which is the frame after mount. There was a timer here; the data is local
   * and synchronous, so the wait was pure latency pretending to be loading.
   */
  const loading = !ready;
  const [failed, setFailed] = useState(params.get('demo') === 'error');


  // Mocked push: a new alert reports its match once, not on every visit.
  useEffect(() => {
    if (!ready || !savedSearches.length) return;
    const newest = savedSearches[0];
    if (notified.has(newest.id)) return;
    const timer = window.setTimeout(() => {
      notified.add(newest.id);
      pushToast({ title: `Uusi osuma hakuvahdille "${newest.label}"`, href: '/toivelista' });
    }, 2500);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedSearches.length, ready]);

  const saved = wishlist.map((id) => productById(id)).filter(Boolean);
  const followedMarketList = markets.filter((market) => followedMarkets.includes(market.id));

  const counts = useMemo(
    () =>
      Object.fromEntries(
        savedSearches.map((search) => [
          search.id,
          applyFilters({ ...emptyFilters, ...search.filters, query: search.query }).length,
        ]),
      ),
    [savedSearches],
  );

  if (failed) {
    return (
      <div>
        <ScreenHeader title="Toivelista" />
        <ErrorState
          onRetry={() => {
            setFailed(false);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader title="Toivelista" largeTitleBelow transparent />
      <div className="px-4 pb-1 pt-1">
        <h1 className="t-large-title" data-screen-title>Toivelista</h1>
      </div>

      <div className="px-4 pt-2">
        <Segmented
          ariaLabel="Toivelistan näkymä"
          value={segment}
          onChange={setSegment}
          options={[
            { value: 'tuotteet', label: `Tuotteet (${saved.length})` },
            { value: 'hakuvahdit', label: `Vahdit (${savedSearches.length})` },
            { value: 'seuratut', label: `Seuratut (${followedMarketList.length})` },
          ]}
        />
      </div>

      {loading ? (
        <div className="mt-4 grid grid-cols-2 gap-3 px-4">
          {[0, 1, 2, 3].map((key) => (
            <ProductCardSkeleton key={key} wide />
          ))}
        </div>
      ) : segment === 'tuotteet' ? (
        saved.length === 0 ? (
          <EmptyState
            pose="henkari"
            title="Ei vielä tallennettuja"
            body="Tallenna löytöjä sydämestä, niin ne odottavat sinua täällä."
            action={
              <Button href="/selaa" icon={<SearchIcon size={18} />}>
                Selaa tuotteita
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex justify-end px-4 pt-3">
              <Button
                size="sm"
                variant="bordered"
                icon={<ShareIcon size={16} />}
                onClick={() => pushToast({ title: 'Kokoelman linkki kopioitu' })}
              >
                Jaa kokoelma
              </Button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3 px-4">
              {saved.map((product, index) =>
                product ? (
                  <ProductCard key={product.id} product={product} index={index} fullWidth />
                ) : null,
              )}
            </div>
          </>
        )
      ) : segment === 'hakuvahdit' ? (
        savedSearches.length === 0 ? (
          <EmptyState
            title="Ei hakuvahteja"
            body="Ilmoitamme kun etsimäsi tuote tulee myyntiin."
            action={
              <Button href="/haku" icon={<BellIcon size={18} />}>
                Tee haku ja tallenna se
              </Button>
            }
          />
        ) : (
          <div className="mt-3">
            {savedSearches.map((search, index) => (
              <motion.article
                key={search.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.3) }}
                className="border-b border-separator px-4 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/haku?${filtersToQuery({ ...emptyFilters, ...search.filters, query: search.query })}`}
                    className="min-w-0 flex-1"
                  >
                    <span className="t-headline block truncate">{search.label}</span>
                    <span className="mt-1 flex flex-wrap gap-1.5">
                      {search.newMatches > 0 ? (
                        <Tag tone="accent">{`${search.newMatches} uutta`}</Tag>
                      ) : null}
                      <Tag>{`${counts[search.id] ?? 0} osumaa`}</Tag>
                    </span>
                  </Link>
                  <IconButton ariaLabel="Poista hakuvahti" onClick={() => removeSavedSearch(search.id)}>
                    <CloseIcon size={18} />
                  </IconButton>
                </div>
              </motion.article>
            ))}
            <div className="px-4 py-5">
              <Button full variant="bordered" href="/haku" icon={<SearchIcon size={18} />}>
                Uusi hakuvahti
              </Button>
            </div>
          </div>
        )
      ) : followedMarketList.length === 0 ? (
        <EmptyState
          pose="tuoli"
          title="Et seuraa vielä yhtään kirpputoria"
          body="Seuraa kirpputoria, niin näet sen uutuudet ensimmäisenä."
          action={<Button href="/selaa">Selaa kirpputoreja</Button>}
        />
      ) : (
        <div className="mt-3">
          {followedMarketList.map((market, index) => (
            <MarketCard key={market.id} market={market} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
