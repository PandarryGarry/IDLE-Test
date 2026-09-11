// Offline progression calculator
// Активный навык только один — «Сбор». Оффлайн считаем упрощённо:
// базовый предмет зоны + XP, без мобов, редких и x2.
// Следующие навыки (если появятся) добавят свои ветки здесь.

import type { SkillId } from '../data/types.ts';
import { usePlayerStore } from '../store/playerStore.ts';
import { useInventoryStore } from '../store/inventoryStore.ts';
import {
  FORAGING_ZONES_MAP,
  rollOfflineForaging,
  foragingSpeedMultiplier,
} from '../domain/professions/foraging.ts';
import { getAdminRates } from '../store/adminConfigStore.ts';
import { useSettingsStore } from '../store/settingsStore.ts';
import {
  OFFLINE_MAX_HOURS_DEFAULT,
  OFFLINE_MAX_HOURS_MIN,
  OFFLINE_MAX_HOURS_MAX,
  OFFLINE_MIN_MS,
} from '../data/balance/offline.ts';
import { ACTION_MIN_INTERVAL_MS } from '../data/balance/loop.ts';

/**
 * Потолок оффлайна. Раньше был жёсткой константой на 24 ч, и настройка
 * «Максимум часов вне игры» в Settings ничего не делала. Теперь настройка
 * управляет, но в разрешённом балансом коридоре (защита от 0 и от 9999).
 */
function offlineCapMs(): number {
  let hours = OFFLINE_MAX_HOURS_DEFAULT;
  try {
    const raw = useSettingsStore.getState().maxOfflineHours;
    if (Number.isFinite(raw)) hours = Math.floor(raw);
  } catch {
    // стор ещё не гидратирован — считаем дефолт
  }
  const clamped = Math.min(OFFLINE_MAX_HOURS_MAX, Math.max(OFFLINE_MAX_HOURS_MIN, hours));
  return clamped * 60 * 60 * 1000;
}

interface OfflineResult {
  offlineMs: number;
  actions: number;
  xpGained: number;
  itemsGained: { itemId: string; quantity: number }[];
  levelUps: { skillId: SkillId; newLevel: number }[];
}

/** Оффлайн «Сбора»: только базовая добыча зоны + XP, мобов нет. */
function calcForagingOffline(actionId: string, offlineMs: number): OfflineResult {
  const zone = FORAGING_ZONES_MAP[actionId];
  if (!zone) return { offlineMs: 0, actions: 0, xpGained: 0, itemsGained: [], levelUps: [] };

  const rates = getAdminRates();
  const level = usePlayerStore.getState().getSkillLevel('foraging');
  const interval = Math.max(
    ACTION_MIN_INTERVAL_MS,
    Math.round(zone.interval / Math.max(0.01, rates.actionSpeedMultiplier * foragingSpeedMultiplier(level))),
  );
  const totalActions = Math.floor(offlineMs / interval);
  const playerStore = usePlayerStore.getState();
  const inventory = useInventoryStore.getState();

  const totalXp = Math.round(zone.xp * rates.xpMultiplier * totalActions);
  const levelUps: { skillId: SkillId; newLevel: number }[] = [];
  if (totalXp > 0) {
    const { leveledUp, newLevel } = playerStore.addXp('foraging', totalXp);
    if (leveledUp) levelUps.push({ skillId: 'foraging', newLevel });
  }

  const itemsGained: { itemId: string; quantity: number }[] = [];
  if (totalActions > 0) {
    const perAction = rollOfflineForaging(actionId, level);
    const totalQty = perAction.quantity * totalActions;
    const added = inventory.addItem(perAction.itemId, totalQty);
    if (added) itemsGained.push({ itemId: perAction.itemId, quantity: totalQty });
  }

  return { offlineMs, actions: totalActions, xpGained: totalXp, itemsGained, levelUps };
}

export function calculateOfflineProgress(
  skillId: SkillId,
  actionId: string,
  lastSaveTime: number,
): OfflineResult {
  const now = Date.now();
  const rawOfflineMs = now - lastSaveTime;
  const offlineMs = Math.min(rawOfflineMs, offlineCapMs());

  if (offlineMs < OFFLINE_MIN_MS || !skillId || !actionId) {
    return { offlineMs: 0, actions: 0, xpGained: 0, itemsGained: [], levelUps: [] };
  }

  if (skillId === 'foraging') {
    return calcForagingOffline(actionId, offlineMs);
  }

  return { offlineMs: 0, actions: 0, xpGained: 0, itemsGained: [], levelUps: [] };
}
