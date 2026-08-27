/**
 * SkillCard — круглая карточка навыка.
 * Уровень — внутри круга, в нижней части, поверх иконки.
 * По клику — попап с деталями.
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
  woodcutting:'/woodcutting', mining:'/mining', fishing:'/fishing',
  cooking:'/cooking', smithing:'/smithing', firemaking:'/firemaking',
  attack:'/combat', strength:'/combat', defence:'/combat', hitpoints:'/combat',
  ranged:'/combat', magic:'/combat', prayer:'/combat', slayer:'/combat',
  fletching:'/combat', crafting:'/combat', runecrafting:'/combat',
  herblore:'/combat', farming:'/combat', agility:'/combat',
  thieving:'/combat', summoning:'/combat', astrology:'/combat',
};

const SKILL_DESC: Record<string, string> = {
  woodcutting: 'Рубка деревьев для ремёсел и костров.',
  mining:      'Добыча руды и самоцветов в горах.',
  fishing:     'Ловля рыбы в реках и морях.',
  cooking:     'Приготовление еды для восполнения HP.',
  smithing:    'Ковка оружия и брони из металлов.',
  firemaking:  'Разжигание костров и управление огнём.',
  attack:      'Мастерство ближнего боя.',
  strength:    'Физическая сила и мощь атак.',
  defence:     'Защита от вражеских атак.',
  hitpoints:   'Запас здоровья и живучесть.',
  ranged:      'Стрельба из дальнобойного оружия.',
  magic:       'Владение заклинаниями.',
  prayer:      'Молитвы и благословения.',
  slayer:      'Охота на особых монстров.',
};

const COMBAT_SET = new Set(['attack','strength','defence','hitpoints','ranged','magic','prayer','slayer']);

interface SkillCardProps {
  skillId: string;
  href?: string;
  diameter?: number;
}

/* ── Попап ─────────────────────────────────────────────── */
function Popup({ skillId, onClose, link }: { skillId:string; onClose:()=>void; link:string }) {
  const st   = usePlayerStore(s => s.skills[skillId as SkillId]) || { level:1, xp:0 };
  const vis  = getSkillVisual(skillId);
  const name = getSkillShortName(skillId);
  const desc = SKILL_DESC[skillId] || 'Навык персонажа.';
  const prog = getLevelProgress(st.xp);
  const cur  = getXpForLevel(st.level);
  const nxt  = getXpForLevel(st.level + 1);
  const left = Math.max(0, nxt - st.xp);
  const max  = st.level >= 99;

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed',inset:0,zIndex:100,background:'rgba(15,8,0,0.75)',backdropFilter:'blur(4px)' }} />
      <div style={{
        position:'fixed',zIndex:101,left:'50%',top:'50%',transform:'translate(-50%,-50%)',
        width:'min(300px,88vw)',
        background:'linear-gradient(160deg,#7a5028,#4a2c10)',
        border:'2px solid #c8880a',borderRadius:20,
        boxShadow:'0 8px 0 #2a1005,0 12px 40px rgba(10,4,0,0.7)',
        padding:'18px 16px',display:'flex',flexDirection:'column',gap:12,
      }}>
        <button onClick={onClose} style={{ position:'absolute',top:10,right:12,background:'none',border:'none',cursor:'pointer',color:'#c8a050',fontSize:18,padding:4 }}>✕</button>

        <div style={{ display:'flex',alignItems:'center',gap:12 }}>
          <div style={{ width:54,height:54,borderRadius:'50%',flexShrink:0,background:'linear-gradient(160deg,#2e1608,#1e0e04)',border:'2px solid #c8880a',boxShadow:'0 0 14px rgba(200,136,10,0.4)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden' }}>
            {vis.type==='image'
              ? <img src={vis.value} alt={name} style={{ width:'82%',height:'82%',objectFit:'contain' }} />
              : <span style={{ fontSize:28 }}>{vis.value}</span>}
          </div>
          <div>
            <div style={{ fontFamily:'var(--app-font-display)',fontSize:18,fontWeight:900,color:'#fff8d0',textShadow:'0 2px 4px rgba(0,0,0,0.5)' }}>{name}</div>
            <div style={{ fontSize:11,color:'#d4a840',fontFamily:'var(--app-font-mono)',fontWeight:700 }}>Уровень {st.level}{max?' (макс.)':''}</div>
          </div>
        </div>

        <p style={{ fontSize:12,color:'#c8a050',lineHeight:1.5,margin:0,padding:'8px 10px',background:'rgba(20,10,0,0.35)',borderRadius:10,border:'1px solid rgba(200,136,10,0.2)' }}>{desc}</p>

        {!max && (
          <div>
            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:5 }}>
              <span style={{ fontSize:10,color:'#a07838',fontFamily:'var(--app-font-mono)' }}>→ Ур. {st.level+1}</span>
              <span style={{ fontSize:10,color:'#d4a840',fontFamily:'var(--app-font-mono)',fontWeight:700 }}>{formatNumber(Math.floor(st.xp-cur))} / {formatNumber(nxt-cur)} XP</span>
            </div>
            <div style={{ height:8,background:'#1a0a04',border:'2px solid #5a3010',borderRadius:9999,overflow:'hidden' }}>
              <div style={{ height:'100%',width:`${Math.min(100,prog*100)}%`,background:'linear-gradient(90deg,#c8880a,#f0c030)',borderRadius:9999,boxShadow:'0 0 8px rgba(240,192,48,0.5)',transition:'width 0.4s' }} />
            </div>
            <div style={{ fontSize:9,color:'#8b6030',fontFamily:'var(--app-font-mono)',marginTop:3,textAlign:'right' }}>Осталось: {formatNumber(left)} XP</div>
          </div>
        )}

        <Link href={link} onClick={onClose} style={{
          display:'flex',alignItems:'center',justifyContent:'center',gap:8,
          padding:'10px 0',borderRadius:12,textDecoration:'none',
          background:'linear-gradient(180deg,#c8880a,#9a6008)',
          border:'2px solid #6b4008',
          boxShadow:'0 3px 0 #3d2005,0 0 16px rgba(200,136,10,0.35)',
          color:'#fff8d0',fontSize:13,fontWeight:800,
        }}>⚡ Прокачать навык</Link>
      </div>
    </>
  );
}

