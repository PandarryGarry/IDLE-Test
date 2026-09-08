import type { BranchId, PillarId } from '../../domain/attributes/attributes.ts';

/**
 * Профессия = ремесло. Ярлыка «Охотник» нет.
 * После раунда 6 в игре одна профессия — «Сбор»; легаси-профессии удалены.
 * Точные % НЕ закрыты — в 5A только карта «кого кормит», бонус 0.
 */
export interface ProfessionFeed {
  skillId: string;
  pillar: PillarId;
  branch: BranchId;
  /** Заглушка. Не показывать игроку как закон. */
  percentCapStub: 0;
  /** % бонуса столпа за 1 уровень профессии. 0 = выключено. */
  percentPerLevel?: number;
  /** Потолок бонуса столпа в %. */
  percentCap?: number;
}

export const PROFESSION_FEEDS: readonly ProfessionFeed[] = [
  { skillId: 'foraging', pillar: 'instinct', branch: 'resourcefulness', percentCapStub: 0 },
];
