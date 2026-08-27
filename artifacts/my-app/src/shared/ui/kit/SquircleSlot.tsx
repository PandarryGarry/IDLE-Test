import React from 'react';
import { getItem } from '@/data/items';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { getItemTier } from '@/components/modals/UniversalInfoModal';
import { getItemRarity } from '@/components/ItemIcon';
import { Lock, Plus } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { TierBadge } from './TierBadge';

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
        className={`aspect-square bg-[#151d2a]/60 border border-[#28364c]/50 rounded-2xl flex items-center justify-center text-slate-600/50 transition-colors ${className}`}
      >
        <Plus className="w-4 h-4 opacity-30" />
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
      className={`group relative aspect-square bg-[#1c2738] hover:bg-[#223046] border border-[#31435e] hover:border-amber-400/60 rounded-2xl p-1 flex flex-col items-center justify-center transition-all duration-150 active:scale-95 shadow-md hover:shadow-xl cursor-pointer select-none ${className}`}
    >
      {/* Top-Left: Tier Badge */}
      <span className="absolute top-1 left-1.5 z-10">
        <TierBadge tier={tier} size="sm" />
      </span>

      {/* Top-Right: Rarity Dot or Lock icon */}
      <div className="absolute top-1.5 right-1.5 z-10 flex items-center">
        {locked ? (
          <Lock className="w-3 h-3 text-amber-400" />
        ) : (
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        )}
      </div>

      {/* Center Visual Art — generous scaling (95% of slot), clear and vibrant */}
      <div className="w-full h-full flex items-center justify-center overflow-hidden pointer-events-none p-1">
        {visual.type === 'image' ? (
          <img 
            src={visual.value} 
            alt={item?.name || ''} 
            className="w-full h-full max-w-[95%] max-h-[95%] object-contain drop-shadow-md select-none" 
            loading="lazy"
          />
        ) : (
          <span className="text-3xl sm:text-4xl drop-shadow-md">{visual.value}</span>
        )}
      </div>

      {/* Bottom-Right: Quantity Number */}
      {quantity !== undefined && quantity > 1 ? (
        <span className="absolute bottom-1 right-1.5 text-[10px] sm:text-[11px] font-mono font-black text-slate-100 group-hover:text-amber-300 leading-tight drop-shadow-md bg-[#131b27]/90 px-1.5 py-0.2 rounded-md border border-[#2a384e]">
          {formatNumber(quantity)}
        </span>
      ) : null}
    </button>
  );
}
