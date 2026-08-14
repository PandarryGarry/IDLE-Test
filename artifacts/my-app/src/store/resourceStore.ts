import { create } from 'zustand';

// Для истощения используем Date.now() (wall-clock) — как и сохранения/оффлайн

interface NodeState {
  harvested: number;
  depletedAt: number | null; // timestamp истощения
}

interface ResourceStore {
  nodes: Record<string, NodeState>;

  /** true если истощена (и авто-сбрасывает по окончании респауна) */
  isDepleted: (actionId: string, respawnMs: number) => boolean;
  getRemaining: (actionId: string, stockLimit: number) => number;
  getRespawnRemainingMs: (actionId: string, respawnMs: number) => number;

  /** Записать добычу. Возвращает false, если нода истощилась */
  recordHarvest: (actionId: string, qty: number, stockLimit: number) => boolean;

  /** Прямая установка состояния ноды (используется offlineCalc) */
  setNodeState: (actionId: string, state: { harvested: number; depletedAt: number | null }) => void;

  reset: () => void;
  loadFromSave: (nodes: Record<string, NodeState>) => void;
}

export const useResourceStore = create<ResourceStore>((set, get) => ({
  nodes: {},

  isDepleted: (actionId, respawnMs) => {
    const node = get().nodes[actionId];
    if (!node || node.depletedAt === null) return false;
    // Респаун завершился — сбрасываем
    if (Date.now() - node.depletedAt >= respawnMs) {
      set(s => ({ nodes: { ...s.nodes, [actionId]: { harvested: 0, depletedAt: null } } }));
      return false;
    }
    return true;
  },

  getRemaining: (actionId, stockLimit) => {
    const node = get().nodes[actionId];
    if (!node) return stockLimit;
    return Math.max(0, stockLimit - node.harvested);
  },

  getRespawnRemainingMs: (actionId, respawnMs) => {
    const node = get().nodes[actionId];
    if (!node || node.depletedAt === null) return 0;
    return Math.max(0, respawnMs - (Date.now() - node.depletedAt));
  },

  recordHarvest: (actionId, qty, stockLimit) => {
    const node = get().nodes[actionId] ?? { harvested: 0, depletedAt: null };
    if (node.depletedAt !== null) return false;

    const harvested = node.harvested + qty;
    if (harvested >= stockLimit) {
      set(s => ({ nodes: { ...s.nodes, [actionId]: { harvested, depletedAt: Date.now() } } }));
      return false; // истощилась
    }
    set(s => ({ nodes: { ...s.nodes, [actionId]: { harvested, depletedAt: null } } }));
    return true;
  },

  setNodeState: (actionId, state) => {
    set(s => ({ nodes: { ...s.nodes, [actionId]: state } }));
  },

  reset: () => set({ nodes: {} }),
  loadFromSave: (nodes) => set({ nodes }),
}));
