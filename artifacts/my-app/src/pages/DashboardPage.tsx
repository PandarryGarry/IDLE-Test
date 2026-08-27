import React, { useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { useCombatStore } from '@/store/combatStore';
import { useInventoryStore } from '@/store/inventoryStore';
import type { SkillId } from '@/data/types';
import { COMBAT_SKILLS, GATHERING_SKILLS, CRAFTING_SKILLS } from '@/data/types';
import { Link } from 'wouter';
import { useTranslation } from '@/hooks/useTranslation';
import { CoinsDisplay } from '@/shared/ui/CoinsDisplay';
import { ActionProgressBar } from '@/components/ActionProgressBar';
import { SkillCard } from '@/shared/ui/kit/SkillCard';
import { getSkillVisual } from '@/shared/icons/skillIcons';
import { ArrowUpRight } from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   ОБЩИЕ СТИЛИ
══════════════════════════════════════════════════════════════ */
const PANEL: React.CSSProperties = {
  background: 'linear-gradient(160deg,#7a5028,#5a3818)',
  border:     '2px solid #5a3010',
  borderRadius: 16,
  boxShadow:  '0 4px 0 #3d1e08, 0 6px 20px rgba(10,4,0,0.35), inset 0 1px 0 rgba(220,170,80,0.08)',
  padding:    '14px',
};

/* ── Заголовок секции — по центру, яркий ── */
function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 8, marginBottom: 14,
    }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg,#a06028,transparent)' }} />
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{
        fontFamily: 'var(--app-font-mono)', fontSize: 11, fontWeight: 900,
        textTransform: 'uppercase', letterSpacing: '0.12em',
        color: '#f0c030', textShadow: '0 0 12px rgba(240,192,48,0.5)',
      }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,#a06028,transparent)' }} />
    </div>
  );
}

/* ── Метрика героя ── */
function HeroStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      flex: 1, minWidth: 0, padding: '8px 6px', borderRadius: 10,
      background: 'linear-gradient(160deg,#4a2c0a,#2e1a06)',
      border: '2px solid #5a3010',
      boxShadow: '0 2px 0 #2a1005',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
    }}>
      <span style={{
        fontFamily: 'var(--app-font-mono)', fontSize: 8, fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: '0.08em',
        color: '#a07838', whiteSpace: 'nowrap',
      }}>{label}</span>
      <span style={{
        fontFamily: 'var(--app-font-mono)', fontSize: 22, fontWeight: 900,
        color: '#f5d060', lineHeight: 1,
        textShadow: '0 1px 4px rgba(0,0,0,0.5)',
      }}>{value}</span>
    </div>
  );
}

/* ── Кнопка быстрого действия ── */
function QuickBtn({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} style={{ flex: '1 1 calc(50% - 3px)', minWidth: 0, textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '10px 6px', borderRadius: 10,
        background: 'linear-gradient(160deg,#6a4020,#4a2c10)',
        border: '2px solid #5a3010',
        boxShadow: '0 3px 0 #2a1005, inset 0 1px 0 rgba(220,170,80,0.06)',
        cursor: 'pointer', transition: 'all 0.12s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#c8880a'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#5a3010'; }}
      >
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{
          fontSize: 12, fontWeight: 700, color: '#f0d070',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)', whiteSpace: 'nowrap',
        }}>{label}</span>
      </div>
    </Link>
  );
}

/* ── Грид навыков ── */
function SkillGrid({ ids }: { ids: readonly string[] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
      gap: 10,
      justifyItems: 'center',
    }}>
      {ids.map(id => <SkillCard key={id} skillId={id} size="sm" />)}
    </div>
  );
}

/* ── Таб ── */
function Tab({ k, label, active, onClick }: { k: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 14px', borderRadius: 9, cursor: 'pointer', flexShrink: 0,
      fontFamily: 'var(--app-font-mono)', fontSize: 10, fontWeight: 800,
      border: `2px solid ${active ? '#c8880a' : '#5a3010'}`,
      background: active
        ? 'linear-gradient(180deg,#c8880a,#9a6008)'
        : 'linear-gradient(160deg,#5a3010,#3a1e08)',
      color: active ? '#fff8d0' : '#c8a050',
      boxShadow: active
        ? '0 2px 0 #3d2005, 0 0 12px rgba(200,136,10,0.35)'
        : '0 2px 0 #2a1005',
      transition: 'all 0.12s',
    }}>{label}</button>
  );
}

