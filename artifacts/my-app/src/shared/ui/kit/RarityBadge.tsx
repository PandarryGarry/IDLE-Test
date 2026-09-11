import React from 'react';

export type RarityType = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

interface RarityBadgeProps {
  rarity: RarityType;
  className?: string;
  size?: 'sm' | 'md';
}

const RARITY_CONFIG: Record<RarityType, { label: string; text: string; bg: string; border: string }> = {
  common:    { label: 'Обычный',     text: 'text-[var(--rarity-common)]',    bg: 'bg-[color-mix(in_srgb,var(--rarity-common)_18%,transparent)]',    border: 'border-[color-mix(in_srgb,var(--rarity-common)_55%,transparent)]' },
  uncommon:  { label: 'Необычный',   text: 'text-[var(--rarity-uncommon)]',  bg: 'bg-[color-mix(in_srgb,var(--rarity-uncommon)_18%,transparent)]',  border: 'border-[color-mix(in_srgb,var(--rarity-uncommon)_55%,transparent)]' },
  rare:      { label: 'Редкий',      text: 'text-[var(--rarity-rare)]',      bg: 'bg-[color-mix(in_srgb,var(--rarity-rare)_18%,transparent)]',      border: 'border-[color-mix(in_srgb,var(--rarity-rare)_55%,transparent)]' },
  epic:      { label: 'Эпический',   text: 'text-[var(--rarity-epic)]',      bg: 'bg-[color-mix(in_srgb,var(--rarity-epic)_18%,transparent)]',      border: 'border-[color-mix(in_srgb,var(--rarity-epic)_55%,transparent)]' },
  legendary: { label: 'Легендарный', text: 'text-[var(--rarity-legendary)]', bg: 'bg-[color-mix(in_srgb,var(--rarity-legendary)_18%,transparent)]', border: 'border-[color-mix(in_srgb,var(--rarity-legendary)_55%,transparent)]' },
  mythic:    { label: 'Мифический',  text: 'text-[var(--rarity-mythic)]',    bg: 'bg-[color-mix(in_srgb,var(--rarity-mythic)_18%,transparent)]',    border: 'border-[color-mix(in_srgb,var(--rarity-mythic)_55%,transparent)]' },
};

export function RarityBadge({ rarity, className = '', size = 'sm' }: RarityBadgeProps) {
  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
  const sizeClasses = size === 'sm' ? 'text-[9px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span 
      className={`font-mono font-extrabold uppercase rounded-full border shadow-sm leading-tight inline-flex items-center justify-center ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      {config.label}
    </span>
  );
}
