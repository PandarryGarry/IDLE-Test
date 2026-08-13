import React, { useState } from 'react';
import { SkillHeader } from '@/components/SkillHeader';
import { ActionGrid } from '@/components/ActionGrid';
import { ActionProgressBar } from '@/components/ActionProgressBar';
import { SMELTING_RECIPES, SMITHING_RECIPES, SMITHING_MAP } from '@/data/smithing';
import { useGameStore } from '@/store/gameStore';
import { useBankStore } from '@/store/bankStore';
import { ItemIcon } from '@/components/ItemIcon';
import { useTranslation } from '@/hooks/useTranslation';

export function SmithingPage() {
  const { t } = useTranslation();
  
  // Селекторы: компонент перерисовывается ТОЛЬКО при изменении этих значений
  const startSkillAction = useGameStore(s => s.startSkillAction);
  const stopAction = useGameStore(s => s.stopAction);
  const activeSkill = useGameStore(s => s.activeSkill);
  const activeActionId = useGameStore(s => s.activeActionId);
  
  // Подписка только на items, а не на весь bankStore
  const bankItems = useBankStore(s => s.items);
  
  const [tab, setTab] = useState<'smelting' | 'equipment'>('smelting');

  const handleActionClick = (actionId: string) => {
    if (activeSkill === 'smithing' && activeActionId === actionId) {
      stopAction();
    } else {
      startSkillAction('smithing', actionId);
    }
  };

  // O(1) lookup вместо allRecipes.find() — быстрее
  const activeRecipe = activeActionId ? SMITHING_MAP[activeActionId] : undefined;
  const isTraining = activeSkill === 'smithing' && !!activeRecipe;
  const currentList = tab === 'smelting' ? SMELTING_RECIPES : SMITHING_RECIPES;

  // Локальная функция для получения количества предмета из банка
  const getItemQty = (itemId: string): number => {
    return bankItems.find(s => s.itemId === itemId)?.quantity ?? 0;
  };

  return (
    <div className="space-y-4">
      <SkillHeader skillId="smithing" skillName={t('skill.smithing')} skillIcon="🔨" />

      {/* Active Action Panel */}
      <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-sm">
        {isTraining && activeRecipe ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-xl">🔨</span> {t('smithing.smithing')} {activeRecipe.name}
                </h3>
                <p className="text-muted-foreground text-sm font-mono mt-0.5">
                  {(activeRecipe.interval / 1000).toFixed(1)}{t('ui.seconds.abbr')} {t('ui.per.action')}
                </p>
              </div>
              <button
                onClick={stopAction}
                className="shrink-0 w-full sm:w-auto px-5 py-2.5 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white font-bold rounded-xl transition-all text-sm"
              >
                {t('smithing.stop')}
              </button>
            </div>
            <ActionProgressBar height="h-5" color="green" />
          </div>
        ) : (
          <div className="text-center text-muted-foreground flex flex-col items-center gap-2 py-4">
            <div className="text-4xl opacity-40">⚒️</div>
            <p className="text-sm font-medium">{t('smithing.selectRecipe')}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('smelting')}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            tab === 'smelting' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('smithing.smelting')}
        </button>
        <button
          onClick={() => setTab('equipment')}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            tab === 'equipment' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('smithing.equipment')}
        </button>
      </div>

      <ActionGrid
        skillId="smithing"
        actions={currentList}
        onActionClick={handleActionClick}
        renderExtra={(action) => (
          <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-border/50">
            <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">{t('smithing.ingredients')}:</span>
            <div className="flex flex-wrap gap-2">
              {action.ingredients.map((ing: any, i: number) => {
                const qty = getItemQty(ing.itemId);
                const hasEnough = qty >= ing.quantity;
                return (
                  <div key={i} className="flex items-center gap-1 bg-background px-1.5 py-1 rounded border border-border">
                    <ItemIcon itemId={ing.itemId} size="sm" />
                    <span className={`text-xs font-mono font-bold ${hasEnough ? 'text-foreground' : 'text-destructive'}`}>
                      {qty}/{ing.quantity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      />
    </div>
  );
}
