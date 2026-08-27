import React, { useState, memo } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { useCombatStore } from '@/store/combatStore';
import { useInventoryStore } from '@/store/inventoryStore';
import type { SkillId } from '@/data/types';
import { COMBAT_SKILLS, GATHERING_SKILLS, CRAFTING_SKILLS } from '@/data/types';
import { getLevelProgress } from '@/gameEngine/xpTable';
import { formatNumber } from '@/lib/utils';
import { Link } from 'wouter';
import { useTranslation } from '@/hooks/useTranslation';
import { getSkillShortName } from '@/shared/icons/skillIcons';
import { CoinsDisplay } from '@/shared/ui/CoinsDisplay';
import { ActionProgressBar } from '@/components/ActionProgressBar';
import { SkillIcon } from '@/components/SkillIcon';
import { 
  Sparkles, 
  Activity, 
  ArrowUpRight,
  Shield
} from 'lucide-react';

const SKILL_THEME_COLORS: Record<string, { stroke: string; glow: string; text: string; bg: string }> = {
  attack:      { stroke: 'stroke-rose-400',   glow: 'rgba(244,63,94,0.5)',  text: 'text-rose-300',   bg: 'bg-rose-950/40' },
  strength:    { stroke: 'stroke-red-400',    glow: 'rgba(239,68,68,0.5)',  text: 'text-red-300',    bg: 'bg-red-50' },
  defence:     { stroke: 'stroke-blue-400',   glow: 'rgba(59,130,246,0.5)', text: 'text-blue-300',   bg: 'bg-blue-50' },
  hitpoints:   { stroke: 'stroke-emerald-400', glow: 'rgba(16,185,129,0.5)',text: 'text-emerald-300',bg: 'bg-emerald-100/80' },
  woodcutting: { stroke: 'stroke-emerald-400', glow: 'rgba(16,185,129,0.5)',text: 'text-emerald-300',bg: 'bg-emerald-100/80' },
  mining:      { stroke: 'stroke-amber-400',   glow: 'rgba(245,158,11,0.5)',  text: 'text-amber-300',  bg: 'bg-amber-50' },
  fishing:     { stroke: 'stroke-cyan-400',    glow: 'rgba(6,182,212,0.5)',  text: 'text-cyan-300',   bg: 'bg-cyan-50' },
  firemaking:  { stroke: 'stroke-orange-400',  glow: 'rgba(249,115,22,0.5)', text: 'text-orange-300', bg: 'bg-orange-50' },
  cooking:     { stroke: 'stroke-yellow-400',  glow: 'rgba(234,179,8,0.5)',  text: 'text-yellow-300', bg: 'bg-yellow-50' },
  smithing:    { stroke: 'stroke-orange-500',  glow: 'rgba(249,115,22,0.5)', text: 'text-orange-300', bg: 'bg-orange-50' },
};

const SKILL_LINKS: Record<string, string> = {
  woodcutting: '/woodcutting', mining: '/mining', fishing: '/fishing',
  cooking: '/cooking', smithing: '/smithing', firemaking: '/firemaking',
  attack: '/combat', strength: '/combat', defence: '/combat', hitpoints: '/combat',
  ranged: '/combat', magic: '/combat', prayer: '/combat', slayer: '/combat',
};

