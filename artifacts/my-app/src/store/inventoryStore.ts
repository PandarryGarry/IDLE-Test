import { create } from 'zustand';
import type { BankSlot as InventorySlot } from '../data/types';
import { getItem } from '../data/items';

const DEFAULT_MAX_SLOTS = 24;
const SLOTS_PER_UPGRADE = 10;
const BASE_UPGRADE_COST = 500;

export type CategoryFilter = 'all' | 'equipment' | 'resources' | 'food' | 'misc';

export interface InventoryStore {
  items: InventorySlot[];
  gp: number;
  maxSlots: number;
  sortMode: 'default' | 'name' | 'value' | 'quantity' | 'category';
  searchQuery: string;
  activeCategory: CategoryFilter;

  // Запросы данных
  getItemQty: (itemId: string) => number;
  hasItem: (itemId: string, qty?: number) => boolean;
  getSlot: (itemId: string) => InventorySlot | undefined;
  getFilteredItems: () => InventorySlot[];
  getUsedSlots: () => number;
  getTotalNetWorth: () => number;
  getUpgradeCost: () => number;

  // Действия
  addItem: (itemId: string, qty: number) => boolean;
  removeItem: (itemId: string, qty: number) => boolean;
  removeItems: (items: { itemId: string; quantity: number }[]) => boolean;
  addGp: (amount: number) => void;
  spendGp: (amount: number) => boolean;
  sellItem: (itemId: string, qty: number) => number;
  sellAll: (itemId: string) => number;
  lockItem: (itemId: string, locked: boolean) => void;
  upgradeSlots: () => boolean;
  setSearch: (query: string) => void;
  setSort: (mode: InventoryStore['sortMode']) => void;
  setCategory: (category: CategoryFilter) => void;

  loadFromSave: (items: InventorySlot[], gp: number, maxSlots: number) => void;
  reset: () => void;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  items: [],
  gp: 0,
  maxSlots: DEFAULT_MAX_SLOTS,
  sortMode: 'default',
  searchQuery: '',
  activeCategory: 'all',

  getItemQty: (itemId) => {
    const slot = get().items.find(s => s.itemId === itemId);
    return slot?.quantity ?? 0;
  },

  hasItem: (itemId, qty = 1) => get().getItemQty(itemId) >= qty,

  getSlot: (itemId) => get().items.find(s => s.itemId === itemId),

  getUsedSlots: () => get().items.filter(s => s.quantity > 0).length,

  getUpgradeCost: () => {
    const upgradesBought = Math.max(0, Math.floor((get().maxSlots - DEFAULT_MAX_SLOTS) / SLOTS_PER_UPGRADE));
    return BASE_UPGRADE_COST * Math.pow(1.5, upgradesBought);
  },

  getTotalNetWorth: () => {
    const { items, gp } = get();
    const itemsValue = items.reduce((sum, slot) => {
      const item = getItem(slot.itemId);
      return sum + (item?.sellValue ?? 0) * slot.quantity;
    }, 0);
    return gp + itemsValue;
  },

