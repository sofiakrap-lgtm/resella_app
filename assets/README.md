# ReSello, kuvatiedostot / image assets

> Tarkka lista jokaisesta tiedostonimestä: [KUVALISTA.md](KUVALISTA.md)

## Suomeksi

### Miten kuvat lisätään

**Selaimessa, ei vaadi git-osaamista**

1. Avaa repo GitHubissa ja mene haluttuun kansioon, esimerkiksi
   `assets/product-photos`.
2. Paina **Add file -> Upload files**.
3. Raahaa tiedostot ja paina **Commit changes**.

Tiedostojen pitää olla oikein nimettyjä jo ennen lataamista, katso KUVALISTA.md.

### Tarkista nimet

```bash
npm run check-assets
```

Komento kertoo montako kuvaa on paikallaan, mitkä puuttuvat demon pääpolulta ja
mitkä tiedostonimet eivät vastaa mitään, eli ovat todennäköisesti kirjoitusvirheitä.

**GitHub Desktopilla**

1. `File -> Clone repository`, valitse `sofiakrap-lgtm/resella_app`.
2. Vaihda haara ylhäältä `Current branch` kohdasta oikeaksi.
3. `Repository -> Show in Finder` (Mac) tai `Show in Explorer` (Windows).
4. Kopioi kuvat oikeisiin `assets` alikansioihin.
5. Palaa GitHub Desktopiin, kirjoita kuvaus ja paina `Commit`, sitten `Push origin`.

Ennen kopiointia kannattaa painaa `Fetch origin` ja `Pull`, jos repoon on tullut
muutoksia.

**Koneelta gitillä**

```bash
git pull
cp ~/kuvat/*.jpg assets/product-photos/
git add assets && git commit -m "Lisää tuotekuvat" && git push
```


Pudota oikeat kuvat tähän kansioon. Demo toimii ilman niitäkin: jos tiedosto
puuttuu, sovellus näyttää brändinmukaisen paikkamerkin (ReSello-merkki ja
hillitty värikenttä), ei koskaan rikkinäistä kuvaa.

Kun tiedostot ovat paikallaan, aja `npm run sync-assets` (tai käynnistä
`npm run dev` uudelleen, se ajaa saman automaattisesti). Komento kopioi
`/assets` kansion sisällön kansioon `/public/assets`, josta Next.js tarjoilee ne.

### Mihin mikäkin tulee

| Kansio | Tiedosto | Mihin näkyy |
|---|---|---|
| `assets/logos/` | `logo-wordmark.svg` | Nimilogo tummana, vaalealla taustalla |
| `assets/logos/` | `logo-wordmark-light.svg` | Nimilogo kermana, tummalla taustalla |
| `assets/logos/` | `logo-mark.svg` | Neliömäinen logo, tumma |
| `assets/logos/` | `logo-mark-light.svg` | Neliömäinen logo, kerma |
| `assets/graphics/` | `shape-star.svg`, `shape-wave.svg`, `shape-pebble.svg` | Koristemuodot, ottavat värinsä ympäristöstä |
| `assets/graphics/` | `connector-mascot.svg` | Hahmo, perusasento |
| `assets/graphics/` | `connector-wave.svg` | Hahmo vilkuttaa (tervetuloa, koti) |
| `assets/graphics/` | `connector-search.svg` | Hahmo etsii (haku) |
| `assets/graphics/` | `connector-empty.svg` | Hahmo tyhjässä tilassa (ei osumia) |
| `assets/graphics/` | `connector-celebrate.svg` | Hahmo juhlii (varaus valmis) |
| `assets/product-photos/` | `prod-naiset-001.jpg`, `-2.jpg`, `-3.jpg` | Tuotteen kuvat 1, 2 ja 3 |
| `assets/demo/` | `market-ogeli-hki.jpg` | Kirpputorin kuva |
| `assets/demo/` | `seller-anni-k.jpg` | Myyjän kuva |

### Nimeämissäännöt

- Tuotekuvat: `prod-<kategoria>-<numero>.jpg` on pääkuva, `-2.jpg` ja `-3.jpg`
  ovat vapaaehtoiset lisäkuvat. Täydellinen lista on tiedostossa KUVALISTA.md,
  joka luodaan datasta komennolla `npm run kuvalista`.
- Kirpputorikuvat: `market-<tunnus>.jpg`, tunnukset tiedostossa `data/markets.ts`
  (`coverImage`-kenttä).
- Myyjäkuvat: `seller-<tunnus>.jpg`, tunnukset tiedostossa `data/sellers.ts`
  (`avatar`-kenttä). Myyjät ovat keksittyjä, joten älä käytä tunnistettavia
  kasvoja.
- Suositellut koot: tuotekuva 1200 x 1600 px (3:4), kirpputorikuva 1600 x 900 px,
  myyjäkuva 600 x 600 px, hahmot ja logot SVG-muodossa.
- Tiedostomuodot: `.jpg` valokuville, `.svg` logoille ja hahmoille.

Kuvien polut on koottu yhteen tiedostoon `lib/imagePath.ts`. Jos haluat muuttaa
nimeämistapaa, muuta se siellä, älä komponenteissa.

## In English

Drop the real images into this folder. The demo works without them: a missing
file renders a branded placeholder (ReSello mark on a muted colour field), never
a broken image.

After adding files run `npm run sync-assets` (or restart `npm run dev`, which
does it automatically). The script copies `/assets` into `/public/assets`, which
Next.js serves statically.

Naming rules:

- Product photos: `prod-<category>-<number>.jpg` is the main photo,
  `-2.jpg` and `-3.jpg` are the optional extras. The full list is in
  KUVALISTA.md, generated from the data with `npm run kuvalista`.
- Market photos: `market-<id>.jpg` (see `coverImage` in `data/markets.ts`).
- Seller photos: `seller-<id>.jpg` (see `avatar` in `data/sellers.ts`). Sellers
  are fictional, so do not use recognisable faces.
- Logos, shapes and the mascot: SVG, file names listed in the table above.
- Suggested sizes: products 1200 x 1600 px (3:4), markets 1600 x 900 px,
  sellers 600 x 600 px.

All paths are resolved in `lib/imagePath.ts`. Change the convention there, not
in the components.
