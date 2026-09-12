#!/usr/bin/env node
/**
 * Снимки Combat 2.0 — без облака, на локальном QA-моке.
 *
 *   node scripts/qa/hero.mjs seed   # если сида ещё нет
 *   node scripts/qa/combat.mjs      # prep → active → tactic → report, mobile+desktop
 *
 * Кадры: /tmp/aethelia-qa-out/combat2 (или QA_COMBAT_OUT).
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { qaConfig } from './lib/env.mjs';
import {
  clickText,
  enableQaMock,
  launchBrowser,
  skipOnboardingStorage,
  skipStoryIfAny,
  sleep,
  waitPastSplash,
} from './lib/chromium.mjs';

const cfg = qaConfig();
const OUT = process.env.QA_COMBAT_OUT || join(cfg.outDir, 'combat2');
const SEED = process.env.QA_HERO_SEED || '/tmp/aethelia-qa-hero-seed.json';
const HERO = 'Каель';
const LEGACY = process.env.QA_LEGACY_COMBAT === '1';

const MOBILE = { width: 390, height: 844, deviceScaleFactor: 2 };
const DESKTOP = { width: 1280, height: 820, deviceScaleFactor: 1.5 };

async function snap(page, name) {
  const path = join(OUT, `${name}.jpg`);
  await page.screenshot({ path, type: 'jpeg', quality: 88 });
  console.log(`  📷 ${path}`);
  return path;
}

async function openCombat(page, viewport, tag) {
  await page.setViewport(viewport);
  const seed = readFileSync(SEED, 'utf8');
  const parsed = JSON.parse(seed);
  const heroSave = parsed.characters?.[0]?.saveData;
  await page.evaluateOnNewDocument((raw, autoSave) => {
    try {
      localStorage.setItem('aethelia_qa_db_v1', raw);
      localStorage.setItem('aethelia_qa_mock_v1', '1');
      localStorage.setItem('aethelia_prologue_seen_v1', '1');
      localStorage.setItem('aethelia_last_seen_version', '0.2.0');
      if (autoSave) localStorage.setItem('aethelia_save_auto', JSON.stringify(autoSave));
      sessionStorage.removeItem('entrance-returning');
    } catch { /* private mode */ }
  }, seed, heroSave);
  await enableQaMock(page, { reset: false });
  await skipOnboardingStorage(page, { prologueSeen: true });
  await page.goto(cfg.baseUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await waitPastSplash(page, 25000);
  await skipStoryIfAny(page, 10000);
  await page.waitForSelector('[aria-label="Выбор персонажа"]', { timeout: 20000 });
  await sleep(300);
  await clickText(page, 'Продолжить путь');
  await skipStoryIfAny(page, 15000);
  await page.waitForFunction(
    (name) => document.body.innerText.includes(name) && !document.querySelector('.story-scene'),
    { timeout: 20000 },
    HERO,
  );
  await sleep(600);
  await page.waitForSelector('a[href="/combat"]', { timeout: 15000 });
  await page.evaluate(() => {
    const links = [...document.querySelectorAll('a[href="/combat"]')];
    const visible = links.find(el => el.getBoundingClientRect().width > 0) ?? links[0];
    visible.click();
  });
  await page.waitForFunction(
    () => document.querySelector('.combat2-page')
      || window.location.pathname.includes('/combat')
      || document.body.innerText.includes('Зоны сражений')
      || document.body.innerText.includes('Выберите подземелье'),
    { timeout: 20000 },
  );
  await sleep(700);
  console.log(`• ${tag}: бой открыт`);
}

async function clickArea(page, areaName) {
  const ok = await page.evaluate((name) => {
    const combat2 = [...document.querySelectorAll('.combat2-area:not(.is-locked)')];
    const modernArea = name
      ? combat2.find(el => (el.textContent || '').includes(name))
      : combat2[0];
    if (modernArea) {
      modernArea.click();
      return true;
    }

    const buttons = [...document.querySelectorAll('button:not(:disabled)')];
    const legacyArea = buttons.find(el => {
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (name) return text.includes(name) || text.includes('Farmlands') || text.includes('Dark Forest');
      return text.includes('Farmlands') || text.includes('Зоны') || text.includes('монстров');
    });
    if (!legacyArea) return false;
    legacyArea.click();
    return true;
  }, areaName);
  if (!ok) throw new Error(`нет доступной зоны ${areaName || ''}`.trim());
  await page.waitForFunction(
    () => document.querySelector('.combat2-stage .combat2-enemy') || document.body.innerText.includes('Сражение против'),
    { timeout: 12000 },
  );
  await sleep(900);
}

async function stopCombat(page) {
  const stopped = await page.evaluate(() => {
    const modern = document.querySelector('.combat2-stop');
    if (modern) {
      modern.click();
      return true;
    }
    const btn = [...document.querySelectorAll('button')]
      .find(el => (el.textContent || '').includes('Отступить'));
    btn?.click();
    return Boolean(btn);
  });
  if (!stopped) throw new Error('нет кнопки отступления');
  if (LEGACY) await sleep(500);
  else await page.waitForSelector('.combat2-report', { timeout: 12000 });
  await sleep(500);
}

async function runShots(browser) {
  const page = await browser.newPage();
  await openCombat(page, MOBILE, 'мобилка 390×844');
  await snap(page, '01-mobile-prep');

  await clickArea(page, null);
  await snap(page, '02-mobile-active');

  if (LEGACY) {
    await stopCombat(page);
    await snap(page, '03-mobile-stopped');
    await page.setViewport(DESKTOP);
    await sleep(800);
    await snap(page, '04-desktop-legacy');
    await page.close();
    return;
  }

  await page.evaluate(() => document.querySelector('.combat2-tactic')?.click());
  await sleep(1000);
  await snap(page, '03-mobile-tactic');

  await stopCombat(page);
  await snap(page, '04-mobile-report');

  await page.setViewport(DESKTOP);
  await sleep(800);
  await snap(page, '05-desktop-prep-report');

  await clickArea(page, 'Тёмная чаща');
  await snap(page, '06-desktop-active');

  await page.close();
}

if (!existsSync(SEED)) {
  console.error(`Нет сида ${SEED}. Сначала: node scripts/qa/hero.mjs seed`);
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
const browser = await launchBrowser({ viewport: MOBILE });
try {
  await runShots(browser);
} catch (err) {
  console.error(`FAIL ${err?.stack || err}`);
  await browser.close();
  process.exit(1);
}
await browser.close();
console.log(`Готово: ${OUT}`);
