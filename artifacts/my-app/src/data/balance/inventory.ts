/**
 * Сумка: вместимость и цена расширения. Числа жили в `store/inventoryStore.ts`
 * и расходились с фолбэком в `lib/saveManager.ts` (24 против 40) — теперь они
 * в одном месте, фолбэки берутся отсюда.
 */

/** Стартовая сумка героя (и потолок для гостя — расширений гость не покупает). */
export const INVENTORY_BASE_SLOTS = 24;
/** Ступенька покупки места. */
export const INVENTORY_SLOTS_PER_UPGRADE = 10;
/** Цена первой ступеньки, GP. */
export const INVENTORY_UPGRADE_BASE_COST = 500;
/** Рост цены за каждую купленную ступеньку (геометрия). */
export const INVENTORY_UPGRADE_COST_GROWTH = 1.5;

/**
 * Жёсткий потолок числа записей в сейве. В честной игре слотов не больше,
 * чем `maxSlots`; цифра нужна только чтобы битый/подкрученный сейв не
 * подвешивал стору и рендер инвентаря.
 */
export const INVENTORY_SAVE_ITEM_HARD_CAP = 512;
