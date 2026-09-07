import type { ForagingAction, ForagingDrop } from '../../data/types.ts';
import { FORAGE_WOOD } from '../items/catalog/foraging/wood.ts';
import { FORAGE_FUNGI } from '../items/catalog/foraging/fungi.ts';
import { FORAGE_BITS } from '../items/catalog/foraging/bits.ts';
import { FORAGE_SPECIAL } from '../items/catalog/foraging/special.ts';
import {
  getLiveAttributes,
  computeAttributeSnapshot,
} from '../attributes/characterAttributes.ts';
import { ratingToPercent } from '../../data/balance/substats.ts';

/**
 * Профессия «Сбор».
 *
 * Никаких материалов других профессий: только «сборные» предметы
 * (ветки/палки/шишки/листья, грибы, песок/верёвка/бечёвка, камень)
 * и особые находки — будущее сырьё для готовки/крафта/зельеварения.
 *
 * Дальние участки опаснее: помимо добычи там могут встретиться мобы,
 * вплоть до редких и сильных, иногда — босс.
 */

// ── Потолки наград (хард-idle, проценты держим низкими) ────────
export const RARE_FIND_CAP = 8;      // %
export const DOUBLE_LOOT_CAP = 10;   // %
export const JACKPOT_CAP = 0.5;      // %
export const TEMPO_CAP = 40;         // % max ускорение «Сбора»

export interface ForagingEnemy {
  monsterId: string;
  /** Боевая зона монстра — нужна startCombat. */
  areaId: string;
  weight: number;
  boss?: boolean;
}

export interface ForagingZone extends ForagingAction {
  icon: string;
  /** Шанс встречи моба за одно действие, % (0 — безопасный участок). */
  enemyChance?: number;
  enemyPool?: ForagingEnemy[];
}

export const FORAGING_ACTIONS: ForagingZone[] = [
  {
    id: 'forage_forest',
    name: 'Лесные заросли',
    description: 'Опушечная тропа: ветки, грибы, шишки и редкие находки. Тихий участок без мобов.',
    icon: '🌿',
    levelRequired: 1,
    xp: 18,
    masteryXp: 3,
    interval: 4000,
    drops: buildCommonDrops(),
    dropItemId: 'stone',
  },
  {
    id: 'forage_cave',
    name: 'Пещера',
    description: 'Прохладный лабиринт камней и песка. Тут водятся пауки, попадаются глина и смола.',
    icon: '🕳️',
    levelRequired: 10,
    xp: 26,
    masteryXp: 4,
    interval: 4800,
    drops: buildCommonDrops(),
    dropItemId: 'quartz_sand',
    enemyChance: 5,
    enemyPool: [
      { monsterId: 'spider', areaId: 'spider_den', weight: 70 },
      { monsterId: 'giant_spider', areaId: 'spider_den', weight: 6, boss: true },
    ],
  },
  {
    id: 'forage_ruins',
    name: 'Руины',
    description: 'Заросшие развалины: скрытые травы, корни и старая кладка. Мёртвые не любят гостей.',
    icon: '🏛️',
    levelRequired: 25,
    xp: 36,
    masteryXp: 5,
    interval: 5600,
    drops: buildCommonDrops(),
    dropItemId: 'pine_resin',
    enemyChance: 9,
    enemyPool: [
      { monsterId: 'skeleton', areaId: 'undead_graveyard', weight: 65 },
      { monsterId: 'undead_warrior', areaId: 'undead_graveyard', weight: 22 },
      { monsterId: 'green_dragon', areaId: 'dragons_lair', weight: 1.5, boss: true },
    ],
  },
  {
    id: 'forage_stash',
    name: 'Тайник',
    description: 'Заброшенный запечатанный схрон: смола, светящаяся ягода и корень-сердечник. Охрана — только сильнейшие.',
    icon: '🗝️',
    levelRequired: 40,
    xp: 50,
    masteryXp: 6,
    interval: 6800,
    drops: buildCommonDrops(),
    dropItemId: 'glow_berry',
    enemyChance: 14,
    enemyPool: [
      { monsterId: 'fire_elemental', areaId: 'lava_lake', weight: 30 },
      { monsterId: 'undead_warrior', areaId: 'undead_graveyard', weight: 40 },
      { monsterId: 'green_dragon', areaId: 'dragons_lair', weight: 2.5, boss: true },
    ],
  },
];

