import React, { useState } from 'react';
import { getItem } from '@/data/items';
import type { Item, EquipSlot } from '@/data/types';
import { useInventoryStore } from '@/store/inventoryStore';
import { usePlayerStore } from '@/store/playerStore';
import { useCombatStore } from '@/store/combatStore';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { getItemRarity } from '@/components/ItemIcon';
import { formatNumber } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { CoinsDisplay } from '@/shared/ui/CoinsDisplay';
import { 
  X, 
  Lock, 
  Unlock, 
  Coins, 
  Heart, 
  Sword, 
  Shield, 
  Zap, 
  Sparkles, 
  Minus, 
  Plus, 
  Utensils 
} from 'lucide-react';

export function getItemTier(itemId: string, item?: Item): string {
  const id = itemId.toLowerCase();
  if (id.includes('dragon') || id.includes('redwood') || id.includes('whale') || id.includes('manta')) return 'T7';
  if (id.includes('runite') || id.includes('magic_logs') || id.includes('shark')) return 'T6';
  if (id.includes('adamantite') || id.includes('mahogany') || id.includes('swordfish') || id.includes('crab')) return 'T5';
  if (id.includes('mithril') || id.includes('maple') || id.includes('lobster') || id.includes('gold_bar')) return 'T4';
  if (id.includes('steel') || id.includes('willow') || id.includes('salmon') || id.includes('mackerel')) return 'T3';
  if (id.includes('iron') || id.includes('oak') || id.includes('trout') || id.includes('sardine')) return 'T2';
  if (id.includes('bronze') || id.includes('normal_logs') || id.includes('copper') || id.includes('tin') || id.includes('shrimp')) return 'T1';
  
  const val = item?.sellValue ?? 0;
  if (val >= 5000) return 'T7';
  if (val >= 1000) return 'T6';
  if (val >= 350) return 'T5';
  if (val >= 120) return 'T4';
  if (val >= 40) return 'T3';
  if (val >= 15) return 'T2';
  return 'T1';
}

const RARITY_NAMES: Record<string, { label: string; text: string; bg: string; dot: string; border: string }> = {
  common:    { label: 'Обычный',     text: 'text-stone-300', bg: 'bg-stone-800/80', dot: 'bg-slate-400', border: 'border-stone-700' },
  uncommon:  { label: 'Необычный',   text: 'text-emerald-400', bg: 'bg-emerald-100/80', dot: 'bg-emerald-400', border: 'border-emerald-500/40' },
  rare:      { label: 'Редкий',      text: 'text-blue-400', bg: 'bg-blue-50', dot: 'bg-blue-400', border: 'border-blue-500/40' },
  epic:      { label: 'Эпический',   text: 'text-purple-400', bg: 'bg-purple-50', dot: 'bg-purple-400', border: 'border-purple-500/40' },
  legendary: { label: 'Легендарный', text: 'text-amber-400', bg: 'bg-amber-50', dot: 'bg-amber-400', border: 'border-amber-500/40' },
  mythic:    { label: 'Мифический',  text: 'text-rose-400', bg: 'bg-rose-950/40', dot: 'bg-rose-400', border: 'border-rose-500/40' },
};

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
};

interface UniversalInfoModalProps {
  itemId: string | null;
  onClose: () => void;
}

