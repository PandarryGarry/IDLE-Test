/** Каппинг и пороги оффлайн-прогресса (движок читает настройки героя поверх). */

/** Сколько «ночи» считаем по умолчанию, если настройка не задана. */
export const OFFLINE_MAX_HOURS_DEFAULT = 24;
/** Разрешённый настройкой диапазон: меньше 1 часа считать незачем, больше 3 суток — подарок. */
export const OFFLINE_MAX_HOURS_MIN = 1;
export const OFFLINE_MAX_HOURS_MAX = 72;
/** Ниже секунды простоя оффлайн не считаем (переключение вкладок — не оффлайн). */
export const OFFLINE_MIN_MS = 1000;

/**
 * Потеря лута голодной ночи: 15–25% ЭТОЙ ночи.
 * Точная цифра внутри диапазона не закрыта — заглушка середины, не в UI.
 */
export const OFFLINE_HUNGER_LOOT_LOSS_STUB = 0.2;
export const OFFLINE_HUNGER_LOOT_LOSS_MIN = 0.15;
export const OFFLINE_HUNGER_LOOT_LOSS_MAX = 0.25;
