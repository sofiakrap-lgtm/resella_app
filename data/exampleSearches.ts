import type { Filters } from '@/lib/types';
import { emptyFilters } from '@/lib/filters';

/**
 * Scripted searches for the demo. Each one returns real items from the mock
 * index, so nothing is ever promised that does not exist on a table.
 */
export interface ExampleSearch {
  label: string;
  /** Marked as a natural language query, shown with a sparkle. */
  isAi?: boolean;
  filters: Filters;
  /** Short line shown above the results. */
  note: string;
}

export const exampleSearches: ExampleSearch[] = [
  {
    label: 'haalari 7v Helsinki',
    filters: {
      ...emptyFilters,
      query: 'haalari',
      categories: ['lapset'],
      sizes: ['122'],
      cities: ['Helsinki'],
    },
    note: '7-vuotiaalle sopii yleensä koko 122.',
  },
  {
    label: 'villapaita',
    filters: { ...emptyFilters, query: 'villapaita' },
    note: 'Neuleita kaikilta kirpputoreilta.',
  },
  {
    label: 'Iittala astiat',
    filters: { ...emptyFilters, brands: ['Iittala'], categories: ['astiat'] },
    note: 'Iittalan astiat, jotka ovat juuri nyt pöydillä.',
  },
  {
    label: 'vinyylit alle 10 euroa',
    filters: { ...emptyFilters, query: 'vinyyli', maxPrice: 10 },
    note: 'Levyjä alle kympillä.',
  },
  {
    label: 'etsin 7-vuotiaalle haalaria Helsingin alueelta',
    isAi: true,
    filters: {
      ...emptyFilters,
      query: 'haalari',
      categories: ['lapset'],
      sizes: ['122'],
      cities: ['Helsinki'],
    },
    note: 'Tulkitsin haun näin: lasten haalari, koko 122, Helsinki.',
  },
];
