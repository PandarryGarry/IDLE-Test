/** XP «на месяцы» не закрыт. Здесь только закон очков. */

export const HERO_START_LEVEL = 1;

/** +1 столп за каждый новый уровень после старта. Старт = 0 очков. */
export function earnedPillarPoints(heroLevel: number): number {
  return Math.max(0, Math.floor(heroLevel) - HERO_START_LEVEL);
}

/** +1 ветвь каждые 5 уровней, первое на 5-м. */
export function earnedBranchPoints(heroLevel: number): number {
  if (heroLevel < 5) return 0;
  return Math.floor(heroLevel / 5);
}

/** Заглушка XP до следующего уровня. Не закрыто — не в UI. */
export const XP_TO_NEXT_LEVEL_STUB = 1000;
