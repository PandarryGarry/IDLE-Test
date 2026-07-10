import React from 'react';
import { SkillHeader } from '@/components/SkillHeader';
import { ActionGrid } from '@/components/ActionGrid';
import { ProgressBar } from '@/components/ProgressBar';
import { FISHING_SPOTS } from '@/data/fishing';
import { useGameStore } from '@/store/gameStore';

export function FishingPage() {
  const { startSkillAction, stopAction, activeSkill, activeActionId, actionProgress } = useGameStore();

  const handleActionClick = (actionId: string) => {
    if (activeSkill === 'fishing' && activeActionId === actionId) {
      stopAction();
    } else {
      startSkillAction('fishing', actionId);
    }
  };

  const activeSpot = FISHING_SPOTS.find(s => s.id === activeActionId);
  const isTraining = activeSkill === 'fishing' && activeSpot;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SkillHeader skillId="fishing" skillName="Fishing" skillIcon="🎣" />

      {/* Active Action Panel */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[140px] flex flex-col justify-center">
        {isTraining ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🎣</span> Fishing {activeSpot.name}
                </h3>
                <p className="text-muted-foreground text-sm mt-1 font-mono">
                  {((activeSpot.interval) / 1000).toFixed(1)}s per action
                </p>
              </div>
              <button 
                onClick={stopAction}
                className="px-6 py-2 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white font-bold rounded-lg transition-colors"
              >
                Stop Fishing
              </button>
            </div>
            
            <ProgressBar value={actionProgress} className="h-8 color-blue-500" colorClass="bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          </div>
        ) : (
          <div className="text-center text-muted-foreground flex flex-col items-center gap-3">
            <div className="text-4xl opacity-50">🌊</div>
            <p className="font-medium">Select a fishing spot below to start fishing.</p>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold px-1 mt-8 mb-4">Fishing Spots</h2>
      <ActionGrid 
        skillId="fishing" 
        actions={FISHING_SPOTS} 
        onActionClick={handleActionClick} 
      />
    </div>
  );
}