/* ══════════════════════════════════════════════════════════════
   DASHBOARD PAGE
══════════════════════════════════════════════════════════════ */
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
  const [tab, setTab]  = useState<'all' | 'combat' | 'gathering' | 'artisan'>('all');

  /* Иконка активного навыка */
  const ActiveIcon = ({ skillId }: { skillId: string }) => {
    const v = getSkillVisual(skillId);
    return v.type === 'image'
      ? <img src={v.value} alt="" style={{ width: '75%', height: '75%', objectFit: 'contain' }} />
      : <span style={{ fontSize: 22 }}>{v.value}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* ══ 1. HERO HEADER ══ */}
      <div style={PANEL}>
        {/* Логотип + название */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(160deg,#2e1608,#1e0e04)',
            border: '2px solid #c8880a',
            boxShadow: '0 2px 0 #2a1005, 0 0 14px rgba(200,136,10,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 24 }}>🛡️</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 8, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.12em', color: '#a07838', marginBottom: 2,
            }}>Герой Королевства</div>
            <div style={{
              fontFamily: 'var(--app-font-display)', fontSize: 18, fontWeight: 900,
              color: '#fff8d0', lineHeight: 1.1, textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}>{t('dashboard.welcome')}</div>
          </div>
        </div>

        {/* Метрики — 3 блока, без Total LVL, все золотые */}
        <div style={{ display: 'flex', gap: 5 }}>
          <HeroStat label="⚔ Боевой Lvl" value={combatLevel} />
          <HeroStat label="💰 Кошелёк"   value={<CoinsDisplay amount={gp} size="xs" />} />
          <HeroStat label="🎒 Сумка"     value={`${usedSlots}/${maxSlots}`} />
        </div>
      </div>

      {/* ══ 2. ТЕКУЩАЯ АКТИВНОСТЬ ══ */}
      <div style={PANEL}>
        <SectionHeader icon="⚡" label="Текущая активность" />

        {inCombat && currentMonster ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            padding: '10px 12px', borderRadius: 10,
            background: 'rgba(120,20,10,0.35)', border: '1px solid rgba(220,60,40,0.4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>⚔️</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff8d0' }}>
                  Сражение: <span style={{ color: '#ff7060' }}>{currentMonster.name}</span>
                </div>
                <div style={{ fontSize: 10, color: '#c8a050', fontFamily: 'var(--app-font-mono)' }}>
                  Ур. {currentMonster.combatLevel}
                </div>
              </div>
            </div>
            <Link href="/combat" style={{
              padding: '6px 12px', borderRadius: 8,
              background: 'linear-gradient(180deg,#c83020,#a02010)',
              border: '2px solid #6b1808', color: '#fff8d0',
              fontSize: 10, fontWeight: 800, textDecoration: 'none',
              boxShadow: '0 2px 0 #3d0a04',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              На арену <ArrowUpRight size={11} />
            </Link>
          </div>

        ) : isRunning && activeSkill ? (
          <div style={{
            padding: '10px 12px', borderRadius: 10,
            background: 'rgba(40,120,40,0.18)', border: '1px solid rgba(74,222,128,0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 9,
                  background: 'linear-gradient(160deg,#2e1608,#1e0e04)',
                  border: '2px solid rgba(200,136,10,0.5)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}>
                  <ActiveIcon skillId={activeSkill} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff8d0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t(`skill.${activeSkill}` as any)}
                  </div>
                  <div style={{ fontSize: 10, color: '#4ade80', fontFamily: 'var(--app-font-mono)' }}>
                    Идёт добыча
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                <Link href={`/${activeSkill}`} style={{
                  padding: '5px 10px', borderRadius: 7,
                  background: 'linear-gradient(160deg,#5a3010,#3a1e08)',
                  border: '1px solid #8b5020', color: '#f0d070',
                  fontSize: 10, fontWeight: 700, textDecoration: 'none',
                }}>Перейти</Link>
                <button onClick={stopAction} style={{
                  padding: '5px 10px', borderRadius: 7,
                  background: 'rgba(120,20,10,0.4)', border: '1px solid rgba(220,60,40,0.5)',
                  color: '#ff8070', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                }}>Стоп</button>
              </div>
            </div>
            <ActionProgressBar height="h-2" color="amber" />
          </div>

        ) : (
          <div>
            <p style={{ fontSize: 11, color: '#c8a050', textAlign: 'center', marginBottom: 10 }}>
              {t('dashboard.noActive')}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <QuickBtn href="/woodcutting" icon="🪓" label="Рубить лес" />
              <QuickBtn href="/mining"      icon="⛏️" label="Добывать руду" />
              <QuickBtn href="/fishing"     icon="🎣" label="Ловить рыбу" />
              <QuickBtn href="/combat"      icon="⚔️" label="В бой" />
            </div>
          </div>
        )}
      </div>

      {/* ══ 3. ТАБЫ ══ */}
      <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 2 }}>
        <Tab k="all"       label="✦ Все"     active={tab==='all'}       onClick={() => setTab('all')} />
        <Tab k="combat"    label="⚔ Бой"    active={tab==='combat'}    onClick={() => setTab('combat')} />
        <Tab k="gathering" label="◈ Добыча"  active={tab==='gathering'} onClick={() => setTab('gathering')} />
        <Tab k="artisan"   label="⚒ Ремесло" active={tab==='artisan'}   onClick={() => setTab('artisan')} />
      </div>

      {/* ══ 4. СЕКЦИИ НАВЫКОВ ══ */}
      {(tab === 'all' || tab === 'combat') && (
        <div style={PANEL}>
          <SectionHeader icon="⚔" label="Боевые искусства" />
          <SkillGrid ids={COMBAT_SKILLS} />
        </div>
      )}

      {(tab === 'all' || tab === 'gathering') && (
        <div style={PANEL}>
          <SectionHeader icon="◈" label="Добыча ресурсов" />
          <SkillGrid ids={GATHERING_SKILLS} />
        </div>
      )}

      {(tab === 'all' || tab === 'artisan') && (
        <div style={PANEL}>
          <SectionHeader icon="⚒" label="Ремесло и ковка" />
          <SkillGrid ids={CRAFTING_SKILLS} />
        </div>
      )}

    </div>
  );
}
