# ReSello, kuluttaja-appin demo

Interaktiivinen, iOS 26 tyylinen web-demo ReSellon kuluttajasovelluksesta.
Demo näyttää valmiilta sovellukselta: sitä voi esitellä kirpputoriyrittäjille,
vaikuttajille ja sijoittajille suoraan puhelimesta tai työpöydältä.

ReSellon vaihe 1 on kirpputoriyrittäjien kassa- ja varausjärjestelmä. Koska kassa
tietää, mikä tuote on missäkin pöydässä, vaihe 2 (tämä demo) voi tarjota
kuluttajalle jotain, mitä yksikään second hand -sovellus ei tee: reaaliaikaisen
haun kaikkien kirpputorien tuotteisiin, pöytätasolle asti.

> Kaikki tiedot ovat esimerkkitietoja. Taustapalvelua ei ole, ja "tekoäly" on
> käsin kirjoitettu ja deterministinen.

## Käynnistys

```bash
npm install
npm run dev     # http://localhost:3000
```

Muut komennot:

```bash
npm run build        # tuotantokäännös
npm run start        # tuotantopalvelin
npm run sync-assets  # kopioi /assets -> /public/assets
npm run typecheck    # TypeScript
```

Työpöydällä (leveys >= 768 px) sovellus näkyy iPhone 16 Pro -kehyksessä.
Puhelimessa se on kokoruututilassa ja kunnioittaa turva-alueita. Sovellus on
PWA-valmis, eli sen voi lisätä puhelimen kotinäyttöön.

## Julkaisu

Demo toimii kolmella tavalla. Kaikki antavat julkisen osoitteen.

**1. Netlify Drop, nopein, ei tilin luontia**

```bash
npm run build:export   # kirjoittaa ./out
```

Raahaa `out`-kansio osoitteeseen https://app.netlify.com/drop. Osoite on
valmis noin 30 sekunnissa.

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

Oikeat kuvat pudotetaan kansioon `/assets` (katso [assets/README.md](assets/README.md)).
Ne kopioidaan automaattisesti kansioon `/public/assets` ennen `dev` ja `build`
komentoja. Jokainen kuva renderöidään `<SafeImage>` komponentin kautta, joten
puuttuva tiedosto näkyy brändin mukaisena paikkamerkkinä, ei rikkinäisenä kuvana.

## Näkymät

| Polku | Näkymä |
|---|---|
| `/onboarding` | Tervetulo, kaupunki, makuvalinnat, ei pakollista tiliä |
| `/home` | Feed: uutta tänään, suosikkikirppikset, sinulle, lähellä sinua |
| `/search` | Tekstihaku, suodattimet, viimeksi haetut, suositut |
| `/ai-search` | Keskusteleva haku, neljä skriptattua esimerkkiä |
| `/results` | Tulokset listana tai kartalla, järjestys, pikakatselu |
| `/product/[id]` | Tuotesivu: kuvat, kirppis, pöytä, varaa tai osta |
| `/market/[id]` | Kirppisprofiili: aukioloajat, uutta tänään, kartta |
| `/map` | Kartta, pohjalevy listalla, kierroksen suunnittelu |
| `/pinterest` | Tyylihaku: Pinterest-yhdistys ja kuvahaku (mock) |
| `/saved` | Toivelista ja hakuvahdit |
| `/reserve/[id]` | Varaus tai osto, vieraana ilman tiliä |
| `/receipt/[id]` | Noutokuitti QR-koodilla |
| `/profile` | Varaukset, ostot, suosikit |
| `/settings` | Kieli, ulkoasu, ilmoitukset, saavutettavuus |

## Rakenne

```
app/            Next.js App Router, yksi kansio per näkymä
components/
  ui/           Perusosat: napit, chipit, sheet, tab bar, SafeImage, ikonit
  product/      Tuotekortti, tuoterivi, pikakatselu
  market/       Kirppiskortti, aukioloajat
  ai/           Chat-kuplat, ehdotukset, kirjoitusindikaattori
  map/          Karttanäkymä ja pinnit
  search/       Hakukenttä ja suodatinpaneeli
lib/
  mockData.ts   Kirppikset ja tuotteet (17 kirppistä, 56 tuotetta)
  mockAI.ts     Skriptatut vastaukset ja varasuunnitelma
  search.ts     Suodatus, järjestys, ehdotukset
  state.tsx     Sovelluksen tila (localStorage)
  i18n.ts       Kaikki käyttöliittymätekstit, suomi ja englanti
  tokens.ts     Jousianimaatiot ja mitat
  assets.ts     Kuvamanifesti
assets/         Sofian kuvat (katso assets/README.md)
```

## Teknisiä valintoja

- **Next.js App Router + TypeScript + Tailwind CSS v4.** Ei taustapalvelua.
- **Konsta UI (iOS-teema)** ryhmitellyissä listoissa, kytkimissä ja
  segmenttikontrolleissa (asetukset ja profiili). Navigointikerros (tab bar,
  navigointipalkki, sheetit) on rakennettu käsin, jotta Liquid Glass -materiaali
  ja saavutettavuusasetukset saadaan hallintaan tarkasti.
- **Framer Motion** jousianimaatioihin: perus `{stiffness:170, damping:26}`,
  eloisa `{stiffness:100, damping:10}`, sheet `{stiffness:130, damping:18}`.
  Animoidaan vain `transform` ja `opacity`, ja liike vaimenee automaattisesti
  jos käyttäjä on valinnut vähemmän liikettä.
