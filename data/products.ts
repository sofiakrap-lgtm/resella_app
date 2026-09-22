import type { CategorySlug, Condition, Product, ProductStatus } from '@/lib/types';
import { sellerById } from './sellers';

/**
 * Every item is a real object on a table: the seller decides where it is, so the
 * market and the table number are derived from the seller instead of repeated.
 */
interface Input {
  id: string;
  title: string;
  category: CategorySlug;
  subcategory: string;
  size?: string;
  brand?: string;
  color: string;
  condition: Condition;
  priceEur: number;
  sellerId: string;
  status?: ProductStatus;
  addedDaysAgo: number;
  description: string;
}

function build(input: Input): Product {
  const seller = sellerById(input.sellerId);
  if (!seller || !seller.currentMarketId || !seller.tableNumber) {
    throw new Error(`Seller ${input.sellerId} has no active table`);
  }
  const index = input.id.split('-').pop() ?? '000';
  return {
    ...input,
    size: input.size ?? null,
    brand: input.brand ?? null,
    status: input.status ?? 'Saatavilla',
    marketId: seller.currentMarketId,
    tableNumber: seller.tableNumber,
    images: [1, 2, 3].map((n) =>
      n === 1 ? `prod-${input.category}-${index}` : `prod-${input.category}-${index}-${n}`,
    ),
  };
}

