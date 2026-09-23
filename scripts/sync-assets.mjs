/**
 * Copies /assets into /public/assets so Next.js can serve the files, and
 * writes data/assetManifest.json: a map from the name the data asks for to
 * the file that is actually on disk.
 *
 * The two are not always the same. The product sheet lists
 * `Arc_teryx_Beta_LT.png`, while the photo is saved as `Arc'teryx Beta LT.png`.
 * Matching on letters and digits alone bridges that, so neither the sheet nor
 * the photos have to be renamed, and a `.png` swapped for a `.jpg` still
 * resolves. Formats browsers cannot display (.heic from an iPhone, .tif) are
 * left out and reported, so they fall back to a placeholder rather than
 * rendering broken.
 *
 * Photographs are re-encoded on the way through: the originals in /assets are
 * multi megabyte PNGs, which would make the demo painful on a phone. The copy
 * served to the browser is a JPEG no wider than 1400px, which is several times
 * the largest size any screen shows it at. The originals are never touched.
 *
 * Runs automatically before `npm run dev` and `npm run build`.
 */
import { cp, mkdir, rm, readdir, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { readExpected } from './expected-assets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'assets');
const target = path.join(root, 'public', 'assets');
const manifestPath = path.join(root, 'data', 'assetManifest.json');

/** Formats every browser can render, best first when a name exists twice. */
const WEB_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg'];

/**
 * Key used to match a wanted name against a file on disk: letters and digits
 * only, so spaces, underscores, apostrophes and ampersands all fall away.
 */
export function assetKey(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .normalize('NFC')
    .replace(/[^0-9A-Za-zÀ-ÿ]+/g, '')
    .toLowerCase();
}

async function main() {
  const expected = await readExpected();
  const wanted = {
    logos: expected.logos,
    graphics: expected.graphics,
    'product-photos': expected['product-photos'],
    demo: expected.demo,
  };

  if (!existsSync(source)) {
    await writeFile(manifestPath, '{}\n');
    console.log('[sync-assets] no /assets folder, nothing to copy');
    return;
  }

  await mkdir(target, { recursive: true });
  // Vector and small files are copied as they are; photographs are compressed.
  await copyTree(source, target);

  await encodePending();

  const manifest = {};
  const unusable = [];
  const unknown = [];
  const counts = [];

  for (const [folder, names] of Object.entries(wanted)) {
    const dir = path.join(target, folder);
    const files = existsSync(dir)
      ? (await readdir(dir)).filter((name) => !name.startsWith('.'))
      : [];

    /** Every usable file in this folder, indexed by its match key. */
    const onDisk = new Map();
    for (const file of files) {
      const ext = path.extname(file).slice(1).toLowerCase();
      if (!WEB_FORMATS.includes(ext)) {
        if (ext) unusable.push(`${folder}/${file}`);
        continue;
      }
      const key = assetKey(file);
      const current = onDisk.get(key);
      if (!current || WEB_FORMATS.indexOf(ext) < WEB_FORMATS.indexOf(path.extname(current).slice(1).toLowerCase())) {
        onDisk.set(key, file);
      }
    }

    const folderMap = {};
    for (const name of names) {
      const file = onDisk.get(assetKey(name));
      if (file) folderMap[name] = file;
    }
    if (Object.keys(folderMap).length) manifest[folder] = folderMap;

    const matched = new Set(Object.values(folderMap));
    for (const file of files) {
      const ext = path.extname(file).slice(1).toLowerCase();
      if (WEB_FORMATS.includes(ext) && !matched.has(file)) unknown.push(`${folder}/${file}`);
    }

    counts.push(`${folder}: ${Object.keys(folderMap).length}/${names.length}`);
  }

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`[sync-assets] copied /assets -> /public/assets (${counts.join(', ')})`);
  if (compressed) {
    const before = await treeSize(source);
    const after = await treeSize(target);
    console.log(
      `[sync-assets] pakattu ${compressed} valokuvaa, kopioitu ${copied} muuta: ` +
        `${Math.round(before / 1e6)} MB -> ${Math.round(after / 1e6)} MB`,
    );
  }

  if (unusable.length) {
    console.log('');
    console.log('[sync-assets] Selain ei osaa näyttää näitä, muunna ne .jpg-muotoon:');
    for (const file of unusable.slice(0, 20)) console.log(`  assets/${file}`);
    if (unusable.length > 20) console.log(`  ja ${unusable.length - 20} muuta`);
    console.log('  Mac: valitse kuvat Finderissa, oikea klikkaus, Pika-apu, Muunna kuva, JPEG.');
  }

  if (unknown.length) {
    console.log('');
    console.log('[sync-assets] Näitä tiedostoja ei käytetä, ne eivät vastaa mitään riviä:');
    for (const file of unknown.slice(0, 20)) console.log(`  assets/${file}`);
    if (unknown.length > 20) console.log(`  ja ${unknown.length - 20} muuta`);
  }
}

/** Longest edge of a served photo. The app never shows one wider than ~350px. */
const MAX_EDGE = 1400;
const PHOTO_FOLDERS = new Set(['product-photos', 'demo']);

/** How many photos to encode at once. */
const CONCURRENCY = 8;

let compressed = 0;
let copied = 0;

/** Total bytes under a directory, used to report what the pass saved. */
async function treeSize(dir) {
  if (!existsSync(dir)) return 0;
  let total = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    total += entry.isDirectory() ? await treeSize(full) : (await stat(full)).size;
  }
  return total;
}

async function copyTree(from, to) {
  const entries = await readdir(from, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) {
      await mkdir(dest, { recursive: true });
      await copyTree(src, dest);
      continue;
    }
    const folder = path.basename(from);
    const ext = path.extname(entry.name).slice(1).toLowerCase();
    const isPhoto = PHOTO_FOLDERS.has(folder) && ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
    if (!isPhoto) {
      await cp(src, dest);
      copied += 1;
      continue;
    }
    pending.push({ src, dest, name: entry.name });
  }
}

const pending = [];

/** Encodes the queued photographs, a few at a time. */
async function encodePending() {
  const queue = [...pending];
  pending.length = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    for (;;) {
      const job = queue.shift();
      if (!job) return;
      // Same base name, always .jpg: the manifest matches on letters and
      // digits, so the changed extension costs nothing.
      const out = path.join(path.dirname(job.dest), `${job.name.replace(/\.[^.]+$/, '')}.jpg`);
      try {
        await sharp(job.src)
          .rotate()
          .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 82, mozjpeg: true })
          .toFile(out);
        compressed += 1;
      } catch {
        // Anything sharp cannot read is copied untouched rather than lost.
        await cp(job.src, job.dest);
        copied += 1;
      }
    }
  });
  await Promise.all(workers);
}

main().catch((error) => {
  console.error('[sync-assets] failed', error);
  process.exitCode = 1;
});