// Save/Load manager for Aethelia Idle RPG
// Supports: localStorage auto-save, multiple save slots, JSON export/import

import type { SaveData } from '@/data/types';
import { usePlayerStore } from '@/store/playerStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { GUEST_NOTICE } from '@/lib/guestMode';
import { calculateOfflineProgress } from '@/core/offlineProgress';
import { skillNameRu } from '@/lib/skillNames';
import { getLiveAttributes, setLiveAttributes, createDefaultAttributes, migrateSaveAttributes } from '@/domain/attributes/characterAttributes';
import { isPrimaryTab, startTabAuthority } from '@/lib/tabAuthority';
import {
  encodeSaveJson,
  isFullSaveShape,
  normalizeSaveData,
  parseSaveInput,
} from '@/lib/saveSchema';
import {
  AUTOSAVE_INTERVAL_S_DEFAULT,
  AUTOSAVE_INTERVAL_S_MIN,
} from '@/data/balance/loop';
import {
  createEmptyGearSets,
  getLiveGearSets,
  migrateGearSets,
  setLiveGearSets,
} from '@/domain/items/gearSets';

const SAVE_VERSION = '1.0.0';
const SAVE_KEY_PREFIX = 'aethelia_save_';
const GUEST_SAVE_KEY_PREFIX = 'aethelia_guest_save_';
export const AUTO_SAVE_SLOT = 'auto';
export const SAVE_SLOTS = ['slot1', 'slot2', 'slot3'] as const;
export type SaveSlot = typeof SAVE_SLOTS[number] | typeof AUTO_SAVE_SLOT;

function isGuestMode(): boolean {
  // Load safely in case this is called before the auth store is hydrated.
  try {
    return useAuthStore.getState().isGuest;
  } catch {
    return false;
  }
}

/**
 * Guests keep progress in sessionStorage only (disappears when the tab
 * closes). Registered players keep their saves in localStorage.
 */
function saveKey(slot: SaveSlot): string {
  const prefix = isGuestMode() ? GUEST_SAVE_KEY_PREFIX : SAVE_KEY_PREFIX;
  return `${prefix}${slot}`;
}

function leaveTimeKey(): string {
  return isGuestMode() ? 'aethelia_guest_leave_time' : 'aethelia_leave_time';
}

export function collectSaveData(): SaveData {
  const player = usePlayerStore.getState();
  const inventory = useInventoryStore.getState();
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
    inventory: {
      items: inventory.items,
      gp: inventory.gp,
      maxSlots: inventory.maxSlots,
    },
    game: {
      activeSkill: game.activeSkill,
      activeActionId: game.activeActionId,
      activeAreaId: null,
      activeMonsterId: null,
    },
    settings: {},
    attributes: getLiveAttributes(),
    gearSets: getLiveGearSets(),
  };
}

