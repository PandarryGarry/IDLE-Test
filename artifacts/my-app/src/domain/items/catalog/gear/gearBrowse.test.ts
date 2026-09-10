import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GEAR_ITEMS } from './gearItems.ts';
import {
  gearQualityLabel,
  gearQualityShort,
  isGearUnique,
} from '../../../../data/balance/gear.ts';
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

test('уник — отдельная категория: тира нет, только звезда, группа своя', () => {
  const uniqSword = GEAR_ITEMS.find((i) => i.id === 'gear_unique_sword_1h_v01');
  const tieredSword = GEAR_ITEMS.find((i) => i.id === 'gear_sword_1h_t01');
  const uniqRing = GEAR_ITEMS.find((i) => i.id === 'gear_rings_l_v10');
  const tieredRing = GEAR_ITEMS.find((i) => i.id === 'gear_rings_l_v01');
  assert.ok(uniqSword && tieredSword && uniqRing && tieredRing);

  assert.equal(isGearUnique(uniqSword), true);
  assert.equal(isGearUnique(uniqRing), true, 'последний вариант кольца — уник');
  assert.equal(isGearUnique(tieredSword), false);
  assert.equal(isGearUnique(tieredRing), false);
  assert.equal(gearQualityLabel(uniqSword), '');
  assert.equal(gearQualityShort(uniqSword), '');
  assert.equal(gearQualityLabel(tieredSword), 'Тир I');
  assert.equal(gearQualityShort(tieredRing), 'T2');

  // тировый фильтр уники не ловит (тир у них внутренний)
  const t8 = filterGearItems(GEAR_ITEMS, { ...EMPTY_GEAR_BROWSE, slot: 'weapon', tier: 8 });
  assert.ok(t8.length > 0);
  assert.equal(t8.some(isGearUnique), false);

  // отбор «только уникальное» / «только тировое»
  const onlyUniq = filterGearItems(GEAR_ITEMS, { ...EMPTY_GEAR_BROWSE, unique: 'unique' });
  assert.ok(onlyUniq.length > 0);
  assert.equal(onlyUniq.every(isGearUnique), true);
  const onlyTiered = filterGearItems(GEAR_ITEMS, { ...EMPTY_GEAR_BROWSE, unique: 'tiered' });
  assert.equal(onlyTiered.some(isGearUnique), false);
  assert.equal(onlyUniq.length + onlyTiered.length, GEAR_ITEMS.length);

  // в фасовке уник-группы внутри слота идут после тировых
  const groups = groupGearItems(GEAR_ITEMS.filter((i) => i.equipSlot === 'weapon'));
  const firstUnique = groups.findIndex((g) => g.unique);
  assert.ok(firstUnique > 0, 'уник-группа должна быть не первой');
  assert.equal(groups.slice(0, firstUnique).every((g) => !g.unique), true);
  assert.equal(groups.slice(firstUnique).every((g) => g.unique), true);
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
