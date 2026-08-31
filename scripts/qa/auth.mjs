#!/usr/bin/env node
/**
 * Вход / регистрация через живой UI — без правок этого файла под каждый прогон.
 * Учётка только из env / scripts/qa/.env.local (секреты в git не класть).
 *
 *   node scripts/qa/setup-browser.mjs   # один раз на песочницу
 *   node scripts/qa/auth.mjs login
 *   node scripts/qa/auth.mjs register
 *
 * Нужен запущенный dev-сервер (QA_BASE_URL) и QA_EMAIL + QA_PASSWORD.
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

const command = (process.argv[2] || 'login').toLowerCase();
if (!['login', 'register'].includes(command)) {
  console.error('Использование: node scripts/qa/auth.mjs <login|register>');
  process.exit(2);
}

const cfg = qaConfig();
if (!cfg.email || !cfg.password) {
  console.error('Задай QA_EMAIL и QA_PASSWORD (scripts/qa/.env.local или env). Секреты в чат не писать.');
  process.exit(2);
}

mkdirSync(cfg.outDir, { recursive: true });

function fail(msg, extra) {
  console.error('FAIL:', msg);
  if (extra) console.error(extra);
  process.exit(1);
}

const browser = await launchBrowser();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (err) => errors.push(String(err)));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});

try {
  await skipOnboardingStorage(page, { prologueSeen: true });
  await page.goto(cfg.baseUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await waitPastSplash(page, 25000).catch(() => {});
  await skipStoryIfAny(page, 12000);

  const body = await page.evaluate(() => document.body.innerText);
  if (pageHasForbiddenLoader(body)) {
    await page.screenshot({ path: join(cfg.outDir, 'auth-forbidden-loader.png') });
    fail('на экране «Aethelia / Загрузка...» — этого экрана быть не должно');
  }

  await page.waitForSelector('.auth-screen, form.auth-form', { timeout: 20000 });

  if (command === 'register') {
    const switchBtn = await page.$('button.auth-button--secondary');
    const switchText = switchBtn ? await page.evaluate((el) => el.textContent, switchBtn) : '';
    if (switchBtn && /аккаунт|регистр/i.test(switchText || '')) {
      await switchBtn.click();
      await sleep(400);
    } else {
      await page.goto(`${cfg.baseUrl}/register`, { waitUntil: 'domcontentloaded' });
      await sleep(400);
    }
  }

  await page.waitForSelector('#auth-email', { timeout: 10000 });
  await page.click('#auth-email', { clickCount: 3 }).catch(() => {});
  await page.type('#auth-email', cfg.email, { delay: 15 });
  await page.click('#auth-password', { clickCount: 3 }).catch(() => {});
  await page.type('#auth-password', cfg.password, { delay: 15 });
  if (command === 'register') {
    const repeat = await page.$('#auth-password-repeat');
    if (repeat) await page.type('#auth-password-repeat', cfg.password, { delay: 15 });
  }

  await page.click('button.auth-button--primary');
  await sleep(800);

  const deadline = Date.now() + 20000;
  let outcome = 'unknown';
  while (Date.now() < deadline) {
    const snap = await page.evaluate(() => ({
      text: document.body.innerText,
      auth: Boolean(document.querySelector('.auth-screen, form.auth-form')),
      error: document.querySelector('.auth-error')?.textContent?.trim() || '',
      message: document.querySelector('.auth-message')?.textContent?.trim() || '',
      rules: Boolean(document.querySelector('.rules-panel, [aria-label="Правила Aethelia"]')),
      create: Boolean(document.querySelector('[aria-label="Создание персонажа"]')),
      select: Boolean(document.querySelector('[aria-label="Выбор персонажа"]')),
      game: Boolean(document.querySelector('.g-nav-item') || document.body.innerText.includes('Зарегистрируйся')),
    }));
    if (pageHasForbiddenLoader(snap.text)) {
      await page.screenshot({ path: join(cfg.outDir, 'auth-loader-after-submit.png') });
      fail('после сабмита снова «Aethelia / Загрузка...»');
    }
    if (snap.error) {
      outcome = `error:${snap.error}`;
      break;
    }
    if (snap.message) {
      outcome = `message:${snap.message}`;
      break;
    }
    if (!snap.auth && (snap.rules || snap.create || snap.select || snap.game)) {
      outcome = snap.rules ? 'rules' : snap.create ? 'create' : snap.select ? 'select' : 'game';
      break;
    }
    await sleep(250);
  }

  const shot = join(cfg.outDir, `auth-${command}.png`);
  await page.screenshot({ path: shot, fullPage: true });
  writeFileSync(
    join(cfg.outDir, `auth-${command}.json`),
    JSON.stringify({ command, outcome, url: page.url(), errors }, null, 2),
  );

  console.log(`OK command=${command} outcome=${outcome}`);
  console.log('screenshot:', shot);
  if (outcome === 'unknown') fail('форма не ушла и ошибки нет — похоже на фриз', { errors });
  if (outcome.startsWith('error:')) {
    console.warn('Сервер ответил ошибкой (ключ/сеть/учётка). Это не фриз UI.');
  }
} finally {
  await browser.close();
}
