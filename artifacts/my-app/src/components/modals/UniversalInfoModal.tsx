import React, { useState } from 'react';
import { getItem } from '@/domain/items';
import { AdminItemEditor } from '@/features/admin/AdminItemEditor';
import type { Item } from '@/data/types';
import { useInventoryStore } from '@/store/inventoryStore';
import { usePlayerStore } from '@/store/playerStore';
import { useCombatStore } from '@/store/combatStore';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { getItemRarity } from '@/features/inventory/ItemIcon';
import { isGearUnique } from '@/data/balance/gear';
import { formatNumber } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { CoinsDisplay } from '@/shared/ui/CoinsDisplay';
import { TierBadge } from '@/shared/ui/kit/TierBadge';
import { UniqueEmblem } from '@/shared/ui/kit/UniqueEmblem';
import { RarityBadge, type RarityType } from '@/shared/ui/kit/RarityBadge';
import { StatPill } from '@/shared/ui/kit/StatPill';
import { 
  X, 
  Lock, 
  Unlock, 
  Coins, 
  Heart, 
  Sword, 
  Shield, 
  Zap, 
  Minus, 
  Plus, 
  Utensils 
} from 'lucide-react';

export function getItemTier(itemId: string, item?: Item): string {
  // Уник — тоже ступень тира в бейдже: числовой тир виден у всех предметов,
  // а уникальность показывает звезда-эмблема рядом (шаг 6 плана).
  // Тир — данное поле каталога (1..12). Ниже — эвристика только для легаси
  // предметов без поля `tier` (исчезнет по мере переноса семейств в каталог).
  if (item?.tier) return `T${item.tier}`;
  const id = itemId.toLowerCase();
  if (id.includes('dragon')) return 'T7';
  if (id.includes('runite') || id.includes('rune_')) return 'T6';
  if (id.includes('adamant')) return 'T5';
  if (id.includes('mithril')) return 'T4';
  if (id.includes('steel')) return 'T3';
  if (id.includes('iron')) return 'T2';
  if (id.includes('bronze')) return 'T1';
  
  const val = item?.sellValue ?? 0;
  if (val >= 5000) return 'T7';
  if (val >= 1000) return 'T6';
  if (val >= 350) return 'T5';
  if (val >= 120) return 'T4';
  if (val >= 40) return 'T3';
  if (val >= 15) return 'T2';
  return 'T1';
}

const CATEGORY_NAMES: Record<string, string> = {
  weapon: 'Оружие',
  helm: 'Шлем',
  platebody: 'Доспех',
  platelegs: 'Поножи',
  boots: 'Сапоги',
  gloves: 'Перчатки',
  amulet: 'Амулет',
  ring: 'Кольцо',
  bracelet: 'Браслет',
  belt: 'Пояс',
  shield: 'Щит',
  cape: 'Плащ',
  quiver: 'Колчан',
  food: 'Еда',
  cooked_fish: 'Готовая рыба',
  raw_fish: 'Сырая рыба',
  log: 'Древесина',
  ore: 'Руда',
  bar: 'Слиток',
  gem: 'Самоцвет',
  ash: 'Зола',
  potion: 'Зелье',
  misc: 'Материал',
  mineral: 'Минерал',
  foraging: 'Сбор',
};

interface UniversalInfoModalProps {
  itemId: string | null;
  onClose: () => void;
  /**
   * Режим просмотра из админ-каталога: показываем название/описание/статы,
   * но прячем игровые действия (запереть/надеть/съесть/продать).
   */
  readOnly?: boolean;
  /** Админ-режим: карточка становится редактируемой (имя/описание/цена/статы/тир/…). */
  adminEditable?: boolean;
}

