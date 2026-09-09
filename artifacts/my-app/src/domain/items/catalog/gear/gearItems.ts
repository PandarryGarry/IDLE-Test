import type { CatalogItem } from '../types.ts';
import type { ItemTier, EquipSlot, ItemCategory } from '../../../../data/types.ts';
import {
  ARMOR_WEIGHT_TIER1,
  ARMOR_WEIGHT_SLOTS,
  ARMOR_WEIGHT_PILLAR,
  GEAR_WEAPONS,
  GEAR_JEWELS,
  gearTierScale,
  scaleTierMap,
  type GearWeight,
} from '../../../../data/balance/gear.ts';

/**
 * Снаряжение, привязанное к реальным папкам картинок (`iconPath`), по тирам.
 * Каталог генерируется из тировых таблиц в `data/balance/gear.ts`, поэтому
 * бонусы старших тиров = тир1 × шкала тира, а не вбиты руками.
 * Сейчас заводим тир 1 целиком (оружие + 3 веса брони + украшения) — фундамент
 * для проверки «учитывается/показывается» перед расширением на тиры 2–12.
 */

/** Какие тиры сейчас заводим. Расширяем здесь, когда вводим тиры 2–12. */
export const GEAR_TIERS_NOW: readonly ItemTier[] = [1];

/** Согласование прилагательного веса с числом/родом слота (для RU-названия). */
const ARMOR_ADJ: Record<GearWeight, Partial<Record<EquipSlot, string>>> = {
  plate: { helm: 'Латный', platebody: 'Латный', platelegs: 'Латные', boots: 'Латные', gloves: 'Латные' },
  leather: { helm: 'Кожаный', platebody: 'Кожаный', platelegs: 'Кожаные', boots: 'Кожаные', gloves: 'Кожаные' },
  cloth: { helm: 'Стёганый', platebody: 'Стёганый', platelegs: 'Стёганые', boots: 'Стёганые', gloves: 'Стёганые' },
};

/** Имя игрового слота брони (для названия). */
const ARMOR_SLOT_RU: Record<EquipSlot, string> = {
  helm: 'шлем', platebody: 'нагрудник', platelegs: 'поножи', boots: 'сапоги', gloves: 'перчатки',
} as Record<EquipSlot, string>;

const WEIGHT_ROLE_RU: Record<GearWeight, string> = {
  plate: 'Тяжёлые латы: держат удар, добавляют Броню и Здоровье.',
  leather: 'Средняя кожаная защита: баланс Брони, Здоровья и подвижности.',
  cloth: 'Лёгкая стёганая одежда: меньше брони, но не стесняет движений.',
};

function tierLabel(tier: ItemTier): string {
  const pad = String(tier).padStart(2, '0');
  return `t${pad}`;
}

function sellFor(kind: 'weapon' | 'shield' | 'armor' | 'jewel', tier: ItemTier): number {
  const base = {
    weapon: 120, shield: 90, armor: 40, jewel: 110,
  }[kind];
  return Math.round(base * gearTierScale(tier));
}

/** Броня: три веса × 5 тел-слотов, по выбранным тирам. */
function buildArmor(tiers: readonly ItemTier[]): CatalogItem[] {
  const out: CatalogItem[] = [];
  for (const weight of ['plate', 'leather', 'cloth'] as const) {
    const adj = ARMOR_ADJ[weight];
    for (const { slot, file } of ARMOR_WEIGHT_SLOTS) {
      const base = ARMOR_WEIGHT_TIER1[weight][slot] ?? {};
      const pillarRu =
        ARMOR_WEIGHT_PILLAR[weight] === 'fortitude'
          ? 'устойчивость'
          : 'подвижность';
      for (const tier of tiers) {
        const bonuses = scaleTierMap(base, tier);
        const id = `gear_${weight}_${file}_${tierLabel(tier)}`;
        out.push({
          id,
          name: `${adj[slot] ?? weight} ${ARMOR_SLOT_RU[slot]}`,
          description: `${WEIGHT_ROLE_RU[weight]} ${pillarRu}, тир ${tier}.`,
          category: slot as ItemCategory,
          equipSlot: slot,
          tier,
          canSell: true,
          stackable: false,
          sellValue: sellFor('armor', tier),
          substatBonuses: bonuses,
          iconPath: `armor/${weight}/${tierLabel(tier)}/${file}`,
        });
      }
    }
  }
  return out;
}

/** Оружие (физика) и щит: по выбранным тирам. */
function buildWeapons(tiers: readonly ItemTier[]): CatalogItem[] {
  const out: CatalogItem[] = [];
  for (const w of GEAR_WEAPONS) {
    const slot = w.slot;
    for (const tier of tiers) {
      const bonuses = scaleTierMap(w.tier1, tier);
      out.push({
        id: `gear_${w.folder}_${tierLabel(tier)}`,
        name: w.nameRu,
        description: `${w.roleRu} Тип: ${w.twoHanded ? 'двуручное' : 'одноручное'}, тир ${tier}.`,
        category: slot, // 'weapon' | 'shield'
        equipSlot: slot,
        twoHanded: w.twoHanded,
        tier,
        canSell: true,
        stackable: false,
        sellValue: sellFor(slot === 'shield' ? 'shield' : 'weapon', tier),
        substatBonuses: bonuses,
        iconPath: `weapons/${w.folder}/${tierLabel(tier)}`,
      });
    }
  }
  return out;
}

/** Украшения v01 (элемент «огонь») как тир-1 фундамент. */
function buildJewels(): CatalogItem[] {
  const out: CatalogItem[] = [];
  for (const j of GEAR_JEWELS) {
    const id = `gear_${j.folder}_v01`;
    out.push({
      id,
      name: `${j.slotNameRu} пламени`,
      description: `${j.roleRu} Элемент: огонь (тир-1 фундамент).`,
      category: (j.slot === 'ring2' ? 'ring' : j.slot === 'bracelet2' ? 'bracelet' : j.slot) as ItemCategory,
      equipSlot: j.slot,
      tier: 1,
      canSell: true,
      stackable: false,
      sellValue: sellFor('jewel', 1),
      substatBonuses: j.tier1,
      iconPath: `jewelry/${j.folder}/v01`,
    });
  }
  return out;
}

export const GEAR_ITEMS: CatalogItem[] = [
  ...buildWeapons(GEAR_TIERS_NOW),
  ...buildArmor(GEAR_TIERS_NOW),
  ...buildJewels(),
];

/** Сводка по снаряжению — для админ-каталога. */
export function gearSummary(): { [k: string]: number } {
  const counts: { [k: string]: number } = {};
  for (const it of GEAR_ITEMS) {
    counts[it.category] = (counts[it.category] ?? 0) + 1;
  }
  return counts;
}
