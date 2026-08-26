import React, { useState, memo } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { useCombatStore } from '@/store/combatStore';
import { useBankStore } from '@/store/bankStore';
import type { SkillId } from '@/data/types';
import { COMBAT_SKILLS, GATHERING_SKILLS, CRAFTING_SKILLS } from '@/data/types';
import { getLevelProgress } from '@/gameEngine/xpTable';
import { formatDuration, formatNumber } from '@/lib/utils';
import { Link } from 'wouter';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Sword, 
  Clock, 
  Sparkles, 
  Shield, 
  Coins, 
  Backpack, 
  TrendingUp, 
  Award,
  ChevronRight,
  Flame,
  Zap,
  Activity
} from 'lucide-react';

const SKILL_ICONS: Record<string, string> = {
  attack: '⚔️', strength: '💪', defence: '🛡️', hitpoints: '❤️',
  ranged: '🏹', magic: '🧙', prayer: '🙏', slayer: '💀',
  woodcutting: '🪓', fishing: '🎣', mining: '⛏️',
  firemaking: '🔥', cooking: '🍳', smithing: '🔨',
  fletching: '🏹', crafting: '✂️', runecrafting: '📿', herblore: '🌿',
  farming: '🌱', agility: '🏃', thieving: '🤫', summoning: '📜',
  astrology: '⭐', township: '🏘️',
};

const SKILL_THEME_COLORS: Record<string, { stroke: string; glow: string; text: string; bg: string }> = {
  attack:      { stroke: 'stroke-rose-500',   glow: 'rgba(244,63,94,0.4)',  text: 'text-rose-400',   bg: 'bg-rose-950/30' },
  strength:    { stroke: 'stroke-red-500',    glow: 'rgba(239,68,68,0.4)',  text: 'text-red-400',    bg: 'bg-red-950/30' },
  defence:     { stroke: 'stroke-blue-500',   glow: 'rgba(59,130,246,0.4)', text: 'text-blue-400',   bg: 'bg-blue-950/30' },
  hitpoints:   { stroke: 'stroke-emerald-500', glow: 'rgba(16,185,129,0.4)',text: 'text-emerald-400',bg: 'bg-emerald-950/30' },
  woodcutting: { stroke: 'stroke-emerald-500', glow: 'rgba(16,185,129,0.4)',text: 'text-emerald-400',bg: 'bg-emerald-950/30' },
  mining:      { stroke: 'stroke-amber-500',   glow: 'rgba(245,158,11,0.4)',  text: 'text-amber-400',  bg: 'bg-amber-950/30' },
  fishing:     { stroke: 'stroke-cyan-500',    glow: 'rgba(6,182,212,0.4)',  text: 'text-cyan-400',   bg: 'bg-cyan-950/30' },
  firemaking:  { stroke: 'stroke-orange-500',  glow: 'rgba(249,115,22,0.4)', text: 'text-orange-400', bg: 'bg-orange-950/30' },
  cooking:     { stroke: 'stroke-yellow-500',  glow: 'rgba(234,179,8,0.4)',  text: 'text-yellow-400', bg: 'bg-yellow-950/30' },
  smithing:    { stroke: 'stroke-amber-600',   glow: 'rgba(217,119,6,0.4)',  text: 'text-amber-500',  bg: 'bg-amber-950/30' },
};

const SKILL_LINKS: Record<string, string> = {
  woodcutting: '/woodcutting', mining: '/mining', fishing: '/fishing',
  cooking: '/cooking', smithing: '/smithing', firemaking: '/firemaking',
  attack: '/combat', strength: '/combat', defence: '/combat', hitpoints: '/combat',
  ranged: '/combat', magic: '/combat', prayer: '/combat', slayer: '/combat',
};

