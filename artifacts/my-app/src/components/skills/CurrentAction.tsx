import React, { useEffect, useState } from 'react';
import { ActionProgressBar } from '@/components/ActionProgressBar';
import { useGameStore } from '@/store/gameStore';
import { useResourceStore } from '@/store/resourceStore';
import { WOODCUTTING_TREES_MAP } from '@/data/woodcutting';
import { MINING_ROCKS_MAP } from '@/data/mining';
import { FISHING_SPOTS_MAP } from '@/data/fishing';
import type { ResourceInfo } from '@/data/types';
import { cn, formatCompact } from '@/lib/utils';

interface CurrentActionProps {
  skillIcon: string;
  skillName: string;
  actionName: string;
  actionInterval: number;
  isTraining: boolean;
  onStop: () => void;

  // Инструмент (опционально)
  toolName?: string;
  toolIcon?: string;
  toolTier?: number;
  toolDurability?: number;
  toolMaxDurability?: number;
  toolSpeedBonus?: number;

  // Информация о ресурсе
  resourceInfo?: ResourceInfo;

  t: (key: string) => string;
}

/** Форматирование обратного отсчёта: 265 → "4:25" */
function formatCountdown(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m >= 60) return `${Math.floor(m / 60)}ч ${m % 60}м`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Находим параметры ноды по actionId */
function findNodeLimits(actionId: string | null): { stockLimit?: number; respawnMs?: number } | null {
  if (!actionId) return null;
  const action =
    WOODCUTTING_TREES_MAP[actionId] ??
    MINING_ROCKS_MAP[actionId] ??
    FISHING_SPOTS_MAP[actionId];
  if (!action) return null;
  return { stockLimit: action.stockLimit, respawnMs: action.respawnMs };
}

