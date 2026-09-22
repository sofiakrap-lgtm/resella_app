'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { seedNotifications } from '@/data/notifications';
import { productById } from '@/data/products';
import { minutesLabel } from '@/lib/format';
import { countdownLabel, deadlineFor } from '@/lib/time';
import { useApp, useNow } from '@/lib/state';
import { useStagger } from '@/lib/motion';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { RowSkeleton } from '@/components/ui/Skeleton';
import {
  ClockIcon,
  HeartIcon,
  SearchIcon,
  SparkleIcon,
  TagIcon,
} from '@/components/ui/Icons';
import type { AppNotification, NotificationKind } from '@/lib/types';

const icons: Record<NotificationKind, typeof ClockIcon> = {
  'uusi-tuote': SparkleIcon,
  hakuvahti: SearchIcon,
  muistutus: ClockIcon,
  hinta: TagIcon,
};

const kindLabels: Record<NotificationKind, string> = {
  'uusi-tuote': 'Uutta',
  hakuvahti: 'Hakuvahti',
  muistutus: 'Muistutus',
  hinta: 'Hinta',
};

/** Notification list. Everything here leads somewhere in one tap. */
export default function IlmoituksetPage() {
  const now = useNow();
  const { ready, reservations, readNotifications, markNotificationsRead } = useApp();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  /** Captured before the badge is cleared, so the unread marks still show once. */
  const [wasUnread, setWasUnread] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 300);
    return () => window.clearTimeout(timer);
  }, []);

  // Opening the screen clears the badge, the way a real inbox behaves.
  useEffect(() => {
    if (!ready || loading) return;
    setWasUnread(!readNotifications.includes('all'));
    markNotificationsRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, loading]);

  // A live reminder for every reservation, on top of the seeded list.
  const reminders = useMemo<AppNotification[]>(() => {
    if (!now) return [];
    return reservations.flatMap((reservation) => {
      if (reservation.kind !== 'varaus') return [];
      const product = productById(reservation.productId);
      if (!product) return [];
      const deadline = deadlineFor(reservation.pickupWindow, new Date(reservation.createdAtIso));
      return [
        {
          id: `rem-${reservation.id}`,
          kind: 'muistutus' as const,
          title: 'Muista noutaa varauksesi',
          body: `${product.title}, ${countdownLabel(deadline, now)}`,
          href: `/qr?id=${reservation.id}`,
          minutesAgo: Math.max(
            1,
            Math.round((now.getTime() - new Date(reservation.createdAtIso).getTime()) / 60_000),
          ),
        },
      ];
    });
  }, [reservations, now]);

  const items = [...reminders, ...seedNotifications];

  if (failed) {
    return (
      <div>
        <ScreenHeader title="Ilmoitukset" back />
        <ErrorState onRetry={() => setFailed(false)} />
      </div>
    );
  }

  return (
    <div className="pb-6">
      <ScreenHeader title="Ilmoitukset" back />

      <div className="px-4 pb-1 pt-2">
        <h1 className="t-title1">Ilmoitukset</h1>
        <p className="t-footnote mt-1 text-brown-70">
          {wasUnread ? `${seedNotifications.length} uutta` : 'Kaikki luettu'}
        </p>
      </div>

      {loading || !ready ? (
        <div className="mt-3">
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Ei ilmoituksia"
          body="Seuraa kirpputoria tai myyjää, niin kerromme heti kun uutta ilmestyy."
          action={
            <Button href="/selaa" icon={<HeartIcon size={18} />}>
              Etsi seurattavia
            </Button>
          }
        />
      ) : (
        <ul className="mt-2">
          {items.map((item, index) => (
            <NotificationRow key={item.id} item={item} index={index} fresh={wasUnread} />
          ))}
        </ul>
      )}

      <div className="flex flex-col items-center px-4 pt-6">
        <p className="t-caption text-center text-brown-70">
          Demon ilmoitukset ovat esimerkkejä.
        </p>
        <button
          type="button"
          onClick={() => setFailed(true)}
          className="t-caption min-h-11 px-4 text-brown-70 underline"
        >
          Näytä virhetila
        </button>
      </div>
    </div>
  );
}

function NotificationRow({
  item,
  index,
  fresh,
}: {
  item: AppNotification;
  index: number;
  fresh: boolean;
}) {
  const transition = useStagger(index);
  const Icon = icons[item.kind];

  return (
    <motion.li initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
      <Link
        href={item.href}
        className="flex items-start gap-3 border-b border-separator px-4 py-3"
        style={fresh ? { background: 'var(--color-cream-panel)' } : undefined}
      >
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-sink text-terracotta">
          <Icon size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="t-label block text-brown-70">{kindLabels[item.kind]}</span>
          <span className="t-headline block">{item.title}</span>
          <span className="t-subhead block text-brown-70">{item.body}</span>
          <span className="t-caption mt-0.5 block text-brown-70">
            {minutesLabel(item.minutesAgo)}
          </span>
        </span>
        {fresh ? (
          <span
            className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-terracotta"
            aria-label="Lukematon"
          />
        ) : null}
      </Link>
    </motion.li>
  );
}
