import React from 'react';
import { getItem } from '@/data/items';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { getItemTier } from '@/components/modals/UniversalInfoModal';
import { formatNumber, xpPerHour } from '@/lib/utils';
import { getLevelForXp, getLevelProgress } from '@/gameEngine/xpTable';
import { useTranslation } from '@/hooks/useTranslation';
import { Lock, Clock, Zap } from 'lucide-react';
import { TierBadge } from './TierBadge';

interface ActionCardProps {
  action: any;
  isLocked: boolean;
  isActive: boolean;
  masteryXp?: number;
  outputItemId?: string;
  onActionClick: () => void;
  renderExtra?: React.ReactNode;
}

export function ActionCard({ action, isLocked, isActive, masteryXp = 0, outputItemId, onActionClick, renderExtra }: ActionCardProps) {
  const { t } = useTranslation();
  const masteryLevel    = getLevelForXp(masteryXp);
  const masteryProgress = getLevelProgress(masteryXp);

  const resolvedItemId = outputItemId || action.logId || action.oreId || action.fishId || action.cookedItemId || action.outputItemId;
  const outputItem = resolvedItemId ? getItem(resolvedItemId) : undefined;
  const visual     = resolvedItemId ? getItemVisual(resolvedItemId) : null;
  const tier       = resolvedItemId && outputItem ? getItemTier(resolvedItemId, outputItem) : 'T1';

  const cardStyle: React.CSSProperties = isLocked
    ? { background: 'var(--bg-card-dark)', border: '1px solid var(--border-light)', opacity: 0.6, filter: 'grayscale(0.4)', cursor: 'not-allowed', borderRadius: 14 }
    : isActive
      ? { background: 'var(--accent-emerald-bg)', border: '1px solid var(--accent-emerald)', borderRadius: 14, boxShadow: 'var(--shadow-active)' }
      : { background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, boxShadow: 'var(--shadow-card)', cursor: 'pointer' };

  return (
    <div onClick={() => !isLocked && onActionClick()}
      style={{ ...cardStyle, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'all 0.2s ease', userSelect: 'none' }}
      onMouseEnter={e => { if (!isLocked && !isActive) { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-hover)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; } }}
      onMouseLeave={e => { if (!isLocked && !isActive) { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)'; (e.currentTarget as HTMLDivElement).style.transform = ''; } }}>

      {/* Активная полоска */}
      {isActive && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--accent-emerald), #4caf50)', borderRadius: '14px 14px 0 0' }} />}

      <div style={{ padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>

        {/* ── Шапка ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <TierBadge tier={tier} size="sm" />
            <h3 style={{
              fontWeight: 700, fontSize: 14, lineHeight: 1.2,
              color: isActive ? 'var(--accent-emerald)' : 'var(--text-primary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{action.name}</h3>
          </div>

          {isLocked ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontFamily: 'var(--app-font-mono)', fontWeight: 700, color: 'var(--accent-ruby)', background: 'var(--accent-ruby-bg)', border: '1px solid rgba(192,40,30,0.3)', padding: '2px 6px', borderRadius: 6, flexShrink: 0 }}>
              <Lock size={9} /> {action.levelRequired}
            </span>
          ) : (
            <span style={{ fontSize: 11, fontFamily: 'var(--app-font-mono)', fontWeight: 800, padding: '2px 6px', borderRadius: 6, border: `1px solid ${isActive ? 'var(--accent-emerald)' : 'var(--border-default)'}`, color: isActive ? 'var(--accent-emerald)' : 'var(--text-gold)', background: isActive ? 'var(--accent-emerald-bg)' : 'var(--bg-card-dark)', flexShrink: 0 }}>
              M{masteryLevel}
            </span>
          )}
        </div>

        {/* ── Полоса мастерства ── */}
        {!isLocked && (
          <div className="g-bar-track" style={{ height: 5 }}>
            <div className="g-bar-mastery" style={{ height: '100%', width: `${Math.min(100, masteryProgress * 100)}%`, borderRadius: 9999, transition: 'width 0.3s' }} />
          </div>
        )}

        {/* ── Иконка добычи ── */}
        {outputItem && visual && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--bg-card-dark)', border: '1px solid var(--border-light)', borderRadius: 10 }}>
            {/* Ячейка иконки 44×44 */}
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg-slot)', border: '1px solid var(--border-slot)', boxShadow: 'var(--shadow-slot)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '10%' }}>
              {visual.type === 'image' ? (
                <img src={visual.value} alt={outputItem.name} loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 1px 3px rgba(45,31,15,0.2))' }} />
              ) : (
                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{visual.value}</span>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--app-font-mono)', textTransform: 'uppercase', fontWeight: 700 }}>Добыча</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{outputItem.name}</div>
            </div>
          </div>
        )}

        {/* ── Стат-строки ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, fontFamily: 'var(--app-font-mono)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Zap size={11} color="var(--accent-gold)" /> Опыт</span>
            <span style={{ fontWeight: 700, color: 'var(--text-gold)' }}>{formatNumber(action.xp)} XP</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} color="var(--text-muted)" /> Время</span>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{(action.interval / 1000).toFixed(1)} с.</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Темп</span>
            <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{xpPerHour(action.xp, action.interval)}</span>
          </div>
          {renderExtra && (
            <div style={{ paddingTop: 6, marginTop: 2, borderTop: '1px solid var(--border-light)', fontFamily: 'var(--app-font-sans)' }}>
              {renderExtra}
            </div>
          )}
        </div>

        {/* ── Кнопка ── */}
        <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-light)' }}>
          {isLocked ? (
            <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-card-dark)', border: '1px solid var(--border-light)', borderRadius: 8, padding: '6px 0' }}>
              🔒 Ур. {action.levelRequired}
            </div>
          ) : isActive ? (
            <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--accent-emerald)', background: 'var(--accent-emerald-bg)', border: '1px solid var(--accent-emerald)', borderRadius: 8, padding: '6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 6px var(--accent-emerald)', display: 'inline-block' }} />
              В процессе…
            </div>
          ) : (
            <div className="g-btn-primary" style={{ textAlign: 'center', fontSize: 11, padding: '7px 0', borderRadius: 8 }}>
              Начать →
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
