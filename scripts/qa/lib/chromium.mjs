/**
 * Запуск headless Chromium в песочнице Arena.
 * Канон: npm-пакет @sparticuz/chromium + nss из al2023.tar.br.
 * См. scripts/qa/README.md.
 */
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { qaConfig } from './env.mjs';

const LIB_DIR = '/tmp/al2023/lib';
const FONT_DIR = '/tmp/fonts';
const BIN = '/tmp/chromium';

export async function launchBrowser(options = {}) {
  const { browserDir } = qaConfig();
  const pkgJson = join(browserDir, 'package.json');
  if (!existsSync(pkgJson)) {
    throw new Error(
      `Браузер не установлен (${browserDir}). Сначала: node scripts/qa/setup-browser.mjs`,
    );
  }
  const require = createRequire(pkgJson);
  const puppeteer = require('puppeteer-core');
  const chromiumMod = require('@sparticuz/chromium');
  const chromium = chromiumMod.default ?? chromiumMod;

  if (!existsSync(join(LIB_DIR, 'libnss3.so'))) {
    throw new Error('Нет /tmp/al2023/lib/libnss3.so. Снова: node scripts/qa/setup-browser.mjs');
  }

  const executablePath = existsSync(BIN) ? BIN : await chromium.executablePath();
  const viewport = options.viewport || { width: 390, height: 844, deviceScaleFactor: 2 };

  return puppeteer.launch({
    executablePath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--font-render-hinting=none',
      '--single-process',
      '--no-zygote',
    ],
    defaultViewport: viewport,
    env: {
      ...process.env,
      LD_LIBRARY_PATH: [LIB_DIR, process.env.LD_LIBRARY_PATH].filter(Boolean).join(':'),
      FONTCONFIG_PATH: FONT_DIR,
    },
  });
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Пролог уже видели + «Что нового» закрыто — сразу вывеска/auth. */
export async function skipOnboardingStorage(page, { prologueSeen = true } = {}) {
  await page.evaluateOnNewDocument((seen) => {
    try {
      if (seen) localStorage.setItem('aethelia_prologue_seen_v1', '1');
      else localStorage.removeItem('aethelia_prologue_seen_v1');
      localStorage.setItem('aethelia_last_seen_version', '0.2.0');
    } catch {
      /* private mode */
    }
  }, prologueSeen);
}

export function pageHasForbiddenLoader(text) {
  return /Aethelia\s*Загрузка/i.test(text) || /Aethelia[\s\S]{0,80}Загрузка\.\.\./.test(text);
}

export async function skipStoryIfAny(page, timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const skip = await page.$('.story-scene__skip');
    if (skip) {
      await skip.click().catch(() => {});
      await sleep(400);
      continue;
    }
    const next = await page.$('.story-scene--ready .story-scene__next');
    if (next) {
      await next.click().catch(() => {});
      await sleep(400);
      continue;
    }
    const scene = await page.$('.story-scene');
    if (!scene) return;
    await sleep(200);
  }
}

export async function waitPastSplash(page, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const splash = await page.$('.splash-root');
    const sign = await page.$('.sign-intro');
    if (!splash && !sign) return;
    await sleep(200);
  }
  throw new Error(`вывеска/акт 0 не ушли за ${timeoutMs}ms`);
}
