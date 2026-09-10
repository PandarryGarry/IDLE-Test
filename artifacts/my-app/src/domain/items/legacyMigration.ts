import type { Equipment, InventorySlot } from '../../data/types.ts';
import { EMPTY_EQUIPMENT } from '../../data/types.ts';
import { CATALOG } from './catalog/index.ts';

/**
 * Миграция мелворовских id → наши предметы каталога.
 *
 * Старые семейства (`domain/items/items.ts`, кроме снаряжения) удалены:
 * их дубли уже есть в каталоге с картинками. Сумки существующих героев
 * могли хранить старые id — при загрузке (`inventoryStore.loadFromSave`)
 * и в админ-черновике (`AdminCharactersPanel.normalizeSave`) они молча
 * заменяются ближайшим нашим предметом, чтобы не оставалось «битых» слотов.
 *
 * Снаряжение тех же сейвов (шаг 7 аудита) мигрирует по материалу:
 * бронзовый меч → меч тира 3 («бронза»), железный → тир 4 и так далее;
 * после миграции всё, чего нет в каталоге, бережно отбрасывается —
 * слот сумки/тела просто освобождается (`sanitizeInventoryItems`,
 * `migrateEquipment`).
 */
const LEGACY_ITEM_ID_MAP: Record<string, string> = {
  // ── Мелворовское снаряжение → наши тиры (по материалу) ──
  bronze_sword: 'gear_sword_1h_t03',
  iron_sword: 'gear_sword_1h_t04',
  steel_sword: 'gear_sword_1h_t05',
  mithril_sword: 'gear_sword_1h_t07',
  adamant_sword: 'gear_sword_1h_t09',
  rune_sword: 'gear_sword_1h_t11',
  dragon_sword: 'gear_sword_1h_t12',
  bronze_helm: 'gear_plate_helmet_t02',
  iron_helm: 'gear_plate_helmet_t03',
  steel_helm: 'gear_plate_helmet_t05',
  mithril_helm: 'gear_plate_helmet_t07',
  adamant_helm: 'gear_plate_helmet_t08',
  rune_helm: 'gear_plate_helmet_t10',
  dragon_helm: 'gear_plate_helmet_t12',
  bronze_platebody: 'gear_plate_chest_t02',
  iron_platebody: 'gear_plate_chest_t03',
  steel_platebody: 'gear_plate_chest_t05',
  mithril_platebody: 'gear_plate_chest_t07',
  adamant_platebody: 'gear_plate_chest_t08',
  rune_platebody: 'gear_plate_chest_t10',
  dragon_platebody: 'gear_plate_chest_t12',
  bronze_shield: 'gear_shield_t03',
  iron_shield: 'gear_shield_t04',
  steel_shield: 'gear_shield_t05',
  mithril_shield: 'gear_shield_t07',
  adamant_shield: 'gear_shield_t09',
  rune_shield: 'gear_shield_t11',
  dragon_shield: 'gear_shield_t12',
  // ── Брёвна → наши ──
  normal_logs: 'log_oak',
  oak_logs: 'log_oak',
  willow_logs: 'log_birch',
  teak_logs: 'log_pine',
  maple_logs: 'log_maple',
  mahogany_logs: 'log_ironwood',
  magic_logs: 'log_elvenwood',
  redwood_logs: 'log_ancient',
  // ── Руды → наши ──
  copper_ore: 'ore_copper',
  tin_ore: 'ore_copper',
  iron_ore: 'ore_iron',
  coal_ore: 'coal',
  gold_ore: 'ore_gold',
  mithril_ore: 'ore_mithril',
  adamantite_ore: 'ore_blacksteel',
  runite_ore: 'ore_orichalcum',
  dragonite_ore: 'ore_orichalcum',
  // ── Слитки → наши ──
  bronze_bar: 'bar_bronze',
  iron_bar: 'bar_iron',
  steel_bar: 'bar_iron',
  gold_bar: 'bar_gold',
  mithril_bar: 'bar_mithril',
  adamantite_bar: 'bar_blacksteel',
  runite_bar: 'bar_orichalcum',
  dragon_bar: 'bar_orichalcum',
  // ── Сырая рыба → наши виды по порядку ──
  raw_shrimp: 'fish_01_raw',
  raw_sardine: 'fish_02_raw',
  raw_herring: 'fish_03_raw',
  raw_mackerel: 'fish_04_raw',
  raw_trout: 'fish_05_raw',
  raw_salmon: 'fish_06_raw',
  raw_lobster: 'fish_07_raw',
  raw_swordfish: 'fish_08_raw',
  raw_crab: 'fish_09_raw',
  raw_shark: 'fish_10_raw',
  raw_manta_ray: 'fish_11_raw',
  raw_whale: 'fish_12_raw',
  // ── Готовая рыба → наши виды по порядку ──
  shrimp: 'fish_01_cooked',
  sardine: 'fish_02_cooked',
  herring: 'fish_03_cooked',
  mackerel: 'fish_04_cooked',
  trout: 'fish_05_cooked',
  salmon: 'fish_06_cooked',
  lobster: 'fish_07_cooked',
  swordfish: 'fish_08_cooked',
  cooked_crab: 'fish_09_cooked',
  shark: 'fish_10_cooked',
  manta_ray: 'fish_11_cooked',
  whale: 'fish_12_cooked',
  burnt_fish: 'coal_charcoal',
  // ── Кости → трофеи охоты ──
  bones: 'trophy_guts',
  big_bones: 'trophy_guts',
  dragon_bones: 'leather_scaled',
  // ── Руны → тлеющий уголь (рун как системы больше нет) ──
  air_rune: 'coal_embers',
  water_rune: 'coal_embers',
  earth_rune: 'coal_embers',
  fire_rune: 'coal_embers',
  mind_rune: 'coal_embers',
  body_rune: 'coal_embers',
  chaos_rune: 'coal_embers',
  death_rune: 'coal_embers',
  blood_rune: 'coal_embers',
  ancient_rune: 'coal_embers',
  // ── Самоцветы → кварцевый песок (самоцветов как семейства нет) ──
  topaz: 'quartz_sand',
  sapphire: 'quartz_sand',
  emerald: 'quartz_sand',
  ruby: 'quartz_sand',
  diamond: 'quartz_sand',
  onyx: 'quartz_sand',
  // ── Травы → наши целебные травы ──
  guam: 'healing_herbs',
  marrentill: 'healing_herbs',
  tarromin: 'healing_herbs',
  harralander: 'healing_herbs',
  ranarr: 'healing_herbs',
  toadflax: 'healing_herbs',
  irit: 'healing_herbs',
  avantoe: 'healing_herbs',
  kwuarm: 'healing_herbs',
  snapdragon: 'healing_herbs',
  cadantine: 'healing_herbs',
  torstol: 'healing_herbs',
  // ── Прочее легаси ──
  ash: 'coal_charcoal',
  mark_of_mastery: 'stone',
  ancient_key: 'stone',
};

