# Kuvalista

Tämä tiedosto luodaan datasta komennolla `npm run kuvalista`, joten se ei
voi vanhentua. Ohjeet lataamiseen: [README.md](README.md).

Tähdellä `*` merkityt ovat demon pääpolulla, eli ne näkyvät esittelyssä
ensimmäisenä. Jos aika on vähissä, lataa ensin vain ne.

Puuttuva kuva ei riko mitään: tilalle piirtyy brändin mukainen paikkamerkki.
Tarkista tilanne milloin tahansa komennolla `npm run check-assets`.

## 1. Logot, 4 tiedostoa

| Tiedosto | Mitä |
|---|---|
| `assets/logos/logo-wordmark.svg` * | Nimilogo, tumma, vaalealle taustalle |
| `assets/logos/logo-wordmark-light.svg` * | Nimilogo, kerma, tummalle taustalle |
| `assets/logos/logo-mark.svg` * | Neliömäinen logo, tumma |
| `assets/logos/logo-mark-light.svg` * | Neliömäinen logo, kerma |

## 2. Grafiikat, 8 tiedostoa

Muodot ovat koristeita ja ne ottavat värinsä ympäristöstä (`currentColor`).

| Tiedosto | Mitä | Missä näkyy |
|---|---|---|
| `assets/graphics/shape-star.svg` * | Tähti | Korostukset, tyhjät tilat |
| `assets/graphics/shape-wave.svg` * | Aalto | Taustakoristeet |
| `assets/graphics/shape-pebble.svg` * | Kivet | Taustakoristeet |
| `assets/graphics/connector-mascot.svg` | Hahmo, perus | Profiili, kaupunkivalinta |
| `assets/graphics/connector-wave.svg` | Hahmo vilkuttaa | Tervetulo, etusivu |
| `assets/graphics/connector-search.svg` | Hahmo etsii | Haku |
| `assets/graphics/connector-empty.svg` | Hahmo apea | Ei osumia |
| `assets/graphics/connector-celebrate.svg` | Hahmo juhlii | Varaus valmis |

## 3. Kirpputorikuvat, 10 tiedostoa

Vaakakuva, suositus 1600 x 900 px, `.jpg`.

| Tiedosto | Kirpputori | Kaupunki |
|---|---|---|
| `assets/demo/market-ogeli-hki.jpg` * | Ogelin kirppis | Helsinki |
| `assets/demo/market-patina-hki.jpg` * | Punavuoren Patina | Helsinki |
| `assets/demo/market-vekara-hki.jpg` | Vekarakirppis | Helsinki |
| `assets/demo/market-metka-tre.jpg` | Metka | Tampere |
| `assets/demo/market-nurkka-tku.jpg` | Nurkka | Turku |
| `assets/demo/market-koto-oul.jpg` | Koto Kirpputori | Oulu |
| `assets/demo/market-kangas-jkl.jpg` | Kankaan Kirppis | Jyväskylä |
| `assets/demo/market-hiiden-vih.jpg` | Hiiden Kirppis | Vihti |
| `assets/demo/market-lykky-rau.jpg` | Lykky | Rauma |
| `assets/demo/market-keidas-sal.jpg` | Kirppis-Keidas | Salo |

## 4. Myyjäkuvat, 14 tiedostoa

Neliö, suositus 600 x 600 px, `.jpg`. Ei tunnistettavia kasvoja: kädet, kaappi,
vaaterekki tai muu tunnelmakuva riittää, koska myyjät ovat keksittyjä.

| Tiedosto | Myyjä |
|---|---|
| `assets/demo/seller-anni-k.jpg` * | Anni K. |
| `assets/demo/seller-jussi-m.jpg` | Jussi M. |
| `assets/demo/seller-meri-l.jpg` | Meri L. |
| `assets/demo/seller-perhe-virtanen.jpg` * | Perhe Virtanen |
| `assets/demo/seller-tuomas-r.jpg` | Tuomas R. |
| `assets/demo/seller-sanni-h.jpg` | Sanni H. |
| `assets/demo/seller-elias-p.jpg` | Elias P. |
| `assets/demo/seller-kaisa-t.jpg` | Kaisa T. |
| `assets/demo/seller-oulun-oona.jpg` | Oona S. |
| `assets/demo/seller-rauman-riikka.jpg` | Riikka V. |
| `assets/demo/seller-salon-sami.jpg` | Sami A. |
| `assets/demo/seller-venla-n.jpg` | Venla N. |
| `assets/demo/seller-aleksi-v.jpg` | Aleksi V. |
| `assets/demo/seller-pihla-e.jpg` | Pihla E. |

