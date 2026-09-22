'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { categoryBySlug } from '@/data/categories';
import { products } from '@/data/products';
import { filtersToQuery, emptyFilters } from '@/lib/filters';
import type { CategorySlug } from '@/lib/types';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState } from '@/components/ui/StateViews';
import { Button } from '@/components/ui/Button';
import { ChevronRight } from '@/components/ui/Icons';

/** Subcategories, sizes and brands first, then the items themselves. */
export function CategoryView() {
  const params = useParams<{ slug: string }>();
  const category = categoryBySlug(params.slug);

  const items = useMemo(
    () =>
      products.filter(
        (product) => product.category === params.slug && product.status !== 'Myyty',
      ),
    [params.slug],
  );

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

  const link = (extra: Partial<typeof emptyFilters>) =>
    `/haku?${filtersToQuery({
      ...emptyFilters,
      categories: [category.slug as CategorySlug],
      ...extra,
    })}`;

  return (
    <div>
      <ScreenHeader title={category.name} back />

      <div className="px-4 pt-3">
        <h1 className="t-large-title">{category.name}</h1>
        <p className="t-subhead mt-1 text-brown-70">{category.blurb}</p>
      </div>

      <section className="mt-4">
        <h2 className="t-headline px-4">Alakategoriat</h2>
        <ul className="mt-1">
          {category.subcategories.map((sub) => {
            const count = items.filter((product) => product.subcategory === sub.slug).length;
            return (
              <li key={sub.slug}>
                <Link
                  href={link({ query: sub.name.split(' ')[0].toLowerCase() })}
                  className="flex min-h-11 items-center justify-between gap-3 border-b border-separator px-4 py-3"
                >
                  <span className="t-body">{sub.name}</span>
                  <span className="inline-flex items-center gap-2">
                    <span className="t-footnote text-brown-70">{count}</span>
                    <ChevronRight size={16} className="text-brown-50" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {category.sizes.length ? (
        <section className="mt-5">
          <h2 className="t-headline px-4">Koot</h2>
          <div className="hide-scrollbar mt-2 flex gap-2 overflow-x-auto px-4">
            {category.sizes.map((size) => (
              <Link
                key={size}
                href={link({ sizes: [size] })}
                className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-separator bg-cream px-4 t-subhead"
              >
                {size}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-5">
        <h2 className="t-headline px-4">Merkit</h2>
        <div className="hide-scrollbar mt-2 flex gap-2 overflow-x-auto px-4">
          {category.brands.map((brand) => (
            <Link
              key={brand}
              href={link({ brands: [brand] })}
              className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-separator bg-cream px-4 t-subhead"
            >
              {brand}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-baseline justify-between px-4">
          <h2 className="t-title3">Kaikki tuotteet</h2>
          <Link href={link({})} className="t-subhead inline-flex min-h-11 items-center text-terracotta-ink">
            Suodata
          </Link>
        </div>
        {items.length === 0 ? (
          <EmptyState title="Ei vielä tuotteita tässä kategoriassa." pose="empty" />
        ) : (
          <div className="mt-2 grid grid-cols-2 gap-3 px-4">
            {items.slice(0, 12).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} fullWidth />
            ))}
          </div>
        )}
        {items.length > 12 ? (
          <div className="px-4 pt-4">
            <Button full variant="secondary" href={link({})}>
              Näytä kaikki {items.length} tuotetta
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
