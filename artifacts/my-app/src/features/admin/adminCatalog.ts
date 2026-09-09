import type { EquipSlot, GearWeight, Item, ItemTier } from '../../data/types.ts';
import { ALL_GEAR_TIERS, EQUIP_SLOT_LABELS_RU, formatTierLabel, GEAR_WEIGHT_NAME_RU } from '../../data/balance/gear.ts';
import { GEAR_FAMILY_LABEL_RU } from '../../domain/items/catalog/gear/gearItems.ts';
import { RESOURCE_CATEGORY_LABEL_RU } from '../../domain/items/catalog/gear/gearBrowse.ts';

/** Разделы каталога в боковом подменю «Предметы». */
export type AdminItemBag = 'all' | 'weapons' | 'armor' | 'jewelry' | 'uniques' | 'craft' | 'other';

export const ADMIN_ITEM_BAGS: readonly { id: AdminItemBag; label: string; href: string }[] = [
  { id: 'all', label: 'Все', href: '/admin' },
  { id: 'weapons', label: 'Оружие', href: '/admin/items/weapons' },
  { id: 'armor', label: 'Экипировка', href: '/admin/items/armor' },
  { id: 'jewelry', label: 'Бижутерия', href: '/admin/items/jewelry' },
  { id: 'uniques', label: 'Уники', href: '/admin/items/uniques' },
  { id: 'craft', label: 'Крафт / фарм', href: '/admin/items/craft' },
  { id: 'other', label: 'Прочее', href: '/admin/items/other' },
];

const ARMOR_SLOTS: readonly EquipSlot[] = [
  'helm', 'platebody', 'platelegs', 'boots', 'gloves', 'shield', 'cape',
];
const JEWEL_SLOTS: readonly EquipSlot[] = [
  'amulet', 'ring', 'ring2', 'bracelet', 'bracelet2', 'belt',
];

export function parseAdminItemBag(path: string): AdminItemBag {
  const m = path.match(/^\/admin\/items\/([a-z]+)/);
  const id = m?.[1];
  if (id && ADMIN_ITEM_BAGS.some((b) => b.id === id)) return id as AdminItemBag;
  return 'all';
}

/** Уник-оружие и уник-бижутерия — не смешиваем с тировой лестницей. */
export function isUniqueItem(item: Item): boolean {
  if (item.id.startsWith('gear_unique_')) return true;
  if (item.gearFamily?.startsWith('unique_')) return true;
  if (item.iconPath?.includes('/unique/')) return true;
  return false;
}

export function itemBag(item: Item): AdminItemBag {
  if (isUniqueItem(item)) return 'uniques';
  const slot = item.equipSlot;
  if (slot === 'weapon') return 'weapons';
  if (slot && (ARMOR_SLOTS as readonly string[]).includes(slot)) return 'armor';
  if (slot && (JEWEL_SLOTS as readonly string[]).includes(slot)) return 'jewelry';
  if (!slot) return 'craft';
  return 'other';
}

export function itemsInBag(items: readonly Item[], bag: AdminItemBag): Item[] {
  if (bag === 'all') return [...items];
  return items.filter((it) => itemBag(it) === bag);
}

export interface AdminItemFilters {
  query: string;
  type: string;
  tier: ItemTier | 'all';
  weight: GearWeight | 'all';
  slot: EquipSlot | 'all';
}

export const EMPTY_ADMIN_ITEM_FILTERS: AdminItemFilters = {
  query: '',
  type: 'all',
  tier: 'all',
  weight: 'all',
  slot: 'all',
};

function matchesQuery(item: Item, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const family = (item.gearFamily ? (GEAR_FAMILY_LABEL_RU[item.gearFamily] ?? item.gearFamily) : '').toLowerCase();
  return (
    item.name.toLowerCase().includes(q)
    || item.id.toLowerCase().includes(q)
    || family.includes(q)
  );
}

export function filterAdminItems(items: readonly Item[], bag: AdminItemBag, f: AdminItemFilters): Item[] {
  return itemsInBag(items, bag).filter((it) => {
    if (!matchesQuery(it, f.query)) return false;
    if (f.tier !== 'all' && (it.tier ?? 0) !== f.tier) return false;
    if (f.weight !== 'all' && it.gearWeight !== f.weight) return false;
    if (f.slot !== 'all' && it.equipSlot !== f.slot) return false;
    if (f.type !== 'all') {
      if (bag === 'weapons' || bag === 'jewelry' || bag === 'uniques' || bag === 'other') {
        if ((it.gearFamily ?? it.category) !== f.type) return false;
      }
      if (bag === 'craft' && it.category !== f.type) return false;
    }
    return true;
  });
}

export interface AdminFilterOption {
  id: string;
  label: string;
}

export interface AdminFilterSpec {
  key: 'type' | 'tier' | 'weight' | 'slot';
  label: string;
  options: AdminFilterOption[];
}

