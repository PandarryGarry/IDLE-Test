// Offline progression calculator
// Simulates ticks that happened while the player was away.
// Rules:
//   - Gathering skills (woodcutting, mining, fishing): full XP + full item grant (no resource cost)
//   - Artisan skills (cooking, smithing, firemaking): XP only — items require resources the
//     player may not have had. Granting output items without consuming inputs would violate
//     game economy integrity, so we skip item grants for these skills offline.
//   - All skills: capped at MAX_OFFLINE_MS.

import type { SkillId } from '../data/types.ts';
import { usePlayerStore } from '../store/playerStore.ts';
import { useBankStore } from '../store/bankStore.ts';
import { useNotificationsStore } from '../store/notificationsStore.ts';
import {
  getActionInterval,
  getXpPerAction,
  isGatheringSkill,
  getGatheringOutputItem,
} from './skillRegistry.ts';
import {
  FORAGING_ZONES_MAP,
  rollOfflineForaging,
  foragingSpeedMultiplier,
} from '../domain/professions/foraging.ts';
import { getAdminRates } from '../store/adminConfigStore.ts';

const MAX_OFFLINE_MS = 24 * 60 * 60 * 1000; // 24 hours cap

/**
 * Оффлайн «Сбора»: только базовая добыча зоны + XP, мобов нет.
 * Использует общие рейты: actionSpeedMultiplier + xpMultiplier.
 */
function calcForagingOffline(actionId: string, offlineMs: number): OfflineResult {
  const zone = FORAGING_ZONES_MAP[actionId];
  if (!zone) return { offlineMs: 0, actions: 0, xpGained: 0, itemsGained: [], levelUps: [] };

  const rates = getAdminRates();
  const level = usePlayerStore.getState().getSkillLevel('foraging');
  const interval = Math.max(
    100,
    Math.round(zone.interval / Math.max(0.01, rates.actionSpeedMultiplier * foragingSpeedMultiplier(level))),
  );
  const totalActions = Math.floor(offlineMs / interval);
  const playerStore = usePlayerStore.getState();
  const bankStore = useBankStore.getState();

  // XP через общий рейт.
  const totalXp = Math.round(zone.xp * rates.xpMultiplier * totalActions);
  const levelUps: { skillId: SkillId; newLevel: number }[] = [];
  if (totalXp > 0) {
    const { leveledUp, newLevel } = playerStore.addXp('foraging', totalXp);
    if (leveledUp) levelUps.push({ skillId: 'foraging', newLevel });
  }

  // Один базовый предмет за каждое действие, с учётом вместимости банка.
  const itemsGained: { itemId: string; quantity: number }[] = [];
  if (totalActions > 0) {
    const perAction = rollOfflineForaging(actionId, level);
    const totalQty = perAction.quantity * totalActions;
    const added = bankStore.addItem(perAction.itemId, totalQty);
    if (added) itemsGained.push({ itemId: perAction.itemId, quantity: totalQty });
  }

  return { offlineMs, actions: totalActions, xpGained: totalXp, itemsGained, levelUps };
}

export interface OfflineResult {
  offlineMs: number;
  actions: number;
  xpGained: number;
  itemsGained: { itemId: string; quantity: number }[];
  levelUps: { skillId: SkillId; newLevel: number }[];
}

export function calculateOfflineProgress(
  skillId: SkillId,
  actionId: string,
  lastSaveTime: number,
): OfflineResult {
  const now = Date.now();
  const rawOfflineMs = now - lastSaveTime;
  const offlineMs = Math.min(rawOfflineMs, MAX_OFFLINE_MS);

  if (offlineMs < 1000 || !skillId || !actionId) {
    return { offlineMs: 0, actions: 0, xpGained: 0, itemsGained: [], levelUps: [] };
  }

  // «Сбор» — упрощённые оффлайн-правила (дизайн §9, вариант A):
  // только базовый предмет зоны + XP, без мобов, редких и x2.
  // Общие рейты (XP и скорость) применяются в т.ч. оффлайн.
  if (skillId === 'foraging') {
    return calcForagingOffline(actionId, offlineMs);
  }

  const interval = getActionInterval(skillId, actionId);
  const xpPerAction = getXpPerAction(skillId, actionId);
  const totalActions = Math.floor(offlineMs / interval);

  if (totalActions === 0) {
    return { offlineMs, actions: 0, xpGained: 0, itemsGained: [], levelUps: [] };
  }

  const playerStore = usePlayerStore.getState();
  const bankStore = useBankStore.getState();
  const notifs = useNotificationsStore.getState();

  const totalXp = xpPerAction * totalActions;
  const levelUps: { skillId: SkillId; newLevel: number }[] = [];
  const itemsGained: { itemId: string; quantity: number }[] = [];

  // Apply XP (both gathering and artisan)
  if (totalXp > 0) {
    const { leveledUp, newLevel } = playerStore.addXp(skillId, totalXp);
    if (leveledUp) levelUps.push({ skillId, newLevel });
  }

  // Apply items — gathering only, respecting bank capacity
  if (isGatheringSkill(skillId)) {
    const itemPerAction = getGatheringOutputItem(skillId, actionId);
    if (itemPerAction && itemPerAction.qty > 0) {
      const totalQty = itemPerAction.qty * totalActions;
      const added = bankStore.addItem(itemPerAction.itemId, totalQty);
      if (added) {
        itemsGained.push({ itemId: itemPerAction.itemId, quantity: totalQty });
      }
    }
  }

  // Notification removed — Dashboard shows offline summary instead

  return { offlineMs, actions: totalActions, xpGained: totalXp, itemsGained, levelUps };
}

function formatOfflineTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
