/**
 * GENEROITU TIEDOSTO, ÄLÄ MUOKKAA KÄSIN.
 * Luodaan komennolla `npm run data` tiedostoista
 * data/source/tuotteet.csv ja data/source/paikat.json.
 */
import type { AppNotification } from '@/lib/types';

/** Seeded notifications. Tapping one opens the screen it talks about. */
export const seedNotifications: AppNotification[] = [{id:"n-1",kind:"uusi-tuote",title:"Jussi M. lisäsi uuden tuotteen",body:"Beta LT kuoritakki, koko L, 230,00 €",href:"/tuote/rs-001",minutesAgo:12},{id:"n-2",kind:"hakuvahti",title:"Hakuvahti osui",body:"Lenkkarit koko 40: 3 osumaa",href:"/haku?cat=kengat&size=40",minutesAgo:95},{id:"n-3",kind:"uusi-tuote",title:"Tapanilan kirppis, uutta tänään",body:"11 uutta tuotetta seuraamallasi kirpputorilla",href:"/kirpputori/tapanila-hki",minutesAgo:240},{id:"n-4",kind:"hinta",title:"Toivelistan tuote halpeni",body:"Atom LT Hoody välitakki, nyt 150,00 €",href:"/tuote/rs-002",minutesAgo:1450}];
