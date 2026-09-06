import React, { useEffect, useState } from 'react';
import { getItem, getAdminItem } from '@/domain/items';
import { useAdminConfigStore, type ItemOverride } from '@/store/adminConfigStore';
import type { Item, EquipSlot, ItemCategory } from '@/data/types';
import { useInventoryStore } from '@/store/inventoryStore';
import { usePlayerStore } from '@/store/playerStore';
import { useCombatStore } from '@/store/combatStore';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { getItemRarity } from '@/features/bank/ItemIcon';
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
  // Тир — данное поле каталога (1..12). Ниже — эвристика только для легаси
  // предметов без поля `tier` (исчезнет по мере переноса семейств в каталог).
  if (item?.tier) return `T${item.tier}`;
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
  common:    { label: 'Обычный',     text: 'text-stone-300', bg: 'bg-stone-800/80', dot: 'bg-stone-400', border: 'border-stone-700' },
  uncommon:  { label: 'Необычный',   text: 'text-emerald-400', bg: 'bg-emerald-950/50', dot: 'bg-emerald-400', border: 'border-emerald-600/50' },
  rare:      { label: 'Редкий',      text: 'text-blue-400', bg: 'bg-blue-950/50', dot: 'bg-blue-400', border: 'border-blue-600/50' },
  epic:      { label: 'Эпический',   text: 'text-purple-400', bg: 'bg-purple-950/50', dot: 'bg-purple-400', border: 'border-purple-600/50' },
  legendary: { label: 'Легендарный', text: 'text-amber-400', bg: 'bg-amber-950/50', dot: 'bg-amber-400', border: 'border-amber-600/50' },
  mythic:    { label: 'Мифический',  text: 'text-rose-400', bg: 'bg-rose-950/50', dot: 'bg-rose-400', border: 'border-rose-600/50' },
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
  mineral: 'Минерал',
  foraging: 'Сбор',
};

const CATEGORY_OPTIONS: ItemCategory[] = [
  'weapon', 'helm', 'platebody', 'platelegs', 'boots', 'gloves',
  'amulet', 'ring', 'bracelet', 'belt', 'shield', 'cape',
  'food', 'herb', 'seed', 'bar', 'ore', 'log', 'rune',
  'potion', 'raw_fish', 'cooked_fish', 'gem', 'misc', 'bone', 'ash', 'arrow', 'tablet',
  'mineral', 'foraging',
];

const EQUIP_SLOT_OPTIONS: (EquipSlot | '')[] = [
  '', 'helm', 'platebody', 'platelegs', 'boots', 'gloves',
  'amulet', 'ring', 'ring2', 'bracelet', 'bracelet2', 'belt',
  'weapon', 'shield', 'cape', 'quiver', 'passive',
];

interface AdminEditState {
  name: string;
  description: string;
  category: ItemCategory;
  tier: string;
  sellValue: string;
  buyValue: string;
  canSell: boolean;
  stackable: boolean;
  healAmount: string;
  equipSlot: string;
  twoHanded: boolean;
  icon: string;
  iconPath: string;
  attackBonus: string;
  strengthBonus: string;
  defenceBonus: string;
  rangedAttackBonus: string;
  rangedStrengthBonus: string;
  magicAttackBonus: string;
  magicDamageBonus: string;
  prayerBonus: string;
}

const toStr = (v: number | undefined): string => (v === undefined || Number.isNaN(v) ? '' : String(v));
const toOptNum = (v: string): number | undefined => {
  const n = Number(v);
  return v.trim() === '' || !Number.isFinite(n) ? undefined : n;
};

