/**
 * Сколько героя не было — для карточки выбора.
 * Берём самый свежий известный уход (локальный leave, сейв, last_saved_at).
 * Не трогает тики и не списывает leave_time.
 */
export function awayDurationMs(now: number, stamps: readonly number[]): number {
  const valid = stamps.filter(t => Number.isFinite(t) && t > 0 && t <= now);
  if (valid.length === 0) return 0;
  return now - Math.max(...valid);
}
