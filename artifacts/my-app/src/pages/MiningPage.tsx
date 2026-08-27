import React from 'react';
import { SkillHeader } from '@/components/SkillHeader';
import { ActionGrid } from '@/components/ActionGrid';
import { ActionProgressBar } from '@/components/ActionProgressBar';
import { ROCKS, MINING_ROCKS_MAP } from '@/data/mining';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Square, Clock, Gem } from 'lucide-react';
import { SkillIcon } from '@/components/SkillIcon';

export function MiningPage() {
  const { t } = useTranslation();
  const startSkillAction = useGameStore(s => s.startSkillAction);
  const stopAction = useGameStore(s => s.stopAction);
  const activeSkill = useGameStore(s => s.activeSkill);
  const activeActionId = useGameStore(s => s.activeActionId);

  const handleActionClick = (actionId: string) => {
    if (activeSkill === 'mining' && activeActionId === actionId) {
      stopAction();
    } else {
      startSkillAction('mining', actionId);
    }
  };

  const activeRock = activeActionId ? MINING_ROCKS_MAP[activeActionId] : undefined;
  const isTraining = activeSkill === 'mining' && !!activeRock;

  return (
    <div className="space-y-4">
      <SkillHeader skillId="mining" skillName={t('skill.mining')} skillIcon="⛏️" />

      {/* Active Action Panel */}
      <div className={`rounded-3xl p-4 sm:p-5 relative overflow-hidden transition-all border ${
        isTraining 
          ? 'bg-gradient-to-b from-amber-950/40 via-[#221810] to-[#1c1108] border-amber-500/80 shadow-[0_0_24px_rgba(245,158,11,0.3)]' 
          : 'g-card border-[var(--border-default)]'
      }`}>
        {isTraining && activeRock ? (
          <div className="space-y-3.5 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(90,48,16,0.6)', border: '2px solid #8b5020', boxShadow: '0 0 12px rgba(245,158,11,0.15)' }}>
                  <SkillIcon skillId="mining" size="md" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <span>{t('mining.mining')}</span>
                    <span className="text-amber-300 font-extrabold">{activeRock.name}</span>
                  </h3>
                  <p className="text-[var(--text-secondary)] text-xs font-mono mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{(activeRock.interval / 1000).toFixed(1)} сек. за действие</span>
                  </p>
                </div>
              </div>

              <button
                onClick={stopAction}
                className="shrink-0 px-5 py-2.5 bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white border border-red-500/40 font-bold rounded-2xl transition-all text-xs active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t('mining.stop')}</span>
              </button>
            </div>

            <div className="pt-1">
              <ActionProgressBar height="h-3" color="amber" />
            </div>
          </div>
        ) : (
          <div className="text-center text-[var(--text-secondary)] flex flex-col items-center gap-2 py-6">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-light)] flex items-center justify-center p-2">
              <SkillIcon skillId="mining" size="md" />
            </div>
            <p className="text-xs font-medium" style={{ color: '#e0c070', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{t('mining.selectRock')}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-1 pt-1">
        <h2 className="text-xs font-extrabold uppercase tracking-widest font-mono flex items-center gap-1.5" style={{ color: '#ffd060', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
          <span>⛏️</span> {t('mining.availableRocks')}
        </h2>
      </div>

      <ActionGrid
        skillId="mining"
        actions={ROCKS}
        onActionClick={handleActionClick}
        renderExtra={(action) => action.gemChance ? (
          <div className="flex items-center justify-between text-xs text-amber-300 font-mono bg-amber-50 px-2 py-1 rounded-lg border border-amber-500/20">
            <span className="flex items-center gap-1 text-[11px] text-amber-400">
              <Gem className="w-3 h-3 style={{ color: "#f0c030" }} /> Gem Drop:
            </span>
            <span className="font-bold">{(action.gemChance * 100).toFixed(1)}%</span>
          </div>
        ) : null}
      />
    </div>
  );
}
