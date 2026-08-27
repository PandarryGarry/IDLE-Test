import React, { useState, memo } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { useCombatStore } from '@/store/combatStore';
import { useInventoryStore } from '@/store/inventoryStore';
import type { SkillId } from '@/data/types';
import { COMBAT_SKILLS, GATHERING_SKILLS, CRAFTING_SKILLS } from '@/data/types';
import { formatNumber } from '@/lib/utils';
import { Link } from 'wouter';
import { useTranslation } from '@/hooks/useTranslation';
import { CoinsDisplay } from '@/shared/ui/CoinsDisplay';
import { ActionProgressBar } from '@/components/ActionProgressBar';
import { SkillCard } from '@/shared/ui/kit/SkillCard';
import { Sword, Layers, ArrowUpRight } from 'lucide-react';

// ─── Разделитель секций ──────────────────────────────────────────
function SectionDivider({ label, icon }: { label: string; icon?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 2px' }}>
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      <span style={{
        fontFamily: 'var(--app-font-mono)', fontSize: 10, fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: '0.1em',
        color: '#c8880a', textShadow: '0 1px 3px rgba(0,0,0,0.5)',
      }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #8b5020, transparent)' }} />
    </div>
  );
}

// ─── Метрика героя ───────────────────────────────────────────────
function HeroStat({
  label, value, color = '#f5d060', accent = false
}: { label: string; value: React.ReactNode; color?: string; accent?: boolean }) {
  return (
    <div style={{
      flex: 1, padding: '8px 10px', borderRadius: 10,
      background: 'linear-gradient(160deg, #4a2c0a, #2e1a06)',
      border: `2px solid ${accent ? '#8b3020' : '#5a3010'}`,
      boxShadow: '0 2px 0 #2a1005, inset 0 1px 0 rgba(220,170,80,0.08)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    }}>
      <span style={{
        fontFamily: 'var(--app-font-mono)', fontSize: 9, fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: '0.08em',
        color: accent ? '#e06050' : '#a07838',
      }}>{label}</span>
      <span style={{
        fontFamily: 'var(--app-font-mono)', fontSize: 22, fontWeight: 900,
        color, lineHeight: 1, textShadow: '0 1px 4px rgba(0,0,0,0.5)',
      }}>{value}</span>
    </div>
  );
}

// ─── Кнопка быстрого действия ────────────────────────────────────
function QuickAction({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} style={{ flex: 1, textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '10px 8px', borderRadius: 10,
        background: 'linear-gradient(160deg, #6a4020, #4a2c10)',
        border: '2px solid #5a3010',
        boxShadow: '0 3px 0 #2a1005, inset 0 1px 0 rgba(220,170,80,0.08)',
        cursor: 'pointer', transition: 'all 0.12s',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = '#c8880a';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = '#5a3010';
          (e.currentTarget as HTMLDivElement).style.transform = '';
        }}
      >
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{
          fontFamily: 'var(--app-font-sans)', fontSize: 12, fontWeight: 700,
          color: '#f0d070', textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        }}>{label}</span>
      </div>
    </Link>
  );
}

// ─── Грид навыков ────────────────────────────────────────────────
function SkillGrid({ skillIds }: { skillIds: readonly string[] }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 8,
    }}>
      {skillIds.map(id => (
        <SkillCard key={id} skillId={id} size="md" />
      ))}
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────
export function DashboardPage() {
  const { t } = useTranslation();
  const combatLevel  = usePlayerStore(s => s.combatLevel);
  const skills       = usePlayerStore(s => s.skills);
  const isRunning    = useGameStore(s => s.isRunning);
  const activeSkill  = useGameStore(s => s.activeSkill);
  const stopAction   = useGameStore(s => s.stopAction);
  const inCombat     = useCombatStore(s => s.inCombat);
  const currentMonster = useCombatStore(s => s.currentMonster);
  const gp           = useInventoryStore(s => s.gp);
  const items        = useInventoryStore(s => s.items);
  const maxSlots     = useInventoryStore(s => s.maxSlots);
  const usedSlots    = items ? items.filter(s => s.quantity > 0).length : 0;

  const [activeTab, setActiveTab] = useState<'all' | 'combat' | 'gathering' | 'artisan'>('all');

  const totalLevel = Object.values(skills).reduce((acc, s) => acc + (s?.level ?? 1), 0);

  // ── Стиль основного контейнера ──
  const panelStyle: React.CSSProperties = {
    background: 'linear-gradient(160deg, #7a5028, #5a3818)',
    border: '2px solid #5a3010',
    borderRadius: 16,
    boxShadow: '0 4px 0 #3d1e08, 0 6px 20px rgba(10,4,0,0.4), inset 0 1px 0 rgba(220,170,80,0.1)',
    padding: '14px 14px',
  };

  // ── Табы ──
  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
    fontFamily: 'var(--app-font-mono)', fontSize: 11, fontWeight: 700,
    border: `2px solid ${active ? '#c8880a' : '#5a3010'}`,
    background: active ? 'linear-gradient(180deg, #c8880a, #9a6008)' : 'linear-gradient(160deg, #5a3010, #3a1e08)',
    color: active ? '#fff8d0' : '#c8a050',
    boxShadow: active ? '0 2px 0 #3d2005, 0 0 10px rgba(200,136,10,0.3)' : '0 2px 0 #2a1005',
    transition: 'all 0.12s',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ══ 1. HERO HEADER ══ */}
      <div style={panelStyle}>
        {/* Верхняя строка: герб + заголовок */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(160deg, #2e1608, #1e0e04)',
            border: '2px solid #c8880a',
            boxShadow: '0 2px 0 #2a1005, 0 0 14px rgba(200,136,10,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sword size={24} color="#f0c030" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--app-font-sans)', fontSize: 9, fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.12em',
              color: '#a07838', marginBottom: 2,
            }}>Герой Королевства</div>
            <div style={{
              fontFamily: 'var(--app-font-display)', fontSize: 20, fontWeight: 900,
              color: '#fff8d0', lineHeight: 1.1,
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}>{t('dashboard.welcome')}</div>
            <div style={{ fontSize: 11, color: '#c8a050', marginTop: 2 }}>
              {t('dashboard.subtitle')}
            </div>
          </div>
        </div>

        {/* Метрики — 4 блока */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
          <HeroStat label="Боевой Lvl" value={combatLevel} color="#ff7060" accent />
          <HeroStat label="Total Lvl"  value={totalLevel}  color="#4ade80" />
          <HeroStat label="Кошелёк"   value={<CoinsDisplay amount={gp} size="xs" />} color="#f5d060" />
          <HeroStat label="Сумка"     value={`${usedSlots}/${maxSlots}`} color="#f5d060" />
        </div>
      </div>

      {/* ══ 2. ТЕКУЩАЯ АКТИВНОСТЬ ══ */}
      <div style={panelStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{
            fontFamily: 'var(--app-font-mono)', fontSize: 10, fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c8880a',
          }}>⚡ Текущая активность</span>
          {isRunning && (
            <span style={{
              fontFamily: 'var(--app-font-mono)', fontSize: 9, fontWeight: 700,
              color: '#4ade80', background: 'rgba(40,120,40,0.25)',
              border: '1px solid rgba(74,222,128,0.4)',
              padding: '2px 8px', borderRadius: 9999,
            }}>В процессе</span>
          )}
        </div>

        {inCombat && currentMonster ? (
          /* Бой */
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
            padding: '10px 12px', borderRadius: 10,
            background: 'rgba(120,20,10,0.35)', border: '1px solid rgba(220,60,40,0.4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>⚔️</span>
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
              padding: '6px 14px', borderRadius: 8,
              background: 'linear-gradient(180deg, #c83020, #a02010)',
              border: '2px solid #6b1808', color: '#fff8d0',
              fontSize: 11, fontWeight: 800, textDecoration: 'none',
              boxShadow: '0 2px 0 #3d0a04',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              На арену <ArrowUpRight size={12} />
            </Link>
          </div>
        ) : isRunning && activeSkill ? (
          /* Навык */
          <div style={{
            padding: '10px 12px', borderRadius: 10,
            background: 'rgba(40,120,40,0.2)', border: '1px solid rgba(74,222,128,0.35)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'linear-gradient(160deg, #2e1608, #1e0e04)',
                  border: '2px solid rgba(200,136,10,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <SkillCard skillId={activeSkill} size="sm" />
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
              <div style={{ display: 'flex', gap: 6 }}>
                <Link href={`/${activeSkill}`} style={{
                  padding: '5px 10px', borderRadius: 7,
                  background: 'linear-gradient(160deg, #5a3010, #3a1e08)',
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
          /* Бездействие */
          <div>
            <p style={{ fontSize: 11, color: '#c8a050', textAlign: 'center', marginBottom: 10 }}>
              {t('dashboard.noActive')}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <QuickAction href="/woodcutting" icon="🪓" label="Рубить лес" />
              <QuickAction href="/mining"      icon="⛏️" label="Добывать руду" />
              <QuickAction href="/fishing"     icon="🎣" label="Ловить рыбу" />
              <QuickAction href="/combat"      icon="⚔️" label="В бой" />
            </div>
          </div>
        )}
      </div>

      {/* ══ 3. ТАБЫ ══ */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        {([
          ['all',       '✦ Все профессии'],
          ['combat',    '⚔ Бой'],
          ['gathering', '◈ Добыча'],
          ['artisan',   '⚒ Ремесло'],
        ] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={tabStyle(activeTab === key)}>
            {label}
          </button>
        ))}
      </div>

      {/* ══ 4. СЕКЦИИ НАВЫКОВ ══ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {(activeTab === 'all' || activeTab === 'combat') && (
          <div style={panelStyle}>
            <SectionDivider label="Боевые искусства" icon="⚔" />
            <div style={{ marginTop: 10 }}>
              <SkillGrid skillIds={COMBAT_SKILLS} />
            </div>
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'gathering') && (
          <div style={panelStyle}>
            <SectionDivider label="Добыча ресурсов" icon="◈" />
            <div style={{ marginTop: 10 }}>
              <SkillGrid skillIds={GATHERING_SKILLS} />
            </div>
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'artisan') && (
          <div style={panelStyle}>
            <SectionDivider label="Ремесло и ковка" icon="⚒" />
            <div style={{ marginTop: 10 }}>
              <SkillGrid skillIds={CRAFTING_SKILLS} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
