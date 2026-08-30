#!/usr/bin/env node
/**
 * Одноразовая установка headless Chromium для песочницы Arena.
 * Не кладёт браузер в git: каталог по умолчанию /home/user/ui_shot.
 *
 * Проверено 2026-08-30: apt/playwright CDN заблокированы,
 * registry.npmjs.org работает → @sparticuz/chromium.
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, copyFileSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { qaConfig } from './lib/env.mjs';

const { browserDir } = qaConfig();
const zlib = await import('node:zlib');
const fs = await import('node:fs');

function sh(cmd, cwd = browserDir) {
  console.log('$', cmd);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

mkdirSync(browserDir, { recursive: true });
if (!existsSync(join(browserDir, 'package.json'))) {
  writeFileSync(
    join(browserDir, 'package.json'),
    JSON.stringify({ name: 'aethelia-qa-browser', private: true }, null, 2),
  );
}

// puppeteer-core@23 = Chrome 131. Не ставить latest @sparticuz (149+) —
// CJS require ломается, протокол не совпадает.
sh('npm i puppeteer-core@23.11.1 @sparticuz/chromium@131.0.1');

const require = createRequire(join(browserDir, 'package.json'));
const chromiumRoot = join(browserDir, 'node_modules', '@sparticuz', 'chromium');
const bin = join(chromiumRoot, 'bin');
if (!existsSync(bin)) {
  throw new Error(`нет ${bin} — npm i @sparticuz/chromium не удался`);
}

for (const f of ['al2023.tar', 'fonts.tar']) {
  const src = join(bin, `${f}.br`);
  const dest = join('/tmp', f);
  writeFileSync(dest, zlib.brotliDecompressSync(fs.readFileSync(src)));
  console.log('unpacked', f);
}

mkdirSync('/tmp/al2023', { recursive: true });
mkdirSync('/tmp/fonts', { recursive: true });
sh('tar -xf /tmp/al2023.tar -C /tmp/al2023', '/tmp');
sh('tar -xf /tmp/fonts.tar -C /tmp/fonts', '/tmp');

const dejavuDir = '/usr/share/fonts/truetype/dejavu';
const fontDest = existsSync('/tmp/fonts/fonts') ? '/tmp/fonts/fonts' : '/tmp/fonts';
mkdirSync(fontDest, { recursive: true });
if (existsSync(dejavuDir)) {
  for (const file of readdirSync(dejavuDir)) {
    if (file.endsWith('.ttf')) copyFileSync(join(dejavuDir, file), join(fontDest, file));
  }
  console.log('DejaVu →', fontDest, '(кириллица)');
} else {
  console.warn('DejaVu не найден — русский текст на скринах может стать тофу.');
}

if (!existsSync('/tmp/al2023/lib/libnss3.so')) {
  throw new Error('после распаковки нет libnss3.so');
}

const chromiumMod = require('@sparticuz/chromium');
const chromium = chromiumMod.default ?? chromiumMod;
process.env.LD_LIBRARY_PATH = ['/tmp/al2023/lib', process.env.LD_LIBRARY_PATH].filter(Boolean).join(':');
process.env.FONTCONFIG_PATH = '/tmp/fonts';
if (typeof chromium.executablePath !== 'function') {
  throw new Error('неожиданный API @sparticuz/chromium — нужен 131.x');
}
if (existsSync('/tmp/chromium')) unlinkSync('/tmp/chromium');
const exe = await chromium.executablePath();
console.log('chromium executable:', exe);
console.log('\nГотово. Дальше:');
console.log('  node scripts/qa/road.mjs');
console.log('  node scripts/qa/auth.mjs login');
