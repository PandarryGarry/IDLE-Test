import React from 'react';
import { SkillId } from '@/data/types';
import { usePlayerStore } from '@/store/playerStore';
import { ProgressBar } from './ProgressBar';
import { getXpForLevel } from '@/gameEngine/xpTable';
import { formatNumber } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/lib/i18n';

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

export function SkillHeader({ skillId, skillName, skillIcon }: SkillHeaderProps) {
  const { t } = useTranslation();
  const xp = usePlayerStore(s => s.skills[skillId]?.xp ?? 0);
  const level = usePlayerStore(s => s.skills[skillId]?.level ?? 1);

  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  const xpIntoLevel = Math.max(0, xp - currentLevelXp);
  const xpRequiredForLevel = Math.max(1, nextLevelXp - currentLevelXp);
  const progress = level >= 99 ? 1 : xpIntoLevel / xpRequiredForLevel;
  const descriptionKey = SKILL_DESCRIPTION_KEYS[skillId];

  return (
    <div className="bg-card border border-border p-4 md:p-5 rounded-2xl shadow-sm">
      <div className="flex items-center gap-3 md:gap-4 mb-3">
        {/* Icon */}
        <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 bg-accent rounded-xl flex items-center justify-center text-3xl md:text-4xl border border-border shadow-inner">
          {skillIcon}
        </div>

        {/* Name + XP */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground leading-none mb-0.5">{skillName}</h1>
          {descriptionKey && (
            <p className="mb-1 line-clamp-1 text-xs leading-relaxed text-muted-foreground">
              {t(descriptionKey)}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-xs text-muted-foreground">
            <span>{t('ui.xp')}: <span className="text-amber-400 font-bold">{formatNumber(Math.floor(xp))}</span></span>
          </div>
        </div>

        {/* Level */}
        <div className="shrink-0 text-right">
          <div className="text-4xl md:text-5xl font-black text-primary leading-none drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">
            {level}
          </div>
          <div className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-bold mt-0.5">{t('ui.level')}</div>
        </div>
      </div>

      {/* XP bar */}
      <div className="space-y-1">
        <ProgressBar
          value={progress}
          label={level >= 99
            ? t('ui.maxLevel')
            : `${formatNumber(Math.floor(xpIntoLevel))} / ${formatNumber(Math.floor(xpRequiredForLevel))} XP`
          }
          className="h-4"
        />
      </div>
    </div>
  );
}
