import React, { memo } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import type { SkillId } from '@/data/types';
import { COMBAT_SKILLS, GATHERING_SKILLS, CRAFTING_SKILLS } from '@/data/types';
import { getLevelProgress } from '@/gameEngine/xpTable';
import { formatDuration } from '@/lib/utils';
import { Link } from 'wouter';
import { useTranslation } from '@/hooks/useTranslation';

const SKILL_ICONS: Record<string, string> = {
  attack: '⚔️', strength: '💪', defence: '🛡️', hitpoints: '❤️',
  ranged: '🏹', magic: '🧙', prayer: '🙏', slayer: '💀',
  woodcutting: '🪓', fishing: '🎣', mining: '⛏️',
  firemaking: '🔥', cooking: '🍳', smithing: '🔨',
  fletching: '🏹', crafting: '✂️', runecrafting: '📿', herblore: '🌿',
  farming: '🌱', agility: '🏃', thieving: '🤫', summoning: '📜',
  astrology: '⭐', township: '🏘️',
};

const SKILL_LINKS: Record<string, string> = {
  woodcutting: '/woodcutting', mining: '/mining', fishing: '/fishing',
  cooking: '/cooking', smithing: '/smithing', firemaking: '/firemaking',
  attack: '/combat', strength: '/combat', defence: '/combat', hitpoints: '/combat',
  ranged: '/combat', magic: '/combat', prayer: '/combat', slayer: '/combat',
};

function CircularProgress({ progress, level, icon, isActive }: {
  progress: number; level: number; icon: string; isActive: boolean;
}) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  return (
    <div className="relative w-16 h-16 md:w-18 md:h-18 flex items-center justify-center group">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} className="stroke-muted fill-none" strokeWidth="5" />
        <circle
          cx="36" cy="36" r={radius}
          className={`fill-none transition-all duration-300 ${isActive ? 'stroke-primary' : 'stroke-primary/40'}`}
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-2xl border-2 z-10 transition-all ${
        isActive
          ? 'bg-primary/20 border-primary shadow-[0_0_12px_rgba(34,197,94,0.35)]'
          : 'bg-background border-border group-hover:border-primary/40'
      }`}>
        {icon}
      </div>
      <div className="absolute -bottom-2 bg-background border border-border px-1.5 py-0 rounded-full text-[10px] font-mono font-black z-20 leading-5">
        {level}
      </div>
    </div>
  );
}

// Обёрнут в memo для избежания лишних ре-рендеров
const SkillCard = memo(function SkillCard({ skillId }: { skillId: string }) {
  const state = usePlayerStore(s => s.skills[skillId as SkillId]);
  const activeSkill = useGameStore(s => s.activeSkill);
  if (!state) return null;

  const isActive = activeSkill === skillId;
  const progress = getLevelProgress(state.xp);
  const linkPath = SKILL_LINKS[skillId] || '/';

  return (
    <Link href={linkPath} className="block">
      <div className={`bg-card border rounded-xl p-2.5 flex flex-col items-center gap-2 transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md ${
        isActive
          ? 'border-primary ring-1 ring-primary/40 shadow-[0_0_12px_rgba(34,197,94,0.08)]'
          : 'border-border hover:border-primary/40'
      }`}>
        <CircularProgress progress={progress} level={state.level} icon={SKILL_ICONS[skillId] || '❓'} isActive={isActive} />
        <span className="font-bold text-[11px] tracking-wide capitalize text-foreground/80 text-center leading-tight">{skillId}</span>
      </div>
    </Link>
  );
});

export function DashboardPage() {
  const { t } = useTranslation();
  const combatLevel = usePlayerStore(s => s.combatLevel);
  const totalPlayTime = useGameStore(s => s.totalPlayTime);

  return (
    <div className="space-y-5">
      {/* Hero Stats */}
      <div className="bg-card border border-border p-4 md:p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">{t('dashboard.welcome')}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">{t('dashboard.subtitle')}</p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none bg-background border border-border rounded-xl p-3 md:p-4 min-w-[110px] shadow-inner text-center">
            <div className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{t('dashboard.combatLevel')}</div>
            <div className="text-3xl font-black text-destructive font-mono">{combatLevel}</div>
          </div>
          <div className="flex-1 sm:flex-none bg-background border border-border rounded-xl p-3 md:p-4 min-w-[110px] shadow-inner text-center">
            <div className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{t('dashboard.playTime')}</div>
            <div className="text-xl font-black text-primary font-mono pt-0.5">{formatDuration(totalPlayTime)}</div>
          </div>
        </div>
      </div>

      {/* Skill groups */}
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-3 px-0.5 flex items-center gap-1.5">
          <span className="text-red-500">⚔️</span> {t('group.combat')}
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3">
          {COMBAT_SKILLS.map(id => <SkillCard key={id} skillId={id} />)}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-3 px-0.5 flex items-center gap-1.5">
          <span className="text-green-500">🌲</span> {t('group.gathering')}
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3">
          {GATHERING_SKILLS.map(id => <SkillCard key={id} skillId={id} />)}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-3 px-0.5 flex items-center gap-1.5">
          <span className="text-amber-500">⚒️</span> {t('group.artisan')}
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3">
          {CRAFTING_SKILLS.map(id => <SkillCard key={id} skillId={id} />)}
        </div>
      </div>
    </div>
  );
}
