/**
 * Суммы и сравнение боевых характеристик по надетому экипу.
 * Остались только три настоящие характеристики: Атака, Сила, Защита.
 * Дальний бой, магия и молитва — пережитки прошлой модели — удалены.
 */
import { getItem } from './index.ts';
import type { CombatStats, Equipment } from '../../data/types.ts';

export type EquipStatKey = keyof CombatStats;

/** Порядок и русские подписи — единый для сводки и сравнения. */
export const EQUIP_STAT_META: { key: EquipStatKey; label: string }[] = [
  { key: 'attackBonus', label: 'Атака' },
  { key: 'strengthBonus', label: 'Сила' },
  { key: 'defenceBonus', label: 'Защита' },
];

export function itemCombatStats(itemId: string | null): CombatStats {
  if (!itemId) return {};
  return getItem(itemId)?.combatStats ?? {};
}

/** Сумма по всем надетым предметам. */
export function sumEquipmentStats(equipment: Equipment): Record<EquipStatKey, number> {
  const total = {} as Record<EquipStatKey, number>;
  for (const { key } of EQUIP_STAT_META) total[key] = 0;
  for (const slot of Object.keys(equipment) as (keyof Equipment)[]) {
    const stats = itemCombatStats(equipment[slot]);
    for (const { key } of EQUIP_STAT_META) total[key] += stats[key] ?? 0;
  }
  return total;
}

export interface StatDelta {
  key: EquipStatKey;
  label: string;
  to: number;
  from: number;
  delta: number;
}

/** «Новое vs надетое» — строки только там, где у кого-то из пары есть число. */
export function diffCombatStats(
  newItemId: string | null,
  oldItemId: string | null,
): StatDelta[] {
  const a = itemCombatStats(newItemId);
  const b = itemCombatStats(oldItemId);
  const out: StatDelta[] = [];
  for (const { key, label } of EQUIP_STAT_META) {
    const to = a[key] ?? 0;
    const from = b[key] ?? 0;
    if (to === 0 && from === 0) continue;
    out.push({ key, label, to, from, delta: to - from });
  }
  return out;
}
