import React from 'react';
import { getItem } from '@/domain/items';
import { formatNumber } from '@/lib/utils';
import { getItemVisual } from '@/shared/icons/itemIcons';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from '@/hooks/useTranslation';

interface ItemIconProps {
  itemId: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  quantity?: number;
  className?: string;
  showTooltip?: boolean;
}

export function getItemRarity(itemId: string, sellValue: number = 0, equipSlot?: string): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' {
  if (itemId.includes('dragon') || itemId.includes('diamond') || itemId.includes('onyx') || sellValue >= 5000) {
    return 'legendary';
  }
  if (itemId.includes('runite') || itemId.includes('ruby') || itemId.includes('whale') || sellValue >= 1000) {
    return 'epic';
  }
  if (itemId.includes('adamantite') || itemId.includes('mithril') || itemId.includes('emerald') || itemId.includes('shark') || sellValue >= 200) {
    return 'rare';
  }
  if (itemId.includes('steel') || itemId.includes('iron') || itemId.includes('sapphire') || itemId.includes('lobster') || sellValue >= 40) {
    return 'uncommon';
  }
  return 'common';
}

const RARITY_STYLES = {
  common:    'border-stone-700/60 bg-stone-900/80 shadow-inner',
  uncommon:  'border-emerald-500/50 bg-emerald-950/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
  rare:      'border-blue-500/60 bg-blue-950/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
  epic:      'border-purple-500/60 bg-purple-950/20 shadow-[0_0_12px_rgba(168,85,247,0.25)]',
  legendary: 'border-amber-500/70 bg-amber-950/25 shadow-[0_0_14px_rgba(245,158,11,0.3)]',
  mythic:    'border-rose-500/80 bg-rose-950/30 shadow-[0_0_16px_rgba(244,63,94,0.35)] animate-pulse',
};

export function ItemIcon({ itemId, size = 'md', quantity, className = '', showTooltip = true }: ItemIconProps) {
  const item = getItem(itemId);
  const { t } = useTranslation();
  
  if (!item) return <div className={`bg-stone-900/80 border border-stone-800 rounded-xl ${className}`} style={{ width: 36, height: 36 }} />;

  const rarity = getItemRarity(item.id, item.sellValue, item.equipSlot);
  const rarityStyle = RARITY_STYLES[rarity];
  const visual = getItemVisual(itemId);

  const sizeClasses = {
    xs: 'w-6 h-6 text-sm rounded-lg',
    sm: 'w-8 h-8 text-base rounded-xl',
    md: 'w-11 h-11 text-2xl rounded-xl',
    lg: 'w-14 h-14 text-3xl rounded-2xl',
    xl: 'w-16 h-16 text-4xl rounded-2xl',
  };

  const badgeSize = size === 'xs' || size === 'sm' ? 'text-[9px] px-1 -bottom-1 -right-1' : 'text-[10px] px-1.5 -bottom-1.5 -right-1.5';

  const iconContent = visual.type === 'image' ? (
    <img 
      src={visual.value} 
      alt={item.name} 
      className="w-full h-full object-contain p-1.5 drop-shadow-sm select-none pointer-events-none" 
      loading="lazy"
    />
  ) : (
    <span className="drop-shadow-sm transition-transform hover:scale-110">{visual.value}</span>
  );

  const icon = (
    <div className={`relative flex items-center justify-center border transition-all duration-200 select-none ${rarityStyle} ${sizeClasses[size]} ${className}`}>
      {iconContent}
      {quantity !== undefined && quantity > 1 && (
        <span className={`absolute bg-stone-950/90 border border-amber-500/40 text-amber-300 font-mono font-black rounded-full shadow-md z-10 leading-tight ${badgeSize}`}>
          {formatNumber(quantity)}
        </span>
      )}
    </div>
  );

  if (!showTooltip) return icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{icon}</TooltipTrigger>
      <TooltipContent className="bg-stone-950/95 border-amber-500/30 p-3.5 text-xs shadow-2xl backdrop-blur-xl rounded-2xl max-w-xs z-50">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="font-bold text-sm text-stone-100">{item.name}</div>
          <span className="font-mono text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300">
            {rarity}
          </span>
        </div>
        <div className="text-stone-500 mb-2.5 leading-relaxed text-[11px]">
          {item.description ?? t('inventory.noDescription')}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 border-t border-stone-800 font-mono text-[11px]">
          <span className="text-stone-500">{t('inventory.sellsFor')}:</span>
          <span className="text-amber-400 font-bold text-right">{item.sellValue} GP</span>
          {item.healAmount !== undefined && (
            <>
              <span className="text-stone-500">{t('inventory.heals')}:</span>
              <span className="text-emerald-400 font-bold text-right">+{item.healAmount} HP</span>
            </>
          )}
          {item.equipSlot && (
            <>
              <span className="text-stone-500">{t('inventory.equipSlot')}:</span>
              <span className="text-cyan-400 font-bold text-right">{item.equipSlot}</span>
            </>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
