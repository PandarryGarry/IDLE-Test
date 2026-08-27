import React from 'react';
import { SkillHeader } from '@/components/SkillHeader';
import { ActionGrid } from '@/components/ActionGrid';
import { ActionProgressBar } from '@/components/ActionProgressBar';
import { FISHING_SPOTS, FISHING_SPOTS_MAP } from '@/data/fishing';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Square, Clock } from 'lucide-react';
import { SkillIcon } from '@/components/SkillIcon';

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
      <div className={`rounded-3xl p-4 sm:p-5 relative overflow-hidden transition-all border ${
        isTraining 
          ? 'bg-gradient-to-b from-cyan-950/40 via-[#1f2b3e] to-[#172232] border-cyan-500/80 shadow-[0_0_24px_rgba(6,182,212,0.3)]' 
          : 'bg-[#1f2b3e] border-[#344562]'
      }`}>
        {isTraining && activeSpot ? (
          <div className="space-y-3.5 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-2xl shadow-inner shrink-0 p-1.5 animate-pulse">
                  <SkillIcon skillId="fishing" size="md" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span>{t('fishing.fishing')}</span>
                    <span className="text-cyan-300 font-extrabold">{activeSpot.name}</span>
                  </h3>
                  <p className="text-slate-300 text-xs font-mono mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{(activeSpot.interval / 1000).toFixed(1)} сек. за действие</span>
                  </p>
                </div>
              </div>

              <button
                onClick={stopAction}
                className="shrink-0 px-5 py-2.5 bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white border border-red-500/40 font-bold rounded-2xl transition-all text-xs active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
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
          <div className="text-center text-slate-300 flex flex-col items-center gap-2 py-6">
            <div className="w-12 h-12 rounded-2xl bg-[#162030] border border-[#2d3d56] flex items-center justify-center p-2">
              <SkillIcon skillId="fishing" size="md" />
            </div>
            <p className="text-xs font-medium text-slate-300">{t('fishing.selectSpot')}</p>
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
