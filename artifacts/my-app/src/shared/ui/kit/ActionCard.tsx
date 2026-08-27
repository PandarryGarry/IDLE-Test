import React from 'react';
import { getItem } from '@/data/items';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { getItemTier } from '@/components/modals/UniversalInfoModal';
import { getItemRarity } from '@/components/ItemIcon';
import { formatNumber, xpPerHour } from '@/lib/utils';
import { getLevelForXp, getLevelProgress } from '@/gameEngine/xpTable';
import { useTranslation } from '@/hooks/useTranslation';
import { Lock, Clock, Zap } from 'lucide-react';
import { TierBadge } from './TierBadge';

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

  const masteryLevel    = getLevelForXp(masteryXp);
  const masteryProgress = getLevelProgress(masteryXp);

  const resolvedItemId = outputItemId
    || action.logId || action.oreId || action.fishId
    || action.cookedItemId || action.outputItemId;

  const outputItem = resolvedItemId ? getItem(resolvedItemId) : undefined;
  const visual     = resolvedItemId ? getItemVisual(resolvedItemId) : null;
  const tier       = resolvedItemId && outputItem ? getItemTier(resolvedItemId, outputItem) : 'T1';
  const rarity     = outputItem ? getItemRarity(resolvedItemId!, outputItem.sellValue, outputItem.equipSlot) : 'common';

  /* Цвет рамки карточки */
  const cardClass = isLocked
    ? 'opacity-50 grayscale cursor-not-allowed'
    : isActive
      ? 'border-emerald-500/60 cursor-pointer'
      : 'border-stone-700/50 hover:border-amber-500/40 cursor-pointer hover:-translate-y-0.5';

  const cardBg = isLocked
    ? 'bg-stone-950/60'
    : isActive
      ? ''  // inline style ниже
      : '';

  return (
    <div
      onClick={() => !isLocked && onActionClick()}
      className={`group relative flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden select-none active:scale-[0.98] ${cardClass} ${cardBg}`}
      style={isActive
        ? { background: 'linear-gradient(160deg, rgba(16,185,129,0.12) 0%, #1a1108 100%)', border: '1px solid rgba(16,185,129,0.55)', boxShadow: '0 0 20px rgba(16,185,129,0.14), inset 0 1px 0 rgba(16,185,129,0.12)' }
        : isLocked
          ? {}
          : { background: 'linear-gradient(160deg, #251b10 0%, #1a1108 100%)', border: '1px solid #3d2e1e', boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,220,130,0.04)' }
      }
    >
      {/* Активная полоска сверху */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />
      )}

      <div className="p-3.5 flex flex-col flex-1 gap-2.5">

        {/* ── Шапка: тир + название + мастерство ── */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <TierBadge tier={tier} size="sm" />
            <h3 className={`font-bold text-sm leading-snug truncate ${
              isActive ? 'text-emerald-200' : 'text-stone-100 group-hover:text-amber-200'
            }`}>
              {action.name}
            </h3>
          </div>

          {isLocked ? (
            <span className="shrink-0 flex items-center gap-1 text-stone-400 text-[10px] font-mono font-bold bg-stone-900/80 border border-stone-700 px-1.5 py-0.5 rounded-lg">
              <Lock className="w-2.5 h-2.5" /> {action.levelRequired}
            </span>
          ) : (
            <span className={`shrink-0 text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-lg border ${
              isActive
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                : 'bg-stone-900/80 text-amber-400 border-stone-700'
            }`} title={`Мастерство: Ур. ${masteryLevel}`}>
              M{masteryLevel}
            </span>
          )}
        </div>

        {/* ── Полоса мастерства ── */}
        {!isLocked && (
          <div className="w-full">
            <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(26,18,9,0.9)', border: '1px solid #2e2010' }}>
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, masteryProgress * 100)}%`,
                  background: 'linear-gradient(90deg, #d97706, #f59e0b)',
                  boxShadow: '0 0 6px rgba(245,158,11,0.4)',
                }}
              />
            </div>
          </div>
        )}

        {/* ── Иконка добычи ── */}
        {outputItem && visual && (
          <div className="flex items-center gap-2.5 p-2 rounded-xl" style={{ background: 'rgba(26,18,9,0.7)', border: '1px solid #2e2010' }}>
            {/* Ячейка иконки — 44×44 px, чёткий центр */}
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 p-1.5"
              style={{ background: '#1a1108', border: '1px solid #3d2e1e', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}>
              {visual.type === 'image' ? (
                <img src={visual.value} alt={outputItem.name}
                  className="w-full h-full object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
                  loading="lazy" />
              ) : (
                <span className="text-2xl leading-none">{visual.value}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-stone-500 font-mono uppercase font-bold">Добыча</div>
              <div className="text-xs font-bold text-stone-100 truncate">{outputItem.name}</div>
            </div>
          </div>
        )}

        {/* ── Стат-строки ── */}
        <div className="space-y-1 text-[11px] font-mono">
          <div className="flex justify-between items-center">
            <span className="text-stone-500 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" /> Опыт
            </span>
            <span className="text-amber-400 font-bold">{formatNumber(action.xp)} XP</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-500" /> Время
            </span>
            <span className="text-stone-300 font-semibold">{(action.interval / 1000).toFixed(1)} с.</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Темп</span>
            <span className="text-emerald-400 font-bold">{xpPerHour(action.xp, action.interval)}</span>
          </div>
          {renderExtra && (
            <div className="pt-1.5 mt-1 border-t font-sans" style={{ borderColor: '#2e2010' }}>
              {renderExtra}
            </div>
          )}
        </div>

        {/* ── Кнопка действия ── */}
        <div className="mt-auto pt-2 border-t" style={{ borderColor: '#2e2010' }}>
          {isLocked ? (
            <div className="w-full py-1.5 text-center text-[11px] font-bold text-stone-600 rounded-xl"
              style={{ background: 'rgba(26,18,9,0.6)', border: '1px solid #2e2010' }}>
              🔒 Ур. {action.levelRequired}
            </div>
          ) : isActive ? (
            <div className="w-full py-1.5 text-center text-[11px] font-bold text-emerald-200 rounded-xl flex items-center justify-center gap-1.5"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              В процессе…
            </div>
          ) : (
            <div className="w-full py-2 text-center text-[11px] font-bold rounded-xl transition-all cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#92400e,#b45309)', border: '1px solid #c2690a', color: '#fef3c7', boxShadow: '0 2px 8px rgba(180,83,9,0.3)' }}>
              Начать →
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
