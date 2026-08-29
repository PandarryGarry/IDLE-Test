/**
 * Небольшое transient-состояние для кинематографичных переходов онбординга.
 *
 * Входная сцена показывается максимум раз за вкладку; выходная ставится в
 * очередь после создания/выбора героя и переживает смену route в рамках
 * текущей вкладки. Это не часть игрового сейва и не попадает в облако.
 */

export type QueuedCinematic = "departure";

const ENTRANCE_SEEN_KEY = "aethelia_cinematic_entrance_seen_v1";
const QUEUED_SCENE_KEY = "aethelia_cinematic_queued_scene_v1";

export const CINEMATIC_QUEUE_EVENT = "aethelia:cinematic-queued";

function getSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function readSessionItem(key: string): string | null {
  try {
    return getSessionStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeSessionItem(key: string, value: string | null): void {
  try {
    const storage = getSessionStorage();
    if (!storage) return;
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, value);
  } catch {
    // Катсцена остаётся лишь приятным дополнением — storage не должен блокировать путь.
  }
}

export function hasSeenEntranceCinematic(): boolean {
  return readSessionItem(ENTRANCE_SEEN_KEY) === "1";
}

export function markEntranceCinematicSeen(): void {
  writeSessionItem(ENTRANCE_SEEN_KEY, "1");
}

export function getQueuedCinematic(): QueuedCinematic | null {
  const queued = readSessionItem(QUEUED_SCENE_KEY);
  return queued === "departure" ? queued : null;
}

export function queueCinematic(scene: QueuedCinematic): void {
  writeSessionItem(QUEUED_SCENE_KEY, scene);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<QueuedCinematic>(CINEMATIC_QUEUE_EVENT, {
        detail: scene,
      }),
    );
  }
}

export function clearQueuedCinematic(): void {
  writeSessionItem(QUEUED_SCENE_KEY, null);
}
