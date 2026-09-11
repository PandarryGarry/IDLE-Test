/**
 * Кто из вкладок пишет сейвы (арбитраж «главной вкладки»).
 *
 * Проблема класса «idle-игра в двух вкладках»: обе вкладки крутят свои тики и
 * обе каждые 30 с пишут в один ключ `aethelia_save_auto`. Последний победитель
 * затирает прогресс второго — то есть игрок, который держит игру на телефоне и
 * на ноутбуке (или просто продублировал таб), теряет XP и сумку без всякого
 * сообщения. Плюс `pagehide` умирающей вкладки пишет свой устаревший снимок
 * поверх свежего.
 *
 * Что делаем (минимально и предсказуемо):
 *   • вкладка-хозяин держит «аренду» в localStorage и продлевает её;
 *   • видимая вкладка забирает аренду себе (переключился — значит играешь тут);
 *   • аренда истекает через LEASE_TTL_MS → следующая вкладка становится хозяином;
 *   • ПИШЕТ СЕЙВЫ ТОЛЬКО хозяин. Тики, бой и UI не трогаем: игра у обеих
 *     вкладок живая, ничего не «замирает» — спор идет только за запись.
 *
 * Нет BroadcastChannel / localStorage (приватный режим) → считаем себя
 * хозяином всегда: поведение ровно как до этого модуля.
 */

const LEASE_KEY = 'aethelia_tab_lease_v1';
/** Как часто обновляем аренду. */
const HEARTBEAT_MS = 1500;
/** После молчания хозяина столько же — аренда считается свободной. */
const LEASE_TTL_MS = 5000;
const CHANNEL_NAME = 'aethelia_tab_authority_v1';

interface Lease {
  tabId: string;
  at: number;
}

const tabId = `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

let running = false;
let primary = true;
let heartbeat: ReturnType<typeof setInterval> | null = null;
let channel: BroadcastChannel | null = null;
const listeners = new Set<(isPrimary: boolean) => void>();

function readLease(): Lease | null {
  try {
    const raw = window.localStorage.getItem(LEASE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Lease>;
    if (typeof parsed?.tabId !== 'string' || typeof parsed?.at !== 'number') return null;
    return { tabId: parsed.tabId, at: parsed.at };
  } catch {
    return null;
  }
}

function writeLease(): void {
  try {
    window.localStorage.setItem(LEASE_KEY, JSON.stringify({ tabId, at: Date.now() } satisfies Lease));
  } catch {
    // приватный режим / переполнение — остаёмся хозяином
  }
}

function setPrimary(next: boolean): void {
  if (primary === next) return;
  primary = next;
  for (const listener of listeners) {
    try {
      listener(primary);
    } catch {
      // слушатель не должен ронять арбитраж
    }
  }
}

/** Взяли аренду себе (и говорили об этом остальным). */
function claim(): void {
  writeLease();
  channel?.postMessage({ type: 'claim', tabId });
  setPrimary(true);
}

function beat(): void {
  const lease = readLease();
  const age = lease ? Date.now() - lease.at : Number.POSITIVE_INFINITY;
  if (primary) {
    if (lease && lease.tabId !== tabId && age < LEASE_TTL_MS) {
      // Кто-то другой честно забрал аренду (вторая вкладка стала видимой).
      setPrimary(false);
      return;
    }
    writeLease();
    return;
  }
  if (!lease || lease.tabId === tabId || age >= LEASE_TTL_MS) claim();
}

function handleVisibility(): void {
  if (document.visibilityState === 'visible') claim();
  else if (primary) beat();
}

function handlePageHide(): void {
  if (!primary) return;
  const lease = readLease();
  if (!lease || lease.tabId === tabId) {
    try {
      window.localStorage.removeItem(LEASE_KEY);
    } catch {
      /* ignore */
    }
  }
}

/** Запустить арбитраж. Идемпотентно — можно звать из любого места. */
export function startTabAuthority(): void {
  if (running) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  running = true;

  try {
    channel = 'BroadcastChannel' in window ? new BroadcastChannel(CHANNEL_NAME) : null;
  } catch {
    channel = null;
  }
  channel?.addEventListener('message', (event: MessageEvent) => {
    const data = event.data as { type?: string; tabId?: string } | null;
    if (data?.type === 'claim' && data.tabId && data.tabId !== tabId) setPrimary(false);
  });

  const lease = readLease();
  const fresh = lease && lease.tabId !== tabId && Date.now() - lease.at < LEASE_TTL_MS;
  if (fresh) {
    // Есть живой хозяин — уступаем, heartbeat перехватит, как только он отвалится.
    setPrimary(false);
  } else {
    claim();
  }

  heartbeat = setInterval(beat, HEARTBEAT_MS);
  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('pagehide', handlePageHide);
}

export function stopTabAuthority(): void {
  if (!running) return;
  running = false;
  if (heartbeat) clearInterval(heartbeat);
  heartbeat = null;
  document.removeEventListener('visibilitychange', handleVisibility);
  window.removeEventListener('pagehide', handlePageHide);
  channel?.close();
  channel = null;
  handlePageHide();
  setPrimary(true);
}

/** Пишет ли эта вкладка в хранилище. `true`, пока арбитраж не запущен. */
export function isPrimaryTab(): boolean {
  return primary;
}

/** Подписка на смену роли (для будущего UI «эта вкладка не главная»). */
export function onPrimaryTabChange(listener: (isPrimary: boolean) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
