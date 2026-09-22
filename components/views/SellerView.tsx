'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { sellerById } from '@/data/sellers';
import { marketById } from '@/data/markets';
import { productsBySeller } from '@/data/products';
import { rating as formatRating } from '@/lib/format';
import { useApp } from '@/lib/state';
import { useTransition } from '@/lib/motion';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button, IconButton } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Chip';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { ProductCard } from '@/components/ProductCard';
import { SellerAvatar } from '@/components/SellerHeader';
import { HeartIcon, ShareIcon, StarIcon, TagIcon, ChevronRight } from '@/components/ui/Icons';

/** Seller page: who they are, where their table is, and what is on it. */
export function SellerView() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const transition = useTransition();
  const { followedSellers, toggleFollowSeller, pushToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const seller = sellerById(params.id);
  const market = seller?.currentMarketId ? marketById(seller.currentMarketId) : undefined;

  useEffect(() => {
    setFailed(search.get('demo') === 'error');
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 320);
    return () => window.clearTimeout(timer);
  }, [params.id]);

  const items = useMemo(() => (seller ? productsBySeller(seller.id) : []), [seller]);
  const available = items.filter((product) => product.status !== 'Myyty');
  const sold = items.filter((product) => product.status === 'Myyty');

  if (!seller) {
    return (
      <div>
        <ScreenHeader title="Myyjä" back />
        <EmptyState title="Myyjää ei löytynyt" action={<Button href="/selaa?nakyma=myyjat">Selaa myyjiä</Button>} />
      </div>
    );
  }

  if (failed) {
    return (
      <div>
        <ScreenHeader title={seller.name} back />
        <ErrorState
          onRetry={() => {
            setFailed(false);
            setLoading(true);
          }}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <ScreenHeader title={seller.name} back />
        <div className="space-y-3 px-4 pt-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-[120px] w-full rounded-[18px]" />
        </div>
      </div>
    );
  }

  const following = followedSellers.includes(seller.id);

  return (
    <div className="pb-8">
      <ScreenHeader
        title={seller.name}
        back
        transparent
        largeTitleBelow
        right={
          <IconButton
            ariaLabel="Jaa profiili"
            onClick={() => pushToast({ title: 'Linkki kopioitu', body: `${seller.name}, myyjän sivu` })}
          >
            <ShareIcon size={20} />
          </IconButton>
        }
      />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
        <div className="flex items-start gap-4 px-4 pt-4">
          <SellerAvatar seller={seller} size={72} />
          <div className="min-w-0 flex-1">
            <h1 className="t-title2">{seller.name}</h1>
            <p className="t-footnote mt-1 inline-flex items-center gap-1 text-brown-70">
              <StarIcon size={14} />
              {formatRating(seller.rating)} · {seller.reviewsCount} arvostelua · {seller.followerCount} seuraajaa
            </p>
          </div>
        </div>

        <p className="t-subhead mt-3 px-4 text-brown-70">{seller.bio}</p>

        {/* Where this seller sells right now, the link back to the market */}
        <section className="section screen-x">
          {seller.isActive && market ? (
            <Link
              href={`/kirpputori/${market.id}`}
              className="flex items-center gap-3 rounded-[16px] bg-cream px-4 py-3 shadow-card"
            >
              <span className="min-w-0 flex-1">
                <span className="t-headline block truncate">{market.name}</span>
                <span className="t-footnote block text-brown-70">
                  {market.address}, {market.city}
                </span>
                <span className="mt-1 inline-flex flex-wrap items-center gap-1.5">
                  <Tag tone="accent" icon={<TagIcon size={12} />}>
                    {seller.tableNumber}
                  </Tag>
                  {seller.tableValidUntil ? <Tag>{`Voimassa ${seller.tableValidUntil} asti`}</Tag> : null}
                </span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-brown-50" />
            </Link>
          ) : (
            <div className="rounded-[16px] bg-cream-panel px-4 py-3">
              <p className="t-subhead">Ei aktiivista pöytää juuri nyt.</p>
              <p className="t-footnote mt-1 text-brown-70">
                Seuraa, niin saat viestin kun {seller.name} vuokraa pöydän uudelleen.
              </p>
            </div>
          )}
        </section>

        <div className="section screen-x">
          <Button
            full
            variant={following ? 'secondary' : 'primary'}
            onClick={() => toggleFollowSeller(seller.id)}
            icon={<HeartIcon size={18} filled={following} />}
          >
            {following ? 'Seurataan' : 'Seuraa myyjää'}
          </Button>
        </div>

        <section className="section">
          <h2 className="t-title3 screen-x">Kaapissa nyt ({available.length})</h2>
          {available.length === 0 ? (
            <EmptyState
              title="Ei tuotteita juuri nyt"
              body={`Seuraa, niin näet heti kun ${seller.name} lisää uutta.`}
              pose="empty"
              action={
                <Button onClick={() => toggleFollowSeller(seller.id)}>
                  {following ? 'Seurataan' : 'Seuraa myyjää'}
                </Button>
              }
            />
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-3 px-4">
              {available.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} fullWidth hideMarket />
              ))}
            </div>
          )}
        </section>

        {sold.length ? (
          <section className="section">
            <h2 className="t-title3 screen-x">Myydyt</h2>
            <div className="mt-2 grid grid-cols-2 gap-3 px-4 opacity-55">
              {sold.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} fullWidth hideMarket />
              ))}
            </div>
          </section>
        ) : null}
      </motion.div>
    </div>
  );
}
