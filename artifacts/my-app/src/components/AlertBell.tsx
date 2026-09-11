import React, { useEffect, useRef, useState } from 'react';
import { useNotificationsStore } from '@/store/notificationsStore';
import { THEME } from '@/styles/tokens';
import type { AlertKind, ImportantAlert } from '@/data/types';
import { Bell, X, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Важные объявления — уровень 1 (аудит, шаг 11).
 * Не исчезают сами: живут в колокольчике топбара, пока игрок не закроет карточку.
 * Открытие панели помечает все объявления прочитанными — счётчик на колокольчике
 * означает «есть непрочитанные», а не число карточек списка.
 * Цвета — только токены темы (страж шага 12).
 */

const KIND_STYLE: Record<AlertKind, { edge: string; tint: string }> = {
  ambush:        { edge: THEME.announce.combat,   tint: 'rgba(120, 36, 22, 0.35)' },
  boss:          { edge: THEME.rarity.epic,       tint: 'rgba( 74, 34, 108, 0.35)' },
  world_boss:    { edge: THEME.rarity.legendary,  tint: 'rgba(120, 90, 20, 0.35)' },
  restart:       { edge: THEME.rarity.rare,       tint: 'rgba( 30, 54, 96, 0.35)' },
  inventory_full:{ edge: THEME.announce.warning,  tint: 'rgba(130, 70, 16, 0.35)' },
};

export function AlertBell() {
  const alerts         = useNotificationsStore(s => s.alerts);
  const markAlertsRead = useNotificationsStore(s => s.markAlertsRead);
  const dismissAlert   = useNotificationsStore(s => s.dismissAlert);
  const clearAlerts    = useNotificationsStore(s => s.clearAlerts);
  const [open, setOpen] = useState(false);

  const unread = alerts.filter(a => !a.read).length;

  // Приход нового объявления: тёплое покачивание колокольчика — заметно, но не кричит.
  const prevUnreadRef = useRef(0);
  const [ring, setRing] = useState(0);
  useEffect(() => {
    if (unread > prevUnreadRef.current) setRing(r => r + 1);
    prevUnreadRef.current = unread;
  }, [unread]);

  const toggle = () => {
    setOpen(o => {
      if (!o) markAlertsRead();
      return !o;
    });
  };

  return (
    <>
      <button
        onClick={toggle}
        style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 30, borderRadius: 8,
          background: open ? THEME.chrome.btnOpen : THEME.chrome.btn,
          border: `2px solid ${THEME.chrome.btnEdge}`,
          color: THEME.chrome.btnInk, cursor: 'pointer',
          boxShadow: THEME.chrome.btnShadow, flexShrink: 0,
        }}
        title="Важные объявления"
        aria-label="Важные объявления"
        aria-expanded={open}
      >
        <motion.span
          key={ring}
          animate={ring > 0 ? { rotate: [0, -14, 11, -7, 3, 0] } : undefined}
          transition={{ duration: 0.6 }}
          style={{ display: 'inline-flex' }}
        >
          <Bell size={14} color={unread ? 'var(--text-gold)' : 'var(--text-muted)'} />
        </motion.span>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -6,
            minWidth: 16, height: 16, padding: '0 3px',
            borderRadius: 999, background: 'var(--accent-ruby)',
            border: '1.5px solid var(--text-gold)',
            color: 'var(--text-primary)', fontSize: 10, fontWeight: 800, lineHeight: '14px',
            fontFamily: THEME.font.mono, textAlign: 'center',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Прозрачная подложка закрывает панель по тапу в любое место */}
            <div
              onClick={() => setOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 48 }}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', damping: 26, stiffness: 380 }}
              style={{
                position: 'fixed', top: 54, right: 8, zIndex: 49,
                width: 'min(320px, calc(100vw - 16px))',
                maxHeight: 'min(420px, 62vh)',
                display: 'flex', flexDirection: 'column',
                borderRadius: 14, overflow: 'hidden',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-edge)',
                boxShadow: 'var(--glass-shadow)',
                backdropFilter: 'var(--glass-filter)',
                WebkitBackdropFilter: 'var(--glass-filter)',
              }}
              role="dialog"
              aria-label="Важные объявления"
            >
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px 8px',
                borderBottom: '1px solid var(--glass-edge)',
              }}>
                <span style={{
                  fontFamily: 'var(--app-font-display)', fontSize: 14, fontWeight: 700,
                  color: 'var(--text-gold)', letterSpacing: 0.3,
                }}>
                  Объявления
                </span>
                {alerts.length > 0 && (
                  <button
                    onClick={() => { clearAlerts(); setOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', fontSize: 11,
                      fontFamily: 'var(--app-font-mono)',
                    }}
                    title="Свернуть все объявления"
                  >
                    <Trash2 size={12} /> свернуть все
                  </button>
                )}
              </div>

              <div style={{ overflowY: 'auto', overscrollBehavior: 'contain', padding: 6 }}>
                {alerts.length === 0 && (
                  <p style={{
                    margin: 0, padding: '22px 12px', textAlign: 'center',
                    color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.5,
                  }}>
                    Важных объявлений нет — путь пока спокоен.
                  </p>
                )}
                {alerts.map(alert => (
                  <AlertRow key={alert.id} alert={alert} onDismiss={dismissAlert} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function AlertRow({ alert, onDismiss }: { alert: ImportantAlert; onDismiss: (id: string) => void }) {
  const style = KIND_STYLE[alert.kind] ?? KIND_STYLE.ambush;
  const time = new Date(alert.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{
      position: 'relative',
      display: 'flex', gap: 8, alignItems: 'flex-start',
      margin: '0 0 6px', padding: '8px 8px 8px 12px',
      borderRadius: 10,
      background: `linear-gradient(160deg, ${style.tint}, rgba(16, 10, 6, 0.25))`,
      border: '1px solid var(--glass-edge)',
      overflow: 'hidden',
    }}>
      {/* Цветная кромка по типу объявления */}
      <span aria-hidden style={{
        position: 'absolute', left: 0, top: 6, bottom: 6,
        width: 3, borderRadius: 3, background: style.edge,
        boxShadow: `0 0 8px ${style.edge}`,
      }} />
      <span style={{ fontSize: 16, lineHeight: 1.2, flexShrink: 0 }}>{alert.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontSize: 12, fontWeight: 700, color: 'var(--text-primary)',
            lineHeight: 1.3,
          }}>
            {alert.title}
          </span>
          {alert.count > 1 && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: style.edge,
              fontFamily: 'var(--app-font-mono)', flexShrink: 0,
            }}>
              ×{alert.count}
            </span>
          )}
        </div>
        {alert.detail && (
          <p style={{ margin: '2px 0 0', fontSize: 11, lineHeight: 1.4, color: 'var(--text-muted)' }}>
            {alert.detail}
          </p>
        )}
        <span style={{ fontSize: 10, color: THEME.ink.faint, fontFamily: THEME.font.mono }}>
          {time}
        </span>
      </div>
      <button
        onClick={() => onDismiss(alert.id)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 2,
          color: 'var(--text-muted)', opacity: 0.6, flexShrink: 0,
        }}
        title="Свернуть"
        aria-label="Свернуть объявление"
      >
        <X size={13} />
      </button>
    </div>
  );
}
