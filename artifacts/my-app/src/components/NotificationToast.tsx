import React, { useEffect, useRef } from 'react';
import { useNotificationsStore } from '@/store/notificationsStore';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const MAX_VISIBLE = 4;

export function NotificationToast() {
  const notifications = useNotificationsStore(s => s.notifications);
  const dismiss = useNotificationsStore(s => s.dismissNotification);

  const visible = notifications.slice(0, MAX_VISIBLE);

  return (
    <>
      {/* Desktop: compact top-right stack — под TopBar (h-12 = 48px + отступ) */}
      <div className="hidden md:flex fixed top-16 right-4 z-50 flex-col items-end gap-1.5 pointer-events-none">
        <AnimatePresence initial={false}>
          {visible.map(n => (
            <ToastItem key={n.id} n={n} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>

      {/* Mobile: compact top-right stack — под TopBar (h-12 = 48px + отступ) */}
      <div className="md:hidden fixed top-14 right-3 z-50 flex flex-col items-end gap-1.5 max-w-[calc(100vw-1.5rem)] pointer-events-none">
        <AnimatePresence initial={false}>
          {visible.map(n => (
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Progress bar for auto-dismiss timing
  const isLevelUp = n.type === 'levelup' || n.type === 'mastery_levelup';
  const isDanger  = n.type === 'combat'  || n.type === 'warning';
  const isItem    = n.type === 'item';

  useEffect(() => {
    // Visual timer to close after animation completes
    timerRef.current = setTimeout(() => onDismiss(n.id), isLevelUp ? 6200 : 4200);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [n.id, isLevelUp, onDismiss]);

  const glassBase =
      'relative pointer-events-auto flex items-center gap-2 px-2.5 py-2 rounded-lg border shadow-2xl backdrop-blur-xl transition-shadow w-fit max-w-[18rem]';

  const colorClass = isLevelUp
    ? 'bg-amber-950/60 border-amber-400/25 text-amber-100 ring-1 ring-amber-400/20 shadow-amber-900/40'
    : isDanger
    ? 'bg-red-950/60 border-red-400/25 text-red-100 ring-1 ring-red-400/20 shadow-red-900/40'
    : isItem
    ? 'bg-emerald-950/60 border-emerald-400/25 text-emerald-100 ring-1 ring-emerald-400/20'
    : 'bg-slate-900/70 border-white/10 text-slate-200';

  return (
    <motion.div
      layout
      initial={mobile ? { opacity: 0, y: 12, scale: 0.96 } : { opacity: 0, x: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', damping: 26, stiffness: 340 }}
      className={`${glassBase} ${colorClass}`}
    >
      {n.icon && <span className="text-base shrink-0 leading-none">{n.icon}</span>}
        <p className={`text-xs font-semibold leading-snug min-w-0 max-w-[16rem] truncate ${isLevelUp ? 'font-bold' : ''}`}>
        {n.message}
      </p>
      <button
        onClick={() => onDismiss(n.id)}
        className="ml-1 shrink-0 opacity-40 hover:opacity-80 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Bottom progress bar */}
      <AutoDismissBar durationMs={isLevelUp ? 6000 : 4000} colorClass={
        isLevelUp ? 'bg-amber-400/60' : isDanger ? 'bg-red-400/60' : isItem ? 'bg-emerald-400/60' : 'bg-slate-400/40'
      } />
    </motion.div>
  );
}

function AutoDismissBar({ durationMs, colorClass }: { durationMs: number; colorClass: string }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-xl overflow-hidden">
      <div
        className={`h-full ${colorClass} origin-left`}
        style={{
          animation: `toast-shrink ${durationMs}ms linear forwards`,
        }}
      />
    </div>
  );
}
