import React from 'react';
import { formatNumber } from '@/lib/utils';

export interface CoinsBreakdown {
  gold: number;
  silver: number;
  copper: number;
}

/**
 * Преобразует общее количество медяков в тройную валюту (как в WoW):
 * 100 Медяков = 1 Серебро
 * 100 Серебра = 1 Золото (10,000 Медяков = 1 Золото)
 */
export function parseCoins(totalCopper: number): CoinsBreakdown {
  const safeCopper = Math.max(0, Math.floor(totalCopper || 0));
  const copper = safeCopper % 100;
  const totalSilver = Math.floor(safeCopper / 100);
  const silver = totalSilver % 100;
  const gold = Math.floor(totalSilver / 100);

  return { gold, silver, copper };
}

export function formatCoinsText(totalCopper: number): string {
  const { gold, silver, copper } = parseCoins(totalCopper);
  const parts: string[] = [];

  if (gold > 0) parts.push(`${formatNumber(gold)} з`);
  if (silver > 0 || (gold > 0 && copper > 0)) parts.push(`${silver} с`);
  if (copper > 0 || parts.length === 0) parts.push(`${copper} м`);

  return parts.join(' ');
}

interface CoinsDisplayProps {
  amount: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showAllDenominations?: boolean;
}

export function CoinsDisplay({ 
  amount, 
  size = 'sm', 
  className = '', 
  showAllDenominations = false 
}: CoinsDisplayProps) {
  const { gold, silver, copper } = parseCoins(amount);

  const sizeStyles = {
    xs: { text: 'text-[10px]', coin: 'w-2.5 h-2.5 text-[8px]', gap: 'gap-1' },
    sm: { text: 'text-xs', coin: 'w-3.5 h-3.5 text-[9px]', gap: 'gap-1.5' },
    md: { text: 'text-sm font-bold', coin: 'w-4 h-4 text-[10px]', gap: 'gap-2' },
    lg: { text: 'text-lg font-black', coin: 'w-5 h-5 text-xs', gap: 'gap-2.5' },
  };

  const style = sizeStyles[size];

  return (
    <div className={`inline-flex items-center font-mono ${style.gap} ${style.text} ${className}`}>
      
      {/* 1. Золотые монеты (Gold) */}
      {(gold > 0 || showAllDenominations) && (
        <span className="inline-flex items-center gap-0.5 text-amber-300 font-bold">
          <span>{formatNumber(gold)}</span>
          <span className={`rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600 border border-amber-300/80 shadow-[0_0_6px_rgba(251,191,36,0.6)] flex items-center justify-center font-black text-slate-950 select-none ${style.coin}`}>
            з
          </span>
        </span>
      )}

      {/* 2. Серебряные монеты (Silver) */}
      {(silver > 0 || gold > 0 || showAllDenominations) && (
        <span className="inline-flex items-center gap-0.5 text-slate-200 font-bold">
          <span>{silver}</span>
          <span className={`rounded-full bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 border border-slate-100 shadow-[0_0_6px_rgba(226,232,240,0.5)] flex items-center justify-center font-black text-slate-900 select-none ${style.coin}`}>
            с
          </span>
        </span>
      )}

      {/* 3. Медные монеты (Copper) */}
      {(copper > 0 || (gold === 0 && silver === 0) || showAllDenominations) && (
        <span className="inline-flex items-center gap-0.5 text-amber-500 font-bold">
          <span>{copper}</span>
          <span className={`rounded-full bg-gradient-to-br from-amber-400 via-orange-600 to-amber-800 border border-amber-400 shadow-[0_0_6px_rgba(217,119,6,0.5)] flex items-center justify-center font-black text-slate-950 select-none ${style.coin}`}>
            м
          </span>
        </span>
      )}

    </div>
  );
}
