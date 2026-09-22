import { products } from '@/lib/mockData';
import { Suspense } from 'react';
import { ProductView } from '@/components/product/ProductView';

/** Ids are known at build time, which keeps a static export possible. */
export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProductView />
    </Suspense>
  );
}