function CircularProgress({ progress, level, isActive, skillId }: {
  progress: number; level: number; isActive: boolean; skillId: string;
}) {
  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;
  const theme = SKILL_THEME_COLORS[skillId] || { stroke: 'stroke-amber-400', glow: 'rgba(245,158,11,0.4)', text: 'text-amber-300', bg: 'bg-[var(--bg-card-dark)]' };

  return (
    <div className="relative w-15 h-15 sm:w-16 sm:h-16 flex items-center justify-center group">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} className="stroke-[#192436] fill-none" strokeWidth="4.5" />
        <circle
          cx="36" cy="36" r={radius}
          className={`fill-none transition-all duration-500 ${isActive ? theme.stroke : 'stroke-stone-300 group-hover:' + theme.stroke}`}
          strokeWidth="4.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={isActive ? { filter: `drop-shadow(0 0 6px ${theme.glow})` } : undefined}
        />
      </svg>
      
      {/* Clean circular icon housing — no square borders! */}
      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden ${
        isActive 
          ? `${theme.bg} shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105` 
          : 'bg-[var(--bg-card-dark)] group-hover:scale-105'
      }`}>
        <SkillIcon skillId={skillId} size="md" />
      </div>

      <div className={`absolute -bottom-1 bg-[var(--bg-slot)] border px-2 py-0 rounded-full text-[9px] sm:text-[10px] font-mono font-black z-20 leading-tight shadow-md ${
        isActive ? 'border-amber-400 text-amber-300' : 'border-[var(--border-light)] text-[var(--text-primary)]'
      }`}>
        {level}
      </div>
    </div>
  );
}

const SkillCard = memo(function SkillCard({ skillId }: { skillId: string }) {
  const state = usePlayerStore(s => s.skills[skillId as SkillId]) || { level: 1, xp: 0, unlocked: true, mastery: {} };
  const activeSkill = useGameStore(s => s.activeSkill);

  const isActive = activeSkill === skillId;
  const progress = getLevelProgress(state.xp);
  const linkPath = SKILL_LINKS[skillId] || '/';
  const shortName = getSkillShortName(skillId);

  return (
    <Link href={linkPath} className="block group">
      <div className={`relative p-2.5 sm:p-3 rounded-2xl border transition-all duration-150 active:scale-95 flex flex-col items-center gap-1.5 ${
        isActive
          ? 'g-card-active border-emerald-400'
          : 'g-card hover:border-amber-400/60 hover:-translate-y-0.5 hover:shadow-lg'
      }`}>
        {isActive && (
          <div className="absolute top-1.5 right-1.5 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
        )}
        <CircularProgress progress={progress} level={state.level} isActive={isActive} skillId={skillId} />
        <span className="font-bold text-[11px] sm:text-xs text-[var(--text-primary)] text-center leading-tight group-hover:text-amber-300 transition-colors w-full px-0.5 truncate mt-0.5">
          {shortName}
        </span>
      </div>
    </Link>
  );
});

export function DashboardPage() {
  const { t } = useTranslation();
  const combatLevel = usePlayerStore(s => s.combatLevel);
  const skills = usePlayerStore(s => s.skills);
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
      <div className="g-card rounded-3xl p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[var(--bg-page)] border-2 border-amber-400/50 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] shrink-0">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                  Герой королевства
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-black text-[var(--text-primary)] tracking-wide mt-0.5">
                {t('dashboard.welcome')}
              </h1>
              <p className="text-[var(--text-secondary)] text-xs font-medium">
                {t('dashboard.subtitle')}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
            <div className="g-card rounded-xl p-2.5 text-center border border-red-200">
              <div className="text-[9px] font-mono uppercase font-bold tracking-wider mb-0.5" style={{ color: '#ff8060' }}>
                Боевой Lvl
              </div>
              <div className="text-xl sm:text-2xl font-mono font-black" style={{ color: '#ff6050', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                {combatLevel}
              </div>
            </div>

            <div className="g-card rounded-xl p-2.5 text-center border border-emerald-200">
              <div className="text-[9px] font-mono uppercase font-bold tracking-wider mb-0.5" style={{ color: '#4ade80' }}>
                Total Lvl
              </div>
              <div className="text-xl sm:text-2xl font-mono font-black" style={{ color: '#4ade80', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                {totalLevel}
              </div>
            </div>

            <div className="g-card rounded-xl p-2.5 text-center border border-amber-200">
              <div className="text-[9px] font-mono uppercase font-bold tracking-wider mb-0.5" style={{ color: '#fbbf24' }}>
                Кошелек
              </div>
              <div className="pt-0.5">
                <CoinsDisplay amount={gp} size="xs" />
              </div>
            </div>

            <div className="g-card rounded-xl p-2.5 text-center border border-sky-200">
              <div className="text-[9px] font-mono uppercase font-bold tracking-wider mb-0.5" style={{ color: '#7dd3fc' }}>
                Сумка
              </div>
              <div className="text-base sm:text-xl font-mono font-black text-[var(--text-primary)]">
                {usedSlots}/{maxSlots}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Activity Hub (Текущая деятельность персонажа) */}
      <div className="g-card border border-[var(--border-default)] p-4 sm:p-5 rounded-3xl shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-[var(--text-primary)] font-mono flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" /> Текущая активность
          </h2>
          {isRunning && (
            <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full animate-pulse">
              В ПРОЦЕССЕ
            </span>
          )}
        </div>

        {inCombat && currentMonster ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 g-card-combat rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center p-1.5 animate-pulse">
                <SkillIcon skillId="combat" size="md" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  Сражение: <span className="text-red-400 font-extrabold">{currentMonster.name}</span> (Ур. {currentMonster.combatLevel})
                </div>
                <div className="text-xs text-[var(--text-secondary)] font-mono">Боевая дуэль на арене</div>
              </div>
            </div>
            <Link
              href="/combat"
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs rounded-2xl flex items-center gap-1 shadow-md transition-all active:scale-95"
            >
              На арену <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : isRunning && activeSkill ? (
          <div className="space-y-2.5 p-3.5 g-card-active rounded-2xl">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center p-1.5">
                  <SkillIcon skillId={activeSkill} size="md" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide">
                    {t(`skill.${activeSkill}` as any)}
                  </div>
                  <div className="text-[11px] text-emerald-300 font-mono font-semibold">Добыча и прокачка опыта</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/${activeSkill}`}
                  className="px-3.5 py-2 bg-[var(--bg-card-dark)] border border-[var(--border-light)] hover:border-emerald-400 text-[var(--text-primary)] text-xs font-bold rounded-2xl flex items-center gap-1"
                >
                  Перейти <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={stopAction}
                  className="px-3.5 py-2 bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white border border-red-500/40 text-xs font-bold rounded-2xl transition-all"
                >
                  Остановить
                </button>
              </div>
            </div>
            <ActionProgressBar height="h-2.5" color="green" />
          </div>
        ) : (
          <div className="py-4 text-center text-[var(--text-secondary)] flex flex-col items-center gap-2.5">
            <p className="text-xs text-[var(--text-secondary)] font-medium">{t('dashboard.noActive')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full pt-1">
              <Link href="/woodcutting" className="p-3 rounded-xl g-btn-secondary hover:border-emerald-400 text-xs font-bold flex items-center justify-center gap-2.5 active:scale-95 transition-all" style={{ color: '#fff8d0' }}>
                <SkillIcon skillId="woodcutting" size="sm" /> 
                <span>Рубить лес</span>
              </Link>
              <Link href="/mining" className="p-3 rounded-xl g-btn-secondary hover:border-amber-400 text-xs font-bold flex items-center justify-center gap-2.5 active:scale-95 transition-all">
                <SkillIcon skillId="mining" size="sm" /> 
                <span>Добывать руду</span>
              </Link>
              <Link href="/fishing" className="p-3 rounded-xl g-btn-secondary hover:border-cyan-400 text-xs font-bold flex items-center justify-center gap-2.5 active:scale-95 transition-all">
                <SkillIcon skillId="fishing" size="sm" /> 
                <span>Ловить рыбу</span>
              </Link>
              <Link href="/combat" className="p-3 rounded-xl g-btn-secondary hover:border-red-400 text-xs font-bold flex items-center justify-center gap-2.5 active:scale-95 transition-all">
                <SkillIcon skillId="combat" size="sm" /> 
                <span>В бой</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
            activeTab === 'all'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'g-btn-ghost text-[var(--text-secondary)]'
          }`}
        >
          ✨ Все профессии
        </button>
        <button
          onClick={() => setActiveTab('combat')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 active:scale-95 flex items-center gap-1.5 ${
            activeTab === 'combat'
              ? 'bg-red-500 text-white font-black shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              : 'g-btn-ghost text-[var(--text-secondary)]'
          }`}
        >
          ⚔️ Бой
        </button>
        <button
          onClick={() => setActiveTab('gathering')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 active:scale-95 flex items-center gap-1.5 ${
            activeTab === 'gathering'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'g-btn-ghost text-[var(--text-secondary)]'
          }`}
        >
          🌲 Добыча
        </button>
        <button
          onClick={() => setActiveTab('artisan')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 active:scale-95 flex items-center gap-1.5 ${
            activeTab === 'artisan'
              ? 'bg-amber-600 text-white font-black shadow-[0_0_15px_rgba(217,119,6,0.3)]'
              : 'g-btn-ghost text-[var(--text-secondary)]'
          }`}
        >
          ⚒️ Ремесло
        </button>
      </div>

      {/* 4. Skill Showcase Grid */}
      {(activeTab === 'all' || activeTab === 'combat') && (
        <div className="space-y-2">
          <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-red-300 font-mono flex items-center gap-1.5 px-1">
            <span>⚔️</span> {t('group.combat')}
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3">
            {COMBAT_SKILLS.map(id => <SkillCard key={id} skillId={id} />)}
          </div>
        </div>
      )}

      {(activeTab === 'all' || activeTab === 'gathering') && (
        <div className="space-y-2">
          <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-300 font-mono flex items-center gap-1.5 px-1">
            <span>🌲</span> {t('group.gathering')}
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3">
            {GATHERING_SKILLS.map(id => <SkillCard key={id} skillId={id} />)}
          </div>
        </div>
      )}

      {(activeTab === 'all' || activeTab === 'artisan') && (
        <div className="space-y-2">
          <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300 font-mono flex items-center gap-1.5 px-1">
            <span>⚒️</span> {t('group.artisan')}
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3">
            {CRAFTING_SKILLS.map(id => <SkillCard key={id} skillId={id} />)}
          </div>
        </div>
      )}

    </div>
  );
}
