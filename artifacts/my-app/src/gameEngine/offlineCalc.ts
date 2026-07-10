// Offline progression calculator
// Simulates ticks that happened while the player was away.
// Rules:
//   - Gathering skills (woodcutting, mining, fishing): full XP + full item grant (no resource cost)
//   - Artisan skills (cooking, smithing, firemaking): XP only — items require resources the
//     player may not have had. Granting output items without consuming inputs would violate
//     game economy integrity, so we skip item grants for these skills offline.
//   - All skills: capped at MAX_OFFLINE_MS.

import type { SkillId } from '../data/types';
import { WOODCUTTING_TREES_MAP } from '../data/woodcutting';
import { MINING_ROCKS_MAP } from '../data/mining';
import { FISHING_SPOTS_MAP } from '../data/fishing';
import { COOKING_RECIPES_MAP } from '../data/cooking';
import { SMITHING_MAP } from '../data/smithing';
import { FIREMAKING_MAP } from '../data/firemaking';
import { usePlayerStore } from '../store/playerStore';
import { useBankStore } from '../store/bankStore';
import { useNotificationsStore } from '../store/notificationsStore';

/** Gathering skills give both XP and items offline */
const GATHERING_SKILLS = new Set<SkillId>(['woodcutting', 'mining', 'fishing']);

const MAX_OFFLINE_MS = 24 * 60 * 60 * 1000; // 24 hours cap

export interface OfflineResult {
  offlineMs: number;
  actions: number;
  xpGained: number;
  itemsGained: { itemId: string; quantity: number }[];
  levelUps: { skillId: SkillId; newLevel: number }[];
}

function getActionInterval(skillId: SkillId, actionId: string): number {
  switch (skillId) {
    case 'woodcutting': return WOODCUTTING_TREES_MAP[actionId]?.interval ?? 3000;
    case 'mining':      return MINING_ROCKS_MAP[actionId]?.interval ?? 3000;
    case 'fishing':     return FISHING_SPOTS_MAP[actionId]?.interval ?? 7000;
    case 'cooking':     return COOKING_RECIPES_MAP[actionId]?.interval ?? 3000;
    case 'smithing':    return SMITHING_MAP[actionId]?.interval ?? 3000;
    case 'firemaking':  return FIREMAKING_MAP[actionId]?.interval ?? 3000;
    default: return 3000;
  }
}

function getActionXp(skillId: SkillId, actionId: string): number {
  switch (skillId) {
    case 'woodcutting': return WOODCUTTING_TREES_MAP[actionId]?.xp ?? 0;
    case 'mining':      return MINING_ROCKS_MAP[actionId]?.xp ?? 0;
    case 'fishing':     return FISHING_SPOTS_MAP[actionId]?.xp ?? 0;
    case 'cooking':     return COOKING_RECIPES_MAP[actionId]?.xp ?? 0;
    case 'smithing':    return SMITHING_MAP[actionId]?.xp ?? 0;
    case 'firemaking':  return FIREMAKING_MAP[actionId]?.xp ?? 0;
    default: return 0;
  }
}

/** Returns the primary output item for gathering skills only. Returns null for artisan skills. */
function getGatheringItem(skillId: SkillId, actionId: string): { itemId: string; qty: number } | null {
  if (!GATHERING_SKILLS.has(skillId)) return null;
  switch (skillId) {
    case 'woodcutting': {
      const t = WOODCUTTING_TREES_MAP[actionId];
      return t ? { itemId: t.logId, qty: 1 } : null;
    }
    case 'mining': {
      const r = MINING_ROCKS_MAP[actionId];
      return r ? { itemId: r.oreId, qty: 1 } : null;
    }
    case 'fishing': {
      const s = FISHING_SPOTS_MAP[actionId];
      return s ? { itemId: s.fishId, qty: 1 } : null;
    }
    default: return null;
  }
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

  const interval = getActionInterval(skillId, actionId);
  const xpPerAction = getActionXp(skillId, actionId);
  const itemPerAction = getGatheringItem(skillId, actionId); // null for artisan skills
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
  if (itemPerAction && itemPerAction.qty > 0) {
    const totalQty = itemPerAction.qty * totalActions;
    const added = bankStore.addItem(itemPerAction.itemId, totalQty);
    if (added) {
      itemsGained.push({ itemId: itemPerAction.itemId, quantity: totalQty });
    }
  }

  notifs.notifyInfo(
    `Welcome back! Away for ${formatOfflineTime(offlineMs)}. ` +
    `+${Math.floor(totalXp).toLocaleString()} ${skillId} XP.`
  );

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
