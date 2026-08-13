import React from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { SkillId } from '@/data/types';
import { Link, useLocation } from 'wouter';
import { Settings, Save, Sword, Coins, Backpack } from 'lucide-react';
import { manualSave } from '@/lib/saveManager';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useTranslation } from '@/hooks/useTranslation';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  skillId?: SkillId;
}

function SidebarItem({ href, icon, label, skillId }: SidebarItemProps) {
  const [location] = useLocation();
  const isActiveRoute = location === href;
  
  const level = usePlayerStore(s => skillId ? s.skills[skillId]?.level : undefined);
  const activeSkill = useGameStore(s => s.activeSkill);
  const isTraining = skillId && activeSkill === skillId;

  return (
    <Link href={href} className="block">
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg mb-1 transition-colors ${
        isActiveRoute 
          ? 'bg-primary/20 text-primary border border-primary/30' 
          : 'text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-xl flex-shrink-0 w-6 flex justify-center">{icon}</span>
          <span className="font-medium text-sm">{label}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {level !== undefined && (
            <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
              isTraining ? 'bg-primary text-primary-foreground' : 'bg-background border border-border'
            }`}>
              {level}
            </span>
          )}
          {isTraining && (
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(34,197,94,1)]" />
          )}
        </div>
      </div>
    </Link>
  );
}

export function Sidebar() {
  const { t } = useTranslation();
  const combatLevel = usePlayerStore(s => s.combatLevel);
  const notifyInfo = useNotificationsStore(s => s.notifyInfo);
  
  const handleSave = () => {
    manualSave();
    notifyInfo(t('notif.gameSaved'));
  };

  return (
    <aside className="w-60 bg-sidebar border-r border-border h-screen flex flex-col fixed left-0 top-0 overflow-hidden">
      <div className="p-4 border-b border-border bg-sidebar/50 backdrop-blur-sm z-10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50 text-primary shadow-[0_0_10px_rgba(34,197,94,0.3)]">
            <Sword className="w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tight text-foreground drop-shadow-sm">Melvor<span className="text-primary">Clone</span></span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-5 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        
        {/* COMBAT */}
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">{t('group.combat')}</h3>
          <SidebarItem href="/combat" icon="⚔️" label={t('nav.combat')} />
        </div>

        {/* GATHERING */}
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">{t('group.gathering')}</h3>
          <SidebarItem href="/woodcutting" icon="🪓" label={t('skill.woodcutting')} skillId="woodcutting" />
          <SidebarItem href="/fishing"     icon="🎣" label={t('skill.fishing')}     skillId="fishing" />
          <SidebarItem href="/mining"      icon="⛏️" label={t('skill.mining')}      skillId="mining" />
        </div>

        {/* ARTISAN */}
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">{t('group.artisan')}</h3>
          <SidebarItem href="/firemaking" icon="🔥" label={t('skill.firemaking')} skillId="firemaking" />
          <SidebarItem href="/cooking"    icon="🍳" label={t('skill.cooking')}    skillId="cooking" />
          <SidebarItem href="/smithing"   icon="🔨" label={t('skill.smithing')}   skillId="smithing" />
        </div>
      </div>

      <div className="p-3 border-t border-border bg-sidebar/50 space-y-1">
        <SidebarItem href="/inventory" icon={<Backpack className="w-5 h-5 text-sky-400" />}   label={t('nav.inventory')} />
        <SidebarItem href="/bank"      icon={<Coins    className="w-5 h-5 text-amber-400" />} label={t('nav.bank')} />
        <SidebarItem href="/settings"  icon={<Settings className="w-5 h-5" />}               label={t('nav.settings')} />
        
        <button 
          onClick={handleSave}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent transition-colors mt-2"
        >
          <Save className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium text-sm">{t('nav.save')}</span>
        </button>

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sword className="w-4 h-4 text-destructive" /> {t('combat.combatLevel')}:
          </div>
          <span className="font-mono font-bold text-foreground bg-accent px-2 py-0.5 rounded border border-border">
            {combatLevel}
          </span>
        </div>
      </div>
    </aside>
  );
}
