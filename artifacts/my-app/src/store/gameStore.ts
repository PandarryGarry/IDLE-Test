import { create } from 'zustand';
import type { SkillId, GameMode } from '@/data/types';
import { WOODCUTTING_TREES_MAP } from '@/domain/professions/woodcutting';
import { MINING_ROCKS_MAP, GEM_DROPS } from '@/domain/professions/mining';
import { FISHING_SPOTS_MAP } from '@/domain/professions/fishing';
import { COOKING_RECIPES_MAP } from '@/domain/professions/cooking';
import { SMITHING_MAP } from '@/domain/professions/smithing';
import { FIREMAKING_MAP } from '@/domain/professions/firemaking';
import {
  FORAGING_ZONES_MAP,
  rollForagingCycle,
  foragingSpeedMultiplier,
} from '@/domain/professions/foraging';
import { useForagingStore } from '@/store/foragingStore';
import { usePlayerStore } from '@/store/playerStore';
import { useBankStore } from '@/store/bankStore';
import { useCombatStore } from '@/store/combatStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useAuthStore } from '@/store/authStore';
import { isSkillAllowedForGuest, GUEST_NOTICE } from '@/lib/guestMode';
import { calcBurnChance, calcXpPerHour } from '@/core/formulas';
import { getItem } from '@/domain/items';
import {
  getAdminRates,
  isSkillEnabledForAdmin,
  type AdminSkillToggle,
} from '@/store/adminConfigStore';
import { chance, randomRange } from '@/lib/utils';

export interface ActionResult {
  items: { itemId: string; quantity: number }[];
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
  // Gameplay state
  activeSkill: SkillId | null;
  activeActionId: string | null;
  actionProgress: number; // 0-1 for progress bar
  actionStartTime: number;
  nextActionTime: number;
  currentActionInterval: number; // ms

  // Meta
  gameMode: GameMode;
  totalPlayTime: number;
  sessionStartTime: number;
  lastSaveTime: number;
  isRunning: boolean;
  isPaused: boolean;

  // XP trackers for current session
  xpGainedThisSession: Partial<Record<SkillId, number>>;

  // Оффлайн данные
  offlineData: OfflineData | null;
  clearOfflineData: () => void;

  // Actions
  startSkillAction: (skillId: SkillId, actionId: string) => boolean;
  stopAction: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  tick: (now: number) => void; // called by tickManager
  setGameMode: (mode: GameMode) => void;
  reset: () => void;
  loadFromSave: (data: Partial<GameStore>) => void;
}

// ── Skill action processors ───────────────────────────────────

function processWoodcutting(actionId: string): ActionResult | null {
  const tree = WOODCUTTING_TREES_MAP[actionId];
  if (!tree) return null;
  const playerLevel = usePlayerStore.getState().getSkillLevel('woodcutting');
  if (playerLevel < tree.levelRequired) return null;
  const qty = randomRange(tree.quantity[0], tree.quantity[1]);
  return { items: [{ itemId: tree.logId, quantity: qty }], xpGained: tree.xp, masteryXpGained: tree.masteryXp ?? 3 };
}

function processMining(actionId: string): ActionResult | null {
  const rock = MINING_ROCKS_MAP[actionId];
  if (!rock) return null;
  const playerLevel = usePlayerStore.getState().getSkillLevel('mining');
  if (playerLevel < rock.levelRequired) return null;
  const items: { itemId: string; quantity: number }[] = [{ itemId: rock.oreId, quantity: 1 }];
  // Gem chance (админ-множитель дропа действует и на самоцветы).
  const gemChance = rock.gemChance ? Math.min(1, rock.gemChance * getAdminRates().dropRateMultiplier) : 0;
  if (gemChance > 0 && chance(gemChance)) {
    const totalWeight = GEM_DROPS.reduce((sum, g) => sum + g.weight, 0);
    let rng = Math.random() * totalWeight;
    for (const gem of GEM_DROPS) {
      rng -= gem.weight;
      if (rng <= 0) { items.push({ itemId: gem.itemId, quantity: 1 }); break; }
    }
  }
  return { items, xpGained: rock.xp, masteryXpGained: rock.masteryXp ?? 3 };
}

function processFishing(actionId: string): ActionResult | null {
  const spot = FISHING_SPOTS_MAP[actionId];
  if (!spot) return null;
  const playerLevel = usePlayerStore.getState().getSkillLevel('fishing');
  if (playerLevel < spot.levelRequired) return null;
  return { items: [{ itemId: spot.fishId, quantity: 1 }], xpGained: spot.xp, masteryXpGained: spot.masteryXp ?? 3 };
}

function processForaging(actionId: string): ActionResult | null {
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
}

