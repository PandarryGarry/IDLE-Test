import type { SkillId, WoodcuttingTree, MiningRock, FishingSpot, CookingRecipe, SmithingRecipe, FiremakingLog } from '../data/types';
import { WOODCUTTING_TREES_MAP } from '../data/woodcutting';
import { MINING_ROCKS_MAP, GEM_DROPS } from '../data/mining';
import { FISHING_SPOTS_MAP } from '../data/fishing';
import { COOKING_RECIPES_MAP } from '../data/cooking';
import { SMITHING_MAP } from '../data/smithing';
import { FIREMAKING_MAP } from '../data/firemaking';
import { usePlayerStore } from '../store/playerStore';
import { useBankStore } from '../store/bankStore';
import { calcBurnChance } from './formulas';
import { chance, randomRange } from '../lib/utils';

export interface ActionResult {
  items: { itemId: string; quantity: number }[];
  xpGained: number;
  masteryXpGained: number;
  bonusXp?: number;
  preserved?: boolean;
}

export interface SkillHandler {
  process: (actionId: string) => ActionResult | null;
  getInterval: (actionId: string) => number;
}

/**
 * Централизованный реестр навыков.
 * Каждый скилл регистрирует свой handler здесь.
 * Это позволяет легко добавлять новые навыки без изменения gameStore.
 */
export const skillRegistry: Record<SkillId, SkillHandler | null> = {
  // Gathering skills
  woodcutting: {
    process: (actionId) => {
      const tree = WOODCUTTING_TREES_MAP[actionId];
      if (!tree) return null;
      const playerLevel = usePlayerStore.getState().getSkillLevel('woodcutting');
      if (playerLevel < tree.levelRequired) return null;
      const qty = randomRange(tree.quantity[0], tree.quantity[1]);
      return { items: [{ itemId: tree.logId, quantity: qty }], xpGained: tree.xp, masteryXpGained: tree.masteryXp ?? 3 };
    },
    getInterval: (actionId) => WOODCUTTING_TREES_MAP[actionId]?.interval ?? 3000,
  },

  mining: {
    process: (actionId) => {
      const rock = MINING_ROCKS_MAP[actionId];
      if (!rock) return null;
      const playerLevel = usePlayerStore.getState().getSkillLevel('mining');
      if (playerLevel < rock.levelRequired) return null;
      const items: { itemId: string; quantity: number }[] = [{ itemId: rock.oreId, quantity: 1 }];
      // Gem chance
      if (rock.gemChance && chance(rock.gemChance)) {
        const totalWeight = GEM_DROPS.reduce((sum, g) => sum + g.weight, 0);
        let rng = Math.random() * totalWeight;
        for (const gem of GEM_DROPS) {
          rng -= gem.weight;
          if (rng <= 0) { items.push({ itemId: gem.itemId, quantity: 1 }); break; }
        }
      }
      return { items, xpGained: rock.xp, masteryXpGained: rock.masteryXp ?? 3 };
    },
    getInterval: (actionId) => MINING_ROCKS_MAP[actionId]?.interval ?? 3000,
  },

  fishing: {
    process: (actionId) => {
      const spot = FISHING_SPOTS_MAP[actionId];
      if (!spot) return null;
      const playerLevel = usePlayerStore.getState().getSkillLevel('fishing');
      if (playerLevel < spot.levelRequired) return null;
      return { items: [{ itemId: spot.fishId, quantity: 1 }], xpGained: spot.xp, masteryXpGained: spot.masteryXp ?? 3 };
    },
    getInterval: (actionId) => FISHING_SPOTS_MAP[actionId]?.interval ?? 7000,
  },

  // Artisan skills
  cooking: {
    process: (actionId) => {
      const recipe = COOKING_RECIPES_MAP[actionId];
      if (!recipe) return null;
      const bankStore = useBankStore.getState();
      if (!bankStore.hasItem(recipe.rawItemId, 1)) return null;
      const playerLevel = usePlayerStore.getState().getSkillLevel('cooking');
      if (playerLevel < recipe.levelRequired) return null;
      bankStore.removeItem(recipe.rawItemId, 1);
      const burnChance = calcBurnChance(playerLevel, recipe.levelRequired, recipe.burnChanceBase ?? 0.3);
      const burnt = chance(burnChance);
      const outputId = burnt ? (recipe.burntItemId ?? 'burnt_fish') : recipe.cookedItemId;
      return { items: [{ itemId: outputId, quantity: 1 }], xpGained: burnt ? 0 : recipe.xp, masteryXpGained: burnt ? 0 : (recipe.masteryXp ?? 3) };
    },
    getInterval: (actionId) => COOKING_RECIPES_MAP[actionId]?.interval ?? 3000,
  },

  smithing: {
    process: (actionId) => {
      const recipe = SMITHING_MAP[actionId];
      if (!recipe) return null;
      const bankStore = useBankStore.getState();
      const playerLevel = usePlayerStore.getState().getSkillLevel('smithing');
      if (playerLevel < recipe.levelRequired) return null;
      // Check ingredients
      for (const ing of recipe.ingredients) {
        if (!bankStore.hasItem(ing.itemId, ing.quantity)) return null;
      }
      // Consume ingredients
      for (const ing of recipe.ingredients) {
        bankStore.removeItem(ing.itemId, ing.quantity);
      }
      return { items: [{ itemId: recipe.outputItemId, quantity: recipe.outputQuantity ?? 1 }], xpGained: recipe.xp, masteryXpGained: recipe.masteryXp ?? 3 };
    },
    getInterval: (actionId) => SMITHING_MAP[actionId]?.interval ?? 3000,
  },

  firemaking: {
    process: (actionId) => {
      const log = FIREMAKING_MAP[actionId];
      if (!log) return null;
      const bankStore = useBankStore.getState();
      const playerLevel = usePlayerStore.getState().getSkillLevel('firemaking');
      if (playerLevel < log.levelRequired) return null;
      if (!bankStore.hasItem(log.logId, 1)) return null;
      bankStore.removeItem(log.logId, 1);
      const items: { itemId: string; quantity: number }[] = [];
      if (log.ashId) items.push({ itemId: log.ashId, quantity: 1 });
      return { items, xpGained: log.xp, masteryXpGained: log.masteryXp ?? 3 };
    },
    getInterval: (actionId) => FIREMAKING_MAP[actionId]?.interval ?? 3000,
  },

  // Combat skills (handled separately in combatStore)
  attack: null,
  strength: null,
  defence: null,
  hitpoints: null,
  ranged: null,
  magic: null,
  prayer: null,
  slayer: null,

  // Other skills (not yet implemented)
  thieving: null,
  fletching: null,
  crafting: null,
  runecrafting: null,
  herblore: null,
  farming: null,
  agility: null,
  summoning: null,
  astrology: null,
  township: null,
};

/**
 * Обрабатывает действие для указанного скилла.
 * Возвращает null если скилл не реализован или действие невалидно.
 */
export function processAction(skillId: SkillId, actionId: string): ActionResult | null {
  const handler = skillRegistry[skillId];
  if (!handler) return null;
  return handler.process(actionId);
}

/**
 * Возвращает интервал действия в миллисекундах.
 */
export function getActionInterval(skillId: SkillId, actionId: string): number {
  const handler = skillRegistry[skillId];
  if (!handler) return 3000;
  return handler.getInterval(actionId);
}
