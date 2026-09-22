'use client';

import { Product, formatPrice, marketById } from '@/lib/mockData';
import { distanceKm, formatDistance } from '@/lib/geo';
import { originFor } from '@/lib/search';
import { useApp } from '@/lib/state';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Chip';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import { LocationIcon, TagIcon } from '@/components/ui/Icons';

/** Quick view sheet, opened by pressing and holding a product card. */
export function QuickView({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { t, city } = useApp();
  const market = product ? marketById(product.marketId) : undefined;
  const distance = market ? distanceKm(originFor(city), market) : null;

  return (
    <Sheet open={Boolean(product)} onClose={onClose} title={t('results.quickView')} detents={[0.72]}>
      {product ? (
        <div className="pb-8">
          <ImageCarousel
            photos={product.photos}
            alt={product.title}
            label={product.title}
            className="h-[240px] w-full"
          />
          <div className="px-4 pt-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="t-title3">{product.title}</h3>
              <span className="t-title3">{formatPrice(product.price)}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.size ? <Tag tone="accent">{`${t('product.size')} ${product.size}`}</Tag> : null}
              <Tag>{product.condition}</Tag>
              <Tag>{product.category}</Tag>
            </div>
            <div className="t-subhead mt-3 space-y-1 text-ink-secondary">
              <p className="flex items-center gap-1.5">
                <LocationIcon size={16} />
                {market?.name}, {market?.city}
                {distance !== null ? `, ${formatDistance(distance)}` : ''}
              </p>
              <p className="flex items-center gap-1.5">
                <TagIcon size={16} />
                {product.spot}
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <Button href={`/reserve/${product.id}`} full>
                {t('product.reserve')}
              </Button>
              <Button href={`/product/${product.id}`} variant="secondary" full>
                {t('common.showMore')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Sheet>
  );
}
