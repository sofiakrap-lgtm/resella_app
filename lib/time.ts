import type { Market, OpeningHours, Weekday } from './types';

export const WEEKDAYS: Weekday[] = ['ma', 'ti', 'ke', 'to', 'pe', 'la', 'su'];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  ma: 'Maanantai',
  ti: 'Tiistai',
  ke: 'Keskiviikko',
  to: 'Torstai',
  pe: 'Perjantai',
  la: 'Lauantai',
  su: 'Sunnuntai',
};

/** JS getDay() starts on Sunday, the Finnish week starts on Monday. */
export function weekdayKey(date: Date): Weekday {
  return WEEKDAYS[(date.getDay() + 6) % 7];
}

export function hoursToday(market: Market, date: Date): OpeningHours | null {
  return market.hours[weekdayKey(date)];
}

function minutes(value: string): number {
  const [h, m] = value.split('.').map((part) => parseInt(part, 10));
  return h * 60 + (m || 0);
}

export function isOpenNow(market: Market, date: Date): boolean {
  const today = hoursToday(market, date);
  if (!today) return false;
  const now = date.getHours() * 60 + date.getMinutes();
  return now >= minutes(today.open) && now < minutes(today.close);
}

/** Closed right now but opening later the same day. */
export function opensLaterToday(market: Market, date: Date): OpeningHours | null {
  const today = hoursToday(market, date);
  if (!today) return null;
  const now = date.getHours() * 60 + date.getMinutes();
  return now < minutes(today.open) ? today : null;
}

export function nextOpenDay(market: Market, date: Date): { day: Weekday; hours: OpeningHours } | null {
  for (let offset = 1; offset <= 7; offset += 1) {
    const candidate = new Date(date);
    candidate.setDate(candidate.getDate() + offset);
    const key = weekdayKey(candidate);
    const hours = market.hours[key];
    if (hours) return { day: key, hours };
  }
  return null;
}

/** "Avoinna klo 19.00 asti" or "Suljettu, avautuu huomenna 10.00". */
export function openStatusLabel(market: Market, date: Date): { open: boolean; label: string } {
  if (isOpenNow(market, date)) {
    return { open: true, label: `Avoinna klo ${hoursToday(market, date)!.close} asti` };
  }
  const later = opensLaterToday(market, date);
  if (later) return { open: false, label: `Suljettu, avautuu tänään ${later.open}` };
  const next = nextOpenDay(market, date);
  if (next) {
    return { open: false, label: `Suljettu, avautuu ${WEEKDAY_LABELS[next.day].toLowerCase()} ${next.hours.open}` };
  }
  return { open: false, label: 'Suljettu' };
}

/** Pickup windows offered in the reservation flow, within opening hours. */
export function pickupWindows(market: Market, date: Date): string[] {
  const today = hoursToday(market, date);
  const closing = today?.close ?? '18.00';
  const next = nextOpenDay(market, date);
  return [
    `2 tunnin sisällä`,
    `Tänään klo ${closing} mennessä`,
    next ? `Huomenna klo ${next.hours.close} mennessä` : 'Huomenna',
  ];
}

export function deadlineFor(window: string, date: Date): Date {
  const deadline = new Date(date);
  if (window.startsWith('2 tunnin')) {
    deadline.setHours(deadline.getHours() + 2);
    return deadline;
  }
  const time = window.match(/klo (\d{1,2})\.(\d{2})/);
  if (window.startsWith('Huomenna')) deadline.setDate(deadline.getDate() + 1);
  if (time) deadline.setHours(Number(time[1]), Number(time[2]), 0, 0);
  else deadline.setHours(18, 0, 0, 0);
  return deadline;
}

export function countdownLabel(deadline: Date, now: Date): string {
  const diff = deadline.getTime() - now.getTime();
  if (diff <= 0) return 'Noutoaika umpeutui';
  const hours = Math.floor(diff / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (hours >= 24) return `${Math.floor(hours / 24)} vrk aikaa`;
  if (hours > 0) return `${hours} h ${mins} min aikaa`;
  return `${mins} min aikaa`;
}
