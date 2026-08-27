import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { useCombatStore } from '@/store/combatStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { Link } from 'wouter';
import { useTranslation } from '@/hooks/useTranslation';
import { ActionProgressBar } from '@/components/ActionProgressBar';
import { SkillCard } from '@/shared/ui/kit/SkillCard';
import { getSkillVisual, getSkillShortName } from '@/shared/icons/skillIcons';
import { formatNumber } from '@/lib/utils';
import { ArrowUpRight, Moon } from 'lucide-react';
import type { SkillId } from '@/data/types';
import { COMBAT_SKILLS, GATHERING_SKILLS, CRAFTING_SKILLS } from '@/data/types';
import { calculateOfflineProgress, applyOfflineProgress } from '@/gameEngine/offlineProgress';
import type { OfflineResult } from '@/gameEngine/offlineProgress';

/* ══════════════════════════════════════════════════════════════
   СТИЛИ
══════════════════════════════════════════════════════════════ */
const PANEL: React.CSSProperties = {
  background: 'linear-gradient(160deg,#7a5028,#5a3818)',
  border:     '2px solid #5a3010',
  borderRadius: 16,
  boxShadow:  '0 4px 0 #3d1e08,0 6px 24px rgba(10,4,0,0.35),inset 0 1px 0 rgba(220,170,80,0.08)',
  padding:    '14px',
};

function SectionHeader({ icon, label }: { icon:string; label:string }) {
  return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:12 }}>
      <div style={{ flex:1,height:1,background:'linear-gradient(270deg,#8b5020,transparent)' }} />
      <span style={{ fontSize:13 }}>{icon}</span>
      <span style={{ fontFamily:'var(--app-font-mono)',fontSize:10,fontWeight:900,textTransform:'uppercase',letterSpacing:'0.12em',color:'#f0c030',textShadow:'0 0 12px rgba(240,192,48,0.5)' }}>{label}</span>
      <div style={{ flex:1,height:1,background:'linear-gradient(90deg,#8b5020,transparent)' }} />
    </div>
  );
}

function Tab({ label,active,onClick }: { label:string;active:boolean;onClick:()=>void }) {
  return (
    <button onClick={onClick} style={{
      flex:1,padding:'8px 0',borderRadius:9,cursor:'pointer',
      fontFamily:'var(--app-font-mono)',fontSize:10,fontWeight:800,
      border:`2px solid ${active?'#c8880a':'#4a2808'}`,
      background: active?'linear-gradient(180deg,#c8880a,#9a6008)':'linear-gradient(160deg,#4a2808,#321806)',
      color: active?'#fff8d0':'#9a6830',
      boxShadow: active?'0 2px 0 #3d2005,0 0 12px rgba(200,136,10,0.35)':'0 2px 0 #1e0c04',
      transition:'all 0.12s',
    }}>{label}</button>
  );
}

