/**
 * Image manifest.
 *
 * Real files live in /assets (see /assets/README.md) and are copied into
 * /public/assets by `npm run sync-assets`, which runs automatically before
 * `npm run dev` and `npm run build`. Every render goes through <SafeImage>,
 * so a missing file shows a branded placeholder instead of a broken image.
 */

export const ASSET_BASE = '/assets';

export const logos = {
  /** Full logo, logo mark plus wordmark. */
  primary: `${ASSET_BASE}/logos/resello-logo.svg`,
  /** Wordmark only. */
  wordmark: `${ASSET_BASE}/logos/resello-wordmark.svg`,
  /** Square app icon. */
  icon: `${ASSET_BASE}/logos/resello-icon.svg`,
};

export type MascotPose = 'default' | 'wave' | 'search' | 'empty' | 'celebrate';

export const mascot: Record<MascotPose, string> = {
  default: `${ASSET_BASE}/graphics/connector-mascot.svg`,
  wave: `${ASSET_BASE}/graphics/connector-wave.svg`,
  search: `${ASSET_BASE}/graphics/connector-search.svg`,
  empty: `${ASSET_BASE}/graphics/connector-empty.svg`,
  celebrate: `${ASSET_BASE}/graphics/connector-celebrate.svg`,
};

/** `product-photos/p-001` -> `/assets/product-photos/p-001.jpg` */
export function productPhotoUrl(key: string): string {
  return `${ASSET_BASE}/${key}.jpg`;
}

/** `market-ogeli` -> `/assets/demo/market-ogeli.jpg` */
export function marketPhotoUrl(key: string): string {
  return `${ASSET_BASE}/demo/${key}.jpg`;
}

/** Lifestyle and demo imagery, for example onboarding backdrops. */
export function demoImageUrl(name: string): string {
  return `${ASSET_BASE}/demo/${name}.jpg`;
}
