/**
 * Стартовые характеристики рас. Канон: BALANCE_FOUNDATION.md.
 *
 * Старая схема (+2/−1 в процентах от базы тела) сломана:
 * штраф уводил подхарактеристики в минус — у эльфа было −90 HP на старте.
 * Проценты также давали разный бюджет разным расам (от 10 до 15).
 *
 * Новая схема:
 *   1. Стартовые очки столпов, а не проценты. Никаких минусов.
 *   2. Бюджет у всех рас РАВНЫЙ — сумма ровно RACE_START_TOTAL.
 *   3. Ни один столп не ноль: слабая сторона тоже играбельна.
 *   4. Разница между сильным и слабым столпом заметна, но не решает за игрока.
 *   5. Бюджет маленький: новый герой — непрокаченный, рост впереди.
 *
 * Раса задаёт наклон, а не путь: игрок сам выбирает, усиливать сильное
 * или закрывать слабое своими 99 очками.
 */
import type { AttributeRaceId, PillarId } from '../../domain/attributes/attributes.ts';

/** Ступени распределения. Сумма = RACE_START_TOTAL. */
export const RACE_TIER = {
  /** Сильная сторона расы. */
  strong: 4,
  /** Вторая по силе. */
  good: 3,
  /** Обычная. */
  plain: 2,
  /** Слабая — не ноль и не минус. */
  weak: 1,
} as const;

/** Единый стартовый бюджет: 4 + 3 + 2 + 1. Одинаков для всех рас. */
export const RACE_START_TOTAL =
  RACE_TIER.strong + RACE_TIER.good + RACE_TIER.plain + RACE_TIER.weak;

export type RaceStartPillars = Record<PillarId, number>;

/**
 * Каждая раса получает все четыре ступени ровно по одному разу,
 * поэтому расы разносторонние и равные по силе — отличается только наклон.
 */
export const RACE_START_PILLARS: Record<AttributeRaceId, RaceStartPillars> = {
  /** Человек: уравновешенный, крепкий и ловкий, звериного чутья нет. */
  human: {
    fortitude: RACE_TIER.strong,
    finesse: RACE_TIER.good,
    might: RACE_TIER.plain,
    instinct: RACE_TIER.weak,
  },
  /** Эльф: точность и чутьё, телом хрупок. */
  elf: {
    finesse: RACE_TIER.strong,
    instinct: RACE_TIER.good,
    might: RACE_TIER.plain,
    fortitude: RACE_TIER.weak,
  },
  /** Дварф: камень и молот, поворотлив плохо. */
  dwarf: {
    fortitude: RACE_TIER.strong,
    might: RACE_TIER.good,
    instinct: RACE_TIER.plain,
    finesse: RACE_TIER.weak,
  },
  /** Орк: сила и напор, тонкость не его. */
  orc: {
    might: RACE_TIER.strong,
    fortitude: RACE_TIER.good,
    finesse: RACE_TIER.plain,
    instinct: RACE_TIER.weak,
  },
  /** Зверолюд: нюх и рывок, стойкости меньше. */
  beastfolk: {
    instinct: RACE_TIER.strong,
    finesse: RACE_TIER.good,
    might: RACE_TIER.plain,
    fortitude: RACE_TIER.weak,
  },
};

/** Стартовые очки расы в столп. */
export function raceStartFor(raceId: AttributeRaceId, pillar: PillarId): number {
  return RACE_START_PILLARS[raceId]?.[pillar] ?? RACE_TIER.plain;
}

/** Подпись ступени для карточки выбора расы. */
export function raceTierLabel(value: number): 'strong' | 'good' | 'plain' | 'weak' {
  if (value >= RACE_TIER.strong) return 'strong';
  if (value >= RACE_TIER.good) return 'good';
  if (value >= RACE_TIER.plain) return 'plain';
  return 'weak';
}
