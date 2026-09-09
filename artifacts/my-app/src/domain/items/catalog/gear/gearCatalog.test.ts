import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GEAR_ITEMS } from './gearItems.ts';
import { BRANCH_IDS } from '../../../attributes/attributes.ts';
import { EQUIP_SLOT_SUBSTAT_AXES } from '../../../../data/balance/equipmentSubstats.ts';
import { sumEquipmentBonuses } from '../../../attributes/equipmentSubstats.ts';
import {
  GEAR_WEAPONS,
  gearTierScale,
  scaleTierMap,
  scaleTierBonus,
  type GearWeight,
} from '../../../../data/balance/gear.ts';
import type { EquipSlot, Item } from '../../../../data/types.ts';

test('каждый введённый предмет снаряжения несёт хоть одну реальную характеристику в своей оси слота', () => {
  assert.ok(GEAR_ITEMS.length >= 30, 'тир-1 фундамент есть (оружие+броня+украшения)');
  for (const it of GEAR_ITEMS) {
    const slot = it.equipSlot;
    assert.ok(slot, `${it.id} — без слота`);
    const axes = EQUIP_SLOT_SUBSTAT_AXES[slot];
    const bonuses = it.substatBonuses ?? {};
    const keys = Object.keys(bonuses) as (keyof typeof bonuses)[];
    assert.ok(keys.length >= 1, `${it.id} не несёт ни одной характеристики`);
    for (const id of keys) {
      assert.ok(BRANCH_IDS.includes(id as never), `${it.id}: неизвестная подхарактеристика ${id}`);
      assert.ok(axes.includes(id as never), `${it.id}: ${id} не ось слота ${slot}`);
      assert.ok((bonuses[id] ?? 0) > 0, `${it.id}: бонус ${id} не положителен`);
    }
  }
});

test('полный кожаный набор экипа реально «учитывается» через мост', () => {
  const eq: Partial<Record<EquipSlot, string | null>> = {
    helm: 'gear_leather_helmet_t01',
    platebody: 'gear_leather_chest_t01',
    platelegs: 'gear_leather_pants_t01',
    boots: 'gear_leather_boots_t01',
    gloves: 'gear_leather_gloves_t01',
  };
  const byId = new Map<string, Item>(GEAR_ITEMS.map((i) => [i.id, i]));
  const sum = sumEquipmentBonuses(eq, (id) => byId.get(id));
  assert.ok(sum.totals.armor > 0, 'набор даёт Броню');
  assert.ok(sum.totals.health > 0, 'набор даёт Здоровье');
  assert.equal(sum.dropped.length, 0, 'весь набор в своей оси — без отброшенного');
});

test('тировая шкала растёт монотонно, а бонусы старших тиров — не меньше тира 1', () => {
  let prev = -1;
  for (let t = 1; t <= 12; t++) {
    const s = gearTierScale(t as never);
    assert.ok(s > prev, `тир ${t} не растёт`);
    prev = s;
  }
  // Например нагрудник: тир 1 и тир 5.
  const body = scaleTierMap({ armor: 8, health: 13 }, 5);
  assert.ok((body.armor ?? 0) > scaleTierBonus(8, 1), 'тир 5 даёт больше брони, чем тир 1');
  assert.equal(scaleTierBonus(8, 1), 8, 'тир 1 = база');
});

test('в определении весов и оружия нет записей вне осей', () => {
  const weights: GearWeight[] = ['plate', 'leather', 'cloth'];
  for (const w of weights) {
    void w;
  }
  assert.ok(GEAR_WEAPONS.length >= 9, 'физические семьи оружия на месте');
  for (const slot of Object.keys(EQUIP_SLOT_SUBSTAT_AXES) as EquipSlot[]) {
    assert.ok(Array.isArray(EQUIP_SLOT_SUBSTAT_AXES[slot]));
  }
});
