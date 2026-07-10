import React from 'react';
import { getItem } from '@/data/items';
import { formatNumber } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ItemIconProps {
  itemId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  quantity?: number;
  className?: string;
}

export function ItemIcon({ itemId, size = 'md', quantity, className = '' }: ItemIconProps) {
  const item = getItem(itemId);
  
  if (!item) return <div className={`bg-muted rounded ${className}`} style={{ width: 32, height: 32 }} />;

  const sizeClasses = {
    sm: 'w-8 h-8 text-xl',
    md: 'w-10 h-10 text-2xl',
    lg: 'w-14 h-14 text-3xl',
    xl: 'w-16 h-16 text-4xl',
  };

  const badgeSize = size === 'sm' ? 'text-[9px] px-1' : 'text-xs px-1.5';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`relative flex items-center justify-center bg-accent border border-border rounded shadow-inner ${sizeClasses[size]} ${className}`}>
          <span>{item.icon || '📦'}</span>
          
          {quantity !== undefined && (
            <span className={`absolute -bottom-2 -right-2 bg-background border border-border text-primary font-mono font-bold rounded-full ${badgeSize}`}>
              {formatNumber(quantity)}
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-popover border-border p-3 text-sm shadow-xl">
        <div className="font-bold text-base mb-1 text-foreground">{item.name}</div>
        {item.description && <div className="text-muted-foreground mb-2 max-w-[200px]">{item.description}</div>}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
          <span className="text-muted-foreground">Sells for:</span>
          <span className="text-amber-400 font-mono text-right">{item.sellValue} GP</span>
          
          {item.healAmount && (
            <>
              <span className="text-muted-foreground">Heals:</span>
              <span className="text-green-400 font-mono text-right">{item.healAmount} HP</span>
            </>
          )}
          
          {item.combatStats && (
            <div className="col-span-2 mt-2 pt-2 border-t border-border/50">
              <span className="font-bold mb-1 block">Stats:</span>
              {Object.entries(item.combatStats).map(([stat, val]) => val !== 0 && (
                <div key={stat} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">{stat.replace('Bonus', '')}:</span>
                  <span className={val > 0 ? 'text-primary' : 'text-destructive'}>
                    {val > 0 ? '+' : ''}{val}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}