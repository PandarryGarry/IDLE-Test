// Game formulas for Aethelia Idle RPG mechanics

import type { Monster } from '../data/types.ts';
import { HIT_ROLL, MAX_HIT_MELEE, AUTO_EAT_HP_RATIO } from '../data/balance/combat.ts';

// ── Combat formulas ──────────────────────────────────────────

export function calcMaxHitMelee(strengthLevel: number, strengthBonus: number): number {
  const { base, levelShift, bonusShift, divisor } = MAX_HIT_MELEE;
  return Math.floor(base + (strengthLevel + levelShift) * (strengthBonus + bonusShift) / divisor);
}

export function calcAttackRating(attackLevel: number, attackBonus: number): number {
  return attackLevel * (attackBonus + HIT_ROLL.bonusShift);
}

export function calcDefenceRating(defenceLevel: number, defenceBonus: number): number {
  return defenceLevel * (defenceBonus + HIT_ROLL.bonusShift);
}

export function calcHitChance(attackRating: number, defenceRating: number): number {
  if (defenceRating <= 0) return HIT_ROLL.maxChance;
  const chance = (attackRating / defenceRating) * HIT_ROLL.slope + HIT_ROLL.baseChance;
  return Math.min(Math.max(chance, 0), HIT_ROLL.maxChance);
}

export function calcAutoEatThreshold(maxHp: number): number {
  return Math.floor(maxHp * AUTO_EAT_HP_RATIO);
}

// ── Drop simulation ───────────────────────────────────────────

export function rollDrops(
  monster: Monster,
  rng: () => number = Math.random,
  chanceMultiplier = 1,
): { itemId: string; quantity: number }[] {
  const drops: { itemId: string; quantity: number }[] = [];
  for (const drop of monster.drops) {
    const chance = Math.min(1, drop.chance * Math.max(0, chanceMultiplier));
    if (rng() < chance) {
      const qty = Math.floor(rng() * (drop.quantity[1] - drop.quantity[0] + 1)) + drop.quantity[0];
      drops.push({ itemId: drop.itemId, quantity: qty });
    }
  }
  return drops;
}

export function rollGp(
  gpDrop: [number, number],
  rng: () => number = Math.random,
  multiplier = 1,
): number {
  const base = Math.floor(rng() * (gpDrop[1] - gpDrop[0] + 1)) + gpDrop[0];
  return Math.max(0, Math.round(base * Math.max(0, multiplier)));
}
