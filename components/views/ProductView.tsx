'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { productById } from '@/data/products';
import { marketById } from '@/data/markets';
import { sellerById } from '@/data/sellers';
import { categoryBySlug } from '@/data/categories';
import { similarProducts } from '@/lib/filters';
import { price, addedLabel, rating, distance, haversineKm, CITY_CENTERS } from '@/lib/format';
import { useApp } from '@/lib/state';
import { useTransition } from '@/lib/motion';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import { Button, IconButton } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Chip';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { ProductRow } from '@/components/ProductCard';
import { MarketMap } from '@/components/MarketMap';
import { OpenStatus } from '@/components/MarketHeader';
import { SellerAvatar, SellerWhere } from '@/components/SellerHeader';
import {
  HeartIcon,
  ShareIcon,
  LocationIcon,
  TagIcon,
  ChevronRight,
  BellIcon,
  StarIcon,
} from '@/components/ui/Icons';

/** Product page. The location block is what no other second hand app can show. */
export function ProductView() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const transition = useTransition();
  const {
    city,
    wishlist,
    toggleWishlist,
    followedSellers,
    toggleFollowSeller,
    reservedIds,
    pushToast,
  } = useApp();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const product = productById(params.id);
  const market = product ? marketById(product.marketId) : undefined;
  const seller = product ? sellerById(product.sellerId) : undefined;

  useEffect(() => {
    setFailed(search.get('demo') === 'error');
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 340);
    return () => window.clearTimeout(timer);
  }, [params.id]);

  if (!product || !market || !seller) {
    return (
      <div>
        <ScreenHeader title="Tuote" back />
        <EmptyState title="Tuotetta ei löytynyt" action={<Button href="/selaa">Selaa tuotteita</Button>} />
      </div>
    );
  }

  if (failed) {
    return (
      <div>
        <ScreenHeader title={product.title} back />
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
        <ScreenHeader title={product.title} back />
        <Skeleton className="h-[340px] w-full rounded-none" />
        <div className="space-y-3 px-4 pt-4">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-[120px] w-full rounded-[18px]" />
        </div>
      </div>
    );
  }

  const saved = wishlist.includes(product.id);
  const following = followedSellers.includes(seller.id);
  const status = reservedIds.includes(product.id) ? 'Varattu' : product.status;
  const unavailable = status !== 'Saatavilla';
  const km = haversineKm(CITY_CENTERS[city] ?? CITY_CENTERS.Helsinki, market);
  const category = categoryBySlug(product.category);

  return (
    <div className="pb-[120px]">
      <ScreenHeader
        title={product.title}
        back
        transparent
        largeTitleBelow
        right={
          <>
            <IconButton
              ariaLabel={saved ? 'Poista toivelistalta' : 'Tallenna toivelistalle'}
              active={saved}
              onClick={() => toggleWishlist(product.id)}
            >
              <HeartIcon size={21} filled={saved} />
            </IconButton>
            <IconButton
              ariaLabel="Jaa tuote"
              onClick={() => pushToast({ title: 'Linkki kopioitu', body: product.title })}
            >
              <ShareIcon size={20} />
            </IconButton>
          </>
        }
      />

      <ImageCarousel
        photos={product.images}
        alt={product.title}
        label={product.title}
        className="h-[340px] w-full"
        overlay={
          unavailable ? (
            <span className="absolute inset-0 flex items-center justify-center bg-[rgba(60,36,21,0.45)]">
              <span className="rounded-full bg-cream px-4 py-2 t-headline">{status}</span>
            </span>
          ) : null
        }
      />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
        <div className="px-4 pt-4">
          <h1 className="t-title2">{product.title}</h1>
          <p className="t-title1 mt-1">{price(product.priceEur)}</p>
          {unavailable ? null : (
            <div className="mt-2">
              <Tag tone="positive">Saatavilla nyt</Tag>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.size ? <Tag tone="accent">{`Koko ${product.size}`}</Tag> : null}
            <Tag>{product.condition}</Tag>
          </div>
          <p className="t-body mt-4 text-brown-70">{product.description}</p>
        </div>

        {/* The rest of the facts, labelled, where there is room to read them. */}
        <section className="section screen-x">
          <div className="overflow-hidden rounded-[16px] bg-cream shadow-card">
            {product.brand ? <DetailRow label="Merkki" value={product.brand} /> : null}
            {product.audience === 'Ei kokoa' ? null : (
              <DetailRow label="Kenelle" value={product.audience} />
            )}
            <DetailRow label="Väri" value={product.color} />
            {category ? <DetailRow label="Kategoria" value={category.name} /> : null}
            <DetailRow label="Lisätty" value={addedLabel(product.addedDaysAgo)} />
          </div>
        </section>

        {/* Location: the part that only works because the till knows the table */}
        <section className="mt-5 px-4">
          <h2 className="t-headline mb-2">Missä tämä on</h2>
          <div className="overflow-hidden rounded-[18px] bg-cream shadow-card">
            <Link href={`/kirpputori/${market.id}`} className="flex items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1">
                <span className="t-headline block truncate">{market.name}</span>
                <span className="t-footnote block truncate text-brown-70">
                  {market.address}, {market.city}
                </span>
                <OpenStatus market={market} className="mt-0.5" />
              </span>
              <ChevronRight size={18} className="shrink-0 text-brown-50" />
            </Link>
            <div className="flex items-center gap-4 border-t border-separator px-4 py-3">
              <span className="t-subhead inline-flex items-center gap-1.5 font-semibold text-terracotta-ink">
                <TagIcon size={16} />
                {product.tableNumber}
              </span>
              <span className="t-subhead inline-flex items-center gap-1.5 text-brown-70">
                <LocationIcon size={16} />
                {distance(km)}
              </span>
            </div>
            <Link href={`/kirpputori/${market.id}`} aria-label={`${market.name} kartalla`} className="block">
              <MarketMap markets={[market]} className="h-[140px] w-full" />
            </Link>
          </div>
        </section>

        {/* Seller: the third browse dimension, reachable from every item */}
        <section className="mt-5 px-4">
          <h2 className="t-headline mb-2">Myyjä</h2>
          <div className="rounded-[18px] bg-cream p-4 shadow-card">
            <div className="flex items-center gap-3">
              <SellerAvatar seller={seller} size={48} />
              <span className="min-w-0 flex-1">
                <span className="t-headline block truncate">{seller.name}</span>
                <span className="t-footnote inline-flex items-center gap-1 text-brown-70">
                  <StarIcon size={13} />
                  {rating(seller.rating)} · {seller.reviewsCount} arvostelua
                </span>
              </span>
              <Button size="sm" variant="secondary" onClick={() => toggleFollowSeller(seller.id)}>
                {following ? 'Seurataan' : 'Seuraa'}
              </Button>
            </div>
            <SellerWhere seller={seller} className="mt-3 block" />
            <div className="mt-3">
              <Button full variant="secondary" size="sm" href={`/myyja/${seller.id}`}>
                Katso pöytä
              </Button>
            </div>
          </div>
        </section>

        {unavailable ? (
          <div className="mt-5 px-4">
            <Button
              full
              variant="secondary"
              icon={<BellIcon size={18} />}
              onClick={() =>
                pushToast({
                  title: 'Ilmoitamme vastaavista',
                  body: `Seuraat nyt myyjää ${seller.name}`,
                  href: `/myyja/${seller.id}`,
                })
              }
            >
              Ilmoita kun vastaava tulee myyntiin
            </Button>
            <p className="t-footnote mt-2 text-center text-brown-70">
              Tämä tuote on {status.toLowerCase()}. Seuraa myyjää, niin näet uudet heti.
            </p>
          </div>
        ) : null}

        {!unavailable ? (
          <div className="section flex justify-center screen-x">
            <Link
              href={`/varaus/${product.id}?osta=1`}
              className="t-subhead inline-flex min-h-11 items-center font-semibold text-terracotta-ink"
            >
              {`Tai osta heti ${price(product.priceEur)}`}
            </Link>
          </div>
        ) : null}

        <ProductRow title="Samankaltaisia" products={similarProducts(product)} />
      </motion.div>

      {!unavailable ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 px-4 pb-[94px]">
          <div className="glass pointer-events-auto flex items-center gap-2 rounded-full p-1.5">
            <IconButton
              ariaLabel={saved ? 'Poista toivelistalta' : 'Tallenna toivelistalle'}
              active={saved}
              onClick={() => toggleWishlist(product.id)}
            >
              <HeartIcon size={21} filled={saved} />
            </IconButton>
            <Button full size="sm" href={`/varaus/${product.id}`} className="whitespace-nowrap">
              Varaa noudettavaksi
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** One labelled fact in the product detail list. */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4 border-b border-separator px-4 py-2.5 last:border-b-0">
      <span className="t-subhead shrink-0 text-brown-70">{label}</span>
      <span className="t-subhead min-w-0 text-right">{value}</span>
    </div>
  );
}
