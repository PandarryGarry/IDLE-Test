import { create } from 'zustand';
import type { SkillId } from '@/data/types';
import {
  PROFESSION_STAT_BY_ID,
  PROFESSION_STAT_DEFS,
  effectiveStatValue,
  type ProfessionStatDef,
} from '@/domain/professions/professionStats';
import { getProfessionStatOverrides } from '@/store/adminConfigStore';
import { usePlayerStore } from '@/store/playerStore';

export interface EffectiveProfessionStat {
  def: ProfessionStatDef;
  value: number;
  /** Реально ли стата активна на текущем уровне профессии. */
  unlocked: boolean;
  /** Достигнутая доля капа (для percent/rating), null для flat. */
  capRatio: number | null;
}

/**
 * Расчёт эффективных характеристик профессий.
 * Источник данных — PROFESSION_STAT_DEFS (дефолты) + оверрайды админки.
 * Числа не зашиты в UI.
 */
function computeEffective(skillId: SkillId, level: number, overrides: Record<string, Partial<ProfessionStatDef>>): EffectiveProfessionStat[] {
  return PROFESSION_STAT_DEFS
    .filter(def => def.skillId === skillId)
    .map(def => {
      const override = overrides[def.id];
      const unlocked = level >= (override?.unlockLevel ?? def.unlockLevel);
      const value = unlocked ? effectiveStatValue(def, level, override) : 0;
      const cap = override?.cap ?? def.cap;
      const capRatio = def.kind !== 'flat' && cap !== undefined && cap > 0 ? Math.min(1, value / cap) : null;
      return { def, value, unlocked, capRatio };
    });
}

export function getEffectiveProfessionStat(skillId: SkillId, statId: string, level?: number): EffectiveProfessionStat | undefined {
  const lvl = level ?? usePlayerStore.getState().getSkillLevel(skillId);
  return computeEffective(skillId, lvl, getProfessionStatOverrides()).find(s => s.def.id === statId);
}

export function getEffectiveProfessionStats(skillId: SkillId, level?: number): EffectiveProfessionStat[] {
  const lvl = level ?? usePlayerStore.getState().getSkillLevel(skillId);
  return computeEffective(skillId, lvl, getProfessionStatOverrides());
}

/** Быстрый доступ для механик: имя + текущее активное значение. */
export function getProfessionStatValue(skillId: SkillId, statId: string, level?: number): number {
  return getEffectiveProfessionStat(skillId, statId, level)?.value ?? 0;
}

/** Возвращает текущие значения для всех определений (без фильтра по навыку). */
export function getAllEffectiveProfessionStats(levelBySkill: Partial<Record<SkillId, number>> = {}): EffectiveProfessionStat[] {
  const overrides = getProfessionStatOverrides();
  const out: EffectiveProfessionStat[] = [];
  for (const def of PROFESSION_STAT_DEFS) {
    const lvl = levelBySkill[def.skillId] ?? usePlayerStore.getState().getSkillLevel(def.skillId);
    const item = computeEffective(def.skillId, lvl, overrides).find(s => s.def.id === def.id);
    if (item) out.push(item);
  }
  return out;
}

/**
 * Store-обёртка для подписки UI на изменения (админка/страница профессии).
 * Значения всегда пересчитываются при чтении, поэтому здесь только кэш-«маячок».
 */
interface ProfessionStatsStore {
  touchedAt: number;
  touch: () => void;
}

export const useProfessionStatsStore = create<ProfessionStatsStore>(() => ({
  touchedAt: 0,
  touch: () => {
    useProfessionStatsStore.setState({ touchedAt: Date.now() });
  },
}));

/** Утилита: id дефолта остаётся эталоном, если оверрайд частичный. */
export function mergedProfessionStatDef(statId: string): ProfessionStatDef {
  const base = PROFESSION_STAT_BY_ID[statId];
  const override = getProfessionStatOverrides()[statId];
  return override ? { ...base, ...override } : base;
}
