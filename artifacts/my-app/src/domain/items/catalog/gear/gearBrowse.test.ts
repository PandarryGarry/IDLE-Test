import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GEAR_ITEMS } from './gearItems.ts';
import {
  EMPTY_GEAR_BROWSE,
  filterGearItems,
  groupGearItems,
  groupLooseItems,
  itemMatchesGearBrowse,
} from './gearBrowse.ts';

test('фильтр слот/тир/вес отсекает чужие семьи', () => {
  const leatherT3 = filterGearItems(GEAR_ITEMS, {
    ...EMPTY_GEAR_BROWSE,
    slot: 'helm',
    tier: 3,
    weight: 'leather',
  });
  assert.equal(leatherT3.length, 1);
  assert.equal(leatherT3[0].id, 'gear_leather_helmet_t03');

  const swords = filterGearItems(GEAR_ITEMS, { ...EMPTY_GEAR_BROWSE, query: 'меч', slot: 'weapon', tier: 1, weight: 'all' });
  assert.ok(swords.some((i) => i.id === 'gear_sword_1h_t01'));
  assert.equal(swords.every((i) => i.equipSlot === 'weapon' && i.tier === 1), true);
});

test('фасовка идёт слот → тир → семья', () => {
  const sample = GEAR_ITEMS.filter((i) => i.id === 'gear_sword_1h_t02' || i.id === 'gear_leather_helmet_t02');
  const groups = groupGearItems(sample);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].slot, 'weapon');
  assert.equal(groups[0].tier, 2);
  assert.equal(groups[0].family, 'sword_1h');
  assert.equal(groups[1].slot, 'helm');
  assert.ok(itemMatchesGearBrowse(sample[0], EMPTY_GEAR_BROWSE));
});

test('ресурсы фасуются по категории, экип не попадает в «прочее»', () => {
  const groups = groupLooseItems([
    { id: 'oak_log', name: 'Дуб', category: 'log', sellValue: 1, canSell: true, stackable: true },
    { id: 'copper_ore', name: 'Медь', category: 'ore', sellValue: 1, canSell: true, stackable: true },
    { id: 'gear_sword_1h_t01', name: 'Меч', category: 'weapon', sellValue: 1, canSell: true, stackable: false, equipSlot: 'weapon' },
  ]);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].category, 'log');
  assert.equal(groups[0].label, 'Дерево');
  assert.equal(groups[1].category, 'ore');
  assert.equal(groups.every((g) => g.items.every((it) => !it.equipSlot)), true);
});
