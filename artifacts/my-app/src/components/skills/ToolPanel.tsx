import React from 'react';
import { cn } from '@/lib/utils';

interface ToolPanelProps {
  toolName: string;
  toolIcon: string;
  tier: number;
  durability?: number;
  maxDurability?: number;
  speedBonus?: number;
  className?: string;
}

export function ToolPanel({ 
  toolName, 
  toolIcon, 
  tier, 
  durability, 
  maxDurability, 
  speedBonus,
  className 
}: ToolPanelProps) {
  const hasDurability = durability !== undefined && maxDurability !== undefined;
  const durabilityPercent = hasDurability ? (durability / maxDurability) * 100 : 100;

  const getDurabilityColor = () => {
    if (!hasDurability) return 'bg-primary';
    if (durabilityPercent > 60) return 'bg-green-500';
    if (durabilityPercent > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTierColor = () => {
    const colors: Record<number, string> = {
      1: 'bg-stone-600',
      2: 'bg-amber-700',
      3: 'bg-slate-600',
      4: 'bg-slate-400',
      5: 'bg-blue-500',
      6: 'bg-purple-500',
      7: 'bg-pink-500',
      8: 'bg-orange-500',
    };
    return colors[tier] || 'bg-stone-600';
  };

  return (
    <div className={cn(
      'bg-card border border-border rounded-xl p-4 space-y-3',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Инструмент
        </h3>
        <div className={cn(
          'px-2 py-0.5 rounded-md text-[10px] font-bold text-white',
          getTierColor()
        )}>
          Tier {tier}
        </div>
      </div>

      {/* Tool info */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-background/50 border border-border flex items-center justify-center text-3xl">
          {toolIcon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{toolName}</p>
          {speedBonus !== undefined && speedBonus > 0 && (
            <p className="text-xs text-primary font-semibold mt-0.5">
              +{speedBonus}% скорости
            </p>
          )}
        </div>
      </div>

      {/* Durability bar */}
      {hasDurability && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-semibold">Прочность</span>
            <span className="font-mono font-bold">
              {Math.floor(durability)}/{maxDurability}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn('h-full transition-all duration-300', getDurabilityColor())}
              style={{ width: `${durabilityPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
