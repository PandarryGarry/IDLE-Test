import { create } from 'zustand';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';

export interface ForagingCycleSnapshot {
  items: { itemId: string; quantity: number }[];
  encounter?: { areaId: string; monsterId: string; boss: boolean };
  empty?: boolean;
}

export interface ForagingFeedItem {
  itemId: string;
  quantity: number;
  doubled?: boolean;
}

export interface ForagingFeedEntry {
  id: number;
  ts: number;
  zoneId: string;
  items: ForagingFeedItem[];
  encounter: { monsterId: string; boss: boolean } | null;
  empty: boolean;
}

interface ForagingStore {
  activeZoneId: string | null;
  lootFeed: ForagingFeedEntry[];
  sessionXp: number;
  start: (zoneId: string) => boolean;
  stop: () => void;
  pushCycle: (zoneId: string, result: ForagingCycleSnapshot, effectiveXp: number) => void;
  /** Очистка ленты находок без остановки активного сбора. */
  clearLootFeed: () => void;
  resetForaging: () => void;
}

let feedId = 0;

export const useForagingStore = create<ForagingStore>((set, get) => ({
  activeZoneId: null,
  lootFeed: [],
  sessionXp: 0,

  start: (zoneId) => {
    const ok = useGameStore.getState().startSkillAction('foraging', zoneId);
    if (ok) set({ activeZoneId: zoneId });
    return ok;
  },

  stop: () => {
    useGameStore.getState().stopAction();
    set({ activeZoneId: null });
  },

  pushCycle: (zoneId, result, effectiveXp) => {
    const entry: ForagingFeedEntry = {
      id: ++feedId,
      ts: Date.now(),
      zoneId,
      items: result.items.map(item => ({ itemId: item.itemId, quantity: item.quantity })),
      encounter: result.encounter ? { monsterId: result.encounter.monsterId, boss: result.encounter.boss } : null,
      empty: Boolean(result.empty),
    };
    set(s => ({
      lootFeed: [entry, ...s.lootFeed].slice(0, 30),
      sessionXp: s.sessionXp + effectiveXp,
    }));
  },

  clearLootFeed: () => set({ lootFeed: [] }),
  resetForaging: () => set({ activeZoneId: null, lootFeed: [], sessionXp: 0 }),
}));

export function getForagingLevel(): number {
  return usePlayerStore.getState().getSkillLevel('foraging');
}
