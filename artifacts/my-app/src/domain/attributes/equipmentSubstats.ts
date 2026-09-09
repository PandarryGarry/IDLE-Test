/**
 * Мост «экип → реальные подхарактеристики тела» (12 статов, не старая ось).
 *
 * Чистый модуль без React/сохранений. Читает `Item.substatBonuses` (точечные
 * бонусы в «сырой» единице подхарактеристики), сверяет их с разрешённой осью
 * слота (data/balance/equipmentSubstats) и складывает по всем 16 слотам.
 * Результат докладывается к сырому значению подхарактеристики, посчитанному
 * столпами/ветвями (`computeSubstats`), ДО показа (кап/асимптота — в показе).
 *
 * Честность: предмет без `substatBonuses` не влияет на тело (ноль); бонус к
 * неразрешённой для слота оси отбрасывается и попадает в `dropped` (это
 * «нечестные» данные — их видно в дебаге, игроку не показываются).
 */
import {
  BRANCH_IDS,
  emptyBranchRanks,
  type BranchId,
  type BranchRanks,
} from './attributes.ts';
import { EQUIP_SLOT_SUBSTAT_AXES } from '../../data/balance/equipmentSubstats.ts';
import type { EquipSlot, Item } from '../../data/types.ts';

export interface DroppedSubstatBonus {
  slot: EquipSlot;
  itemId: string;
  substat: BranchId;
  value: number;
  reason: 'не ось слота' | 'не число';
}

export interface EquipmentSubstatSum {
  /** Итог по всем слотам: подхарактеристика → добавка (её сырая единица). */
  totals: BranchRanks;
  /** Разбивка по слотам для сводки/UI. */
  bySlot: Partial<Record<EquipSlot, Partial<Record<BranchId, number>>>>;
  /** Бонусы, которые не должны были попасть в данные (для аудита). */
  dropped: DroppedSubstatBonus[];
}

function finiteBonus(raw: unknown): number | null {
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : null;
}

/**
 * Бонусы одного предмета, прошедшие валидацию для данного слота:
 * только числа на разрешённой оси. «Нечестные» записи — в dropped.
 */
export function readSlotBonuses(
  item: Item,
  slot: EquipSlot,
): { bonuses: Partial<Record<BranchId, number>>; dropped: DroppedSubstatBonus[] } {
  const allowed = EQUIP_SLOT_SUBSTAT_AXES[slot];
  const bonuses: Partial<Record<BranchId, number>> = {};
  const dropped: DroppedSubstatBonus[] = [];
  const source = item.substatBonuses;

  if (!source) return { bonuses, dropped };
  for (const id of BRANCH_IDS) {
    const raw = source[id];
    if (raw === undefined) continue;
    const v = finiteBonus(raw);
    if (v === null) {
      dropped.push({ slot, itemId: item.id, substat: id, value: raw as number, reason: 'не число' });
      continue;
    }
    if (!allowed.includes(id)) {
      dropped.push({ slot, itemId: item.id, substat: id, value: v, reason: 'не ось слота' });
      continue;
    }
    bonuses[id] = (bonuses[id] ?? 0) + v;
  }
  return { bonuses, dropped };
}

/**
 * Сумма бонусов снаряжённого экипа → добавки к подхарактеристикам.
 * `lookup` — единая точка загрузки предмета (в игре — `getItem` из
 * domain/items/index, без админ-множителя цены здесь не связываемся).
 */
export function sumEquipmentBonuses(
  equipment: Partial<Record<EquipSlot, string | null>> | undefined,
  lookup: (itemId: string) => Item | undefined,
): EquipmentSubstatSum {
  const totals = emptyBranchRanks();
  const bySlot: EquipmentSubstatSum['bySlot'] = {};
  const dropped: DroppedSubstatBonus[] = [];

  if (!equipment) return { totals, bySlot, dropped };

  for (const slot of Object.keys(equipment) as EquipSlot[]) {
    const itemId = equipment[slot];
    if (!itemId) continue;
    const item = lookup(itemId);
    if (!item) continue; // предмет не существует — не считаем, не «врём»
    const { bonuses, dropped: droppedHere } = readSlotBonuses(item, slot);
    dropped.push(...droppedHere);
    if (Object.keys(bonuses).length === 0) continue;
    const slotMap: Partial<Record<BranchId, number>> = {};
    for (const [idStr, value] of Object.entries(bonuses) as [BranchId, number][]) {
      totals[idStr] += value;
      slotMap[idStr] = value;
    }
    bySlot[slot] = slotMap;
  }

  return { totals, bySlot, dropped };
}

/** Сырое значение подхарактеристики + экип-добавка (до показа/капа). */
export function foldBonusesIntoRaw(substats: BranchRanks, bonuses: BranchRanks): BranchRanks {
  const next = emptyBranchRanks();
  for (const id of BRANCH_IDS) {
    next[id] = substats[id] + bonuses[id];
  }
  return next;
}

/** Пустой итог — удобно, когда предметов нет. */
export function emptyEquipTotals(): BranchRanks {
  return emptyBranchRanks();
}