function SkillGrid({ ids }: { ids:readonly string[] }) {
  return (
    <div style={{ display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center' }}>
      {ids.map(id => <SkillCard key={id} skillId={id} diameter={72} />)}
    </div>
  );
}

/* ══ ОФФЛАЙН СВОДКА ══════════════════════════════════════════ */
function OfflineSummary({ result, onClaim }: { result:OfflineResult; onClaim:()=>void }) {
  const h = Math.floor(result.durationMinutes / 60);
  const m = result.durationMinutes % 60;
  const timeStr = h > 0 ? `${h}ч ${m}м` : `${m}м`;

  return (
    <div style={{
      ...PANEL,
      background:'linear-gradient(160deg,#3a2808,#2a1a06)',
      border:'2px solid #c8880a',
      boxShadow:'0 4px 0 #2a1005,0 0 24px rgba(200,136,10,0.2)',
    }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:12 }}>
        <Moon size={14} color="#c8a050" />
        <span style={{ fontFamily:'var(--app-font-mono)',fontSize:10,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.1em',color:'#c8a050' }}>
          Пока тебя не было • {timeStr}
        </span>
      </div>

      <div style={{ display:'flex',flexDirection:'column',gap:6,marginBottom:12 }}>
        {result.skills.map((sk, i) => (
          <div key={i} style={{
            display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'8px 10px',borderRadius:10,
            background:'rgba(20,10,0,0.4)',border:'1px solid rgba(200,136,10,0.2)',
          }}>
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <span style={{ fontSize:18 }}>{sk.icon}</span>
              <div>
                <div style={{ fontSize:12,color:'#f0d070',fontWeight:700 }}>{sk.skillName}</div>
                {sk.items.map(item => (
                  <div key={item.id} style={{ fontSize:10,color:'#a07838',fontFamily:'var(--app-font-mono)' }}>
                    +{formatNumber(item.quantity)} {item.name}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:12,color:'#f5d060',fontFamily:'var(--app-font-mono)',fontWeight:800 }}>
                +{formatNumber(sk.xpGained)} XP
              </div>
              <div style={{ fontSize:10,color:'#8b6030',fontFamily:'var(--app-font-mono)' }}>
                {sk.actionsCount} действий
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onClaim} style={{
        width:'100%',padding:'11px 0',borderRadius:12,cursor:'pointer',
        background:'linear-gradient(180deg,#c8880a,#9a6008)',
        border:'2px solid #6b4008',color:'#fff8d0',
        fontSize:13,fontWeight:800,fontFamily:'var(--app-font-sans)',
        boxShadow:'0 3px 0 #3d2005',
      }}>
        ✓ Забрать награды
      </button>
    </div>
  );
}

/* ══ DASHBOARD ════════════════════════════════════════════════ */
export function DashboardPage() {
  const { t }          = useTranslation();
  const combatLevel    = usePlayerStore(s => s.combatLevel);
  const isRunning      = useGameStore(s => s.isRunning);
  const activeSkill    = useGameStore(s => s.activeSkill);
  const stopAction     = useGameStore(s => s.stopAction);
  const lastSaveTime   = useGameStore(s => s.lastSaveTime);
  const inCombat       = useCombatStore(s => s.inCombat);
  const currentMonster = useCombatStore(s => s.currentMonster);
  const [tab, setTab]  = useState<'combat'|'gathering'|'artisan'>('gathering');
  const [offline, setOffline]     = useState<OfflineResult|null>(null);
  const offlineChecked = useRef(false);

  // Считаем оффлайн один раз при маунте
  useEffect(() => {
    if (offlineChecked.current) return;
    offlineChecked.current = true;
    if (lastSaveTime > 0) {
      const result = calculateOfflineProgress(lastSaveTime);
      if (result) setOffline(result);
    }
  }, [lastSaveTime]);

  const handleClaim = () => {
    if (offline) {
      applyOfflineProgress(offline);
      setOffline(null);
    }
  };

  const ActiveIcon = ({ skillId }: { skillId:string }) => {
    const v = getSkillVisual(skillId);
    return v.type==='image'
      ? <img src={v.value} alt="" style={{ width:'80%',height:'80%',objectFit:'contain' }} />
      : <span style={{ fontSize:22 }}>{v.value}</span>;
  };

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:10 }}>

      {/* ══ 1. HERO HEADER ══ */}
      <div style={PANEL}>
        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
          <div style={{ width:44,height:44,borderRadius:10,flexShrink:0,background:'linear-gradient(160deg,#2e1608,#1e0e04)',border:'2px solid #c8880a',boxShadow:'0 2px 0 #2a1005,0 0 14px rgba(200,136,10,0.35)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <span style={{ fontSize:22 }}>🛡️</span>
          </div>
          <div>
            <div style={{ fontSize:8,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.1em',color:'#8b6030',marginBottom:2 }}>Герой</div>
            <div style={{ fontFamily:'var(--app-font-display)',fontSize:20,fontWeight:900,color:'#fff8d0',textShadow:'0 2px 4px rgba(0,0,0,0.5)' }}>
              Странник
            </div>
          </div>
        </div>

        {/* Боевой уровень — одна крупная метрика */}
        <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderRadius:10,background:'linear-gradient(160deg,#3d2008,#2a1406)',border:'2px solid #5a3010',boxShadow:'0 2px 0 #1e0c04' }}>
          <span style={{ fontFamily:'var(--app-font-mono)',fontSize:10,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.08em',color:'#8b6030',whiteSpace:'nowrap' }}>⚔ Боевой Lvl</span>
          <span style={{ fontFamily:'var(--app-font-mono)',fontSize:26,fontWeight:900,color:'#f5d060',lineHeight:1,textShadow:'0 1px 4px rgba(0,0,0,0.5)',marginLeft:'auto' }}>{combatLevel}</span>
        </div>
      </div>

      {/* ══ 2. ОФФЛАЙН СВОДКА ══ */}
      {offline && <OfflineSummary result={offline} onClaim={handleClaim} />}

      {/* ══ 3. АКТИВНОСТЬ (только если идёт) ══ */}
      {(inCombat || isRunning) && (
        <div style={PANEL}>
          <SectionHeader icon="⚡" label="Активность" />
          {inCombat && currentMonster ? (
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,padding:'10px 12px',borderRadius:10,background:'rgba(120,20,10,0.35)',border:'1px solid rgba(220,60,40,0.4)' }}>
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                <span style={{ fontSize:22 }}>⚔️</span>
                <div>
                  <div style={{ fontSize:13,fontWeight:700,color:'#fff8d0' }}>
                    <span style={{ color:'#ff7060' }}>{currentMonster.name}</span>
                    <span style={{ color:'#c8a050',fontSize:10,marginLeft:6 }}>Ур.{currentMonster.combatLevel}</span>
                  </div>
                  <div style={{ fontSize:10,color:'#c8a050',fontFamily:'var(--app-font-mono)' }}>Боевая арена</div>
                </div>
              </div>
              <Link href="/combat" style={{ padding:'6px 12px',borderRadius:8,background:'linear-gradient(180deg,#c83020,#a02010)',border:'2px solid #6b1808',color:'#fff8d0',fontSize:10,fontWeight:800,textDecoration:'none',boxShadow:'0 2px 0 #3d0a04',display:'flex',alignItems:'center',gap:4 }}>
                Арена <ArrowUpRight size={11} />
              </Link>
            </div>
          ) : isRunning && activeSkill ? (
            <div style={{ padding:'10px 12px',borderRadius:10,background:'rgba(40,100,20,0.18)',border:'1px solid rgba(74,200,48,0.3)' }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:8 }}>
                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <div style={{ width:38,height:38,borderRadius:9,background:'linear-gradient(160deg,#2e1608,#1e0e04)',border:'2px solid rgba(200,136,10,0.5)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden' }}>
                    <ActiveIcon skillId={activeSkill} />
                  </div>
                  <div>
                    <div style={{ fontSize:12,fontWeight:700,color:'#fff8d0',textTransform:'uppercase',letterSpacing:'0.05em' }}>{getSkillShortName(activeSkill)}</div>
                    <div style={{ fontSize:10,color:'#4ade80',fontFamily:'var(--app-font-mono)' }}>Идёт добыча</div>
                  </div>
                </div>
                <div style={{ display:'flex',gap:5 }}>
                  <Link href={`/${activeSkill}`} style={{ padding:'5px 10px',borderRadius:7,background:'linear-gradient(160deg,#5a3010,#3a1e08)',border:'1px solid #8b5020',color:'#f0d070',fontSize:10,fontWeight:700,textDecoration:'none' }}>Перейти</Link>
                  <button onClick={stopAction} style={{ padding:'5px 10px',borderRadius:7,background:'rgba(120,20,10,0.4)',border:'1px solid rgba(220,60,40,0.5)',color:'#ff8070',fontSize:10,fontWeight:700,cursor:'pointer' }}>Стоп</button>
                </div>
              </div>
              <ActionProgressBar height="h-2" color="amber" />
            </div>
          ) : null}
        </div>
      )}

      {/* ══ 3.5 БЫСТРЫЙ СТАРТ (когда нет активности) ══ */}
      {!inCombat && !isRunning && !offline && (
        <div style={PANEL}>
          <SectionHeader icon="🗺" label="Выбери занятие" />
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:6 }}>
            {[
              { href:'/woodcutting',icon:'🪓',label:'Рубить лес' },
              { href:'/mining',icon:'⛏️',label:'Добывать руду' },
              { href:'/fishing',icon:'🎣',label:'Ловить рыбу' },
              { href:'/combat',icon:'⚔️',label:'В бой' },
            ].map(({ href,icon,label }) => (
              <Link key={href} href={href} style={{ textDecoration:'none' }}>
                <div style={{
                  display:'flex',alignItems:'center',gap:8,
                  padding:'10px 12px',borderRadius:10,cursor:'pointer',
                  background:'linear-gradient(160deg,#5a3010,#3a1e08)',
                  border:'2px solid #4a2808',
                  boxShadow:'0 3px 0 #2a1005',transition:'all 0.12s',
                }}
                  onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor='#c8880a'}
                  onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor='#4a2808'}
                >
                  <span style={{ fontSize:18 }}>{icon}</span>
                  <span style={{ fontSize:12,fontWeight:700,color:'#f0d070',whiteSpace:'nowrap' }}>{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ══ 4. НАВЫКИ ══ */}
      <div style={{ ...PANEL, paddingBottom: 18 }}>
        {/* Табы */}
        <div style={{ display:'flex',gap:6,marginBottom:14 }}>
          <Tab label="⚔ Бой"     active={tab==='combat'}    onClick={() => setTab('combat')} />
          <Tab label="◈ Добыча"  active={tab==='gathering'} onClick={() => setTab('gathering')} />
          <Tab label="⚒ Ремесло" active={tab==='artisan'}   onClick={() => setTab('artisan')} />
        </div>
        <SkillGrid ids={
          tab==='combat'    ? COMBAT_SKILLS    :
          tab==='gathering' ? GATHERING_SKILLS :
                              CRAFTING_SKILLS
        } />
      </div>

    </div>
  );
}
