import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { useCombatStore } from '@/store/combatStore';
import { 
  Home, 
  Sword, 
  Backpack, 
  Layers, 
  X,
  Settings
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { getSkillIcon } from '@/shared/icons/skillIcons';
import type { SkillId } from '@/data/types';

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className = '' }: MobileNavProps) {
  const [location] = useLocation();
  const { t } = useTranslation();
  const [isSkillsMenuOpen, setIsSkillsMenuOpen] = useState(false);

  const activeSkill = useGameStore(s => s.activeSkill);
  const inCombat = useCombatStore(s => s.inCombat);

  const skillsList = [
    { href: '/woodcutting', name: t('skill.woodcutting'), icon: '🪓', id: 'woodcutting' },
    { href: '/mining',      name: t('skill.mining'),      icon: '⛏️', id: 'mining' },
    { href: '/fishing',     name: t('skill.fishing'),     icon: '🎣', id: 'fishing' },
    { href: '/firemaking',  name: t('skill.firemaking'),  icon: '🔥', id: 'firemaking' },
    { href: '/cooking',     name: t('skill.cooking'),     icon: '🍳', id: 'cooking' },
    { href: '/smithing',    name: t('skill.smithing'),    icon: '🔨', id: 'smithing' },
  ];

  const isSkillsPage = skillsList.some(s => s.href === location);

  return (
    <>
      {/* Skills Bottom Sheet Modal for Mobile */}
      {isSkillsMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsSkillsMenuOpen(false)}
          />
          <div className="relative bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 shadow-2xl z-10 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <h2 className="font-display font-black text-base text-amber-400 flex items-center gap-2">
                <Layers className="w-5 h-5" /> {t('nav.skills')}
              </h2>
              <button
                onClick={() => setIsSkillsMenuOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pb-4">
              {skillsList.map(skill => (
                <SkillNavButton 
                  key={skill.id}
                  skill={skill}
                  onClick={() => setIsSkillsMenuOpen(false)}
                  currentPath={location}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Nav Bar */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 pb-safe ${className}`}>
        <div className="flex items-center justify-around max-w-lg mx-auto">
          
          {/* Home */}
          <Link href="/" className={`flex flex-col items-center py-1 px-3 rounded-xl min-w-[56px] transition-all ${
            location === '/' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}>
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold">{t('nav.home')}</span>
          </Link>

          {/* Combat */}
          <Link href="/combat" className={`flex flex-col items-center py-1 px-3 rounded-xl min-w-[56px] relative transition-all ${
            location === '/combat' ? 'text-red-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}>
            {inCombat && (
              <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
            <Sword className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold">{t('nav.combat')}</span>
          </Link>

          {/* Skills Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsSkillsMenuOpen(true)}
            className={`flex flex-col items-center py-1 px-3 rounded-xl min-w-[56px] relative transition-all ${
              isSkillsPage || isSkillsMenuOpen ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeSkill && (
              <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            )}
            <Layers className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold">{t('nav.skills')}</span>
          </button>

          {/* Inventory */}
          <Link href="/inventory" className={`flex flex-col items-center py-1 px-3 rounded-xl min-w-[56px] transition-all ${
            location === '/inventory' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}>
            <Backpack className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold">{t('nav.inventory')}</span>
          </Link>

          {/* Settings */}
          <Link href="/settings" className={`flex flex-col items-center py-1 px-3 rounded-xl min-w-[56px] transition-all ${
            location === '/settings' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}>
            <Settings className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold">{t('nav.settings')}</span>
          </Link>

        </div>
      </nav>
    </>
  );
}

function SkillNavButton({ skill, onClick, currentPath }: { skill: any; onClick: () => void; currentPath: string }) {
  const level = usePlayerStore(s => s.skills[skill.id as SkillId]?.level ?? 1);
  const activeSkill = useGameStore(s => s.activeSkill);
  const isTraining = activeSkill === skill.id;
  const isCurrent = currentPath === skill.href;

  return (
    <Link
      href={skill.href}
      onClick={onClick}
      className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all active:scale-95 ${
        isCurrent
          ? 'bg-amber-500/15 border-amber-500/50 shadow-md'
          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-2xl">{skill.icon}</span>
        <div className="text-left">
          <div className="text-xs font-bold text-foreground">{skill.name}</div>
          <div className="text-[10px] text-muted-foreground font-mono">Ур. {level}</div>
        </div>
      </div>
      {isTraining && (
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
      )}
    </Link>
  );
}
