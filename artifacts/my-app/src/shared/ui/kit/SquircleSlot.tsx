import React from 'react';
import { getItem } from '@/data/items';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { getItemTier } from '@/components/modals/UniversalInfoModal';
import { getItemRarity } from '@/components/ItemIcon';
import { Lock, Plus } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface SquircleSlotProps {
  itemId?: string;
  quantity?: number;
  locked?: boolean;
  isEmptyPlaceholder?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

const RARITY_DOT_COLORS: Record<string, string> = {
  common:    'bg-slate-500/0',
  uncommon:  'bg-emerald-400 shadow-[0_0_6px_#34d399]',
  rare:      'bg-blue-400 shadow-[0_0_6px_#60a5fa]',
  epic:      'bg-purple-400 shadow-[0_0_6px_#c084fc]',
  legendary: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
  mythic:    'bg-rose-400 shadow-[0_0_8px_#fb7185] animate-pulse',
};

export function SquircleSlot({
  itemId,
  quantity,
  locked = false,
  isEmptyPlaceholder = false,
  size = 'md',
  onClick,
  className = '',
}: SquircleSlotProps) {
  if (isEmptyPlaceholder || !itemId) {
    return (
      <div 
        className={`aspect-square bg-slate-950/40 border border-slate-800/40 rounded-2xl flex items-center justify-center text-slate-700/60 transition-colors ${className}`}
      >
        <Plus className="w-3.5 h-3.5 opacity-30" />
      </div>
    );
  }

  const item = getItem(itemId);
  const tier = item ? getItemTier(itemId, item) : 'T1';
  const rarity = item ? getItemRarity(itemId, item.sellValue, item.equipSlot) : 'common';
  const dotColor = RARITY_DOT_COLORS[rarity];
  const visual = getItemVisual(itemId);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative aspect-square bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-1.5 flex flex-col items-center justify-center transition-all duration-150 active:scale-95 shadow-md hover:shadow-lg cursor-pointer select-none ${className}`}
    >
      {/* Top-Left: Tier Badge */}
      <span className="absolute top-1 left-1.5 text-[9px] font-mono font-extrabold text-slate-400/80 group-hover:text-amber-300">
        {tier}
      </span>

      {/* Top-Right: Rarity Dot or Lock icon */}
      <div className="absolute top-1.5 right-1.5 flex items-center">
        {locked ? (
          <Lock className="w-2.5 h-2.5 text-amber-400" />
        ) : (
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        )}
      </div>

      {/* Center Visual Art / Emoji */}
      <div className="text-2xl sm:text-3xl my-auto drop-shadow-sm transition-transform group-hover:scale-110">
        {visual.type === 'image' ? (
          <img src={visual.value} alt={item?.name || ''} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
        ) : (
          <span>{visual.value}</span>
        )}
      </div>

      {/* Bottom-Right: Quantity Number */}
      {quantity !== undefined && quantity > 1 ? (
        <span className="absolute bottom-1 right-1.5 text-[10px] sm:text-[11px] font-mono font-extrabold text-slate-300 group-hover:text-amber-300 leading-tight">
          {formatNumber(quantity)}
        </span>
      ) : null}
    </button>
  );
}
