/**
 * Лист «Путь»: какие числа на дощечках, какие в списке снизу.
 * Диапазон удара — balance/strikeRange.ts. Крит — заглушка до боя.
 */
import type { BranchId } from '@/domain/attributes/attributes';

export { formatStrikeRange, strikeRange, STRIKE_RANGE_FRACTION } from '@/data/balance/strikeRange';

/** Шанс крита, пока нет стата в калькуляторе. */
export const CRIT_CHANCE_STUB = 5;

/** На дощечках. Крит — не подхарактеристика. */
export const PATH_PLAQUE_SUBSTATS: readonly BranchId[] = [
  'health', 'strike', 'armor', 'evasion', 'luck',
];

/** Под дощечками — остальные 7 из 12. */
export const PATH_REST_SUBSTATS: readonly BranchId[] = [
  'will', 'onslaught', 'destruction', 'tempo', 'reaction', 'resourcefulness', 'intuition',
];
