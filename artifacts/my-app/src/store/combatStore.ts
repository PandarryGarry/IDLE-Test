import { create } from 'zustand';
import type { Monster } from '../data/types';
import { MONSTERS_MAP, AREAS_MAP } from '../data/monsters';
import { calcMaxHitMelee, calcAttackRating, calcDefenceRating, calcHitChance, calcAutoEatThreshold, rollDrops, rollGp } from '../gameEngine/formulas';
import { usePlayerStore } from './playerStore';
import { useBankStore } from './bankStore';
import { useNotificationsStore } from './notificationsStore';
import { getItem } from '../data/items';

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
  selectedPrayers: string[];

  playerAttackTimer: number; // ms until next player attack
  enemyAttackTimer: number;  // ms until next enemy attack

  startCombat: (areaId: string, monsterId?: string) => void;
  stopCombat: () => void;
  tickCombat: (deltaMs: number) => void;
  togglePrayer: (prayerId: string) => void;
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
  selectedPrayers: [],
  playerAttackTimer: 0,
  enemyAttackTimer: 0,

  startCombat: (areaId, monsterId) => {
    const area = AREAS_MAP[areaId];
    if (!area) return;

    const targetId = monsterId ?? area.monsterIds[0];
    const monster = MONSTERS_MAP[targetId];
    if (!monster) return;

    const playerSkills = usePlayerStore.getState().skills;
    const playerMaxHp = playerSkills.hitpoints.level * 10;
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
      playerAttackTimer: 2400, // default player attack speed
      enemyAttackTimer: monster.attackInterval,
      combatLog: [newLog('info', `Fighting ${monster.name}...`)],
    });
  },

  stopCombat: () => {
    // Keep the finished log visible so the player can inspect hits, misses,
    // damage and the final result after stopping the encounter.
    set({ inCombat: false, activeMonsterId: null, currentMonster: null, enemyHp: 0 });
  },

  tickCombat: (deltaMs) => {
    const state = get();
    if (!state.inCombat || !state.currentMonster) return;

    let { playerHp, enemyHp, playerAttackTimer, enemyAttackTimer, combatLog, killCount, totalDamageDealt, totalDamageTaken } = state;
    const monster = state.currentMonster;
    const playerStore = usePlayerStore.getState();
    const bankStore = useBankStore.getState();
    const notifs = useNotificationsStore.getState();
    const logs: CombatLogEntry[] = [];

    // ── Player attack ─────────────────────────────────────────
    playerAttackTimer -= deltaMs;
    if (playerAttackTimer <= 0) {
      playerAttackTimer += 2400;

      const atkLevel = playerStore.skills.attack.level;
      const strLevel = playerStore.skills.strength.level;
      const defLevel = monster.defenceLevel;

      const eq = playerStore.equipment;
      const weaponItem = eq.weapon ? getItem(eq.weapon) : null;
      const atkBonus = (weaponItem?.combatStats?.attackBonus ?? 0);
      const strBonus = (weaponItem?.combatStats?.strengthBonus ?? 0);

      const attackRating = calcAttackRating(atkLevel, atkBonus);
      const defenceRating = calcDefenceRating(defLevel, monster.defenceBonus);
      const hitChance = calcHitChance(attackRating, defenceRating);
      const maxHit = calcMaxHitMelee(strLevel, strBonus);

      if (Math.random() * 100 < hitChance) {
        const dmg = Math.floor(Math.random() * (maxHit + 1));
        enemyHp = Math.max(0, enemyHp - dmg);
        totalDamageDealt += dmg;
        logs.push(newLog('player_attack', `You hit ${monster.name} for ${dmg}`, dmg));

        // Give XP (melee: attack/strength/defence each get 4 XP per point of damage)
        const result = playerStore.addXp('attack', dmg * 4);
        playerStore.addXp('strength', dmg * 4);
        playerStore.addXp('hitpoints', dmg * 1.3);
        if (result.leveledUp) notifs.notifyLevelUp('attack', result.newLevel);
      } else {
        logs.push(newLog('player_attack', `You missed ${monster.name}!`, 0));
      }
    }

    // ── Enemy death ───────────────────────────────────────────
    if (enemyHp <= 0) {
      killCount += 1;
      logs.push(newLog('enemy_death', `${monster.name} defeated! (Kill #${killCount})`));

      // Slayer XP
      if (monster.slayerXp) {
        const slayerResult = playerStore.addXp('slayer', monster.slayerXp);
        if (slayerResult.leveledUp) notifs.notifyLevelUp('slayer', slayerResult.newLevel);
      }

      // Auto-loot drops
      if (state.autoLoot) {
        const drops = rollDrops(monster);
        for (const drop of drops) {
          bankStore.addItem(drop.itemId, drop.quantity);
          const item = getItem(drop.itemId);
          if (item) notifs.notifyItem(item.name, drop.quantity, item.icon);
        }
        // Bones
        if (monster.bones) {
          bankStore.addItem(monster.bones, 1);
          playerStore.addXp('prayer', monster.bones === 'dragon_bones' ? 72 : monster.bones === 'big_bones' ? 15 : 4.5);
        }
        // GP
        const gp = rollGp(monster.gpDrop);
        if (gp > 0) bankStore.addGp(gp);
      }

      // Respawn next monster in area
      set({ enemyHp: monster.maxHp, enemyMaxHp: monster.maxHp, killCount, totalDamageDealt });
      set(s => ({ combatLog: [...logs, ...s.combatLog].slice(0, 100) }));
      return;
    }

    // ── Enemy attack ──────────────────────────────────────────
    enemyAttackTimer -= deltaMs;
    if (enemyAttackTimer <= 0) {
      enemyAttackTimer += monster.attackInterval;

      const defLevel = playerStore.skills.defence.level;
      const eq = playerStore.equipment;
      const defBonus = (getItem(eq.helm ?? '')?.combatStats?.defenceBonus ?? 0)
        + (getItem(eq.platebody ?? '')?.combatStats?.defenceBonus ?? 0)
        + (getItem(eq.platelegs ?? '')?.combatStats?.defenceBonus ?? 0)
        + (getItem(eq.shield ?? '')?.combatStats?.defenceBonus ?? 0);

      const defRating = calcDefenceRating(defLevel, defBonus);
      const atkRating = calcAttackRating(monster.attackLevel, monster.attackBonus);
      const hitChance = calcHitChance(atkRating, defRating);

      if (Math.random() * 100 < hitChance) {
        const dmg = Math.floor(Math.random() * (monster.maxHit + 1));
        playerHp = Math.max(0, playerHp - dmg);
        totalDamageTaken += dmg;
        logs.push(newLog('enemy_attack', `${monster.name} hit you for ${dmg}`, dmg));
        playerStore.addXp('defence', dmg * 1.3);

        // Auto-eat check
        if (state.autoEat) {
          const threshold = calcAutoEatThreshold(state.playerMaxHp);
          if (playerHp <= threshold) {
            // Find best food in bank
            const bankItems = bankStore.items;
            const foods = bankItems
              .map(s => ({ slot: s, item: getItem(s.itemId) }))
              .filter(({ item }) => item?.healAmount && (item.healAmount > 0))
              .sort((a, b) => (b.item?.healAmount ?? 0) - (a.item?.healAmount ?? 0));

            if (foods.length > 0) {
              const best = foods[0];
              bankStore.removeItem(best.slot.itemId, 1);
              playerHp = Math.min(state.playerMaxHp, playerHp + (best.item?.healAmount ?? 0));
              logs.push(newLog('eat', `Auto-ate ${best.item?.name} (restored ${best.item?.healAmount} HP)`));
            }
          }
        }
      } else {
        logs.push(newLog('enemy_attack', `${monster.name} missed you!`, 0));
      }
    }

    // ── Player death ──────────────────────────────────────────
    if (playerHp <= 0) {
      logs.push(newLog('player_death', 'You have died! Respawning...'));
      playerHp = Math.floor(state.playerMaxHp * 0.5);
      // Stop combat on death
      set({ inCombat: false, playerHp, enemyHp: monster.maxHp, playerAttackTimer, enemyAttackTimer, totalDamageTaken, combatLog: [...logs, ...state.combatLog].slice(0, 100) });
      notifs.notifyCombat('💀 You have died!');
      return;
    }

    set(s => ({
      playerHp, enemyHp,
      playerAttackTimer, enemyAttackTimer,
      totalDamageDealt, totalDamageTaken,
      combatLog: [...logs, ...s.combatLog].slice(0, 100),
    }));
  },

  togglePrayer: (prayerId) => {
    const { selectedPrayers } = get();
    if (selectedPrayers.includes(prayerId)) {
      set({ selectedPrayers: selectedPrayers.filter(p => p !== prayerId) });
    } else {
      set({ selectedPrayers: [...selectedPrayers, prayerId] });
    }
  },

  setAutoEat: (enabled) => set({ autoEat: enabled }),
  setAutoLoot: (enabled) => set({ autoLoot: enabled }),

  eatFood: (itemId) => {
    const { playerHp, playerMaxHp } = get();
    const item = getItem(itemId);
    if (!item?.healAmount) return;
    const bankStore = useBankStore.getState();
    if (!bankStore.hasItem(itemId, 1)) return;
    bankStore.removeItem(itemId, 1);
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
    autoEat: true, autoLoot: true, selectedPrayers: [],
    playerAttackTimer: 0, enemyAttackTimer: 0,
  }),
}));