export function applySaveData(raw: SaveData): void {
  // Единственная воронка «сейв → сторы»: прогоняем через контракт
  // (`lib/saveSchema`), иначе в сторы течёт что попало из localStorage/облака.
  const data = normalizeSaveData(raw) ?? raw;
  // «Полный» профиль — есть и герой, и сумка. Голый сейв (атрибуты без
  // инвентаря — так `createCharacter` пишет героя до первого пуша) НЕ имеет
  // права затирать сумку и XP: применяем только столпы/наборы.
  const fullSave = isFullSaveShape(raw);
  const playerStore = usePlayerStore.getState();
  const inventory = useInventoryStore.getState();
  const gameStore = useGameStore.getState();

  setLiveAttributes(migrateSaveAttributes(data.attributes));
  setLiveGearSets(migrateGearSets(data.gearSets));
  if (!fullSave) return;

  playerStore.loadFromSave(data.player.skills, data.player.equipment);
  // Инвентарь уже нормализован (включая старый блок `bank`) в saveSchema.
  inventory.loadFromSave(data.inventory.items, data.inventory.gp, data.inventory.maxSlots);
  gameStore.loadFromSave({
    gameMode: data.gameMode,
    totalPlayTime: data.totalPlayTime ?? 0,
    activeSkill: data.game?.activeSkill ?? null,
    activeActionId: data.game?.activeActionId ?? null,
    lastSaveTime: data.savedAt ?? Date.now(),
  });

  // Автоматически возобновляем активный навык
  if (data.game?.activeSkill && data.game?.activeActionId) {
    // Небольшая задержка чтобы tickManager успел запуститься
    setTimeout(() => {
      const gs = useGameStore.getState();
      if (!gs.isRunning && data.game?.activeSkill && data.game?.activeActionId) {
        gs.startSkillAction(data.game.activeSkill, data.game.activeActionId);
      }
    }, 500);
  }

  // Calculate offline progress and store result for Dashboard display
  // Используем leaveTime (точное время ухода) если есть, иначе savedAt
  const leaveStore = isGuestMode() ? window.sessionStorage : window.localStorage;
  const leaveTime = Number(leaveStore.getItem(leaveTimeKey()) || '0') || data.savedAt;
  if (data.game?.activeSkill && data.game?.activeActionId) {
    const offlineResult = calculateOfflineProgress(data.game.activeSkill, data.game.activeActionId, leaveTime);
    if (offlineResult && offlineResult.xpGained > 0) {
      useGameStore.setState({
        offlineData: {
          totalMinutes: Math.floor(offlineResult.offlineMs / 60_000),
          rewards: [{
            icon: '🌿',
            skill: skillNameRu(data.game.activeSkill),
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
  // Автозейв пишет только вкладка-хозяин (см. lib/tabAuthority): иначе две
  // вкладки затирают друг друга, а `pagehide` фоновой убивает свежий прогресс.
  if (slot === AUTO_SAVE_SLOT && !isPrimaryTab()) return;
  try {
    const data = collectSaveData();
    const json = JSON.stringify(data);
    const store = isGuestMode() ? window.sessionStorage : window.localStorage;
    store.setItem(saveKey(slot), json);
  } catch (e) {
    console.error('Failed to save game:', e);
  }
}

export function loadFromSlot(slot: SaveSlot): SaveData | null {
  try {
    const store = isGuestMode() ? window.sessionStorage : window.localStorage;
    const json = store.getItem(saveKey(slot));
    if (!json) return null;
    return normalizeSaveData(JSON.parse(json) as unknown) ?? null;
  } catch (e) {
    console.error('Failed to load save:', e);
    return null;
  }
}

export function deleteSaveSlot(slot: SaveSlot): void {
  try {
    const store = isGuestMode() ? window.sessionStorage : window.localStorage;
    store.removeItem(saveKey(slot));
  } catch (e) {
    console.error('Failed to delete save:', e);
  }
}

/** True when the current player is a guest (progress is session-only). */
export function isGuestProgress(): boolean {
  return isGuestMode();
}

/** The message shown to guests when they hit a restricted feature. */
export function guestProgressNotice(): string {
  return GUEST_NOTICE;
}

export function getSaveMetadata(slot: SaveSlot): { savedAt: number; gameMode: string; totalPlayTime: number } | null {
  const data = loadFromSlot(slot);
  if (!data) return null;
  return { savedAt: data.savedAt, gameMode: data.gameMode, totalPlayTime: data.totalPlayTime };
}

// ── Auto-save ─────────────────────────────────────────────────

let autoSaveTimer: ReturnType<typeof setInterval> | null = null;

export function startAutoSave(intervalSeconds = AUTOSAVE_INTERVAL_S_DEFAULT): void {
  stopAutoSave();
  const seconds = Number.isFinite(intervalSeconds)
    ? Math.max(AUTOSAVE_INTERVAL_S_MIN, Math.floor(intervalSeconds))
    : AUTOSAVE_INTERVAL_S_DEFAULT;
  autoSaveTimer = setInterval(() => {
    saveToSlot(AUTO_SAVE_SLOT);
  }, seconds * 1000);
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
  // Не `btoa`: в сейве живут юникод-строки (названия наборов «Набор 1»),
  // на них `btoa` бросает InvalidCharacterError.
  return encodeSaveJson(JSON.stringify(data));
}

/** Принимает и нашу Base64-строку, и голый JSON из файла экспорта. */
export function importSave(input: string): boolean {
  const data = parseSaveInput(input);
  if (!data) {
    console.error('Failed to import save: не похоже на сейв');
    return false;
  }
  try {
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
  a.download = `aethelia_save_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Game initialization ───────────────────────────────────────

export function initGame(): void {
  try {
    // Try to load auto-save
    const autoSave = loadFromSlot(AUTO_SAVE_SLOT);
    const hasInv = Boolean(autoSave
      && ((autoSave as { inventory?: unknown }).inventory
        || (autoSave as unknown as { bank?: unknown }).bank));
    if (autoSave && autoSave.player && hasInv) {
      applySaveData(autoSave);
    }
  } catch (e) {
    console.warn('Could not load existing save, initializing fresh game state:', e);
  }

  try {
    // Start auto-save timer
    const settings = useSettingsStore.getState();
    if (settings && settings.autoSaveEnabled) {
      startAutoSave(settings.autoSaveInterval || AUTOSAVE_INTERVAL_S_DEFAULT);
    }
  } catch (e) {
    console.error('Failed to start auto-save:', e);
  }
}


/**
 * Полностью сбросить игровое состояние к дефолтам и очистить локальный
 * автосейв. Вызывается при создании нового персонажа (1 персонаж/аккаунт),
 * чтобы герой начинал с одинаковых стартовых характеристик.
 */
export function resetGameToFresh(): void {
  try {
    deleteSaveSlot(AUTO_SAVE_SLOT);
    usePlayerStore.getState().reset();
    useInventoryStore.getState().reset();
    useGameStore.getState().reset();
    setLiveAttributes(createDefaultAttributes());
    setLiveGearSets(createEmptyGearSets());
  } catch (e) {
    console.error('resetGameToFresh failed:', e);
  }
}


// ── Оффлайн: сохраняем момент ухода игрока ──────────────────────

/** Вызывается когда игрок уходит с вкладки/закрывает браузер */
export function saveOnLeave(): void {
  try {
    // Сохраняем игру
    manualSave();
    // Записываем точное время ухода
    const store = isGuestMode() ? window.sessionStorage : window.localStorage;
    store.setItem(leaveTimeKey(), String(Date.now()));
  } catch (e) {
    // silent fail
  }
}

/** Момент ухода, без сброса. Для карточки выбора героя. */
export function peekLeaveTime(): number {
  try {
    const store = isGuestMode() ? window.sessionStorage : window.localStorage;
    const leaveTime = Number(store.getItem(leaveTimeKey()) || '0');
    return Number.isFinite(leaveTime) && leaveTime > 0 ? leaveTime : 0;
  } catch {
    return 0;
  }
}

/** Читает время ухода и возвращает сколько прошло (ms) */
export function getOfflineDuration(): number {
  try {
    const store = isGuestMode() ? window.sessionStorage : window.localStorage;
    const leaveTime = Number(store.getItem(leaveTimeKey()) || '0');
    if (!leaveTime) return 0;
    const elapsed = Date.now() - leaveTime;
    // Сбрасываем время ухода
    store.removeItem(leaveTimeKey());
    return elapsed;
  } catch {
    return 0;
  }
}

/** Инициализирует обработчики ухода игрока */
let offlineTrackingArmed = false;

/** Идемпотентно: повторный вызов (StrictMode, ретрай инициализации) не вешает второй набор слушателей. */
export function setupOfflineTracking(): void {
  if (offlineTrackingArmed) return;
  offlineTrackingArmed = true;
  // Арбитраж вкладок живёт рядом: он решает, КОТОРАЯ из них пишет сейвы.
  startTabAuthority();
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