## 5. Tuotekuvat, 64 pääkuvaa

Pystykuva, suositus 1200 x 1600 px, `.jpg`. Jokaiselle tuotteelle voi lisätä
kaksi lisäkuvaa samalla nimellä ja päätteellä `-2` ja `-3`, esimerkiksi
`prod-naiset-001-2.jpg`. Lisäkuvat ovat vapaaehtoisia.

### Naiset, 9 kpl

| Tiedosto | Tuote |
|---|---|
| `assets/product-photos/prod-naiset-001.jpg` * | Villakangastakki |
| `assets/product-photos/prod-naiset-002.jpg` * | Marimekko Tasaraita paita |
| `assets/product-photos/prod-naiset-003.jpg` | Nanso villapaita |
| `assets/product-photos/prod-naiset-004.jpg` | Vintage samettimekko |
| `assets/product-photos/prod-naiset-005.jpg` | Levi’s 501 farkut |
| `assets/product-photos/prod-naiset-006.jpg` | Samuji neulemekko |
| `assets/product-photos/prod-naiset-007.jpg` | Trenssitakki |
| `assets/product-photos/prod-naiset-008.jpg` | Raidallinen neule |
| `assets/product-photos/prod-naiset-009.jpg` | Plisseerattu hame |

### Miehet, 7 kpl

| Tiedosto | Tuote |
|---|---|
| `assets/product-photos/prod-miehet-010.jpg` | Villakangastakki |
| `assets/product-photos/prod-miehet-011.jpg` | Levi’s 511 farkut |
| `assets/product-photos/prod-miehet-012.jpg` | Villapaita, harmaa |
| `assets/product-photos/prod-miehet-013.jpg` | Marimekko Jokapoika paita |
| `assets/product-photos/prod-miehet-014.jpg` | Reima kuoritakki |
| `assets/product-photos/prod-miehet-015.jpg` | Flanellipaita |
| `assets/product-photos/prod-miehet-016.jpg` | Neuletakki |

### Lapset, 10 kpl

| Tiedosto | Tuote |
|---|---|
| `assets/product-photos/prod-lapset-017.jpg` * | Reima Tec talvihaalari |
| `assets/product-photos/prod-lapset-018.jpg` | Lindex kevythaalari |
| `assets/product-photos/prod-lapset-019.jpg` | Reima kurahaalari |
| `assets/product-photos/prod-lapset-020.jpg` | Polarn O. Pyret välikausihaalari |
| `assets/product-photos/prod-lapset-021.jpg` | Juhlamekko tyllihelmalla |
| `assets/product-photos/prod-lapset-022.jpg` | Marimekko lasten mekko |
| `assets/product-photos/prod-lapset-023.jpg` | Molo softshell takki |
| `assets/product-photos/prod-lapset-024.jpg` | Name It samettimekko |
| `assets/product-photos/prod-lapset-025.jpg` | Trikoohousut, 2 paria |
| `assets/product-photos/prod-lapset-026.jpg` | Villatakki, käsintehty |

### Koti ja sisustus, 8 kpl

| Tiedosto | Tuote |
|---|---|
| `assets/product-photos/prod-koti-027.jpg` * | Rottinkituoli |
| `assets/product-photos/prod-koti-028.jpg` | Pöytälamppu, messinki |
| `assets/product-photos/prod-koti-029.jpg` | Marimekko Unikko verhot |
| `assets/product-photos/prod-koti-030.jpg` | Finlayson päiväpeite |
| `assets/product-photos/prod-koti-031.jpg` | Artek jakkara 60 |
| `assets/product-photos/prod-koti-032.jpg` | Kynttilälyhdyt, 3 kpl |
| `assets/product-photos/prod-koti-033.jpg` | Samettinen koristetyyny |
| `assets/product-photos/prod-koti-034.jpg` | Seinäkello, 70-luku |

