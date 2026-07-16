import React from 'react';
import { useNotificationsStore } from '@/store/notificationsStore';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function NotificationToast() {
  const notifications = useNotificationsStore(s => s.notifications);
  const dismiss = useNotificationsStore(s => s.dismissNotification);

  return (
    <>
      {/* Desktop: fixed bottom-right */}
      <div className="hidden md:flex fixed bottom-4 right-4 z-50 flex-col gap-2 w-80 pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <ToastItem key={n.id} n={n} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>

      {/* Mobile: fixed bottom-center, above bottom nav */}
      <div className="md:hidden fixed bottom-16 inset-x-3 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <ToastItem key={n.id} n={n} onDismiss={dismiss} mobile />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

function ToastItem({
  n,
  onDismiss,
  mobile = false,
}: {
  n: { id: string; type: string; message: string; icon?: string };
  onDismiss: (id: string) => void;
  mobile?: boolean;
}) {
  const isLevelUp = n.type === 'levelup' || n.type === 'mastery_levelup';
  const isDanger = n.type === 'combat' || n.type === 'warning';

  return (
    <motion.div
      initial={mobile ? { opacity: 0, y: 20 } : { opacity: 0, x: 50, scale: 0.96 }}
      animate={mobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.93, transition: { duration: 0.15 } }}
      className={`pointer-events-auto flex items-center justify-between p-3 rounded-xl border shadow-xl backdrop-blur-sm ${
        isLevelUp
          ? 'bg-amber-950/92 border-amber-500/50 text-amber-100'
          : isDanger
          ? 'bg-red-950/92 border-red-500/50 text-red-100'
          : 'bg-card/92 border-border text-foreground'
      } ${isLevelUp ? 'ring-1 ring-amber-500/30' : ''}`}
    >
      <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
        {n.icon && <span className="text-xl shrink-0">{n.icon}</span>}
        <p className={`text-sm font-medium truncate ${isLevelUp ? 'text-amber-300 font-bold' : ''}`}>
          {n.message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(n.id)}
        className="ml-2 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
