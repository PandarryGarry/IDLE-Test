import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { useCombatStore } from '@/store/combatStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { Link } from 'wouter';
import { useTranslation } from '@/hooks/useTranslation';
import { CoinsDisplay } from '@/shared/ui/CoinsDisplay';
import { ActionProgressBar } from '@/components/ActionProgressBar';
import { SkillCard } from '@/shared/ui/kit/SkillCard';
import { getSkillVisual, getSkillShortName } from '@/shared/icons/skillIcons';
import { formatNumber } from '@/lib/utils';
import { ArrowUpRight, Moon } from 'lucide-react';
import type { SkillId } from '@/data/types';
import { COMBAT_SKILLS, GATHERING_SKILLS, CRAFTING_SKILLS } from '@/data/types';

/* ════════════════════════════════════════════════════════════
   СТИЛИ
════════════════════════════════════════════════════════════ */
const PANEL: React.CSSProperties = {
  background: 'linear-gradient(160deg,#7a5028,#5a3818)',
  border:     '2px solid #5a3010',
  borderRadius: 16,
  boxShadow:  '0 4px 0 #3d1e08, 0 6px 24px rgba(10,4,0,0.35), inset 0 1px 0 rgba(220,170,80,0.08)',
  padding:    '14px 14px 18px',
  overflow:   'visible',
};

/* ── Заголовок секции — по центру ── */
function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:12 }}>
      <div style={{ flex:1, height:1, background:'linear-gradient(270deg,#8b5020,transparent)' }} />
      <span style={{ fontSize:13 }}>{icon}</span>
      <span style={{
        fontFamily:'var(--app-font-mono)', fontSize:10, fontWeight:900,
        textTransform:'uppercase', letterSpacing:'0.12em',
        color:'#f0c030', textShadow:'0 0 12px rgba(240,192,48,0.5)',
      }}>{label}</span>
      <div style={{ flex:1, height:1, background:'linear-gradient(90deg,#8b5020,transparent)' }} />
    </div>
  );
}

/* ── Метрика — одинаковый стиль, без эмодзи ── */
function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      flex:1, minWidth:0, padding:'8px 8px', borderRadius:10,
      background:'linear-gradient(160deg,#3d2008,#2a1406)',
      border:'2px solid #5a3010',
      boxShadow:'0 2px 0 #1e0c04, inset 0 1px 0 rgba(220,170,80,0.06)',
      display:'flex', flexDirection:'column', alignItems:'center', gap:4,
    }}>
      <span style={{
        fontFamily:'var(--app-font-mono)', fontSize:8, fontWeight:800,
        textTransform:'uppercase', letterSpacing:'0.08em', color:'#8b6030',
        whiteSpace:'nowrap',
      }}>{label}</span>
      <div style={{
        fontFamily:'var(--app-font-mono)', fontSize:16, fontWeight:900,
        color:'#f5d060', lineHeight:1, minHeight:22,
        textShadow:'0 1px 4px rgba(0,0,0,0.5)',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>{value}</div>
    </div>
  );
}

/* ── Таб ── */
function Tab({ label, active, onClick }: { label:string; active:boolean; onClick:()=>void }) {
  return (
    <button onClick={onClick} style={{
      flex:1, padding:'8px 0', borderRadius:9, cursor:'pointer',
      fontFamily:'var(--app-font-mono)', fontSize:10, fontWeight:800,
      border:`2px solid ${active?'#c8880a':'#4a2808'}`,
      background: active
        ? 'linear-gradient(180deg,#c8880a,#9a6008)'
        : 'linear-gradient(160deg,#4a2808,#321806)',
      color: active?'#fff8d0':'#9a6830',
      boxShadow: active
        ? '0 2px 0 #3d2005,0 0 12px rgba(200,136,10,0.35)'
        : '0 2px 0 #1e0c04',
      transition:'all 0.12s',
      whiteSpace:'nowrap',
    }}>{label}</button>
  );
}

/* ── Грид навыков ── */
function SkillGrid({ ids }: { ids: readonly string[] }) {
  return (
    <div style={{
      display:'grid',
      gridTemplateColumns:'repeat(auto-fill, minmax(65px,1fr))',
      gap:10,
      justifyItems:'center',
    }}>
      {ids.map(id => <SkillCard key={id} skillId={id} diameter={80} />)}
    </div>
  );
}

