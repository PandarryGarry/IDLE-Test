/**
 * Тировая шкала и таблицы снаряжения (оружие/броня/украшения).
 *
 * Канон: GEAR_TIER_FOUNDATION.md. Всё привязано к реальным папкам картинок и
 * к 12 подхарактеристикам (BranchId). База каждого семейства задана на тире 1;
 * бонусы старших тиров = `tier1 × gearTierScale(tier)` (округление вверх) —
 * так «повышение статов с повышением тира» заложено в данные, а не руками.
 *
 * Правило: каждая подхарактеристика в числах ниже — в её «сырой» единице
 * (HP/урон — flat, рейтинг — rating, проценты — percent). Все значения обязаны
 * лежать в оси своего слота (`EQUIP_SLOT_SUBSTAT_AXES`) — проверяется тестом.
 */
import type { BranchId, PillarId } from '../../domain/attributes/attributes.ts';
import type { EquipSlot, GearWeight, ItemTier } from '../types.ts';

export type { GearWeight };

/** Все 12 тиров лестницы. */
export const ALL_GEAR_TIERS: readonly ItemTier[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** Рост силы статов снаряжения с тиром (t1=1.0; делибератно, калибруем). */
const GEAR_TIER_SCALE_MAP: Record<ItemTier, number> = {
  1: 1.0, 2: 1.2, 3: 1.45, 4: 1.75, 5: 2.1,
  6: 2.5, 7: 3.0, 8: 3.6, 9: 4.3, 10: 5.1, 11: 6.0, 12: 7.0,
};

/** Множитель силы тира. */
export function gearTierScale(tier: ItemTier): number {
  return GEAR_TIER_SCALE_MAP[tier] ?? 1;
}

/** Бонус на тире `tier`: округление тирового от базового (тир 1). */
export function scaleTierBonus(baseTier1: number, tier: ItemTier): number {
  return Math.max(0, Math.round(baseTier1 * gearTierScale(tier)));
}

/** Бонус-карта тира из карты тира 1. */
export function scaleTierMap(
  base: Partial<Record<BranchId, number>>,
  tier: ItemTier,
): Partial<Record<BranchId, number>> {
  const out: Partial<Record<BranchId, number>> = {};
  for (const [id, v] of Object.entries(base) as [BranchId, number][]) {
    out[id] = scaleTierBonus(v, tier);
  }
  return out;
}

/** Игровой слот брони, который даёт файл-картинка папки веса. */
export const ARMOR_WEIGHT_SLOTS: readonly { slot: EquipSlot; file: string }[] = [
  { slot: 'helm', file: 'helmet' },
  { slot: 'platebody', file: 'chest' },
  { slot: 'platelegs', file: 'pants' },
  { slot: 'boots', file: 'boots' },
  { slot: 'gloves', file: 'gloves' },
];

/** RU-имя игрового слота для названия предмета брони. */
export const ARMOR_SLOT_NAME_RU: Record<EquipSlot, string> = {
  helm: 'Шлем', platebody: 'Нагрудник', platelegs: 'Поножи',
  boots: 'Сапоги', gloves: 'Перчатки',
} as Record<EquipSlot, string>;

/** RU-имя веса брони. */
export const GEAR_WEIGHT_NAME_RU: Record<GearWeight, string> = {
  plate: 'Латные', leather: 'Кожаные', cloth: 'Стёганые',
};

/**
 * Бонусы тира 1 для веса брони по слотам (в сырых единицах).
 * Лёгкая (cloth) даёт Темп на обуви и Уворот на перчатках (GEAR §4);
 * тяжёлая (plate) — больше Брони/HP; средняя (leather) — баланс.
 */
export const ARMOR_WEIGHT_TIER1: Record<GearWeight, Partial<Record<EquipSlot, Partial<Record<BranchId, number>>>>> = {
  plate: {
    helm: { armor: 7, health: 10, will: 1 },
    platebody: { armor: 11, health: 16 },
    platelegs: { armor: 8, health: 12 },
    boots: { armor: 4, health: 6 },
    gloves: { armor: 3, health: 5 },
  },
  leather: {
    helm: { armor: 5, health: 9, will: 1 },
    platebody: { armor: 8, health: 13 },
    platelegs: { armor: 6, health: 10 },
    boots: { armor: 3, health: 6 },
    gloves: { armor: 2, health: 5 },
  },
  cloth: {
    helm: { armor: 3, health: 8 },
    platebody: { armor: 5, health: 12 },
    platelegs: { armor: 4, health: 9 },
    boots: { armor: 2, health: 5, tempo: 2 },
    gloves: { armor: 2, health: 4, evasion: 2 },
  },
};

// ── Оружие ────────────────────────────────────────────────────
export interface GearWeaponRole {
  /** Папка-семейство на диске (weapons/<folder>). */
  folder: string;
  /** Слот в игре. */
  slot: 'weapon' | 'shield';
  /** RU-имя семейства (для названия предмета). */
  nameRu: string;
  twoHanded?: boolean;
  /** Бонусы тира 1 (в сырых единицах). Удар — «промежуточный урон» оружия. */
  tier1: Partial<Record<BranchId, number>>;
  /** Короткое русское описание роли. */
  roleRu: string;
}

/**
 * Семьи оружия с папками на диске.
 * Магия (книга/посох/жезл) бьёт теми же осями слота `weapon` (Удар/Темп/Удача/Натиск) —
 * отдельной школы магии нет, предметы введены по картинкам.
 */
export const GEAR_WEAPONS: GearWeaponRole[] = [
  { folder: 'sword_1h', slot: 'weapon', nameRu: 'Меч', tier1: { strike: 6, tempo: 1 }, roleRu: 'Баланс: средний удар, надёжен.' },
  { folder: 'axe_1h', slot: 'weapon', nameRu: 'Топор', tier1: { strike: 7 }, roleRu: 'Чуть тяжелее меча, крепкий удар.' },
  { folder: 'dagger', slot: 'weapon', nameRu: 'Кинжал', tier1: { strike: 4, tempo: 4, luck: 2 }, roleRu: 'Быстрый, много ударов, любит крит.' },
  { folder: 'sword_2h', slot: 'weapon', nameRu: 'Двуручный меч', twoHanded: true, tier1: { strike: 9 }, roleRu: 'Медленный, но очень тяжёлый удар.' },
  { folder: 'axe_2h', slot: 'weapon', nameRu: 'Секира', twoHanded: true, tier1: { strike: 10 }, roleRu: 'Разрушительный разовый урон.' },
  { folder: 'scythe', slot: 'weapon', nameRu: 'Коса', twoHanded: true, tier1: { strike: 9, onslaught: 3 }, roleRu: 'Широкий размах — задевает толпу.' },
  { folder: 'bow', slot: 'weapon', nameRu: 'Лук', tier1: { strike: 6, tempo: 1, luck: 2 }, roleRu: 'Дальний бой, меткий, любит крит.' },
  { folder: 'crossbow', slot: 'weapon', nameRu: 'Арбалет', tier1: { strike: 8, luck: 1 }, roleRu: 'Дальний бой, сильный заряд, медленнее лука.' },
  { folder: 'book', slot: 'weapon', nameRu: 'Книга заклинаний', tier1: { strike: 5, luck: 3 }, roleRu: 'Чары через текст: средний удар, любит удачу.' },
  { folder: 'staff', slot: 'weapon', nameRu: 'Посох', twoHanded: true, tier1: { strike: 8, onslaught: 2 }, roleRu: 'Двуручный фокус: сильный заряд.' },
  { folder: 'wand', slot: 'weapon', nameRu: 'Жезл', tier1: { strike: 5, tempo: 3, luck: 1 }, roleRu: 'Быстрые чары, много ударов.' },
  { folder: 'shield', slot: 'shield', nameRu: 'Щит', tier1: { armor: 6, health: 10 }, roleRu: 'Левая рука: держит удар, даёт HP.' },
];

/**
 * Сколько уникальных вариантов лежит в `weapons/unique/<folder>/vNN`.
 * Статы уника = тир семьи (не сильнее t12 по основным осям) + узкая добавка.
 */
export const GEAR_UNIQUE_VARIANT_COUNT: Record<string, number> = {
  sword_1h: 5,
  axe_1h: 5,
  dagger: 5,
  bow: 5,
  crossbow: 5,
  scythe: 6,
  book: 6,
  shield: 8,
  staff: 8,
  wand: 8,
  sword_2h: 10,
  axe_2h: 10,
};

/** Эпитеты уника по номеру варианта (v01 → [0]). */
export const GEAR_UNIQUE_EPITHET_RU: readonly string[] = [
  'Пепельный', 'Кровавый', 'Морозный', 'Грозовой', 'Теневой',
  'Солнечный', 'Драконий', 'Рунический', 'Звёздный', 'Пустотный',
];

/** Тир уника: варианты семьи равномерно занимают верх лестницы и упираются в 12. */
export function uniqueVariantTier(index0: number, count: number): ItemTier {
  const start = Math.max(1, 13 - count);
  const t = start + index0;
  return Math.min(12, Math.max(1, t)) as ItemTier;
}

/**
 * Узкая добавка уника, не раздувая основной удар/броню семьи.
 * Оружие без Удачи получает +1 удачу; иначе +1 темп; иначе +1 натиск.
 * Щит без Воли получает +1 волю.
 */
export function uniqueSpice(
  slot: 'weapon' | 'shield',
  base: Partial<Record<BranchId, number>>,
): Partial<Record<BranchId, number>> {
  if (slot === 'shield') return base.will ? {} : { will: 1 };
  if (!base.luck) return { luck: 1 };
  if (!base.tempo) return { tempo: 1 };
  return { onslaught: 1 };
}

export interface GearAmmoKind {
  folder: 'arrow' | 'bolt';
  nameRu: string;
  roleRu: string;
  variants: number;
  tier1: Partial<Record<BranchId, number>>;
}

/** Расходники колчана: стрелы v01–v15, болты v01–v08. */
export const GEAR_AMMO: readonly GearAmmoKind[] = [
  { folder: 'arrow', nameRu: 'Стрелы', variants: 15, tier1: { strike: 1, luck: 1 }, roleRu: 'Колчан: лёгкий прирост удара и удачи к луку.' },
  { folder: 'bolt', nameRu: 'Болты', variants: 8, tier1: { strike: 2, luck: 1 }, roleRu: 'Колчан: тяжелее стрел, к арбалету.' },
];

/** Тир расходника: номер варианта, потолок 12 (стрелы v13–v15 остаются тиром 12). */
export function ammoVariantTier(index1: number): ItemTier {
  return Math.min(12, Math.max(1, index1)) as ItemTier;
}

/** Особые имена стрел v13–v15 (тир 12). */
export const GEAR_ARROW_SPECIAL_RU: Record<string, string> = {
  v13: 'Лунные стрелы',
  v14: 'Звёздные стрелы',
  v15: 'Пустотные стрелы',
};

// ── Украшения ──────────────────────────────────────────────────
export interface GearJewel {
  /** Папка-семейство на диске (jewelry/<folder>/v01). */
  folder: string;
  slot: EquipSlot;
  /** RU-имя слота для названия (элемент добавляется по стихии). */
  slotNameRu: string;
  /** Бонусы тира 1 (в сырых единицах). */
  tier1: Partial<Record<BranchId, number>>;
  roleRu: string;
}

/** Базовые украшения: стихия берётся из `GEAR_JEWEL_ELEMENTS` (v01 = огонь = тир 2). */
export const GEAR_JEWELS: GearJewel[] = [
  { folder: 'necklaces', slot: 'amulet', slotNameRu: 'Амулет', tier1: { luck: 3, armor: 2, will: 1 }, roleRu: 'Талисман на удачу и защиту.' },
  { folder: 'belts', slot: 'belt', slotNameRu: 'Пояс', tier1: { tempo: 2, health: 8 }, roleRu: 'Стягивает одежду, чуть ускоряет.' },
  { folder: 'rings_l', slot: 'ring', slotNameRu: 'Кольцо', tier1: { luck: 2, evasion: 1, tempo: 1 }, roleRu: 'Кольцо удачи и уворота.' },
  { folder: 'rings_r', slot: 'ring2', slotNameRu: 'Кольцо', tier1: { luck: 2, evasion: 1, tempo: 1 }, roleRu: 'Зеркальное кольцо второй руки.' },
  { folder: 'bracelets_l', slot: 'bracelet', slotNameRu: 'Браслет', tier1: { tempo: 1, reaction: 2, health: 4 }, roleRu: 'Лёгкий браслет для ловкости рук.' },
  { folder: 'bracelets_r', slot: 'bracelet2', slotNameRu: 'Браслет', tier1: { tempo: 1, reaction: 2, health: 4 }, roleRu: 'Зеркальный браслет второй руки.' },
];

/** Подсказка-наклон по столпу (для описания веса брони). */
export const ARMOR_WEIGHT_PILLAR: Record<GearWeight, PillarId> = {
  plate: 'fortitude',
  leather: 'finesse',
  cloth: 'finesse',
};

// ── Прочность (материал) ────────────────────────────────────
/**
 * Базовая прочность тира 1. Чем выше тир — тем дольше служит
 * (`× gearTierScale`). Бой пока не тратит очки.
 */
export const GEAR_DURABILITY_TIER1 = {
  weapon: 80,
  shield: 110,
  armor: 90,
  jewel: 50,
} as const;

/** Множитель прочности веса брони (латы крепче ткани). */
export const ARMOR_WEIGHT_DURABILITY: Record<GearWeight, number> = {
  plate: 1.2,
  leather: 1.0,
  cloth: 0.85,
};

export type GearDurabilityKind = keyof typeof GEAR_DURABILITY_TIER1;

/** Максимальная прочность предмета на тире. */
export function gearMaxDurability(
  kind: GearDurabilityKind,
  tier: ItemTier,
  weight?: GearWeight,
): number {
  const base = GEAR_DURABILITY_TIER1[kind];
  const w = kind === 'armor' && weight ? ARMOR_WEIGHT_DURABILITY[weight] : 1;
  return Math.max(1, Math.round(base * w * gearTierScale(tier)));
}

// ── Материал / редкость тира ────────────────────────────────
/** Материал оружия по тиру (GEAR_TIER_FOUNDATION §5). */
export const WEAPON_TIER_MATERIAL_RU: Record<ItemTier, string> = {
  1: 'камень',
  2: 'медь',
  3: 'бронза',
  4: 'железо',
  5: 'сталь',
  6: 'воронёная сталь',
  7: 'мифрил',
  8: 'сталь и серебро',
  9: 'орихалк',
  10: 'магмит',
  11: 'астралит',
  12: 'пустотный сплав',
};

/** Материал брони по весу и тиру (кожа / металл / ткань). */
export const ARMOR_TIER_MATERIAL_RU: Record<GearWeight, Record<ItemTier, string>> = {
  leather: {
    1: 'кожа', 2: 'дублёная кожа', 3: 'кольчужная кожа', 4: 'чешуя',
    5: 'креплёная кожа', 6: 'плащёная кожа', 7: 'кожа дракона', 8: 'чешуя дракона',
    9: 'магма-шкура', 10: 'астрал-кожа', 11: 'пустотный хитин', 12: 'драконид-шкура',
  },
  plate: {
    1: 'медь', 2: 'бронза', 3: 'железо', 4: 'серебро',
    5: 'сталь', 6: 'воронёная сталь', 7: 'мифрил', 8: 'орихалк',
    9: 'магмит', 10: 'астралит', 11: 'пустотный сплав', 12: 'драконид',
  },
  cloth: {
    1: 'холст', 2: 'лён', 3: 'шерсть', 4: 'тис',
    5: 'клён', 6: 'железное дерево', 7: 'эльфийское дерево', 8: 'древнее дерево',
    9: 'магмовое дерево', 10: 'астральное дерево', 11: 'древесина Пустоты', 12: 'драконье дерево',
  },
};

export type GearRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

/** Рамка редкости 6 ступеней с 12-тировой лестницы (§5; ascended пока = mythic). */
export function rarityFromTier(tier: ItemTier): GearRarity {
  if (tier <= 1) return 'common';
  if (tier === 2) return 'uncommon';
  if (tier === 3) return 'rare';
  if (tier <= 6) return 'epic';
  if (tier <= 8) return 'legendary';
  return 'mythic';
}

export const GEAR_RARITY_RU: Record<GearRarity, string> = {
  common: 'Обычный',
  uncommon: 'Необычный',
  rare: 'Редкий',
  epic: 'Эпический',
  legendary: 'Легендарный',
  mythic: 'Мифический',
};

/** Римский номер тира 1–12. */
export const TIER_ROMAN: readonly string[] = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export function formatTierLabel(tier: number): string {
  if (tier >= 1 && tier <= 12) return `Тир ${TIER_ROMAN[tier]}`;
  return `Тир ${tier}`;
}

// ── Уникальная экипировка ───────────────────────────────────
/**
 * Уник — не ступень тировой лестницы, а отдельная категория. Правило владельца:
 * уник-оружие/щит — свои папки `weapons/unique/<семья>/vNN`, а у бижутерии
 * уникальные — ПОСЛЕДНИЕ `GEAR_UNIQUE_JEWEL_COUNT` вариантов каждой семьи
 * (колец 10 → 5 уников, ожерелий 15 → 5 уников).
 *
 * Поле `tier` у уника остаётся (по нему считаются статы, прочность и редкость),
 * но игроку не показывается: у уника только звезда-эмблема и золотое
 * свечение ячейки (шаг 6 плана), текстовой плашки «УНИК» больше нет.
 */
export const GEAR_UNIQUE_JEWEL_COUNT = 5;

/** Вариант с номером `index0` из `total` — уник, если он в последних пяти. */
export function isJewelUniqueIndex(index0: number, total: number): boolean {
  return index0 >= total - GEAR_UNIQUE_JEWEL_COUNT;
}

/** Минимальный «предметоподобный» объект, по которому определяем уник. */
export interface GearUniqueProbe {
  id?: string;
  gearUnique?: boolean;
  gearFamily?: string;
  iconPath?: string;
  tier?: number;
}

/** Уник — по явному флагу каталога (+ наследие старых сейвов: id/семья/путь). */
export function isGearUnique(item: GearUniqueProbe | null | undefined): boolean {
  if (!item) return false;
  if (item.gearUnique) return true;
  if (item.id?.startsWith('gear_unique_')) return true;
  if (item.gearFamily?.startsWith('unique_')) return true;
  if (item.iconPath?.includes('/unique/')) return true;
  return false;
}

/** Полная подпись качества: «Тир VII» у тирового, пусто у уника (там звезда). */
export function gearQualityLabel(item: GearUniqueProbe | null | undefined): string {
  if (!item || isGearUnique(item)) return '';
  const tier = item.tier;
  return typeof tier === 'number' && tier >= 1 ? formatTierLabel(tier) : '';
}

/** Компактная подпись для бейджа ячейки: «T7» у тирового, пусто у уника. */
export function gearQualityShort(item: GearUniqueProbe | null | undefined): string {
  if (!item || isGearUnique(item)) return '';
  const tier = item.tier;
  return typeof tier === 'number' && tier >= 1 ? `T${tier}` : '';
}

// ── Украшения: стихии на 12 тиров (GEAR §7-1) ───────────────
export interface GearJewelElement {
  /** Папка-файл `v01`…`v15`. */
  variant: string;
  /** Ключ семьи для фасовки. */
  family: string;
  nameRu: string;
  /** Родительный для названия («Амулет пламени»). */
  genitiveRu: string;
  tier: ItemTier;
  /** Кольца и браслеты — только v01–v10. */
  rings: boolean;
}

export const GEAR_JEWEL_ELEMENTS: readonly GearJewelElement[] = [
  { variant: 'v01', family: 'fire', nameRu: 'Огонь', genitiveRu: 'пламени', tier: 2, rings: true },
  { variant: 'v02', family: 'ice', nameRu: 'Лёд', genitiveRu: 'льда', tier: 3, rings: true },
  { variant: 'v03', family: 'lightning', nameRu: 'Молния', genitiveRu: 'молнии', tier: 4, rings: true },
  { variant: 'v04', family: 'shadow', nameRu: 'Тень', genitiveRu: 'тени', tier: 5, rings: true },
  { variant: 'v05', family: 'light', nameRu: 'Свет', genitiveRu: 'света', tier: 5, rings: true },
  { variant: 'v06', family: 'nature', nameRu: 'Природа', genitiveRu: 'природы', tier: 6, rings: true },
  { variant: 'v07', family: 'demon', nameRu: 'Демон', genitiveRu: 'демона', tier: 7, rings: true },
  { variant: 'v08', family: 'angel', nameRu: 'Ангел', genitiveRu: 'ангела', tier: 8, rings: true },
  { variant: 'v09', family: 'dragon', nameRu: 'Дракон', genitiveRu: 'дракона', tier: 9, rings: true },
  { variant: 'v10', family: 'runes', nameRu: 'Руны', genitiveRu: 'рун', tier: 10, rings: true },
  { variant: 'v11', family: 'moon', nameRu: 'Луна', genitiveRu: 'луны', tier: 11, rings: false },
  { variant: 'v12', family: 'star', nameRu: 'Звезда', genitiveRu: 'звезды', tier: 11, rings: false },
  { variant: 'v13', family: 'blood', nameRu: 'Кровь', genitiveRu: 'крови', tier: 12, rings: false },
  { variant: 'v14', family: 'bones', nameRu: 'Кости', genitiveRu: 'костей', tier: 12, rings: false },
  { variant: 'v15', family: 'void', nameRu: 'Пустота', genitiveRu: 'пустоты', tier: 12, rings: false },
];

/** Подписи игровых слотов (фасовка и фильтры). */
export const EQUIP_SLOT_LABELS_RU: Record<EquipSlot, string> = {
  helm: 'Шлем', platebody: 'Нагрудник', platelegs: 'Поножи', boots: 'Сапоги',
  gloves: 'Перчатки', amulet: 'Амулет', ring: 'Кольцо 1', ring2: 'Кольцо 2',
  bracelet: 'Браслет 1', bracelet2: 'Браслет 2', belt: 'Пояс', weapon: 'Оружие',
  shield: 'Щит', cape: 'Плащ', quiver: 'Колчан', passive: 'Пассивное',
};
