import type { SkillId } from '../../data/types.ts';
import {
  getLiveAttributes,
  computeAttributeSnapshot,
} from '../attributes/characterAttributes.ts';
import { ratingToPercent } from '../../data/balance/substats.ts';
import { getProfessionStatValue } from '../../store/professionStatsStore.ts';

/**
 * ДАННЫЕ И ЧИСТЫЕ ПРАВИЛА профессии «Сбор».
 *
 * Этот файл НЕ хранит состояние и НЕ трогает инвентарь/страницы.
 * Вся механика цикла — в src/store/foragingStore.ts.
 * UI — только в src/features/professions/ForagingPage.tsx.
 */

// ── Типы ───────────────────────────────────────────────────────
export interface ForagingDropEntry {
  itemId: string;
  /** Вес таблицы (не сумма обязана быть 100, важен относительный шанс). */
  weight: number;
  quantity: [number, number];
}

export interface ForagingEnemy {
  monsterId: string;
  areaId: string;
  weight: number;
  boss?: boolean;
  /** Путь иконки в assets/icons (для карточки опасности). */
  iconPath: string;
}

export interface ForagingZone {
  id: string;
  name: string;
  description: string;
  icon: string;
  levelRequired: number;
  xp: number;
  masteryXp: number;
  interval: number; // ms, база до модификатора Темпа/админ-рейта
  lootTable: ForagingDropEntry[];
  rareTable: ForagingDropEntry[];
  danger: {
    enemyChance: number; // % встречи за цикл
    enemies: ForagingEnemy[];
  };
  /** Представительные предметы для превью карточки. */
  previewItemIds: string[];
}

// ── Потолки (хард-idle) ────────────────────────────────────────
export const RARE_FIND_CAP = 8;
export const DOUBLE_LOOT_CAP = 10;
export const FORAGING_TEMPO_CAP = 40;

// ── Характеристики героя, влияющие на Сбор ─────────────────────
interface StatSnapshot {
  tempo: number;
  resourcefulness: number;
  luck: number;
  intuition: number;
}

export function getForagingAttributeSnapshot(): StatSnapshot {
  const state = getLiveAttributes();
  const snap = computeAttributeSnapshot({ state, raceId: 'human' });
  const raw = snap.substats;
  return {
    tempo: Math.max(0, raw.tempo ?? 0),
    resourcefulness: Math.max(0, Math.min(100, raw.resourcefulness ?? 0)),
    luck: ratingToPercent(Math.max(0, raw.luck ?? 0), 65, 130),
    intuition: Math.max(0, Math.min(75, raw.intuition ?? 0)),
  };
}

// ── Зоны ───────────────────────────────────────────────────────
const MOB_ICON: Record<string, string> = {
  goblin: 'characters/mobs/mob_goblin',
  wolf: 'characters/mobs/mob_wolf',
  spider: 'characters/mobs/mob_spider',
  skeleton: 'characters/mobs/mob_skeleton',
  undead_warrior: 'characters/mobs/mob_skeleton',
  giant_spider: 'characters/mobs/mob_spider',
  green_dragon: 'characters/mobs/mob_orc',
};

