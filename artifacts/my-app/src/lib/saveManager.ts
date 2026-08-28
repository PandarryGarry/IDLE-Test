// Save/Load manager for Melvor Idle Clone
// Supports: localStorage auto-save, multiple save slots, JSON export/import

import type { SaveData } from '../data/types';
import { usePlayerStore } from '../store/playerStore';
import { useBankStore } from '../store/bankStore';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { calculateOfflineProgress } from '../gameEngine/offlineCalc';

const SAVE_VERSION = '1.0.0';
const SAVE_KEY_PREFIX = 'melvor_save_';
const AUTO_SAVE_SLOT = 'auto';
export const SAVE_SLOTS = ['slot1', 'slot2', 'slot3'] as const;
export type SaveSlot = typeof SAVE_SLOTS[number] | typeof AUTO_SAVE_SLOT;

export function collectSaveData(): SaveData {
  const player = usePlayerStore.getState();
  const bank = useBankStore.getState();
  const game = useGameStore.getState();

  return {
    version: SAVE_VERSION,
    savedAt: Date.now(),
    totalPlayTime: game.totalPlayTime,
    gameMode: game.gameMode,
    player: {
      skills: player.skills,
      equipment: player.equipment,
    },
    bank: {
      items: bank.items,
      gp: bank.gp,
      maxSlots: bank.maxSlots,
    },
    game: {
      activeSkill: game.activeSkill,
      activeActionId: game.activeActionId,
      activeAreaId: null,
      activeMonsterId: null,
    },
    settings: {},
  };
}