export function UniversalInfoModal({ itemId, onClose }: UniversalInfoModalProps) {
  const { t } = useTranslation();
  
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

  if (!itemId) return null;
  const item = getItem(itemId);
  if (!item) return null;

  const quantity = slot?.quantity ?? 1;
  const isLocked = slot?.locked ?? false;
  const tier = getItemTier(itemId, item);
  const rarityKey = getItemRarity(itemId, item.sellValue, item.equipSlot);
  const rarity = RARITY_NAMES[rarityKey] || RARITY_NAMES.common;
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
        className="fixed inset-0 bg-stone-950/80 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm sm:max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-2xl z-10 space-y-4 animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black text-stone-300 uppercase tracking-wider">
              {item.equipSlot ? 'Снаряжение' : 'Предмет'}
            </span>
            <span className="text-[10px] font-mono font-extrabold bg-stone-800 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
              {tier}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => lockItem(itemId, !isLocked)}
              className={`p-2 rounded-xl transition-all active:scale-95 ${
                isLocked 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                  : 'text-stone-500 hover:text-stone-200 hover:bg-stone-800 border border-transparent'
              }`}
              title={isLocked ? 'Заперто от продажи' : 'Запереть предмет'}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-500 hover:text-white hover:bg-stone-800 transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Visual & Name Row */}
        <div className="flex items-center gap-3.5">
          <div className={`relative w-20 h-20 rounded-2xl border-2 flex items-center justify-center text-4xl shadow-inner shrink-0 overflow-hidden ${rarity.bg} ${rarity.border}`}>
            {visual.type === 'image' ? (
              <img src={visual.value} alt={item.name} className="w-full h-full max-w-[85%] max-h-[85%] object-contain select-none pointer-events-none p-1" />
            ) : (
              <span className="drop-shadow-md">{visual.value}</span>
            )}
            {quantity > 1 && (
              <span className="absolute -bottom-1 -right-1 bg-[var(--bg-slot)] border border-amber-400/50 text-amber-300 font-mono text-[10px] font-black px-1.5 py-0.2 rounded-full shadow">
                x{formatNumber(quantity)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full border ${rarity.bg} ${rarity.text} ${rarity.border}`}>
                {rarity.label}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-display font-black text-stone-100 truncate">
              {item.name}
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {categoryLabel}
            </p>
          </div>
        </div>

        {/* Stat Pill Badges */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-2.5 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-stone-500 font-mono uppercase font-bold">Цена за 1 шт.</div>
              <CoinsDisplay amount={item.sellValue} size="xs" />
            </div>
          </div>

          {item.healAmount !== undefined && (
            <div className="bg-stone-950/80 border border-emerald-500/30 rounded-2xl p-2.5 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <div>
                <div className="text-[10px] text-emerald-400 font-mono uppercase font-bold">Лечение</div>
                <div className="text-xs font-mono font-black text-emerald-300">+{item.healAmount} ОЗ</div>
              </div>
            </div>
          )}

          {item.combatStats?.attackBonus !== undefined && item.combatStats.attackBonus > 0 && (
            <div className="bg-stone-950/80 border border-rose-500/30 rounded-2xl p-2.5 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <Sword className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-rose-400 font-mono uppercase font-bold">Атака</div>
                <div className="text-xs font-mono font-black text-rose-300">+{item.combatStats.attackBonus}</div>
              </div>
            </div>
          )}

          {item.combatStats?.strengthBonus !== undefined && item.combatStats.strengthBonus > 0 && (
            <div className="bg-stone-950/80 border border-emerald-500/30 rounded-2xl p-2.5 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-emerald-400 font-mono uppercase font-bold">Сила</div>
                <div className="text-xs font-mono font-black text-emerald-300">+{item.combatStats.strengthBonus}</div>
              </div>
            </div>
          )}

          {item.combatStats?.defenceBonus !== undefined && item.combatStats.defenceBonus > 0 && (
            <div className="bg-stone-950/80 border border-blue-500/30 rounded-2xl p-2.5 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-blue-400 font-mono uppercase font-bold">Защита</div>
                <div className="text-xs font-mono font-black text-blue-300">+{item.combatStats.defenceBonus}</div>
              </div>
            </div>
          )}
        </div>

        {/* Description Text */}
        <p className="text-xs text-stone-500 italic bg-stone-950/40 p-2.5 rounded-xl border border-stone-800/60 leading-relaxed">
          {item.description ?? 'Классический предмет средневекового мира.'}
        </p>

        {/* Action Controls Section */}
        <div className="space-y-2 pt-2 border-t border-stone-800/80">
          
          {item.equipSlot && (
            <button
              type="button"
              onClick={isEquipped ? handleUnequip : handleEquip}
              className={`w-full py-3 rounded-2xl font-extrabold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg ${
                isEquipped
                  ? 'bg-stone-800 hover:bg-slate-700 text-rose-300 border border-rose-500/40'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
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
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-extrabold text-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
            >
              <Utensils className="w-4 h-4" />
              <span>Съесть (+{item.healAmount} ОЗ)</span>
            </button>
          )}

          {item.canSell && (
            <div className="space-y-2">
              {isLocked ? (
                <div className="w-full p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center">
                  <span className="text-xs font-mono font-bold text-amber-300 flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Заперто — продажа заблокирована
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    {quantity > 1 && (
                      <div className="flex items-center bg-stone-950 border border-stone-800 rounded-2xl p-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSellQty(Math.max(1, sellQty - 1))}
                          className="w-8 h-8 rounded-xl bg-stone-900 hover:bg-stone-800 flex items-center justify-center text-stone-300 active:scale-90"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center font-mono text-xs font-black text-amber-300">
                          {sellQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSellQty(Math.min(quantity, sellQty + 1))}
                          className="w-8 h-8 rounded-xl bg-stone-900 hover:bg-stone-800 flex items-center justify-center text-stone-300 active:scale-90"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSell(sellQty)}
                      className="flex-1 py-3 px-4 rounded-2xl bg-stone-800/90 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-extrabold text-xs transition-all active:scale-95 flex items-center justify-between"
                    >
                      <span>Продать {quantity > 1 ? `(${sellQty} шт.)` : ''}</span>
                      <CoinsDisplay amount={currentSellPrice} size="xs" />
                    </button>
                  </div>

                  {quantity > 1 && (
                    <button
                      type="button"
                      onClick={() => handleSell(quantity)}
                      className="w-full py-2.5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-amber-500/40 text-stone-300 hover:text-amber-300 font-bold text-xs transition-all active:scale-95 flex items-center justify-between px-4 font-mono"
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
            className="w-full py-2.5 rounded-2xl bg-stone-950 hover:bg-stone-800 text-stone-500 hover:text-stone-200 text-xs font-semibold transition-all active:scale-95"
          >
            Закрыть
          </button>

        </div>

      </div>
    </div>
  );
}
