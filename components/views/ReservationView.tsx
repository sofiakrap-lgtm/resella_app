'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { productById } from '@/data/products';
import { marketById } from '@/data/markets';
import { sellerById } from '@/data/sellers';
import { price } from '@/lib/format';
import { pickupWindows } from '@/lib/time';
import { productImage } from '@/lib/imagePath';
import { useApp, useNow } from '@/lib/state';
import { useTransition } from '@/lib/motion';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SafeImage } from '@/components/ui/SafeImage';
import { Button } from '@/components/ui/Button';
import { Chip, Tag } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/StateViews';
import { ClockIcon, TagIcon, LocationIcon, CheckIcon } from '@/components/ui/Icons';

const SERVICE_FEE = 1.5;

/** Reserve for pickup, or buy now. Both end in a pickup QR at the counter. */
export function ReservationView() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const now = useNow();
  const transition = useTransition();
  const { reserve } = useApp();

  const buying = search.get('osta') === '1';
  const product = productById(params.id);
  const market = product ? marketById(product.marketId) : undefined;
  const seller = product ? sellerById(product.sellerId) : undefined;

  const windows = market && now ? pickupWindows(market, now) : ['2 tunnin sisällä'];
  const [pickup, setPickup] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'error'>('idle');

  if (!product || !market || !seller) {
    return (
      <div>
        <ScreenHeader title="Varaus" back />
        <EmptyState title="Tuotetta ei löytynyt" action={<Button href="/koti">Etusivulle</Button>} />
      </div>
    );
  }

  const pickupWindow = pickup ?? windows[1] ?? windows[0];
  const total = buying ? product.priceEur + SERVICE_FEE : product.priceEur;

  const submit = () => {
    if (!buying && phone.trim().length < 6) {
      setStatus('error');
      return;
    }
    setStatus('processing');
    setTimeout(() => {
      const reservation = reserve({
        productId: product.id,
        kind: buying ? 'osto' : 'varaus',
        pickupWindow,
        totalEur: total,
      });
      router.push(`/qr?id=${reservation.id}`);
    }, 1100);
  };

  return (
    <div className="pb-10">
      <ScreenHeader title={buying ? 'Osta nyt' : 'Varaa noudettavaksi'} back />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
        <Steps current={0} />

        <section className="px-4 pt-4">
          <h2 className="t-headline mb-2">Yhteenveto</h2>
          <div className="flex gap-3 rounded-[18px] bg-surface p-3 shadow-card">
            <span className="block h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[14px] bg-cream-sink">
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
              <span className="t-subhead block">{price(product.priceEur)}</span>
              <span className="t-footnote mt-1 flex flex-wrap items-center gap-x-2 text-brown-70">
                <span className="inline-flex items-center gap-1">
                  <LocationIcon size={14} />
                  {market.name}
                </span>
                <span className="inline-flex items-center gap-1">
                  <TagIcon size={14} />
                  {product.tableNumber}
                </span>
              </span>
              <span className="mt-1 flex flex-wrap gap-1.5">
                {product.size ? <Tag tone="accent">{product.size}</Tag> : null}
                <Tag>{seller.name}</Tag>
              </span>
            </span>
          </div>
        </section>

        <section className="px-4 pt-6">
          <h2 className="t-headline mb-2">Noutoaika</h2>
          <div className="flex flex-wrap gap-2">
            {windows.map((option) => (
              <Chip
                key={option}
                selected={pickupWindow === option}
                onClick={() => setPickup(option)}
                icon={<ClockIcon size={16} />}
              >
                {option}
              </Chip>
            ))}
          </div>
          <p className="t-footnote mt-2 text-brown-70">
            Tuote odottaa sinua kassalla. Jos et ehdi, varaus vapautuu takaisin myyntiin.
          </p>
        </section>

        {buying ? (
          <section className="px-4 pt-6">
            <h2 className="t-headline mb-2">Maksa nopeasti</h2>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={submit}
                className="flex min-h-[52px] items-center justify-center rounded-full bg-brown t-headline text-cream"
              >
                Apple Pay
              </button>
              <button
                type="button"
                onClick={submit}
                className="flex min-h-[52px] items-center justify-center rounded-full bg-[#5a78ff] t-headline text-white"
              >
                MobilePay
              </button>
            </div>
            <p className="t-caption mt-2 text-brown-70">Demossa maksu on esimerkki, mitään ei veloiteta.</p>
          </section>
        ) : (
          <section className="px-4 pt-6">
            <h2 className="t-headline mb-2">Yhteystieto</h2>
            <p className="t-footnote mb-2 text-brown-70">
              Voit varata ilman tiliä. Tarvitsemme vain puhelinnumeron, jotta kirpputori löytää
              varauksen.
            </p>
            <label className="block">
              <span className="t-caption block text-brown-70">Puhelinnumero</span>
              <input
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                inputMode="tel"
                placeholder="040 123 4567"
                aria-invalid={status === 'error'}
                className="t-body mt-1 min-h-11 w-full rounded-[12px] bg-surface px-3 shadow-card outline-none"
                style={{ boxShadow: status === 'error' ? '0 0 0 2px var(--color-danger)' : undefined }}
              />
            </label>
          </section>
        )}

        <section className="px-4 pt-6">
          <div className="rounded-[18px] bg-surface p-4 shadow-card">
            <Row label="Tuote" value={price(product.priceEur)} />
            {buying ? <Row label="ReSello-palvelumaksu" value={price(SERVICE_FEE)} /> : null}
            <div className="mt-2 border-t border-separator pt-2">
              <Row label="Yhteensä" value={price(total)} strong />
            </div>
          </div>
        </section>

        {status === 'error' ? (
          <p role="alert" className="t-subhead px-4 pt-3 text-danger">
            Tarkista puhelinnumero, niin voimme vahvistaa varauksen.
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
              ? 'Vahvistetaan'
              : buying
                ? `Maksa ${price(total)}`
                : 'Vahvista varaus'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex min-h-8 items-center justify-between">
      <span className={strong ? 't-headline' : 't-subhead text-brown-70'}>{label}</span>
      <span className={strong ? 't-headline' : 't-subhead'}>{value}</span>
    </div>
  );
}

/** Two steps, so the reservation reads as a path and not a purchase. */
function Steps({ current }: { current: 0 | 1 }) {
  const steps = ['Varaa', 'Nouda kassalta'];
  return (
    <ol className="flex items-center gap-2 px-4 pt-3">
      {steps.map((label, index) => (
        <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full t-caption font-semibold"
            style={{
              background:
                index <= current ? 'var(--color-terracotta-ink)' : 'var(--color-cream-sink)',
              color: index <= current ? 'var(--color-on-terracotta)' : 'var(--color-brown-70)',
            }}
          >
            {index + 1}
          </span>
          <span
            className="t-footnote min-w-0 truncate"
            style={{
              color: index <= current ? 'var(--color-brown)' : 'var(--color-brown-70)',
              fontWeight: index === current ? 600 : 400,
            }}
            aria-current={index === current ? 'step' : undefined}
          >
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}