/* ── Оффлайн-сводка ── */
function OfflineSummary() {
  const offlineData = useGameStore(s => s.offlineData);
  const clearOffline = useGameStore(s => s.clearOfflineData);

  if (!offlineData || offlineData.totalMinutes < 1) return null;

  const hours   = Math.floor(offlineData.totalMinutes / 60);
  const minutes = offlineData.totalMinutes % 60;
  const timeStr = hours > 0 ? `${hours}ч ${minutes}м` : `${minutes}м`;

  return (
    <div style={{
      ...PANEL,
      background: 'linear-gradient(160deg,#3a2808,#2a1a06)',
      border: '2px solid #c8880a',
      boxShadow: '0 4px 0 #2a1005, 0 0 24px rgba(200,136,10,0.2)',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
        <Moon size={14} color="#c8a050" />
        <span style={{
          fontFamily:'var(--app-font-mono)', fontSize:10, fontWeight:800,
          textTransform:'uppercase', letterSpacing:'0.1em', color:'#c8a050',
        }}>Пока тебя не было • {timeStr}</span>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:12 }}>
        {offlineData.rewards.map((r, i) => (
          <div key={i} style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'6px 10px', borderRadius:8,
            background:'rgba(20,10,0,0.35)', border:'1px solid rgba(200,136,10,0.2)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:16 }}>{r.icon}</span>
              <span style={{ fontSize:12, color:'#e0c070', fontWeight:600 }}>{r.skill}</span>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:11, color:'#f5d060', fontFamily:'var(--app-font-mono)', fontWeight:800 }}>
                +{formatNumber(r.xp)} XP
              </div>
              {r.items && (
                <div style={{ fontSize:10, color:'#a07838', fontFamily:'var(--app-font-mono)' }}>
                  {r.items}
                </div>
              )}
            </div>
          </div>
        ))}
        {offlineData.goldEarned > 0 && (
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'6px 10px', borderRadius:8,
            background:'rgba(200,136,10,0.12)', border:'1px solid rgba(200,136,10,0.35)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:16 }}>💰</span>
              <span style={{ fontSize:12, color:'#f0c030', fontWeight:700 }}>Заработано</span>
            </div>
            <div style={{
              fontSize:13, color:'#f5d060',
              fontFamily:'var(--app-font-mono)', fontWeight:900,
            }}>+{formatNumber(offlineData.goldEarned)} GP</div>
          </div>
        )}
      </div>

      <button
        onClick={clearOffline}
        style={{
          width:'100%', padding:'10px 0', borderRadius:10, cursor:'pointer',
          background:'linear-gradient(180deg,#c8880a,#9a6008)',
          border:'2px solid #6b4008', color:'#fff8d0',
          fontSize:12, fontWeight:800, fontFamily:'var(--app-font-sans)',
          boxShadow:'0 3px 0 #3d2005',
        }}
      >
        ✓ Забрать награды
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════════════ */
export function DashboardPage() {
  const { t }          = useTranslation();
  const combatLevel    = usePlayerStore(s => s.combatLevel);
  const isRunning      = useGameStore(s => s.isRunning);
  const activeSkill    = useGameStore(s => s.activeSkill);
  const stopAction     = useGameStore(s => s.stopAction);
  const inCombat       = useCombatStore(s => s.inCombat);
  const currentMonster = useCombatStore(s => s.currentMonster);
  const gp             = useInventoryStore(s => s.gp);
  const items          = useInventoryStore(s => s.items);
  const maxSlots       = useInventoryStore(s => s.maxSlots);
  const usedSlots      = items ? items.filter(s => s.quantity > 0).length : 0;
  const [tab, setTab]  = useState<'combat'|'gathering'|'artisan'>('gathering');

  const ActiveIcon = ({ skillId }: { skillId:string }) => {
    const v = getSkillVisual(skillId);
    return v.type==='image'
      ? <img src={v.value} alt="" style={{ width:'80%',height:'80%',objectFit:'contain' }} />
      : <span style={{ fontSize:22 }}>{v.value}</span>;
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>

      {/* ══ 1. HERO HEADER ══ */}
      <div style={PANEL}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <div style={{
            width:46, height:46, borderRadius:10, flexShrink:0,
            background:'linear-gradient(160deg,#2e1608,#1e0e04)',
            border:'2px solid #c8880a',
            boxShadow:'0 2px 0 #2a1005,0 0 14px rgba(200,136,10,0.35)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <span style={{ fontSize:24 }}>🛡️</span>
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:8, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:'#8b6030', marginBottom:3 }}>
              Герой
            </div>
            <div style={{
              fontFamily:'var(--app-font-display)', fontSize:20, fontWeight:900,
              color:'#fff8d0', lineHeight:1.05, textShadow:'0 2px 4px rgba(0,0,0,0.5)',
            }}>
              Странник
            </div>
          </div>
        </div>

        {/* 3 метрики — одинаковый размер */}
        <div style={{ display:'flex', gap:6 }}>
          <Stat label="Боевой Lvl"  value={combatLevel} />
          <Stat label="Кошелёк"     value={<CoinsDisplay amount={gp} size="xs" />} />
          <Stat label="Сумка"       value={`${usedSlots}/${maxSlots}`} />
        </div>
      </div>

      {/* ══ 2. ОФФЛАЙН СВОДКА (если есть) ══ */}
      <OfflineSummary />

      {/* ══ 3. АКТИВНОСТЬ ══ */}
      {(inCombat || isRunning) && (
        <div style={PANEL}>
          <SectionHeader icon="⚡" label="Активность" />

          {inCombat && currentMonster ? (
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between', gap:8,
              padding:'10px 12px', borderRadius:10,
              background:'rgba(120,20,10,0.35)', border:'1px solid rgba(220,60,40,0.4)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:22 }}>⚔️</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#fff8d0' }}>
                    <span style={{ color:'#ff7060' }}>{currentMonster.name}</span>
                    <span style={{ color:'#c8a050', fontSize:10, marginLeft:6 }}>Ур.{currentMonster.combatLevel}</span>
                  </div>
                  <div style={{ fontSize:10, color:'#c8a050', fontFamily:'var(--app-font-mono)' }}>Боевая арена</div>
                </div>
              </div>
              <Link href="/combat" style={{
                padding:'6px 12px', borderRadius:8,
                background:'linear-gradient(180deg,#c83020,#a02010)',
                border:'2px solid #6b1808', color:'#fff8d0',
                fontSize:10, fontWeight:800, textDecoration:'none',
                boxShadow:'0 2px 0 #3d0a04',
                display:'flex', alignItems:'center', gap:4,
              }}>
                Арена <ArrowUpRight size={11} />
              </Link>
            </div>

          ) : isRunning && activeSkill ? (
            <div style={{
              padding:'10px 12px', borderRadius:10,
              background:'rgba(40,100,20,0.18)', border:'1px solid rgba(74,200,48,0.3)',
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{
                    width:40, height:40, borderRadius:9,
                    background:'linear-gradient(160deg,#2e1608,#1e0e04)',
                    border:'2px solid rgba(200,136,10,0.5)',
                    display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden',
                  }}>
                    <ActiveIcon skillId={activeSkill} />
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#fff8d0', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                      {getSkillShortName(activeSkill)}
                    </div>
                    <div style={{ fontSize:10, color:'#4ade80', fontFamily:'var(--app-font-mono)' }}>Идёт добыча</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:5 }}>
                  <Link href={`/${activeSkill}`} style={{
                    padding:'5px 10px', borderRadius:7,
                    background:'linear-gradient(160deg,#5a3010,#3a1e08)',
                    border:'1px solid #8b5020', color:'#f0d070',
                    fontSize:10, fontWeight:700, textDecoration:'none',
                  }}>Перейти</Link>
                  <button onClick={stopAction} style={{
                    padding:'5px 10px', borderRadius:7,
                    background:'rgba(120,20,10,0.4)', border:'1px solid rgba(220,60,40,0.5)',
                    color:'#ff8070', fontSize:10, fontWeight:700, cursor:'pointer',
                  }}>Стоп</button>
                </div>
              </div>
              <ActionProgressBar height="h-2" color="amber" />
            </div>
          ) : null}
        </div>
      )}

      {/* ══ 3.5 БЕЗ АКТИВНОСТИ — быстрый старт ══ */}
      {!inCombat && !isRunning && (
        <div style={PANEL}>
          <SectionHeader icon="🗺" label="Начать приключение" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
            {[
              { href:'/woodcutting', icon:'🪓', label:'Рубить лес' },
              { href:'/mining',      icon:'⛏️', label:'Добывать руду' },
              { href:'/fishing',     icon:'🎣', label:'Ловить рыбу' },
              { href:'/combat',      icon:'⚔️', label:'В бой' },
            ].map(({ href, icon, label }) => (
              <Link key={href} href={href} style={{ textDecoration:'none' }}>
                <div style={{
                  display:'flex', alignItems:'center', gap:8,
                  padding:'10px 12px', borderRadius:10, cursor:'pointer',
                  background:'linear-gradient(160deg,#5a3010,#3a1e08)',
                  border:'2px solid #4a2808',
                  boxShadow:'0 3px 0 #2a1005',
                  transition:'all 0.12s',
                }}
                  onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor='#c8880a'}
                  onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor='#4a2808'}
                >
                  <span style={{ fontSize:18 }}>{icon}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'#f0d070', whiteSpace:'nowrap' }}>{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ══ 4. НАВЫКИ — КОМПАКТНО ══ */}
      <div style={PANEL}>
        {/* Табы — равные, по центру */}
        <div style={{ display:'flex', gap:6, marginBottom:14 }}>
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
