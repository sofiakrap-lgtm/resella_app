import type { Category } from '@/lib/types';

/**
 * Top level categories. These are first class navigation items in Selaa, never
 * hidden behind a generic "kauppa" link.
 */
export const categories: Category[] = [
  {
    slug: 'naiset',
    name: 'Naiset',
    blurb: 'Takit, neuleet, mekot, farkut',
    subcategories: [
      { slug: 'takit', name: 'Takit ja ulkovaatteet' },
      { slug: 'neuleet', name: 'Neuleet ja villapaidat' },
      { slug: 'mekot', name: 'Mekot ja hameet' },
      { slug: 'housut', name: 'Housut ja farkut' },
      { slug: 'paidat', name: 'Paidat ja topit' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    brands: ['Marimekko', 'Nanso', 'Filippa K', 'Samuji', 'Levi’s', 'Merkitön'],
  },
  {
    slug: 'miehet',
    name: 'Miehet',
    blurb: 'Villapaidat, farkut, takit',
    subcategories: [
      { slug: 'takit', name: 'Takit ja ulkovaatteet' },
      { slug: 'neuleet', name: 'Neuleet ja villapaidat' },
      { slug: 'housut', name: 'Housut ja farkut' },
      { slug: 'paidat', name: 'Paidat' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    brands: ['Levi’s', 'Marimekko', 'Makia', 'Reima', 'Merkitön'],
  },
  {
    slug: 'lapset',
    name: 'Lapset',
    blurb: 'Haalarit, ulkovaatteet, koot 74 - 140',
    subcategories: [
      { slug: 'haalarit', name: 'Haalarit' },
      { slug: 'ulkovaatteet', name: 'Ulkovaatteet' },
      { slug: 'mekot', name: 'Mekot ja juhlavaatteet' },
      { slug: 'arkivaatteet', name: 'Arkivaatteet' },
    ],
    sizes: ['74', '86', '92', '98', '104', '110', '116', '122', '128', '134', '140'],
    brands: ['Reima', 'Polarn O. Pyret', 'Lindex', 'Molo', 'Name It', 'Merkitön'],
  },
  {
    slug: 'koti',
    name: 'Koti ja sisustus',
    blurb: 'Tekstiilit, valaisimet, huonekalut',
    subcategories: [
      { slug: 'tekstiilit', name: 'Tekstiilit' },
      { slug: 'valaisimet', name: 'Valaisimet' },
      { slug: 'huonekalut', name: 'Pienhuonekalut' },
      { slug: 'koristeet', name: 'Koriste-esineet' },
    ],
    sizes: [],
    brands: ['Marimekko', 'Finlayson', 'Iittala', 'Artek', 'Merkitön'],
  },
  {
    slug: 'astiat',
    name: 'Astiat',
    blurb: 'Lautaset, mukit, lasit, maljakot',
    subcategories: [
      { slug: 'lautaset', name: 'Lautaset ja vadit' },
      { slug: 'mukit', name: 'Mukit ja kupit' },
      { slug: 'lasit', name: 'Lasit' },
      { slug: 'maljakot', name: 'Maljakot' },
    ],
    sizes: [],
    brands: ['Iittala', 'Arabia', 'Pentik', 'Rörstrand', 'Merkitön'],
  },
  {
    slug: 'kengat',
    name: 'Kengät',
    blurb: 'Tennarit, saappaat, juhlakengät',
    subcategories: [
      { slug: 'tennarit', name: 'Tennarit' },
      { slug: 'saappaat', name: 'Saappaat' },
      { slug: 'juhlakengat', name: 'Juhlakengät' },
    ],
    sizes: ['24', '28', '30', '36', '37', '38', '39', '40', '42', '44'],
    brands: ['Converse', 'Reima', 'Vagabond', 'Nokian', 'Merkitön'],
  },
  {
    slug: 'asusteet',
    name: 'Asusteet',
    blurb: 'Laukut, huivit, korut',
    subcategories: [
      { slug: 'laukut', name: 'Laukut' },
      { slug: 'huivit', name: 'Huivit ja hatut' },
      { slug: 'korut', name: 'Korut' },
    ],
    sizes: [],
    brands: ['Marimekko', 'Kalevala', 'Lumi', 'Merkitön'],
  },
  {
    slug: 'viihde',
    name: 'Viihde',
    blurb: 'Kirjat, vinyylit, pelit',
    subcategories: [
      { slug: 'kirjat', name: 'Kirjat' },
      { slug: 'vinyylit', name: 'Vinyylit' },
      { slug: 'pelit', name: 'Pelit' },
    ],
    sizes: [],
    brands: ['Merkitön'],
  },
];

export const categoryBySlug = (slug: string) =>
  categories.find((category) => category.slug === slug);

export const allColors = [
  'Musta',
  'Valkoinen',
  'Beige',
  'Ruskea',
  'Sininen',
  'Vihreä',
  'Punainen',
  'Keltainen',
  'Harmaa',
  'Kuvioitu',
];

export const allConditions = ['Uusi', 'Erinomainen', 'Hyvä', 'Käytetty'] as const;
