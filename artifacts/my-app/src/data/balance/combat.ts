/**
 * Числа боя — единственное место, где они живут (закон `data/balance/`).
 * Store и UI только читают эти значения; формулы лежат в `domain/combat`.
 */

/** Шаг combat-тикера: 100 мс = 10 проверок интервалов в секунду. */
export const COMBAT_TICK_INTERVAL_MS = 100;
/** Потолок догоняющих тиков за кадр — страховка после заморозки вкладки. */
export const COMBAT_MAX_TICKS_PER_FRAME = 10;

/** Интервал атаки героя без модификаторов темпа, мс. */
export const HERO_ATTACK_INTERVAL_MS = 2400;
/** Первый удар после входа в бой — с задержкой, чтобы игрок успел прочитать расклад. */
export const HERO_FIRST_ATTACK_DELAY_MS = 1400;

/**
 * Пол здоровья героя: даже герой без вложений в Стойкость не должен умирать
 * от одного удара стартового моба.
 */
export const HERO_MIN_HEALTH = 120;
/** Возврат к точке после смерти: 50% максимума. */
export const DEATH_RESTORE_RATIO = 0.5;
/** Порог авто-еды: доля HP, ниже которой герой тянется за едой. */
export const AUTO_EAT_HP_RATIO = 0.2;

/** XP героя за убийство = combatLevel × этот коэффициент × рейт админки. */
export const HERO_XP_PER_MONSTER_LEVEL = 5;

/** Сколько записей боевого лога держим в памяти и в UI. */
export const COMBAT_LOG_MAX_ENTRIES = 120;

/**
 * Ролл попадания — схема «атака против защиты» (наш предок — OSRS):
 * `Roll = lvl × (bonus + SHIFT)`, шанс = `rollAtk / rollDef × SLOPE + BASE`,
 * кап — чтобы «всегда попадает» не превращался в гарантию против нуля защиты.
 * Старые функции `core/formulas.ts` ещё используют этот блок для совместимости.
 */
export const HIT_ROLL = {
  /** Смещение бонуса: +64 = «нулевой бонус» не обнуляет ролл. */
  bonusShift: 64,
  /** Крутизна кривой шанс/соотношение роллов. */
  slope: 55,
  /** База шанса, %. */
  baseChance: 45,
  /** Потолок шанса, % (и значение при нулевой защите цели). */
  maxChance: 95,
} as const;

/** Максимальный удар от силы: `1.3 + (lvl + 8) × (bonus + 64) / 640`. */
export const MAX_HIT_MELEE = {
  base: 1.3,
  levelShift: 8,
  bonusShift: 64,
  divisor: 640,
} as const;

/** Глобальные ограничения новой тактической модели. */
export const COMBAT_MODEL = {
  minAttackIntervalMs: 900,
  maxAttackIntervalMs: 3600,
  minHitChancePct: 18,
  maxHitChancePct: 96,
  minDamage: 1,
  prdStepRatio: 0.48,
  prdMaxFailures: 8,
  prdMaxEffectivePct: 98,
  armorPenCapPct: 85,
  effectiveArmorHardCapPct: 95,
  critDamageMultiplier: 1.5,
  onslaughtSplashRatio: 0.42,
  baseThreatSeconds: 8,
  enemyFirstAttackDelayRatio: 0.78,
  enemyPackOffsetMs: 320,
  bossThreatMultiplier: 1.45,
  packThreatMultiplier: 1.18,
} as const;

/** Как 12 подхарактеристик превращаются в боевые производные героя. */
export const HERO_COMBAT_DERIVED = {
  baseAccuracyPct: 66,
  accuracyPerFinesse: 0.55,
  accuracyPerLuckPct: 0.08,
  attackIntervalTempoRatio: 0.55,
  minAttackIntervalMs: 1050,
  armorMultiplier: 1,
  armorCapPct: 80,
  willMultiplier: 0.7,
  willCapPct: 75,
  armorPenMultiplier: 0.75,
  evasionMultiplier: 0.9,
  evasionCapPct: 70,
  critChanceLuckMultiplier: 0.8,
  critChanceCapPct: 42,
  onslaughtMultiplier: 0.8,
  onslaughtCapPct: 80,
} as const;

/** Как старые каталожные поля Monster читаются новой моделью. */
export const ENEMY_COMBAT_DERIVED = {
  damageMinRatio: 0.55,
  baseAccuracyPct: 58,
  accuracyPerAttackLevel: 0.35,
  accuracyPerAttackBonus: 0.08,
  armorRatingDefenceBonusRatio: 0.7,
  armorCapPct: 62,
  armorHardCapPct: 85,
  armorCurveK: 120,
  evasionRatingAttackRatio: 0.24,
  evasionRatingDefenceBonusRatio: 0.22,
  evasionCapPct: 34,
  evasionHardCapPct: 70,
  evasionCurveK: 90,
  willStrengthLevelRatio: 0.35,
  willCapPct: 45,
  willHardCapPct: 70,
  willCurveK: 130,
  critChanceBasePct: 3,
  critChanceBossBonusPct: 5,
  armorPenBossPct: 8,
  swiftEvasionBonusPct: 5,
  venomWillPressurePct: 8,
  armoredArmorBonusPct: 7,
} as const;

