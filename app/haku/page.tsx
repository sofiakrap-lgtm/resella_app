'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/state';
import type { Filters } from '@/lib/types';
import { applyFilters, activeFilterCount, emptyFilters, filtersToQuery, queryToFilters, PRICE_MAX } from '@/lib/filters';
import { exampleSearches } from '@/data/exampleSearches';
import { categories } from '@/data/categories';
import { markets } from '@/data/markets';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ProductCard } from '@/components/ProductCard';
import { FilterSheet } from '@/components/FilterSheet';
import { Chip, Tag } from '@/components/ui/Chip';
import { Button, IconButton } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { RowSkeleton } from '@/components/ui/Skeleton';
import {
  SearchIcon,
  CloseIcon,
  FilterIcon,
  SparkleIcon,
  BookmarkIcon,
} from '@/components/ui/Icons';

const PAGE_SIZE = 8;

export default function HakuPage() {
  return (
    <Suspense fallback={null}>
      <HakuContent />
    </Suspense>
  );
}

function HakuContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { recentSearches, addRecentSearch, addSavedSearch, pushToast } = useApp();

  const parsed = useMemo(() => queryToFilters(new URLSearchParams(params.toString())), [params]);
  const [filters, setFilters] = useState<Filters>(parsed);
  const [input, setInput] = useState(parsed.query);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [failed, setFailed] = useState(params.get('demo') === 'error');

  useEffect(() => {
    setFilters(parsed);
    setInput(parsed.query);
    setVisible(PAGE_SIZE);
  }, [parsed]);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 360);
    return () => window.clearTimeout(timer);
  }, [filters]);

  const results = useMemo(() => applyFilters(filters), [filters]);
  const hasSearch = Boolean(filters.query) || activeFilterCount(filters) > 0;

  const run = (next: Filters, exampleNote?: string) => {
    setNote(exampleNote ?? null);
    addRecentSearch(next.query);
    router.replace(`/haku?${filtersToQuery(next)}`);
    setFilters(next);
  };

  const clearFilter = (patch: Partial<Filters>) => run({ ...filters, ...patch });

  if (failed) {
    return (
      <div>
        <ScreenHeader title="Haku" back />
        <ErrorState onRetry={() => setFailed(false)} />
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader
        title="Haku"
        back
        right={
          hasSearch ? (
            <IconButton
              ariaLabel="Tallenna haku"
              onClick={() => {
                addSavedSearch(filters.query || 'Tallennettu haku', filters.query, filters);
                pushToast({ title: 'Hakuvahti tallennettu', body: 'Ilmoitamme kun sopiva tulee myyntiin.', href: '/toivelista' });
              }}
            >
              <BookmarkIcon size={20} />
            </IconButton>
          ) : null
        }
      />

      <form
        className="flex items-center gap-2 px-4 py-2"
        onSubmit={(event) => {
          event.preventDefault();
          run({ ...filters, query: input });
        }}
        role="search"
      >
        <span className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-[12px] bg-cream-sink px-3">
          <SearchIcon size={18} className="shrink-0 text-brown-70" />
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Hae tai kysy, esim. villapaita koko M"
            aria-label="Hae"
            enterKeyHint="search"
            className="t-body min-w-0 flex-1 bg-transparent py-2 outline-none placeholder:text-brown-70"
          />
          {input ? (
            <button
              type="button"
              onClick={() => setInput('')}
              aria-label="Tyhjennä haku"
              className="-mr-1 flex h-11 w-11 shrink-0 items-center justify-center text-brown-70"
            >
              <CloseIcon size={16} />
            </button>
          ) : null}
        </span>
        <Button type="submit" size="sm" ariaLabel="Hae" className="shrink-0">
          Hae
        </Button>
      </form>

      <div className="flex items-center gap-2 px-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setFiltersOpen(true)}
          icon={<FilterIcon size={18} />}
        >
          Suodata{activeFilterCount(filters) ? ` (${activeFilterCount(filters)})` : ''}
        </Button>
        <span className="t-footnote text-brown-70">{results.length} tulosta</span>
      </div>

      {activeFilterCount(filters) ? (
        <div className="hide-scrollbar mt-2 flex gap-1.5 overflow-x-auto px-4 pb-1">
          {filters.categories.map((slug) => (
            <RemovableTag
              key={slug}
              label={categories.find((category) => category.slug === slug)?.name ?? slug}
              onRemove={() =>
                clearFilter({ categories: filters.categories.filter((item) => item !== slug) })
              }
            />
          ))}
          {filters.sizes.map((size) => (
            <RemovableTag
              key={size}
              label={`Koko ${size}`}
              onRemove={() => clearFilter({ sizes: filters.sizes.filter((item) => item !== size) })}
            />
          ))}
          {filters.colors.map((color) => (
            <RemovableTag
              key={color}
              label={color}
              onRemove={() => clearFilter({ colors: filters.colors.filter((item) => item !== color) })}
            />
          ))}
          {filters.brands.map((brand) => (
            <RemovableTag
              key={brand}
              label={brand}
              onRemove={() => clearFilter({ brands: filters.brands.filter((item) => item !== brand) })}
            />
          ))}
          {filters.conditions.map((condition) => (
            <RemovableTag
              key={condition}
              label={condition}
              onRemove={() =>
                clearFilter({ conditions: filters.conditions.filter((item) => item !== condition) })
              }
            />
          ))}
          {filters.cities.map((city) => (
            <RemovableTag
              key={city}
              label={city}
              onRemove={() => clearFilter({ cities: filters.cities.filter((item) => item !== city) })}
            />
          ))}
          {filters.marketIds.map((id) => (
            <RemovableTag
              key={id}
              label={markets.find((market) => market.id === id)?.name ?? id}
              onRemove={() => clearFilter({ marketIds: filters.marketIds.filter((item) => item !== id) })}
            />
          ))}
          {filters.maxPrice < PRICE_MAX ? (
            <RemovableTag
              label={`Enintään ${filters.maxPrice} €`}
              onRemove={() => clearFilter({ maxPrice: PRICE_MAX })}
            />
          ) : null}
        </div>
      ) : null}

      {note ? (
        <p className="t-footnote mx-4 mt-3 rounded-[14px] bg-cream-panel px-3 py-2 text-terracotta-ink">
          {note}
        </p>
      ) : null}

      {!hasSearch ? (
        <>
          <section className="section">
            <div className="flex flex-wrap gap-2 screen-x">
              {exampleSearches.map((example) => (
                <Chip
                  key={example.label}
                  onClick={() => {
                    setInput(example.filters.query);
                    run(example.filters, example.note);
                  }}
                  icon={example.isAi ? <SparkleIcon size={16} className="text-terracotta-ink" /> : undefined}
                >
                  {example.label}
                </Chip>
              ))}
            </div>
          </section>

          {recentSearches.length ? (
            <section className="section">
              <h2 className="t-headline screen-x">Viimeksi haetut</h2>
              <ul className="mt-1">
                {recentSearches.map((recent) => (
                  <li key={recent}>
                    <button
                      type="button"
                      onClick={() => {
                        setInput(recent);
                        run({ ...emptyFilters, query: recent });
                      }}
                      className="flex min-h-11 w-full items-center gap-2 border-b border-separator px-4 py-2 text-left"
                    >
                      <SearchIcon size={16} className="shrink-0 text-brown-70" />
                      <span className="t-body truncate">{recent}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : loading ? (
        <div className="mt-2">
          {[0, 1, 2, 3].map((key) => (
            <RowSkeleton key={key} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          title={filters.query ? `Ei osumia haulle "${filters.query}"` : 'Ei osumia'}
          body="Tallenna haku, niin ilmoitamme kun tällainen tulee myyntiin."
          action={
            <div className="flex flex-col items-center gap-3">
              <Button
                onClick={() => {
                  addSavedSearch(filters.query || 'Tallennettu haku', filters.query, filters);
                  pushToast({ title: 'Hakuvahti tallennettu', href: '/toivelista' });
                }}
                icon={<BookmarkIcon size={18} />}
              >
                Tallenna hakuvahti
              </Button>
              <Button variant="secondary" size="sm" onClick={() => run({ ...emptyFilters, query: filters.query })}>
                Tyhjennä suodattimet
              </Button>
            </div>
          }
        />
      ) : (
        <>
          <div className="mt-2 grid grid-cols-2 gap-3 px-4">
            {results.slice(0, visible).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} fullWidth />
            ))}
          </div>
          {visible < results.length ? (
            <div className="px-4 py-5">
              <Button full variant="secondary" onClick={() => setVisible((current) => current + PAGE_SIZE)}>
                Näytä lisää
              </Button>
            </div>
          ) : (
            <p className="t-footnote px-4 py-5 text-center text-brown-70">
              Kaikki {results.length} tulosta näytetty.
            </p>
          )}
        </>
      )}

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={(next) => run(next)}
        resultCount={results.length}
      />
    </div>
  );
}

function RemovableTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Poista suodatin ${label}`}
      className="inline-flex min-h-11 shrink-0 items-center"
    >
      <Tag tone="accent" icon={<CloseIcon size={12} />}>
        {label}
      </Tag>
    </button>
  );
}
