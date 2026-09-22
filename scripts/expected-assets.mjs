/**
 * The single source of truth for which image files the app expects.
 * Read from the same product sheet the data is generated from, so the list
 * can never drift from what the app renders.
 *
 * Used by `npm run check-assets` and by the KUVALISTA.md generator.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Minimal RFC 4180 reader, shared shape with generate-data.mjs. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1; } else quoted = false;
      } else field += char;
      continue;
    }
    if (char === '"') { quoted = true; continue; }
    if (char === ',') { row.push(field); field = ''; continue; }
    if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    if (char === '\r') continue;
    field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...rest] = rows;
  return rest
    .filter((r) => r.length === header.length && r[0])
    .map((r) => Object.fromEntries(header.map((key, index) => [key.trim(), r[index].trim()])));
}

const stripExt = (name) => name.replace(/\.[^.]+$/, '');

export async function readExpected() {
  const [csvText, placesText] = await Promise.all([
    readFile(path.join(root, 'data/source/tuotteet.csv'), 'utf8'),
    readFile(path.join(root, 'data/source/paikat.json'), 'utf8'),
  ]);
  const csv = parseCsv(csvText);
  const places = JSON.parse(placesText);

  const productImages = csv.map((row) => stripExt(row.Kuvatiedosto));
  const marketImages = Object.values(places.markets).map((m) => `market-${m.id}`);
  const sellerImages = Object.values(places.sellers).map((s) => `seller-${s.id}`);

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
    'product-photos': productImages,
    demo: [...marketImages, ...sellerImages],
    meta: { csv, places, productImages, marketImages, sellerImages },
  };
}

/**
 * The subset that matters most: what a live demo actually walks through.
 * Intersected with what the sheet contains, so a stale name here can never
 * make the check unsatisfiable.
 */
export function demoPathNames(expected) {
  const { meta } = expected;
  // The two busiest markets and their sellers, plus the first item of each.
  const busiest = [...new Set(meta.csv.map((r) => r.Kirpputori))]
    .sort(
      (a, b) =>
        meta.csv.filter((r) => r.Kirpputori === b).length -
        meta.csv.filter((r) => r.Kirpputori === a).length,
    )
    .slice(0, 2);

  const wanted = [
    ...expected.logos,
    'shape-star',
    'shape-wave',
    'shape-pebble',
    ...busiest.map((name) => `market-${meta.places.markets[name].id}`),
    ...[...new Set(meta.csv.filter((r) => busiest.includes(r.Kirpputori)).map((r) => r.Myyjätunnus))]
      .map((code) => `seller-${meta.places.sellers[code].id}`),
    ...meta.csv.slice(0, 12).map((r) => stripExt(r.Kuvatiedosto)),
  ];

  const known = new Set([
    ...expected.logos,
    ...expected.graphics,
    ...expected['product-photos'],
    ...expected.demo,
  ]);
  return new Set(wanted.filter((name) => known.has(name)));
}
