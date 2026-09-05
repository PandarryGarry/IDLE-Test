/**
 * Фундамент характеристик. Канон: BALANCE_FOUNDATION.md (утверждён владельцем).
 *
 * Три закона:
 *   1. Стат = вход в формулу. Числа без применения не заводим.
 *   2. У каждого столпа своя зона прогресса — мусорных столпов нет.
 *   3. Три типа чисел: flat (без потолка), rating (асимптота), percent (жёсткий кап).
 *
 * Горизонт: 100 уровень = 99 очков столпов, 20 очков ветвей.
 * Все шаги сверены по контрольным точкам 10 / 40 / 70 очков в один столп.
 */
import type { BranchId, PillarId } from '../../domain/attributes/attributes.ts';

/** Потолок уровня героя. Столпов к нему: 99, ветвей: 20. */
export const HERO_LEVEL_CAP = 100;

/**
 * flat   — линейный рост без потолка. Держит прогресс живым до 100 уровня.
 * rating — линейный рейтинг → % по асимптоте. Потолок недостижим математически.
 * percent— линейный %, упирается в жёсткий кап.
 */
export type SubstatKind = 'flat' | 'rating' | 'percent';

export interface SubstatDef {
  id: BranchId;
  pillar: PillarId;
  kind: SubstatKind;
  /** Значение при 0 очков. Ноль очков не должен выглядеть мёртвым. */
  base: number;
  /** Прирост за 1 очко столпа. */
  perPillar: number;
  /** Асимптота для rating и жёсткий кап для percent. Для flat не задан. */
  cap?: number;
  /** Рейтинг, дающий половину cap. Только для rating. */
  k?: number;
  /** Единица отображения. */
  unit: 'hp' | 'damage' | 'percent';
}

/**
 * Правило фундамента: в каждом столпе обязателен хотя бы один flat без потолка.
 * Он не даёт прогрессу встать, а rating-статы не дают ему сломаться.
 */
export const SUBSTATS: Record<BranchId, SubstatDef> = {
  // ── Стойкость: длительность вылазки ──────────────────────────
  health: {
    id: 'health', pillar: 'fortitude', kind: 'flat',
    base: 120, perPillar: 14, unit: 'hp',
  },
  armor: {
    id: 'armor', pillar: 'fortitude', kind: 'rating',
    base: 10, perPillar: 1.6, cap: 75, k: 80, unit: 'percent',
  },
  will: {
    id: 'will', pillar: 'fortitude', kind: 'rating',
    base: 8, perPillar: 1.2, cap: 70, k: 70, unit: 'percent',
  },

  // ── Мощь: скорость убийства ──────────────────────────────────
  strike: {
    id: 'strike', pillar: 'might', kind: 'flat',
    base: 10, perPillar: 2.2, unit: 'damage',
  },
  onslaught: {
    id: 'onslaught', pillar: 'might', kind: 'rating',
    base: 0, perPillar: 1.0, cap: 60, k: 120, unit: 'percent',
  },
  /** Бывш. «Разрушение». Теперь Пробой: игнор части защиты цели. */
  destruction: {
    id: 'destruction', pillar: 'might', kind: 'rating',
    base: 0, perPillar: 1.4, cap: 70, k: 140, unit: 'percent',
  },

  // ── Сноровка: плотность действий ─────────────────────────────
  /** cap 140 > максимума 137 (99 очков + 14 расы + 24 ветви): потолок недостижим. */
  tempo: {
    id: 'tempo', pillar: 'finesse', kind: 'percent',
    base: 0, perPillar: 0.9, cap: 140, unit: 'percent',
  },
  evasion: {
    id: 'evasion', pillar: 'finesse', kind: 'rating',
    base: 5, perPillar: 1.1, cap: 50, k: 110, unit: 'percent',
  },
  /** Бывш. «Реакция». Теперь Сноровка рук: скорость ремесла. */
  reaction: {
    id: 'reaction', pillar: 'finesse', kind: 'percent',
    base: 0, perPillar: 0.9, cap: 140, unit: 'percent',
  },

  // ── Чутьё: качество результата ───────────────────────────────
  luck: {
    id: 'luck', pillar: 'instinct', kind: 'rating',
    base: 12, perPillar: 1.3, cap: 65, k: 130, unit: 'percent',
  },
  resourcefulness: {
    id: 'resourcefulness', pillar: 'instinct', kind: 'percent',
    base: 0, perPillar: 0.7, cap: 100, unit: 'percent',
  },
  intuition: {
    id: 'intuition', pillar: 'instinct', kind: 'percent',
    base: 0, perPillar: 0.5, cap: 75, unit: 'percent',
  },
};

/**
 * Рейтинг → процент. Единая формула для всех rating-статов.
 * Аналог брони Dota: 0.06A / (1 + 0.06A) — тот же вид при k ≈ 16.7.
 * Процент замедляется, но эффективная выгода (EHP) растёт почти линейно —
 * поэтому мёртвой зоны нет ни на одном уровне до 100.
 */
export function ratingToPercent(rating: number, cap: number, k: number): number {
  const r = Math.max(0, Number.isFinite(rating) ? rating : 0);
  return (cap * r) / (r + k);
}

/**
 * Сложение защит мультипликативно, как резисты Dota: 1 − Π(1 − rᵢ).
 * Гарантирует, что 100% неуязвимости не бывает никогда.
 */
export function stackResistances(...percents: number[]): number {
  const remain = percents.reduce((acc, p) => acc * (1 - Math.max(0, Math.min(100, p)) / 100), 1);
  return (1 - remain) * 100;
}

/**
 * Ветвь идёт вровень со столпом, а не под ним.
 * 1 ранг ветви = 8 очков столпа для своей подхарактеристики.
 * При 20 рангах это ~160 эквивалентных очков против 99 у столпов.
 */
export const BRANCH_RANK_IN_PILLAR_POINTS = 8;

/** Потолок вклада профессии в подхарактеристику, % от значения. */
export const PROFESSION_CONTRIBUTION_CAP = 15;

/** Требования рангов узлов: лимит как цель, а не как стена. */
export const NODE_RANK_REQUIREMENTS: Record<number, number> = {
  1: 0,
  2: 20,
  3: 45,
};
