import type { Monster } from '../../data/types.ts';
import type { BranchRanks, PillarId } from '../attributes/attributes.ts';
import { substatDisplay } from '../attributes/characterAttributes.ts';
import { strikeRange } from '../../data/balance/strikeRange.ts';
import {
  AUTO_EAT_HP_RATIO,
  COMBAT_BOSS_PHASES,
  COMBAT_ENCOUNTERS,
  COMBAT_INTENTS,
  COMBAT_MODEL,
  COMBAT_RISK,
  COMBAT_STRATEGIES,
  ENEMY_COMBAT_DERIVED,
  ENEMY_TRAIT_RULES,
  HERO_ATTACK_INTERVAL_MS,
  HERO_COMBAT_DERIVED,
  HERO_MIN_HEALTH,
} from '../../data/balance/combat.ts';

export type CombatStrategyId = keyof typeof COMBAT_STRATEGIES;
export type CombatIntentKind = keyof typeof COMBAT_INTENTS;
export type CombatTacticId = 'guard' | 'maneuver' | 'technique' | 'pierce';
export type TargetPriority = 'auto' | 'weakest' | 'dangerous' | 'armored' | 'nearest';
export type CombatTraitId = 'swift' | 'armored' | 'evasive' | 'venom' | 'pack' | 'boss' | 'elite';

export interface FighterCombatStats {
  maxHp: number;
  damageMin: number;
  damageMax: number;
  attackIntervalMs: number;
  accuracyPct: number;
  armorPct: number;
  willPct: number;
  armorPenPct: number;
  evasionPct: number;
  critChancePct: number;
  critDamageMultiplier: number;
  onslaughtPct: number;
  threatScore: number;
}

export interface CombatIntent {
  kind: CombatIntentKind;
  label: string;
  icon: string;
  hint: string;
  threat: number;
}

export interface AttackPrdState {
  hitFailures: number;
  critFailures: number;
  onslaughtFailures: number;
}

export interface AttackModifiers {
  damageMultiplier?: number;
  accuracyBonusPct?: number;
  armorPenBonusPct?: number;
  defenderEvasionBonusPct?: number;
  defenderArmorBonusPct?: number;
  incomingDamageMultiplier?: number;
  allowCrit?: boolean;
}

export interface AttackResolution {
  outcome: 'hit' | 'miss';
  damage: number;
  rawDamage: number;
  hitChancePct: number;
  critChancePct: number;
  crit: boolean;
  mitigatedPct: number;
  nextPrd: AttackPrdState;
}

export interface TargetSnapshot {
  instanceId: string;
  hp: number;
  maxHp: number;
  stats: FighterCombatStats;
  attackTimer: number;
  traits: CombatTraitId[];
  intent: CombatIntent;
  alive: boolean;
  spawnOrder: number;
}

export interface RiskForecast {
  score: number;
  label: 'safe' | 'tense' | 'danger';
  title: string;
  safeIdleMinutes: number;
  incomingPerMinute: number;
  reasons: string[];
}

export const EMPTY_PRD_STATE: AttackPrdState = {
  hitFailures: 0,
  critFailures: 0,
  onslaughtFailures: 0,
};

