# ReSello, kuluttaja-appin demo

Interaktiivinen, iOS 26 tyylinen web-demo ReSellon kuluttajasovelluksesta.
Demo näyttää valmiilta sovellukselta: sitä voi esitellä suoraan puhelimesta tai
työpöydältä.

Idea on yksinkertainen. Suomessa on satoja itsepalvelukirpputoreja, mutta niiden
valikoimaa ei näe mistään ennen kuin menee paikan päälle. Tämä sovellus näyttää
kaikkien kirpputorien tuotteet yhdestä paikasta ja kertoo tarkalleen, missä
pöydässä tuote on ja kuka sitä myy.

> 121 tuotetta seitsemällä kirpputorilla Helsingissä ja Espoossa. Tuotteet ja
> kirpputorit ovat oikeita, myyjät ovat keksittyjä henkilöitä eikä
> taustapalvelua ole.

## Käynnistys

```bash
npm install
npm run dev     # http://localhost:3000
```

Muut komennot:

```bash
npm run data         # luo /data tuotetaulukosta (aja CSV:n muutoksen jälkeen)
npm run kuvalista    # luo assets/KUVALISTA.md samasta taulukosta
npm run check-assets # kertoo mitkä kuvat puuttuvat ja mitkä nimet ovat väärin
npm run build        # tuotantokäännös
npm run start        # tuotantopalvelin
npm run build:export # staattinen vienti kansioon ./out
npm run sync-assets  # kopioi /assets -> /public/assets
npm run typecheck    # TypeScript
```

Työpöydällä (leveys >= 768 px) sovellus näkyy iPhone-kehyksessä. Puhelimessa se
on kokoruututilassa ja kunnioittaa turva-alueita. Sovellus on PWA-valmis, eli
sen voi lisätä puhelimen kotinäyttöön.

## Julkaisu

**1. Netlify Drop, nopein, ei tilin luontia**

```bash
npm run build:export   # kirjoittaa ./out
```

Raahaa `out`-kansio osoitteeseen https://app.netlify.com/drop. Osoite on valmis
noin 30 sekunnissa.

**2. Vercel, suositus jos haluat automaattiset päivitykset**

Mene osoitteeseen https://vercel.com/new, tuo tämä GitHub-repo ja paina Deploy.
Ei asetuksia, Next.js tunnistetaan automaattisesti. Jokainen push päivittää
sivuston.

**3. GitHub Pages, valmis työnkulku repossa**

Repossa on `.github/workflows/pages.yml`. Ota käyttöön kerran:
Settings -> Pages -> Build and deployment -> Source: **GitHub Actions**.
Sen jälkeen jokainen push julkaisee osoitteeseen
`https://<käyttäjä>.github.io/<repo>/`.

Staattinen vienti toimii myös omalla webhotellilla: kopioi `out`-kansion sisältö
juurihakemistoon. Sivusto tarvitsee palvelimen, `index.html` ei avaudu suoraan
tiedostojärjestelmästä.

## Kuvat

Oikeat kuvat pudotetaan kansioon `/assets`. Tarkka lista jokaisesta
tiedostonimestä on tiedostossa [assets/KUVALISTA.md](assets/KUVALISTA.md), ja
ohjeet lataamiseen [assets/README.md](assets/README.md). Ne kopioidaan
automaattisesti kansioon `/public/assets` ennen `dev` ja `build` komentoja.
Jokainen kuva renderöidään `<SafeImage>` komponentin kautta, joten puuttuva
tiedosto näkyy brändin mukaisena paikkamerkkinä, ei rikkinäisenä kuvana.

## Navigaatio

Alapalkissa on neljä välilehteä, ei enempää:

| Välilehti | Mitä siellä on |
|---|---|
| **Koti** | Uutta tänään, seuraamasi kirpputorit ja myyjät, sinulle, lähellä |
| **Selaa** | Kategoriat, Kirpputorit ja Myyjät samassa segmenttivalitsimessa |
| **Toivelista** | Tallennetut tuotteet, hakuvahdit ja seuratut |
| **Oma** | Varaukset ja noutokoodit, ostot, seuratut, asetukset |

