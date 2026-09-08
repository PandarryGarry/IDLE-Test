import React from 'react';
import { SkillId } from '@/data/types';
import { usePlayerStore } from '@/store/playerStore';
import { getXpForLevel } from '@/core/xpTable';
import { useGameStore } from '@/store/gameStore';
import { formatNumber } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/lib/i18n';
import { TrendingUp } from 'lucide-react';
import { getSkillVisual } from '@/shared/icons/skillIcons';
import { skillNameRu } from '@/lib/skillNames';

interface SkillHeaderProps {
  skillId: SkillId;
  skillName: string;
  skillIcon: string;
  /** Компактная версия для страниц, которые должны помещаться на экран. */
  compact?: boolean;
}

const SKILL_DESCRIPTION_KEYS: Partial<Record<SkillId, TranslationKey>> = {
  foraging: 'skill.foragingDesc',
};

const SKILL_THEME: Record<string, { barFrom: string; barTo: string; accent: string }> = {
  foraging: { barFrom: '#3f6212', barTo: '#84cc16', accent: '#bef264' },
};

export function SkillHeader({ skillId, skillIcon, compact = false }: SkillHeaderProps) {
  // Всегда показываем каноническое русское название — так пользователь не
  // увидит английское «Foraging», даже если локаль временно сбилась.
  const displayName = skillNameRu(skillId);
  const { t } = useTranslation();
  const xp               = usePlayerStore(s => s.skills[skillId]?.xp ?? 0);
  const level            = usePlayerStore(s => s.skills[skillId]?.level ?? 1);
  const xpGainedSession  = useGameStore(s => s.xpGainedThisSession[skillId] ?? 0);
  const sessionStartTime = useGameStore(s => s.sessionStartTime);

  const currentLevelXp     = getXpForLevel(level);
  const nextLevelXp        = getXpForLevel(level + 1);
  const xpIntoLevel        = Math.max(0, xp - currentLevelXp);
  const xpRequiredForLevel = Math.max(1, nextLevelXp - currentLevelXp);
  const progress           = level >= 99 ? 1 : xpIntoLevel / xpRequiredForLevel;
  const descriptionKey     = SKILL_DESCRIPTION_KEYS[skillId];

  const elapsedMs = Date.now() - sessionStartTime;
  const xpPerHour = elapsedMs > 0 ? (xpGainedSession / elapsedMs) * 3_600_000 : 0;

  const theme       = SKILL_THEME[skillId] ?? SKILL_THEME.foraging;
  const skillVisual = getSkillVisual(skillId);

  const iconSize = compact ? 44 : 56;
  const titleSize = compact ? 16 : 22;
  const levelSize = compact ? 27 : 36;
  const boxPad = compact ? '10px 14px' : '16px 20px';
  const headerGap = compact ? 10 : 14;
  const headerMb = compact ? 8 : 14;

  return (
    <div style={{
      background: 'linear-gradient(160deg, #7a5028 0%, #5a3818 100%)',
      border: '2px solid #3d1e08',
      borderRadius: compact ? 12 : 14,
      boxShadow: '0 4px 0 #2a1005, 0 6px 20px rgba(10,4,0,0.5), inset 0 1px 0 rgba(220,170,80,0.2)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: boxPad }}>

        {/* ── Верхняя строка ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: headerGap, marginBottom: headerMb }}>

          {/* Иконка навыка */}
          <div style={{
            width: iconSize, height: iconSize, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(160deg, #4a2810, #2e1608)',
            border: '2px solid #8b5020',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5), 0 2px 0 #1a0804',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            {skillVisual.type === 'image' ? (
              <img src={skillVisual.value} alt={displayName}
                style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: compact ? 22 : 28 }}>{skillVisual.value}</span>
            )}
          </div>

          {/* Название + описание + XP */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontFamily: 'var(--app-font-display)', fontWeight: 900, fontSize: titleSize,
              color: '#fff8d0', textShadow: '0 2px 4px rgba(0,0,0,0.6)',
              letterSpacing: '0.04em', lineHeight: 1.1, margin: 0,
            }}>{displayName}</h1>

            {!compact && descriptionKey && (
              <p style={{ fontSize: 12, color: '#c8a050', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t(descriptionKey)}
              </p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 8 : 16, marginTop: compact ? 3 : 6 }}>
              <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: compact ? 10 : 12, color: '#e0c060', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                Опыт: <b style={{ color: '#f5d060' }}>{formatNumber(Math.floor(xp))}</b>
              </span>
              {xpPerHour > 0 && (
                <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: compact ? 10 : 12, color: theme.accent, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <TrendingUp size={compact ? 10 : 12} />
                  +{formatNumber(Math.floor(xpPerHour))}/ч
                </span>
              )}
            </div>
          </div>

          {/* Большой уровень */}
          <div style={{
            flexShrink: 0, textAlign: 'center', padding: compact ? '5px 10px' : '8px 16px',
            background: 'linear-gradient(180deg, #4a2810, #2e1608)',
            border: '2px solid #8b5020',
            borderRadius: 12,
            boxShadow: '0 3px 0 #1a0804, inset 0 1px 0 rgba(220,170,80,0.15)',
          }}>
            <div style={{ fontFamily: 'var(--app-font-mono)', fontSize: levelSize, fontWeight: 900, color: '#f5d060', lineHeight: 1, textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
              {level}
            </div>
            <div style={{ fontSize: compact ? 8 : 9, color: '#a07030', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--app-font-mono)', marginTop: 2 }}>
              ур.
            </div>
          </div>
        </div>

        {/* ── XP Прогресс-бар ── */}
        <div style={{ marginTop: compact ? 2 : 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: compact ? 2 : 4 }}>
            <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: compact ? 9 : 10, color: '#c8a050' }}>
              {level >= 99 ? 'Максимальный уровень' : `До ур. ${level + 1}`}
            </span>
            <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: compact ? 9 : 10, color: '#d4a840', fontWeight: 700 }}>
              {level >= 99 ? '100%' : `${formatNumber(Math.floor(xpIntoLevel))} / ${formatNumber(Math.floor(xpRequiredForLevel))}`}
            </span>
          </div>
          {/* Трек */}
          <div style={{
            height: compact ? 8 : 12, background: '#1a0a04', border: '2px solid #5a3010',
            borderRadius: 9999, overflow: 'hidden',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.7)',
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, Math.max(0, progress * 100))}%`,
              background: `linear-gradient(90deg, ${theme.barFrom}, ${theme.barTo})`,
              borderRadius: 9999,
              boxShadow: `0 0 8px ${theme.barTo}80`,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

      </div>
    </div>
  );
}
