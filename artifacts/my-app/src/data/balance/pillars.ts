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

/** Ветка-пассивка столп больше не качает. Оставлен 0, чтобы старые сейвы не кормили итог. */
export const BRANCH_TO_PILLAR_PER_RANK_STUB = 0;

/**
 * Пока отдельные веса не закрыты: 1 к итогу столпа = +1 каждой его подхарактеристике.
 * Не показывать в UI как закон баланса.
 */
export const SUBSTAT_PER_PILLAR_POINT_STUB = 1;

export const PILLAR_RANK_CAP_STUB = 999;
export const BRANCH_RANK_CAP_STUB = 999;

export function pillarContribution(finalPillar: number): number {
  const ratio = 1 + (Number.isFinite(finalPillar) ? finalPillar : 0) / 100;
  return Math.max(0.01, ratio) ** PILLAR_CURVE_EXPONENT;
}
