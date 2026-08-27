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
  accentColor?: string;
}

function NavItem({ href, icon, label, skillId, accentColor = 'text-amber-400' }: NavItemProps) {
  const [location] = useLocation();
  const isActive = location === href;
  const level = usePlayerStore(s => skillId ? s.skills[skillId]?.level : undefined);
  const activeSkill = useGameStore(s => s.activeSkill);
  const isTraining = skillId && activeSkill === skillId;

  return (
    <Link href={href} className="block group">
      <div className={`flex items-center justify-between px-3 py-2 rounded-xl mb-0.5 border transition-all duration-150 ${
        isActive
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-100'
          : 'border-transparent text-stone-400 hover:text-stone-100 hover:bg-stone-800/60 hover:border-stone-700/50'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`w-5 flex justify-center shrink-0 ${isActive ? accentColor : 'text-stone-500 group-hover:' + accentColor}`}>
            {icon}
          </span>
          <span className="font-semibold text-xs tracking-wide truncate">{label}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {level !== undefined && (
            <span className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-md border ${
              isTraining
                ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-sm'
                : isActive
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-stone-800 text-stone-400 border-stone-700'
            }`}>
              {level}
            </span>
          )}
          {isTraining && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          )}
        </div>
      </div>
    </Link>
  );
}

function SectionLabel({ children, color = 'text-stone-500' }: { children: React.ReactNode; color?: string }) {
  return (
    <div className={`text-[10px] font-mono font-bold uppercase tracking-widest px-3 mb-1.5 ${color}`}>
      {children}
    </div>
  );
}

export function Sidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const { t } = useTranslation();
  const combatLevel = usePlayerStore(s => s.combatLevel);
  const inCombat = useCombatStore(s => s.inCombat);

  return (
    <aside className="w-60 h-screen flex flex-col fixed left-0 top-0 z-50 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1a1108 0%, #170f07 100%)', borderRight: '1px solid #2e2010' }}>

      {/* ── Логотип ── */}
      <Link href="/" onClick={onCloseMobile}
        className="flex items-center gap-3 px-4 py-4 border-b border-stone-800/60 group hover:bg-stone-800/20 transition-colors">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #92400e, #b45309)', boxShadow: '0 0 12px rgba(180,83,9,0.4)' }}>
          <Sword className="w-4 h-4 text-amber-200" />
        </div>
        <div>
          <div className="font-display font-black text-sm tracking-wider text-stone-100 leading-tight">
            Aethelia<span className="text-amber-400 font-sans font-extrabold text-xs ml-0.5">RPG</span>
          </div>
          <div className="text-[10px] text-stone-500 font-mono">Idle Fantasy</div>
        </div>
      </Link>

      {/* ── Навигация ── */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-thin">

        {/* Главная */}
        <div>
          <NavItem href="/" icon={<Home className="w-4 h-4" />} label={t('nav.home')} accentColor="text-amber-400" />
        </div>

        {/* Бой */}
        <div>
          <SectionLabel color="text-red-400/80">⚔ {t('group.combat')}</SectionLabel>
          <NavItem
            href="/combat"
            icon={<Sword className="w-4 h-4" />}
            label={t('nav.combat')}
            accentColor="text-red-400"
          />
          {inCombat && (
            <div className="mx-3 mt-1 text-[10px] font-mono font-bold text-red-300 bg-red-500/10 border border-red-500/25 px-2 py-1 rounded-lg">
              ● В бою
            </div>
          )}
        </div>

        {/* Добыча */}
        <div>
          <SectionLabel color="text-emerald-400/80">◈ {t('group.gathering')}</SectionLabel>
          <NavItem href="/woodcutting" icon={<Trees className="w-4 h-4" />}    label={t('skill.woodcutting')} skillId="woodcutting" accentColor="text-emerald-400" />
          <NavItem href="/mining"      icon={<Pickaxe className="w-4 h-4" />}  label={t('skill.mining')}      skillId="mining"      accentColor="text-amber-400" />
          <NavItem href="/fishing"     icon={<Fish className="w-4 h-4" />}     label={t('skill.fishing')}     skillId="fishing"     accentColor="text-cyan-400" />
        </div>

        {/* Ремесло */}
        <div>
          <SectionLabel color="text-amber-400/80">⚒ {t('group.artisan')}</SectionLabel>
          <NavItem href="/firemaking" icon={<Flame className="w-4 h-4" />}    label={t('skill.firemaking')} skillId="firemaking" accentColor="text-orange-400" />
          <NavItem href="/cooking"    icon={<ChefHat className="w-4 h-4" />}  label={t('skill.cooking')}    skillId="cooking"    accentColor="text-amber-400" />
          <NavItem href="/smithing"   icon={<Hammer className="w-4 h-4" />}   label={t('skill.smithing')}   skillId="smithing"   accentColor="text-stone-400" />
        </div>
      </div>

      {/* ── Футер ── */}
      <div className="px-2 py-2 border-t border-stone-800/60 space-y-0.5">
        <NavItem href="/inventory" icon={<Backpack className="w-4 h-4" />}  label={t('nav.inventory')} accentColor="text-sky-400" />
        <NavItem href="/settings"  icon={<Settings className="w-4 h-4" />} label={t('nav.settings')}  accentColor="text-stone-400" />

        {/* Уровень боя */}
        <div className="flex items-center justify-between px-3 py-2 mt-1 rounded-xl"
          style={{ background: 'rgba(30,18,8,0.8)', border: '1px solid #2e2010' }}>
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Sword className="w-3.5 h-3.5 text-red-400" />
            <span className="font-semibold">{t('combat.combatLevel')}</span>
          </div>
          <span className="font-mono text-xs font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/25">
            {combatLevel}
          </span>
        </div>
      </div>
    </aside>
  );
}
