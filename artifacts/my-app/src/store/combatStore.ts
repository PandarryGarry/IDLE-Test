import { create } from 'zustand';
import type { Monster, MonsterAbility } from '@/data/types';
import { MONSTERS_MAP, AREAS_MAP } from '@/domain/combat/monsters';
import { rollDrops, rollGp } from '@/core/formulas';
import { usePlayerStore } from '@/store/playerStore';
import { useCharacterStore } from '@/store/characterStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useAuthStore } from '@/store/authStore';
import { GUEST_NOTICE } from '@/lib/guestMode';
import { getItem } from '@/domain/items';
import {
  applyHeroXp,
  computeAttributeSnapshot,
  getLiveAttributes,
} from '@/domain/attributes/characterAttributes';
import { foldBonusesIntoRaw, sumEquipmentBonuses } from '@/domain/attributes/equipmentSubstats';
import { commitHeroAttributes } from '@/lib/heroPersist';
import { getAdminRates, isSkillEnabledForAdmin } from '@/store/adminConfigStore';
import {
  AUTO_EAT_HP_RATIO,
  COMBAT_AUTOPLAN,
  COMBAT_ENERGY,
  COMBAT_INTENTS,
  COMBAT_LOG_MAX_ENTRIES,
  COMBAT_MODEL,
  COMBAT_RECOVERY,
  COMBAT_STRATEGIES,
  COMBAT_TACTICS,
  DEATH_RESTORE_RATIO,
  HERO_FIRST_ATTACK_DELAY_MS,
  HERO_XP_PER_MONSTER_LEVEL,
} from '@/data/balance/combat';
import {
  bossPhaseAttackModifiers,
  bossPhaseForHp,
  chooseTarget,
  deriveEnemyCombatStats,
  deriveHeroCombatStats,
  EMPTY_PRD_STATE,
  encounterPackSize,
  estimateRisk,
  inferMonsterTraits,
  intentAttackModifiers,
  nextIntentForMonster,
  resolveAttack,
  rollPrd,
  type AttackModifiers,
  type AttackPrdState,
  type CombatIntent,
  type CombatStrategyId,
  type CombatTacticId,
  type CombatTraitId,
  type FighterCombatStats,
  type RiskForecast,
  type TargetPriority,
  type TargetSnapshot,
} from '@/domain/combat/combatModel';

export type CombatLogType =
  | 'player_attack'
  | 'enemy_attack'
  | 'player_death'
  | 'enemy_death'
  | 'eat'
  | 'tactic'
  | 'loot'
  | 'info';

export interface CombatLogEntry {
  id: string;
  timestamp: number;
  type: CombatLogType;
  message: string;
  damage?: number;
}

export interface CombatEnemy extends TargetSnapshot {
  monsterId: string;
  name: string;
  description?: string;
  iconPath?: string;
  abilities?: MonsterAbility[];
  combatLevel: number;
  attackInterval: number;
  guardedMs: number;
  intentIndex: number;
  bossPhase: number;
  isBoss: boolean;
}

export interface CombatReport {
  id: string;
  timestamp: number;
  reason: 'manual' | 'defeat' | 'disabled' | 'reset' | 'exhausted';
  durationMs: number;
  kills: number;
  waves: number;
  xp: number;
  gp: number;
  loot: Record<string, number>;
  totalDamageDealt: number;
  totalDamageTaken: number;
  summary: string;
  notes: string[];
}

interface HeroLiveCombatSnapshot {
  stats: FighterCombatStats;
  maxHp: number;
}

export interface StartCombatOptions {
  /** Сбор может пометить обычного врага как boss-encounter, не меняя каталог. */
  boss?: boolean;
}

export interface CombatStore {
  inCombat: boolean;
  activeAreaId: string | null;
  activeMonsterId: string | null;
  sortieMonsterId: string | null;
  sortieBoss: boolean;
  currentMonster: Monster | null;

  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;

  enemies: CombatEnemy[];
  selectedEnemyId: string | null;
  currentTargetId: string | null;
  targetPriority: TargetPriority;
  strategy: CombatStrategyId;
  autoPlan: boolean;
  playerStats: FighterCombatStats | null;
  playerPrd: AttackPrdState;
  enemyPrd: Record<string, AttackPrdState>;
  playerGuardMs: number;
  playerManeuverMs: number;
  tacticCooldowns: Record<CombatTacticId, number>;

  combatLog: CombatLogEntry[];
  killCount: number;
  waveCount: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  sortieStartedAt: number | null;
  sessionXp: number;
  sessionGp: number;
  sessionLoot: Record<string, number>;
  lastReport: CombatReport | null;
  sortieEnergyCurrent: number;
  sortieEnergyMax: number;
  energyDrainMs: number;

  autoEat: boolean;
  autoLoot: boolean;

  playerAttackTimer: number;
  enemyAttackTimer: number;

  startCombat: (areaId: string, monsterId?: string, options?: StartCombatOptions) => void;
  stopCombat: (reason?: CombatReport['reason']) => void;
  tickCombat: (deltaMs: number) => void;
  setAutoEat: (enabled: boolean) => void;
  setAutoLoot: (enabled: boolean) => void;
  setAutoPlan: (enabled: boolean) => void;
  setStrategy: (strategy: CombatStrategyId) => void;
  setTargetPriority: (priority: TargetPriority) => void;
  selectEnemy: (instanceId: string | null) => void;
  performTactic: (tactic: CombatTacticId) => void;
  eatFood: (itemId: string) => void;
  restAtCamp: () => void;
  nextMonster: () => void;
  addLog: (entry: Omit<CombatLogEntry, 'id' | 'timestamp'>) => void;
  getRiskForecast: (areaId: string) => RiskForecast | null;
  reset: () => void;
}

let _logId = 0;
let _reportId = 0;

function newLog(type: CombatLogEntry['type'], message: string, damage?: number): CombatLogEntry {
  return { id: String(++_logId), timestamp: Date.now(), type, message, damage };
}

function currentRaceId(): 'human' | 'elf' | 'dwarf' | 'orc' | 'beastfolk' {
  return (useCharacterStore.getState().activeCharacter?.raceId ?? 'human') as 'human' | 'elf' | 'dwarf' | 'orc' | 'beastfolk';
}

export function liveCombatSnapshot(strategy: CombatStrategyId): HeroLiveCombatSnapshot {
  const state = getLiveAttributes();
  const base = computeAttributeSnapshot({ state, raceId: currentRaceId() });
  const gear = sumEquipmentBonuses(usePlayerStore.getState().equipment, getItem);
  const substats = foldBonusesIntoRaw(base.substats, gear.totals);
  const stats = deriveHeroCombatStats({ substats, finalPillars: base.finalPillars, strategy });
  return { stats, maxHp: stats.maxHp };
}

