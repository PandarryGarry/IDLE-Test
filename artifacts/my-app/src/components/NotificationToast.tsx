import React from 'react';
import { useNotificationsStore } from '@/store/notificationsStore';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function NotificationToast() {
  const notifications = useNotificationsStore(s => s.notifications);
  const dismiss = useNotificationsStore(s => s.dismissNotification);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 pointer-events-none">
      <AnimatePresence>
        {notifications.map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-center justify-between p-3 rounded-lg border shadow-lg backdrop-blur-sm ${
              n.type === 'levelup' || n.type === 'mastery_levelup' 
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-100'
                : n.type === 'combat' || n.type === 'warning'
                ? 'bg-red-950/90 border-red-500/50 text-red-100'
                : 'bg-card/90 border-border text-foreground'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {n.icon && <span className="text-xl flex-shrink-0">{n.icon}</span>}
              <p className={`text-sm truncate font-medium ${n.type === 'levelup' || n.type === 'mastery_levelup' ? 'text-amber-400' : ''}`}>
                {n.message}
              </p>
            </div>
            <button
              onClick={() => dismiss(n.id)}
              className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}