import type { EquipSlot, GearWeight, Item, ItemTier } from '../../data/types.ts';
import {
  ALL_GEAR_TIERS,
  EQUIP_SLOT_LABELS_RU,
  formatTierLabel,
  isGearUnique,
} from '../../data/balance/gear.ts';
import { GEAR_FAMILY_LABEL_RU } from '../../domain/items/catalog/gear/gearItems.ts';
import {
  familyLabelOf,
  RESOURCE_CATEGORY_LABEL_RU,
  slotRankOf,
} from '../../domain/items/catalog/gear/gearBrowse.ts';

/** Разделы каталога в боковом подменю «Предметы». */
export type AdminItemBag = 'all' | 'weapons' | 'armor' | 'jewelry' | 'uniques' | 'craft' | 'tools';

export const ADMIN_ITEM_BAGS: readonly { id: AdminItemBag; label: string; href: string }[] = [
  { id: 'all', label: 'Все', href: '/admin' },
  { id: 'weapons', label: 'Оружие', href: '/admin/items/weapons' },
  { id: 'armor', label: 'Экипировка', href: '/admin/items/armor' },
  { id: 'jewelry', label: 'Бижутерия', href: '/admin/items/jewelry' },
  { id: 'uniques', label: 'Уники', href: '/admin/items/uniques' },
  { id: 'craft', label: 'Крафт / фарм', href: '/admin/items/craft' },
  { id: 'tools', label: 'Инструменты', href: '/admin/items/tools' },
];

const ARMOR_SLOTS: readonly EquipSlot[] = [
  'helm', 'platebody', 'platelegs', 'boots', 'gloves', 'shield', 'cape',
];
const JEWEL_SLOTS: readonly EquipSlot[] = [
  'amulet', 'ring', 'ring2', 'bracelet', 'bracelet2', 'belt',
];
/** Слоты, в которых вообще бывают уники (оружие/щит + бижутерия). */
const UNIQUE_SLOTS: readonly EquipSlot[] = [
  'weapon', 'shield', 'amulet', 'belt', 'ring', 'ring2', 'bracelet', 'bracelet2',
];
const TOOL_SLOTS: readonly EquipSlot[] = ['quiver'];

export function parseAdminItemBag(path: string): AdminItemBag {
  const m = path.match(/^\/admin\/items\/([a-z]+)/);
  const id = m?.[1];
  if (id === 'other') return 'tools'; // старый URL после переименования вкладки
  if (id && ADMIN_ITEM_BAGS.some((b) => b.id === id)) return id as AdminItemBag;
  return 'all';
}

/**
 * Уник-оружие/щит и уник-бижутерия (последние 5 вариантов каждой семьи) —
 * не смешиваем с тировой лестницей. Правило одно на всю игру:
 * `isGearUnique` из `data/balance/gear.ts`.
 */
export function isUniqueItem(item: Item): boolean {
  return isGearUnique(item);
}

export function itemBag(item: Item): AdminItemBag {
  if (isUniqueItem(item)) return 'uniques';
  const slot = item.equipSlot;
  if (slot === 'weapon') return 'weapons';
  if (slot && (ARMOR_SLOTS as readonly string[]).includes(slot)) return 'armor';
  if (slot && (JEWEL_SLOTS as readonly string[]).includes(slot)) return 'jewelry';
  if (slot && (TOOL_SLOTS as readonly string[]).includes(slot)) return 'tools';
  if (!slot) return 'craft';
  return 'tools';
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
      if (bag === 'weapons' || bag === 'jewelry' || bag === 'uniques' || bag === 'tools') {
        if ((it.gearFamily ?? it.category) !== f.type) return false;
      }
      if (bag === 'craft' && craftProfessionOf(it) !== f.type) return false;
    }
    return true;
  });
}

/** Порядок сумок, когда смотрим «Все». */
const BAG_RANK: Record<AdminItemBag, number> = {
  all: 0, weapons: 1, armor: 2, jewelry: 3, uniques: 4, craft: 5, tools: 6,
};

/**
 * Раскладка сетки каталога: сумка → слот → тип (семья/стихия) → тир → имя.
 * В «Униках» это и есть сортировка по типу: уник-оружие идёт по семьям
 * (Меч, Топор, …), уник-бижутерия — по слотам и стихиям, а не вперемешку.
 */
