import { useGameStore } from '@/store/gameStore';
import { TREES, WOODCUTTING_TREES_MAP } from '@/data/woodcutting';
import { SkillHeader } from '@/components/SkillHeader';
import { ActionProgressBar } from '@/components/ActionProgressBar';
import { ActionGrid } from '@/components/ActionGrid';
import { useTranslation } from '@/hooks/useTranslation';

export function WoodcuttingPage() {
  const { t } = useTranslation();
  
  // Селекторы: компонент перерисовывается ТОЛЬКО при изменении этих значений,
  // а не при каждом тике gameStore (actionProgress обновляется 60 раз/сек)
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

  // O(1) lookup вместо TREES.find() — быстрее
  const activeTree = activeActionId ? WOODCUTTING_TREES_MAP[activeActionId] : undefined;
  const isTraining = activeSkill === 'woodcutting' && !!activeTree;

  return (
    <div className="space-y-4">
      <SkillHeader skillId="woodcutting" skillName={t('skill.woodcutting')} skillIcon="🪓" />

      {/* Active Action Panel */}
      <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-sm">
        {isTraining && activeTree ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-xl">🪓</span> {t('woodcutting.chopping')} {activeTree.name}
                </h3>
                <p className="text-muted-foreground text-sm font-mono mt-0.5">
                  {(activeTree.interval / 1000).toFixed(1)}{t('ui.seconds.abbr')} {t('ui.per.action')}
                </p>
              </div>
              <button
                onClick={stopAction}
                className="shrink-0 w-full sm:w-auto px-5 py-2.5 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white font-bold rounded-xl transition-all text-sm"
              >
                {t('woodcutting.stop')}
              </button>
            </div>
            <ActionProgressBar height="h-5" color="green" />
          </div>
        ) : (
          <div className="text-center text-muted-foreground flex flex-col items-center gap-2 py-4">
            <div className="text-4xl opacity-40">🌲</div>
            <p className="text-sm font-medium">{t('woodcutting.selectTree')}</p>
          </div>
        )}
      </div>

      <h2 className="text-base font-black uppercase tracking-widest text-muted-foreground px-1">{t('woodcutting.availableTrees')}</h2>
      <ActionGrid skillId="woodcutting" actions={TREES} onActionClick={handleActionClick} />
    </div>
  );
}
