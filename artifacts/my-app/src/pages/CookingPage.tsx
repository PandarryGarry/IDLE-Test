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
import { Square, ChefHat, Clock, Flame, AlertTriangle } from 'lucide-react';

export function CookingPage() {
  const { t } = useTranslation();
  
  const startSkillAction = useGameStore(s => s.startSkillAction);
  const stopAction = useGameStore(s => s.stopAction);
  const activeSkill = useGameStore(s => s.activeSkill);
  const activeActionId = useGameStore(s => s.activeActionId);
  
  const bankItems = useBankStore(s => s.items);
  const playerLevel = usePlayerStore(s => s.skills.cooking?.level ?? 1);

  const handleActionClick = (actionId: string) => {
    if (activeSkill === 'cooking' && activeActionId === actionId) {
      stopAction();
    } else {
      startSkillAction('cooking', actionId);
    }
  };

  const activeRecipe = activeActionId ? COOKING_RECIPES_MAP[activeActionId] : undefined;
  const isTraining = activeSkill === 'cooking' && !!activeRecipe;

  const getItemQty = (itemId: string): number => {
    return bankItems.find(s => s.itemId === itemId)?.quantity ?? 0;
  };

  return (
    <div className="space-y-4">
      <SkillHeader skillId="cooking" skillName={t('skill.cooking')} skillIcon="🍳" />

      {/* Active Action Panel */}
      <div className={`fantasy-card rounded-3xl p-4 sm:p-5 relative overflow-hidden transition-all ${
        isTraining ? 'fantasy-card-active border-yellow-500/50 shadow-[0_0_25px_rgba(234,179,8,0.2)]' : 'border-slate-800'
      }`}>
        {isTraining && activeRecipe ? (
          <div className="space-y-3.5 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-2xl shadow-inner shrink-0 animate-pulse">
                  🍳
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span>{t('cooking.cooking')}</span>
                    <span className="text-yellow-400 font-extrabold">{activeRecipe.name}</span>
                  </h3>
                  <div className="text-slate-400 text-xs font-mono flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-yellow-400" />
                      {(activeRecipe.interval / 1000).toFixed(1)}{t('ui.seconds.abbr')} {t('ui.per.action')}
                    </span>
                    <span className="text-amber-400 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      {t('cooking.burns')}: {(calcBurnChance(playerLevel, activeRecipe.levelRequired, activeRecipe.burnChanceBase ?? 0.3) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={stopAction}
                className="shrink-0 px-5 py-2.5 bg-red-500/15 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/40 font-bold rounded-xl transition-all text-xs active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t('cooking.stop')}</span>
              </button>
            </div>

            <div className="pt-1">
              <ActionProgressBar height="h-3" color="amber" />
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 flex flex-col items-center gap-2 py-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl opacity-60">
              🔥
            </div>
            <p className="text-xs font-medium text-slate-400">{t('cooking.selectRecipe')}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-1 pt-1">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-yellow-400 font-mono flex items-center gap-1.5">
          <span>🍳</span> {t('cooking.availableRecipes')}
        </h2>
      </div>

      <ActionGrid
        skillId="cooking"
        actions={COOKING_RECIPES}
        onActionClick={handleActionClick}
        renderExtra={(action) => {
          const qty = getItemQty(action.rawItemId);
          const hasEnough = qty >= 1;
          const burnChance = calcBurnChance(playerLevel, action.levelRequired, action.burnChanceBase ?? 0.3);
          return (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                <ItemIcon itemId={action.rawItemId} size="sm" />
                <span className={`text-xs font-mono font-bold ${hasEnough ? 'text-slate-200' : 'text-red-400'}`}>
                  {qty} / 1 in bank
                </span>
              </div>
              <div className="text-xs text-amber-400 font-mono">
                {playerLevel >= action.levelRequired ? `${(burnChance * 100).toFixed(0)}% burn` : ''}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
