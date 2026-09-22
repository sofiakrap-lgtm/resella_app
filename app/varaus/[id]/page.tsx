import { Suspense } from 'react';
import { products } from '@/data/products';
import { ReservationView } from '@/components/views/ReservationView';

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ReservationView />
    </Suspense>
  );
}
