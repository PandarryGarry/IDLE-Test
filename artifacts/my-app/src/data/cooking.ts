import type { CookingRecipe } from './types';

export const COOKING_RECIPES: CookingRecipe[] = [
  { id: 'cook_shrimp',    name: 'Shrimp',     levelRequired: 1,  xp: 30,   masteryXp: 3,  interval: 3000, rawItemId: 'raw_shrimp',    cookedItemId: 'shrimp',       burntItemId: 'burnt_fish', burnChanceBase: 0.40 },
  { id: 'cook_sardine',   name: 'Sardine',    levelRequired: 10, xp: 40,   masteryXp: 4,  interval: 3000, rawItemId: 'raw_sardine',   cookedItemId: 'sardine',      burntItemId: 'burnt_fish', burnChanceBase: 0.40 },
  { id: 'cook_herring',   name: 'Herring',    levelRequired: 15, xp: 50,   masteryXp: 4,  interval: 3000, rawItemId: 'raw_herring',   cookedItemId: 'herring',      burntItemId: 'burnt_fish', burnChanceBase: 0.38 },
  { id: 'cook_mackerel',  name: 'Mackerel',   levelRequired: 20, xp: 60,   masteryXp: 5,  interval: 3000, rawItemId: 'raw_mackerel',  cookedItemId: 'mackerel',     burntItemId: 'burnt_fish', burnChanceBase: 0.36 },
  { id: 'cook_trout',     name: 'Trout',      levelRequired: 25, xp: 70,   masteryXp: 5,  interval: 3000, rawItemId: 'raw_trout',     cookedItemId: 'trout',        burntItemId: 'burnt_fish', burnChanceBase: 0.34 },
  { id: 'cook_salmon',    name: 'Salmon',     levelRequired: 30, xp: 80,   masteryXp: 6,  interval: 3000, rawItemId: 'raw_salmon',    cookedItemId: 'salmon',       burntItemId: 'burnt_fish', burnChanceBase: 0.32 },
  { id: 'cook_lobster',   name: 'Lobster',    levelRequired: 40, xp: 120,  masteryXp: 7,  interval: 3000, rawItemId: 'raw_lobster',   cookedItemId: 'lobster',      burntItemId: 'burnt_fish', burnChanceBase: 0.30 },
  { id: 'cook_swordfish', name: 'Swordfish',  levelRequired: 45, xp: 140,  masteryXp: 8,  interval: 3000, rawItemId: 'raw_swordfish', cookedItemId: 'swordfish',    burntItemId: 'burnt_fish', burnChanceBase: 0.28 },
  { id: 'cook_crab',      name: 'Crab',       levelRequired: 55, xp: 160,  masteryXp: 8,  interval: 3000, rawItemId: 'raw_crab',      cookedItemId: 'cooked_crab',  burntItemId: 'burnt_fish', burnChanceBase: 0.25 },
  { id: 'cook_shark',     name: 'Shark',      levelRequired: 60, xp: 175,  masteryXp: 9,  interval: 3000, rawItemId: 'raw_shark',     cookedItemId: 'shark',        burntItemId: 'burnt_fish', burnChanceBase: 0.25 },
  { id: 'cook_manta_ray', name: 'Manta Ray',  levelRequired: 80, xp: 400,  masteryXp: 9,  interval: 3000, rawItemId: 'raw_manta_ray', cookedItemId: 'manta_ray',    burntItemId: 'burnt_fish', burnChanceBase: 0.20 },
  { id: 'cook_whale',     name: 'Whale',      levelRequired: 95, xp: 500,  masteryXp: 10, interval: 3000, rawItemId: 'raw_whale',     cookedItemId: 'whale',        burntItemId: 'burnt_fish', burnChanceBase: 0.15 },
];

export const COOKING_RECIPES_MAP = Object.fromEntries(COOKING_RECIPES.map(r => [r.id, r]));
export const COOKING_BY_RAW = Object.fromEntries(COOKING_RECIPES.map(r => [r.rawItemId, r]));