function processCooking(actionId: string): ActionResult | null {
  const recipe = COOKING_RECIPES_MAP[actionId];
  if (!recipe) return null;
  const bankStore = useBankStore.getState();
  if (!bankStore.hasItem(recipe.rawItemId, 1)) return null;
  const playerLevel = usePlayerStore.getState().getSkillLevel('cooking');
  if (playerLevel < recipe.levelRequired) return null;
  bankStore.removeItem(recipe.rawItemId, 1);
  const burnChance = calcBurnChance(playerLevel, recipe.levelRequired, recipe.burnChanceBase ?? 0.3);
  const burnt = chance(burnChance);
  const outputId = burnt ? (recipe.burntItemId ?? 'burnt_fish') : recipe.cookedItemId;
  return { items: [{ itemId: outputId, quantity: 1 }], xpGained: burnt ? 0 : recipe.xp, masteryXpGained: burnt ? 0 : (recipe.masteryXp ?? 3) };
}

function processSmithing(actionId: string): ActionResult | null {
  const recipe = SMITHING_MAP[actionId];
  if (!recipe) return null;
  const bankStore = useBankStore.getState();
  const playerLevel = usePlayerStore.getState().getSkillLevel('smithing');
  if (playerLevel < recipe.levelRequired) return null;
  // Check ingredients
  for (const ing of recipe.ingredients) {
    if (!bankStore.hasItem(ing.itemId, ing.quantity)) return null;
  }
  // Consume ingredients
  for (const ing of recipe.ingredients) {
    bankStore.removeItem(ing.itemId, ing.quantity);
  }
  return { items: [{ itemId: recipe.outputItemId, quantity: recipe.outputQuantity ?? 1 }], xpGained: recipe.xp, masteryXpGained: recipe.masteryXp ?? 3 };
}

function processFiremaking(actionId: string): ActionResult | null {
  const log = FIREMAKING_MAP[actionId];
  if (!log) return null;
  const bankStore = useBankStore.getState();
  const playerLevel = usePlayerStore.getState().getSkillLevel('firemaking');
  if (playerLevel < log.levelRequired) return null;
  if (!bankStore.hasItem(log.logId, 1)) return null;
  bankStore.removeItem(log.logId, 1);
  const items: { itemId: string; quantity: number }[] = [];
  if (log.ashId) items.push({ itemId: log.ashId, quantity: 1 });
  return { items, xpGained: log.xp, masteryXpGained: log.masteryXp ?? 3 };
}

function processAction(skillId: SkillId, actionId: string): ActionResult | null {
  switch (skillId) {
    case 'woodcutting': return processWoodcutting(actionId);
    case 'mining':      return processMining(actionId);
    case 'fishing':     return processFishing(actionId);
    case 'foraging':    return processForaging(actionId);
    case 'cooking':     return processCooking(actionId);
    case 'smithing':    return processSmithing(actionId);
    case 'firemaking':  return processFiremaking(actionId);
    default: return null;
  }
}

function getActionInterval(skillId: SkillId, actionId: string): number {
  let base: number;
  switch (skillId) {
    case 'woodcutting': base = WOODCUTTING_TREES_MAP[actionId]?.interval ?? 3000; break;
    case 'mining':      base = MINING_ROCKS_MAP[actionId]?.interval ?? 3000; break;
    case 'fishing':     base = FISHING_SPOTS_MAP[actionId]?.interval ?? 7000; break;
    case 'foraging':    base = Math.round((FORAGING_ZONES_MAP[actionId]?.interval ?? 4000) / Math.max(0.01, foragingSpeedMultiplier(usePlayerStore.getState().getSkillLevel('foraging')))); break;
    case 'cooking':     base = COOKING_RECIPES_MAP[actionId]?.interval ?? 3000; break;
    case 'smithing':    base = SMITHING_MAP[actionId]?.interval ?? 3000; break;
    case 'firemaking':  base = FIREMAKING_MAP[actionId]?.interval ?? 3000; break;
    default: base = 3000;
  }
  // «Рейты игры»: скорость действий. >1 — быстрее, 1 — как было.
  const speed = getAdminRates().actionSpeedMultiplier;
  if (speed <= 0) return base;
  return Math.max(100, Math.round(base / speed));
}

type AdminGatheringToggle = Exclude<AdminSkillToggle, 'combat'>;

