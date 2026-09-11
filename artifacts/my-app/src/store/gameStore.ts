import { create } from 'zustand';
import type { SkillId, GameMode } from '@/data/types';
import {
  FORAGING_ZONES_MAP,
  rollForagingCycle,
  foragingSpeedMultiplier,
} from '@/domain/professions/foraging';
import { useForagingStore } from '@/store/foragingStore';
import { usePlayerStore } from '@/store/playerStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useCombatStore } from '@/store/combatStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { getItem } from '@/domain/items';
import { MONSTERS_MAP } from '@/domain/combat/monsters';
import { useAuthStore } from '@/store/authStore';
import { isSkillAllowedForGuest, GUEST_NOTICE } from '@/lib/guestMode';
import {
  getAdminRates,
  isSkillEnabledForAdmin,
  type AdminSkillToggle,
} from '@/store/adminConfigStore';

export interface ActionResult {
  items: { itemId: string; quantity: number }[];
  /** Редкие находки цикла — для тостов уровня 2 (аудит, шаг 11). */
  rareFinds?: { itemId: string; quantity: number }[];
  xpGained: number;
  masteryXpGained: number;
  bonusXp?: number;
  preserved?: boolean;
  /** Встреча с мобом во время «Сбора» — запускает бой. */
  encounter?: { areaId: string; monsterId: string; boss: boolean };
}

export interface OfflineReward {
  icon: string;
  skill: string;
  xp: number;
  items?: string;
}

export interface OfflineData {
  totalMinutes: number;
  rewards: OfflineReward[];
  goldEarned: number;
}

export interface GameStore {
  activeSkill: SkillId | null;
  activeActionId: string | null;
  actionProgress: number;
  actionStartTime: number;
  nextActionTime: number;
  currentActionInterval: number;

  gameMode: GameMode;
  totalPlayTime: number;
  sessionStartTime: number;
  lastSaveTime: number;
  isRunning: boolean;
  isPaused: boolean;

  xpGainedThisSession: Partial<Record<SkillId, number>>;

  offlineData: OfflineData | null;
  clearOfflineData: () => void;

  startSkillAction: (skillId: SkillId, actionId: string) => boolean;
  stopAction: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  tick: (now: number) => void;
  setGameMode: (mode: GameMode) => void;
  reset: () => void;
  loadFromSave: (data: Partial<GameStore>) => void;
}

// ── Processors ────────────────────────────────────────────────

function processForaging(actionId: string): ActionResult | null {
  const zone = FORAGING_ZONES_MAP[actionId];
  if (!zone) return null;
  const playerLevel = usePlayerStore.getState().getSkillLevel('foraging');
  if (playerLevel < zone.levelRequired) return null;
  const result = rollForagingCycle(actionId, playerLevel);
  return {
    items: result.items,
    rareFinds: result.rareFinds.length ? result.rareFinds : undefined,
    xpGained: result.xp,
    masteryXpGained: result.masteryXp,
    encounter: result.encounter ?? undefined,
  };
}

function processAction(skillId: SkillId, actionId: string): ActionResult | null {
  if (skillId === 'foraging') return processForaging(actionId);
  return null;
}

function getActionInterval(skillId: SkillId, actionId: string): number {
  let base = 3000;
  if (skillId === 'foraging') {
    base = Math.round((FORAGING_ZONES_MAP[actionId]?.interval ?? 4000) / Math.max(0.01, foragingSpeedMultiplier(usePlayerStore.getState().getSkillLevel('foraging'))));
  }
  const speed = getAdminRates().actionSpeedMultiplier;
  if (speed <= 0) return base;
  return Math.max(100, Math.round(base / speed));
}

type AdminGatheringToggle = Exclude<AdminSkillToggle, 'combat'>;

/** Навыки, доступные в тумблерах админки. */
function isAdminSkill(skillId: SkillId): skillId is AdminGatheringToggle {
  return skillId === 'foraging';
}

