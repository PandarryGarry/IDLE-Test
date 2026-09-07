import { useGameStore } from '@/store/gameStore';
import { FORAGING_ACTIONS, FORAGING_ACTIONS_MAP, type ForagingZone } from '@/domain/professions/foraging';
import { SkillHeader } from '@/features/professions/SkillHeader';
import { ActionProgressBar } from '@/features/professions/ActionProgressBar';
import { ActionGrid } from '@/features/professions/ActionGrid';
import { useTranslation } from '@/hooks/useTranslation';
import { Square, Clock, Leaf } from 'lucide-react';

export function ForagingPage() {
  const { t } = useTranslation();

  const startSkillAction = useGameStore(s => s.startSkillAction);
  const stopAction = useGameStore(s => s.stopAction);
  const activeSkill = useGameStore(s => s.activeSkill);
  const activeActionId = useGameStore(s => s.activeActionId);

  const handleActionClick = (actionId: string) => {
    if (activeSkill === 'foraging' && activeActionId === actionId) {
      stopAction();
    } else {
      startSkillAction('foraging', actionId);
    }
  };

  const activeAction = activeActionId ? FORAGING_ACTIONS_MAP[activeActionId] : undefined;
  const isTraining = activeSkill === 'foraging' && !!activeAction;

  return (
    <div className="space-y-4">
      <SkillHeader skillId="foraging" skillName={t('skill.foraging')} skillIcon="🌿" />

      {/* Active Action Panel */}
      <div
        className="rounded-2xl p-4 sm:p-5 relative overflow-hidden transition-all"
        style={{
          background: isTraining
            ? 'linear-gradient(160deg, #1f3a0a, #142608)'
            : 'linear-gradient(160deg, #3c5a1e, #2e4416)',
          border: isTraining ? '2px solid #84cc16' : '2px solid #2f4a12',
          boxShadow: isTraining ? '0 3px 0 #10200a, 0 0 20px rgba(132,204,22,0.2)' : '0 3px 0 #1a2e0c',
        }}
      >
        {isTraining && activeAction ? (
          <div className="space-y-3.5 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(132,204,22,0.16)', border: '2px solid rgba(132,204,22,0.5)', boxShadow: '0 0 12px rgba(132,204,22,0.25)' }}
                >
                  <Leaf className="w-6 h-6" style={{ color: '#bef264' }} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <span>{t('foraging.searching')}</span>
                    <span style={{ color: '#d9f99d', fontWeight: 800 }}>{activeAction.name}</span>
                  </h3>
                  <p className="text-[var(--text-secondary)] text-xs font-mono mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-lime-400" />
                    <span>{(activeAction.interval / 1000).toFixed(1)} сек. за действие</span>
                  </p>
                </div>
              </div>

              <button
                onClick={stopAction}
                className="shrink-0 px-5 py-2.5 bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white border border-red-500/40 font-bold rounded-2xl transition-all text-xs active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t('foraging.stop')}</span>
              </button>
            </div>

            <div className="pt-1">
              <ActionProgressBar height="h-3" color="green" />
            </div>
          </div>
        ) : (
          <div className="text-center text-[var(--text-secondary)] flex flex-col items-center gap-2 py-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-light)' }}
            >
              <Leaf className="w-6 h-6 text-[var(--text-muted)]" />
            </div>
            <p className="text-xs font-medium" style={{ color: '#d9f99d', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{t('foraging.selectSpot')}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-1 pt-1">
        <h2 className="text-xs font-extrabold uppercase tracking-widest font-mono flex items-center gap-1.5" style={{ color: '#bef264', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
          <span>🌿</span> {t('foraging.availableSpots')}
        </h2>
      </div>

      <ActionGrid
        skillId="foraging"
        actions={FORAGING_ACTIONS}
        onActionClick={handleActionClick}
        renderExtra={(action: ForagingZone) => action.enemyChance ? (
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span style={{ color: '#fda4af' }}>⚠ Мобы {action.enemyChance}% за цикл</span>
            {action.enemyPool?.some(e => e.boss) && (
              <span style={{ color: '#fbbf24' }}>Босс возможен</span>
            )}
          </div>
        ) : (
          <div className="text-[11px] font-mono" style={{ color: '#a7f3d0' }}>Безопасный участок</div>
        )}
      />
    </div>
  );
}
