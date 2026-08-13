import React from 'react';
import { SkillHeader } from '@/components/SkillHeader';
import { ActionGrid } from '@/components/ActionGrid';
import { ActionProgressBar } from '@/components/ActionProgressBar';
import { FIREMAKING_LOGS, FIREMAKING_MAP } from '@/data/firemaking';
import { useGameStore } from '@/store/gameStore';
import { useBankStore } from '@/store/bankStore';
import { ItemIcon } from '@/components/ItemIcon';
import { useTranslation } from '@/hooks/useTranslation';

export function FiremakingPage() {
  const { t } = useTranslation();
  
  // Селекторы: компонент перерисовывается ТОЛЬКО при изменении этих значений
  const startSkillAction = useGameStore(s => s.startSkillAction);
  const stopAction = useGameStore(s => s.stopAction);
  const activeSkill = useGameStore(s => s.activeSkill);
  const activeActionId = useGameStore(s => s.activeActionId);
  
  // Подписка только на items, а не на весь bankStore
  const bankItems = useBankStore(s => s.items);

  const handleActionClick = (actionId: string) => {
    if (activeSkill === 'firemaking' && activeActionId === actionId) {
      stopAction();
    } else {
      startSkillAction('firemaking', actionId);
    }
  };

  // O(1) lookup вместо FIREMAKING_LOGS.find() — быстрее
  const activeLog = activeActionId ? FIREMAKING_MAP[activeActionId] : undefined;
  const isTraining = activeSkill === 'firemaking' && !!activeLog;

  // Локальная функция для получения количества предмета из банка
  const getItemQty = (itemId: string): number => {
    return bankItems.find(s => s.itemId === itemId)?.quantity ?? 0;
  };

  return (
    <div className="space-y-4">
      <SkillHeader skillId="firemaking" skillName={t('skill.firemaking')} skillIcon="🔥" />

      {/* Active Action Panel */}
      <div className="relative bg-card border border-border rounded-2xl p-4 md:p-5 shadow-sm overflow-hidden">
        {isTraining && (
          <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-24 bg-orange-500/15 blur-3xl rounded-full" />
        )}
        {isTraining && activeLog ? (
          <div className="space-y-3 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-xl animate-pulse">🔥</span> {t('firemaking.burning')} {activeLog.name}
                </h3>
                <p className="text-muted-foreground text-sm font-mono mt-0.5">
                  {(activeLog.interval / 1000).toFixed(1)}{t('ui.seconds.abbr')} {t('ui.per.action')}
                </p>
              </div>
              <button
                onClick={stopAction}
                className="shrink-0 w-full sm:w-auto px-5 py-2.5 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white font-bold rounded-xl transition-all text-sm"
              >
                {t('firemaking.stop')}
              </button>
            </div>
            <ActionProgressBar height="h-5" color="red" />
          </div>
        ) : (
          <div className="text-center text-muted-foreground flex flex-col items-center gap-2 py-4">
            <div className="text-4xl opacity-40">🪵</div>
            <p className="text-sm font-medium">{t('firemaking.selectLog')}</p>
          </div>
        )}
      </div>

      <h2 className="text-base font-black uppercase tracking-widest text-muted-foreground px-1">{t('firemaking.availableLogs')}</h2>
      <ActionGrid
        skillId="firemaking"
        actions={FIREMAKING_LOGS}
        onActionClick={handleActionClick}
        renderExtra={(action) => {
          const qty = getItemQty(action.logId);
          const hasEnough = qty >= 1;
          return (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <ItemIcon itemId={action.logId} size="sm" />
                <span className={`text-xs font-mono font-bold ${hasEnough ? 'text-foreground' : 'text-destructive'}`}>
                  {qty} / 1
                </span>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
