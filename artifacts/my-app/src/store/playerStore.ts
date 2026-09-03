import { create } from 'zustand';
import type { SkillId, SkillState, Equipment, EquipSlot } from '../data/types';
import { EMPTY_EQUIPMENT, normalizeEquipment } from '../data/types';
import { getItem } from '../data/items';
import { getLevelForXp, getXpForLevel, XP_TABLE, MAX_LEVEL } from '../gameEngine/xpTable';
import { calcCombatLevel } from '../gameEngine/formulas';
import { useBankStore } from './bankStore';

function bankCanTakeAll(itemIds: string[]): boolean {
  const bank = useBankStore.getState();
  let free = bank.maxSlots - bank.items.filter(s => s.quantity > 0).length;
  const seen = new Set<string>();
  for (const id of itemIds) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    if (bank.getItemQty(id) > 0) continue;
    free -= 1;
    if (free < 0) return false;
  }
  return true;
}

const ALL_SKILL_IDS: SkillId[] = [
  'attack', 'strength', 'defence', 'hitpoints',
  'ranged', 'magic', 'prayer', 'slayer',
  'woodcutting', 'fishing', 'firemaking', 'cooking',
  'mining', 'smithing', 'thieving', 'fletching',
  'crafting', 'runecrafting', 'herblore', 'farming',
  'agility', 'summoning', 'astrology', 'township',
];

function createInitialSkills(): Record<SkillId, SkillState> {
  const skills = {} as Record<SkillId, SkillState>;
  for (const id of ALL_SKILL_IDS) {
    const isHp = id === 'hitpoints';
    skills[id] = {
      level: isHp ? 10 : 1,
      xp: isHp ? XP_TABLE[10] : 0,
      unlocked: true,
      mastery: {},
    };
  }
  return skills;
}

const INITIAL_EQUIPMENT: Equipment = { ...EMPTY_EQUIPMENT };

export interface PlayerStore {
  skills: Record<SkillId, SkillState>;
  equipment: Equipment;
  prayerPoints: number;
  maxPrayerPoints: number;
  combatLevel: number;

  addXp: (skillId: SkillId, amount: number) => { leveledUp: boolean; newLevel: number };
  addMasteryXp: (skillId: SkillId, actionId: string, amount: number) => void;
  equipItem: (itemId: string, slot: EquipSlot) => string | null;
  unequipItem: (slot: EquipSlot) => string | null;
  /** Влезут ли эти предметы в сумку (без изменений) — для предпроверок. */
  canBankTake: (itemIds: string[]) => boolean;
  drainPrayerPoints: (amount: number) => void;
  restorePrayerPoints: (amount: number) => void;
  setSkillXp: (skillId: SkillId, xp: number) => void;
  getSkillLevel: (skillId: SkillId) => number;
  getMasteryLevel: (skillId: SkillId, actionId: string) => number;
  loadFromSave: (skills: Record<SkillId, SkillState>, equipment?: Partial<Equipment> | null) => void;
  reset: () => void;
}

function computeMaxPrayerPoints(prayerLevel: number): number {
  return prayerLevel;
}

