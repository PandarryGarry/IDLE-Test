import React from 'react';

interface TierBadgeProps {
  tier: string;
  className?: string;
  size?: 'sm' | 'md';
  /** Уникальная экипировка: вместо «T12» метка «УНИК» и своё оформление. */
  unique?: boolean;
}

export function TierBadge({ tier, className = '', size = 'sm', unique = false }: TierBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-[9px] px-1.5 py-0.2' : 'text-[11px] px-2 py-0.5';

  return (
    <span
      className={`font-mono font-black uppercase rounded-md bg-[var(--bg-page)] text-amber-300 border border-amber-400/40 shadow-sm leading-tight inline-flex items-center justify-center ${sizeClasses} ${unique ? 'tier-badge--unique' : ''} ${className}`}
    >
      {tier}
    </span>
  );
}
