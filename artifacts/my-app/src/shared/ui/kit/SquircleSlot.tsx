import React from 'react';
import { getItem } from '@/data/items';
import { getItemVisual } from '@/shared/icons/itemIcons';
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

const RARITY_STYLES: Record<string, { border: string; bg: string; glow: string }> = {
  common:    { border: '#b8a080', bg: '#f5eedd', glow: 'none' },
  uncommon:  { border: '#3a9e50', bg: '#e0f5e8', glow: '0 0 8px rgba(58,158,80,0.3)' },
  rare:      { border: '#2060c0', bg: '#e0eeff', glow: '0 0 10px rgba(32,96,192,0.3)' },
  epic:      { border: '#8040c0', bg: '#f0e0ff', glow: '0 0 12px rgba(128,64,192,0.35)' },
  legendary: { border: '#c07010', bg: '#fff0c0', glow: '0 0 14px rgba(192,112,16,0.45)' },
  mythic:    { border: '#c02840', bg: '#ffe0e8', glow: '0 0 16px rgba(192,40,64,0.5)' },
};

export function SquircleSlot({ itemId, quantity, locked = false, isEmptyPlaceholder = false, size = 'md', onClick, className = '' }: SquircleSlotProps) {

  /* Пустая ячейка */
  if (isEmptyPlaceholder || !itemId) {
    return (
      <div className={`g-slot-empty ${className}`}
        style={{ borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px solid var(--border-slot)', opacity: 0.5 }} />
      </div>
    );
  }

  const item   = getItem(itemId);
  const tier   = item ? getItemTier(itemId, item) : 'T1';
  const rarity = item ? getItemRarity(itemId, item.sellValue, item.equipSlot) : 'common';
  const visual = getItemVisual(itemId);
  const rs     = RARITY_STYLES[rarity] ?? RARITY_STYLES.common;

  return (
    <button type="button" onClick={onClick} className={`g-slot ${className}`}
      style={{
        background: rs.bg,
        border: `1px solid ${rs.border}`,
        borderRadius: 10,
        boxShadow: rs.glow !== 'none' ? `var(--shadow-slot), ${rs.glow}` : 'var(--shadow-slot)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.15s ease',
      }}>

      {/* Tier badge */}
      <span style={{ position: 'absolute', top: 3, left: 4, zIndex: 10 }}>
        <TierBadge tier={tier} size="sm" />
      </span>

      {/* Rarity dot */}
      {rarity !== 'common' && (
        <span style={{
          position: 'absolute', top: 4, right: 4, zIndex: 10,
          width: 6, height: 6, borderRadius: '50%',
          background: rs.border,
          boxShadow: rs.glow !== 'none' ? rs.glow : 'none',
        }} />
      )}

      {/* Картинка — 78% ячейки, строго по центру */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14%' }}>
        {visual.type === 'image' ? (
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
          color: 'var(--text-primary)', lineHeight: 1,
          background: 'rgba(253,245,232,0.9)', padding: '1px 4px', borderRadius: 4,
          border: '1px solid var(--border-light)',
        }}>{formatNumber(quantity)}</span>
      )}
    </button>
  );
}
