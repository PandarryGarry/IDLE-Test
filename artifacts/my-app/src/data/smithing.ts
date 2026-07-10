import type { SmithingRecipe } from './types';

// Smelting (bars)
export const SMELTING_RECIPES: SmithingRecipe[] = [
  {
    id: 'smelt_bronze', name: 'Bronze Bar', category: 'bars',
    levelRequired: 1,  xp: 12.5,  masteryXp: 2, interval: 3000,
    outputItemId: 'bronze_bar', outputQuantity: 1,
    ingredients: [{ itemId: 'copper_ore', quantity: 1 }, { itemId: 'tin_ore', quantity: 1 }],
  },
  {
    id: 'smelt_iron', name: 'Iron Bar', category: 'bars',
    levelRequired: 15, xp: 37.5,  masteryXp: 3, interval: 3000,
    outputItemId: 'iron_bar', outputQuantity: 1,
    ingredients: [{ itemId: 'iron_ore', quantity: 1 }],
  },
  {
    id: 'smelt_steel', name: 'Steel Bar', category: 'bars',
    levelRequired: 30, xp: 75,    masteryXp: 4, interval: 3000,
    outputItemId: 'steel_bar', outputQuantity: 1,
    ingredients: [{ itemId: 'iron_ore', quantity: 1 }, { itemId: 'coal_ore', quantity: 2 }],
  },
  {
    id: 'smelt_gold', name: 'Gold Bar', category: 'bars',
    levelRequired: 40, xp: 90,    masteryXp: 5, interval: 3000,
    outputItemId: 'gold_bar', outputQuantity: 1,
    ingredients: [{ itemId: 'gold_ore', quantity: 1 }],
  },
  {
    id: 'smelt_mithril', name: 'Mithril Bar', category: 'bars',
    levelRequired: 50, xp: 125,   masteryXp: 6, interval: 3500,
    outputItemId: 'mithril_bar', outputQuantity: 1,
    ingredients: [{ itemId: 'mithril_ore', quantity: 1 }, { itemId: 'coal_ore', quantity: 4 }],
  },
  {
    id: 'smelt_adamantite', name: 'Adamantite Bar', category: 'bars',
    levelRequired: 70, xp: 175,   masteryXp: 7, interval: 4000,
    outputItemId: 'adamantite_bar', outputQuantity: 1,
    ingredients: [{ itemId: 'adamantite_ore', quantity: 1 }, { itemId: 'coal_ore', quantity: 6 }],
  },
  {
    id: 'smelt_runite', name: 'Runite Bar', category: 'bars',
    levelRequired: 85, xp: 250,   masteryXp: 8, interval: 4500,
    outputItemId: 'runite_bar', outputQuantity: 1,
    ingredients: [{ itemId: 'runite_ore', quantity: 1 }, { itemId: 'coal_ore', quantity: 8 }],
  },
  {
    id: 'smelt_dragon', name: 'Dragon Bar', category: 'bars',
    levelRequired: 95, xp: 325,   masteryXp: 10, interval: 5000,
    outputItemId: 'dragon_bar', outputQuantity: 1,
    ingredients: [{ itemId: 'dragonite_ore', quantity: 1 }, { itemId: 'coal_ore', quantity: 10 }],
  },
];

