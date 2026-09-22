'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { formatPrice, marketById, productById } from '@/lib/mockData';
import { useApp } from '@/lib/state';
import { useTransition } from '@/lib/motion';
import { formatPickupDeadline } from '@/lib/time';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Mascot } from '@/components/ui/Mascot';
import { Button } from '@/components/ui/Button';
import { QRCode } from '@/components/ui/QRCode';
import { EmptyState } from '@/components/ui/StateViews';
import { RouteIcon, BookmarkIcon } from '@/components/ui/Icons';

export default function ReceiptPage() {
  const params = useParams<{ id: string }>();
  const { t, reservations, pushToast } = useApp();
  const transition = useTransition('lively');

  const reservation = reservations.find((entry) => entry.id === params.id);
  const product = reservation ? productById(reservation.productId) : undefined;
  const market = product ? marketById(product.marketId) : undefined;

  if (!reservation || !product || !market) {
    return (
      <div>
        <ScreenHeader title={t('receipt.code')} back="/home" />
        <EmptyState title={t('profile.noReservations')} action={<Button href="/home">{t('tab.home')}</Button>} />
      </div>
    );
  }

  const deadline = new Date(
    new Date(reservation.createdAtIso).getTime() + reservation.pickupHours * 3600 * 1000,
  );

  return (
    <div className="pb-10">
      <ScreenHeader title={t('receipt.code')} back="/home" />

      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={transition}
        className="px-4 pt-4 text-center"
      >
        <Mascot pose="celebrate" size={120} className="mx-auto" />
        <h1 className="t-title1 mt-3">
          {reservation.kind === 'purchase' ? t('receipt.boughtTitle') : t('receipt.reservedTitle')}
        </h1>
        <p className="t-subhead mt-1 text-ink-secondary">{t('receipt.body')}</p>
      </motion.div>

      {/* Wallet style pass */}
      <motion.section
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={transition}
        className="mx-4 mt-5 overflow-hidden rounded-[22px] bg-surface shadow-raised"
      >
        <div className="bg-accent px-4 py-3 text-on-accent">
          <p className="t-caption1 opacity-90">{t('app.name')}</p>
          <p className="t-headline">{market.name}</p>
        </div>

        <div className="flex flex-col items-center px-4 py-5">
          <div className="rounded-[16px] bg-white p-3 shadow-card">
            <QRCode value={reservation.code} />
          </div>
          <p className="t-title3 mt-3 tracking-[0.2em]">{reservation.code}</p>
          <p className="t-footnote mt-1 text-ink-secondary">{t('receipt.body')}</p>
        </div>

        <dl className="divide-y divide-separator border-t border-separator">
          <Line label={t('receipt.item')} value={product.title} />
          <Line label={t('receipt.spot')} value={product.spot} />
          <Line label={t('receipt.market')} value={`${market.address}, ${market.city}`} />
          <Line label={t('receipt.pickupBy')} value={formatPickupDeadline(deadline)} />
          <Line label={t('receipt.price')} value={formatPrice(reservation.total)} />
        </dl>
      </motion.section>

      <div className="mt-5 flex flex-col gap-2 px-4">
        <Button
          full
          variant="secondary"
          icon={<RouteIcon size={18} />}
          onClick={() => pushToast({ title: t('receipt.directions'), body: market.address })}
        >
          {t('receipt.directions')}
        </Button>
        <Button
          full
          variant="secondary"
          icon={<BookmarkIcon size={18} />}
          onClick={() => pushToast({ title: t('receipt.addToWallet'), body: reservation.code })}
        >
          {t('receipt.addToWallet')}
        </Button>
        <Button full href="/home">
          {t('common.done')}
        </Button>
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-2.5">
      <dt className="t-subhead shrink-0 text-ink-secondary">{label}</dt>
      <dd className="t-subhead text-right">{value}</dd>
    </div>
  );
}