export const FORAGING_ACTIONS_MAP = Object.fromEntries(
  FORAGING_ACTIONS.map(action => [action.id, action]),
);

/** Уровень «Сбора», с которого открывается особый предмет. */
const SPECIAL_LEVEL_GATE: Record<string, number> = {
  wild_berries: 1,
  healing_herbs: 1,
  pine_resin: 20,
  clay_lump: 20,
  glow_berry: 40,
  heart_root: 40,
};

/**
 * Лестница редкости грибов по тиру.
 * Легко менять одной константой: t1 доступен сразу, t7 — только опытным.
 */
const FUNGI_TIER_LEVEL_GATE: Record<number, number> = {
  1: 1,
  2: 10,
  3: 20,
  4: 30,
  5: 40,
  6: 50,
  7: 60,
};

/** Минимальный уровень «Сбора» для обычной находки (по id предмета). */
const DROP_LEVEL_GATE: Record<string, number> = {};

for (const item of FORAGE_FUNGI) {
  if (item.id.endsWith('_cooked')) continue;
  DROP_LEVEL_GATE[item.id] = FUNGI_TIER_LEVEL_GATE[item.tier ?? 1] ?? 1;
}

/** Вес в таблицах находок. Тир = редкость: чем выше, тем реже. */
function weightFor(tier: number | undefined): number {
  switch (tier) {
    case 1: return 100;
    case 2: return 30;
    case 3: return 8;
    case 4: return 3;
    case 5: return 1;
    case 6: return 0.4;
    default: return 0.2;
  }
}

function toDrop(itemId: string, tier: number | undefined, maxQty = 1): ForagingDrop {
  return { itemId, weight: weightFor(tier), quantity: [1, maxQty] };
}

function buildCommonDrops(): ForagingDrop[] {
  const drops: ForagingDrop[] = [];
  for (const item of FORAGE_WOOD) drops.push(toDrop(item.id, item.tier, item.tier === 1 ? 2 : 1));
  for (const item of FORAGE_BITS) drops.push(toDrop(item.id, item.tier, 1));
  for (const item of FORAGE_FUNGI) {
    if (!item.id.endsWith('_cooked')) drops.push(toDrop(item.id, item.tier, 1));
  }
  drops.push(toDrop('stone', 1, 2));
  return drops;
}

/** Особые находки, доступные текущему уровню. */
export function buildForagingDropTable(level: number): ForagingDrop[] {
  return FORAGE_SPECIAL
    .filter(item => (SPECIAL_LEVEL_GATE[item.id] ?? 1) <= level)
    .map(item => toDrop(item.id, item.tier, 1));
}

// ── Характеристики ─────────────────────────────────────────────
interface ForagingBonuses {
  resourcefulness: number; // 0..100 (Находчивость, %)
  luck: number;            // 0..65 (Удача, %)
  tempo: number;           // 0..140 (Темп, %)
}

function getForagingBonuses(): ForagingBonuses {
  const state = getLiveAttributes();
  // Расовый старт столпов подключим при едином фиде «герой → бонусы»;
  // пока снапшот считается по базовой расе, чтобы не тянуть store-циклы.
  const snapshot = computeAttributeSnapshot({ state, raceId: 'human' });
  const raw = snapshot.substats;
  return {
    resourcefulness: Math.max(0, Math.min(100, raw.resourcefulness ?? 0)),
    luck: ratingToPercent(Math.max(0, raw.luck ?? 0), 65, 130),
    tempo: Math.max(0, raw.tempo ?? 0),
  };
}

/** Шанс особой находки (не сырьё других профессий). Кап 8%. */
export function rareFindChance(level: number): number {
  const { resourcefulness } = getForagingBonuses();
  return Math.min(RARE_FIND_CAP, 0.5 + level * 0.05 + resourcefulness * 0.05);
}

