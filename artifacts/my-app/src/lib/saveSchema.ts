/**
 * Контракт сейва: толерантный нормализатор `SaveData` + кодирование импорта.
 *
 * Почему это отдельный чистый модуль (`lib/`, без стор и без React):
 * сейв — ЕДИНСТВЕННЫЙ недоверенный ввод в игре. Он приходит из localStorage,
 * из облачного `characters.save_data` (который игрок может править в DevTools)
 * и из строки импорта. Раньше весь путь был «`JSON.parse(...) as SaveData`» —
 * то есть приведение вместо проверки, и в сторах оседало что угодно:
 * `gameMode: "normal"` (нет такого в типе — TS не ругался, потому что ветка
 * `??` для необязательного поля невидна), `maxSlots: 40` из чужого фолбэка
 * при базовых 24, массив предметов из 100 000 записей, `NaN` вместо числа.
 *
 * Правила нормализации (в духе `migrateSaveAttributes`):
 *   • не отвергаем «почти правильный» сейв — чиним поле и идём дальше;
 *   • мусор конкретного поля ≠ потеря прогресса всего сейва;
 *   • ничего не придумываем: неизвестные ключи выпадают, чужие id предметов
 *     оставляем как есть (их судьба — `legacyMigration`, и шаг 7 UI-плана).
 *
 * Модуль намеренно не импортирует сторы: тесты гоняются `node --test`
 * без установленных зависимостей.
 */
import {
  ALL_SKILL_IDS,
  EMPTY_EQUIPMENT,
  type Equipment,
  type GameMode,
  type InventorySlot,
  type SkillId,
  type SkillState,
  type SaveData,
} from '../data/types.ts';
import {
  INVENTORY_BASE_SLOTS,
  INVENTORY_SAVE_ITEM_HARD_CAP,
} from '../data/balance/inventory.ts';

/** Значения `GameMode` — один список на тип и на валидацию. */
export const GAME_MODES: readonly GameMode[] = ['standard', 'hardcore', 'adventure'];
export const DEFAULT_GAME_MODE: GameMode = 'standard';

/** Разумный потолок слотов: защита от «максимального» сейва на 10^9 мест. */
const MAX_SLOTS_CEILING = 512;

function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clampedInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = finiteNumber(value, NaN);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

