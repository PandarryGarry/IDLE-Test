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
} from '@/lib/saveManager';
import { saveCharacterToCloud } from '@/lib/characterApi';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { SaveData } from '@/data/types';
import type { Character } from '@/lib/characterApi';

const CLOUD_INTERVAL_MS = 3 * 60 * 1000; // ~3 мин
const CHECK_INTERVAL_MS = 30 * 1000;      // проверяем каждые 30с (локальный сейв — там же)

let cloudTimer: ReturnType<typeof setInterval> | null = null;
let lastCloudPush = 0;
let currentCharacterId: string | null = null;

function isValidSave(data: SaveData | null | undefined): data is SaveData {
  return Boolean(data && typeof data === 'object' && data.player
    && ((data as { inventory?: unknown }).inventory
      || (data as unknown as { bank?: unknown }).bank));
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
 * Единственная точка восстановления состояния при активации персонажа.
 *
 * Решает, какой сейв авторитетный: локальный автосейв (частый — «рабочая
 * копия») или облачный слепок `character.save_data` (редкий бэкап).
 *
 * Гарантии:
 *   1. Кандидатом считается только ПОЛНЫЙ сейв (есть и `player`, и `inventory`).
 *      Частичный/«голый» облачный сейв (только `attributes` — то, что
 *      `createCharacter` пишет новому герою до первого пуша) НЕ конкурент
 *      и не может затереть свежий локальный прогресс.
 *   2. Авторитетный — самый свежий из валидных локального и облачного.
 *   3. Память ВСЕГДА приводится к выбранному сейву. Раньше, когда локальный
 *      был новее, его лишь заливали в облако, а в сторах оставался старый
 *      облачный слепок — свежая сумка и XP «пропадали» при возврате.
 *   4. Автосейв и облако синхронизируются с выбранным состоянием.
 */
export async function reconcileCharacterSave(character: Character): Promise<void> {
  const localRaw = loadFromSlot(AUTO_SAVE_SLOT);
  const local = isValidSave(localRaw) ? localRaw : null;
  const cloud = isValidSave(character.saveData) ? character.saveData : null;

  const localTime = local?.savedAt ?? 0;
  const cloudTime = cloud?.savedAt ?? 0;

  // Авторитетный: свежайший из валидных. Ничего валидного нет — не трогаем
  // сторы (свежий герой / первый вход уже держит корректные дефолты).
  const chosen: SaveData | null =
    local && cloud ? (cloudTime > localTime ? cloud : local)
      : (cloud || local);

  if (!chosen) return;

  if (chosen === cloud) {
    // Облако свежее (или единственное) — применяем его и фиксируем локально.
    applySaveData(chosen);
    saveToSlot(AUTO_SAVE_SLOT);
  } else {
    // Локальный новее (или облако «голое»/пустое) — ВОЗВРАЩАЕМ его в память
    // и поднимаем облако до него, чтобы бэкап не оставался позади.
    applySaveData(chosen);
    try {
      await saveCharacterToCloud(character.id, chosen);
    } catch (e) {
      console.warn('reconcileCharacterSave → cloud backup failed:', e);
    }
  }
  lastCloudPush = Date.now();

  // Держим активного героя в сторе согласованным с применённым сейвом,
  // чтобы последующие точечные правки (heroPersist) наследовали свежую базу.
  const store = useCharacterStore.getState();
  const active = store.activeCharacter;
  if (active && active.id === character.id) {
    const patched = { ...active, saveData: chosen };
    useCharacterStore.setState({
      activeCharacter: patched,
      characters: store.characters.map(row => (row.id === character.id ? patched : row)),
    });
  }
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
