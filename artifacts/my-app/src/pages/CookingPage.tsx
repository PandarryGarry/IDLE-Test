import React from 'react';
import { SkillHeader } from '@/components/SkillHeader';
import { ActionGrid } from '@/components/ActionGrid';
import { ProgressBar } from '@/components/ProgressBar';
import { COOKING_RECIPES } from '@/data/cooking';
import { useGameStore } from '@/store/gameStore';
import { useBankStore } from '@/store/bankStore';
import { getItem } from '@/data/items';
import { ItemIcon } from '@/components/ItemIcon';
import { usePlayerStore } from '@/store/playerStore';
import { calcBurnChance } from '@/gameEngine/formulas';

export function CookingPage() {
  const { startSkillAction, stopAction, activeSkill, activeActionId, actionProgress } = useGameStore();
  const bankStore = useBankStore();
  const playerLevel = usePlayerStore(s => s.skills.cooking?.level ?? 1);

  const handleActionClick = (actionId: string) => {
    if (activeSkill === 'cooking' && activeActionId === actionId) {
      stopAction();
    } else {
      startSkillAction('cooking', actionId);
    }
  };

  const activeRecipe = COOKING_RECIPES.find(r => r.id === activeActionId);
  const isTraining = activeSkill === 'cooking' && activeRecipe;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SkillHeader skillId="cooking" skillName="Cooking" skillIcon="🍳" />

      {/* Active Action Panel */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[140px] flex flex-col justify-center">
        {isTraining ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🍳</span> Cooking {activeRecipe.name}
                </h3>
                <div className="text-muted-foreground text-sm mt-1 font-mono flex items-center gap-4">
                  <span>{((activeRecipe.interval) / 1000).toFixed(1)}s per action</span>
                  <span className="text-amber-500">Burn Chance: {(calcBurnChance(playerLevel, activeRecipe.levelRequired, activeRecipe.burnChanceBase ?? 0.3) * 100).toFixed(1)}%</span>
                </div>
              </div>
              <button 
                onClick={stopAction}
                className="px-6 py-2 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white font-bold rounded-lg transition-colors"
              >
                Stop Cooking
              </button>
            </div>
            
            <ProgressBar value={actionProgress} className="h-8" colorClass="bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          </div>
        ) : (
          <div className="text-center text-muted-foreground flex flex-col items-center gap-3">
            <div className="text-4xl opacity-50">🔥</div>
            <p className="font-medium">Select a recipe below to start cooking.</p>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold px-1 mt-8 mb-4">Recipes</h2>
      <ActionGrid 
        skillId="cooking" 
        actions={COOKING_RECIPES} 
        onActionClick={handleActionClick}
        renderExtra={(action) => {
          const qty = bankStore.getItemQty(action.rawItemId);
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