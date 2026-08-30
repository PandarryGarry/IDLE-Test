import puppeteer from 'puppeteer-core';
import fs from 'fs';

const OUT = process.env.OUT || '/home/user/ui_shot';
const URL = process.env.URL || 'http://127.0.0.1:3000';
const emblemB64 = fs.readFileSync(process.env.EMBLEM || '/home/user/scratch_axe/intro_emblem.webp').toString('base64');
const DATA_URL = `data:image/webp;base64,${emblemB64}`;

const browser = await puppeteer.launch({
  executablePath: '/tmp/chromium',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox'],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
  env: { ...process.env, LD_LIBRARY_PATH: '/tmp/al2023/lib', FONTCONFIG_PATH: '/tmp/fonts' },
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* CSS-инъекция: скрываем детей бокса, рисуем знак псевдоэлементом.
   Селекторы: топбар (header a[href="/"] > div) и сайдбар (a[href="/"] > div > div:first-child). */
const STYLE_ID = '__emblem_preview__';
const CSS = (mode) => `
  header a[href="/"] > div:first-child,
  a[href="/"] > div > div:first-child {
    position: relative;
    ${mode === 'v2' ? 'background: none !important; box-shadow: none !important;' : ''}
  }
  header a[href="/"] > div:first-child > *,
  a[href="/"] > div > div:first-child > * {
    visibility: hidden;
  }
  header a[href="/"] > div:first-child::after,
  a[href="/"] > div > div:first-child::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url(${DATA_URL});
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    ${mode === 'v1' ? 'inset: 2px;' : ''}
    border-radius: inherit;
  }
`;

async function setMode(page, mode) {
  await page.evaluate((id, css) => {
    let tag = document.getElementById(id);
    if (!tag) {
      tag = document.createElement('style');
      tag.id = id;
      document.head.appendChild(tag);
    }
    tag.textContent = css;
  }, STYLE_ID, mode === 'base' ? '' : CSS(mode));
}

try {
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('aethelia_prologue_seen_v1', '1');
      sessionStorage.setItem('aethelia_prologue_seen_v1', '1');
      localStorage.setItem('aethelia_last_seen_version', '0.2.0');
    } catch { /* noop */ }
  });
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });
  await page.waitForSelector('button.auth-link--guest', { timeout: 60000 });
  await sleep(900);
  await page.click('button.auth-link--guest');
  await page.waitForFunction(() => document.body.innerText.includes('Мир:'), { timeout: 60000 });
  await sleep(4000);
  const modalCheck = await page.evaluate(() => ({
    dialogs: document.querySelectorAll('[role="dialog"]').length,
    bodyText: document.body.innerText.slice(0, 60),
  }));
  console.log('MODAL CHECK:', JSON.stringify(modalCheck));

  for (const mode of ['base', 'v1', 'v2']) {
    await setMode(page, mode);
    await sleep(500);
    await page.screenshot({ path: `${OUT}/${mode}_d.png` });
    // контроль: бокс логотипа в топбаре изменился?
    const ok = await page.evaluate(() => {
      const box = document.querySelector('header a[href="/"] > div');
      return box ? getComputedStyle(box, '::after').content : 'NOBOX';
    });
    console.log(`${mode}_d OK (::after=${String(ok).slice(0, 24)})`);
  }

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await sleep(1500);
  for (const mode of ['base', 'v1', 'v2']) {
    await setMode(page, mode);
    await sleep(500);
    await page.screenshot({ path: `${OUT}/${mode}_m.png` });
    console.log(`${mode}_m OK`);
  }
} finally {
  await browser.close();
}
