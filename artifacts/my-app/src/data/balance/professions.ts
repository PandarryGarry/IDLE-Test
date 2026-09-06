import type { BranchId, PillarId } from '../../domain/attributes/attributes.ts';

/**
 * Профессия = ремесло. Ярлыка «Охотник» нет.
 * Точные % НЕ закрыты — в 5A только карта «кого кормит», бонус 0.
 */
export interface ProfessionFeed {
  skillId: string;
  pillar: PillarId;
  branch: BranchId;
  /** Заглушка. Не показывать игроку как закон. */
  percentCapStub: 0;
}

export const PROFESSION_FEEDS: readonly ProfessionFeed[] = [
  { skillId: 'woodcutting', pillar: 'fortitude', branch: 'will', percentCapStub: 0 },
  { skillId: 'mining', pillar: 'fortitude', branch: 'armor', percentCapStub: 0 },
  { skillId: 'fishing', pillar: 'instinct', branch: 'luck', percentCapStub: 0 },
  { skillId: 'cooking', pillar: 'instinct', branch: 'resourcefulness', percentCapStub: 0 },
  { skillId: 'smithing', pillar: 'might', branch: 'strike', percentCapStub: 0 },
  { skillId: 'firemaking', pillar: 'finesse', branch: 'reaction', percentCapStub: 0 },
];
