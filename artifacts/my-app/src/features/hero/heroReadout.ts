/**
 * Каркас листа «Путь»: шесть дощечек.
 * Удар-диапазон и крит — заглушки до боя. Не класть в balance/, пока нет формулы.
 */

/** Пока нет оружия: диапазон вокруг «Удара», ±2. Человек 1 ур. → 12–16. */
export const STRIKE_RANGE_STUB_SPREAD = 2;

/** Шанс крита, пока нет стата в калькуляторе. */
export const CRIT_CHANCE_STUB = 5;

export function strikeRangeDisplay(strike: number): { min: number; max: number } {
  const mid = Math.max(1, Math.round(Number.isFinite(strike) ? strike : 0));
  return {
    min: Math.max(1, mid - STRIKE_RANGE_STUB_SPREAD),
    max: mid + STRIKE_RANGE_STUB_SPREAD,
  };
}

export function formatStrikeRange(strike: number): string {
  const { min, max } = strikeRangeDisplay(strike);
  return `${min}–${max}`;
}
