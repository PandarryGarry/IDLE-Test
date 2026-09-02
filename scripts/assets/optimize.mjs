#!/usr/bin/env node
/**
 * Конвейер картинок Aethelia.
 *
 * Мастер: PNG (или большой WebP) в public/assets.
 * Рантайм: рядом лежащий .webp нужного размера. UI берёт его через iconUrl().
 *
 *   node scripts/assets/optimize.mjs           # только устаревшие/новые
 *   node scripts/assets/optimize.mjs --force   # пересобрать всё
 *
 * Новую иконку кладёшь PNG 1024 в icons/… и снова запускаешь скрипт.
 * В код — только iconUrl('weapons/bow/t07'), никогда сырой .png.
 */
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');
const assetsRoot = join(repoRoot, 'artifacts/my-app/public/assets');
const force = process.argv.includes('--force');
const concurrency = 4;

function presetFor(relPosix) {
  if (relPosix.includes('/characters/avatars/')) {
    return { size: 384, quality: 82, kind: 'portrait' };
  }
  // Манекены рисуются в окне «Экип» крупно: на 256 бижутерия не читается.
  if (relPosix.includes('/characters/paper_dolls/')) {
    return { size: 384, quality: 84, kind: 'doll' };
  }
  if (relPosix.startsWith('art/')) {
    return { size: 1920, quality: 80, kind: 'art' };
  }
  if (relPosix.startsWith('icons/')) {
    return { size: 256, quality: 80, kind: 'icon' };
  }
  return { size: 256, quality: 80, kind: 'icon' };
}

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

function convertOne(src, dest, { size, quality }) {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      'convert',
      [src, '-resize', `${size}x${size}>`, '-quality', String(quality), dest],
      { stdio: 'ignore' },
    );
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`convert exit ${code}: ${src}`));
    });
  });
}

function pool(items, limit, worker) {
  let i = 0;
  let active = 0;
  return new Promise((resolve, reject) => {
    const next = () => {
      if (i >= items.length && active === 0) return resolve();
      while (active < limit && i < items.length) {
        const item = items[i++];
        active += 1;
        worker(item)
          .then(() => {
            active -= 1;
            next();
          })
          .catch(reject);
      }
    };
    next();
  });
}

const sources = walk(assetsRoot).filter((file) => {
  const ext = extname(file).toLowerCase();
  if (ext === '.png') return true;
  if (ext === '.jpg' || ext === '.jpeg') return true;
  return false;
});

const jobs = [];
let skipped = 0;
for (const src of sources) {
  const rel = relative(assetsRoot, src).split('\\').join('/');
  const dest = src.replace(/\.(png|jpe?g)$/i, '.webp');
  const preset = presetFor(rel);
  if (!force && existsSync(dest)) {
    const a = statSync(src).mtimeMs;
    const b = statSync(dest).mtimeMs;
    if (b >= a) {
      skipped += 1;
      continue;
    }
  }
  jobs.push({ src, dest, preset, rel });
}

console.log(
  `optimize: ${sources.length} мастеров, ${jobs.length} к сборке, ${skipped} свежих, ×${concurrency}`,
);

const t0 = Date.now();
let done = 0;
await pool(jobs, concurrency, async (job) => {
  await convertOne(job.src, job.dest, job.preset);
  done += 1;
  if (done % 50 === 0 || done === jobs.length) {
    console.log(`  ${done}/${jobs.length}  ${job.preset.kind}  ${job.rel}`);
  }
});

console.log(`готово за ${((Date.now() - t0) / 1000).toFixed(1)}с`);