/** Один id → наш. Неизвестные id пропускает как есть (будущие предметы). */
export function migrateItemId(itemId: string): string {
  return LEGACY_ITEM_ID_MAP[itemId] ?? itemId;
}

/**
 * Сумка со старыми id → сумка с нашими. Стопы, сошедшиеся в один id,
 * складываются; `locked`/`tab` берутся от первого вхождения.
 */
export function migrateInventoryItems(items: InventorySlot[]): InventorySlot[] {
  let touched = false;
  const merged = new Map<string, InventorySlot>();
  for (const slot of items) {
    const itemId = migrateItemId(slot.itemId);
    if (itemId !== slot.itemId) touched = true;
    const prev = merged.get(itemId);
    if (prev) {
      prev.quantity += slot.quantity;
      touched = true;
    } else {
      merged.set(itemId, { ...slot, itemId });
    }
  }
  return touched ? [...merged.values()] : items;
}

/** Идентификаторы, известные каталогу (единственный источник правды после шага 7). */
const KNOWN_ITEM_IDS = new Set(CATALOG.map((i) => i.id));

export function isKnownItemId(itemId: string): boolean {
  return KNOWN_ITEM_IDS.has(itemId);
}

/**
 * Бережная чистка сумки (аудит §6, шаг 7): слоты, чей id (уже после
 * миграции) неизвестен каталогу, отбрасываются — место просто освобождается.
 * Искажённых «битых» ячеек с эмодзи-пакетом больше не будет.
 */
export function sanitizeInventoryItems(items: InventorySlot[]): InventorySlot[] {
  const kept = items.filter((slot) => isKnownItemId(slot.itemId));
  return kept.length === items.length ? items : kept;
}

/**
 * Экипировка героя из старого сейва: старые id мапятся по материалу,
 * неизвестные слоты освобождаются (null). Двуручное оружие в одной руке
 * не бывает — мигрированный меч тира всегда одноручный.
 */
export function migrateEquipment(raw?: Partial<Equipment> | null): Equipment {
  const equipment: Equipment = { ...EMPTY_EQUIPMENT };
  for (const slot of Object.keys(EMPTY_EQUIPMENT) as (keyof Equipment)[]) {
    const oldId = raw?.[slot];
    if (typeof oldId !== 'string' || !oldId) continue;
    const itemId = migrateItemId(oldId);
    equipment[slot] = isKnownItemId(itemId) ? itemId : null;
  }
  return equipment;
}
