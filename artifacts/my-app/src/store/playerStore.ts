import { create } from 'zustand';
import type { SkillId, SkillState, Equipment, EquipSlot } from '@/data/types';
import { EMPTY_EQUIPMENT, normalizeEquipment } from '@/data/types';
import { getItem } from '@/domain/items';
import { getLevelForXp, getXpForLevel, XP_TABLE, MAX_LEVEL } from '@/core/xpTable';
import { useInventoryStore } from '@/store/inventoryStore';

function inventoryCanTakeAll(itemIds: string[]): boolean {
  const inventory = useInventoryStore.getState();
  let free = inventory.maxSlots - inventory.items.filter(s => s.quantity > 0).length;
  const seen = new Set<string>();
  for (const id of itemIds) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    if (inventory.getItemQty(id) > 0) continue;
    free -= 1;
    if (free < 0) return false;
  }
  return true;
}

const ALL_SKILL_IDS: SkillId[] = ['foraging'];

function createInitialSkills(): Record<SkillId, SkillState> {
  const skills = {} as Record<SkillId, SkillState>;
  for (const id of ALL_SKILL_IDS) {
    skills[id] = {
      level: 1,
      xp: 0,
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

  addXp: (skillId: SkillId, amount: number) => { leveledUp: boolean; newLevel: number };
  addMasteryXp: (skillId: SkillId, actionId: string, amount: number) => void;
  equipItem: (itemId: string, slot: EquipSlot) => string | null;
  unequipItem: (slot: EquipSlot) => string | null;
  /** Влезут ли эти предметы в сумку (без изменений) — для предпроверок. */
  canEquipFit: (itemIds: string[]) => boolean;
  setSkillXp: (skillId: SkillId, xp: number) => void;
  getSkillLevel: (skillId: SkillId) => number;
  getMasteryLevel: (skillId: SkillId, actionId: string) => number;
  loadFromSave: (skills: Record<SkillId, SkillState>, equipment?: Partial<Equipment> | null) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  skills: createInitialSkills(),
  equipment: { ...INITIAL_EQUIPMENT },

  addXp: (skillId, amount) => {
    const { skills } = get();
    const skill = skills[skillId];
    const oldLevel = skill.level;
    const newXp = skill.xp + amount;
    const newLevel = Math.min(getLevelForXp(newXp), MAX_LEVEL);
    const leveledUp = newLevel > oldLevel;

    const updatedSkill: SkillState = { ...skill, xp: newXp, level: newLevel };
    const newSkills = { ...skills, [skillId]: updatedSkill };

    set({ skills: newSkills });
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

    if (!inventoryCanTakeAll(displaced)) return previous;

    const inventory = useInventoryStore.getState();
    for (const id of displaced) {
      if (id !== previous) inventory.addItem(id, 1);
    }

    set({ equipment: next });
    return previous;
  },

  canEquipFit: (itemIds) => inventoryCanTakeAll(itemIds),

  unequipItem: (slot) => {
    const inventory = useInventoryStore.getState();
    const { equipment } = get();
    const previous = equipment[slot];
    if (!previous) return null;

    // Attempt to add item to inventory BEFORE removing from equipment
    const added = inventory.addItem(previous, 1);
    if (!added) {
      // Inventory is full — do not unequip; item would be lost
      return null;
    }

    set({ equipment: { ...equipment, [slot]: null } });
    return previous;
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
    set({
      skills: mergedSkills,
      equipment: normalizeEquipment(equipment),
    });
  },

  reset: () => {
    const skills = createInitialSkills();
    set({
      skills,
      equipment: { ...INITIAL_EQUIPMENT },
    });
  },
}));

export { XP_TABLE };
