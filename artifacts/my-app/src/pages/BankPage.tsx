import React from 'react';
import { useBankStore } from '@/store/bankStore';
import { ItemIcon } from '@/components/ItemIcon';
import { getItem } from '@/data/items';
import { Search } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { usePlayerStore } from '@/store/playerStore';

export function BankPage() {
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
      if (oldEquip) {
        bankStore.addItem(oldEquip, 1);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-card border border-border p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-amber-500/10 rounded-xl flex items-center justify-center text-4xl border border-amber-500/20 shadow-inner">
            🪙
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Bank</h1>
            <div className="text-4xl font-black text-amber-400 mt-1 font-mono drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
              {formatNumber(bankStore.gp)} <span className="text-lg text-amber-500/70">GP</span>
            </div>
          </div>
        </div>
        
        <div className="bg-background border border-border px-6 py-4 rounded-xl shadow-inner text-center">
          <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Bank Slots</div>
          <div className="text-2xl font-black font-mono">
            <span className={totalItems >= bankStore.maxSlots ? 'text-destructive' : 'text-foreground'}>{totalItems}</span>
            <span className="text-muted-foreground"> / {bankStore.maxSlots}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search items..." 
            value={bankStore.searchQuery}
            onChange={(e) => bankStore.setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:border-primary transition-colors text-sm"
          />
        </div>
        
        <div className="flex gap-2 bg-card p-1 rounded-lg border border-border">
          {['default', 'name', 'value', 'quantity'].map((mode) => (
            <button
              key={mode}
              onClick={() => bankStore.setSort(mode as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${
                bankStore.sortMode === mode 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[500px]">
        {filteredItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <div className="text-6xl mb-4 opacity-20">🫙</div>
            <p className="font-bold">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {filteredItems.map(slot => {
              const item = getItem(slot.itemId);
              if (!item) return null;
              
              return (
                <div key={slot.itemId} className="group relative flex flex-col items-center">
                  <ItemIcon itemId={slot.itemId} quantity={slot.quantity} size="lg" className="w-full h-auto aspect-square mb-1 cursor-pointer hover:border-primary hover:shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all" />
                  <span className="text-[10px] text-muted-foreground font-medium truncate w-full text-center px-1 block">
                    {item.name}
                  </span>
                  
                  {/* Context Menu / Actions (Hover) */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-popover border border-border rounded-md shadow-xl p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 flex flex-col gap-1 min-w-[100px]">
                    {item.equipSlot && (
                      <button 
                        onClick={() => handleEquip(slot.itemId)}
                        className="text-xs text-left px-2 py-1.5 hover:bg-accent hover:text-primary rounded font-bold"
                      >
                        Equip
                      </button>
                    )}
                    {item.canSell && (
                      <>
                        <button 
                          onClick={() => handleSell(slot.itemId, 1)}
                          className="text-xs text-left px-2 py-1.5 hover:bg-accent hover:text-amber-400 rounded"
                        >
                          Sell 1
                        </button>
                        <button 
                          onClick={() => handleSell(slot.itemId, slot.quantity)}
                          className="text-xs text-left px-2 py-1.5 hover:bg-accent hover:text-amber-400 rounded"
                        >
                          Sell All
                        </button>
                      </>
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