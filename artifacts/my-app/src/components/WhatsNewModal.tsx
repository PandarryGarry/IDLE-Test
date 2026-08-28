/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║        WhatsNewModal — «Что нового» после загрузки          ║
 * ║                                                             ║
 * ║  Показывается ПОСЛЕ SplashScreen, если есть непросмотренные ║
 * ║  записи changelog (getUnseenChangelog).                     ║
 * ║  Построен на примитивах gameUI (Этап 1) — GModal, GBadge,   ║
 * ║  GButton, GDivider. Цвета — только токены/CSS-переменные.   ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import { GModal, GButton, GBadge, GDivider } from '@/shared/ui/gameUI';
import {
  CHANGE_ICONS,
  CHANGE_COLORS,
  type VersionEntry,
} from '@/data/changelog';

interface WhatsNewModalProps {
  open: boolean;
  entries: VersionEntry[];
  onClose: () => void;
}

/** Форматируем ISO-дату в человекочитаемый вид (ру-локаль). */
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function WhatsNewModal({ open, entries, onClose }: WhatsNewModalProps) {
  if (entries.length === 0) return null;

  return (
    <GModal open={open} onClose={onClose} title="📜 Что нового" width={420}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {entries.map(entry => (
          <div key={entry.version} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Шапка версии */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <GBadge variant="gold">v{entry.version}</GBadge>
              <span
                style={{
                  fontFamily: 'var(--app-font-display)',
                  fontSize: 15,
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                }}
              >
                {entry.title}
              </span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontFamily: 'var(--app-font-mono)',
                  fontSize: 10,
                  color: 'var(--text-muted)',
                }}
              >
                {formatDate(entry.date)}
              </span>
            </div>

            {/* Список изменений */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {entry.changes.map((change, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-overlay)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <span style={{ fontSize: 14, lineHeight: '18px', flexShrink: 0 }}>
                    {CHANGE_ICONS[change.type]}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--app-font-sans)',
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: 1.5,
                      color: CHANGE_COLORS[change.type],
                    }}
                  >
                    {change.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <GDivider icon="⚔️" />

        <GButton variant="primary" size="md" fullWidth onClick={onClose}>
          В приключение!
        </GButton>
      </div>
    </GModal>
  );
}
