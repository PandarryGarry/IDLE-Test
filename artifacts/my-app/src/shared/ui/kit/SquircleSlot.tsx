import React from 'react';
import { getItem } from '@/data/items';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { EquipSlotSilhouette } from '@/shared/icons/EquipSlotIcons';
import { getItemTier } from '@/components/modals/UniversalInfoModal';
import { getItemRarity } from '@/components/ItemIcon';
import { formatNumber } from '@/lib/utils';
import { TierBadge } from './TierBadge';

interface SquircleSlotProps {
  itemId?: string;
  quantity?: number;
  locked?: boolean;
  isEmptyPlaceholder?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

/* Ячейки у всех одинаковые — плоский «каштан» без рамки.
   Редкость читается точкой в углу (яркие цвета, видны на дереве). */
const RARITY_DOT: Record<string, string> = {
  common:    '#c8a070',
  uncommon:  '#4ade80',
  rare:      '#60a5fa',
  epic:      '#c084fc',
  legendary: '#fbbf24',
  mythic:    '#f87171',
};

export function SquircleSlot({ itemId, quantity, locked = false, isEmptyPlaceholder = false, size = 'md', onClick, className = '' }: SquircleSlotProps) {

  /* Пустая ячейка */
  if (isEmptyPlaceholder || !itemId) {
    return (
      <div className={`g-slot-empty ${className}`}
        style={{ borderRadius: 10, aspectRatio: '1/1', width: '100%' }}
      />
    );
  }

  const item   = getItem(itemId);
  const tier   = item ? getItemTier(itemId, item) : 'T1';
  const rarity = item ? getItemRarity(itemId, item.sellValue, item.equipSlot) : 'common';
  const visual = getItemVisual(itemId);
  const dotColor = RARITY_DOT[rarity] ?? RARITY_DOT.common;

  return (
    <button type="button" onClick={onClick} className={`g-slot ${className}`}>

      {/* Tier badge */}
      <span style={{ position: 'absolute', top: 3, left: 4, zIndex: 10 }}>
        <TierBadge tier={tier} size="sm" />
      </span>

      {/* Rarity dot */}
      {rarity !== 'common' && (
        <span style={{
          position: 'absolute', top: 4, right: 4, zIndex: 10,
          width: 6, height: 6, borderRadius: '50%',
          background: dotColor,
          boxShadow: `0 0 6px ${dotColor}`,
        }} />
      )}

      {/* Содержимое — 78% ячейки, строго по центру.
          Снаряжение рисуем векторным силуэтом (без светлого квадрата-подложки),
          прочее — эмодзи/иконка. */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16%', color: '#f0d6ab' }}>
        {item?.equipSlot ? (
          <EquipSlotSilhouette slot={item.equipSlot} className="g-slot__vec" />
        ) : visual.type === 'image' ? (
          <img src={visual.value} alt={item?.name ?? ''} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 1px 3px rgba(45,31,15,0.25))' }} />
        ) : (
          <span style={{ fontSize: '1.75rem', lineHeight: 1, filter: 'drop-shadow(0 1px 3px rgba(45,31,15,0.2))' }}>
            {visual.value}
          </span>
        )}
      </div>

      {/* Количество */}
      {quantity !== undefined && quantity > 1 && (
        <span style={{
          position: 'absolute', bottom: 3, right: 4, zIndex: 10,
          fontSize: 10, fontFamily: 'var(--app-font-mono)', fontWeight: 900,
          color: '#f5d880', lineHeight: 1,
          background: 'rgba(20,10,0,0.85)', padding: '1px 4px', borderRadius: 4,
        }}>{formatNumber(quantity)}</span>
      )}
    </button>
  );
}
