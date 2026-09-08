// Game formulas for Aethelia Idle RPG mechanics

import type { Monster } from '../data/types.ts';

// ── Combat formulas ──────────────────────────────────────────

export function calcMaxHitMelee(strengthLevel: number, strengthBonus: number): number {
  return Math.floor(1.3 + (strengthLevel + 8) * (strengthBonus + 64) / 640);
}

export function calcAttackRating(attackLevel: number, attackBonus: number): number {
  return attackLevel * (attackBonus + 64);
}

export function calcDefenceRating(defenceLevel: number, defenceBonus: number): number {
  return defenceLevel * (defenceBonus + 64);
}

export function calcHitChance(attackRating: number, defenceRating: number): number {
  if (defenceRating <= 0) return 95;
  const chance = (attackRating / defenceRating) * 55 + 45;
  return Math.min(Math.max(chance, 0), 95);
}

export function calcAutoEatThreshold(maxHp: number): number {
  return Math.floor(maxHp * 0.2);
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
