import React from 'react';
import { Lock } from 'lucide-react';
import { TierBadge } from './TierBadge';

export type IconShape = 'circle' | 'squircle' | 'rounded' | 'diamond' | 'none';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type FrameVariant = 'default' | 'active' | 'gold' | 'combat' | 'slot' | 'transparent';

interface IconFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: { type: 'image' | 'emoji'; value: string } | string;
  shape?: IconShape;
  size?: IconSize;
  variant?: FrameVariant;
  tier?: string;
  rarityDotColor?: string;
  locked?: boolean;
  badge?: React.ReactNode;
  alt?: string;
  className?: string;
}

const SIZE_CONFIG: Record<IconSize, { frame: string; iconSize: string; textSize: string }> = {
  xs:  { frame: 'w-6 h-6',    iconSize: 'w-4 h-4',       textSize: 'text-xs' },
  sm:  { frame: 'w-8 h-8',    iconSize: 'w-5 h-5',       textSize: 'text-sm' },
  md:  { frame: 'w-11 h-11',  iconSize: 'w-8 h-8',       textSize: 'text-xl' },
  lg:  { frame: 'w-14 h-14',  iconSize: 'w-10 h-10',     textSize: 'text-2xl' },
  xl:  { frame: 'w-18 h-18',  iconSize: 'w-14 h-14',     textSize: 'text-3xl' },
  '2xl': { frame: 'w-24 h-24', iconSize: 'w-18 h-18',   textSize: 'text-4xl' },
};

const SHAPE_CONFIG: Record<IconShape, string> = {
  circle:    'rounded-full',
  squircle:  'rounded-2xl',
  rounded:   'rounded-xl',
  diamond:   'rotate-45 rounded-lg [&>*]:-rotate-45',
  none:      'rounded-none bg-transparent border-transparent shadow-none',
};

const VARIANT_CONFIG: Record<FrameVariant, string> = {
  default:     'bg-[var(--bg-card-dark)] border border-[var(--border-light)] shadow-md',
  active:      'bg-emerald-100/80 border border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/50',
  gold:        'bg-amber-50 border border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/40',
  combat:      'bg-red-50 border border-red-500/70 shadow-[0_0_20px_rgba(239,68,68,0.35)] ring-1 ring-red-400/40',
  slot:        'bg-[#1a2538] border border-[var(--border-light)] hover:border-amber-400/60 shadow-inner',
  transparent: 'bg-transparent border-transparent shadow-none',
};

export function IconFrame({
  icon,
  shape = 'squircle',
  size = 'md',
  variant = 'default',
  tier,
  rarityDotColor,
  locked = false,
  badge,
  alt = '',
  className = '',
  ...props
}: IconFrameProps) {
  const sizeStyle = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const shapeStyle = SHAPE_CONFIG[shape] || SHAPE_CONFIG.squircle;
  const variantStyle = VARIANT_CONFIG[variant] || VARIANT_CONFIG.default;

  const isImage = typeof icon === 'object' ? icon.type === 'image' : icon.startsWith('/') || icon.startsWith('http');
  const iconValue = typeof icon === 'object' ? icon.value : icon;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none transition-all duration-150 overflow-visible ${sizeStyle.frame} ${shapeStyle} ${variantStyle} ${className}`}
      {...props}
    >
      {/* Top-Left: Tier badge if present */}
      {tier && (
        <span className="absolute -top-1 -left-1 z-10">
          <TierBadge tier={tier} size="sm" />
        </span>
      )}

      {/* Top-Right: Rarity Dot or Lock icon */}
      <div className="absolute top-1 right-1.5 z-10 flex items-center">
        {locked ? (
          <Lock className="w-2.5 h-2.5 text-amber-400" />
        ) : rarityDotColor ? (
          <span className={`w-1.5 h-1.5 rounded-full ${rarityDotColor}`} />
        ) : null}
      </div>

      {/* Center Icon Content — fills frame proportionally with ZERO outer lines */}
      <div className="w-full h-full flex items-center justify-center p-1 overflow-hidden pointer-events-none">
        {isImage ? (
          <img
            src={iconValue}
            alt={alt}
            className={`w-full h-full object-contain drop-shadow-sm select-none`}
            loading="lazy"
          />
        ) : (
          <span className={`${sizeStyle.textSize} drop-shadow-sm leading-none flex items-center justify-center`}>
            {iconValue}
          </span>
        )}
      </div>

      {/* Bottom-Right: Badge (Level / Quantity) */}
      {badge && (
        <div className="absolute -bottom-1 -right-1 z-10">
          {badge}
        </div>
      )}
    </div>
  );
}