export const products: Product[] = [
  /* -------------------------------- Naiset -------------------------------- */
  build({ id: 'p-naiset-001', title: 'Villakangastakki', category: 'naiset', subcategory: 'takit', size: 'M', brand: 'Filippa K', color: 'Beige', condition: 'Erinomainen', priceEur: 48, sellerId: 'anni-k', addedDaysAgo: 0, description: 'Klassinen suora villakangastakki. Vuori ehjä, napit tallella.' }),
  build({ id: 'p-naiset-002', title: 'Marimekko Tasaraita paita', category: 'naiset', subcategory: 'paidat', size: 'S', brand: 'Marimekko', color: 'Kuvioitu', condition: 'Hyvä', priceEur: 22, sellerId: 'venla-n', addedDaysAgo: 0, description: 'Raidallinen trikoopaita, pehmeäksi pesty. Ei nyppyjä.' }),
  build({ id: 'p-naiset-003', title: 'Nanso villapaita', category: 'naiset', subcategory: 'neuleet', size: 'M', brand: 'Nanso', color: 'Harmaa', condition: 'Hyvä', priceEur: 26, sellerId: 'venla-n', addedDaysAgo: 1, description: 'Paksu neule syksyyn. Hihansuut kunnossa.' }),
  build({ id: 'p-naiset-004', title: 'Vintage samettimekko', category: 'naiset', subcategory: 'mekot', size: 'S', brand: 'Merkitön', color: 'Vihreä', condition: 'Erinomainen', priceEur: 38, sellerId: 'sanni-h', addedDaysAgo: 0, description: ' 70-luvun samettimekko, vetoketju sivussa. Kaunis laskeutuva helma.' }),
  build({ id: 'p-naiset-005', title: 'Levi’s 501 farkut', category: 'naiset', subcategory: 'housut', size: 'M', brand: 'Levi’s', color: 'Sininen', condition: 'Hyvä', priceEur: 29, sellerId: 'anni-k', addedDaysAgo: 2, description: 'Suorat farkut, vyötärö 31. Hieman haalistuneet reidet.' }),
  build({ id: 'p-naiset-006', title: 'Samuji neulemekko', category: 'naiset', subcategory: 'mekot', size: 'M', brand: 'Samuji', color: 'Musta', condition: 'Erinomainen', priceEur: 55, sellerId: 'sanni-h', addedDaysAgo: 3, description: 'Paksua neulosta, taskut sivuilla. Käytetty muutaman kerran.' }),
  build({ id: 'p-naiset-007', title: 'Trenssitakki', category: 'naiset', subcategory: 'takit', size: 'L', brand: 'Merkitön', color: 'Beige', condition: 'Hyvä', priceEur: 34, sellerId: 'venla-n', addedDaysAgo: 4, description: 'Kevyt välikausitakki vyöllä. Sopii kerrospukeutumiseen.' }),
  build({ id: 'p-naiset-008', title: 'Raidallinen neule', category: 'naiset', subcategory: 'neuleet', size: 'S', brand: 'Marimekko', color: 'Sininen', condition: 'Hyvä', priceEur: 24, sellerId: 'anni-k', status: 'Varattu', addedDaysAgo: 1, description: 'Ohut puuvillaneule, sopii kevääseen ja syksyyn.' }),
  build({ id: 'p-naiset-009', title: 'Plisseerattu hame', category: 'naiset', subcategory: 'mekot', size: 'M', brand: 'Merkitön', color: 'Ruskea', condition: 'Erinomainen', priceEur: 19, sellerId: 'sanni-h', addedDaysAgo: 5, description: 'Midipituinen plisseehame, joustava vyötärö.' }),

  /* -------------------------------- Miehet -------------------------------- */
  build({ id: 'p-miehet-010', title: 'Villakangastakki', category: 'miehet', subcategory: 'takit', size: 'L', brand: 'Makia', color: 'Musta', condition: 'Hyvä', priceEur: 52, sellerId: 'tuomas-r', addedDaysAgo: 0, description: 'Lyhyt villakangastakki, lämmin vuori. Ei reikiä.' }),
  build({ id: 'p-miehet-011', title: 'Levi’s 511 farkut', category: 'miehet', subcategory: 'housut', size: 'M', brand: 'Levi’s', color: 'Sininen', condition: 'Erinomainen', priceEur: 34, sellerId: 'tuomas-r', addedDaysAgo: 0, description: 'Slim fit, vyötärö 32. Ostettu viime vuonna, vähän käytetty.' }),
  build({ id: 'p-miehet-012', title: 'Villapaita, harmaa', category: 'miehet', subcategory: 'neuleet', size: 'XL', brand: 'Merkitön', color: 'Harmaa', condition: 'Hyvä', priceEur: 18, sellerId: 'tuomas-r', addedDaysAgo: 2, description: 'Perusvillapaita arkeen. Pesty villapesulla.' }),
  build({ id: 'p-miehet-013', title: 'Marimekko Jokapoika paita', category: 'miehet', subcategory: 'paidat', size: 'M', brand: 'Marimekko', color: 'Kuvioitu', condition: 'Hyvä', priceEur: 35, sellerId: 'jussi-m', addedDaysAgo: 1, description: 'Klassinen raidallinen kauluspaita. Kaulus siisti.' }),
  build({ id: 'p-miehet-014', title: 'Reima kuoritakki', category: 'miehet', subcategory: 'takit', size: 'L', brand: 'Reima', color: 'Vihreä', condition: 'Hyvä', priceEur: 30, sellerId: 'tuomas-r', addedDaysAgo: 3, description: 'Vedenpitävä ulkoilutakki. Saumat tarkistettu.' }),
  build({ id: 'p-miehet-015', title: 'Flanellipaita', category: 'miehet', subcategory: 'paidat', size: 'L', brand: 'Merkitön', color: 'Punainen', condition: 'Käytetty', priceEur: 12, sellerId: 'tuomas-r', addedDaysAgo: 6, description: 'Pehmeäksi kulunut flanelli. Yksi nappi vaihdettu.' }),
  build({ id: 'p-miehet-016', title: 'Neuletakki', category: 'miehet', subcategory: 'neuleet', size: 'M', brand: 'Merkitön', color: 'Ruskea', condition: 'Hyvä', priceEur: 22, sellerId: 'jussi-m', addedDaysAgo: 4, description: 'Napillinen neuletakki, taskut edessä.' }),

  /* -------------------------------- Lapset -------------------------------- */
  build({ id: 'p-lapset-017', title: 'Reima Tec talvihaalari', category: 'lapset', subcategory: 'haalarit', size: '122', brand: 'Reima', color: 'Sininen', condition: 'Hyvä', priceEur: 35, sellerId: 'perhe-virtanen', addedDaysAgo: 0, description: 'Lämmin talvihaalari, vetoketjut toimivat. Polvissa vähän kulumaa.' }),
  build({ id: 'p-lapset-018', title: 'Lindex kevythaalari', category: 'lapset', subcategory: 'haalarit', size: '122', brand: 'Lindex', color: 'Vihreä', condition: 'Uusi', priceEur: 18, sellerId: 'perhe-virtanen', addedDaysAgo: 0, description: 'Käyttämätön, hintalappu tallella. Sopii välikaudelle.' }),
  build({ id: 'p-lapset-019', title: 'Reima kurahaalari', category: 'lapset', subcategory: 'haalarit', size: '116', brand: 'Reima', color: 'Keltainen', condition: 'Hyvä', priceEur: 20, sellerId: 'perhe-virtanen', addedDaysAgo: 1, description: 'Kurahaalari syksyyn, ei reikiä. Pesty.' }),
  build({ id: 'p-lapset-020', title: 'Polarn O. Pyret välikausihaalari', category: 'lapset', subcategory: 'haalarit', size: '110', brand: 'Polarn O. Pyret', color: 'Harmaa', condition: 'Erinomainen', priceEur: 28, sellerId: 'perhe-virtanen', addedDaysAgo: 2, description: 'Vettä hylkivä pinta, heijastimet hihoissa.' }),
  build({ id: 'p-lapset-021', title: 'Juhlamekko tyllihelmalla', category: 'lapset', subcategory: 'mekot', size: '110', brand: 'Lindex', color: 'Punainen', condition: 'Uusi', priceEur: 19, sellerId: 'oulun-oona', addedDaysAgo: 0, description: 'Käyttämätön juhlamekko. Vyötärönauha irrotettava.' }),
  build({ id: 'p-lapset-022', title: 'Marimekko lasten mekko', category: 'lapset', subcategory: 'mekot', size: '110', brand: 'Marimekko', color: 'Kuvioitu', condition: 'Hyvä', priceEur: 26, sellerId: 'oulun-oona', addedDaysAgo: 1, description: 'Puuvillamekko, kuvio ehjä. Pesty monta kertaa.' }),
  build({ id: 'p-lapset-023', title: 'Molo softshell takki', category: 'lapset', subcategory: 'ulkovaatteet', size: '128', brand: 'Molo', color: 'Musta', condition: 'Hyvä', priceEur: 32, sellerId: 'perhe-virtanen', addedDaysAgo: 3, description: 'Tuulta pitävä softshell, hupullinen.' }),
  build({ id: 'p-lapset-024', title: 'Name It samettimekko', category: 'lapset', subcategory: 'mekot', size: '104', brand: 'Name It', color: 'Vihreä', condition: 'Erinomainen', priceEur: 17, sellerId: 'oulun-oona', addedDaysAgo: 0, description: 'Tummanvihreä samettimekko, pitkät hihat.' }),
  build({ id: 'p-lapset-025', title: 'Trikoohousut, 2 paria', category: 'lapset', subcategory: 'arkivaatteet', size: '98', brand: 'Merkitön', color: 'Harmaa', condition: 'Hyvä', priceEur: 8, sellerId: 'perhe-virtanen', addedDaysAgo: 5, description: 'Kaksi paria pehmeitä trikoohousuja arkeen.' }),
  build({ id: 'p-lapset-026', title: 'Villatakki, käsintehty', category: 'lapset', subcategory: 'ulkovaatteet', size: '92', brand: 'Merkitön', color: 'Beige', condition: 'Uusi', priceEur: 24, sellerId: 'rauman-riikka', addedDaysAgo: 1, description: 'Käsin neulottu villatakki, puunapit.' }),

  /* ---------------------------- Koti ja sisustus ---------------------------- */
  build({ id: 'p-koti-027', title: 'Rottinkituoli', category: 'koti', subcategory: 'huonekalut', color: 'Beige', condition: 'Hyvä', priceEur: 75, sellerId: 'elias-p', addedDaysAgo: 2, description: 'Kevyt rottinkituoli, istuinosa ehjä. Noudettava itse.' }),
  build({ id: 'p-koti-028', title: 'Pöytälamppu, messinki', category: 'koti', subcategory: 'valaisimet', color: 'Keltainen', condition: 'Hyvä', priceEur: 42, sellerId: 'elias-p', addedDaysAgo: 0, description: 'Messinkijalka ja kangasvarjostin. Johto tarkistettu.' }),
  build({ id: 'p-koti-029', title: 'Marimekko Unikko verhot', category: 'koti', subcategory: 'tekstiilit', brand: 'Marimekko', color: 'Punainen', condition: 'Hyvä', priceEur: 40, sellerId: 'elias-p', addedDaysAgo: 1, description: 'Pari verhoja, pituus 240 cm. Väri hyvin säilynyt.' }),
  build({ id: 'p-koti-030', title: 'Finlayson päiväpeite', category: 'koti', subcategory: 'tekstiilit', brand: 'Finlayson', color: 'Sininen', condition: 'Hyvä', priceEur: 28, sellerId: 'elias-p', addedDaysAgo: 4, description: 'Retrokuvioinen päiväpeite, sopii parisängylle.' }),
  build({ id: 'p-koti-031', title: 'Artek jakkara 60', category: 'koti', subcategory: 'huonekalut', brand: 'Artek', color: 'Ruskea', condition: 'Käytetty', priceEur: 95, sellerId: 'meri-l', addedDaysAgo: 3, description: 'Klassikkojakkara, jaloissa käytön jälkiä. Tukeva.' }),
  build({ id: 'p-koti-032', title: 'Kynttilälyhdyt, 3 kpl', category: 'koti', subcategory: 'koristeet', brand: 'Iittala', color: 'Valkoinen', condition: 'Erinomainen', priceEur: 30, sellerId: 'meri-l', addedDaysAgo: 0, description: 'Kolme lyhtyä eri kokoa, ei lohkeamia.' }),
  build({ id: 'p-koti-033', title: 'Samettinen koristetyyny', category: 'koti', subcategory: 'tekstiilit', color: 'Keltainen', condition: 'Uusi', priceEur: 12, sellerId: 'elias-p', addedDaysAgo: 0, description: 'Okranvärinen samettityyny, täyte mukana.' }),
  build({ id: 'p-koti-034', title: 'Seinäkello, 70-luku', category: 'koti', subcategory: 'koristeet', color: 'Ruskea', condition: 'Hyvä', priceEur: 26, sellerId: 'elias-p', status: 'Myyty', addedDaysAgo: 7, description: 'Toimiva seinäkello, paristokäyttöinen.' }),

  /* -------------------------------- Astiat -------------------------------- */
  build({ id: 'p-astiat-035', title: 'Iittala Teema lautaset, 4 kpl', category: 'astiat', subcategory: 'lautaset', brand: 'Iittala', color: 'Valkoinen', condition: 'Erinomainen', priceEur: 45, sellerId: 'meri-l', addedDaysAgo: 0, description: 'Neljä syvää lautasta, ei kolhuja. Konepestävät.' }),
  build({ id: 'p-astiat-036', title: 'Arabia Paratiisi vati', category: 'astiat', subcategory: 'lautaset', brand: 'Arabia', color: 'Sininen', condition: 'Hyvä', priceEur: 60, sellerId: 'meri-l', addedDaysAgo: 1, description: 'Keräilijän kappale, pohjamerkintä ehjä.' }),
  build({ id: 'p-astiat-037', title: 'Iittala Kartio lasit, 6 kpl', category: 'astiat', subcategory: 'lasit', brand: 'Iittala', color: 'Valkoinen', condition: 'Hyvä', priceEur: 38, sellerId: 'meri-l', addedDaysAgo: 0, description: 'Kuusi kirkasta lasia, yksi pieni naarmu.' }),
  build({ id: 'p-astiat-038', title: 'Arabia 24h kulhot, 4 kpl', category: 'astiat', subcategory: 'lautaset', brand: 'Arabia', color: 'Valkoinen', condition: 'Hyvä', priceEur: 22, sellerId: 'salon-sami', addedDaysAgo: 2, description: 'Arkikulhot, kestävät uunin ja mikron.' }),
  build({ id: 'p-astiat-039', title: 'Marimekko Oiva mukit, 2 kpl', category: 'astiat', subcategory: 'mukit', brand: 'Marimekko', color: 'Musta', condition: 'Uusi', priceEur: 24, sellerId: 'meri-l', addedDaysAgo: 0, description: 'Käyttämättömät mukit, alkuperäiset tarrat tallella.' }),
  build({ id: 'p-astiat-040', title: 'Pentik kahvikupit, 4 kpl', category: 'astiat', subcategory: 'mukit', brand: 'Pentik', color: 'Ruskea', condition: 'Hyvä', priceEur: 20, sellerId: 'salon-sami', addedDaysAgo: 1, description: 'Neljä kuppia ja aluslautaset. Kultareunat ehjät.' }),
  build({ id: 'p-astiat-041', title: 'Iittala Aalto maljakko', category: 'astiat', subcategory: 'maljakot', brand: 'Iittala', color: 'Valkoinen', condition: 'Erinomainen', priceEur: 55, sellerId: 'meri-l', addedDaysAgo: 1, description: 'Korkeus 95 mm, kirkas lasi. Ei naarmuja.' }),
  build({ id: 'p-astiat-042', title: 'Rörstrand Mon Amie kulho', category: 'astiat', subcategory: 'lautaset', brand: 'Rörstrand', color: 'Sininen', condition: 'Hyvä', priceEur: 26, sellerId: 'salon-sami', addedDaysAgo: 4, description: 'Klassinen sinikukka, halkaisija 22 cm.' }),
  build({ id: 'p-astiat-043', title: 'Arabia Kilta lautanen', category: 'astiat', subcategory: 'lautaset', brand: 'Arabia', color: 'Sininen', condition: 'Käytetty', priceEur: 18, sellerId: 'salon-sami', status: 'Myyty', addedDaysAgo: 8, description: 'Keräilykappale, pinnassa käytön jälkiä.' }),

  /* -------------------------------- Kengät -------------------------------- */
  build({ id: 'p-kengat-044', title: 'Converse Chuck Taylor', category: 'kengat', subcategory: 'tennarit', size: '39', brand: 'Converse', color: 'Musta', condition: 'Hyvä', priceEur: 25, sellerId: 'kaisa-t', addedDaysAgo: 0, description: 'Matalavartiset tennarit, pohjat hyvässä kunnossa.' }),
  build({ id: 'p-kengat-045', title: 'Vagabond nilkkurit', category: 'kengat', subcategory: 'saappaat', size: '38', brand: 'Vagabond', color: 'Ruskea', condition: 'Erinomainen', priceEur: 45, sellerId: 'kaisa-t', addedDaysAgo: 1, description: 'Nahkaiset nilkkurit, korko 4 cm. Käytetty kaksi kertaa.' }),
  build({ id: 'p-kengat-046', title: 'Nokian kumisaappaat', category: 'kengat', subcategory: 'saappaat', size: '40', brand: 'Nokian', color: 'Vihreä', condition: 'Hyvä', priceEur: 30, sellerId: 'kaisa-t', addedDaysAgo: 2, description: 'Klassiset kumisaappaat, ei halkeamia.' }),
  build({ id: 'p-kengat-047', title: 'Reima kumisaappaat', category: 'kengat', subcategory: 'saappaat', size: '28', brand: 'Reima', color: 'Keltainen', condition: 'Hyvä', priceEur: 14, sellerId: 'perhe-virtanen', addedDaysAgo: 1, description: 'Lasten kumisaappaat, irtopohjalliset mukana.' }),
  build({ id: 'p-kengat-048', title: 'Juhlakengät lapselle', category: 'kengat', subcategory: 'juhlakengat', size: '28', brand: 'Merkitön', color: 'Musta', condition: 'Hyvä', priceEur: 15, sellerId: 'oulun-oona', addedDaysAgo: 2, description: 'Kiiltonahkaiset juhlakengät, tarrakiinnitys.' }),
  build({ id: 'p-kengat-049', title: 'Nahkasandaalit', category: 'kengat', subcategory: 'tennarit', size: '37', brand: 'Merkitön', color: 'Ruskea', condition: 'Käytetty', priceEur: 12, sellerId: 'kaisa-t', addedDaysAgo: 6, description: 'Pehmeät nahkasandaalit, pohja kulunut tasaisesti.' }),
  build({ id: 'p-kengat-050', title: 'Talvisaappaat, villavuori', category: 'kengat', subcategory: 'saappaat', size: '36', brand: 'Merkitön', color: 'Musta', condition: 'Hyvä', priceEur: 28, sellerId: 'kaisa-t', status: 'Varattu', addedDaysAgo: 3, description: 'Lämpimät talvisaappaat, liukuesto pohjassa.' }),

  /* ------------------------------- Asusteet ------------------------------- */
  build({ id: 'p-asusteet-051', title: 'Vintage nahkalaukku', category: 'asusteet', subcategory: 'laukut', brand: 'Merkitön', color: 'Ruskea', condition: 'Käytetty', priceEur: 45, sellerId: 'sanni-h', addedDaysAgo: 3, description: 'Konjakinruskea nahkalaukku, patinaa reunoissa. Vetoketju toimii.' }),
  build({ id: 'p-asusteet-052', title: 'Marimekko kangaskassi', category: 'asusteet', subcategory: 'laukut', brand: 'Marimekko', color: 'Kuvioitu', condition: 'Hyvä', priceEur: 15, sellerId: 'kaisa-t', addedDaysAgo: 0, description: 'Tukeva kangaskassi arkeen, pesty.' }),
  build({ id: 'p-asusteet-053', title: 'Silkkihuivi, 60-luku', category: 'asusteet', subcategory: 'huivit', color: 'Kuvioitu', condition: 'Erinomainen', priceEur: 22, sellerId: 'sanni-h', addedDaysAgo: 1, description: 'Käsinommellut reunat, ei tahroja.' }),
  build({ id: 'p-asusteet-054', title: 'Kalevala Koru riipus', category: 'asusteet', subcategory: 'korut', brand: 'Kalevala', color: 'Keltainen', condition: 'Erinomainen', priceEur: 65, sellerId: 'meri-l', addedDaysAgo: 2, description: 'Pronssiriipus ketjuineen, leimat tallella.' }),
  build({ id: 'p-asusteet-055', title: 'Villasukat, käsintehdyt', category: 'asusteet', subcategory: 'huivit', size: '38 ja 39', brand: 'Merkitön', color: 'Harmaa', condition: 'Uusi', priceEur: 15, sellerId: 'rauman-riikka', addedDaysAgo: 0, description: 'Kaksi paria käsin neulottuja villasukkia.' }),
  build({ id: 'p-asusteet-056', title: 'Villahattu', category: 'asusteet', subcategory: 'huivit', brand: 'Merkitön', color: 'Beige', condition: 'Hyvä', priceEur: 10, sellerId: 'rauman-riikka', addedDaysAgo: 4, description: 'Pehmeä villahattu, sopii useimmille.' }),

  /* -------------------------------- Viihde -------------------------------- */
  build({ id: 'p-viihde-057', title: 'Vinyyli: suomirock 1978', category: 'viihde', subcategory: 'vinyylit', color: 'Musta', condition: 'Käytetty', priceEur: 12, sellerId: 'jussi-m', addedDaysAgo: 3, description: 'Kansi kulunut, levy soi hyvin. Testattu.' }),
  build({ id: 'p-viihde-058', title: 'Vinyyli: jazzkokoelma', category: 'viihde', subcategory: 'vinyylit', color: 'Musta', condition: 'Hyvä', priceEur: 9, sellerId: 'jussi-m', addedDaysAgo: 0, description: 'Kolmen levyn kokoelma, kannet siistit.' }),
  build({ id: 'p-viihde-059', title: 'Tove Jansson: Muumilaakson marraskuu', category: 'viihde', subcategory: 'kirjat', color: 'Sininen', condition: 'Hyvä', priceEur: 8, sellerId: 'pihla-e', addedDaysAgo: 1, description: 'Kovakantinen painos, selkämys ehjä.' }),
  build({ id: 'p-viihde-060', title: 'Keittokirja, 70-luku', category: 'viihde', subcategory: 'kirjat', color: 'Ruskea', condition: 'Käytetty', priceEur: 6, sellerId: 'pihla-e', addedDaysAgo: 2, description: 'Retroreseptejä, muutama merkintä marginaalissa.' }),
  build({ id: 'p-viihde-061', title: 'Lautapeli: Afrikan tähti', category: 'viihde', subcategory: 'pelit', color: 'Punainen', condition: 'Hyvä', priceEur: 14, sellerId: 'pihla-e', addedDaysAgo: 0, description: 'Kaikki osat tallella, laatikko kulunut kulmista.' }),
  build({ id: 'p-viihde-062', title: 'Sarjakuva-albumit, 5 kpl', category: 'viihde', subcategory: 'kirjat', color: 'Kuvioitu', condition: 'Hyvä', priceEur: 18, sellerId: 'pihla-e', addedDaysAgo: 4, description: 'Viisi albumia samaa sarjaa, luettu varovasti.' }),
  build({ id: 'p-viihde-063', title: 'Vinyyli: klassinen sinfonia', category: 'viihde', subcategory: 'vinyylit', color: 'Musta', condition: 'Erinomainen', priceEur: 15, sellerId: 'jussi-m', addedDaysAgo: 1, description: 'Lähes naarmuton levy, alkuperäinen sisäpussi.' }),
  build({ id: 'p-viihde-064', title: 'Palapeli 1000 palaa', category: 'viihde', subcategory: 'pelit', color: 'Kuvioitu', condition: 'Hyvä', priceEur: 7, sellerId: 'pihla-e', status: 'Varattu', addedDaysAgo: 5, description: 'Kaikki palat laskettu. Maisemakuva.' }),
];

export const productById = (id: string) => products.find((product) => product.id === id);

export const productsByMarket = (marketId: string) =>
  products.filter((product) => product.marketId === marketId);

export const productsBySeller = (sellerId: string) =>
  products.filter((product) => product.sellerId === sellerId);

export const productsByCategory = (category: string) =>
  products.filter((product) => product.category === category);

/** Items put on a table today, used by the "Uutta tänään" rows. */
export const newToday = (marketId?: string) =>
  products.filter(
    (product) =>
      product.addedDaysAgo === 0 &&
      product.status === 'Saatavilla' &&
      (!marketId || product.marketId === marketId),
  );

export const newTodayCount = (marketId: string) => newToday(marketId).length;
