import { create } from 'zustand';
import type { Monster } from '@/data/types';
import { MONSTERS_MAP, AREAS_MAP } from '@/domain/combat/monsters';
import { calcMaxHitMelee, calcAttackRating, calcDefenceRating, calcHitChance, calcAutoEatThreshold, rollDrops, rollGp } from '@/core/formulas';
import { usePlayerStore } from '@/store/playerStore';
import { useCharacterStore } from '@/store/characterStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useAuthStore } from '@/store/authStore';
import { GUEST_NOTICE } from '@/lib/guestMode';
import { getItem } from '@/domain/items';
import {
  computeAttributeSnapshot,
  getLiveAttributes,
  applyHeroXp,
} from '@/domain/attributes/characterAttributes';
import { commitHeroAttributes } from '@/lib/heroPersist';
import { getAdminRates, isSkillEnabledForAdmin } from '@/store/adminConfigStore';

export interface CombatLogEntry {
  id: string;
  timestamp: number;
  type: 'player_attack' | 'enemy_attack' | 'player_death' | 'enemy_death' | 'eat' | 'info';
  message: string;
  damage?: number;
}

export interface CombatStore {
  inCombat: boolean;
  activeAreaId: string | null;
  activeMonsterId: string | null;
  currentMonster: Monster | null;

  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;

  combatLog: CombatLogEntry[];
  killCount: number;
  totalDamageDealt: number;
  totalDamageTaken: number;

  autoEat: boolean;
  autoLoot: boolean;

  playerAttackTimer: number;
  enemyAttackTimer: number;

  startCombat: (areaId: string, monsterId?: string) => void;
  stopCombat: () => void;
  tickCombat: (deltaMs: number) => void;
  setAutoEat: (enabled: boolean) => void;
  setAutoLoot: (enabled: boolean) => void;
  eatFood: (itemId: string) => void;
  nextMonster: () => void;
  addLog: (entry: Omit<CombatLogEntry, 'id' | 'timestamp'>) => void;
  reset: () => void;
}

let _logId = 0;
function newLog(type: CombatLogEntry['type'], message: string, damage?: number): CombatLogEntry {
  return { id: String(++_logId), timestamp: Date.now(), type, message, damage };
}

function currentRaceId(): 'human' | 'elf' | 'dwarf' | 'orc' | 'beastfolk' {
  return (useCharacterStore.getState().activeCharacter?.raceId ?? 'human') as 'human' | 'elf' | 'dwarf' | 'orc' | 'beastfolk';
}

function liveSnapshot() {
  const state = getLiveAttributes();
  return computeAttributeSnapshot({ state, raceId: currentRaceId() });
}

function addHeroXp(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) return;
  commitHeroAttributes(applyHeroXp(getLiveAttributes(), amount));
}

/** Итоговые очки столпа (раса + вложения + профессия-заглушка). */
function finalPillar(id: 'fortitude' | 'might' | 'finesse' | 'instinct'): number {
  return liveSnapshot().finalPillars[id] ?? 0;
}

/** Здоровье героя из Столпа Стойкости. */
function liveMaxHp(): number {
  return Math.max(120, Math.round(liveSnapshot().substats.health));
}

