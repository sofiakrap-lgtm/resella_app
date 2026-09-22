'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/state';
import { useTransition } from '@/lib/motion';
import { products, newToday, productsBySeller } from '@/data/products';
import { markets, marketById } from '@/data/markets';
import { sellers } from '@/data/sellers';
import { seedNotifications } from '@/data/notifications';
import { CITY_CENTERS, haversineKm, inCity } from '@/lib/format';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ProductCard, ProductRow } from '@/components/ProductCard';
import { MarketCard } from '@/components/MarketHeader';
import { Mascot } from '@/components/ui/Mascot';
import { Button, IconButton } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { BellIcon, SearchIcon } from '@/components/ui/Icons';

export default function KotiPage() {
  return (
    <Suspense fallback={null}>
      <KotiContent />
    </Suspense>
  );
}

function KotiContent() {
  const search = useSearchParams();
  const { city, interests, sizes, followedMarkets, followedSellers, readNotifications } = useApp();
  const transition = useTransition();
  const [loading, setLoading] = useState(true);
  // Demo switch: append ?demo=error to show the error state.
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(search.get('demo') === 'error');
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 480);
    return () => window.clearTimeout(timer);
  }, []);

  const unread = readNotifications.includes('all') ? 0 : seedNotifications.length;

  /** New items from the markets and sellers this viewer follows. */
  const fromFollows = useMemo(
    () =>
      products.filter(
        (product) =>
          product.status === 'Saatavilla' &&
          product.addedDaysAgo <= 1 &&
          (followedMarkets.includes(product.marketId) || followedSellers.includes(product.sellerId)),
      ),
    [followedMarkets, followedSellers],
  );

  const todayHere = useMemo(
    () => newToday().filter((product) => marketById(product.marketId)?.city === city),
    [city],
  );

  const forYou = useMemo(() => {
    if (!interests.length && !sizes.length) return [];
    return products
      .filter((product) => product.status === 'Saatavilla')
      .filter(
        (product) =>
          (interests.length ? interests.includes(product.category) : true) &&
          (sizes.length && product.size ? sizes.includes(product.size) : true),
      )
      .slice(0, 12);
  }, [interests, sizes]);

  const vinyls = products.filter(
    (product) => product.subcategory === 'vinyylit' && product.priceEur < 14,
  );

  const origin = CITY_CENTERS[city] ?? CITY_CENTERS.Helsinki;
  const nearby = [...markets]
    .sort((a, b) => haversineKm(origin, a) - haversineKm(origin, b))
    .slice(0, 6);
  const followed = markets.filter((market) => followedMarkets.includes(market.id));
  const followedSellerItems = followedSellers.flatMap((id) => productsBySeller(id)).slice(0, 10);

  if (failed) {
    return (
      <div>
        <ScreenHeader title="ReSello" />
        <ErrorState
          onRetry={() => {
            setFailed(false);
            setLoading(true);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader
        title="ReSello"
        largeTitleBelow
        transparent
        right={
          <IconButton ariaLabel="Ilmoitukset" href="/ilmoitukset" className="relative">
            <BellIcon size={22} />
            {unread > 0 ? (
              <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-terracotta" />
            ) : null}
          </IconButton>
        }
      />

      <div className="flex items-start justify-between gap-3 pr-4 pt-1">
        <div className="min-w-0">
          <div className="px-4 pb-1 pt-1">
            <h2 className="t-large-title">ReSello</h2>
            <p className="t-subhead mt-1 text-brown-70">Löydöt {city} ja lähiseutu</p>
          </div>
        </div>
        <Mascot pose="wave" size={56} className="mt-2 shrink-0" />
      </div>

      <div className="mt-3 px-4">
        <Link
          href="/haku"
          className="flex min-h-11 items-center gap-2 rounded-full bg-cream px-4 py-2.5 shadow-card"
        >
          <SearchIcon size={19} className="text-brown-70" />
          <span className="t-body truncate text-brown-70">Hae tuotetta, merkkiä tai kirppistä</span>
        </Link>
      </div>

      {loading ? (
        <section className="mt-6">
          <div className="px-4">
            <div className="shimmer h-6 w-40 rounded-md" />
          </div>
          <div className="hide-scrollbar mt-2 flex gap-3 overflow-x-auto px-4">
            {[0, 1, 2].map((key) => (
              <ProductCardSkeleton key={key} />
            ))}
          </div>
        </section>
      ) : (
        <>
          {fromFollows.length ? (
            <ProductRow
              title="Uutta seuraamiltasi"
              products={fromFollows}
              href="/toivelista"
            />
          ) : (
            <section className="mt-4">
              <EmptyState
                title="Ala seuraamaan"
                body="Seuraa kirpputoreja ja myyjiä, niin näet uutuudet heti tässä."
                pose="search"
                action={
                  <Button href="/selaa" icon={<SearchIcon size={18} />}>
                    Selaa kirpputoreja
                  </Button>
                }
              />
            </section>
          )}

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="mt-6"
          >
            <h3 className="t-title3 px-4">Tänään {inCity(city)}</h3>
            <div className="hide-scrollbar mt-2 flex gap-3 overflow-x-auto px-4 pb-1">
              {(todayHere.length ? todayHere : newToday()).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </motion.section>

          <ProductRow title="Vinyylit alle 14 euroa" products={vinyls} />

          {forYou.length ? <ProductRow title="Sinulle" products={forYou} /> : null}

          {followedSellerItems.length ? (
            <ProductRow title="Seuraamiltasi myyjiltä" products={followedSellerItems} />
          ) : null}

          {followed.length ? (
            <section className="mt-6">
              <div className="flex items-baseline justify-between px-4">
                <h3 className="t-title3">Seuraamasi kirpputorit</h3>
                <Link href="/selaa" className="t-subhead inline-flex min-h-11 items-center text-terracotta-ink">
                  Näytä kaikki
                </Link>
              </div>
              <div className="hide-scrollbar mt-2 flex gap-3 overflow-x-auto px-4 pb-1">
                {followed.map((market, index) => (
                  <MarketCard key={market.id} market={market} index={index} layout="card" />
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-6">
            <h3 className="t-title3 px-4">Lähellä sinua</h3>
            <div className="hide-scrollbar mt-2 flex gap-3 overflow-x-auto px-4 pb-1">
              {nearby.map((market, index) => (
                <MarketCard key={market.id} market={market} index={index} layout="card" />
              ))}
            </div>
          </section>

          <section className="mt-8 px-4">
            <div className="flex items-center gap-3 rounded-[18px] bg-cream-panel px-4 py-3">
              <Mascot pose="default" size={40} animate={false} />
              <p className="t-footnote text-brown-70">
                Kaikki tuotteet ovat oikeasti myynnissä kirpputorin pöydällä. Varaa noudettavaksi,
                niin se odottaa sinua.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
