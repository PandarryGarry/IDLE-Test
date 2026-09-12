import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GEAR_ITEMS } from '../../domain/items/catalog/gear/gearItems.ts';
import { CATALOG } from '../../domain/items/catalog/index.ts';
import { GEAR_UNIQUE_JEWEL_COUNT, GEAR_UNIQUE_VARIANT_COUNT } from '../../data/balance/gear.ts';
import {
  filterAdminItems,
  filtersForBag,
  isUniqueItem,
  itemBag,
  itemsInBag,
  parseAdminItemBag,
  sortAdminItems,
} from './adminCatalog.ts';

test('парсит путь раздела', () => {
  assert.equal(parseAdminItemBag('/admin'), 'all');
  assert.equal(parseAdminItemBag('/admin/items'), 'all');
  assert.equal(parseAdminItemBag('/admin/items/weapons'), 'weapons');
  assert.equal(parseAdminItemBag('/admin/items/jewelry'), 'jewelry');
  assert.equal(parseAdminItemBag('/admin/items/uniques'), 'uniques');
  assert.equal(parseAdminItemBag('/admin/items/tools'), 'tools');
  assert.equal(parseAdminItemBag('/admin/items/other'), 'tools');
  assert.equal(parseAdminItemBag('/admin/items/nope'), 'all');
  assert.equal(parseAdminItemBag('/admin/characters'), 'all');
});

test('раскладывает экип по сумкам без пересечений', () => {
  const bags = { weapons: 0, armor: 0, jewelry: 0, uniques: 0, craft: 0, tools: 0 };
  for (const it of GEAR_ITEMS) {
    const bag = itemBag(it);
    assert.notEqual(bag, 'all');
    bags[bag] += 1;
  }
  assert.equal(bags.weapons + bags.armor + bags.jewelry + bags.uniques + bags.tools, GEAR_ITEMS.length);
  assert.ok(bags.weapons > 100);
  assert.ok(bags.armor > 100);
  assert.ok(bags.tools > 0);
  // Бижутерии 70 (ожерелья 15 + пояса 15 + кольца 10+10 + браслеты 10+10),
  // из них последние 5 каждой семьи уехали в «Уники».
  assert.equal(bags.jewelry, 70 - 6 * GEAR_UNIQUE_JEWEL_COUNT);
  const weaponUniques = Object.values(GEAR_UNIQUE_VARIANT_COUNT).reduce((a, n) => a + n, 0);
  assert.equal(bags.uniques, weaponUniques + 6 * GEAR_UNIQUE_JEWEL_COUNT);
  assert.equal(bags.craft, 0);
});

test('уники не лежат в оружии и бижутерии', () => {
  const uniques = itemsInBag(GEAR_ITEMS, 'uniques');
  assert.ok(uniques.length > 0);
  assert.equal(uniques.every(isUniqueItem), true);
  assert.equal(itemsInBag(GEAR_ITEMS, 'weapons').some(isUniqueItem), false);
  assert.equal(itemsInBag(GEAR_ITEMS, 'jewelry').some(isUniqueItem), false);
});

test('у бижутерии уникальные — последние 5 вариантов каждой семьи', () => {
  const jewelSlots = ['amulet', 'belt', 'ring', 'ring2', 'bracelet', 'bracelet2'];
  const jewels = GEAR_ITEMS.filter((it) => it.equipSlot && jewelSlots.includes(it.equipSlot));
  assert.equal(jewels.length, 70);
  const uniq = jewels.filter(isUniqueItem);
  assert.equal(uniq.length, 6 * GEAR_UNIQUE_JEWEL_COUNT);
  // Ожерелий 15 видов → уники v11–v15.
  assert.equal(jewels.filter((it) => it.id.startsWith('gear_necklaces_')).length, 15);
  assert.deepEqual(
    uniq.filter((it) => it.id.startsWith('gear_necklaces_')).map((it) => it.id),
    ['gear_necklaces_v11', 'gear_necklaces_v12', 'gear_necklaces_v13', 'gear_necklaces_v14', 'gear_necklaces_v15'],
  );
  // Колец 10 видов → уники v06–v10.
  assert.equal(jewels.filter((it) => it.id.startsWith('gear_rings_l_')).length, 10);
  assert.deepEqual(
    uniq.filter((it) => it.id.startsWith('gear_rings_l_')).map((it) => it.id),
    ['gear_rings_l_v06', 'gear_rings_l_v07', 'gear_rings_l_v08', 'gear_rings_l_v09', 'gear_rings_l_v10'],
  );
});

