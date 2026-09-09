import type { InventorySlot } from '../../data/types.ts';

/**
 * Миграция мелворовских id → наши предметы каталога.
 *
 * Старые семейства (`domain/items/items.ts`, кроме снаряжения) удалены:
 * их дубли уже есть в каталоге с картинками. Сумки существующих героев
 * могли хранить старые id — при загрузке (`inventoryStore.loadFromSave`)
 * и в админ-черновике (`AdminCharactersPanel.normalizeSave`) они молча
 * заменяются ближайшим нашим предметом, чтобы не оставалось «битых» слотов.
 *
 * Снаряжение (мечи/шлемы/нагрудники/щиты) не мигрирует — его id живы.
 */
const LEGACY_ITEM_ID_MAP: Record<string, string> = {
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