// Smithing equipment (bars → items)
export const SMITHING_RECIPES: SmithingRecipe[] = [
  // Bronze
  { id: 'smith_bronze_sword',      name: 'Bronze Sword',      category: 'equipment', levelRequired: 4,   xp: 25,   masteryXp: 2, interval: 3000, outputItemId: 'bronze_sword',      outputQuantity: 1, ingredients: [{ itemId: 'bronze_bar', quantity: 1 }] },
  { id: 'smith_bronze_helm',       name: 'Bronze Helm',       category: 'equipment', levelRequired: 3,   xp: 25,   masteryXp: 2, interval: 3000, outputItemId: 'bronze_helm',       outputQuantity: 1, ingredients: [{ itemId: 'bronze_bar', quantity: 1 }] },
  { id: 'smith_bronze_shield',     name: 'Bronze Shield',     category: 'equipment', levelRequired: 8,   xp: 50,   masteryXp: 2, interval: 3000, outputItemId: 'bronze_shield',     outputQuantity: 1, ingredients: [{ itemId: 'bronze_bar', quantity: 2 }] },
  { id: 'smith_bronze_platebody',  name: 'Bronze Platebody',  category: 'equipment', levelRequired: 18,  xp: 125,  masteryXp: 3, interval: 3000, outputItemId: 'bronze_platebody',  outputQuantity: 1, ingredients: [{ itemId: 'bronze_bar', quantity: 5 }] },
  // Iron
  { id: 'smith_iron_sword',        name: 'Iron Sword',        category: 'equipment', levelRequired: 19,  xp: 50,   masteryXp: 3, interval: 3000, outputItemId: 'iron_sword',        outputQuantity: 1, ingredients: [{ itemId: 'iron_bar', quantity: 1 }] },
  { id: 'smith_iron_helm',         name: 'Iron Helm',         category: 'equipment', levelRequired: 18,  xp: 50,   masteryXp: 3, interval: 3000, outputItemId: 'iron_helm',         outputQuantity: 1, ingredients: [{ itemId: 'iron_bar', quantity: 1 }] },
  { id: 'smith_iron_platebody',    name: 'Iron Platebody',    category: 'equipment', levelRequired: 33,  xp: 250,  masteryXp: 4, interval: 3000, outputItemId: 'iron_platebody',    outputQuantity: 1, ingredients: [{ itemId: 'iron_bar', quantity: 5 }] },
  // Steel
  { id: 'smith_steel_sword',       name: 'Steel Sword',       category: 'equipment', levelRequired: 34,  xp: 75,   masteryXp: 4, interval: 3000, outputItemId: 'steel_sword',       outputQuantity: 1, ingredients: [{ itemId: 'steel_bar', quantity: 1 }] },
  { id: 'smith_steel_platebody',   name: 'Steel Platebody',   category: 'equipment', levelRequired: 48,  xp: 375,  masteryXp: 5, interval: 3000, outputItemId: 'steel_platebody',   outputQuantity: 1, ingredients: [{ itemId: 'steel_bar', quantity: 5 }] },
  // Mithril
  { id: 'smith_mithril_sword',     name: 'Mithril Sword',     category: 'equipment', levelRequired: 54,  xp: 125,  masteryXp: 5, interval: 3000, outputItemId: 'mithril_sword',     outputQuantity: 1, ingredients: [{ itemId: 'mithril_bar', quantity: 1 }] },
  { id: 'smith_mithril_platebody', name: 'Mithril Platebody', category: 'equipment', levelRequired: 68,  xp: 625,  masteryXp: 6, interval: 3000, outputItemId: 'mithril_platebody', outputQuantity: 1, ingredients: [{ itemId: 'mithril_bar', quantity: 5 }] },
  // Adamantite
  { id: 'smith_adamant_sword',     name: 'Adamant Sword',     category: 'equipment', levelRequired: 74,  xp: 175,  masteryXp: 7, interval: 3000, outputItemId: 'adamant_sword',     outputQuantity: 1, ingredients: [{ itemId: 'adamantite_bar', quantity: 1 }] },
  { id: 'smith_adamant_platebody', name: 'Adamant Platebody', category: 'equipment', levelRequired: 88,  xp: 875,  masteryXp: 8, interval: 3000, outputItemId: 'adamant_platebody', outputQuantity: 1, ingredients: [{ itemId: 'adamantite_bar', quantity: 5 }] },
  // Runite
  { id: 'smith_rune_sword',        name: 'Rune Sword',        category: 'equipment', levelRequired: 89,  xp: 250,  masteryXp: 9, interval: 3000, outputItemId: 'rune_sword',        outputQuantity: 1, ingredients: [{ itemId: 'runite_bar', quantity: 1 }] },
  { id: 'smith_rune_platebody',    name: 'Rune Platebody',    category: 'equipment', levelRequired: 99,  xp: 1250, masteryXp: 10, interval: 3000, outputItemId: 'rune_platebody',   outputQuantity: 1, ingredients: [{ itemId: 'runite_bar', quantity: 5 }] },
];

export const ALL_SMITHING_RECIPES = [...SMELTING_RECIPES, ...SMITHING_RECIPES];
export const SMITHING_MAP = Object.fromEntries(ALL_SMITHING_RECIPES.map(r => [r.id, r]));
