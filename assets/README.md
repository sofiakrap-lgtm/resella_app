# ReSello, kuvatiedostot / image assets

## Suomeksi

Pudota oikeat kuvat tähän kansioon. Demo toimii ilman niitäkin: jos tiedosto
puuttuu, sovellus näyttää brändinmukaisen paikkamerkin (ReSello-merkki ja
hillitty värikenttä), ei koskaan rikkinäistä kuvaa.

Kun tiedostot ovat paikallaan, aja `npm run sync-assets` (tai käynnistä
`npm run dev` uudelleen, se ajaa saman automaattisesti). Komento kopioi
`/assets` kansion sisällön kansioon `/public/assets`, josta Next.js tarjoilee ne.

### Mihin mikäkin tulee

| Kansio | Tiedosto | Mihin näkyy |
|---|---|---|
| `assets/logos/` | `resello-logo.svg` | Koko logo (merkki ja nimi) |
| `assets/logos/` | `resello-wordmark.svg` | Pelkkä nimilogo |
| `assets/logos/` | `resello-icon.svg` | Neliömäinen sovellusikoni |
| `assets/graphics/` | `connector-mascot.svg` | Connector-hahmo, perusasento |
| `assets/graphics/` | `connector-wave.svg` | Hahmo vilkuttaa (tervetuloa, koti) |
| `assets/graphics/` | `connector-search.svg` | Hahmo etsii (älykäs haku, tyylihaku) |
| `assets/graphics/` | `connector-empty.svg` | Hahmo tyhjässä tilassa (ei osumia) |
| `assets/graphics/` | `connector-celebrate.svg` | Hahmo juhlii (varaus valmis) |
| `assets/product-photos/` | `p-001.jpg`, `p-001-2.jpg`, `p-001-3.jpg` | Tuotteen p-001 kuvat 1, 2 ja 3 |
| `assets/demo/` | `market-ogeli.jpg` | Kirppiksen m-ogeli kuva |
| `assets/demo/` | `demo-style-1.jpg` ... `demo-style-3.jpg` | Kuvahaun esimerkkikuvat |

### Nimeämissäännöt

- Tuotekuvat: `p-XXX.jpg` on pääkuva, `p-XXX-2.jpg` ja `p-XXX-3.jpg` ovat
  lisäkuvat. Tuotetunnukset löytyvät tiedostosta `lib/mockData.ts`.
- Kirppiskuvat: `market-<tunnus>.jpg`, esimerkiksi `market-lanttila.jpg`.
  Tunnukset ovat samassa tiedostossa (`photo`-kenttä).
- Suositellut koot: tuotekuva 1200 x 1500 px (4:5), kirppiskuva 1600 x 900 px,
  hahmot ja logot SVG-muodossa.
- Tiedostomuodot: `.jpg` valokuville, `.svg` logoille ja hahmoille.

Kuvien polut on koottu yhteen tiedostoon `lib/assets.ts`. Jos haluat muuttaa
nimeämistapaa, muuta se siellä, älä komponenteissa.

## In English

Drop the real images into this folder. The demo works without them: a missing
file renders a branded placeholder (ReSello mark on a muted colour field), never
a broken image.

After adding files run `npm run sync-assets` (or restart `npm run dev`, which
does it automatically). The script copies `/assets` into `/public/assets`, which
Next.js serves statically.

Naming rules:

- Product photos: `p-XXX.jpg` is the main photo, `p-XXX-2.jpg` and `p-XXX-3.jpg`
  are the additional ones. Product ids live in `lib/mockData.ts`.
- Market photos: `market-<id>.jpg`, for example `market-lanttila.jpg` (see the
  `photo` field in `lib/mockData.ts`).
- Logos and the Connector mascot: SVG, file names listed in the table above.
- Suggested sizes: products 1200 x 1500 px (4:5), markets 1600 x 900 px.

All paths are resolved in `lib/assets.ts`. Change the convention there, not in
the components.
