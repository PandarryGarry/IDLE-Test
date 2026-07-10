import React from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { SkillId } from '@/data/types';
import { formatNumber, xpPerHour } from '@/lib/utils';
import { getLevelForXp, getLevelProgress } from '@/gameEngine/xpTable';
import { ProgressBar } from './ProgressBar';

interface ActionGridProps {
  skillId: SkillId;
  actions: any[];
  onActionClick: (actionId: string) => void;
  renderExtra?: (action: any) => React.ReactNode;
}

export function ActionGrid({ skillId, actions, onActionClick, renderExtra }: ActionGridProps) {
  const playerLevel = usePlayerStore(s => s.skills[skillId]?.level ?? 1);
  const mastery = usePlayerStore(s => s.skills[skillId]?.mastery ?? {});
  const activeActionId = useGameStore(s => s.activeActionId);
  const activeSkill = useGameStore(s => s.activeSkill);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {actions.map(action => {
        const isLocked = playerLevel < action.levelRequired;
        const isActive = activeSkill === skillId && activeActionId === action.id;
        const masteryXp = mastery[action.id] ?? 0;
        const masteryLevel = getLevelForXp(masteryXp);
        const masteryProgress = getLevelProgress(masteryXp);
        
        return (
          <div 
            key={action.id} 
            className={`relative flex flex-col p-5 rounded-xl border transition-all overflow-hidden ${
              isLocked 
                ? 'bg-card/50 border-border/50 opacity-60 grayscale cursor-not-allowed' 
                : isActive 
                  ? 'bg-card border-primary shadow-[0_0_15px_rgba(34,197,94,0.15)] ring-1 ring-primary/50' 
                  : 'bg-card border-border hover:border-primary/50 cursor-pointer hover:bg-accent/50'
            }`}
            onClick={() => !isLocked && onActionClick(action.id)}
          >
            {isActive && (
              <div className="absolute top-0 right-0 w-2 h-full bg-primary shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
            )}
            
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg leading-tight">{action.name}</h3>
              {isLocked ? (
                <span className="text-destructive text-xs font-bold bg-destructive/10 px-2 py-1 rounded">🔒 Lvl {action.levelRequired}</span>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-bold text-primary flex items-center gap-1" title="Mastery Level">
                    ✨ {masteryLevel}
                  </span>
                </div>
              )}
            </div>
            
            {!isLocked && (
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden mb-4 opacity-50" title={`Mastery to next level: ${(masteryProgress*100).toFixed(1)}%`}>
                <div className="h-full bg-primary" style={{ width: `${masteryProgress * 100}%` }} />
              </div>
            )}
            
            <div className="space-y-1.5 text-sm text-muted-foreground flex-grow">
              <div className="flex justify-between">
                <span>Experience:</span>
                <span className="text-amber-400 font-mono font-medium">{action.xp}</span>
              </div>
              <div className="flex justify-between">
                <span>Interval:</span>
                <span className="font-mono text-foreground">{(action.interval / 1000).toFixed(1)}s</span>
              </div>
              <div className="flex justify-between">
                <span>Rate:</span>
                <span className="font-mono">{xpPerHour(action.xp, action.interval)}</span>
              </div>
              {renderExtra && (
                <div className="pt-2 mt-2 border-t border-border/50">
                  {renderExtra(action)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}