/**
 * Kirjoittaa assets/KUVALISTA.md tuotetaulukon perusteella.
 *
 *   npm run kuvalista
 *
 * Lista ei voi vanhentua, koska se luetaan samasta CSV:stä kuin data.
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readExpected, demoPathNames } from './expected-assets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const star = (on) => (on ? ' *' : '');

async function main() {
  const expected = await readExpected();
  const { meta } = expected;
  const demo = demoPathNames(expected);

  const lines = [];
  lines.push('# Kuvalista');
  lines.push('');
  lines.push('Tämä tiedosto luodaan tuotetaulukosta komennolla `npm run kuvalista`,');
  lines.push('joten se ei voi vanhentua. Ohjeet lataamiseen: [README.md](README.md).');
  lines.push('');
  lines.push('Tähdellä `*` merkityt ovat demon pääpolulla. Jos aika on vähissä,');
  lines.push('lataa ensin vain ne.');
  lines.push('');
  lines.push('Puuttuva kuva ei riko mitään: tilalle piirtyy brändin mukainen paikkamerkki.');
  lines.push('Tarkista tilanne komennolla `npm run check-assets`, tai lue raportti');
  lines.push('GitHubin Actions-sivulta pushin jälkeen.');
  lines.push('');

  lines.push(`## 1. Logot, ${expected.logos.length} tiedostoa`);
  lines.push('');
  lines.push('| Tiedosto | Mitä |');
  lines.push('|---|---|');
  lines.push('| `assets/logos/logo-wordmark.svg` * | Nimilogo, tumma |');
  lines.push('| `assets/logos/logo-wordmark-light.svg` * | Nimilogo, kerma |');
  lines.push('| `assets/logos/logo-mark.svg` * | Neliölogo, tumma |');
  lines.push('| `assets/logos/logo-mark-light.svg` * | Neliölogo, kerma |');
  lines.push('');

  lines.push(`## 2. Grafiikat, ${expected.graphics.length} tiedostoa`);
  lines.push('');
  lines.push('Muodot ovat koristeita ja ottavat värinsä ympäristöstä.');
  lines.push('');
  lines.push('| Tiedosto | Mitä |');
  lines.push('|---|---|');
  lines.push('| `assets/graphics/shape-star.svg` * | Tähti |');
  lines.push('| `assets/graphics/shape-wave.svg` * | Aalto |');
  lines.push('| `assets/graphics/shape-pebble.svg` * | Kivet |');
  lines.push('| `assets/graphics/connector-mascot.svg` | Hahmo, perus |');
  lines.push('| `assets/graphics/connector-wave.svg` | Hahmo vilkuttaa |');
  lines.push('| `assets/graphics/connector-search.svg` | Hahmo etsii |');
  lines.push('| `assets/graphics/connector-empty.svg` | Hahmo apea |');
  lines.push('| `assets/graphics/connector-celebrate.svg` | Hahmo juhlii |');
  lines.push('');

  const markets = Object.entries(meta.places.markets);
  lines.push(`## 3. Kirpputorikuvat, ${markets.length} tiedostoa`);
  lines.push('');
  lines.push('Vaakakuva, suositus 1600 x 900 px.');
  lines.push('');
  lines.push('| Tiedosto | Kirpputori | Kaupunki |');
  lines.push('|---|---|---|');
  for (const [name, m] of markets) {
    const city = meta.csv.find((r) => r.Kirpputori === name)?.Kaupunki ?? '';
    lines.push(`| \`assets/demo/market-${m.id}.jpg\`${star(demo.has(`market-${m.id}`))} | ${name} | ${city} |`);
  }
  lines.push('');

  const sellers = Object.entries(meta.places.sellers);
  lines.push(`## 4. Myyjäkuvat, ${sellers.length} tiedostoa`);
  lines.push('');
  lines.push('Neliö, suositus 600 x 600 px. Ei tunnistettavia kasvoja: kädet, pöytä tai');
  lines.push('vaaterekki riittää, koska myyjät ovat keksittyjä.');
  lines.push('');
  lines.push('| Tiedosto | Myyjä | Kirpputori |');
  lines.push('|---|---|---|');
  for (const [code, s] of sellers) {
    const row = meta.csv.find((r) => r.Myyjätunnus === code);
    lines.push(
      `| \`assets/demo/seller-${s.id}.jpg\`${star(demo.has(`seller-${s.id}`))} | ${s.name} | ${row?.Kirpputori ?? ''}, pöytä ${row?.Pöytä ?? ''} |`,
    );
  }
  lines.push('');

  lines.push(`## 5. Tuotekuvat, ${meta.csv.length} tiedostoa`);
  lines.push('');
  lines.push('Nimet tulevat suoraan tuotetaulukosta, älä nimeä niitä uudelleen.');
  lines.push('Kaikki menevät kansioon `assets/product-photos`.');
  lines.push('');

  const byCategory = new Map();
  for (const row of meta.csv) {
    if (!byCategory.has(row.Kategoria)) byCategory.set(row.Kategoria, []);
    byCategory.get(row.Kategoria).push(row);
  }
  for (const [category, rows] of [...byCategory].sort((a, b) => b[1].length - a[1].length)) {
    lines.push(`### ${category}, ${rows.length} kpl`);
    lines.push('');
    lines.push('| Tiedosto | Tuote |');
    lines.push('|---|---|');
    for (const row of rows) {
      const base = row.Kuvatiedosto.replace(/\.[^.]+$/, '');
      lines.push(`| \`${row.Kuvatiedosto}\`${star(demo.has(base))} | ${row.Otsikko} |`);
    }
    lines.push('');
  }

  const total =
    expected.logos.length + expected.graphics.length + markets.length + sellers.length + meta.csv.length;
  lines.push('## Yhteenveto');
  lines.push('');
  lines.push(
    `- Kaikkiaan ${total} kuvaa: ${expected.logos.length} logoa, ${expected.graphics.length} grafiikkaa, ` +
      `${markets.length} kirpputorikuvaa, ${sellers.length} myyjäkuvaa ja ${meta.csv.length} tuotekuvaa.`,
  );
  lines.push(`- Demon pääpolku (tähdellä merkityt): ${demo.size} kuvaa.`);
  lines.push('');

  await writeFile(path.join(root, 'assets/KUVALISTA.md'), lines.join('\n'));
  console.log(`[kuvalista] kirjoitettu assets/KUVALISTA.md (${total} kuvaa)`);
}

main().catch((error) => {
  console.error('[kuvalista] epäonnistui', error);
  process.exitCode = 1;
});
