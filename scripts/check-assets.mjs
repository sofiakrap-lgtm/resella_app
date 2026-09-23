/**
 * Tarkistaa /assets kansion sisällön dataa vasten.
 *
 *   npm run check-assets
 *
 * Kertoo mitkä kuvat löytyvät, mitkä puuttuvat ja mitkä tiedostonimet eivät
 * vastaa mitään, eli ovat todennäköisesti kirjoitusvirheitä.
 */
import { readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readExpected, demoPathNames } from './expected-assets.mjs';
import { assetKey } from './sync-assets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'assets');

const green = (s) => `\u001b[32m${s}\u001b[0m`;
const red = (s) => `\u001b[31m${s}\u001b[0m`;
const yellow = (s) => `\u001b[33m${s}\u001b[0m`;
const dim = (s) => `\u001b[2m${s}\u001b[0m`;

async function listFiles(folder) {
  const dir = path.join(assets, folder);
  if (!existsSync(dir)) return [];
  return (await readdir(dir)).filter((name) => !name.startsWith('.'));
}

const WEB_FORMATS = /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i;

/**
 * Matching ignores spaces, underscores and punctuation, the same way
 * sync-assets does, so a photo saved as "Arc'teryx Beta LT.png" counts for
 * the sheet's "Arc_teryx_Beta_LT.png" without either being renamed.
 */
function baseName(file) {
  return assetKey(file);
}

/** Levenshtein distance, used to spot a typo close to a real name. */
function distance(a, b) {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j += 1) rows[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return rows[a.length][b.length];
}

/** The expected name closest to a file that matched nothing, if it is close. */
function closest(name, candidates) {
  let best = null;
  let bestScore = Infinity;
  for (const candidate of candidates) {
    const score = distance(name, candidate);
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  return bestScore <= Math.max(3, Math.round(name.length * 0.3)) ? best : null;
}

async function main() {
  const { meta, ...expected } = await readExpected();
  const demoPath = demoPathNames({ ...expected, meta });

  let found = 0;
  let demoFound = 0;
  const unknown = [];
  const missingDemo = [];
  const wrongFormat = [];

  console.log('\nReSello, kuvien tarkistus\n');

  for (const [folder, names] of Object.entries(expected)) {
    const files = await listFiles(folder);
    // Only web formats count as present: a .heic cannot be shown, so treating
    // it as present would hide it from the missing list.
    const present = new Set(files.filter((file) => WEB_FORMATS.test(file)).map(baseName));
    const hits = names.filter((name) => present.has(assetKey(name)));
    found += hits.length;

    for (const file of files) {
      if (!WEB_FORMATS.test(file)) {
        wrongFormat.push(`${folder}/${file}`);
        continue;
      }
      if (names.some((name) => assetKey(name) === baseName(file))) continue;
      const suggestion = closest(baseName(file), names.map(assetKey));
      unknown.push(
        suggestion ? `${folder}/${file}  ->  tarkoititko ${suggestion}?` : `${folder}/${file}`,
      );
    }
    for (const name of names) {
      if (!demoPath.has(name)) continue;
      if (present.has(assetKey(name))) demoFound += 1;
      else missingDemo.push(`assets/${folder}/${name}`);
    }

    const label = `assets/${folder}`.padEnd(24);
    console.log(
      `  ${hits.length === names.length ? green('OK  ') : dim('    ')} ${label} ${hits.length} / ${names.length}`,
    );
  }

  console.log('');
  const demoLine = `${demoFound} / ${demoPath.size}`;
  console.log(
    `  Demon pääpolku: ${demoFound === demoPath.size ? green(demoLine) : yellow(demoLine)}`,
  );

  if (missingDemo.length) {
    console.log(`\n  ${yellow('Pääpolulta puuttuu:')}`);
    for (const name of missingDemo.slice(0, 40)) console.log(`    ${name}`);
    if (missingDemo.length > 40) console.log(`    ja ${missingDemo.length - 40} muuta`);
  }

  if (wrongFormat.length) {
    console.log(`\n  ${red('Selain ei osaa näyttää näitä, muunna .jpg-muotoon:')}`);
    for (const name of wrongFormat) console.log(`    assets/${name}`);
    console.log(
      dim('\n    Mac: valitse kuvat Finderissa, oikea klikkaus, Pika-apu, Muunna kuva, JPEG.'),
    );
    console.log(dim('    Windows: avaa Kuvat, Tallenna nimellä, JPG.'));
  }

  if (unknown.length) {
    console.log(`\n  ${red('Näitä nimiä ei tunnisteta, tarkista kirjoitusasu:')}`);
    for (const name of unknown) console.log(`    assets/${name}`);
    console.log(dim('\n    Oikeat nimet: assets/KUVALISTA.md'));
  }

  if (!missingDemo.length && !unknown.length && !wrongFormat.length) {
    console.log(`\n  ${green('Kaikki pääpolun kuvat paikallaan, ei tuntemattomia nimiä.')}`);
  }

  console.log(`\n  Yhteensä ${found} kuvaa lisätty. Puuttuvien tilalla näkyy paikkamerkki.\n`);
}

main().catch((error) => {
  console.error('[check-assets] epäonnistui', error);
  process.exitCode = 1;
});
