import React from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import type { SkillId, SkillState } from '@/data/types';
import { ALL_SKILL_IDS, COMBAT_SKILLS, GATHERING_SKILLS, CRAFTING_SKILLS, OTHER_SKILLS } from '@/data/types';
import { getLevelProgress, getXpForLevel } from '@/gameEngine/xpTable';
import { formatNumber, formatDuration } from '@/lib/utils';
import { Link } from 'wouter';

const SKILL_ICONS: Record<string, string> = {
  attack: '⚔️', strength: '💪', defence: '🛡️', hitpoints: '❤️',
  ranged: '🏹', magic: '🧙', prayer: '🙏', slayer: '💀',
  woodcutting: '🪓', fishing: '🎣', mining: '⛏️',
  firemaking: '🔥', cooking: '🍳', smithing: '🔨', fletching: '🏹', crafting: '✂️', runecrafting: '📿', herblore: '🌿',
  farming: '🌱', agility: '🏃', thieving: '🤫', summoning: '📜', astrology: '⭐', township: '🏘️'
};

const SKILL_LINKS: Record<string, string> = {
  woodcutting: '/woodcutting', mining: '/mining', fishing: '/fishing',
  cooking: '/cooking', smithing: '/smithing', firemaking: '/firemaking',
  attack: '/combat', strength: '/combat', defence: '/combat', hitpoints: '/combat',
  ranged: '/combat', magic: '/combat', prayer: '/combat', slayer: '/combat',
};

function CircularProgress({ progress, level, icon, isActive }: { progress: number, level: number, icon: string, isActive: boolean }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center group">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40" cy="40" r={radius}
          className="stroke-muted fill-none"
          strokeWidth="6"
        />
        <circle
          cx="40" cy="40" r={radius}
          className={`fill-none transition-all duration-300 ${isActive ? 'stroke-primary shadow-[0_0_10px_rgba(34,197,94,1)]' : 'stroke-primary/50'}`}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl border-2 z-10 transition-colors ${
        isActive ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-background border-border group-hover:border-primary/50'
      }`}>
        {icon}
      </div>
      <div className="absolute -bottom-2 bg-background border border-border px-2 py-0.5 rounded-full text-xs font-mono font-bold z-20">
        {level}
      </div>
    </div>
  );
}

function SkillCard({ skillId }: { skillId: string }) {
  const state = usePlayerStore(s => s.skills[skillId as SkillId]);
  const activeSkill = useGameStore(s => s.activeSkill);
  
  if (!state) return null;
  
  const isActive = activeSkill === skillId;
  const progress = getLevelProgress(state.xp);
  const linkPath = SKILL_LINKS[skillId] || '/';
  
  return (
    <Link href={linkPath} className="block">
      <div className={`bg-card border rounded-xl p-4 flex flex-col items-center gap-3 transition-all hover:-translate-y-1 hover:shadow-md ${
        isActive ? 'border-primary ring-1 ring-primary/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-border hover:border-primary/50'
      }`}>
        <CircularProgress progress={progress} level={state.level} icon={SKILL_ICONS[skillId] || '❓'} isActive={isActive} />
        <span className="font-bold text-sm tracking-wide capitalize text-foreground/90">{skillId}</span>
      </div>
    </Link>
  );
}

export function DashboardPage() {
  const combatLevel = usePlayerStore(s => s.combatLevel);
  const gameMode = useGameStore(s => s.gameMode);
  const totalPlayTime = useGameStore(s => s.totalPlayTime);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Stats */}
      <div className="bg-card border border-border p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <span className="text-4xl">👋</span> Welcome Back
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Continue your adventure in the dark realms.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-background border border-border rounded-xl p-4 min-w-[140px] shadow-inner">
            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Combat Level</div>
            <div className="text-3xl font-black text-destructive font-mono">{combatLevel}</div>
          </div>
          <div className="bg-background border border-border rounded-xl p-4 min-w-[140px] shadow-inner">
            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Play Time</div>
            <div className="text-2xl font-black text-primary font-mono pt-1">{formatDuration(totalPlayTime)}</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 px-1">
            <span className="text-red-500">⚔️</span> Combat
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {COMBAT_SKILLS.map(id => <SkillCard key={id} skillId={id} />)}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 px-1">
            <span className="text-green-500">🌲</span> Gathering
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {GATHERING_SKILLS.map(id => <SkillCard key={id} skillId={id} />)}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 px-1">
            <span className="text-amber-500">⚒️</span> Artisan
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {CRAFTING_SKILLS.map(id => <SkillCard key={id} skillId={id} />)}
          </div>
        </div>
      </div>
    </div>
  );
}