/** Навыки, доступные в тумблерах админки. Для прочих — всегда включён. */
function isAdminSkill(skillId: SkillId): skillId is AdminGatheringToggle {
  return (
    skillId === 'woodcutting' || skillId === 'mining' || skillId === 'fishing' || skillId === 'foraging' ||
    skillId === 'cooking' || skillId === 'smithing' || skillId === 'firemaking'
  );
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
    // Админ может временно отключить навык («Настройки игры» → доступность).
    if (isAdminSkill(skillId) && !isSkillEnabledForAdmin(skillId)) {
      useNotificationsStore.getState().notifyInfo('Этот навык отключён в настройках игры.');
      return false;
    }

    // Guests may only train woodcutting and fishing; other skills and combat
    // are locked until the player registers and signs in.
    if (useAuthStore.getState().isGuest && !isSkillAllowedForGuest(skillId)) {
      useNotificationsStore.getState().notifyInfo(GUEST_NOTICE);
      return false;
    }

    const interval = getActionInterval(skillId, actionId);
    // Use performance.now() (monotonic) — same clock the tick manager passes to tick().
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

    // Если админ выключил навык прямо во время работы — останавливаем.
    if (isAdminSkill(state.activeSkill) && !isSkillEnabledForAdmin(state.activeSkill)) {
      set({ isRunning: false, actionProgress: 0 });
      useNotificationsStore.getState().notifyInfo('Этот навык отключён в настройках игры.');
      return;
    }

    // Update progress bar
    const elapsed = now - state.actionStartTime;
    const progress = Math.min(elapsed / state.currentActionInterval, 1);
    set({ actionProgress: progress });

    // Check if action completes
    if (now < state.nextActionTime) return;

    // Process action
    const result = processAction(state.activeSkill, state.activeActionId);

    if (result === null) {
      // Action failed (insufficient materials, wrong level, etc.) — stop
      set({ isRunning: false, actionProgress: 0 });
      useNotificationsStore.getState().notifyInfo('Недостаточно ресурсов или слишком низкий уровень. Действие остановлено.');
      return;
    }

    // Add items to bank — проверяем результат addItem и уведомляем о переполнении
    const bankStore = useBankStore.getState();
    const notifs = useNotificationsStore.getState();
    let inventoryFull = false;

    for (const { itemId, quantity } of result.items) {
      const added = bankStore.addItem(itemId, quantity);
      if (!added) {
        // Инвентарь полон — предмет не поместился
        inventoryFull = true;
      }
    }

    // Уведомление о переполнении (один раз за тик, даже если не поместилось несколько предметов)
    // Это важная информация — остаётся в тостах. Обычные находки в тосты не попадают.
    if (inventoryFull) {
      notifs.notifyInfo('⚠️ Сумка заполнена — часть находок потеряна.');
    }

    // «Рейты игры»: множители XP и мастерства.
    const rates = getAdminRates();
    const effectiveXp = Math.max(0, Math.round(result.xpGained * rates.xpMultiplier));
    const effectiveMasteryXp = Math.max(0, Math.round(result.masteryXpGained * rates.masteryXpMultiplier));

    // Add XP
    if (effectiveXp > 0) {
      const { leveledUp, newLevel } = usePlayerStore.getState().addXp(state.activeSkill, effectiveXp);
      if (leveledUp) {
        notifs.notifyLevelUp(state.activeSkill, newLevel);
      }
    }

    // Add mastery XP
    if (effectiveMasteryXp > 0) {
      const playerStore = usePlayerStore.getState();
      const oldMastery = playerStore.getMasteryLevel(state.activeSkill, state.activeActionId);
      playerStore.addMasteryXp(state.activeSkill, state.activeActionId, effectiveMasteryXp);
      const newMastery = playerStore.getMasteryLevel(state.activeSkill, state.activeActionId);
      if (newMastery > oldMastery) {
        notifs.notifyMasteryLevelUp(state.activeSkill, state.activeActionId, newMastery);
      }
    }

    // Update XP tracker
    const xpGainedThisSession = { ...state.xpGainedThisSession };
    xpGainedThisSession[state.activeSkill] = (xpGainedThisSession[state.activeSkill] ?? 0) + effectiveXp;

    // Лента находок «Сбора» для страницы профессии (только рендер-данные).
    if (state.activeSkill === 'foraging' && state.activeActionId) {
      useForagingStore.getState().pushCycle(state.activeActionId, result, effectiveXp);
    }

    // Встреча с мобом во время «Сбора»: добыча и XP уже засчитаны,
    // выходим из добычи и передаём управление бою.
    if (result.encounter && isSkillEnabledForAdmin('combat')) {
      useForagingStore.setState({ activeZoneId: null });
      useCombatStore.getState().startCombat(result.encounter.areaId, result.encounter.monsterId);
      set({
        activeSkill: null,
        activeActionId: null,
        actionProgress: 0,
        isRunning: false,
        xpGainedThisSession,
      });
      return;
    }

    // Schedule next action
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

