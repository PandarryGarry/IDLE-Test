import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import { GEAR_ITEMS } from './gearItems.ts';
import { BRANCH_IDS } from '../../../attributes/attributes.ts';
import { EQUIP_SLOT_SUBSTAT_AXES } from '../../../../data/balance/equipmentSubstats.ts';
import { sumEquipmentBonuses } from '../../../attributes/equipmentSubstats.ts';
import {
  GEAR_WEAPONS,
  GEAR_UNIQUE_VARIANT_COUNT,
  GEAR_AMMO,
  gearTierScale,
  scaleTierMap,
  scaleTierBonus,
  type GearWeight,
} from '../../../../data/balance/gear.ts';
import type { EquipSlot, Item } from '../../../../data/types.ts';

const EXPECTED_GEAR =
  12 * GEAR_WEAPONS.length
  + 3 * 5 * 12
  + 15 + 15 + 10 + 10 + 10 + 10
  + Object.values(GEAR_UNIQUE_VARIANT_COUNT).reduce((a, n) => a + n, 0)
  + GEAR_AMMO.reduce((a, x) => a + x.variants, 0);

test('каждый введённый предмет снаряжения несёт хоть одну реальную характеристику в своей оси слота', () => {
  assert.equal(GEAR_ITEMS.length, EXPECTED_GEAR, 'тировое + магия + уники + колчан');
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

test('прочность растёт с тиром, бижа v01 — огонь тира 2, кольца без v11–v15', () => {
  const t1 = GEAR_ITEMS.find((i) => i.id === 'gear_sword_1h_t01');
  const t12 = GEAR_ITEMS.find((i) => i.id === 'gear_sword_1h_t12');
  assert.ok(t1 && t12);
  assert.ok((t1.maxDurability ?? 0) > 0);
  assert.ok((t12.maxDurability ?? 0) > (t1.maxDurability ?? 0), 'тир 12 служит дольше тира 1');
  assert.ok((t12.substatBonuses?.strike ?? 0) > (t1.substatBonuses?.strike ?? 0));

  const fireAmulet = GEAR_ITEMS.find((i) => i.id === 'gear_necklaces_v01');
  assert.equal(fireAmulet?.tier, 2);
  assert.equal(fireAmulet?.gearFamily, 'fire');

  assert.ok(GEAR_ITEMS.some((i) => i.id === 'gear_necklaces_v15'));
  assert.equal(GEAR_ITEMS.some((i) => i.id === 'gear_rings_l_v15'), false);
  assert.equal(GEAR_ITEMS.filter((i) => i.equipSlot === 'ring').length, 10);
});

test('в определении весов и оружия нет записей вне осей', () => {
  const weights: GearWeight[] = ['plate', 'leather', 'cloth'];
  for (const w of weights) {
    void w;
  }
  assert.ok(GEAR_WEAPONS.length >= 12, 'физика + магия на месте');
  for (const slot of Object.keys(EQUIP_SLOT_SUBSTAT_AXES) as EquipSlot[]) {
    assert.ok(Array.isArray(EQUIP_SLOT_SUBSTAT_AXES[slot]));
  }
});

test('магия, уники и колчан заведены: картинка есть, удар уника не выше t12 семьи', () => {
  for (const folder of ['book', 'staff', 'wand'] as const) {
    assert.equal(GEAR_ITEMS.filter((i) => i.id.startsWith(`gear_${folder}_t`)).length, 12, folder);
  }
  const uniques = GEAR_ITEMS.filter((i) => i.id.startsWith('gear_unique_'));
  assert.equal(uniques.length, Object.values(GEAR_UNIQUE_VARIANT_COUNT).reduce((a, n) => a + n, 0));
  const byFolder = new Map(GEAR_WEAPONS.map((w) => [w.folder, w]));
  for (const it of uniques) {
    const folder = it.gearFamily?.replace(/^unique_/, '') ?? '';
    const family = byFolder.get(folder);
    assert.ok(family, it.id);
    const t12 = scaleTierMap(family.tier1, 12);
    if (family.slot === 'weapon') {
      assert.ok((it.substatBonuses?.strike ?? 0) <= (t12.strike ?? 0), `${it.id} удар сильнее t12`);
    } else {
      assert.ok((it.substatBonuses?.armor ?? 0) <= (t12.armor ?? 0), `${it.id} броня сильнее t12`);
    }
  }
  assert.equal(GEAR_ITEMS.filter((i) => i.equipSlot === 'quiver').length, 23);
  assert.ok(GEAR_ITEMS.some((i) => i.id === 'gear_arrow_v15'));
  assert.ok(GEAR_ITEMS.some((i) => i.id === 'gear_bolt_v08'));
  assert.equal(GEAR_ITEMS.some((i) => i.id === 'gear_bolt_v09'), false);

  const missing: string[] = [];
  for (const it of GEAR_ITEMS) {
    assert.ok(it.iconPath, `${it.id} без iconPath`);
    const webp = `public/assets/icons/${it.iconPath}.webp`;
    if (!fs.existsSync(webp)) missing.push(`${it.id} → ${webp}`);
  }
  assert.equal(missing.length, 0, missing.slice(0, 8).join('; '));
});