Tab bar pienenee kun sisältöä vieritetään alaspäin ja palaa kun vieritetään ylös.

## Näkymät

| Polku | Näkymä |
|---|---|
| `/` | Splash, ohjaa eteenpäin |
| `/onboarding` | Kaupunki, kiinnostukset ja koot, ei pakollista tiliä |
| `/koti` | Feed: uutta tänään, seuratut, sinulle, lähellä sinua |
| `/selaa` | Neljä tapaa selata: Kategoriat, Kirpputorit, Myyjät, Tyyli |
| `/selaa/kategoria/[slug]` | Kategorian tuotteet, alakategoriat ja suodattimet |
| `/haku` | Tekstihaku, suodattimet, esimerkkihaut, hakuvahdin tallennus |
| `/tuote/[id]` | Tuotesivu: kuvat, kirpputori, pöytä, myyjä, varaa tai osta |
| `/kirpputori/[id]` | Kirpputoriprofiili: aukiolo, valikoima, uutta, myyjät, kartta |
| `/myyja/[id]` | Myyjän sivu: missä pöydässä myy ja mihin asti, koko valikoima |
| `/kartta` | Kartta kirpputoreista, pohjalevy listalla |
| `/varaus/[id]` | Varaus tai osto, vieraana ilman tiliä |
| `/qr` | Noutokoodi: QR, varaustunnus, noutoaika ja peruutus |
| `/toivelista` | Tallennetut, hakuvahdit, seuratut |
| `/oma` | Varaukset, ostot, seuratut, asetukset |
| `/ilmoitukset` | Uutuudet, hakuvahdin osumat, noutomuistutukset, hinnanlaskut |

Kaikki näkymät ovat kuluttajan näkymiä. Kassa-, tilitys- ja hallintanäkymät
eivät kuulu tähän sovellukseen.

## Data

Kaikki tuotetiedot tulevat yhdestä tiedostosta:

```
data/source/tuotteet.csv    121 tuotetta: nimi, merkki, kategoria, koko, väri,
                            kunto, hinta, kirpputori, pöytä, myyjä, hakusanat
data/source/paikat.json     se mitä taulukossa ei ole: kirpputorien osoitteet,
                            koordinaatit ja aukioloajat, myyjien nimet ja esittelyt
```

Komento `npm run data` lukee nämä ja kirjoittaa kansion `/data`. **Älä muokkaa
`/data`-kansion tiedostoja käsin**, ne ylikirjoitetaan. Kun haluat muuttaa
tuotetta, muuta CSV:tä ja aja komento uudelleen.

Samasta lähteestä syntyvät myös hakuvahdit, ilmoitukset ja esimerkkihaut, joten
ne osuvat aina oikeisiin tuotteisiin. `npm run kuvalista` ja
`npm run check-assets` lukevat saman tiedoston, joten kuvalista ei voi vanhentua.

Tuotekuvien nimet tulevat CSV:n sarakkeesta `Kuvatiedosto` sellaisenaan,
esimerkiksi `Arc_teryx_Beta_LT.png`. Älä nimeä kuvia uudelleen.

## Rakenne

