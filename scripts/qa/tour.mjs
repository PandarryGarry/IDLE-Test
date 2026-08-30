#!/usr/bin/env node
/**
 * Визуальный прогон всей дороги. Без облака: локальный QA-мок
 * (localhost + aethelia_qa_mock_v1). Учётка только в памяти браузера.
 *
 *   node scripts/qa/tour.mjs            # холодный путь + возвращение героя
 *   node scripts/qa/tour.mjs cold
 *   node scripts/qa/tour.mjs returning
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { qaConfig } from './lib/env.mjs';
import {
  launchBrowser,
  skipOnboardingStorage,
  enableQaMock,
  skipStoryIfAny,
  waitPastSplash,
  pageHasForbiddenLoader,
  clickText,
  sleep,
} from './lib/chromium.mjs';

const cfg = qaConfig();
const outDir = process.env.QA_TOUR_OUT || join(cfg.outDir, 'tour');
mkdirSync(outDir, { recursive: true });
const only = (process.argv[2] || 'all').toLowerCase();

const QA_EMAIL = 'qa.tour@aethelia.local';
const QA_PASSWORD = 'qa-tour-pass';
const QA_HERO = 'Каель';

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
  const text = await page.evaluate(() => document.body.innerText.slice(0, 400));
  if (pageHasForbiddenLoader(text)) {
    throw new Error(`${name}: на кадре «Aethelia / Загрузка...»`);
  }
  note(`  📷 ${name}.jpg  —  ${title || '(без h1)'}`);
  return path;
}

async function waitBeat(page, title, timeout = 12000) {
  await page.waitForFunction(
    (want) => document.querySelector('.story-scene h1')?.textContent.trim() === want,
    { timeout },
    title,
  );
  await page.waitForSelector('.story-scene--ready .story-scene__next', { timeout: 6000 });
  await sleep(350);
}

async function clickNext(page) {
  await page.click('.story-scene--ready .story-scene__next');
  await sleep(220);
}

async function setInput(page, selector, value) {
  await page.waitForSelector(selector, { timeout: 8000 });
  await page.$eval(selector, (el, val) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    setter?.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function fillAuth(page, { register }) {
  if (register) {
    await clickText(page, 'Создать аккаунт');
    await page.waitForSelector('#auth-password-repeat', { timeout: 8000 });
    await sleep(300);
  }
  await setInput(page, '#auth-email', QA_EMAIL);
  await setInput(page, '#auth-password', QA_PASSWORD);
  if (register) await setInput(page, '#auth-password-repeat', QA_PASSWORD);
}

async function runCold(browser) {
  note('• ХОЛОДНЫЙ СТАРТ → регистрация → герой → игра');
  const page = await browser.newPage();
  await enableQaMock(page, { reset: true });
  await skipOnboardingStorage(page, { prologueSeen: false });
  await page.goto(cfg.baseUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });

  await page.waitForSelector('.sign-intro', { timeout: 15000 });
  await sleep(1800);
  await snap(page, '01-cold-act0-znak');

  const prologue = [
    ['02-cold-continent', 'Этелия не спрашивает о прошлом.'],
    ['03-cold-rumors', 'Говорят, здесь начинается новая жизнь.'],
    ['04-cold-wanderer', 'Ты оставил позади больше, чем вещи.'],
    ['05-cold-city', 'Дорога приводит в Вороний Брод.'],
    ['06-cold-signboard', 'Свет. Тепло. Скрип старой вывески.'],
    ['07-cold-threshold', 'Толкни дверь.'],
  ];
  for (const [file, title] of prologue) {
    await waitBeat(page, title);
    await snap(page, file);
    await clickNext(page);
  }

  await page.waitForSelector('.auth-screen, form.auth-form', { timeout: 10000 });
  await sleep(400);
  await snap(page, '08-cold-auth');

  await fillAuth(page, { register: true });
  await sleep(200);
  await snap(page, '09-cold-register');
  await page.click('button.auth-button--primary');

  try {
    await page.waitForSelector('.rules-panel, [aria-label="Правила Aethelia"]', { timeout: 20000 });
  } catch (err) {
    await snap(page, 'FAIL-after-register');
    const dump = await page.evaluate(() => ({
      url: location.href,
      root: document.getElementById('root')?.innerHTML?.length,
      text: (document.body.innerText || '').slice(0, 400),
    }));
    note(`  dump ${JSON.stringify(dump)}`);
    throw err;
  }
  await sleep(400);
  await snap(page, '10-cold-rules');
  await page.click('.rules-accept input');
  await sleep(200);
  await clickText(page, 'Продолжить');

  await waitBeat(page, 'Трактирщик приводит тебя в ложу.');
  await snap(page, '11-cold-lodge');
  await clickNext(page);

  await page.waitForSelector('[aria-label="Создание персонажа"]', { timeout: 12000 });
  await sleep(500);
  await snap(page, '12-cold-create-race');
  await clickText(page, 'Выбрать облик');
  await setInput(page, 'input[placeholder*="запомнит"]', QA_HERO);
  await sleep(200);
  await snap(page, '13-cold-create-name');
  await clickText(page, 'Создать героя');

  const departure = [
    ['14-cold-morning', 'Утро. Двери «Топора и Пера» открыты в город.'],
    ['15-cold-name', `Отныне тебя зовут ${QA_HERO}.`],
    ['16-cold-first-step', 'Первый шаг — за порог.'],
  ];
  for (const [file, title] of departure) {
    await waitBeat(page, title);
    await snap(page, file);
    await clickNext(page);
  }

  await page.waitForFunction(
    (name) => document.body.innerText.includes(name) && !document.querySelector('.story-scene'),
    { timeout: 15000 },
    QA_HERO,
  );
  await sleep(600);
  await snap(page, '17-cold-game');
  await page.close();
}

async function runReturning(browser) {
  note('• ВОЗВРАЩЕНИЕ игрока (пролог видели, аккаунт Каеля в моке)');
  const page = await browser.newPage();
  await enableQaMock(page, {});
  await skipOnboardingStorage(page, { prologueSeen: true });
  await page.goto(cfg.baseUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });

  await page.waitForSelector('.splash-root', { timeout: 12000 });
  await sleep(1600);
  await snap(page, '18-return-splash');

  await waitPastSplash(page, 20000);
  await waitBeat(page, 'Знакомый скрип вывески.');
  await snap(page, '19-return-creak');
  await skipStoryIfAny(page, 8000);

  await page.waitForSelector(
    '[aria-label="Выбор персонажа"], .auth-screen, form.auth-form',
    { timeout: 15000 },
  );
  if (await page.$('.auth-screen, form.auth-form')) {
    await snap(page, '20-return-auth');
    await fillAuth(page, { register: false });
    await page.click('button.auth-button--primary');
  }
  await page.waitForSelector('[aria-label="Выбор персонажа"]', { timeout: 20000 });
  await sleep(500);
  await snap(page, '21-return-select');
  await clickText(page, 'Продолжить путь');

  await waitBeat(page, `Снова в путь, ${QA_HERO}.`);
  await snap(page, '22-return-dawn');
  await clickNext(page);

  await page.waitForFunction(
    (name) => document.body.innerText.includes(name) && !document.querySelector('.story-scene'),
    { timeout: 15000 },
    QA_HERO,
  );
  await sleep(600);
  await snap(page, '23-return-game');
  await page.close();
}

const browser = await launchBrowser({
  viewport: { width: 390, height: 844, deviceScaleFactor: 2 },
});
try {
  if (only === 'all' || only === 'cold') await runCold(browser);
  if (only === 'all' || only === 'returning') await runReturning(browser);
} catch (err) {
  note(`FAIL ${err?.stack || err}`);
  writeFileSync(join(outDir, 'tour-log.txt'), log.join('\n') + '\n');
  await browser.close();
  process.exit(1);
}
await browser.close();
writeFileSync(join(outDir, 'tour-log.txt'), log.join('\n') + '\n');
note(`Готово: ${outDir}`);
