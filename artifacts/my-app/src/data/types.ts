// ============================================================
// Core game types for Aethelia Idle RPG
// ============================================================

export type SkillId =
  | 'attack' | 'strength' | 'defence' | 'hitpoints'
  | 'ranged' | 'magic' | 'prayer' | 'slayer'
  | 'woodcutting' | 'fishing' | 'firemaking' | 'cooking'
  | 'mining' | 'smithing' | 'thieving' | 'fletching'
  | 'crafting' | 'runecrafting' | 'herblore' | 'farming'
  | 'agility' | 'summoning' | 'astrology' | 'township';

export const COMBAT_SKILLS: SkillId[] = ['attack', 'strength', 'defence', 'hitpoints', 'ranged', 'magic', 'prayer', 'slayer'];
export const GATHERING_SKILLS: SkillId[] = ['woodcutting', 'fishing', 'mining'];
export const CRAFTING_SKILLS: SkillId[] = ['firemaking', 'cooking', 'smithing', 'fletching', 'crafting', 'runecrafting', 'herblore'];
export const OTHER_SKILLS: SkillId[] = ['farming', 'agility', 'summoning', 'astrology', 'township', 'thieving'];
export const ALL_SKILL_IDS: SkillId[] = [...COMBAT_SKILLS, ...GATHERING_SKILLS, ...CRAFTING_SKILLS, ...OTHER_SKILLS];

export type ItemTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type ItemCategory =
  | 'weapon' | 'helm' | 'platebody' | 'platelegs' | 'boots' | 'gloves'
  | 'amulet' | 'ring' | 'bracelet' | 'belt' | 'shield' | 'cape'
  | 'food' | 'herb' | 'seed' | 'bar' | 'ore' | 'log' | 'rune'
  | 'potion' | 'raw_fish' | 'cooked_fish' | 'gem' | 'misc' | 'bone' | 'ash' | 'arrow' | 'tablet'
  | 'mineral' | 'foraging';

export type EquipSlot =
  | 'helm' | 'platebody' | 'platelegs' | 'boots' | 'gloves'
  | 'amulet' | 'ring' | 'ring2' | 'bracelet' | 'bracelet2' | 'belt'
  | 'weapon' | 'shield' | 'cape' | 'quiver' | 'passive';

export interface CombatStats {
  attackBonus?: number;
  strengthBonus?: number;
  defenceBonus?: number;
  rangedAttackBonus?: number;
  rangedStrengthBonus?: number;
  magicAttackBonus?: number;
  magicDamageBonus?: number;
  prayerBonus?: number;
}

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  description?: string;
  sellValue: number; // GP
  buyValue?: number;
  canSell: boolean;
  stackable: boolean;
  healAmount?: number; // HP restored when eaten
  equipSlot?: EquipSlot;
  combatStats?: CombatStats;
  icon?: string; // emoji fallback
  /** Двуручное: правая рука нормально, левая — то же оружие тусклое. */
  twoHanded?: boolean;
  /**
   * Тир — качество/«уровень» предмета, 1..12 (данное поле, не вычисление).
   * У легаси-предметов отсутствует (тир определяется по id) — по мере переноса
   * семейств в каталог тир становится обязательным (`CatalogItem`).
   */
  tier?: ItemTier;
  /**
   * Иконка предмета в `public/assets/icons` — путь БЕЗ расширения и без
   * `assets/icons` (например `weapons/sword_1h/t02`). В `<img>` отдаётся
   * только через `iconUrl()`, никогда сырым `.png`.
   */
  iconPath?: string;
}

export interface SkillState {
  level: number;
  xp: number;
  unlocked: boolean;
  mastery: Record<string, number>; // actionId -> mastery xp (0-99)
}

export interface SkillAction {
  id: string;
  name: string;
  description?: string;
  levelRequired: number;
  xp: number;
  masteryXp?: number;
  interval: number; // ms per action
}

export interface WoodcuttingTree extends SkillAction {
  logId: string;
  quantity: [number, number]; // [min, max] logs per chop
}

export interface MiningRock extends SkillAction {
  oreId: string;
  gemChance?: number; // 0-1 chance of gem
}

export interface FishingSpot extends SkillAction {
  fishId: string;
  junkItems?: string[];
}

/** Одна находка в «Сборе»: предмет + вес + количество. */
export interface ForagingDrop {
  itemId: string;
  weight: number; // относительный вес в таблице находок
  quantity: [number, number]; // [min, max] за одно действие
}

/** Действие «Сбора»: персонаж прочёсывает участок и находит случайный лут. */
export interface ForagingAction extends SkillAction {
  drops: ForagingDrop[];
  /** Представительный предмет для карточки действия и оффлайн-добычи. */
  dropItemId: string;
}

export interface CookingRecipe extends SkillAction {
  rawItemId: string;
  cookedItemId: string;
  burntItemId?: string;
  burnChanceBase?: number; // 0-1
}

