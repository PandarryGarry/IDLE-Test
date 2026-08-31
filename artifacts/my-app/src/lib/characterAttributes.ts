/**
 * Чистый расчёт Четырёх Столпов. Без React, без боя, без паутины.
 * Числа кривых — только src/data/balance/.
 */
import {
  ATTRIBUTE_STATE_VERSION,
  BRANCH_IDS,
  BRANCHES_BY_PILLAR,
  PILLAR_IDS,
  emptyBranchRanks,
  emptyPillarRanks,
  racePercentFor,
  type AttributeRaceId,
  type BranchId,
  type BranchRanks,
  type CharacterAttributeState,
  type PillarId,
  type PillarRanks,
} from '../data/attributes.ts';
import { SYNERGIES, type SynergyId } from '../data/synergies.ts';
import {
  BODY_BASE_STUB,
  BRANCH_RANK_CAP_STUB,
  BRANCH_TO_PILLAR_PER_RANK_STUB,
  PILLAR_RANK_CAP_STUB,
  pillarContribution,
} from '../data/balance/pillars.ts';
import { ENERGY_MAX_STUB } from '../data/balance/energy.ts';
import {
  FREE_RESPEC_LIMIT,
  HERO_START_LEVEL,
  earnedBranchPoints,
  earnedPillarPoints,
} from '../data/balance/heroLevel.ts';
import { PROFESSION_FEEDS } from '../data/balance/professions.ts';
import {
  REPUTATION_MAX,
  REPUTATION_MIN,
  REPUTATION_START,
} from '../data/balance/reputation.ts';

export type { CharacterAttributeState, PillarId, BranchId };

/** Живое состояние столпов текущего героя — чтобы collectSaveData не тёр их. */
let liveAttributes: CharacterAttributeState | null = null;

export function setLiveAttributes(state: CharacterAttributeState | null): void {
  liveAttributes = state;
}

export function getLiveAttributes(): CharacterAttributeState {
  return liveAttributes ?? createDefaultAttributes();
}

export function createDefaultAttributes(): CharacterAttributeState {
  return {
    version: ATTRIBUTE_STATE_VERSION,
    pillarRanks: emptyPillarRanks(),
    branchRanks: emptyBranchRanks(),
    unspentPillarPoints: 0,
    unspentBranchPoints: 0,
    heroLevel: HERO_START_LEVEL,
    heroXp: 0,
    energy: { current: ENERGY_MAX_STUB, max: ENERGY_MAX_STUB },
    reputation: REPUTATION_START,
    freeRespecsUsed: 0,
  };
}

function asFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.floor(value)));
}

function migratePillarRanks(raw: unknown): PillarRanks {
  const next = emptyPillarRanks();
  if (!raw || typeof raw !== 'object') return next;
  const rec = raw as Record<string, unknown>;
  for (const id of PILLAR_IDS) {
    next[id] = clampInt(asFiniteNumber(rec[id], 0), 0, PILLAR_RANK_CAP_STUB);
  }
  return next;
}

function migrateBranchRanks(raw: unknown): BranchRanks {
  const next = emptyBranchRanks();
  if (!raw || typeof raw !== 'object') return next;
  const rec = raw as Record<string, unknown>;
  for (const id of BRANCH_IDS) {
    next[id] = clampInt(asFiniteNumber(rec[id], 0), 0, BRANCH_RANK_CAP_STUB);
  }
  return next;
}

