import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useCombatStore } from '@/store/combatStore';
import { FORAGING_ZONES_MAP } from '@/domain/professions/foraging';
import { ActionProgressBar } from '@/features/professions/ActionProgressBar';
import { Link } from 'wouter';
import { Square, ArrowUpRight, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { skillNameRu } from '@/lib/skillNames';
import { SkillIcon } from '@/features/professions/SkillIcon';

/**
 * Плавающая плашка активного действия (решение владельца 2026-09-12):
 * маленький полупрозрачный чип стекла слоя 1 у правого края под шапкой —
 * ничего не перекрывает (колокольчик в топбаре свободен), контент не сдвигает,
 * закрывается крестиком — сбор при этом продолжается; на новом действии
 * чип появляется снова.
 */

const BAR_HIDDEN_KEY = 'aethelia_activebar_hidden_v1';

function readHiddenMap(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(BAR_HIDDEN_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeHidden(key: string, hidden: boolean) {
  try {
    const map = readHiddenMap();
    if (hidden) map[key] = true;
    else delete map[key];
    localStorage.setItem(BAR_HIDDEN_KEY, JSON.stringify(map));
  } catch {
    /* приватный режим — просто не запоминаем */
  }
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

  const skillKey = activeSkill && activeActionId ? `${activeSkill}:${activeActionId}` : null;
  const activeKey = inCombat && currentMonster ? 'combat' : skillKey;

  const [dismissed, setDismissed] = useState<boolean>(
    () => (activeKey ? readHiddenMap()[activeKey] === true : false),
  );
  // Смена действия/врага — чип возвращается, даже если его скрыли раньше.
  React.useEffect(() => {
    setDismissed(activeKey ? readHiddenMap()[activeKey] === true : false);
  }, [activeKey]);

  if (!activeKey || dismissed) return null;

  const hide = () => {
    writeHidden(activeKey, true);
    setDismissed(true);
  };

  const glassStyle = {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-edge)',
    boxShadow: 'var(--glass-shadow)',
    backdropFilter: 'var(--glass-filter)',
  } as const;

  if (activeKey === 'combat' && currentMonster) {
    const hpPct = Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100));
    return (
      <div style={glassStyle} className="pointer-events-auto flex items-center gap-2 rounded-2xl px-2.5 py-1.5">
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
          style={{ background: 'var(--badge-red-bg)', border: '1px solid var(--badge-red-edge)' }}
        >
          ⚔️
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1 text-[10px] leading-tight">
            <span className="font-mono font-black uppercase tracking-wider" style={{ color: 'var(--announce-combat)' }}>
              {t('group.combat')}
            </span>
            <span className="text-[var(--text-muted)]">•</span>
            <span className="font-bold text-[var(--text-primary)] truncate max-w-[120px] sm:max-w-[180px]">
              {currentMonster.name} · ур. {currentMonster.combatLevel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-16 sm:w-24 h-1 rounded-full overflow-hidden [background:var(--bg-slot)]">
              <div className="h-full transition-all duration-300" style={{ width: `${hpPct}%`, background: 'var(--announce-combat)' }} />
            </div>
            <span className="text-[9px] font-mono font-bold text-[var(--text-muted)]">{playerHp}/{playerMaxHp}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href="/combat"
            title={t('nav.combat')}
            className="p-1.5 rounded-lg [background:var(--chrome-btn)] text-[var(--chrome-btn-ink)] border [border-color:var(--chrome-btn-edge)] [box-shadow:var(--chrome-btn-shadow)] active:scale-95 transition-all"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={stopCombat}
            title={t('combat.stop')}
            className="p-1.5 rounded-lg text-[var(--badge-red-ink)] border [border-color:var(--badge-red-edge)] hover:brightness-110 active:scale-95 transition-all flex items-center"
          >
            <Square className="w-3 h-3 fill-current" />
          </button>
          <button
            type="button"
            onClick={hide}
            title="Скрыть (бой продолжится)"
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] active:scale-95 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (!isRunning || !activeSkill || !activeActionId) return null;

  const actionName = activeSkill === 'foraging'
    ? (FORAGING_ZONES_MAP[activeActionId]?.name ?? activeActionId)
    : activeActionId;

  return (
    <div style={glassStyle} className="pointer-events-auto flex items-center gap-2 rounded-2xl px-2.5 py-1.5">
      <span
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 overflow-hidden p-0.5"
        style={{ background: 'var(--badge-green-bg)', border: '1px solid var(--accent-emerald)' }}
      >
        <SkillIcon skillId={activeSkill} size="sm" />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-1 text-[10px] leading-tight">
          <span className="font-mono font-black uppercase tracking-wider text-[var(--badge-green-ink)]">
            {skillNameRu(activeSkill)}
          </span>
          <span className="text-[var(--text-muted)]">•</span>
          <span className="font-bold text-[var(--text-primary)] truncate max-w-[110px] sm:max-w-[160px]">
            {actionName}
          </span>
        </div>
        <div className="w-20 sm:w-28 mt-1">
          <ActionProgressBar height="h-1" color="green" />
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Link
          href={`/${activeSkill}`}
          title={t('ui.view')}
          className="p-1.5 rounded-lg [background:var(--chrome-btn)] text-[var(--chrome-btn-ink)] border [border-color:var(--chrome-btn-edge)] [box-shadow:var(--chrome-btn-shadow)] active:scale-95 transition-all"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
        <button
          type="button"
          onClick={stopAction}
          title={t('ui.stop')}
          className="p-1.5 rounded-lg text-[var(--badge-red-ink)] border [border-color:var(--badge-red-edge)] hover:brightness-110 active:scale-95 transition-all flex items-center"
        >
          <Square className="w-3 h-3 fill-current" />
        </button>
        <button
          type="button"
          onClick={hide}
          title="Скрыть (сбор продолжится)"
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] active:scale-95 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