export const useGameStore = create<GameStore>((set, get) => ({
  activeSkill: null,
  activeActionId: null,
  actionProgress: 0,
  actionStartTime: 0,
  nextActionTime: 0,
  currentActionInterval: 3000,
  gameMode: 'standard',
  totalPlayTime: 0,
  sessionStartTime: Date.now(),
  lastSaveTime: Date.now(),
  isRunning: false,
  isPaused: false,
  xpGainedThisSession: {},
  offlineData: null,
  clearOfflineData: () => set({ offlineData: null }),

  startSkillAction: (skillId, actionId) => {
    if (isAdminSkill(skillId) && !isSkillEnabledForAdmin(skillId)) {
      useNotificationsStore.getState().notifyInfo('Этот навык отключён в настройках игры.');
      return false;
    }

    if (useAuthStore.getState().isGuest && !isSkillAllowedForGuest(skillId)) {
      useNotificationsStore.getState().notifyInfo(GUEST_NOTICE);
      return false;
    }

    const interval = getActionInterval(skillId, actionId);
    const now = performance.now();
    set({
      activeSkill: skillId,
      activeActionId: actionId,
      actionProgress: 0,
      actionStartTime: now,
      nextActionTime: now + interval,
      currentActionInterval: interval,
      isRunning: true,
      isPaused: false,
    });
    return true;
  },

  stopAction: () => {
    if (get().activeSkill === 'foraging') {
      useForagingStore.setState({ activeZoneId: null });
    }
    set({
      activeSkill: null,
      activeActionId: null,
      actionProgress: 0,
      isRunning: false,
    });
  },

  pauseGame: () => set({ isPaused: true }),
  resumeGame: () => set({ isPaused: false }),

  tick: (now: number) => {
    const state = get();
    if (!state.isRunning || state.isPaused) return;
    if (!state.activeSkill || !state.activeActionId) return;

    if (isAdminSkill(state.activeSkill) && !isSkillEnabledForAdmin(state.activeSkill)) {
      set({ isRunning: false, actionProgress: 0 });
      useNotificationsStore.getState().notifyInfo('Этот навык отключён в настройках игры.');
      return;
    }

    const elapsed = now - state.actionStartTime;
    const progress = Math.min(elapsed / state.currentActionInterval, 1);
    set({ actionProgress: progress });

    if (now < state.nextActionTime) return;

    const result = processAction(state.activeSkill, state.activeActionId);

    if (result === null) {
      set({ isRunning: false, actionProgress: 0 });
      useNotificationsStore.getState().notifyInfo('Недостаточно ресурсов или слишком низкий уровень. Действие остановлено.');
      return;
    }

    const inventory = useInventoryStore.getState();
    const notifs = useNotificationsStore.getState();
    let inventoryFull = false;

    for (const { itemId, quantity } of result.items) {
      const added = inventory.addItem(itemId, quantity);
      if (!added) inventoryFull = true;
    }

    if (inventoryFull) {
      // Уровень 1: сумка переполнена — важное объявление в колокольчик топбара (аудит, шаг 11).
      notifs.notifyInventoryFull();
    } else if (result.rareFinds?.length) {
      // Уровень 2: ценная находка — тост с цветной кромкой (аудит, шаг 11).
      // Уникальная экипировка звучит как «легендарная», остальное из редкой таблицы — «редкое».
      for (const find of result.rareFinds) {
        const found = getItem(find.itemId);
        notifs.notifyFind(
          found?.name ?? find.itemId,
          find.quantity,
          found?.gearUnique ? 'legendary' : 'rare',
          found?.icon,
        );
      }
    }

    const rates = getAdminRates();
    const effectiveXp = Math.max(0, Math.round(result.xpGained * rates.xpMultiplier));
    const effectiveMasteryXp = Math.max(0, Math.round(result.masteryXpGained * rates.masteryXpMultiplier));

    if (effectiveXp > 0) {
      const { leveledUp, newLevel } = usePlayerStore.getState().addXp(state.activeSkill, effectiveXp);
      if (leveledUp) notifs.notifyLevelUp(state.activeSkill, newLevel);
    }

    if (effectiveMasteryXp > 0) {
      const playerStore = usePlayerStore.getState();
      const oldMastery = playerStore.getMasteryLevel(state.activeSkill, state.activeActionId);
      playerStore.addMasteryXp(state.activeSkill, state.activeActionId, effectiveMasteryXp);
      const newMastery = playerStore.getMasteryLevel(state.activeSkill, state.activeActionId);
      if (newMastery > oldMastery) {
        // Исправление аудита (шаг 11): в тост — русское название зоны, а не её id.
        const zoneName = FORAGING_ZONES_MAP[state.activeActionId]?.name ?? state.activeActionId;
        notifs.notifyMasteryLevelUp(state.activeSkill, zoneName, newMastery);
      }
    }

    const xpGainedThisSession = { ...state.xpGainedThisSession };
    xpGainedThisSession[state.activeSkill] = (xpGainedThisSession[state.activeSkill] ?? 0) + effectiveXp;

    if (state.activeSkill === 'foraging' && state.activeActionId) {
      useForagingStore.getState().pushCycle(state.activeActionId, result, effectiveXp);
    }

    if (result.encounter && isSkillEnabledForAdmin('combat')) {
      useForagingStore.setState({ activeZoneId: null });
      useCombatStore.getState().startCombat(result.encounter.areaId, result.encounter.monsterId);
      // Уровень 1: нападение во время сбора / появление босса — важное объявление (аудит, шаг 11).
      const ambusher = MONSTERS_MAP[result.encounter.monsterId];
      notifs.notifyAmbush(ambusher?.name ?? 'противник', Boolean(result.encounter.boss));
      set({
        activeSkill: null,
        activeActionId: null,
        actionProgress: 0,
        isRunning: false,
        xpGainedThisSession,
      });
      return;
    }

    set({
      actionProgress: 0,
      actionStartTime: now,
      nextActionTime: now + state.currentActionInterval,
      xpGainedThisSession,
    });
  },

  setGameMode: (mode) => set({ gameMode: mode }),

  loadFromSave: (data) => set(s => ({ ...s, ...data })),

  reset: () => set({
    activeSkill: null, activeActionId: null, actionProgress: 0,
    actionStartTime: 0, nextActionTime: 0, currentActionInterval: 3000,
    totalPlayTime: 0, sessionStartTime: Date.now(), lastSaveTime: Date.now(),
    isRunning: false, isPaused: false, xpGainedThisSession: {},
  }),
}));
