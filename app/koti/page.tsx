'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/state';
import { useTransition } from '@/lib/motion';
import { products, newToday, productsBySeller } from '@/data/products';
import { markets, marketById } from '@/data/markets';
import { seedNotifications } from '@/data/notifications';
import { CITY_CENTERS, haversineKm, inCity } from '@/lib/format';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ProductCard, ProductList } from '@/components/ProductCard';
import { MarketCard } from '@/components/MarketHeader';
import { Button, IconButton } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/StateViews';
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
  /** The rest of the feed stays folded until the viewer asks for it. */
  const [more, setMore] = useState(false);
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

  /** A row anyone can act on, whatever they came looking for. */
  const affordable = products
    .filter((product) => product.status === 'Saatavilla' && product.priceEur <= 30)
    .sort((a, b) => a.priceEur - b.priceEur)
    .slice(0, 12);

  /** Today in this city first, then today anywhere, so the hero is never empty. */
  const hero = todayHere.length ? todayHere : newToday();
  const heroIds = new Set(hero.map((product) => product.id));

  /** Only what the hero above does not already show. */
  const beyondHero = fromFollows.filter((product) => !heroIds.has(product.id));

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

      <div className="px-4 pb-1 pt-1">
        <h2 className="t-large-title" data-screen-title>ReSello</h2>
        <p className="t-subhead mt-1 text-brown-70">Löydöt {inCity(city)}</p>
      </div>

      <div className="mt-4 px-4">
        <Link
          href="/haku"
          className="flex min-h-11 items-center gap-2 rounded-full bg-surface px-4 py-2.5 shadow-card"
        >
          <SearchIcon size={19} className="text-brown-70" />
          <span className="t-body truncate text-brown-70">Hae tuotetta, merkkiä tai kirppistä</span>
        </Link>
      </div>

      {loading ? (
        <section className="section">
          <div className="screen-x">
            <div className="shimmer h-6 w-40 rounded-md" />
          </div>
          <div className="hide-scrollbar mt-3 flex gap-3 overflow-x-auto screen-x">
            {[0, 1, 2].map((key) => (
              <ProductCardSkeleton key={key} />
            ))}
          </div>
        </section>
      ) : (
        <>
          {/* Hero. One thing to look at first, the reason to open the app today. */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="section"
          >
            <div className="flex items-baseline justify-between gap-3 screen-x">
              <h3 className="t-title2">Uutta tänään</h3>
              <Link
                href="/haku?uutta=1"
                className="t-subhead inline-flex min-h-11 shrink-0 items-center text-terracotta-ink"
              >
                Katso kaikki
              </Link>
            </div>
            {hero.length ? (
              <div className="hide-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1 screen-x">
                {hero.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} hideNewBadge />
                ))}
              </div>
            ) : (
              <p className="t-subhead mt-2 text-brown-70 screen-x">
                Ei uutuuksia tänään. Katso eiliset.
              </p>
            )}
          </motion.section>

          {/* Second section: what this viewer follows, or what suits them. */}
          {beyondHero.length ? (
            <ProductList title="Seuraamasi" products={beyondHero} href="/toivelista" />
          ) : forYou.length ? (
            <ProductList title="Sinulle" products={forYou} href="/selaa" />
          ) : (
            <section className="section screen-x">
              <div className="rounded-[18px] bg-cream-panel p-5 text-center shadow-card">
                <p className="t-body">Seuraa kirpputoria, niin uutuudet tulevat tänne.</p>
                <div className="mt-4 flex justify-center">
                  <Button href="/selaa?nakyma=kirpputorit" icon={<SearchIcon size={18} />}>
                    Selaa kirpputoreja
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* Third section: where to go next, in the real world. */}
          <section className="section">
            <div className="flex items-baseline justify-between gap-3 screen-x">
              <h3 className="t-title3">Lähellä</h3>
              <Link
                href="/selaa?nakyma=kirpputorit"
                className="t-subhead inline-flex min-h-11 shrink-0 items-center text-terracotta-ink"
              >
                Katso kaikki
              </Link>
            </div>
            <div className="mt-3 overflow-hidden rounded-[16px] bg-surface shadow-card mx-4">
              {nearby.slice(0, 3).map((market, index) => (
                <MarketCard key={market.id} market={market} index={index} />
              ))}
            </div>
          </section>

          {/* Everything else stays folded until it is asked for. */}
          {more ? (
            <>
              {forYou.length && fromFollows.length ? (
                <ProductList title="Sinulle" products={forYou} href="/selaa" />
              ) : null}
              <ProductList title="Alle 30 euroa" products={affordable} href="/haku?max=30" />
              {followedSellerItems.length ? (
                <ProductList title="Seuraamiltasi myyjiltä" products={followedSellerItems} />
              ) : null}
              {followed.length ? (
                <section className="section">
                  <h3 className="t-title3 screen-x">Seuraamasi kirpputorit</h3>
                  <div className="mt-3 overflow-hidden rounded-[16px] bg-surface shadow-card mx-4">
                    {followed.map((market, index) => (
                      <MarketCard key={market.id} market={market} index={index} />
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : (
            <div className="section flex justify-center screen-x">
              <Button variant="secondary" onClick={() => setMore(true)}>
                Näytä lisää
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
