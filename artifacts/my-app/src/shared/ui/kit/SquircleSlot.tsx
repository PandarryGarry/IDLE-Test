import React from 'react';
import { getItem } from '@/domain/items';
import { ItemCell } from '@/shared/ui/kit/ItemCell';

interface SquircleSlotProps {
  itemId?: string;
  quantity?: number;
  locked?: boolean;
  isEmptyPlaceholder?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  selected?: boolean;
}

/**
 * Историческое имя ячейки. Теперь — тонкая обёртка над единой `ItemCell`,
 * чтобы Инвентарь и Админка рисовали ту же карточку, что и все остальные окна.
 */
export function SquircleSlot({
  itemId,
  quantity,
  locked = false,
  isEmptyPlaceholder = false,
  onClick,
  className = '',
  selected = false,
}: SquircleSlotProps) {
  const item = itemId ? getItem(itemId) : undefined;
  if (isEmptyPlaceholder || !item) {
    return (
      <ItemCell
        empty
        locked={locked}
        selected={selected}
        onClick={onClick}
        className={className}
      />
    );
  }
  return (
    <ItemCell
      item={item}
      quantity={quantity}
      selected={selected}
      onClick={onClick}
      className={className}
    />
  );
}
