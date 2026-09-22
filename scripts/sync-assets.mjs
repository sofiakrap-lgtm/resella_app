/**
 * Copies /assets (Sofia's drop folder) into /public/assets so Next.js can serve
 * the files statically. Runs automatically before `npm run dev` and `npm run build`.
 * Missing files are fine: <SafeImage> falls back to a branded placeholder.
 */
import { cp, mkdir, rm, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'assets');
const target = path.join(root, 'public', 'assets');

async function main() {
  if (!existsSync(source)) {
    console.log('[sync-assets] no /assets folder, nothing to copy');
    return;
  }
  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });
  await cp(source, target, { recursive: true });
  const folders = await readdir(target, { withFileTypes: true });
  const counts = [];
  for (const folder of folders) {
    if (!folder.isDirectory()) continue;
    const files = await readdir(path.join(target, folder.name));
    counts.push(`${folder.name}: ${files.filter((f) => !f.startsWith('.')).length}`);
  }
  console.log(`[sync-assets] copied /assets -> /public/assets (${counts.join(', ')})`);
}

main().catch((error) => {
  console.error('[sync-assets] failed', error);
  process.exitCode = 1;
});
