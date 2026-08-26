import React from 'react';
import { useBankStore } from '@/store/bankStore';
import { ItemIcon } from '@/components/ItemIcon';
import { ItemInfoPopover } from '@/components/ItemInfoPopover';
import { getItem } from '@/data/items';
import { Search, Coins, Lock, Sparkles, Package, ArrowUpDown, Shield } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { usePlayerStore } from '@/store/playerStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'wouter';

export function InventoryPage() {
  const { t } = useTranslation();
  
  const getFilteredItems = useBankStore(s => s.getFilteredItems);
  const items = useBankStore(s => s.items);
  const gp = useBankStore(s => s.gp);
  const maxSlots = useBankStore(s => s.maxSlots);
  const searchQuery = useBankStore(s => s.searchQuery);
  const setSearch = useBankStore(s => s.setSearch);
  const sortMode = useBankStore(s => s.sortMode);
  const setSort = useBankStore(s => s.setSort);
  const sellItem = useBankStore(s => s.sellItem);
  const removeItem = useBankStore(s => s.removeItem);
  const addItem = useBankStore(s => s.addItem);
  const activeCategory = useBankStore(s => s.activeCategory);
  const setCategory = useBankStore(s => s.setCategory);
  
  const equipItem = usePlayerStore(s => s.equipItem);

  const filteredItems = getFilteredItems();
  const totalItems = items.filter(i => i.quantity > 0).length;

  const handleSell = (itemId: string, qty: number) => {
    const slot = useBankStore.getState().getSlot(itemId);
    if (slot?.locked) return;
    sellItem(itemId, qty);
  };

  const handleEquip = (itemId: string) => {
    const item = getItem(itemId);
    if (item && item.equipSlot) {
      const oldEquip = equipItem(itemId, item.equipSlot);
      removeItem(itemId, 1);
      if (oldEquip) addItem(oldEquip, 1);
    }
  };

  const SORT_MODES = [
    { key: 'default',  label: t('inventory.sort.default') },
    { key: 'name',     label: t('inventory.sort.name') },
    { key: 'value',    label: t('inventory.sort.value') },
    { key: 'quantity', label: t('inventory.sort.quantity') },
  ] as const;

  const CATEGORIES = [
    { key: 'all',       label: t('inventory.category.all') || 'All Items', icon: '📦' },
    { key: 'equipment', label: t('inventory.category.equipment') || 'Gear', icon: '⚔️' },
    { key: 'resources', label: t('inventory.category.resources') || 'Materials', icon: '🪵' },
    { key: 'food',      label: t('inventory.category.food') || 'Food',      icon: '🍖' },
    { key: 'misc',      label: t('inventory.category.misc') || 'Misc',      icon: '✨' },
  ] as const;

  const isFull = totalItems >= maxSlots;
  const capacityPct = Math.min(100, (totalItems / maxSlots) * 100);

  return (
    <div className="space-y-4">
      
      {/* Header Banner */}
      <div className="fantasy-card border-amber-500/30 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 via-sky-500/10 to-indigo-950 rounded-2xl flex items-center justify-center text-3xl border border-amber-500/30 shadow-inner shrink-0">
            🎒
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-display font-black text-slate-100">{t('inventory.title')}</h1>
              <Link
                href="/bank"
                className="inline-flex items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-mono font-bold text-amber-300 transition-colors hover:bg-amber-500/20 active:scale-95"
              >
                <Coins className="h-3 w-3 text-amber-400" />
                {t('nav.bank')}
              </Link>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-black text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)] mt-0.5">
              {formatNumber(gp)} <span className="text-xs text-amber-400/80 font-bold">{t('inventory.gp')}</span>
            </div>
          </div>
        </div>

        {/* Capacity Meter */}
        <div className={`border p-3 sm:px-4 sm:py-2.5 rounded-2xl shadow-inner text-center w-full sm:w-auto transition-all ${
          isFull 
            ? 'bg-red-500/15 border-red-500/50 text-red-300 animate-pulse' 
            : 'bg-slate-950/80 border-slate-800'
        }`}>
          <div className="flex items-center justify-between sm:justify-center gap-2 text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold mb-1">
            <span>{t('inventory.slots')}</span>
            <span>{totalItems} / {maxSlots}</span>
          </div>
          <div className="w-full sm:w-36 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                isFull ? 'bg-red-500' : capacityPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${capacityPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setCategory(key as any)}
            className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 ${
              activeCategory === key
                ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'fantasy-card text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Search & Sort Row */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={t('ui.search') + '...'}
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl focus:outline-none focus:border-amber-500/60 text-slate-200 text-xs font-medium placeholder:text-slate-500 transition-colors"
          />
        </div>

        <div className="flex gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 overflow-x-auto shrink-0">
          {SORT_MODES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSort(key as any)}
              className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider transition-all active:scale-95 ${
                sortMode === key
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Item Slot Grid */}
      <div className="fantasy-card p-3.5 sm:p-5 rounded-3xl min-h-[360px]">
        {filteredItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
            <div className="text-5xl mb-3 opacity-30">🎒</div>
            <p className="font-bold text-sm text-slate-300">{t('inventory.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2.5 sm:gap-3">
            {filteredItems.map(slot => {
              const item = getItem(slot.itemId);
              if (!item) return null;
              return (
                <div key={slot.itemId} className="relative flex flex-col items-center group">
                  {slot.locked && (
                    <div className="absolute top-1 right-1 z-20 w-4 h-4 bg-amber-500/90 rounded-full flex items-center justify-center shadow-md">
                      <Lock className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
                    </div>
                  )}
                  <ItemInfoPopover
                    itemId={slot.itemId}
                    quantity={slot.quantity}
                    actions={
                      <div className="flex flex-col gap-1.5 min-w-[140px] pt-1">
                        {item.equipSlot && !slot.locked && (
                          <button
                            type="button"
                            onClick={() => handleEquip(slot.itemId)}
                            className="rounded-xl px-3 py-2 text-left text-xs font-bold bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 transition-colors active:scale-95 flex items-center gap-1.5"
                          >
                            <Shield className="w-3.5 h-3.5" />
                            {t('inventory.equip')}
                          </button>
                        )}
                        {item.canSell && !slot.locked && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSell(slot.itemId, 1)}
                              className="rounded-xl px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-900 hover:text-amber-300 transition-colors active:scale-95 font-mono"
                            >
                              {t('inventory.sell1')} ({formatNumber(item.sellValue)} GP)
                            </button>
                            {slot.quantity > 1 && (
                              <button
                                type="button"
                                onClick={() => handleSell(slot.itemId, slot.quantity)}
                                className="rounded-xl px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-900 hover:text-amber-300 transition-colors active:scale-95 font-mono"
                              >
                                {t('inventory.sellAll')} ({formatNumber(item.sellValue * slot.quantity)} GP)
                              </button>
                            )}
                          </>
                        )}
                        {slot.locked && (
                          <p className="text-[10px] text-amber-400 font-mono font-bold text-center py-1 bg-amber-500/10 rounded-lg">
                            🔒 {t('inventory.locked') || 'Locked — Protected from sale'}
                          </p>
                        )}
                      </div>
                    }
                  >
                    <button
                      type="button"
                      aria-label={item.name}
                      className="rounded-2xl transition-all duration-200 active:scale-95 hover:scale-105"
                    >
                      <ItemIcon
                        itemId={slot.itemId}
                        quantity={slot.quantity}
                        size="lg"
                        showTooltip={false}
                        className="aspect-square h-auto w-full cursor-pointer"
                      />
                    </button>
                  </ItemInfoPopover>
                  <span className="text-[10px] text-slate-400 font-medium truncate w-full text-center px-0.5 block mt-1 leading-tight group-hover:text-slate-200">
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
