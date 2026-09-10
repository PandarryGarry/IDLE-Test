import React from 'react';

interface TierBadgeProps {
  tier: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

/**
 * Бирка тира экипировки (Т1–Т12). По современному канону игровых сеток
 * (Альбиан: цвет — сам по себе код тира) бирка тёмная и компактная,
 * а цифра окрашена по «медальной» шкале ценности:
 *   - Т1–Т4  — бронза;
 *   - Т5–Т8  — серебро;
 *   - Т9–Т12 — золото (одно золото канона остаётся вершиной шкалы).
 * Тёмная подложка даёт контраст на любом фоне ячейки — светлая пилюля
 * сливалась с какао-сеткой (замечание владельца к шагу 6).
 */
export function TierBadge({ tier, className = '', size = 'sm' }: TierBadgeProps) {
  const level = Number.parseInt(tier.replace(/\D/g, ''), 10);
  const grade = Number.isFinite(level) && level >= 9 ? 'gold' : Number.isFinite(level) && level >= 5 ? 'silver' : 'bronze';

  return (
    <span className={`tier-badge tier-badge--${grade} tier-badge--${size} ${className}`}>
      {tier}
    </span>
  );
}
