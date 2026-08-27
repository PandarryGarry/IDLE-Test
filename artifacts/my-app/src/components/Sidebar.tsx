import React from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { useCombatStore } from '@/store/combatStore';
import { SkillId } from '@/data/types';
import { Link, useLocation } from 'wouter';
import { Settings, Backpack, Home, Sword, Flame, Fish, Pickaxe, Trees, ChefHat, Hammer } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  skillId?: SkillId;
  dotColor?: string;
}

function NavItem({ href, icon, label, skillId, dotColor = '#d4860a' }: NavItemProps) {
  const [location] = useLocation();
  const isActive   = location === href;
  const level      = usePlayerStore(s => skillId ? s.skills[skillId]?.level : undefined);
  const activeSkill = useGameStore(s => s.activeSkill);
  const isTraining = skillId && activeSkill === skillId;

  return (
    <Link href={href} className="block">
      <div className={`g-nav-item${isActive ? ' active' : ''}`}>
        <span style={{ color: isActive ? '#f0a820' : 'var(--text-sidebar)', opacity: isActive ? 1 : 0.7 }}>
          {icon}
        </span>
        <span className="flex-1 truncate text-xs font-semibold tracking-wide">{label}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {level !== undefined && (
            <span style={{
              fontFamily: 'var(--app-font-mono)',
              fontSize: 11,
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: 6,
              background: isTraining ? '#1a9e5a' : 'rgba(212,134,10,0.15)',
              color: isTraining ? '#fff' : '#f0a820',
              border: `1px solid ${isTraining ? '#1a9e5a' : 'rgba(212,134,10,0.3)'}`,
            }}>{level}</span>
          )}
          {isTraining && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1a9e5a', boxShadow: '0 0 6px #1a9e5a', display: 'inline-block' }} />
          )}
        </div>
      </div>
    </Link>
  );
}

function SectionLabel({ children, color = 'var(--text-muted)' }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ fontSize: 10, fontFamily: 'var(--app-font-mono)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 12px', marginBottom: 4, color }}>
      {children}
    </div>
  );
}

export function Sidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const { t }       = useTranslation();
  const combatLevel = usePlayerStore(s => s.combatLevel);
  const inCombat    = useCombatStore(s => s.inCombat);

  return (
    <aside style={{
      width: 240,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 50,
      background: 'linear-gradient(180deg, #3d2910 0%, #2d1f0f 100%)',
      borderRight: '1px solid var(--border-sidebar)',
      boxShadow: '3px 0 16px rgba(45,31,15,0.35)',
      overflow: 'hidden',
    }}>

      {/* ── Логотип ── */}
      <Link href="/" onClick={onCloseMobile}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px', borderBottom: '1px solid var(--border-sidebar)', cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,134,10,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #c07010, #e09820)',
            boxShadow: '0 0 14px rgba(212,134,10,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Sword size={18} color="#fff8ee" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--app-font-display)', fontWeight: 900, fontSize: 15, color: '#fef3d0', letterSpacing: '0.08em' }}>
              Aethelia<span style={{ color: '#f0a820', fontFamily: 'var(--app-font-sans)', fontWeight: 800, fontSize: 12, marginLeft: 2 }}>RPG</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-sidebarMuted, #9a7850)', fontFamily: 'var(--app-font-mono)' }}>Idle Fantasy</div>
          </div>
        </div>
      </Link>

      {/* ── Навигация ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div>
          <NavItem href="/" icon={<Home size={16} />} label={t('nav.home')} />
        </div>

        <div>
          <SectionLabel color="rgba(192,40,30,0.9)">⚔ {t('group.combat')}</SectionLabel>
          <NavItem href="/combat" icon={<Sword size={15} />} label={t('nav.combat')} />
          {inCombat && (
            <div style={{ margin: '4px 12px', fontSize: 10, fontFamily: 'var(--app-font-mono)', fontWeight: 700, color: '#e04040', background: 'rgba(192,40,30,0.12)', border: '1px solid rgba(192,40,30,0.3)', borderRadius: 6, padding: '3px 8px' }}>
              ● В бою
            </div>
          )}
        </div>

        <div>
          <SectionLabel color="rgba(26,158,90,0.9)">◈ {t('group.gathering')}</SectionLabel>
          <NavItem href="/woodcutting" icon={<Trees size={15} />}   label={t('skill.woodcutting')} skillId="woodcutting" dotColor="#1a9e5a" />
          <NavItem href="/mining"      icon={<Pickaxe size={15} />} label={t('skill.mining')}      skillId="mining"      dotColor="#d4860a" />
          <NavItem href="/fishing"     icon={<Fish size={15} />}    label={t('skill.fishing')}     skillId="fishing"     dotColor="#0e8a7a" />
        </div>

        <div>
          <SectionLabel color="rgba(208,96,16,0.9)">⚒ {t('group.artisan')}</SectionLabel>
          <NavItem href="/firemaking" icon={<Flame size={15} />}    label={t('skill.firemaking')} skillId="firemaking" dotColor="#d06010" />
          <NavItem href="/cooking"    icon={<ChefHat size={15} />}  label={t('skill.cooking')}    skillId="cooking"    dotColor="#d4860a" />
          <NavItem href="/smithing"   icon={<Hammer size={15} />}   label={t('skill.smithing')}   skillId="smithing"   dotColor="#8090a0" />
        </div>
      </div>

      {/* ── Футер ── */}
      <div style={{ padding: '8px', borderTop: '1px solid var(--border-sidebar)' }}>
        <NavItem href="/inventory" icon={<Backpack size={15} />} label={t('nav.inventory')} />
        <NavItem href="/settings"  icon={<Settings size={15} />} label={t('nav.settings')} />

        {/* Уровень боя */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', marginTop: 4, borderRadius: 10,
          background: 'rgba(192,40,30,0.1)', border: '1px solid rgba(192,40,30,0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-sidebar)' }}>
            <Sword size={14} color="#e04040" />
            <span style={{ fontWeight: 600 }}>{t('combat.combatLevel')}</span>
          </div>
          <span style={{
            fontFamily: 'var(--app-font-mono)', fontSize: 13, fontWeight: 900, color: '#f0a820',
            background: 'rgba(212,134,10,0.15)', border: '1px solid rgba(212,134,10,0.3)',
            padding: '1px 8px', borderRadius: 6,
          }}>{combatLevel}</span>
        </div>
      </div>
    </aside>
  );
}
