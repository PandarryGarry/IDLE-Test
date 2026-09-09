import type { EquipSlot, GearWeight, Item, ItemCategory, ItemTier } from '../../../../data/types.ts';
import { ALL_GEAR_TIERS, EQUIP_SLOT_LABELS_RU, GEAR_WEIGHT_NAME_RU } from '../../../../data/balance/gear.ts';
import { GEAR_FAMILY_LABEL_RU } from './gearItems.ts';

export interface GearBrowseFilters {
  query: string;
  slot: EquipSlot | 'all';
  tier: ItemTier | 'all';
  weight: GearWeight | 'all';
}

export const EMPTY_GEAR_BROWSE: GearBrowseFilters = {
  query: '',
  slot: 'all',
  tier: 'all',
  weight: 'all',
};

export const GEAR_BROWSE_TIERS: readonly ItemTier[] = ALL_GEAR_TIERS;

export const GEAR_BROWSE_WEIGHTS: readonly GearWeight[] = ['plate', 'leather', 'cloth'];

/** Порядок слотов в фасовке. */
export const GEAR_BROWSE_SLOT_ORDER: readonly EquipSlot[] = [
  'weapon', 'shield',
  'helm', 'platebody', 'platelegs', 'boots', 'gloves',
  'amulet', 'belt', 'cape',
  'ring', 'ring2', 'bracelet', 'bracelet2',
  'quiver', 'passive',
];

export interface GearBrowseGroup {
  slot: EquipSlot;
  slotLabel: string;
  tier: number;
  family: string;
  familyLabel: string;
  items: Item[];
}

export function familyLabelOf(item: Item): string {
  if (item.gearFamily && GEAR_FAMILY_LABEL_RU[item.gearFamily]) {
    return GEAR_FAMILY_LABEL_RU[item.gearFamily];
  }
  if (item.gearWeight) return GEAR_WEIGHT_NAME_RU[item.gearWeight];
  return item.gearFamily ?? 'Прочее';
}

export function itemMatchesGearBrowse(item: Item, f: GearBrowseFilters): boolean {
  if (f.slot !== 'all' && item.equipSlot !== f.slot) return false;
  if (f.tier !== 'all' && (item.tier ?? 0) !== f.tier) return false;
  if (f.weight !== 'all') {
    if (item.gearWeight !== f.weight) return false;
  }
  const q = f.query.trim().toLowerCase();
  if (q) {
    const family = familyLabelOf(item).toLowerCase();
    if (
      !item.name.toLowerCase().includes(q)
      && !item.id.toLowerCase().includes(q)
      && !family.includes(q)
    ) {
      return false;
    }
  }
  return true;
}

export function filterGearItems(items: readonly Item[], f: GearBrowseFilters): Item[] {
  return items.filter((it) => itemMatchesGearBrowse(it, f));
}

function slotRank(slot: EquipSlot | undefined): number {
  if (!slot) return 999;
  const i = GEAR_BROWSE_SLOT_ORDER.indexOf(slot);
  return i < 0 ? 800 : i;
}

/**
 * Фасовка «слот → тир → семья». Предметы без слота экипа в группировку не входят.
 */
export function groupGearItems(items: readonly Item[]): GearBrowseGroup[] {
  const buckets = new Map<string, GearBrowseGroup>();
  for (const it of items) {
    if (!it.equipSlot) continue;
    const family = it.gearFamily ?? it.gearWeight ?? 'misc';
    const tier = it.tier ?? 0;
    const key = `${it.equipSlot}|${tier}|${family}`;
    let g = buckets.get(key);
    if (!g) {
      g = {
        slot: it.equipSlot,
        slotLabel: EQUIP_SLOT_LABELS_RU[it.equipSlot],
        tier,
        family,
        familyLabel: familyLabelOf(it),
        items: [],
      };
      buckets.set(key, g);
    }
    g.items.push(it);
  }
  return [...buckets.values()].sort((a, b) => {
    const sr = slotRank(a.slot) - slotRank(b.slot);
    if (sr !== 0) return sr;
    if (a.tier !== b.tier) return a.tier - b.tier;
    return a.familyLabel.localeCompare(b.familyLabel, 'ru');
  });
}

export function slotsPresent(items: readonly Item[]): EquipSlot[] {
  const seen = new Set<EquipSlot>();
  for (const it of items) if (it.equipSlot) seen.add(it.equipSlot);
  return GEAR_BROWSE_SLOT_ORDER.filter((s) => seen.has(s));
}

/** Категории ресурсов/лута для фасовки «Прочее». */
export const RESOURCE_CATEGORY_ORDER: readonly ItemCategory[] = [
  'log', 'ore', 'bar', 'raw_fish', 'cooked_fish', 'mineral', 'foraging',
  'food', 'misc', 'herb', 'seed', 'gem', 'bone', 'ash', 'potion', 'rune', 'arrow', 'tablet',
];

export const RESOURCE_CATEGORY_LABEL_RU: Record<string, string> = {
  log: 'Дерево', ore: 'Руда', bar: 'Слиток', raw_fish: 'Сырая рыба', cooked_fish: 'Жареная рыба',
  mineral: 'Минерал', foraging: 'Сбор', food: 'Еда', misc: 'Трофеи', herb: 'Травы',
  seed: 'Семена', gem: 'Самоцвет', bone: 'Кости', ash: 'Зола', potion: 'Зелье',
  rune: 'Руны', arrow: 'Стрелы', tablet: 'Скрижали',
};

export interface LooseBrowseGroup {
  category: string;
  label: string;
  items: Item[];
}

export function groupLooseItems(items: readonly Item[]): LooseBrowseGroup[] {
  const buckets = new Map<string, Item[]>();
  for (const it of items) {
    if (it.equipSlot) continue;
    const list = buckets.get(it.category) ?? [];
    list.push(it);
    buckets.set(it.category, list);
  }
  const keys = [...buckets.keys()].sort((a, b) => {
    const ia = RESOURCE_CATEGORY_ORDER.indexOf(a as ItemCategory);
    const ib = RESOURCE_CATEGORY_ORDER.indexOf(b as ItemCategory);
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
  });
  return keys.map((category) => ({
    category,
    label: RESOURCE_CATEGORY_LABEL_RU[category] ?? category,
    items: (buckets.get(category) ?? []).slice().sort((a, b) => a.name.localeCompare(b.name, 'ru')),
  }));
}
