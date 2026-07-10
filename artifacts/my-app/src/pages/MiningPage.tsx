import React from 'react';
import { SkillHeader } from '@/components/SkillHeader';
import { ActionGrid } from '@/components/ActionGrid';
import { ProgressBar } from '@/components/ProgressBar';
import { ROCKS } from '@/data/mining';
import { useGameStore } from '@/store/gameStore';

export function MiningPage() {
  const { startSkillAction, stopAction, activeSkill, activeActionId, actionProgress } = useGameStore();

  const handleActionClick = (actionId: string) => {
    if (activeSkill === 'mining' && activeActionId === actionId) {
      stopAction();
    } else {
      startSkillAction('mining', actionId);
    }
  };

  const activeRock = ROCKS.find(r => r.id === activeActionId);
  const isTraining = activeSkill === 'mining' && activeRock;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SkillHeader skillId="mining" skillName="Mining" skillIcon="⛏️" />

      {/* Active Action Panel */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[140px] flex flex-col justify-center">
        {isTraining ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">⛏️</span> Mining {activeRock.name}
                </h3>
                <p className="text-muted-foreground text-sm mt-1 font-mono">
                  {((activeRock.interval) / 1000).toFixed(1)}s per action
                </p>
              </div>
              <button 
                onClick={stopAction}
                className="px-6 py-2 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white font-bold rounded-lg transition-colors"
              >
                Stop Mining
              </button>
            </div>
            
            <ProgressBar value={actionProgress} className="h-8" />
          </div>
        ) : (
          <div className="text-center text-muted-foreground flex flex-col items-center gap-3">
            <div className="text-4xl opacity-50">🪨</div>
            <p className="font-medium">Select a rock below to start mining.</p>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold px-1 mt-8 mb-4">Available Rocks</h2>
      <ActionGrid 
        skillId="mining" 
        actions={ROCKS} 
        onActionClick={handleActionClick}
        renderExtra={(action) => action.gemChance ? (
          <div className="flex justify-between text-xs mt-1 text-primary">
            <span>Gem Chance:</span>
            <span>{(action.gemChance * 100).toFixed(1)}%</span>
          </div>
        ) : null}
      />
    </div>
  );
}