/**
 * Показ диапазона удара на листе «Путь».
 * В бой и тики не входит: когда появится оружие, оно станет базой min/max,
 * а Удар добавится плоско. Пока базы нет — разброс от самого Удара.
 *
 * ±2 было «фиксированным числом»: на старте 12–16, на 70 очках 162–166.
 * Доля от Удара растёт вместе с героем.
 */
export const STRIKE_RANGE_FRACTION = 0.15;

export function strikeRange(strike: number): { min: number; max: number } {
  const mid = Math.max(0, Number.isFinite(strike) ? strike : 0);
  const span = Math.max(1, mid * STRIKE_RANGE_FRACTION);
  const min = Math.max(1, Math.floor(mid - span));
  const max = Math.max(min + 1, Math.ceil(mid + span));
  return { min, max };
}

export function formatStrikeRange(strike: number): string {
  const { min, max } = strikeRange(strike);
  return `${min}–${max}`;
}
