import { create } from 'zustand';
import type {
  CombatStats,
  EquipSlot,
  ItemCategory,
  ItemTier,
} from '@/data/types';
import type { ProfessionStatDef } from '@/domain/professions/professionStats';
import type { ProfessionFeed } from '@/data/balance/professions';
import {
  registerAdminItemSnapshot as registerDomainAdminItemSnapshot,
  registerProfessionFeedOverrides as registerDomainProfessionFeedOverrides,
} from '@/domain/runtimePorts';

/**
 * Админ-конфигурация: правки предметов и «рейты игры» (XP, темп, дроп,
 * цены) + доступность навыков. Это фундамент: хранится локально в
 * localStorage браузера админа и переносится через JSON (экспорт/импорт).
 * Позже те же структуры можно положить в облако/репозиторий без переделки.
 */

export type AdminSkillToggle = 'foraging' | 'combat';

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
  /** Отдельный live-рейт XP боя: меняется в админке без перезапуска. */
  combatXpMultiplier: number;
  /** Отдельный live-рейт дропа боя поверх общего dropRateMultiplier. */
  combatDropRateMultiplier: number;
  /** Отдельный live-рейт золота боя поверх общего goldMultiplier. */
  combatGoldMultiplier: number;
  /** Темп боевых таймеров: 1 = баланс, меньше = медленнее, больше = быстрее. */
  combatPaceMultiplier: number;
}

export interface AdminConfigPayload {
  version: number;
  exportedAt: string;
  gameRates: AdminGameRates;
  contentToggles: Record<AdminSkillToggle, boolean>;
  itemOverrides: Record<string, ItemOverride>;
  professionStatOverrides: Record<string, Partial<ProfessionStatDef>>;
  professionFeedOverrides: Record<string, Partial<ProfessionFeed>>;
}

export interface AdminConfigState {
  version: number;
  gameRates: AdminGameRates;
  contentToggles: Record<AdminSkillToggle, boolean>;
  itemOverrides: Record<string, ItemOverride>;
  professionStatOverrides: Record<string, Partial<ProfessionStatDef>>;
  professionFeedOverrides: Record<string, Partial<ProfessionFeed>>;

  setGameRate: <K extends keyof AdminGameRates>(key: K, value: number) => void;
  resetGameRates: () => void;

  setContentToggle: (key: AdminSkillToggle, value: boolean) => void;
  resetContentToggles: () => void;

  updateItemOverride: (itemId: string, patch: ItemOverride) => void;
  resetItemOverride: (itemId: string) => void;
  resetAllItemOverrides: () => void;

  updateProfessionStatOverride: (statId: string, patch: Partial<ProfessionStatDef>) => void;
  resetProfessionStatOverride: (statId: string) => void;
  resetAllProfessionStatOverrides: () => void;

  updateProfessionFeedOverride: (skillId: string, patch: Partial<ProfessionFeed>) => void;
  resetProfessionFeedOverride: (skillId: string) => void;
  resetAllProfessionFeedOverrides: () => void;

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
  combatXpMultiplier: 1,
  combatDropRateMultiplier: 1,
  combatGoldMultiplier: 1,
  combatPaceMultiplier: 1,
};

const DEFAULT_CONTENT_TOGGLES: Record<AdminSkillToggle, boolean> = {
  foraging: true,
  combat: true,
};

const emptyOverrides = { professionStatOverrides: {}, professionFeedOverrides: {} } as const;

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
  combatXpMultiplier: clamp(raw?.combatXpMultiplier ?? 1, 0, 20),
  combatDropRateMultiplier: clamp(raw?.combatDropRateMultiplier ?? 1, 0, 20),
  combatGoldMultiplier: clamp(raw?.combatGoldMultiplier ?? 1, 0, 20),
  combatPaceMultiplier: clamp(raw?.combatPaceMultiplier ?? 1, 0.25, 3),
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
    const current = useAdminConfigStore.getState();
    const payload: AdminConfigPayload = {
      version: CONFIG_VERSION,
      exportedAt: new Date().toISOString(),
      gameRates: state.gameRates,
      contentToggles: state.contentToggles,
      itemOverrides: state.itemOverrides,
      professionStatOverrides: current.professionStatOverrides,
      professionFeedOverrides: current.professionFeedOverrides,
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage недоступен — права живут в памяти сессии.
  }
}

