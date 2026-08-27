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

const SKILL_THEME: Record<string, { barFrom: string; barTo: string; accent: string }> = {
  woodcutting: { barFrom: '#2e7d32', barTo: '#4caf50', accent: '#4ade80' },
  mining:      { barFrom: '#b45309', barTo: '#f59e0b', accent: '#fbbf24' },
  fishing:     { barFrom: '#0e7490', barTo: '#22d3ee', accent: '#67e8f9' },
  firemaking:  { barFrom: '#c2410c', barTo: '#f97316', accent: '#fb923c' },
  cooking:     { barFrom: '#a16207', barTo: '#eab308', accent: '#fde047' },
  smithing:    { barFrom: '#475569', barTo: '#94a3b8', accent: '#cbd5e1' },
};

export function SkillHeader({ skillId, skillName, skillIcon }: SkillHeaderProps) {
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

  const theme       = SKILL_THEME[skillId] ?? SKILL_THEME.mining;
  const skillVisual = getSkillVisual(skillId);

  return (
    <div style={{
      background: 'linear-gradient(160deg, #7a5028 0%, #5a3818 100%)',
      border: '2px solid #3d1e08',
      borderRadius: 14,
      boxShadow: '0 4px 0 #2a1005, 0 6px 20px rgba(10,4,0,0.5), inset 0 1px 0 rgba(220,170,80,0.2)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '16px 20px' }}>

        {/* ── Верхняя строка ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>

          {/* Иконка навыка */}
          <div style={{
            width: 56, height: 56, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(160deg, #4a2810, #2e1608)',
            border: '2px solid #8b5020',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5), 0 2px 0 #1a0804',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            {skillVisual.type === 'image' ? (
              <img src={skillVisual.value} alt={skillName}
                style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: 28 }}>{skillVisual.value}</span>
            )}
          </div>

          {/* Название + описание + XP */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontFamily: 'var(--app-font-display)', fontWeight: 900, fontSize: 22,
              color: '#fff8d0', textShadow: '0 2px 4px rgba(0,0,0,0.6)',
              letterSpacing: '0.04em', lineHeight: 1.1,
            }}>{skillName}</h1>

            {descriptionKey && (
              <p style={{ fontSize: 12, color: '#c8a050', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t(descriptionKey)}
              </p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6 }}>
              <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 12, color: '#e0c060', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                XP: <b style={{ color: '#f5d060' }}>{formatNumber(Math.floor(xp))}</b>
              </span>
              {xpPerHour > 0 && (
                <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 12, color: theme.accent, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <TrendingUp size={12} />
                  +{formatNumber(Math.floor(xpPerHour))}/ч
                </span>
              )}
            </div>
          </div>

          {/* Большой уровень */}
          <div style={{
            flexShrink: 0, textAlign: 'center', padding: '8px 16px',
            background: 'linear-gradient(180deg, #4a2810, #2e1608)',
            border: '2px solid #8b5020',
            borderRadius: 12,
            boxShadow: '0 3px 0 #1a0804, inset 0 1px 0 rgba(220,170,80,0.15)',
          }}>
            <div style={{ fontFamily: 'var(--app-font-mono)', fontSize: 36, fontWeight: 900, color: '#f5d060', lineHeight: 1, textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
              {level}
            </div>
            <div style={{ fontSize: 9, color: '#a07030', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--app-font-mono)', marginTop: 2 }}>
              Уровень
            </div>
          </div>
        </div>

        {/* ── XP Прогресс-бар ── */}
        <div style={{ marginTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 10, color: '#c8a050' }}>
              {level >= 99 ? 'Максимальный уровень' : `→ Ур. ${level + 1}`}
            </span>
            <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 10, color: '#d4a840', fontWeight: 700 }}>
              {level >= 99 ? '100%' : `${formatNumber(Math.floor(xpIntoLevel))} / ${formatNumber(Math.floor(xpRequiredForLevel))} XP`}
            </span>
          </div>
          {/* Трек */}
          <div style={{
            height: 12, background: '#1a0a04', border: '2px solid #5a3010',
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
