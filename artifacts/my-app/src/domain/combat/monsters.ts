import type { Monster, CombatArea } from '../../data/types.ts';

/**
 * Дроп — только наши предметы каталога (трофеи/шкуры/мясо охоты,
 * наши руда/слитки/угли + снаряжение). Мелворовских костей/рун/руд нет.
 */
export const MONSTERS: Monster[] = [
  // ── Дальние фермы ──────────────────────────────────────────
  {
    id: 'chicken', name: 'Курица', areaId: 'farmlands',
    maxHp: 10, attackLevel: 1, strengthLevel: 1, defenceLevel: 1,
    attackBonus: 0, strengthBonus: 0, defenceBonus: 0,
    maxHit: 1, attackInterval: 2400,
    combatLevel: 1,
    drops: [{ itemId: 'meat_poultry', chance: 1.0, quantity: [1, 1] }],
    gpDrop: [1, 5],
  },
  {
    id: 'cow', name: 'Бык', areaId: 'farmlands',
    maxHp: 25, attackLevel: 3, strengthLevel: 3, defenceLevel: 3,
    attackBonus: 0, strengthBonus: 0, defenceBonus: 0,
    maxHit: 3, attackInterval: 2400,
    combatLevel: 2,
    drops: [
      { itemId: 'meat_steak', chance: 1.0, quantity: [1, 1] },
      { itemId: 'hide_raw', chance: 0.5, quantity: [1, 1] },
    ],
    gpDrop: [3, 15],
  },
  {
    id: 'goblin', name: 'Гоблин-дозорный', areaId: 'farmlands',
    maxHp: 35, attackLevel: 5, strengthLevel: 5, defenceLevel: 3,
    attackBonus: 5, strengthBonus: 5, defenceBonus: 5,
    maxHit: 6, attackInterval: 2400,
    combatLevel: 5,
    drops: [
      { itemId: 'trophy_guts', chance: 0.7, quantity: [1, 1] },
      { itemId: 'gear_sword_1h_t03', chance: 0.02, quantity: [1, 1] },
      { itemId: 'coal', chance: 0.05, quantity: [1, 5] },
    ],
    gpDrop: [5, 30],
  },
  {
    id: 'hobgoblin', name: 'Хобгоблин-рубила', areaId: 'farmlands',
    maxHp: 80, attackLevel: 20, strengthLevel: 18, defenceLevel: 15,
    attackBonus: 15, strengthBonus: 12, defenceBonus: 10,
    maxHit: 12, attackInterval: 2400,
    combatLevel: 28,
    drops: [
      { itemId: 'hide_raw', chance: 1.0, quantity: [1, 1] },
      { itemId: 'gear_sword_1h_t04', chance: 0.05, quantity: [1, 1] },
      { itemId: 'ore_iron', chance: 0.15, quantity: [1, 5] },
    ],
    gpDrop: [15, 80],
  },
  // ── Паучье логово ──────────────────────────────────────────
  {
    id: 'spider', name: 'Пещерный паук', areaId: 'spider_den',
    maxHp: 60, attackLevel: 18, strengthLevel: 12, defenceLevel: 12,
    attackBonus: 8, strengthBonus: 5, defenceBonus: 8,
    maxHit: 9, attackInterval: 2000,
    combatLevel: 20,
    drops: [
      { itemId: 'trophy_beast_eye', chance: 0.5, quantity: [1, 1] },
      { itemId: 'ore_iron', chance: 0.1, quantity: [1, 3] },
    ],
    gpDrop: [8, 50],
  },
  {
    id: 'giant_spider', name: 'Матка логова', areaId: 'spider_den',
    maxHp: 150, attackLevel: 40, strengthLevel: 35, defenceLevel: 25,
    attackBonus: 25, strengthBonus: 18, defenceBonus: 20,
    maxHit: 22, attackInterval: 2400,
    combatLevel: 52,
    drops: [
      { itemId: 'trophy_beast_eye', chance: 1.0, quantity: [1, 2] },
      { itemId: 'gear_sword_1h_t05', chance: 0.03, quantity: [1, 1] },
      { itemId: 'coal_anthracite', chance: 0.2, quantity: [3, 8] },
    ],
    gpDrop: [50, 200],
  },
  // ── Старое кладбище ────────────────────────────────────────
  {
    id: 'skeleton', name: 'Скелет-щитник', areaId: 'undead_graveyard',
    maxHp: 120, attackLevel: 30, strengthLevel: 25, defenceLevel: 20,
    attackBonus: 20, strengthBonus: 15, defenceBonus: 15,
    maxHit: 16, attackInterval: 2400,
    combatLevel: 35,
    drops: [
      { itemId: 'gear_sword_1h_t04', chance: 0.05, quantity: [1, 1] },
      { itemId: 'coal_embers', chance: 0.1, quantity: [1, 5] },
    ],
    gpDrop: [20, 100],
  },
  {
    id: 'undead_warrior', name: 'Мёртвый дружинник', areaId: 'undead_graveyard',
    maxHp: 200, attackLevel: 50, strengthLevel: 45, defenceLevel: 35,
    attackBonus: 35, strengthBonus: 28, defenceBonus: 28,
    maxHit: 26, attackInterval: 2400,
    combatLevel: 65,
    drops: [
      { itemId: 'gear_sword_1h_t05', chance: 0.1, quantity: [1, 1] },
      { itemId: 'gear_plate_chest_t05', chance: 0.02, quantity: [1, 1] },
      { itemId: 'coal_embers', chance: 0.2, quantity: [1, 3] },
    ],
    gpDrop: [60, 300],
  },
  // ── Тёмная чаща ────────────────────────────────────────────
  {
    id: 'wolf', name: 'Серый волк', areaId: 'forest',
    maxHp: 90, attackLevel: 25, strengthLevel: 22, defenceLevel: 18,
    attackBonus: 10, strengthBonus: 8, defenceBonus: 12,
    maxHit: 14, attackInterval: 2000,
    combatLevel: 30,
    drops: [
      { itemId: 'meat_ribs', chance: 0.7, quantity: [1, 2] },
      { itemId: 'hide_raw', chance: 0.5, quantity: [1, 1] },
    ],
    gpDrop: [10, 60],
  },
  // ── Лавовый берег ──────────────────────────────────────────
  {
    id: 'fire_elemental', name: 'Пепельный элементаль', areaId: 'lava_lake',
    maxHp: 350, attackLevel: 70, strengthLevel: 65, defenceLevel: 50,
    attackBonus: 50, strengthBonus: 45, defenceBonus: 40,
    maxHit: 40, attackInterval: 2400,
    combatLevel: 100,
    drops: [
      { itemId: 'coal_embers', chance: 0.5,  quantity: [5, 20] },
      { itemId: 'ore_mithril', chance: 0.15, quantity: [1, 5] },
    ],
    gpDrop: [100, 500],
  },
  // ── Драконья расселина (босс) ──────────────────────────────
  {
    id: 'green_dragon', name: 'Зелёный дракон', areaId: 'dragons_lair',
    maxHp: 500, attackLevel: 80, strengthLevel: 80, defenceLevel: 65,
    attackBonus: 65, strengthBonus: 60, defenceBonus: 60,
    maxHit: 50, attackInterval: 3000,
    combatLevel: 130,
    drops: [
      { itemId: 'leather_scaled', chance: 1.0,  quantity: [1, 3] },
      { itemId: 'bar_orichalcum', chance: 0.1,  quantity: [1, 1] },
      { itemId: 'gear_sword_1h_t12',   chance: 0.01, quantity: [1, 1] },
      { itemId: 'gear_plate_chest_t11', chance: 0.05, quantity: [1, 1] },
    ],
    gpDrop: [500, 2000], isBoss: true,
  },
];