export function applySaveData(data: SaveData): void {
  const playerStore = usePlayerStore.getState();
  const bankStore = useBankStore.getState();
  const gameStore = useGameStore.getState();

  playerStore.loadFromSave(data.player.skills, data.player.equipment);
  bankStore.loadFromSave(data.bank.items, data.bank.gp, data.bank.maxSlots);
  gameStore.loadFromSave({
    gameMode: data.gameMode,
    totalPlayTime: data.totalPlayTime,
    activeSkill: data.game.activeSkill,
    activeActionId: data.game.activeActionId,
    lastSaveTime: data.savedAt,
  });

  // Calculate offline progress and store result for Dashboard display
  // Используем leaveTime (точное время ухода) если есть, иначе savedAt
  const leaveTime = Number(localStorage.getItem('aethelia_leave_time') || '0') || data.savedAt;
  if (data.game.activeSkill && data.game.activeActionId) {
    const offlineResult = calculateOfflineProgress(data.game.activeSkill, data.game.activeActionId, leaveTime);
    if (offlineResult && offlineResult.xpGained > 0) {
      const skillNames: Record<string, string> = {
        woodcutting: 'Лесорубство', mining: 'Горное дело', fishing: 'Рыбалка',
        cooking: 'Кулинария', smithing: 'Кузнечество', firemaking: 'Огонь', combat: 'Бой',
      };
      const skillIcons: Record<string, string> = {
        woodcutting: '🪓', mining: '⛏️', fishing: '🎣',
        cooking: '🍖', smithing: '🔨', firemaking: '🔥', combat: '⚔️',
      };
      useGameStore.setState({
        offlineData: {
          totalMinutes: Math.floor(offlineResult.offlineMs / 60_000),
          rewards: [{
            icon: skillIcons[data.game.activeSkill] || '⚡',
            skill: skillNames[data.game.activeSkill] || data.game.activeSkill,
            xp: Math.floor(offlineResult.xpGained),
            items: offlineResult.itemsGained.map(i => {
              const name = i.itemId.replace(/_/g,' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
              return `+${i.quantity} ${name}`;
            }).join(', ') || undefined,
          }],
          goldEarned: 0,
        }
      });
    }
  }
}

// ── localStorage operations ────────────────────────────────────

export function saveToSlot(slot: SaveSlot): void {
  try {
    const data = collectSaveData();
    const json = JSON.stringify(data);
    localStorage.setItem(`${SAVE_KEY_PREFIX}${slot}`, json);
  } catch (e) {
    console.error('Failed to save game:', e);
  }
}

export function loadFromSlot(slot: SaveSlot): SaveData | null {
  try {
    const json = localStorage.getItem(`${SAVE_KEY_PREFIX}${slot}`);
    if (!json) return null;
    return JSON.parse(json) as SaveData;
  } catch (e) {
    console.error('Failed to load save:', e);
    return null;
  }
}

export function deleteSaveSlot(slot: SaveSlot): void {
  localStorage.removeItem(`${SAVE_KEY_PREFIX}${slot}`);
}

export function getSaveMetadata(slot: SaveSlot): { savedAt: number; gameMode: string; totalPlayTime: number } | null {
  const data = loadFromSlot(slot);
  if (!data) return null;
  return { savedAt: data.savedAt, gameMode: data.gameMode, totalPlayTime: data.totalPlayTime };
}

// ── Auto-save ─────────────────────────────────────────────────

let autoSaveTimer: ReturnType<typeof setInterval> | null = null;

export function startAutoSave(intervalSeconds = 30): void {
  stopAutoSave();
  autoSaveTimer = setInterval(() => {
    saveToSlot(AUTO_SAVE_SLOT);
  }, intervalSeconds * 1000);
}

export function stopAutoSave(): void {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
}

export function manualSave(slot: SaveSlot = AUTO_SAVE_SLOT): void {
  saveToSlot(slot);
}

// ── Export / Import ───────────────────────────────────────────

export function exportSave(): string {
  const data = collectSaveData();
  return btoa(JSON.stringify(data)); // base64 encode
}

export function importSave(encoded: string): boolean {
  try {
    const json = atob(encoded);
    const data = JSON.parse(json) as SaveData;
    if (!data.version || !data.player) throw new Error('Invalid save data');
    applySaveData(data);
    saveToSlot(AUTO_SAVE_SLOT);
    return true;
  } catch (e) {
    console.error('Failed to import save:', e);
    return false;
  }
}

export function exportSaveAsFile(): void {
  const data = collectSaveData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `melvor_save_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Game initialization ───────────────────────────────────────

export function initGame(): void {
  try {
    // Try to load auto-save
    const autoSave = loadFromSlot(AUTO_SAVE_SLOT);
    if (autoSave && autoSave.player && autoSave.bank) {
      applySaveData(autoSave);
    }
  } catch (e) {
    console.warn('Could not load existing save, initializing fresh game state:', e);
  }

  try {
    // Start auto-save timer
    const settings = useSettingsStore.getState();
    if (settings && settings.autoSaveEnabled) {
      startAutoSave(settings.autoSaveInterval || 30);
    }
  } catch (e) {
    console.error('Failed to start auto-save:', e);
  }
}


// ── Оффлайн: сохраняем момент ухода игрока ──────────────────────

const LEAVE_TIME_KEY = 'aethelia_leave_time';

/** Вызывается когда игрок уходит с вкладки/закрывает браузер */
export function saveOnLeave(): void {
  try {
    // Сохраняем игру
    manualSave();
    // Записываем точное время ухода
    localStorage.setItem(LEAVE_TIME_KEY, String(Date.now()));
  } catch (e) {
    // silent fail
  }
}

/** Читает время ухода и возвращает сколько прошло (ms) */
export function getOfflineDuration(): number {
  try {
    const leaveTime = Number(localStorage.getItem(LEAVE_TIME_KEY) || '0');
    if (!leaveTime) return 0;
    const elapsed = Date.now() - leaveTime;
    // Сбрасываем время ухода
    localStorage.removeItem(LEAVE_TIME_KEY);
    return elapsed;
  } catch {
    return 0;
  }
}

/** Инициализирует обработчики ухода игрока */
export function setupOfflineTracking(): void {
  // Закрытие вкладки/браузера
  window.addEventListener('beforeunload', saveOnLeave);
  // Переход на другую вкладку / скрытие
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      saveOnLeave();
    }
  });
  // Мобильные устройства — приложение уходит в фон
  window.addEventListener('pagehide', saveOnLeave);
}
