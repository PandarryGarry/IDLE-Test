import React from 'react';
import { getItem } from '@/data/items';
import { formatNumber } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from '@/hooks/useTranslation';

interface ItemIconProps {
  itemId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  quantity?: number;
  className?: string;
  showTooltip?: boolean;
}

export function ItemIcon({ itemId, size = 'md', quantity, className = '', showTooltip = true }: ItemIconProps) {
  const item = getItem(itemId);
  
  if (!item) return <div className={`bg-muted rounded ${className}`} style={{ width: 32, height: 32 }} />;

  const sizeClasses = {
    sm: 'w-8 h-8 text-xl',
    md: 'w-10 h-10 text-2xl',
    lg: 'w-14 h-14 text-3xl',
    xl: 'w-16 h-16 text-4xl',
  };

  const badgeSize = size === 'sm' ? 'text-[9px] px-1' : 'text-xs px-1.5';
  const { t } = useTranslation();

  const icon = (
    <div className={`relative flex items-center justify-center bg-accent border border-border rounded shadow-inner ${sizeClasses[size]} ${className}`}>
      <span>{item.icon || '📦'}</span>
      {quantity !== undefined && (
        <span className={`absolute -bottom-2 -right-2 bg-background border border-border text-primary font-mono font-bold rounded-full ${badgeSize}`}>
          {formatNumber(quantity)}
        </span>
      )}
    </div>
  );

  if (!showTooltip) return icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{icon}</TooltipTrigger>
      <TooltipContent className="bg-popover border-border p-3 text-sm shadow-xl">
        <div className="font-bold text-base mb-1 text-foreground">{item.name}</div>
        <div className="text-muted-foreground mb-2 max-w-[200px]">
          {item.description ?? t('inventory.noDescription')}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
          <span className="text-muted-foreground">{t('inventory.sellsFor')}:</span>
          <span className="text-amber-400 font-mono text-right">{item.sellValue} GP</span>
          {item.healAmount !== undefined && (
            <>
              <span className="text-muted-foreground">{t('inventory.heals')}:</span>
              <span className="text-green-400 font-mono text-right">{item.healAmount} HP</span>
            </>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}