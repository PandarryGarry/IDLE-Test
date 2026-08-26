import React from 'react';
import { SkillId } from '@/data/types';
import { usePlayerStore } from '@/store/playerStore';
import { ProgressBar } from './ProgressBar';
import { getXpForLevel } from '@/gameEngine/xpTable';
import { useGameStore } from '@/store/gameStore';
import { formatNumber } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/lib/i18n';
import { Sparkles, Zap, TrendingUp, Award } from 'lucide-react';

interface SkillHeaderProps {
  skillId: SkillId;
  skillName: string;
  skillIcon: string;
}

const SKILL_DESCRIPTION_KEYS: Partial<Record<SkillId, TranslationKey>> = {
  woodcutting: 'skill.woodcuttingDesc',
  fishing: 'skill.fishingDesc',
  mining: 'skill.miningDesc',
  firemaking: 'skill.firemakingDesc',
  cooking: 'skill.cookingDesc',
  smithing: 'skill.smithingDesc',
};

const SKILL_THEME_MAP: Record<string, { gradient: string; border: string; glow: string; text: string; iconBg: string }> = {
  woodcutting: {
    gradient: 'from-emerald-950/40 via-slate-900 to-slate-950',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_25px_rgba(16,185,129,0.15)]',
    text: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15 border-emerald-500/40',
  },
  mining: {
    gradient: 'from-amber-950/40 via-slate-900 to-slate-950',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_25px_rgba(245,158,11,0.15)]',
    text: 'text-amber-400',
    iconBg: 'bg-amber-500/15 border-amber-500/40',
  },
  fishing: {
    gradient: 'from-cyan-950/40 via-slate-900 to-slate-950',
    border: 'border-cyan-500/30',
    glow: 'shadow-[0_0_25px_rgba(6,182,212,0.15)]',
    text: 'text-cyan-400',
    iconBg: 'bg-cyan-500/15 border-cyan-500/40',
  },
  firemaking: {
    gradient: 'from-rose-950/40 via-slate-900 to-slate-950',
    border: 'border-rose-500/30',
    glow: 'shadow-[0_0_25px_rgba(244,63,94,0.15)]',
    text: 'text-rose-400',
    iconBg: 'bg-rose-500/15 border-rose-500/40',
  },
  cooking: {
    gradient: 'from-yellow-950/40 via-slate-900 to-slate-950',
    border: 'border-yellow-500/30',
    glow: 'shadow-[0_0_25px_rgba(234,179,8,0.15)]',
    text: 'text-yellow-400',
    iconBg: 'bg-yellow-500/15 border-yellow-500/40',
  },
  smithing: {
    gradient: 'from-orange-950/40 via-slate-900 to-slate-950',
    border: 'border-orange-500/30',
    glow: 'shadow-[0_0_25px_rgba(249,115,22,0.15)]',
    text: 'text-orange-400',
    iconBg: 'bg-orange-500/15 border-orange-500/40',
  },
};

export function SkillHeader({ skillId, skillName, skillIcon }: SkillHeaderProps) {
  const { t } = useTranslation();
  const xp = usePlayerStore(s => s.skills[skillId]?.xp ?? 0);
  const level = usePlayerStore(s => s.skills[skillId]?.level ?? 1);
  const xpGainedSession = useGameStore(s => s.xpGainedThisSession[skillId] ?? 0);
  const sessionStartTime = useGameStore(s => s.sessionStartTime);

  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  const xpIntoLevel = Math.max(0, xp - currentLevelXp);
  const xpRequiredForLevel = Math.max(1, nextLevelXp - currentLevelXp);
  const progress = level >= 99 ? 1 : xpIntoLevel / xpRequiredForLevel;
  const descriptionKey = SKILL_DESCRIPTION_KEYS[skillId];

  const elapsedMs = Date.now() - sessionStartTime;
  const xpPerHour = elapsedMs > 0 ? (xpGainedSession / elapsedMs) * 3_600_000 : 0;

  const theme = SKILL_THEME_MAP[skillId] || {
    gradient: 'from-slate-900 to-slate-950',
    border: 'border-slate-800',
    glow: 'shadow-lg',
    text: 'text-amber-400',
    iconBg: 'bg-slate-800 border-slate-700',
  };

  return (
    <div className={`fantasy-card ${theme.border} ${theme.glow} p-4 sm:p-5 rounded-3xl relative overflow-hidden`}>
      
      {/* Upper row: Icon + Info + Big Level */}
      <div className="flex items-center gap-3.5 sm:gap-5 mb-4">
        
        {/* Skill Icon Frame */}
        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 flex items-center justify-center text-3xl sm:text-4xl shadow-inner shrink-0 ${theme.iconBg}`}>
          {skillIcon}
        </div>

        {/* Skill Title & XP Stats */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-display font-black tracking-wide text-slate-100 truncate">
              {skillName}
            </h1>
          </div>
          {descriptionKey && (
            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
              {t(descriptionKey)}
            </p>
          )}

          {/* XP & XP/Hour badges */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs mt-1.5">
            <span className="text-slate-400">
              {t('ui.xp')}: <b className="text-amber-300">{formatNumber(Math.floor(xp))}</b>
            </span>
            {xpPerHour > 0 && (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                <TrendingUp className="w-3 h-3" />
                <span>+{formatNumber(Math.floor(xpPerHour))} {t('ui.per.hour')}</span>
              </span>
            )}
          </div>
        </div>

        {/* Big Level Display */}
        <div className="shrink-0 text-right bg-slate-950/70 border border-slate-800 px-3.5 py-2 rounded-2xl">
          <div className={`text-3xl sm:text-4xl font-mono font-black ${theme.text} leading-none drop-shadow-[0_0_10px_rgba(245,158,11,0.25)]`}>
            {level}
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold mt-0.5">
            {t('ui.level')}
          </div>
        </div>

      </div>

      {/* Level XP Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
          <span>{level >= 99 ? 'MAX LEVEL' : `Next Level: ${level + 1}`}</span>
          <span className="text-slate-300 font-bold">
            {level >= 99 ? '100%' : `${formatNumber(Math.floor(xpIntoLevel))} / ${formatNumber(Math.floor(xpRequiredForLevel))} XP (${(progress * 100).toFixed(1)}%)`}
          </span>
        </div>
        
        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-amber-400 shadow-[0_0_12px_rgba(16,185,129,0.6)] transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
      </div>

    </div>
  );
}
