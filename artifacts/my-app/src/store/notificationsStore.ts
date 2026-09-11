import { create } from 'zustand';
import type {
  GameNotification, NotificationType, SkillId,
  AlertKind, ImportantAlert, FindRarity,
} from '@/data/types';
import { generateId } from '@/lib/utils';
import { skillNameRu } from '@/lib/skillNames';

const MAX_NOTIFICATIONS = 20;
const MAX_ALERTS = 50;
const AUTO_DISMISS_MS = 4000;
const LEVELUP_DISMISS_MS = 6000;
/** Однотипные важные объявления ближе этого срока складываются в одну карточку со счётчиком. */
const ALERT_MERGE_MS = 30_000;

const RARITY_ICONS: Record<FindRarity, string> = {
  rare: '💠',
  epic: '🔮',
  legendary: '🌟',
};
const RARITY_LABELS: Record<FindRarity, string> = {
  rare: 'Редкая находка',
  epic: 'Эпическая находка',
  legendary: 'Легендарная находка',
};

export interface NotificationsStore {
  /** Уровень 2 — обычные: тосты снизу справа над нижней навигацией, сами уходят. */
  notifications: GameNotification[];
  /** Уровень 1 — важные: живут в колокольчике топбара, пока игрок не закроет. */
  alerts: ImportantAlert[];

  addNotification: (type: NotificationType, message: string, opts?: Partial<GameNotification>) => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;

  addAlert: (kind: AlertKind, title: string, opts?: { detail?: string; icon?: string }) => void;
  dismissAlert: (id: string) => void;
  clearAlerts: () => void;
  markAlertsRead: () => void;

  // Convenience helpers — уровень 2
  notifyLevelUp: (skillId: SkillId, newLevel: number) => void;
  notifyItem: (itemName: string, qty: number, icon?: string) => void;
  notifyFind: (itemName: string, qty: number, rarity: FindRarity, icon?: string) => void;
  notifyMasteryLevelUp: (skillId: SkillId, actionName: string, newLevel: number) => void;
  notifyCombat: (message: string) => void;
  notifyInfo: (message: string) => void;

  // Convenience helpers — уровень 1
  notifyAmbush: (monsterName: string, boss: boolean) => void;
  notifyInventoryFull: () => void;
}

const SKILL_ICONS: Partial<Record<SkillId, string>> = {
  foraging: '🌿',
};

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  notifications: [],
  alerts: [],

  addNotification: (type, message, opts = {}) => {
    const id = generateId();
    const notification: GameNotification = {
      id,
      type,
      message,
      timestamp: Date.now(),
      ...opts,
    } as GameNotification;
    set(s => ({
      notifications: [notification, ...s.notifications].slice(0, MAX_NOTIFICATIONS),
    }));
    // Auto-dismiss all notifications (level-ups stay longer)
    const delay = (type === 'levelup' || type === 'mastery_levelup') ? LEVELUP_DISMISS_MS : AUTO_DISMISS_MS;
    setTimeout(() => get().dismissNotification(id), delay);
  },

  dismissNotification: (id) => {
    set(s => ({ notifications: s.notifications.filter(n => n.id !== id) }));
  },

  clearAll: () => set({ notifications: [] }),

  addAlert: (kind, title, opts = {}) => {
    const now = Date.now();
    const fresh = get().alerts.find(a => a.kind === kind && now - a.time < ALERT_MERGE_MS);
    if (fresh) {
      // То же событие подряд (сумка всё ещё полна и т.п.): обновляем карточку, не спамим список.
      set(s => ({
        alerts: s.alerts.map(a => a.id === fresh.id
          ? { ...a, title, detail: opts.detail ?? a.detail, time: now, read: false, count: a.count + 1 }
          : a),
      }));
      return;
    }
    const alert: ImportantAlert = {
      id: generateId(),
      kind,
      title,
      detail: opts.detail,
      icon: opts.icon ?? '⚠️',
      time: now,
      read: false,
      count: 1,
    };
    set(s => ({ alerts: [alert, ...s.alerts].slice(0, MAX_ALERTS) }));
  },

  dismissAlert: (id) => {
    set(s => ({ alerts: s.alerts.filter(a => a.id !== id) }));
  },

  clearAlerts: () => set({ alerts: [] }),

  markAlertsRead: () => {
    set(s => ({ alerts: s.alerts.map(a => (a.read ? a : { ...a, read: true })) }));
  },

  notifyLevelUp: (skillId, newLevel) => {
    const icon = SKILL_ICONS[skillId] ?? '⬆️';
    get().addNotification('levelup', `${skillNameRu(skillId)}: уровень ${newLevel}!`, {
      icon,
      skillId,
      level: newLevel,
    });
  },

  notifyItem: (itemName, qty, icon) => {
    const msg = qty > 1 ? `${itemName} ×${qty}` : itemName;
    get().addNotification('item', msg, { icon: icon ?? '📦' });
  },

  notifyFind: (itemName, qty, rarity, icon) => {
    const msg = qty > 1
      ? `${RARITY_LABELS[rarity]}: ${itemName} ×${qty}`
      : `${RARITY_LABELS[rarity]}: ${itemName}`;
    get().addNotification('item', msg, { icon: icon ?? RARITY_ICONS[rarity], rarity });
  },

  notifyMasteryLevelUp: (skillId, actionName, newLevel) => {
    get().addNotification('mastery_levelup', `${skillNameRu(skillId)} · мастерство «${actionName}» → ${newLevel}`, {
      icon: '✨',
      skillId,
      level: newLevel,
    });
  },

  notifyCombat: (message) => {
    get().addNotification('combat', message, { icon: '⚔️' });
  },

  notifyInfo: (message) => {
    get().addNotification('info', message, { icon: 'ℹ️' });
  },

  notifyAmbush: (monsterName, boss) => {
    if (boss) {
      get().addAlert('boss', 'Появился босс', {
        detail: `«${monsterName}» встал на вашем пути.`,
        icon: '👹',
      });
    } else {
      get().addAlert('ambush', 'Нападение во время сбора', {
        detail: `«${monsterName}» встал на вашем пути.`,
        icon: '⚔️',
      });
    }
  },

  notifyInventoryFull: () => {
    get().addAlert('inventory_full', 'Сумка заполнена', {
      detail: 'Часть находок потеряна — освободите места.',
      icon: '🎒',
    });
  },
}));
