import test from 'node:test';
import assert from 'node:assert/strict';

import { CATALOG } from './catalog/index.ts';
import {
  isKnownItemId,
  migrateEquipment,
  migrateInventoryItems,
  migrateItemId,
  sanitizeInventoryItems,
} from './legacyMigration.ts';
import type { InventorySlot } from '../../data/types.ts';

/**
 * Шаг 7 аудита: мелворовское легаси-снаряжение удалено; старые сейвы
 * мигрируются по материалу и бережно чистятся — неизвестные id из сумки,
 * экипа и наборов отбрасываются, слоты освобождаются.
 */

const LEGACY_GEAR_IDS = [
  'bronze_sword', 'iron_sword', 'steel_sword', 'mithril_sword',
  'adamant_sword', 'rune_sword', 'dragon_sword',
  'bronze_helm', 'iron_helm', 'steel_helm', 'mithril_helm',
  'adamant_helm', 'rune_helm', 'dragon_helm',
  'bronze_platebody', 'iron_platebody', 'steel_platebody',
  'mithril_platebody', 'adamant_platebody', 'rune_platebody', 'dragon_platebody',
  'bronze_shield', 'iron_shield', 'steel_shield', 'mithril_shield',
  'adamant_shield', 'rune_shield', 'dragon_shield',
];

test('каждый легаси-id снаряжения мапится в СУЩЕСТВУЮЩИЙ предмет каталога', () => {
  const ids = new Set(CATALOG.map((i) => i.id));
  for (const legacyId of LEGACY_GEAR_IDS) {
    const target = migrateItemId(legacyId);
    assert.notEqual(target, legacyId, `${legacyId} должен мапиться`);
    assert.ok(ids.has(target), `${legacyId} → ${target} нет в каталоге`);
  }
});

test('маппинг идёт по материалу: бронза → тир 3, железо → 4, сталь → 5', () => {
  assert.equal(migrateItemId('bronze_sword'), 'gear_sword_1h_t03');
  assert.equal(migrateItemId('iron_sword'), 'gear_sword_1h_t04');
  assert.equal(migrateItemId('steel_sword'), 'gear_sword_1h_t05');
  assert.equal(migrateItemId('steel_platebody'), 'gear_plate_chest_t05');
  assert.equal(migrateItemId('dragon_helm'), 'gear_plate_helmet_t12');
});

test('легаси-id больше НЕ известен каталогу (определения удалены)', () => {
  for (const legacyId of LEGACY_GEAR_IDS) {
    assert.equal(isKnownItemId(legacyId), false, legacyId);
  }
  assert.equal(isKnownItemId('gear_sword_1h_t03'), true);
});

test('сумка: легаси мигрирует, дубликаты складываются, неизвестное чистится', () => {
  const items: InventorySlot[] = [
    { itemId: 'bronze_sword', quantity: 1, locked: false, tab: 0 },
    { itemId: 'bronze_sword', quantity: 1, locked: false, tab: 0 },
    { itemId: 'ghost_of_future_patch', quantity: 5, locked: true, tab: 0 },
    { itemId: 'log_oak', quantity: 10, locked: false, tab: 0 },
  ];
  const cleaned = sanitizeInventoryItems(migrateInventoryItems(items));
  assert.equal(cleaned.length, 2);
  const sword = cleaned.find((s) => s.itemId === 'gear_sword_1h_t03');
  assert.ok(sword);
  assert.equal(sword.quantity, 2);
  assert.ok(cleaned.some((s) => s.itemId === 'log_oak'));
});

test('экип: старое мапится, неизвестное освобождает слот', () => {
  const eq = migrateEquipment({
    weapon: 'steel_sword',
    helm: 'dragon_helm',
    shield: 'void_shield_2099',
  } as never);
  assert.equal(eq.weapon, 'gear_sword_1h_t05');
  assert.equal(eq.helm, 'gear_plate_helmet_t12');
  assert.equal(eq.shield, null);
  assert.equal(eq.amulet, null);
});

test('стопы: migrateInventoryItems без known-фильтра не выкидывает будущие id', () => {
  const items: InventorySlot[] = [
    { itemId: 'ghost_of_future_patch', quantity: 5, locked: false, tab: 0 },
  ];
  assert.equal(migrateInventoryItems(items)[0].itemId, 'ghost_of_future_patch');
});
