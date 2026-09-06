import type { Item, ItemTier } from '../../../data/types.ts';

/**
 * Предмет каталога — полная запись с обязательными тиром и описанием.
 * `iconPath` — путь в `public/assets/icons` БЕЗ расширения; в `<img>`
 * отдаётся только через `iconUrl()` (см. `scripts/assets/README.md`).
 */
export interface CatalogItem extends Item {
  tier: ItemTier;
  description: string;
}
