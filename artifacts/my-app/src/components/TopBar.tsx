import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { usePlayerStore } from '@/store/playerStore';
import { useBankStore } from '@/store/bankStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

export function TopBar() {
  const { t } = useTranslation();
  const gp = useBankStore(s => s.gp);
  const maxSlots = useBankStore(s => s.maxSlots);
  const usedSlots = useBankStore(s => s.getUsedSlots());
  const activeSkill = useGameStore(s => s.activeSkill);
  const actionProgress = useGameStore(s => s.actionProgress);
  const isRunning = useGameStore(s => s.isRunning);
  const toggleSideMenu = useUIStore(s => s.toggleSideMenu);

  const skillLevel = usePlayerStore(s => activeSkill ? s.skills[activeSkill]?.level ?? 1 : null);

  const getSkillIcon = (skillId: string | null) => {
    const icons: Record<string, string> = {
      woodcutting: '🪓',
      mining: '⛏️',
      fishing: '🎣',
      cooking: '🍳',
      smithing: '🔨',
      firemaking: '🔥',
      attack: '⚔️',
      strength: '💪',
      defence: '🛡️',
      hitpoints: '❤️',
      ranged: '🏹',
      magic: '✨',
      prayer: '🙏',
      slayer: '🗡️',
    };
    return skillId ? icons[skillId] ?? '⭐' : null;
  };

  return (
    <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 gap-4">
          {/* Левая часть: Бургер + GP и Банк */}
          <div className="flex items-center gap-3">
            {/* Бургер для мобильных */}
            <button 
              onClick={toggleSideMenu}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-background/50 border border-border hover:bg-background transition-colors"
              aria-label="Открыть меню"
            >
              <span className="text-xl">☰</span>
            </button>

            {/* GP */}
            <div className="flex items-center gap-1.5">
              <span className="text-lg">💰</span>
              <span className="font-mono text-sm font-bold text-yellow-400">
                {gp.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">GP</span>
            </div>

            {/* Банк */}
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-lg">🎒</span>
              <span className="font-mono font-bold">
                {usedSlots}/{maxSlots}
              </span>
            </div>
          </div>

          {/* Правая часть: Текущий навык */}
          {activeSkill && isRunning && (
            <div className="flex items-center gap-2 flex-1 max-w-[200px]">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{getSkillIcon(activeSkill)}</span>
                <span className="text-sm font-bold hidden sm:inline">
                  {t(`skill.${activeSkill}`)}
                </span>
                {skillLevel && (
                  <span className="text-xs font-mono text-muted-foreground">
                    Lv.{skillLevel}
                  </span>
                )}
              </div>
              {/* Мини прогресс-бар */}
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-100"
                  style={{ width: `${actionProgress * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
