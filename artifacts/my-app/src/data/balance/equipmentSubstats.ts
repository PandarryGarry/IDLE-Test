/**
 * Профили слотов экипа на РЕАЛЬНЫХ подхарактеристиках (12, см. `attributes`).
 *
 * Канон COMBAT_MODEL_PILLARS.md §6: предмет усиливает КОНКРЕТНУЮ
 * подхарактеристику точечным `{ характеристика: +N }`, а не «поднял столп →
 * сразу все его ветви». Этот файл — то, какие подхарактеристики слот вправе
 * давать. Величина бонуса растёт с тиром и задаётся у предметов
 * (`Item.substatBonuses`) или в тировых таблицах семейств.
 *
 * «Сырая» единица бонуса — та же, что у столпа (см. `data/types.ts` →
 * `Item.substatBonuses`): health — очки HP, strike — очки урона, rating —
 * очки рейтинга, percent — проценты. Ось совпадает с видом числа (kind).
 */
import type { BranchId } from '../../domain/attributes/attributes.ts';
import type { EquipSlot } from '../types.ts';

/** Какие подхарактеристики слот вправе усиливать (пусто — слот не даёт статов). */
export type EquipSlotSubstatProfile = readonly BranchId[];

export const EQUIP_SLOT_SUBSTAT_AXES: Record<EquipSlot, EquipSlotSubstatProfile> = {
  // ── Броня по телу: Броня + HP; шлем/щит добавляют Волю. §6.2 ──
  helm: ['armor', 'health', 'will'],
  platebody: ['armor', 'health'],
  platelegs: ['armor', 'health'],
  boots: ['armor', 'health'],
  gloves: ['armor', 'health'],
  shield: ['armor', 'health', 'will'],

  // ── Бижутерия и пояса: узкие линии. §6.2 ─────────────────────
  amulet: ['luck', 'armor', 'will'],
  ring: ['luck', 'evasion', 'tempo'],
  ring2: ['luck', 'evasion', 'tempo'],
  bracelet: ['tempo', 'reaction', 'health'],
  bracelet2: ['tempo', 'reaction', 'health'],
  belt: ['tempo', 'reaction', 'health'],
  cape: ['tempo', 'evasion', 'will'],

  // ── Руки и скрытые слоты: пока БЕЗ оси подхарактеристик ─────
  // Оружие/колчан/пассив несут то, что уходит в БОЕВОЕ разрешение (база урона,
  // меткость), а не в лист 12 статов тела. Пусто = честно «на тело не влияет»;
  // бой на готовых статах добавит свою ось отдельным шагом.
  weapon: [],
  quiver: [],
  passive: [],
};

/** Слоты, у которых есть хотя бы одна ось подхарактеристик (для перечислений). */
export const EQUIP_SUBSTAT_SLOTS: readonly EquipSlot[] = (
  Object.keys(EQUIP_SLOT_SUBSTAT_AXES) as EquipSlot[]
).filter((slot) => EQUIP_SLOT_SUBSTAT_AXES[slot].length > 0);

/** Все подхарактеристики, которые экип может усиливать (объединение осей). */
export const EQUIP_AFFECTED_SUBSTATS: readonly BranchId[] = [
  ...new Set<BranchId>(EQUIP_SUBSTAT_SLOTS.flatMap((s) => EQUIP_SLOT_SUBSTAT_AXES[s])),
];
