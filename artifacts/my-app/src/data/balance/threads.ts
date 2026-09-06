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
import type { PillarId } from '../../domain/attributes/attributes.ts';

export type ThreadTier = 1 | 2 | 3;

/**
 * Пороги по ярусам, в очках столпов пары.
 * При старте 4/3/2/1 и 99 заработанных очках:
 *   I  — ур. 19–23, II — ур. 49–53, III — ур. 84–88 (зависит от расового наклона).
 * При 99 очках игрок держит: одну нить III яруса, либо две II, либо несколько I.
 */
export const THREAD_TIER_THRESHOLDS: Record<ThreadTier, { major: number; minor: number }> = {
  1: { major: 15, minor: 10 },
  2: { major: 35, minor: 20 },
  3: { major: 55, minor: 35 },
};

/** Ориентир уровня, на котором ярус становится достижим. Для подсказок в UI. */
export const THREAD_TIER_LEVEL_HINT: Record<ThreadTier, number> = {
  1: 20,
  2: 50,
  3: 85,
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

/**
 * Пороги тройной нити (эндгейм): три столпа сразу.
 * 35 — максимальный равный порог, который при старте 10 и 99 заработанных
 * очках достижим каждой расой индивидуально (ур. 97–100). Две разные тройные
 * одновременно не собрать: 140 > 109 доступных единиц.
 */
export const TRIPLE_THREAD_THRESHOLD = 35;

/** Требования нити по ярусу: major — ведущий столп пары, minor — второй. */
export function thresholdsFor(
  tier: ThreadTier,
  major: PillarId,
  minor: PillarId,
): Partial<Record<PillarId, number>> {
  const t = THREAD_TIER_THRESHOLDS[tier];
  return { [major]: t.major, [minor]: t.minor };
}
