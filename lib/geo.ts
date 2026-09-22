/** Simple geo helpers for the demo. No external services, no API keys. */

export interface LatLng {
  lat: number;
  lng: number;
}

export const CITY_CENTERS: Record<string, LatLng> = {
  Helsinki: { lat: 60.1699, lng: 24.9384 },
  Espoo: { lat: 60.2055, lng: 24.6559 },
  Vantaa: { lat: 60.2934, lng: 25.0378 },
  Tampere: { lat: 61.4978, lng: 23.761 },
  Turku: { lat: 60.4518, lng: 22.2666 },
  Oulu: { lat: 65.0121, lng: 25.4651 },
  Lahti: { lat: 60.9827, lng: 25.6615 },
  Jyväskylä: { lat: 62.2426, lng: 25.7473 },
  Salo: { lat: 60.3833, lng: 23.1333 },
  Rauma: { lat: 61.129, lng: 21.5114 },
  Vihti: { lat: 60.3345, lng: 24.33 },
};

/** Scandic Oulu City, used by the scripted travel query. */
export const SCANDIC_OULU: LatLng & { name: string } = {
  name: 'Scandic Oulu City',
  lat: 65.0119,
  lng: 25.469,
};

export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Finnish decimal comma, for example "2,1 km". */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace('.', ',')} km`;
}

/**
 * Projects a coordinate into a 0..1 box for the mock map.
 * Bounds are padded so pins never touch the edges.
 */
export function project(point: LatLng, bounds: { north: number; south: number; east: number; west: number }) {
  const x = (point.lng - bounds.west) / (bounds.east - bounds.west);
  const y = (bounds.north - point.lat) / (bounds.north - bounds.south);
  return { x: Math.min(0.94, Math.max(0.06, x)), y: Math.min(0.92, Math.max(0.08, y)) };
}

export function boundsFor(points: LatLng[], padding = 0.35) {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const north = Math.max(...lats);
  const south = Math.min(...lats);
  const east = Math.max(...lngs);
  const west = Math.min(...lngs);
  const padLat = Math.max((north - south) * padding, 0.01);
  const padLng = Math.max((east - west) * padding, 0.02);
  return {
    north: north + padLat,
    south: south - padLat,
    east: east + padLng,
    west: west - padLng,
  };
}