```
app/                  Next.js App Router, yksi kansio per näkymä
components/
  ui/                 Perusosat: napit, chipit, sheet, tab bar, SafeImage, ikonit
  views/              Dynaamisten reittien client-näkymät
  ProductCard.tsx     Tuotekortti ja tuoterivi
  MarketHeader.tsx    Kirpputorikortti ja aukiolotila
  SellerHeader.tsx    Myyjäkortti, avatar ja "missä myy nyt"
  FilterSheet.tsx     Suodatinpaneeli
  MarketMap.tsx       Offline-kartta
data/
  source/             Lähdeaineisto, tätä muokataan
  *.ts                Generoitu, älä muokkaa
lib/
  types.ts            Jaetut tyypit
  filters.ts          Suodatus, haku, samankaltaiset tuotteet
  format.ts           Hinnat, etäisyydet, päivämäärät, kaupunkimuodot
  time.ts             Aukioloajat, noutoikkunat, laskurit
  state.tsx           Sovelluksen tila (localStorage)
  imagePath.ts        Kuvapolut ja paikkamerkkityypit
  motion.ts           Jousianimaatiot
scripts/
  generate-data.mjs   CSV -> /data
  kuvalista.mjs       CSV -> assets/KUVALISTA.md
  expected-assets.mjs Odotettujen kuvien lista, jaettu yllä olevien kesken
  sync-assets.mjs     /assets -> /public/assets + kuvamanifesti
  check-assets.mjs    Kuvien tarkistus
assets/               Kuvat (katso assets/README.md)
marketing/            Landing page (erillinen sivu, ei osa sovellusta)
```

Kolme selausulottuvuutta on kytketty toisiinsa ristiin: tuotteesta pääsee sekä
kirpputorille että myyjälle, kirpputorilta myyjiin ja tuotteisiin, myyjältä
takaisin kirpputorille ja hänen tuotteisiinsa. Tuotteen kirpputori ja pöytä
johdetaan myyjästä, ja myyjän pöytä tulee taulukosta, joten tiedot eivät voi
eriytyä.

## Teknisiä valintoja

- **Next.js App Router + TypeScript + Tailwind CSS v4.** Ei taustapalvelua.
- **Konsta UI (iOS-teema)** ryhmitellyissä listoissa ja kytkimissä.
  Navigointikerros (tab bar, navigointipalkki, sheetit) on rakennettu käsin,
  jotta Liquid Glass -materiaali ja saavutettavuusasetukset pysyvät hallinnassa.
- **Framer Motion** jousianimaatioihin: perus `{stiffness:170, damping:26}`,
  eloisa `{stiffness:100, damping:10}`, sheet `{stiffness:130, damping:18}`,
  painallus `{stiffness:400, damping:30}`. Animoidaan vain `transform` ja
  `opacity`, ja liike vaimenee jos käyttäjä on valinnut vähemmän liikettä.
- **Kartta** on tarkoituksella offline: tyylitelty piirros ja lineaarinen
  projektio. Ei rajapinta-avaimia, toimii aina.

### Brändi

| Tunniste | Arvo | Käyttö |
|---|---|---|
| `--color-cream` | `#FFFDFA` | Kangas |
| `--color-surface` | `#FFFFFF` | Kortit ja kentät |
| `--color-cream-panel` | `#FBF6EF` | Korostetut kortit ja tagit |
| `--color-cream-sink` | `#F5EEE4` | Upotetut pinnat, kuvapohjat |
| `--color-hairline` | `#ECE3D8` | Hiuskarvaviiva |
| `--color-brown` | `#3C2415` | Teksti ja ikonit |
| `--color-terracotta` | `#C0693A` | Korostus ilman tekstiä |
| `--color-terracotta-ink` | `#8F4A28` | Sama korostus tekstin kanssa |

Kortit ovat valkoisia lähes valkoisella kankaalla. Aiemmin molemmat olivat
`#FFFBF4`, joten kortti erottui vain varjosta ja näkymä tuntui litteältä ja
raskaalta. Syvyys tulee nyt pinnan vaihdosta ja tyhjästä tilasta.

Terrakotta `#C0693A` antaa vain 3,8:1 kontrastin kermaa vasten, joten se on
koristeväri. Aina kun väri kantaa tekstiä (napit, valitut chipit, aktiivinen
välilehti), käytetään tummempaa `#8F4A28`, joka antaa 6,4:1. Värit määritellään
yhdessä paikassa, tiedoston `app/globals.css` alussa.