export function UniversalInfoModal({ itemId, onClose, readOnly = false, adminEditable = false }: UniversalInfoModalProps) {
  const { t } = useTranslation();
  const isReadOnly = readOnly;

  const item = itemId ? getItem(itemId) : undefined;

  const slot = useInventoryStore(s => itemId ? s.getSlot(itemId) : undefined);
  const lockItem = useInventoryStore(s => s.lockItem);
  const sellItem = useInventoryStore(s => s.sellItem);
  const removeItem = useInventoryStore(s => s.removeItem);
  const addItem = useInventoryStore(s => s.addItem);
  
  const equipment = usePlayerStore(s => s.equipment);
  const equipItem = usePlayerStore(s => s.equipItem);
  const unequipItem = usePlayerStore(s => s.unequipItem);
  
  const eatFood = useCombatStore(s => s.eatFood);
  const playerHp = useCombatStore(s => s.playerHp);
  const playerMaxHp = useCombatStore(s => s.playerMaxHp);

  const [sellQty, setSellQty] = useState(1);

  if (!itemId || !item) return null;

  const quantity = isReadOnly ? 1 : slot?.quantity ?? 1;
  const isLocked = slot?.locked ?? false;
  const tier = getItemTier(itemId, item);
  const rarityKey = getItemRarity(itemId, item.sellValue, item.equipSlot, item.tier) as RarityType;
  const visual = getItemVisual(itemId);
  const categoryLabel = CATEGORY_NAMES[item.category] || item.category;

  const equippedSlot = item.equipSlot
    ? equipment[item.equipSlot] === itemId
      ? item.equipSlot
      : item.equipSlot === 'ring' && equipment.ring2 === itemId
        ? 'ring2'
        : item.equipSlot === 'bracelet' && equipment.bracelet2 === itemId
          ? 'bracelet2'
          : null
    : null;
  const isEquipped = Boolean(equippedSlot);

  const handleEquip = () => {
    if (!item.equipSlot) return;
    const oldItem = equipItem(itemId, item.equipSlot);
    removeItem(itemId, 1);
    if (oldItem) addItem(oldItem, 1);
    onClose();
  };

  const handleUnequip = () => {
    if (!item.equipSlot) return;
    const unequipped = unequipItem(item.equipSlot);
    if (unequipped) addItem(unequipped, 1);
    onClose();
  };

  const handleEat = () => {
    if (!item.healAmount) return;
    eatFood(itemId);
  };

  const handleSell = (qty: number) => {
    if (isLocked) return;
    sellItem(itemId, qty);
    if (qty >= quantity) {
      onClose();
    }
  };

  const currentSellPrice = (item.sellValue ?? 0) * Math.min(sellQty, quantity);
  const totalSellPrice = (item.sellValue ?? 0) * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200">
      <div
        className="fixed inset-0 [background:var(--modal-veil)] backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[360px] sm:max-w-[400px] [background:var(--glass-bg)] border [border-color:var(--glass-edge)] rounded-[var(--radius-sheet)] p-4 sm:p-5 [box-shadow:var(--glass-shadow)] [backdrop-filter:var(--glass-filter)] z-10 space-y-4 animate-in zoom-in-95 duration-200 max-h-[86vh] overflow-y-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2 border-b [border-color:var(--glass-edge)]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black text-[var(--ink-strong)] uppercase tracking-wider">
              {item.equipSlot ? 'Снаряжение' : 'Предмет'}
            </span>
            <TierBadge tier={tier} size="sm" />
            {isGearUnique(item) && <UniqueEmblem size="sm" />}
          </div>

          <div className="flex items-center gap-1">
            {!isReadOnly && (
              <button
                type="button"
                onClick={() => lockItem(itemId, !isLocked)}
                className={`p-2 rounded-xl transition-all active:scale-95 ${
                  isLocked
                    ? '[background:var(--badge-gold-bg)] text-[var(--text-gold)] border [border-color:var(--border-accent)] [box-shadow:var(--unique-glow)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:[background:var(--badge-gray-bg)] border border-transparent'
                }`}
                title={isLocked ? 'Заперто от продажи' : 'Запереть предмет'}
              >
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:[background:var(--badge-gray-bg)] transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Visual & Name Row */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-20 h-20 rounded-2xl border [border-color:var(--card-edge)] [background:var(--cell-frame)] flex items-center justify-center text-4xl shadow-inner shrink-0 overflow-hidden">
            {visual.type === 'image' ? (
              <img src={visual.value} alt={item.name} className="w-full h-full max-w-[80%] max-h-[80%] object-contain select-none pointer-events-none p-1" />
            ) : (
              <span className="drop-shadow-md">{visual.value}</span>
            )}
            {quantity > 1 && (
              <span className="absolute bottom-1.5 right-1.5 z-10 [background:var(--bg-header)] border [border-color:var(--border-accent)] text-[var(--text-gold)] font-mono text-[10px] font-black px-1.5 py-0.5 rounded leading-none shadow-md pointer-events-none">
                x{formatNumber(quantity)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <RarityBadge rarity={rarityKey} size="sm" />
            </div>
            <h2 className="text-base sm:text-lg font-display font-black text-[var(--ink-strong)] truncate">
              {item.name}
            </h2>
            <p className="text-xs text-[var(--ink-body)] font-medium">
              {categoryLabel}
            </p>
          </div>
        </div>

        {/* Stat Pill Badges — общий примитив шкалы таверны */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <StatPill
            icon={<Coins className="w-4 h-4" />}
            label="Цена за 1 шт."
            value={<CoinsDisplay amount={item.sellValue} size="xs" />}
            color="amber"
          />

          {typeof item.maxDurability === 'number' && item.maxDurability > 0 && (
            <StatPill
              icon={<Shield className="w-4 h-4" />}
              label="Прочность"
              value={`${item.maxDurability}/${item.maxDurability}`}
              color="amber"
            />
          )}

          {item.healAmount !== undefined && (
            <StatPill
              icon={<Heart className="w-4 h-4 fill-current" />}
              label="Лечение"
              value={`+${item.healAmount} ОЗ`}
              color="emerald"
            />
          )}

          {item.combatStats?.attackBonus !== undefined && item.combatStats.attackBonus > 0 && (
            <StatPill
              icon={<Sword className="w-4 h-4" />}
              label="Атака"
              value={`+${item.combatStats.attackBonus}`}
              color="rose"
            />
          )}

          {item.combatStats?.strengthBonus !== undefined && item.combatStats.strengthBonus > 0 && (
            <StatPill
              icon={<Zap className="w-4 h-4" />}
              label="Сила"
              value={`+${item.combatStats.strengthBonus}`}
              color="emerald"
            />
          )}

          {item.combatStats?.defenceBonus !== undefined && item.combatStats.defenceBonus > 0 && (
            <StatPill
              icon={<Shield className="w-4 h-4" />}
              label="Защита"
              value={`+${item.combatStats.defenceBonus}`}
              color="blue"
            />
          )}
        </div>

        {/* Description Text */}
        <p className="text-xs text-[var(--ink-body)] italic [background:var(--card-cocoa-deep)] p-2.5 rounded-xl border [border-color:var(--card-edge)] leading-relaxed">
          {item.description ?? 'Классический предмет средневекового мира.'}
        </p>

        {/* ── Админ-редактор предмета ─────────────────────────── */}
        {adminEditable && (
          <div style={{ borderTop: '1px solid var(--glass-edge)', paddingTop: 10 }}>
            <AdminItemEditor itemId={itemId} />
          </div>
        )}

        {/* Action Controls Section */}
        {!isReadOnly && (
        <div className="space-y-2 pt-2 border-t [border-color:var(--glass-edge)]">

          {item.equipSlot && (
            <button
              type="button"
              onClick={isEquipped ? handleUnequip : handleEquip}
              className={`w-full py-3 rounded-2xl font-extrabold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 border ${
                isEquipped
                  ? '[background:var(--btn-secondary)] hover:brightness-110 text-[var(--badge-red-ink)] [border-color:var(--badge-red-edge)]'
                  : '[background:var(--btn-primary)] hover:brightness-110 text-[var(--btn-primary-ink)] [border-color:var(--btn-primary-edge)] [box-shadow:var(--btn-primary-shadow)]'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>{isEquipped ? 'Снять снаряжение' : 'Надеть предмет'}</span>
            </button>
          )}

          {item.healAmount !== undefined && (
            <button
              type="button"
              onClick={handleEat}
              disabled={playerHp >= playerMaxHp}
              className="w-full py-3 rounded-2xl [background:var(--btn-secondary)] hover:brightness-110 text-[var(--badge-green-ink)] border [border-color:var(--accent-emerald)] font-extrabold text-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Utensils className="w-4 h-4" />
              <span>Съесть (+{item.healAmount} ОЗ)</span>
            </button>
          )}

          {item.canSell && (
            <div className="space-y-2">
              {isLocked ? (
                <div className="w-full p-2.5 [background:var(--badge-gold-bg)] border [border-color:var(--tag-gold-edge)] rounded-2xl text-center">
                  <span className="text-xs font-mono font-bold text-[var(--text-gold)] flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Заперто — продажа заблокирована
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    {quantity > 1 && (
                      <div className="flex items-center [background:var(--field-bg)] border [border-color:var(--card-edge)] rounded-2xl p-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSellQty(Math.max(1, sellQty - 1))}
                          className="w-8 h-8 rounded-xl [background:var(--btn-secondary)] hover:brightness-125 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] active:scale-90"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center font-mono text-xs font-black text-[var(--text-gold)]">
                          {sellQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSellQty(Math.min(quantity, sellQty + 1))}
                          className="w-8 h-8 rounded-xl [background:var(--btn-secondary)] hover:brightness-125 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] active:scale-90"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSell(sellQty)}
                      className="flex-1 py-3 px-4 rounded-2xl [background:var(--btn-secondary)] hover:brightness-110 text-[var(--text-gold)] border [border-color:var(--tag-gold-edge)] font-extrabold text-xs transition-all active:scale-95 flex items-center justify-between"
                    >
                      <span>Продать {quantity > 1 ? `(${sellQty} шт.)` : ''}</span>
                      <CoinsDisplay amount={currentSellPrice} size="xs" />
                    </button>
                  </div>

                  {quantity > 1 && (
                    <button
                      type="button"
                      onClick={() => handleSell(quantity)}
                      className="w-full py-2.5 rounded-2xl bg-transparent border [border-color:var(--card-edge)] hover:[border-color:var(--border-accent)] text-[var(--text-muted)] hover:text-[var(--text-gold)] font-bold text-xs transition-all active:scale-95 flex items-center justify-between px-4 font-mono"
                    >
                      <span>Продать всё (x{formatNumber(quantity)})</span>
                      <CoinsDisplay amount={totalSellPrice} size="xs" />
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-transparent hover:[background:var(--badge-gray-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-semibold transition-all active:scale-95"
          >
            Закрыть
          </button>

        </div>
        )}

        {/* Читаем из админки: нет игровых действий, только кнопка закрыть */}
        {isReadOnly && (
          <div className="space-y-2 pt-2 border-t [border-color:var(--glass-edge)]">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl bg-transparent hover:[background:var(--badge-gray-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-semibold transition-all active:scale-95"
            >
              Закрыть
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
