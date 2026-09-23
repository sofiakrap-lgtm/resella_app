/**
 * Style discovery. The viewer saves photos they like, and the app ranks the
 * catalogue by how much it shares with them: same category, same colour
 * family, overlapping search terms from the product sheet.
 *
 * Nothing is sent anywhere and no model is involved; the matching is the
 * same keyword overlap the search uses, read from the sheet's own columns.
 */
import type { Product } from './types';
import { products } from '@/data/products';

/**
 * The board the viewer picks from. One photo per category where possible, so
 * the first choice is a real choice rather than twelve of the same thing.
 */
export function styleBoard(limit = 12): Product[] {
  const byCategory = new Map<string, Product[]>();
  for (const product of products) {
    if (product.status !== 'Saatavilla') continue;
    const list = byCategory.get(product.category) ?? [];
    list.push(product);
    byCategory.set(product.category, list);
  }
  const board: Product[] = [];
  const queues = [...byCategory.values()];
  // Round robin across categories until the board is full.
  for (let round = 0; board.length < limit; round += 1) {
    let added = false;
    for (const queue of queues) {
      const next = queue[round];
      if (!next) continue;
      board.push(next);
      added = true;
      if (board.length >= limit) break;
    }
    if (!added) break;
  }
  return board;
}

/** Products that look like what the viewer saved, best first. */
export function matchesStyle(likedIds: string[], limit = 20): Product[] {
  const liked = likedIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
  if (!liked.length) return [];

  const likedSet = new Set(likedIds);
  const terms = new Set(liked.flatMap((product) => product.keywords));
  const categories = new Set(liked.map((product) => product.category));
  const colors = new Set(liked.map((product) => product.color.toLowerCase()));
  const brands = new Set(liked.map((product) => product.brand).filter(Boolean));

  return products
    .filter((product) => !likedSet.has(product.id) && product.status === 'Saatavilla')
    .map((product) => {
      let score = 0;
      if (categories.has(product.category)) score += 3;
      if (colors.has(product.color.toLowerCase())) score += 2;
      if (product.brand && brands.has(product.brand)) score += 2;
      score += product.keywords.filter((term) => terms.has(term)).length;
      return { product, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.product.priceEur - b.product.priceEur)
    .slice(0, limit)
    .map((entry) => entry.product);
}
