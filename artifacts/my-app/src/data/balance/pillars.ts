/**
 * Числа столпов. Открытые пункты помечены: не показывать в UI как закон.
 * Кривая ^0.75 — канон контракта.
 */
export const PILLAR_CURVE_EXPONENT = 0.75;

/**
 * Скрытая база тела. % расы считаются от неё, иначе 0 очков = все расы одинаковы.
 * Точная цифра НЕ закрыта владельцем — заглушка 5A.
 */
export const BODY_BASE_STUB = 100;

/** Сколько итоговый столп растёт от одного ранга ветви. Не закрыто. */
export const BRANCH_TO_PILLAR_PER_RANK_STUB = 1;

export const PILLAR_RANK_CAP_STUB = 999;
export const BRANCH_RANK_CAP_STUB = 999;

export function pillarContribution(finalPillar: number): number {
  const ratio = 1 + (Number.isFinite(finalPillar) ? finalPillar : 0) / 100;
  return Math.max(0.01, ratio) ** PILLAR_CURVE_EXPONENT;
}
