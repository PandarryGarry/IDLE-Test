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
import { getSkillVisual } from '@/shared/icons/skillIcons';
import { IconFrame } from '@/shared/ui/kit/IconFrame';
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
    { href: '/woodcutting', name: t('skill.woodcutting'), id: 'woodcutting' },
    { href: '/mining',      name: t('skill.mining'),      id: 'mining' },
    { href: '/fishing',     name: t('skill.fishing'),     id: 'fishing' },
    { href: '/firemaking',  name: t('skill.firemaking'),  id: 'firemaking' },
    { href: '/cooking',     name: t('skill.cooking'),     id: 'cooking' },
    { href: '/smithing',    name: t('skill.smithing'),    id: 'smithing' },
  ];

  const isSkillsPage = skillsList.some(s => s.href === location);

  return (
    <>
      {/* Skills Bottom Sheet Modal for Mobile */}
      {isSkillsMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsSkillsMenuOpen(false)}
          />
          <div className="relative rounded-t-2xl p-5 shadow-2xl z-10 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom"
            style={{ background: '#1c1409', border: '1px solid #3d2e1e', borderBottom: 'none' }}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: '#3d2e1e' }}>
              <h2 className="font-display font-black text-base text-amber-300 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" /> {t('nav.skills')}
              </h2>
              <button
                onClick={() => setIsSkillsMenuOpen(false)}
                className="p-1.5 rounded-full bg-[#231810] text-stone-300 hover:text-white"
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
      <nav className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t px-2 py-1.5 pb-safe ${className}`}
        style={{ background: 'rgba(22,14,6,0.97)', borderColor: '#2e2010', boxShadow: '0 -2px 12px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center justify-around max-w-lg mx-auto">
          
          {/* Home */}
          <Link href="/" className={`flex flex-col items-center py-1 px-3 rounded-xl min-w-[56px] transition-all ${
            location === '/' ? 'text-amber-400 font-bold' : 'text-stone-300 hover:text-white'
          }`}>
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold">{t('nav.home')}</span>
          </Link>

          {/* Combat */}
          <Link href="/combat" className={`flex flex-col items-center py-1 px-3 rounded-xl min-w-[56px] relative transition-all ${
            location === '/combat' ? 'text-red-400 font-bold' : 'text-stone-300 hover:text-white'
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
              isSkillsPage || isSkillsMenuOpen ? 'text-emerald-400 font-bold' : 'text-stone-300 hover:text-white'
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
            location === '/inventory' ? 'text-sky-400 font-bold' : 'text-stone-300 hover:text-white'
          }`}>
            <Backpack className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold">{t('nav.inventory')}</span>
          </Link>

          {/* Settings */}
          <Link href="/settings" className={`flex flex-col items-center py-1 px-3 rounded-xl min-w-[56px] transition-all ${
            location === '/settings' ? 'text-amber-400 font-bold' : 'text-stone-300 hover:text-white'
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
      className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 transition-all active:scale-95 ${
        isCurrent
          ? 'bg-amber-500/20 border-amber-400/60 shadow-md'
          : 'bg-[var(--bg-card-dark)] border-[var(--border-light)] hover:border-[#3d5070]'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <IconFrame icon={getSkillVisual(skill.id)} shape="none" size="sm" />
        <div className="text-left">
          <div className="text-xs font-bold text-stone-100">{skill.name}</div>
          <div className="text-[10px] text-stone-500 font-mono">Ур. {level}</div>
        </div>
      </div>
      {isTraining && (
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
      )}
    </Link>
  );
}
