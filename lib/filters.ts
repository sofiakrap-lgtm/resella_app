import type { Audience, CategorySlug, Filters, Product } from './types';
import { products } from '@/data/products';
import { marketById } from '@/data/markets';

export const emptyFilters: Filters = {
  query: '',
  categories: [],
  audiences: [],
  sizes: [],
  colors: [],
  brands: [],
  conditions: [],
  minPrice: 0,
  maxPrice: 1000,
  marketIds: [],
  cities: [],
  onlyAvailable: false,
  onlyNewToday: false,
};

export const PRICE_MAX = 1000;

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replaceAll('ä', 'a')
    .replaceAll('ö', 'o')
    .replaceAll('å', 'a')
    .replaceAll('’', "'")
    .replace(/[^a-z0-9'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function haystack(product: Product): string {
  const market = marketById(product.marketId);
  return normalise(
    [
      product.title,
      product.brand ?? '',
      product.category,
      product.subcategory,
      product.size ?? '',
      product.color,
      product.condition,
      product.audience,
      product.description,
      product.keywords.join(' '),
      market?.name ?? '',
      market?.city ?? '',
    ].join(' '),
  );
}

export function matchesQuery(product: Product, query: string): boolean {
  if (!query.trim()) return true;
  const text = haystack(product);
  return normalise(query)
    .split(' ')
    .filter(Boolean)
    .every((term) => text.includes(term));
}

export function applyFilters(filters: Filters, list: Product[] = products): Product[] {
  return list.filter((product) => {
    const market = marketById(product.marketId);
    if (product.status === 'Myyty') return false;
    if (!matchesQuery(product, filters.query)) return false;
    if (filters.categories.length && !filters.categories.includes(product.category)) return false;
    if (filters.audiences.length && !filters.audiences.includes(product.audience)) return false;
    if (filters.sizes.length && (!product.size || !filters.sizes.includes(product.size)))
      return false;
    if (filters.colors.length && !filters.colors.includes(product.color)) return false;
    if (filters.brands.length && (!product.brand || !filters.brands.includes(product.brand)))
      return false;
    if (filters.conditions.length && !filters.conditions.includes(product.condition)) return false;
    if (product.priceEur < filters.minPrice) return false;
    if (filters.maxPrice < PRICE_MAX && product.priceEur > filters.maxPrice) return false;
    if (filters.marketIds.length && !filters.marketIds.includes(product.marketId)) return false;
    if (filters.cities.length && (!market || !filters.cities.includes(market.city))) return false;
    if (filters.onlyAvailable && product.status !== 'Saatavilla') return false;
    if (filters.onlyNewToday && product.addedDaysAgo !== 0) return false;
    return true;
  });
}

export function activeFilterCount(filters: Filters): number {
  return (
    filters.categories.length +
    filters.audiences.length +
    filters.sizes.length +
    filters.colors.length +
    filters.brands.length +
    filters.conditions.length +
    filters.marketIds.length +
    filters.cities.length +
    (filters.minPrice > 0 ? 1 : 0) +
    (filters.maxPrice < PRICE_MAX ? 1 : 0) +
    (filters.onlyAvailable ? 1 : 0) +
    (filters.onlyNewToday ? 1 : 0)
  );
}

/** Items that look like the given one, used under a product page. */
export function similarProducts(product: Product, limit = 8): Product[] {
  return products
    .filter((candidate) => candidate.id !== product.id && candidate.status !== 'Myyty')
    .map((candidate) => {
      let score = 0;
      if (candidate.category === product.category) score += 3;
      if (candidate.subcategory === product.subcategory) score += 2;
      if (candidate.brand && candidate.brand === product.brand) score += 2;
      if (candidate.size && candidate.size === product.size) score += 1;
      if (candidate.marketId === product.marketId) score += 1;
      return { candidate, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

export function filtersToQuery(filters: Filters): string {
  const params = new URLSearchParams();
  const list = (key: string, values: string[]) => {
    if (values.length) params.set(key, values.join(','));
  };
  if (filters.query) params.set('q', filters.query);
  list('cat', filters.categories);
  list('kenelle', filters.audiences);
  list('size', filters.sizes);
  list('color', filters.colors);
  list('brand', filters.brands);
  list('cond', filters.conditions);
  list('market', filters.marketIds);
  list('city', filters.cities);
  if (filters.minPrice > 0) params.set('min', String(filters.minPrice));
  if (filters.maxPrice < PRICE_MAX) params.set('max', String(filters.maxPrice));
  if (filters.onlyAvailable) params.set('saatavilla', '1');
  if (filters.onlyNewToday) params.set('uutta', '1');
  return params.toString();
}

export function queryToFilters(params: URLSearchParams): Filters {
  const list = (key: string) => (params.get(key) ? params.get(key)!.split(',') : []);
  return {
    query: params.get('q') ?? '',
    categories: list('cat') as CategorySlug[],
    audiences: list('kenelle') as Audience[],
    sizes: list('size'),
    colors: list('color'),
    brands: list('brand'),
    conditions: list('cond') as Filters['conditions'],
    minPrice: params.get('min') ? Number(params.get('min')) : 0,
    maxPrice: params.get('max') ? Number(params.get('max')) : PRICE_MAX,
    marketIds: list('market'),
    cities: list('city'),
    onlyAvailable: params.get('saatavilla') === '1',
    onlyNewToday: params.get('uutta') === '1',
  };
}
