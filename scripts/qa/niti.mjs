#!/usr/bin/env node
/**
 * Снимки и проверки вкладки «Нити» (/hero) — без облака, на локальном QA-моке.
 *
 *   node scripts/qa/niti.mjs seed   # сделать сид с 4 горящими нитями (из сида hero.mjs)
 *   node scripts/qa/niti.mjs        # снимки + DOM-ассерты (порядок, счётчики, палитра, модалка)
 *
 * Требует уже готовый сид окна героя: node scripts/qa/hero.mjs seed
 * (создаёт /tmp/aethelia-qa-hero-seed.json; здесь лишь поднимаем столпы,
 *  чтобы часть нитей горела — так виден и отсек «Активные», и модалка «горит»).
 * Канон браузера: scripts/qa/README.md (через lib/chromium.mjs).
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { qaConfig } from './lib/env.mjs';
import {
  launchBrowser,
  skipOnboardingStorage,
  skipStoryIfAny,
  waitPastSplash,
  clickText,
  sleep,
} from './lib/chromium.mjs';

const cfg = qaConfig();
const OUT = process.env.QA_NITI_OUT || join(cfg.outDir, 'niti');
const HERO_SEED = process.env.QA_HERO_SEED || '/tmp/aethelia-qa-hero-seed.json';
const NITI_SEED = process.env.QA_NITI_SEED || '/tmp/aethelia-qa-niti-seed.json';
const HERO = 'Каель';

/**
 * Столпы под «горящие» нити (раса human: fort +12, might −10, finesse +10, instinct 0):
 *   solid_strike 50/30 ✓, quick_eye 50/30 ✓, unstoppable 50/30 ✓, lucky_survivor 50/30 ✓,
 *   tempo_master 70/40 ✗ (finesse 55), destroyer 70/40 ✗ (might 50, instinct 30).
 */
const NITI_PILLARS = { fortitude: 50, might: 60, finesse: 45, instinct: 30 };

const MOBILE = { width: 390, height: 844, deviceScaleFactor: 2 };
const DESKTOP = { width: 1280, height: 820, deviceScaleFactor: 1.5 };

function runSeed() {
  if (!existsSync(HERO_SEED)) {
    console.error(`Нет сида ${HERO_SEED}. Сначала: node scripts/qa/hero.mjs seed`);
    process.exit(1);
  }
  const parsed = JSON.parse(readFileSync(HERO_SEED, 'utf8'));
  parsed.characters = (parsed.characters ?? []).map((row) => ({
    ...row,
    selected: true,
    saveData: {
      ...(row.saveData ?? {}),
      attributes: {
        ...(row.saveData?.attributes ?? {}),
        pillarRanks: NITI_PILLARS,
      },
    },
  }));
  writeFileSync(NITI_SEED, JSON.stringify(parsed, null, 2));
  console.log(`Сид нитей готов: ${NITI_SEED}`);
}

