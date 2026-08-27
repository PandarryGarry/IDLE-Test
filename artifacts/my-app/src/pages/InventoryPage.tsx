import React, { useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { UniversalInfoModal } from '@/components/modals/UniversalInfoModal';
import { SquircleSlot } from '@/shared/ui/kit/SquircleSlot';
import { CoinsDisplay } from '@/shared/ui/CoinsDisplay';
import { Search, Plus, X } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

export function InventoryPage() {
  const { t } = useTranslation();
  
  const getFilteredItems = useInventoryStore(s => s.getFilteredItems);
  const items = useInventoryStore(s => s.items);
  const gp = useInventoryStore(s => s.gp);
  const maxSlots = useInventoryStore(s => s.maxSlots);
  const searchQuery = useInventoryStore(s => s.searchQuery);
  const setSearch = useInventoryStore(s => s.setSearch);
  const activeCategory = useInventoryStore(s => s.activeCategory);
  const setCategory = useInventoryStore(s => s.setCategory);
  const upgradeSlots = useInventoryStore(s => s.upgradeSlots);
  const getUpgradeCost = useInventoryStore(s => s.getUpgradeCost);
  const notifyInfo = useNotificationsStore(s => s.notifyInfo);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredItems = getFilteredItems();
  const totalItems = items.filter(i => i.quantity > 0).length;
  const upgradeCost = Math.floor(getUpgradeCost());

  const handleUpgradeSlots = () => {
    if (gp < upgradeCost) {
      notifyInfo(`Недостаточно монет! Нужно ${formatNumber(upgradeCost)}`);
      return;
    }
    const success = upgradeSlots();
    if (success) {
      notifyInfo('Вместимость сумки расширена на +10 ячеек!');
    }
  };

  const CATEGORIES = [
    { key: 'all',       label: 'Все',        icon: '📦' },
    { key: 'equipment', label: 'Снаряжение', icon: '⚔️' },
    { key: 'resources', label: 'Ресурсы',    icon: '🌲' },
    { key: 'food',      label: 'Еда',        icon: '🍖' },
    { key: 'misc',      label: 'Разное',     icon: '✨' },
  ] as const;

  const emptySlotsCount = Math.max(0, maxSlots - filteredItems.length);
  const visibleEmptySlots = Math.min(emptySlotsCount, 15);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      
      {/* 1. Header Banner */}
      <div className="rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 shadow-xl" style={{ background: 'linear-gradient(160deg,#2a1e0e,#1a1108)', border: '1px solid #3d2e1e' }}>
        
        {/* Title & Slot counter */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-amber-500/20 rounded-2xl border border-red-500/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
            🎒
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-black text-[var(--text-primary)] flex items-center gap-2">
              <span>Инвентарь</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-stone-500 font-sans">
                <span className="text-amber-400 font-mono font-black">{totalItems}</span> / {maxSlots}
              </span>
            </h1>
            <div className="text-xs font-mono text-stone-500 mt-1 flex items-center gap-1.5">
              <span>Кошелек:</span>
              <CoinsDisplay amount={gp} size="sm" />
            </div>
          </div>
        </div>

        {/* Upgrade Slots Button */}
        <button
          type="button"
          onClick={handleUpgradeSlots}
          className="px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all active:scale-95 flex items-center gap-1.5 shrink-0 text-stone-950"
          style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)', border: '1px solid #f59e0b', boxShadow: '0 2px 10px rgba(245,158,11,0.3)' }}
          title={`Купить +10 ячеек`}
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Слоты</span>
        </button>

      </div>

      {/* 2. Category Filter & Search Bar */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl" style={{ background: '#1c1108', border: '1px solid #3a2b1a' }}>
        
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
          {CATEGORIES.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setCategory(key as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 active:scale-95 ${
                activeCategory === key
                  ? 'bg-stone-800 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-stone-500 hover:text-[var(--text-primary)] hover:bg-stone-900'
              }`}
            >
              <span className="text-base">{icon}</span>
              <span className="hidden sm:inline text-[11px]">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center pl-1 border-l border-stone-800 shrink-0">
          {isSearchOpen ? (
            <div className="relative flex items-center">
              <input
                type="text"
                autoFocus
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                className="w-32 sm:w-48 pl-2.5 pr-7 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => { setSearch(''); setIsSearchOpen(false); }}
                className="absolute right-2 text-stone-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-xl text-stone-500 hover:text-white hover:bg-stone-900 transition-all active:scale-95"
              title="Поиск предмета"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* 3. Squircle Inventory Slots Grid */}
      <div className="rounded-2xl p-3 sm:p-4 min-h-[380px]" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.35)' }}>
        
        {filteredItems.length === 0 && !emptySlotsCount ? (
          <div className="text-center py-20 text-slate-500 flex flex-col items-center gap-2">
            <div className="text-5xl opacity-30">🎒</div>
            <p className="text-xs font-mono">Сумка пуста</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-2.5 sm:gap-3">
            {filteredItems.map(slot => (
              <SquircleSlot
                key={slot.itemId}
                itemId={slot.itemId}
                quantity={slot.quantity}
                locked={slot.locked}
                onClick={() => setSelectedItemId(slot.itemId)}
              />
            ))}

            {Array.from({ length: visibleEmptySlots }).map((_, idx) => (
              <SquircleSlot
                key={`empty-${idx}`}
                isEmptyPlaceholder={true}
              />
            ))}
          </div>
        )}

      </div>

      {/* 4. Universal Info Modal */}
      {selectedItemId && (
        <UniversalInfoModal
          itemId={selectedItemId}
          onClose={() => setSelectedItemId(null)}
        />
      )}

    </div>
  );
}
