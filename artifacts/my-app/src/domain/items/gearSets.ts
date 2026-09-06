/**
 * Наборы снаряжения героя — до трёх пресетов.
 *
 * Набор — снапшот текущего экипа (все 16 слотов).
 *  «Сохранить в набор» — записать копию того, что надето.
 *  «Надеть набор» — снять лишнее в сумку и надеть то, что в сумке есть.
 *    Предмет, которого нет ни на теле, ни в сумке (продали после
 *    сохранения), не трогаем: слот остаётся как есть, результат — partial.
 *
 * Живое состояние — модульное, как у столпов (characterAttributes):
 * collectSaveData подхватит его сам, в save_data уходит commitGearSets.
 */
import {
  GEAR_SETS_MAX,
  normalizeEquipment,
  type EquipSlot,
  type Equipment,
  type GearSetPreset,
  type GearSetsState,
} from '../../data/types.ts';
import { useBankStore } from '../../store/bankStore.ts';
import { usePlayerStore } from '../../store/playerStore.ts';

let liveGearSets: GearSetsState | null = null;

export function setLiveGearSets(state: GearSetsState | null): void {
  liveGearSets = state;
}

export function getLiveGearSets(): GearSetsState {
  return liveGearSets ?? createEmptyGearSets();
}

export function createEmptyGearSets(): GearSetsState {
  return {
    version: 1,
    presets: Array.from({ length: GEAR_SETS_MAX }, () => null),
  };
}

/** Жёсткий парсер из save_data: чужая форма — пустые наборы, без краша. */
export function migrateGearSets(raw: unknown): GearSetsState {
  const empty = createEmptyGearSets();
  if (!raw || typeof raw !== 'object') return empty;
  const arr = (raw as { presets?: unknown }).presets;
  if (!Array.isArray(arr)) return empty;
  const presets: (GearSetPreset | null)[] = Array.from(
    { length: GEAR_SETS_MAX },
    (_, i) => {
      const p = arr[i];
      if (!p || typeof p !== 'object') return null;
      const candidate = p as GearSetPreset;
      if (!candidate.equipment || typeof candidate.equipment !== 'object') return null;
      return {
        name:
          typeof candidate.name === 'string' && candidate.name
            ? candidate.name
            : `Набор ${i + 1}`,
        equipment: normalizeEquipment(candidate.equipment),
      };
    },
  );
  return { version: 1, presets };
}

/**
 * Порядок операций при надевании: руки первыми (двуручное расчищает
 * обе руки до остального), дальше по телу. cape/quiver/passive — тоже
 * участвуют: слоты скрыты в UI, но в снапшоте живут.
 */
const SLOT_ORDER: EquipSlot[] = [
  'weapon', 'shield',
  'helm', 'platebody', 'belt', 'gloves', 'platelegs', 'boots',
  'amulet', 'ring', 'ring2', 'bracelet', 'bracelet2',
  'cape', 'quiver', 'passive',
];

/** Записать текущий экип в пресет `index`. null — индекс вне диапазона. */
export function saveGearSet(index: number): GearSetsState | null {
  if (index < 0 || index >= GEAR_SETS_MAX) return null;
  const equipment = usePlayerStore.getState().equipment;
  const preset: GearSetPreset = {
    name: `Набор ${index + 1}`,
    equipment: { ...equipment },
  };
  const presets = getLiveGearSets().presets.slice();
  presets[index] = preset;
  return { version: 1, presets };
}

export type GearSetLoadResult =
  | { ok: true; partial: boolean }
  | { ok: false; reason: 'empty' | 'bag-full' };

/**
 * Надеть пресет `index`.
 *
 * - Если ни один набор ещё не был сохранён игроком — ничего не трогаем (reason: 'empty').
 * - Если игрок сохранил хотя бы один набор, а затем выбрал пустой набор — освобождаем все слоты (снимаем экипировку в сумку).
 * - Если выбран сохранённый набор — снимаем лишнее и надеваем предметы набора.
 */
export function loadGearSet(index: number): GearSetLoadResult {
  if (index < 0 || index >= GEAR_SETS_MAX) return { ok: false, reason: 'empty' };
  const presets = getLiveGearSets().presets;
  const preset = presets[index];
  const player = usePlayerStore.getState();
  const bank = useBankStore.getState();
  const current = player.equipment;

  const hasAnySaved = presets.some(p => p !== null);

  if (!preset) {
    if (!hasAnySaved) {
      // Игрок ещё не сохранил ни одного набора
      return { ok: false, reason: 'empty' };
    }
    // Освобождаем все слоты (снимаем в сумку)
    const displacedIds: string[] = [];
    for (const slot of SLOT_ORDER) {
      const id = current[slot];
      if (id && !displacedIds.includes(id)) {
        displacedIds.push(id);
      }
    }
    if (displacedIds.length > 0 && !player.canBankTake(displacedIds)) {
      return { ok: false, reason: 'bag-full' };
    }
    for (const slot of SLOT_ORDER) {
      if (current[slot]) {
        player.unequipItem(slot);
      }
    }
    return { ok: true, partial: false };
  }

  const target = preset.equipment;

  // 1а. Что сойдёт в сумку.
  const displacedIds: string[] = [];
  for (const slot of SLOT_ORDER) {
    const id = current[slot];
    if (id && id !== target[slot] && !displacedIds.includes(id)) {
      displacedIds.push(id);
    }
  }
  if (displacedIds.length > 0 && !player.canBankTake(displacedIds)) {
    return { ok: false, reason: 'bag-full' };
  }

  // 1б. Чего не хватает — не меняет исход, но результат помечаем partial.
  let partial = false;
  for (const slot of SLOT_ORDER) {
    const want = target[slot];
    if (want && want !== current[slot] && bank.getItemQty(want) <= 0) {
      partial = true;
    }
  }

  // 2. Снять лишнее.
  for (const slot of SLOT_ORDER) {
    const id = current[slot];
    if (id && id !== target[slot]) {
      player.unequipItem(slot);
    }
  }

  // 3. Надеть.
  for (const slot of SLOT_ORDER) {
    const want = target[slot];
    if (!want) continue;
    const now = usePlayerStore.getState().equipment[slot];
    if (now === want) continue;
    if (bank.getItemQty(want) <= 0) continue; // пропал из мира — не трогаем
    const oldItem = player.equipItem(want, slot);
    bank.removeItem(want, 1);
    if (oldItem) bank.addItem(oldItem, 1);
  }

  return { ok: true, partial };
}
