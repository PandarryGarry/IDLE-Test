import type { CatalogItem } from '../types.ts';
import type { ItemTier, EquipSlot, ItemCategory, GearWeight } from '../../../../data/types.ts';
import {
  ALL_GEAR_TIERS,
  ARMOR_TIER_MATERIAL_RU,
  ARMOR_WEIGHT_TIER1,
  ARMOR_WEIGHT_SLOTS,
  ARMOR_WEIGHT_PILLAR,
  GEAR_WEAPONS,
  GEAR_JEWELS,
  GEAR_JEWEL_ELEMENTS,
  GEAR_UNIQUE_VARIANT_COUNT,
  GEAR_UNIQUE_EPITHET_RU,
  GEAR_AMMO,
  GEAR_ARROW_SPECIAL_RU,
  WEAPON_TIER_MATERIAL_RU,
  gearTierScale,
  gearMaxDurability,
  scaleTierMap,
  isJewelUniqueIndex,
  uniqueVariantTier,
  uniqueSpice,
  ammoVariantTier,
} from '../../../../data/balance/gear.ts';

/**
 * Снаряжение, привязанное к реальным папкам картинок (`iconPath`), по тирам.
 * Каталог генерируется из тировых таблиц в `data/balance/gear.ts`:
 * бонусы и прочность старших тиров = тир1 × шкала тира.
 */

/** Какие тиры сейчас заводим (лестница 1–12). */
export const GEAR_TIERS_NOW: readonly ItemTier[] = ALL_GEAR_TIERS;

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

const WEIGHT_FAMILY_RU: Record<GearWeight, string> = {
  plate: 'Латы',
  leather: 'Кожа',
  cloth: 'Стёганка',
};

function tierLabel(tier: ItemTier): string {
  const pad = String(tier).padStart(2, '0');
  return `t${pad}`;
}