### Astiat, 9 kpl

| Tiedosto | Tuote |
|---|---|
| `assets/product-photos/prod-astiat-035.jpg` * | Iittala Teema lautaset, 4 kpl |
| `assets/product-photos/prod-astiat-036.jpg` | Arabia Paratiisi vati |
| `assets/product-photos/prod-astiat-037.jpg` | Iittala Kartio lasit, 6 kpl |
| `assets/product-photos/prod-astiat-038.jpg` | Arabia 24h kulhot, 4 kpl |
| `assets/product-photos/prod-astiat-039.jpg` | Marimekko Oiva mukit, 2 kpl |
| `assets/product-photos/prod-astiat-040.jpg` | Pentik kahvikupit, 4 kpl |
| `assets/product-photos/prod-astiat-041.jpg` | Iittala Aalto maljakko |
| `assets/product-photos/prod-astiat-042.jpg` | Rörstrand Mon Amie kulho |
| `assets/product-photos/prod-astiat-043.jpg` | Arabia Kilta lautanen |

### Kengät, 7 kpl

| Tiedosto | Tuote |
|---|---|
| `assets/product-photos/prod-kengat-044.jpg` | Converse Chuck Taylor |
| `assets/product-photos/prod-kengat-045.jpg` | Vagabond nilkkurit |
| `assets/product-photos/prod-kengat-046.jpg` | Nokian kumisaappaat |
| `assets/product-photos/prod-kengat-047.jpg` | Reima kumisaappaat |
| `assets/product-photos/prod-kengat-048.jpg` | Juhlakengät lapselle |
| `assets/product-photos/prod-kengat-049.jpg` | Nahkasandaalit |
| `assets/product-photos/prod-kengat-050.jpg` | Talvisaappaat, villavuori |

### Asusteet, 6 kpl

| Tiedosto | Tuote |
|---|---|
| `assets/product-photos/prod-asusteet-051.jpg` * | Vintage nahkalaukku |
| `assets/product-photos/prod-asusteet-052.jpg` | Marimekko kangaskassi |
| `assets/product-photos/prod-asusteet-053.jpg` | Silkkihuivi, 60-luku |
| `assets/product-photos/prod-asusteet-054.jpg` | Kalevala Koru riipus |
| `assets/product-photos/prod-asusteet-055.jpg` | Villasukat, käsintehdyt |
| `assets/product-photos/prod-asusteet-056.jpg` | Villahattu |

### Viihde, 8 kpl

| Tiedosto | Tuote |
|---|---|
| `assets/product-photos/prod-viihde-057.jpg` | Vinyyli: suomirock 1978 |
| `assets/product-photos/prod-viihde-058.jpg` | Vinyyli: jazzkokoelma |
| `assets/product-photos/prod-viihde-059.jpg` | Tove Jansson: Muumilaakson marraskuu |
| `assets/product-photos/prod-viihde-060.jpg` | Keittokirja, 70-luku |
| `assets/product-photos/prod-viihde-061.jpg` | Lautapeli: Afrikan tähti |
| `assets/product-photos/prod-viihde-062.jpg` | Sarjakuva-albumit, 5 kpl |
| `assets/product-photos/prod-viihde-063.jpg` | Vinyyli: klassinen sinfonia |
| `assets/product-photos/prod-viihde-064.jpg` | Palapeli 1000 palaa |

## Yhteenveto

- Kaikkiaan 100 kuvaa: 4 logoa, 8 grafiikkaa, 10 kirpputorikuvaa, 14 myyjäkuvaa ja 64 tuotekuvaa.
- Demon pääpolku (tähdellä merkityt): 17 kuvaa.
- Lisäkuvia voi halutessaan lisätä 2 kpl per tuote, eli enintään 128 kpl.