function computeCombatLevel(skills: Record<SkillId, SkillState>): number {
  return calcCombatLevel(
    skills.attack.level, skills.strength.level, skills.defence.level,
    skills.hitpoints.level, skills.ranged.level, skills.magic.level,
    skills.prayer.level,
  );
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  skills: createInitialSkills(),
  equipment: { ...INITIAL_EQUIPMENT },
  prayerPoints: 1,
  maxPrayerPoints: 1,
  combatLevel: 3,

  addXp: (skillId, amount) => {
    const { skills } = get();
    const skill = skills[skillId];
    const oldLevel = skill.level;
    const newXp = skill.xp + amount;
    const newLevel = Math.min(getLevelForXp(newXp), MAX_LEVEL);
    const leveledUp = newLevel > oldLevel;

    const updatedSkill: SkillState = { ...skill, xp: newXp, level: newLevel };
    const newSkills = { ...skills, [skillId]: updatedSkill };

    const updates: Partial<PlayerStore> = { skills: newSkills };
    if (skillId === 'prayer' && leveledUp) {
      updates.maxPrayerPoints = computeMaxPrayerPoints(newLevel);
    }
    if (['attack', 'strength', 'defence', 'hitpoints', 'ranged', 'magic', 'prayer'].includes(skillId)) {
      updates.combatLevel = computeCombatLevel(newSkills);
    }

    set(updates as PlayerStore);
    return { leveledUp, newLevel };
  },

  addMasteryXp: (skillId, actionId, amount) => {
    const { skills } = get();
    const skill = skills[skillId];
    const currentMasteryXp = skill.mastery[actionId] ?? 0;
    const newMasteryXp = Math.min(currentMasteryXp + amount, getXpForLevel(99));
    set({
      skills: {
        ...skills,
        [skillId]: {
          ...skill,
          mastery: { ...skill.mastery, [actionId]: newMasteryXp },
        },
      },
    });
  },

  equipItem: (itemId, slot) => {
    const { equipment } = get();
    const incoming = getItem(itemId);
    const twoHand = Boolean(incoming?.twoHanded);
    const occupyingTwoHand = Boolean(equipment.weapon && getItem(equipment.weapon)?.twoHanded);

    let next: Equipment = { ...equipment };
    const displaced: string[] = [];
    let previous: string | null = null;

    const displace = (id: string | null) => {
      if (!id || id === itemId) return;
      if (!displaced.includes(id)) displaced.push(id);
    };

    if (twoHand) {
      previous = equipment.weapon;
      displace(equipment.weapon);
      displace(equipment.shield);
      next.weapon = itemId;
      next.shield = null;
    } else if (slot === 'shield' && occupyingTwoHand) {
      previous = equipment.weapon;
      displace(equipment.weapon);
      next.weapon = null;
      next.shield = itemId;
    } else {
      let target = slot;
      if (slot === 'ring' && equipment.ring && !equipment.ring2) target = 'ring2';
      if (slot === 'bracelet' && equipment.bracelet && !equipment.bracelet2) target = 'bracelet2';
      previous = equipment[target];
      displace(equipment[target]);
      next = { ...next, [target]: itemId };
    }

    if (!bankCanTakeAll(displaced)) return previous;

    const bank = useBankStore.getState();
    for (const id of displaced) {
      if (id !== previous) bank.addItem(id, 1);
    }

    set({ equipment: next });
    return previous;
  },

  canBankTake: (itemIds) => bankCanTakeAll(itemIds),

  unequipItem: (slot) => {
    const bankStore = useBankStore.getState();
    const { equipment } = get();
    const previous = equipment[slot];
    if (!previous) return null;

    // Attempt to add item to bank BEFORE removing from equipment
    const added = bankStore.addItem(previous, 1);
    if (!added) {
      // Bank is full — do not unequip; item would be lost
      return null;
    }

    set({ equipment: { ...equipment, [slot]: null } });
    return previous;
  },

  drainPrayerPoints: (amount) => {
    const { prayerPoints } = get();
    set({ prayerPoints: Math.max(0, prayerPoints - amount) });
  },

  restorePrayerPoints: (amount) => {
    const { prayerPoints, maxPrayerPoints } = get();
    set({ prayerPoints: Math.min(maxPrayerPoints, prayerPoints + amount) });
  },

  setSkillXp: (skillId, xp) => {
    const { skills } = get();
    const newLevel = Math.min(getLevelForXp(xp), MAX_LEVEL);
    set({
      skills: {
        ...skills,
        [skillId]: { ...skills[skillId], xp, level: newLevel },
      },
    });
  },

  getSkillLevel: (skillId) => get().skills[skillId]?.level ?? 1,

  getMasteryLevel: (skillId, actionId) => {
    const masteryXp = get().skills[skillId]?.mastery[actionId] ?? 0;
    return getLevelForXp(masteryXp);
  },

  loadFromSave: (savedSkills, equipment) => {
    const initial = createInitialSkills();
    const mergedSkills = { ...initial, ...savedSkills };
    for (const id of ALL_SKILL_IDS) {
      if (!mergedSkills[id]) {
        mergedSkills[id] = initial[id];
      }
    }
    const combatLevel = computeCombatLevel(mergedSkills);
    const maxPrayerPoints = computeMaxPrayerPoints(mergedSkills.prayer?.level ?? 1);
    set({
      skills: mergedSkills,
      equipment: normalizeEquipment(equipment),
      combatLevel,
      maxPrayerPoints,
      prayerPoints: maxPrayerPoints,
    });
  },

  reset: () => {
    const skills = createInitialSkills();
    set({
      skills,
      equipment: { ...INITIAL_EQUIPMENT },
      prayerPoints: 1,
      maxPrayerPoints: 1,
      combatLevel: 3,
    });
  },
}));
