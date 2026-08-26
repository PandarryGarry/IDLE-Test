import { useGameStore } from '@/store/gameStore';
import { TREES, WOODCUTTING_TREES_MAP } from '@/data/woodcutting';
import { SkillHeader } from '@/components/SkillHeader';
import { ActionProgressBar } from '@/components/ActionProgressBar';
import { ActionGrid } from '@/components/ActionGrid';
import { useTranslation } from '@/hooks/useTranslation';
import { Square, Trees, Clock, Sparkles } from 'lucide-react';

export function WoodcuttingPage() {
  const { t } = useTranslation();
  
  const startSkillAction = useGameStore(s => s.startSkillAction);
  const stopAction = useGameStore(s => s.stopAction);
  const activeSkill = useGameStore(s => s.activeSkill);
  const activeActionId = useGameStore(s => s.activeActionId);

  const handleActionClick = (actionId: string) => {
    if (activeSkill === 'woodcutting' && activeActionId === actionId) {
      stopAction();
    } else {
      startSkillAction('woodcutting', actionId);
    }
  };

  const activeTree = activeActionId ? WOODCUTTING_TREES_MAP[activeActionId] : undefined;
  const isTraining = activeSkill === 'woodcutting' && !!activeTree;

  return (
    <div className="space-y-4">
      <SkillHeader skillId="woodcutting" skillName={t('skill.woodcutting')} skillIcon="🪓" />

      {/* Active Action Panel */}
      <div className={`fantasy-card rounded-3xl p-4 sm:p-5 relative overflow-hidden transition-all ${
        isTraining ? 'fantasy-card-active border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.2)]' : 'border-slate-800'
      }`}>
        {isTraining && activeTree ? (
          <div className="space-y-3.5 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl shadow-inner shrink-0 animate-pulse">
                  🪓
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span>{t('woodcutting.chopping')}</span>
                    <span className="text-emerald-400 font-extrabold">{activeTree.name}</span>
                  </h3>
                  <p className="text-slate-400 text-xs font-mono mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{(activeTree.interval / 1000).toFixed(1)}{t('ui.seconds.abbr')} {t('ui.per.action')}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={stopAction}
                className="shrink-0 px-5 py-2.5 bg-red-500/15 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/40 font-bold rounded-xl transition-all text-xs active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t('woodcutting.stop')}</span>
              </button>
            </div>

            <div className="pt-1">
              <ActionProgressBar height="h-3" color="green" />
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 flex flex-col items-center gap-2 py-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl opacity-60">
              🌲
            </div>
            <p className="text-xs font-medium text-slate-400">{t('woodcutting.selectTree')}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-1 pt-1">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 font-mono flex items-center gap-1.5">
          <span>🌲</span> {t('woodcutting.availableTrees')}
        </h2>
      </div>

      <ActionGrid skillId="woodcutting" actions={TREES} onActionClick={handleActionClick} />
    </div>
  );
}
