'use client';

import { Suspense, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { formatPrice, marketById, productById } from '@/lib/mockData';
import { useApp } from '@/lib/state';
import { useTransition } from '@/lib/motion';
import { productPhotoUrl } from '@/lib/assets';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SafeImage } from '@/components/ui/SafeImage';
import { Button } from '@/components/ui/Button';
import { Chip, Tag } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/StateViews';
import { Skeleton } from '@/components/ui/Skeleton';
import { ClockIcon, TagIcon, LocationIcon, CheckIcon } from '@/components/ui/Icons';

const SERVICE_FEE = 1.5;

export function ReserveView() {
  return <ReserveContent />;
}

function ReserveContent() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const { t, addReservation } = useApp();
  const transition = useTransition();

  const buying = search.get('buy') === '1';
  const product = productById(params.id);
  const market = product ? marketById(product.marketId) : undefined;

  const [pickupHours, setPickupHours] = useState(24);
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' });
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'error'>('idle');

  if (!product || !market) {
    return (
      <div>
        <ScreenHeader title={t('reserve.title')} back />
        <EmptyState title={t('results.emptyTitle')} action={<Button href="/home">{t('tab.home')}</Button>} />
      </div>
    );
  }

  const total = buying ? product.price + SERVICE_FEE : product.price;

  const submit = () => {
    if (!buying && phone.trim().length < 6) {
      setStatus('error');
      return;
    }
    setStatus('processing');
    window.setTimeout(() => {
      const reservation = addReservation({
        productId: product.id,
        kind: buying ? 'purchase' : 'reservation',
        pickupHours,
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        total,
      });
      router.push(`/receipt?id=${reservation.id}`);
    }, 1100);
  };

  return (
    <div className="pb-10">
      <ScreenHeader title={buying ? t('reserve.buyTitle') : t('reserve.title')} back />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
        {/* Summary */}
        <section className="px-4 pt-4">
          <h2 className="t-headline mb-2">{t('reserve.summary')}</h2>
          <div className="flex gap-3 rounded-[18px] bg-surface p-3 shadow-card">
            <span className="block h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[14px] bg-surface-2">
              <SafeImage
                src={productPhotoUrl(product.photos[0])}
                alt={product.title}
                label={product.title}
                className="h-full w-full object-cover"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="t-headline block truncate">{product.title}</span>
              <span className="t-subhead block">{formatPrice(product.price)}</span>
              <span className="t-footnote mt-1 flex flex-wrap items-center gap-x-2 text-ink-secondary">
                <span className="inline-flex items-center gap-1">
                  <LocationIcon size={14} />
                  {market.name}
                </span>
                <span className="inline-flex items-center gap-1">
                  <TagIcon size={14} />
                  {product.spot}
                </span>
              </span>
              <span className="mt-1 flex flex-wrap gap-1.5">
                {product.size ? <Tag tone="accent">{product.size}</Tag> : null}
                <Tag>{product.condition}</Tag>
              </span>
            </span>
          </div>
        </section>

        {buying ? (
          <>
            {/* Express payment always sits above any form field */}
            <section className="px-4 pt-6">
              <h2 className="t-headline mb-2">{t('reserve.expressPay')}</h2>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={submit}
                  className="flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-black t-headline text-white"
                >
                   {t('reserve.applePay')}
                </button>
                <button
                  type="button"
                  onClick={submit}
                  className="flex min-h-[52px] items-center justify-center rounded-full bg-[#5a78ff] t-headline text-white"
                >
                  {t('reserve.mobilePay')}
                </button>
              </div>
            </section>

            <section className="px-4 pt-6">
              <h2 className="t-headline mb-2">{t('reserve.orPayCard')}</h2>
              <div className="space-y-2">
                <Field
                  label={t('reserve.cardNumber')}
                  value={card.number}
                  onChange={(value) => setCard({ ...card, number: value })}
                  placeholder="4242 4242 4242 4242"
                  inputMode="numeric"
                />
                <div className="flex gap-2">
                  <Field
                    label={t('reserve.cardExpiry')}
                    value={card.expiry}
                    onChange={(value) => setCard({ ...card, expiry: value })}
                    placeholder="05/29"
                    inputMode="numeric"
                  />
                  <Field
                    label={t('reserve.cardCvc')}
                    value={card.cvc}
                    onChange={(value) => setCard({ ...card, cvc: value })}
                    placeholder="123"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="px-4 pt-6">
              <h2 className="t-headline mb-2">{t('reserve.pickupWindow')}</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  { hours: 6, label: t('reserve.windowToday') },
                  { hours: 24, label: t('reserve.window24') },
                  { hours: 48, label: t('reserve.window48') },
                ].map((option) => (
                  <Chip
                    key={option.hours}
                    selected={pickupHours === option.hours}
                    onClick={() => setPickupHours(option.hours)}
                    icon={<ClockIcon size={16} />}
                  >
                    {option.label}
                  </Chip>
                ))}
              </div>
            </section>

            <section className="px-4 pt-6">
              <p className="t-footnote mb-2 text-ink-secondary">{t('reserve.guestNote')}</p>
              <div className="space-y-2">
                <Field
                  label={`${t('reserve.name')}, ${t('reserve.optional')}`}
                  value={name}
                  onChange={setName}
                  placeholder="Sofia"
                />
                <Field
                  label={t('reserve.phone')}
                  value={phone}
                  onChange={(value) => {
                    setPhone(value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="040 123 4567"
                  inputMode="tel"
                  invalid={status === 'error'}
                />
              </div>
            </section>
          </>
        )}

        {/* Total */}
        <section className="px-4 pt-6">
          <div className="rounded-[18px] bg-surface p-4 shadow-card">
            <Row label={t('reserve.itemPrice')} value={formatPrice(product.price)} />
            {buying ? <Row label={t('reserve.serviceFee')} value={formatPrice(SERVICE_FEE)} /> : null}
            <div className="mt-2 border-t border-separator pt-2">
              <Row label={t('reserve.total')} value={formatPrice(total)} strong />
            </div>
          </div>
        </section>

        {status === 'error' ? (
          <p role="alert" className="t-subhead px-4 pt-3 text-danger">
            {t('reserve.error')}
          </p>
        ) : null}

        <div className="px-4 pt-5">
          <Button
            full
            size="lg"
            onClick={submit}
            disabled={status === 'processing'}
            icon={status === 'processing' ? undefined : <CheckIcon size={20} />}
          >
            {status === 'processing'
              ? t('reserve.processing')
              : buying
                ? `${t('reserve.payNow')} ${formatPrice(total)}`
                : t('reserve.confirm')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex min-h-8 items-center justify-between">
      <span className={strong ? 't-headline' : 't-subhead text-ink-secondary'}>{label}</span>
      <span className={strong ? 't-headline' : 't-subhead'}>{value}</span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  invalid = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: 'text' | 'numeric' | 'tel';
  invalid?: boolean;
}) {
  return (
    <label className="block w-full">
      <span className="t-footnote block text-ink-secondary">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        aria-invalid={invalid}
        className="t-body mt-1 min-h-11 w-full rounded-[12px] bg-surface px-3 py-2 shadow-card outline-none"
        style={{ boxShadow: invalid ? '0 0 0 2px var(--color-danger)' : undefined }}
      />
    </label>
  );
}
