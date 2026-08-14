// Offline progression calculator
// Simulates ticks that happened while the player was away.
// Rules:
//   - Gathering skills (woodcutting, mining, fishing): full XP + full item grant (no resource cost)
//   - Artisan skills (cooking, smithing, firemaking): XP only — items require resources the
//     player may not have had. Granting output items without consuming inputs would violate
//     game economy integrity, so we skip item grants for these skills offline.
//   - Gathering skills with stockLimit/respawnMs: simulate harvest → deplete → respawn → harvest cycles.
//   - All skills: capped at MAX_OFFLINE_MS.

import type { SkillId } from '../data/types';
import { WOODCUTTING_TREES_MAP } from '../data/woodcutting';
import { MINING_ROCKS_MAP } from '../data/mining';
import { FISHING_SPOTS_MAP } from '../data/fishing';
import { usePlayerStore } from '../store/playerStore';
import { useBankStore } from '../store/bankStore';
import { useNotificationsStore } from '../store/notificationsStore';
import { useResourceStore } from '../store/resourceStore';
import {
  getActionInterval,
  getXpPerAction,
  isGatheringSkill,
  getGatheringOutputItem,
} from './skillRegistry';

const MAX_OFFLINE_MS = 24 * 60 * 60 * 1000; // 24 hours cap

export interface OfflineResult {
  offlineMs: number;
  actions: number;
  xpGained: number;
  itemsGained: { itemId: string; quantity: number }[];
  levelUps: { skillId: SkillId; newLevel: number }[];
}

// ── Получение лимитов ноды (gathering skills only) ──

function getNodeLimits(actionId: string): { stockLimit?: number; respawnMs?: number } | null {
  const action = WOODCUTTING_TREES_MAP[actionId]
    ?? MINING_ROCKS_MAP[actionId]
    ?? FISHING_SPOTS_MAP[actionId];
  if (!action) return null;
  return { stockLimit: action.stockLimit, respawnMs: action.respawnMs };
}

// ── Симуляция циклов добычи/восстановления ──

interface CycleResult {
  actionsDone: number;
  // Состояние ноды после симуляции
  harvested: number;
  depletedAt: number | null;
}

function simulateCycles(
  offlineMs: number,
  interval: number,
  stockLimit: number,
  respawnMs: number,
): CycleResult {
  const harvestPhaseMs = stockLimit * interval;
  const cycleDuration = harvestPhaseMs + respawnMs;

  // Полные циклы "добыча+респаун"
  const fullCycles = Math.floor(offlineMs / cycleDuration);
  const remainingMs = offlineMs - fullCycles * cycleDuration;

  let actionsInLastCycle: number;
  let harvested: number;
  let depletedAt: number | null = null;

  if (remainingMs < harvestPhaseMs) {
    // Не полностью сфармили в последнем цикле — нода НЕ истощена
    actionsInLastCycle = Math.floor(remainingMs / interval);
    harvested = actionsInLastCycle;
  } else {
    // Полностью сфармили, сейчас в фазе респауна — нода ИСТОЩЕНА
    actionsInLastCycle = stockLimit;
    harvested = stockLimit;
    // depletedAt = момент когда нода истощилась = now - (время в респауне)
    const timeInRespawn = remainingMs - harvestPhaseMs;
    depletedAt = Date.now() - timeInRespawn;
  }

  return {
    actionsDone: fullCycles * stockLimit + actionsInLastCycle,
    harvested,
    depletedAt,
  };
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
  const xpPerAction = getXpPerAction(skillId, actionId);

  const playerStore = usePlayerStore.getState();
  const bankStore = useBankStore.getState();
  const notifs = useNotificationsStore.getState();
  const resourceStore = useResourceStore.getState();

  const levelUps: { skillId: SkillId; newLevel: number }[] = [];
  const itemsGained: { itemId: string; quantity: number }[] = [];

  let totalActions: number;

  // Gathering skill с лимитами? → используем симуляцию циклов
  const isGathering = isGatheringSkill(skillId);
  const limits = getNodeLimits(actionId);

  if (isGathering && limits?.stockLimit && limits?.respawnMs) {
    const cycleResult = simulateCycles(
      offlineMs, interval, limits.stockLimit, limits.respawnMs
    );
    totalActions = cycleResult.actionsDone;

    // Обновляем состояние ноды в resourceStore
    resourceStore.setNodeState(actionId, {
      harvested: cycleResult.harvested,
      depletedAt: cycleResult.depletedAt,
    });
  } else {
    // Старая логика: без лимитов
    totalActions = Math.floor(offlineMs / interval);
  }

  if (totalActions === 0) {
    return { offlineMs, actions: 0, xpGained: 0, itemsGained: [], levelUps: [] };
  }

  const totalXp = xpPerAction * totalActions;

  // Apply XP (both gathering and artisan)
  if (totalXp > 0) {
    const { leveledUp, newLevel } = playerStore.addXp(skillId, totalXp);
    if (leveledUp) levelUps.push({ skillId, newLevel });
  }

  // Apply items — gathering only, respecting bank capacity
  if (isGathering) {
    const itemPerAction = getGatheringOutputItem(skillId, actionId);
    if (itemPerAction && itemPerAction.qty > 0) {
      const totalQty = itemPerAction.qty * totalActions;
      const added = bankStore.addItem(itemPerAction.itemId, totalQty);
      if (added) {
        itemsGained.push({ itemId: itemPerAction.itemId, quantity: totalQty });
      }
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
