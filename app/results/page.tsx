'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/state';
import {
  filterProducts,
  filtersToQuery,
  queryToFilters,
  activeFilterCount,
  type Filters,
  type SortKey,
} from '@/lib/search';
import { marketById, markets, type Product } from '@/lib/mockData';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Segmented } from '@/components/ui/Segmented';
import { Sheet } from '@/components/ui/Sheet';
import { Button, IconButton } from '@/components/ui/Button';
import { Chip, Tag } from '@/components/ui/Chip';
import { RowSkeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { ProductCard } from '@/components/product/ProductCard';
import { QuickView } from '@/components/product/QuickView';
import { MapView } from '@/components/map/MapView';
import { FilterSheet } from '@/components/search/FilterSheet';
import { FilterIcon, SortIcon, CheckIcon, BellIcon } from '@/components/ui/Icons';

const PAGE_SIZE = 8;

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <ResultsContent />
    </Suspense>
  );
}

function ResultsSkeleton() {
  return (
    <div className="pt-12">
      {[0, 1, 2, 3, 4].map((key) => (
        <RowSkeleton key={key} />
      ))}
    </div>
  );
}

function ResultsContent() {
  const { t, city, addSavedSearch, pushToast } = useApp();
  const router = useRouter();
  const params = useSearchParams();

  const parsed = useMemo(() => queryToFilters(new URLSearchParams(params.toString())), [params]);
  const [filters, setFilters] = useState<Filters>({ ...parsed.filters, city: parsed.filters.city ?? city });
  const [sort, setSort] = useState<SortKey>(parsed.sort);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  // Demo switch: append ?demo=error to any data screen to show the error state.
  const [failed, setFailed] = useState(params.get('demo') === 'error');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);

  useEffect(() => {
    setFilters({ ...parsed.filters, city: parsed.filters.city ?? city });
    setSort(parsed.sort);
    setVisible(PAGE_SIZE);
  }, [parsed, city]);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 420);
    return () => window.clearTimeout(timer);
  }, [filters, sort]);

  const results = useMemo(() => filterProducts(filters, sort), [filters, sort]);
  const resultMarkets = useMemo(
    () => markets.filter((market) => results.some((product) => product.marketId === market.id)),
    [results],
  );
  const selectedProducts = useMemo(
    () => results.filter((product) => product.marketId === selectedMarket),
    [results, selectedMarket],
  );

  const applyFilters = (next: Filters) => {
    setFilters(next);
    router.replace(`/results?${filtersToQuery(next, sort)}`);
  };

  const saveSearch = () => {
    const label = filters.query || t('results.title');
    addSavedSearch(label, filters);
    pushToast({ title: t('results.saveSearch'), body: label, href: '/saved' });
  };

  const sortOptions: Array<{ value: SortKey; label: string }> = [
    { value: 'relevance', label: t('results.sortRelevance') },
    { value: 'price', label: t('results.sortPrice') },
    { value: 'distance', label: t('results.sortDistance') },
    { value: 'newest', label: t('results.sortNewest') },
  ];

  return (
    <div>
      <ScreenHeader
        title={filters.query || t('results.title')}
        back
        right={
          <>
            <IconButton ariaLabel={t('results.sort')} onClick={() => setSortOpen(true)}>
              <SortIcon size={20} />
            </IconButton>
            <IconButton ariaLabel={t('common.filters')} onClick={() => setFiltersOpen(true)}>
              <FilterIcon size={20} />
            </IconButton>
          </>
        }
      />

      <div className="px-4 pt-3">
        <Segmented
          ariaLabel={t('results.title')}
          value={view}
          onChange={setView}
          options={[
            { value: 'list', label: t('results.list') },
            { value: 'map', label: t('results.map') },
          ]}
        />
      </div>

      <div className="flex items-center justify-between gap-2 px-4 pt-3">
        <p className="t-footnote text-ink-secondary">
          {loading ? t('common.loading') : `${results.length} ${t('results.count')}`}
        </p>
        <button
          type="button"
          onClick={() => setSortOpen(true)}
          className="inline-flex min-h-11 items-center gap-1 t-footnote text-accent"
        >
          <SortIcon size={15} />
          {sortOptions.find((option) => option.value === sort)?.label}
        </button>
      </div>

      {activeFilterCount(filters) ? (
        <div className="hide-scrollbar mt-1 flex gap-1.5 overflow-x-auto px-4 pb-1">
          {filters.city ? <Tag tone="accent">{filters.city}</Tag> : null}
          {filters.marketId ? <Tag tone="accent">{marketById(filters.marketId)?.name}</Tag> : null}
          {filters.sizes.map((size) => (
            <Tag key={size} tone="accent">{`${t('product.size')} ${size}`}</Tag>
          ))}
          {filters.categories.map((category) => (
            <Tag key={category} tone="accent">
              {category}
            </Tag>
          ))}
          {filters.conditions.map((condition) => (
            <Tag key={condition} tone="accent">
              {condition}
            </Tag>
          ))}
          {filters.maxPrice !== null ? <Tag tone="accent">{`${t('search.maxPrice')} ${filters.maxPrice} €`}</Tag> : null}
          {filters.maxDistanceKm !== null ? (
            <Tag tone="accent">{`${t('search.maxDistance')} ${filters.maxDistanceKm} km`}</Tag>
          ) : null}
        </div>
      ) : null}

      {failed ? (
        <ErrorState
          onRetry={() => {
            setFailed(false);
            setLoading(true);
          }}
        />
      ) : view === 'map' ? (
        <div className="mt-3">
          <MapView
            markets={resultMarkets}
            selectedId={selectedMarket}
            onSelect={setSelectedMarket}
            className="h-[460px] w-full"
          />
          <p className="t-caption1 px-4 py-3 text-center text-ink-secondary">
            {resultMarkets.length} {t('map.markets')}
          </p>
        </div>
      ) : loading ? (
        <div className="mt-2">
          {[0, 1, 2, 3, 4].map((key) => (
            <RowSkeleton key={key} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          title={t('results.emptyTitle')}
          body={t('results.emptyBody')}
          action={
            <div className="flex flex-col items-center gap-3">
              <Button onClick={saveSearch} icon={<BellIcon size={18} />}>
                {t('results.saveSearch')}
              </Button>
              <div>
                <p className="t-footnote mb-2 text-ink-secondary">{t('results.relaxTitle')}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Chip onClick={() => applyFilters({ ...filters, maxDistanceKm: null })}>
                    {t('results.relaxDistance')}
                  </Chip>
                  <Chip onClick={() => applyFilters({ ...filters, maxPrice: null })}>
                    {t('results.relaxPrice')}
                  </Chip>
                  <Chip onClick={() => applyFilters({ ...filters, conditions: [] })}>
                    {t('results.relaxCondition')}
                  </Chip>
                </div>
              </div>
            </div>
          }
        />
      ) : (
        <>
          <p className="t-caption1 px-4 pb-1 pt-2 text-ink-secondary">{t('results.quickViewHint')}</p>
          <div>
            {results.slice(0, visible).map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                layout="row"
                index={index}
                onQuickView={setQuickView}
              />
            ))}
          </div>
          {visible < results.length ? (
            <div className="px-4 py-5">
              <Button full variant="secondary" onClick={() => setVisible((current) => current + PAGE_SIZE)}>
                {t('common.showMore')}
              </Button>
            </div>
          ) : (
            <div className="px-4 py-5">
              <Button full variant="secondary" onClick={saveSearch} icon={<BellIcon size={18} />}>
                {t('results.saveSearch')}
              </Button>
            </div>
          )}
        </>
      )}

      <Sheet open={sortOpen} onClose={() => setSortOpen(false)} title={t('results.sort')} detents={[0.42]}>
        <ul className="pb-6">
          {sortOptions.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => {
                  setSort(option.value);
                  setSortOpen(false);
                }}
                className="flex min-h-11 w-full items-center justify-between border-b border-separator px-4 py-3 text-left"
              >
                <span className="t-body">{option.label}</span>
                {sort === option.value ? <CheckIcon size={20} className="text-accent" /> : null}
              </button>
            </li>
          ))}
        </ul>
      </Sheet>

      <Sheet
        open={Boolean(selectedMarket)}
        onClose={() => setSelectedMarket(null)}
        title={selectedMarket ? marketById(selectedMarket)?.name : undefined}
        detents={[0.45, 0.85]}
        initialDetentIndex={0}
      >
        <div className="pb-8">
          {selectedProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} layout="row" index={index} />
          ))}
          {selectedMarket ? (
            <div className="px-4 pt-4">
              <Button full variant="secondary" href={`/market/${selectedMarket}`}>
                {t('product.toMarket')}
              </Button>
            </div>
          ) : null}
        </div>
      </Sheet>

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={applyFilters}
        resultCount={results.length}
      />

      <QuickView product={quickView} onClose={() => setQuickView(null)} />
    </div>
  );
}
