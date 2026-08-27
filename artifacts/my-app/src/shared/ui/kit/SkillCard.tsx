/**
 * SkillCard — круглая карточка навыка.
 * Иконка 90-95%, SVG кольцо XP вокруг, уровень снизу.
 * По клику — попап с деталями и кнопкой "Прокачать".
 */
import React, { memo, useState, useCallback } from 'react';
import { Link } from 'wouter';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { getLevelProgress, getXpForLevel } from '@/gameEngine/xpTable';
import { getSkillShortName, getSkillVisual } from '@/shared/icons/skillIcons';
import { formatNumber } from '@/lib/utils';
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

const SKILL_DESC: Record<string, string> = {
  woodcutting: 'Рубка деревьев и заготовка брёвен для ремёсел и костров.',
  mining:      'Добыча руды и самоцветов в глубинах гор.',
  fishing:     'Ловля рыбы в реках, озёрах и морях.',
  cooking:     'Приготовление еды для восполнения здоровья.',
  smithing:    'Плавка металлов и ковка оружия и брони.',
  firemaking:  'Разжигание костров и управление огнём.',
  attack:      'Мастерство ближнего боя и точность ударов.',
  strength:    'Физическая сила и мощь атак.',
  defence:     'Защита от вражеских атак и урона.',
  hitpoints:   'Запас здоровья и живучесть в бою.',
  ranged:      'Стрельба из луков и дальнобойного оружия.',
  magic:       'Владение заклинаниями и магическими силами.',
  prayer:      'Молитвы и благословения богов.',
  slayer:      'Охота на особых монстров за наградой.',
};

const COMBAT_SKILLS = new Set([
  'attack','strength','defence','hitpoints','ranged','magic','prayer','slayer',
]);

interface SkillCardProps {
  skillId: string;
  href?: string;
  /** Диаметр круга в px */
  diameter?: number;
}

