/**
 * Лист «Путь»: какие числа на дощечках, какие в списке снизу.
 * Диапазон удара — balance/strikeRange.ts. «Крит» не показываем как
 * отдельный стат, пока новая боёвка не утвердит формулу от Удачи.
 */
import {
  PILLAR_IDS,
  SUBSTATS_BY_PILLAR,
  type BranchId,
  type PillarId,
} from '@/domain/attributes/attributes';

export { formatStrikeRange, strikeRange, STRIKE_RANGE_FRACTION } from '@/data/balance/strikeRange';

/** Главные финальные числа: это не все 12, а верхняя сводка листа. */
export const PATH_PLAQUE_SUBSTATS: readonly BranchId[] = [
  'health', 'strike', 'armor', 'tempo', 'evasion', 'luck',
];

/** Все 12 тела, пачками столпа — столп как разделитель под дощечками. */
export const PATH_SHEET_BY_PILLAR: readonly { pillar: PillarId; stats: readonly BranchId[] }[] =
  PILLAR_IDS.map(pillar => ({
    pillar,
    stats: SUBSTATS_BY_PILLAR[pillar],
  }));
