import { markets } from '@/lib/mockData';
import { Suspense } from 'react';
import { MarketView } from '@/components/market/MarketView';

/** Ids are known at build time, which keeps a static export possible. */
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