/** Старый save без attributes → старт 0. Инвентарь/скиллы не трогаем. */
export function migrateSaveAttributes(raw: unknown): CharacterAttributeState {
  const fresh = createDefaultAttributes();
  if (!raw || typeof raw !== 'object') return fresh;
  const rec = raw as Record<string, unknown>;

  const heroLevel = clampInt(asFiniteNumber(rec.heroLevel, HERO_START_LEVEL), HERO_START_LEVEL, 9999);
  const energyRaw = rec.energy && typeof rec.energy === 'object'
    ? rec.energy as Record<string, unknown>
    : null;

  const migrated: CharacterAttributeState = {
    version: ATTRIBUTE_STATE_VERSION,
    pillarRanks: migratePillarRanks(rec.pillarRanks),
    branchRanks: migrateBranchRanks(rec.branchRanks),
    unspentPillarPoints: clampInt(asFiniteNumber(rec.unspentPillarPoints, 0), 0, 9999),
    unspentBranchPoints: clampInt(asFiniteNumber(rec.unspentBranchPoints, 0), 0, 9999),
    heroLevel,
    heroXp: clampInt(asFiniteNumber(rec.heroXp, 0), 0, Number.MAX_SAFE_INTEGER),
    energy: {
      max: clampInt(asFiniteNumber(energyRaw?.max, ENERGY_MAX_STUB), 1, 99999),
      current: clampInt(asFiniteNumber(energyRaw?.current, ENERGY_MAX_STUB), 0, 99999),
    },
    reputation: clampInt(asFiniteNumber(rec.reputation, REPUTATION_START), REPUTATION_MIN, REPUTATION_MAX),
    freeRespecsUsed: migrateFreeRespecsUsed(rec),
  };

  if (migrated.energy.current > migrated.energy.max) {
    migrated.energy.current = migrated.energy.max;
  }
  return migrated;
}

export function attributesFromSave(save: { attributes?: unknown } | null | undefined): CharacterAttributeState {
  return migrateSaveAttributes(save?.attributes);
}

export function attachAttributesToSave<T extends Record<string, unknown>>(
  save: T | null | undefined,
): (T & { attributes: CharacterAttributeState }) | { attributes: CharacterAttributeState } {
  const attributes = attributesFromSave(save ?? undefined);
  if (!save) return { attributes };
  return { ...save, attributes };
}

export interface ProfessionLevels {
  [skillId: string]: number;
}

export interface ComputeInput {
  state: CharacterAttributeState;
  raceId: AttributeRaceId;
  /** Уровни ремёсел. В 5A бонус = 0 (цифры не закрыты). */
  professionLevels?: ProfessionLevels;
}

export interface SynergyProgress {
  id: SynergyId;
  nameRu: string;
  missing: Partial<Record<PillarId, number>>;
  deficit: number;
}

export interface AttributeSnapshot {
  state: CharacterAttributeState;
  invested: PillarRanks;
  racialImprint: PillarRanks;
  professionBonus: PillarRanks;
  finalPillars: PillarRanks;
  contributions: Record<PillarId, number>;
  activeSynergies: SynergyId[];
  nextSynergy: SynergyProgress | null;
  earnedPillarPoints: number;
  earnedBranchPoints: number;
}

export function computeInvested(state: CharacterAttributeState): PillarRanks {
  const invested = emptyPillarRanks();
  for (const pillar of PILLAR_IDS) {
    let total = state.pillarRanks[pillar];
    for (const branch of BRANCHES_BY_PILLAR[pillar]) {
      total += state.branchRanks[branch] * BRANCH_TO_PILLAR_PER_RANK_STUB;
    }
    invested[pillar] = total;
  }
  return invested;
}

function professionBonusStub(_levels: ProfessionLevels | undefined): PillarRanks {
  const bonus = emptyPillarRanks();
  for (const _feed of PROFESSION_FEEDS) {
    // percentCapStub = 0 — не выдумываем %.
  }
  return bonus;
}

