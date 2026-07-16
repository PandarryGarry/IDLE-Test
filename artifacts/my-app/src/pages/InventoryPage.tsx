import React from 'react';
import { useBankStore } from '@/store/bankStore';
import { ItemIcon } from '@/components/ItemIcon';
import { getItem } from '@/data/items';
import { Search } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { usePlayerStore } from '@/store/playerStore';
import { useTranslation } from '@/hooks/useTranslation';

export function InventoryPage() {
  const { t } = useTranslation();
  const bankStore = useBankStore();
  const playerStore = usePlayerStore();

  const filteredItems = bankStore.getFilteredItems();
  const totalItems = bankStore.items.filter(i => i.quantity > 0).length;

  const handleSell = (itemId: string, qty: number) => {
    bankStore.sellItem(itemId, qty);
  };

  const handleEquip = (itemId: string) => {
    const item = getItem(itemId);
    if (item && item.equipSlot) {
      const oldEquip = playerStore.equipItem(itemId, item.equipSlot);
      bankStore.removeItem(itemId, 1);
      if (oldEquip) bankStore.addItem(oldEquip, 1);
    }
  };

  const SORT_MODES = [
    { key: 'default',  label: t('inventory.sort.default') },
    { key: 'name',     label: t('inventory.sort.name') },
    { key: 'value',    label: t('inventory.sort.value') },
    { key: 'quantity', label: t('inventory.sort.quantity') },
  ] as const;

  const isFull = totalItems >= bankStore.maxSlots;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-card border border-border p-4 md:p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-12 h-12 shrink-0 bg-sky-500/10 rounded-xl flex items-center justify-center text-3xl border border-sky-500/20 shadow-inner">
            🎒
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground">{t('inventory.title')}</h1>
            <div className="text-2xl font-black text-amber-400 font-mono leading-tight drop-shadow-[0_0_8px_rgba(251,191,36,0.25)]">
              {formatNumber(bankStore.gp)} <span className="text-sm text-amber-500/70">{t('inventory.gp')}</span>
            </div>
          </div>
        </div>

        <div className={`border px-4 py-3 rounded-xl shadow-inner text-center w-full sm:w-auto transition-colors ${
          isFull ? 'bg-destructive/10 border-destructive/40' : 'bg-background border-border'
        }`}>
          <div className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold mb-0.5">{t('inventory.slots')}</div>
          <div className="text-xl font-black font-mono">
            <span className={isFull ? 'text-destructive' : 'text-foreground'}>{totalItems}</span>
            <span className="text-muted-foreground"> / {bankStore.maxSlots}</span>
          </div>
          {isFull && (
            <p className="text-[10px] text-destructive font-bold mt-0.5">FULL</p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder={t('ui.search') + '...'}
            value={bankStore.searchQuery}
            onChange={(e) => bankStore.setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:border-primary transition-colors text-sm"
          />
        </div>

        {/* Sort — scrollable on mobile */}
        <div className="flex gap-1.5 bg-card p-1 rounded-xl border border-border overflow-x-auto shrink-0">
          {SORT_MODES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => bankStore.setSort(key as any)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                bankStore.sortMode === key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="bg-card border border-border rounded-2xl p-3 md:p-5 shadow-sm min-h-[400px]">
        {filteredItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-16">
            <div className="text-5xl mb-3 opacity-20">🎒</div>
            <p className="font-bold text-sm">{t('inventory.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {filteredItems.map(slot => {
              const item = getItem(slot.itemId);
              if (!item) return null;
              return (
                <div key={slot.itemId} className="group relative flex flex-col items-center">
                  <ItemIcon
                    itemId={slot.itemId}
                    quantity={slot.quantity}
                    size="lg"
                    className="w-full h-auto aspect-square mb-1 cursor-pointer hover:border-primary hover:shadow-[0_0_12px_rgba(34,197,94,0.15)] transition-all"
                  />
                  <span className="text-[10px] text-muted-foreground font-medium truncate w-full text-center px-0.5 block">
                    {item.name}
                  </span>

                  {/* Hover context menu */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-popover/95 backdrop-blur-sm border border-border rounded-xl shadow-xl p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 flex flex-col gap-0.5 min-w-[96px]">
                    {item.equipSlot && (
                      <button
                        onClick={() => handleEquip(slot.itemId)}
                        className="text-xs text-left px-2 py-1.5 hover:bg-accent hover:text-primary rounded-lg font-bold"
                      >
                        {t('inventory.equip')}
                      </button>
                    )}
                    {item.canSell && (
                      <>
                        <button
                          onClick={() => handleSell(slot.itemId, 1)}
                          className="text-xs text-left px-2 py-1.5 hover:bg-accent hover:text-amber-400 rounded-lg"
                        >
                          {t('inventory.sell1')} ({formatNumber(item.sellValue ?? 0)} GP)
                        </button>
                        <button
                          onClick={() => handleSell(slot.itemId, slot.quantity)}
                          className="text-xs text-left px-2 py-1.5 hover:bg-accent hover:text-amber-400 rounded-lg"
                        >
                          {t('inventory.sellAll')} ({formatNumber((item.sellValue ?? 0) * slot.quantity)} GP)
                        </button>
                      </>
                    )}
                    {item.value !== undefined && (
                      <div className="text-[10px] text-muted-foreground px-2 py-1 border-t border-border mt-0.5">
                        {formatNumber(item.value ?? 0)} GP {t('inventory.value').toLowerCase()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
