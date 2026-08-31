#!/usr/bin/env node
/**
 * Прогон кинематографической дороги. Скрипт постоянный — сценарий в данных,
 * не в одноразовом патче.
 *
 *   node scripts/qa/setup-browser.mjs
 *   node scripts/qa/road.mjs              # холодный старт + возвращение
 *   node scripts/qa/road.mjs cold
 *   node scripts/qa/road.mjs returning
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { qaConfig } from './lib/env.mjs';
import {
  launchBrowser,
  skipOnboardingStorage,
  skipStoryIfAny,
  waitPastSplash,
  pageHasForbiddenLoader,
  sleep,
} from './lib/chromium.mjs';

const cfg = qaConfig();
mkdirSync(cfg.outDir, { recursive: true });
const only = (process.argv[2] || 'all').toLowerCase();

const COLD_TITLES = [
  'Этелия не спрашивает о прошлом.',
  'Говорят, здесь начинается новая жизнь.',
  'Ты оставил позади больше, чем вещи.',
  'Дорога приводит в Вороний Брод.',
  'Свет. Тепло. Скрип старой вывески.',
  'Толкни дверь.',
];

const failures = [];
const fail = (msg) => {
  failures.push(msg);
  console.error('✗', msg);
};
const ok = (msg) => console.log('✓', msg);

async function assertNoLoader(page, where) {
  const text = await page.evaluate(() => document.body.innerText);
  if (pageHasForbiddenLoader(text)) fail(`${where}: «Aethelia / Загрузка...»`);
}

async function runCold(browser) {
  console.log('• холодный старт');
  const page = await browser.newPage();
  await skipOnboardingStorage(page, { prologueSeen: false });
  await page.goto(cfg.baseUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });

  await page.waitForSelector('.sign-intro', { timeout: 15000 });
  const signTitle = await page.$eval('.sign-intro h1', (el) => el.textContent.trim());
  if (!signTitle.includes('ЭТЕЛИЯ')) fail(`акт 0 без ЭТЕЛИЯ: ${signTitle}`);
  else ok(`акт 0 «${signTitle}»`);
  await assertNoLoader(page, 'акт 0');
  await page.screenshot({ path: join(cfg.outDir, 'road-cold-sign.png') });

  await page.waitForSelector('.story-scene', { timeout: 20000 });
  ok('пролог начался');

  for (let i = 0; i < COLD_TITLES.length; i++) {
    await page.waitForFunction(
      (title) => document.querySelector('.story-scene h1')?.textContent.trim() === title,
      { timeout: 8000 },
      COLD_TITLES[i],
    );
    ok(`бит ${i + 1}: ${COLD_TITLES[i]}`);
    await page.waitForSelector('.story-scene--ready .story-scene__next', { timeout: 4000 });
    const label = await page.$eval('.story-scene__next', (el) => el.textContent.trim());
    const want = i === COLD_TITLES.length - 1 ? 'Войти в таверну' : 'Далее';
    if (label !== want) fail(`бит ${i + 1}: кнопка «${label}», ждали «${want}»`);
    await assertNoLoader(page, `бит ${i + 1}`);
    await page.click('.story-scene__next');
    await sleep(200);
  }

  await page.waitForSelector('.auth-screen, form.auth-form', { timeout: 8000 });
  await assertNoLoader(page, 'после таверны');
  ok('после «Войти в таверну» — auth');
  await page.screenshot({ path: join(cfg.outDir, 'road-cold-auth.png') });
  await page.close();
}

async function runReturning(browser) {
  console.log('• возвращение');
  const page = await browser.newPage();
  await skipOnboardingStorage(page, { prologueSeen: true });
  await page.goto(cfg.baseUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });

  await page.waitForSelector('.splash-root', { timeout: 10000 });
  ok('вывеска');
  await assertNoLoader(page, 'под вывеской');
  await page.screenshot({ path: join(cfg.outDir, 'road-returning-splash.png') });

  await waitPastSplash(page, 20000);
  const title = await page.evaluate(() => document.querySelector('.story-scene h1')?.textContent.trim() || '');
  if (title && title !== 'Знакомый скрип вывески.') {
    fail(`возвращение: «${title}», ждали «Знакомый скрип вывески.»`);
  } else if (title) {
    ok(`вход: «${title}»`);
    const dots = await page.$$('.story-scene__progress span');
    if (dots.length > 0) fail(`одно-битная сцена с точками (${dots.length})`);
    else ok('без точек прогресса');
    await skipStoryIfAny(page, 8000);
  }
  await page.waitForSelector('.auth-screen, form.auth-form', { timeout: 10000 });
  await assertNoLoader(page, 'возвращение → auth');
  ok('возвращение → auth');
  await page.screenshot({ path: join(cfg.outDir, 'road-returning-auth.png') });
  await page.close();
}

const browser = await launchBrowser();
try {
  if (only === 'all' || only === 'cold') await runCold(browser);
  if (only === 'all' || only === 'returning') await runReturning(browser);
} catch (err) {
  fail(err.stack || String(err));
} finally {
  await browser.close();
}

console.log('\n════ ИТОГ ════');
if (failures.length) {
  for (const f of failures) console.log(' -', f);
  process.exit(1);
}
console.log('Дорога чистая. Снимки:', cfg.outDir);
process.exit(0);
