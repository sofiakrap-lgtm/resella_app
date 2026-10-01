/**
 * Kirjoittaa assets/GENEROITAVAT.md: vain ne kuvat jotka vielä puuttuvat,
 * kukin valmiin generointikehotteen kanssa.
 *
 *   npm run generoitavat
 *
 * Lista lyhenee itsestään sitä mukaa kun kuvia lisätään, koska se lukee
 * saman lähteen kuin check-assets.
 */
import { readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readExpected } from './expected-assets.mjs';
import { assetKey } from './sync-assets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Shared opening so every photo lands in the same world. */
const LOOK =
  'warm film photography, soft natural daylight, muted warm tones, gentle grain, calm and nostalgic, no text, no logos';

/** What each market should look like, keyed by the name in the sheet. */
const MARKET_SCENE = {
  'Tapanilan kirppis': 'large suburban self-service flea market hall, long rows of rented shelves, mens outdoor jackets and workwear on rails',
  'Ogelin Kirppis': 'neighbourhood flea market, shelves of Finnish ceramics and glassware, a wall of folded textiles',
  'Hertsikan kirppis': 'bright flea market floor, racks of womens coats and knitwear, a corner of nineties and Y2K clothing',
  'Bella Kirppis Suomenoja': 'spacious suburban flea market, everyday clothing and sportswear on rails, childrens corner at the back',
  'Relove Freda': 'small city centre second-hand boutique and cafe, designer handbags on a lit shelf, marble table and plants',
  Skidilandia: 'childrens second-hand shop, small rails of overalls and snowsuits, wooden toy shelves, low bright room',
  'Siisti Kirppis': 'tiny curated vintage shop, a single rail of selected pieces, warm lamp, wooden floor',
};

/** A flat lay that says what this seller sells, without showing a person. */
const SELLER_SCENE = {
  'jussi-m': 'folded technical outdoor shell jackets and a packed rucksack',
  'tuomas-r': 'folded workwear jacket, dark denim and a knitted jumper',
  'aleksi-v': 'three backpacks of different ages, side by side',
  'sanni-h': 'four pairs of worn trainers and leather boots in a row',
  'meri-l': 'Finnish ceramic mugs and plates stacked on a linen cloth',
  'anni-k': 'folded wool coat, a cashmere jumper and a silk scarf',
  'venla-n': 'flared jeans, a small shiny handbag and tinted sunglasses',
  'pihla-e': 'folded everyday jumpers, a tote bag and sunglasses',
  'kaisa-t': 'folded running tights, a sports top and merino base layer',
  'perhe-virtanen': 'small childrens rain overall, folded baby clothes and knitted socks',
  'elias-p': 'a hand knitted striped jumper and a worn leather jacket',
  'oona-s': 'two designer leather handbags and a pair of heels on a marble surface',
};

/** Each mascot pose, drawn as a flat vector. */
const MASCOT_POSE = {
  'connector-mascot': 'standing calmly, facing forward',
  'connector-wave': 'raising one arm in a friendly wave',
  'connector-search': 'holding a round magnifier, leaning forward slightly',
  'connector-empty': 'sitting down, shoulders low, gently disappointed but kind',
  'connector-celebrate': 'both arms up, three small sparks above',
};

const SHAPE_NOTE =
  'Flat vector mascot for a Finnish second-hand app. One rounded dark brown (#3C2415) body shape with two small eyes and a simple smile, joined to a thin terracotta (#C0693A) curved line that reads as connecting arms. No gradients, no outline, no text, plain transparent background, centred with even margins.';

