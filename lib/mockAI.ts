/**
 * Deterministic stand in for the conversational search.
 *
 * In production this layer is retrieval based: an LLM turns the natural
 * language query into structured filters (category, size, condition, price,
 * city, market) and the answer is assembled from the POS product index, so the
 * model never invents items. Here the four demo queries are hand written and
 * everything else falls back to the ordinary keyword search over the same mock
 * index. No item is ever referenced that does not exist in mockData.
 */

import { Product, Market, marketById, productById, products, categoryCount } from './mockData';
import { filterProducts, emptyFilters } from './search';
import { SCANDIC_OULU } from './geo';

export interface AIAnswer {
  id: string;
  /** Short conversational reply, scannable, never a wall of text. */
  reply: string;
  /** Optional scannable lines rendered as a compact list under the reply. */
  bullets: string[];
  products: Product[];
  markets: Market[];
  followups: string[];
  /** Offers the route planner on the map. */
  action?: 'route';
  /** Named starting point used by the route planner, for example a hotel. */
  origin?: { name: string; lat: number; lng: number };
}

export const SCRIPTED_QUERIES = [
  'Etsin 7-vuotiaalle lapselleni haalaria ja asun Helsingin alueella, tarjoa sopivia kirpputoreja',
  'Onko Helsingin seudulla myynnissä juuri nyt Levi’s-farkkuja koossa S-M',
  'Olen menossa Ouluun vierailulle ja majoitun hotellissa Scandic Oulu, 5-vuotiaalle lapselle pitäisi ostaa mekko ylihuomisiin juhliin, suosittele paikkoja',
  'Muutan omilleni ja tarvitsen astioita, missä Lahden kirpputoreilla on paljon astioita',
];

function pick(ids: string[]): Product[] {
  return ids.map((id) => productById(id)).filter((p): p is Product => Boolean(p));
}

function pickMarkets(ids: string[]): Market[] {
  return ids.map((id) => marketById(id)).filter((m): m is Market => Boolean(m));
}

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replaceAll('ä', 'a')
    .replaceAll('ö', 'o')
    .replaceAll('’', "'")
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface Script {
  id: string;
  /** Each group is matched with OR, the score is the number of matched groups. */
  groups: string[][];
  threshold: number;
  build: () => AIAnswer;
}

