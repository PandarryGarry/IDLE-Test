#!/usr/bin/env node
/** Разовый скретч: контактный лист 2×2 из концептов. Не коммитится. */
import { launchBrowser, sleep } from '../../scripts/qa/lib/chromium.mjs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const browser = await launchBrowser({ viewport: { width: 1020, height: 1600, deviceScaleFactor: 1 } });
const page = await browser.newPage();
await page.goto('file://' + join(here, 'concepts-sheet.html'), { waitUntil: 'networkidle0', timeout: 60000 });
await page.evaluate(async () => {
  await Promise.all([...document.images].map(img => img.complete ? null : img.decode().catch(() => {})));
});
await sleep(500);
const root = await page.$('body');
await root.screenshot({ path: join(here, 'concepts-sheet.png'), type: 'png' });
console.log('shot concepts-sheet');
await browser.close();
