'use client';

import { Market, WEEKDAYS } from '@/lib/mockData';
import { WEEKDAY_LABELS, hoursForDay, isOpenNow, nextOpenDay, opensLaterToday, weekdayKey } from '@/lib/time';
import { useApp, useNow } from '@/lib/state';
import { ClockIcon } from '@/components/ui/Icons';

/** Compact open or closed status. Renders nothing until the clock is known. */
export function OpenStatus({ market, className = '' }: { market: Market; className?: string }) {
  const { t, language } = useApp();
  const now = useNow();
  if (!now) return null;

  const open = isOpenNow(market, now);
  const today = hoursForDay(market, now);
  const laterToday = opensLaterToday(market, now);
  const next = nextOpenDay(market, now);

  const label = open
    ? `${t('common.open')}, ${t('market.openUntil')} ${today?.close}`
    : laterToday
      ? `${t('common.closed')}, ${t('market.opensAt')} ${t('common.today').toLowerCase()} ${laterToday.open}`
      : next
        ? `${t('common.closed')}, ${t('market.opensAt')} ${WEEKDAY_LABELS[next.day][language].toLowerCase()} ${next.hours.open}`
        : t('common.closed');

  return (
    <span
      className={`inline-flex items-center gap-1 t-footnote ${className}`}
      style={{ color: open ? 'var(--color-success)' : 'var(--color-text-secondary)' }}
    >
      <ClockIcon size={14} />
      {label}
    </span>
  );
}

/** Full week, today highlighted. */
export function OpeningHoursList({ market }: { market: Market }) {
  const { language } = useApp();
  const now = useNow();
  const todayKey = now ? weekdayKey(now) : null;

  return (
    <ul className="divide-y divide-separator">
      {WEEKDAYS.map((day) => {
        const hours = market.hours[day];
        const isToday = day === todayKey;
        return (
          <li
            key={day}
            className="flex min-h-11 items-center justify-between px-4 t-subhead"
            style={{ fontWeight: isToday ? 600 : 400 }}
          >
            <span>{WEEKDAY_LABELS[day][language]}</span>
            <span className={hours ? '' : 'text-ink-secondary'}>
              {hours ? `${hours.open} - ${hours.close}` : language === 'fi' ? 'Suljettu' : 'Closed'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
