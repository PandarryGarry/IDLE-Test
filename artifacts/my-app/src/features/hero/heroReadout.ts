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

/** Под дощечками — остальные 7 из 12. */
export const PATH_REST_SUBSTATS: readonly BranchId[] = [
  'will', 'onslaught', 'destruction', 'tempo', 'reaction', 'resourcefulness', 'intuition',
];

/** Те же 7, но пачками столпа — столп как разделитель на листе. */
export const PATH_REST_BY_PILLAR: readonly { pillar: PillarId; stats: readonly BranchId[] }[] =
  PILLAR_IDS
    .map(pillar => ({
      pillar,
      stats: SUBSTATS_BY_PILLAR[pillar].filter(id => PATH_REST_SUBSTATS.includes(id)),
    }))
    .filter(group => group.stats.length > 0);
