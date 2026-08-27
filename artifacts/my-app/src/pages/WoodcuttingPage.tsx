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
      <div className={`rounded-3xl p-4 sm:p-5 relative overflow-hidden transition-all border ${
        isTraining 
          ? 'bg-gradient-to-b from-emerald-950/40 via-[#1f2b3e] to-[#172232] border-emerald-500/80 shadow-[0_0_24px_rgba(16,185,129,0.3)]' 
          : 'bg-[#1f2b3e] border-[#344562]'
      }`}>
        {isTraining && activeTree ? (
          <div className="space-y-3.5 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-2xl shadow-inner shrink-0 animate-pulse">
                  🪓
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span>{t('woodcutting.chopping')}</span>
                    <span className="text-emerald-300 font-extrabold">{activeTree.name}</span>
                  </h3>
                  <p className="text-slate-300 text-xs font-mono mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{(activeTree.interval / 1000).toFixed(1)} сек. за действие</span>
                  </p>
                </div>
              </div>

              <button
                onClick={stopAction}
                className="shrink-0 px-5 py-2.5 bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white border border-red-500/40 font-bold rounded-2xl transition-all text-xs active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
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
          <div className="text-center text-slate-300 flex flex-col items-center gap-2 py-6">
            <div className="w-12 h-12 rounded-2xl bg-[#162030] border border-[#2d3d56] flex items-center justify-center text-2xl">
              🌲
            </div>
            <p className="text-xs font-medium text-slate-300">{t('woodcutting.selectTree')}</p>
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
