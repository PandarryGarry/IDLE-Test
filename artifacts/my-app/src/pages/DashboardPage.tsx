import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { GUEST_NOTICE } from '@/lib/guestMode';
import { useTranslation } from '@/hooks/useTranslation';
import { CoinsDisplay } from '@/shared/ui/CoinsDisplay';
import { formatNumber } from '@/lib/utils';
import { Moon } from 'lucide-react';
import type { OfflineData } from '@/store/gameStore';

const PANEL: React.CSSProperties = {
  background: 'linear-gradient(160deg,#7a5028,#5a3818)',
  border: '2px solid #5a3010',
  borderRadius: 16,
  boxShadow: '0 4px 0 #3d1e08, 0 6px 24px rgba(10,4,0,0.35), inset 0 1px 0 rgba(220,170,80,0.08)',
  padding: '14px',
};

/* ── Ячейка метрики ── */
function StatCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      flex: 1, minWidth: 0,
      padding: '8px 8px', borderRadius: 10,
      background: 'linear-gradient(160deg,#3d2008,#2a1406)',
      border: '2px solid #5a3010',
      boxShadow: '0 2px 0 #1e0c04, inset 0 1px 0 rgba(220,170,80,0.06)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    }}>
      <span style={{
        fontFamily: 'var(--app-font-mono)', fontSize: 8, fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b6030',
        whiteSpace: 'nowrap',
      }}>{label}</span>
      <div style={{
        height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: 'var(--app-font-mono)', fontSize: 18, fontWeight: 900,
        color: '#f5d060', lineHeight: 1,
        textShadow: '0 1px 4px rgba(0,0,0,0.5)',
      }}>{value}</div>
    </div>
  );
}

/* ── Оффлайн сводка ── */
function OfflineSummary({ data, onClaim }: { data: OfflineData; onClaim: () => void }) {
  const h = Math.floor(data.totalMinutes / 60);
  const m = data.totalMinutes % 60;
  const timeStr = h > 0 ? `${h}ч ${m}м` : `${m}м`;

  return (
    <div style={{
      ...PANEL,
      background: 'linear-gradient(160deg,#3a2808,#2a1a06)',
      border: '2px solid #c8880a',
      boxShadow: '0 4px 0 #2a1005, 0 0 24px rgba(200,136,10,0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Moon size={14} color="#c8a050" />
        <span style={{
          fontFamily: 'var(--app-font-mono)', fontSize: 10, fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c8a050',
        }}>
          Пока тебя не было • {timeStr}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {data.rewards.map((sk, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 10px', borderRadius: 10,
            background: 'rgba(20,10,0,0.4)', border: '1px solid rgba(200,136,10,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{sk.icon}</span>
              <div>
                <div style={{ fontSize: 12, color: '#f0d070', fontWeight: 700 }}>{sk.skill}</div>
                {sk.items && <div style={{ fontSize: 10, color: '#a07838', fontFamily: 'var(--app-font-mono)' }}>{sk.items}</div>}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#f5d060', fontFamily: 'var(--app-font-mono)', fontWeight: 800 }}>
                +{formatNumber(sk.xp)} XP
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '8px 0', fontSize: 11, color: '#8b6030',
        fontFamily: 'var(--app-font-mono)',
      }}>
        ✓ Лут уже добавлен в инвентарь
      </div>
    </div>
  );
}

/* ── DASHBOARD ── */
export function DashboardPage() {
  const { t }        = useTranslation();
  const combatLevel  = usePlayerStore(s => s.combatLevel);
  const gp           = useInventoryStore(s => s.gp);
  const items        = useInventoryStore(s => s.items);
  const maxSlots     = useInventoryStore(s => s.maxSlots);
  const offlineData   = useGameStore(s => s.offlineData);
  const clearOffline  = useGameStore(s => s.clearOfflineData);
  const isGuest       = useAuthStore(s => s.isGuest);
  const usedSlots    = items ? items.filter(s => s.quantity > 0).length : 0;

  const handleClaim = () => { clearOffline(); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* ── ГЕРОЙ ── */}
      <div style={PANEL}>
        {/* Шапка */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(160deg,#2e1608,#1e0e04)',
            border: '2px solid #c8880a',
            boxShadow: '0 2px 0 #2a1005,0 0 14px rgba(200,136,10,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 22 }}>🛡️</span>
          </div>
          <div>
            <div style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8b6030', marginBottom: 2 }}>
              Герой
            </div>
            <div style={{
              fontFamily: 'var(--app-font-display)', fontSize: 20, fontWeight: 900,
              color: '#fff8d0', lineHeight: 1.05, textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}>
              Странник
            </div>
          </div>
        </div>

        {/* 3 метрики */}
        <div style={{ display: 'flex', gap: 6 }}>
          <StatCell label="⚔ Боевой Lvl" value={combatLevel} />
          <StatCell label="💰 Кошелёк"   value={<span style={{display:"flex",alignItems:"center",height:"100%"}}><CoinsDisplay amount={gp} size="xs" /></span>} />
          <StatCell label="🎒 Сумка"     value={`${usedSlots}/${maxSlots}`} />
        </div>
      </div>

      {/* ── GUEST NOTICE ── */}
      {isGuest && (
        <div style={{
          ...PANEL,
          background: 'linear-gradient(160deg,#3a2808,#2a1a06)',
          border: '1px solid #c8880a',
          padding: '10px 12px',
        }}>
          <span style={{
            fontFamily: 'var(--app-font-mono)', fontSize: 10, fontWeight: 800,
            letterSpacing: '0.06em', color: '#f0d070', lineHeight: 1.4,
          }}>
            {GUEST_NOTICE}
          </span>
        </div>
      )}

      {/* ── ОФФЛАЙН СВОДКА ── */}
      {offlineData
        ? <OfflineSummary data={offlineData} onClaim={handleClaim} />
        : (
          /* Заглушка когда нет оффлайн данных */
          <div style={{
            ...PANEL,
            background: 'linear-gradient(160deg,#3a2808,#2a1a06)',
            border: '1px solid #4a2808',
            opacity: 0.7,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Moon size={14} color="#7a5820" />
            <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 11, color: '#7a5820' }}>
              Оффлайн прогресс появится после возвращения
            </span>
          </div>
        )
      }
    </div>
  );
}