const INTENT_META: Record<CombatIntentKind, Omit<CombatIntent, 'kind' | 'threat'>> = {
  strike: {
    label: 'Удар',
    icon: '⚔️',
    hint: 'Обычная атака. Манёвр и броня работают штатно.',
  },
  heavy: {
    label: 'Тяжёлый удар',
    icon: '💥',
    hint: 'Мощный телеграф: лучше прожать «Щит» до окончания таймера.',
  },
  flurry: {
    label: 'Серия',
    icon: '🌪️',
    hint: 'Точный, но слабый шквал. Манёвр снижает риск лучше брони.',
  },
  guard: {
    label: 'Стойка',
    icon: '🛡️',
    hint: 'Враг укрепляется и хуже получает урон до следующего окна.',
  },
  venom: {
    label: 'Ядовитый укус',
    icon: '☠️',
    hint: 'Давит Волю. В опасной зоне держите авто-еду и Щит.',
  },
  enrage: {
    label: 'Ярость',
    icon: '🔥',
    hint: 'Босс ускоряет темп и готовит окно высокого риска.',
  },
};

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function safeNumber(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

function ratingToPct(raw: number, cap: number, k: number): number {
  const x = Math.max(0, safeNumber(raw));
  return x <= 0 ? 0 : (cap * x) / (x + k);
}

function displayPct(id: Parameters<typeof substatDisplay>[0], raw: number): number {
  return substatDisplay(id, raw).value;
}

function randomIntInclusive(rng: () => number, min: number, max: number): number {
  const lo = Math.ceil(Math.min(min, max));
  const hi = Math.floor(Math.max(min, max));
  return lo + Math.floor(clamp(rng(), 0, 0.999999) * (hi - lo + 1));
}

export function prdEffectiveChance(baseChancePct: number, failures: number): number {
  const base = clamp(baseChancePct, 0, 100);
  if (base <= 0 || base >= 100) return base;
  const f = clamp(Math.floor(failures), 0, COMBAT_MODEL.prdMaxFailures);
  return clamp(
    base * (1 + f * COMBAT_MODEL.prdStepRatio),
    0,
    COMBAT_MODEL.prdMaxEffectivePct,
  );
}

export function rollPrd(
  baseChancePct: number,
  failures: number,
  rng: () => number,
): { success: boolean; chancePct: number; failures: number } {
  const chancePct = prdEffectiveChance(baseChancePct, failures);
  if (chancePct <= 0) return { success: false, chancePct, failures };
  if (chancePct >= 100) return { success: true, chancePct, failures: 0 };
  const success = rng() * 100 < chancePct;
  return {
    success,
    chancePct,
    failures: success ? 0 : Math.min(failures + 1, COMBAT_MODEL.prdMaxFailures),
  };
}

export function deriveHeroCombatStats(input: {
  substats: BranchRanks;
  finalPillars: Partial<Record<PillarId, number>>;
  strategy?: CombatStrategyId;
}): FighterCombatStats {
  const strategy = COMBAT_STRATEGIES[input.strategy ?? 'balanced'];
  const range = strikeRange(Math.max(0, input.substats.strike));
  const tempoPct = displayPct('tempo', input.substats.tempo);
  const luckPct = displayPct('luck', input.substats.luck);
  const finesse = input.finalPillars.finesse ?? 0;
  const interval = clamp(
    HERO_ATTACK_INTERVAL_MS / (1 + (tempoPct / 100) * HERO_COMBAT_DERIVED.attackIntervalTempoRatio),
    HERO_COMBAT_DERIVED.minAttackIntervalMs,
    COMBAT_MODEL.maxAttackIntervalMs,
  );

  const damageMin = Math.max(
    COMBAT_MODEL.minDamage,
    Math.floor(range.min * strategy.playerDamageMultiplier),
  );
  const damageMax = Math.max(
    damageMin,
    Math.ceil(range.max * strategy.playerDamageMultiplier),
  );
  const maxHp = Math.max(HERO_MIN_HEALTH, Math.round(input.substats.health));
  const armorPct = clamp(
    displayPct('armor', input.substats.armor) * HERO_COMBAT_DERIVED.armorMultiplier,
    0,
    HERO_COMBAT_DERIVED.armorCapPct,
  );
  const willPct = clamp(
    displayPct('will', input.substats.will) * HERO_COMBAT_DERIVED.willMultiplier,
    0,
    HERO_COMBAT_DERIVED.willCapPct,
  );
  const armorPenPct = clamp(
    displayPct('destruction', input.substats.destruction) * HERO_COMBAT_DERIVED.armorPenMultiplier,
    0,
    COMBAT_MODEL.armorPenCapPct,
  );
  const evasionPct = clamp(
    displayPct('evasion', input.substats.evasion) * HERO_COMBAT_DERIVED.evasionMultiplier,
    0,
    HERO_COMBAT_DERIVED.evasionCapPct,
  );
  const critChancePct = clamp(
    luckPct * HERO_COMBAT_DERIVED.critChanceLuckMultiplier,
    0,
    HERO_COMBAT_DERIVED.critChanceCapPct,
  );
  const accuracyPct = clamp(
    HERO_COMBAT_DERIVED.baseAccuracyPct
      + finesse * HERO_COMBAT_DERIVED.accuracyPerFinesse
      + luckPct * HERO_COMBAT_DERIVED.accuracyPerLuckPct,
    COMBAT_MODEL.minHitChancePct,
    COMBAT_MODEL.maxHitChancePct,
  );
  const onslaughtPct = clamp(
    displayPct('onslaught', input.substats.onslaught) * HERO_COMBAT_DERIVED.onslaughtMultiplier,
    0,
    HERO_COMBAT_DERIVED.onslaughtCapPct,
  );

  const averageDamage = (damageMin + damageMax) / 2;
  return {
    maxHp,
    damageMin,
    damageMax,
    attackIntervalMs: Math.round(interval),
    accuracyPct,
    armorPct,
    willPct,
    armorPenPct,
    evasionPct,
    critChancePct,
    critDamageMultiplier: COMBAT_MODEL.critDamageMultiplier,
    onslaughtPct,
    threatScore: averageDamage * (1000 / interval) * (accuracyPct / 100),
  };
}

export function inferMonsterTraits(monster: Monster): CombatTraitId[] {
  const traits = new Set<CombatTraitId>();
  if (monster.isBoss) traits.add('boss');
  if (monster.combatLevel >= ENEMY_TRAIT_RULES.eliteCombatLevel || monster.maxHp >= ENEMY_TRAIT_RULES.eliteMaxHp) traits.add('elite');
  if (monster.attackInterval <= ENEMY_TRAIT_RULES.swiftAttackIntervalMs || monster.id.includes('wolf')) traits.add('swift');
  if (
    monster.defenceLevel >= ENEMY_TRAIT_RULES.armoredDefenceLevel
    || monster.defenceBonus >= ENEMY_TRAIT_RULES.armoredDefenceBonus
    || monster.id.includes('skeleton')
  ) traits.add('armored');
  if (
    monster.attackLevel >= monster.defenceLevel + ENEMY_TRAIT_RULES.evasiveAttackOverDefence
    || monster.id.includes('spider')
  ) traits.add('evasive');
  if (monster.id.includes('spider') || monster.id.includes('poison')) traits.add('venom');
  if (monster.id.includes('wolf') || monster.id.includes('goblin') || monster.areaId === 'spider_den') traits.add('pack');
  return [...traits];
}

export function deriveEnemyCombatStats(monster: Monster): FighterCombatStats {
  const traits = inferMonsterTraits(monster);
  const armorRating = monster.defenceLevel + monster.defenceBonus * ENEMY_COMBAT_DERIVED.armorRatingDefenceBonusRatio;
  const evasionRating =
    monster.attackLevel * ENEMY_COMBAT_DERIVED.evasionRatingAttackRatio
    + monster.defenceBonus * ENEMY_COMBAT_DERIVED.evasionRatingDefenceBonusRatio;
  const willRating = monster.defenceLevel + monster.strengthLevel * ENEMY_COMBAT_DERIVED.willStrengthLevelRatio;
  const baseArmorPct = ratingToPct(
    armorRating,
    ENEMY_COMBAT_DERIVED.armorCapPct,
    ENEMY_COMBAT_DERIVED.armorCurveK,
  );
  const baseEvasionPct = ratingToPct(
    evasionRating,
    ENEMY_COMBAT_DERIVED.evasionCapPct,
    ENEMY_COMBAT_DERIVED.evasionCurveK,
  );
  const accuracyPct = clamp(
    ENEMY_COMBAT_DERIVED.baseAccuracyPct
      + monster.attackLevel * ENEMY_COMBAT_DERIVED.accuracyPerAttackLevel
      + monster.attackBonus * ENEMY_COMBAT_DERIVED.accuracyPerAttackBonus,
    COMBAT_MODEL.minHitChancePct,
    COMBAT_MODEL.maxHitChancePct,
  );
  const damageMax = Math.max(COMBAT_MODEL.minDamage, Math.round(monster.maxHit));
  const damageMin = Math.max(
    COMBAT_MODEL.minDamage,
    Math.floor(damageMax * ENEMY_COMBAT_DERIVED.damageMinRatio),
  );
  const interval = clamp(
    monster.attackInterval,
    COMBAT_MODEL.minAttackIntervalMs,
    COMBAT_MODEL.maxAttackIntervalMs,
  );
  const averageDamage = (damageMin + damageMax) / 2;
  const bossMultiplier = traits.includes('boss') ? COMBAT_MODEL.bossThreatMultiplier : 1;
  const packMultiplier = traits.includes('pack') ? COMBAT_MODEL.packThreatMultiplier : 1;

  return {
    maxHp: Math.max(1, Math.round(monster.maxHp)),
    damageMin,
    damageMax,
    attackIntervalMs: Math.round(interval),
    accuracyPct,
    armorPct: clamp(
      baseArmorPct + (traits.includes('armored') ? ENEMY_COMBAT_DERIVED.armoredArmorBonusPct : 0),
      0,
      ENEMY_COMBAT_DERIVED.armorHardCapPct,
    ),
    willPct: clamp(
      ratingToPct(willRating, ENEMY_COMBAT_DERIVED.willCapPct, ENEMY_COMBAT_DERIVED.willCurveK)
        + (traits.includes('venom') ? ENEMY_COMBAT_DERIVED.venomWillPressurePct : 0),
      0,
      ENEMY_COMBAT_DERIVED.willHardCapPct,
    ),
    armorPenPct: traits.includes('boss') ? ENEMY_COMBAT_DERIVED.armorPenBossPct : 0,
    evasionPct: clamp(
      baseEvasionPct + (traits.includes('swift') || traits.includes('evasive') ? ENEMY_COMBAT_DERIVED.swiftEvasionBonusPct : 0),
      0,
      ENEMY_COMBAT_DERIVED.evasionHardCapPct,
    ),
    critChancePct: ENEMY_COMBAT_DERIVED.critChanceBasePct
      + (traits.includes('boss') ? ENEMY_COMBAT_DERIVED.critChanceBossBonusPct : 0),
    critDamageMultiplier: COMBAT_MODEL.critDamageMultiplier,
    onslaughtPct: 0,
    threatScore: averageDamage * (1000 / interval) * (accuracyPct / 100) * bossMultiplier * packMultiplier,
  };
}

export function makeIntent(kind: CombatIntentKind): CombatIntent {
  const meta = INTENT_META[kind];
  return {
    kind,
    ...meta,
    threat: COMBAT_INTENTS[kind].threat,
  };
}

export function bossPhaseForHp(hp: number, maxHp: number): number {
  if (maxHp <= 0) return 1;
  const ratio = clamp(hp / maxHp, 0, 1);
  if (ratio <= COMBAT_BOSS_PHASES.phase3HpRatio) return 3;
  if (ratio <= COMBAT_BOSS_PHASES.phase2HpRatio) return 2;
  return 1;
}

export function bossPhaseAttackModifiers(phase: number): AttackModifiers {
  if (phase >= 3) {
    return {
      damageMultiplier: COMBAT_BOSS_PHASES.phase3DamageMultiplier,
      accuracyBonusPct: COMBAT_BOSS_PHASES.phase3AccuracyBonusPct,
    };
  }
  if (phase >= 2) {
    return {
      damageMultiplier: COMBAT_BOSS_PHASES.phase2DamageMultiplier,
      accuracyBonusPct: COMBAT_BOSS_PHASES.phase2AccuracyBonusPct,
    };
  }
  return {};
}

export function nextIntentForMonster(monster: Monster, index: number): CombatIntent {
  const traits = inferMonsterTraits(monster);
  let cycle: CombatIntentKind[] = ['strike', 'heavy', 'strike'];
  if (traits.includes('boss')) cycle = ['heavy', 'strike', 'guard', 'enrage'];
  else if (traits.includes('venom')) cycle = ['venom', 'strike', 'flurry'];
  else if (traits.includes('swift')) cycle = ['flurry', 'strike', 'heavy'];
  else if (traits.includes('armored')) cycle = ['guard', 'strike', 'heavy'];
  return makeIntent(cycle[Math.abs(index) % cycle.length]);
}

export function intentAttackModifiers(intent: CombatIntent): AttackModifiers {
  const numbers = COMBAT_INTENTS[intent.kind];
  return {
    damageMultiplier: numbers.damageMultiplier,
    accuracyBonusPct: numbers.accuracyBonusPct,
    defenderArmorBonusPct: 0,
    allowCrit: true,
  };
}

export function intentGuardBonusPct(intent: CombatIntent): number {
  return COMBAT_INTENTS[intent.kind].guardPct;
}

export function resolveAttack(input: {
  attacker: FighterCombatStats;
  defender: FighterCombatStats;
  prd: AttackPrdState;
  rng: () => number;
  modifiers?: AttackModifiers;
}): AttackResolution {
  const modifiers = input.modifiers ?? {};
  const hitChancePct = clamp(
    input.attacker.accuracyPct
      + (modifiers.accuracyBonusPct ?? 0)
      - input.defender.evasionPct
      - (modifiers.defenderEvasionBonusPct ?? 0),
    COMBAT_MODEL.minHitChancePct,
    COMBAT_MODEL.maxHitChancePct,
  );
  const hitRoll = rollPrd(hitChancePct, input.prd.hitFailures, input.rng);
  let nextPrd: AttackPrdState = {
    ...input.prd,
    hitFailures: hitRoll.failures,
  };

  if (!hitRoll.success) {
    return {
      outcome: 'miss',
      damage: 0,
      rawDamage: 0,
      hitChancePct: hitRoll.chancePct,
      critChancePct: 0,
      crit: false,
      mitigatedPct: 0,
      nextPrd,
    };
  }

  const critChanceBase = modifiers.allowCrit === false ? 0 : input.attacker.critChancePct;
  const critRoll = rollPrd(critChanceBase, input.prd.critFailures, input.rng);
  nextPrd = {
    ...nextPrd,
    critFailures: critRoll.failures,
  };

  const rolled = randomIntInclusive(input.rng, input.attacker.damageMin, input.attacker.damageMax);
  const critMultiplier = critRoll.success ? input.attacker.critDamageMultiplier : 1;
  const rawDamage = rolled * (modifiers.damageMultiplier ?? 1) * critMultiplier;
  const penPct = clamp(
    input.attacker.armorPenPct + (modifiers.armorPenBonusPct ?? 0),
    0,
    COMBAT_MODEL.armorPenCapPct,
  );
  const armorBeforePen = Math.max(0, input.defender.armorPct + (modifiers.defenderArmorBonusPct ?? 0));
  const effectiveArmorPct = clamp(
    armorBeforePen * (1 - penPct / 100),
    0,
    COMBAT_MODEL.effectiveArmorHardCapPct,
  );
  const incomingDamageMultiplier = modifiers.incomingDamageMultiplier ?? 1;
  const damage = Math.max(
    COMBAT_MODEL.minDamage,
    Math.floor(rawDamage * (1 - effectiveArmorPct / 100) * incomingDamageMultiplier),
  );

  return {
    outcome: 'hit',
    damage,
    rawDamage,
    hitChancePct: hitRoll.chancePct,
    critChancePct: critRoll.chancePct,
    crit: critRoll.success,
    mitigatedPct: effectiveArmorPct,
    nextPrd,
  };
}

export function chooseTarget<T extends TargetSnapshot>(
  enemies: readonly T[],
  priority: TargetPriority,
): T | null {
  const alive = enemies.filter(e => e.alive && e.hp > 0);
  if (alive.length === 0) return null;

  const byDanger = (a: T, b: T) => {
    const aSoon = a.attackTimer / Math.max(1, a.stats.attackIntervalMs);
    const bSoon = b.attackTimer / Math.max(1, b.stats.attackIntervalMs);
    return (b.stats.threatScore * b.intent.threat + (1 - bSoon))
      - (a.stats.threatScore * a.intent.threat + (1 - aSoon));
  };

  const sorted = [...alive];
  if (priority === 'weakest') sorted.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
  else if (priority === 'dangerous') sorted.sort(byDanger);
  else if (priority === 'armored') sorted.sort((a, b) => b.stats.armorPct - a.stats.armorPct || byDanger(a, b));
  else if (priority === 'nearest') sorted.sort((a, b) => a.spawnOrder - b.spawnOrder);
  else sorted.sort(byDanger);

  return sorted[0];
}

export function encounterPackSize(areaId: string, monsterIds: readonly string[], selectedMonster?: Monster): number {
  if (selectedMonster?.isBoss) return COMBAT_ENCOUNTERS.bossPackSize;
  const preferred = COMBAT_ENCOUNTERS.preferredPackByArea[
    areaId as keyof typeof COMBAT_ENCOUNTERS.preferredPackByArea
  ] ?? 1;
  const capByRoster = Math.max(1, monsterIds.length);
  return clamp(Math.min(preferred, capByRoster), 1, COMBAT_ENCOUNTERS.maxEnemies);
}

export function estimateRisk(input: {
  hero: FighterCombatStats;
  enemies: readonly Monster[];
  areaId: string;
  heroLevel: number;
  requiredLevel?: number;
  strategy?: CombatStrategyId;
  foodStacks?: number;
}): RiskForecast {
  const strategy = COMBAT_STRATEGIES[input.strategy ?? 'balanced'];
  const packSize = encounterPackSize(input.areaId, input.enemies.map(e => e.id), input.enemies.find(e => e.isBoss));
  const stats = input.enemies.map(deriveEnemyCombatStats).sort((a, b) => b.threatScore - a.threatScore);
  const active = stats.slice(0, Math.max(1, packSize));
  const heroMitigation = 1 - clamp(input.hero.armorPct, 0, HERO_COMBAT_DERIVED.armorCapPct) / 100;
  const heroAvoidance = 1 - clamp(input.hero.evasionPct, 0, HERO_COMBAT_DERIVED.evasionCapPct) / 100;
  const incomingPerSecond = active.reduce((sum, s) => {
    const avg = (s.damageMin + s.damageMax) / 2;
    return sum + avg * (s.accuracyPct / 100) * heroMitigation * heroAvoidance * (1000 / s.attackIntervalMs);
  }, 0) * strategy.incomingDamageMultiplier;
  const incomingPerMinute = incomingPerSecond * COMBAT_RISK.enemyDpsSeconds;
  const strongest = input.enemies.reduce<Monster | null>((best, m) => {
    if (!best) return m;
    return deriveEnemyCombatStats(m).threatScore > deriveEnemyCombatStats(best).threatScore ? m : best;
  }, null);
  const levelDelta = Math.max(0, (input.requiredLevel ?? strongest?.combatLevel ?? 1) - input.heroLevel);
  const packPenalty = Math.max(0, packSize - 1) * COMBAT_RISK.packPenaltyPerExtraEnemy;
  const bossPenalty = input.enemies.some(e => e.isBoss) ? COMBAT_RISK.bossPenalty : 0;
  const foodBonus = (input.foodStacks ?? 0) > 0 ? COMBAT_RISK.foodSafetyBonus : 0;
  const rawScore =
    (incomingPerMinute / Math.max(1, input.hero.maxHp)) * 100
    + packPenalty
    + bossPenalty
    + levelDelta * COMBAT_RISK.levelDeltaPenalty
    + strategy.riskBias
    - foodBonus;
  const score = Math.round(clamp(rawScore, 0, COMBAT_RISK.scoreHardCap));
  const label: RiskForecast['label'] = score <= COMBAT_RISK.safeScoreMax
    ? 'safe'
    : score <= COMBAT_RISK.tenseScoreMax
      ? 'tense'
      : 'danger';
  const safeIdleMinutes = incomingPerSecond <= 0
    ? COMBAT_RISK.safeIdleInfinityMinutes
    : Math.max(0, Math.floor((input.hero.maxHp * (1 - AUTO_EAT_HP_RATIO)) / incomingPerSecond / 60));
  const reasons: string[] = [];

  if (packSize >= 3) reasons.push('Стая давит несколькими таймерами: задайте приоритет цели до старта.');
  else if (packSize === 2) reasons.push('Два врага в линии: Натиск и добивания ускоряют зачистку.');
  if (input.enemies.some(e => e.isBoss)) reasons.push('Босс показывает телеграфы: держите «Щит» под тяжёлые окна.');
  if (strongest && strongest.maxHit >= input.hero.maxHp * AUTO_EAT_HP_RATIO) {
    reasons.push('Сильный удар близок к порогу авто-еды: еду лучше взять заранее.');
  }
  if (label === 'safe') reasons.push('Прогноз допускает спокойный idle при включённой авто-еде.');
  if (label === 'danger') reasons.push('Автоплану понадобится ручное вмешательство: Манёвр и Щит решают исход.');

  return {
    score,
    label,
    title: label === 'safe' ? 'Безопасно' : label === 'tense' ? 'На грани' : 'Опасно',
    safeIdleMinutes: clamp(safeIdleMinutes, 0, COMBAT_RISK.safeIdleInfinityMinutes),
    incomingPerMinute: Math.round(incomingPerMinute),
    reasons,
  };
}