/* ── Карточка ──────────────────────────────────────────── */
export const SkillCard = memo(function SkillCard({ skillId, href, diameter=72 }: SkillCardProps) {
  const st          = usePlayerStore(s => s.skills[skillId as SkillId]) || { level:1, xp:0 };
  const activeSkill = useGameStore(s => s.activeSkill);
  const [popup, setPopup] = useState(false);

  const isActive = activeSkill === skillId;
  const progress = getLevelProgress(st.xp);
  const visual   = getSkillVisual(skillId);
  const link     = href ?? SKILL_LINKS[skillId] ?? '/';

  // SVG
  const D    = diameter;
  const SW   = Math.max(4, Math.round(D * 0.07));
  const R    = (D - SW) / 2;
  const C    = D / 2;
  const circ = 2 * Math.PI * R;
  const offs = circ * (1 - Math.min(1, progress));

  // Иконка — 80% от D (с запасом под badge внизу)
  const iconD = Math.round(D * 0.80);

  // Бейдж — маленький, нижняя часть круга, ВНУТРИ
  const badgeH  = Math.round(D * 0.27);
  const badgeFS = Math.round(D * 0.14);
  // Позиция badge: снизу иконки, но внутри SVG-круга
  // bottomInset = SW + небольшой отступ от края кольца
  // Badge — внутри круга у нижнего края, но не касается кольца
  const badgeBottom = SW + Math.round(D * 0.07);

  // Цвета
  const ring   = isActive ? '#f0c030' : '#c8880a';
  const track  = '#5a3010';
  const cardBg = isActive
    ? 'radial-gradient(circle at 50% 40%,rgba(200,136,10,0.2),transparent 72%)'
    : 'none';
  const cardBorder = isActive ? '#c8880a' : 'transparent';

  return (
    <>
      <div
        onClick={() => setPopup(true)}
        style={{
          display:'flex',flexDirection:'column',alignItems:'center',gap:4,
          padding:'6px 4px 6px',borderRadius:14,
          background:cardBg,border:`2px solid ${cardBorder}`,
          cursor:'pointer',transition:'all 0.14s ease',
          position:'relative',userSelect:'none',
        }}
        onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='translateY(-3px) scale(1.05)';el.style.borderColor='#c8880a';}}
        onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='';el.style.borderColor=cardBorder;}}
      >
        {/* Активный dot */}
        {isActive && (
          <div style={{ position:'absolute',top:4,right:4,width:7,height:7,borderRadius:'50%',background:'#f0c030',boxShadow:'0 0 8px rgba(240,192,48,0.9)',zIndex:2 }} />
        )}

        {/* ── Круг: SVG кольцо + иконка + badge внутри ── */}
        <div style={{ position:'relative',width:D,height:D,flexShrink:0 }}>

          {/* SVG кольцо */}
          <svg width={D} height={D} viewBox={`0 0 ${D} ${D}`}
            style={{ position:'absolute',inset:0,transform:'rotate(-90deg)' }}>
            <circle cx={C} cy={C} r={R} fill="none" stroke={track} strokeWidth={SW} />
            {progress > 0 && (
              <circle cx={C} cy={C} r={R} fill="none"
                stroke={ring} strokeWidth={SW}
                strokeDasharray={circ} strokeDashoffset={offs}
                strokeLinecap="round"
                style={{ transition:'stroke-dashoffset 0.5s ease',
                  filter:isActive?`drop-shadow(0 0 4px ${ring})`:'none' }} />
            )}
          </svg>

          {/* Иконка */}
          <div style={{
            position:'absolute',top:'50%',left:'50%',
            transform:'translate(-50%,-50%)',
            width:iconD,height:iconD,borderRadius:'50%',
            background:'linear-gradient(160deg,#2e1608,#1e0e04)',
            border:`1.5px solid ${isActive?'#c8880a88':'#5a3010'}`,
            boxShadow:isActive?`inset 0 2px 6px rgba(0,0,0,0.55),0 0 12px rgba(240,192,48,0.25)`:'inset 0 2px 6px rgba(0,0,0,0.55)',
            display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',
          }}>
            {visual.type==='image'
              ? <img src={visual.value} alt="" style={{ width:'85%',height:'85%',objectFit:'contain',filter:'drop-shadow(0 1px 4px rgba(0,0,0,0.6))' }} />
              : <span style={{ fontSize:Math.round(iconD*0.52),lineHeight:1,filter:'drop-shadow(0 1px 4px rgba(0,0,0,0.5))' }}>{visual.value}</span>
            }
          </div>


        </div>

        {/* Badge уровня — поверх нижней части круга */}
        <div style={{
          /* убрано */
          minWidth: Math.round(D * 0.38), height: badgeH,
          borderRadius: 9999, zIndex: 3, position: 'relative',
          background: 'rgba(15,6,0,0.9)',
          border: `1.5px solid ${isActive ? '#f0c030' : '#8b5020'}`,
          boxShadow: isActive ? '0 0 8px rgba(240,192,48,0.6)' : '0 1px 4px rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--app-font-mono)',
          fontSize: badgeFS, fontWeight: 900,
          color: isActive ? '#f5d060' : '#c8a040',
          lineHeight: 1, padding: '0 5px',
        }}>
          {st.level}
        </div>
      </div>

      {popup && <Popup skillId={skillId} onClose={() => setPopup(false)} link={link} />}
    </>
  );
});
