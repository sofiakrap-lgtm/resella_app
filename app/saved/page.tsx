'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { productById, type Product } from '@/lib/mockData';
import { filterProducts, filtersToQuery } from '@/lib/search';
import { useApp } from '@/lib/state';
import { ScreenHeader, LargeTitle } from '@/components/ui/ScreenHeader';
import { Segmented } from '@/components/ui/Segmented';
import { Button, IconButton } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Chip';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { ProductCard } from '@/components/product/ProductCard';
import { QuickView } from '@/components/product/QuickView';
import { BellIcon, ShareIcon, CloseIcon, SearchIcon, ChevronRight } from '@/components/ui/Icons';
import Link from 'next/link';

export default function SavedPage() {
  return (
    <Suspense fallback={null}>
      <SavedContent />
    </Suspense>
  );
}

function SavedContent() {
  const search = useSearchParams();
  const {
    t,
    wishlist,
    savedSearches,
    removeSavedSearch,
    toggleSavedSearchNotify,
    pushToast,
    ready,
  } = useApp();
  const [segment, setSegment] = useState<'wishlist' | 'alerts'>('wishlist');
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  // Demo switch: append ?demo=error to show the error state.
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(search.get('demo') === 'error');
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 360);
    return () => window.clearTimeout(timer);
  }, []);

  const saved = wishlist.map((id) => productById(id)).filter((p): p is Product => Boolean(p));

  // Mocked push: the first alert reports a match shortly after it is created.
  useEffect(() => {
    if (!ready || !savedSearches.length) return;
    const newest = savedSearches[0];
    const timer = window.setTimeout(() => {
      pushToast({ title: `${t('saved.alertHit')} "${newest.label}"`, href: '/saved' });
    }, 2500);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedSearches.length, ready]);

  return (
    <div>
      <ScreenHeader title={t('saved.title')} largeTitleBelow transparent />
      <LargeTitle>{t('saved.title')}</LargeTitle>

      <div className="px-4 pt-2">
        <Segmented
          ariaLabel={t('saved.title')}
          value={segment}
          onChange={setSegment}
          options={[
            { value: 'wishlist', label: `${t('saved.wishlist')} (${saved.length})` },
            { value: 'alerts', label: `${t('saved.alerts')} (${savedSearches.length})` },
          ]}
        />
      </div>

      {failed ? (
        <ErrorState
          onRetry={() => {
            setFailed(false);
            setLoading(true);
          }}
        />
      ) : loading ? (
        <div className="mt-4 grid grid-cols-2 gap-3 px-4">
          {[0, 1, 2, 3].map((key) => (
            <ProductCardSkeleton key={key} wide />
          ))}
        </div>
      ) : segment === 'wishlist' ? (
        saved.length === 0 ? (
          <EmptyState
            title={t('saved.emptyWishlistTitle')}
            body={t('saved.emptyWishlistBody')}
            action={
              <Button href="/search" icon={<SearchIcon size={18} />}>
                {t('common.search')}
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex justify-end px-4 pt-3">
              <Button
                size="sm"
                variant="secondary"
                icon={<ShareIcon size={16} />}
                onClick={() => pushToast({ title: t('saved.shareCollection') })}
              >
                {t('saved.shareCollection')}
              </Button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3 px-4">
              {saved.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onQuickView={setQuickView}
                  fullWidth
                />
              ))}
            </div>
          </>
        )
      ) : savedSearches.length === 0 ? (
        <EmptyState
          title={t('saved.emptyAlertsTitle')}
          body={t('saved.emptyAlertsBody')}
          action={
            <Button href="/search" icon={<BellIcon size={18} />}>
              {t('saved.newAlert')}
            </Button>
          }
        />
      ) : (
        <div className="mt-3">
          {savedSearches.map((search, index) => {
            const matches = filterProducts(search.filters).length;
            return (
              <motion.article
                key={search.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.3) }}
                className="border-b border-separator px-4 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/results?${filtersToQuery(search.filters)}`} className="min-w-0 flex-1">
                    <span className="t-headline block truncate">{search.label}</span>
                    <span className="mt-1 flex flex-wrap gap-1.5">
                      {search.filters.city ? <Tag>{search.filters.city}</Tag> : null}
                      {search.filters.sizes.map((size) => (
                        <Tag key={size}>{`${t('product.size')} ${size}`}</Tag>
                      ))}
                      {search.filters.categories.map((category) => (
                        <Tag key={category}>{category}</Tag>
                      ))}
                      {search.filters.maxPrice !== null ? (
                        <Tag>{`${t('search.maxPrice')} ${search.filters.maxPrice} €`}</Tag>
                      ) : null}
                    </span>
                    <span className="t-footnote mt-1 block text-ink-secondary">
                      {matches > 0
                        ? `${matches} ${t('results.count')}, ${t('saved.lastMatch').toLowerCase()} ${t('common.today').toLowerCase()}`
                        : t('saved.noMatchYet')}
                    </span>
                  </Link>
                  <IconButton ariaLabel={t('saved.remove')} onClick={() => removeSavedSearch(search.id)}>
                    <CloseIcon size={18} />
                  </IconButton>
                </div>

                <label className="mt-2 flex min-h-11 items-center justify-between gap-3">
                  <span className="t-subhead inline-flex items-center gap-1.5 text-ink-secondary">
                    <BellIcon size={16} />
                    {t('saved.notifications')}
                  </span>
                  <input
                    type="checkbox"
                    checked={search.notify}
                    onChange={() => toggleSavedSearchNotify(search.id)}
                    className="h-6 w-11 appearance-none rounded-full bg-surface-2 transition-colors checked:bg-accent relative before:absolute before:left-0.5 before:top-0.5 before:h-5 before:w-5 before:rounded-full before:bg-white before:shadow before:transition-transform checked:before:translate-x-5"
                  />
                </label>
              </motion.article>
            );
          })}

          <div className="px-4 py-5">
            <Button full variant="secondary" href="/search" icon={<SearchIcon size={18} />}>
              {t('saved.newAlert')}
            </Button>
          </div>
        </div>
      )}

      <div className="px-4 py-6">
        <Link
          href="/pinterest"
          className="flex min-h-11 items-center justify-between rounded-[16px] bg-surface px-4 py-3 shadow-card"
        >
          <span className="t-subhead">{t('pinterest.title')}</span>
          <ChevronRight size={18} className="text-ink-tertiary" />
        </Link>
      </div>

      <QuickView product={quickView} onClose={() => setQuickView(null)} />
    </div>
  );
}
