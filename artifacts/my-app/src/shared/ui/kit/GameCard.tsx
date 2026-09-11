import React from 'react';

export type CardVariant = 'default' | 'active' | 'gold' | 'combat' | 'slot';

interface GameCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  glow?: boolean;
  className?: string;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default: '[background:var(--glass-bg)] [border-color:var(--glass-edge)] [box-shadow:var(--glass-shadow)] [backdrop-filter:var(--glass-filter)]',
  active:  '[background:var(--card-cocoa-active)] [border-color:var(--card-edge-active)] [box-shadow:var(--card-active-shadow)]',
  gold:    '[background:var(--card-cocoa)] [border-color:var(--card-edge)] [box-shadow:var(--card-shadow)]',
  combat:  '[background:var(--combat-bg)] [border-color:var(--combat-edge)] [box-shadow:var(--combat-shadow)]',
  slot:    '[background:var(--cell-frame)] [border-color:var(--border-light)] hover:[border-color:var(--border-accent)] shadow-md',
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
