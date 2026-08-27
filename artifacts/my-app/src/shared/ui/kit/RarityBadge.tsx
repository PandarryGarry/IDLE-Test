import React from 'react';

export type RarityType = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

interface RarityBadgeProps {
  rarity: RarityType;
  className?: string;
  size?: 'sm' | 'md';
}

const RARITY_CONFIG: Record<RarityType, { label: string; text: string; bg: string; border: string }> = {
  common:    { label: 'Обычный',     text: 'text-stone-200',   bg: 'bg-stone-800/80',   border: 'border-stone-700' },
  uncommon:  { label: 'Необычный',   text: 'text-emerald-300', bg: 'bg-emerald-50', border: 'border-emerald-500/50' },
  rare:      { label: 'Редкий',      text: 'text-blue-300',    bg: 'bg-blue-950/50',    border: 'border-blue-500/50' },
  epic:      { label: 'Эпический',   text: 'text-purple-300',  bg: 'bg-purple-950/50',  border: 'border-purple-500/50' },
  legendary: { label: 'Легендарный', text: 'text-amber-300',   bg: 'bg-amber-950/50',   border: 'border-amber-500/50' },
  mythic:    { label: 'Мифический',  text: 'text-rose-300',    bg: 'bg-rose-950/50',    border: 'border-rose-500/50' },
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
