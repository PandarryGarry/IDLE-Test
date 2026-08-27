/**
 * SkillCard — круглая карточка навыка с круговым XP-баром.
 * Стиль: Melvor Idle / Wooden Tavern.
 */
import React, { memo } from 'react';
import { Link } from 'wouter';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { getLevelProgress } from '@/gameEngine/xpTable';
import { getSkillShortName, getSkillVisual } from '@/shared/icons/skillIcons';
import type { SkillId } from '@/data/types';

export const SKILL_LINKS: Record<string, string> = {
  woodcutting: '/woodcutting', mining: '/mining', fishing: '/fishing',
  cooking: '/cooking', smithing: '/smithing', firemaking: '/firemaking',
  attack: '/combat', strength: '/combat', defence: '/combat', hitpoints: '/combat',
  ranged: '/combat', magic: '/combat', prayer: '/combat', slayer: '/combat',
  fletching: '/combat', crafting: '/combat', runecrafting: '/combat',
  herblore: '/combat', farming: '/combat', agility: '/combat',
  thieving: '/combat', summoning: '/combat', astrology: '/combat',
};

const COMBAT_SKILLS = new Set([
  'attack', 'strength', 'defence', 'hitpoints',
  'ranged', 'magic', 'prayer', 'slayer',
]);

interface SkillCardProps {
  skillId: string;
  href?: string;
  /** sm = 80px, md = 96px, lg = 112px — диаметр круга */
  size?: 'sm' | 'md' | 'lg';
}

