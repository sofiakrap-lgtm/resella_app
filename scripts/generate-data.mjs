/**
 * Builds the typed data files from Sofia's product sheet.
 *
 *   npm run data
 *
 * data/source/tuotteet.csv is the source of truth for products, markets,
 * sellers and categories. data/source/paikat.json carries only what the sheet
 * does not: addresses, coordinates, opening hours and seller bios.
 *
 * Nothing in /data is edited by hand, so the app can never drift from the sheet.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Minimal RFC 4180 reader: quoted fields may contain commas. */
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

/** "Päällystakit" -> "paallystakit". Finnish letters fold to ASCII. */
function slug(value) {
  return value
    .toLowerCase()
    .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/å/g, 'a')
    .replace(/['’.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const ts = (value) => JSON.stringify(value).replace(/"([A-Za-z][A-Za-z0-9]*)":/g, '$1:');

/** Short blurbs so a category tile says what is behind it. */
const BLURBS = {
  kengat: 'Lenkkarit, maiharit ja korot',
  ylaosat: 'Neuleet, huput ja paidat',
  laukut: 'Reput, olkalaukut ja kassit',
  takit: 'Untuvat, farkkutakit ja tuulitakit',
  asusteet: 'Huivit, lasit ja lippikset',
  ulkoiluvaatteet: 'Kuoritakit, fleecet ja kerrastot',
  paallystakit: 'Villakangas, trenssit ja vahakangas',
  astiat: 'Mukit, lautaset ja lasit',
  housut: 'Farkut ja collegehousut',
  lastenvaatteet: 'Haalarit, setit ja paidat',
  urheiluvaatteet: 'Treeni, kerrastot ja leggingsit',
  mekot: 'Arkeen ja juhlaan',
  sisustus: 'Maljakot, kynttilänjalat ja koristeet',
  hameet: 'Mini ja midi',
  jakut: 'Bleiserit ja jakut',
  kodintekstiilit: 'Liinat ja tyynyt',
};

/** Icon key per category, see components/ui/Icons.tsx. */
const ICONS = {
  kengat: 'shoe', ylaosat: 'shirt', laukut: 'bag', takit: 'jacket',
  asusteet: 'glasses', ulkoiluvaatteet: 'shell', paallystakit: 'coat',
  astiat: 'cup', housut: 'trousers', lastenvaatteet: 'child',
  urheiluvaatteet: 'sport', mekot: 'dress', sisustus: 'lamp',
  hameet: 'skirt', jakut: 'blazer', kodintekstiilit: 'cushion',
};

/**
 * Days since listing, derived from the row number so the feed has arrivals
 * today and the value never changes between builds.
 */
function addedDaysAgo(index) {
  return [0, 0, 1, 3, 0, 5, 2, 8, 1, 14, 0, 4, 21, 2, 7][index % 15];
}

/** A few blocked items so the demo can show the reserved and sold states. */
const STATUS = {
  'RS-017': 'Varattu',
  'RS-046': 'Varattu',
  'RS-068': 'Myyty',
  'RS-090': 'Varattu',
  'RS-101': 'Myyty',
};

async function main() {
  const csv = parseCsv(await readFile(path.join(root, 'data/source/tuotteet.csv'), 'utf8'));
  const places = JSON.parse(await readFile(path.join(root, 'data/source/paikat.json'), 'utf8'));

  // --- categories, in the order the sheet puts most items in ---
  const order = [...new Set(csv.map((r) => r.Kategoria))].sort(
    (a, b) =>
      csv.filter((r) => r.Kategoria === b).length - csv.filter((r) => r.Kategoria === a).length,
  );
  const categories = order.map((name) => {
    const rows = csv.filter((r) => r.Kategoria === name);
    const key = slug(name);
    return {
      slug: key,
      name,
      blurb: BLURBS[key] ?? '',
      icon: ICONS[key] ?? 'bag',
      subcategories: [...new Set(rows.map((r) => r.Alakategoria))].sort(),
      sizes: [...new Set(rows.map((r) => r.Koko))].filter((s) => s && s !== 'Onesize').sort(),
      brands: [...new Set(rows.map((r) => r.Brändi))].sort(),
    };
  });

  // --- markets ---
  const markets = Object.entries(places.markets).map(([name, meta]) => ({
    id: meta.id,
    name,
    city: csv.find((r) => r.Kirpputori === name).Kaupunki,
    address: meta.address,
    description: meta.description,
    lat: meta.lat,
    lng: meta.lng,
    coverImage: `market-${meta.id}`,
    followerCount: meta.followerCount,
    tableCount: 60,
    hours: Object.fromEntries(
      Object.entries(meta.hours).map(([day, value]) => [
        day,
        value ? { open: value[0], close: value[1] } : null,
      ]),
    ),
  }));

  // --- sellers, each tied to the one market and table the sheet gives them ---
  const sellers = Object.entries(places.sellers).map(([code, meta]) => {
    const row = csv.find((r) => r.Myyjätunnus === code);
    if (!row) throw new Error(`Myyjää ${code} ei ole taulukossa`);
    return {
      id: meta.id,
      name: meta.name,
      avatar: `seller-${meta.id}`,
      bio: meta.bio,
      rating: meta.rating,
      reviewsCount: meta.reviewsCount,
      followerCount: meta.followerCount,
      currentMarketId: places.markets[row.Kirpputori].id,
      tableNumber: `Pöytä ${row.Pöytä}`,
      tableValidUntil: meta.tableValidUntil,
      isActive: true,
    };
  });

  // --- products ---
  const sellerByCode = Object.fromEntries(
    Object.entries(places.sellers).map(([code, meta]) => [code, meta.id]),
  );
  const products = csv.map((row, index) => {
    const marketId = places.markets[row.Kirpputori].id;
    const sellerId = sellerByCode[row.Myyjätunnus];
    if (!sellerId) throw new Error(`Tuntematon myyjätunnus ${row.Myyjätunnus} rivillä ${row.ID}`);
    return {
      id: row.ID.toLowerCase(),
      title: row.Tuote,
      brand: row.Brändi === 'Merkitön' ? null : row.Brändi,
      category: slug(row.Kategoria),
      subcategory: row.Alakategoria,
      size: row.Koko === 'Ei kokoa' ? null : row.Koko,
      audience: row.Kokotyyppi,
      color: row.Väri,
      condition: row.Kuntoluokka,
      priceEur: Number(row['Hinta (EUR)']),
      description: row['Kunnon kuvaus'],
      keywords: row.Hakusanat.split(',').map((k) => k.trim()).filter(Boolean),
      images: [row.Kuvatiedosto],
      sellerId,
      marketId,
      tableNumber: `Pöytä ${row.Pöytä}`,
      status: STATUS[row.ID] ?? 'Saatavilla',
      addedDaysAgo: addedDaysAgo(index),
    };
  });

  // --- seeds, all built from real rows so every one of them returns hits ---
  const pick = (fn) => csv.filter(fn);
  const kids = pick((r) => r.Kategoria === 'Lastenvaatteet');
  const iittala = pick((r) => r.Brändi === 'Iittala');
  const y2k = pick((r) => r.Hakusanat.includes('y2k'));
  const sneakers = pick((r) => r.Alakategoria === 'Lenkkarit');
  const outdoor = pick((r) => r.Kategoria === 'Ulkoiluvaatteet');

  const exampleSearches = [
    {
      label: 'lasten talvihaalari',
      filters: { query: 'haalari', categories: ['lastenvaatteet'] },
      note: `Haalareita ja ulkoiluasuja, ${kids.length} lastenvaatetta yhteensä.`,
    },
    {
      label: 'lenkkarit koko 40',
      filters: { query: '', categories: ['kengat'], sizes: ['40'] },
      note: 'Kengät koossa 40, kaikilta kirpputoreilta.',
    },
    {
      label: 'Iittala',
      filters: { query: '', brands: ['Iittala'] },
      note: `Iittalaa pöydillä juuri nyt, ${iittala.length} kappaletta.`,
    },
    {
      label: 'Y2K',
      filters: { query: 'y2k' },
      note: `Kaksituhattaluvun alkua, ${y2k.length} löytöä.`,
    },
    {
      label: 'etsin miehelle kuoritakkia ulkoiluun, koko M',
      isAi: true,
      filters: { query: 'kuoritakki', audiences: ['Miesten'], sizes: ['M'] },
      note: 'Tulkitsin haun näin: kuoritakki, miesten, koko M.',
    },
  ];

  const savedSearches = [
    {
      id: 'vahti-lenkkarit',
      label: 'Lenkkarit koko 40',
      query: '',
      filters: { categories: ['kengat'], sizes: ['40'] },
      newMatches: sneakers.filter((r) => r.Koko === '40').length,
    },
    {
      id: 'vahti-iittala',
      label: 'Iittala alle 50 euroa',
      query: '',
      filters: { brands: ['Iittala'], maxPrice: 50 },
      newMatches: iittala.filter((r) => Number(r['Hinta (EUR)']) <= 50).length,
    },
    {
      id: 'vahti-ulkoilu',
      label: 'Ulkoiluvaatteet Helsingissä',
      query: '',
      filters: { categories: ['ulkoiluvaatteet'], cities: ['Helsinki'] },
      newMatches: 0,
    },
  ];

  /** Rows the notifications point at, so every tap lands on a real product. */
  const euro = (value) => `${value.toFixed(2).replace('.', ',')} €`;
  const newest = products.find((p) => p.addedDaysAgo === 0 && p.status === 'Saatavilla');
  const newestSeller = sellers.find((s) => s.id === newest.sellerId);
  // A different row from the one above, so the two notifications do not
  // point at the same product.
  const dropped = products.find(
    (p) => p.id !== newest.id && p.priceEur > 100 && p.status === 'Saatavilla',
  );
  const busiest = markets
    .map((m) => ({ m, n: products.filter((p) => p.marketId === m.id && p.addedDaysAgo === 0).length }))
    .sort((a, b) => b.n - a.n)[0];

  const notifications = [
    {
      id: 'n-1',
      kind: 'uusi-tuote',
      title: `${newestSeller.name} lisäsi uuden tuotteen`,
      body: `${newest.title}${newest.size ? `, koko ${newest.size}` : ''}, ${euro(newest.priceEur)}`,
      href: `/tuote/${newest.id}`,
      minutesAgo: 12,
    },
    {
      id: 'n-2',
      kind: 'hakuvahti',
      title: 'Hakuvahti osui',
      body: `Lenkkarit koko 40: ${savedSearches[0].newMatches} osumaa`,
      href: '/haku?cat=kengat&size=40',
      minutesAgo: 95,
    },
    {
      id: 'n-3',
      kind: 'uusi-tuote',
      title: `${busiest.m.name}, uutta tänään`,
      body: `${busiest.n} uutta tuotetta seuraamallasi kirpputorilla`,
      href: `/kirpputori/${busiest.m.id}`,
      minutesAgo: 240,
    },
    {
      id: 'n-4',
      kind: 'hinta',
      title: 'Toivelistan tuote halpeni',
      body: `${dropped.title}, nyt ${euro(dropped.priceEur)}`,
      href: `/tuote/${dropped.id}`,
      minutesAgo: 1450,
    },
  ];

  const banner = `/**\n * GENEROITU TIEDOSTO, ÄLÄ MUOKKAA KÄSIN.\n * Luodaan komennolla \`npm run data\` tiedostoista\n * data/source/tuotteet.csv ja data/source/paikat.json.\n */\n`;

  await writeFile(
    path.join(root, 'data/categories.ts'),
    `${banner}import type { Category } from '@/lib/types';\n\nexport const categories: Category[] = ${ts(categories)};\n\nexport function categoryBySlug(slug: string): Category | undefined {\n  return categories.find((category) => category.slug === slug);\n}\n\nexport const allColors = ${ts([...new Set(csv.map((r) => r.Väri))].sort())};\n\nexport const allConditions = ${ts(['Erinomainen', 'Hyvä', 'Kohtalainen', 'Kulunut'])} as const;\n\nexport const allAudiences = ${ts([...new Set(csv.map((r) => r.Kokotyyppi))].sort())} as const;\n`,
  );

  await writeFile(
    path.join(root, 'data/markets.ts'),
    `${banner}import type { Market } from '@/lib/types';\n\nexport const markets: Market[] = ${ts(markets)};\n\nexport function marketById(id: string): Market | undefined {\n  return markets.find((market) => market.id === id);\n}\n\nexport const cities: string[] = ${ts([...new Set(markets.map((m) => m.city))].sort())};\n`,
  );

  await writeFile(
    path.join(root, 'data/sellers.ts'),
    `${banner}import type { Seller } from '@/lib/types';\n\nexport const sellers: Seller[] = ${ts(sellers)};\n\nexport function sellerById(id: string): Seller | undefined {\n  return sellers.find((seller) => seller.id === id);\n}\n\nexport function sellersAtMarket(marketId: string): Seller[] {\n  return sellers.filter((seller) => seller.isActive && seller.currentMarketId === marketId);\n}\n`,
  );

  await writeFile(
    path.join(root, 'data/products.ts'),
    `${banner}import type { Product } from '@/lib/types';\n\nexport const products: Product[] = ${ts(products)};\n\nexport function productById(id: string): Product | undefined {\n  return products.find((product) => product.id === id);\n}\n\nexport function productsByMarket(marketId: string): Product[] {\n  return products.filter((product) => product.marketId === marketId);\n}\n\nexport function productsBySeller(sellerId: string): Product[] {\n  return products.filter((product) => product.sellerId === sellerId);\n}\n\nexport function productsByCategory(slug: string): Product[] {\n  return products.filter((product) => product.category === slug);\n}\n\n/** Listed today and still available. */\nexport function newToday(): Product[] {\n  return products.filter((product) => product.addedDaysAgo === 0 && product.status === 'Saatavilla');\n}\n\nexport function newTodayCount(marketId: string): number {\n  return newToday().filter((product) => product.marketId === marketId).length;\n}\n`,
  );

  await writeFile(
    path.join(root, 'data/exampleSearches.ts'),
    `${banner}import type { Filters } from '@/lib/types';\nimport { emptyFilters } from '@/lib/filters';\n\nexport interface ExampleSearch {\n  label: string;\n  /** Marked as a natural language query, shown with a sparkle. */\n  isAi?: boolean;\n  filters: Filters;\n  /** Short line shown above the results. */\n  note: string;\n}\n\nconst raw = ${ts(exampleSearches)};\n\nexport const exampleSearches: ExampleSearch[] = raw.map((item) => ({\n  ...item,\n  filters: { ...emptyFilters, ...item.filters } as Filters,\n}));\n`,
  );

  await writeFile(
    path.join(root, 'data/savedSearches.ts'),
    `${banner}import type { SavedSearch } from '@/lib/types';\n\n/** Seeded search alerts, shown under Toivelista. */\nexport const seedSavedSearches: SavedSearch[] = ${ts(savedSearches)};\n`,
  );

  await writeFile(
    path.join(root, 'data/notifications.ts'),
    `${banner}import type { AppNotification } from '@/lib/types';\n\n/** Seeded notifications. Tapping one opens the screen it talks about. */\nexport const seedNotifications: AppNotification[] = ${ts(notifications)};\n`,
  );

  console.log(
    `[data] ${products.length} tuotetta, ${markets.length} kirpputoria, ${sellers.length} myyjää, ${categories.length} kategoriaa`,
  );
}

main().catch((error) => {
  console.error('[data] epäonnistui', error);
  process.exitCode = 1;
});
