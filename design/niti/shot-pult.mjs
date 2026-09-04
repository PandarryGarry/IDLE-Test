#!/usr/bin/env node
import { launchBrowser, sleep } from '../../scripts/qa/lib/chromium.mjs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const b = await launchBrowser({ viewport: { width: 430, height: 1400, deviceScaleFactor: 2 } });
const p = await b.newPage();
await p.goto('file://' + join(here, 'mockups-pult.html'), { waitUntil: 'networkidle0', timeout: 60000 });
await p.evaluate(async () => {
  await Promise.all([...document.images].map(img => img.complete ? null : img.decode().catch(() => {})));
});
await sleep(500);
for (const id of ['V1','V2','V3','A','M']) {
  const el = await p.$(`#variant-${id}`);
  if (!el) throw new Error('нет #variant-' + id);
  await el.screenshot({ path: join(here, `pult-${id}.png`), type: 'png' });
  console.log('shot', id);
}
await p.setViewport({ width: 1900, height: 2500, deviceScaleFactor: 1 });
await p.evaluate(() => document.body.classList.add('grid4'));
await sleep(400);
await p.$('#root').then(r => r.screenshot({ path: join(here, 'pult-sheet.png'), type: 'png' }));
console.log('shot pult-sheet');
await b.close();