// XP на цикл выстроено по хардкорной кривой (RS-таблица, 13M XP до 99 ур.):
// ранние зоны почти не дают опыта, а верхний «Тайник» резко ускоряет финальный
// гринд. Ориентир: 10 ур. ≈ 1.6 ч, 50 ур. ≈ 13 ч, 99 ур. ≈ 73 ч активного сбора.
export const FORAGING_ZONES: ForagingZone[] = [
  {
    id: 'forest_clearing',
    name: 'Лесные заросли',
    description: 'Опушечная тропа с ветками, листьями и первыми грибами. Совсем неопасно.',
    icon: '🌿',
    levelRequired: 1,
    xp: 1,
    masteryXp: 2,
    interval: 5000,
    lootTable: [
      { itemId: 'stone', weight: 22, quantity: [1, 2] },
      { itemId: 'branch_01', weight: 16, quantity: [1, 2] },
      { itemId: 'branch_02', weight: 14, quantity: [1, 2] },
      { itemId: 'leaf_01', weight: 12, quantity: [1, 2] },
      { itemId: 'cone_01', weight: 10, quantity: [1, 2] },
      { itemId: 'mushroom_04_raw', weight: 8, quantity: [1, 1] },
      { itemId: 'mushroom_05_raw', weight: 6, quantity: [1, 1] },
      { itemId: 'quartz_sand', weight: 6, quantity: [1, 2] },
    ],
    rareTable: [],
    danger: {
      enemyChance: 1,
      enemies: [{ monsterId: 'goblin', areaId: 'farmlands', weight: 100, iconPath: MOB_ICON.goblin }],
    },
    previewItemIds: ['branch_01', 'leaf_01', 'cone_01', 'mushroom_04_raw'],
  },
  {
    id: 'dark_grove',
    name: 'Тёмная чаща',
    description: 'Густые заросли: трава, ягоды, лисички. Звери уже чувствуют себя здесь хозяевами.',
    icon: '🌲',
    levelRequired: 12,
    xp: 4,
    masteryXp: 3,
    interval: 6500,
    lootTable: [
      { itemId: 'branch_03', weight: 14, quantity: [1, 3] },
      { itemId: 'cone_02', weight: 12, quantity: [1, 3] },
      { itemId: 'leaf_03', weight: 12, quantity: [1, 3] },
      { itemId: 'mushroom_02_raw', weight: 10, quantity: [1, 1] },
      { itemId: 'mushroom_07_raw', weight: 8, quantity: [1, 1] },
      { itemId: 'wild_berries', weight: 8, quantity: [1, 2] },
      { itemId: 'healing_herbs', weight: 6, quantity: [1, 1] },
      { itemId: 'stick_03', weight: 12, quantity: [1, 2] },
      { itemId: 'stick_04', weight: 12, quantity: [1, 2] },
    ],
    rareTable: [
      { itemId: 'wild_berries', weight: 60, quantity: [1, 1] },
      { itemId: 'healing_herbs', weight: 40, quantity: [1, 1] },
    ],
    danger: {
      enemyChance: 3,
      enemies: [
        { monsterId: 'goblin', areaId: 'farmlands', weight: 55, iconPath: MOB_ICON.goblin },
        { monsterId: 'wolf', areaId: 'forest', weight: 45, iconPath: MOB_ICON.wolf },
      ],
    },
    previewItemIds: ['mushroom_02_raw', 'wild_berries', 'healing_herbs', 'stick_04'],
  },
  {
    id: 'cave',
    name: 'Пещера',
    description: 'Прохладный лабиринт: глина, смола и редкие грибы. Здесь водятся пауки.',
    icon: '🕳️',
    levelRequired: 25,
    xp: 14,
    masteryXp: 5,
    interval: 8000,
    lootTable: [
      { itemId: 'stone', weight: 20, quantity: [1, 3] },
      { itemId: 'quartz_sand', weight: 14, quantity: [1, 3] },
      { itemId: 'clay_lump', weight: 10, quantity: [1, 2] },
      { itemId: 'pine_resin', weight: 8, quantity: [1, 2] },
      { itemId: 'mushroom_09_raw', weight: 12, quantity: [1, 1] },
      { itemId: 'stick_03', weight: 14, quantity: [1, 3] },
      { itemId: 'leaf_03', weight: 8, quantity: [1, 3] },
      { itemId: 'healing_herbs', weight: 6, quantity: [1, 1] },
    ],
    rareTable: [
      { itemId: 'clay_lump', weight: 45, quantity: [1, 1] },
      { itemId: 'pine_resin', weight: 35, quantity: [1, 1] },
      { itemId: 'healing_herbs', weight: 20, quantity: [1, 1] },
    ],
    danger: {
      enemyChance: 5,
      enemies: [
        { monsterId: 'spider', areaId: 'spider_den', weight: 80, iconPath: MOB_ICON.spider },
        { monsterId: 'giant_spider', areaId: 'spider_den', weight: 16, iconPath: MOB_ICON.giant_spider },
        { monsterId: 'giant_spider', areaId: 'spider_den', weight: 4, boss: true, iconPath: MOB_ICON.giant_spider },
      ],
    },
    previewItemIds: ['clay_lump', 'pine_resin', 'mushroom_09_raw', 'stone'],
  },
  {
    id: 'ruins',
    name: 'Руины',
    description: 'Заросшие развалины: травы, корни и дорогие грибы. Мёртвые не любят гостей.',
    icon: '🏛️',
    levelRequired: 40,
    xp: 50,
    masteryXp: 6,
    interval: 9500,
    lootTable: [
      { itemId: 'stone', weight: 16, quantity: [1, 3] },
      { itemId: 'branch_01', weight: 10, quantity: [1, 3] },
      { itemId: 'pine_resin', weight: 10, quantity: [1, 2] },
      { itemId: 'healing_herbs', weight: 10, quantity: [1, 2] },
      { itemId: 'mushroom_01_raw', weight: 8, quantity: [1, 1] },
      { itemId: 'mushroom_06_raw', weight: 8, quantity: [1, 1] },
      { itemId: 'mushroom_09_raw', weight: 8, quantity: [1, 1] },
      { itemId: 'stick_02', weight: 12, quantity: [1, 3] },
      { itemId: 'glow_berry', weight: 4, quantity: [1, 1] },
      { itemId: 'heart_root', weight: 2, quantity: [1, 1] },
    ],
    rareTable: [
      { itemId: 'glow_berry', weight: 40, quantity: [1, 1] },
      { itemId: 'heart_root', weight: 35, quantity: [1, 1] },
      { itemId: 'healing_herbs', weight: 25, quantity: [1, 1] },
    ],
    danger: {
      enemyChance: 8,
      enemies: [
        { monsterId: 'skeleton', areaId: 'undead_graveyard', weight: 65, iconPath: MOB_ICON.skeleton },
        { monsterId: 'undead_warrior', areaId: 'undead_graveyard', weight: 28, iconPath: MOB_ICON.undead_warrior },
        { monsterId: 'undead_warrior', areaId: 'undead_graveyard', weight: 7, boss: true, iconPath: MOB_ICON.undead_warrior },
      ],
    },
    previewItemIds: ['glow_berry', 'heart_root', 'mushroom_01_raw', 'pine_resin'],
  },
  {
    id: 'secret_stash',
    name: 'Тайник',
    description: 'Старый схрон: редчайшие грибы, светящаяся ягода и корень-сердечник. Охрана серьёзная.',
    icon: '🗝️',
    levelRequired: 55,
    xp: 350,
    masteryXp: 7,
    interval: 11000,
    lootTable: [
      { itemId: 'pine_resin', weight: 14, quantity: [1, 3] },
      { itemId: 'clay_lump', weight: 12, quantity: [1, 3] },
      { itemId: 'mushroom_03_raw', weight: 10, quantity: [1, 1] },
      { itemId: 'mushroom_06_raw', weight: 8, quantity: [1, 1] },
      { itemId: 'mushroom_01_raw', weight: 8, quantity: [1, 1] },
      { itemId: 'glow_berry', weight: 8, quantity: [1, 1] },
      { itemId: 'heart_root', weight: 6, quantity: [1, 1] },
      { itemId: 'mushroom_10_raw', weight: 6, quantity: [1, 1] },
      { itemId: 'healing_herbs', weight: 14, quantity: [1, 3] },
    ],
    rareTable: [
      { itemId: 'glow_berry', weight: 35, quantity: [1, 1] },
      { itemId: 'heart_root', weight: 30, quantity: [1, 1] },
      { itemId: 'mushroom_10_raw', weight: 25, quantity: [1, 1] },
      { itemId: 'pine_resin', weight: 10, quantity: [1, 1] },
    ],
    danger: {
      enemyChance: 12,
      enemies: [
        { monsterId: 'undead_warrior', areaId: 'undead_graveyard', weight: 60, iconPath: MOB_ICON.undead_warrior },
        { monsterId: 'fire_elemental', areaId: 'lava_lake', weight: 30, iconPath: MOB_ICON.undead_warrior },
        { monsterId: 'green_dragon', areaId: 'dragons_lair', weight: 10, boss: true, iconPath: MOB_ICON.green_dragon },
      ],
    },
    previewItemIds: ['glow_berry', 'heart_root', 'mushroom_10_raw', 'mushroom_03_raw'],
  },
];

