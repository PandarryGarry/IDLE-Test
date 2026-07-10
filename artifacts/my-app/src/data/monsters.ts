import type { Monster, CombatArea } from './types';

export const MONSTERS: Monster[] = [
  // ── Farmlands ──────────────────────────────────────────────
  {
    id: 'chicken', name: 'Chicken', areaId: 'farmlands',
    maxHp: 10, attackLevel: 1, strengthLevel: 1, defenceLevel: 1,
    attackBonus: 0, strengthBonus: 0, defenceBonus: 0,
    maxHit: 1, attackInterval: 2400, combatStyle: 'melee',
    combatLevel: 1,
    drops: [{ itemId: 'bones', chance: 1.0, quantity: [1, 1] }],
    gpDrop: [1, 5], bones: 'bones', slayerXp: 1,
  },
  {
    id: 'cow', name: 'Cow', areaId: 'farmlands',
    maxHp: 25, attackLevel: 3, strengthLevel: 3, defenceLevel: 3,
    attackBonus: 0, strengthBonus: 0, defenceBonus: 0,
    maxHit: 3, attackInterval: 2400, combatStyle: 'melee',
    combatLevel: 2,
    drops: [{ itemId: 'bones', chance: 1.0, quantity: [1, 1] }],
    gpDrop: [3, 15], bones: 'bones', slayerXp: 3,
  },
  {
    id: 'goblin', name: 'Goblin', areaId: 'farmlands',
    maxHp: 35, attackLevel: 5, strengthLevel: 5, defenceLevel: 3,
    attackBonus: 5, strengthBonus: 5, defenceBonus: 5,
    maxHit: 6, attackInterval: 2400, combatStyle: 'melee',
    combatLevel: 5,
    drops: [
      { itemId: 'bones', chance: 1.0, quantity: [1, 1] },
      { itemId: 'bronze_sword', chance: 0.02, quantity: [1, 1] },
      { itemId: 'coal_ore', chance: 0.05, quantity: [1, 5] },
    ],
    gpDrop: [5, 30], bones: 'bones', slayerXp: 5,
  },
  {
    id: 'hobgoblin', name: 'Hobgoblin', areaId: 'farmlands',
    maxHp: 80, attackLevel: 20, strengthLevel: 18, defenceLevel: 15,
    attackBonus: 15, strengthBonus: 12, defenceBonus: 10,
    maxHit: 12, attackInterval: 2400, combatStyle: 'melee',
    combatLevel: 28,
    drops: [
      { itemId: 'bones', chance: 1.0, quantity: [1, 1] },
      { itemId: 'iron_sword', chance: 0.05, quantity: [1, 1] },
      { itemId: 'iron_ore', chance: 0.15, quantity: [1, 5] },
    ],
    gpDrop: [15, 80], bones: 'bones', slayerXp: 28,
  },
  // ── Spider Den ─────────────────────────────────────────────
  {
    id: 'spider', name: 'Spider', areaId: 'spider_den',
    maxHp: 60, attackLevel: 18, strengthLevel: 12, defenceLevel: 12,
    attackBonus: 8, strengthBonus: 5, defenceBonus: 8,
    maxHit: 9, attackInterval: 2000, combatStyle: 'melee',
    combatLevel: 20,
    drops: [
      { itemId: 'bones', chance: 1.0, quantity: [1, 1] },
      { itemId: 'iron_ore', chance: 0.1, quantity: [1, 3] },
    ],
    gpDrop: [8, 50], bones: 'bones', slayerXp: 15,
  },
  {
    id: 'giant_spider', name: 'Giant Spider', areaId: 'spider_den',
    maxHp: 150, attackLevel: 40, strengthLevel: 35, defenceLevel: 25,
    attackBonus: 25, strengthBonus: 18, defenceBonus: 20,
    maxHit: 22, attackInterval: 2400, combatStyle: 'melee',
    combatLevel: 52,
    drops: [
      { itemId: 'bones', chance: 1.0, quantity: [1, 1] },
      { itemId: 'steel_sword', chance: 0.03, quantity: [1, 1] },
      { itemId: 'coal_ore', chance: 0.2, quantity: [3, 8] },
    ],
    gpDrop: [50, 200], bones: 'bones', slayerXp: 52,
  },
  // ── Undead Graveyard ────────────────────────────────────────
  {
    id: 'skeleton', name: 'Skeleton', areaId: 'undead_graveyard',
    maxHp: 120, attackLevel: 30, strengthLevel: 25, defenceLevel: 20,
    attackBonus: 20, strengthBonus: 15, defenceBonus: 15,
    maxHit: 16, attackInterval: 2400, combatStyle: 'melee',
    combatLevel: 35,
    drops: [
      { itemId: 'bones', chance: 1.0, quantity: [1, 1] },
      { itemId: 'iron_sword', chance: 0.05, quantity: [1, 1] },
      { itemId: 'chaos_rune', chance: 0.1, quantity: [1, 5] },
    ],
    gpDrop: [20, 100], bones: 'bones', slayerXp: 35,
  },
  {
    id: 'undead_warrior', name: 'Undead Warrior', areaId: 'undead_graveyard',
    maxHp: 200, attackLevel: 50, strengthLevel: 45, defenceLevel: 35,
    attackBonus: 35, strengthBonus: 28, defenceBonus: 28,
    maxHit: 26, attackInterval: 2400, combatStyle: 'melee',
    combatLevel: 65,
    drops: [
      { itemId: 'bones', chance: 1.0, quantity: [1, 1] },
      { itemId: 'steel_sword', chance: 0.1, quantity: [1, 1] },
      { itemId: 'steel_platebody', chance: 0.02, quantity: [1, 1] },
      { itemId: 'death_rune', chance: 0.2, quantity: [1, 3] },
    ],
    gpDrop: [60, 300], bones: 'bones', slayerXp: 65,
  },
  // ── Forest ─────────────────────────────────────────────────
  {
    id: 'wolf', name: 'Wolf', areaId: 'forest',
    maxHp: 90, attackLevel: 25, strengthLevel: 22, defenceLevel: 18,
    attackBonus: 10, strengthBonus: 8, defenceBonus: 12,
    maxHit: 14, attackInterval: 2000, combatStyle: 'melee',
    combatLevel: 30,
    drops: [
      { itemId: 'bones', chance: 1.0, quantity: [1, 1] },
    ],
    gpDrop: [10, 60], bones: 'bones', slayerXp: 30,
  },
  // ── Lava Lake ──────────────────────────────────────────────
  {
    id: 'fire_elemental', name: 'Fire Elemental', areaId: 'lava_lake',
    maxHp: 350, attackLevel: 70, strengthLevel: 65, defenceLevel: 50,
    attackBonus: 50, strengthBonus: 45, defenceBonus: 40,
    maxHit: 40, attackInterval: 2400, combatStyle: 'magic',
    combatLevel: 100,
    drops: [
      { itemId: 'fire_rune',  chance: 0.5,  quantity: [5, 20] },
      { itemId: 'blood_rune', chance: 0.1,  quantity: [1, 3] },
      { itemId: 'mithril_ore', chance: 0.15, quantity: [1, 5] },
    ],
    gpDrop: [100, 500], slayerXp: 100,
  },
  // ── Dragon's Lair (Boss) ────────────────────────────────────
  {
    id: 'green_dragon', name: 'Green Dragon', areaId: 'dragons_lair',
    maxHp: 500, attackLevel: 80, strengthLevel: 80, defenceLevel: 65,
    attackBonus: 65, strengthBonus: 60, defenceBonus: 60,
    maxHit: 50, attackInterval: 3000, combatStyle: 'melee',
    combatLevel: 130,
    drops: [
      { itemId: 'dragon_bones',  chance: 1.0,  quantity: [1, 1] },
      { itemId: 'dragon_bar',    chance: 0.1,  quantity: [1, 1] },
      { itemId: 'dragon_sword',  chance: 0.01, quantity: [1, 1] },
      { itemId: 'rune_platebody',chance: 0.05, quantity: [1, 1] },
      { itemId: 'blood_rune',    chance: 0.3,  quantity: [5, 15] },
    ],
    gpDrop: [500, 2000], bones: 'dragon_bones', isBoss: true, slayerXp: 200,
  },
];

