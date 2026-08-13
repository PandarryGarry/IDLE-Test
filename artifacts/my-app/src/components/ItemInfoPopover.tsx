import React from 'react';
import { getItem } from '@/data/items';
import { formatNumber } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { ItemIcon } from '@/components/ItemIcon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ItemInfoPopoverProps {
  itemId: string;
  quantity?: number;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

const STAT_LABELS: Record<string, string> = {
  attackBonus: 'Attack',
  strengthBonus: 'Strength',
  defenceBonus: 'Defence',
  rangedAttackBonus: 'Ranged attack',
  rangedStrengthBonus: 'Ranged strength',
  magicAttackBonus: 'Magic attack',
  magicDamageBonus: 'Magic damage',
  prayerBonus: 'Prayer',
};

export function ItemInfoPopover({
  itemId,
  quantity,
  children,
  actions,
}: ItemInfoPopoverProps) {
  const { t } = useTranslation();
  const item = getItem(itemId);

  if (!item) return children ?? null;

  const combatStats = Object.entries(item.combatStats ?? {})
    .filter(([, value]) => value !== undefined && value !== 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children ?? (
          <button
            type="button"
            aria-label={item.name}
            className="rounded-lg transition-transform active:scale-95"
          >
            <ItemIcon itemId={itemId} quantity={quantity} size="md" showTooltip={false} />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={8}
        className="w-64 max-w-[calc(100vw-1.5rem)] border-white/10 bg-popover/95 p-3 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-start gap-2.5">
          <ItemIcon itemId={itemId} size="md" showTooltip={false} />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-black text-foreground">{item.name}</h3>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('inventory.type')}: {item.category.replace('_', ' ')}
            </p>
          </div>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {item.description ?? t('inventory.noDescription')}
        </p>

        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-border/60 pt-2 text-xs">
          <dt className="text-muted-foreground">{t('inventory.sellsFor')}</dt>
          <dd className="text-right font-mono font-bold text-amber-400">
            {formatNumber(item.sellValue)} GP
          </dd>
          {item.healAmount !== undefined && (
            <>
              <dt className="text-muted-foreground">{t('inventory.heals')}</dt>
              <dd className="text-right font-mono font-bold text-emerald-400">
                +{item.healAmount} HP
              </dd>
            </>
          )}
          {item.equipSlot && (
            <>
              <dt className="text-muted-foreground">{t('inventory.equipSlot')}</dt>
              <dd className="text-right font-mono text-sky-400">{item.equipSlot}</dd>
            </>
          )}
        </dl>

        {combatStats.length > 0 && (
          <div className="mt-3 border-t border-border/60 pt-2">
            <div className="mb-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              {t('inventory.stats')}
            </div>
            <div className="space-y-1 text-xs">
              {combatStats.map(([stat, value]) => (
                <div key={stat} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">{STAT_LABELS[stat] ?? stat}</span>
                  <span className={Number(value) > 0 ? 'font-mono text-primary' : 'font-mono text-destructive'}>
                    {Number(value) > 0 ? '+' : ''}{value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {actions && <div className="mt-3 border-t border-border/60 pt-2">{actions}</div>}
      </PopoverContent>
    </Popover>
  );
}