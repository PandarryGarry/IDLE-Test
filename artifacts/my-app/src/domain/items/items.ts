import type { Item } from '../../data/types.ts';

/**
 * `iconPath` — путь иконки в `public/assets/icons` БЕЗ расширения; в `<img>`
 * отдаётся только через `iconUrl()` (см. `scripts/assets/README.md`).
 *
 * Соглашение тиров (по порядку прогрессии в данных, металлы → t01..tNN):
 *   оружие/броня: bronze=t01 … dragon=t07 (7 металлов из 12 на диске);
 *   слитки:       bronze…dragon → ingot_t01…t08 (золото на своём месте t04);
 *   руды:         copper…dragonite → ore_t01…t08 (уголь — свой `minerals/coal_t01`);
 *   брёвна:       normal…redwood → log_t01…t08;
 *   рыба:         shrimp…whale → fish_01…fish_12 (raw/cooked).
 * Резерв t09–t12 (металлы) и fish_13…25 — будущие тиры, пока без предметов.
 */
const ITEMS: Record<string, Item> = {
  // ── Logs ───────────────────────────────────────────────────
  normal_logs:    { id: 'normal_logs', iconPath: 'materials/wood/log_t01',    name: 'Logs',           category: 'log',   sellValue: 5,    canSell: true,  stackable: true,  icon: '🪵' },
  oak_logs:       { id: 'oak_logs', iconPath: 'materials/wood/log_t02',       name: 'Oak Logs',       category: 'log',   sellValue: 15,   canSell: true,  stackable: true,  icon: '🪵' },
  willow_logs:    { id: 'willow_logs', iconPath: 'materials/wood/log_t03',    name: 'Willow Logs',    category: 'log',   sellValue: 25,   canSell: true,  stackable: true,  icon: '🪵' },
  teak_logs:      { id: 'teak_logs', iconPath: 'materials/wood/log_t04',      name: 'Teak Logs',      category: 'log',   sellValue: 40,   canSell: true,  stackable: true,  icon: '🪵' },
  maple_logs:     { id: 'maple_logs', iconPath: 'materials/wood/log_t05',     name: 'Maple Logs',     category: 'log',   sellValue: 65,   canSell: true,  stackable: true,  icon: '🪵' },
  mahogany_logs:  { id: 'mahogany_logs', iconPath: 'materials/wood/log_t06',  name: 'Mahogany Logs',  category: 'log',   sellValue: 90,   canSell: true,  stackable: true,  icon: '🪵' },
  magic_logs:     { id: 'magic_logs', iconPath: 'materials/wood/log_t07',     name: 'Magic Logs',     category: 'log',   sellValue: 200,  canSell: true,  stackable: true,  icon: '✨' },
  redwood_logs:   { id: 'redwood_logs', iconPath: 'materials/wood/log_t08',   name: 'Redwood Logs',   category: 'log',   sellValue: 350,  canSell: true,  stackable: true,  icon: '🪵' },
  // ── Ashes ──────────────────────────────────────────────────
  ash:            { id: 'ash',            name: 'Ash',            category: 'ash',   sellValue: 3,    canSell: true,  stackable: true,  icon: '⚪' },
  // ── Ores ───────────────────────────────────────────────────
  copper_ore:     { id: 'copper_ore', iconPath: 'materials/metals/ore_t01',     name: 'Copper Ore',     category: 'ore',   sellValue: 5,    canSell: true,  stackable: true,  icon: '🟤' },
  tin_ore:        { id: 'tin_ore', iconPath: 'materials/metals/ore_t02',        name: 'Tin Ore',        category: 'ore',   sellValue: 5,    canSell: true,  stackable: true,  icon: '⚪' },
  iron_ore:       { id: 'iron_ore', iconPath: 'materials/metals/ore_t03',       name: 'Iron Ore',       category: 'ore',   sellValue: 15,   canSell: true,  stackable: true,  icon: '🔩' },
  coal_ore:       { id: 'coal_ore', iconPath: 'materials/minerals/coal_t01',       name: 'Coal Ore',       category: 'ore',   sellValue: 25,   canSell: true,  stackable: true,  icon: '🖤' },
  gold_ore:       { id: 'gold_ore', iconPath: 'materials/metals/ore_t04',       name: 'Gold Ore',       category: 'ore',   sellValue: 50,   canSell: true,  stackable: true,  icon: '🟡' },
  mithril_ore:    { id: 'mithril_ore', iconPath: 'materials/metals/ore_t05',    name: 'Mithril Ore',    category: 'ore',   sellValue: 80,   canSell: true,  stackable: true,  icon: '💙' },
  adamantite_ore: { id: 'adamantite_ore', iconPath: 'materials/metals/ore_t06', name: 'Adamantite Ore', category: 'ore',   sellValue: 130,  canSell: true,  stackable: true,  icon: '💚' },
  runite_ore:     { id: 'runite_ore', iconPath: 'materials/metals/ore_t07',     name: 'Runite Ore',     category: 'ore',   sellValue: 250,  canSell: true,  stackable: true,  icon: '🔵' },
  dragonite_ore:  { id: 'dragonite_ore', iconPath: 'materials/metals/ore_t08',  name: 'Dragonite Ore',  category: 'ore',   sellValue: 400,  canSell: true,  stackable: true,  icon: '🔴' },
  // ── Bars ───────────────────────────────────────────────────
  bronze_bar:     { id: 'bronze_bar', iconPath: 'materials/metals/ingot_t01',     name: 'Bronze Bar',     category: 'bar',   sellValue: 20,   canSell: true,  stackable: true,  icon: '🟫' },
  iron_bar:       { id: 'iron_bar', iconPath: 'materials/metals/ingot_t02',       name: 'Iron Bar',       category: 'bar',   sellValue: 60,   canSell: true,  stackable: true,  icon: '⬜' },
  steel_bar:      { id: 'steel_bar', iconPath: 'materials/metals/ingot_t03',      name: 'Steel Bar',      category: 'bar',   sellValue: 120,  canSell: true,  stackable: true,  icon: '🔘' },
  gold_bar:       { id: 'gold_bar', iconPath: 'materials/metals/ingot_t04',       name: 'Gold Bar',       category: 'bar',   sellValue: 200,  canSell: true,  stackable: true,  icon: '🟨' },
  mithril_bar:    { id: 'mithril_bar', iconPath: 'materials/metals/ingot_t05',    name: 'Mithril Bar',    category: 'bar',   sellValue: 320,  canSell: true,  stackable: true,  icon: '🔵' },
  adamantite_bar: { id: 'adamantite_bar', iconPath: 'materials/metals/ingot_t06', name: 'Adamantite Bar', category: 'bar',   sellValue: 530,  canSell: true,  stackable: true,  icon: '💚' },
  runite_bar:     { id: 'runite_bar', iconPath: 'materials/metals/ingot_t07',     name: 'Runite Bar',     category: 'bar',   sellValue: 1000, canSell: true,  stackable: true,  icon: '🔵' },
  dragon_bar:     { id: 'dragon_bar', iconPath: 'materials/metals/ingot_t08',     name: 'Dragon Bar',     category: 'bar',   sellValue: 1950, canSell: true,  stackable: true,  icon: '🔴' },
  // ── Raw Fish ───────────────────────────────────────────────
  raw_shrimp:     { id: 'raw_shrimp', iconPath: 'materials/food/fish/fish_01_raw',     name: 'Raw Shrimp',     category: 'raw_fish', sellValue: 3,   canSell: true,  stackable: true,  icon: '🦐' },
  raw_sardine:    { id: 'raw_sardine', iconPath: 'materials/food/fish/fish_02_raw',    name: 'Raw Sardine',    category: 'raw_fish', sellValue: 7,   canSell: true,  stackable: true,  icon: '🐟' },
  raw_herring:    { id: 'raw_herring', iconPath: 'materials/food/fish/fish_03_raw',    name: 'Raw Herring',    category: 'raw_fish', sellValue: 12,  canSell: true,  stackable: true,  icon: '🐟' },
  raw_mackerel:   { id: 'raw_mackerel', iconPath: 'materials/food/fish/fish_04_raw',   name: 'Raw Mackerel',   category: 'raw_fish', sellValue: 18,  canSell: true,  stackable: true,  icon: '🐟' },
  raw_trout:      { id: 'raw_trout', iconPath: 'materials/food/fish/fish_05_raw',      name: 'Raw Trout',      category: 'raw_fish', sellValue: 30,  canSell: true,  stackable: true,  icon: '🐟' },
  raw_salmon:     { id: 'raw_salmon', iconPath: 'materials/food/fish/fish_06_raw',     name: 'Raw Salmon',     category: 'raw_fish', sellValue: 45,  canSell: true,  stackable: true,  icon: '🐠' },
  raw_lobster:    { id: 'raw_lobster', iconPath: 'materials/food/fish/fish_07_raw',    name: 'Raw Lobster',    category: 'raw_fish', sellValue: 80,  canSell: true,  stackable: true,  icon: '🦞' },
  raw_swordfish:  { id: 'raw_swordfish', iconPath: 'materials/food/fish/fish_08_raw',  name: 'Raw Swordfish',  category: 'raw_fish', sellValue: 130, canSell: true,  stackable: true,  icon: '🐡' },
  raw_crab:       { id: 'raw_crab', iconPath: 'materials/food/fish/fish_09_raw',       name: 'Raw Crab',       category: 'raw_fish', sellValue: 160, canSell: true,  stackable: true,  icon: '🦀' },
  raw_shark:      { id: 'raw_shark', iconPath: 'materials/food/fish/fish_10_raw',      name: 'Raw Shark',      category: 'raw_fish', sellValue: 210, canSell: true,  stackable: true,  icon: '🦈' },
  raw_manta_ray:  { id: 'raw_manta_ray', iconPath: 'materials/food/fish/fish_11_raw',  name: 'Raw Manta Ray',  category: 'raw_fish', sellValue: 500, canSell: true,  stackable: true,  icon: '🐟' },
  raw_whale:      { id: 'raw_whale', iconPath: 'materials/food/fish/fish_12_raw',      name: 'Raw Whale',      category: 'raw_fish', sellValue: 800, canSell: true,  stackable: true,  icon: '🐋' },
  // ── Cooked Fish ─────────────────────────────────────────────
  shrimp:         { id: 'shrimp', iconPath: 'materials/food/fish/fish_01_cooked',         name: 'Shrimp',         category: 'cooked_fish', sellValue: 5,    canSell: true,  stackable: true,  healAmount: 3,  icon: '🦐' },
  sardine:        { id: 'sardine', iconPath: 'materials/food/fish/fish_02_cooked',        name: 'Sardine',        category: 'cooked_fish', sellValue: 10,   canSell: true,  stackable: true,  healAmount: 4,  icon: '🐟' },
  herring:        { id: 'herring', iconPath: 'materials/food/fish/fish_03_cooked',        name: 'Herring',        category: 'cooked_fish', sellValue: 15,   canSell: true,  stackable: true,  healAmount: 5,  icon: '🐟' },
  mackerel:       { id: 'mackerel', iconPath: 'materials/food/fish/fish_04_cooked',       name: 'Mackerel',       category: 'cooked_fish', sellValue: 22,   canSell: true,  stackable: true,  healAmount: 7,  icon: '🐟' },
  trout:          { id: 'trout', iconPath: 'materials/food/fish/fish_05_cooked',          name: 'Trout',          category: 'cooked_fish', sellValue: 40,   canSell: true,  stackable: true,  healAmount: 9,  icon: '🐟' },
  salmon:         { id: 'salmon', iconPath: 'materials/food/fish/fish_06_cooked',         name: 'Salmon',         category: 'cooked_fish', sellValue: 60,   canSell: true,  stackable: true,  healAmount: 12, icon: '🐠' },
  lobster:        { id: 'lobster', iconPath: 'materials/food/fish/fish_07_cooked',        name: 'Lobster',        category: 'cooked_fish', sellValue: 100,  canSell: true,  stackable: true,  healAmount: 15, icon: '🦞' },
  swordfish:      { id: 'swordfish', iconPath: 'materials/food/fish/fish_08_cooked',      name: 'Swordfish',      category: 'cooked_fish', sellValue: 170,  canSell: true,  stackable: true,  healAmount: 20, icon: '🐡' },
  cooked_crab:    { id: 'cooked_crab', iconPath: 'materials/food/fish/fish_09_cooked',    name: 'Cooked Crab',    category: 'cooked_fish', sellValue: 200,  canSell: true,  stackable: true,  healAmount: 22, icon: '🦀' },
  shark:          { id: 'shark', iconPath: 'materials/food/fish/fish_10_cooked',          name: 'Shark',          category: 'cooked_fish', sellValue: 280,  canSell: true,  stackable: true,  healAmount: 25, icon: '🦈' },
  manta_ray:      { id: 'manta_ray', iconPath: 'materials/food/fish/fish_11_cooked',      name: 'Manta Ray',      category: 'cooked_fish', sellValue: 650,  canSell: true,  stackable: true,  healAmount: 30, icon: '🐟' },
  whale:          { id: 'whale', iconPath: 'materials/food/fish/fish_12_cooked',          name: 'Whale',          category: 'cooked_fish', sellValue: 1000, canSell: true,  stackable: true,  healAmount: 35, icon: '🐋' },
  burnt_fish:     { id: 'burnt_fish',     name: 'Burnt Fish',     category: 'cooked_fish', sellValue: 1,    canSell: true,  stackable: true,  icon: '🔥' },
  // ── Bones ───────────────────────────────────────────────────
  bones:          { id: 'bones',          name: 'Bones',          category: 'bone', sellValue: 5,    canSell: true,  stackable: true,  icon: '🦴' },
  big_bones:      { id: 'big_bones',      name: 'Big Bones',      category: 'bone', sellValue: 15,   canSell: true,  stackable: true,  icon: '🦴' },
  dragon_bones:   { id: 'dragon_bones',   name: 'Dragon Bones',   category: 'bone', sellValue: 250,  canSell: true,  stackable: true,  icon: '🦴' },
  // ── Runes ───────────────────────────────────────────────────
  air_rune:       { id: 'air_rune',       name: 'Air Rune',       category: 'rune', sellValue: 4,    canSell: true,  stackable: true,  icon: '💨' },
  water_rune:     { id: 'water_rune',     name: 'Water Rune',     category: 'rune', sellValue: 4,    canSell: true,  stackable: true,  icon: '💧' },
  earth_rune:     { id: 'earth_rune',     name: 'Earth Rune',     category: 'rune', sellValue: 4,    canSell: true,  stackable: true,  icon: '🌍' },
  fire_rune:      { id: 'fire_rune',      name: 'Fire Rune',      category: 'rune', sellValue: 6,    canSell: true,  stackable: true,  icon: '🔥' },
  mind_rune:      { id: 'mind_rune',      name: 'Mind Rune',      category: 'rune', sellValue: 6,    canSell: true,  stackable: true,  icon: '🧠' },
  body_rune:      { id: 'body_rune',      name: 'Body Rune',      category: 'rune', sellValue: 6,    canSell: true,  stackable: true,  icon: '🫀' },
  chaos_rune:     { id: 'chaos_rune',     name: 'Chaos Rune',     category: 'rune', sellValue: 20,   canSell: true,  stackable: true,  icon: '🌀' },
  death_rune:     { id: 'death_rune',     name: 'Death Rune',     category: 'rune', sellValue: 30,   canSell: true,  stackable: true,  icon: '💀' },
  blood_rune:     { id: 'blood_rune',     name: 'Blood Rune',     category: 'rune', sellValue: 50,   canSell: true,  stackable: true,  icon: '🩸' },
  ancient_rune:   { id: 'ancient_rune',   name: 'Ancient Rune',   category: 'rune', sellValue: 100,  canSell: true,  stackable: true,  icon: '⚡' },
  // ── Gems ────────────────────────────────────────────────────
  topaz:          { id: 'topaz',          name: 'Topaz',          category: 'gem',  sellValue: 750,  canSell: true,  stackable: true,  icon: '🟠' },
  sapphire:       { id: 'sapphire',       name: 'Sapphire',       category: 'gem',  sellValue: 1500, canSell: true,  stackable: true,  icon: '💎' },
  emerald:        { id: 'emerald',        name: 'Emerald',        category: 'gem',  sellValue: 3000, canSell: true,  stackable: true,  icon: '💚' },
  ruby:           { id: 'ruby',           name: 'Ruby',           category: 'gem',  sellValue: 5000, canSell: true,  stackable: true,  icon: '❤️' },
  diamond:        { id: 'diamond',        name: 'Diamond',        category: 'gem',  sellValue: 10000,canSell: true,  stackable: true,  icon: '💎' },
  onyx:           { id: 'onyx',           name: 'Onyx',           category: 'gem',  sellValue: 25000,canSell: true,  stackable: true,  icon: '🖤' },
  // ── Herbs ───────────────────────────────────────────────────
  guam:           { id: 'guam',           name: 'Guam Leaf',      category: 'herb', sellValue: 50,   canSell: true,  stackable: true,  icon: '🌿' },
  marrentill:     { id: 'marrentill',     name: 'Marrentill',     category: 'herb', sellValue: 75,   canSell: true,  stackable: true,  icon: '🌿' },
  tarromin:       { id: 'tarromin',       name: 'Tarromin',       category: 'herb', sellValue: 100,  canSell: true,  stackable: true,  icon: '🌿' },
  harralander:    { id: 'harralander',    name: 'Harralander',    category: 'herb', sellValue: 150,  canSell: true,  stackable: true,  icon: '🌿' },
  ranarr:         { id: 'ranarr',         name: 'Ranarr Weed',    category: 'herb', sellValue: 300,  canSell: true,  stackable: true,  icon: '🌿' },
  toadflax:       { id: 'toadflax',       name: 'Toadflax',       category: 'herb', sellValue: 400,  canSell: true,  stackable: true,  icon: '🌿' },
  irit:           { id: 'irit',           name: 'Irit Leaf',      category: 'herb', sellValue: 500,  canSell: true,  stackable: true,  icon: '🌿' },
  avantoe:        { id: 'avantoe',        name: 'Avantoe',        category: 'herb', sellValue: 700,  canSell: true,  stackable: true,  icon: '🌿' },
  kwuarm:         { id: 'kwuarm',         name: 'Kwuarm',         category: 'herb', sellValue: 1000, canSell: true,  stackable: true,  icon: '🌿' },
  snapdragon:     { id: 'snapdragon',     name: 'Snapdragon',     category: 'herb', sellValue: 1500, canSell: true,  stackable: true,  icon: '🌿' },
  cadantine:      { id: 'cadantine',      name: 'Cadantine',      category: 'herb', sellValue: 2000, canSell: true,  stackable: true,  icon: '🌿' },
  torstol:        { id: 'torstol',        name: 'Torstol',        category: 'herb', sellValue: 5000, canSell: true,  stackable: true,  icon: '🌿' },
  // ── Weapons ─────────────────────────────────────────────────
  bronze_sword:   { id: 'bronze_sword', iconPath: 'weapons/sword_1h/t01',   name: 'Bronze Sword',   category: 'weapon', equipSlot: 'weapon', sellValue: 50,    canSell: true, stackable: false, icon: '⚔️', combatStats: { attackBonus: 7,  strengthBonus: 8  } },
  iron_sword:     { id: 'iron_sword', iconPath: 'weapons/sword_1h/t02',     name: 'Iron Sword',     category: 'weapon', equipSlot: 'weapon', sellValue: 150,   canSell: true, stackable: false, icon: '⚔️', combatStats: { attackBonus: 10, strengthBonus: 12 } },
  steel_sword:    { id: 'steel_sword', iconPath: 'weapons/sword_1h/t03',    name: 'Steel Sword',    category: 'weapon', equipSlot: 'weapon', sellValue: 500,   canSell: true, stackable: false, icon: '⚔️', combatStats: { attackBonus: 15, strengthBonus: 18 } },
  mithril_sword:  { id: 'mithril_sword', iconPath: 'weapons/sword_1h/t04',  name: 'Mithril Sword',  category: 'weapon', equipSlot: 'weapon', sellValue: 2000,  canSell: true, stackable: false, icon: '⚔️', combatStats: { attackBonus: 25, strengthBonus: 30 } },
  adamant_sword:  { id: 'adamant_sword', iconPath: 'weapons/sword_1h/t05',  name: 'Adamant Sword',  category: 'weapon', equipSlot: 'weapon', sellValue: 8000,  canSell: true, stackable: false, icon: '⚔️', combatStats: { attackBonus: 35, strengthBonus: 42 } },
  rune_sword:     { id: 'rune_sword', iconPath: 'weapons/sword_1h/t06',     name: 'Rune Sword',     category: 'weapon', equipSlot: 'weapon', sellValue: 25000, canSell: true, stackable: false, icon: '⚔️', combatStats: { attackBonus: 45, strengthBonus: 54 } },
  dragon_sword:   { id: 'dragon_sword', iconPath: 'weapons/sword_1h/t07',   name: 'Dragon Sword',   category: 'weapon', equipSlot: 'weapon', sellValue: 80000, canSell: true, stackable: false, icon: '🐉', combatStats: { attackBonus: 60, strengthBonus: 72 } },
  // ── Helms ───────────────────────────────────────────────────
  bronze_helm:    { id: 'bronze_helm', iconPath: 'armor/plate/t01/helmet',    name: 'Bronze Helm',    category: 'helm', equipSlot: 'helm', sellValue: 30,    canSell: true, stackable: false, icon: '⛑️', combatStats: { defenceBonus: 5  } },
  iron_helm:      { id: 'iron_helm', iconPath: 'armor/plate/t02/helmet',      name: 'Iron Helm',      category: 'helm', equipSlot: 'helm', sellValue: 100,   canSell: true, stackable: false, icon: '⛑️', combatStats: { defenceBonus: 8  } },
  steel_helm:     { id: 'steel_helm', iconPath: 'armor/plate/t03/helmet',     name: 'Steel Helm',     category: 'helm', equipSlot: 'helm', sellValue: 350,   canSell: true, stackable: false, icon: '⛑️', combatStats: { defenceBonus: 12 } },
  mithril_helm:   { id: 'mithril_helm', iconPath: 'armor/plate/t04/helmet',   name: 'Mithril Helm',   category: 'helm', equipSlot: 'helm', sellValue: 1500,  canSell: true, stackable: false, icon: '⛑️', combatStats: { defenceBonus: 20 } },
  adamant_helm:   { id: 'adamant_helm', iconPath: 'armor/plate/t05/helmet',   name: 'Adamant Helm',   category: 'helm', equipSlot: 'helm', sellValue: 5000,  canSell: true, stackable: false, icon: '⛑️', combatStats: { defenceBonus: 30 } },
  rune_helm:      { id: 'rune_helm', iconPath: 'armor/plate/t06/helmet',      name: 'Rune Helm',      category: 'helm', equipSlot: 'helm', sellValue: 18000, canSell: true, stackable: false, icon: '⛑️', combatStats: { defenceBonus: 40 } },
  dragon_helm:    { id: 'dragon_helm', iconPath: 'armor/plate/t07/helmet',    name: 'Dragon Helm',    category: 'helm', equipSlot: 'helm', sellValue: 60000, canSell: true, stackable: false, icon: '🐉', combatStats: { defenceBonus: 55 } },
  // ── Platebodies ──────────────────────────────────────────────
  bronze_platebody:   { id: 'bronze_platebody', iconPath: 'armor/plate/t01/chest',   name: 'Bronze Platebody',   category: 'platebody', equipSlot: 'platebody', sellValue: 150,    canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 15  } },
  iron_platebody:     { id: 'iron_platebody', iconPath: 'armor/plate/t02/chest',     name: 'Iron Platebody',     category: 'platebody', equipSlot: 'platebody', sellValue: 500,    canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 25  } },
  steel_platebody:    { id: 'steel_platebody', iconPath: 'armor/plate/t03/chest',    name: 'Steel Platebody',    category: 'platebody', equipSlot: 'platebody', sellValue: 1500,   canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 40  } },
  mithril_platebody:  { id: 'mithril_platebody', iconPath: 'armor/plate/t04/chest',  name: 'Mithril Platebody',  category: 'platebody', equipSlot: 'platebody', sellValue: 6000,   canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 60  } },
  adamant_platebody:  { id: 'adamant_platebody', iconPath: 'armor/plate/t05/chest',  name: 'Adamant Platebody',  category: 'platebody', equipSlot: 'platebody', sellValue: 20000,  canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 80  } },
  rune_platebody:     { id: 'rune_platebody', iconPath: 'armor/plate/t06/chest',     name: 'Rune Platebody',     category: 'platebody', equipSlot: 'platebody', sellValue: 65000,  canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 105 } },
  dragon_platebody:   { id: 'dragon_platebody', iconPath: 'armor/plate/t07/chest',   name: 'Dragon Platebody',   category: 'platebody', equipSlot: 'platebody', sellValue: 200000, canSell: true, stackable: false, icon: '🐉', combatStats: { defenceBonus: 130 } },
  // ── Shields ─────────────────────────────────────────────────
  bronze_shield:  { id: 'bronze_shield', iconPath: 'weapons/shield/t01',  name: 'Bronze Shield',  category: 'shield', equipSlot: 'shield', sellValue: 50,    canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 6  } },
  iron_shield:    { id: 'iron_shield', iconPath: 'weapons/shield/t02',    name: 'Iron Shield',    category: 'shield', equipSlot: 'shield', sellValue: 150,   canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 10 } },
  steel_shield:   { id: 'steel_shield', iconPath: 'weapons/shield/t03',   name: 'Steel Shield',   category: 'shield', equipSlot: 'shield', sellValue: 500,   canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 16 } },
  mithril_shield: { id: 'mithril_shield', iconPath: 'weapons/shield/t04', name: 'Mithril Shield', category: 'shield', equipSlot: 'shield', sellValue: 2000,  canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 24 } },
  adamant_shield: { id: 'adamant_shield', iconPath: 'weapons/shield/t05', name: 'Adamant Shield', category: 'shield', equipSlot: 'shield', sellValue: 7000,  canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 34 } },
  rune_shield:    { id: 'rune_shield', iconPath: 'weapons/shield/t06',    name: 'Rune Shield',    category: 'shield', equipSlot: 'shield', sellValue: 22000, canSell: true, stackable: false, icon: '🛡️', combatStats: { defenceBonus: 44 } },
  dragon_shield:  { id: 'dragon_shield', iconPath: 'weapons/shield/t07',  name: 'Dragon Shield',  category: 'shield', equipSlot: 'shield', sellValue: 70000, canSell: true, stackable: false, icon: '🐉', combatStats: { defenceBonus: 60 } },
  // ── Misc ────────────────────────────────────────────────────
  mark_of_mastery: { id: 'mark_of_mastery', name: 'Mark of Mastery', category: 'misc', sellValue: 0,    canSell: false, stackable: true,  icon: '✨' },
  ancient_key:     { id: 'ancient_key',     name: 'Ancient Key',     category: 'misc', sellValue: 100,  canSell: true,  stackable: true,  icon: '🗝️' },
  slayer_coin:     { id: 'slayer_coin',     name: 'Slayer Coin',     category: 'misc', sellValue: 0,    canSell: false, stackable: true,  icon: '🪙' },
};

export default ITEMS;
export function getItem(id: string): Item | undefined {
  return ITEMS[id];
}
export function getAllItems(): Item[] {
  return Object.values(ITEMS);
}