Brändin kirjasin on Helvetica Now. Se on lisensoitu, joten sitä ei ladata
verkosta. Fonttipino käyttää sitä, jos se on asennettu, ja muuten iOS:n omia
leikkauksia (SF Pro), jolloin natiivi tuntuma säilyy. Jos hankit lisenssin,
lisää tiedostot ja `@font-face` säännöt, muuta ei tarvita.

### Liquid Glass

Lasi on vain navigointikerroksessa: tab bar, navigointipalkki, sheetin ylälaita,
kelluvat napit ja ilmoitukset. Sisältökerros (listat, tekstit, kortit) on aina
kiinteällä pinnalla, jotta kontrasti pysyy luettavana. Läpinäkyvyys vaihtuu
kiinteäksi, jos käyttöjärjestelmä tai asetus pyytää vähemmän läpinäkyvyyttä.

### Saavutettavuus

- Kosketuskohteet vähintään 44 x 44 pt, mitattu selaimessa jokaisesta näkymästä.
- Kontrastit on mitattu ohjelmallisesti jokaisesta näkymästä: kaikki teksti
  läpäisee WCAG 2.2 AA:n (4,5:1, isot tekstit 3:1).
- Tekstin koko skaalautuu (`Suurempi teksti`). Layout on testattu ilman
  vaakavieritystä jokaisessa näkymässä.
- `Vähennä liikettä` ja `Lisää kontrastia` on kytketty oikeasti kiinni, samoin
  järjestelmän oma `prefers-reduced-motion`.
- Merkitystä ei välitetä pelkällä värillä: kunto, saatavuus ja aukiolo kerrotaan
  myös tekstinä ja ikonilla.
- Jokaisella interaktiivisella elementillä on suomenkielinen nimi ruudunlukijalle.

## Mitä on mockattu

- **Haku** on avainsanapohjainen suodatus mock-datasta. Hakukentän
  esimerkkihakujen joukossa on yksi luonnollisen kielen haku, joka näyttää mihin
  ominaisuus tähtää. Tuotannossa tämä kerros muuttaa kysymyksen suodattimiksi ja
  hakee kassadatan tuoteindeksistä.
- **Maksaminen.** Apple Pay ja MobilePay ovat napit, eivät integraatioita.
- **QR-koodi** on deterministinen piirros varauskoodista.
- **Ilmoitukset** ovat sovelluksen sisäisiä, eivät push-viestejä.
- **Sijainti** on valittu kaupunki, ei laitteen GPS.
- **Tyyli** järjestää valikoiman sen mukaan, mitä tallennettujen kuvien kanssa
  on yhteistä: sama kategoria, sama väri, samoja hakusanoja taulukosta. Ei
  mallia eikä ulkoista palvelua, sama sanaosuma jota haku käyttää.

## Tilat esittelyssä

Jokaisella datanäkymällä on lataus-, tyhjä- ja virhetila.

- **Lataus** näkyy aina, kun näkymä avataan (luurangot).
- **Tyhjä tila** nähdään esimerkiksi haulla, jolle ei ole osumia:
  `/haku?q=kajakki`. Sieltä pääsee tallentamaan hakuvahdin.
- **Virhetila** on kytketty demoa varten: lisää `?demo=error` osoitteen perään.
  Toimii kaikissa datanäkymissä, myös `/oma` ja `/ilmoitukset`. Sovelluksessa
  itsessään ei ole demopainikkeita.

## Demon kulku esittelyssä

1. `/onboarding`: valitse kaupunki ja pari kiinnostusta.
2. `/koti`: uutta tänään seuraamiltasi kirpputoreilta.
3. `/selaa`: näytä kolme tapaa selata, vaihda Kategoriat -> Myyjät.
4. Avaa myyjä, näytä pöytänumero ja vuokran voimassaolo.
5. Avaa tuote, näytä merkki, kunto, kirpputori, pöytä ja saatavuus.
   Varaa noudettavaksi.
6. `/qr`: noutokoodi ja laskuri.
7. `/oma`: varaus näkyy laskurin kanssa. Suurenna teksti asetuksista.
