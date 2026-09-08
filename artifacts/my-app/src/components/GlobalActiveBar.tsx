import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { useCombatStore } from '@/store/combatStore';
import { FORAGING_ZONES_MAP } from '@/domain/professions/foraging';
import { ActionProgressBar } from '@/features/professions/ActionProgressBar';
import { Link } from 'wouter';
import { Square, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { skillNameRu } from '@/lib/skillNames';
import { SkillIcon } from '@/features/professions/SkillIcon';

const SKILL_THEMES: Record<string, { nameKey: string; icon: string; path: string; color: 'green'; accent: string }> = {
  foraging: { nameKey: 'skill.foraging', icon: '🌿', path: '/foraging', color: 'green', accent: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
};

function getActionName(skillId: string, actionId: string): string {
  if (skillId === 'foraging') return FORAGING_ZONES_MAP[actionId]?.name ?? actionId;
  return actionId;
}

export function GlobalActiveBar() {
  const { t } = useTranslation();
  const activeSkill = useGameStore(s => s.activeSkill);
  const activeActionId = useGameStore(s => s.activeActionId);
  const isRunning = useGameStore(s => s.isRunning);
  const stopAction = useGameStore(s => s.stopAction);

  const inCombat = useCombatStore(s => s.inCombat);
  const currentMonster = useCombatStore(s => s.currentMonster);
  const playerHp = useCombatStore(s => s.playerHp);
  const playerMaxHp = useCombatStore(s => s.playerMaxHp);
  const stopCombat = useCombatStore(s => s.stopCombat);

  if (inCombat && currentMonster) {
    const hpPct = Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100));
    return (
      <div className="sticky top-2 z-40 mb-3 mx-auto w-full max-w-4xl px-2">
        <div className="fantasy-card border-red-500/40 bg-stone-950/90 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-[0_0_25px_rgba(239,68,68,0.2)] flex items-center justify-between gap-3 border animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-lg shrink-0 animate-pulse">
              ⚔️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-400 font-mono">
                  {t('group.combat')}
                </span>
                <span className="text-[var(--text-muted)] text-xs">•</span>
                <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                  vs {currentMonster.name} (Ур. {currentMonster.combatLevel})
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono mt-0.5">
                <span className="text-[var(--text-muted)] text-[11px]">ОЗ:</span>
                <div className="w-24 sm:w-32 h-2 bg-stone-800 rounded-full overflow-hidden border border-stone-700">
                  <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300" style={{ width: `${hpPct}%` }} />
                </div>
                <span className="text-[11px] font-bold text-red-300">{playerHp}/{playerMaxHp}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/combat" className="px-2.5 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700 hover:border-red-500/50 text-xs font-bold text-stone-200 transition-all flex items-center gap-1 active:scale-95">
              <span className="hidden sm:inline">{t('nav.combat')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <button onClick={stopCombat} className="px-2.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold transition-all flex items-center gap-1 active:scale-95" title={t('combat.stop')}>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">{t('combat.stop')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isRunning || !activeSkill || !activeActionId) return null;

  const theme = SKILL_THEMES[activeSkill] || {
    nameKey: 'ui.active',
    icon: '⚡',
    path: `/${activeSkill}`,
    color: 'green' as const,
    accent: 'text-primary border-primary/30 bg-primary/10',
  };

  const actionName = getActionName(activeSkill, activeActionId);

  return (
    <div className="sticky top-2 z-40 mb-3 mx-auto w-full max-w-4xl px-2">
      <div className="fantasy-card border-emerald-500/30 bg-stone-950/90 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl border border-emerald-500/40 bg-emerald-500/15 flex items-center justify-center shrink-0 shadow-inner overflow-hidden p-1">
            <SkillIcon skillId={activeSkill} size="sm" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 font-mono">
                {skillNameRu(activeSkill)}
              </span>
              <span className="text-stone-500 text-xs">•</span>
              <span className="text-xs font-bold text-stone-100 truncate">{actionName}</span>
            </div>
            <div className="w-full mt-1.5 pr-2 sm:max-w-md">
              <ActionProgressBar height="h-2" color={theme.color} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-800">
          <Link href={theme.path} className="px-2.5 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700 hover:border-emerald-500/50 text-xs font-bold text-stone-200 transition-all flex items-center gap-1 active:scale-95">
            <span className="text-[11px] font-medium">{t('ui.view') || 'View'}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          </Link>
          <button onClick={stopAction} className="px-2.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/30 text-xs font-bold transition-all flex items-center gap-1 active:scale-95" title={t('ui.stop') || 'Stop'}>
            <Square className="w-3.5 h-3.5 fill-current" />
            <span className="text-[11px] font-medium">{t('ui.stop') || 'Stop'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
