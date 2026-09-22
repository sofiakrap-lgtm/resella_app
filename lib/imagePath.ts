/**
 * Image paths and fallbacks.
 *
 * Real files live in /assets and are copied to /public/assets by
 * `npm run sync-assets`. Nothing ever renders as a broken image: a missing file
 * falls back to a branded placeholder drawn by <SafeImage>.
 */

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const ASSET_BASE = `${BASE_PATH}/assets`;

export type FallbackType = 'tuote' | 'kirpputori' | 'myyja' | 'logo';

/** `prod-naiset-014` -> `/assets/product-photos/prod-naiset-014.jpg` */
export function productImage(name: string): string {
  return `${ASSET_BASE}/product-photos/${name}.jpg`;
}

/** `market-ogeli-hki` -> `/assets/demo/market-ogeli-hki.jpg` */
export function marketImage(name: string): string {
  return `${ASSET_BASE}/demo/${name}.jpg`;
}

/** `seller-anni-k` -> `/assets/demo/seller-anni-k.jpg` */
export function sellerImage(name: string): string {
  return `${ASSET_BASE}/demo/${name}.jpg`;
}

export const logos = {
  primary: `${ASSET_BASE}/logos/resello-logo.svg`,
  wordmark: `${ASSET_BASE}/logos/resello-wordmark.svg`,
};

export type MascotPose = 'default' | 'wave' | 'search' | 'empty' | 'celebrate';

export const mascot: Record<MascotPose, string> = {
  default: `${ASSET_BASE}/graphics/connector-mascot.svg`,
  wave: `${ASSET_BASE}/graphics/connector-wave.svg`,
  search: `${ASSET_BASE}/graphics/connector-search.svg`,
  empty: `${ASSET_BASE}/graphics/connector-empty.svg`,
  celebrate: `${ASSET_BASE}/graphics/connector-celebrate.svg`,
};