export const FORAGING_ZONES_MAP = Object.fromEntries(
  FORAGING_ZONES.map(zone => [zone.id, zone]),
) as Record<string, ForagingZone>;

// ── Бонусы Сбора ───────────────────────────────────────────────
/**
 * Ско рость цикла: профессионная стата + Темп героя, кап 40%.
 */
export function foragingSpeedMultiplier(level: number): number {
  const profSpeed = getProfessionStatValue('foraging', 'forage_speed', level);
  const { tempo } = getForagingAttributeSnapshot();
  const pct = Math.min(FORAGING_TEMPO_CAP, profSpeed + tempo);
  return 1 + pct / 100;
}

/** Шанс редкой находки: профессионная стата + Находчивость. Кап 8%. */
export function rareFindChance(level: number): number {
  const profRare = getProfessionStatValue('foraging', 'forage_rare_find', level);
  const { resourcefulness } = getForagingAttributeSnapshot();
  return Math.min(RARE_FIND_CAP, profRare + resourcefulness * 0.05);
}

/** Шанс двойной находки: профессионная стата + Удача. Кап 10%. */
export function doubleFindChance(level: number): number {
  const profDouble = getProfessionStatValue('foraging', 'forage_double_loot', level);
  const { luck } = getForagingAttributeSnapshot();
  return Math.min(DOUBLE_LOOT_CAP, profDouble + luck * 0.1);
}

/**
 * Внимательность: снижает «пустой» цикл и слегка повышает качество.
 * Возвращает [qualityBoost, emptyReduction] в диапазоне 0..кап.
 */
export function attentionBonuses(level: number): { qualityBoost: number; emptyReduction: number } {
  const att = getProfessionStatValue('foraging', 'forage_attention', level);
  const { intuition } = getForagingAttributeSnapshot();
  const pct = Math.min(3, att + intuition * 0.03);
  return { qualityBoost: pct, emptyReduction: pct };
}