export const SkillCard = memo(function SkillCard({
  skillId, href, size = 'sm',
}: SkillCardProps) {
  const state       = usePlayerStore(s => s.skills[skillId as SkillId]) || { level: 1, xp: 0 };
  const activeSkill = useGameStore(s => s.activeSkill);

  const isActive = activeSkill === skillId;
  const isCombat = COMBAT_SKILLS.has(skillId);
  const progress = getLevelProgress(state.xp);           // 0..1
  const name     = getSkillShortName(skillId);
  const visual   = getSkillVisual(skillId);
  const link     = href ?? SKILL_LINKS[skillId] ?? '/';

  // ── Размеры ────────────────────────────────────────────────
  const D   = size === 'sm' ? 80  : size === 'lg' ? 112 : 96;   // диаметр SVG
  const SW  = size === 'sm' ? 5   : size === 'lg' ? 7   : 6;    // stroke-width
  const R   = (D - SW) / 2;                                       // радиус
  const C   = D / 2;                                              // центр
  const circ = 2 * Math.PI * R;
  const offset = circ * (1 - Math.min(1, progress));

  // Диаметр внутреннего круга иконки (≈73% от D)
  const iconD    = Math.round(D * 0.80);
  const iconFontSize = Math.round(iconD * 0.55);
  const nameFS   = size === 'sm' ? 10 : size === 'lg' ? 13 : 11;
  const badgeD   = size === 'sm' ? 22 : size === 'lg' ? 28 : 24;
  const badgeFS  = size === 'sm' ? 10 : size === 'lg' ? 13 : 11;

  // ── Цвета ──────────────────────────────────────────────────
  // Активный — золото; боевой неактивный — тёмно-красный акцент; остальные — нейтральный
  const ringColor   = isActive ? '#f0c030' : isCombat ? '#c84030' : '#8b5020';
  const ringGlow    = isActive ? 'rgba(240,192,48,0.6)' : isCombat ? 'rgba(200,64,48,0.4)' : 'none';
  const badgeBg     = isActive ? '#f0c030' : '#2e1608';
  const badgeColor  = isActive ? '#1a0800' : '#d4a840';
  const nameColor   = isActive ? '#fff8d0' : '#e0c070';
  const outerBorder = isActive ? '#c8880a' : '#5a3010';
  const outerBg     = isActive
    ? 'linear-gradient(160deg,#4a2c0a,#2e1a06)'
    : 'linear-gradient(160deg,#7a5028,#5a3818)';
  const outerShadow = isActive
    ? `0 3px 0 #2a1005,0 0 16px ${ringGlow}`
    : '0 3px 0 #3d1e08';

  // ── Контейнер карточки ────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    gap:            5,
    padding:        '8px 6px 7px',
    borderRadius:   16,
    background:     outerBg,
    border:         `2px solid ${outerBorder}`,
    boxShadow:      outerShadow,
    cursor:         'pointer',
    transition:     'all 0.15s ease',
    position:       'relative',
    userSelect:     'none',
    minWidth:       D + 8,
  };

  return (
    <Link href={link} style={{ display: 'block', textDecoration: 'none' }}>
      <div
        style={cardStyle}
        onMouseEnter={e => {
          if (!isActive) {
            const el = e.currentTarget as HTMLDivElement;
            el.style.borderColor = '#c8880a';
            el.style.transform   = 'translateY(-3px)';
            el.style.boxShadow   = '0 5px 0 #3d1e08, 0 0 12px rgba(200,136,10,0.25)';
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            const el = e.currentTarget as HTMLDivElement;
            el.style.borderColor = outerBorder;
            el.style.transform   = '';
            el.style.boxShadow   = outerShadow;
          }
        }}
      >
        {/* ── Активный dot (правый верхний угол) ── */}
        {isActive && (
          <div style={{
            position: 'absolute', top: 6, right: 6,
            width: 8, height: 8, borderRadius: '50%',
            background: '#f0c030',
            boxShadow: '0 0 8px rgba(240,192,48,0.8)',
          }} />
        )}

        {/* ── Круг с прогресс-баром (SVG) ── */}
        <div style={{ position: 'relative', width: D, height: D, flexShrink: 0 }}>

          {/* SVG круговой прогресс */}
          <svg
            width={D} height={D}
            style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
            viewBox={`0 0 ${D} ${D}`}
          >
            {/* Трек (фон) */}
            <circle
              cx={C} cy={C} r={R}
              fill="none"
              stroke="#3d1e08"
              strokeWidth={SW}
            />
            {/* Заполнение */}
            <circle
              cx={C} cy={C} r={R}
              fill="none"
              stroke={ringColor}
              strokeWidth={SW}
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.4s ease',
                filter: isActive ? `drop-shadow(0 0 4px ${ringColor})` : 'none',
              }}
            />
          </svg>

          {/* Иконка — внутренний круг */}
          <div style={{
            position:   'absolute',
            top:        '50%', left: '50%',
            transform:  'translate(-50%,-50%)',
            width:      iconD, height: iconD,
            borderRadius: '50%',
            background: 'linear-gradient(160deg,#2e1608,#1e0e04)',
            border:     `2px solid ${isActive ? ringColor + '99' : '#5a3010'}`,
            boxShadow:  'inset 0 2px 8px rgba(0,0,0,0.6)',
            display:    'flex', alignItems: 'center', justifyContent: 'center',
            overflow:   'hidden',
          }}>
            {visual.type === 'image' ? (
              <img
                src={visual.value}
                alt={name}
                style={{
                  width: '80%', height: '80%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))',
                }}
              />
            ) : (
              <span style={{
                fontSize:   iconFontSize,
                lineHeight: 1,
                filter:     'drop-shadow(0 1px 3px rgba(0,0,0,0.5))',
              }}>
                {visual.value}
              </span>
            )}
          </div>

          {/* Бейдж уровня — нижний центр круга */}
          <div style={{
            position:   'absolute',
            bottom:     -badgeD * 0.28,
            left:       '50%',
            transform:  'translateX(-50%)',
            minWidth:   badgeD, height: badgeD,
            borderRadius: 9999,
            background: badgeBg,
            border:     `2px solid ${isActive ? '#f0c030' : '#6b3810'}`,
            boxShadow:  isActive ? '0 0 10px rgba(240,192,48,0.5)' : '0 2px 4px rgba(0,0,0,0.5)',
            display:    'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--app-font-mono)',
            fontSize:   badgeFS,
            fontWeight: 900,
            color:      badgeColor,
            lineHeight: 1,
            padding:    '0 5px',
            zIndex:     2,
          }}>
            {state.level}
          </div>
        </div>

        {/* Отступ под бейдж */}
        <div style={{ height: badgeD * 0.32 }} />

        {/* Название */}
        <span style={{
          fontSize:      nameFS,
          fontWeight:    700,
          color:         nameColor,
          textAlign:     'center',
          lineHeight:    1.2,
          width:         '100%',
          overflow:      'hidden',
          textOverflow:  'ellipsis',
          whiteSpace:    'nowrap',
          textShadow:    '0 1px 2px rgba(0,0,0,0.6)',
          padding:       '0 2px',
        }}>
          {name}
        </span>
      </div>
    </Link>
  );
});
