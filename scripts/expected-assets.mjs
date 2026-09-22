/**
 * The single source of truth for which image files the app expects.
 * Derived from /data, so the list can never drift from the mock data.
 * Used by both `npm run check-assets` and the KUVALISTA.md generator.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Images needed to walk the main demo path without a single placeholder. */
export const DEMO_PATH_PRODUCTS = [
  'p-naiset-001',
  'p-naiset-002',
  'p-lapset-017',
  'p-koti-027',
  'p-astiat-035',
  'p-asusteet-051',
];

export const DEMO_PATH_MARKETS = ['market-ogeli-hki', 'market-patina-hki'];
export const DEMO_PATH_SELLERS = ['seller-anni-k', 'seller-perhe-virtanen'];

export async function readExpected() {
  const [products, markets, sellers] = await Promise.all([
    readFile(path.join(root, 'data/products.ts'), 'utf8'),
    readFile(path.join(root, 'data/markets.ts'), 'utf8'),
    readFile(path.join(root, 'data/sellers.ts'), 'utf8'),
  ]);

  // `build({ id: 'p-naiset-001', ... category: 'naiset' ... })` -> prod-naiset-001
  const productImages = [...products.matchAll(/id: '(p-([a-z]+)-(\d+))'/g)].map(
    ([, , category, index]) => `prod-${category}-${index}`,
  );
  const marketImages = [...markets.matchAll(/coverImage: '([^']+)'/g)].map((m) => m[1]);
  const sellerImages = [...sellers.matchAll(/avatar: '([^']+)'/g)].map((m) => m[1]);

  return {
    logos: ['logo-wordmark', 'logo-wordmark-light', 'logo-mark', 'logo-mark-light'],
    graphics: [
      'shape-star',
      'shape-wave',
      'shape-pebble',
      'connector-mascot',
      'connector-wave',
      'connector-search',
      'connector-empty',
      'connector-celebrate',
    ],
    'product-photos': productImages.flatMap((name) => [name, `${name}-2`, `${name}-3`]),
    demo: [...marketImages, ...sellerImages],
    meta: { productImages, marketImages, sellerImages },
  };
}

/**
 * The subset that matters most: the screens shown in a live demo. Names are
 * intersected with what the data actually contains, so a stale id here can
 * never make the check unsatisfiable.
 */
export function demoPathNames(expected) {
  const wanted = [
    ...expected.logos,
    'shape-star',
    'shape-wave',
    'shape-pebble',
    ...DEMO_PATH_MARKETS,
    ...DEMO_PATH_SELLERS,
    ...DEMO_PATH_PRODUCTS.map((id) => `prod-${id.split('-')[1]}-${id.split('-')[2]}`),
  ];
  const known = new Set([
    ...expected.logos,
    ...expected.graphics,
    ...expected['product-photos'],
    ...expected.demo,
  ]);
  return new Set(wanted.filter((name) => known.has(name)));
}
