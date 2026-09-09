import type { Item } from '@/data/types';
import { gearQualityLabel, GEAR_RARITY_RU, GEAR_UNIQUE_TAG_RU, isGearUnique } from '@/data/balance/gear';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { getItemRarity } from '@/features/inventory/ItemIcon';

interface GearItemCellProps {
  item: Item;
  selected?: boolean;
  onClick?: () => void;
  /** Подпись под иконкой (по умолчанию имя предмета). */
  caption?: string;
}

/**
 * Единая ячейка выбора снаряжения: картинка + Тир N + редкость + прочность.
 * Админ-пикер и каталог предметов.
 */
export function GearItemCell({ item, selected = false, onClick, caption }: GearItemCellProps) {
  const visual = getItemVisual(item.id);
  const rarity = getItemRarity(item.id, item.sellValue, item.equipSlot, item.tier);
  const unique = isGearUnique(item);
  const qualityText = gearQualityLabel(item);
  const dur = item.maxDurability;

  return (
    <button
      type="button"
      className={`gear-cell ${selected ? 'is-selected' : ''} is-${rarity}${unique ? ' is-unique' : ''}`}
      onClick={onClick}
      title={unique ? `${item.name} — ${GEAR_UNIQUE_TAG_RU}` : item.name}
    >
      <span className="gear-cell__art">
        {visual.type === 'image' ? (
          <img src={visual.value} alt="" decoding="async" />
        ) : (
          <span className="gear-cell__emoji">{visual.value}</span>
        )}
      </span>
      {qualityText && (
        <span className={`gear-cell__tier${unique ? ' gear-cell__tier--unique' : ''}`}>
          {qualityText}
        </span>
      )}
      {rarity !== 'common' && (
        <span className="gear-cell__rarity" title={GEAR_RARITY_RU[rarity]}>
          {GEAR_RARITY_RU[rarity]}
        </span>
      )}
      {typeof dur === 'number' && dur > 0 && (
        <span className="gear-cell__dur" title="Прочность">
          {dur}/{dur}
        </span>
      )}
      <span className="gear-cell__name">{caption ?? item.name}</span>
    </button>
  );
}
