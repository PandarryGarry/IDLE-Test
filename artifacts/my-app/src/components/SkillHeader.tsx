import React from 'react';
import { SkillId } from '@/data/types';
import { usePlayerStore } from '@/store/playerStore';
import { ProgressBar } from './ProgressBar';
import { getLevelProgress, getXpForLevel, getLevelForXp } from '@/gameEngine/xpTable';
import { useGameStore } from '@/store/gameStore';
import { formatNumber } from '@/lib/utils';

interface SkillHeaderProps {
  skillId: SkillId;
  skillName: string;
  skillIcon: string;
}

export function SkillHeader({ skillId, skillName, skillIcon }: SkillHeaderProps) {
  const xp = usePlayerStore(s => s.skills[skillId]?.xp ?? 0);
  const level = usePlayerStore(s => s.skills[skillId]?.level ?? 1);
  const xpGainedSession = useGameStore(s => s.xpGainedThisSession[skillId] ?? 0);
  const sessionStartTime = useGameStore(s => s.sessionStartTime);
  
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  const xpIntoLevel = Math.max(0, xp - currentLevelXp);
  const xpRequiredForLevel = Math.max(1, nextLevelXp - currentLevelXp);
  const progress = level >= 99 ? 1 : xpIntoLevel / xpRequiredForLevel;
  
  // Calculate rolling XP/hr for session
  const elapsedMs = Date.now() - sessionStartTime;
  const xpPerHour = elapsedMs > 0 ? (xpGainedSession / elapsedMs) * 3_600_000 : 0;

  return (
    <div className="bg-card border border-border p-6 rounded-xl flex flex-col gap-4 mb-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center text-4xl border border-border shadow-inner">
          {skillIcon}
        </div>
        <div className="flex-grow">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{skillName}</h1>
          <div className="text-muted-foreground flex gap-4 mt-1 font-mono text-sm">
            <span>XP: <span className="text-amber-400">{formatNumber(Math.floor(xp))}</span></span>
            {xpPerHour > 0 && <span><span className="text-amber-400">{formatNumber(Math.floor(xpPerHour))}</span> XP/hr</span>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black text-primary drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">{level}</div>
          <div className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Level</div>
        </div>
      </div>
      
      <div className="space-y-1">
        <ProgressBar 
          value={progress} 
          label={level >= 99 ? 'MAX LEVEL' : `${formatNumber(Math.floor(xpIntoLevel))} / ${formatNumber(Math.floor(xpRequiredForLevel))} XP`} 
          className="h-5"
        />
      </div>
    </div>
  );
}