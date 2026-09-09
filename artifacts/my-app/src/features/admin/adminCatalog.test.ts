import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GEAR_ITEMS } from '../../domain/items/catalog/gear/gearItems.ts';
import { CATALOG } from '../../domain/items/catalog/index.ts';
import {
  filterAdminItems,
  filtersForBag,
  itemBag,
  itemsInBag,
  parseAdminItemBag,
} from './adminCatalog.ts';

test('парсит путь раздела', () => {
  assert.equal(parseAdminItemBag('/admin'), 'all');
  assert.equal(parseAdminItemBag('/admin/items'), 'all');
  assert.equal(parseAdminItemBag('/admin/items/weapons'), 'weapons');
  assert.equal(parseAdminItemBag('/admin/items/jewelry'), 'jewelry');
  assert.equal(parseAdminItemBag('/admin/items/uniques'), 'uniques');
  assert.equal(parseAdminItemBag('/admin/items/nope'), 'all');
  assert.equal(parseAdminItemBag('/admin/characters'), 'all');
});

test('раскладывает экип по сумкам без пересечений', () => {
  const bags = { weapons: 0, armor: 0, jewelry: 0, uniques: 0, craft: 0, other: 0 };
  for (const it of GEAR_ITEMS) {
    const bag = itemBag(it);
    assert.notEqual(bag, 'all');
    bags[bag] += 1;
  }
  assert.equal(bags.weapons + bags.armor + bags.jewelry + bags.uniques + bags.other, GEAR_ITEMS.length);
  assert.ok(bags.weapons > 100);
  assert.ok(bags.armor > 100);
  assert.ok(bags.jewelry > 50);
  assert.ok(bags.uniques > 20);
  assert.equal(bags.craft, 0);
});

test('уники не лежат в оружии и бижутерии', () => {
  const uniques = itemsInBag(GEAR_ITEMS, 'uniques');
  assert.ok(uniques.length > 0);
  assert.equal(uniques.every((it) => it.id.startsWith('gear_unique_') || it.gearFamily?.startsWith('unique_')), true);
  assert.equal(itemsInBag(GEAR_ITEMS, 'weapons').some((it) => it.id.startsWith('gear_unique_')), false);
  assert.equal(itemsInBag(GEAR_ITEMS, 'jewelry').some((it) => it.id.startsWith('gear_unique_')), false);
});

test('крафт — только предметы без слота экипа', () => {
  const craft = itemsInBag(CATALOG, 'craft');
  assert.ok(craft.length > 20);
  assert.equal(craft.every((it) => !it.equipSlot), true);
});

test('у оружия есть фильтры «тип» и «тир»', () => {
  const pool = itemsInBag(CATALOG, 'weapons');
  const specs = filtersForBag('weapons', pool);
  assert.deepEqual(specs.map((s) => s.key), ['type', 'tier']);
  assert.equal(specs[0].label, 'Тип оружия');
  assert.ok(specs[0].options.some((o) => o.label === 'Меч'));
});

test('фильтр по тиру оставляет один ряд', () => {
  const pool = itemsInBag(CATALOG, 'weapons');
  const out = filterAdminItems(pool, 'weapons', {
    query: '',
    type: 'all',
    tier: 1,
    weight: 'all',
    slot: 'all',
  });
  assert.ok(out.length > 0);
  assert.equal(out.every((it) => it.tier === 1), true);
});
