'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { productById, productsBySeller } from '@/data/products';
import { marketById } from '@/data/markets';
import { categoryBySlug } from '@/data/categories';
import { similarProducts } from '@/lib/filters';
import { price, addedLabel } from '@/lib/format';
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
    ready,
    city,
    wishlist,
    toggleWishlist,
    reservedIds,
    pushToast,
  } = useApp();
  /**
   * The skeleton stands in only until the stored state is actually in hand,
   * which is the frame after mount. There was a timer here; the data is local
   * and synchronous, so the wait was pure latency pretending to be loading.
   */
  const loading = !ready;
  const [failed, setFailed] = useState(false);

  const product = productById(params.id);
  const market = product ? marketById(product.marketId) : undefined;

  useEffect(() => {
    setFailed(search.get('demo') === 'error');
  }, [search]);


  if (!product || !market) {
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
          }}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <ScreenHeader title={product.title} back />
        <Skeleton className="aspect-[4/5] w-full rounded-none" />
        <div className="space-y-3 px-4 pt-4">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-[120px] w-full rounded-[18px]" />
        </div>
      </div>
    );
  }

  const saved = wishlist.includes(product.id);
  const status = reservedIds.includes(product.id) ? 'Varattu' : product.status;
  const unavailable = status !== 'Saatavilla';
  const category = categoryBySlug(product.category);
  /** This viewer has reserved it, so the shelf is theirs to know. */
  const reserved = reservedIds.includes(product.id);

  /**
   * The rest of what the same person brought, and then everything else that
   * looks like this one. The seller has no page of their own, so this row is
   * the only way their other items are reachable.
   */
  const fromSameSeller = productsBySeller(product.sellerId)
    .filter((item) => item.id !== product.id && item.status !== 'Myyty')
    .slice(0, 10);
  const sellerIds = new Set(fromSameSeller.map((item) => item.id));
  const similar = similarProducts(product).filter((item) => !sellerIds.has(item.id));

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
        zoomable
        className="aspect-[4/5] max-h-[62vh] w-full"
        overlay={
          unavailable ? (
            <span className="absolute inset-0 flex items-center justify-center bg-[rgba(60,36,21,0.45)]">
              <span className="rounded-full bg-surface px-4 py-2 t-headline">{status}</span>
            </span>
          ) : null
        }
      />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
        <div className="px-4 pt-4">
          <h1 className="t-title2" data-screen-title>{product.title}</h1>
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

          {/*
            Reserve and buy sit in the page, right under what the product is,
            as the two ways to get it. They scroll with the page; the tab bar
            stays the only thing floating.
          */}
          <div className="mt-5">
            {status === 'Myyty' ? (
              <Button
                full
                icon={<BellIcon size={18} />}
                onClick={() =>
                  pushToast({
                    title: 'Hakuvahti tallennettu',
                    body: 'Ilmoitamme kun vastaava tulee myyntiin',
                    href: '/toivelista',
                  })
                }
              >
                Ilmoita kun vastaava tulee myyntiin
              </Button>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Button
                    full
                    className="flex-1"
                    href={`/varaus/${product.id}`}
                    disabled={status === 'Varattu'}
                  >
                    Varaa nouto
                  </Button>
                  {status === 'Varattu' ? null : (
                    <Button full variant="glass" className="flex-1" href={`/varaus/${product.id}?osta=1`}>
                      Osta heti
                    </Button>
                  )}
                </div>
                {status === 'Varattu' ? (
                  <div className="mt-1 flex justify-center">
                    <Button
                      variant="plain"
                      onClick={() =>
                        pushToast({
                          title: 'Ilmoitamme kun vapautuu',
                          body: product.title,
                          href: '/toivelista',
                        })
                      }
                    >
                      Ilmoita kun vapautuu
                    </Button>
                  </div>
                ) : (
                  <p className="t-footnote mt-2 text-center text-brown-70">
                    Varaus odottaa kassalla. Osto tulee postissa tai noudat itse.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* The rest of the facts, labelled, where there is room to read them. */}
        <section className="section screen-x">
          <div className="overflow-hidden rounded-[16px] bg-surface shadow-card">
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
          <div className="overflow-hidden rounded-[18px] bg-surface shadow-card">
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
            <div className="flex items-start gap-2 border-t border-separator px-4 py-3">
              {reserved ? (
                <span className="t-subhead inline-flex items-center gap-1.5 font-semibold text-terracotta-ink">
                  <TagIcon size={16} />
                  {product.tableNumber}
                </span>
              ) : (
                <>
                  <TagIcon size={16} className="mt-0.5 shrink-0 text-brown-70" />
                  <span className="t-subhead text-brown-70">
                    Tarkan paikan näet varauksen jälkeen.
                  </span>
                </>
              )}
            </div>
            <Link href={`/kirpputori/${market.id}`} aria-label={`${market.name} kartalla`} className="block">
              <MarketMap markets={[market]} className="h-[140px] w-full" />
            </Link>
          </div>
        </section>

        <ProductRow title="Myyjän muut tuotteet" products={fromSameSeller} />

        <ProductRow title="Samankaltaisia" products={similar} />
      </motion.div>

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
