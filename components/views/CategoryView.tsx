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

      <div className="pt-3 screen-x">
        <h1 className="t-large-title">{category.name}</h1>
        <p className="t-subhead mt-1 text-brown-70">{category.blurb}</p>
      </div>

      <section className="mt-4">
        <h2 className="t-headline screen-x">Alakategoriat</h2>
        <ul className="mt-1">
          {category.subcategories.map((sub) => {
            const count = items.filter((product) => product.subcategory === sub.slug).length;
            return (
              <li key={sub.slug}>
                <Link
                  href={link({ query: sub.name.split(' ')[0].toLowerCase() })}
                  className="flex min-h-11 items-center justify-between gap-3 border-b border-separator py-3 screen-x"
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
        <section className="section">
          <h2 className="t-headline screen-x">Koot</h2>
          <div className="hide-scrollbar mt-2 flex gap-2 overflow-x-auto screen-x">
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

      <section className="section">
        <h2 className="t-headline screen-x">Merkit</h2>
        <div className="hide-scrollbar mt-2 flex gap-2 overflow-x-auto screen-x">
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

      <section className="section">
        <h2 className="t-title3 screen-x">Kaikki tuotteet</h2>
        {items.length === 0 ? (
          <EmptyState
            title="Ei vielä tuotteita"
            body="Tallenna haku, niin ilmoitamme kun tähän kategoriaan tulee uutta."
            pose="empty"
            action={<Button href="/haku">Tee hakuvahti</Button>}
          />
        ) : (
          <>
            <div className="mt-3 grid grid-cols-2 gap-3 screen-x">
              {items.slice(0, 12).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} fullWidth />
              ))}
            </div>
            <div className="pt-6 screen-x">
              <Button full size="lg" href={link({})}>
                {`Näytä ${items.length} tuotetta`}
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
