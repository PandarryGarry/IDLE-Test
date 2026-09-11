import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AUTOSAVE_INTERVAL_S_DEFAULT, AUTOSAVE_INTERVAL_S_MIN } from '@/data/balance/loop';
import { OFFLINE_MAX_HOURS_DEFAULT, OFFLINE_MAX_HOURS_MAX, OFFLINE_MAX_HOURS_MIN } from '@/data/balance/offline';

export interface GameSettings {
  darkMode: boolean;
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // seconds
  showXpDrops: boolean;
  showLootDrops: boolean;
  showCombatSplats: boolean;
  language: 'ru' | 'en';
  tickRate: number; // ms (lower = faster UI updates)
  maxOfflineHours: number;
  confirmSell: boolean;
  numberFormat: 'full' | 'abbreviated';
}

export interface SettingsStore extends GameSettings {
  updateSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  toggleDarkMode: () => void;
  reset: () => void;
}

export const SETTINGS_STORAGE_KEY = 'aethelia_settings_v1';

const DEFAULT_SETTINGS: GameSettings = {
  darkMode: true,
  autoSaveEnabled: true,
  autoSaveInterval: AUTOSAVE_INTERVAL_S_DEFAULT,
  showXpDrops: true,
  showLootDrops: true,
  showCombatSplats: true,
  language: 'ru',
  tickRate: 100,
  maxOfflineHours: OFFLINE_MAX_HOURS_DEFAULT,
  confirmSell: true,
  numberFormat: 'abbreviated',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateSetting: (key, value) => set({ [key]: value }),

      toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),

      reset: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      // Настройки жили только в памяти: `collectSaveData` писал `settings: {}`,
      // и после F5 всё возвращалось к дефолтам (интервал автосейва, кап оффлайна,
      // язык…). Храним отдельно от сейва — настройки принадлежат устройству,
      // а не герою: два героя на одном телефоне не должны спорить из-за галок.
      name: SETTINGS_STORAGE_KEY,
      version: 1,
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => key in DEFAULT_SETTINGS),
        ) as SettingsStore,
      // Что прилетело из старого localStorage — прогоняем через те же границы,
      // что и UI: 0 или -5 в интервале автосейва ломает цикл сохранений.
      merge: (persisted, current) => ({
        ...current,
        ...(sanitizeSettings(persisted) ?? {}),
      }),
    },
  ),
);

/** Границы настроек, которые двигатель реально читает. */
export function sanitizeSettings(raw: unknown): Partial<GameSettings> | null {
  if (!raw || typeof raw !== 'object') return null;
  const src = raw as Record<string, unknown>;
  const out: Partial<GameSettings> = {};
  const num = (v: unknown, fallback: number): number =>
    typeof v === 'number' && Number.isFinite(v) ? v : fallback;

  if (typeof src.autoSaveEnabled === 'boolean') out.autoSaveEnabled = src.autoSaveEnabled;
  out.autoSaveInterval = Math.max(
    AUTOSAVE_INTERVAL_S_MIN,
    Math.floor(num(src.autoSaveInterval, DEFAULT_SETTINGS.autoSaveInterval)),
  );
  out.maxOfflineHours = Math.min(
    OFFLINE_MAX_HOURS_MAX,
    Math.max(OFFLINE_MAX_HOURS_MIN, Math.floor(num(src.maxOfflineHours, OFFLINE_MAX_HOURS_DEFAULT))),
  );
  if (src.language === 'ru' || src.language === 'en') out.language = src.language;
  if (src.numberFormat === 'full' || src.numberFormat === 'abbreviated') out.numberFormat = src.numberFormat;
  for (const flag of [
    'showXpDrops',
    'showLootDrops',
    'showCombatSplats',
    'confirmSell',
    'darkMode',
  ] as const) {
    if (typeof src[flag] === 'boolean') out[flag] = src[flag];
  }
  const tickRate = num(src.tickRate, DEFAULT_SETTINGS.tickRate);
  out.tickRate = Math.min(1000, Math.max(16, Math.floor(tickRate)));
  return out;
}
