import type { Item } from '@/data/types';
import { ItemCell } from '@/shared/ui/kit/ItemCell';

interface GearItemCellProps {
  item: Item;
  selected?: boolean;
  onClick?: () => void;
  /** Подпись под иконкой (по умолчанию — имя предмета). */
  caption?: string;
}

/**
 * Ячейка каталога/пикера над единой `ItemCell`: та же карточка,
 * те же бирка тира/уника и точка редкости, + подпись под иконкой.
 */
export function GearItemCell({ item, selected = false, onClick, caption }: GearItemCellProps) {
  return (
    <ItemCell
      item={item}
      selected={selected}
      onClick={onClick}
      caption={caption ?? item.name}
    />
  );
}
