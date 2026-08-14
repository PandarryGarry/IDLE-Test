import React from 'react';
import { Link, useLocation } from 'wouter';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore, SkillCategory } from '@/store/uiStore';
import { SkillId } from '@/data/types';
import { cn } from '@/lib/utils';

interface SkillItem {
  href: string;
  icon: string;
  id: SkillId;
  category: SkillCategory;
}

const SKILLS: SkillItem[] = [
  // Gathering
  { href: '/woodcutting', icon: '🪓', id: 'woodcutting', category: 'gathering' },
  { href: '/fishing',     icon: '🎣', id: 'fishing',     category: 'gathering' },
  { href: '/mining',      icon: '⛏️', id: 'mining',      category: 'gathering' },
  // Artisan
  { href: '/firemaking',  icon: '🔥', id: 'firemaking',  category: 'artisan' },
  { href: '/cooking',     icon: '🍳', id: 'cooking',     category: 'artisan' },
  { href: '/smithing',    icon: '🔨', id: 'smithing',    category: 'artisan' },
  // Combat
  { href: '/combat',      icon: '⚔️', id: 'attack',      category: 'combat' },
];

const CATEGORIES: { id: SkillCategory; label: string; icon: string }[] = [
  { id: 'all',       label: 'Все',      icon: '📋' },
  { id: 'gathering', label: 'Добыча',   icon: '🌲' },
  { id: 'artisan',   label: 'Ремесло',  icon: '🔨' },
  { id: 'combat',    label: 'Бой',      icon: '⚔️' },
];

export function SideMenu() {
  const [location] = useLocation();
  const { t } = useTranslation();
  const sideMenuOpen = useUIStore(s => s.sideMenuOpen);
  const closeSideMenu = useUIStore(s => s.closeSideMenu);
  const activeCategory = useUIStore(s => s.activeSkillCategory);
  const setSkillCategory = useUIStore(s => s.setSkillCategory);
  const activeSkill = useGameStore(s => s.activeSkill);

  const filteredSkills = activeCategory === 'all' 
    ? SKILLS 
    : SKILLS.filter(s => s.category === activeCategory);

  return (
    <AnimatePresence>
      {sideMenuOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={closeSideMenu}
          />

          {/* Side panel */}
          <motion.div
            key="panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-[280px] bg-card border-r border-border flex flex-col md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-black">Меню</h2>
              <button 
                onClick={closeSideMenu}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-background/50 border border-border hover:bg-background transition-colors"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>

            {/* Category filter */}
            <div className="p-4 border-b border-border">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSkillCategory(cat.id)}
                    className={cn(
                      'shrink-0 px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5',
                      activeCategory === cat.id 
                        ? 'bg-primary text-primary-foreground shadow-lg' 
                        : 'bg-background/50 border border-border hover:bg-background'
                    )}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Skills list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredSkills.map(skill => (
                <SkillMenuItem 
                  key={skill.id} 
                  skill={skill} 
                  isActive={location === skill.href}
                  isTraining={activeSkill === skill.id}
                  onClose={closeSideMenu}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <Link 
                href="/settings" 
                onClick={closeSideMenu}
                className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border hover:bg-background transition-colors"
              >
                <span className="text-xl">⚙️</span>
                <span className="font-bold">Настройки</span>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SkillMenuItem({ 
  skill, 
  isActive, 
  isTraining,
  onClose 
}: { 
  skill: SkillItem; 
  isActive: boolean; 
  isTraining: boolean;
  onClose: () => void;
}) {
  const level = usePlayerStore(s => s.skills[skill.id]?.level ?? 1);

  return (
    <Link href={skill.href} onClick={onClose}>
      <div className={cn(
        'relative flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-[0.98]',
        isActive 
          ? 'bg-primary/15 border-primary shadow-[0_0_10px_rgba(34,197,94,0.15)]' 
          : 'bg-background/80 border-border hover:bg-background'
      )}>
        <span className="text-2xl">{skill.icon}</span>
        <div className="flex-1">
          <p className={cn(
            'font-bold text-sm',
            isActive ? 'text-primary' : 'text-foreground'
          )}>
            {skill.id.charAt(0).toUpperCase() + skill.id.slice(1)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isTraining && (
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(34,197,94,1)]" />
          )}
          <span className={cn(
            'font-mono text-xs font-black px-2 py-1 rounded-lg',
            isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
          )}>
            Lv.{level}
          </span>
        </div>
      </div>
    </Link>
  );
}