test('у уников фильтры «слот» и «тип», а тира нет', () => {
  const pool = itemsInBag(CATALOG, 'uniques');
  const specs = filtersForBag('uniques', pool);
  assert.deepEqual(specs.map((s) => s.key), ['slot', 'type']);
  assert.ok(specs[0].options.some((o) => o.label === 'Оружие'));
  assert.ok(specs[0].options.some((o) => o.label === 'Кольцо 1'));
  assert.ok(specs[1].options.some((o) => o.label === 'Уник: Меч'));
  assert.ok(specs[1].options.some((o) => o.label === 'Луна'));
});

test('уники в сетке идут по типу, а не вперемешку', () => {
  const pool = itemsInBag(CATALOG, 'uniques');
  const sorted = sortAdminItems(pool, 'uniques');
  const bySlot = new Map<string, string[]>();
  for (const it of sorted) {
    const slot = it.equipSlot ?? '?';
    const list = bySlot.get(slot) ?? [];
    list.push(it.gearFamily ?? '');
    bySlot.set(slot, list);
  }
  for (const [slot, families] of bySlot) {
    const blocks: string[] = [];
    for (const f of families) if (blocks[blocks.length - 1] !== f) blocks.push(f);
    assert.equal(new Set(blocks).size, blocks.length, `${slot}: типы вперемешку → ${blocks.join(' → ')}`);
  }
  // уник-оружие стоит до уник-бижутерии
  const lastWeapon = sorted.map((it) => it.equipSlot).lastIndexOf('weapon');
  const firstAmulet = sorted.findIndex((it) => it.equipSlot === 'amulet');
  assert.ok(lastWeapon >= 0 && firstAmulet > lastWeapon, 'оружие должно идти до бижутерии');
});

test('крафт — только предметы без слота экипа', () => {
  const craft = itemsInBag(CATALOG, 'craft');
  assert.ok(craft.length > 20);
  assert.equal(craft.every((it) => !it.equipSlot), true);
});

test('у оружия есть компактные фильтры «тип» и «тир»', () => {
  const pool = itemsInBag(CATALOG, 'weapons');
  const specs = filtersForBag('weapons', pool);
  assert.deepEqual(specs.map((s) => s.key), ['type', 'tier']);
  assert.deepEqual(specs.map((s) => s.label), ['Тип', 'Тир']);
  assert.ok(specs[0].options.some((o) => o.label === 'Меч'));
});

test('экипировка и бижутерия показывают только «тип» + «тир»', () => {
  for (const bag of ['armor', 'jewelry'] as const) {
    const pool = itemsInBag(CATALOG, bag);
    const specs = filtersForBag(bag, pool);
    assert.deepEqual(specs.map((s) => s.key), ['slot', 'tier']);
    assert.deepEqual(specs.map((s) => s.label), ['Тип', 'Тир']);
  }
});

test('инструменты — отдельная вкладка с «тип» + «тир»', () => {
  const pool = itemsInBag(CATALOG, 'tools');
  const specs = filtersForBag('tools', pool);
  assert.ok(pool.length > 0);
  assert.equal(pool.every((it) => it.equipSlot === 'quiver'), true);
  assert.deepEqual(specs.map((s) => s.label), ['Тип', 'Тир']);
  assert.ok(specs[0].options.some((o) => o.label === 'Стрелы'));
});

test('крафт/фарм оставляет только «профессия» без тира', () => {
  const pool = itemsInBag(CATALOG, 'craft');
  const specs = filtersForBag('craft', pool);
  assert.deepEqual(specs.map((s) => s.key), ['type']);
  assert.deepEqual(specs.map((s) => s.label), ['Профессия']);
  assert.ok(specs[0].options.some((o) => o.label === 'Сбор'));
  const mining = filterAdminItems(pool, 'craft', {
    query: '',
    type: 'mining',
    tier: 'all',
    weight: 'all',
    slot: 'all',
  });
  assert.ok(mining.some((it) => it.category === 'ore'));
  assert.equal(mining.some((it) => it.category === 'log'), false);
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
