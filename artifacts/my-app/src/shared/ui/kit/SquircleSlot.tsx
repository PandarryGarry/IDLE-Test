import React from 'react';
import { getItem } from '@/data/items';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { getItemTier } from '@/components/modals/UniversalInfoModal';
import { getItemRarity } from '@/components/ItemIcon';
import { Lock } from 'lucide-react';
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

/* Рамки редкости — тёплая палитра */
const RARITY_BORDER: Record<string, string> = {
  common:    'border-stone-700/60',
  uncommon:  'border-emerald-500/50',
  rare:      'border-blue-500/55',
  epic:      'border-purple-500/55',
  legendary: 'border-amber-500/65',
  mythic:    'border-rose-500/70',
};

const RARITY_BG: Record<string, string> = {
  common:    'bg-stone-950/70',
  uncommon:  'bg-emerald-950/20',
  rare:      'bg-blue-950/20',
  epic:      'bg-purple-950/20',
  legendary: 'bg-amber-950/20',
  mythic:    'bg-rose-950/20',
};

const RARITY_GLOW: Record<string, string> = {
  common:    '',
  uncommon:  'shadow-[0_0_10px_rgba(16,185,129,0.15)]',
  rare:      'shadow-[0_0_12px_rgba(59,130,246,0.18)]',
  epic:      'shadow-[0_0_14px_rgba(168,85,247,0.20)]',
  legendary: 'shadow-[0_0_16px_rgba(245,158,11,0.25)]',
  mythic:    'shadow-[0_0_18px_rgba(244,63,94,0.28)]',
};

const RARITY_DOT: Record<string, string> = {
  common:    'hidden',
  uncommon:  'bg-emerald-400',
  rare:      'bg-blue-400',
  epic:      'bg-purple-400',
  legendary: 'bg-amber-400',
  mythic:    'bg-rose-400 animate-pulse',
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
  /* Пустая ячейка */
  if (isEmptyPlaceholder || !itemId) {
    return (
      <div className={`aspect-square rounded-xl border border-dashed border-stone-800/60 bg-stone-950/40 flex items-center justify-center ${className}`}>
        <div className="w-1.5 h-1.5 rounded-full bg-stone-700/50" />
      </div>
    );
  }

  const item    = getItem(itemId);
  const tier    = item ? getItemTier(itemId, item) : 'T1';
  const rarity  = item ? getItemRarity(itemId, item.sellValue, item.equipSlot) : 'common';
  const visual  = getItemVisual(itemId);

  const borderCls = RARITY_BORDER[rarity] ?? RARITY_BORDER.common;
  const bgCls     = RARITY_BG[rarity]     ?? RARITY_BG.common;
  const glowCls   = RARITY_GLOW[rarity]   ?? '';
  const dotCls    = RARITY_DOT[rarity]    ?? 'hidden';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative aspect-square rounded-xl border transition-all duration-150 active:scale-95 cursor-pointer select-none overflow-hidden
        ${bgCls} ${borderCls} ${glowCls}
        hover:brightness-110 hover:scale-[1.03]
        ${className}`}
      style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.35)' }}
    >
      {/* Tier badge — верхний левый */}
      <span className="absolute top-1 left-1 z-10">
        <TierBadge tier={tier} size="sm" />
      </span>

      {/* Rarity dot / Lock — верхний правый */}
      <div className="absolute top-1 right-1 z-10">
        {locked
          ? <Lock className="w-3 h-3 text-amber-400" />
          : <span className={`block w-1.5 h-1.5 rounded-full ${dotCls}`} />}
      </div>

      {/* Картинка — по центру, 78% ячейки */}
      <div className="absolute inset-0 flex items-center justify-center p-[12%]">
        {visual.type === 'image' ? (
          <img
            src={visual.value}
            alt={item?.name ?? ''}
            className="w-full h-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] select-none"
            loading="lazy"
          />
        ) : (
          <span className="text-2xl sm:text-3xl leading-none drop-shadow-md select-none">
            {visual.value}
          </span>
        )}
      </div>

      {/* Количество — нижний правый */}
      {quantity !== undefined && quantity > 1 && (
        <span className="absolute bottom-1 right-1 text-[10px] font-mono font-black text-stone-100 group-hover:text-amber-300 leading-tight bg-stone-950/85 px-1 rounded border border-stone-800">
          {formatNumber(quantity)}
        </span>
      )}
    </button>
  );
}