/* ── Попап с деталями навыка ────────────────────────────────── */
function SkillPopup({
  skillId, onClose, linkPath,
}: { skillId: string; onClose: () => void; linkPath: string }) {
  const state    = usePlayerStore(s => s.skills[skillId as SkillId]) || { level: 1, xp: 0 };
  const visual   = getSkillVisual(skillId);
  const name     = getSkillShortName(skillId);
  const desc     = SKILL_DESC[skillId] || 'Навык персонажа.';
  const progress = getLevelProgress(state.xp);
  const curXp    = getXpForLevel(state.level);
  const nextXp   = getXpForLevel(state.level + 1);
  const xpLeft   = Math.max(0, nextXp - state.xp);
  const isMax    = state.level >= 99;

  return (
    <>
      {/* Оверлей */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(20,10,0,0.72)',
          backdropFilter: 'blur(3px)',
        }}
      />

      {/* Попап */}
      <div style={{
        position:  'fixed', zIndex: 101,
        left: '50%', top: '50%',
        transform: 'translate(-50%,-50%)',
        width: 'min(320px, 90vw)',
        background: 'linear-gradient(160deg,#7a5028,#4a2c10)',
        border:     '2px solid #c8880a',
        borderRadius: 20,
        boxShadow: '0 8px 0 #2a1005, 0 12px 40px rgba(10,4,0,0.7)',
        padding: '20px 18px 18px',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {/* Закрыть */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 10, right: 12,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#c8a050', fontSize: 18, lineHeight: 1, padding: 4,
          }}
        >✕</button>

        {/* Иконка + название */}
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(160deg,#2e1608,#1e0e04)',
            border: '2px solid #c8880a',
            boxShadow: '0 0 16px rgba(200,136,10,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            {visual.type === 'image'
              ? <img src={visual.value} alt={name} style={{ width:'85%', height:'85%', objectFit:'contain' }} />
              : <span style={{ fontSize: 30 }}>{visual.value}</span>
            }
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--app-font-display)', fontSize: 18, fontWeight: 900,
              color: '#fff8d0', textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}>{name}</div>
            <div style={{
              fontSize: 11, color: '#d4a840', fontFamily: 'var(--app-font-mono)', fontWeight: 700,
            }}>Уровень {state.level}{isMax ? ' (макс.)' : ''}</div>
          </div>
        </div>

        {/* Описание */}
        <p style={{
          fontSize: 12, color: '#c8a050', lineHeight: 1.5,
          margin: 0, padding: '8px 10px',
          background: 'rgba(20,10,0,0.35)', borderRadius: 10,
          border: '1px solid rgba(200,136,10,0.2)',
        }}>{desc}</p>

        {/* XP Прогресс */}
        {!isMax && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:11, color:'#a07838', fontFamily:'var(--app-font-mono)' }}>
                → Уровень {state.level + 1}
              </span>
              <span style={{ fontSize:11, color:'#d4a840', fontFamily:'var(--app-font-mono)', fontWeight:700 }}>
                {formatNumber(Math.floor(state.xp - curXp))} / {formatNumber(nextXp - curXp)} XP
              </span>
            </div>
            {/* Трек */}
            <div style={{
              height: 10, background: '#1a0a04', border: '2px solid #5a3010',
              borderRadius: 9999, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, progress * 100)}%`,
                background: 'linear-gradient(90deg,#c8880a,#f0c030)',
                borderRadius: 9999,
                boxShadow: '0 0 8px rgba(240,192,48,0.5)',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ fontSize:10, color:'#8b6030', fontFamily:'var(--app-font-mono)', marginTop:4, textAlign:'right' }}>
              Осталось: {formatNumber(xpLeft)} XP
            </div>
          </div>
        )}

        {/* Кнопка */}
        <Link
          href={linkPath}
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '11px 0', borderRadius: 12, textDecoration: 'none',
            background: 'linear-gradient(180deg,#c8880a,#9a6008)',
            border: '2px solid #6b4008',
            boxShadow: '0 3px 0 #3d2005, 0 0 16px rgba(200,136,10,0.35)',
            color: '#fff8d0', fontSize: 13, fontWeight: 800,
            fontFamily: 'var(--app-font-sans)',
            letterSpacing: '0.04em',
          }}
        >
          ⚡ Прокачать навык
        </Link>
      </div>
    </>
  );
}

/* ── Основная карточка ─────────────────────────────────────── */
export const SkillCard = memo(function SkillCard({
  skillId, href, diameter = 80,
}: SkillCardProps) {
  const state       = usePlayerStore(s => s.skills[skillId as SkillId]) || { level: 1, xp: 0 };
  const activeSkill = useGameStore(s => s.activeSkill);
  const [popup, setPopup] = useState(false);

  const isActive = activeSkill === skillId;
  const progress = getLevelProgress(state.xp);
  const visual   = getSkillVisual(skillId);
  const linkPath = href ?? SKILL_LINKS[skillId] ?? '/';

  // SVG параметры
  const D    = diameter;
  const SW   = Math.max(4, Math.round(D * 0.065)); // толщина кольца ~6.5% от D
  const R    = (D - SW) / 2;
  const C    = D / 2;
  const circ = 2 * Math.PI * R;
  const offset = circ * (1 - Math.min(1, progress));

  // Иконка — 88% от D
  const iconD = Math.round(D * 0.88);

  // Уровень badge
  const badgeD  = Math.max(20, Math.round(D * 0.30));
  const badgeFS = Math.max(9,  Math.round(D * 0.135));

  // Цвета
  const ringFill  = isActive ? '#f0c030' : '#c8880a';
  const ringTrack = '#5a3010';
  const ringGlow  = isActive ? 'rgba(240,192,48,0.6)' : 'none';
  const badgeBg   = isActive ? '#f0c030' : '#1e0c04';
  const badgeFg   = isActive ? '#1a0800' : '#d4a840';
  const cardBg    = isActive
    ? 'radial-gradient(circle at 50% 40%,rgba(200,136,10,0.18),transparent 70%)'
    : 'none';
  const cardBorder = isActive ? '#c8880a' : 'transparent';

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setPopup(true);
  }, []);

  return (
    <>
      {/* Карточка */}
      <div
        onClick={handleClick}
        style={{
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          gap:           4,
          padding:       '6px 4px 6px',
          borderRadius:  14,
          background:    cardBg,
          border:        `2px solid ${cardBorder}`,
          cursor:        'pointer',
          transition:    'all 0.14s ease',
          position:      'relative',
          userSelect:    'none',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = 'translateY(-3px) scale(1.04)';
          el.style.borderColor = '#c8880a';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = '';
          el.style.borderColor = cardBorder;
        }}
      >
        {/* Активный dot */}
        {isActive && (
          <div style={{
            position: 'absolute', top: 4, right: 4,
            width: 8, height: 8, borderRadius: '50%',
            background: '#f0c030',
            boxShadow: '0 0 8px rgba(240,192,48,0.9)',
            zIndex: 2,
          }} />
        )}

        {/* SVG кольцо + иконка */}
        <div style={{ position: 'relative', width: D, height: D }}>

          {/* SVG кольцо */}
          <svg
            width={D} height={D}
            viewBox={`0 0 ${D} ${D}`}
            style={{ position:'absolute', inset:0, transform:'rotate(-90deg)' }}
          >
            {/* Трек */}
            <circle cx={C} cy={C} r={R} fill="none" stroke={ringTrack} strokeWidth={SW} />
            {/* Прогресс */}
            {progress > 0 && (
              <circle
                cx={C} cy={C} r={R}
                fill="none"
                stroke={ringFill}
                strokeWidth={SW}
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.5s ease',
                  filter: isActive ? `drop-shadow(0 0 4px ${ringFill})` : 'none',
                }}
              />
            )}
          </svg>

          {/* Иконка — 88% от D, по центру */}
          <div style={{
            position:  'absolute',
            top:       '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width:     iconD, height: iconD,
            borderRadius: '50%',
            background: 'linear-gradient(160deg,#2e1608,#1e0e04)',
            border:    `1.5px solid ${isActive ? '#c8880a88' : '#5a3010'}`,
            boxShadow: isActive
              ? `inset 0 2px 6px rgba(0,0,0,0.55), 0 0 12px ${ringGlow}`
              : 'inset 0 2px 6px rgba(0,0,0,0.55)',
            display:   'flex', alignItems:'center', justifyContent:'center',
            overflow:  'hidden',
          }}>
            {visual.type === 'image' ? (
              <img
                src={visual.value}
                alt=""
                style={{
                  width:'88%', height:'88%', objectFit:'contain',
                  filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.6))',
                }}
              />
            ) : (
              <span style={{
                fontSize:   Math.round(iconD * 0.56),
                lineHeight: 1,
                filter:     'drop-shadow(0 1px 4px rgba(0,0,0,0.5))',
              }}>
                {visual.value}
              </span>
            )}
          </div>

          {/* Уровень badge — по центру нижнего края круга */}
          <div style={{
            position:  'absolute',
            bottom:    -Math.round(badgeD * 0.4),
            left:      '50%',
            transform: 'translateX(-50%)',
            minWidth:  badgeD, height: badgeD,
            borderRadius: 9999,
            background: badgeBg,
            border:    `2px solid ${isActive ? '#f0c030' : '#6b3818'}`,
            boxShadow: isActive
              ? '0 0 10px rgba(240,192,48,0.55), 0 2px 4px rgba(0,0,0,0.5)'
              : '0 2px 4px rgba(0,0,0,0.55)',
            display:   'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'var(--app-font-mono)',
            fontSize:  badgeFS,
            fontWeight:900,
            color:     badgeFg,
            lineHeight:1,
            padding:   '0 5px',
            zIndex:    3,
          }}>
            {state.level}
          </div>
        </div>

        {/* Отступ под badge */}
        <div style={{ height: Math.round(badgeD * 0.45) }} />
      </div>

      {/* Попап */}
      {popup && (
        <SkillPopup
          skillId={skillId}
          linkPath={linkPath}
          onClose={() => setPopup(false)}
        />
      )}
    </>
  );
});
