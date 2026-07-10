import React from 'react';
import { SkillHeader } from '@/components/SkillHeader';
import { ActionGrid } from '@/components/ActionGrid';
import { ProgressBar } from '@/components/ProgressBar';
import { FIREMAKING_LOGS } from '@/data/firemaking';
import { useGameStore } from '@/store/gameStore';
import { useBankStore } from '@/store/bankStore';
import { ItemIcon } from '@/components/ItemIcon';

export function FiremakingPage() {
  const { startSkillAction, stopAction, activeSkill, activeActionId, actionProgress } = useGameStore();
  const bankStore = useBankStore();

  const handleActionClick = (actionId: string) => {
    if (activeSkill === 'firemaking' && activeActionId === actionId) {
      stopAction();
    } else {
      startSkillAction('firemaking', actionId);
    }
  };

  const activeLog = FIREMAKING_LOGS.find(l => l.id === activeActionId);
  const isTraining = activeSkill === 'firemaking' && activeLog;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SkillHeader skillId="firemaking" skillName="Firemaking" skillIcon="🔥" />

      {/* Active Action Panel */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[140px] flex flex-col justify-center relative overflow-hidden">
        {isTraining && (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-64 h-32 bg-orange-500/20 blur-3xl rounded-full" />
        )}
        
        {isTraining ? (
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl animate-pulse">🔥</span> Burning {activeLog.name}
                </h3>
                <p className="text-muted-foreground text-sm mt-1 font-mono">
                  {((activeLog.interval) / 1000).toFixed(1)}s per action
                </p>
              </div>
              <button 
                onClick={stopAction}
                className="px-6 py-2 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white font-bold rounded-lg transition-colors"
              >
                Stop Burning
              </button>
            </div>
            
            <ProgressBar value={actionProgress} className="h-8" colorClass="bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
          </div>
        ) : (
          <div className="text-center text-muted-foreground flex flex-col items-center gap-3">
            <div className="text-4xl opacity-50">🪵</div>
            <p className="font-medium">Select a log below to start a fire.</p>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold px-1 mt-8 mb-4">Logs</h2>
      <ActionGrid 
        skillId="firemaking" 
        actions={FIREMAKING_LOGS} 
        onActionClick={handleActionClick}
        renderExtra={(action) => {
          const qty = bankStore.getItemQty(action.logId);
          const hasEnough = qty >= 1;
          return (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <ItemIcon itemId={action.logId} size="sm" />
                <span className={`text-xs font-mono font-bold ${hasEnough ? 'text-foreground' : 'text-destructive'}`}>
                  {qty} / 1
                </span>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}