export function computeAttributeSnapshot(input: ComputeInput): AttributeSnapshot {
  const state = input.state;
  const invested = computeInvested(state);
  const racialImprint = emptyPillarRanks();
  const professionBonus = professionBonusStub(input.professionLevels);
  const finalPillars = emptyPillarRanks();
  const contributions = emptyPillarRanks() as unknown as Record<PillarId, number>;

  for (const pillar of PILLAR_IDS) {
    const percent = racePercentFor(input.raceId, pillar);
    racialImprint[pillar] = BODY_BASE_STUB * (percent / 100);
    finalPillars[pillar] = invested[pillar] + racialImprint[pillar] + professionBonus[pillar];
    contributions[pillar] = pillarContribution(finalPillars[pillar]);
  }

  const activeSynergies: SynergyId[] = [];
  const inactive: SynergyProgress[] = [];
  for (const synergy of SYNERGIES) {
    const missing: Partial<Record<PillarId, number>> = {};
    let deficit = 0;
    let ok = true;
    for (const [key, need] of Object.entries(synergy.requires) as [PillarId, number][]) {
      const have = finalPillars[key];
      if (have < need) {
        ok = false;
        const gap = need - have;
        missing[key] = gap;
        deficit += gap;
      }
    }
    if (ok) activeSynergies.push(synergy.id);
    else inactive.push({ id: synergy.id, nameRu: synergy.nameRu, missing, deficit });
  }
  inactive.sort((a, b) => a.deficit - b.deficit || a.id.localeCompare(b.id));

  return {
    state,
    invested,
    racialImprint,
    professionBonus,
    finalPillars,
    contributions,
    activeSynergies,
    nextSynergy: inactive[0] ?? null,
    earnedPillarPoints: earnedPillarPoints(state.heroLevel),
    earnedBranchPoints: earnedBranchPoints(state.heroLevel),
  };
}

export function spendPillarPoint(state: CharacterAttributeState, pillar: PillarId): CharacterAttributeState | null {
  if (state.unspentPillarPoints < 1) return null;
  if (state.pillarRanks[pillar] >= PILLAR_RANK_CAP_STUB) return null;
  return {
    ...state,
    unspentPillarPoints: state.unspentPillarPoints - 1,
    pillarRanks: { ...state.pillarRanks, [pillar]: state.pillarRanks[pillar] + 1 },
  };
}

export function spendBranchPoint(state: CharacterAttributeState, branch: BranchId): CharacterAttributeState | null {
  if (state.unspentBranchPoints < 1) return null;
  if (state.branchRanks[branch] >= BRANCH_RANK_CAP_STUB) return null;
  return {
    ...state,
    unspentBranchPoints: state.unspentBranchPoints - 1,
    branchRanks: { ...state.branchRanks, [branch]: state.branchRanks[branch] + 1 },
  };
}

export function spentPillarRanks(state: CharacterAttributeState): number {
  return PILLAR_IDS.reduce((sum, id) => sum + state.pillarRanks[id], 0);
}

export function spentBranchRanks(state: CharacterAttributeState): number {
  return BRANCH_IDS.reduce((sum, id) => sum + state.branchRanks[id], 0);
}

function migrateFreeRespecsUsed(rec: Record<string, unknown>): number {
  if (typeof rec.freeRespecsUsed === 'number' && Number.isFinite(rec.freeRespecsUsed)) {
    return clampInt(rec.freeRespecsUsed, 0, FREE_RESPEC_LIMIT);
  }
  return rec.freeRespecUsed === true ? 1 : 0;
}

export function remainingFreeRespecs(state: CharacterAttributeState): number {
  return Math.max(0, FREE_RESPEC_LIMIT - state.freeRespecsUsed);
}

/** Бесплатный сброс — FREE_RESPEC_LIMIT раз за жизнь. Дальше золото не отдаём (цена не закрыта). */
export function respecAttributes(state: CharacterAttributeState): CharacterAttributeState | null {
  const spentP = spentPillarRanks(state);
  const spentB = spentBranchRanks(state);
  if (spentP + spentB === 0) return null;
  if (remainingFreeRespecs(state) < 1) return null;
  return {
    ...state,
    pillarRanks: emptyPillarRanks(),
    branchRanks: emptyBranchRanks(),
    unspentPillarPoints: state.unspentPillarPoints + spentP,
    unspentBranchPoints: state.unspentBranchPoints + spentB,
    freeRespecsUsed: state.freeRespecsUsed + 1,
  };
}

export { earnedBranchPoints, earnedPillarPoints, pillarContribution, FREE_RESPEC_LIMIT };
