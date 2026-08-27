import React from 'react';

interface TierBadgeProps {
  tier: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function TierBadge({ tier, className = '', size = 'sm' }: TierBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-[9px] px-1.5 py-0.2' : 'text-[11px] px-2 py-0.5';

  return (
    <span 
      className={`font-mono font-black uppercase rounded-md bg-[#162030] text-amber-300 border border-amber-400/40 shadow-sm leading-tight inline-flex items-center justify-center ${sizeClasses} ${className}`}
    >
      {tier}
    </span>
  );
}
