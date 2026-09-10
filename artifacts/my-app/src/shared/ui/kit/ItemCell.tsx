import React from 'react';
import type { Item } from '@/data/types';
import type { EquipSlot } from '@/data/types';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { EquipSlotSilhouette } from '@/shared/icons/EquipSlotIcons';
import { getItemRarity } from '@/features/inventory/ItemIcon';
import { getItemTier } from '@/components/modals/UniversalInfoModal';
import { isGearUnique } from '@/data/balance/gear';
import { formatNumber } from '@/lib/utils';
import { TierBadge } from '@/shared/ui/kit/TierBadge';
import { THEME } from '@/styles/tokens';

/**
 * ЕДИНАЯ карточка/ячейка предмета. Единственный источник правды о том,
 * как выглядит ячейка во ВСЕХ окнах (Инвентарь, Админка, пикер, «Экип», бой):
 *   - бирка тира/«УНИК» — маленький TierBadge в ПРАВОМ верхнем углу;
 *   - точка редкости — в ЛЕВОМ верхнем углу;
 *   - иконка/силуэт — по центру; прочность — снизу-слева; количество — снизу-справа;
 *   - фон «каштан» (--slot-wood), одинаковый радиус и тень.
 * Все обёртки (SquircleSlot, GearItemCell, карточки героя) делегируют сюда,
 * чтобы больше не хардкодить разметку/позиции по окнам.
 */

/** Точка редкости — единая шкала канона (значения = живые, вид 1:1). */
export const ITEM_CELL_RARITY_DOT: Record<string, string> = {
  common: THEME.rarity.common,
  uncommon: THEME.rarity.uncommon,
  rare: THEME.rarity.rare,
  epic: THEME.rarity.epic,
  legendary: THEME.rarity.legendary,
  mythic: THEME.rarity.mythic,
};

export interface ItemCellProps {
  /** Предмет — ячейка с контентом. Без него — пустая/силуэт/лок. */
  item?: Item;
  quantity?: number;
  selected?: boolean;
  /** Пустая ячейка сумки (без силуэта). */
  empty?: boolean;
  /** Запертый слот. */
  locked?: boolean;
  /** Силуэт игрового слота (пустой слот экипировки). */
  silhouette?: EquipSlot | 'locked';
  /** Двуручное в левой руке — приглушить. */
  dimmed?: boolean;
  compatible?: boolean;
  matchingTarget?: boolean;
  /** Подпись под иконкой (пикер каталога). */
  caption?: string;
  /** Компактный режим (мелкие ячейки «Экипа»): бирка и точка мельче. */
  compact?: boolean;
  onClick?: () => void;
  title?: string;
  className?: string;
}

export function ItemCell({
  item,
  quantity,
  selected = false,
  empty = false,
  locked = false,
  silhouette,
  dimmed = false,
  compatible = false,
  matchingTarget = false,
  caption,
  compact = false,
  onClick,
  title,
  className = '',
}: ItemCellProps) {
  const rootMods = compact ? 'item-cell--compact' : '';

  const mods = [
    selected ? 'is-selected' : '',
    dimmed ? 'is-dimmed' : '',
    compatible ? 'is-compatible' : '',
    matchingTarget ? 'is-matching' : '',
  ].filter(Boolean).join(' ');

  // Пустая ячейка сумки
  if (empty || (!item && !silhouette && !locked)) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={`item-cell item-cell--empty ${rootMods} ${selected ? 'is-selected' : ''} ${className}`}
      />
    );
  }

  // Запертый слот / силуэт пустого слота экипировки
  if (!item) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={`item-cell ${rootMods} ${locked ? 'item-cell--locked' : 'item-cell--empty'} ${mods} ${className}`}
      >
        <EquipSlotSilhouette slot={silhouette ?? 'locked'} className="item-cell__vector" />
      </button>
    );
  }

  const tier = getItemTier(item.id, item);
  const unique = isGearUnique(item);
  const rarity = getItemRarity(item.id, item.sellValue, item.equipSlot, item.tier);
  const visual = getItemVisual(item.id);
  const dot = ITEM_CELL_RARITY_DOT[rarity] ?? ITEM_CELL_RARITY_DOT.common;

  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? item.name}
      className={`item-cell ${rootMods} ${mods} ${className}`}
    >
      {/* Бирка тира/уника — всегда справа-сверху */}
      <span className="item-cell__badge">
        <TierBadge tier={tier} size={compact ? 'xs' : 'sm'} unique={unique} />
      </span>

      {/* Точка редкости — слева-сверху */}
      {rarity !== 'common' && (
        <span className="item-cell__dot" style={{ background: dot, boxShadow: `0 0 6px ${dot}` }} />
      )}

      {/* Иконка по центру */}
      <span className="item-cell__art">
        {visual.type === 'image' ? (
          <img src={visual.value} alt={item.name} loading="lazy" />
        ) : (
          <span className="item-cell__emoji">{visual.value}</span>
        )}
      </span>

      {/* Прочность — снизу-слева */}
      {typeof item.maxDurability === 'number' && item.maxDurability > 0 && (
        <span className="item-cell__dur" title="Прочность">{item.maxDurability}</span>
      )}

      {/* Количество — снизу-справа */}
      {quantity !== undefined && quantity > 1 && (
        <span className="item-cell__qty">{formatNumber(quantity)}</span>
      )}

      {caption && <span className="item-cell__name">{caption}</span>}
    </button>
  );
}
