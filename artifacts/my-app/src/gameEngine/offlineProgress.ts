/**
 * offlineProgress.ts
 * Считает прогресс персонажа за время отсутствия игрока.
 * Использует последнее активное действие и время последнего сохранения.
 */

import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { TREES } from '@/data/woodcutting';
import { ROCKS } from '@/data/mining';
import { FISHING_SPOTS } from '@/data/fishing';

export interface OfflineItem {
  id: string;
  name: string;
  quantity: number;
}

export interface OfflineSkillResult {
  skillId: string;
  skillName: string;
  icon: string;
  xpGained: number;
  items: OfflineItem[];
  actionsCount: number;
}

export interface OfflineResult {
  durationMs: number;
  durationMinutes: number;
  skills: OfflineSkillResult[];
  goldEarned: number;
}

const SKILL_ICONS: Record<string, string> = {
  woodcutting: '🪓',
  mining:      '⛏️',
  fishing:     '🎣',
  cooking:     '🍖',
  smithing:    '🔨',
  firemaking:  '🔥',
  combat:      '⚔️',
};

const SKILL_NAMES: Record<string, string> = {
  woodcutting: 'Лесорубство',
  mining:      'Горное дело',
  fishing:     'Рыбалка',
  cooking:     'Кулинария',
  smithing:    'Кузнечество',
  firemaking:  'Огонь',
  combat:      'Бой',
};

/** Максимальное время оффлайна — 8 часов */
const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000;
/** Эффективность оффлайна — 50% от онлайна */
const OFFLINE_EFFICIENCY = 0.5;

export function calculateOfflineProgress(lastSaveTime: number): OfflineResult | null {
  const now     = Date.now();
  const elapsed = Math.min(now - lastSaveTime, MAX_OFFLINE_MS);

  // Меньше минуты — не показываем
  if (elapsed < 60_000) return null;

  const gameState  = useGameStore.getState();
  const { activeSkill, activeActionId } = gameState;

  if (!activeSkill || !activeActionId) return null;

  const effectiveMs = elapsed * OFFLINE_EFFICIENCY;
  const skills: OfflineSkillResult[] = [];
  let goldEarned = 0;

  // ── Вычисляем XP и предметы ──────────────────────────────────
  if (activeSkill === 'woodcutting') {
    const tree = TREES.find(t => t.id === activeActionId);
    if (tree) {
      const actions = Math.floor(effectiveMs / tree.interval);
      const xpGained = actions * tree.xp;
      const qty = actions * tree.quantity[0];
      skills.push({
        skillId: 'woodcutting',
        skillName: SKILL_NAMES.woodcutting,
        icon: SKILL_ICONS.woodcutting,
        xpGained: Math.floor(xpGained),
        actionsCount: actions,
        items: qty > 0 ? [{ id: tree.logId, name: tree.logId.replace('_', ' '), quantity: qty }] : [],
      });
    }
  }

  if (activeSkill === 'mining') {
    const rock = ROCKS?.find((r: any) => r.id === activeActionId);
    if (rock) {
      const actions = Math.floor(effectiveMs / rock.interval);
      const xpGained = actions * rock.xp;
      skills.push({
        skillId: 'mining',
        skillName: SKILL_NAMES.mining,
        icon: SKILL_ICONS.mining,
        xpGained: Math.floor(xpGained),
        actionsCount: actions,
        items: actions > 0 ? [{ id: rock.oreId, name: rock.oreId.replace('_ore',''), quantity: actions }] : [],
      });
    }
  }

  if (activeSkill === 'fishing') {
    const spot = FISHING_SPOTS?.find((s: any) => s.id === activeActionId);
    if (spot) {
      const actions = Math.floor(effectiveMs / spot.interval);
      const xpGained = actions * spot.xp;
      skills.push({
        skillId: 'fishing',
        skillName: SKILL_NAMES.fishing,
        icon: SKILL_ICONS.fishing,
        xpGained: Math.floor(xpGained),
        actionsCount: actions,
        items: actions > 0 ? [{ id: spot.fishId, name: spot.fishId.replace('raw_',''), quantity: actions }] : [],
      });
    }
  }

  if (skills.length === 0) return null;

  return {
    durationMs:      elapsed,
    durationMinutes: Math.floor(elapsed / 60_000),
    skills,
    goldEarned,
  };
}

/** Применяет оффлайн-прогресс к стейту */
export function applyOfflineProgress(result: OfflineResult): void {
  const addXp   = usePlayerStore.getState().addXp;
  const addItem = useInventoryStore.getState().addItem;

  for (const skill of result.skills) {
    if (skill.xpGained > 0) {
      addXp(skill.skillId as any, skill.xpGained);
    }
    for (const item of skill.items) {
      addItem(item.id, item.quantity);
    }
  }
}