function addHeroXp(amount: number): { levelUps: number; nextLevel: number; energyCurrent: number; energyMax: number } {
  const before = getLiveAttributes();
  if (!Number.isFinite(amount) || amount <= 0) {
    return { levelUps: 0, nextLevel: before.heroLevel, energyCurrent: before.energy.current, energyMax: before.energy.max };
  }
  const afterXp = applyHeroXp(before, amount);
  const levelUps = Math.max(0, afterXp.heroLevel - before.heroLevel);
  const energyRestore = levelUps > 0
    ? Math.ceil(afterXp.energy.max * COMBAT_RECOVERY.levelUpEnergyRestoreRatio)
    : 0;
  const after = energyRestore > 0
    ? { ...afterXp, energy: { ...afterXp.energy, current: Math.min(afterXp.energy.max, afterXp.energy.current + energyRestore) } }
    : afterXp;
  commitHeroAttributes(after);
  return { levelUps, nextLevel: after.heroLevel, energyCurrent: after.energy.current, energyMax: after.energy.max };
}

function spendHeroEnergy(amount: number): { spent: number; current: number; max: number } {
  const state = getLiveAttributes();
  const max = Math.max(1, Math.floor(state.energy.max));
  const current = Math.max(0, Math.min(max, Math.floor(state.energy.current)));
  const spent = Math.max(0, Math.min(current, Math.floor(amount)));
  if (spent <= 0) return { spent: 0, current, max };
  const next = current - spent;
  commitHeroAttributes({ ...state, energy: { ...state.energy, max, current: next } });
  return { spent, current: next, max };
}

function restoreHeroCampResources(strategyId: CombatStrategyId): { hpMax: number; energyCurrent: number; energyMax: number } {
  const hero = liveCombatSnapshot(strategyId);
  const state = getLiveAttributes();
  const energyMax = Math.max(1, Math.floor(state.energy.max));
  const energyCurrent = Math.min(
    energyMax,
    Math.max(0, Math.floor(energyMax * COMBAT_RECOVERY.campRestEnergyRatio)),
  );
  commitHeroAttributes({ ...state, energy: { ...state.energy, max: energyMax, current: energyCurrent } });
  return { hpMax: Math.max(1, Math.floor(hero.maxHp * COMBAT_RECOVERY.campRestHealRatio)), energyCurrent, energyMax };
}

function emptyCooldowns(): Record<CombatTacticId, number> {
  return { guard: 0, maneuver: 0, technique: 0, pierce: 0 };
}

function emptyPrd(): AttackPrdState {
  return { ...EMPTY_PRD_STATE };
}

function prependLogs(logs: CombatLogEntry[], previous: CombatLogEntry[]): CombatLogEntry[] {
  if (logs.length === 0) return previous;
  return [...logs.reverse(), ...previous].slice(0, COMBAT_LOG_MAX_ENTRIES);
}

function combatTargetSnapshot(enemy: CombatEnemy): TargetSnapshot {
  return {
    instanceId: enemy.instanceId,
    hp: enemy.hp,
    maxHp: enemy.maxHp,
    stats: enemy.stats,
    attackTimer: enemy.attackTimer,
    traits: enemy.traits,
    intent: enemy.intent,
    alive: enemy.alive,
    spawnOrder: enemy.spawnOrder,
  };
}

function pickTarget(
  enemies: CombatEnemy[],
  selectedEnemyId: string | null,
  priority: TargetPriority,
): CombatEnemy | null {
  const selected = selectedEnemyId
    ? enemies.find(e => e.instanceId === selectedEnemyId && e.alive && e.hp > 0)
    : null;
  if (selected) return selected;
  const chosen = chooseTarget(enemies.map(combatTargetSnapshot), priority);
  return chosen ? enemies.find(e => e.instanceId === chosen.instanceId) ?? null : null;
}

function encounterRoster(
  areaId: string,
  preferredMonsterId?: string,
  options: StartCombatOptions = {},
): Monster[] {
  const area = AREAS_MAP[areaId];
  if (!area) return [];
  const roster = area.monsterIds.map(id => MONSTERS_MAP[id]).filter(Boolean) as Monster[];
  const preferredBase = preferredMonsterId ? MONSTERS_MAP[preferredMonsterId] : undefined;
  const preferred = preferredBase && options.boss ? { ...preferredBase, isBoss: true } : preferredBase;
  if (!preferred || !(preferred.areaId === areaId || area.monsterIds.includes(preferred.id))) return roster;
  return [preferred, ...roster.filter(m => m.id !== preferred.id)];
}

function foodStackCount(): number {
  return useInventoryStore.getState().items.reduce((sum, slot) => {
    const item = getItem(slot.itemId);
    return sum + ((item?.healAmount ?? 0) > 0 ? Math.max(0, slot.quantity) : 0);
  }, 0);
}

function buildWave(
  areaId: string,
  preferredMonsterId: string | undefined,
  waveNumber: number,
  options: StartCombatOptions = {},
): CombatEnemy[] {
  const seedRoster = encounterRoster(areaId, preferredMonsterId, options);
  if (seedRoster.length === 0) return [];
  const preferred = preferredMonsterId ? seedRoster.find(m => m.id === preferredMonsterId) : undefined;
  const packSize = encounterPackSize(areaId, seedRoster.map(m => m.id), preferred);
  const start = preferred ? 0 : waveNumber % Math.max(1, seedRoster.length);
  const picked: Monster[] = [];

  for (let i = 0; i < Math.max(1, packSize); i += 1) {
    const monster = seedRoster[(start + i) % seedRoster.length];
    if (monster) picked.push(monster);
  }

  return picked.map((monster, index) => {
    const stats = deriveEnemyCombatStats(monster);
    const traits = inferMonsterTraits(monster);
    const intentIndex = waveNumber + index;
    const attackTimer = Math.round(
      stats.attackIntervalMs * COMBAT_MODEL.enemyFirstAttackDelayRatio
        + index * COMBAT_MODEL.enemyPackOffsetMs,
    );
    return {
      instanceId: `${waveNumber}:${monster.id}:${index}`,
      monsterId: monster.id,
      name: monster.name,
      description: monster.description,
      iconPath: monster.iconPath,
      abilities: monster.abilities,
      combatLevel: monster.combatLevel,
      hp: stats.maxHp,
      maxHp: stats.maxHp,
      stats,
      attackTimer,
      attackInterval: stats.attackIntervalMs,
      traits,
      intent: nextIntentForMonster(monster, intentIndex),
      intentIndex,
      bossPhase: bossPhaseForHp(stats.maxHp, stats.maxHp),
      guardedMs: 0,
      alive: true,
      spawnOrder: index,
      isBoss: Boolean(monster.isBoss),
    } satisfies CombatEnemy;
  });
}

function syncLegacyEnemyFields(
  enemies: CombatEnemy[],
  selectedEnemyId: string | null,
  priority: TargetPriority,
): {
  currentTargetId: string | null;
  activeMonsterId: string | null;
  currentMonster: Monster | null;
  enemyHp: number;
  enemyMaxHp: number;
  enemyAttackTimer: number;
} {
  const target = pickTarget(enemies, selectedEnemyId, priority);
  const monsterBase = target ? MONSTERS_MAP[target.monsterId] ?? null : null;
  const monster = monsterBase && target?.isBoss && !monsterBase.isBoss ? { ...monsterBase, isBoss: true } : monsterBase;
  return {
    currentTargetId: target?.instanceId ?? null,
    activeMonsterId: target?.monsterId ?? null,
    currentMonster: monster,
    enemyHp: target?.hp ?? 0,
    enemyMaxHp: target?.maxHp ?? 0,
    enemyAttackTimer: target?.attackTimer ?? 0,
  };
}

