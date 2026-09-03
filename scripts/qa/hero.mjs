#!/usr/bin/env node
/**
 * Снимки окна героя (/hero) — без облака, на локальном QA-моке.
 *
 *   node scripts/qa/hero.mjs seed     # создать учётку + героя, сохранить сид
 *   node scripts/qa/hero.mjs          # снять все вкладки (мобилка + десктоп)
 *   node scripts/qa/hero.mjs body     # только доска тела
 *
 * Сид лежит вне репозитория: /tmp/aethelia-qa-hero-seed.json.
 * Канон браузера: scripts/qa/README.md (через lib/chromium.mjs).
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { qaConfig } from './lib/env.mjs';
import {
  launchBrowser,
  skipOnboardingStorage,
  enableQaMock,
  skipStoryIfAny,
  waitPastSplash,
  clickText,
  sleep,
} from './lib/chromium.mjs';

const cfg = qaConfig();
const OUT = process.env.QA_HERO_OUT || join(cfg.outDir, 'hero');
const SEED = process.env.QA_HERO_SEED || '/tmp/aethelia-qa-hero-seed.json';
const HERO = 'Каель';
const EMAIL = 'qa.tour@aethelia.local';
const PASSWORD = 'qa-tour-pass';

/**
 * Герой 30 уровня: луч «Здоровье» выкачан до конца и открыл пассивку,
 * остальные лучи частично пусты — видно и лестницу, и запертые узлы.
 */
const DEMO_ATTRIBUTES = {
  version: 1,
  pillarRanks: { fortitude: 12, might: 8, finesse: 5, instinct: 3 },
  branchRanks: { health: 3, tempo: 1 },
  passiveRanks: { second_wind: 1 },
  unspentPillarPoints: 1,
  unspentBranchPoints: 2,
  heroLevel: 30,
  heroXp: 0,
  energy: { current: 100, max: 100 },
  reputation: 0,
  freeRespecsUsed: 0,
};

const MOBILE = { width: 390, height: 844, deviceScaleFactor: 2 };
const DESKTOP = { width: 1280, height: 820, deviceScaleFactor: 1.5 };

function setInput(page, selector, value) {
  return page.waitForSelector(selector, { timeout: 8000 }).then(() =>
    page.$eval(selector, (el, val) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      setter?.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, value),
  );
}

async function fillAuth(page, { register }) {
  if (register) {
    await clickText(page, 'Создать аккаунт');
    await page.waitForSelector('#auth-password-repeat', { timeout: 8000 });
    await sleep(300);
  }
  await setInput(page, '#auth-email', EMAIL);
  await setInput(page, '#auth-password', PASSWORD);
  if (register) await setInput(page, '#auth-password-repeat', PASSWORD);
}

/** Регистрация → правила → герой. Сид потом копируем в файл. */
async function runSeed(browser) {
  const page = await browser.newPage();
  await enableQaMock(page, { reset: true });
  await skipOnboardingStorage(page, { prologueSeen: true });
  await page.goto(cfg.baseUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await waitPastSplash(page, 20000);
  await skipStoryIfAny(page, 8000);
  await page.waitForSelector('.auth-screen, form.auth-form', { timeout: 15000 });
  await fillAuth(page, { register: true });
  await page.click('button.auth-button--primary');

  await page.waitForSelector('.rules-panel, [aria-label="Правила Aethelia"]', { timeout: 20000 });
  await page.click('.rules-accept input');
  await sleep(200);
  await clickText(page, 'Продолжить');

  await skipStoryIfAny(page, 8000);
  await page.waitForSelector('[aria-label="Создание персонажа"]', { timeout: 12000 });
  await clickText(page, 'Выбрать облик');
  await setInput(page, 'input[placeholder*="запомнит"]', HERO);
  await sleep(200);
  await clickText(page, 'Создать героя');
  await skipStoryIfAny(page, 15000);
  await page.waitForFunction(
    (name) => document.body.innerText.includes(name) && !document.querySelector('.story-scene'),
    { timeout: 20000 },
    HERO,
  );

  const db = await page.evaluate(() => localStorage.getItem('aethelia_qa_db_v1'));
  if (!db) throw new Error('в localStorage нет aethelia_qa_db_v1 — мок не поднялся');
  const parsed = JSON.parse(db);
  parsed.characters = (parsed.characters ?? []).map((row) => ({
    ...row,
    selected: true,
    saveData: { ...(row.saveData ?? {}), attributes: DEMO_ATTRIBUTES },
  }));
  writeFileSync(SEED, JSON.stringify(parsed, null, 2));
  console.log(`Сид готов: ${SEED} (героев: ${parsed.characters.length})`);
  await page.close();
}

async function snap(page, name) {
  const path = join(OUT, `${name}.jpg`);
  await page.screenshot({ path, type: 'jpeg', quality: 88 });
  console.log(`  📷 ${path}`);
  return path;
}

/** Кадр вокруг элемента — чтобы разглядеть мелкую деталь (центр доски, узел). */
async function snapAround(page, selector, name, pad) {
  const el = await page.$(selector);
  if (!el) throw new Error(`нет ${selector}`);
  const box = await el.boundingBox();
  const path = join(OUT, `${name}.jpg`);
  await page.screenshot({
    path,
    type: 'jpeg',
    quality: 92,
    clip: {
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - pad),
      width: box.width + pad * 2,
      height: box.height + pad * 2,
    },
  });
  console.log(`  📷 ${path} (крупно: ${selector})`);
  return path;
}