function uniqueSorted(values: string[], labels: (id: string) => string): AdminFilterOption[] {
  const seen = new Set<string>();
  const out: AdminFilterOption[] = [{ id: 'all', label: 'Все' }];
  for (const v of values) {
    if (!v || seen.has(v)) continue;
    seen.add(v);
    out.push({ id: v, label: labels(v) });
  }
  return out;
}

/** Какие выпадающие фильтры показать для текущего раздела. */
export function filtersForBag(bag: AdminItemBag, pool: readonly Item[]): AdminFilterSpec[] {
  const specs: AdminFilterSpec[] = [];
  if (bag === 'weapons') {
    const types = pool.map((it) => it.gearFamily ?? it.category).sort((a, b) => a.localeCompare(b, 'ru'));
    specs.push({
      key: 'type',
      label: 'Тип оружия',
      options: uniqueSorted(types, (id) => GEAR_FAMILY_LABEL_RU[id] ?? id),
    });
    specs.push(tierSpec(pool, 'Тир оружия'));
  } else if (bag === 'armor') {
    const slots = ARMOR_SLOTS.filter((s) => pool.some((it) => it.equipSlot === s));
    specs.push({
      key: 'slot',
      label: 'Слот',
      options: [{ id: 'all', label: 'Все' }, ...slots.map((s) => ({ id: s, label: EQUIP_SLOT_LABELS_RU[s] }))],
    });
    if (pool.some((it) => it.gearWeight)) {
      specs.push({
        key: 'weight',
        label: 'Вес',
        options: [
          { id: 'all', label: 'Любой' },
          { id: 'plate', label: GEAR_WEIGHT_NAME_RU.plate },
          { id: 'leather', label: GEAR_WEIGHT_NAME_RU.leather },
          { id: 'cloth', label: GEAR_WEIGHT_NAME_RU.cloth },
        ],
      });
    }
    specs.push(tierSpec(pool));
  } else if (bag === 'jewelry') {
    const slots = JEWEL_SLOTS.filter((s) => pool.some((it) => it.equipSlot === s));
    specs.push({
      key: 'slot',
      label: 'Слот',
      options: [{ id: 'all', label: 'Все' }, ...slots.map((s) => ({ id: s, label: EQUIP_SLOT_LABELS_RU[s] }))],
    });
    const types = pool.map((it) => it.gearFamily ?? '').filter(Boolean);
    specs.push({
      key: 'type',
      label: 'Стихия',
      options: uniqueSorted(types, (id) => GEAR_FAMILY_LABEL_RU[id] ?? id),
    });
    specs.push(tierSpec(pool));
  } else if (bag === 'craft') {
    const cats = pool.map((it) => it.category);
    specs.push({
      key: 'type',
      label: 'Категория',
      options: uniqueSorted(cats, (id) => RESOURCE_CATEGORY_LABEL_RU[id] ?? id),
    });
    if (pool.some((it) => typeof it.tier === 'number')) specs.push(tierSpec(pool));
  } else if (bag === 'other') {
    const types = pool.map((it) => it.gearFamily ?? it.category);
    specs.push({
      key: 'type',
      label: 'Тип',
      options: uniqueSorted(types, (id) => GEAR_FAMILY_LABEL_RU[id] ?? RESOURCE_CATEGORY_LABEL_RU[id] ?? id),
    });
    if (pool.some((it) => typeof it.tier === 'number')) specs.push(tierSpec(pool));
  } else {
    specs.push(tierSpec(pool));
  }
  return specs;
}

function tierSpec(pool: readonly Item[], label = 'Тир'): AdminFilterSpec {
  const present = new Set(pool.map((it) => it.tier).filter((t): t is ItemTier => typeof t === 'number'));
  const tiers = ALL_GEAR_TIERS.filter((t) => present.has(t));
  return {
    key: 'tier',
    label,
    options: [
      { id: 'all', label: 'Все' },
      ...tiers.map((t) => ({ id: String(t), label: formatTierLabel(t) })),
    ],
  };
}

export function applyFilterChange(
  prev: AdminItemFilters,
  key: AdminFilterSpec['key'],
  raw: string,
): AdminItemFilters {
  if (key === 'type') return { ...prev, type: raw };
  if (key === 'weight') return { ...prev, weight: raw === 'all' ? 'all' : raw as GearWeight };
  if (key === 'slot') return { ...prev, slot: raw === 'all' ? 'all' : raw as EquipSlot };
  if (key === 'tier') {
    if (raw === 'all') return { ...prev, tier: 'all' };
    const n = Number(raw) as ItemTier;
    return { ...prev, tier: n };
  }
  return prev;
}

export function filterValue(f: AdminItemFilters, key: AdminFilterSpec['key']): string {
  if (key === 'type') return f.type;
  if (key === 'weight') return f.weight;
  if (key === 'slot') return f.slot;
  if (key === 'tier') return f.tier === 'all' ? 'all' : String(f.tier);
  return 'all';
}
