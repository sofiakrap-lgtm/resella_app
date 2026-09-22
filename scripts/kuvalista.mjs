/**
 * Kirjoittaa assets/KUVALISTA.md datan perusteella.
 *
 *   npm run kuvalista
 *
 * Lista ei voi vanhentua, koska se luetaan suoraan /data kansiosta.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readExpected, DEMO_PATH_PRODUCTS, DEMO_PATH_MARKETS, DEMO_PATH_SELLERS } from './expected-assets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const CATEGORY_LABELS = {
  naiset: 'Naiset',
  miehet: 'Miehet',
  lapset: 'Lapset',
  koti: 'Koti ja sisustus',
  astiat: 'Astiat',
  kengat: 'Kengät',
  asusteet: 'Asusteet',
  viihde: 'Viihde',
};

function star(isDemoPath) {
  return isDemoPath ? ' *' : '';
}

async function main() {
  const expected = await readExpected();
  const [productsSrc, marketsSrc, sellersSrc] = await Promise.all([
    readFile(path.join(root, 'data/products.ts'), 'utf8'),
    readFile(path.join(root, 'data/markets.ts'), 'utf8'),
    readFile(path.join(root, 'data/sellers.ts'), 'utf8'),
  ]);

  const products = [...productsSrc.matchAll(/id: '(p-([a-z]+)-(\d+))', title: '([^']+)'/g)].map(
    ([, id, category, index, title]) => ({ id, category, image: `prod-${category}-${index}`, title }),
  );
  const markets = [...marketsSrc.matchAll(/name: '([^']+)',[\s\S]{0,400}?city: '([^']+)',[\s\S]{0,400}?coverImage: '([^']+)'/g)].map(
    ([, name, city, image]) => ({ name, city, image }),
  );
  const sellers = [...sellersSrc.matchAll(/name: '([^']+)',\s*\n\s*avatar: '([^']+)'/g)].map(
    ([, name, image]) => ({ name, image }),
  );

  const demoProducts = new Set(
    DEMO_PATH_PRODUCTS.map((id) => `prod-${id.split('-')[1]}-${id.split('-')[2]}`),
  );

  const lines = [];
  lines.push('# Kuvalista');
  lines.push('');
  lines.push('Tämä tiedosto luodaan datasta komennolla `npm run kuvalista`, joten se ei');
  lines.push('voi vanhentua. Ohjeet lataamiseen: [README.md](README.md).');
  lines.push('');
  lines.push('Tähdellä `*` merkityt ovat demon pääpolulla, eli ne näkyvät esittelyssä');
  lines.push('ensimmäisenä. Jos aika on vähissä, lataa ensin vain ne.');
  lines.push('');
  lines.push('Puuttuva kuva ei riko mitään: tilalle piirtyy brändin mukainen paikkamerkki.');
  lines.push('Tarkista tilanne milloin tahansa komennolla `npm run check-assets`.');
  lines.push('');

  lines.push(`## 1. Logot, ${expected.logos.length} tiedostoa`);
  lines.push('');
  lines.push('| Tiedosto | Mitä |');
  lines.push('|---|---|');
  lines.push('| `assets/logos/logo-wordmark.svg` * | Nimilogo, tumma, vaalealle taustalle |');
  lines.push('| `assets/logos/logo-wordmark-light.svg` * | Nimilogo, kerma, tummalle taustalle |');
  lines.push('| `assets/logos/logo-mark.svg` * | Neliömäinen logo, tumma |');
  lines.push('| `assets/logos/logo-mark-light.svg` * | Neliömäinen logo, kerma |');
  lines.push('');

  lines.push('## 2. Grafiikat, 8 tiedostoa');
  lines.push('');
  lines.push('Muodot ovat koristeita ja ne ottavat värinsä ympäristöstä (`currentColor`).');
  lines.push('');
  lines.push('| Tiedosto | Mitä | Missä näkyy |');
  lines.push('|---|---|---|');
  lines.push('| `assets/graphics/shape-star.svg` * | Tähti | Korostukset, tyhjät tilat |');
  lines.push('| `assets/graphics/shape-wave.svg` * | Aalto | Taustakoristeet |');
  lines.push('| `assets/graphics/shape-pebble.svg` * | Kivet | Taustakoristeet |');
  lines.push('| `assets/graphics/connector-mascot.svg` | Hahmo, perus | Profiili, kaupunkivalinta |');
  lines.push('| `assets/graphics/connector-wave.svg` | Hahmo vilkuttaa | Tervetulo, etusivu |');
  lines.push('| `assets/graphics/connector-search.svg` | Hahmo etsii | Haku |');
  lines.push('| `assets/graphics/connector-empty.svg` | Hahmo apea | Ei osumia |');
  lines.push('| `assets/graphics/connector-celebrate.svg` | Hahmo juhlii | Varaus valmis |');
  lines.push('');

  lines.push(`## 3. Kirpputorikuvat, ${markets.length} tiedostoa`);
  lines.push('');
  lines.push('Vaakakuva, suositus 1600 x 900 px, `.jpg`.');
  lines.push('');
  lines.push('| Tiedosto | Kirpputori | Kaupunki |');
  lines.push('|---|---|---|');
  for (const market of markets) {
    lines.push(
      `| \`assets/demo/${market.image}.jpg\`${star(DEMO_PATH_MARKETS.includes(market.image))} | ${market.name} | ${market.city} |`,
    );
  }
  lines.push('');

  lines.push(`## 4. Myyjäkuvat, ${sellers.length} tiedostoa`);
  lines.push('');
  lines.push('Neliö, suositus 600 x 600 px, `.jpg`. Ei tunnistettavia kasvoja: kädet, kaappi,');
  lines.push('vaaterekki tai muu tunnelmakuva riittää, koska myyjät ovat keksittyjä.');
  lines.push('');
  lines.push('| Tiedosto | Myyjä |');
  lines.push('|---|---|');
  for (const seller of sellers) {
    lines.push(
      `| \`assets/demo/${seller.image}.jpg\`${star(DEMO_PATH_SELLERS.includes(seller.image))} | ${seller.name} |`,
    );
  }
  lines.push('');

  lines.push(`## 5. Tuotekuvat, ${products.length} pääkuvaa`);
  lines.push('');
  lines.push('Pystykuva, suositus 1200 x 1600 px, `.jpg`. Jokaiselle tuotteelle voi lisätä');
  lines.push('kaksi lisäkuvaa samalla nimellä ja päätteellä `-2` ja `-3`, esimerkiksi');
  lines.push('`prod-naiset-001-2.jpg`. Lisäkuvat ovat vapaaehtoisia.');
  lines.push('');
  for (const [slug, label] of Object.entries(CATEGORY_LABELS)) {
    const group = products.filter((product) => product.category === slug);
    if (!group.length) continue;
    lines.push(`### ${label}, ${group.length} kpl`);
    lines.push('');
    lines.push('| Tiedosto | Tuote |');
    lines.push('|---|---|');
    for (const product of group) {
      lines.push(
        `| \`assets/product-photos/${product.image}.jpg\`${star(demoProducts.has(product.image))} | ${product.title} |`,
      );
    }
    lines.push('');
  }

  const total =
    expected.logos.length + expected.graphics.length + markets.length + sellers.length + products.length;
  lines.push('## Yhteenveto');
  lines.push('');
  lines.push(
    `- Kaikkiaan ${total} kuvaa: ${expected.logos.length} logoa, ${expected.graphics.length} grafiikkaa, ` +
      `${markets.length} kirpputorikuvaa, ${sellers.length} myyjäkuvaa ja ${products.length} tuotekuvaa.`,
  );
  lines.push(`- Demon pääpolku (tähdellä merkityt): ${
    expected.logos.length + 3 + DEMO_PATH_MARKETS.length + DEMO_PATH_SELLERS.length + demoProducts.size
  } kuvaa.`);
  lines.push('- Lisäkuvia voi halutessaan lisätä 2 kpl per tuote, eli enintään ' + products.length * 2 + ' kpl.');
  lines.push('');

  await writeFile(path.join(root, 'assets/KUVALISTA.md'), lines.join('\n'));
  console.log(`[kuvalista] kirjoitettu assets/KUVALISTA.md (${total} kuvaa)`);
}

main().catch((error) => {
  console.error('[kuvalista] epäonnistui', error);
  process.exitCode = 1;
});
