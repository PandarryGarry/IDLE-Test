import React from 'react';
import { getItem } from '@/data/items';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { getItemTier } from '@/components/modals/UniversalInfoModal';
import { getItemRarity } from '@/components/ItemIcon';
import { formatNumber, xpPerHour } from '@/lib/utils';
import { getLevelForXp, getLevelProgress } from '@/gameEngine/xpTable';
import { useTranslation } from '@/hooks/useTranslation';
import { Lock, Sparkles, Clock, Zap, CheckCircle2 } from 'lucide-react';
import { TierBadge } from './TierBadge';
import { GameButton } from './GameButton';

interface ActionCardProps {
  action: any;
  isLocked: boolean;
  isActive: boolean;
  masteryXp?: number;
  outputItemId?: string;
  onActionClick: () => void;
  renderExtra?: React.ReactNode;
}

export function ActionCard({
  action,
  isLocked,
  isActive,
  masteryXp = 0,
  outputItemId,
  onActionClick,
  renderExtra,
}: ActionCardProps) {
  const { t } = useTranslation();

  const masteryLevel = getLevelForXp(masteryXp);
  const masteryProgress = getLevelProgress(masteryXp);

  const resolvedItemId = outputItemId || action.logId || action.oreId || action.fishId || action.cookedItemId || action.outputItemId;
  const outputItem = resolvedItemId ? getItem(resolvedItemId) : undefined;
  const visual = resolvedItemId ? getItemVisual(resolvedItemId) : null;
  const tier = resolvedItemId && outputItem ? getItemTier(resolvedItemId, outputItem) : 'T1';

  return (
    <div
      onClick={() => !isLocked && onActionClick()}
      className={`group relative flex flex-col p-3.5 sm:p-4 rounded-3xl border transition-all duration-200 overflow-hidden select-none active:scale-[0.98] ${
        isLocked
          ? 'bg-[#182130]/60 border-[#28364c]/70 opacity-55 grayscale cursor-not-allowed'
          : isActive
            ? 'bg-gradient-to-b from-emerald-950/40 via-[#1f2b3e] to-[#172232] border-emerald-500/80 shadow-[0_0_24px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400/50 cursor-pointer'
            : 'bg-gradient-to-b from-[#243147] to-[#1a2436] border-[#344562] hover:border-amber-400/60 cursor-pointer hover:shadow-xl hover:-translate-y-1'
      }`}
    >
      {/* Active Top Pulse Indicator */}
      {isActive && (
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 animate-pulse shadow-[0_0_12px_#10b981]" />
      )}

      {/* Header Row: Name & Level / Mastery Pill */}
      <div className="flex justify-between items-start gap-2 mb-2.5">
        <div className="min-w-0 flex items-center gap-1.5">
          <TierBadge tier={tier} size="sm" />
          <h3 className={`font-bold text-sm sm:text-base leading-snug truncate transition-colors ${
            isActive ? 'text-emerald-300 font-extrabold' : 'text-slate-100 group-hover:text-amber-300'
          }`}>
            {action.name}
          </h3>
        </div>

        {isLocked ? (
          <span className="shrink-0 inline-flex items-center gap-1 text-red-300 text-[10px] font-mono font-bold bg-red-950/70 border border-red-500/40 px-2 py-0.5 rounded-lg">
            <Lock className="w-2.5 h-2.5" /> Ур. {action.levelRequired}
          </span>
        ) : (
          <span 
            className={`shrink-0 inline-flex items-center gap-1 text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-lg border ${
              isActive 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' 
                : 'bg-[#182232] text-amber-300 border-[#334460]'
            }`}
            title={`Мастерство: Ур. ${masteryLevel}`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" /> {masteryLevel}
          </span>
        )}
      </div>

      {/* Mastery Progress Bar */}
      {!isLocked && (
        <div className="w-full mb-3">
          <div className="flex justify-between items-center text-[9px] font-mono text-slate-300 mb-0.5">
            <span>Мастерство</span>
            <span>{(masteryProgress * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#141c28] rounded-full overflow-hidden border border-[#2e3e56]">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 shadow-[0_0_6px_rgba(245,158,11,0.5)]"
              style={{ width: `${Math.min(100, masteryProgress * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Yield Item Preview */}
      {outputItem && visual && (
        <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-[#162030]/90 border border-[#2d3d56] mb-3">
          <span className="text-xs text-slate-300 font-medium">Добыча:</span>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#202c40] border border-[#334460] flex items-center justify-center text-lg shrink-0">
              {visual.type === 'image' ? (
                <img src={visual.value} alt={outputItem.name} className="w-5 h-5 object-contain" />
              ) : (
                <span>{visual.value}</span>
              )}
            </div>
            <span className="truncate text-xs font-bold text-slate-100">
              {outputItem.name}
            </span>
          </div>
        </div>
      )}

      {/* Stats Breakdown */}
      <div className="space-y-1.5 text-xs text-slate-300 flex-grow font-mono">
        <div className="flex justify-between items-center gap-2">
          <span className="text-slate-300 flex items-center gap-1 font-sans">
            <Zap className="w-3 h-3 text-amber-400" /> Опыт:
          </span>
          <span className="text-amber-300 font-bold">{formatNumber(action.xp)} XP</span>
        </div>

        <div className="flex justify-between items-center gap-2">
          <span className="text-slate-300 flex items-center gap-1 font-sans">
            <Clock className="w-3 h-3 text-cyan-400" /> Скорость:
          </span>
          <span className="text-slate-100 font-semibold">{(action.interval / 1000).toFixed(1)} сек.</span>
        </div>

        <div className="flex justify-between items-center gap-2">
          <span className="text-slate-300 flex items-center gap-1 font-sans">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Темп:
          </span>
          <span className="text-emerald-400 font-bold">{xpPerHour(action.xp, action.interval)}</span>
        </div>

        {renderExtra && (
          <div className="pt-2 mt-2 border-t border-[#2d3d56] font-sans">
            {renderExtra}
          </div>
        )}
      </div>

      {/* Action Button State */}
      <div className="mt-3.5 pt-2.5 border-t border-[#2d3d56]">
        {isLocked ? (
          <div className="w-full py-2 text-center text-xs font-bold text-slate-400 bg-[#162030] rounded-2xl border border-[#2d3d56]">
            🔒 Заблокировано
          </div>
        ) : isActive ? (
          <div className="w-full py-2 text-center text-xs font-extrabold text-emerald-200 bg-emerald-500/25 border border-emerald-500/60 rounded-2xl flex items-center justify-center gap-1.5 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> В процессе...
          </div>
        ) : (
          <div className="w-full py-2 text-center text-xs font-bold text-slate-100 group-hover:text-slate-950 bg-[#1e2a3c] group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-amber-500 border border-[#334460] group-hover:border-amber-400 rounded-2xl transition-all shadow-sm">
            Начать
          </div>
        )}
      </div>

    </div>
  );
}
