/**
 * GENEROITU TIEDOSTO, ÄLÄ MUOKKAA KÄSIN.
 * Luodaan komennolla `npm run data` tiedostoista
 * data/source/tuotteet.csv ja data/source/paikat.json.
 */
import type { SavedSearch } from '@/lib/types';

/** Seeded search alerts, shown under Toivelista. */
export const seedSavedSearches: SavedSearch[] = [{id:"vahti-lenkkarit",label:"Lenkkarit koko 40",query:"",filters:{categories:["kengat"],sizes:["40"]},newMatches:3},{id:"vahti-iittala",label:"Iittala alle 50 euroa",query:"",filters:{brands:["Iittala"],maxPrice:50},newMatches:4},{id:"vahti-ulkoilu",label:"Ulkoiluvaatteet Helsingissä",query:"",filters:{categories:["ulkoiluvaatteet"],cities:["Helsinki"]},newMatches:0}];
