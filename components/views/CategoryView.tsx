'use client';

import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { categoryBySlug } from '@/data/categories';
import { products } from '@/data/products';
import { applyFilters, emptyFilters, activeFilterCount } from '@/lib/filters';
import type { CategorySlug, Filters } from '@/lib/types';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ProductCard } from '@/components/ProductCard';
import { FilterSheet } from '@/components/FilterSheet';
import { EmptyState } from '@/components/ui/StateViews';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Chip';
import { FilterIcon } from '@/components/ui/Icons';

const PAGE = 12;

/**
 * The clothes first. Opening a category is a request to see what is in it,
 * not to answer three questions about it, so the subcategory, size and brand
 * lists live behind the filter button rather than above the grid.
 */
export function CategoryView() {
  const params = useParams<{ slug: string }>();
  const category = categoryBySlug(params.slug);

  const [filters, setFilters] = useState<Filters>({
    ...emptyFilters,
    categories: [params.slug as CategorySlug],
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE);

  const all = useMemo(
    () => products.filter((product) => product.category === params.slug),
    [params.slug],
  );
  const items = useMemo(() => applyFilters(filters, all), [filters, all]);

  if (!category) {
    return (
      <div>
        <ScreenHeader title="Kategoria" back />
        <EmptyState
          title="Kategoriaa ei löytynyt"
          action={<Button href="/selaa">Takaisin selaamaan</Button>}
        />
      </div>
    );
  }

  /** The category itself is not a filter the viewer chose, so it is not counted. */
  const narrowed = activeFilterCount(filters) - 1;

  return (
    <div>
      <ScreenHeader title={category.name} back largeTitleBelow transparent />

      <div className="pt-3 screen-x">
        <h1 className="t-large-title" data-screen-title>
          {category.name}
        </h1>
      </div>

      <div className="mt-3 flex items-center gap-3 screen-x">
        <Button
          variant="bordered"
          size="sm"
          onClick={() => setFiltersOpen(true)}
          icon={<FilterIcon size={18} />}
        >
          Suodata{narrowed > 0 ? ` (${narrowed})` : ''}
        </Button>
        <span className="t-subhead truncate text-brown-70">{items.length} tuotetta</span>
      </div>

      {narrowed > 0 ? (
        <div className="hide-scrollbar mt-2 flex gap-1.5 overflow-x-auto pb-1 screen-x">
          {[...filters.subcategories, ...filters.sizes, ...filters.brands, ...filters.colors].map(
            (value) => (
              <Tag key={value} tone="accent">
                {value}
              </Tag>
            ),
          )}
        </div>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          title="Ei osumia"
          body="Väljennä suodattimia, niin näet enemmän."
          action={
            <Button
              onClick={() =>
                setFilters({ ...emptyFilters, categories: [params.slug as CategorySlug] })
              }
            >
              Tyhjennä suodattimet
            </Button>
          }
        />
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3 screen-x">
            {items.slice(0, visible).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} fullWidth />
            ))}
          </div>
          {items.length > visible ? (
            <div className="pt-6 screen-x">
              <Button full variant="bordered" onClick={() => setVisible((n) => n + PAGE)}>
                Näytä lisää
              </Button>
            </div>
          ) : null}
        </>
      )}

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        resultCount={items.length}
        onApply={(next) => {
          setFilters(next);
          setVisible(PAGE);
        }}
      />
    </div>
  );
}
