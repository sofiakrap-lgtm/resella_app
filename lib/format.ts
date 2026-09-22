/** Finnish formatting helpers. Prices use a comma and a plain euro sign. */

export function price(value: number): string {
  return `${value.toFixed(2).replace('.', ',')} €`;
}

export function addedLabel(daysAgo: number): string {
  if (daysAgo === 0) return 'Tänään';
  if (daysAgo === 1) return 'Eilen';
  if (daysAgo < 7) return `${daysAgo} päivää sitten`;
  return `${Math.floor(daysAgo / 7)} viikkoa sitten`;
}

export function minutesLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min sitten`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h sitten`;
  return `${Math.floor(hours / 24)} pv sitten`;
}

export function rating(value: number): string {
  return value.toFixed(1).replace('.', ',');
}

export function distance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace('.', ',')} km`;
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  Helsinki: { lat: 60.1699, lng: 24.9384 },
  Tampere: { lat: 61.4978, lng: 23.761 },
  Turku: { lat: 60.4518, lng: 22.2666 },
  Oulu: { lat: 65.0121, lng: 25.4651 },
  Jyväskylä: { lat: 62.2426, lng: 25.7473 },
  Vihti: { lat: 60.3345, lng: 24.33 },
  Rauma: { lat: 61.129, lng: 21.5114 },
  Salo: { lat: 60.3833, lng: 23.1333 },
};

/** Finnish place inflection, kept as a lookup so copy reads naturally. */
const CITY_IN: Record<string, string> = {
  Helsinki: 'Helsingissä',
  Tampere: 'Tampereella',
  Turku: 'Turussa',
  Oulu: 'Oulussa',
  Jyväskylä: 'Jyväskylässä',
  Vihti: 'Vihdissä',
  Rauma: 'Raumalla',
  Salo: 'Salossa',
};

export function inCity(city: string): string {
  return CITY_IN[city] ?? city;
}
