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

export type FallbackType = 'tuote' | 'kirpputori' | 'logo';

/**
 * Written by `npm run sync-assets`: for each folder, a map from the name the
 * data asks for to the file that is really on disk. The two differ because
 * the product sheet writes `Arc_teryx_Beta_LT.png` while the photo is saved
 * as `Arc'teryx Beta LT.png`, so neither has to be renamed to match.
 */
const files = manifest as Record<string, Record<string, string> | undefined>;

/**
 * Keys are names without an extension, because the file on disk may carry a
 * different one. When the manifest has no entry the file is not there yet,
 * and the guessed name simply 404s into <SafeImage>'s placeholder.
 */
function assetUrl(folder: string, key: string, fallbackExt: string): string {
  const file = files[folder]?.[key] ?? `${key}.${fallbackExt}`;
  return `${ASSET_BASE}/${folder}/${encodeURIComponent(file)}`;
}

/** `Arc_teryx_Beta_LT.png` -> the real file under /assets/product-photos. */
export function productImage(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  const key = dot > 0 ? fileName.slice(0, dot) : fileName;
  const ext = dot > 0 ? fileName.slice(dot + 1) : 'jpg';
  return assetUrl('product-photos', key, ext);
}

/** `market-ogeli-hki` -> `/assets/demo/market-ogeli-hki.jpg` */
export function marketImage(name: string): string {
  return assetUrl('demo', name, 'jpg');
}

/**
 * Real brand files, dropped into /assets/logos. The "light" variants are
 * cream coloured, for dark or photographic backgrounds.
 */
export const logos = {
  wordmark: assetUrl('logos', 'logo-wordmark', 'svg'),
  wordmarkLight: assetUrl('logos', 'logo-wordmark-light', 'svg'),
  mark: assetUrl('logos', 'logo-mark', 'svg'),
  markLight: assetUrl('logos', 'logo-mark-light', 'svg'),
};

export type ShapeName = 'star' | 'wave' | 'pebble';

/** Decorative brand shapes. They inherit the surrounding colour. */
export const shapes: Record<ShapeName, string> = {
  star: assetUrl('graphics', 'shape-star', 'svg'),
  wave: assetUrl('graphics', 'shape-wave', 'svg'),
  pebble: assetUrl('graphics', 'shape-pebble', 'svg'),
};

export type MascotPose =
  | 'default'
  | 'wave'
  | 'search'
  | 'empty'
  | 'celebrate'
  | 'henkari'
  | 'tuoli';

/**
 * The drawn set. Four of them are the character, two are objects that say
 * the same thing a character would in an empty list: a bare hanger, an empty
 * chair. There are four drawings of the character for five poses, so the
 * calm one covers both the default and the search slot; those two never
 * appear on the same screen, while reaching and searching did.
 */
export const mascot: Record<MascotPose, string> = {
  default: assetUrl('graphics', 'jooga-piirros', 'svg'),
  wave: assetUrl('graphics', 'kurottaa-piirros', 'svg'),
  search: assetUrl('graphics', 'jooga-piirros', 'svg'),
  empty: assetUrl('graphics', 'makoilee-piirros', 'svg'),
  celebrate: assetUrl('graphics', 'meditoi-piirros', 'svg'),
  henkari: assetUrl('graphics', 'henkari-sukat-piirros', 'svg'),
  tuoli: assetUrl('graphics', 'tuoli-piirros', 'svg'),
};
