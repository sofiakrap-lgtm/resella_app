import {
  Category,
  Condition,
  Market,
  Product,
  markets,
  marketById,
  products,
} from './mockData';
import { CITY_CENTERS, distanceKm, LatLng } from './geo';

export interface Filters {
  query: string;
  categories: Category[];
  sizes: string[];
  conditions: Condition[];
  maxPrice: number | null;
  maxDistanceKm: number | null;
  city: string | null;
  marketId: string | null;
}

export const emptyFilters: Filters = {
  query: '',
  categories: [],
  sizes: [],
  conditions: [],
  maxPrice: null,
  maxDistanceKm: null,
  city: null,
  marketId: null,
};

export type SortKey = 'relevance' | 'price' | 'distance' | 'newest';

export function originFor(city: string | null): LatLng {
  return CITY_CENTERS[city ?? 'Helsinki'] ?? CITY_CENTERS.Helsinki;
}

export function productDistance(product: Product, origin: LatLng): number {
  const market = marketById(product.marketId);
  if (!market) return Number.POSITIVE_INFINITY;
  return distanceKm(origin, market);
}

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replaceAll('ä', 'a')
    .replaceAll('ö', 'o')
    .replaceAll('å', 'a')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function haystack(product: Product, market: Market | undefined): string {
  return normalise(
    [
      product.title,
      product.brand ?? '',
      product.category,
      product.size ?? '',
      product.color,
      product.condition,
      product.keywords.join(' '),
      product.style.join(' '),
      market?.name ?? '',
      market?.city ?? '',
      market?.district ?? '',
    ].join(' '),
  );
}

/** Relevance score, higher is better. 0 means the query does not match. */
export function scoreProduct(product: Product, query: string): number {
  if (!query.trim()) return 1;
  const market = marketById(product.marketId);
  const text = haystack(product, market);
  const terms = normalise(query).split(' ').filter(Boolean);
  let score = 0;
  for (const term of terms) {
    if (!text.includes(term)) return 0;
    score += normalise(product.title).includes(term) ? 3 : 1;
    if (product.brand && normalise(product.brand).includes(term)) score += 2;
  }
  if (product.addedDaysAgo === 0) score += 0.5;
  return score;
}

export function filterProducts(filters: Filters, sort: SortKey = 'relevance'): Product[] {
  const origin = originFor(filters.city);
  const matched = products
    .filter((product) => {
      const market = marketById(product.marketId);
      if (!market) return false;
      if (filters.city && market.city !== filters.city) return false;
      if (filters.marketId && product.marketId !== filters.marketId) return false;
      if (filters.categories.length && !filters.categories.includes(product.category)) return false;
      if (filters.sizes.length && (!product.size || !filters.sizes.some((s) => product.size!.startsWith(s))))
        return false;
      if (filters.conditions.length && !filters.conditions.includes(product.condition)) return false;
      if (filters.maxPrice !== null && product.price > filters.maxPrice) return false;
      if (
        filters.maxDistanceKm !== null &&
        distanceKm(origin, market) > filters.maxDistanceKm
      )
        return false;
      return scoreProduct(product, filters.query) > 0;
    })
    .map((product) => ({ product, score: scoreProduct(product, filters.query) }));

  matched.sort((a, b) => {
    switch (sort) {
      case 'price':
        return a.product.price - b.product.price;
      case 'distance':
        return productDistance(a.product, origin) - productDistance(b.product, origin);
      case 'newest':
        return a.product.addedDaysAgo - b.product.addedDaysAgo;
      default: {
        const byScore = b.score - a.score;
        if (byScore !== 0) return byScore;
        return a.product.addedDaysAgo - b.product.addedDaysAgo;
      }
    }
  });

  return matched.map((entry) => entry.product);
}

export function activeFilterCount(filters: Filters): number {
  return (
    filters.categories.length +
    filters.sizes.length +
    filters.conditions.length +
    (filters.maxPrice !== null ? 1 : 0) +
    (filters.maxDistanceKm !== null ? 1 : 0) +
    (filters.city ? 1 : 0) +
    (filters.marketId ? 1 : 0)
  );
}

export function marketsForCity(city: string | null): Market[] {
  if (!city) return markets;
  return markets.filter((market) => market.city === city);
}

export function marketsByDistance(origin: LatLng, list: Market[] = markets): Market[] {
  return [...list].sort((a, b) => distanceKm(origin, a) - distanceKm(origin, b));
}

/** Type ahead suggestions built from titles, brands and market names. */
export function suggestionsFor(query: string, limit = 6): string[] {
  const term = normalise(query);
  if (!term) return [];
  const pool = new Set<string>();
  for (const product of products) {
    if (product.brand && normalise(product.brand).includes(term)) pool.add(product.brand);
    if (normalise(product.title).includes(term)) pool.add(product.title);
    for (const keyword of product.keywords) {
      if (normalise(keyword).includes(term)) pool.add(keyword);
    }
  }
  for (const market of markets) {
    if (normalise(market.name).includes(term)) pool.add(market.name);
  }
  return Array.from(pool).slice(0, limit);
}

/** Similar items for the product page, same category first, then style overlap. */
export function similarProducts(product: Product, limit = 6): Product[] {
  return products
    .filter((candidate) => candidate.id !== product.id && candidate.status !== 'sold')
    .map((candidate) => {
      let score = 0;
      if (candidate.category === product.category) score += 3;
      if (candidate.brand && candidate.brand === product.brand) score += 2;
      score += candidate.style.filter((tag) => product.style.includes(tag)).length;
      if (candidate.size && candidate.size === product.size) score += 2;
      return { candidate, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

/** Encodes filters into the query string used by /results. */
export function filtersToQuery(filters: Filters, sort?: SortKey): string {
  const params = new URLSearchParams();
  if (filters.query) params.set('q', filters.query);
  if (filters.categories.length) params.set('cat', filters.categories.join(','));
  if (filters.sizes.length) params.set('size', filters.sizes.join(','));
  if (filters.conditions.length) params.set('cond', filters.conditions.join(','));
  if (filters.maxPrice !== null) params.set('price', String(filters.maxPrice));
  if (filters.maxDistanceKm !== null) params.set('dist', String(filters.maxDistanceKm));
  if (filters.city) params.set('city', filters.city);
  if (filters.marketId) params.set('market', filters.marketId);
  if (sort && sort !== 'relevance') params.set('sort', sort);
  return params.toString();
}

export function queryToFilters(params: URLSearchParams): { filters: Filters; sort: SortKey } {
  const list = (key: string) => (params.get(key) ? params.get(key)!.split(',') : []);
  return {
    filters: {
      query: params.get('q') ?? '',
      categories: list('cat') as Category[],
      sizes: list('size'),
      conditions: list('cond') as Condition[],
      maxPrice: params.get('price') ? Number(params.get('price')) : null,
      maxDistanceKm: params.get('dist') ? Number(params.get('dist')) : null,
      city: params.get('city'),
      marketId: params.get('market'),
    },
    sort: (params.get('sort') as SortKey) ?? 'relevance',
  };
}
