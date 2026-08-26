import React from 'react';
import { SkillHeader } from '@/components/SkillHeader';
import { ActionGrid } from '@/components/ActionGrid';
import { ActionProgressBar } from '@/components/ActionProgressBar';
import { FISHING_SPOTS, FISHING_SPOTS_MAP } from '@/data/fishing';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Square, Fish, Clock, Waves } from 'lucide-react';

export function FishingPage() {
  const { t } = useTranslation();
  
  const startSkillAction = useGameStore(s => s.startSkillAction);
  const stopAction = useGameStore(s => s.stopAction);
  const activeSkill = useGameStore(s => s.activeSkill);
  const activeActionId = useGameStore(s => s.activeActionId);

  const handleActionClick = (actionId: string) => {
    if (activeSkill === 'fishing' && activeActionId === actionId) {
      stopAction();
    } else {
      startSkillAction('fishing', actionId);
    }
  };

  const activeSpot = activeActionId ? FISHING_SPOTS_MAP[activeActionId] : undefined;
  const isTraining = activeSkill === 'fishing' && !!activeSpot;

  return (
    <div className="space-y-4">
      <SkillHeader skillId="fishing" skillName={t('skill.fishing')} skillIcon="🎣" />

      {/* Active Action Panel */}
      <div className={`fantasy-card rounded-3xl p-4 sm:p-5 relative overflow-hidden transition-all ${
        isTraining ? 'fantasy-card-active border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.2)]' : 'border-slate-800'
      }`}>
        {isTraining && activeSpot ? (
          <div className="space-y-3.5 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-inner shrink-0 animate-pulse">
                  🎣
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span>{t('fishing.fishing')}</span>
                    <span className="text-cyan-400 font-extrabold">{activeSpot.name}</span>
                  </h3>
                  <p className="text-slate-400 text-xs font-mono mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{(activeSpot.interval / 1000).toFixed(1)}{t('ui.seconds.abbr')} {t('ui.per.action')}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={stopAction}
                className="shrink-0 px-5 py-2.5 bg-red-500/15 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/40 font-bold rounded-xl transition-all text-xs active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t('fishing.stop')}</span>
              </button>
            </div>

            <div className="pt-1">
              <ActionProgressBar height="h-3" color="blue" />
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 flex flex-col items-center gap-2 py-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl opacity-60">
              🌊
            </div>
            <p className="text-xs font-medium text-slate-400">{t('fishing.selectSpot')}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-1 pt-1">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 font-mono flex items-center gap-1.5">
          <span>🎣</span> {t('fishing.availableSpots')}
        </h2>
      </div>

      <ActionGrid skillId="fishing" actions={FISHING_SPOTS} onActionClick={handleActionClick} />
    </div>
  );
}
