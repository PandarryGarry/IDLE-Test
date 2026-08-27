import React from 'react';
import { SkillId } from '@/data/types';
import { usePlayerStore } from '@/store/playerStore';
import { getXpForLevel } from '@/gameEngine/xpTable';
import { useGameStore } from '@/store/gameStore';
import { formatNumber } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/lib/i18n';
import { TrendingUp } from 'lucide-react';
import { getSkillVisual } from '@/shared/icons/skillIcons';

interface SkillHeaderProps {
  skillId: SkillId;
  skillName: string;
  skillIcon: string;
}

const SKILL_DESCRIPTION_KEYS: Partial<Record<SkillId, TranslationKey>> = {
  woodcutting: 'skill.woodcuttingDesc',
  fishing:     'skill.fishingDesc',
  mining:      'skill.miningDesc',
  firemaking:  'skill.firemakingDesc',
  cooking:     'skill.cookingDesc',
  smithing:    'skill.smithingDesc',
};

/* Тепло-тёмные акценты под каждый навык */
const SKILL_THEME: Record<string, { accent: string; iconBg: string; barGrad: string }> = {
  woodcutting: { accent: 'text-emerald-400', iconBg: 'rgba(16,185,129,0.15)',  barGrad: 'from-emerald-600 via-emerald-400 to-teal-300' },
  mining:      { accent: 'text-amber-400',   iconBg: 'rgba(245,158,11,0.15)',  barGrad: 'from-amber-600 via-amber-400 to-yellow-300' },
  fishing:     { accent: 'text-cyan-400',    iconBg: 'rgba(6,182,212,0.15)',   barGrad: 'from-cyan-600 via-cyan-400 to-sky-300' },
  firemaking:  { accent: 'text-orange-400',  iconBg: 'rgba(249,115,22,0.15)', barGrad: 'from-orange-600 via-orange-400 to-amber-300' },
  cooking:     { accent: 'text-yellow-400',  iconBg: 'rgba(234,179,8,0.15)',  barGrad: 'from-yellow-600 via-yellow-400 to-amber-200' },
  smithing:    { accent: 'text-stone-300',   iconBg: 'rgba(120,113,108,0.2)', barGrad: 'from-stone-500 via-stone-300 to-stone-200' },
};

export function SkillHeader({ skillId, skillName, skillIcon }: SkillHeaderProps) {
  const { t } = useTranslation();
  const xp                = usePlayerStore(s => s.skills[skillId]?.xp ?? 0);
  const level             = usePlayerStore(s => s.skills[skillId]?.level ?? 1);
  const xpGainedSession   = useGameStore(s => s.xpGainedThisSession[skillId] ?? 0);
  const sessionStartTime  = useGameStore(s => s.sessionStartTime);

  const currentLevelXp     = getXpForLevel(level);
  const nextLevelXp        = getXpForLevel(level + 1);
  const xpIntoLevel        = Math.max(0, xp - currentLevelXp);
  const xpRequiredForLevel = Math.max(1, nextLevelXp - currentLevelXp);
  const progress           = level >= 99 ? 1 : xpIntoLevel / xpRequiredForLevel;
  const descriptionKey     = SKILL_DESCRIPTION_KEYS[skillId];

  const elapsedMs = Date.now() - sessionStartTime;
  const xpPerHour = elapsedMs > 0 ? (xpGainedSession / elapsedMs) * 3_600_000 : 0;

  const theme       = SKILL_THEME[skillId] ?? SKILL_THEME.mining;
  const skillVisual = getSkillVisual(skillId);

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#2a1f12,#1a1108)', border: '1px solid #3d2e1e', boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,220,130,0.05)' }}>

      <div className="p-4 sm:p-5">
        {/* ── Верхняя строка: иконка + инфо + уровень ── */}
        <div className="flex items-center gap-3.5 mb-4">

          {/* Иконка навыка */}
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
            style={{ background: theme.iconBg, border: '1px solid rgba(255,220,130,0.12)', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)' }}>
            {skillVisual.type === 'image' ? (
              <img src={skillVisual.value} alt={skillName} className="w-full h-full object-contain p-1.5" />
            ) : (
              <span className="text-3xl">{skillVisual.value}</span>
            )}
          </div>

          {/* Название + XP */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-display font-black tracking-wide text-stone-100 truncate">
              {skillName}
            </h1>
            {descriptionKey && (
              <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">{t(descriptionKey)}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5 text-xs font-mono">
              <span className="text-stone-500">
                XP: <b className="text-amber-400 font-bold">{formatNumber(Math.floor(xp))}</b>
              </span>
              {xpPerHour > 0 && (
                <span className={`flex items-center gap-1 font-bold ${theme.accent}`}>
                  <TrendingUp className="w-3 h-3" />
                  +{formatNumber(Math.floor(xpPerHour))}/ч
                </span>
              )}
            </div>
          </div>

          {/* Большой уровень */}
          <div className="shrink-0 text-center px-3.5 py-2 rounded-xl"
            style={{ background: '#1a1108', border: '1px solid #3d2e1e', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}>
            <div className={`text-3xl font-mono font-black leading-none ${theme.accent}`}>{level}</div>
            <div className="text-[9px] text-stone-600 uppercase tracking-widest font-mono mt-0.5">Уровень</div>
          </div>
        </div>

        {/* ── Полоса прогресса XP ── */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-stone-500">
            <span>{level >= 99 ? 'Максимальный уровень' : `→ Ур. ${level + 1}`}</span>
            <span className="text-stone-400 font-bold">
              {level >= 99 ? '100%' : `${formatNumber(Math.floor(xpIntoLevel))} / ${formatNumber(Math.floor(xpRequiredForLevel))} XP`}
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full overflow-hidden"
            style={{ background: 'rgba(26,18,9,0.9)', border: '1px solid #2e2010' }}>
            <div
              className={`h-full rounded-full bg-gradient-to-r ${theme.barGrad} transition-all duration-300`}
              style={{
                width: `${Math.min(100, Math.max(0, progress * 100))}%`,
                boxShadow: '0 0 8px rgba(245,158,11,0.35)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