export interface SmithingRecipe extends SkillAction {
  outputItemId: string;
  outputQuantity?: number;
  ingredients: { itemId: string; quantity: number }[];
  category?: 'bars' | 'equipment';
}

export interface FiremakingLog extends SkillAction {
  logId: string;
  ashId?: string;
}

export interface ThievingTarget extends SkillAction {
  maxGp: number;
  successChanceBase: number; // 0-1
  items?: { itemId: string; chance: number; quantity: [number, number] }[];
}

export interface MonsterDrop {
  itemId: string;
  chance: number; // 0-1
  quantity: [number, number];
}

export interface Monster {
  id: string;
  name: string;
  areaId: string;
  maxHp: number;
  attackLevel: number;
  strengthLevel: number;
  defenceLevel: number;
  attackBonus: number;
  strengthBonus: number;
  defenceBonus: number;
  maxHit: number;
  attackInterval: number; // ms
  combatStyle: 'melee' | 'ranged' | 'magic';
  drops: MonsterDrop[];
  gpDrop: [number, number];
  bones?: string;
  isBoss?: boolean;
  slayerXp?: number;
  combatLevel: number;
}

export interface CombatArea {
  id: string;
  name: string;
  monsterIds: string[];
  combatLevelRequired?: number;
  isDungeon?: boolean;
  description?: string;
}

export interface Prayer {
  id: string;
  name: string;
  description: string;
  levelRequired: number;
  prayerPointsPerTick: number; // drain rate
  effects: {
    type: 'attackBonus' | 'strengthBonus' | 'defenceBonus' | 'rangedBonus' | 'magicBonus'
      | 'xpBonus' | 'protectMelee' | 'protectRanged' | 'protectMagic';
    value: number; // multiplier (e.g. 0.05 for +5%) or 1 for protection
  }[];
}

export interface Spell {
  id: string;
  name: string;
  levelRequired: number;
  runes: { runeId: string; qty: number }[];
  baseMaxHit: number;
  xpPerCast: number;
  element?: 'fire' | 'water' | 'earth' | 'air' | 'none';
}

export interface Equipment {
  helm: string | null;
  platebody: string | null;
  platelegs: string | null;
  boots: string | null;
  gloves: string | null;
  amulet: string | null;
  ring: string | null;
  ring2: string | null;
  bracelet: string | null;
  bracelet2: string | null;
  belt: string | null;
  weapon: string | null;
  shield: string | null;
  cape: string | null;
  quiver: string | null;
  passive: string | null;
}

export const EMPTY_EQUIPMENT: Equipment = {
  helm: null, platebody: null, platelegs: null, boots: null, gloves: null,
  amulet: null, ring: null, ring2: null, bracelet: null, bracelet2: null, belt: null,
  weapon: null, shield: null, cape: null, quiver: null, passive: null,
};

// ── Наборы снаряжения (пресеты) ──────────────────────────────
/** Сколько пресетов у героя. Больше — только отдельным решением. */
export const GEAR_SETS_MAX = 3;

export interface GearSetPreset {
  name: string;
  equipment: Equipment;
}

export interface GearSetsState {
  version: 1;
  /** Длина всегда GEAR_SETS_MAX; null — пустой пресет. */
  presets: (GearSetPreset | null)[];
}

export function normalizeEquipment(raw?: Partial<Equipment> | null): Equipment {
  return { ...EMPTY_EQUIPMENT, ...raw };
}

export interface BankSlot {
  itemId: string;
  quantity: number;
  locked: boolean;
  tab: number;
}

export type NotificationType = 'levelup' | 'mastery_levelup' | 'item' | 'combat' | 'info' | 'warning' | 'achievement';

export interface GameNotification {
  id: string;
  type: NotificationType;
  message: string;
  icon?: string;
  timestamp: number;
  skillId?: SkillId;
  level?: number;
}

export type GameMode = 'standard' | 'hardcore' | 'adventure';

export interface SaveData {
  version: string;
  savedAt: number;
  totalPlayTime: number;
  gameMode: GameMode;
  player: {
    skills: Record<SkillId, SkillState>;
    equipment: Equipment;
  };
  bank: {
    items: BankSlot[];
    gp: number;
    maxSlots: number;
  };
  game: {
    activeSkill: SkillId | null;
    activeActionId: string | null;
    activeAreaId: string | null;
    activeMonsterId: string | null;
  };
  settings: Record<string, unknown>;
  /** Четыре Столпа. Старые сейвы без поля мигрируют в коде, не новой таблицей. */
  attributes?: import('@/domain/attributes/attributes').CharacterAttributeState;
  /** Наборы снаряжения (до 3 пресетов). Старые сейвы без поля — пустые наборы. */
  gearSets?: GearSetsState;
}