/** Шанс двойной обычной добычи. Кап 10%. */
export function doubleFindChance(): number {
  const { luck } = getForagingBonuses();
  return Math.min(DOUBLE_LOOT_CAP, 2 + luck * 0.1);
}

/** Шанс сразу двух особых находок за один заход. Кап 0.5%. */
export function jackpotChance(level: number): number {
  const { luck } = getForagingBonuses();
  return Math.min(JACKPOT_CAP, 0.05 + level * 0.005 + luck * 0.005);
}

/** Скорость «Сбора» от Темпа. Потолок +40%. */
export function foragingSpeedMultiplier(): number {
  const { tempo } = getForagingBonuses();
  return 1 + Math.min(TEMPO_CAP, tempo) / 100;
}

/** Бонус продажи находок «Сбора» на уровне 50+. */
export function forageSellBonusMultiplier(level: number): number {
  return level >= 50 ? 1.02 : 1;
}

/** Выбрать предмет из таблицы с весами. */
export function rollDrop(drops: ForagingDrop[], rng: () => number = Math.random): { itemId: string; quantity: number } | null {
  if (drops.length === 0) return null;
  const total = drops.reduce((sum, d) => sum + Math.max(0, d.weight), 0);
  if (total <= 0) return null;
  let r = rng() * total;
  for (const drop of drops) {
    r -= Math.max(0, drop.weight);
    if (r <= 0) {
      const [min, max] = drop.quantity;
      const qty = Math.floor(rng() * (max - min + 1)) + min;
      return { itemId: drop.itemId, quantity: qty };
    }
  }
  const last = drops[drops.length - 1];
  return { itemId: last.itemId, quantity: last.quantity[0] };
}

function rollEnemy(pool: ForagingEnemy[], rng: () => number): ForagingEnemy | null {
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

export interface ForagingResult {
  items: { itemId: string; quantity: number }[];
  xp: number;
  masteryXp: number;
  encounter?: { areaId: string; monsterId: string; boss: boolean };
}

/**
 * Один цикл «Сбора» на выбранном участке: обычная добыча + особая находка
 * + возможная встреча с мобом (обычным, сильным или боссом).
 */
export function processForagingAction(
  actionId: string,
  skillLevel: number,
  rng: () => number = Math.random,
): ForagingResult | null {
  const action = FORAGING_ACTIONS_MAP[actionId] as ForagingZone | undefined;
  if (!action) return null;
  if (skillLevel < action.levelRequired) return null;

  const items: { itemId: string; quantity: number }[] = [];

  // Обычная добыча: грибы открываются по тирам редкости.
  const commonDrops = action.drops.filter(d => (DROP_LEVEL_GATE[d.itemId] ?? 1) <= skillLevel);
  const normal = rollDrop(commonDrops, rng);
  if (normal) {
    const double = rng() * 100 < doubleFindChance();
    items.push({ itemId: normal.itemId, quantity: double ? normal.quantity * 2 : normal.quantity });
  }

  // Особые находки — только свои предметы «Сбора».
  if (rng() * 100 < rareFindChance(skillLevel)) {
    const specials = buildForagingDropTable(skillLevel);
    const rare = rollDrop(specials, rng);
    if (rare) items.push(rare);

    const jackpot = rng() * 100 < jackpotChance(skillLevel);
    if (jackpot) {
      const extra = rollDrop(specials, rng);
      if (extra) items.push(extra);
    }
  }

  const encounterChance = action.enemyChance ?? 0;
  const enemy = encounterChance > 0 && rng() * 100 < encounterChance
    ? rollEnemy(action.enemyPool ?? [], rng)
    : null;

  return {
    items,
    xp: action.xp,
    masteryXp: action.masteryXp ?? 3,
    encounter: enemy ? { areaId: enemy.areaId, monsterId: enemy.monsterId, boss: Boolean(enemy.boss) } : undefined,
  };
}
