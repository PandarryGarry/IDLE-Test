import type { Item } from '../../data/types.ts';

import { CATALOG } from './catalog/index.ts';
import LEGACY_ITEMS from './items.ts';

/**
 * Единая точка доступа к предметам: сначала каталог (батч 1),
 * затем легаси-семейства, которые ещё не перенесены (оружие/броня/руны/…).
 * Замена источника (репозиторий → БД) затрагивает только этот модуль (§8).
 */
const CATALOG_BY_ID = new Map<string, Item>(CATALOG.map(i => [i.id, i]));

export function getItem(id: string): Item | undefined {
  return CATALOG_BY_ID.get(id) ?? LEGACY_ITEMS[id];
}

export function getAllItems(): Item[] {
  return [...CATALOG, ...Object.values(LEGACY_ITEMS)];
}

export { CATALOG, CATALOG_VERSION, CATALOG_SUMMARY } from './catalog/index.ts';
export type { CatalogItem } from './catalog/types.ts';