interface StoredConfig {
  gameRates: AdminGameRates;
  contentToggles: Record<AdminSkillToggle, boolean>;
  itemOverrides: Record<string, ItemOverride>;
  professionStatOverrides: Record<string, Partial<ProfessionStatDef>>;
  professionFeedOverrides: Record<string, Partial<ProfessionFeed>>;
}

function loadStored(): StoredConfig {
  const empty: StoredConfig = {
    gameRates: DEFAULT_GAME_RATES,
    contentToggles: DEFAULT_CONTENT_TOGGLES,
    itemOverrides: {},
    ...emptyOverrides,
  };
  try {
    const storage = window.localStorage;
    if (!isStorageAvailable(storage)) return empty;
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<AdminConfigPayload>;
    return {
      gameRates: normalizeRates(parsed.gameRates),
      contentToggles: normalizeToggles(parsed.contentToggles),
      itemOverrides: parsed.itemOverrides ?? {},
      professionStatOverrides: parsed.professionStatOverrides ?? {},
      professionFeedOverrides: parsed.professionFeedOverrides ?? {},
    };
  } catch {
    return empty;
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

function parseObjectOverrides<T>(json: string, key: 'professionStatOverrides' | 'professionFeedOverrides'): Record<string, Partial<T>> {
  const parsed = JSON.parse(json) as Partial<AdminConfigPayload>;
  const overrides = (parsed[key] ?? {}) as Record<string, unknown>;
  const result: Record<string, Partial<T>> = {};
  for (const [k, v] of Object.entries(overrides)) {
    if (v && typeof v === 'object') result[k] = v as Partial<T>;
  }
  return result;
}

const initial = typeof window !== 'undefined' ? loadStored() : { gameRates: DEFAULT_GAME_RATES, contentToggles: DEFAULT_CONTENT_TOGGLES, itemOverrides: {}, ...emptyOverrides };

export const useAdminConfigStore = create<AdminConfigState>((set, get) => ({
  version: CONFIG_VERSION,
  gameRates: initial.gameRates,
  contentToggles: initial.contentToggles,
  itemOverrides: initial.itemOverrides,
  professionStatOverrides: initial.professionStatOverrides,
  professionFeedOverrides: initial.professionFeedOverrides,

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

  updateProfessionStatOverride: (statId, patch) => {
    const next = { ...get().professionStatOverrides };
    const existing = { ...next[statId] };
    Object.assign(existing, patch);
    for (const key of Object.keys(existing) as (keyof ProfessionStatDef)[]) {
      if (existing[key] === '' || existing[key] === undefined) delete existing[key];
    }
    if (Object.keys(existing).length === 0) {
      delete next[statId];
    } else {
      next[statId] = existing;
    }
    set({ professionStatOverrides: next });
    persist({ gameRates: get().gameRates, contentToggles: get().contentToggles, itemOverrides: get().itemOverrides });
  },

  resetProfessionStatOverride: (statId) => {
    const next = { ...get().professionStatOverrides };
    delete next[statId];
    set({ professionStatOverrides: next });
    persist({ gameRates: get().gameRates, contentToggles: get().contentToggles, itemOverrides: get().itemOverrides });
  },

  resetAllProfessionStatOverrides: () => {
    set({ professionStatOverrides: {} });
    persist({ gameRates: get().gameRates, contentToggles: get().contentToggles, itemOverrides: get().itemOverrides });
  },

  updateProfessionFeedOverride: (skillId, patch) => {
    const next = { ...get().professionFeedOverrides };
    const existing = { ...next[skillId] };
    Object.assign(existing, patch);
    for (const key of Object.keys(existing) as (keyof ProfessionFeed)[]) {
      if (existing[key] === '' || existing[key] === undefined) delete existing[key];
    }
    if (Object.keys(existing).length === 0) {
      delete next[skillId];
    } else {
      next[skillId] = existing;
    }
    set({ professionFeedOverrides: next });
    persist({ gameRates: get().gameRates, contentToggles: get().contentToggles, itemOverrides: get().itemOverrides });
  },

  resetProfessionFeedOverride: (skillId) => {
    const next = { ...get().professionFeedOverrides };
    delete next[skillId];
    set({ professionFeedOverrides: next });
    persist({ gameRates: get().gameRates, contentToggles: get().contentToggles, itemOverrides: get().itemOverrides });
  },

  resetAllProfessionFeedOverrides: () => {
    set({ professionFeedOverrides: {} });
    persist({ gameRates: get().gameRates, contentToggles: get().contentToggles, itemOverrides: get().itemOverrides });
  },

  exportConfig: () => ({
    version: CONFIG_VERSION,
    exportedAt: new Date().toISOString(),
    gameRates: get().gameRates,
    contentToggles: get().contentToggles,
    itemOverrides: get().itemOverrides,
    professionStatOverrides: get().professionStatOverrides,
    professionFeedOverrides: get().professionFeedOverrides,
  }),

  importConfig: (json) => {
    try {
      const parsed = JSON.parse(json) as Partial<AdminConfigPayload>;
      if (!parsed || typeof parsed !== 'object') throw new Error('bad payload');
      const gameRates = normalizeRates(parsed.gameRates);
      const contentToggles = normalizeToggles(parsed.contentToggles);
      const itemOverrides = parseItemOverrides(json);
      const professionStatOverrides = parseObjectOverrides<ProfessionStatDef>(json, 'professionStatOverrides');
      const professionFeedOverrides = parseObjectOverrides<ProfessionFeed>(json, 'professionFeedOverrides');
      set({ gameRates, contentToggles, itemOverrides, professionStatOverrides, professionFeedOverrides });
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
      professionStatOverrides: {},
      professionFeedOverrides: {},
    });
    persist({
      gameRates: DEFAULT_GAME_RATES,
      contentToggles: DEFAULT_CONTENT_TOGGLES,
      itemOverrides: {},
    });
  },
}));

/** Не-React-доступ: читает текущую конфигурацию из стора. */
export function getAdminConfig(): Pick<AdminConfigState, 'gameRates' | 'contentToggles' | 'itemOverrides' | 'professionStatOverrides' | 'professionFeedOverrides'> {
  const s = useAdminConfigStore.getState();
  return {
    gameRates: s.gameRates,
    contentToggles: s.contentToggles,
    itemOverrides: s.itemOverrides,
    professionStatOverrides: s.professionStatOverrides,
    professionFeedOverrides: s.professionFeedOverrides,
  };
}

/** Оверрайды характеристик профессий (для чтения вне React). */
export function getProfessionStatOverrides(): Record<string, Partial<ProfessionStatDef>> {
  return useAdminConfigStore.getState().professionStatOverrides;
}

/** Оверрайды вклада профессий в персонажа (для чтения вне React). */
export function getProfessionFeedOverrides(): Record<string, Partial<ProfessionFeed>> {
  return useAdminConfigStore.getState().professionFeedOverrides;
}

export function getAdminRates(): AdminGameRates {
  return useAdminConfigStore.getState().gameRates;
}

export function isSkillEnabledForAdmin(skill: AdminSkillToggle): boolean {
  return useAdminConfigStore.getState().contentToggles[skill] !== false;
}

export const ADMIN_CONFIG_STORAGE_KEY = STORAGE_KEY;

// ── Адаптер домена ─────────────────────────────────────────────
// Чистая логика (`domain/`) не имеет права импортировать этот стор — она
// читает админ-правки через порты `domain/runtimePorts.ts`. Импорт стора
// тянул бы zustand в тесты столпов и в `validate-catalog.mjs`.
registerDomainProfessionFeedOverrides(() => getProfessionFeedOverrides());
registerDomainAdminItemSnapshot(() => {
  const { itemOverrides, gameRates } = getAdminConfig();
  return { itemOverrides, sellPriceMultiplier: gameRates.sellPriceMultiplier };
});