function recordLoot(loot: Record<string, number>, itemId: string, qty: number): Record<string, number> {
  if (qty <= 0) return loot;
  return { ...loot, [itemId]: (loot[itemId] ?? 0) + qty };
}

function reportLabel(reason: CombatReport['reason']): string {
  if (reason === 'defeat') return 'герой пал и вернулся к точке';
  if (reason === 'exhausted') return 'герой выдохся и вернулся в лагерь';
  if (reason === 'disabled') return 'бой отключён настройками';
  if (reason === 'reset') return 'состояние сброшено';
  return 'вылазка остановлена вручную';
}

function buildReport(state: CombatStore, reason: CombatReport['reason'], notes: string[] = []): CombatReport {
  const durationMs = Math.max(0, Date.now() - (state.sortieStartedAt ?? Date.now()));
  const summary = state.killCount > 0
    ? `Причина: ${reportLabel(reason)}. Побед: ${state.killCount}, волн: ${Math.max(1, state.waveCount)}.`
    : `Причина: ${reportLabel(reason)}. Враги не добиты — попробуйте более осторожную стратегию.`;
  const reportNotes = [...notes];
  if (state.totalDamageTaken > state.totalDamageDealt) {
    reportNotes.push('Входящий урон выше исходящего: усильте Броню, Здоровье или включите осторожный автоплан.');
  }
  if (state.killCount > 0 && state.autoLoot) {
    reportNotes.push('Авто-лут собрал добычу сразу после каждого добивания.');
  }
  if (!state.autoEat) {
    reportNotes.push('Авто-еда была выключена — прогноз idle становится рискованнее.');
  }

  return {
    id: String(++_reportId),
    timestamp: Date.now(),
    reason,
    durationMs,
    kills: state.killCount,
    waves: Math.max(0, state.waveCount),
    xp: state.sessionXp,
    gp: state.sessionGp,
    loot: { ...state.sessionLoot },
    totalDamageDealt: state.totalDamageDealt,
    totalDamageTaken: state.totalDamageTaken,
    summary,
    notes: reportNotes,
  };
}

function grantEnemyRewards(input: {
  enemy: CombatEnemy;
  logs: CombatLogEntry[];
  state: CombatStore;
  sessionXp: number;
  sessionGp: number;
  sessionLoot: Record<string, number>;
}): { sessionXp: number; sessionGp: number; sessionLoot: Record<string, number>; levelUps: number; energyCurrent: number; energyMax: number } {
  const monster = MONSTERS_MAP[input.enemy.monsterId];
  const energy = getLiveAttributes().energy;
  if (!monster) return { sessionXp: input.sessionXp, sessionGp: input.sessionGp, sessionLoot: input.sessionLoot, levelUps: 0, energyCurrent: energy.current, energyMax: energy.max };
  const inventory = useInventoryStore.getState();
  const notifs = useNotificationsStore.getState();
  const rates = getAdminRates();
  let { sessionXp, sessionGp, sessionLoot } = input;
  let levelUps = 0;
  let energyCurrent = getLiveAttributes().energy.current;
  let energyMax = getLiveAttributes().energy.max;

  const heroXp = Math.max(0, Math.round(monster.combatLevel * HERO_XP_PER_MONSTER_LEVEL * rates.combatXpMultiplier));
  if (heroXp > 0) {
    const xpResult = addHeroXp(heroXp);
    levelUps = xpResult.levelUps;
    energyCurrent = xpResult.energyCurrent;
    energyMax = xpResult.energyMax;
    sessionXp += heroXp;
  }

  if (input.state.autoLoot) {
    const drops = rollDrops(monster, Math.random, rates.dropRateMultiplier * rates.combatDropRateMultiplier);
    for (const drop of drops) {
      const ok = inventory.addItem(drop.itemId, drop.quantity);
      const itemName = getItem(drop.itemId)?.name ?? drop.itemId;
      if (ok) {
        sessionLoot = recordLoot(sessionLoot, drop.itemId, drop.quantity);
        input.logs.push(newLog('loot', `Добыча: ${itemName} ×${drop.quantity}`));
      } else {
        input.logs.push(newLog('info', `Сумка полна: ${itemName} не помещается.`));
        notifs.notifyInventoryFull();
      }
    }

    const gp = rollGp(monster.gpDrop, Math.random, rates.goldMultiplier * rates.combatGoldMultiplier);
    if (gp > 0) {
      inventory.addGp(gp);
      sessionGp += gp;
      input.logs.push(newLog('loot', `Монеты: +${gp}`));
    }
  }

  return { sessionXp, sessionGp, sessionLoot, levelUps, energyCurrent, energyMax };
}

const initialState = {
  inCombat: false,
  activeAreaId: null,
  activeMonsterId: null,
  sortieMonsterId: null,
  sortieBoss: false,
  currentMonster: null,
  playerHp: 100,
  playerMaxHp: 100,
  enemyHp: 0,
  enemyMaxHp: 0,
  enemies: [],
  selectedEnemyId: null,
  currentTargetId: null,
  targetPriority: 'dangerous' as TargetPriority,
  strategy: 'balanced' as CombatStrategyId,
  autoPlan: false,
  playerStats: null,
  playerPrd: emptyPrd(),
  enemyPrd: {},
  playerGuardMs: 0,
  playerManeuverMs: 0,
  tacticCooldowns: emptyCooldowns(),
  combatLog: [],
  killCount: 0,
  waveCount: 0,
  totalDamageDealt: 0,
  totalDamageTaken: 0,
  sortieStartedAt: null,
  sessionXp: 0,
  sessionGp: 0,
  sessionLoot: {},
  lastReport: null,
  sortieEnergyCurrent: 0,
  sortieEnergyMax: 0,
  energyDrainMs: 0,
  autoEat: true,
  autoLoot: true,
  playerAttackTimer: 0,
  enemyAttackTimer: 0,
} satisfies Omit<CombatStore,
  | 'startCombat'
  | 'stopCombat'
  | 'tickCombat'
  | 'setAutoEat'
  | 'setAutoLoot'
  | 'setAutoPlan'
  | 'setStrategy'
  | 'setTargetPriority'
  | 'selectEnemy'
  | 'performTactic'
  | 'eatFood'
  | 'restAtCamp'
  | 'nextMonster'
  | 'addLog'
  | 'getRiskForecast'
  | 'reset'
>;

