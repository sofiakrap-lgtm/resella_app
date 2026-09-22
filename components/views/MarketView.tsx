'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { marketById } from '@/data/markets';
import { sellersAtMarket } from '@/data/sellers';
import { productsByMarket, newToday } from '@/data/products';
import { marketImage } from '@/lib/imagePath';
import { distance, haversineKm, CITY_CENTERS } from '@/lib/format';
import { WEEKDAYS, WEEKDAY_LABELS, weekdayKey, openStatusLabel } from '@/lib/time';
import { emptyFilters, filtersToQuery } from '@/lib/filters';
import { useApp, useNow } from '@/lib/state';
import { useTransition } from '@/lib/motion';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SafeImage } from '@/components/ui/SafeImage';
import { Button, IconButton } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Chip';
import { Segmented } from '@/components/ui/Segmented';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { ProductCard } from '@/components/ProductCard';
import { SellerCard } from '@/components/SellerHeader';
import { MarketMap } from '@/components/MarketMap';
import { HeartIcon, ShareIcon, RouteIcon, ChevronDown, ClockIcon } from '@/components/ui/Icons';

type Segment = 'valikoima' | 'uutta' | 'myyjat';

/** Market page: the whole floor, what arrived today, and who sells here now. */
export function MarketView() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const now = useNow();
  const transition = useTransition();
  const { city, followedMarkets, toggleFollowMarket, pushToast } = useApp();
  const [segment, setSegment] = useState<Segment>('valikoima');
  const [hoursOpen, setHoursOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(8);

  const market = marketById(params.id);

  useEffect(() => {
    setFailed(search.get('demo') === 'error');
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 340);
    return () => window.clearTimeout(timer);
  }, [params.id]);

  const items = useMemo(
    () => (market ? productsByMarket(market.id).filter((product) => product.status !== 'Myyty') : []),
    [market],
  );
  const fresh = useMemo(() => (market ? newToday(market.id) : []), [market]);
  const sellers = useMemo(() => (market ? sellersAtMarket(market.id) : []), [market]);

  if (!market) {
    return (
      <div>
        <ScreenHeader title="Kirpputori" back />
        <EmptyState title="Kirpputoria ei löytynyt" action={<Button href="/selaa">Selaa kirpputoreja</Button>} />
      </div>
    );
  }

  if (failed) {
    return (
      <div>
        <ScreenHeader title={market.name} back />
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
        <ScreenHeader title={market.name} back />
        <Skeleton className="h-[200px] w-full rounded-none" />
        <div className="space-y-3 px-4 pt-4">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-[100px] w-full rounded-[18px]" />
        </div>
      </div>
    );
  }

  const following = followedMarkets.includes(market.id);
  const km = haversineKm(CITY_CENTERS[city] ?? CITY_CENTERS.Helsinki, market);
  const status = now ? openStatusLabel(market, now) : null;
  const todayKey = now ? weekdayKey(now) : null;

  return (
    <div>
      <ScreenHeader
        title={market.name}
        back
        transparent
        largeTitleBelow
        right={
          <>
            <IconButton
              ariaLabel={following ? 'Lopeta seuraaminen' : 'Seuraa kirpputoria'}
              active={following}
              onClick={() => toggleFollowMarket(market.id)}
            >
              <HeartIcon size={21} filled={following} />
            </IconButton>
            <IconButton
              ariaLabel="Jaa kirpputori"
              onClick={() => pushToast({ title: 'Linkki kopioitu', body: market.name })}
            >
              <ShareIcon size={20} />
            </IconButton>
          </>
        }
      />

      <div className="h-[200px] w-full bg-cream-sink">
        <SafeImage
          src={marketImage(market.coverImage)}
          alt={`${market.name}, kuva kirpputorilta`}
          label={market.name}
          fallbackType="kirpputori"
          className="h-full w-full object-cover"
          priority
        />
      </div>

      {status && !status.open ? (
        <div className="bg-cream-panel px-4 py-2.5">
          <p className="t-subhead text-warning">{status.label}</p>
        </div>
      ) : null}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
        <div className="px-4 pt-4">
          <h1 className="t-title2">{market.name}</h1>
          <p className="t-subhead mt-1 text-brown-70">
            {market.address}, {market.city}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Tag tone="accent">{`${items.length} tuotetta`}</Tag>
            <Tag>{distance(km)}</Tag>
          </div>
          <p className="t-subhead mt-3">{market.description}</p>
          <div className="mt-4 flex items-center gap-3">
            <Button
              variant={following ? 'secondary' : 'primary'}
              onClick={() => toggleFollowMarket(market.id)}
              icon={<HeartIcon size={18} filled={following} />}
            >
              {following ? 'Seurataan' : 'Seuraa'}
            </Button>
            <button
              type="button"
              onClick={() => pushToast({ title: 'Reittiohjeet', body: market.address })}
              className="t-subhead inline-flex min-h-11 items-center gap-1.5 font-semibold text-terracotta-ink"
            >
              <RouteIcon size={16} />
              Reittiohjeet
            </button>
          </div>
        </div>

        <section className="section">
          <div className="mx-4 overflow-hidden rounded-[16px] bg-cream shadow-card">
            <button
              type="button"
              onClick={() => setHoursOpen((current) => !current)}
              aria-expanded={hoursOpen}
              aria-label="Näytä aukioloajat"
              className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-2.5"
            >
              <span
                className="t-subhead inline-flex items-center gap-1.5 font-semibold"
                style={{ color: status?.open ? 'var(--color-positive)' : 'var(--color-brown-70)' }}
              >
                <ClockIcon size={16} />
                {status?.label ?? 'Aukioloajat'}
              </span>
              <ChevronDown
                size={18}
                className="shrink-0 text-brown-70 transition-transform"
                style={{ transform: hoursOpen ? 'rotate(180deg)' : undefined }}
              />
            </button>
            {hoursOpen ? (
              <ul className="divide-y divide-separator border-t border-separator">
                {WEEKDAYS.map((day) => {
                  const hours = market.hours[day];
                  const isToday = day === todayKey;
                  return (
                    <li
                      key={day}
                      className="flex min-h-11 items-center justify-between px-4 t-subhead"
                      style={{ fontWeight: isToday ? 600 : 400 }}
                    >
                      <span>{WEEKDAY_LABELS[day]}</span>
                      <span className={hours ? '' : 'text-brown-70'}>
                        {hours ? `${hours.open} - ${hours.close}` : 'Suljettu'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </section>

        <div className="mt-5 px-4">
          <Segmented
            ariaLabel="Kirpputorin näkymä"
            value={segment}
            onChange={setSegment}
            options={[
              { value: 'valikoima', label: 'Valikoima' },
              { value: 'uutta', label: 'Uutta tänään' },
              { value: 'myyjat', label: 'Myyjät' },
            ]}
          />
        </div>

        {segment === 'myyjat' ? (
          <section className="mt-3">
            {sellers.length === 0 ? (
              <EmptyState title="Ei aktiivisia myyjiä juuri nyt." />
            ) : (
              sellers.map((seller, index) => (
                <SellerCard key={seller.id} seller={seller} index={index} />
              ))
            )}
          </section>
        ) : (
          <section className="mt-3">
            {(segment === 'uutta' ? fresh : items).length === 0 ? (
              <EmptyState
                title="Ei tuotteita juuri nyt"
                body="Seuraa kirpputoria, niin näet uutuudet heti."
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 px-4">
                  {(segment === 'uutta' ? fresh : items).slice(0, visible).map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      fullWidth
                      hideMarket
                    />
                  ))}
                </div>
                {(segment === 'uutta' ? fresh : items).length > visible ? (
                  <div className="px-4 py-5">
                    <Button full variant="secondary" onClick={() => setVisible((current) => current + 8)}>
                      Näytä lisää
                    </Button>
                  </div>
                ) : (
                  <div className="px-4 py-5">
                    <Button
                      full
                      variant="secondary"
                      href={`/haku?${filtersToQuery({ ...emptyFilters, marketIds: [market.id] })}`}
                    >
                      Suodata tämän kirpputorin tuotteita
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        <section className="mt-2 px-4 pb-6">
          <div className="overflow-hidden rounded-[18px] bg-cream shadow-card">
            <MarketMap markets={[market]} className="h-[180px] w-full" />
            <p className="t-footnote px-4 py-3 text-brown-70">
              {market.address}, {market.city}. {market.tableCount} pöytää.
            </p>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