export const COMBAT_AREAS: CombatArea[] = [
  { id: 'farmlands',        name: 'Farmlands',        monsterIds: ['chicken', 'cow', 'goblin', 'hobgoblin'],          description: 'Safe training area for beginners' },
  { id: 'spider_den',       name: "Spider's Den",      monsterIds: ['spider', 'giant_spider'],                          combatLevelRequired: 15, description: 'Lurkers and crawlers dominate this dark cave' },
  { id: 'undead_graveyard', name: 'Undead Graveyard', monsterIds: ['skeleton', 'undead_warrior'],                      combatLevelRequired: 25, description: 'The restless dead rise here' },
  { id: 'forest',           name: 'Dark Forest',      monsterIds: ['wolf'],                                            combatLevelRequired: 20, description: 'Wolves hunt in the shadows' },
  { id: 'lava_lake',        name: 'Lava Lake',        monsterIds: ['fire_elemental'],                                  combatLevelRequired: 80, description: 'Fire elementals roam the volcanic landscape' },
  { id: 'dragons_lair',     name: "Dragon's Lair",    monsterIds: ['green_dragon'],                                    combatLevelRequired: 100, description: 'Home of the fearsome Green Dragon' },
];

export const MONSTERS_MAP = Object.fromEntries(MONSTERS.map(m => [m.id, m]));
export const AREAS_MAP = Object.fromEntries(COMBAT_AREAS.map(a => [a.id, a]));
