/**
 * Лист «Путь»: какие числа на дощечках, какие в списке снизу.
 * Диапазон удара — balance/strikeRange.ts. Крит — заглушка до боя.
 */
import {
  PILLAR_IDS,
  SUBSTATS_BY_PILLAR,
  type BranchId,
  type PillarId,
} from '@/domain/attributes/attributes';

export { formatStrikeRange, strikeRange, STRIKE_RANGE_FRACTION } from '@/data/balance/strikeRange';

/** Шанс крита, пока нет стата в калькуляторе. */
export const CRIT_CHANCE_STUB = 5;

/** На дощечках. Крит — не подхарактеристика. */
export const PATH_PLAQUE_SUBSTATS: readonly BranchId[] = [
  'health', 'strike', 'armor', 'evasion', 'luck',
];

/** Все 12 тела, пачками столпа — столп как разделитель под дощечками. */
export const PATH_SHEET_BY_PILLAR: readonly { pillar: PillarId; stats: readonly BranchId[] }[] =
  PILLAR_IDS.map(pillar => ({
    pillar,
    stats: SUBSTATS_BY_PILLAR[pillar],
  }));