async function openHub(page, viewport, tag) {
  await page.setViewport(viewport);
  const seed = readFileSync(NITI_SEED, 'utf8');
  const parsed = JSON.parse(seed);
  const heroSave = parsed.characters?.[0]?.saveData;
  await page.evaluateOnNewDocument((raw, autoSave) => {
    try {
      localStorage.setItem('aethelia_qa_db_v1', raw);
      localStorage.setItem('aethelia_qa_mock_v1', '1');
      localStorage.setItem('aethelia_prologue_seen_v1', '1');
      localStorage.setItem('aethelia_last_seen_version', '0.2.0');
      if (autoSave) localStorage.setItem('aethelia_save_auto', JSON.stringify(autoSave));
    } catch { /* private mode */ }
  }, seed, heroSave);
  await page.goto(cfg.baseUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await waitPastSplash(page, 25000);
  await skipStoryIfAny(page, 10000);

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
    const links = [...document.querySelectorAll('a[href="/hero"]')];
    const visible = links.find((el) => el.getBoundingClientRect().width > 0) ?? links[0];
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

async function snap(page, name) {
  const path = join(OUT, `${name}.jpg`);
  await page.screenshot({ path, type: 'jpeg', quality: 88 });
  console.log(`  📷 ${path}`);
  return path;
}

async function closeModal(page) {
  await page.evaluate(() => {
    const btn = document.querySelector('[role="dialog"] button[aria-label="Закрыть"]');
    btn?.click();
  });
  await sleep(400);
  await page.keyboard.press('Escape');
  await sleep(300);
}

let failures = 0;
function check(label, ok, extra = '') {
  if (ok) console.log(`  ✓ ${label}`);
  else { failures += 1; console.error(`  ✗ ${label} ${extra}`); }
}

async function runShots(browser) {
  const page = await browser.newPage();
  await openHub(page, MOBILE, 'мобилка 390×844');
  await clickTab(page, 'Нити');

  /* Шапка-сводка */
  const summary = await page.evaluate(() => {
    const el = document.querySelector('.hero-thread-summary');
    if (!el) return null;
    const bg = getComputedStyle(el).backgroundColor;
    return {
      text: el.textContent,
      bg,
      pillars: el.querySelectorAll('.hero-thread-summary__pillars span').length,
      ring: Boolean(el.querySelector('.hero-thread-ring circle')),
    };
  });
  check('шапка-сводка есть', Boolean(summary));
  if (summary) {
    check('заголовок «гобелен нитей · 12»', /гобелен нитей\s*·\s*12/.test(summary.text), summary.text);
    check('счётчики горит 4 / спит 2 / скоро 6',
      /горит 4/.test(summary.text) && /спит 2/.test(summary.text) && /скоро 6/.test(summary.text),
      summary.text);
    check('4 строки столпов в сводке', summary.pillars === 4);
    check('фон сводки = --bg-header (rgb 42,21,8)', summary.bg === 'rgb(42, 21, 8)', summary.bg);
    check('кольцо-прогресс есть', summary.ring);
  }

  /* Отсек «Неактивные» по умолчанию */
  const inactive = await page.evaluate(() => {
    const onTab = document.querySelector('.hero-thread-tabs button.is-on');
    const cards = [...document.querySelectorAll('.hero-thread-grid .hero-thread-card')];
    const firstTwo = cards.slice(0, 2).map((c) => c.textContent.replace(/\s+/g, ' ').trim());
    const soonBadges = [...document.querySelectorAll('.hero-thread-grid .hero-thread-card--soon')]
      .map((c) => c.textContent.includes('скоро'));
    const cardBg = cards[0] ? getComputedStyle(cards[0]).backgroundImage : '';
    const soonBg = cards.find((c) => c.classList.contains('hero-thread-card--soon'))
      ? getComputedStyle(cards.find((c) => c.classList.contains('hero-thread-card--soon'))).backgroundImage
      : '';
    return {
      onTab: onTab?.textContent?.replace(/\s+/g, ' ').trim(),
      count: cards.length,
      firstTwo,
      soonCount: soonBadges.length,
      soonAll: soonBadges.every(Boolean),
      cardBg,
      soonBg,
    };
  });
  check('подвкладка по умолчанию — «Неактивные»', /Неактивные/.test(inactive.onTab), inactive.onTab);
  check('в отсеке 8 карточек (2 спят + 6 скоро)', inactive.count === 8, String(inactive.count));
  check('ближайшая к открытию — «Мастер темпа»', inactive.firstTwo[0]?.startsWith('Мастер темпа'), inactive.firstTwo[0]);
  check('вторая — «Разрушитель»', inactive.firstTwo[1]?.startsWith('Разрушитель'), inactive.firstTwo[1]);
  check('у «скоро» 6 бейджей', inactive.soonCount === 6 && inactive.soonAll, String(inactive.soonCount));
  check('карточка — каштан (slot-wood)', inactive.cardBg.includes('linear-gradient'), inactive.cardBg);
  check('карточка «скоро» — запертое дерево (slot-wood-locked)', inactive.soonBg.includes('linear-gradient'), inactive.soonBg);
  await snap(page, 'niti-01-inactive');

  /* Готовность по узкому месту: Мастер темпа = min(55/70, 62/40) → 79%; Разрушитель = min(50/70, 30/40) → 71% */
  const pcts = await page.evaluate(() =>
    [...document.querySelectorAll('.hero-thread-grid .hero-thread-card:not(.hero-thread-card--soon)')]
      .map((c) => c.querySelector('.hero-thread-card__pct')?.textContent ?? ''),
  );
  check('проценты готовности 79% и 71%', pcts[0] === '79%' && pcts[1] === '71%', pcts.join(', '));

  /* Отсек «Активные» */
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('.hero-thread-tabs button')]
      .find((n) => n.textContent.includes('Активные'));
    el?.click();
  });
  await sleep(400);
  const active = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.hero-thread-grid .hero-thread-card')];
    return {
      count: cards.length,
      allOn: cards.every((c) => c.dataset.on === 'true'),
      names: cards.map((c) => c.querySelector('.hero-thread-card__name')?.textContent ?? ''),
      firstPct: cards[0]?.querySelector('.hero-thread-card__pct')?.textContent ?? '',
      firstShadow: cards[0] ? getComputedStyle(cards[0]).boxShadow : '',
    };
  });
  check('активных 4, все подсвечены (data-on=true)', active.count === 4 && active.allOn, JSON.stringify(active.names));
  check('активные по ярусу: «Быстрый глаз» первым', active.names[0] === 'Быстрый глаз', active.names.join(', '));
  check('у активной полоса 100%', active.firstPct === '100%', active.firstPct);
  check('активная светится золотом (shadow-gold)', /rgba\(200,\s*136,\s*10/.test(active.firstShadow), active.firstShadow);
  await snap(page, 'niti-02-active');

  /* Модалка спящей нити — информационная, без CTA */
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('.hero-thread-tabs button')]
      .find((n) => n.textContent.includes('Неактивные'));
    el?.click();
  });
  await sleep(400);
  await page.evaluate(() => {
    const card = document.querySelector('.hero-thread-grid .hero-thread-card:not(.hero-thread-card--soon)');
    card?.click();
  });
  await page.waitForSelector('[role="dialog"]', { timeout: 8000 });
  await sleep(300);
  const modal = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const text = d?.textContent ?? '';
    return {
      text: text.replace(/\s+/g, ' ').trim(),
      hasDo: text.includes('что делает'),
      hasNeed: text.includes('чтобы зажечь'),
      hasLeft: text.includes('Осталось повысить: Сноровка +15'),
      reqRows: d?.querySelectorAll('.hero-thread-detail__req').length ?? 0,
      hasCta: [...(d?.querySelectorAll('button') ?? [])].some((b) => /очко|Положить|Повысить/.test(b.textContent)),
    };
  });
  check('модалка: что делает + чтобы зажечь', modal.hasDo && modal.hasNeed, modal.text);
  check('модалка: «Осталось повысить: Сноровка +15»', modal.hasLeft, modal.text);
  check('модалка: 2 строки столпов с прогрессом', modal.reqRows === 2, String(modal.reqRows));
  check('модалка без CTA', !modal.hasCta);
  await snap(page, 'niti-03-modal-sleeping');
  await closeModal(page);

  /* Модалка «скоро» */
  await page.evaluate(() => {
    const card = document.querySelector('.hero-thread-grid .hero-thread-card--soon');
    card?.click();
  });
  await page.waitForSelector('[role="dialog"]', { timeout: 8000 });
  await sleep(300);
  const soonModal = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const text = d?.textContent ?? '';
    return { text: text.replace(/\s+/g, ' ').trim() };
  });
  check('модалка «скоро»: появится в будущих обновлениях',
    soonModal.text.includes('Скоро') && soonModal.text.includes('будущих обновлениях'),
    soonModal.text);
  await snap(page, 'niti-04-modal-soon');
  await closeModal(page);

  /* Десктоп */
  await page.setViewport(DESKTOP);
  await sleep(900);
  await snap(page, 'niti-05-desktop');

  await page.close();
}

const only = (process.argv[2] || 'shots').toLowerCase();
mkdirSync(OUT, { recursive: true });

if (only === 'seed') {
  runSeed();
} else {
  if (!existsSync(NITI_SEED)) {
    console.error(`Нет сида ${NITI_SEED}. Сначала: node scripts/qa/niti.mjs seed`);
    process.exit(1);
  }
  const browser = await launchBrowser({ viewport: MOBILE });
  try {
    await runShots(browser);
  } catch (err) {
    console.error(`FAIL ${err?.stack || err}`);
    await browser.close();
    process.exit(1);
  }
  await browser.close();
  console.log(`Готово: ${OUT} (failures: ${failures})`);
  if (failures > 0) process.exit(1);
}