function sellFor(kind: 'weapon' | 'shield' | 'armor' | 'jewel' | 'ammo', tier: ItemTier): number {
  const base = {
    weapon: 120, shield: 90, armor: 40, jewel: 110, ammo: 8,
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
        const material = ARMOR_TIER_MATERIAL_RU[weight][tier];
        const id = `gear_${weight}_${file}_${tierLabel(tier)}`;
        out.push({
          id,
          name: `${adj[slot] ?? weight} ${ARMOR_SLOT_RU[slot]} · ${material}`,
          description: `${WEIGHT_ROLE_RU[weight]} ${pillarRu}, тир ${tier}, материал: ${material}.`,
          category: slot as ItemCategory,
          equipSlot: slot,
          tier,
          canSell: true,
          stackable: false,
          sellValue: sellFor('armor', tier),
          substatBonuses: bonuses,
          iconPath: `armor/${weight}/${tierLabel(tier)}/${file}`,
          maxDurability: gearMaxDurability('armor', tier, weight),
          gearFamily: weight,
          gearWeight: weight,
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
      const material = WEAPON_TIER_MATERIAL_RU[tier];
      const kind = slot === 'shield' ? 'shield' : 'weapon';
      out.push({
        id: `gear_${w.folder}_${tierLabel(tier)}`,
        name: `${w.nameRu} · ${material}`,
        description: `${w.roleRu} Тип: ${w.twoHanded ? 'двуручное' : 'одноручное'}, тир ${tier}, материал: ${material}.`,
        category: slot, // 'weapon' | 'shield'
        equipSlot: slot,
        twoHanded: w.twoHanded,
        tier,
        canSell: true,
        stackable: false,
        sellValue: sellFor(kind, tier),
        substatBonuses: bonuses,
        iconPath: `weapons/${w.folder}/${tierLabel(tier)}`,
        maxDurability: gearMaxDurability(kind, tier),
        gearFamily: w.folder,
      });
    }
  }
  return out;
}

/**
 * Украшения: стихии v01–v15 (кольца/браслеты — v01–v10) на тиры по канону §7-1.
 * Последние `GEAR_UNIQUE_JEWEL_COUNT` вариантов каждой семьи — УНИКАЛЬНЫЕ:
 * в фасовке они идут категорией «Уникальное», тирового бейджа у них нет.
 */
function buildJewels(): CatalogItem[] {
  const out: CatalogItem[] = [];
  for (const j of GEAR_JEWELS) {
    const isRingPair = j.folder === 'rings_l' || j.folder === 'rings_r'
      || j.folder === 'bracelets_l' || j.folder === 'bracelets_r';
    const elements = GEAR_JEWEL_ELEMENTS.filter((el) => !isRingPair || el.rings);
    elements.forEach((el, index) => {
      const unique = isJewelUniqueIndex(index, elements.length);
      const bonuses = scaleTierMap(j.tier1, el.tier);
      out.push({
        id: `gear_${j.folder}_${el.variant}`,
        name: `${j.slotNameRu} ${el.genitiveRu}`,
        description: unique
          ? `Уникальное украшение: ${el.nameRu.toLowerCase()}. ${j.roleRu}`
          : `${j.roleRu} Стихия: ${el.nameRu}, тир ${el.tier}.`,
        category: (j.slot === 'ring2' ? 'ring' : j.slot === 'bracelet2' ? 'bracelet' : j.slot) as ItemCategory,
        equipSlot: j.slot,
        tier: el.tier,
        canSell: true,
        stackable: false,
        sellValue: sellFor('jewel', el.tier),
        substatBonuses: bonuses,
        iconPath: `jewelry/${j.folder}/${el.variant}`,
        maxDurability: gearMaxDurability('jewel', el.tier),
        gearFamily: el.family,
        gearUnique: unique,
      });
    });
  }
  return out;
}

/** Уники: `weapons/unique/<folder>/vNN`. Основной удар не сильнее t12 семьи. */
function buildUniques(): CatalogItem[] {
  const byFolder = new Map(GEAR_WEAPONS.map((w) => [w.folder, w]));
  const out: CatalogItem[] = [];
  for (const [folder, count] of Object.entries(GEAR_UNIQUE_VARIANT_COUNT)) {
    const w = byFolder.get(folder);
    if (!w) continue;
    const kind = w.slot === 'shield' ? 'shield' : 'weapon';
    for (let i = 0; i < count; i++) {
      const variant = `v${String(i + 1).padStart(2, '0')}`;
      const tier = uniqueVariantTier(i, count);
      const base = scaleTierMap(w.tier1, tier);
      const spice = uniqueSpice(w.slot, base);
      const bonuses = { ...base };
      for (const [k, v] of Object.entries(spice) as [keyof typeof spice, number][]) {
        bonuses[k] = (bonuses[k] ?? 0) + v;
      }
      const epithet = GEAR_UNIQUE_EPITHET_RU[i] ?? variant;
      const material = WEAPON_TIER_MATERIAL_RU[tier];
      out.push({
        id: `gear_unique_${folder}_${variant}`,
        name: `${epithet} ${w.nameRu}`,
        description: `Уникальный ${w.nameRu.toLowerCase()}. ${w.roleRu} Материал: ${material}. Основной удар не выше обычного тира 12 этой семьи.`,
        category: w.slot,
        equipSlot: w.slot,
        twoHanded: w.twoHanded,
        tier,
        canSell: true,
        stackable: false,
        sellValue: Math.round(sellFor(kind, tier) * 2.4),
        substatBonuses: bonuses,
        iconPath: `weapons/unique/${folder}/${variant}`,
        maxDurability: gearMaxDurability(kind, tier),
        gearFamily: `unique_${folder}`,
        gearUnique: true,
      });
    }
  }
  return out;
}

/** Стрелы и болты в слот колчана. */
function buildAmmo(): CatalogItem[] {
  const out: CatalogItem[] = [];
  for (const a of GEAR_AMMO) {
    for (let i = 1; i <= a.variants; i++) {
      const variant = `v${String(i).padStart(2, '0')}`;
      const tier = ammoVariantTier(i);
      const bonuses = scaleTierMap(a.tier1, tier);
      const special = a.folder === 'arrow' ? GEAR_ARROW_SPECIAL_RU[variant] : undefined;
      const material = WEAPON_TIER_MATERIAL_RU[tier];
      out.push({
        id: `gear_${a.folder}_${variant}`,
        name: special ?? `${a.nameRu} · ${material}`,
        description: `${a.roleRu} Тир ${tier}.`,
        category: 'arrow',
        equipSlot: 'quiver',
        tier,
        canSell: true,
        stackable: true,
        sellValue: sellFor('ammo', tier),
        substatBonuses: bonuses,
        iconPath: `weapons/${a.folder}/${variant}`,
        gearFamily: a.folder,
      });
    }
  }
  return out;
}

export const GEAR_ITEMS: CatalogItem[] = [
  ...buildWeapons(GEAR_TIERS_NOW),
  ...buildArmor(GEAR_TIERS_NOW),
  ...buildJewels(),
  ...buildUniques(),
  ...buildAmmo(),
];

export const GEAR_FAMILY_LABEL_RU: Record<string, string> = {
  ...Object.fromEntries(GEAR_WEAPONS.map((w) => [w.folder, w.nameRu])),
  ...Object.fromEntries(GEAR_WEAPONS.map((w) => [`unique_${w.folder}`, `Уник: ${w.nameRu}`])),
  ...WEIGHT_FAMILY_RU,
  ...Object.fromEntries(GEAR_JEWEL_ELEMENTS.map((el) => [el.family, el.nameRu])),
  arrow: 'Стрелы',
  bolt: 'Болты',
};

/** Сводка по снаряжению — для админ-каталога. */
export function gearSummary(): { [k: string]: number } {
  const counts: { [k: string]: number } = {};
  for (const it of GEAR_ITEMS) {
    counts[it.category] = (counts[it.category] ?? 0) + 1;
  }
  return counts;
}