const scripts: Script[] = [
  {
    id: 'kids-overall-helsinki',
    groups: [
      ['haalari', 'haalaria', 'haalarit', 'haalareita', 'overall'],
      ['7-vuotiaalle', '7 vuotiaalle', 'seitsem', '122', 'lapselleni', 'lapselle', 'lapsi'],
      ['helsin', 'paakaupunki', 'espoo', 'vantaa'],
    ],
    threshold: 2,
    build: () => ({
      id: 'kids-overall-helsinki',
      reply:
        '7-vuotiaalle sopii yleensä koko 122. Helsingissä on juuri nyt 4 haalaria siinä koossa, ja kolmessa kirppiksessä on paras valikoima.',
      bullets: [
        'Ogelin kirppis, Oulunkylä: 2 haalaria, pöytä 12 ja hylly A3, 18 ja 35 euroa',
        'Vekarakirppis, Konala: kurahaalari pöydässä 18, 20 euroa, koko lastenosasto samassa paikassa',
        'DoM Malmi ja Hertsikan Kirppis: sadehaalari ja välikausihaalari, 24 ja 28 euroa',
      ],
      products: pick(['p-001', 'p-002', 'p-007', 'p-004', 'p-003']),
      markets: pickMarkets(['m-ogeli', 'm-vekara', 'm-hertsika']),
      followups: [
        'Näytä vain alle 25 euron haalarit',
        'Mitkä näistä ovat auki tänään?',
        'Suunnittele kierros näihin kirppiksiin',
      ],
    }),
  },
  {
    id: 'levis-helsinki',
    groups: [
      ["levi's", 'levis', 'levi'],
      ['farkku', 'farkkuja', 'farkut', 'jeans', 'denim'],
      ['s-m', 'koossa', 'koko s', 'koko', ' s ', ' m '],
      ['helsin', 'paakaupunki', 'nyt', 'myynnissa'],
    ],
    threshold: 2,
    build: () => ({
      id: 'levis-helsinki',
      reply:
        'Kyllä. Helsingissä on nyt 4 Levi’s-farkkua koossa S tai M. Halvin on 15 euroa ja lähin löytyy Ogelin kirppikseltä.',
      bullets: [
        "Levi's 511 slim, koko S, uudenveroinen, 34 euroa, Ogelin kirppis, pöytä 8",
        "Levi's 721 korkeavyötäröiset, koko S, 27 euroa, Zirppari, hylly B2",
        "Levi's 501, koko M, 29 euroa, Kaivarin Kanuuna, pöytä 3",
        "Levi's 550, koko M, 15 euroa, DoM Malmi, pöytä 9",
      ],
      products: pick(['p-011', 'p-012', 'p-010', 'p-014']),
      markets: pickMarkets(['m-ogeli', 'm-zirppari', 'm-kanuuna']),
      followups: [
        'Näytä vain uudenveroiset',
        'Onko farkkutakkeja koossa M?',
        'Tallenna hakuvahti näille',
      ],
    }),
  },
  {
    id: 'oulu-dress',
    groups: [
      ['oulu', 'oulussa', 'ouluun', 'oulun'],
      ['mekko', 'mekon', 'mekkoa', 'juhla', 'juhliin'],
      ['5-vuotiaalle', '5 vuotiaalle', 'viisi', '110', 'lapselle'],
      ['scandic', 'hotelli', 'hotellissa', 'majoitu', 'vierailu'],
    ],
    threshold: 2,
    build: () => ({
      id: 'oulu-dress',
      reply:
        '5-vuotiaalle sopii yleensä koko 110. Scandic Oulu Cityn läheltä löytyy kaksi kirppistä, joissa on mekko siinä koossa ja jotka ovat auki huomenna, eli ennen ylihuomisia juhlia.',
      bullets: [
        'Koto Kirpputori, Isokatu 47, noin 400 m hotellilta, auki 10.00 - 18.00, kolme mekkoa koossa 110',
        'Oulun Iso Kirppis, Nuottasaarentie 5, noin 1,6 km, auki 10.00 - 19.00, kaksi mekkoa koossa 110',
        'Samalla käynnillä: juhlakengät koko 28, 15 euroa, Koto Kirpputori, hylly C2',
      ],
      products: pick(['p-021', 'p-020', 'p-074', 'p-024', 'p-022', 'p-025']),
      markets: pickMarkets(['m-koto', 'm-oulu-iso']),
      followups: [
        'Suunnittele kierros hotellilta',
        'Näytä vain uudenveroiset mekot',
        'Mitä muuta lapselle löytyy Oulusta?',
      ],
      action: 'route',
      origin: { name: SCANDIC_OULU.name, lat: SCANDIC_OULU.lat, lng: SCANDIC_OULU.lng },
    }),
  },
  {
    id: 'lahti-dishes',
    groups: [
      ['astia', 'astioita', 'astiat', 'lautas', 'muki', 'kuppi', 'lasit'],
      ['lahti', 'lahden', 'lahdessa'],
      ['muutan', 'omilleni', 'tarvitsen', 'ensiasunto'],
    ],
    threshold: 2,
    build: () => {
      const lanttila = categoryCount('m-lanttila', 'Astiat');
      const hyrra = categoryCount('m-hyrra', 'Astiat');
      return {
        id: 'lahti-dishes',
        reply: `Lahdessa astiavalikoima on selvästi laajin Perhekirppis Lanttilassa, ${lanttila} astiaerää myynnissä juuri nyt. Kirppis Hyrrässä on ${hyrra}.`,
        bullets: [
          `Perhekirppis Lanttila, Vesijärvenkatu 25: ${lanttila} erää, designastiat vitriineissä 1 ja 2, arkiastiat hyllyissä D1 ja D2`,
          `Kirppis Hyrrä, Aleksanterinkatu 18: ${hyrra} erää, kahvikupit ja lasit omalla osastollaan`,
          'Kokonaiseen aloituspakettiin pääsee noin 130 eurolla: lautaset, lasit, kulhot ja mukit',
        ],
        products: pick(['p-030', 'p-032', 'p-033', 'p-042', 'p-034', 'p-073', 'p-037', 'p-039']),
        markets: pickMarkets(['m-lanttila', 'm-hyrra']),
        followups: [
          'Näytä vain alle 30 euron astiat',
          'Kokoa aloituspaketti keittiöön',
          'Suunnittele kierros Lahdessa',
        ],
      };
    },
  },
];

/** Market level answer for a generic "where is there a lot of X" question. */
function marketRankingAnswer(query: string, category: Product['category'], city?: string): AIAnswer | null {
  const ranked = [...new Set(products.map((p) => p.marketId))]
    .map((marketId) => ({ market: marketById(marketId)!, count: categoryCount(marketId, category) }))
    .filter((entry) => entry.market && entry.count > 0 && (!city || entry.market.city === city))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  if (!ranked.length) return null;
  const matching = products.filter(
    (p) => p.category === category && p.status !== 'sold' && ranked.some((r) => r.market.id === p.marketId),
  );
  return {
    id: `ranking-${category}`,
    reply: `Parhaat paikat juuri nyt, kategoria ${category.toLowerCase()}${
      city ? `, ${CITY_IN[city] ?? city}` : ''
    }:`,
    bullets: ranked.map(
      (entry) => `${entry.market.name}, ${entry.market.city}: ${entry.count} tuotetta myynnissä`,
    ),
    products: matching.slice(0, 8),
    markets: ranked.map((entry) => entry.market),
    followups: ['Näytä halvimmat ensin', 'Mitkä ovat auki tänään?', 'Suunnittele kierros'],
  };
}

