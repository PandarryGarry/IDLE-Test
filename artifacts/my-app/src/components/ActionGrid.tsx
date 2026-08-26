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
import { Lock, Sparkles, Clock, Zap, CheckCircle2, ChevronRight } from 'lucide-react';

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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
            onClick={() => !isLocked && onActionClick(action.id)}
            className={`group relative flex flex-col p-4 rounded-2xl border transition-all duration-200 overflow-hidden select-none active:scale-[0.98] ${
              isLocked
                ? 'bg-slate-950/40 border-slate-800/60 opacity-60 grayscale cursor-not-allowed'
                : isActive
                  ? 'fantasy-card-active border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/40 cursor-pointer'
                  : 'fantasy-card hover:border-amber-500/50 cursor-pointer hover:shadow-xl hover:-translate-y-0.5'
            }`}
          >
            {/* Active pulsing aura badge */}
            {isActive && (
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 animate-pulse shadow-[0_0_10px_#10b981]" />
            )}

            {/* Header row: Action Name & Level/Mastery Badge */}
            <div className="flex justify-between items-start gap-2 mb-2">
              <div className="min-w-0">
                <h3 className={`font-bold text-sm sm:text-base leading-snug truncate transition-colors ${
                  isActive ? 'text-emerald-300' : 'text-slate-100 group-hover:text-amber-300'
                }`}>
                  {action.name}
                </h3>
              </div>

              {isLocked ? (
                <span className="shrink-0 inline-flex items-center gap-1 text-red-400 text-[10px] font-mono font-bold bg-red-950/50 border border-red-500/30 px-2 py-0.5 rounded-lg">
                  <Lock className="w-2.5 h-2.5" /> Lvl {action.levelRequired}
                </span>
              ) : (
                <span 
                  className={`shrink-0 inline-flex items-center gap-1 text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-lg border ${
                    isActive 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : 'bg-slate-900 text-amber-300 border-amber-500/30'
                  }`}
                  title={`${t('ui.mastery')} Lvl ${masteryLevel}`}
                >
                  <Sparkles className="w-3 h-3 text-amber-400" /> {masteryLevel}
                </span>
              )}
            </div>

            {/* Mastery Progress Bar */}
            {!isLocked && (
              <div className="w-full mb-3" title={`${t('ui.mastery')}: ${(masteryProgress * 100).toFixed(1)}%`}>
                <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 mb-0.5">
                  <span>{t('ui.mastery')}</span>
                  <span>{(masteryProgress * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, masteryProgress * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Yields Item Preview */}
            {outputItem && (
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-3">
                <span className="text-xs text-slate-400">{t('ui.yields')}:</span>
                <div className="flex items-center gap-2 min-w-0">
                  <ItemInfoPopover itemId={outputItem.id}>
                    <button
                      type="button"
                      aria-label={outputItem.name}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-lg transition-transform active:scale-95 shrink-0"
                    >
                      <ItemIcon itemId={outputItem.id} size="sm" showTooltip={false} />
                    </button>
                  </ItemInfoPopover>
                  <span className="truncate text-xs font-bold text-slate-200">
                    {outputItem.name}
                  </span>
                </div>
              </div>
            )}

            {/* Stats Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-400 flex-grow font-mono">
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> {t('ui.experience')}:
                </span>
                <span className="text-amber-300 font-bold">{formatNumber(action.xp)} XP</span>
              </div>

              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" /> {t('ui.interval')}:
                </span>
                <span className="text-slate-200 font-semibold">{(action.interval / 1000).toFixed(1)}{t('ui.seconds.abbr')}</span>
              </div>

              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" /> {t('ui.rate')}:
                </span>
                <span className="text-emerald-400 font-bold">{xpPerHour(action.xp, action.interval)}</span>
              </div>

              {/* Extra (e.g. burn chance / recipe costs) */}
              {renderExtra && (
                <div className="pt-2 mt-2 border-t border-slate-800 font-sans">
                  {renderExtra(action)}
                </div>
              )}
            </div>

            {/* Action State Button / Status */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80">
              {isLocked ? (
                <div className="w-full py-1.5 text-center text-xs font-bold text-slate-400 bg-slate-900/50 rounded-xl">
                  🔒 {t('ui.locked')}
                </div>
              ) : isActive ? (
                <div className="w-full py-1.5 text-center text-xs font-extrabold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center justify-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> {t('ui.active') || 'Active...'}
                </div>
              ) : (
                <div className="w-full py-1.5 text-center text-xs font-bold text-slate-300 group-hover:text-amber-300 bg-slate-900 group-hover:bg-amber-500/10 border border-slate-800 group-hover:border-amber-500/30 rounded-xl transition-all">
                  {t('ui.start') || 'Start'}
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