/** Весь мир доски целиком (ниже MIN_SCALE — только для кадра, не для игры). */
async function snapBoardFit(page, name) {
  await page.evaluate(() => {
    const world = document.querySelector('.hero-board__world');
    const view = document.querySelector('.hero-board');
    if (!world || !view) throw new Error('нет доски');
    const scale = Math.min(view.clientWidth / 740, view.clientHeight / 740);
    const dx = (view.clientWidth - 720 * scale) / 2;
    const dy = (view.clientHeight - 720 * scale) / 2;
    world.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
  });
  await sleep(300);
  const path = join(OUT, `${name}.jpg`);
  const box = await (await page.$('.hero-board')).boundingBox();
  await page.screenshot({
    path,
    type: 'jpeg',
    quality: 92,
    clip: { x: box.x, y: box.y, width: box.width, height: box.height },
  });
  console.log(`  📷 ${path} (вся доска)`);
  return path;
}

async function openHub(page, viewport, tag) {
  await page.setViewport(viewport);
  const seed = readFileSync(SEED, 'utf8');
  await page.evaluateOnNewDocument((raw) => {
    try {
      localStorage.setItem('aethelia_qa_db_v1', raw);
      localStorage.setItem('aethelia_qa_mock_v1', '1');
      localStorage.setItem('aethelia_prologue_seen_v1', '1');
      localStorage.setItem('aethelia_last_seen_version', '0.2.0');
    } catch { /* private mode */ }
  }, seed);
  await page.goto(cfg.baseUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await waitPastSplash(page, 25000);
  await skipStoryIfAny(page, 10000);

  // Прямой /hero не пройти: пока герой не выбран, дорога ведёт на выбор.
  await page.waitForSelector('[aria-label="Выбор персонажа"]', { timeout: 20000 });
  await sleep(400);
  await clickText(page, 'Продолжить путь');
  await skipStoryIfAny(page, 15000);
  await page.waitForFunction(
    (name) => document.body.innerText.includes(name) && !document.querySelector('.story-scene'),
    { timeout: 20000 },
    HERO,
  );
  await sleep(600);

  await page.waitForSelector('a[href="/hero"]', { timeout: 15000 });
  await page.evaluate(() => {
    // Ссылок две (сайдбар + нижняя панель); на мобилке видна только вторая.
    const links = [...document.querySelectorAll('a[href="/hero"]')];
    const visible = links.find(el => el.getBoundingClientRect().width > 0) ?? links[0];
    visible.click();
  });
  await page.waitForSelector('.hero-hub', { timeout: 20000 });
  await sleep(700);
  console.log(`• ${tag}: окно героя открыто`);
}

async function clickTab(page, label) {
  const ok = await page.evaluate((want) => {
    const el = [...document.querySelectorAll('.hero-hub__tab')]
      .find((node) => (node.textContent || '').trim() === want);
    if (!el) return false;
    el.click();
    return true;
  }, label);
  if (!ok) throw new Error(`нет вкладки «${label}»`);
  await sleep(500);
}

async function closeModal(page) {
  await page.evaluate(() => {
    const btn = document.querySelector('[role="dialog"] button[aria-label="Закрыть"], [role="dialog"] .g-modal__close');
    btn?.click();
  });
  await sleep(400);
  await page.keyboard.press('Escape');
  await sleep(300);
}

async function runShots(browser, only) {
  const page = await browser.newPage();
  await openHub(page, MOBILE, 'мобилка 390×844');

  if (only === 'all' || only === 'body') {
    await snap(page, '01-mobile-body');
    await snapAround(page, '.hero-board__knot', '01b-mobile-board-center', 60);
    await snapBoardFit(page, '01c-mobile-board-fit');
    await page.evaluate(() => document.querySelectorAll('.hero-node--pillar')[0]?.click());
    await sleep(500);
    await snap(page, '02-mobile-pillar-modal');
    await closeModal(page);
    await page.evaluate(() => {
      const node = [...document.querySelectorAll('.hero-node:not(.hero-node--pillar):not(.is-void)')]
        .find((el) => el.getAttribute('data-on') === 'true');
      (node ?? document.querySelectorAll('.hero-node:not(.hero-node--pillar):not(.is-void)')[0])?.click();
    });
    await sleep(500);
    await snap(page, '03-mobile-branch-modal');
    await closeModal(page);
  }
  if (only === 'all' || only === 'gear') {
    await clickTab(page, 'Экип');
    await snap(page, '04-mobile-gear');
  }
  if (only === 'all' || only === 'synergies') {
    await clickTab(page, 'Нити');
    await snap(page, '05-mobile-synergies');
  }
  if (only === 'all' || only === 'path') {
    await clickTab(page, 'Путь');
    await snap(page, '06-mobile-path');
  }
  if (only === 'all' || only === 'body') {
    await clickTab(page, 'Тело');
    await page.setViewport(DESKTOP);
    await sleep(900);
    await snap(page, '07-desktop-body');
    await clickTab(page, 'Путь');
    await snap(page, '08-desktop-path');
    await clickTab(page, 'Экип');
    await snap(page, '09-desktop-gear');
  }
  await page.close();
}

const only = (process.argv[2] || 'all').toLowerCase();
mkdirSync(OUT, { recursive: true });

if (only === 'seed') {
  const browser = await launchBrowser({ viewport: MOBILE });
  try {
    await runSeed(browser);
  } finally {
    await browser.close();
  }
} else {
  if (!existsSync(SEED)) {
    console.error(`Нет сида ${SEED}. Сначала: node scripts/qa/hero.mjs seed`);
    process.exit(1);
  }
  const browser = await launchBrowser({ viewport: MOBILE });
  try {
    await runShots(browser, only);
  } catch (err) {
    console.error(`FAIL ${err?.stack || err}`);
    await browser.close();
    process.exit(1);
  }
  await browser.close();
  console.log(`Готово: ${OUT}`);
}
