'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { productById } from '@/data/products';
import { marketById, markets } from '@/data/markets';
import { sellers } from '@/data/sellers';
import { seedNotifications } from '@/data/notifications';
import { price } from '@/lib/format';
import { countdownLabel, deadlineFor } from '@/lib/time';
import { productImage } from '@/lib/imagePath';
import { useApp, useNow } from '@/lib/state';
import { useTransition } from '@/lib/motion';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SafeImage } from '@/components/ui/SafeImage';
import { ListSection, ListRow, Toggle } from '@/components/ui/List';
import { Button, IconButton } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Chip';
import { ErrorState } from '@/components/ui/StateViews';
import { RowSkeleton } from '@/components/ui/Skeleton';
import { Mascot } from '@/components/ui/Mascot';
import {
  BellIcon,
  QrIcon,
  ClockIcon,
  HeartIcon,
  LocationIcon,
  PersonIcon,
  SettingsIcon,
  LeafIcon,
} from '@/components/ui/Icons';

/** Profile: reservations with their pickup codes, history, follows and settings. */
export default function OmaPage() {
  const now = useNow();
  const transition = useTransition();
  const {
    ready,
    city,
    reservations,
    wishlist,
    followedMarkets,
    followedSellers,
    readNotifications,
    largeText,
    reduceMotion,
    highContrast,
    set,
    resetDemo,
    pushToast,
  } = useApp();
  const [failed, setFailed] = useState(false);

  // Keeps the placeholder rows visible until the stored state is restored.
  const loading = !ready;

  useEffect(() => {
    if (!failed) return;
    const timer = window.setTimeout(() => setFailed(false), 8000);
    return () => window.clearTimeout(timer);
  }, [failed]);

  const active = reservations.filter((reservation) => reservation.kind === 'varaus');
  const bought = reservations.filter((reservation) => reservation.kind === 'osto');
  const unread = readNotifications.includes('all') ? 0 : seedNotifications.length;
  const followedMarketList = markets.filter((market) => followedMarkets.includes(market.id));
  const followedSellerList = sellers.filter((seller) => followedSellers.includes(seller.id));
  const savedEur = bought.reduce((sum, reservation) => sum + reservation.totalEur, 0);

  if (failed) {
    return (
      <div>
        <ScreenHeader title="Oma" />
        <ErrorState onRetry={() => setFailed(false)} />
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader
        title="Oma"
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
        <h1 className="t-large-title">Oma</h1>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className="px-4 pt-3"
      >
        <div className="flex items-center gap-3 rounded-[22px] bg-cream p-4 shadow-card">
          <Mascot pose="wave" size={56} />
          <div className="min-w-0 flex-1">
            <p className="t-headline truncate">Hei, löytäjä</p>
            <p className="t-footnote text-brown-70">
              {city}, {wishlist.length} tallennettua
            </p>
          </div>
          <Tag tone="accent">Demo</Tag>
        </div>
      </motion.section>

      {loading ? (
        <div className="mt-6">
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </div>
      ) : (
        <>
          <section className="mt-6">
            <h2 className="t-footnote px-5 pb-1.5 uppercase tracking-wide text-brown-70">
              Omat varaukset
            </h2>
            {active.length === 0 ? (
              <div className="mx-4 rounded-[16px] bg-cream p-5 text-center shadow-card">
                <p className="t-subhead text-brown-70">
                  Ei voimassa olevia varauksia. Varaa löytö, niin se odottaa sinua kassalla.
                </p>
                <div className="mt-4 flex justify-center">
                  <Button size="sm" variant="secondary" href="/selaa">
                    Selaa tuotteita
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mx-4 overflow-hidden rounded-[16px] bg-cream shadow-card">
                {active.map((reservation) => {
                  const product = productById(reservation.productId);
                  const market = product ? marketById(product.marketId) : undefined;
                  if (!product || !market) return null;
                  const deadline = deadlineFor(
                    reservation.pickupWindow,
                    new Date(reservation.createdAtIso),
                  );
                  const countdown = now ? countdownLabel(deadline, now) : reservation.pickupWindow;
                  return (
                    <Link
                      key={reservation.id}
                      href={`/qr?id=${reservation.id}`}
                      className="flex items-center gap-3 border-b border-separator p-3 last:border-b-0"
                    >
                      <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-[12px] bg-cream-sink">
                        <SafeImage
                          src={productImage(product.images[0])}
                          alt={product.title}
                          label={product.title}
                          compact
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="t-headline block truncate">{product.title}</span>
                        <span className="t-caption block truncate text-brown-70">
                          {market.name}, {product.tableNumber}
                        </span>
                        <span className="t-caption mt-0.5 inline-flex items-center gap-1 text-terracotta-ink">
                          <ClockIcon size={13} />
                          {countdown}
                        </span>
                      </span>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream-sink text-terracotta">
                        <QrIcon size={22} />
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-6">
            <h2 className="t-footnote px-5 pb-1.5 uppercase tracking-wide text-brown-70">Ostot</h2>
            {bought.length === 0 ? (
              <div className="mx-4 rounded-[16px] bg-cream p-5 text-center shadow-card">
                <p className="t-subhead text-brown-70">
                  Ostoksesi näkyvät täällä kuitteineen.
                </p>
              </div>
            ) : (
              <div className="mx-4 overflow-hidden rounded-[16px] bg-cream shadow-card">
                {bought.map((reservation) => {
                  const product = productById(reservation.productId);
                  const market = product ? marketById(product.marketId) : undefined;
                  if (!product || !market) return null;
                  return (
                    <Link
                      key={reservation.id}
                      href={`/qr?id=${reservation.id}`}
                      className="flex items-center gap-3 border-b border-separator p-3 last:border-b-0"
                    >
                      <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-[12px] bg-cream-sink">
                        <SafeImage
                          src={productImage(product.images[0])}
                          alt={product.title}
                          label={product.title}
                          compact
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="t-headline block truncate">{product.title}</span>
                        <span className="t-caption block truncate text-brown-70">{market.name}</span>
                      </span>
                      <span className="t-subhead shrink-0">{price(reservation.totalEur)}</span>
                    </Link>
                  );
                })}
              </div>
            )}
            {bought.length ? (
              <p className="t-caption px-5 pt-1.5 text-brown-70">
                <LeafIcon size={13} className="mr-1 inline align-[-2px]" />
                Olet antanut {bought.length} tavaralle uuden elämän, yhteensä {price(savedEur)}.
              </p>
            ) : null}
          </section>

          <ListSection title="Seuratut">
            <ListRow
              label="Kirpputorit"
              value={String(followedMarketList.length)}
              href="/toivelista"
              icon={<LocationIcon size={20} />}
            />
            <ListRow
              label="Myyjät"
              value={String(followedSellerList.length)}
              href="/toivelista"
              icon={<PersonIcon size={20} />}
            />
            <ListRow
              label="Tallennetut tuotteet"
              value={String(wishlist.length)}
              href="/toivelista"
              icon={<HeartIcon size={20} />}
            />
          </ListSection>

          <ListSection title="Ilmoitukset">
            <ListRow
              label="Kaikki ilmoitukset"
              value={unread ? `${unread} uutta` : undefined}
              href="/ilmoitukset"
              icon={<BellIcon size={20} />}
            />
          </ListSection>

          <ListSection
            title="Asetukset"
            footer="Asetukset tallennetaan vain tähän laitteeseen. Demo ei kerää mitään tietoja."
          >
            <ListRow label="Kaupunki" value={city} icon={<LocationIcon size={20} />} href="/onboarding" />
            <Toggle
              label="Suurempi teksti"
              description="Kasvattaa tekstin kokoa koko sovelluksessa"
              checked={largeText}
              onChange={(value) => set('largeText', value)}
            />
            <Toggle
              label="Lisää kontrastia"
              description="Tummentaa tekstiä ja poistaa läpikuultavuuden"
              checked={highContrast}
              onChange={(value) => set('highContrast', value)}
            />
            <Toggle
              label="Vähennä liikettä"
              description="Korvaa animaatiot pehmeillä häivytyksillä"
              checked={reduceMotion}
              onChange={(value) => set('reduceMotion', value)}
            />
          </ListSection>

          <ListSection title="Demo">
            <ListRow
              label="Katso esittely uudelleen"
              href="/onboarding"
              icon={<SettingsIcon size={20} />}
            />
            <ListRow
              label="Näytä virhetila"
              onClick={() => setFailed(true)}
              icon={<SettingsIcon size={20} />}
            />
            <ListRow
              label="Tyhjennä demon tiedot"
              destructive
              onClick={() => {
                resetDemo();
                pushToast({ title: 'Demo nollattu' });
              }}
            />
          </ListSection>

          <div className="px-5 pb-4 pt-6">
            <p className="t-caption text-brown-70">
              ReSello, demo. Tuotteet, kirpputorit ja myyjät ovat esimerkkejä.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
