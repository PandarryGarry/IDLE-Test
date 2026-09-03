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
  common:    { border: '#6b3810', bg: 'linear-gradient(160deg, #3d2010, #2e1608)', glow: 'none' },
  uncommon:  { border: '#2a6e30', bg: 'linear-gradient(160deg, #1e3818, #152810)', glow: '0 0 8px rgba(42,110,48,0.5)' },
  rare:      { border: '#1848a0', bg: 'linear-gradient(160deg, #10203a, #0a1828)', glow: '0 0 10px rgba(24,72,160,0.5)' },
  epic:      { border: '#6020a0', bg: 'linear-gradient(160deg, #28103a, #1a0828)', glow: '0 0 12px rgba(96,32,160,0.5)' },
  legendary: { border: '#c07010', bg: 'linear-gradient(160deg, #3a2408, #281804)', glow: '0 0 14px rgba(192,112,16,0.6)' },
  mythic:    { border: '#c02840', bg: 'linear-gradient(160deg, #3a1018, #280a10)', glow: '0 0 16px rgba(192,40,64,0.6)' },
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
          color: '#f5d880', lineHeight: 1,
          background: 'rgba(20,10,0,0.85)', padding: '1px 4px', borderRadius: 4,
          border: '1px solid #6b3810',
        }}>{formatNumber(quantity)}</span>
      )}
    </button>
  );
}
