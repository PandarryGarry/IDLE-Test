// ── Облачный мост трёхуровневого сохранения (Этап 4) ──────────────
// Уровни:
//   1. Память        — состояния zustand-сторов (всегда).
//   2. Локально       — localStorage через saveManager (каждые 30с).
//   3. Облако        — character.save_data в Supabase (~каждые 3 мин + pagehide).
// При старте берём более свежий из локального/облачного сейва.

import { useCharacterStore } from '@/store/characterStore';
import {
  collectSaveData,
  applySaveData,
  loadFromSlot,
  saveToSlot,
  AUTO_SAVE_SLOT,
} from './saveManager';
import { saveCharacterToCloud, loadCharacterFromCloud } from './characterApi';
import { isSupabaseConfigured } from './supabase';
import type { SaveData } from '@/data/types';
import type { Character } from './characterApi';

const CLOUD_INTERVAL_MS = 3 * 60 * 1000; // ~3 мин
const CHECK_INTERVAL_MS = 30 * 1000;      // проверяем каждые 30с (локальный сейв — там же)

let cloudTimer: ReturnType<typeof setInterval> | null = null;
let lastCloudPush = 0;
let currentCharacterId: string | null = null;

function isValidSave(data: SaveData | null | undefined): data is SaveData {
  return Boolean(data && typeof data === 'object' && data.player && data.bank);
}

/** Отправить текущее состояние в облако (throttle ~3 мин, force обходит). */
export async function pushCharacterCloud(force = false): Promise<void> {
  const active = useCharacterStore.getState().activeCharacter;
  if (!active) return;
  if (!isSupabaseConfigured) return;

  const now = Date.now();
  if (!force && now - lastCloudPush < CLOUD_INTERVAL_MS) return;

  try {
    const data = collectSaveData();
    await saveCharacterToCloud(active.id, data);
    lastCloudPush = now;
  } catch (e) {
    console.warn('pushCharacterCloud failed:', e);
  }
}

/**
 * При активации персонажа: сравнить локальный и облачный сейв,
 * применить более свежий, синхронизировать остальные.
 */
export async function reconcileCharacterSave(character: Character): Promise<void> {
  if (!isSupabaseConfigured) {
    if (isValidSave(character.saveData)) {
      applySaveData(character.saveData);
    }
    return;
  }

  const localRaw = loadFromSlot(AUTO_SAVE_SLOT);
  const local = isValidSave(localRaw) ? localRaw : null;

  let cloud: SaveData | null = null;
  try {
    const raw = await loadCharacterFromCloud(character.id);
    cloud = isValidSave(raw) ? raw : null;
  } catch (e) {
    console.warn('loadCharacterFromCloud failed:', e);
  }

  const localTime = local?.savedAt ?? 0;
  const cloudTime = cloud?.savedAt ?? 0;

  if (cloud && cloudTime > localTime) {
    // Облако новее — применяем его.
    applySaveData(cloud);
    saveToSlot(AUTO_SAVE_SLOT);
    lastCloudPush = Date.now();
  } else if (local) {
    // Локальный не старше (или нет облака) — заливаем локальный в облако.
    await saveCharacterToCloud(character.id, local);
    lastCloudPush = Date.now();
  }
  // Если ничего нет — оставляем свежее состояние в сторах.
}

function handleVisibility(): void {
  if (document.hidden) {
    void pushCharacterCloud(true);
  }
}

function handlePageHide(): void {
  void pushCharacterCloud(true);
}

/** Запустить цикл облачного сохранения для активного персонажа. */
export function startCharacterSaveLoop(characterId: string): void {
  stopCharacterSaveLoop();
  currentCharacterId = characterId;

  cloudTimer = setInterval(() => {
    void pushCharacterCloud(false);
  }, CHECK_INTERVAL_MS);

  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('pagehide', handlePageHide);
}

export function stopCharacterSaveLoop(): void {
  if (cloudTimer) {
    clearInterval(cloudTimer);
    cloudTimer = null;
  }
  currentCharacterId = null;
  document.removeEventListener('visibilitychange', handleVisibility);
  window.removeEventListener('pagehide', handlePageHide);
}

export function isCharacterSaveLoopRunning(): boolean {
  return Boolean(cloudTimer && currentCharacterId);
}
