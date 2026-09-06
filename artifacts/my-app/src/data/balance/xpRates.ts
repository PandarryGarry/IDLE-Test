/**
 * Единый пульт опыта героя — как rates.ini у L2: глобальный множитель,
 * источники, оффлайн, ступени. Кривая 1→100 тоже здесь, чтобы темп
 * сервера крутился одним файлом.
 *
 * Утверждено 2026-09-06:
 *   персона «дедикейтед каждый день» = 4 ч онлайн + 12 ч оффлайн @50%
 *     = 10 эфф.ч/день × 30 дней = 300 эфф.ч до 100;
 *   профессии ×0,35 к бою (без энергии, иначе 24/7 съест месяц);
 *   стена 97→100 ≈ 5 дней дедикейтеда;
 *   ступени рейта = 1 — стену не дублируем срезом после 76, как частные L2.
 *
 * 1 эфф.час при global=1 и source.combat=1 = XP_PER_EFFECTIVE_HOUR.
 * Обычный игрок (2 ч онлайн + 8 ч оффлайн @50% = 6 эфф.ч/день) дойдёт
 * примерно за 50 календарных дней.
 *
 * Начисление с тиков ещё не подключено — только таблица, рейты и apply.
 */
import { HERO_LEVEL_CAP } from './substats.ts';
import { HERO_START_LEVEL } from './heroLevel.ts';

export type HeroXpSource = 'combat' | 'dangerous' | 'profession' | 'quest';

/** Сколько XP даёт один эффективный час боя на рейте 1. */
export const XP_PER_EFFECTIVE_HOUR = 1000;

/** Бюджет до 100: 10 эфф.ч/день × 30 дней. */
export const EFFECTIVE_HOURS_TO_CAP = 300;

export const TOTAL_HERO_XP_TO_CAP = 300_000;

/**
 * Крутилки сервера. Меняешь global — весь мир.
 * intuitionPercent сюда не кладём: это стат героя, не рейт сервера.
 */
export const XP_RATES = {
  global: 1,
  source: {
    combat: 1,
    dangerous: 1,
    profession: 0.35,
    quest: 1,
  },
  /** Ночь / вкладка закрыта. Не путать с голодом лута (offline.ts). */
  offline: 0.5,
  /**
   * Ступени как L2 ExpRate после 76. Сейчас все 1: кривая уже задняя.
   * minLevel — включительно, до следующего порога.
   */
  brackets: [
    { minLevel: 1, rate: 1 },
  ],
} as const;

/**
 * XP с уровня N на N+1. Индекс 0 = 1→2. Сумма 300 000.
 *
 * Пояса совпадают с нитями: I ~23, II ~53, III ~88, тройки 97–100.
 * Внутри пояса плата плоская — без пилы на границе.
 */
export const HERO_XP_TO_NEXT: readonly number[] = [
  // 1–9  (9 × 1100)
  1100, 1100, 1100, 1100, 1100, 1100, 1100, 1100, 1100,
  // 10–22 (13 × 1550) → нить I
  1550, 1550, 1550, 1550, 1550, 1550, 1550, 1550, 1550, 1550, 1550, 1550, 1550,
  // 23–52 (30 × 2150) → нить II
  2150, 2150, 2150, 2150, 2150, 2150, 2150, 2150, 2150, 2150,
  2150, 2150, 2150, 2150, 2150, 2150, 2150, 2150, 2150, 2150,
  2150, 2150, 2150, 2150, 2150, 2150, 2150, 2150, 2150, 2150,
  // 53–87 (35 × 2850) → нить III
  2850, 2850, 2850, 2850, 2850, 2850, 2850, 2850, 2850, 2850,
  2850, 2850, 2850, 2850, 2850, 2850, 2850, 2850, 2850, 2850,
  2850, 2850, 2850, 2850, 2850, 2850, 2850, 2850, 2850, 2850,
  2850, 2850, 2850, 2850, 2850,
  // 88–96 (9 × 6100)
  6100, 6100, 6100, 6100, 6100, 6100, 6100, 6100, 6100,
  // 97–99 — стена троек (~5 дней дедикейтеда)
  16800, 16800, 17200,
];

export function xpToNextLevel(heroLevel: number): number {
  const level = Math.floor(heroLevel);
  if (level < HERO_START_LEVEL || level >= HERO_LEVEL_CAP) return 0;
  return HERO_XP_TO_NEXT[level - HERO_START_LEVEL] ?? 0;
}

/** Суммарный XP, чтобы стоять на `heroLevel` с нулём в полосе. */
export function totalXpToReachLevel(heroLevel: number): number {
  const target = Math.min(HERO_LEVEL_CAP, Math.max(HERO_START_LEVEL, Math.floor(heroLevel)));
  let sum = 0;
  for (let lv = HERO_START_LEVEL; lv < target; lv += 1) {
    sum += xpToNextLevel(lv);
  }
  return sum;
}

export function bracketRate(heroLevel: number): number {
  const level = Math.max(HERO_START_LEVEL, Math.floor(heroLevel));
  let rate = 1;
  for (const step of XP_RATES.brackets) {
    if (level >= step.minLevel) rate = step.rate;
  }
  return rate;
}

export function intuitionXpFactor(intuitionPercent: number): number {
  if (!Number.isFinite(intuitionPercent) || intuitionPercent <= 0) return 1;
  return 1 + intuitionPercent / 100;
}

export function heroXpMultiplier(opts: {
  source: HeroXpSource;
  offline?: boolean;
  heroLevel?: number;
  intuitionPercent?: number;
}): number {
  const sourceRate = XP_RATES.source[opts.source];
  const offlineRate = opts.offline ? XP_RATES.offline : 1;
  const levelRate = bracketRate(opts.heroLevel ?? HERO_START_LEVEL);
  return (
    XP_RATES.global
    * sourceRate
    * offlineRate
    * levelRate
    * intuitionXpFactor(opts.intuitionPercent ?? 0)
  );
}

/**
 * База с длительности действия: 1 эфф.секунда боя = XP_PER_EFFECTIVE_HOUR / 3600.
 * Интервалы 3–12 с не ломают час — платим за время, не за тик.
 */
export function heroXpFromAction(opts: {
  durationMs: number;
  source: HeroXpSource;
  offline?: boolean;
  heroLevel?: number;
  intuitionPercent?: number;
}): number {
  const seconds = Math.max(0, opts.durationMs) / 1000;
  const base = seconds * (XP_PER_EFFECTIVE_HOUR / 3600);
  return base * heroXpMultiplier(opts);
}
