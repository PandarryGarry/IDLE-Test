import React from 'react';
import { useBankStore } from '@/store/bankStore';
import { ItemIcon } from '@/components/ItemIcon';
import { ItemInfoPopover } from '@/components/ItemInfoPopover';
import { getItem } from '@/data/items';
import { Search, Coins, Lock } from 'lucide-react';
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
    // Проверяем, не заблокирован ли предмет
    const slot = useBankStore.getState().getSlot(itemId);
    if (slot?.locked) {
      return; // Заблокированные предметы нельзя продавать
    }
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
    { key: 'all',       label: t('inventory.category.all'),       icon: '📦' },
    { key: 'equipment', label: t('inventory.category.equipment'), icon: '⚔️' },
    { key: 'resources', label: t('inventory.category.resources'), icon: '🪵' },
    { key: 'food',      label: t('inventory.category.food'),      icon: '🍖' },
    { key: 'misc',      label: t('inventory.category.misc'),      icon: '✨' },
  ] as const;

  const isFull = totalItems >= maxSlots;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-card border border-border p-4 md:p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-12 h-12 shrink-0 bg-sky-500/10 rounded-xl flex items-center justify-center text-3xl border border-sky-500/20 shadow-inner">
            🎒
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-foreground">{t('inventory.title')}</h1>
              <Link
                href="/bank"
                className="inline-flex items-center gap-1 rounded-md border border-amber-400/20 bg-amber-400/5 px-2 py-1 min-h-[32px] text-[10px] font-bold text-amber-400 transition-colors hover:bg-amber-400/10 active:scale-95"
              >
                <Coins className="h-3 w-3" />
                {t('nav.bank')}
              </Link>
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono leading-tight drop-shadow-[0_0_8px_rgba(251,191,36,0.25)]">
              {formatNumber(gp)} <span className="text-sm text-amber-500/70">{t('inventory.gp')}</span>
            </div>
          </div>
        </div>

        <div className={`border px-4 py-3 rounded-xl shadow-inner text-center w-full sm:w-auto transition-colors ${
          isFull ? 'bg-destructive/10 border-destructive/40' : 'bg-background border-border'
        }`}>
          <div className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold mb-0.5">{t('inventory.slots')}</div>
          <div className="text-xl font-black font-mono">
            <span className={isFull ? 'text-destructive' : 'text-foreground'}>{totalItems}</span>
            <span className="text-muted-foreground"> / {maxSlots}</span>
          </div>
          {isFull && (
            <p className="text-[10px] text-destructive font-bold mt-0.5">FULL</p>
          )}
        </div>
      </div>

      {/* Category Filters — touch-friendly */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {CATEGORIES.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setCategory(key as any)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl font-bold text-sm transition-all active:scale-95 ${
              activeCategory === key
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                : 'bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground active:bg-accent'
            }`}
          >
            <span className="text-lg">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Controls — touch-friendly */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder={t('ui.search') + '...'}
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 min-h-[44px] bg-card border border-border rounded-xl focus:outline-none focus:border-primary transition-colors text-sm"
          />
        </div>

        {/* Sort — scrollable on mobile, touch-friendly */}
        <div className="flex gap-1.5 bg-card p-1 rounded-xl border border-border overflow-x-auto shrink-0">
          {SORT_MODES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSort(key as any)}
              className={`shrink-0 px-3 py-2 min-h-[40px] rounded-lg text-xs font-bold uppercase tracking-wider transition-colors active:scale-95 ${
                sortMode === key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground active:bg-accent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid — touch-friendly items */}
      <div className="bg-card border border-border rounded-2xl p-3 md:p-5 shadow-sm min-h-[400px]">
        {filteredItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-16">
            <div className="text-5xl mb-3 opacity-20">🎒</div>
            <p className="font-bold text-sm">{t('inventory.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 md:gap-3">
            {filteredItems.map(slot => {
              const item = getItem(slot.itemId);
              if (!item) return null;
              return (
                <div key={slot.itemId} className="relative flex flex-col items-center">
                  {/* Lock indicator on item */}
                  {slot.locked && (
                    <div className="absolute top-1 right-1 z-10 w-5 h-5 bg-amber-500/90 rounded-full flex items-center justify-center shadow-md">
                      <Lock className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <ItemInfoPopover
                    itemId={slot.itemId}
                    quantity={slot.quantity}
                    actions={
                      <div className="flex flex-col gap-1.5 min-w-[140px]">
                        {item.equipSlot && !slot.locked && (
                          <button
                            type="button"
                            onClick={() => handleEquip(slot.itemId)}
                            className="rounded-md px-3 py-2.5 min-h-[44px] text-left text-xs font-bold transition-colors hover:bg-accent hover:text-primary active:bg-accent active:scale-95"
                          >
                            {t('inventory.equip')}
                          </button>
                        )}
                        {item.canSell && !slot.locked && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSell(slot.itemId, 1)}
                              className="rounded-md px-3 py-2.5 min-h-[44px] text-left text-xs transition-colors hover:bg-accent hover:text-amber-400 active:bg-accent active:scale-95"
                            >
                              {t('inventory.sell1')} ({formatNumber(item.sellValue)} GP)
                            </button>
                            {slot.quantity > 1 && (
                              <button
                                type="button"
                                onClick={() => handleSell(slot.itemId, slot.quantity)}
                                className="rounded-md px-3 py-2.5 min-h-[44px] text-left text-xs transition-colors hover:bg-accent hover:text-amber-400 active:bg-accent active:scale-95"
                              >
                                {t('inventory.sellAll')} ({formatNumber(item.sellValue * slot.quantity)} GP)
                              </button>
                            )}
                          </>
                        )}
                        {slot.locked && (
                          <p className="text-[10px] text-amber-400 font-bold text-center py-1">
                            🔒 {t('inventory.locked') ?? 'Locked — cannot sell'}
                          </p>
                        )}
                      </div>
                    }
                  >
                    <button
                      type="button"
                      aria-label={item.name}
                      className={`rounded-lg transition-all active:scale-95 hover:shadow-[0_0_12px_rgba(34,197,94,0.15)] min-h-[44px] min-w-[44px] ${
                        slot.locked ? 'opacity-80' : ''
                      }`}
                    >
                      <ItemIcon
                        itemId={slot.itemId}
                        quantity={slot.quantity}
                        size="lg"
                        showTooltip={false}
                        className="aspect-square h-auto w-full cursor-pointer hover:border-primary"
                      />
                    </button>
                  </ItemInfoPopover>
                  <span className="text-[10px] text-muted-foreground font-medium truncate w-full text-center px-0.5 block mt-1">
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