export const useCombatStore = create<CombatStore>((set, get) => ({
  ...initialState,

  startCombat: (areaId, monsterId, options = {}) => {
    if (useAuthStore.getState().isGuest) {
      useNotificationsStore.getState().notifyInfo(GUEST_NOTICE);
      return;
    }

    if (!isSkillEnabledForAdmin('combat')) {
      useNotificationsStore.getState().notifyInfo('Бой отключён в настройках игры.');
      return;
    }

    const area = AREAS_MAP[areaId];
    if (!area) return;

    const hero = liveCombatSnapshot(get().strategy);
    const previous = get();
    const keepsKnownHp = previous.playerMaxHp === hero.maxHp && previous.playerHp > 0;
    const playerCurrentHp = keepsKnownHp ? Math.min(previous.playerHp, hero.maxHp) : hero.maxHp;
    const wave = buildWave(areaId, monsterId, 1, options);
    if (wave.length === 0) return;
    const energyBefore = getLiveAttributes().energy;
    if (energyBefore.current < COMBAT_ENERGY.minToStart) {
      useNotificationsStore.getState().notifyInfo('Не хватает энергии для вылазки. Сделайте передышку в лагере.');
      return;
    }
    const spentEnergy = spendHeroEnergy(COMBAT_ENERGY.startCost);
    const legacy = syncLegacyEnemyFields(wave, null, get().targetPriority);
    const enemyPrd = Object.fromEntries(wave.map(e => [e.instanceId, emptyPrd()]));
    const risk = estimateRisk({
      hero: hero.stats,
      enemies: encounterRoster(areaId, monsterId, options),
      areaId,
      heroLevel: getLiveAttributes().heroLevel,
      requiredLevel: area.combatLevelRequired,
      strategy: get().strategy,
      foodStacks: foodStackCount(),
    });

    set({
      inCombat: true,
      activeAreaId: areaId,
      sortieMonsterId: monsterId ?? null,
      sortieBoss: Boolean(options.boss),
      ...legacy,
      selectedEnemyId: null,
      playerHp: playerCurrentHp,
      playerMaxHp: hero.maxHp,
      enemies: wave,
      playerStats: hero.stats,
      playerPrd: emptyPrd(),
      enemyPrd,
      playerGuardMs: 0,
      playerManeuverMs: 0,
      tacticCooldowns: emptyCooldowns(),
      playerAttackTimer: HERO_FIRST_ATTACK_DELAY_MS,
      combatLog: [newLog('info', `Вылазка: ${area.name}. Прогноз — ${risk.title.toLowerCase()} (${risk.score}). Энергия ${spentEnergy.current}/${spentEnergy.max}.`) ],
      killCount: 0,
      waveCount: 1,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      sortieStartedAt: Date.now(),
      sessionXp: 0,
      sessionGp: 0,
      sessionLoot: {},
      lastReport: null,
      sortieEnergyCurrent: spentEnergy.current,
      sortieEnergyMax: spentEnergy.max,
      energyDrainMs: 0,
    });
  },

  stopCombat: (reason = 'manual') => {
    const state = get();
    if (!state.inCombat) return;
    const report = buildReport(state, reason);
    set({
      inCombat: false,
      activeMonsterId: null,
      sortieMonsterId: null,
      sortieBoss: false,
      currentMonster: null,
      enemyHp: 0,
      enemyMaxHp: 0,
      enemyAttackTimer: 0,
      enemies: [],
      selectedEnemyId: null,
      currentTargetId: null,
      playerGuardMs: 0,
      playerManeuverMs: 0,
      tacticCooldowns: emptyCooldowns(),
      sortieEnergyCurrent: getLiveAttributes().energy.current,
      sortieEnergyMax: getLiveAttributes().energy.max,
      energyDrainMs: 0,
      lastReport: report,
      combatLog: prependLogs([newLog('info', report.summary)], state.combatLog),
    });
  },

  tickCombat: (deltaMs) => {
    const state = get();
    if (!state.inCombat || !state.activeAreaId) return;

    if (!isSkillEnabledForAdmin('combat')) {
      const report = buildReport(state, 'disabled', ['Бой был остановлен, потому что админский переключатель выключил навык.']);
      set({
        inCombat: false,
        activeMonsterId: null,
        sortieMonsterId: null,
        sortieBoss: false,
        currentMonster: null,
        enemyHp: 0,
        enemyMaxHp: 0,
        enemyAttackTimer: 0,
        enemies: [],
        selectedEnemyId: null,
        currentTargetId: null,
        sortieEnergyCurrent: getLiveAttributes().energy.current,
        sortieEnergyMax: getLiveAttributes().energy.max,
        energyDrainMs: 0,
        lastReport: report,
        combatLog: prependLogs([newLog('info', report.summary)], state.combatLog),
      });
      useNotificationsStore.getState().notifyInfo('Бой отключён в настройках игры.');
      return;
    }

    const adminRates = getAdminRates();
    const realDeltaMs = Math.max(0, deltaMs);
    const pacedDeltaMs = realDeltaMs * adminRates.combatPaceMultiplier;

    const hero = liveCombatSnapshot(state.strategy);
    let playerStats = hero.stats;
    let playerMaxHp = hero.maxHp;
    let playerHp = Math.min(state.playerHp, playerMaxHp);
    let enemies = state.enemies.map(e => ({ ...e }));
    let selectedEnemyId = state.selectedEnemyId;
    let playerAttackTimer = state.playerAttackTimer - pacedDeltaMs;
    let playerPrd = { ...state.playerPrd };
    let enemyPrd: Record<string, AttackPrdState> = { ...state.enemyPrd };
    let playerGuardMs = Math.max(0, state.playerGuardMs - pacedDeltaMs);
    let playerManeuverMs = Math.max(0, state.playerManeuverMs - pacedDeltaMs);
    let tacticCooldowns: Record<CombatTacticId, number> = {
      guard: Math.max(0, state.tacticCooldowns.guard - pacedDeltaMs),
      maneuver: Math.max(0, state.tacticCooldowns.maneuver - pacedDeltaMs),
      technique: Math.max(0, state.tacticCooldowns.technique - pacedDeltaMs),
      pierce: Math.max(0, state.tacticCooldowns.pierce - pacedDeltaMs),
    };
    let killCount = state.killCount;
    let waveCount = state.waveCount;
    let totalDamageDealt = state.totalDamageDealt;
    let totalDamageTaken = state.totalDamageTaken;
    let sessionXp = state.sessionXp;
    let sessionGp = state.sessionGp;
    let sessionLoot = { ...state.sessionLoot };
    let sortieEnergyCurrent = state.sortieEnergyCurrent || getLiveAttributes().energy.current;
    let sortieEnergyMax = state.sortieEnergyMax || getLiveAttributes().energy.max;
    let energyDrainMs = state.energyDrainMs + realDeltaMs;
    const strategy = COMBAT_STRATEGIES[state.strategy];
    const logs: CombatLogEntry[] = [];

    enemies = enemies.map(enemy => ({
      ...enemy,
      attackTimer: Math.max(0, enemy.attackTimer - pacedDeltaMs),
      guardedMs: Math.max(0, enemy.guardedMs - pacedDeltaMs),
    }));

    const addStatusLog = (type: CombatLogType, message: string, damage?: number) => {
      logs.push(newLog(type, message, damage));
    };

    if (energyDrainMs >= COMBAT_ENERGY.drainIntervalMs) {
      const drains = Math.floor(energyDrainMs / COMBAT_ENERGY.drainIntervalMs) * COMBAT_ENERGY.drainPerInterval;
      energyDrainMs %= COMBAT_ENERGY.drainIntervalMs;
      const spent = spendHeroEnergy(drains);
      sortieEnergyCurrent = spent.current;
      sortieEnergyMax = spent.max;
      if (spent.spent > 0) addStatusLog('info', `Выносливость: −${spent.spent}. Осталось ${spent.current}/${spent.max}.`);
      if (spent.current <= 0) {
        const restoredHp = Math.max(1, Math.floor(playerMaxHp * COMBAT_ENERGY.exhaustedRestoreRatio));
        const reportState = {
          ...state,
          playerHp: restoredHp,
          playerMaxHp,
          killCount,
          waveCount,
          totalDamageDealt,
          totalDamageTaken,
          sessionXp,
          sessionGp,
          sessionLoot,
          sortieEnergyCurrent: spent.current,
          sortieEnergyMax: spent.max,
          energyDrainMs,
        } as CombatStore;
        const report = buildReport(reportState, 'exhausted', ['Энергия вылазки закончилась: сделайте передышку или выберите менее долгую цель.']);
        logs.push(newLog('info', 'Герой выдохся. Вылазка завершена передышкой в лагере.'));
        set({
          inCombat: false,
          activeMonsterId: null,
          sortieMonsterId: null,
          sortieBoss: false,
          currentMonster: null,
          playerHp: restoredHp,
          playerMaxHp,
          enemyHp: 0,
          enemyMaxHp: 0,
          enemyAttackTimer: 0,
          enemies: [],
          selectedEnemyId: null,
          currentTargetId: null,
          playerStats,
          playerPrd,
          enemyPrd: {},
          playerGuardMs: 0,
          playerManeuverMs: 0,
          tacticCooldowns: emptyCooldowns(),
          killCount,
          waveCount,
          totalDamageDealt,
          totalDamageTaken,
          sessionXp,
          sessionGp,
          sessionLoot,
          sortieEnergyCurrent: spent.current,
          sortieEnergyMax: spent.max,
          energyDrainMs: 0,
          lastReport: report,
          combatLog: prependLogs(logs, state.combatLog),
        });
        return;
      }
    }

    const chooseLiveTarget = () => pickTarget(enemies, selectedEnemyId, state.targetPriority);

    const runPlayerAttack = (label: string, modifiers: AttackModifiers = {}, allowSplash = true) => {
      const target = chooseLiveTarget();
      if (!target) return;
      const targetIndex = enemies.findIndex(e => e.instanceId === target.instanceId);
      if (targetIndex < 0) return;
      const defender = enemies[targetIndex];
      const resolution = resolveAttack({
        attacker: playerStats,
        defender: defender.stats,
        prd: playerPrd,
        rng: Math.random,
        modifiers: {
          ...modifiers,
          defenderArmorBonusPct: (modifiers.defenderArmorBonusPct ?? 0)
            + (defender.guardedMs > 0 ? COMBAT_INTENTS.guard.guardPct : 0),
        },
      });
      playerPrd = resolution.nextPrd;

      if (resolution.outcome === 'miss') {
        addStatusLog('player_attack', `${label}: ${defender.name} уходит от удара.`);
        return;
      }

      const nextHp = Math.max(0, defender.hp - resolution.damage);
      const nextBossPhase = defender.isBoss ? bossPhaseForHp(nextHp, defender.maxHp) : defender.bossPhase;
      enemies[targetIndex] = { ...defender, hp: nextHp, alive: nextHp > 0, bossPhase: nextBossPhase };
      totalDamageDealt += resolution.damage;
      addStatusLog(
        'player_attack',
        `${label}: ${defender.name} получает ${resolution.damage}${resolution.crit ? ' крит.' : ''}`,
        resolution.damage,
      );
      if (defender.isBoss && nextHp > 0 && nextBossPhase > defender.bossPhase) {
        addStatusLog('tactic', `${defender.name}: фаза ${nextBossPhase}. Телеграфы становятся злее.`);
      }

      if (allowSplash && enemies.filter(e => e.alive && e.hp > 0).length > 1) {
        const splashRoll = rollPrd(playerStats.onslaughtPct, playerPrd.onslaughtFailures, Math.random);
        playerPrd = { ...playerPrd, onslaughtFailures: splashRoll.failures };
        if (splashRoll.success) {
          const secondary = chooseTarget(
            enemies
              .filter(e => e.instanceId !== defender.instanceId)
              .map(combatTargetSnapshot),
            'dangerous',
          );
          const splashIndex = secondary ? enemies.findIndex(e => e.instanceId === secondary.instanceId) : -1;
          if (splashIndex >= 0) {
            const splashEnemy = enemies[splashIndex];
            const splash = resolveAttack({
              attacker: playerStats,
              defender: splashEnemy.stats,
              prd: playerPrd,
              rng: Math.random,
              modifiers: {
                damageMultiplier: COMBAT_MODEL.onslaughtSplashRatio,
                allowCrit: false,
              },
            });
            playerPrd = splash.nextPrd;
            if (splash.outcome === 'hit') {
              const splashHp = Math.max(0, splashEnemy.hp - splash.damage);
              const splashPhase = splashEnemy.isBoss ? bossPhaseForHp(splashHp, splashEnemy.maxHp) : splashEnemy.bossPhase;
              enemies[splashIndex] = { ...splashEnemy, hp: splashHp, alive: splashHp > 0, bossPhase: splashPhase };
              totalDamageDealt += splash.damage;
              addStatusLog('player_attack', `Натиск задевает ${splashEnemy.name}: ${splash.damage}`, splash.damage);
              if (splashEnemy.isBoss && splashHp > 0 && splashPhase > splashEnemy.bossPhase) {
                addStatusLog('tactic', `${splashEnemy.name}: фаза ${splashPhase}. Телеграфы становятся злее.`);
              }
            }
          }
        }
      }
    };

    const activateGuard = (source: 'manual' | 'auto') => {
      if (tacticCooldowns.guard > 0) return false;
      playerGuardMs = COMBAT_TACTICS.guard.durationMs;
      tacticCooldowns.guard = COMBAT_TACTICS.guard.cooldownMs;
      addStatusLog('tactic', `${source === 'auto' ? 'Автоплан' : 'Вы'}: щит поднят под опасный удар.`);
      return true;
    };

    const activateManeuver = (source: 'manual' | 'auto') => {
      if (tacticCooldowns.maneuver > 0) return false;
      playerManeuverMs = COMBAT_TACTICS.maneuver.durationMs;
      tacticCooldowns.maneuver = COMBAT_TACTICS.maneuver.cooldownMs;
      addStatusLog('tactic', `${source === 'auto' ? 'Автоплан' : 'Вы'}: манёвр смещает линию атаки.`);
      return true;
    };

    const useTechnique = (source: 'manual' | 'auto') => {
      if (tacticCooldowns.technique > 0) return false;
      tacticCooldowns.technique = COMBAT_TACTICS.technique.cooldownMs;
      runPlayerAttack(source === 'auto' ? 'Авто-приём' : 'Приём', {
        damageMultiplier: COMBAT_TACTICS.technique.damageMultiplier,
        accuracyBonusPct: COMBAT_TACTICS.technique.accuracyBonusPct,
      });
      return true;
    };

    const usePierce = (source: 'manual' | 'auto') => {
      if (tacticCooldowns.pierce > 0) return false;
      tacticCooldowns.pierce = COMBAT_TACTICS.pierce.cooldownMs;
      runPlayerAttack(source === 'auto' ? 'Авто-пробой' : 'Пробой', {
        damageMultiplier: COMBAT_TACTICS.pierce.damageMultiplier,
        armorPenBonusPct: COMBAT_TACTICS.pierce.armorPenBonusPct,
      }, false);
      return true;
    };

    if (state.autoPlan) {
      const target = chooseLiveTarget();
      const heavySoon = enemies.find(e => e.alive && e.intent.kind === 'heavy' && e.attackTimer <= COMBAT_AUTOPLAN.guardWindowMs);
      if (
        strategy.autoGuardHeavy
        && heavySoon
        && tacticCooldowns.guard <= 0
        && playerGuardMs <= 0
      ) activateGuard('auto');
      else if (
        playerHp / Math.max(1, playerMaxHp) <= COMBAT_AUTOPLAN.lowHpGuardRatio
        && tacticCooldowns.guard <= 0
        && state.strategy !== 'greedy'
      ) activateGuard('auto');

      if (
        target
        && strategy.autoFinish
        && target.hp / Math.max(1, target.maxHp) <= COMBAT_AUTOPLAN.finisherHpRatio
        && playerHp / Math.max(1, playerMaxHp) >= COMBAT_AUTOPLAN.minPlayerHpForTechniqueRatio
      ) useTechnique('auto');
      else if (
        target
        && target.stats.armorPct >= COMBAT_AUTOPLAN.armorPierceThresholdPct
        && tacticCooldowns.pierce <= 0
      ) usePierce('auto');
    }

    while (playerAttackTimer <= 0 && enemies.some(e => e.alive && e.hp > 0)) {
      runPlayerAttack('Удар');
      playerAttackTimer += playerStats.attackIntervalMs;
    }

    const reapDefeated = () => {
      const defeated = enemies.filter(e => e.hp <= 0 || !e.alive);
      if (defeated.length === 0) return;
      for (const enemy of defeated) {
        killCount += 1;
        addStatusLog('enemy_death', `${enemy.name} повержен. Побед: ${killCount}`);
        const reward = grantEnemyRewards({ enemy, logs, state, sessionXp, sessionGp, sessionLoot });
        sessionXp = reward.sessionXp;
        sessionGp = reward.sessionGp;
        sessionLoot = reward.sessionLoot;
        sortieEnergyCurrent = reward.energyCurrent;
        sortieEnergyMax = reward.energyMax;
        if (reward.levelUps > 0) {
          const leveledHero = liveCombatSnapshot(state.strategy);
          playerStats = leveledHero.stats;
          playerMaxHp = leveledHero.maxHp;
          playerHp = Math.max(1, Math.floor(playerMaxHp * COMBAT_RECOVERY.levelUpHealRatio));
          addStatusLog('info', `Новый уровень! ОЗ восстановлены до ${playerHp}.`);
        }
        delete enemyPrd[enemy.instanceId];
      }
      enemies = enemies.filter(e => e.alive && e.hp > 0);
      if (enemies.length === 0) {
        waveCount += 1;
        const nextWave = buildWave(state.activeAreaId ?? '', state.sortieMonsterId ?? undefined, waveCount, { boss: state.sortieBoss });
        enemies = nextWave;
        for (const enemy of nextWave) enemyPrd[enemy.instanceId] = emptyPrd();
        selectedEnemyId = null;
        const names = nextWave.map(e => e.name).join(', ');
        addStatusLog('info', `Новая волна: ${names}`);
      }
    };

    reapDefeated();

    for (let i = 0; i < enemies.length; i += 1) {
      let enemy = enemies[i];
      if (!enemy.alive || enemy.hp <= 0 || playerHp <= 0) continue;
      while (enemy.attackTimer <= 0 && playerHp > 0 && enemy.alive) {
        const monster = MONSTERS_MAP[enemy.monsterId];
        if (!monster) break;
        if (enemy.intent.kind === 'guard') {
          enemy = {
            ...enemy,
            guardedMs: enemy.stats.attackIntervalMs,
            intentIndex: enemy.intentIndex + 1,
          };
          enemy.intent = nextIntentForMonster(monster, enemy.intentIndex);
          enemy.attackTimer += enemy.stats.attackIntervalMs;
          enemies[i] = enemy;
          addStatusLog('enemy_attack', `${enemy.name}: защитная стойка, броня временно выше.`);
          continue;
        }

        const defender: FighterCombatStats = {
          ...playerStats,
          evasionPct: playerStats.evasionPct + (playerManeuverMs > 0 ? COMBAT_TACTICS.maneuver.evasionBonusPct : 0),
        };
        const incomingMultiplier = strategy.incomingDamageMultiplier
          * (playerGuardMs > 0 ? COMBAT_TACTICS.guard.incomingDamageMultiplier : 1);
        const intentMods = intentAttackModifiers(enemy.intent);
        const phaseMods = enemy.isBoss ? bossPhaseAttackModifiers(enemy.bossPhase) : {};
        const resolution = resolveAttack({
          attacker: enemy.stats,
          defender,
          prd: enemyPrd[enemy.instanceId] ?? emptyPrd(),
          rng: Math.random,
          modifiers: {
            ...intentMods,
            ...phaseMods,
            damageMultiplier: (intentMods.damageMultiplier ?? 1) * (phaseMods.damageMultiplier ?? 1),
            accuracyBonusPct: (intentMods.accuracyBonusPct ?? 0) + (phaseMods.accuracyBonusPct ?? 0),
            incomingDamageMultiplier: incomingMultiplier,
          },
        });
        enemyPrd[enemy.instanceId] = resolution.nextPrd;
        if (resolution.outcome === 'hit') {
          playerHp = Math.max(0, playerHp - resolution.damage);
          totalDamageTaken += resolution.damage;
          addStatusLog(
            'enemy_attack',
            `${enemy.name}: ${enemy.intent.label.toLowerCase()} — ${resolution.damage}${resolution.crit ? ' крит.' : ''}`,
            resolution.damage,
          );
        } else {
          addStatusLog('enemy_attack', `${enemy.name}: ${enemy.intent.label.toLowerCase()} мимо.`);
        }
        enemy = {
          ...enemy,
          attackTimer: enemy.attackTimer + enemy.stats.attackIntervalMs,
          intentIndex: enemy.intentIndex + 1,
        };
        enemy.intent = nextIntentForMonster(monster, enemy.intentIndex);
        enemies[i] = enemy;
      }
    }

    if (state.autoEat && playerHp > 0) {
      const autoEatRatio = Math.max(AUTO_EAT_HP_RATIO, strategy.autoEatRatio);
      if (playerHp / Math.max(1, playerMaxHp) <= autoEatRatio) {
        const inventory = useInventoryStore.getState();
        const food = inventory.items
          .map(slot => ({ slot, item: getItem(slot.itemId) }))
          .filter(({ item }) => (item?.healAmount ?? 0) > 0)
          .sort((a, b) => (b.item?.healAmount ?? 0) - (a.item?.healAmount ?? 0))[0];
        if (food?.item && inventory.removeItem(food.slot.itemId, 1)) {
          playerHp = Math.min(playerMaxHp, playerHp + food.item.healAmount!);
          addStatusLog('eat', `Авто-еда: ${food.item.name} (+${food.item.healAmount} ОЗ)`);
        }
      }
    }

    if (playerHp <= 0) {
      const restoredHp = Math.max(1, Math.floor(playerMaxHp * DEATH_RESTORE_RATIO));
      const reportState = {
        ...state,
        playerHp: restoredHp,
        playerMaxHp,
        killCount,
        waveCount,
        totalDamageDealt,
        totalDamageTaken,
        sessionXp,
        sessionGp,
        sessionLoot,
        sortieEnergyCurrent,
        sortieEnergyMax,
        energyDrainMs,
      } as CombatStore;
      const report = buildReport(reportState, 'defeat', ['Последний удар прошёл до авто-еды: увеличьте HP, броню или порог безопасности через стратегию.']);
      logs.push(newLog('player_death', 'Вы пали. Вылазка завершена, герой вернулся к точке.'));
      set({
        inCombat: false,
        activeMonsterId: null,
        sortieMonsterId: null,
        sortieBoss: false,
        currentMonster: null,
        playerHp: restoredHp,
        playerMaxHp,
        enemyHp: 0,
        enemyMaxHp: 0,
        enemyAttackTimer: 0,
        enemies: [],
        selectedEnemyId: null,
        currentTargetId: null,
        playerStats,
        playerPrd,
        enemyPrd: {},
        playerGuardMs: 0,
        playerManeuverMs: 0,
        tacticCooldowns: emptyCooldowns(),
        killCount,
        waveCount,
        totalDamageDealt,
        totalDamageTaken,
        sessionXp,
        sessionGp,
        sessionLoot,
        sortieEnergyCurrent,
        sortieEnergyMax,
        energyDrainMs: 0,
        lastReport: report,
        combatLog: prependLogs(logs, state.combatLog),
      });
      useNotificationsStore.getState().notifyCombat('💀 Герой пал, вылазка завершена.');
      return;
    }

    if (selectedEnemyId && !enemies.some(e => e.instanceId === selectedEnemyId && e.alive && e.hp > 0)) {
      selectedEnemyId = null;
    }
    const legacy = syncLegacyEnemyFields(enemies, selectedEnemyId, state.targetPriority);
    set({
      ...legacy,
      selectedEnemyId,
      playerHp,
      playerMaxHp,
      enemies,
      playerStats,
      playerPrd,
      enemyPrd,
      playerGuardMs,
      playerManeuverMs,
      tacticCooldowns,
      playerAttackTimer,
      killCount,
      waveCount,
      totalDamageDealt,
      totalDamageTaken,
      sessionXp,
      sessionGp,
      sessionLoot,
      sortieEnergyCurrent,
      sortieEnergyMax,
      energyDrainMs,
      combatLog: prependLogs(logs, state.combatLog),
    });
  },

  setAutoEat: (enabled) => set({ autoEat: enabled }),
  setAutoLoot: (enabled) => set({ autoLoot: enabled }),
  setAutoPlan: (enabled) => set({ autoPlan: enabled }),

  setStrategy: (strategy) => {
    const hero = liveCombatSnapshot(strategy);
    set(s => ({
      strategy,
      playerStats: hero.stats,
      playerMaxHp: hero.maxHp,
      playerHp: Math.min(s.playerHp, hero.maxHp),
    }));
  },

  setTargetPriority: (priority) => {
    set(s => {
      const legacy = syncLegacyEnemyFields(s.enemies, null, priority);
      return { targetPriority: priority, selectedEnemyId: null, ...legacy };
    });
  },

  selectEnemy: (instanceId) => {
    set(s => {
      const alive = instanceId ? s.enemies.some(e => e.instanceId === instanceId && e.alive && e.hp > 0) : false;
      const nextSelected = alive ? instanceId : null;
      const legacy = syncLegacyEnemyFields(s.enemies, nextSelected, s.targetPriority);
      return { selectedEnemyId: nextSelected, ...legacy };
    });
  },

  performTactic: (tactic) => {
    const state = get();
    if (!state.inCombat || !state.playerStats) return;
    if (state.tacticCooldowns[tactic] > 0) return;

    if (tactic === 'guard') {
      set(s => ({
        playerGuardMs: COMBAT_TACTICS.guard.durationMs,
        tacticCooldowns: { ...s.tacticCooldowns, guard: COMBAT_TACTICS.guard.cooldownMs },
        combatLog: prependLogs([newLog('tactic', 'Вы поднимаете щит: следующий входящий урон ниже.')], s.combatLog),
      }));
      return;
    }

    if (tactic === 'maneuver') {
      set(s => ({
        playerManeuverMs: COMBAT_TACTICS.maneuver.durationMs,
        tacticCooldowns: { ...s.tacticCooldowns, maneuver: COMBAT_TACTICS.maneuver.cooldownMs },
        combatLog: prependLogs([newLog('tactic', 'Манёвр: уворот временно выше, линия атаки смещена.')], s.combatLog),
      }));
      return;
    }

    const target = pickTarget(state.enemies, state.selectedEnemyId, state.targetPriority);
    if (!target) return;
    const targetIndex = state.enemies.findIndex(e => e.instanceId === target.instanceId);
    if (targetIndex < 0) return;
    const modifiers: AttackModifiers = tactic === 'technique'
      ? {
          damageMultiplier: COMBAT_TACTICS.technique.damageMultiplier,
          accuracyBonusPct: COMBAT_TACTICS.technique.accuracyBonusPct,
        }
      : {
          damageMultiplier: COMBAT_TACTICS.pierce.damageMultiplier,
          armorPenBonusPct: COMBAT_TACTICS.pierce.armorPenBonusPct,
        };
    const resolution = resolveAttack({
      attacker: state.playerStats,
      defender: target.stats,
      prd: state.playerPrd,
      rng: Math.random,
      modifiers,
    });
    let phaseLog: CombatLogEntry | null = null;
    const enemies = state.enemies.map((e, i) => {
      if (i !== targetIndex || resolution.outcome === 'miss') return e;
      const hp = Math.max(0, e.hp - resolution.damage);
      const bossPhase = e.isBoss ? bossPhaseForHp(hp, e.maxHp) : e.bossPhase;
      if (e.isBoss && hp > 0 && bossPhase > e.bossPhase) {
        phaseLog = newLog('tactic', `${e.name}: фаза ${bossPhase}. Телеграфы становятся злее.`);
      }
      return { ...e, hp, alive: hp > 0, bossPhase };
    });
    const label = tactic === 'technique' ? 'Приём' : 'Пробой';
    const logs = [
      resolution.outcome === 'hit'
        ? newLog('player_attack', `${label}: ${target.name} получает ${resolution.damage}${resolution.crit ? ' крит.' : ''}`, resolution.damage)
        : newLog('player_attack', `${label}: ${target.name} уходит от удара.`),
      ...(phaseLog ? [phaseLog] : []),
    ];
    let nextEnemies = enemies;
    let nextEnemyPrd = { ...state.enemyPrd };
    let nextKillCount = state.killCount;
    let nextWaveCount = state.waveCount;
    let nextSessionXp = state.sessionXp;
    let nextSessionGp = state.sessionGp;
    let nextSessionLoot = { ...state.sessionLoot };
    let nextPlayerHp = state.playerHp;
    let nextPlayerMaxHp = state.playerMaxHp;
    let nextPlayerStats = state.playerStats;
    let nextEnergyCurrent = state.sortieEnergyCurrent || getLiveAttributes().energy.current;
    let nextEnergyMax = state.sortieEnergyMax || getLiveAttributes().energy.max;

    if (resolution.outcome === 'hit') {
      const defeated = nextEnemies.filter(e => e.hp <= 0 || !e.alive);
      for (const enemy of defeated) {
        nextKillCount += 1;
        logs.push(newLog('enemy_death', `${enemy.name} повержен. Побед: ${nextKillCount}`));
        const reward = grantEnemyRewards({
          enemy,
          logs,
          state,
          sessionXp: nextSessionXp,
          sessionGp: nextSessionGp,
          sessionLoot: nextSessionLoot,
        });
        nextSessionXp = reward.sessionXp;
        nextSessionGp = reward.sessionGp;
        nextSessionLoot = reward.sessionLoot;
        nextEnergyCurrent = reward.energyCurrent;
        nextEnergyMax = reward.energyMax;
        if (reward.levelUps > 0) {
          const leveledHero = liveCombatSnapshot(state.strategy);
          nextPlayerStats = leveledHero.stats;
          nextPlayerMaxHp = leveledHero.maxHp;
          nextPlayerHp = Math.max(1, Math.floor(nextPlayerMaxHp * COMBAT_RECOVERY.levelUpHealRatio));
          logs.push(newLog('info', `Новый уровень! ОЗ восстановлены до ${nextPlayerHp}.`));
        }
        delete nextEnemyPrd[enemy.instanceId];
      }
      nextEnemies = nextEnemies.filter(e => e.alive && e.hp > 0);
      if (defeated.length > 0 && nextEnemies.length === 0 && state.activeAreaId) {
        nextWaveCount += 1;
        nextEnemies = buildWave(state.activeAreaId, state.sortieMonsterId ?? undefined, nextWaveCount, { boss: state.sortieBoss });
        for (const enemy of nextEnemies) nextEnemyPrd[enemy.instanceId] = emptyPrd();
        if (nextEnemies.length > 0) logs.push(newLog('info', `Новая волна: ${nextEnemies.map(e => e.name).join(', ')}`));
      }
    }

    const nextSelected = state.selectedEnemyId && nextEnemies.some(e => e.instanceId === state.selectedEnemyId && e.alive && e.hp > 0)
      ? state.selectedEnemyId
      : null;
    const legacy = syncLegacyEnemyFields(nextEnemies, nextSelected, state.targetPriority);

    set(s => ({
      ...legacy,
      enemies: nextEnemies,
      selectedEnemyId: nextSelected,
      playerHp: nextPlayerHp,
      playerMaxHp: nextPlayerMaxHp,
      playerStats: nextPlayerStats,
      playerPrd: resolution.nextPrd,
      enemyPrd: nextEnemyPrd,
      tacticCooldowns: {
        ...s.tacticCooldowns,
        [tactic]: tactic === 'technique' ? COMBAT_TACTICS.technique.cooldownMs : COMBAT_TACTICS.pierce.cooldownMs,
      },
      killCount: nextKillCount,
      waveCount: nextWaveCount,
      sessionXp: nextSessionXp,
      sessionGp: nextSessionGp,
      sessionLoot: nextSessionLoot,
      sortieEnergyCurrent: nextEnergyCurrent,
      sortieEnergyMax: nextEnergyMax,
      totalDamageDealt: s.totalDamageDealt + (resolution.outcome === 'hit' ? resolution.damage : 0),
      combatLog: prependLogs(logs, s.combatLog),
    }));
  },

  eatFood: (itemId) => {
    const { playerHp, playerMaxHp } = get();
    const item = getItem(itemId);
    if (!item?.healAmount) return;
    const inventory = useInventoryStore.getState();
    if (!inventory.hasItem(itemId, 1)) return;
    inventory.removeItem(itemId, 1);
    set(s => ({
      playerHp: Math.min(playerMaxHp, playerHp + item.healAmount!),
      combatLog: prependLogs([newLog('eat', `${item.name}: +${item.healAmount} ОЗ`)], s.combatLog),
    }));
  },

  restAtCamp: () => {
    if (get().inCombat) {
      useNotificationsStore.getState().notifyInfo('Передышка доступна только вне боя.');
      return;
    }
    const restored = restoreHeroCampResources(get().strategy);
    set(s => ({
      playerHp: restored.hpMax,
      playerMaxHp: restored.hpMax,
      sortieEnergyCurrent: restored.energyCurrent,
      sortieEnergyMax: restored.energyMax,
      energyDrainMs: 0,
      combatLog: prependLogs([newLog('eat', `Передышка в лагере: ОЗ ${restored.hpMax}, энергия ${restored.energyCurrent}/${restored.energyMax}.`)], s.combatLog),
    }));
    useNotificationsStore.getState().notifyInfo('Герой восстановился в лагере.');
  },

  nextMonster: () => {
    const { activeAreaId, activeMonsterId } = get();
    if (!activeAreaId) return;
    const area = AREAS_MAP[activeAreaId];
    if (!area) return;
    const monsterIds = area.monsterIds;
    const currentIdx = monsterIds.indexOf(activeMonsterId ?? '');
    const nextId = monsterIds[(currentIdx + 1) % monsterIds.length];
    if (nextId) get().startCombat(activeAreaId, nextId);
  },

  addLog: (entry) => {
    set(s => ({ combatLog: [{ id: String(++_logId), timestamp: Date.now(), ...entry }, ...s.combatLog].slice(0, COMBAT_LOG_MAX_ENTRIES) }));
  },

  getRiskForecast: (areaId) => {
    const area = AREAS_MAP[areaId];
    if (!area) return null;
    const hero = liveCombatSnapshot(get().strategy);
    return estimateRisk({
      hero: hero.stats,
      enemies: area.monsterIds.map(id => MONSTERS_MAP[id]).filter(Boolean) as Monster[],
      areaId,
      heroLevel: getLiveAttributes().heroLevel,
      requiredLevel: area.combatLevelRequired,
      strategy: get().strategy,
      foodStacks: foodStackCount(),
    });
  },

  reset: () => {
    const energy = getLiveAttributes().energy;
    set({
      ...initialState,
      tacticCooldowns: emptyCooldowns(),
      playerPrd: emptyPrd(),
      enemyPrd: {},
      sessionLoot: {},
      sortieEnergyCurrent: energy.current,
      sortieEnergyMax: energy.max,
      energyDrainMs: 0,
    });
  },
}));