export function sortAdminItems(items: readonly Item[], bag: AdminItemBag): Item[] {
  return [...items].sort((a, b) => {
    if (bag === 'all') {
      const d = BAG_RANK[itemBag(a)] - BAG_RANK[itemBag(b)];
      if (d !== 0) return d;
    }
    const dSlot = slotRankOf(a.equipSlot) - slotRankOf(b.equipSlot);
    if (dSlot !== 0) return dSlot;
    const dFamily = familyLabelOf(a).localeCompare(familyLabelOf(b), 'ru');
    if (dFamily !== 0) return dFamily;
    const dTier = (a.tier ?? 0) - (b.tier ?? 0);
    if (dTier !== 0) return dTier;
    return a.name.localeCompare(b.name, 'ru');
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

/** Админская фасовка loose-предметов: это UX-фильтр, не gameplay-профессии. */
type CraftProfessionId = 'foraging' | 'wood' | 'mining' | 'smithing' | 'fishing' | 'cooking' | 'hunting' | 'other';

const CRAFT_PROFESSION_ORDER: readonly CraftProfessionId[] = [
  'foraging', 'wood', 'mining', 'smithing', 'fishing', 'cooking', 'hunting', 'other',
];

const CRAFT_PROFESSION_LABEL_RU: Record<CraftProfessionId, string> = {
  foraging: 'Сбор',
  wood: 'Лес',
  mining: 'Руда / камень',
  smithing: 'Кузня',
  fishing: 'Рыба',
  cooking: 'Еда',
  hunting: 'Охота',
  other: 'Прочее',
};

function craftProfessionOf(item: Item): CraftProfessionId {
  if (item.category === 'foraging') return 'foraging';
  if (item.category === 'log') return 'wood';
  if (item.category === 'ore' || item.category === 'mineral') return 'mining';
  if (item.category === 'bar') return 'smithing';
  if (item.category === 'raw_fish') return 'fishing';
  if (item.category === 'cooked_fish' || item.category === 'food') return 'cooking';
  if (item.category === 'misc' || item.category === 'bone') return 'hunting';
  return 'other';
}

function typeSpec(
  key: 'type' | 'slot',
  label: string,
  values: readonly string[],
  labels: (id: string) => string,
): AdminFilterSpec {
  return {
    key,
    label,
    options: uniqueSorted([...values], labels),
  };
}

/** Какие выпадающие фильтры показать для текущего раздела. */
export function filtersForBag(bag: AdminItemBag, pool: readonly Item[]): AdminFilterSpec[] {
  const specs: AdminFilterSpec[] = [];
  if (bag === 'weapons') {
    const types = pool.map((it) => it.gearFamily ?? it.category).sort((a, b) => a.localeCompare(b, 'ru'));
    specs.push(typeSpec('type', 'Тип', types, (id) => GEAR_FAMILY_LABEL_RU[id] ?? id));
    specs.push(tierSpec(pool, 'Тир'));
  } else if (bag === 'armor') {
    const slots = ARMOR_SLOTS.filter((s) => pool.some((it) => it.equipSlot === s));
    specs.push({
      key: 'slot',
      label: 'Тип',
      options: [{ id: 'all', label: 'Все' }, ...slots.map((s) => ({ id: s, label: EQUIP_SLOT_LABELS_RU[s] }))],
    });
    specs.push(tierSpec(pool, 'Тир'));
  } else if (bag === 'jewelry') {
    const slots = JEWEL_SLOTS.filter((s) => pool.some((it) => it.equipSlot === s));
    specs.push({
      key: 'slot',
      label: 'Тип',
      options: [{ id: 'all', label: 'Все' }, ...slots.map((s) => ({ id: s, label: EQUIP_SLOT_LABELS_RU[s] }))],
    });
    specs.push(tierSpec(pool, 'Тир'));
  } else if (bag === 'tools') {
    const types = pool.map((it) => it.gearFamily ?? it.category).sort((a, b) => a.localeCompare(b, 'ru'));
    specs.push(typeSpec('type', 'Тип', types, (id) => GEAR_FAMILY_LABEL_RU[id] ?? RESOURCE_CATEGORY_LABEL_RU[id] ?? id));
    specs.push(tierSpec(pool, 'Тир'));
  } else if (bag === 'uniques') {
    // У тировой подписи у uniques нет — фильтруем по слоту и по типу
    // (семья оружия / стихия украшения), а не по тиру.
    const slots = UNIQUE_SLOTS.filter((s) => pool.some((it) => it.equipSlot === s));
    specs.push({
      key: 'slot',
      label: 'Слот',
      options: [{ id: 'all', label: 'Все' }, ...slots.map((s) => ({ id: s, label: EQUIP_SLOT_LABELS_RU[s] }))],
    });
    const types = pool.map((it) => it.gearFamily ?? it.category);
    specs.push(typeSpec('type', 'Тип', types, (id) => GEAR_FAMILY_LABEL_RU[id] ?? RESOURCE_CATEGORY_LABEL_RU[id] ?? id));
  } else if (bag === 'craft') {
    const present = new Set(pool.map(craftProfessionOf));
    const options = CRAFT_PROFESSION_ORDER
      .filter((id) => present.has(id))
      .map((id) => ({ id, label: CRAFT_PROFESSION_LABEL_RU[id] }));
    specs.push({
      key: 'type',
      label: 'Профессия',
      options: [{ id: 'all', label: 'Все' }, ...options],
    });
  } else {
    specs.push(tierSpec(pool, 'Тир'));
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
