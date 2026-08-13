import React from 'react';
import { SkillHeader } from '@/components/SkillHeader';
import { ActionGrid } from '@/components/ActionGrid';
import { ActionProgressBar } from '@/components/ActionProgressBar';
import { ROCKS } from '@/data/mining';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/hooks/useTranslation';

export function MiningPage() {
  const { t } = useTranslation();
  const { startSkillAction, stopAction, activeSkill, activeActionId } = useGameStore();

  const handleActionClick = (actionId: string) => {
    if (activeSkill === 'mining' && activeActionId === actionId) {
      stopAction();
    } else {
      startSkillAction('mining', actionId);
    }
  };

  const activeRock = ROCKS.find(r => r.id === activeActionId);
  const isTraining = activeSkill === 'mining' && !!activeRock;

  return (
    <div className="space-y-4">
      <SkillHeader skillId="mining" skillName={t('skill.mining')} skillIcon="⛏️" />

      {/* Active Action Panel */}
      <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-sm">
        {isTraining && activeRock ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-xl">⛏️</span> {t('mining.mining')} {activeRock.name}
                </h3>
                <p className="text-muted-foreground text-sm font-mono mt-0.5">
                  {(activeRock.interval / 1000).toFixed(1)}{t('ui.seconds.abbr')} {t('ui.per.action')}
                </p>
              </div>
              <button
                onClick={stopAction}
                className="shrink-0 w-full sm:w-auto px-5 py-2.5 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white font-bold rounded-xl transition-all text-sm"
              >
                {t('mining.stop')}
              </button>
            </div>
            <ActionProgressBar height="h-5" color="green" />
          </div>
        ) : (
          <div className="text-center text-muted-foreground flex flex-col items-center gap-2 py-4">
            <div className="text-4xl opacity-40">🪨</div>
            <p className="text-sm font-medium">{t('mining.selectRock')}</p>
          </div>
        )}
      </div>

      <h2 className="text-base font-black uppercase tracking-widest text-muted-foreground px-1">{t('mining.availableRocks')}</h2>
      <ActionGrid
        skillId="mining"
        actions={ROCKS}
        onActionClick={handleActionClick}
        renderExtra={(action) => action.gemChance ? (
          <div className="flex justify-between text-xs mt-1 text-primary">
            <span>Gem Chance:</span>
            <span>{(action.gemChance * 100).toFixed(1)}%</span>
          </div>
        ) : null}
      />
    </div>
  );
}