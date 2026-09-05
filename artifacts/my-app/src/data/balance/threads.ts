/**
 * Нити — третий слой силы. Канон: BALANCE_FOUNDATION.md §6.5.
 *
 * Столпы дают СИЛУ (числа растут), ветви дают ВЫГОДУ (фарм быстрее),
 * нити дают ПРАВИЛА — меняют поведение систем. Нить не выдаёт «ещё процентов»:
 * это работа столпов и ветвей.
 *
 * Найденная и исправленная поломка: старые пороги яруса 2 (70/40 = 110 очков)
 * недостижимы никаким билдом, т.к. на 100 уровне очков всего 99.
 */
import type { PillarId } from '../attributes.ts';

export type ThreadTier = 1 | 2 | 3;

/**
 * Пороги по ярусам, в очках столпов пары.
 * При 99 очках игрок держит: одну нить III яруса, либо две II, либо три-четыре I.
 */
export const THREAD_TIER_THRESHOLDS: Record<ThreadTier, { major: number; minor: number }> = {
  1: { major: 25, minor: 15 },
  2: { major: 40, minor: 25 },
  3: { major: 55, minor: 35 },
};

/** Ориентир уровня, на котором ярус становится достижим. Для подсказок в UI. */
export const THREAD_TIER_LEVEL_HINT: Record<ThreadTier, number> = {
  1: 45,
  2: 70,
  3: 95,
};

/**
 * Все пары столпов: C(4,2) = 6.
 * Набор сходится точно: 6 пар × 3 яруса = 18, плюс 3 тройные нити = 21,
 * что равно 6 активным + 15 «скоро», которые уже есть в коде и иконках.
 */
export const PILLAR_PAIRS: readonly (readonly [PillarId, PillarId])[] = [
  ['fortitude', 'might'],
  ['fortitude', 'finesse'],
  ['fortitude', 'instinct'],
  ['might', 'finesse'],
  ['might', 'instinct'],
  ['finesse', 'instinct'],
];

/** Пороги тройной нити (эндгейм): три столпа сразу, каждый по 30. */
export const TRIPLE_THREAD_THRESHOLD = 30;

/** Требования нити по ярусу: major — ведущий столп пары, minor — второй. */
export function thresholdsFor(
  tier: ThreadTier,
  major: PillarId,
  minor: PillarId,
): Partial<Record<PillarId, number>> {
  const t = THREAD_TIER_THRESHOLDS[tier];
  return { [major]: t.major, [minor]: t.minor };
}
