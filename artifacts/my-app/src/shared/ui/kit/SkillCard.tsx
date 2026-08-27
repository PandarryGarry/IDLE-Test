/**
 * SkillCard — универсальная карточка навыка.
 *
 * Принимает любую иконку (эмодзи или PNG) и рендерит
 * единообразную карточку в стиле Wooden Tavern.
 *
 * Использование:
 *   <SkillCard skillId="woodcutting" />
 *   <SkillCard skillId="combat" isActive />
 */
import React, { memo } from 'react';
import { Link } from 'wouter';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { getLevelProgress } from '@/gameEngine/xpTable';
import { getSkillShortName, getSkillVisual } from '@/shared/icons/skillIcons';
import type { SkillId } from '@/data/types';

const SKILL_LINKS: Record<string, string> = {
  woodcutting: '/woodcutting', mining: '/mining', fishing: '/fishing',
  cooking: '/cooking', smithing: '/smithing', firemaking: '/firemaking',
  attack: '/combat', strength: '/combat', defence: '/combat', hitpoints: '/combat',
  ranged: '/combat', magic: '/combat', prayer: '/combat', slayer: '/combat',
  fletching: '/combat', crafting: '/combat', runecrafting: '/combat',
  herblore: '/combat', farming: '/combat', agility: '/combat',
  thieving: '/combat', summoning: '/combat', astrology: '/combat',
};

// Только два акцента: золото (всё) и красный (бой)
const COMBAT_SKILLS = new Set(['attack','strength','defence','hitpoints','ranged','magic','prayer','slayer']);

interface SkillCardProps {
  skillId: string;
  /** Переопределить ссылку */
  href?: string;
  /** Размер карточки */
  size?: 'sm' | 'md' | 'lg';
}

export const SkillCard = memo(function SkillCard({ skillId, href, size = 'md' }: SkillCardProps) {
  const state       = usePlayerStore(s => s.skills[skillId as SkillId]) || { level: 1, xp: 0 };
  const activeSkill = useGameStore(s => s.activeSkill);
  const inCombat    = useGameStore(s => s.activeSkill && COMBAT_SKILLS.has(s.activeSkill));

  const isActive  = activeSkill === skillId;
  const isCombat  = COMBAT_SKILLS.has(skillId);
  const progress  = getLevelProgress(state.xp);
  const shortName = getSkillShortName(skillId);
  const visual    = getSkillVisual(skillId);
  const linkPath  = href ?? SKILL_LINKS[skillId] ?? '/';

  // Размеры
  const cardSize  = size === 'sm' ? 68 : size === 'lg' ? 100 : 84;
  const iconSize  = size === 'sm' ? 36 : size === 'lg' ? 56 : 44;
  const fontSize  = size === 'sm' ? 9  : size === 'lg' ? 13  : 11;
  const barH      = size === 'sm' ? 3  : 4;
  const badgeSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;

  // Цвет акцента
  const accentColor = isActive && isCombat ? '#e04040'
                    : isActive             ? '#f0c030'
                    : isCombat             ? '#c85040'
                    :                        '#8b6030';

  const cardStyle: React.CSSProperties = {
    width: cardSize,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 5,
    padding: '10px 6px 8px',
    borderRadius: 14,
    background: isActive
      ? 'linear-gradient(160deg, #4a2c0a, #2e1a06)'
      : 'linear-gradient(160deg, #8a6030, #6a4820)',
    border: `2px solid ${isActive ? accentColor : '#5a3010'}`,
    boxShadow: isActive
      ? `0 3px 0 #2a1005, 0 0 16px ${accentColor}44`
      : '0 3px 0 #3d1e08, inset 0 1px 0 rgba(220,170,80,0.12)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    position: 'relative',
    userSelect: 'none',
    textDecoration: 'none',
  };

  // Иконка — ячейка тёмного дерева
  const iconSlotStyle: React.CSSProperties = {
    width: iconSize,
    height: iconSize,
    borderRadius: 10,
    background: 'linear-gradient(160deg, #2e1608, #1e0e04)',
    border: `2px solid ${isActive ? accentColor + '88' : '#6b3810'}`,
    boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.55), inset 0 1px 0 rgba(200,150,50,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  };

  // XP полоса под иконкой
  const trackStyle: React.CSSProperties = {
    width: iconSize,
    height: barH,
    background: '#1a0a04',
    border: '1px solid #4a2a10',
    borderRadius: 9999,
    overflow: 'hidden',
  };

  const fillStyle: React.CSSProperties = {
    height: '100%',
    width: `${Math.min(100, progress * 100)}%`,
    background: isActive
      ? `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`
      : 'linear-gradient(90deg, #8b5020, #c8880a)',
    borderRadius: 9999,
    transition: 'width 0.3s ease',
    boxShadow: isActive ? `0 0 6px ${accentColor}66` : 'none',
  };

  // Уровень badge
  const badgeStyle: React.CSSProperties = {
    minWidth: badgeSize,
    height: badgeSize,
    borderRadius: 9999,
    background: isActive ? accentColor : '#2e1608',
    border: `1.5px solid ${isActive ? accentColor : '#6b3810'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--app-font-mono)',
    fontSize: badgeSize * 0.6,
    fontWeight: 900,
    color: isActive ? '#fff8d0' : '#d4a840',
    lineHeight: 1,
    padding: '0 4px',
    boxShadow: isActive ? `0 0 8px ${accentColor}66` : 'none',
  };

  const nameStyle: React.CSSProperties = {
    fontSize,
    fontWeight: 700,
    color: isActive ? '#fff8d0' : '#e0c070',
    textAlign: 'center',
    lineHeight: 1.2,
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textShadow: '0 1px 2px rgba(0,0,0,0.6)',
  };

  const card = (
    <div
      style={cardStyle}
      onMouseEnter={e => {
        if (!isActive) {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLDivElement).style.borderColor = '#c8880a';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          (e.currentTarget as HTMLDivElement).style.transform = '';
          (e.currentTarget as HTMLDivElement).style.borderColor = '#5a3010';
        }
      }}
    >
      {/* Активный индикатор */}
      {isActive && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          width: 7, height: 7, borderRadius: '50%',
          background: accentColor,
          boxShadow: `0 0 6px ${accentColor}`,
        }} />
      )}

      {/* Иконка */}
      <div style={iconSlotStyle}>
        {visual.type === 'image' ? (
          <img
            src={visual.value}
            alt={shortName}
            style={{ width: '78%', height: '78%', objectFit: 'contain' }}
          />
        ) : (
          <span style={{ fontSize: iconSize * 0.55, lineHeight: 1 }}>
            {visual.value}
          </span>
        )}
      </div>

      {/* XP полоса */}
      <div style={trackStyle}>
        <div style={fillStyle} />
      </div>

      {/* Уровень */}
      <div style={badgeStyle}>{state.level}</div>

      {/* Название */}
      <span style={nameStyle}>{shortName}</span>
    </div>
  );

  return (
    <Link href={linkPath} style={{ display: 'block', textDecoration: 'none' }}>
      {card}
    </Link>
  );
});
