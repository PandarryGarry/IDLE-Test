import type { FishingSpot } from './types';

export const FISHING_SPOTS: FishingSpot[] = [
  { id: 'shrimp_spot',    name: 'Shrimp',     description: 'A calm spot for catching small shrimp.', levelRequired: 1,  xp: 10,   masteryXp: 2,  interval: 4000,  fishId: 'raw_shrimp'    },
  { id: 'sardine_spot',   name: 'Sardine',    description: 'Common fish that cooks quickly.', levelRequired: 5,  xp: 15,   masteryXp: 2,  interval: 5000,  fishId: 'raw_sardine'   },
  { id: 'herring_spot',   name: 'Herring',    description: 'A dependable catch for growing anglers.', levelRequired: 10, xp: 20,   masteryXp: 3,  interval: 5000,  fishId: 'raw_herring'   },
  { id: 'mackerel_spot',  name: 'Mackerel',   description: 'A heartier fish worth taking to the kitchen.', levelRequired: 16, xp: 25,   masteryXp: 3,  interval: 5000,  fishId: 'raw_mackerel'  },
  { id: 'trout_spot',     name: 'Trout',      levelRequired: 25, xp: 50,   masteryXp: 4,  interval: 6000,  fishId: 'raw_trout'     },
  { id: 'salmon_spot',    name: 'Salmon',     levelRequired: 30, xp: 70,   masteryXp: 5,  interval: 6000,  fishId: 'raw_salmon'    },
  { id: 'lobster_spot',   name: 'Lobster',    levelRequired: 40, xp: 95,   masteryXp: 6,  interval: 7000,  fishId: 'raw_lobster'   },
  { id: 'swordfish_spot', name: 'Swordfish',  levelRequired: 50, xp: 120,  masteryXp: 7,  interval: 7000,  fishId: 'raw_swordfish' },
  { id: 'crab_spot',      name: 'Crab',       levelRequired: 55, xp: 135,  masteryXp: 7,  interval: 7000,  fishId: 'raw_crab'      },
  { id: 'shark_spot',     name: 'Shark',      levelRequired: 60, xp: 150,  masteryXp: 8,  interval: 8000,  fishId: 'raw_shark'     },
  { id: 'manta_ray_spot', name: 'Manta Ray',  levelRequired: 80, xp: 350,  masteryXp: 9,  interval: 10000, fishId: 'raw_manta_ray' },
  { id: 'whale_spot',     name: 'Whale',      levelRequired: 95, xp: 500,  masteryXp: 10, interval: 12000, fishId: 'raw_whale'     },
];

export const JUNK_ITEMS = ['bones', 'air_rune', 'coal_ore'];
export const FISHING_SPOTS_MAP = Object.fromEntries(FISHING_SPOTS.map(s => [s.id, s]));
