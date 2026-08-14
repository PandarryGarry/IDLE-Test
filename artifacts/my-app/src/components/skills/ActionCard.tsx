import React, { useEffect, useState } from 'react';
import type { SkillAction, SkillId } from '@/data/types';
import { usePlayerStore } from '@/store/playerStore';
import { useResourceStore } from '@/store/resourceStore';
import { getToolForLevel } from '@/data/tools';
import { cn } from '@/lib/utils';

interface ActionCardProps {
  skillId: SkillId;
  action: SkillAction;
  isActive: boolean;
  onClick: () => void;
  renderExtra?: (action: SkillAction) => React.ReactNode;
}

function formatCountdown(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m >= 60) return `${Math.floor(m / 60)}ч ${m % 60}м`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ActionCard({ skillId, action, isActive, onClick, renderExtra }: ActionCardProps) {
  const playerLevel = usePlayerStore(s => s.skills[skillId]?.level ?? 1);
  const locked = playerLevel < action.levelRequired;
  const tool = getToolForLevel(skillId, action.levelRequired);

  // ── Истощение ресурса ──
  const node = useResourceStore(s => s.nodes[action.id]);
  const hasStock = action.stockLimit !== undefined && action.respawnMs !== undefined;
  const stockLimit = action.stockLimit ?? 0;
  const respawnMs = action.respawnMs ?? 0;
  const remaining = hasStock ? Math.max(0, stockLimit - (node?.harvested ?? 0)) : 0;
  const stockPercent = hasStock && stockLimit > 0 ? remaining / stockLimit : 1;
  const depleted = hasStock && node?.depletedAt != null && (Date.now() - (node.depletedAt ?? 0)) < respawnMs;
  const respawnLeft = depleted ? respawnMs - (Date.now() - (node?.depletedAt ?? 0)) : 0;

  // Тик раз в секунду для таймера респауна
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!depleted) return;
    const id = setInterval(() => forceTick(v => v + 1), 1000);
    return () => clearInterval(id);
  }, [depleted]);

  // Цвет полосы остатка: зелёный → жёлтый → красный
  const stockColor = stockPercent > 0.5 ? 'bg-green-500' : stockPercent > 0.2 ? 'bg-yellow-500' : 'bg-red-500';
  const stockGlow = stockPercent > 0.5
    ? 'shadow-[0_0_6px_rgba(34,197,94,0.55)]'
    : stockPercent > 0.2
      ? 'shadow-[0_0_6px_rgba(234,179,8,0.55)]'
      : 'shadow-[0_0_6px_rgba(239,68,68,0.55)]';

  return (
    <button
      onClick={onClick}
      disabled={depleted}
      className={cn(
        'relative flex flex-col items-center gap-2 p-3 pt-4 rounded-2xl border transition-all active:scale-[0.97]',
        isActive
          ? 'bg-gradient-to-b from-primary/20 to-primary/5 border-primary shadow-[0_0_14px_rgba(34,197,94,0.25)]'
          : locked
            ? 'bg-card/50 border-border opacity-60'
            : 'bg-card border-border hover:border-primary/40 hover:shadow-lg',
        depleted && 'opacity-70 cursor-not-allowed'
      )}
    >
      {/* Оверлей восстановления */}
      {depleted && (
        <div className="absolute inset-0 z-10 rounded-2xl bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1">
          <span className="text-xl">⏳</span>
          <span className="font-mono text-xs font-bold text-white">{formatCountdown(respawnLeft)}</span>
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider">восстановление</span>
        </div>
      )}

      {/* Бейдж уровня */}
      <div className={cn(
        'absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold',
        locked ? 'bg-red-500/15 text-red-400' : 'bg-muted text-muted-foreground'
      )}>
        {locked ? '🔒 ' : ''}Lv.{action.levelRequired}
      </div>

      {/* Иконка */}
      <div className={cn(
        'w-14 h-14 rounded-xl flex items-center justify-center text-3xl border shadow-inner',
        isActive ? 'bg-primary/10 border-primary/30' : 'bg-background/60 border-border',
        locked && 'grayscale opacity-70'
      )}>
        {action.icon ?? '❓'}
      </div>

      {/* Полоса остатка ресурса (зелёная/жёлтая/красная) */}
      {hasStock && !depleted && (
        <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
          <div
            className={cn('h-full transition-all duration-500', stockColor, stockGlow)}
            style={{ width: `${stockPercent * 100}%` }}
          />
        </div>
      )}

      {/* Название */}
      <p className={cn(
        'font-bold text-sm leading-tight text-center',
        isActive ? 'text-primary' : 'text-foreground'
      )}>
        {action.name}
      </p>

      {/* XP и время */}
      <div className="flex items-center gap-2 text-[11px] font-mono">
        <span className="text-primary font-bold">{action.xp} XP</span>
        <span className="text-muted-foreground">{(action.interval / 1000).toFixed(1)}с</span>
      </div>

      {/* Требуемый инструмент */}
      {tool && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-background/60 border border-border rounded-lg px-2 py-1 w-full justify-center">
          <span>{tool.icon}</span>
          <span className="truncate">{tool.name}</span>
        </div>
      )}

      {renderExtra && renderExtra(action)}
    </button>
  );
}
