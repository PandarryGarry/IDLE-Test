#!/usr/bin/env node
import { launchBrowser, sleep } from '../../scripts/qa/lib/chromium.mjs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const b = await launchBrowser({ viewport: { width: 430, height: 1200, deviceScaleFactor: 1 } });
const p = await b.newPage();
await p.goto('file://' + join(here, 'mockups-r4.html'), { waitUntil: 'networkidle0' });
await sleep(400);
const report = await p.evaluate(() => {
  const out = [];
  for (const id of ['variant-R4-A','variant-R4-B','variant-R4-C','variant-R4-D']) {
    const el = document.getElementById(id);
    if (!el) { out.push(id + ': MISSING'); continue; }
    const rect = el.getBoundingClientRect();
    const overX = el.scrollWidth - el.clientWidth;
    out.push(`${id}: h=${Math.round(rect.height)} overX=${overX}`);
  }
  return out.join('\n');
});
console.log(report);
await b.close();
