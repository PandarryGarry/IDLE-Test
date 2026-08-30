#!/usr/bin/env node
/**
 * Визуальный прогон дороги со снимками каждого кадра.
 *   node scripts/qa/tour.mjs            # холодный + возвращение до auth
 *   node scripts/qa/tour.mjs cold
 *   node scripts/qa/tour.mjs returning
 */
import { mkdirSync, writeFileSync } from 'node:fs';
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
const outDir = process.env.QA_TOUR_OUT || join(cfg.outDir, 'tour');
mkdirSync(outDir, { recursive: true });
const only = (process.argv[2] || 'all').toLowerCase();

const log = [];
const note = (msg) => {
  console.log(msg);
  log.push(msg);
};

async function snap(page, name) {
  const path = join(outDir, `${name}.jpg`);
  await page.screenshot({ path, type: 'jpeg', quality: 82, fullPage: false });
  const title = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return (h1?.textContent || '').trim().slice(0, 80);
  });
  const text = await page.evaluate(() => document.body.innerText.slice(0, 240));
  if (pageHasForbiddenLoader(text)) {
    throw new Error(`${name}: на кадре «Aethelia / Загрузка...»`);
  }
  note(`  📷 ${name}.jpg  —  ${title || '(без h1)'}`);
  return path;
}

async function waitBeat(page, title, timeout = 10000) {
  await page.waitForFunction(
    (want) => document.querySelector('.story-scene h1')?.textContent.trim() === want,
    { timeout },
    title,
  );
  await page.waitForSelector('.story-scene--ready .story-scene__next', { timeout: 5000 });
  await sleep(350);
}

async function clickNext(page) {
  await page.click('.story-scene--ready .story-scene__next');
  await sleep(220);
}

async function runCold(browser) {
  note('• ХОЛОДНЫЙ СТАРТ (новое устройство)');
  const page = await browser.newPage();
  await skipOnboardingStorage(page, { prologueSeen: false });
  await page.goto(cfg.baseUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });

  await page.waitForSelector('.sign-intro', { timeout: 15000 });
  await sleep(1800);
  await snap(page, '01-cold-act0-znak');

  const beats = [
    ['02-cold-continent', 'Этелия не спрашивает о прошлом.'],
    ['03-cold-rumors', 'Говорят, здесь начинается новая жизнь.'],
    ['04-cold-wanderer', 'Ты оставил позади больше, чем вещи.'],
    ['05-cold-city', 'Дорога приводит в Вороний Брод.'],
    ['06-cold-signboard', 'Свет. Тепло. Скрип старой вывески.'],
    ['07-cold-threshold', 'Толкни дверь.'],
  ];

  for (let i = 0; i < beats.length; i++) {
    const [file, title] = beats[i];
    await waitBeat(page, title);
    await snap(page, file);
    await clickNext(page);
  }

  await page.waitForSelector('.auth-screen, form.auth-form', { timeout: 10000 });
  await sleep(500);
  await snap(page, '08-cold-auth');
  await page.close();
}

async function runReturning(browser) {
  note('• ВОЗВРАЩЕНИЕ (пролог уже видели)');
  const page = await browser.newPage();
  await skipOnboardingStorage(page, { prologueSeen: true });
  await page.goto(cfg.baseUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });

  await page.waitForSelector('.splash-root', { timeout: 12000 });
  await sleep(1600);
  await snap(page, '09-return-splash');

  await waitPastSplash(page, 20000);
  const title = await page.evaluate(
    () => document.querySelector('.story-scene h1')?.textContent.trim() || '',
  );
  if (title === 'Знакомый скрип вывески.') {
    await page.waitForSelector('.story-scene--ready .story-scene__next', { timeout: 5000 }).catch(() => {});
    await sleep(400);
    await snap(page, '10-return-creak');
    await skipStoryIfAny(page, 8000);
  } else {
    note(`  ! после вывески заголовок: «${title}»`);
    await snap(page, '10-return-after-splash');
  }

  await page.waitForSelector('.auth-screen, form.auth-form', { timeout: 10000 });
  await sleep(500);
  await snap(page, '11-return-auth');
  await page.close();
}

const browser = await launchBrowser({
  viewport: { width: 390, height: 844, deviceScaleFactor: 2 },
});
try {
  if (only === 'all' || only === 'cold') await runCold(browser);
  if (only === 'all' || only === 'returning') await runReturning(browser);
} finally {
  await browser.close();
}

writeFileSync(join(outDir, 'tour-log.txt'), log.join('\n') + '\n');
note(`Готово: ${outDir}`);