/** Строка с содержимым: `'  '` как id предмета — это тоже пусто. */
function nonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function objectOf(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/** Урезанный, но полный навык: только известные id, только конечные числа. */
function normalizeSkills(raw: unknown): Record<SkillId, SkillState> {
  const src = objectOf(raw);
  const out = {} as Record<SkillId, SkillState>;
  for (const skillId of ALL_SKILL_IDS) {
    const entry = objectOf(src[skillId]);
    const masteryRaw = objectOf(entry.mastery);
    const mastery: Record<string, number> = {};
    for (const [actionId, value] of Object.entries(masteryRaw)) {
      const xp = finiteNumber(value, 0);
      if (xp > 0) mastery[actionId] = Math.floor(xp);
    }
    out[skillId] = {
      level: clampedInt(entry.level, 1, 999, 1),
      xp: Math.max(0, Math.floor(finiteNumber(entry.xp, 0))),
      unlocked: entry.unlocked !== false,
      mastery,
    };
  }
  return out;
}

/** Экип: известные слоты, в слоте — либо строка-id, либо null. */
function normalizeEquipment(raw: unknown): Equipment {
  const src = objectOf(raw);
  const out = { ...EMPTY_EQUIPMENT } as Record<string, string | null>;
  for (const slot of Object.keys(EMPTY_EQUIPMENT)) {
    out[slot] = nonEmptyString(src[slot]);
  }
  return out as unknown as Equipment;
}

function normalizeInventory(raw: unknown): SaveData['inventory'] {
  // Совместимость: в старых сейвах блок назывался `bank`.
  const src = objectOf(raw);
  const maxSlots = clampedInt(src.maxSlots, INVENTORY_BASE_SLOTS, MAX_SLOTS_CEILING, INVENTORY_BASE_SLOTS);
  const rawItems = Array.isArray(src.items) ? src.items : [];
  const items: InventorySlot[] = [];
  for (const candidate of rawItems) {
    if (items.length >= INVENTORY_SAVE_ITEM_HARD_CAP) break;
    const entry = objectOf(candidate);
    const itemId = nonEmptyString(entry.itemId);
    if (!itemId) continue;
    // Нулевое/отрицательное количество = «слота нет», а не «подними до 1».
    const qty = finiteNumber(entry.quantity, NaN);
    if (!Number.isFinite(qty) || qty < 1) continue;
    const quantity = Math.min(Number.MAX_SAFE_INTEGER, Math.floor(qty));
    items.push({
      itemId,
      quantity,
      locked: entry.locked === true,
      tab: clampedInt(entry.tab, 0, 99, 0),
    });
  }
  return {
    items,
    gp: Math.max(0, Math.floor(finiteNumber(src.gp, 0))),
    maxSlots,
  };
}

function normalizeGameBlock(raw: unknown): SaveData['game'] {
  const src = objectOf(raw);
  const activeSkill = nonEmptyString(src.activeSkill);
  return {
    activeSkill: ALL_SKILL_IDS.includes(activeSkill as SkillId) ? (activeSkill as SkillId) : null,
    activeActionId: nonEmptyString(src.activeActionId),
    // Активный бой в сейв не пишется (см. collectSaveData) — поля для старых форм.
    activeAreaId: nonEmptyString(src.activeAreaId),
    activeMonsterId: nonEmptyString(src.activeMonsterId),
  };
}

/**
 * «Полный» сейв — тот, у которого есть и герой, и сумка.
 * Единственное определение для `saveManager` и для облачного reconcile:
 * раньше «что считать валидным» было записано в двух местах по-разному.
 */
export function isFullSaveShape(raw: unknown): raw is SaveData {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
  const rec = raw as Record<string, unknown>;
  if (!rec.player || typeof rec.player !== 'object') return false;
  return Boolean(
    (rec.inventory && typeof rec.inventory === 'object') || (rec.bank && typeof rec.bank === 'object'),
  );
}

/**
 * Сырой объект → пригодный для стор `SaveData`. `null`, если объект вообще
 * не похож на сейв (тогда вызывающий решает сам: дефолты или «не трогаем»).
 */
export function normalizeSaveData(raw: unknown): SaveData | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const src = raw as Record<string, unknown>;
  const player = objectOf(src.player);
  const gameModeRaw = src.gameMode;
  const gameMode = GAME_MODES.includes(gameModeRaw as GameMode)
    ? (gameModeRaw as GameMode)
    : DEFAULT_GAME_MODE;

  return {
    version: typeof src.version === 'string' && src.version ? src.version : '0.0.0-unversioned',
    savedAt: Math.max(0, Math.floor(finiteNumber(src.savedAt, 0))),
    totalPlayTime: Math.max(0, Math.floor(finiteNumber(src.totalPlayTime, 0))),
    gameMode,
    player: {
      skills: normalizeSkills(player.skills),
      equipment: normalizeEquipment(player.equipment),
    },
    inventory: normalizeInventory(src.inventory ?? src.bank),
    game: normalizeGameBlock(src.game),
    // Настройки — устройством, не сейвом: см. store/settingsStore (persist).
    settings: {},
    attributes: src.attributes as SaveData['attributes'],
    gearSets: src.gearSets as SaveData['gearSets'],
  };
}

// ── Импорт/экспорт строки сейва ────────────────────────────────

/** JSON → Base64 по-юникодному. `btoa(json)` падал на «Набор 1» в gearSets. */
export function encodeSaveJson(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/** Base64 (наш экспорт) или голый JSON (файл «aethelia-save.json») → текст. */
export function decodeSaveInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return trimmed;
  try {
    const binary = atob(trimmed.replace(/\s+/g, ''));
    const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/** Строка импорта → нормализованный сейв (или `null` — «это не сейв»). */
export function parseSaveInput(input: string): SaveData | null {
  const json = decodeSaveInput(input);
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as unknown;
    const normalized = normalizeSaveData(parsed);
    return normalized && isFullSaveShape(parsed) ? normalized : null;
  } catch {
    return null;
  }
}
