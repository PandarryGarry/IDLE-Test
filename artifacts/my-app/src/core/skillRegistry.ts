import type { SkillId } from '../data/types.ts';
import {
  FORAGING_ZONES_MAP,
  rollForagingCycle,
  foragingSpeedMultiplier,
} from '../domain/professions/foraging.ts';
import { usePlayerStore } from '../store/playerStore.ts';

export interface ActionResult {
  items: { itemId: string; quantity: number }[];
  xpGained: number;
  masteryXpGained: number;
  bonusXp?: number;
  preserved?: boolean;
  /** Встреча с мобом во время «Сбора» (обрабатывается игровым циклом). */
  encounter?: { areaId: string; monsterId: string; boss: boolean };
}

export interface SkillHandler {
  process: (actionId: string) => ActionResult | null;
  getInterval: (actionId: string) => number;
  getXpPerAction: (actionId: string) => number;
  isGathering: boolean; // true for gathering skills, false for artisan
  getOutputItem?: (actionId: string) => { itemId: string; qty: number } | null;
}

/**
 * Централизованный реестр навыков.
 * После чистки легаси остался единственный реализованный навык — «Сбор».
 */
export const skillRegistry: Record<SkillId, SkillHandler | null> = {
  foraging: {
    isGathering: true,
    process: (actionId) => {
      const zone = FORAGING_ZONES_MAP[actionId];
      if (!zone) return null;
      const playerLevel = usePlayerStore.getState().getSkillLevel('foraging');
      if (playerLevel < zone.levelRequired) return null;
      const result = rollForagingCycle(actionId, playerLevel);
      return {
        items: result.items,
        xpGained: result.xp,
        masteryXpGained: result.masteryXp,
        encounter: result.encounter ?? undefined,
      };
    },
    getInterval: (actionId) => {
      const zone = FORAGING_ZONES_MAP[actionId];
      const base = zone?.interval ?? 4000;
      const playerLevel = usePlayerStore.getState().getSkillLevel('foraging');
      return Math.round(base / Math.max(0.01, foragingSpeedMultiplier(playerLevel)));
    },
    getXpPerAction: (actionId) => FORAGING_ZONES_MAP[actionId]?.xp ?? 0,
    getOutputItem: (actionId) => {
      const zone = FORAGING_ZONES_MAP[actionId];
      const first = zone?.lootTable[0];
      return zone && first ? { itemId: first.itemId, qty: first.quantity[0] } : null;
    },
  },
};

/** Обрабатывает действие для указанного скилла. */
export function processAction(skillId: SkillId, actionId: string): ActionResult | null {
  const handler = skillRegistry[skillId];
  if (!handler) return null;
  return handler.process(actionId);
}

/** Возвращает интервал действия в миллисекундах. */
export function getActionInterval(skillId: SkillId, actionId: string): number {
  const handler = skillRegistry[skillId];
  if (!handler) return 3000;
  return handler.getInterval(actionId);
}

/** Возвращает XP за одно действие. */
export function getXpPerAction(skillId: SkillId, actionId: string): number {
  const handler = skillRegistry[skillId];
  if (!handler) return 0;
  return handler.getXpPerAction(actionId);
}

/** Проверяет, является ли скилл gathering (дает items оффлайн). */
export function isGatheringSkill(skillId: SkillId): boolean {
  const handler = skillRegistry[skillId];
  return handler?.isGathering ?? false;
}

/** Возвращает output item для gathering скилла. */
export function getGatheringOutputItem(skillId: SkillId, actionId: string): { itemId: string; qty: number } | null {
  const handler = skillRegistry[skillId];
  if (!handler?.isGathering || !handler.getOutputItem) return null;
  return handler.getOutputItem(actionId);
}