export function CurrentAction({
  skillIcon, skillName, actionName, actionInterval, isTraining, onStop,
  toolName, toolIcon, toolTier, toolDurability, toolMaxDurability, toolSpeedBonus,
  resourceInfo, t,
}: CurrentActionProps) {
  // ── Состояние ожидания восстановления ──
  const waitingForRespawn = useGameStore(s => s.waitingForRespawn);
  const activeActionId = useGameStore(s => s.activeActionId);
  const limits = findNodeLimits(activeActionId);
  const respawnMs = limits?.respawnMs ?? 0;

  // Селекторы из resourceStore
  const remaining = useResourceStore(s =>
    activeActionId && limits?.stockLimit ? s.getRemaining(activeActionId, limits.stockLimit) : limits?.stockLimit ?? 0
  );
  const respawnRemainingMs = useResourceStore(s =>
    activeActionId && limits?.respawnMs ? s.getRespawnRemainingMs(activeActionId, limits.respawnMs) : 0
  );

  // Тик раз в секунду для таймера ожидания
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!waitingForRespawn || respawnRemainingMs <= 0) return;
    const id = setInterval(() => forceTick(v => v + 1), 1000);
    return () => clearInterval(id);
  }, [waitingForRespawn, respawnRemainingMs]);

  if (!isTraining) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="text-center text-muted-foreground flex flex-col items-center gap-2">
          <div className="text-5xl opacity-40">{skillIcon}</div>
          <p className="text-sm font-medium">Выберите действие для начала тренировки</p>
        </div>
      </div>
    );
  }

  const hasTool = toolName && toolIcon && toolTier;
  const hasDurability = toolDurability !== undefined && toolMaxDurability !== undefined;
  const durabilityPercent = hasDurability ? (toolDurability! / toolMaxDurability!) * 100 : 100;

  // ── Расчёт скорости ──
  const speedBonus = toolSpeedBonus ?? 0;
  const speedMod = 1 + speedBonus / 100;
  const baseSec = actionInterval / 1000;
  const effSec = baseSec / speedMod;
  const hasSpeedEffect = speedBonus !== 0;

  const getDurabilityColor = () => {
    if (durabilityPercent > 60) return 'bg-green-500';
    if (durabilityPercent > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTierColor = () => {
    const colors: Record<number, string> = {
      1: 'bg-stone-600', 2: 'bg-amber-700', 3: 'bg-slate-500', 4: 'bg-slate-300',
      5: 'bg-blue-500', 6: 'bg-purple-500', 7: 'bg-pink-500', 8: 'bg-orange-500',
    };
    return colors[toolTier || 1] || 'bg-stone-600';
  };

  const resIcon = resourceInfo?.icon ?? skillIcon;
  const resName = resourceInfo?.name ?? actionName;
  const totalValue = resourceInfo ? resourceInfo.inInventory * resourceInfo.sellValue : 0;

  // Остаток для прогресс-полосы ресурса в панели
  const stockLimit = limits?.stockLimit ?? 0;
  const stockPercent = stockLimit > 0 ? remaining / stockLimit : 1;
  const stockColor =
    stockPercent > 0.5 ? 'bg-green-500' : stockPercent > 0.2 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="bg-card border border-border rounded-2xl p-3.5 md:p-5 shadow-sm space-y-3">
      {/* Две колонки: ИНСТРУМЕНТ (2/5) | РЕСУРС (3/5 — шире) */}
      <div className="grid grid-cols-5 gap-3">

        {/* ── ИНСТРУМЕНТ ── */}
        <div className="col-span-2 rounded-xl bg-background/40 border border-border p-3 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Инструмент</p>

          <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-background to-muted border border-border flex items-center justify-center text-2xl">
              {toolIcon ?? '🚫'}
            </div>
            <p className="font-bold text-xs leading-tight truncate w-full">
              {toolName ?? 'Нет инструмента'}
            </p>
            {hasTool && (
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-bold text-white', getTierColor())}>
                  T{toolTier}
                </span>
                {hasSpeedEffect && (
                  <span className={cn(
                    'text-[10px] font-bold',
                    speedBonus > 0 ? 'text-primary' : 'text-red-400'
                  )}>
                    ⚡ Скорость {speedBonus > 0 ? '+' : ''}{speedBonus}%
                  </span>
                )}
              </div>
            )}
          </div>

          {hasDurability && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground font-semibold">Прочность</span>
                <span className="font-mono font-bold">{Math.floor(toolDurability!)}/{toolMaxDurability}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('h-full transition-all duration-300', getDurabilityColor())}
                  style={{ width: `${durabilityPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── РЕСУРС (шире и информативнее) ── */}
        <div className="col-span-3 rounded-xl bg-background/40 border border-border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ресурс</p>
            {limits?.stockLimit && (
              <p className="text-[10px] font-mono font-bold text-muted-foreground">
                {remaining}/{stockLimit}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-background to-muted border border-border flex items-center justify-center text-3xl shrink-0">
              {resIcon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{resName}</p>
              {resourceInfo && (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  💰 <span className="text-yellow-400 font-bold">{resourceInfo.sellValue} GP</span>
                  {' · '}⭐ <span className="text-primary font-bold">{resourceInfo.xp} XP</span>
                </p>
              )}
            </div>
          </div>

          {/* Полоса остатка ноды */}
          {limits?.stockLimit && (
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn('h-full transition-all duration-500', stockColor)}
                style={{ width: `${stockPercent * 100}%` }}
              />
            </div>
          )}

          {resourceInfo && (
            <div className="space-y-1 pt-1.5 border-t border-border/60">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">🎒 В инвентаре</span>
                <span className="font-mono font-bold">{resourceInfo.inInventory} шт</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">⛏️ За действие</span>
                <span className="font-mono font-bold">{resourceInfo.qtyPerAction} шт</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">💎 Цена</span>
                <span className="font-mono font-bold text-yellow-400">{formatCompact(totalValue)} GP</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Прогресс действия / Режим ожидания ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className={cn(
            'text-xs font-bold truncate min-w-0',
            waitingForRespawn && 'text-amber-400'
          )}>
            <span className="mr-1">{skillIcon}</span>
            {waitingForRespawn ? (
              <>
                ⏳ Ожидание восстановления: {resName}
              </>
            ) : (
              <>
                {actionName}
                <span className="ml-2 font-mono text-[10px] font-normal text-muted-foreground">
                  {hasSpeedEffect ? (
                    <>
                      <span className="line-through opacity-60">{baseSec.toFixed(1)}с</span>
                      <span className={cn('ml-1 font-bold', speedMod > 1 ? 'text-primary' : 'text-red-400')}>
                        → {effSec.toFixed(1)}с
                      </span>
                    </>
                  ) : (
                    <span>{baseSec.toFixed(1)}с за действие</span>
                  )}
                </span>
              </>
            )}
          </p>
          <button
            onClick={onStop}
            className="shrink-0 px-3 py-1 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white font-bold rounded-lg transition-all text-xs"
          >
            {t('ui.stop') || 'Стоп'}
          </button>
        </div>

        {/* Полоса прогресса или таймер ожидания */}
        {waitingForRespawn && respawnMs > 0 ? (
          <div className="relative h-3 rounded-full bg-amber-950/40 border border-amber-500/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500/40 to-amber-400/70 transition-all duration-1000"
              style={{ width: `${Math.max(0, 100 - (respawnRemainingMs / respawnMs) * 100)}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-amber-200 pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] animate-pulse">
              ⏳ {formatCountdown(respawnRemainingMs)}
            </span>
          </div>
        ) : (
          <div className="relative">
            <ActionProgressBar height="h-3" color="green" />
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white/90 pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
              ⏱ {effSec.toFixed(1)}с
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
