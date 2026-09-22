import { Suspense } from 'react';
import { products } from '@/data/products';
import { ProductView } from '@/components/views/ProductView';

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
