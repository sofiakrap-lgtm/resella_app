'use client';

import Link from 'next/link';
import type { Product } from '@/lib/mockData';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { ChevronRight } from '@/components/ui/Icons';
import { useApp } from '@/lib/state';

interface ProductRowProps {
  title: string;
  products: Product[];
  href?: string;
  loading?: boolean;
  onQuickView?: (product: Product) => void;
}

/** Horizontally scrolling section used across the home and market screens. */
export function ProductRow({ title, products, href, loading = false, onQuickView }: ProductRowProps) {
  const { t } = useApp();
  if (!loading && !products.length) return null;

  return (
    <section className="mt-6">
      <div className="flex items-baseline justify-between px-4">
        <h3 className="t-title3">{title}</h3>
        {href ? (
          <Link href={href} className="t-subhead inline-flex min-h-11 items-center gap-0.5 text-accent">
            {t('common.showAll')}
            <ChevronRight size={16} />
          </Link>
        ) : null}
      </div>
      <div className="hide-scrollbar mt-2 flex gap-3 overflow-x-auto px-4 pb-1">
        {loading
          ? [0, 1, 2].map((key) => <ProductCardSkeleton key={key} />)
          : products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} onQuickView={onQuickView} />
            ))}
      </div>
    </section>
  );
}
