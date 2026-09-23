'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { productById } from '@/data/products';
import { marketById } from '@/data/markets';
import { sellerById } from '@/data/sellers';
import { price } from '@/lib/format';
import { countdownLabel, deadlineFor } from '@/lib/time';
import { productImage } from '@/lib/imagePath';
import { useApp, useNow } from '@/lib/state';
import { useTransition } from '@/lib/motion';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SafeImage } from '@/components/ui/SafeImage';
import { QRCode } from '@/components/ui/QRCode';
import { BrandWordmark } from '@/components/ui/BrandMark';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { EmptyState } from '@/components/ui/StateViews';
import { Skeleton } from '@/components/ui/Skeleton';
import { LocationIcon, TagIcon, CheckIcon } from '@/components/ui/Icons';

export default function QrPage() {
  return (
    <Suspense fallback={null}>
      <QrContent />
    </Suspense>
  );
}

/** Pickup pass: the code the counter scans when the item changes hands. */
function QrContent() {
  const params = useSearchParams();
  const router = useRouter();
  const now = useNow();
  const transition = useTransition();
  const { ready, reservations, cancelReservation, pushToast } = useApp();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const reservation = reservations.find((item) => item.id === params.get('id')) ?? reservations[0];

  if (!ready) {
    return (
      <div>
        <ScreenHeader title="Noutokoodi" back="/oma" />
        <div className="flex flex-col items-center gap-4 px-6 pt-8">
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="h-[220px] w-[220px] rounded-[24px]" />
          <Skeleton className="h-20 w-full rounded-[18px]" />
        </div>
      </div>
    );
  }

  const product = reservation ? productById(reservation.productId) : undefined;
  const market = product ? marketById(product.marketId) : undefined;
  const seller = product ? sellerById(product.sellerId) : undefined;

  if (!reservation || !product || !market || !seller) {
    return (
      <div>
        <ScreenHeader title="Noutokoodi" back="/oma" />
        <EmptyState
          title="Varausta ei löytynyt"
          body="Varaus on ehkä jo noudettu tai peruttu."
          action={<Button href="/oma">Omat varaukset</Button>}
        />
      </div>
    );
  }

  const deadline = now ? deadlineFor(reservation.pickupWindow, new Date(reservation.createdAtIso)) : null;
  const countdown = deadline && now ? countdownLabel(deadline, now) : null;
  const bought = reservation.kind === 'osto';

  return (
    <div className="pb-10">
      <ScreenHeader title="Noutokoodi" back="/oma" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className="px-4 pt-3"
      >
        <div className="overflow-hidden rounded-[24px] bg-surface shadow-raised">
          <div className="flex items-center justify-between gap-3 border-b border-separator px-5 py-4">
            <BrandWordmark height={20} />
            <ConfirmMark label={bought ? 'Ostettu' : 'Varattu'} />
          </div>

          <div className="flex flex-col items-center px-5 pb-5 pt-6">
            <h2 className="t-title3">Näytä kassalla</h2>
            <div className="mt-4 rounded-[20px] bg-white p-4 shadow-card">
              <QRCode value={reservation.code} size={208} />
            </div>
            <p className="t-title2 mt-4 tracking-[0.18em]">{reservation.code}</p>
          </div>

          <dl className="grid grid-cols-2 gap-px border-t border-separator bg-separator">
            <PassField label="Nouda" value={countdown ?? reservation.pickupWindow} />
            <PassField label="Mistä" value={`${market.name}, ${product.tableNumber}`} />
          </dl>
        </div>
      </motion.div>

      <section className="px-4 pt-4">
        <Link
          href={`/tuote/${product.id}`}
          className="flex items-center gap-3 rounded-[18px] bg-surface p-3 shadow-card"
        >
          <span className="block h-16 w-16 shrink-0 overflow-hidden rounded-[13px] bg-cream-sink">
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
            <span className="t-subhead block text-brown-70">{price(reservation.totalEur)}</span>
          </span>
        </Link>
      </section>

      <section className="px-4 pt-4">
        <div className="rounded-[18px] bg-surface p-4 shadow-card">
          <Link href={`/kirpputori/${market.id}`} className="flex min-h-11 items-center gap-2">
            <LocationIcon size={18} className="shrink-0 text-brown" />
            <span className="min-w-0 flex-1">
              <span className="t-body block truncate">{market.name}</span>
              <span className="t-caption block truncate text-brown-70">{market.address}</span>
            </span>
          </Link>
          <Link
            href={`/myyja/${seller.id}`}
            className="flex min-h-11 items-center gap-2 border-t border-separator pt-2"
          >
            <TagIcon size={18} className="shrink-0 text-brown" />
            <span className="min-w-0 flex-1">
              <span className="t-body block truncate">
                {product.tableNumber}, {seller.name}
              </span>
              <span className="t-caption block text-brown-70">Pöytä löytyy kartasta</span>
            </span>
          </Link>
        </div>
      </section>

      <div className="flex flex-col items-center gap-3 px-4 pt-5">
        <Button full variant="secondary" href={`/kirpputori/${market.id}`} icon={<LocationIcon size={18} />}>
          Reitti pöydälle
        </Button>
        {bought ? null : (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="t-subhead min-h-11 px-4 font-semibold text-danger"
          >
            Peru varaus
          </button>
        )}
      </div>

      <Sheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Perutaanko varaus?"
        detents={[0.36]}
        ariaLabel="Peru varaus"
      >
        <div className="px-4 pb-6">
          <p className="t-subhead text-brown-70">
            Tuote palaa myyntiin heti, ja joku muu voi löytää sen. Voit varata uudelleen jos se on
            vielä vapaana.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Button
              full
              onClick={() => {
                cancelReservation(reservation.id);
                setConfirmOpen(false);
                pushToast({ title: 'Varaus peruttu', body: product.title });
                router.push('/oma');
              }}
            >
              Peru varaus
            </Button>
            <Button full variant="secondary" onClick={() => setConfirmOpen(false)}>
              Pidä varaus
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

/** One labelled field along the bottom of the pass, like a boarding pass. */
function PassField({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface px-5 py-3">
      <dt className="t-label text-brown-70">{label}</dt>
      <dd className="t-subhead mt-0.5 font-semibold">{value}</dd>
    </div>
  );
}

/**
 * One shot confirmation: the mark blooms once when the pass appears, then
 * rests. No loop, and nothing moves at all when motion is reduced, so the
 * reward is felt without the screen ever asking for attention again.
 */
function ConfirmMark({ label }: { label: string }) {
  const { motionEnabled } = useApp();
  const spring = { type: 'spring' as const, stiffness: 340, damping: 18, mass: 0.7 };
  return (
    <span className="inline-flex items-center gap-1.5 text-positive">
      <motion.span
        className="inline-flex"
        initial={motionEnabled ? { scale: 0.2, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={spring}
      >
        <CheckIcon size={16} />
      </motion.span>
      <motion.span
        className="t-subhead font-semibold"
        initial={motionEnabled ? { opacity: 0, x: -4 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...spring, delay: motionEnabled ? 0.08 : 0 }}
      >
        {label}
      </motion.span>
    </span>
  );
}
