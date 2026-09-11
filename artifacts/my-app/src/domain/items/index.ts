import type { Item } from '../../data/types.ts';

import { CATALOG } from './catalog/index.ts';
import LEGACY_ITEMS from './items.ts';
import { getAdminItemSnapshot } from '../runtimePorts.ts';

/**
 * Единая точка доступа к предметам: каталог (ресурсы + «Сбор» + охота +
 * снаряжение) с русскими именами и картинками.
 * Остаток мелворовского легаси-снаряжения (`items.ts`) — только эмодзи/силуэт
 * без своих картинок — в каталог/админку не попадает (см. `getAllItems`),
 * но `getItem()` всё ещё достаёт его из сейвов и дропов для совместимости.
 * Замена источника (репозиторий → БД) затрагивает только этот модуль (§8).
 *
 * Админ-настройки применяются здесь же через порт домена
 * (`runtimePorts.adminItemSnapshot` — его регистрирует `store/adminConfigStore`):
 * оверрайды Item + глобальный множитель цены продажи. `getBaseItem()` возвращает исходник без правок
 * (для админ-редактора), `getItem()` — эффективный предмет для игры.
 */
const CATALOG_BY_ID = new Map<string, Item>(CATALOG.map(i => [i.id, i]));

function rawGetItem(id: string): Item | undefined {
  return CATALOG_BY_ID.get(id) ?? LEGACY_ITEMS[id];
}

/** Исходный предмет БЕЗ админ-правок и глобальных множителей. */
export function getBaseItem(id: string): Item | undefined {
  return rawGetItem(id);
}

/**
 * Предмет для админ-редактора: исходник + точечные правки, БЕЗ глобального
 * множителя цены продажи (иначе поле «цена» показывало бы уже умноженное
 * значение и при сохранении «крепило» множитель внутри оверрайда).
 */
export function getAdminItem(id: string): Item | undefined {
  const base = rawGetItem(id);
  if (!base) return undefined;
  const admin = getAdminItemSnapshot();
  return admin.itemOverrides[id]
    ? applyOverride(base, admin.itemOverrides[id])
    : base;
}

function applyOverride(base: Item, override: Partial<Item>): Item {
  if (!override) return base;
  const {
    combatStats: overrideStats,
    ...rest
  } = override;
  const next: Item = { ...base, ...rest };

  if (overrideStats) {
    next.combatStats = {
      ...base.combatStats,
      ...overrideStats,
    };
  }

  return next;
}

function applyGlobalSellRate(item: Item, sellPriceMultiplier: number): Item {
  if (!item.canSell || sellPriceMultiplier === 1) return item;
  return {
    ...item,
    sellValue: Math.max(0, Math.round(item.sellValue * sellPriceMultiplier)),
  };
}

export function getItem(id: string): Item | undefined {
  const base = rawGetItem(id);
  if (!base) return undefined;

  const admin = getAdminItemSnapshot();
  const withOverride = admin.itemOverrides[id]
    ? applyOverride(base, admin.itemOverrides[id])
    : base;

  return applyGlobalSellRate(withOverride, admin.sellPriceMultiplier);
}

/** Все предметы каталога с применёнными админ-правками. */
export function getCatalogItems(): Item[] {
  return CATALOG.map(item => getItem(item.id) ?? item);
}

export function getAllItems(): Item[] {
  return CATALOG.map(item => getItem(item.id) ?? item);
}

export { CATALOG, CATALOG_VERSION, CATALOG_SUMMARY } from './catalog/index.ts';
export type { CatalogItem } from './catalog/types.ts';