  getFilteredItems: () => {
    const { items, searchQuery, sortMode, activeCategory } = get();
    let result = items.filter(s => s.quantity > 0);
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => {
        const item = getItem(s.itemId);
        return item?.name.toLowerCase().includes(q) || s.itemId.includes(q);
      });
    }

    if (activeCategory !== 'all') {
      result = result.filter(s => {
        const item = getItem(s.itemId);
        if (!item) return false;
        
        const category = item.category;
        
        switch (activeCategory) {
          case 'equipment':
            return ['weapon', 'helm', 'platebody', 'platelegs', 'boots', 'gloves', 
                    'amulet', 'ring', 'shield', 'cape', 'quiver', 'passive'].includes(category);
          case 'resources':
            return ['ore', 'log', 'raw_fish', 'bar', 'gem', 'herb', 'seed'].includes(category);
          case 'food':
            return ['food', 'cooked_fish', 'potion'].includes(category);
          case 'misc':
            return ['misc', 'bone', 'ash', 'rune', 'tablet', 'arrow'].includes(category);
          default:
            return true;
        }
      });
    }
    
    if (sortMode === 'name') {
      result.sort((a, b) => (getItem(a.itemId)?.name ?? '').localeCompare(getItem(b.itemId)?.name ?? ''));
    } else if (sortMode === 'value') {
      result.sort((a, b) => {
        const valA = (getItem(a.itemId)?.sellValue ?? 0) * a.quantity;
        const valB = (getItem(b.itemId)?.sellValue ?? 0) * b.quantity;
        return valB - valA;
      });
    } else if (sortMode === 'quantity') {
      result.sort((a, b) => b.quantity - a.quantity);
    } else if (sortMode === 'category') {
      result.sort((a, b) => {
        const catA = getItem(a.itemId)?.category ?? 'misc';
        const catB = getItem(b.itemId)?.category ?? 'misc';
        return catA.localeCompare(catB);
      });
    }
    
    return result;
  },

  addItem: (itemId, qty) => {
    const { items, maxSlots } = get();
    const item = getItem(itemId);
    if (!item || qty <= 0) return false;

    const existingIdx = items.findIndex(s => s.itemId === itemId);

    if (existingIdx >= 0) {
      const newItems = [...items];
      newItems[existingIdx] = { ...newItems[existingIdx], quantity: newItems[existingIdx].quantity + qty };
      set({ items: newItems });
      return true;
    }

    const usedSlots = items.filter(s => s.quantity > 0).length;
    if (usedSlots >= maxSlots) return false;

    set({ items: [...items, { itemId, quantity: qty, locked: false, tab: 0 }] });
    return true;
  },

  removeItem: (itemId, qty) => {
    const { items } = get();
    const idx = items.findIndex(s => s.itemId === itemId);
    if (idx < 0 || items[idx].quantity < qty) return false;
    const newItems = [...items];
    const newQty = newItems[idx].quantity - qty;
    if (newQty <= 0) {
      newItems.splice(idx, 1);
    } else {
      newItems[idx] = { ...newItems[idx], quantity: newQty };
    }
    set({ items: newItems });
    return true;
  },

  removeItems: (itemList) => {
    const state = get();
    for (const { itemId, quantity } of itemList) {
      if (!state.hasItem(itemId, quantity)) return false;
    }
    for (const { itemId, quantity } of itemList) {
      state.removeItem(itemId, quantity);
    }
    return true;
  },

  addGp: (amount) => set(s => ({ gp: s.gp + amount })),

  spendGp: (amount) => {
    const { gp } = get();
    if (gp < amount) return false;
    set({ gp: gp - amount });
    return true;
  },

  sellItem: (itemId, qty) => {
    const item = getItem(itemId);
    if (!item || !item.canSell) return 0;
    
    const slot = get().getSlot(itemId);
    if (slot?.locked) return 0;
    
    const available = get().getItemQty(itemId);
    const sellQty = Math.min(qty, available);
    if (sellQty <= 0) return 0;
    
    get().removeItem(itemId, sellQty);
    const gpGained = item.sellValue * sellQty;
    get().addGp(gpGained);
    return gpGained;
  },

  sellAll: (itemId) => {
    const qty = get().getItemQty(itemId);
    return get().sellItem(itemId, qty);
  },

  lockItem: (itemId, locked) => {
    const { items } = get();
    set({ items: items.map(s => s.itemId === itemId ? { ...s, locked } : s) });
  },

  upgradeSlots: () => {
    const cost = Math.floor(get().getUpgradeCost());
    const ok = get().spendGp(cost);
    if (!ok) return false;
    set(s => ({ maxSlots: s.maxSlots + SLOTS_PER_UPGRADE }));
    return true;
  },

  setSearch: (query) => set({ searchQuery: query }),
  setSort: (mode) => set({ sortMode: mode }),
  setCategory: (category) => set({ activeCategory: category }),

  loadFromSave: (items, gp, maxSlots) => set({ items, gp, maxSlots: maxSlots || DEFAULT_MAX_SLOTS }),

  reset: () => set({ 
    items: [], 
    gp: 0, 
    maxSlots: DEFAULT_MAX_SLOTS, 
    searchQuery: '', 
    sortMode: 'default', 
    activeCategory: 'all'
  }),
}));

// Алиас для обратной совместимости, чтобы ни один импорт не упал
export const useBankStore = useInventoryStore;
