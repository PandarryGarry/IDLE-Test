import React, { useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useAuthStore } from '@/store/authStore';
import { GUEST_NOTICE } from '@/lib/guestMode';
import { UniversalInfoModal } from '@/components/modals/UniversalInfoModal';
import { SquircleSlot } from '@/shared/ui/kit/SquircleSlot';
import { CoinsDisplay } from '@/shared/ui/CoinsDisplay';
import { Search, Plus, X } from 'lucide-react';
import { iconUrl } from '@/lib/assetUrl';
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
  const isGuest = useAuthStore(s => s.isGuest);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredItems = getFilteredItems();
  const totalItems = items.filter(i => i.quantity > 0).length;
  const upgradeCost = Math.floor(getUpgradeCost());

  const handleUpgradeSlots = () => {
    if (isGuest) {
      notifyInfo(GUEST_NOTICE);
      return;
    }
    if (gp < upgradeCost) {
      notifyInfo(`Недостаточно монет! Нужно ${formatNumber(upgradeCost)}`);
      return;
    }
    const success = upgradeSlots();
    if (success) {
      notifyInfo('Вместимость сумки расширена на +10 ячеек!');
    }
  };

  // Иконки фильтров — рисованные, стиль «Стекло таверны» (ICON_STYLE_GUIDE.md).
  const CATEGORIES = [
    { key: 'all',       label: 'Все',        icon: iconUrl('ui/filter_all') },
    { key: 'equipment', label: 'Снаряжение', icon: iconUrl('ui/filter_gear') },
    { key: 'resources', label: 'Ресурсы',    icon: iconUrl('ui/filter_resources') },
    { key: 'food',      label: 'Еда',        icon: iconUrl('ui/filter_food') },
    { key: 'misc',      label: 'Разное',     icon: iconUrl('ui/filter_misc') },
  ] as const;

  const emptySlotsCount = Math.max(0, maxSlots - filteredItems.length);
  const visibleEmptySlots = Math.min(emptySlotsCount, 15);

  return (
    /* Рамка «один экран»: шапка и фильтры прибиты, прокручивается
       только сетка ячеек — своим «окном». */
    <div className="a-page max-w-4xl mx-auto w-full">

      {/* 1. Header — стекло слоя 1 (причёска инвентаря, решение владельца 2026-09-12) */}
      <div
        className="rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-3"
        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-edge)', boxShadow: 'var(--glass-shadow)', backdropFilter: 'var(--glass-filter)' }}
      >
        {/* Title & Slot counter */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden p-1.5"
            style={{ background: 'var(--chrome-btn)', border: '1px solid var(--chrome-btn-edge)', boxShadow: 'var(--chrome-btn-shadow)' }}
          >
            <img src={iconUrl('menu/menu_inventory')} alt="" className="w-full h-full object-contain select-none pointer-events-none" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-display font-black text-[var(--text-primary)] flex items-baseline gap-1.5 leading-tight">
              <span>Инвентарь</span>
              <span className="font-mono text-[11px] sm:text-xs font-bold text-[var(--text-muted)]">
                <span className="text-[var(--text-gold)] font-black">{totalItems}</span> / {maxSlots}
              </span>
            </h1>
            <div className="text-[10px] sm:text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1">
              <span>Кошелёк:</span>
              <CoinsDisplay amount={gp} size="xs" />
            </div>
          </div>
        </div>

        {/* Upgrade Slots — компактная главная кнопка */}
        {isGuest ? (
          <div
            className="px-2.5 py-1.5 rounded-xl font-mono font-bold text-[10px] leading-tight text-center shrink-0 text-[var(--text-muted)]"
            style={{ background: 'var(--badge-gold-bg)', border: '1px solid var(--tag-gold-edge)' }}
          >
            Гость · 24 слота
          </div>
        ) : (
          <button
            type="button"
            onClick={handleUpgradeSlots}
            className="px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all active:scale-95 flex items-center gap-1 shrink-0 text-[var(--btn-primary-ink)] [background:var(--btn-primary)] [border-color:var(--btn-primary-edge)] border [box-shadow:var(--btn-primary-shadow)] hover:brightness-110"
            title="Купить +10 ячеек"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Слоты</span>
            <CoinsDisplay amount={upgradeCost} size="xs" />
          </button>
        )}

      </div>

      {/* 2. Category Filter & Search Bar — стекло слоя 1 */}
      <div
        className="flex items-center justify-between gap-2 p-1 rounded-xl"
        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-edge)', backdropFilter: 'var(--glass-filter)' }}
      >
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none flex-1">
          {CATEGORIES.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setCategory(key as any)}
              title={label}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 active:scale-95 border ${
                activeCategory === key
                  ? 'text-[var(--text-gold)] [background:var(--chrome-btn-open)] [border-color:var(--border-accent)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] border-transparent hover:[background:var(--glass-bg)]'
              }`}
            >
              <img src={icon} alt="" className={`w-[18px] h-[18px] object-contain select-none pointer-events-none ${activeCategory === key ? '' : 'opacity-75'}`} />
              <span className="hidden sm:inline">{label}</span>
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
                className="w-32 sm:w-48 pl-2.5 pr-7 py-1.5 bg-[var(--bg-slot)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
              />
              <button
                type="button"
                onClick={() => { setSearch(''); setIsSearchOpen(false); }}
                className="absolute right-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-dark)] transition-all active:scale-95"
              title="Поиск предмета"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* 3. Squircle Inventory Slots Grid — прокручиваемое окно ячеек */}
      <div
        className="a-page__scroll rounded-2xl p-3 sm:p-4"
        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-edge)', boxShadow: 'var(--glass-shadow)', backdropFilter: 'var(--glass-filter)' }}
      >
        
        {filteredItems.length === 0 && !emptySlotsCount ? (
          <div className="text-center py-20 text-[var(--text-muted)] flex flex-col items-center gap-2">
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
