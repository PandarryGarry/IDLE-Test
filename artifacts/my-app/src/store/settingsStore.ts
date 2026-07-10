import { create } from 'zustand';

export interface GameSettings {
  darkMode: boolean;
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // seconds
  showXpDrops: boolean;
  showLootDrops: boolean;
  showCombatSplats: boolean;
  language: 'en' | 'ru';
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

const DEFAULT_SETTINGS: GameSettings = {
  darkMode: true,
  autoSaveEnabled: true,
  autoSaveInterval: 30,
  showXpDrops: true,
  showLootDrops: true,
  showCombatSplats: true,
  language: 'en',
  tickRate: 100,
  maxOfflineHours: 24,
  confirmSell: true,
  numberFormat: 'abbreviated',
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...DEFAULT_SETTINGS,

  updateSetting: (key, value) => set({ [key]: value }),

  toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),

  reset: () => set({ ...DEFAULT_SETTINGS }),
}));