export const COMBAT_AREAS: CombatArea[] = [
  {
    id: 'farmlands',
    name: 'Дальние фермы',
    monsterIds: ['chicken', 'cow', 'goblin', 'hobgoblin'],
    description: 'Разминка и первые стаи: безопасно изучать таймеры и добивания.',
  },
  {
    id: 'spider_den',
    name: 'Паучье логово',
    monsterIds: ['spider', 'giant_spider'],
    combatLevelRequired: 15,
    description: 'Яд, быстрые окна и давление несколькими целями.',
  },
  {
    id: 'undead_graveyard',
    name: 'Старое кладбище',
    monsterIds: ['skeleton', 'undead_warrior'],
    combatLevelRequired: 25,
    description: 'Броня и тяжёлые удары: пригодится Пробой.',
  },
  {
    id: 'forest',
    name: 'Тёмная чаща',
    monsterIds: ['wolf'],
    combatLevelRequired: 20,
    description: 'Волки атакуют часто: Манёвр ценнее грубой брони.',
  },
  {
    id: 'lava_lake',
    name: 'Лавовый берег',
    monsterIds: ['fire_elemental'],
    combatLevelRequired: 80,
    description: 'Высокий входящий урон и длинная вылазка для подготовленного героя.',
  },
  {
    id: 'dragons_lair',
    name: 'Драконья расселина',
    monsterIds: ['green_dragon'],
    combatLevelRequired: 100,
    isDungeon: true,
    description: 'Босс-событие с тяжёлыми телеграфами и окнами реакции.',
  },
];

export const MONSTERS_MAP = Object.fromEntries(MONSTERS.map(m => [m.id, m]));
export const AREAS_MAP = Object.fromEntries(COMBAT_AREAS.map(a => [a.id, a]));
