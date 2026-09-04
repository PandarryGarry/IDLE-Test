#!/usr/bin/env node
import { launchBrowser, sleep } from '../../scripts/qa/lib/chromium.mjs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const b = await launchBrowser({ viewport: { width: 1020, height: 1600, deviceScaleFactor: 1 } });
const p = await b.newPage();
await p.goto('file://' + join(here, 'pultc-sheet.html'), { waitUntil: 'networkidle0', timeout: 60000 });
await p.evaluate(async () => {
  await Promise.all([...document.images].map(img => img.complete ? null : img.decode().catch(() => {})));
});
await sleep(500);
await p.$('body').then(r => r.screenshot({ path: join(here, 'pultc-sheet.png'), type: 'png' }));
console.log('shot pultc-sheet');
await b.close();
