import React, { useState, memo } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { useCombatStore } from '@/store/combatStore';
import { useInventoryStore } from '@/store/inventoryStore';
import type { SkillId } from '@/data/types';
import { COMBAT_SKILLS, GATHERING_SKILLS, CRAFTING_SKILLS } from '@/data/types';
import { getLevelProgress, getXpForLevel } from '@/gameEngine/xpTable';
import { formatDuration, formatNumber } from '@/lib/utils';
import { Link } from 'wouter';
import { useTranslation } from '@/hooks/useTranslation';
import { SKILL_ICONS, getSkillIcon, getSkillVisual } from '@/shared/icons/skillIcons';
import { CoinsDisplay } from '@/shared/ui/CoinsDisplay';
import { ActionProgressBar } from '@/components/ActionProgressBar';
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
  Activity,
  Trees,
  Pickaxe,
  Fish,
  ChefHat,
  Hammer,
  ArrowUpRight,
  Square
} from 'lucide-react';

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
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;
  const theme = SKILL_THEME_COLORS[skillId] || { stroke: 'stroke-amber-400', glow: 'rgba(245,158,11,0.4)', text: 'text-amber-400', bg: 'bg-slate-900' };

  return (
    <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center group">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} className="stroke-[#1e2a3c] fill-none" strokeWidth="4.5" />
        <circle
          cx="36" cy="36" r={radius}
          className={`fill-none transition-all duration-500 ${isActive ? theme.stroke : 'stroke-slate-500 group-hover:' + theme.stroke}`}
          strokeWidth="4.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={isActive ? { filter: `drop-shadow(0 0 6px ${theme.glow})` } : undefined}
        />
      </svg>
      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg sm:text-xl border transition-all duration-300 overflow-hidden ${
        isActive
          ? `${theme.bg} border-amber-400/90 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105`
          : 'bg-[#1a2436] border-[#314159] group-hover:border-slate-400 group-hover:scale-105 shadow-sm'
      }`}>
        {(() => {
          const vis = getSkillVisual(skillId);
          if (vis.type === 'image') {
            return <img src={vis.value} alt={skillId} className="w-7 h-7 object-contain" />;
          }
          return <span>{vis.value}</span>;
        })()}
      </div>
      <div className={`absolute -bottom-1.5 bg-[#172030] border px-1.5 py-0 rounded-full text-[9px] sm:text-[10px] font-mono font-extrabold z-20 leading-tight shadow-md ${
        isActive ? 'border-amber-400 text-amber-300' : 'border-[#334460] text-slate-200'
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
      <div className={`relative p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 active:scale-95 flex flex-col items-center gap-1.5 ${
        isActive
          ? 'fantasy-card-active border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
          : 'fantasy-card hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-lg'
      }`}>
        {isActive && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
        )}
        <CircularProgress progress={progress} level={state.level} icon={getSkillIcon(skillId)} isActive={isActive} skillId={skillId} />
        <span className="font-bold text-[11px] sm:text-xs tracking-wide capitalize text-slate-200 text-center leading-tight group-hover:text-amber-300 transition-colors truncate w-full px-0.5">
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
  const isRunning = useGameStore(s => s.isRunning);
  const activeSkill = useGameStore(s => s.activeSkill);
  const stopAction = useGameStore(s => s.stopAction);
  const inCombat = useCombatStore(s => s.inCombat);
  const currentMonster = useCombatStore(s => s.currentMonster);
  
  const gp = useInventoryStore(s => s.gp);
  const items = useInventoryStore(s => s.items);
  const maxSlots = useInventoryStore(s => s.maxSlots);
  const usedSlots = items ? items.filter(s => s.quantity > 0).length : 0;

  const [activeTab, setActiveTab] = useState<'all' | 'combat' | 'gathering' | 'artisan'>('all');

  const totalLevel = Object.values(skills).reduce((acc, s) => acc + (s?.level ?? 1), 0);

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* 1. Hero Overview Header */}
      <div className="fantasy-card border-amber-500/30 rounded-3xl p-4 sm:p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-indigo-950 border-2 border-amber-500/40 flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_20px_rgba(245,158,11,0.25)] shrink-0">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                  Герой королевства
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-black text-slate-100 tracking-wide mt-0.5">
                {t('dashboard.welcome')}
              </h1>
              <p className="text-slate-400 text-xs">
                {t('dashboard.subtitle')}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
            <div className="bg-[#1b2537] border border-red-500/40 rounded-2xl p-2.5 text-center shadow-md">
              <div className="text-[9px] text-red-300 font-mono uppercase font-bold tracking-wider mb-0.5">
                Боевой Lvl
              </div>
              <div className="text-xl sm:text-2xl font-mono font-black text-red-400">
                {combatLevel}
              </div>
            </div>

            <div className="bg-[#1b2537] border border-emerald-500/40 rounded-2xl p-2.5 text-center shadow-md">
              <div className="text-[9px] text-emerald-300 font-mono uppercase font-bold tracking-wider mb-0.5">
                Total Lvl
              </div>
              <div className="text-xl sm:text-2xl font-mono font-black text-emerald-400">
                {totalLevel}
              </div>
            </div>

            <div className="bg-[#1b2537] border border-amber-500/40 rounded-2xl p-2.5 text-center shadow-md">
              <div className="text-[9px] text-amber-300 font-mono uppercase font-bold tracking-wider mb-0.5">
                Кошелек
              </div>
              <div className="pt-0.5">
                <CoinsDisplay amount={gp} size="xs" />
              </div>
            </div>

            <div className="bg-[#1b2537] border border-sky-500/40 rounded-2xl p-2.5 text-center shadow-md">
              <div className="text-[9px] text-sky-300 font-mono uppercase font-bold tracking-wider mb-0.5">
                Сумка
              </div>
              <div className="text-base sm:text-xl font-mono font-black text-slate-100">
                {usedSlots}/{maxSlots}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Activity Hub (Текущая деятельность персонажа) */}
      <div className="fantasy-card p-4 sm:p-5 rounded-3xl border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-300 font-mono flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" /> Текущая активность
          </h2>
          {isRunning && (
            <span className="text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full animate-pulse">
              В ПРОЦЕССЕ
            </span>
          )}
        </div>

        {inCombat && currentMonster ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-red-950/20 border border-red-500/30 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-xl animate-pulse">
                ⚔️
              </div>
              <div>
                <div className="text-sm font-bold text-slate-100">
                  Сражение: <span className="text-red-400">{currentMonster.name}</span> (Lvl {currentMonster.combatLevel})
                </div>
                <div className="text-xs text-slate-400 font-mono">Боевая дуэль в реальном времени</div>
              </div>
            </div>
            <Link
              href="/combat"
              className="px-4 py-2 bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md hover:bg-red-600 transition-all active:scale-95"
            >
              На арену <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : isRunning && activeSkill ? (
          <div className="space-y-2 p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{getSkillIcon(activeSkill)}</span>
                <div>
                  <div className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                    {t(`skill.${activeSkill}` as any)}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono">Добыча и прокачка опыта</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/${activeSkill}`}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1"
                >
                  Перейти <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={stopAction}
                  className="px-3 py-1.5 bg-red-500/15 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/30 text-xs font-bold rounded-xl transition-all"
                >
                  Остановить
                </button>
              </div>
            </div>
            <ActionProgressBar height="h-2.5" color="green" />
          </div>
        ) : (
          <div className="py-4 text-center text-slate-400 flex flex-col items-center gap-2">
            <p className="text-xs text-slate-400 font-medium">{t('dashboard.noActive')}</p>
            <div className="flex flex-wrap gap-2 justify-center pt-1">
              <Link href="/woodcutting" className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs text-slate-300 font-semibold flex items-center gap-1">
                🪓 Рубить лес
              </Link>
              <Link href="/mining" className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs text-slate-300 font-semibold flex items-center gap-1">
                ⛏️ Добывать руду
              </Link>
              <Link href="/fishing" className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 font-semibold flex items-center gap-1">
                🎣 Ловить рыбу
              </Link>
              <Link href="/combat" className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/40 text-xs text-slate-300 font-semibold flex items-center gap-1">
                ⚔️ В бой
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
            activeTab === 'all'
              ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'fantasy-card text-slate-400 hover:text-slate-100'
          }`}
        >
          ✨ Все профессии
        </button>
        <button
          onClick={() => setActiveTab('combat')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 flex items-center gap-1.5 ${
            activeTab === 'combat'
              ? 'bg-red-500 text-white font-black shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              : 'fantasy-card text-slate-400 hover:text-slate-100'
          }`}
        >
          ⚔️ Бой
        </button>
        <button
          onClick={() => setActiveTab('gathering')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 flex items-center gap-1.5 ${
            activeTab === 'gathering'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'fantasy-card text-slate-400 hover:text-slate-100'
          }`}
        >
          🌲 Добыча
        </button>
        <button
          onClick={() => setActiveTab('artisan')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 flex items-center gap-1.5 ${
            activeTab === 'artisan'
              ? 'bg-amber-600 text-white font-black shadow-[0_0_15px_rgba(217,119,6,0.3)]'
              : 'fantasy-card text-slate-400 hover:text-slate-100'
          }`}
        >
          ⚒️ Ремесло
        </button>
      </div>

      {/* 4. Skill Showcase Grid */}
      {(activeTab === 'all' || activeTab === 'combat') && (
        <div className="space-y-2">
          <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-red-400 font-mono flex items-center gap-1.5 px-1">
            <span>⚔️</span> {t('group.combat')}
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-2.5">
            {COMBAT_SKILLS.map(id => <SkillCard key={id} skillId={id} />)}
          </div>
        </div>
      )}

      {(activeTab === 'all' || activeTab === 'gathering') && (
        <div className="space-y-2">
          <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 font-mono flex items-center gap-1.5 px-1">
            <span>🌲</span> {t('group.gathering')}
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-2.5">
            {GATHERING_SKILLS.map(id => <SkillCard key={id} skillId={id} />)}
          </div>
        </div>
      )}

      {(activeTab === 'all' || activeTab === 'artisan') && (
        <div className="space-y-2">
          <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 font-mono flex items-center gap-1.5 px-1">
            <span>⚒️</span> {t('group.artisan')}
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-2.5">
            {CRAFTING_SKILLS.map(id => <SkillCard key={id} skillId={id} />)}
          </div>
        </div>
      )}

    </div>
  );
}
