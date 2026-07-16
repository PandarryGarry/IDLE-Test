import React from 'react';
import { SkillHeader } from '@/components/SkillHeader';
import { ActionGrid } from '@/components/ActionGrid';
import { ActionProgressBar } from '@/components/ActionProgressBar';
import { FISHING_SPOTS } from '@/data/fishing';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/hooks/useTranslation';

export function FishingPage() {
  const { t } = useTranslation();
  const { startSkillAction, stopAction, activeSkill, activeActionId } = useGameStore();

  const handleActionClick = (actionId: string) => {
    if (activeSkill === 'fishing' && activeActionId === actionId) {
      stopAction();
    } else {
      startSkillAction('fishing', actionId);
    }
  };

  const activeSpot = FISHING_SPOTS.find(s => s.id === activeActionId);
  const isTraining = activeSkill === 'fishing' && !!activeSpot;

  return (
    <div className="space-y-4">
      <SkillHeader skillId="fishing" skillName={t('skill.fishing')} skillIcon="🎣" />

      {/* Active Action Panel */}
      <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-sm">
        {isTraining && activeSpot ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-xl">🎣</span> {t('fishing.fishing')} {activeSpot.name}
                </h3>
                <p className="text-muted-foreground text-sm font-mono mt-0.5">
                  {(activeSpot.interval / 1000).toFixed(1)}{t('ui.seconds.abbr')} {t('ui.per.action')}
                </p>
              </div>
              <button
                onClick={stopAction}
                className="shrink-0 w-full sm:w-auto px-5 py-2.5 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white font-bold rounded-xl transition-all text-sm"
              >
                {t('fishing.stop')}
              </button>
            </div>
            <ActionProgressBar height="h-5" color="blue" />
          </div>
        ) : (
          <div className="text-center text-muted-foreground flex flex-col items-center gap-2 py-4">
            <div className="text-4xl opacity-40">🌊</div>
            <p className="text-sm font-medium">{t('fishing.selectSpot')}</p>
          </div>
        )}
      </div>

      <h2 className="text-base font-black uppercase tracking-widest text-muted-foreground px-1">{t('fishing.availableSpots')}</h2>
      <ActionGrid skillId="fishing" actions={FISHING_SPOTS} onActionClick={handleActionClick} />
    </div>
  );
}