function CircularProgress({ progress, level, icon, isActive, skillId }: {
  progress: number; level: number; icon: string; isActive: boolean; skillId: string;
}) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;
  const theme = SKILL_THEME_COLORS[skillId] || { stroke: 'stroke-amber-400', glow: 'rgba(245,158,11,0.4)', text: 'text-amber-400', bg: 'bg-slate-900' };

  return (
    <div className="relative w-16 h-16 md:w-18 md:h-18 flex items-center justify-center group">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} className="stroke-slate-800 fill-none" strokeWidth="4.5" />
        <circle
          cx="36" cy="36" r={radius}
          className={`fill-none transition-all duration-500 ${isActive ? theme.stroke : 'stroke-slate-600 group-hover:' + theme.stroke}`}
          strokeWidth="4.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={isActive ? { filter: `drop-shadow(0 0 6px ${theme.glow})` } : undefined}
        />
      </svg>
      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl border transition-all duration-300 ${
        isActive
          ? `${theme.bg} border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105`
          : 'bg-slate-900/90 border-slate-800 group-hover:border-slate-600 group-hover:scale-105'
      }`}>
        {icon}
      </div>
      <div className={`absolute -bottom-2 bg-slate-950 border px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold z-20 leading-tight shadow-md ${
        isActive ? 'border-amber-400 text-amber-300' : 'border-slate-700 text-slate-300'
      }`}>
        {level}
      </div>
    </div>
  );
}

const SkillCard = memo(function SkillCard({ skillId }: { skillId: string }) {
  const { t } = useTranslation();
  const state = usePlayerStore(s => s.skills[skillId as SkillId]);
  const activeSkill = useGameStore(s => s.activeSkill);
  if (!state) return null;

  const isActive = activeSkill === skillId;
  const progress = getLevelProgress(state.xp);
  const linkPath = SKILL_LINKS[skillId] || '/';
  const skillNameKey = `skill.${skillId}` as any;
  const localizedName = t(skillNameKey) || skillId;

  return (
    <Link href={linkPath} className="block group">
      <div className={`relative p-3 rounded-2xl border transition-all duration-200 active:scale-95 flex flex-col items-center gap-2 ${
        isActive
          ? 'fantasy-card-active border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
          : 'fantasy-card hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-lg'
      }`}>
        {isActive && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
        )}
        <CircularProgress progress={progress} level={state.level} icon={SKILL_ICONS[skillId] || '❓'} isActive={isActive} skillId={skillId} />
        <span className="font-bold text-xs tracking-wide capitalize text-slate-200 text-center leading-tight group-hover:text-amber-300 transition-colors">
          {localizedName}
        </span>
      </div>
    </Link>
  );
});

export function DashboardPage() {
  const { t } = useTranslation();
  const combatLevel = usePlayerStore(s => s.combatLevel);
  const skills = usePlayerStore(s => s.skills);
  const totalPlayTime = useGameStore(s => s.totalPlayTime);
  const gp = useBankStore(s => s.gp);
  const items = useBankStore(s => s.items);
  const killCount = useCombatStore(s => s.killCount);

  const [activeTab, setActiveTab] = useState<'all' | 'combat' | 'gathering' | 'artisan'>('all');

  // Calculate total level
  const totalLevel = Object.values(skills).reduce((acc, s) => acc + (s?.level ?? 1), 0);
  const maxPossibleTotal = Object.keys(skills).length * 99;

  return (
    <div className="space-y-5">
      
      {/* Hero Character Banner */}
      <div className="fantasy-card border-amber-500/30 rounded-3xl p-4 sm:p-6 relative overflow-hidden shadow-2xl">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          
          {/* Player Bio */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-indigo-950 border-2 border-amber-500/40 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(245,158,11,0.25)] shrink-0">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                  Champion of Realms
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-100 tracking-wide mt-1">
                {t('dashboard.welcome')}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm">
                {t('dashboard.subtitle')}
              </p>
            </div>
          </div>

          {/* Key Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto">
            
            {/* Combat Lvl */}
            <div className="bg-slate-950/70 border border-red-500/30 rounded-2xl p-3 text-center shadow-inner">
              <div className="text-[10px] text-red-400/90 font-mono uppercase font-bold tracking-wider flex items-center justify-center gap-1 mb-1">
                <Sword className="w-3 h-3" /> {t('dashboard.combatLevel')}
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]">
                {combatLevel}
              </div>
            </div>

            {/* Total Level */}
            <div className="bg-slate-950/70 border border-emerald-500/30 rounded-2xl p-3 text-center shadow-inner">
              <div className="text-[10px] text-emerald-400/90 font-mono uppercase font-bold tracking-wider flex items-center justify-center gap-1 mb-1">
                <Award className="w-3 h-3" /> Total Lvl
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                {totalLevel}
              </div>
            </div>

            {/* Gold */}
            <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-3 text-center shadow-inner">
              <div className="text-[10px] text-amber-400/90 font-mono uppercase font-bold tracking-wider flex items-center justify-center gap-1 mb-1">
                <Coins className="w-3 h-3" /> {t('inventory.gp')}
              </div>
              <div className="text-xl sm:text-2xl font-mono font-black text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)] truncate">
                {formatNumber(gp)}
              </div>
            </div>

            {/* Play Time */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 text-center shadow-inner">
              <div className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider flex items-center justify-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-cyan-400" /> {t('dashboard.playTime')}
              </div>
              <div className="text-sm sm:text-base font-mono font-bold text-slate-200 pt-1">
                {formatDuration(totalPlayTime)}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Category Tabs Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
            activeTab === 'all'
              ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'fantasy-card text-slate-400 hover:text-slate-100'
          }`}
        >
          ✨ Все навыки (All)
        </button>
        <button
          onClick={() => setActiveTab('combat')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 flex items-center gap-1.5 ${
            activeTab === 'combat'
              ? 'bg-red-500 text-white font-black shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              : 'fantasy-card text-slate-400 hover:text-slate-100'
          }`}
        >
          ⚔️ {t('group.combat')}
        </button>
        <button
          onClick={() => setActiveTab('gathering')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 flex items-center gap-1.5 ${
            activeTab === 'gathering'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'fantasy-card text-slate-400 hover:text-slate-100'
          }`}
        >
          🌲 {t('group.gathering')}
        </button>
        <button
          onClick={() => setActiveTab('artisan')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 flex items-center gap-1.5 ${
            activeTab === 'artisan'
              ? 'bg-amber-600 text-white font-black shadow-[0_0_15px_rgba(217,119,6,0.3)]'
              : 'fantasy-card text-slate-400 hover:text-slate-100'
          }`}
        >
          ⚒️ {t('group.artisan')}
        </button>
      </div>

      {/* Skills Showcase Grid */}
      {(activeTab === 'all' || activeTab === 'combat') && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-red-400 font-mono flex items-center gap-1.5">
              <span>⚔️</span> {t('group.combat')}
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {COMBAT_SKILLS.map(id => <SkillCard key={id} skillId={id} />)}
          </div>
        </div>
      )}

      {(activeTab === 'all' || activeTab === 'gathering') && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 font-mono flex items-center gap-1.5">
              <span>🌲</span> {t('group.gathering')}
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {GATHERING_SKILLS.map(id => <SkillCard key={id} skillId={id} />)}
          </div>
        </div>
      )}

      {(activeTab === 'all' || activeTab === 'artisan') && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-amber-400 font-mono flex items-center gap-1.5">
              <span>⚒️</span> {t('group.artisan')}
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {CRAFTING_SKILLS.map(id => <SkillCard key={id} skillId={id} />)}
          </div>
        </div>
      )}

    </div>
  );
}
