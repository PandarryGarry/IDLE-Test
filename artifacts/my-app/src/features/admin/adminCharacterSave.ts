import {
  ALL_SKILL_IDS,
  EMPTY_EQUIPMENT,
  type SaveData,
  type SkillId,
  type SkillState,
} from '@/data/types';
import { getXpForLevel } from '@/core/xpTable';
import {
  createDefaultAttributes,
  getLiveAttributes,
  migrateSaveAttributes,
  type CharacterAttributeState,
} from '@/domain/attributes/characterAttributes';
import { createEmptyGearSets } from '@/domain/items/gearSets';
import { migrateInventoryItems } from '@/domain/items/legacyMigration';
import { updateCharacter, type Character } from '@/lib/characterApi';
import { applySaveData } from '@/lib/saveManager';
import { useCharacterStore } from '@/store/characterStore';
import { usePlayerStore } from '@/store/playerStore';

export function makeEmptySave(): SaveData {
  const skills = {} as Record<SkillId, SkillState>;
  for (const id of ALL_SKILL_IDS) {
    skills[id] = { level: 1, xp: getXpForLevel(1), unlocked: true, mastery: {} };
  }
  return {
    version: '1.0.0',
    savedAt: Date.now(),
    totalPlayTime: 0,
    gameMode: 'standard',
    player: { skills, equipment: { ...EMPTY_EQUIPMENT } },
    inventory: { items: [], gp: 0, maxSlots: 24 },
    game: { activeSkill: null, activeActionId: null, activeAreaId: null, activeMonsterId: null },
    settings: {},
    attributes: createDefaultAttributes(),
    gearSets: createEmptyGearSets(),
  };
}

export function normalizeSave(
  save: SaveData | null | undefined,
  fallbackSkills?: Record<SkillId, SkillState>,
  fallbackAttributes?: CharacterAttributeState,
): SaveData {
  const base = makeEmptySave();
  const originalSkills = save?.player?.skills ?? {};
  const fallback = fallbackSkills && Object.keys(fallbackSkills).length > 0 ? fallbackSkills : undefined;
  const skills = { ...base.player.skills, ...fallback, ...originalSkills } as Record<SkillId, SkillState>;
  return {
    ...base,
    ...save,
    player: {
      skills,
      equipment: { ...EMPTY_EQUIPMENT, ...(save?.player?.equipment ?? {}) },
    },
    inventory: (() => {
      const src = save as unknown as { inventory?: unknown; bank?: unknown };
      const raw = src?.inventory ?? src?.bank;
      const rec = raw as { items?: unknown; gp?: unknown; maxSlots?: unknown } | undefined;
      return {
        items: Array.isArray(rec?.items) ? migrateInventoryItems(rec.items as never[]) : [],
        gp: typeof rec?.gp === 'number' ? rec.gp : 0,
        maxSlots: typeof rec?.maxSlots === 'number' ? rec.maxSlots : 24,
      };
    })(),
    game: {
      activeSkill: save?.game?.activeSkill ?? null,
      activeActionId: save?.game?.activeActionId ?? null,
      activeAreaId: save?.game?.activeAreaId ?? null,
      activeMonsterId: save?.game?.activeMonsterId ?? null,
    },
    attributes: migrateSaveAttributes(save?.attributes ?? fallbackAttributes ?? undefined),
  };
}

export function addItemsToSave(
  save: SaveData,
  grants: readonly { itemId: string; qty: number }[],
): SaveData {
  const inventory = [...save.inventory.items];
  for (const g of grants) {
    const qty = Math.max(0, Math.floor(g.qty));
    if (!g.itemId || qty <= 0) continue;
    const idx = inventory.findIndex((s) => s.itemId === g.itemId);
    if (idx >= 0) {
      inventory[idx] = { ...inventory[idx], quantity: (inventory[idx].quantity || 0) + qty };
    } else {
      inventory.push({ itemId: g.itemId, quantity: qty, locked: false, tab: 0 });
    }
  }
  return {
    ...save,
    savedAt: Date.now(),
    inventory: { ...save.inventory, items: inventory },
  };
}

function patchCharacterInStore(updated: Character): void {
  useCharacterStore.setState((state) => ({
    characters: state.characters.map((c) => (c.id === updated.id ? updated : c)),
    activeCharacter: state.activeCharacter?.id === updated.id
      ? { ...state.activeCharacter, ...updated }
      : state.activeCharacter,
  }));
}

/**
 * Выдать предметы в сумку персонажа и сразу записать сейв.
 * Если это активный герой — живая сумка тоже обновляется.
 */
export async function grantItemsToCharacter(
  characterId: string,
  grants: readonly { itemId: string; qty: number }[],
): Promise<Character> {
  const store = useCharacterStore.getState();
  const character = store.characters.find((c) => c.id === characterId && !c.isDeleted);
  if (!character) throw new Error('Персонаж не найден');

  const isActive = store.activeCharacter?.id === characterId;
  const liveSkills = usePlayerStore.getState().skills as Record<SkillId, SkillState>;
  const fallbackSkills = character.saveData?.player?.skills ? undefined : (isActive ? liveSkills : undefined);
  const fallbackAttrs = isActive ? getLiveAttributes() : undefined;
  const next = addItemsToSave(normalizeSave(character.saveData, fallbackSkills, fallbackAttrs), grants);
  const updated = await updateCharacter(characterId, { saveData: next });
  patchCharacterInStore(updated);
  if (isActive) {
    applySaveData(normalizeSave(updated.saveData, liveSkills, getLiveAttributes()));
  }
  return updated;
}
