import { Suspense } from 'react';
import { markets } from '@/data/markets';
import { MarketView } from '@/components/views/MarketView';

export function generateStaticParams() {
  return markets.map((market) => ({ id: market.id }));
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MarketView />
    </Suspense>
  );
}
