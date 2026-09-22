/**
 * GENEROITU TIEDOSTO, ÄLÄ MUOKKAA KÄSIN.
 * Luodaan komennolla `npm run data` tiedostoista
 * data/source/tuotteet.csv ja data/source/paikat.json.
 */
import type { Filters } from '@/lib/types';
import { emptyFilters } from '@/lib/filters';

export interface ExampleSearch {
  label: string;
  /** Marked as a natural language query, shown with a sparkle. */
  isAi?: boolean;
  filters: Filters;
  /** Short line shown above the results. */
  note: string;
}

const raw = [{label:"lasten talvihaalari",filters:{query:"haalari",categories:["lastenvaatteet"]},note:"Haalareita ja ulkoiluasuja, 6 lastenvaatetta yhteensä."},{label:"lenkkarit koko 40",filters:{query:"",categories:["kengat"],sizes:["40"]},note:"Kengät koossa 40, kaikilta kirpputoreilta."},{label:"Iittala",filters:{query:"",brands:["Iittala"]},note:"Iittalaa pöydillä juuri nyt, 6 kappaletta."},{label:"Y2K",filters:{query:"y2k"},note:"Kaksituhattaluvun alkua, 26 löytöä."},{label:"etsin miehelle kuoritakkia ulkoiluun, koko M",isAi:true,filters:{query:"kuoritakki",audiences:["Miesten"],sizes:["M"]},note:"Tulkitsin haun näin: kuoritakki, miesten, koko M."}];

export const exampleSearches: ExampleSearch[] = raw.map((item) => ({
  ...item,
  filters: { ...emptyFilters, ...item.filters } as Filters,
}));
