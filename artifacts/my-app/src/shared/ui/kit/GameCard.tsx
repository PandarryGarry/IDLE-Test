import React from 'react';

export type CardVariant = 'default' | 'active' | 'gold' | 'combat' | 'slot';

interface GameCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  glow?: boolean;
  className?: string;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default: 'bg-stone-900/90 border-stone-800/90 shadow-xl backdrop-blur-md',
  active:  'bg-emerald-950/25 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/30',
  gold:    'bg-amber-950/25 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/30',
  combat:  'bg-red-950/25 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)] ring-1 ring-red-500/30',
  slot:    'bg-stone-900/95 border-stone-800 hover:border-amber-500/50 shadow-md',
};

export function GameCard({ 
  variant = 'default', 
  className = '', 
  children, 
  ...props 
}: GameCardProps) {
  return (
    <div 
      className={`rounded-3xl border transition-all duration-200 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
