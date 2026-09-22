/**
 * Image paths and fallbacks.
 *
 * Real files live in /assets and are copied to /public/assets by
 * `npm run sync-assets`, which also writes the manifest imported below. The
 * manifest records the extension each file really has, so a .png or a .webp
 * works just as well as a .jpg. Nothing ever renders as a broken image: a
 * missing file falls back to a branded placeholder drawn by <SafeImage>.
 */

import manifest from '@/data/assetManifest.json';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const ASSET_BASE = `${BASE_PATH}/assets`;

export type FallbackType = 'tuote' | 'kirpputori' | 'myyja' | 'logo';

const files = manifest as Record<string, string>;

/** Uses the real extension when the file is there, .jpg when it is not yet. */
function assetUrl(folder: string, name: string): string {
  return `${ASSET_BASE}/${folder}/${name}.${files[`${folder}/${name}`] ?? 'jpg'}`;
}

/** `prod-naiset-014` -> `/assets/product-photos/prod-naiset-014.jpg` */
export function productImage(name: string): string {
  return assetUrl('product-photos', name);
}

/** `market-ogeli-hki` -> `/assets/demo/market-ogeli-hki.jpg` */
export function marketImage(name: string): string {
  return assetUrl('demo', name);
}

/** `seller-anni-k` -> `/assets/demo/seller-anni-k.jpg` */
export function sellerImage(name: string): string {
  return assetUrl('demo', name);
}

/**
 * Real brand files, dropped into /assets/logos. The "light" variants are
 * cream coloured, for dark or photographic backgrounds.
 */
export const logos = {
  wordmark: `${ASSET_BASE}/logos/logo-wordmark.svg`,
  wordmarkLight: `${ASSET_BASE}/logos/logo-wordmark-light.svg`,
  mark: `${ASSET_BASE}/logos/logo-mark.svg`,
  markLight: `${ASSET_BASE}/logos/logo-mark-light.svg`,
};

export type ShapeName = 'star' | 'wave' | 'pebble';

/** Decorative brand shapes. They inherit the surrounding colour. */
export const shapes: Record<ShapeName, string> = {
  star: `${ASSET_BASE}/graphics/shape-star.svg`,
  wave: `${ASSET_BASE}/graphics/shape-wave.svg`,
  pebble: `${ASSET_BASE}/graphics/shape-pebble.svg`,
};

export type MascotPose = 'default' | 'wave' | 'search' | 'empty' | 'celebrate';

export const mascot: Record<MascotPose, string> = {
  default: `${ASSET_BASE}/graphics/connector-mascot.svg`,
  wave: `${ASSET_BASE}/graphics/connector-wave.svg`,
  search: `${ASSET_BASE}/graphics/connector-search.svg`,
  empty: `${ASSET_BASE}/graphics/connector-empty.svg`,
  celebrate: `${ASSET_BASE}/graphics/connector-celebrate.svg`,
};
