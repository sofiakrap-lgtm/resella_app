/**
 * Tarkistaa /assets kansion sisällön mock-dataa vasten.
 *
 *   npm run check-assets
 *
 * Kertoo mitkä kuvat löytyvät, mitkä puuttuvat ja mitkä tiedostonimet eivät
 * vastaa mitään, eli ovat todennäköisesti kirjoitusvirheitä.
 */
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'assets');

const DEMO_PATH_PRODUCTS = [
  'p-001', 'p-002', 'p-007', 'p-011', 'p-012', 'p-010', 'p-020', 'p-021',
  'p-030', 'p-032', 'p-034', 'p-050', 'p-051', 'p-056', 'p-062',
];

const green = (s) => `\u001b[32m${s}\u001b[0m`;
const red = (s) => `\u001b[31m${s}\u001b[0m`;
const yellow = (s) => `\u001b[33m${s}\u001b[0m`;
const dim = (s) => `\u001b[2m${s}\u001b[0m`;

async function listFiles(folder) {
  const dir = path.join(assets, folder);
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir);
  return entries.filter((name) => !name.startsWith('.'));
}

function baseName(file) {
  return file.replace(/\.(jpg|jpeg|png|webp|svg)$/i, '');
}

async function main() {
  const source = await readFile(path.join(root, 'lib/mockData.ts'), 'utf8');

  const productIds = [...source.matchAll(/product\(\{\s*\n\s*id: '([^']+)'/g)].map((m) => m[1]);
  const marketPhotos = [...source.matchAll(/photo: '(market-[^']+)'/g)].map((m) => m[1]);

  const expected = {
    logos: ['resello-logo', 'resello-wordmark', 'resello-icon'],
    graphics: [
      'connector-mascot',
      'connector-wave',
      'connector-search',
      'connector-empty',
      'connector-celebrate',
    ],
    'product-photos': productIds.flatMap((id) => [id, `${id}-2`, `${id}-3`]),
    demo: [...marketPhotos, 'demo-style-1', 'demo-style-2', 'demo-style-3'],
  };

  const demoPath = new Set([
    ...expected.graphics,
    ...marketPhotos,
    ...DEMO_PATH_PRODUCTS,
  ]);

  let found = 0;
  let demoFound = 0;
  const unknown = [];
  const missingDemo = [];

  console.log('\nReSello, kuvien tarkistus\n');

  for (const [folder, names] of Object.entries(expected)) {
    const files = await listFiles(folder);
    const present = new Set(files.map(baseName));
    const hits = names.filter((name) => present.has(name));
    found += hits.length;

    for (const file of files) {
      if (!names.includes(baseName(file))) unknown.push(`${folder}/${file}`);
    }
    for (const name of names) {
      if (demoPath.has(name)) {
        if (present.has(name)) demoFound += 1;
        else missingDemo.push(`assets/${folder}/${name}`);
      }
    }

    const label = `assets/${folder}`.padEnd(24);
    const line = `${hits.length} / ${names.length}`;
    console.log(`  ${hits.length === names.length ? green('OK  ') : dim('    ')} ${label} ${line}`);
  }

  console.log('');
  console.log(`  Demon pääpolku: ${demoFound === demoPath.size ? green(`${demoFound} / ${demoPath.size}`) : yellow(`${demoFound} / ${demoPath.size}`)}`);

  if (missingDemo.length) {
    console.log(`\n  ${yellow('Pääpolulta puuttuu:')}`);
    for (const name of missingDemo.slice(0, 40)) console.log(`    ${name}`);
    if (missingDemo.length > 40) console.log(`    ja ${missingDemo.length - 40} muuta`);
  }

  if (unknown.length) {
    console.log(`\n  ${red('Näitä nimiä ei tunnisteta, tarkista kirjoitusasu:')}`);
    for (const name of unknown) console.log(`    assets/${name}`);
    console.log(dim('\n    Oikeat nimet: assets/KUVALISTA.md'));
  }

  if (!missingDemo.length && !unknown.length) {
    console.log(`\n  ${green('Kaikki pääpolun kuvat paikallaan, ei tuntemattomia nimiä.')}`);
  }

  console.log(`\n  Yhteensä ${found} kuvaa lisätty. Puuttuvien tilalla näkyy paikkamerkki.\n`);
}

main().catch((error) => {
  console.error('[check-assets] epäonnistui', error);
  process.exitCode = 1;
});