/** Финальная стата: даёт +N дополнительных результатов в конце цикла. */
export function fullProfessionBonus(level: number): number {
  return getProfessionStatValue('foraging', 'forage_full_profession', level);
}

// ── Чистый бросок ──────────────────────────────────────────────
function rollTable(table: ForagingDropEntry[], rng: () => number): { itemId: string; quantity: number } | null {
  if (!table.length) return null;
  const total = table.reduce((sum, e) => sum + Math.max(0, e.weight), 0);
  if (total <= 0) return null;
  let r = rng() * total;
  for (const entry of table) {
    r -= Math.max(0, entry.weight);
    if (r <= 0) {
      const [min, max] = entry.quantity;
      const qty = Math.floor(rng() * (max - min + 1)) + min;
      return { itemId: entry.itemId, quantity: qty };
    }
  }
  const last = table[table.length - 1];
  return { itemId: last.itemId, quantity: last.quantity[0] };
}

function rollEnemy(zone: ForagingZone, rng: () => number): ForagingEnemy | null {
  const pool = zone.danger.enemies;
  if (!pool.length) return null;
  const total = pool.reduce((sum, e) => sum + Math.max(0, e.weight), 0);
  if (total <= 0) return null;
  let r = rng() * total;
  for (const enemy of pool) {
    r -= Math.max(0, enemy.weight);
    if (r <= 0) return enemy;
  }
  return pool[pool.length - 1];
}

export interface ForagingCycleResult {
  items: { itemId: string; quantity: number }[];
  /** Выпавшее из редкой таблицы зоны (для тостов «находок», шаг 11 аудита). */
  rareFinds: { itemId: string; quantity: number }[];
  xp: number;
  masteryXp: number;
  encounter: { areaId: string; monsterId: string; boss: boolean; iconPath: string } | null;
  empty: boolean;
}

/**
 * Один чистый цикл «Сбора» (без state, без инвентаря).
 * Используется и online, и в оффлайн-симуляции по упрощённым правилам.
 */
export function rollForagingCycle(zoneId: string, level: number, rng: () => number = Math.random): ForagingCycleResult {
  const zone = FORAGING_ZONES_MAP[zoneId];
  if (!zone || level < zone.levelRequired) {
    return { items: [], rareFinds: [], xp: 0, masteryXp: 0, encounter: null, empty: true };
  }

  const items: { itemId: string; quantity: number }[] = [];
  const rareFinds: { itemId: string; quantity: number }[] = [];
  const { qualityBoost, emptyReduction } = attentionBonuses(level);
  const doubleChance = doubleFindChance(level);
  const rareChance = rareFindChance(level);

  // Базовый обычный дроп. «Пустой» цикл почти невозможен: камни/ветки всегда в пуле.
  let rolled = rollTable(zone.lootTable, rng);
  if (!rolled && rng() * 100 >= emptyReduction) {
    rolled = { itemId: zone.lootTable[0]?.itemId ?? 'stone', quantity: 1 };
  }
  if (rolled) {
    const double = rng() * 100 < doubleChance;
    items.push({ itemId: rolled.itemId, quantity: double ? rolled.quantity * 2 : rolled.quantity });
  }

  // Редкая находка (своя таблица зоны).
  if (zone.rareTable.length && rng() * 100 < rareChance + qualityBoost) {
    const rare = rollTable(zone.rareTable, rng);
    if (rare) {
      items.push(rare);
      rareFinds.push(rare);
    }
  }

  // Встреча с мобом.
  const encounter = zone.danger.enemyChance > 0 && rng() * 100 < zone.danger.enemyChance
    ? rollEnemy(zone, rng)
    : null;

  return {
    items,
    rareFinds,
    xp: zone.xp,
    masteryXp: zone.masteryXp,
    encounter: encounter
      ? { areaId: encounter.areaId, monsterId: encounter.monsterId, boss: Boolean(encounter.boss), iconPath: encounter.iconPath }
      : null,
    empty: items.length === 0,
  };
}

/** Оффлайн: только базовый предмет зоны + XP. Мобов нет. */
export function rollOfflineForaging(zoneId: string, level: number, rng: () => number = Math.random): { itemId: string; quantity: number } {
  const zone = FORAGING_ZONES_MAP[zoneId];
  const entry = zone?.lootTable[0] ?? { itemId: 'stone', weight: 1, quantity: [1, 1] as [number, number] };
  const [min, max] = entry.quantity;
  const qty = Math.floor(rng() * (max - min + 1)) + min;
  return { itemId: entry.itemId, quantity: qty };
}

/** Путь к иконке моба через assets/icons. */
export function mobIconUrl(path: string): string {
  return `/assets/icons/${path}.webp`;
}

export const FORAGING_SKILL_ID: SkillId = 'foraging';
