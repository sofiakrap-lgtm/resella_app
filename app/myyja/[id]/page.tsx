import { Suspense } from 'react';
import { sellers } from '@/data/sellers';
import { SellerView } from '@/components/views/SellerView';

export function generateStaticParams() {
  return sellers.map((seller) => ({ id: seller.id }));
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SellerView />
    </Suspense>
  );
}
