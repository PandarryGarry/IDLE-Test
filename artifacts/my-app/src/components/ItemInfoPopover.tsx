import React from 'react';
import { getItem } from '@/data/items';
import { formatNumber } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { ItemIcon } from '@/components/ItemIcon';
import { useBankStore } from '@/store/bankStore';
import { usePlayerStore } from '@/store/playerStore';
import { Lock, Unlock } from 'lucide-react';
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

  // Получаем состояние lock из bankStore
  const slot = useBankStore(s => s.getSlot(itemId));
  const lockItem = useBankStore(s => s.lockItem);
  const isLocked = slot?.locked ?? false;

  // Получаем текущую экипировку для сравнения
  const equipment = usePlayerStore(s => s.equipment);

  if (!item) return children ?? null;

  const combatStats = Object.entries(item.combatStats ?? {})
    .filter(([, value]) => value !== undefined && value !== 0);

  // Сравнение с текущей экипировкой
  const comparison = getEquipmentComparison(item, equipment, usePlayerStore.getState);

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
        className="w-72 max-w-[calc(100vw-1.5rem)] border-white/10 bg-popover/95 p-3 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-start gap-2.5">
          <ItemIcon itemId={itemId} size="md" showTooltip={false} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-black text-foreground">{item.name}</h3>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('inventory.type')}: {item.category.replace('_', ' ')}
            </p>
          </div>
          {/* Lock indicator */}
          {isLocked && (
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          )}
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

        {/* Сравнение с текущей экипировкой */}
        {comparison && (
          <div className="mt-3 border-t border-border/60 pt-2">
            <div className="mb-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              {t('inventory.vsCurrent') ?? 'vs Current'}
            </div>
            <div className="space-y-1 text-xs">
              {comparison.map(([stat, diff]) => (
                <div key={stat} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">{STAT_LABELS[stat] ?? stat}</span>
                  <span className={diff > 0 ? 'font-mono text-emerald-400' : diff < 0 ? 'font-mono text-destructive' : 'font-mono text-muted-foreground'}>
                    {diff > 0 ? '+' : ''}{diff}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lock button */}
        <button
          type="button"
          onClick={() => lockItem(itemId, !isLocked)}
          className={`mt-3 w-full flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-bold transition-colors active:scale-95 ${
            isLocked
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
              : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
          }`}
        >
          {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          {isLocked ? t('inventory.unlock') ?? 'Unlock' : t('inventory.lock') ?? 'Lock'}
        </button>

        {actions && <div className="mt-2 border-t border-border/60 pt-2">{actions}</div>}
      </PopoverContent>
    </Popover>
  );
}

/**
 * Сравнивает статы предмета с текущей экипировкой.
 * Возвращает массив [stat, difference] или null если сравнение не применимо.
 */
function getEquipmentComparison(
  item: ReturnType<typeof getItem>,
  equipment: Record<string, string | null>,
  getPlayerState: () => any
): [string, number][] | null {
  if (!item?.equipSlot || !item.combatStats) return null;

  const currentItem = equipment[item.equipSlot];
  if (!currentItem) return null; // Ничего не экипировано в этом слоте

  const currentData = getItem(currentItem);
  if (!currentData?.combatStats) return null;

  const comparison: [string, number][] = [];
  const allStats = new Set([
    ...Object.keys(item.combatStats),
    ...Object.keys(currentData.combatStats),
  ]);

  for (const stat of allStats) {
    const newValue = (item.combatStats as Record<string, number>)[stat] ?? 0;
    const oldValue = (currentData.combatStats as Record<string, number>)[stat] ?? 0;
    const diff = newValue - oldValue;
    if (diff !== 0) {
      comparison.push([stat, diff]);
    }
  }

  return comparison.length > 0 ? comparison : null;
}
