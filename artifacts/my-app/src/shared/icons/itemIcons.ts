/**
 * Централизованный реестр иконок и ассетов предметов.
 *
 * Предметы каталога рисуются своей картинкой (`iconPath` → `iconUrl()`).
 * Эмодзи-фолбэки мелворовского легаси-снаряжения удалены вместе с самим
 * легаси (шаг 7 аудита): старые сейвы мигрирует `legacyMigration.ts`.
 */

export const ITEM_IMAGE_URLS: Record<string, string> = {
  // Точечные переопределения «id → картинка» (пока пусто).
};

import { getItem } from '@/domain/items';
import { iconUrl } from '@/lib/assetUrl';
import { EQUIP_SLOT_ICON } from '@/domain/attributes/attributeIcons';

export function getItemVisual(itemId: string): { type: 'image' | 'emoji'; value: string } {
  const item = getItem(itemId);

  // 1. Своя картинка предмета (данные → iconUrl → WebP).
  if (item?.iconPath) {
    return { type: 'image', value: iconUrl(item.iconPath) };
  }

  // 2. Точечное переопределение реестром.
  if (ITEM_IMAGE_URLS[itemId]) {
    return { type: 'image', value: ITEM_IMAGE_URLS[itemId] };
  }

  // 3. Снаряжение без своей картинки — силуэт слота.
  if (item?.equipSlot && EQUIP_SLOT_ICON[item.equipSlot]) {
    return { type: 'image', value: EQUIP_SLOT_ICON[item.equipSlot] };
  }

  const icon = item?.icon || '📦';

  return { type: 'emoji', value: icon };
}