async function main() {
  const expected = await readExpected();
  const { meta } = expected;

  /** Names already on disk, matched the same way the app matches them. */
  const present = new Set();
  for (const folder of ['logos', 'graphics', 'demo', 'product-photos']) {
    const dir = path.join(root, 'assets', folder);
    if (!existsSync(dir)) continue;
    for (const file of await readdir(dir)) {
      if (!file.startsWith('.')) present.add(`${folder}/${assetKey(file)}`);
    }
  }
  const missing = (folder, names) => names.filter((n) => !present.has(`${folder}/${assetKey(n)}`));

  const markets = Object.entries(meta.places.markets).filter(
    ([, m]) => !present.has(`demo/${assetKey(`market-${m.id}`)}`),
  );
  const sellers = Object.entries(meta.places.sellers).filter(
    ([, s]) => !present.has(`demo/${assetKey(`seller-${s.id}`)}`),
  );
  const mascots = missing('graphics', Object.keys(MASCOT_POSE));
  const photos = missing('product-photos', expected['product-photos']);
  const logos = missing('logos', expected.logos);

  const total = markets.length + sellers.length + mascots.length + photos.length + logos.length;

  const out = [];
  out.push('# Generoitavat kuvat');
  out.push('');
  out.push('Tämä tiedosto luodaan komennolla `npm run generoitavat`. Siinä on vain se mitä');
  out.push('vielä puuttuu, joten lista lyhenee itsestään kun pudotat kuvia kansioihin.');
  out.push('');
  if (total === 0) {
    out.push('**Kaikki kuvat ovat paikallaan.**');
  } else {
    out.push(`**Puuttuu ${total} kuvaa.**`);
  }
  out.push('');
  out.push('Yhteiset säännöt:');
  out.push('');
  out.push('- Nimet täsmälleen kuten alla. Välilyönnit ja alaviivat ovat sallittuja, eri sanat eivät.');
  out.push('- Valokuvat `.jpg`, piirrokset `.svg`. **Ei .heic**, muunna iPhonen kuvat ensin.');
  out.push('- Koko ei haittaa, kuvat pakataan automaattisesti ennen julkaisua.');
  out.push('- Tarkista lopuksi `npm run check-assets`, tai lue raportti GitHubin Actions-sivulta.');
  out.push('');

  if (markets.length) {
    out.push(`## Kirpputorikuvat, ${markets.length} kpl`);
    out.push('');
    out.push('Kansio `assets/demo/`, vaakakuva **1600 x 900**, `.jpg`. Ei ihmisiä kuvassa.');
    out.push('');
    for (const [name, m] of markets) {
      const city = meta.csv.find((r) => r.Kirpputori === name)?.Kaupunki ?? '';
      out.push(`### \`market-${m.id}.jpg\``);
      out.push('');
      out.push(`${name}, ${city}. ${m.description}`);
      out.push('');
      out.push('```');
      out.push(`${MARKET_SCENE[name] ?? 'Finnish self-service flea market interior'}, ${LOOK}, 16:9`);
      out.push('```');
      out.push('');
    }
  }

  if (sellers.length) {
    out.push(`## Myyjäkuvat, ${sellers.length} kpl`);
    out.push('');
    out.push('Kansio `assets/demo/`, neliö **600 x 600**, `.jpg`.');
    out.push('');
    out.push('**Ei tunnistettavia kasvoja.** Myyjät ovat keksittyjä, joten kuvan pitää kertoa');
    out.push('mitä he myyvät, ei kuka he ovat. Tasokuva pöydällä toimii parhaiten.');
    out.push('');
    for (const [code, s] of sellers) {
      const row = meta.csv.find((r) => r.Myyjätunnus === code);
      out.push(`### \`seller-${s.id}.jpg\``);
      out.push('');
      out.push(`${s.name}, ${row?.Kirpputori ?? ''} pöytä ${row?.Pöytä ?? ''}. ${s.bio}`);
      out.push('');
      out.push('```');
      out.push(
        `Overhead flat lay on a warm wooden surface: ${SELLER_SCENE[s.id] ?? 'folded second-hand clothes'}, ${LOOK}, no people, no faces, square`,
      );
      out.push('```');
      out.push('');
    }
  }

  if (mascots.length) {
    out.push(`## Connector-hahmo, ${mascots.length} kpl`);
    out.push('');
    out.push('Kansio `assets/graphics/`, **SVG**, 240 x 240, läpinäkyvä tausta.');
    out.push('');
    out.push('Kaikki viisi pitää piirtää **samalla tyylillä**, muuten hahmo vaihtaa ulkonäköä');
    out.push('näkymien välillä. Generoi ne samalla istunnolla tai käytä ensimmäistä mallina.');
    out.push('');
    for (const name of mascots) {
      out.push(`### \`${name}.svg\``);
      out.push('');
      out.push(`Asento: ${MASCOT_POSE[name]}.`);
      out.push('');
      out.push('```');
      out.push(`${SHAPE_NOTE} Pose: ${MASCOT_POSE[name]}.`);
      out.push('```');
      out.push('');
    }
  }

  if (logos.length) {
    out.push(`## Logot, ${logos.length} kpl`);
    out.push('');
    out.push('Kansio `assets/logos/`, **SVG**.');
    out.push('');
    for (const name of logos) out.push(`- \`${name}.svg\``);
    out.push('');
  }

  if (photos.length) {
    out.push(`## Tuotekuvat, ${photos.length} kpl`);
    out.push('');
    out.push('Nimet tulevat tuotetaulukosta, katso [KUVALISTA.md](KUVALISTA.md).');
    out.push('');
    for (const name of photos.slice(0, 30)) out.push(`- \`${name}\``);
    if (photos.length > 30) out.push(`- ja ${photos.length - 30} muuta`);
    out.push('');
  }

  out.push('## Mitä ei kannata generoida');
  out.push('');
  out.push('**Käyttöliittymän ikonit.** Ne on piirretty koodissa (`components/ui/Icons.tsx`),');
  out.push('40 kappaletta, joista 16 on kategoriaikoneita. Ne perivät värin ympäristöstään,');
  out.push('skaalautuvat mihin kokoon tahansa ja painavat nolla kilotavua. Kuvatiedostoina ne');
  out.push('menettäisivät kaikki kolme. Jos haluat oman tyylin, anna yksi mallikuva, niin ne');
  out.push('piirretään uudelleen koodiin sen mukaan.');
  out.push('');

  await writeFile(path.join(root, 'assets/GENEROITAVAT.md'), out.join('\n'));
  console.log(`[generoitavat] kirjoitettu assets/GENEROITAVAT.md (${total} puuttuvaa kuvaa)`);
}

main().catch((error) => {
  console.error('[generoitavat] epäonnistui', error);
  process.exitCode = 1;
});
