import React, { useEffect, useRef } from 'react';
import { useNotificationsStore } from '@/store/notificationsStore';
import type { FindRarity } from '@/data/types';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const MAX_VISIBLE = 4;

/**
 * Обычные объявления — уровень 2 (аудит, шаг 11):
 * справа СНИЗУ над нижней навигацией, стекло слоя 1 с цветной кромкой по типу.
 * Сами исчезают; важное (нападение, босс, полная сумка) живёт в колокольчике топбара.
 */

interface ToastView {
  id: string;
  type: string;
  message: string;
  icon?: string;
  rarity?: FindRarity;
}

/** Цвет кромки: по типу, а для находок — по классу ценности. */
function edgeColor(n: ToastView): string {
  if (n.type === 'levelup')          return '#f0c030'; // золото — новый уровень навыка
  if (n.type === 'mastery_levelup')  return '#e8a24e'; // мёд — мастерство зоны
  if (n.type === 'combat')           return '#e0563d'; // кровь — бой
  if (n.type === 'warning')          return '#fb923c'; // апельсин — предупреждение
  if (n.type === 'achievement')      return '#f0c030';
  if (n.type === 'item') {
    switch (n.rarity) {
      case 'rare':      return '#6aa3ff'; // сапфир
      case 'epic':      return '#b07aff'; // аметист
      case 'legendary': return '#f0d060'; // сияющее золото
    }
    return '#4ade80';                   // изумруд — обычная выдача предметов
  }
  return '#b8a184';                     // нейтральное дерево — прочие заметки
}

export function NotificationToast() {
  const notifications = useNotificationsStore(s => s.notifications);
  const dismiss = useNotificationsStore(s => s.dismissNotification);

  const visible = notifications.slice(0, MAX_VISIBLE);

  return (
    <>
      {/* Компьютер: стопка справа снизу */}
      <div className="hidden md:flex fixed bottom-5 right-5 z-50 flex-col items-end gap-1.5 pointer-events-none">
        <AnimatePresence initial={false}>
          {visible.map(n => (
            <ToastItem key={n.id} n={n} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>

      {/* Телефон: стопка справа снизу, строго НАД нижней навигацией (74px + отступ) */}
      <div
        className="md:hidden fixed right-3 z-50 flex flex-col items-end gap-1.5 max-w-[calc(100vw-1.5rem)] pointer-events-none"
        style={{ bottom: 'calc(82px + env(safe-area-inset-bottom, 0px))' }}
      >
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
  n: ToastView;
  onDismiss: (id: string) => void;
  mobile?: boolean;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLevelUp = n.type === 'levelup' || n.type === 'mastery_levelup';
  const edge = edgeColor(n);

  useEffect(() => {
    // Визуальный таймер совпадает с авто-скрытием в сторе (с запасом на анимацию)
    timerRef.current = setTimeout(() => onDismiss(n.id), isLevelUp ? 6200 : 4200);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [n.id, isLevelUp, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', damping: 26, stiffness: 340 }}
      className="relative pointer-events-auto flex items-center gap-2 pl-3.5 pr-2 py-2 rounded-lg shadow-2xl w-fit max-w-[19rem]"
      style={{
        overflow: 'hidden',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-edge)',
        boxShadow: 'var(--glass-shadow)',
        backdropFilter: 'var(--glass-filter)',
        WebkitBackdropFilter: 'var(--glass-filter)',
      }}
    >
      {/* Цветная кромка слева — тип события / ценность находки */}
      <span aria-hidden style={{
        position: 'absolute', left: 0, top: 5, bottom: 5,
        width: 3, borderRadius: 3, background: edge,
        boxShadow: `0 0 8px ${edge}`,
      }} />

      {n.icon && <span className="text-base shrink-0 leading-none">{n.icon}</span>}
      <p className={`text-xs leading-snug min-w-0 line-clamp-2 ${isLevelUp ? 'font-bold' : 'font-semibold'}`}
         style={{ color: 'var(--text-primary)' }}>
        {n.message}
      </p>
      <button
        onClick={() => onDismiss(n.id)}
        className="ml-1 shrink-0 opacity-40 hover:opacity-80 transition-opacity"
        style={{ color: 'var(--text-primary)' }}
        aria-label="Закрыть"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Прогресс авто-скрытия в цвет кромки */}
      <AutoDismissBar durationMs={isLevelUp ? 6000 : 4000} color={edge} />
    </motion.div>
  );
}

function AutoDismissBar({ durationMs, color }: { durationMs: number; color: string }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-lg overflow-hidden">
      <div
        className="h-full origin-left"
        style={{
          background: color,
          opacity: 0.75,
          animation: `toast-shrink ${durationMs}ms linear forwards`,
        }}
      />
    </div>
  );
}
