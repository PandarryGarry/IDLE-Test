/**
 * Числа столпов. Открытые пункты помечены: не показывать в UI как закон.
 * Кривая ^0.75 — канон контракта.
 */
export const PILLAR_CURVE_EXPONENT = 0.75;

/**
 * Скрытая база тела. % расы считаются от неё, иначе 0 очков = все расы одинаковы.
 * Точная цифра НЕ закрыта владельцем — заглушка 5A.
 */
export const BODY_BASE_STUB = 100;

/** Ветка-пассивка столп больше не качает. Оставлен 0, чтобы старые сейвы не кормили итог. */
export const BRANCH_TO_PILLAR_PER_RANK_STUB = 0;

/**
 * Рост тела от 1 единицы столпа. Как аспекты в Доте: дети одного столпа
 * идут разным шагом — главное число заметно, тонкие копятся.
 * База держит штраф расы выше нуля. Это единицы тела, не HP/урон боя.
 */
export const SUBSTAT_GROWTH: Record<string, { base: number; perPillar: number }> = {
  health: { base: 100, perPillar: 5 },
  armor: { base: 14, perPillar: 0.4 },
  will: { base: 16, perPillar: 0.6 },
  strike: { base: 22, perPillar: 1.2 },
  onslaught: { base: 14, perPillar: 0.7 },
  destruction: { base: 16, perPillar: 0.9 },
  tempo: { base: 12, perPillar: 1 },
  evasion: { base: 12, perPillar: 0.4 },
  reaction: { base: 12, perPillar: 0.7 },
  luck: { base: 14, perPillar: 0.5 },
  resourcefulness: { base: 16, perPillar: 0.8 },
  intuition: { base: 14, perPillar: 0.45 },
};

export const PILLAR_RANK_CAP_STUB = 999;
/**
 * Потолок ранга одного узла доски (ветвь или глубинная пассивка).
 * Решено владельцем 2026-09-02: узел качается 1 → 2 → 3, следующий узел
 * на луче открывается, когда предыдущий выкачан до конца.
 */
export const NODE_RANK_CAP = 3;

export function pillarContribution(finalPillar: number): number {
  const ratio = 1 + (Number.isFinite(finalPillar) ? finalPillar : 0) / 100;
  return Math.max(0.01, ratio) ** PILLAR_CURVE_EXPONENT;
}
