import React from 'react';
import { SkillHeader } from '@/components/SkillHeader';
import { ActionGrid } from '@/components/ActionGrid';
import { ActionProgressBar } from '@/components/ActionProgressBar';
import { COOKING_RECIPES, COOKING_RECIPES_MAP } from '@/data/cooking';
import { useGameStore } from '@/store/gameStore';
import { useBankStore } from '@/store/bankStore';
import { ItemIcon } from '@/components/ItemIcon';
import { usePlayerStore } from '@/store/playerStore';
import { calcBurnChance } from '@/gameEngine/formulas';
import { useTranslation } from '@/hooks/useTranslation';

export function CookingPage() {
  const { t } = useTranslation();
  
  // Селекторы: компонент перерисовывается ТОЛЬКО при изменении этих значений
  const startSkillAction = useGameStore(s => s.startSkillAction);
  const stopAction = useGameStore(s => s.stopAction);
  const activeSkill = useGameStore(s => s.activeSkill);
  const activeActionId = useGameStore(s => s.activeActionId);
  
  // Подписка только на items, а не на весь bankStore
  const bankItems = useBankStore(s => s.items);
  
  const playerLevel = usePlayerStore(s => s.skills.cooking?.level ?? 1);

  const handleActionClick = (actionId: string) => {
    if (activeSkill === 'cooking' && activeActionId === actionId) {
      stopAction();
    } else {
      startSkillAction('cooking', actionId);
    }
  };

  // O(1) lookup вместо COOKING_RECIPES.find() — быстрее
  const activeRecipe = activeActionId ? COOKING_RECIPES_MAP[activeActionId] : undefined;
  const isTraining = activeSkill === 'cooking' && !!activeRecipe;

  // Локальная функция для получения количества предмета из банка
  const getItemQty = (itemId: string): number => {
    return bankItems.find(s => s.itemId === itemId)?.quantity ?? 0;
  };

  return (
    <div className="space-y-4">
      <SkillHeader skillId="cooking" skillName={t('skill.cooking')} skillIcon="🍳" />

      {/* Active Action Panel */}
      <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-sm">
        {isTraining && activeRecipe ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-xl">🍳</span> {t('cooking.cooking')} {activeRecipe.name}
                </h3>
                <div className="text-muted-foreground text-sm font-mono flex flex-wrap items-center gap-x-4 mt-0.5">
                  <span>{(activeRecipe.interval / 1000).toFixed(1)}{t('ui.seconds.abbr')} {t('ui.per.action')}</span>
                  <span className="text-amber-500">
                    {t('cooking.burns')}: {(calcBurnChance(playerLevel, activeRecipe.levelRequired, activeRecipe.burnChanceBase ?? 0.3) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <button
                onClick={stopAction}
                className="shrink-0 w-full sm:w-auto px-5 py-2.5 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white font-bold rounded-xl transition-all text-sm"
              >
                {t('cooking.stop')}
              </button>
            </div>
            <ActionProgressBar height="h-5" color="amber" />
          </div>
        ) : (
          <div className="text-center text-muted-foreground flex flex-col items-center gap-2 py-4">
            <div className="text-4xl opacity-40">🔥</div>
            <p className="text-sm font-medium">{t('cooking.selectRecipe')}</p>
          </div>
        )}
      </div>

      <h2 className="text-base font-black uppercase tracking-widest text-muted-foreground px-1">{t('cooking.availableRecipes')}</h2>
      <ActionGrid
        skillId="cooking"
        actions={COOKING_RECIPES}
        onActionClick={handleActionClick}
        renderExtra={(action) => {
          const qty = getItemQty(action.rawItemId);
          const hasEnough = qty >= 1;
          const burnChance = calcBurnChance(playerLevel, action.levelRequired, action.burnChanceBase ?? 0.3);
          return (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <ItemIcon itemId={action.rawItemId} size="sm" />
                <span className={`text-xs font-mono font-bold ${hasEnough ? 'text-foreground' : 'text-destructive'}`}>
                  {qty} / 1
                </span>
              </div>
              <div className="text-xs text-amber-500 font-mono">
                {playerLevel >= action.levelRequired ? `${(burnChance * 100).toFixed(0)}% burn` : ''}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
