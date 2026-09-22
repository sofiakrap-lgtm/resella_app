import type { SavedSearch } from '@/lib/types';

/** Seeded search alerts, shown under Toivelista. */
export const seedSavedSearches: SavedSearch[] = [
  {
    id: 'vahti-haalari',
    label: 'Lasten haalari, koko 122',
    query: 'haalari',
    filters: { categories: ['lapset'], sizes: ['122'] },
    newMatches: 2,
  },
  {
    id: 'vahti-iittala',
    label: 'Iittala, alle 50 euroa',
    query: 'iittala',
    filters: { brands: ['Iittala'], maxPrice: 50 },
    newMatches: 1,
  },
  {
    id: 'vahti-vinyyli',
    label: 'Vinyylit Tampereella',
    query: 'vinyyli',
    filters: { cities: ['Tampere'] },
    newMatches: 0,
  },
];
