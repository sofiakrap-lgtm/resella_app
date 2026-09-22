/**
 * Copies /assets (Sofia's drop folder) into /public/assets so Next.js can serve
 * the files statically, and writes data/assetManifest.json listing which file
 * extension each image actually has.
 *
 * The manifest is why the file extension does not have to be .jpg: drop a .png
 * or a .webp and the app finds it. Formats browsers cannot display (.heic from
 * an iPhone, .tif) are left out of the manifest and reported, so they fall back
 * to a placeholder instead of rendering as a broken image.
 *
 * Runs automatically before `npm run dev` and `npm run build`.
 */
import { cp, mkdir, rm, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'assets');
const target = path.join(root, 'public', 'assets');
const manifestPath = path.join(root, 'data', 'assetManifest.json');

/** Formats every browser can render. */
const WEB_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg'];

/** Preferred when the same name exists twice, for example .jpg and .png. */
function betterOf(a, b) {
  return WEB_FORMATS.indexOf(a) <= WEB_FORMATS.indexOf(b) ? a : b;
}

async function main() {
  if (!existsSync(source)) {
    await writeFile(manifestPath, '{}\n');
    console.log('[sync-assets] no /assets folder, nothing to copy');
    return;
  }

  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });
  await cp(source, target, { recursive: true });

  const manifest = {};
  const unusable = [];
  const counts = [];

  const folders = await readdir(target, { withFileTypes: true });
  for (const folder of folders) {
    if (!folder.isDirectory()) continue;
    const files = (await readdir(path.join(target, folder.name))).filter(
      (name) => !name.startsWith('.'),
    );
    for (const file of files) {
      const ext = path.extname(file).slice(1).toLowerCase();
      const base = file.slice(0, file.length - path.extname(file).length);
      const key = `${folder.name}/${base}`;
      if (!WEB_FORMATS.includes(ext)) {
        if (ext) unusable.push(`${folder.name}/${file}`);
        continue;
      }
      manifest[key] = manifest[key] ? betterOf(manifest[key], ext) : ext;
    }
    counts.push(`${folder.name}: ${files.length}`);
  }

  const ordered = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(manifestPath, `${JSON.stringify(ordered, null, 2)}\n`);

  console.log(`[sync-assets] copied /assets -> /public/assets (${counts.join(', ')})`);

  if (unusable.length) {
    console.log('');
    console.log('[sync-assets] Selain ei osaa näyttää näitä, muunna ne .jpg-muotoon:');
    for (const file of unusable.slice(0, 20)) console.log(`  assets/${file}`);
    if (unusable.length > 20) console.log(`  ja ${unusable.length - 20} muuta`);
    console.log('  Mac: valitse kuvat Finderissa, oikea klikkaus, Pika-apu, Muunna kuva, JPEG.');
  }
}

main().catch((error) => {
  console.error('[sync-assets] failed', error);
  process.exitCode = 1;
});
