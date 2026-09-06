import { create } from 'zustand';
import type {
  CombatStats,
  EquipSlot,
  ItemCategory,
  ItemTier,
} from '@/data/types';

/**
 * Админ-конфигурация: правки предметов и «рейты игры» (XP, темп, дроп,
 * цены) + доступность навыков. Это фундамент: хранится локально в
 * localStorage браузера админа и переносится через JSON (экспорт/импорт).
 * Позже те же структуры можно положить в облако/репозиторий без переделки.
 */

export type AdminSkillToggle =
  | 'woodcutting' | 'mining' | 'fishing'
  | 'cooking' | 'smithing' | 'firemaking' | 'combat';

export interface ItemOverride {
  name?: string;
  description?: string;
  category?: ItemCategory;
  tier?: ItemTier;
  sellValue?: number;
  buyValue?: number;
  canSell?: boolean;
  stackable?: boolean;
  healAmount?: number;
  equipSlot?: EquipSlot;
  combatStats?: Partial<CombatStats>;
  icon?: string;
  iconPath?: string;
  twoHanded?: boolean;
}

export interface AdminGameRates {
  /** Множитель получаемого XP (1 = как в исходных данных). */
  xpMultiplier: number;
  /** Множитель XP мастерства. */
  masteryXpMultiplier: number;
  /** Множитель скорости действий (>1 = быстрее, 1 = как было). */
  actionSpeedMultiplier: number;
  /** Множитель шанса дропа (и шанса самоцвета при добыче). */
  dropRateMultiplier: number;
  /** Множитель золота из дропа монстров. */
  goldMultiplier: number;
  /** Множитель цены продажи предметов. */
  sellPriceMultiplier: number;
}

export interface AdminConfigPayload {
  version: number;
  exportedAt: string;
  gameRates: AdminGameRates;
  contentToggles: Record<AdminSkillToggle, boolean>;
  itemOverrides: Record<string, ItemOverride>;
}

export interface AdminConfigState {
  version: number;
  gameRates: AdminGameRates;
  contentToggles: Record<AdminSkillToggle, boolean>;
  itemOverrides: Record<string, ItemOverride>;

  setGameRate: <K extends keyof AdminGameRates>(key: K, value: number) => void;
  resetGameRates: () => void;

  setContentToggle: (key: AdminSkillToggle, value: boolean) => void;
  resetContentToggles: () => void;

  updateItemOverride: (itemId: string, patch: ItemOverride) => void;
  resetItemOverride: (itemId: string) => void;
  resetAllItemOverrides: () => void;

  exportConfig: () => AdminConfigPayload;
  importConfig: (json: string) => boolean;
  resetAll: () => void;
}

const STORAGE_KEY = 'aethelia_admin_config_v1';
const CONFIG_VERSION = 1;

const DEFAULT_GAME_RATES: AdminGameRates = {
  xpMultiplier: 1,
  masteryXpMultiplier: 1,
  actionSpeedMultiplier: 1,
  dropRateMultiplier: 1,
  goldMultiplier: 1,
  sellPriceMultiplier: 1,
};

const DEFAULT_CONTENT_TOGGLES: Record<AdminSkillToggle, boolean> = {
  woodcutting: true,
  mining: true,
  fishing: true,
  cooking: true,
  smithing: true,
  firemaking: true,
  combat: true,
};

const clamp = (value: number, min: number, max: number): number => {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
};

const normalizeRates = (raw?: Partial<AdminGameRates>): AdminGameRates => ({
  xpMultiplier: clamp(raw?.xpMultiplier ?? 1, 0.05, 20),
  masteryXpMultiplier: clamp(raw?.masteryXpMultiplier ?? 1, 0.05, 20),
  actionSpeedMultiplier: clamp(raw?.actionSpeedMultiplier ?? 1, 0.1, 20),
  dropRateMultiplier: clamp(raw?.dropRateMultiplier ?? 1, 0, 20),
  goldMultiplier: clamp(raw?.goldMultiplier ?? 1, 0, 20),
  sellPriceMultiplier: clamp(raw?.sellPriceMultiplier ?? 1, 0, 20),
});

const normalizeToggles = (
  raw?: Partial<Record<AdminSkillToggle, boolean>>,
): Record<AdminSkillToggle, boolean> => ({
  ...DEFAULT_CONTENT_TOGGLES,
  ...raw,
});