function adminEditInitial(item?: Item): AdminEditState {
  const cs = item?.combatStats;
  return {
    name: item?.name ?? '',
    description: item?.description ?? '',
    category: item?.category ?? 'misc',
    tier: item?.tier ? String(item.tier) : '',
    sellValue: toStr(item?.sellValue ?? 0),
    buyValue: toStr(item?.buyValue),
    canSell: item?.canSell ?? false,
    stackable: item?.stackable ?? false,
    healAmount: toStr(item?.healAmount),
    equipSlot: item?.equipSlot ?? '',
    twoHanded: item?.twoHanded ?? false,
    icon: item?.icon ?? '',
    iconPath: item?.iconPath ?? '',
    attackBonus: toStr(cs?.attackBonus),
    strengthBonus: toStr(cs?.strengthBonus),
    defenceBonus: toStr(cs?.defenceBonus),
    rangedAttackBonus: toStr(cs?.rangedAttackBonus),
    rangedStrengthBonus: toStr(cs?.rangedStrengthBonus),
    magicAttackBonus: toStr(cs?.magicAttackBonus),
    magicDamageBonus: toStr(cs?.magicDamageBonus),
    prayerBonus: toStr(cs?.prayerBonus),
  };
}

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

  const updateItemOverride = useAdminConfigStore(s => s.updateItemOverride);
  const resetItemOverride = useAdminConfigStore(s => s.resetItemOverride);

  const [editOpen, setEditOpen] = useState(adminEditable);
  const [editForm, setEditForm] = useState<AdminEditState>(() => adminEditInitial(undefined));

  const item = itemId ? getItem(itemId) : undefined;
  const editorItem = itemId ? getAdminItem(itemId) : undefined;

  useEffect(() => {
    if (!itemId) {
      setEditForm(adminEditInitial(undefined));
      return;
    }
    setEditForm(adminEditInitial(getAdminItem(itemId) ?? getItem(itemId)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

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

  const itemOverrides = useAdminConfigStore(s => s.itemOverrides);
  const hasOverride = Boolean(itemId && itemOverrides[itemId]);

  const setField = <K extends keyof AdminEditState>(key: K, value: AdminEditState[K]) => {
    setEditForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!itemId) return;

    const combatStats: ItemOverride['combatStats'] = {};
    type AdminNumericField = 'attackBonus' | 'strengthBonus' | 'defenceBonus' | 'rangedAttackBonus' | 'rangedStrengthBonus' | 'magicAttackBonus' | 'magicDamageBonus' | 'prayerBonus';
    const combatFields: [AdminNumericField, keyof NonNullable<ItemOverride['combatStats']>][] = [
      ['attackBonus', 'attackBonus'],
      ['strengthBonus', 'strengthBonus'],
      ['defenceBonus', 'defenceBonus'],
      ['rangedAttackBonus', 'rangedAttackBonus'],
      ['rangedStrengthBonus', 'rangedStrengthBonus'],
      ['magicAttackBonus', 'magicAttackBonus'],
      ['magicDamageBonus', 'magicDamageBonus'],
      ['prayerBonus', 'prayerBonus'],
    ];
    for (const [formKey, statKey] of combatFields) {
      const value = toOptNum(editForm[formKey]);
      if (value !== undefined) combatStats[statKey] = value;
    }

    const tier = toOptNum(editForm.tier);
    const patch: ItemOverride = {
      name: editForm.name.trim(),
      description: editForm.description.trim(),
      category: editForm.category,
      tier: tier !== undefined && tier >= 1 && tier <= 12 ? Math.round(tier) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 : undefined,
      sellValue: toOptNum(editForm.sellValue),
      buyValue: toOptNum(editForm.buyValue),
      canSell: editForm.canSell,
      stackable: editForm.stackable,
      healAmount: toOptNum(editForm.healAmount),
      equipSlot: editForm.equipSlot ? editForm.equipSlot as EquipSlot : undefined,
      twoHanded: editForm.twoHanded,
      icon: editForm.icon.trim(),
      iconPath: editForm.iconPath.trim(),
      combatStats: Object.keys(combatStats).length > 0 ? combatStats : undefined,
    };

    updateItemOverride(itemId, patch);
    setEditOpen(false);
  };

  const handleReset = () => {
    if (!itemId) return;
    resetItemOverride(itemId);
    setEditForm(adminEditInitial(editorItem ?? item));
    setEditOpen(false);
  };

  const editFieldStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-slot)',
    border: '1px solid var(--border-default)',
    borderRadius: 10,
    padding: '7px 9px',
    fontSize: 12,
    color: 'var(--text-primary)',
    fontFamily: 'var(--app-font-mono)',
    outline: 'none',
  };

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
            {!isReadOnly && (
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
            )}

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
          <div className="relative w-20 h-20 rounded-2xl border border-stone-700/80 bg-stone-950/80 flex items-center justify-center text-4xl shadow-inner shrink-0 overflow-hidden">
            {visual.type === 'image' ? (
              <img src={visual.value} alt={item.name} className="w-full h-full max-w-[80%] max-h-[80%] object-contain select-none pointer-events-none p-1" />
            ) : (
              <span className="drop-shadow-md">{visual.value}</span>
            )}
            {quantity > 1 && (
              <span className="absolute bottom-1.5 right-1.5 z-10 bg-stone-950/95 border border-amber-500/70 text-amber-300 font-mono text-[10px] font-black px-1.5 py-0.5 rounded leading-none shadow-md pointer-events-none">
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

        {/* ── Админ-редактор предмета ─────────────────────────── */}
        {adminEditable && (
          <div className="space-y-2 pt-2 border-t border-amber-500/20">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setEditOpen(v => !v)}
                className="flex-1 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-extrabold text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {editOpen ? 'Скрыть редактор' : 'Редактировать предмет'}
              </button>
              {hasOverride && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="shrink-0 py-2.5 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 font-bold text-xs transition-all active:scale-95"
                >
                  Сбросить правки
                </button>
              )}
            </div>

            {editOpen && (
              <div className="space-y-2 rounded-2xl bg-stone-950/60 border border-stone-800 p-3">
                <div className="grid grid-cols-2 gap-2">
                  <label className="col-span-2 text-[10px] font-mono text-stone-500 flex items-center gap-1">
                    ID: <span className="text-amber-300">{item.id}</span>
                    <span className="text-stone-600">(не редактируется)</span>
                  </label>

                  <label className="col-span-2 space-y-1">
                    <span className="text-[10px] font-mono text-stone-500 uppercase">Название</span>
                    <input type="text" value={editForm.name} onChange={e => setField('name', e.target.value)} style={editFieldStyle} />
                  </label>

                  <label className="col-span-2 space-y-1">
                    <span className="text-[10px] font-mono text-stone-500 uppercase">Описание</span>
                    <textarea value={editForm.description} onChange={e => setField('description', e.target.value)} rows={3} style={{ ...editFieldStyle, resize: 'vertical' }} />
                  </label>

                  <label className="space-y-1">
                    <span className="text-[10px] font-mono text-stone-500 uppercase">Категория</span>
                    <select value={editForm.category} onChange={e => setField('category', e.target.value as ItemCategory)} style={editFieldStyle}>
                      {CATEGORY_OPTIONS.map(cat => <option key={cat} value={cat}>{CATEGORY_NAMES[cat] ?? cat}</option>)}
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="text-[10px] font-mono text-stone-500 uppercase">Тир (1–12)</span>
                    <input type="number" min={1} max={12} value={editForm.tier} onChange={e => setField('tier', e.target.value)} style={editFieldStyle} />
                  </label>

                  <label className="space-y-1">
                    <span className="text-[10px] font-mono text-stone-500 uppercase">Цена продажи</span>
                    <input type="number" min={0} value={editForm.sellValue} onChange={e => setField('sellValue', e.target.value)} style={editFieldStyle} />
                  </label>

                  <label className="space-y-1">
                    <span className="text-[10px] font-mono text-stone-500 uppercase">Цена покупки</span>
                    <input type="number" min={0} value={editForm.buyValue} onChange={e => setField('buyValue', e.target.value)} style={editFieldStyle} />
                  </label>

                  <label className="space-y-1">
                    <span className="text-[10px] font-mono text-stone-500 uppercase">Лечение (ОЗ)</span>
                    <input type="number" min={0} value={editForm.healAmount} onChange={e => setField('healAmount', e.target.value)} style={editFieldStyle} />
                  </label>

                  <label className="space-y-1">
                    <span className="text-[10px] font-mono text-stone-500 uppercase">Слот</span>
                    <select value={editForm.equipSlot} onChange={e => setField('equipSlot', e.target.value)} style={editFieldStyle}>
                      {EQUIP_SLOT_OPTIONS.map(slot => <option key={slot} value={slot}>{slot ? slot : '— не экипируется —'}</option>)}
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="text-[10px] font-mono text-stone-500 uppercase">Иконка (эмодзи)</span>
                    <input type="text" value={editForm.icon} onChange={e => setField('icon', e.target.value)} style={editFieldStyle} />
                  </label>

                  <label className="space-y-1">
                    <span className="text-[10px] font-mono text-stone-500 uppercase">Путь иконки</span>
                    <input type="text" value={editForm.iconPath} onChange={e => setField('iconPath', e.target.value)} style={editFieldStyle} />
                  </label>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <label className="flex items-center gap-1.5 text-[11px] text-stone-400">
                    <input type="checkbox" checked={editForm.canSell} onChange={e => setField('canSell', e.target.checked)} className="accent-amber-500" /> продаётся
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-stone-400">
                    <input type="checkbox" checked={editForm.stackable} onChange={e => setField('stackable', e.target.checked)} className="accent-amber-500" /> стакается
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-stone-400">
                    <input type="checkbox" checked={editForm.twoHanded} onChange={e => setField('twoHanded', e.target.checked)} className="accent-amber-500" /> двуручное
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {([
                    ['attackBonus', 'Атака'],
                    ['strengthBonus', 'Сила'],
                    ['defenceBonus', 'Защита'],
                    ['rangedAttackBonus', 'Дальний урон'],
                    ['rangedStrengthBonus', 'Дальн. сила'],
                    ['magicAttackBonus', 'Маг. урон'],
                    ['magicDamageBonus', 'Маг. бонус'],
                    ['prayerBonus', 'Молитва'],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="space-y-1">
                      <span className="text-[10px] font-mono text-stone-500 uppercase">{label}</span>
                      <input type="number" value={editForm[key]} onChange={e => setField(key, e.target.value)} style={editFieldStyle} />
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-extrabold text-xs transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                >
                  Сохранить правки
                </button>
              </div>
            )}
          </div>
        )}

        {/* Action Controls Section */}
        {!isReadOnly && (
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
        )}

        {/* Читаем из админки: нет игровых действий, только кнопка закрыть */}
        {isReadOnly && (
          <div className="space-y-2 pt-2 border-t border-stone-800/80">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl bg-stone-950 hover:bg-stone-800 text-stone-500 hover:text-stone-200 text-xs font-semibold transition-all active:scale-95"
            >
              Закрыть
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
