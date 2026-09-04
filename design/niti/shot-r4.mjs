#!/usr/bin/env node
/** Разовый скретч: снимки 4 вариантов раунда 4 (20 нитей). Не коммитится. */
import { launchBrowser, sleep } from '../../scripts/qa/lib/chromium.mjs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const browser = await launchBrowser({ viewport: { width: 430, height: 1500, deviceScaleFactor: 2 } });
const page = await browser.newPage();
await page.goto('file://' + join(here, 'mockups-r4.html'), { waitUntil: 'networkidle0', timeout: 60000 });
await page.evaluate(async () => {
  await Promise.all([...document.images].map(img => img.complete ? null : img.decode().catch(() => {})));
});
await sleep(600);
for (const letter of ['R4-A', 'R4-B', 'R4-C', 'R4-D']) {
  const el = await page.$(`#variant-${letter}`);
  if (!el) throw new Error('нет #variant-' + letter);
  await el.screenshot({ path: join(here, `r4-${letter}.png`), type: 'png' });
  console.log('shot', letter);
}
await page.setViewport({ width: 1800, height: 2600, deviceScaleFactor: 1 });
await page.evaluate(() => document.body.classList.add('grid4'));
await sleep(400);
const root = await page.$('#root');
await root.screenshot({ path: join(here, 'r4-sheet.png'), type: 'png' });
console.log('shot r4-sheet');
await browser.close();