export const useCombatStore = create<CombatStore>((set, get) => ({
  inCombat: false,
  activeAreaId: null,
  activeMonsterId: null,
  currentMonster: null,
  playerHp: 100,
  playerMaxHp: 100,
  enemyHp: 0,
  enemyMaxHp: 0,
  combatLog: [],
  killCount: 0,
  totalDamageDealt: 0,
  totalDamageTaken: 0,
  autoEat: true,
  autoLoot: true,
  playerAttackTimer: 0,
  enemyAttackTimer: 0,

  startCombat: (areaId, monsterId) => {
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

    const targetId = monsterId ?? area.monsterIds[0];
    const monster = MONSTERS_MAP[targetId];
    if (!monster) return;

    const playerMaxHp = liveMaxHp();
    const playerCurrentHp = Math.min(get().playerHp > 0 ? get().playerHp : playerMaxHp, playerMaxHp);

    set({
      inCombat: true,
      activeAreaId: areaId,
      activeMonsterId: targetId,
      currentMonster: monster,
      playerHp: playerCurrentHp,
      playerMaxHp,
      enemyHp: monster.maxHp,
      enemyMaxHp: monster.maxHp,
      playerAttackTimer: 2400,
      enemyAttackTimer: monster.attackInterval,
      combatLog: [newLog('info', `Бой: ${monster.name}`)],
    });
  },

  stopCombat: () => {
    set({ inCombat: false, activeMonsterId: null, currentMonster: null, enemyHp: 0 });
  },

  tickCombat: (deltaMs) => {
    const state = get();
    if (!state.inCombat || !state.currentMonster) return;

    if (!isSkillEnabledForAdmin('combat')) {
      set({ inCombat: false, activeMonsterId: null, currentMonster: null, enemyHp: 0 });
      useNotificationsStore.getState().notifyInfo('Бой отключён в настройках игры.');
      return;
    }

    let { playerHp, enemyHp, playerAttackTimer, enemyAttackTimer, combatLog, killCount, totalDamageDealt, totalDamageTaken } = state;
    const monster = state.currentMonster;
    const playerStore = usePlayerStore.getState();
    const inventory = useInventoryStore.getState();
    const notifs = useNotificationsStore.getState();
    const rates = getAdminRates();
    const logs: CombatLogEntry[] = [];

    // ── Атака героя (столпы, а не навыки) ──────────────────────
    playerAttackTimer -= deltaMs;
    if (playerAttackTimer <= 0) {
      playerAttackTimer += 2400;

      const might = finalPillar('might');
      const eq = playerStore.equipment;
      const weaponItem = eq.weapon ? getItem(eq.weapon) : null;
      const atkBonus = weaponItem?.combatStats?.attackBonus ?? 0;
      const strBonus = weaponItem?.combatStats?.strengthBonus ?? 0;

      const attackRating = calcAttackRating(might, atkBonus);
      const defenceRating = calcDefenceRating(monster.defenceLevel, monster.defenceBonus);
      const hitChance = calcHitChance(attackRating, defenceRating);
      const maxHit = calcMaxHitMelee(might, strBonus);

      if (Math.random() * 100 < hitChance) {
        const dmg = Math.floor(Math.random() * (maxHit + 1));
        enemyHp = Math.max(0, enemyHp - dmg);
        totalDamageDealt += dmg;
        logs.push(newLog('player_attack', `Вы бьёте ${monster.name}: ${dmg}`, dmg));
      } else {
        logs.push(newLog('player_attack', `Мимо ${monster.name}!`, 0));
      }
    }

    // ── Смерть монстра ────────────────────────────────────────
    if (enemyHp <= 0) {
      killCount += 1;
      logs.push(newLog('enemy_death', `${monster.name} повержен! (убийство #${killCount})`));

      // Опыт героя — единственный «боевой» прогресс. Он кормит столпы.
      const heroXp = Math.round(monster.combatLevel * 5 * rates.xpMultiplier);
      if (heroXp > 0) addHeroXp(heroXp);

      if (state.autoLoot) {
        const drops = rollDrops(monster, Math.random, rates.dropRateMultiplier);
        for (const drop of drops) inventory.addItem(drop.itemId, drop.quantity);
        const gp = rollGp(monster.gpDrop, Math.random, rates.goldMultiplier);
        if (gp > 0) inventory.addGp(gp);
      }

      set({ enemyHp: monster.maxHp, enemyMaxHp: monster.maxHp, killCount, totalDamageDealt });
      set(s => ({ combatLog: [...logs, ...s.combatLog].slice(0, 100) }));
      return;
    }

    // ── Атака монстра ─────────────────────────────────────────
    enemyAttackTimer -= deltaMs;
    if (enemyAttackTimer <= 0) {
      enemyAttackTimer += monster.attackInterval;

      const fortitude = finalPillar('fortitude');
      const eq = playerStore.equipment;
      const defBonus = (getItem(eq.helm ?? '')?.combatStats?.defenceBonus ?? 0)
        + (getItem(eq.platebody ?? '')?.combatStats?.defenceBonus ?? 0)
        + (getItem(eq.platelegs ?? '')?.combatStats?.defenceBonus ?? 0)
        + (getItem(eq.shield ?? '')?.combatStats?.defenceBonus ?? 0);

      const defRating = calcDefenceRating(fortitude, defBonus);
      const atkRating = calcAttackRating(monster.attackLevel, monster.attackBonus);
      const hitChance = calcHitChance(atkRating, defRating);

      if (Math.random() * 100 < hitChance) {
        const dmg = Math.floor(Math.random() * (monster.maxHit + 1));
        playerHp = Math.max(0, playerHp - dmg);
        totalDamageTaken += dmg;
        logs.push(newLog('enemy_attack', `${monster.name} бьёт вас: ${dmg}`, dmg));

        if (state.autoEat) {
          const threshold = calcAutoEatThreshold(state.playerMaxHp);
          if (playerHp <= threshold) {
            const inventoryItems = inventory.items;
            const foods = inventoryItems
              .map(s => ({ slot: s, item: getItem(s.itemId) }))
              .filter(({ item }) => item?.healAmount && (item.healAmount > 0))
              .sort((a, b) => (b.item?.healAmount ?? 0) - (a.item?.healAmount ?? 0));

            if (foods.length > 0) {
              const best = foods[0];
              inventory.removeItem(best.slot.itemId, 1);
              playerHp = Math.min(state.playerMaxHp, playerHp + (best.item?.healAmount ?? 0));
              logs.push(newLog('eat', `Авто-еда: ${best.item?.name} (+${best.item?.healAmount} ОЗ)`));
            }
          }
        }
      } else {
        logs.push(newLog('enemy_attack', `${monster.name} промахивается!`, 0));
      }
    }

    // ── Смерть героя ──────────────────────────────────────────
    if (playerHp <= 0) {
      logs.push(newLog('player_death', 'Вы пали! Возврат к точке...'));
      playerHp = Math.floor(state.playerMaxHp * 0.5);
      set({ inCombat: false, playerHp, enemyHp: monster.maxHp, playerAttackTimer, enemyAttackTimer, totalDamageTaken, combatLog: [...logs, ...state.combatLog].slice(0, 100) });
      notifs.notifyCombat('💀 Вы пали!');
      return;
    }

    set(s => ({
      playerHp, enemyHp,
      playerAttackTimer, enemyAttackTimer,
      totalDamageDealt, totalDamageTaken,
      combatLog: [...logs, ...s.combatLog].slice(0, 100),
    }));
  },

  setAutoEat: (enabled) => set({ autoEat: enabled }),
  setAutoLoot: (enabled) => set({ autoLoot: enabled }),

  eatFood: (itemId) => {
    const { playerHp, playerMaxHp } = get();
    const item = getItem(itemId);
    if (!item?.healAmount) return;
    const inventory = useInventoryStore.getState();
    if (!inventory.hasItem(itemId, 1)) return;
    inventory.removeItem(itemId, 1);
    set({ playerHp: Math.min(playerMaxHp, playerHp + item.healAmount) });
  },

  nextMonster: () => {
    const { activeAreaId, activeMonsterId } = get();
    if (!activeAreaId) return;
    const area = AREAS_MAP[activeAreaId];
    if (!area) return;
    const monsterIds = area.monsterIds;
    const currentIdx = monsterIds.indexOf(activeMonsterId ?? '');
    const nextId = monsterIds[(currentIdx + 1) % monsterIds.length];
    const nextMonster = MONSTERS_MAP[nextId];
    if (nextMonster) {
      set({ activeMonsterId: nextId, currentMonster: nextMonster, enemyHp: nextMonster.maxHp, enemyMaxHp: nextMonster.maxHp });
    }
  },

  addLog: (entry) => {
    set(s => ({ combatLog: [{ id: String(++_logId), timestamp: Date.now(), ...entry }, ...s.combatLog].slice(0, 100) }));
  },

  reset: () => set({
    inCombat: false, activeAreaId: null, activeMonsterId: null, currentMonster: null,
    playerHp: 100, playerMaxHp: 100, enemyHp: 0, enemyMaxHp: 0,
    combatLog: [], killCount: 0, totalDamageDealt: 0, totalDamageTaken: 0,
    autoEat: true, autoLoot: true,
    playerAttackTimer: 0, enemyAttackTimer: 0,
  }),
}));
