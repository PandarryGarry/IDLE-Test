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
import type { EquipSlot, ItemTier } from '../types.ts';

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

export type GearWeight = 'plate' | 'leather' | 'cloth';

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

/** Физические семьи оружия (магия book/staff/wand — отложена). */
export const GEAR_WEAPONS: GearWeaponRole[] = [
  { folder: 'sword_1h', slot: 'weapon', nameRu: 'Меч', tier1: { strike: 6, tempo: 1 }, roleRu: 'Баланс: средний удар, надёжен.' },
  { folder: 'axe_1h', slot: 'weapon', nameRu: 'Топор', tier1: { strike: 7 }, roleRu: 'Чуть тяжелее меча, крепкий удар.' },
  { folder: 'dagger', slot: 'weapon', nameRu: 'Кинжал', tier1: { strike: 4, tempo: 4, luck: 2 }, roleRu: 'Быстрый, много ударов, любит крит.' },
  { folder: 'sword_2h', slot: 'weapon', nameRu: 'Двуручный меч', twoHanded: true, tier1: { strike: 9 }, roleRu: 'Медленный, но очень тяжёлый удар.' },
  { folder: 'axe_2h', slot: 'weapon', nameRu: 'Секира', twoHanded: true, tier1: { strike: 10 }, roleRu: 'Разрушительный разовый урон.' },
  { folder: 'scythe', slot: 'weapon', nameRu: 'Коса', twoHanded: true, tier1: { strike: 9, onslaught: 3 }, roleRu: 'Широкий размах — задевает толпу.' },
  { folder: 'bow', slot: 'weapon', nameRu: 'Лук', tier1: { strike: 6, tempo: 1, luck: 2 }, roleRu: 'Дальний бой, меткий, любит крит.' },
  { folder: 'crossbow', slot: 'weapon', nameRu: 'Арбалет', tier1: { strike: 8, luck: 1 }, roleRu: 'Дальний бой, сильный заряд, медленнее лука.' },
  { folder: 'shield', slot: 'shield', nameRu: 'Щит', tier1: { armor: 6, health: 10 }, roleRu: 'Левая рука: держит удар, даёт HP.' },
];

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

/** Базовые украшения v01 (стихия «огонь/магма») — тир-1 фундамент. */
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
