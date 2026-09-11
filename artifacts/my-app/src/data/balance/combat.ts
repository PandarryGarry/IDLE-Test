/**
 * Числа боя — единственное место, где они живут (закон `data/balance/`).
 *
 * До этого шага половина коэффициентов сидела в `store/combatStore.ts` и
 * `core/formulas.ts` прямо в коде, и баланс правился правкой стора.
 * Значения НЕ изменены — это переезд, а не nerf.
 */

/** Шаг combat-тикера: 100 мс = 10 проверок интервалов в секунду. */
export const COMBAT_TICK_INTERVAL_MS = 100;
/** Потолок догоняющих тиков за кадр — страховка после заморозки вкладки. */
export const COMBAT_MAX_TICKS_PER_FRAME = 10;

/** Интервал атаки героя, мс. Оружие скорость пока не меняет (см. UI_UX_AUDIT шаг 9). */
export const HERO_ATTACK_INTERVAL_MS = 2400;
/** Первый удар после входа в бой — с задержкой, чтобы моб не бил «в ноль». */
export const HERO_FIRST_ATTACK_DELAY_MS = 2400;

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
export const COMBAT_LOG_MAX_ENTRIES = 100;

/**
 * Ролл попадания — схема «атака против защиты» (наш предок — OSRS):
 * `Roll = lvl × (bonus + SHIFT)`, шанс = `rollAtk / rollDef × SLOPE + BASE`,
 * кап — чтобы «всегда попадает» не превращался в гарантию против нуля защиты.
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