- **Kartta** on tarkoituksella offline: tyylitelty piirros ja lineaarinen
  projektio. Ei rajapinta-avaimia, toimii aina.

### Brändi

Värit tulevat ReSellon brändistä: beige `#FAF1E0` ja tummanruskea `#3C2415`.
Kaikki muut sävyt ovat näiden kahden vaaleampia tai tummempia versioita, plus
yksi lämmin korostus (`#A65A32`) pieniin yksityiskohtiin, kuten Connector-hahmon
yhdistävään lankaan. Näin näkymä pysyy visuaalisesti rauhallisena eikä kuormita
silmää. Tumma tila on sama paletti käännettynä. Värit määritellään yhdessä
paikassa, tiedoston `app/globals.css` alussa.

Brändin kirjasin on Helvetica Now. Se on lisensoitu, joten sitä ei ladata
verkosta. Fonttipino käyttää sitä, jos se on asennettu, ja muuten iOS:n omia
leikkauksia (SF Pro), jolloin natiivi tuntuma säilyy. Jos hankit lisenssin,
lisää tiedostot ja `@font-face` säännöt, muuta ei tarvita.

Connector-hahmo on vain kuluttajapuolella, ei koskaan yrittäjän kassanäkymässä.

### Liquid Glass

Lasi on vain navigointikerroksessa: tab bar, navigointipalkki, sheetin ylälaita,
kelluvat napit ja ilmoitukset. Sisältökerros (listat, tekstit, kortit) on aina
kiinteällä pinnalla, jotta kontrasti pysyy luettavana. Läpinäkyvyys vaihtuu
kiinteäksi, jos käyttöjärjestelmä tai asetus pyytää vähemmän läpinäkyvyyttä.

### Saavutettavuus

- Kosketuskohteet vähintään 44 x 44 pt, mitattu selaimessa jokaisesta näkymästä.
- Tekstin koko skaalautuu (`Suurenna teksti` asetuksissa). Layout on testattu
  1,6-kertaiseen kokoon asti ilman vaakavieritystä. Sitä isommilla kertoimilla
  (yli 2x, iOS:n AX-koot) tuotelistan rivit alkavat ahtautua.
- Kontrastit on mitattu: leipäteksti ja sekundaariteksti yli 4,5:1, ikonit ja
  käyttöliittymäelementit yli 3:1, sekä vaaleassa että tummassa tilassa.
- `Vähennä liikettä`, `Lisää kontrastia` ja `Vähennä läpinäkyvyyttä` on kytketty
  oikeasti kiinni, samoin järjestelmän omat vastaavat asetukset.
- Merkitystä ei välitetä pelkällä värillä: kunto, tila ja aukiolo kerrotaan myös
  tekstinä ja ikonilla.
- Jokaisella interaktiivisella elementillä on suomenkielinen nimi ruudunlukijalle.

## Mitä on mockattu

- **Keskusteleva haku.** `lib/mockAI.ts` tunnistaa avainsanat ja palauttaa käsin
  kirjoitetun vastauksen neljään skriptattuun kysymykseen. Muut kysymykset
  ohjautuvat samaan avainsanahakuun kuin tavallinen haku, joten vastauksissa
  viitataan vain tuotteisiin, jotka ovat oikeasti mock-datassa. Tuotannossa tämä
  kerros on retrieval-pohjainen: malli muuttaa kysymyksen suodattimiksi ja
  vastaus kootaan kassadatan tuoteindeksistä.
- **Pinterest.** Yhdistäminen on esimerkki. Oikea toteutus vaatii Pinterestin
  Standard-accessin, eikä elokuun 2026 kehittäjäehtojen mukaan aineistoa saa
  tallentaa, kouluttaa sillä malleja tai jäljitellä Pinterestin ulkoasua.
  Realistinen polku on OAuth-yhdistys, analyysi lennossa ja mätsäys ReSellon
  omaan tuoteindeksiin ilman pysyvää tallennusta.
- **Maksaminen.** Apple Pay ja MobilePay ovat napit, eivät integraatioita.
- **QR-koodi** on deterministinen piirros varauskoodista.
- **Ilmoitukset** ovat sovelluksen sisäisiä toasteja.

## Tilat esittelyssä

Jokaisella datanäkymällä on lataus-, tyhjä- ja virhetila.

- **Lataus** näkyy aina, kun näkymä avataan (luurangot ja kimallus).
- **Tyhjä tila** nähdään esimerkiksi haulla, jolle ei ole osumia:
  `/results?q=kajakki`. Sieltä pääsee tallentamaan hakuvahdin.
- **Virhetila** on kytketty demoa varten osoitteeseen: lisää `?demo=error`
  osoitteen perään. Toimii kaikissa datanäkymissä: `/home`, `/results`,
  `/product/p-001`, `/market/m-ogeli`, `/map`, `/saved` ja `/pinterest`. Nappi
  `Yritä uudelleen` palaa normaaliin näkymään.

## Demon kulku esittelyssä

1. `/onboarding`: valitse kaupunki ja pari kiinnostusta.
2. `/home`: uutta tänään, sitten "Kokeile älykästä hakua".
3. `/ai-search`: klikkaa Levi's-kysymystä, näytä pöytänumerot tuloksissa.
4. Avaa tuote, näytä "Sijainti" ja pöytä, varaa noudettavaksi.
5. `/receipt`: QR kassalla.
6. `/map`: suunnittele kierros.
7. `/settings`: vaihda tumma tila ja suurenna teksti, näytä että kaikki kestää.
