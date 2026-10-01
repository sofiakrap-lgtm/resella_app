# Generoitavat kuvat

Tämä tiedosto luodaan komennolla `npm run generoitavat`. Siinä on vain se mitä
vielä puuttuu, joten lista lyhenee itsestään kun pudotat kuvia kansioihin.

**Puuttuu 12 kuvaa.**

Yhteiset säännöt:

- Nimet täsmälleen kuten alla. Välilyönnit ja alaviivat ovat sallittuja, eri sanat eivät.
- Valokuvat `.jpg`, piirrokset `.svg`. **Ei .heic**, muunna iPhonen kuvat ensin.
- Koko ei haittaa, kuvat pakataan automaattisesti ennen julkaisua.
- Tarkista lopuksi `npm run check-assets`, tai lue raportti GitHubin Actions-sivulta.

## Kirpputorikuvat, 7 kpl

Kansio `assets/demo/`, vaakakuva **1600 x 900**, `.jpg`. Ei ihmisiä kuvassa.

### `market-tapanila-hki.jpg`

Tapanilan kirppis, Helsinki. Iso itsepalvelukirppis Tapanilassa. Vahva miesten ja ulkoiluvaatteiden valikoima.

```
large suburban self-service flea market hall, long rows of rented shelves, mens outdoor jackets and workwear on rails, warm film photography, soft natural daylight, muted warm tones, gentle grain, calm and nostalgic, no text, no logos, 16:9
```

### `market-ogeli-hki.jpg`

Ogelin Kirppis, Helsinki. Oulunkylän klassikko. Suomalaista designia, astioita ja sisustusta.

```
neighbourhood flea market, shelves of Finnish ceramics and glassware, a wall of folded textiles, warm film photography, soft natural daylight, muted warm tones, gentle grain, calm and nostalgic, no text, no logos, 16:9
```

### `market-hertsika-hki.jpg`

Hertsikan kirppis, Helsinki. Herttoniemen kirppis. Skandinaavista muotia ja vahva Y2K-osasto.

```
bright flea market floor, racks of womens coats and knitwear, a corner of nineties and Y2K clothing, warm film photography, soft natural daylight, muted warm tones, gentle grain, calm and nostalgic, no text, no logos, 16:9
```

### `market-bella-esp.jpg`

Bella Kirppis Suomenoja, Espoo. Espoon Suomenojan kirppis. Arkivaatteita, urheilua ja lastentarvikkeita.

```
spacious suburban flea market, everyday clothing and sportswear on rails, childrens corner at the back, warm film photography, soft natural daylight, muted warm tones, gentle grain, calm and nostalgic, no text, no logos, 16:9
```

### `market-relove-hki.jpg`

Relove Freda, Helsinki. Kahvila ja kirppis Fredrikinkadulla. Merkkilaukkuja ja designia.

```
small city centre second-hand boutique and cafe, designer handbags on a lit shelf, marble table and plants, warm film photography, soft natural daylight, muted warm tones, gentle grain, calm and nostalgic, no text, no logos, 16:9
```

### `market-skidilandia-hki.jpg`

Skidilandia, Helsinki. Vain lastentavaraa. Vaatteet, haalarit ja tarvikkeet vauvasta kouluikään.

```
childrens second-hand shop, small rails of overalls and snowsuits, wooden toy shelves, low bright room, warm film photography, soft natural daylight, muted warm tones, gentle grain, calm and nostalgic, no text, no logos, 16:9
```

### `market-siisti-hki.jpg`

Siisti Kirppis, Helsinki. Pieni ja tarkasti kuratoitu. Vintagea ja merkittömiä löytöjä.

```
tiny curated vintage shop, a single rail of selected pieces, warm lamp, wooden floor, warm film photography, soft natural daylight, muted warm tones, gentle grain, calm and nostalgic, no text, no logos, 16:9
```

## Connector-hahmo, 5 kpl

Kansio `assets/graphics/`, **SVG**, 240 x 240, läpinäkyvä tausta.

Kaikki viisi pitää piirtää **samalla tyylillä**, muuten hahmo vaihtaa ulkonäköä
näkymien välillä. Generoi ne samalla istunnolla tai käytä ensimmäistä mallina.

### `connector-mascot.svg`

Asento: standing calmly, facing forward.

```
Flat vector mascot for a Finnish second-hand app. One rounded dark brown (#3C2415) body shape with two small eyes and a simple smile, joined to a thin terracotta (#C0693A) curved line that reads as connecting arms. No gradients, no outline, no text, plain transparent background, centred with even margins. Pose: standing calmly, facing forward.
```

### `connector-wave.svg`

Asento: raising one arm in a friendly wave.

```
Flat vector mascot for a Finnish second-hand app. One rounded dark brown (#3C2415) body shape with two small eyes and a simple smile, joined to a thin terracotta (#C0693A) curved line that reads as connecting arms. No gradients, no outline, no text, plain transparent background, centred with even margins. Pose: raising one arm in a friendly wave.
```

### `connector-search.svg`

Asento: holding a round magnifier, leaning forward slightly.

```
Flat vector mascot for a Finnish second-hand app. One rounded dark brown (#3C2415) body shape with two small eyes and a simple smile, joined to a thin terracotta (#C0693A) curved line that reads as connecting arms. No gradients, no outline, no text, plain transparent background, centred with even margins. Pose: holding a round magnifier, leaning forward slightly.
```

### `connector-empty.svg`

Asento: sitting down, shoulders low, gently disappointed but kind.

```
Flat vector mascot for a Finnish second-hand app. One rounded dark brown (#3C2415) body shape with two small eyes and a simple smile, joined to a thin terracotta (#C0693A) curved line that reads as connecting arms. No gradients, no outline, no text, plain transparent background, centred with even margins. Pose: sitting down, shoulders low, gently disappointed but kind.
```

### `connector-celebrate.svg`

Asento: both arms up, three small sparks above.

```
Flat vector mascot for a Finnish second-hand app. One rounded dark brown (#3C2415) body shape with two small eyes and a simple smile, joined to a thin terracotta (#C0693A) curved line that reads as connecting arms. No gradients, no outline, no text, plain transparent background, centred with even margins. Pose: both arms up, three small sparks above.
```

## Mitä ei kannata generoida

**Käyttöliittymän ikonit.** Ne on piirretty koodissa (`components/ui/Icons.tsx`),
40 kappaletta, joista 16 on kategoriaikoneita. Ne perivät värin ympäristöstään,
skaalautuvat mihin kokoon tahansa ja painavat nolla kilotavua. Kuvatiedostoina ne
menettäisivät kaikki kolme. Jos haluat oman tyylin, anna yksi mallikuva, niin ne
piirretään uudelleen koodiin sen mukaan.