function isStorageAvailable(storage: Storage): boolean {
  try {
    const probe = '__aethelia_admin_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function persist(state: Pick<AdminConfigState, 'gameRates' | 'contentToggles' | 'itemOverrides'>): void {
  try {
    const storage = window.localStorage;
    if (!isStorageAvailable(storage)) return;
    const payload: AdminConfigPayload = {
      version: CONFIG_VERSION,
      exportedAt: new Date().toISOString(),
      gameRates: state.gameRates,
      contentToggles: state.contentToggles,
      itemOverrides: state.itemOverrides,
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage недоступен — права живут в памяти сессии.
  }
}

function loadStored(): { gameRates: AdminGameRates; contentToggles: Record<AdminSkillToggle, boolean>; itemOverrides: Record<string, ItemOverride> } {
  try {
    const storage = window.localStorage;
    if (!isStorageAvailable(storage)) return { gameRates: DEFAULT_GAME_RATES, contentToggles: DEFAULT_CONTENT_TOGGLES, itemOverrides: {} };
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { gameRates: DEFAULT_GAME_RATES, contentToggles: DEFAULT_CONTENT_TOGGLES, itemOverrides: {} };
    const parsed = JSON.parse(raw) as Partial<AdminConfigPayload>;
    return {
      gameRates: normalizeRates(parsed.gameRates),
      contentToggles: normalizeToggles(parsed.contentToggles),
      itemOverrides: parsed.itemOverrides ?? {},
    };
  } catch {
    return { gameRates: DEFAULT_GAME_RATES, contentToggles: DEFAULT_CONTENT_TOGGLES, itemOverrides: {} };
  }
}

function parseItemOverrides(json: string): Record<string, ItemOverride> {
  const parsed = JSON.parse(json) as Partial<AdminConfigPayload>;
  const overrides = parsed.itemOverrides ?? {};
  const result: Record<string, ItemOverride> = {};
  for (const [key, value] of Object.entries(overrides)) {
    if (value && typeof value === 'object') result[key] = value as ItemOverride;
  }
  return result;
}

const initial = typeof window !== 'undefined' ? loadStored() : { gameRates: DEFAULT_GAME_RATES, contentToggles: DEFAULT_CONTENT_TOGGLES, itemOverrides: {} };

export const useAdminConfigStore = create<AdminConfigState>((set, get) => ({
  version: CONFIG_VERSION,
  gameRates: initial.gameRates,
  contentToggles: initial.contentToggles,
  itemOverrides: initial.itemOverrides,

  setGameRate: (key, value) => {
    const next = { ...get().gameRates, [key]: value };
    const normalized = normalizeRates(next);
    set({ gameRates: normalized });
    persist({ gameRates: normalized, contentToggles: get().contentToggles, itemOverrides: get().itemOverrides });
  },

  resetGameRates: () => {
    set({ gameRates: DEFAULT_GAME_RATES });
    persist({ gameRates: DEFAULT_GAME_RATES, contentToggles: get().contentToggles, itemOverrides: get().itemOverrides });
  },

  setContentToggle: (key, value) => {
    const next = { ...get().contentToggles, [key]: value };
    set({ contentToggles: next });
    persist({ gameRates: get().gameRates, contentToggles: next, itemOverrides: get().itemOverrides });
  },

  resetContentToggles: () => {
    set({ contentToggles: DEFAULT_CONTENT_TOGGLES });
    persist({ gameRates: get().gameRates, contentToggles: DEFAULT_CONTENT_TOGGLES, itemOverrides: get().itemOverrides });
  },

  updateItemOverride: (itemId, patch) => {
    const next = { ...get().itemOverrides };
    const existing = { ...next[itemId] };
    // combatStats мержим полем, а не заменяем весь объект.
    if (patch.combatStats) {
      existing.combatStats = { ...existing.combatStats, ...patch.combatStats };
      const { combatStats: _combat, ...rest } = patch;
      Object.assign(existing, rest);
    } else {
      Object.assign(existing, patch);
    }
    // Пустые строки — не правки.
    for (const key of Object.keys(existing) as (keyof ItemOverride)[]) {
      if (existing[key] === '') delete existing[key];
      if (existing[key] === undefined) delete existing[key];
    }
    if (Object.keys(existing).length === 0) {
      delete next[itemId];
    } else {
      next[itemId] = existing;
    }
    set({ itemOverrides: next });
    persist({ gameRates: get().gameRates, contentToggles: get().contentToggles, itemOverrides: next });
  },

  resetItemOverride: (itemId) => {
    const next = { ...get().itemOverrides };
    delete next[itemId];
    set({ itemOverrides: next });
    persist({ gameRates: get().gameRates, contentToggles: get().contentToggles, itemOverrides: next });
  },

  resetAllItemOverrides: () => {
    set({ itemOverrides: {} });
    persist({ gameRates: get().gameRates, contentToggles: get().contentToggles, itemOverrides: {} });
  },

  exportConfig: () => ({
    version: CONFIG_VERSION,
    exportedAt: new Date().toISOString(),
    gameRates: get().gameRates,
    contentToggles: get().contentToggles,
    itemOverrides: get().itemOverrides,
  }),

  importConfig: (json) => {
    try {
      const parsed = JSON.parse(json) as Partial<AdminConfigPayload>;
      if (!parsed || typeof parsed !== 'object') throw new Error('bad payload');
      const gameRates = normalizeRates(parsed.gameRates);
      const contentToggles = normalizeToggles(parsed.contentToggles);
      const itemOverrides = parseItemOverrides(json);
      set({ gameRates, contentToggles, itemOverrides });
      persist({ gameRates, contentToggles, itemOverrides });
      return true;
    } catch {
      return false;
    }
  },

  resetAll: () => {
    set({
      gameRates: DEFAULT_GAME_RATES,
      contentToggles: DEFAULT_CONTENT_TOGGLES,
      itemOverrides: {},
    });
    persist({
      gameRates: DEFAULT_GAME_RATES,
      contentToggles: DEFAULT_CONTENT_TOGGLES,
      itemOverrides: {},
    });
  },
}));

/** Не-React-доступ: читает текущую конфигурацию из стора. */
export function getAdminConfig(): Pick<AdminConfigState, 'gameRates' | 'contentToggles' | 'itemOverrides'> {
  const s = useAdminConfigStore.getState();
  return {
    gameRates: s.gameRates,
    contentToggles: s.contentToggles,
    itemOverrides: s.itemOverrides,
  };
}

export function getAdminRates(): AdminGameRates {
  return useAdminConfigStore.getState().gameRates;
}

export function isSkillEnabledForAdmin(skill: AdminSkillToggle): boolean {
  return useAdminConfigStore.getState().contentToggles[skill] !== false;
}

export const ADMIN_CONFIG_STORAGE_KEY = STORAGE_KEY;
