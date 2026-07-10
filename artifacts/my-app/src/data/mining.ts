import type { MiningRock } from './types';

export const ROCKS: MiningRock[] = [
  { id: 'copper_rock',     name: 'Copper Rock',     levelRequired: 1,   xp: 17.5, masteryXp: 3,  interval: 3000, oreId: 'copper_ore'     },
  { id: 'tin_rock',        name: 'Tin Rock',        levelRequired: 1,   xp: 17.5, masteryXp: 3,  interval: 3000, oreId: 'tin_ore'        },
  { id: 'iron_rock',       name: 'Iron Rock',       levelRequired: 15,  xp: 30,   masteryXp: 4,  interval: 3500, oreId: 'iron_ore'       },
  { id: 'coal_rock',       name: 'Coal Rock',       levelRequired: 20,  xp: 40,   masteryXp: 4,  interval: 4000, oreId: 'coal_ore'       },
  { id: 'gold_rock',       name: 'Gold Rock',       levelRequired: 40,  xp: 65,   masteryXp: 5,  interval: 4500, oreId: 'gold_ore',      gemChance: 0.002 },
  { id: 'mithril_rock',    name: 'Mithril Rock',    levelRequired: 55,  xp: 80,   masteryXp: 6,  interval: 5000, oreId: 'mithril_ore',   gemChance: 0.003 },
  { id: 'adamantite_rock', name: 'Adamantite Rock', levelRequired: 70,  xp: 95,   masteryXp: 7,  interval: 5000, oreId: 'adamantite_ore',gemChance: 0.004 },
  { id: 'runite_rock',     name: 'Runite Rock',     levelRequired: 85,  xp: 130,  masteryXp: 8,  interval: 6000, oreId: 'runite_ore',    gemChance: 0.006 },
  { id: 'dragonite_rock',  name: 'Dragonite Rock',  levelRequired: 95,  xp: 180,  masteryXp: 10, interval: 7000, oreId: 'dragonite_ore', gemChance: 0.01  },
];

// Gem chances by tier when mining a gem rock
export const GEM_DROPS = [
  { itemId: 'topaz',    weight: 50 },
  { itemId: 'sapphire', weight: 30 },
  { itemId: 'emerald',  weight: 15 },
  { itemId: 'ruby',     weight: 10 },
  { itemId: 'diamond',  weight: 5  },
  { itemId: 'onyx',     weight: 1  },
];

export const MINING_ROCKS_MAP = Object.fromEntries(ROCKS.map(r => [r.id, r]));
