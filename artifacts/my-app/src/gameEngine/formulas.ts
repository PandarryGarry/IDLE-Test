// Game formulas matching Melvor Idle mechanics

import type { Monster, CombatStats } from '../data/types';

// ── Combat formulas ──────────────────────────────────────────

export function calcMaxHitMelee(strengthLevel: number, strengthBonus: number): number {
  return Math.floor(1.3 + (strengthLevel + 8) * (strengthBonus + 64) / 640);
}

export function calcMaxHitRanged(rangedLevel: number, rangedStrengthBonus: number): number {
  return Math.floor(1.3 + (rangedLevel + 8) * (rangedStrengthBonus + 64) / 640);
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

export function calcMagicMaxHit(spellMaxHit: number, magicLevel: number, magicDamageBonus: number): number {
  return Math.floor(spellMaxHit * (1 + magicLevel / 100 + magicDamageBonus / 100));
}

export function calcCombatLevel(
  attack: number, strength: number, defence: number,
  hitpoints: number, ranged: number, magic: number, prayer: number
): number {
  const melee = (attack + strength) * 0.325;
  const range = ranged * 0.4875;
  const mage = magic * 0.4875;
  const base = Math.floor((defence + hitpoints + Math.floor(prayer / 2)) * 0.25);
  return Math.floor(base + Math.max(melee, range, mage));
}

export function calcAutoEatThreshold(maxHp: number): number {
  return Math.floor(maxHp * 0.2);
}

// ── XP formulas ──────────────────────────────────────────────

export function calcMasteryXpBonus(masteryLevel: number): number {
  if (masteryLevel >= 99) return 0.5;
  if (masteryLevel >= 75) return 0.3;
  if (masteryLevel >= 50) return 0.2;
  if (masteryLevel >= 25) return 0.1;
  return 0;
}

export function calcPreservationChance(masteryLevel: number): number {
  // Chance to preserve resources (not consume)
  if (masteryLevel >= 99) return 0.5;
  return masteryLevel / 200; // up to 49.5% at 99
}

export function calcDoublingChance(masteryLevel: number): number {
  // Chance to double outputs
  return Math.min(masteryLevel / 200, 0.5);
}

// ── Skill formulas ────────────────────────────────────────────

export function calcXpPerHour(xpPerAction: number, intervalMs: number): number {
  return Math.floor((xpPerAction / intervalMs) * 3_600_000);
}

export function calcActionsPerHour(intervalMs: number): number {
  return Math.floor(3_600_000 / intervalMs);
}

export function calcTimeToLevel(currentXp: number, targetXp: number, xpPerAction: number, intervalMs: number): number {
  const xpNeeded = targetXp - currentXp;
  if (xpNeeded <= 0) return 0;
  const actionsNeeded = xpNeeded / xpPerAction;
  return actionsNeeded * intervalMs; // ms
}

export function formatTime(ms: number): string {
  if (ms <= 0) return '0s';
  const totalSeconds = Math.ceil(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

// ── Drop simulation ───────────────────────────────────────────

export function rollDrops(monster: Monster, rng: () => number = Math.random): { itemId: string; quantity: number }[] {
  const drops: { itemId: string; quantity: number }[] = [];
  for (const drop of monster.drops) {
    if (rng() < drop.chance) {
      const qty = Math.floor(rng() * (drop.quantity[1] - drop.quantity[0] + 1)) + drop.quantity[0];
      drops.push({ itemId: drop.itemId, quantity: qty });
    }
  }
  return drops;
}

export function rollGp(gpDrop: [number, number], rng: () => number = Math.random): number {
  return Math.floor(rng() * (gpDrop[1] - gpDrop[0] + 1)) + gpDrop[0];
}

// ── Smithing ──────────────────────────────────────────────────

export function calcSmithingItems(barCount: number): number {
  return barCount; // 1 bar = 1 item for simplicity (varies per item type)
}

// ── Cooking ──────────────────────────────────────────────────

export function calcBurnChance(cookingLevel: number, recipeLevel: number, burnChanceBase: number): number {
  const levelDiff = cookingLevel - recipeLevel;
  return Math.max(0, burnChanceBase - levelDiff * 0.01);
}

// ── Fishing junk chance ───────────────────────────────────────

export function calcJunkChance(fishingLevel: number, fishLevel: number): number {
  const diff = fishingLevel - fishLevel;
  return Math.max(0, 0.3 - diff * 0.005);
}
