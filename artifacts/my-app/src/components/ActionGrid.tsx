import React from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { SkillId } from '@/data/types';
import { formatNumber, xpPerHour } from '@/lib/utils';
import { getLevelForXp, getLevelProgress } from '@/gameEngine/xpTable';
import { useTranslation } from '@/hooks/useTranslation';
import { getItem } from '@/data/items';
import { ItemIcon } from '@/components/ItemIcon';
import { ItemInfoPopover } from '@/components/ItemInfoPopover';

interface ActionGridProps {
  skillId: SkillId;
  actions: any[];
  onActionClick: (actionId: string) => void;
  renderExtra?: (action: any) => React.ReactNode;
}

export function ActionGrid({ skillId, actions, onActionClick, renderExtra }: ActionGridProps) {
  const { t } = useTranslation();
  const playerLevel = usePlayerStore(s => s.skills[skillId]?.level ?? 1);
  const mastery = usePlayerStore(s => s.skills[skillId]?.mastery ?? {});
  const activeActionId = useGameStore(s => s.activeActionId);
  const activeSkill = useGameStore(s => s.activeSkill);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {actions.map(action => {
        const isLocked = playerLevel < action.levelRequired;
        const isActive = activeSkill === skillId && activeActionId === action.id;
        const masteryXp = mastery[action.id] ?? 0;
        const masteryLevel = getLevelForXp(masteryXp);
        const masteryProgress = getLevelProgress(masteryXp);
        const outputItemId = action.logId ?? action.oreId ?? action.fishId ?? action.cookedItemId ?? action.outputItemId;
        const outputItem = outputItemId ? getItem(outputItemId) : undefined;

        return (
          <div
            key={action.id}
               className={`relative flex flex-col p-3 rounded-xl border transition-all overflow-hidden active:scale-[0.98] ${
              isLocked
                ? 'bg-card/50 border-border/50 opacity-55 grayscale cursor-not-allowed'
                : isActive
                  ? 'bg-primary/8 border-primary shadow-[0_0_18px_rgba(34,197,94,0.12)] ring-1 ring-primary/40 cursor-pointer'
                  : 'bg-card border-border hover:border-primary/50 cursor-pointer hover:bg-accent/40'
            }`}
            onClick={() => !isLocked && onActionClick(action.id)}
          >
            {/* Active indicator strip */}
            {isActive && (
              <div className="absolute top-0 right-0 w-1.5 h-full bg-primary rounded-r-2xl shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
            )}

            {/* Header row */}
            <div className="flex justify-between items-start mb-2 pr-3">
              <h3 className="font-bold text-base leading-tight">{action.name}</h3>
              {isLocked ? (
                <span className="text-destructive text-[11px] font-bold bg-destructive/10 px-2 py-0.5 rounded-lg whitespace-nowrap">
                  🔒 {t('ui.level')} {action.levelRequired}
                </span>
              ) : (
                <span className="text-[11px] font-bold text-primary whitespace-nowrap" title={`${t('ui.mastery')} ${masteryLevel}`}>
                  ✨ {masteryLevel}
                </span>
              )}
            </div>

            {/* Mastery progress bar */}
            {!isLocked && (
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden mb-3 opacity-40" title={`${t('ui.mastery')}: ${(masteryProgress * 100).toFixed(1)}%`}>
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${masteryProgress * 100}%` }} />
              </div>
            )}

            {/* Stats */}
            <div className="space-y-1.5 text-sm text-muted-foreground flex-grow">
              {outputItem && (
                <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
                  <span>{t('ui.yields')}:</span>
                  <div className="flex min-w-0 items-center gap-1.5">
                    <ItemInfoPopover itemId={outputItem.id}>
                      <button
                        type="button"
                        aria-label={outputItem.name}
                        onClick={(event) => event.stopPropagation()}
                        className="rounded-md transition-transform active:scale-95"
                      >
                        <ItemIcon itemId={outputItem.id} size="sm" showTooltip={false} />
                      </button>
                    </ItemInfoPopover>
                    <span className="truncate text-xs font-bold text-foreground">
                      {outputItem.name}
                    </span>
                  </div>
                </div>
              )}
              {action.description && (
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground/80">
                  {action.description}
                </p>
              )}
              <div className="flex justify-between gap-2">
                <span className="truncate">{t('ui.experience')}:</span>
                <span className="text-amber-400 font-mono font-bold shrink-0">{formatNumber(action.xp)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="truncate">{t('ui.interval')}:</span>
                <span className="font-mono text-foreground shrink-0">{(action.interval / 1000).toFixed(1)}{t('ui.seconds.abbr')}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="truncate">{t('ui.rate')}:</span>
                <span className="font-mono shrink-0">{xpPerHour(action.xp, action.interval)}</span>
              </div>
              {renderExtra && (
                <div className="pt-1 mt-1">
                  {renderExtra(action)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
