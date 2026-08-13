import { create } from 'zustand';
import type { SkillId, GameMode } from '../data/types';
import { processAction, getActionInterval } from '../gameEngine/skillRegistry';
import { usePlayerStore } from './playerStore';
import { useBankStore } from './bankStore';
import { useNotificationsStore } from './notificationsStore';
import { getItem } from '../data/items';

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

  startSkillAction: (skillId, actionId) => {
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

    // Update progress bar
    const elapsed = now - state.actionStartTime;
    const progress = Math.min(elapsed / state.currentActionInterval, 1);
    set({ actionProgress: progress });

    // Check if action completes
    if (now < state.nextActionTime) return;

    // Process action using registry
    const result = processAction(state.activeSkill, state.activeActionId);

    if (result === null) {
      // Action failed (insufficient materials, wrong level, etc.) — stop
      set({ isRunning: false, actionProgress: 0 });
      useNotificationsStore.getState().notifyInfo('Not enough resources or level too low. Action stopped.');
      return;
    }

    // Add items to bank
    const bankStore = useBankStore.getState();
    const notifs = useNotificationsStore.getState();
    for (const { itemId, quantity } of result.items) {
      bankStore.addItem(itemId, quantity);
      if (quantity > 0) {
        const item = getItem(itemId);
        if (item) notifs.notifyItem(item.name, quantity, item.icon);
      }
    }

    // Add XP
    if (result.xpGained > 0) {
      const { leveledUp, newLevel } = usePlayerStore.getState().addXp(state.activeSkill, result.xpGained);
      if (leveledUp) {
        notifs.notifyLevelUp(state.activeSkill, newLevel);
      }
    }

    // Add mastery XP
    if (result.masteryXpGained > 0) {
      const playerStore = usePlayerStore.getState();
      const oldMastery = playerStore.getMasteryLevel(state.activeSkill, state.activeActionId);
      playerStore.addMasteryXp(state.activeSkill, state.activeActionId, result.masteryXpGained);
      const newMastery = playerStore.getMasteryLevel(state.activeSkill, state.activeActionId);
      if (newMastery > oldMastery) {
        notifs.notifyMasteryLevelUp(state.activeSkill, state.activeActionId, newMastery);
      }
    }

    // Update XP tracker
    const xpGainedThisSession = { ...state.xpGainedThisSession };
    xpGainedThisSession[state.activeSkill] = (xpGainedThisSession[state.activeSkill] ?? 0) + result.xpGained;

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