export const ENEMY_TRAIT_RULES = {
  eliteCombatLevel: 35,
  eliteMaxHp: 140,
  swiftAttackIntervalMs: 2100,
  armoredDefenceLevel: 20,
  armoredDefenceBonus: 15,
  evasiveAttackOverDefence: 8,
} as const;

/** Настройки типов намерений. Все множители применяются в resolveAttack. */
export const COMBAT_INTENTS = {
  strike: { damageMultiplier: 1, accuracyBonusPct: 0, guardPct: 0, threat: 1 },
  heavy: { damageMultiplier: 1.55, accuracyBonusPct: -8, guardPct: 0, threat: 1.55 },
  flurry: { damageMultiplier: 0.72, accuracyBonusPct: 10, guardPct: 0, threat: 1.25 },
  guard: { damageMultiplier: 0.55, accuracyBonusPct: 0, guardPct: 30, threat: 0.7 },
  venom: { damageMultiplier: 0.82, accuracyBonusPct: 4, guardPct: 0, threat: 1.35 },
  enrage: { damageMultiplier: 1.2, accuracyBonusPct: 2, guardPct: 0, threat: 1.7 },
} as const;

/** Ручные приёмы игрока и правила автоплана. */
export const COMBAT_TACTICS = {
  guard: {
    cooldownMs: 5600,
    durationMs: 2200,
    incomingDamageMultiplier: 0.55,
    label: 'Щит',
  },
  maneuver: {
    cooldownMs: 6400,
    durationMs: 2400,
    evasionBonusPct: 24,
    label: 'Манёвр',
  },
  technique: {
    cooldownMs: 7200,
    damageMultiplier: 1.55,
    accuracyBonusPct: 8,
    label: 'Приём',
  },
  pierce: {
    cooldownMs: 8400,
    damageMultiplier: 1.08,
    armorPenBonusPct: 30,
    label: 'Пробой',
  },
} as const;

export const COMBAT_STRATEGIES = {
  careful: {
    label: 'Осторожно',
    playerDamageMultiplier: 0.96,
    incomingDamageMultiplier: 0.9,
    autoEatRatio: 0.35,
    autoGuardHeavy: true,
    autoFinish: false,
    riskBias: -12,
  },
  balanced: {
    label: 'Баланс',
    playerDamageMultiplier: 1,
    incomingDamageMultiplier: 1,
    autoEatRatio: 0.24,
    autoGuardHeavy: true,
    autoFinish: true,
    riskBias: 0,
  },
  greedy: {
    label: 'Жадно',
    playerDamageMultiplier: 1.08,
    incomingDamageMultiplier: 1.12,
    autoEatRatio: 0.18,
    autoGuardHeavy: false,
    autoFinish: true,
    riskBias: 14,
  },
} as const;

export const COMBAT_AUTOPLAN = {
  guardWindowMs: 650,
  lowHpGuardRatio: 0.42,
  finisherHpRatio: 0.22,
  armorPierceThresholdPct: 25,
  minPlayerHpForTechniqueRatio: 0.28,
} as const;

/** Босс-фазы: по HP открывают более злые телеграфы, но остаются читаемыми. */
export const COMBAT_BOSS_PHASES = {
  phase2HpRatio: 0.66,
  phase3HpRatio: 0.33,
  phase2DamageMultiplier: 1.12,
  phase3DamageMultiplier: 1.24,
  phase2AccuracyBonusPct: 2,
  phase3AccuracyBonusPct: 5,
} as const;

export const COMBAT_ENCOUNTERS = {
  maxEnemies: 3,
  minPackEnemies: 2,
  bossPackSize: 1,
  preferredPackByArea: {
    farmlands: 1,
    forest: 2,
    spider_den: 3,
    undead_graveyard: 2,
    lava_lake: 2,
    dragons_lair: 1,
  },
} as const;

/** Подготовительный прогноз: подписи и пороги риска для вылазки. */
export const COMBAT_RISK = {
  safeScoreMax: 34,
  tenseScoreMax: 68,
  dangerScoreMax: 100,
  scoreHardCap: 140,
  enemyDpsSeconds: 60,
  packPenaltyPerExtraEnemy: 12,
  bossPenalty: 18,
  levelDeltaPenalty: 4,
  foodSafetyBonus: 10,
  safeIdleInfinityMinutes: 999,
} as const;
