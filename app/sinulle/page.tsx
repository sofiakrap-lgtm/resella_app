'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { products } from '@/data/products';
import { markets } from '@/data/markets';
import { categoryBySlug } from '@/data/categories';
import { useApp } from '@/lib/state';
import { inCity } from '@/lib/format';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Chip';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { PersonIcon } from '@/components/ui/Icons';

export default function SinullePage() {
  return (
    <Suspense fallback={null}>
      <SinulleContent />
    </Suspense>
  );
}

/**
 * Everything the app knows about this viewer, used at once: their city, the
 * categories they chose, the sizes they set, and the markets they follow.
 */
function SinulleContent() {
  const search = useSearchParams();
  const { ready, city, interests, sizes, followedMarkets } = useApp();
  // Demo switch: append ?demo=error to show the error state.
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(search.get('demo') === 'error');
  }, [search]);

  const picks = useMemo(() => {
    const inThisCity = new Set(
      markets.filter((market) => market.city === city).map((market) => market.id),
    );
    return products
      .filter((product) => product.status === 'Saatavilla')
      .map((product) => {
        let score = 0;
        if (interests.includes(product.category)) score += 3;
        if (product.size && sizes.includes(product.size)) score += 3;
        if (followedMarkets.includes(product.marketId)) score += 2;
        if (inThisCity.has(product.marketId)) score += 1;
        if (product.addedDaysAgo === 0) score += 1;
        return { product, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.product.priceEur - b.product.priceEur)
      .slice(0, 24)
      .map((entry) => entry.product);
  }, [city, interests, sizes, followedMarkets]);

  const reasons = [
    ...interests.map((slug) => categoryBySlug(slug)?.name).filter(Boolean),
    ...sizes.map((size) => `Koko ${size}`),
    inCity(city),
  ].slice(0, 6) as string[];

  if (failed) {
    return (
      <div>
        <ScreenHeader title="Sinulle" back />
        <ErrorState onRetry={() => setFailed(false)} />
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader title="Sinulle" back largeTitleBelow transparent />

      <div className="pt-3 screen-x">
        <h1 className="t-large-title" data-screen-title>
          Sinulle
        </h1>
      </div>

      {!ready ? (
        <div className="mt-4 grid grid-cols-2 gap-3 screen-x">
          {[0, 1, 2, 3].map((key) => (
            <ProductCardSkeleton key={key} wide />
          ))}
        </div>
      ) : picks.length === 0 ? (
        <EmptyState
          title="Kerro mistä pidät"
          body="Valitse kiinnostuksesi ja koot, niin kokoamme tämän sivun sinulle."
          action={
            <Button href="/onboarding" icon={<PersonIcon size={18} />}>
              Tee oma profiili
            </Button>
          }
        />
      ) : (
        <>
          <div className="hide-scrollbar mt-3 flex gap-1.5 overflow-x-auto pb-1 screen-x">
            {reasons.map((reason) => (
              <Tag key={reason} tone="accent">
                {reason}
              </Tag>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 screen-x">
            {picks.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} fullWidth />
            ))}
          </div>
          <div className="pt-6 screen-x">
            <Button full variant="bordered" href="/onboarding" icon={<PersonIcon size={18} />}>
              Säädä profiilia
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
