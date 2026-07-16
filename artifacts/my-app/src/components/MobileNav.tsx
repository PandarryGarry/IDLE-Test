import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { manualSave } from '@/lib/saveManager';
import { useNotificationsStore } from '@/store/notificationsStore';
import { SkillId } from '@/data/types';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  className?: string;
}

const GATHERING_SKILLS = [
  { href: '/woodcutting', icon: '🪓', id: 'woodcutting' as SkillId },
  { href: '/fishing',     icon: '🎣', id: 'fishing'     as SkillId },
  { href: '/mining',      icon: '⛏️', id: 'mining'      as SkillId },
];
const ARTISAN_SKILLS = [
  { href: '/firemaking', icon: '🔥', id: 'firemaking' as SkillId },
  { href: '/cooking',    icon: '🍳', id: 'cooking'    as SkillId },
  { href: '/smithing',   icon: '🔨', id: 'smithing'   as SkillId },
];
const ALL_SKILL_HREFS = [...GATHERING_SKILLS, ...ARTISAN_SKILLS].map(s => s.href);
const COMBAT_SKILLS_IDS = new Set(['attack','strength','defence','hitpoints','ranged','magic','prayer','slayer']);

function NavTab({ href, icon, label }: { href: string; icon: string; label: string }) {
  const [location] = useLocation();
  const isActive = location === href;
  return (
    <Link href={href} className="flex-1">
      <div className={cn(
        'h-full flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-colors',
        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      )}>
        <span className="text-[22px] leading-none">{icon}</span>
        <span>{label}</span>
      </div>
    </Link>
  );
}

function SkillChip({ href, icon, id, onNavigate }: { href: string; icon: string; id: SkillId; onNavigate: () => void }) {
  const [location] = useLocation();
  const level = usePlayerStore(s => s.skills[id]?.level ?? 1);
  const activeSkill = useGameStore(s => s.activeSkill);
  const isActive = location === href;
  const isTraining = activeSkill === id;

  return (
    <Link href={href} onClick={onNavigate}>
      <div className={cn(
        'relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all active:scale-95',
        isActive ? 'bg-primary/15 border-primary shadow-[0_0_10px_rgba(34,197,94,0.15)]' : 'bg-background/80 border-border'
      )}>
        {isTraining && (
          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(34,197,94,1)]" />
        )}
        <span className="text-2xl leading-none">{icon}</span>
        <span className={cn('font-mono text-[11px] font-black', isActive ? 'text-primary' : 'text-muted-foreground')}>{level}</span>
      </div>
    </Link>
  );
}

export function MobileNav({ className }: MobileNavProps) {
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [location] = useLocation();
  const { t } = useTranslation();
  const activeSkill = useGameStore(s => s.activeSkill);
  const notifyInfo = useNotificationsStore(s => s.notifyInfo);

  const isSkillRoute = ALL_SKILL_HREFS.includes(location);
  const hasTrainingSkill = activeSkill && !COMBAT_SKILLS_IDS.has(activeSkill);

  const closeSkills = () => setSkillsOpen(false);

  return (
    <>
      {/* Skills panel */}
      <AnimatePresence>
        {skillsOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={closeSkills}
            />
            <motion.div
              key="panel"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed bottom-14 inset-x-0 z-50 bg-card border-t border-border rounded-t-2xl p-4 pb-6 max-h-[70vh] overflow-y-auto"
            >
              {/* Drag handle */}
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />

              <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-3 px-1">{t('group.gathering')}</p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {GATHERING_SKILLS.map(s => (
                  <SkillChip key={s.href} {...s} onNavigate={closeSkills} />
                ))}
              </div>

              <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-3 px-1">{t('group.artisan')}</p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {ARTISAN_SKILLS.map(s => (
                  <SkillChip key={s.href} {...s} onNavigate={closeSkills} />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border">
                <Link href="/settings" onClick={closeSkills}>
                  <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-background border border-border active:scale-95 transition-all">
                    <span>⚙️</span>
                    <span className="text-sm font-bold">{t('nav.settings')}</span>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    manualSave();
                    notifyInfo('Game saved!');
                    closeSkills();
                  }}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-background border border-border active:scale-95 transition-all"
                >
                  <span>💾</span>
                  <span className="text-sm font-bold">{t('nav.save')}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom bar */}
      <nav className={cn(
        'fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-md border-t border-border flex items-stretch',
        'h-14 safe-area-inset-bottom',
        className
      )}>
        <NavTab href="/" icon="🏠" label={t('nav.home')} />
        <NavTab href="/combat" icon="⚔️" label={t('nav.combat')} />

        {/* Skills toggle */}
        <button
          onClick={() => setSkillsOpen(v => !v)}
          className={cn(
            'relative flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-colors',
            isSkillRoute || skillsOpen ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {hasTrainingSkill && (
            <div className="absolute top-2 right-[25%] w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_6px_rgba(34,197,94,1)]" />
          )}
          <span className="text-[22px] leading-none">⚡</span>
          <span>{t('nav.skills')}</span>
        </button>

        <NavTab href="/bank" icon="🪙" label={t('nav.bank')} />
        <NavTab href="/settings" icon="⚙️" label={t('nav.settings')} />
      </nav>
    </>
  );
}
