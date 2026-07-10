import React, { useState } from 'react';
import { SkillHeader } from '@/components/SkillHeader';
import { ActionGrid } from '@/components/ActionGrid';
import { ProgressBar } from '@/components/ProgressBar';
import { SMELTING_RECIPES, SMITHING_RECIPES } from '@/data/smithing';
import { useGameStore } from '@/store/gameStore';
import { useBankStore } from '@/store/bankStore';
import { ItemIcon } from '@/components/ItemIcon';

export function SmithingPage() {
  const { startSkillAction, stopAction, activeSkill, activeActionId, actionProgress } = useGameStore();
  const bankStore = useBankStore();
  const [tab, setTab] = useState<'smelting' | 'equipment'>('smelting');

  const handleActionClick = (actionId: string) => {
    if (activeSkill === 'smithing' && activeActionId === actionId) {
      stopAction();
    } else {
      startSkillAction('smithing', actionId);
    }
  };

  const allRecipes = [...SMELTING_RECIPES, ...SMITHING_RECIPES];
  const activeRecipe = allRecipes.find(r => r.id === activeActionId);
  const isTraining = activeSkill === 'smithing' && activeRecipe;

  const currentList = tab === 'smelting' ? SMELTING_RECIPES : SMITHING_RECIPES;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SkillHeader skillId="smithing" skillName="Smithing" skillIcon="🔨" />

      {/* Active Action Panel */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[140px] flex flex-col justify-center">
        {isTraining ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🔨</span> Smithing {activeRecipe.name}
                </h3>
                <p className="text-muted-foreground text-sm mt-1 font-mono">
                  {((activeRecipe.interval) / 1000).toFixed(1)}s per action
                </p>
              </div>
              <button 
                onClick={stopAction}
                className="px-6 py-2 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white font-bold rounded-lg transition-colors"
              >
                Stop Smithing
              </button>
            </div>
            
            <ProgressBar value={actionProgress} className="h-8" colorClass="bg-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.5)]" />
          </div>
        ) : (
          <div className="text-center text-muted-foreground flex flex-col items-center gap-3">
            <div className="text-4xl opacity-50">⚒️</div>
            <p className="font-medium">Select a recipe below to start smithing.</p>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-8 mb-4">
        <button 
          onClick={() => setTab('smelting')}
          className={`px-4 py-2 rounded-lg font-bold transition-colors ${tab === 'smelting' ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground hover:text-foreground'}`}
        >
          Smelting (Bars)
        </button>
        <button 
          onClick={() => setTab('equipment')}
          className={`px-4 py-2 rounded-lg font-bold transition-colors ${tab === 'equipment' ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground hover:text-foreground'}`}
        >
          Smithing (Equipment)
        </button>
      </div>

      <ActionGrid 
        skillId="smithing" 
        actions={currentList} 
        onActionClick={handleActionClick}
        renderExtra={(action) => {
          return (
            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Requires:</span>
              <div className="flex flex-wrap gap-3">
                {action.ingredients.map((ing: any, i: number) => {
                  const qty = bankStore.getItemQty(ing.itemId);
                  const hasEnough = qty >= ing.quantity;
                  return (
                    <div key={i} className="flex items-center gap-1.5 bg-background p-1.5 rounded border border-border">
                      <ItemIcon itemId={ing.itemId} size="sm" />
                      <span className={`text-xs font-mono font-bold ${hasEnough ? 'text-foreground' : 'text-destructive'}`}>
                        {qty} / {ing.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}