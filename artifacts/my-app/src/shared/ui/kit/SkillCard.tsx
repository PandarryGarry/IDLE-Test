/**
 * SkillCard — универсальная карточка навыка.
 * Адаптивная: на мобайле 4 в ряд (size=sm), на десктопе md/lg.
 */
import React, { memo } from 'react';
import { Link } from 'wouter';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { getLevelProgress } from '@/gameEngine/xpTable';
import { getSkillShortName, getSkillVisual } from '@/shared/icons/skillIcons';
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

const COMBAT_SKILLS = new Set(['attack','strength','defence','hitpoints','ranged','magic','prayer','slayer']);

interface SkillCardProps {
  skillId: string;
  href?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SkillCard = memo(function SkillCard({ skillId, href, size = 'md' }: SkillCardProps) {
  const state       = usePlayerStore(s => s.skills[skillId as SkillId]) || { level: 1, xp: 0 };
  const activeSkill = useGameStore(s => s.activeSkill);

  const isActive = activeSkill === skillId;
  const isCombat = COMBAT_SKILLS.has(skillId);
  const progress = getLevelProgress(state.xp);
  const name     = getSkillShortName(skillId);
  const visual   = getSkillVisual(skillId);
  const link     = href ?? SKILL_LINKS[skillId] ?? '/';

  // Размеры
  const W  = size === 'sm' ? 72  : size === 'lg' ? 104 : 84;
  const IS = size === 'sm' ? 38  : size === 'lg' ? 58  : 46;  // icon slot
  const FS = size === 'sm' ? 9   : size === 'lg' ? 13  : 11;  // font
  const BH = size === 'sm' ? 3   : 4;                          // bar height
  const BS = size === 'sm' ? 17  : size === 'lg' ? 22  : 19;  // badge

  const accent = isActive && isCombat ? '#e04040' : isActive ? '#f0c030' : '#8b6030';

  return (
    <Link href={link} style={{ display:'block', textDecoration:'none', width: W }}>
      <div
        style={{
          width: W, display:'flex', flexDirection:'column', alignItems:'center',
          gap: 4, padding: '9px 5px 7px',
          borderRadius: 12,
          background: isActive
            ? 'linear-gradient(160deg,#4a2c0a,#2e1a06)'
            : 'linear-gradient(160deg,#8a6030,#6a4820)',
          border: `2px solid ${isActive ? accent : '#5a3010'}`,
          boxShadow: isActive
            ? `0 3px 0 #2a1005,0 0 14px ${accent}44`
            : '0 3px 0 #3d1e08,inset 0 1px 0 rgba(220,170,80,0.1)',
          cursor:'pointer', transition:'all 0.12s', position:'relative', userSelect:'none',
        }}
        onMouseEnter={e=>{if(!isActive){(e.currentTarget as HTMLDivElement).style.borderColor='#c8880a';(e.currentTarget as HTMLDivElement).style.transform='translateY(-2px)';}}}
        onMouseLeave={e=>{if(!isActive){(e.currentTarget as HTMLDivElement).style.borderColor='#5a3010';(e.currentTarget as HTMLDivElement).style.transform='';}}}
      >
        {/* Активный dot */}
        {isActive && (
          <div style={{position:'absolute',top:5,right:5,width:6,height:6,borderRadius:'50%',background:accent,boxShadow:`0 0 5px ${accent}`}} />
        )}

        {/* Иконка */}
        <div style={{
          width:IS, height:IS, borderRadius:9, flexShrink:0,
          background:'linear-gradient(160deg,#2e1608,#1e0e04)',
          border:`2px solid ${isActive ? accent+'88' : '#6b3810'}`,
          boxShadow:'inset 0 2px 5px rgba(0,0,0,0.55)',
          display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden',
        }}>
          {visual.type === 'image' ? (
            <img src={visual.value} alt={name} style={{width:'76%',height:'76%',objectFit:'contain'}} />
          ) : (
            <span style={{fontSize: IS * 0.52, lineHeight:1}}>{visual.value}</span>
          )}
        </div>

        {/* XP полоса */}
        <div style={{width:IS,height:BH,background:'#1a0a04',border:'1px solid #4a2a10',borderRadius:9999,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${Math.min(100,progress*100)}%`,background:isActive?`linear-gradient(90deg,${accent},${accent}cc)`:'linear-gradient(90deg,#8b5020,#c8880a)',borderRadius:9999,transition:'width 0.3s'}} />
        </div>

        {/* Уровень */}
        <div style={{
          minWidth:BS,height:BS,borderRadius:9999,
          background: isActive ? accent : '#2e1608',
          border:`1.5px solid ${isActive ? accent : '#6b3810'}`,
          display:'flex',alignItems:'center',justifyContent:'center',
          fontFamily:'var(--app-font-mono)',fontSize:BS*0.58,fontWeight:900,
          color: isActive ? '#fff8d0' : '#d4a840',lineHeight:1,padding:'0 4px',
          boxShadow: isActive ? `0 0 7px ${accent}66` : 'none',
        }}>{state.level}</div>

        {/* Название — не обрезаем, переносим */}
        <span style={{
          fontSize:FS, fontWeight:700, color: isActive ? '#fff8d0' : '#e0c070',
          textAlign:'center', lineHeight:1.2, width:'100%',
          display:'-webkit-box', WebkitLineClamp:2,
          WebkitBoxOrient:'vertical', overflow:'hidden',
          textShadow:'0 1px 2px rgba(0,0,0,0.6)',
          wordBreak:'break-word',
        }}>{name}</span>
      </div>
    </Link>
  );
});
