import React from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { useCombatStore } from '@/store/combatStore';
import { SkillId } from '@/data/types';
import { Link, useLocation } from 'wouter';
import { 
  Settings, 
  Sword, 
  Backpack, 
  Shield, 
  Sparkles, 
  Home
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { getSkillVisual } from '@/shared/icons/skillIcons';
import { IconFrame } from '@/shared/ui/kit/IconFrame';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  skillId?: SkillId;
  colorScheme?: 'green' | 'amber' | 'blue' | 'red' | 'purple' | 'default';
}

function SidebarItem({ href, icon, label, skillId, colorScheme = 'default' }: SidebarItemProps) {
  const [location] = useLocation();
  const isActiveRoute = location === href;
  
  const level = usePlayerStore(s => skillId ? s.skills[skillId]?.level : undefined);
  const activeSkill = useGameStore(s => s.activeSkill);
  const isTraining = skillId && activeSkill === skillId;

  const colorStyles = {
    green: {
      activeBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50 shadow-md',
      dot: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
      badge: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/50',
    },
    amber: {
      activeBg: 'bg-amber-500/20 text-amber-200 border-amber-400/50 shadow-md',
      dot: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
      badge: 'border-amber-500/40 text-amber-300 bg-amber-950/50',
    },
    blue: {
      activeBg: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50 shadow-md',
      dot: 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]',
      badge: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/50',
    },
    red: {
      activeBg: 'bg-rose-500/20 text-rose-200 border-rose-400/50 shadow-md',
      dot: 'bg-rose-400 shadow-[0_0_8px_#fb7185]',
      badge: 'border-rose-500/40 text-rose-300 bg-rose-950/50',
    },
    purple: {
      activeBg: 'bg-purple-500/20 text-purple-200 border-purple-400/50 shadow-md',
      dot: 'bg-purple-400 shadow-[0_0_8px_#c084fc]',
      badge: 'border-purple-500/40 text-purple-300 bg-purple-950/50',
    },
    default: {
      activeBg: 'bg-amber-500/20 text-amber-200 border-amber-400/50 shadow-md',
      dot: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
      badge: 'border-[#334460] text-slate-200 bg-[#172030]',
    },
  };

  const scheme = colorStyles[colorScheme];

  return (
    <Link href={href} className="block group">
      <div className={`flex items-center justify-between px-3 py-2 rounded-xl mb-1 transition-all duration-150 border ${
        isActiveRoute 
          ? scheme.activeBg
          : 'text-slate-300 hover:text-white hover:bg-[#222f44] border-transparent hover:border-[#334460]'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-6 flex justify-center shrink-0 transition-transform group-hover:scale-110">
            {icon}
          </span>
          <span className="font-semibold text-xs tracking-wide truncate">{label}</span>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0">
          {level !== undefined && (
            <span className={`font-mono text-[11px] font-extrabold px-1.5 py-0.5 rounded-md border ${
              isTraining 
                ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                : scheme.badge
            }`}>
              {level}
            </span>
          )}
          {isTraining && (
            <div className={`w-2 h-2 rounded-full animate-ping ${scheme.dot}`} />
          )}
        </div>
      </div>
    </Link>
  );
}

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const { t } = useTranslation();
  const combatLevel = usePlayerStore(s => s.combatLevel);
  const inCombat = useCombatStore(s => s.inCombat);

  return (
    <aside className="w-64 bg-[#1b2537] border-r border-[#2d3d56] h-screen flex flex-col fixed left-0 top-0 overflow-hidden z-50 shadow-2xl">
      
      {/* Brand Header */}
      <div className="p-4 border-b border-[#2d3d56] bg-[#222e44] flex items-center justify-between">
        <Link href="/" onClick={onCloseMobile} className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-600/20 flex items-center justify-center border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-all text-amber-300">
            <Sword className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display font-black text-base tracking-wider text-slate-100 flex items-center gap-1">
              Aethelia<span className="text-amber-400 font-sans font-extrabold text-sm">RPG</span>
            </div>
            <div className="text-[10px] font-mono text-slate-300 -mt-0.5 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Живой мир IDLE
            </div>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        
        {/* MAIN / HOME */}
        <div>
          <SidebarItem href="/" icon={<Home className="w-4 h-4 text-amber-400" />} label={t('nav.home')} colorScheme="amber" />
        </div>

        {/* COMBAT */}
        <div>
          <div className="flex items-center justify-between mb-1.5 px-2">
            <h3 className="text-[10px] font-extrabold text-red-300 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <IconFrame icon={getSkillVisual('combat')} shape="none" size="xs" /> {t('group.combat')}
            </h3>
            {inCombat && (
              <span className="text-[9px] font-mono font-bold bg-red-500/25 text-red-300 border border-red-500/40 px-1 rounded animate-pulse">
                В БОЮ
              </span>
            )}
          </div>
          <SidebarItem href="/combat" icon={<IconFrame icon={getSkillVisual('combat')} shape="none" size="xs" />} label={t('nav.combat')} colorScheme="red" />
        </div>

        {/* GATHERING */}
        <div>
          <h3 className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-widest mb-1.5 px-2 font-mono flex items-center gap-1.5">
            <IconFrame icon={getSkillVisual('woodcutting')} shape="none" size="xs" /> {t('group.gathering')}
          </h3>
          <SidebarItem href="/woodcutting" icon={<IconFrame icon={getSkillVisual('woodcutting')} shape="none" size="xs" />} label={t('skill.woodcutting')} skillId="woodcutting" colorScheme="green" />
          <SidebarItem href="/mining"      icon={<IconFrame icon={getSkillVisual('mining')}      shape="none" size="xs" />} label={t('skill.mining')}      skillId="mining"      colorScheme="amber" />
          <SidebarItem href="/fishing"     icon={<IconFrame icon={getSkillVisual('fishing')}     shape="none" size="xs" />} label={t('skill.fishing')}     skillId="fishing"     colorScheme="blue" />
        </div>

        {/* ARTISAN */}
        <div>
          <h3 className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest mb-1.5 px-2 font-mono flex items-center gap-1.5">
            <IconFrame icon={getSkillVisual('smithing')} shape="none" size="xs" /> {t('group.artisan')}
          </h3>
          <SidebarItem href="/firemaking" icon={<IconFrame icon={getSkillVisual('firemaking')} shape="none" size="xs" />} label={t('skill.firemaking')} skillId="firemaking" colorScheme="red" />
          <SidebarItem href="/cooking"    icon={<IconFrame icon={getSkillVisual('cooking')}    shape="none" size="xs" />} label={t('skill.cooking')}    skillId="cooking"    colorScheme="amber" />
          <SidebarItem href="/smithing"   icon={<IconFrame icon={getSkillVisual('smithing')}   shape="none" size="xs" />} label={t('skill.smithing')}   skillId="smithing"   colorScheme="amber" />
        </div>

      </div>

      {/* Footer Utilities */}
      <div className="p-3 border-t border-[#2d3d56] bg-[#1e2a3e] space-y-1">
        <SidebarItem href="/inventory" icon={<Backpack className="w-4 h-4 text-sky-400" />} label={t('nav.inventory')} />
        <SidebarItem href="/settings"  icon={<Settings className="w-4 h-4 text-slate-300" />} label={t('nav.settings')} />

        {/* Player Combat Level Widget */}
        <div className="mt-2 pt-2.5 border-t border-[#2d3d56] flex items-center justify-between px-2 bg-[#172030] p-2 rounded-xl border border-[#2d3d56]">
          <div className="flex items-center gap-2 text-xs text-slate-200">
            <Shield className="w-4 h-4 text-red-400" />
            <span className="font-semibold">{t('combat.combatLevel')}</span>
          </div>
          <span className="font-mono text-xs font-black text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/40">
            {combatLevel}
          </span>
        </div>
      </div>
    </aside>
  );
}
