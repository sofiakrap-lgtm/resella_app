'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/state';
import { emptyFilters, filterProducts, filtersToQuery, suggestionsFor, activeFilterCount, type Filters } from '@/lib/search';
import { trendingSearches } from '@/lib/mockData';
import { ScreenHeader, LargeTitle } from '@/components/ui/ScreenHeader';
import { SearchField } from '@/components/search/SearchField';
import { FilterSheet } from '@/components/search/FilterSheet';
import { Chip, Tag } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { FilterIcon, SearchIcon, SparkleIcon, ChevronRight, CloseIcon } from '@/components/ui/Icons';
import { Mascot } from '@/components/ui/Mascot';

export default function SearchPage() {
  const { t, city, recentSearches, addRecentSearch, clearRecentSearches, preferredSize } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    ...emptyFilters,
    city,
    sizes: preferredSize ? [preferredSize] : [],
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const suggestions = useMemo(() => suggestionsFor(query), [query]);
  const previewCount = useMemo(
    () => filterProducts({ ...filters, query }).length,
    [filters, query],
  );

  const submit = (value: string = query) => {
    const trimmed = value.trim();
    addRecentSearch(trimmed);
    router.push(`/results?${filtersToQuery({ ...filters, query: trimmed })}`);
  };

  return (
    <div>
      <ScreenHeader title={t('common.search')} largeTitleBelow transparent />
      <LargeTitle>{t('common.search')}</LargeTitle>

      <SearchField
        value={query}
        onChange={setQuery}
        onSubmit={() => submit()}
        autoFocus
        placeholder={t('home.searchPlaceholder')}
      />

      <div className="flex items-center gap-2 px-4">
        <Button variant="secondary" size="sm" onClick={() => setFiltersOpen(true)} icon={<FilterIcon size={18} />}>
          {t('common.filters')}
          {activeFilterCount(filters) ? ` (${activeFilterCount(filters)})` : ''}
        </Button>
        <Button size="sm" onClick={() => submit()} icon={<SearchIcon size={18} />}>
          {t('search.apply')}
        </Button>
      </div>

      {activeFilterCount(filters) ? (
        <div className="hide-scrollbar mt-3 flex gap-1.5 overflow-x-auto px-4">
          {filters.city ? <Tag tone="accent">{filters.city}</Tag> : null}
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
        </div>
      ) : null}

      <div className="mt-4 px-4">
        <Link
          href="/ai-search"
          className="flex min-h-11 items-center gap-3 rounded-[16px] border border-separator bg-surface px-4 py-3"
        >
          <Mascot pose="search" size={34} animate={false} />
          <span className="min-w-0 flex-1">
            <span className="t-subhead block font-semibold text-accent">{t('search.aiLink')}</span>
            <span className="t-caption1 block text-ink-secondary">{t('home.aiTeaserBody')}</span>
          </span>
          <SparkleIcon size={18} className="text-accent" />
        </Link>
      </div>

      {query && suggestions.length ? (
        <section className="mt-5">
          <h3 className="t-footnote px-4 text-ink-secondary">{t('search.suggestions')}</h3>
          <ul className="mt-1">
            {suggestions.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  onClick={() => {
                    setQuery(suggestion);
                    submit(suggestion);
                  }}
                  className="flex min-h-11 w-full items-center justify-between gap-2 border-b border-separator px-4 py-2 text-left"
                >
                  <span className="t-body truncate">{suggestion}</span>
                  <ChevronRight size={16} className="shrink-0 text-ink-tertiary" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!query && recentSearches.length ? (
        <section className="mt-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="t-headline">{t('search.recent')}</h3>
            <button type="button" onClick={clearRecentSearches} className="min-h-11 px-1 t-subhead text-accent">
              {t('search.clearRecent')}
            </button>
          </div>
          <ul className="mt-1">
            {recentSearches.map((recent) => (
              <li key={recent}>
                <button
                  type="button"
                  onClick={() => {
                    setQuery(recent);
                    submit(recent);
                  }}
                  className="flex min-h-11 w-full items-center gap-2 border-b border-separator px-4 py-2 text-left"
                >
                  <SearchIcon size={16} className="shrink-0 text-ink-secondary" />
                  <span className="t-body truncate">{recent}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!query ? (
        <section className="mt-6">
          <h3 className="t-headline px-4">{t('search.trending')}</h3>
          <div className="hide-scrollbar mt-2 flex flex-wrap gap-2 px-4">
            {trendingSearches.map((trend) => (
              <Chip
                key={trend}
                onClick={() => {
                  setQuery(trend);
                  submit(trend);
                }}
              >
                {trend}
              </Chip>
            ))}
          </div>
        </section>
      ) : null}

      {query && !suggestions.length ? (
        <div className="px-4 py-8 text-center">
          <p className="t-subhead text-ink-secondary">{t('ai.fallback')}</p>
          <Button className="mt-3" variant="secondary" size="sm" onClick={() => setQuery('')} icon={<CloseIcon size={16} />}>
            {t('search.clearRecent')}
          </Button>
        </div>
      ) : null}

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={{ ...filters, query }}
        onApply={(next) => setFilters({ ...next, query })}
        resultCount={previewCount}
      />
    </div>
  );
}
