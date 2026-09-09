// ============================================================
// Core game types for Aethelia Idle RPG
// ============================================================
import type { BranchId } from '../domain/attributes/attributes.ts';

/**
 * Единственный навык/профессия текущей игры — «Сбор».
 * Все RuneScape-пережитки (Атака/Сила/Защита/Дальний/Магия/Молитва,
 * Лесорубство, Горное дело, Рыбалка, Кулинария, Кузнечество, Огонь и т.д.)
 * удалены из модели. У персонажа остаются только четыре Столпа
 * (см. domain/attributes) и этот навык.
 */
export type SkillId = 'foraging';

export const ALL_SKILL_IDS: SkillId[] = ['foraging'];
export { ALL_SKILL_IDS as GATHERING_SKILLS, ALL_SKILL_IDS as ACTIVE_SKILLS };

export type ItemTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** Вес брони: три семейства на диске (`armor/plate|leather|cloth`). */
export type GearWeight = 'plate' | 'leather' | 'cloth';

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
  /**
   * Точечные бонусы к РЕАЛЬНЫМ подхарактеристикам (12, см. `attributes`).
   * Новая ось: старый `combatStats` (attack/strength/defence) не используется
   * и не переносится в расчёт персонажа (COMBAT_MODEL_PILLARS.md §6).
   *
   * Число — в «сырой» единице самой подхарактеристики, той же, что даёт
   * столп через `computeSubstats`:
   *   health — очки HP; strike — очки урона;
   *   armor/will/evasion/luck/onslaught/destruction — очки рейтинга (rating);
   *   tempo/reaction/resourcefulness/intuition — проценты (percent).
   * Значения кладутся в `data/balance/` рядом с профилем слота и прибавляются
   * к сырому значению подхарактеристики ДО показа (кап/асимптота — в показе).
   * Отсутствие поля = предмет не влияет на тело (честный ноль).
   */
  substatBonuses?: Partial<Record<BranchId, number>>;
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
  /**
   * Максимальная прочность (материал). Чем выше тир, тем больше.
   * Бой пока не тратит прочность — поле для показа и будущего износа.
   */
  maxDurability?: number;
  /**
   * Семья для фасовки «слот → тир → семья»:
   * папка оружия (`sword_1h`), вес брони (`leather`) или стихия украшения (`fire`).
   */
  gearFamily?: string;
  /** Вес брони (только куски тела cloth/leather/plate). */
  gearWeight?: GearWeight;
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
  drops: MonsterDrop[];
  gpDrop: [number, number];
  isBoss?: boolean;
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

export interface InventorySlot {
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
  inventory: {
    items: InventorySlot[];
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