const CATEGORY_HINTS: Array<{ words: string[]; category: Product['category'] }> = [
  { words: ['astia', 'astioita', 'lautas', 'muki', 'kuppi', 'lasit', 'keittio'], category: 'Astiat' },
  { words: ['lapsi', 'lasten', 'haalari', 'vauva', 'rattaat'], category: 'Lastentarvikkeet' },
  { words: ['sisustus', 'tyyny', 'verho', 'maljakko', 'huonekalu'], category: 'Sisustus' },
  { words: ['vintage', 'retro', 'vanha'], category: 'Vintage' },
  { words: ['kengat', 'tennarit', 'saappaat'], category: 'Jalkineet' },
  { words: ['takki', 'paita', 'farkut', 'mekko', 'vaate'], category: 'Vaatteet' },
];

const CITY_HINTS = [
  'Helsinki',
  'Espoo',
  'Vantaa',
  'Tampere',
  'Turku',
  'Oulu',
  'Lahti',
  'Jyväskylä',
  'Salo',
  'Rauma',
  'Vihti',
];

/** Finnish place inflection, kept as a lookup so the copy reads naturally. */
const CITY_IN: Record<string, string> = {
  Helsinki: 'Helsingissä',
  Espoo: 'Espoossa',
  Vantaa: 'Vantaalla',
  Tampere: 'Tampereella',
  Turku: 'Turussa',
  Oulu: 'Oulussa',
  Lahti: 'Lahdessa',
  Jyväskylä: 'Jyväskylässä',
  Salo: 'Salossa',
  Rauma: 'Raumalla',
  Vihti: 'Vihdissä',
};

function detectCity(text: string): string | undefined {
  const normalised = normalise(text);
  return CITY_HINTS.find((city) => normalised.includes(normalise(city).slice(0, 5)));
}

function fallbackAnswer(text: string): AIAnswer {
  const city = detectCity(text);
  const matches = filterProducts({ ...emptyFilters, query: text, city: city ?? null }, 'relevance');

  if (matches.length) {
    const marketIds = [...new Set(matches.slice(0, 6).map((p) => p.marketId))];
    return {
      id: 'generic-search',
      reply: `Löysin ${matches.length} tuotetta${
        city ? ` ${CITY_IN[city] ?? city}` : ''
      }. Tässä lupaavimmat:`,
      bullets: matches.slice(0, 3).map((product) => {
        const market = marketById(product.marketId);
        return `${product.title}, ${product.price} euroa, ${market?.name ?? ''}, ${product.spot}`;
      }),
      products: matches.slice(0, 8),
      markets: pickMarkets(marketIds.slice(0, 3)),
      followups: ['Näytä halvimmat ensin', 'Rajaa lähimpiin', 'Tallenna hakuvahti'],
    };
  }

  return {
    id: 'fallback',
    reply:
      'En löytänyt tarkkaa osumaa. Kokeile näitä, tai kerro mitä etsit, missä koossa ja missä kaupungissa.',
    bullets: [],
    products: [],
    markets: [],
    followups: SCRIPTED_QUERIES.slice(0, 3),
  };
}

export function answerQuery(text: string): AIAnswer {
  const normalised = ` ${normalise(text)} `;

  let best: { script: Script; score: number } | null = null;
  for (const script of scripts) {
    const score = script.groups.reduce(
      (sum, group) => sum + (group.some((word) => normalised.includes(word)) ? 1 : 0),
      0,
    );
    if (score >= script.threshold && (!best || score > best.score)) {
      best = { script, score };
    }
  }
  if (best) return best.script.build();

  // "Where is there a lot of X" style questions without a scripted answer.
  const asksWhere = ['missa', 'mista', 'paljon', 'eniten', 'suosittele', 'mihin'].some((word) =>
    normalised.includes(word),
  );
  if (asksWhere) {
    const hint = CATEGORY_HINTS.find((entry) => entry.words.some((word) => normalised.includes(word)));
    if (hint) {
      const ranking = marketRankingAnswer(text, hint.category, detectCity(text));
      if (ranking) return ranking;
    }
  }

  return fallbackAnswer(text);
}

/** Simulated latency so the typing indicator has something to cover. */
export const AI_LATENCY_MS = 800;
