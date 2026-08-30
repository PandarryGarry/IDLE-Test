/**
 * Transient-состояние кинематографичных битов «дороги» героя.
 *
 * - Полный пролог — РАЗ ЗА УСТРОЙСТВО (localStorage): первый запуск нового
 *   игрока видит руна-карточку и историю континента ДО заставки.
 *   Повторный вход с устройства начинается сразу с заставки.
 * - Связка в ложу и выходы в город ставятся в очередь страницами
 *   (rules/create/select) и переживают смену route в текущей вкладке.
 *
 * Это не часть игрового сейва и не попадает в облако.
 */

export type QueuedCinematic =
  | 'entrance-returning'
  | 'lodge'
  | 'departure-new-hero'
  | 'departure-returning';

const FULL_PROLOGUE_SEEN_KEY = 'aethelia_prologue_seen_v1';
const QUEUED_SCENE_KEY = 'aethelia_cinematic_queued_scene_v1';

export const CINEMATIC_QUEUE_EVENT = 'aethelia:cinematic-queued';

const QUEUED_VALUES: readonly QueuedCinematic[] = [
  'entrance-returning',
  'lodge',
  'departure-new-hero',
  'departure-returning',
];

function getLocalSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getTabSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function readItem(storage: Storage | null, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeItem(storage: Storage | null, key: string, value: string | null): void {
  try {
    if (!storage) return;
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, value);
  } catch {
    // Катсцена остаётся лишь приятным дополнением — storage не блокирует путь.
  }
}

/* ── Полный пролог: раз за устройство ───────────────────────────── */

export function hasSeenFullPrologue(): boolean {
  return readItem(getLocalSessionStorage(), FULL_PROLOGUE_SEEN_KEY) === '1';
}

export function markFullPrologueSeen(): void {
  writeItem(getLocalSessionStorage(), FULL_PROLOGUE_SEEN_KEY, '1');
}

/* ── Очередь оверлейных сцен (ложа/выходы) ──────────────────────── */

export function getQueuedCinematic(): QueuedCinematic | null {
  const queued = readItem(getTabSessionStorage(), QUEUED_SCENE_KEY);
  return QUEUED_VALUES.includes(queued as QueuedCinematic)
    ? (queued as QueuedCinematic)
    : null;
}

export function queueCinematic(scene: QueuedCinematic): void {
  writeItem(getTabSessionStorage(), QUEUED_SCENE_KEY, scene);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<QueuedCinematic>(CINEMATIC_QUEUE_EVENT, {
        detail: scene,
      }),
    );
  }
}

export function clearQueuedCinematic(): void {
  writeItem(getTabSessionStorage(), QUEUED_SCENE_KEY, null);
}
