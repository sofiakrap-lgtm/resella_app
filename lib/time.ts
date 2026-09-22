import { Market, Weekday, WEEKDAYS, OpeningHour } from './mockData';

/** JS getDay() is Sunday first, the Finnish week starts on Monday. */
export function weekdayKey(date: Date): Weekday {
  const index = (date.getDay() + 6) % 7;
  return WEEKDAYS[index];
}

export function hoursForDay(market: Market, date: Date): OpeningHour | null {
  return market.hours[weekdayKey(date)];
}

function minutes(value: string): number {
  const [h, m] = value.split('.').map((part) => parseInt(part, 10));
  return h * 60 + (m || 0);
}

export function isOpenNow(market: Market, date: Date): boolean {
  const today = hoursForDay(market, date);
  if (!today) return false;
  const now = date.getHours() * 60 + date.getMinutes();
  return now >= minutes(today.open) && now < minutes(today.close);
}

/** True when the market is closed right now but opens later the same day. */
export function opensLaterToday(market: Market, date: Date): OpeningHour | null {
  const today = hoursForDay(market, date);
  if (!today) return null;
  const now = date.getHours() * 60 + date.getMinutes();
  return now < minutes(today.open) ? today : null;
}

/** Next day (within a week) that has opening hours, with its label. */
export function nextOpenDay(market: Market, date: Date): { day: Weekday; hours: OpeningHour } | null {
  for (let offset = 1; offset <= 7; offset += 1) {
    const candidate = new Date(date);
    candidate.setDate(candidate.getDate() + offset);
    const key = weekdayKey(candidate);
    const hours = market.hours[key];
    if (hours) return { day: key, hours };
  }
  return null;
}

export const WEEKDAY_LABELS: Record<Weekday, { fi: string; en: string }> = {
  ma: { fi: 'Maanantai', en: 'Monday' },
  ti: { fi: 'Tiistai', en: 'Tuesday' },
  ke: { fi: 'Keskiviikko', en: 'Wednesday' },
  to: { fi: 'Torstai', en: 'Thursday' },
  pe: { fi: 'Perjantai', en: 'Friday' },
  la: { fi: 'Lauantai', en: 'Saturday' },
  su: { fi: 'Sunnuntai', en: 'Sunday' },
};

export function relativeDayLabel(offset: number, language: 'fi' | 'en'): string {
  if (language === 'en') {
    return offset === 0 ? 'today' : offset === 1 ? 'tomorrow' : 'the day after tomorrow';
  }
  return offset === 0 ? 'tänään' : offset === 1 ? 'huomenna' : 'ylihuomenna';
}

/** Formats a Date as a Finnish style pickup deadline, for example "23.9. klo 18.00". */
export function formatPickupDeadline(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}. klo ${hour}.${minute}`;
}
