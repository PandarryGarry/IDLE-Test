import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/hooks/useTranslation';
import { CoinsDisplay } from '@/shared/ui/CoinsDisplay';
import { formatNumber } from '@/lib/utils';
import { Moon } from 'lucide-react';
import { calculateOfflineProgress, applyOfflineProgress } from '@/gameEngine/offlineProgress';
import type { OfflineResult } from '@/gameEngine/offlineProgress';

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
        height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: 'var(--app-font-mono)', fontSize: 18, fontWeight: 900,
          color: '#f5d060', lineHeight: 1,
          textShadow: '0 1px 4px rgba(0,0,0,0.5)',
        }}>{value}</span>
      </div>
    </div>
  );
}

/* ── Оффлайн сводка ── */
function OfflineSummary({ result, onClaim }: { result: OfflineResult; onClaim: () => void }) {
  const h = Math.floor(result.durationMinutes / 60);
  const m = result.durationMinutes % 60;
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
        {result.skills.map((sk, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 10px', borderRadius: 10,
            background: 'rgba(20,10,0,0.4)', border: '1px solid rgba(200,136,10,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{sk.icon}</span>
              <div>
                <div style={{ fontSize: 12, color: '#f0d070', fontWeight: 700 }}>{sk.skillName}</div>
                {sk.items.map(item => (
                  <div key={item.id} style={{ fontSize: 10, color: '#a07838', fontFamily: 'var(--app-font-mono)' }}>
                    +{formatNumber(item.quantity)} {item.name}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#f5d060', fontFamily: 'var(--app-font-mono)', fontWeight: 800 }}>
                +{formatNumber(sk.xpGained)} XP
              </div>
              <div style={{ fontSize: 10, color: '#8b6030', fontFamily: 'var(--app-font-mono)' }}>
                {sk.actionsCount} действий
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onClaim} style={{
        width: '100%', padding: '11px 0', borderRadius: 12, cursor: 'pointer',
        background: 'linear-gradient(180deg,#c8880a,#9a6008)',
        border: '2px solid #6b4008', color: '#fff8d0',
        fontSize: 13, fontWeight: 800, fontFamily: 'var(--app-font-sans)',
        boxShadow: '0 3px 0 #3d2005',
      }}>
        ✓ Забрать награды
      </button>
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
  const lastSaveTime = useGameStore(s => s.lastSaveTime);
  const usedSlots    = items ? items.filter(s => s.quantity > 0).length : 0;

  const [offline, setOffline] = useState<OfflineResult | null>(null);
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    if (lastSaveTime > 0) {
      const result = calculateOfflineProgress(lastSaveTime);
      if (result) setOffline(result);
    }
  }, [lastSaveTime]);

  const handleClaim = () => {
    if (offline) { applyOfflineProgress(offline); setOffline(null); }
  };

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
          <StatCell label="💰 Кошелёк"   value={<CoinsDisplay amount={gp} size="xs" />} />
          <StatCell label="🎒 Сумка"     value={`${usedSlots}/${maxSlots}`} />
        </div>
      </div>

      {/* ── ОФФЛАЙН СВОДКА ── */}
      {offline
        ? <OfflineSummary result={offline} onClaim={handleClaim} />
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
