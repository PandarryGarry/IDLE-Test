import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useForagingStore } from '@/store/foragingStore';
import { usePlayerStore } from '@/store/playerStore';
import { useProfessionStatsStore, getEffectiveProfessionStats } from '@/store/professionStatsStore';
import {
  FORAGING_ZONES,
  FORAGING_ZONES_MAP,
  mobIconUrl,
  type ForagingZone,
} from '@/domain/professions/foraging';
import { getItem } from '@/domain/items';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { SkillHeader } from '@/features/professions/SkillHeader';
import { ActionProgressBar } from '@/features/professions/ActionProgressBar';
import { useTranslation } from '@/hooks/useTranslation';
import { formatNumber } from '@/lib/utils';
import { Clock, Leaf, Lock, Square, Swords, X } from 'lucide-react';
import type { ForagingFeedEntry } from '@/store/foragingStore';

function ItemVisual({ itemId, size = 36 }: { itemId: string; size?: number }) {
  const item = getItem(itemId);
  const visual = getItemVisual(itemId);
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #3d2010, #2e1608)',
        border: '1px solid #6b3810',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {visual.type === 'image' ? (
        <img src={visual.value} alt={item?.name ?? itemId} loading="lazy"
          style={{ width: '78%', height: '78%', objectFit: 'contain', filter: 'drop-shadow(0 1px 3px rgba(45,31,15,0.2))' }} />
      ) : (
        <span style={{ fontSize: size * 0.5, lineHeight: 1 }}>{visual.value}</span>
      )}
    </span>
  );
}

function ItemLine({ itemId, quantity }: { itemId: string; quantity: number }) {
  const item = getItem(itemId);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
      <span className="shrink-0"><ItemVisual itemId={itemId} size={22} /></span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#fff8d0', fontWeight: 600 }}>
        {item?.name ?? itemId}
      </span>
      <span style={{ color: '#f0c030', fontFamily: 'var(--app-font-mono)', fontWeight: 800 }}>×{quantity}</span>
    </span>
  );
}

function totalWeight(items: { weight: number }[]): number {
  return items.reduce((sum, e) => sum + Math.max(0, e.weight), 0);
}

function weightPercent(weight: number, total: number): string {
  const pct = total > 0 ? (Math.max(0, weight) / total) * 100 : 0;
  return `${(pct).toFixed(1)}%`;
}

function ZoneCard({
  zone,
  level,
  active,
  onToggle,
}: {
  zone: ForagingZone;
  level: number;
  active: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const locked = level < zone.levelRequired;
  const totalLoot = totalWeight(zone.lootTable);
  const hasRare = zone.rareTable.length > 0;
  const rareEntries = zone.rareTable.slice(0, 3);

  const cardStyle: React.CSSProperties = locked
    ? { background: '#241408', border: '2px solid #2a1a0c', opacity: 0.62, filter: 'grayscale(0.45)', cursor: 'not-allowed' }
    : active
      ? { background: 'linear-gradient(160deg, #4a2c0a, #2e1a06)', border: '2px solid #c8880a', boxShadow: '0 3px 0 #2a1005, 0 0 18px rgba(200,136,10,0.28)' }
      : { background: 'linear-gradient(180deg, #c89858 0%, #a07840 100%)', border: '2px solid #5a3010', boxShadow: '0 3px 0 #3d1e08, inset 0 1px 0 rgba(220,170,80,0.2)', cursor: 'pointer' };

  return (
    <div
      onClick={() => { if (!locked) onToggle(); }}
      style={{ ...cardStyle, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease', userSelect: 'none', position: 'relative' }}
      onMouseEnter={e => { if (!locked && !active) { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-hover)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; } }}
      onMouseLeave={e => { if (!locked && !active) { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)'; (e.currentTarget as HTMLDivElement).style.transform = ''; } }}
    >
      {active && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #c8880a, #f0c030, #ffd700)' }} />}

      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {/* Шапка */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 24, lineHeight: 1 }}>{zone.icon}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: locked ? '#c8a050' : '#fff8d0', lineHeight: 1.15, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                {zone.name}
              </div>
              <div style={{ fontSize: 10, color: locked ? '#a07030' : '#f0c030', fontFamily: 'var(--app-font-mono)', fontWeight: 700 }}>
                {locked ? `🔒 Ур. ${zone.levelRequired}` : `Ур. ${zone.levelRequired}`}
              </div>
            </div>
          </div>
          {active ? (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onToggle(); }}
              className="shrink-0 px-3 py-1.5 bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white border border-red-500/40 font-bold rounded-lg transition-all text-xs active:scale-95 flex items-center gap-1"
            >
              <Square className="w-3 h-3 fill-current" /> {t('foraging.stop')}
            </button>
          ) : locked ? (
            <span className="shrink-0 flex items-center gap-1 text-[11px] font-mono font-extrabold text-[#ff7060] bg-[var(--accent-ruby-bg)] border border-[rgba(192,40,30,0.3)] px-2 py-1 rounded-md">
              <Lock size={10} /> {zone.levelRequired}
            </span>
          ) : (
            <span className="shrink-0 text-[11px] font-mono font-extrabold text-[#4ade80] bg-[rgba(200,136,10,0.15)] border border-[rgba(200,136,10,0.5)] px-2 py-1 rounded-md">
              {t('foraging.selectSpot')}
            </span>
          )}
        </div>

        {/* Описание */}
        <p style={{ fontSize: 11, color: locked ? '#c8a050' : '#5b3410', lineHeight: 1.35, margin: 0 }}>
          {zone.description}
        </p>

        {/* Возможная добыча */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: locked ? '#a07030' : '#7a4510', fontFamily: 'var(--app-font-mono)' }}>
            Возможная добыча
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {zone.previewItemIds.map(itemId => {
              const entry = zone.lootTable.find(e => e.itemId === itemId);
              return (
                <span
                  key={itemId}
                  title={entry ? `${getItem(itemId)?.name ?? itemId} — ${weightPercent(entry.weight, totalLoot)}${entry.quantity[0] !== entry.quantity[1] ? ` (${entry.quantity[0]}–${entry.quantity[1]})` : ''}` : getItem(itemId)?.name}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 6px', borderRadius: 8, background: locked ? 'rgba(0,0,0,0.18)' : 'rgba(30,14,4,0.5)', border: `1px solid ${locked ? '#2a1a0c' : '#6b3810'}` }}
                >
                  <ItemVisual itemId={itemId} size={22} />
                  <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 9, fontWeight: 700, color: locked ? '#c8a050' : '#f0c840' }}>
                    {entry ? weightPercent(entry.weight, totalLoot) : ''}
                  </span>
                </span>
              );
            })}
          </div>
          {hasRare && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: locked ? '#a07030' : '#7a4510', fontFamily: 'var(--app-font-mono)', fontWeight: 700 }}>Редк.</span>
              {rareEntries.map(entry => (
                <span
                  key={entry.itemId}
                  title={`${getItem(entry.itemId)?.name ?? entry.itemId} — ${weightPercent(entry.weight, totalWeight(zone.rareTable))}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 5px', borderRadius: 8, background: locked ? 'rgba(0,0,0,0.18)' : 'rgba(124,80,16,0.35)', border: `1px solid ${locked ? '#2a1a0c' : '#8b5020'}` }}
                >
                  <ItemVisual itemId={entry.itemId} size={18} />
                  <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 9, fontWeight: 700, color: '#fbbf24' }}>
                    {weightPercent(entry.weight, totalWeight(zone.rareTable))}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Опасность */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: locked ? '#a07030' : '#7a4510', fontFamily: 'var(--app-font-mono)' }}>
            <Swords size={11} /> Опасность
            <span style={{ marginLeft: 'auto', fontWeight: 800, color: locked ? '#a07030' : '#b45309' }}>{zone.danger.enemyChance}%</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {zone.danger.enemies.map((enemy, i) => (
              <span
                key={`${enemy.monsterId}-${i}`}
                title={enemy.boss ? 'Босс' : 'Встреча'}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 5px', borderRadius: 8, background: locked ? 'rgba(0,0,0,0.18)' : 'rgba(95,26,18,0.3)', border: `1px solid ${enemy.boss ? '#fbbf24' : locked ? '#2a1a0c' : '#8b3a2a'}` }}
              >
                <img src={mobIconUrl(enemy.iconPath)} alt="" style={{ width: 18, height: 18, objectFit: 'contain', filter: enemy.boss ? 'drop-shadow(0 0 3px rgba(251,191,36,0.9))' : 'none' }} />
                <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 9, fontWeight: 700, color: enemy.boss ? '#fbbf24' : locked ? '#c8a050' : '#c86a4a' }}>
                  {weightPercent(enemy.weight, totalWeight(zone.danger.enemies))}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Низ */}
        <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: `1px solid ${locked ? 'rgba(160,112,48,0.2)' : 'rgba(91,52,16,0.25)'}`, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, fontFamily: 'var(--app-font-mono)', fontSize: 10 }}>
          <div>
            <div style={{ color: locked ? '#a07030' : '#7a4510', fontSize: 9 }}>Опыт</div>
            <div style={{ fontWeight: 800, color: locked ? '#c8a050' : '#f0c030' }}>{zone.xp} XP</div>
          </div>
          <div>
            <div style={{ color: locked ? '#a07030' : '#7a4510', fontSize: 9 }}>Время</div>
            <div style={{ fontWeight: 700, color: locked ? '#c8a050' : '#e0b850' }}>{(zone.interval / 1000).toFixed(1)}с</div>
          </div>
          <div>
            <div style={{ color: locked ? '#a07030' : '#7a4510', fontSize: 9 }}>Мастер.</div>
            <div style={{ fontWeight: 700, color: locked ? '#c8a050' : '#4ade80' }}>+{zone.masteryXp}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedRow({ entry }: { entry: ForagingFeedEntry }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 9px', borderRadius: 10, background: 'rgba(30,14,4,0.45)', border: '1px solid #4a2a12' }}>
      <span style={{ fontSize: 13, lineHeight: 1.3, color: '#c8a050', fontWeight: 800, flexShrink: 0, fontFamily: 'var(--app-font-mono)' }}>
        {FORAGING_ZONES_MAP[entry.zoneId]?.icon ?? '🌿'}
      </span>
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--app-font-mono)', color: '#a07030', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span>{FORAGING_ZONES_MAP[entry.zoneId]?.name ?? entry.zoneId}</span>
          <span>{new Date(entry.ts).toLocaleTimeString()}</span>
        </div>
        {entry.items.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {entry.items.map((it, i) => <ItemLine key={`${entry.id}-${i}`} itemId={it.itemId} quantity={it.quantity} />)}
          </div>
        ) : entry.empty ? (
          <span style={{ fontSize: 11, color: '#8a6a42' }}>Пустой цикл — в этот раз ничего не нашлось…</span>
        ) : null}
        {entry.encounter && (
          <span style={{ fontSize: 11, color: '#fda4af', fontWeight: 700 }}>⚔ Моб преградил путь → бой</span>
        )}
      </div>
    </div>
  );
}

export function ForagingPage() {
  const { t } = useTranslation();
  const level = usePlayerStore(s => s.skills.foraging?.level ?? 1);
  const activeSkill = useGameStore(s => s.activeSkill);
  const activeActionId = useGameStore(s => s.activeActionId);
  const activeZoneId = useForagingStore(s => s.activeZoneId);
  const lootFeed = useForagingStore(s => s.lootFeed);
  const sessionXp = useForagingStore(s => s.sessionXp);
  const start = useForagingStore(s => s.start);
  const stop = useForagingStore(s => s.stop);
  const statTouched = useProfessionStatsStore(s => s.touchedAt);

  const stats = useMemo(() => getEffectiveProfessionStats('foraging', level), [level, statTouched]);

  const activeZone = activeZoneId ? FORAGING_ZONES_MAP[activeZoneId] : undefined;
  const isTraining = activeSkill === 'foraging' && !!activeZone;

  const handleToggle = (zoneId: string) => {
    if (activeSkill === 'foraging' && activeActionId === zoneId) {
      stop();
    } else {
      start(zoneId);
    }
  };

  return (
    <div className="space-y-4">
      <SkillHeader skillId="foraging" skillName={t('skill.foraging')} skillIcon="🌿" />

      {/* Активная панель */}
      <div
        className="rounded-2xl p-4 sm:p-5 relative overflow-hidden transition-all"
        style={{
          background: isTraining
            ? 'linear-gradient(160deg, #1f3a0a, #142608)'
            : 'linear-gradient(160deg, #3c5a1e, #2e4416)',
          border: isTraining ? '2px solid #84cc16' : '2px solid #2f4a12',
          boxShadow: isTraining ? '0 3px 0 #10200a, 0 0 20px rgba(132,204,22,0.2)' : '0 3px 0 #1a2e0c',
        }}
      >
        {isTraining && activeZone ? (
          <div className="space-y-3.5 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(132,204,22,0.16)', border: '2px solid rgba(132,204,22,0.5)', boxShadow: '0 0 12px rgba(132,204,22,0.25)' }}
                >
                  {activeZone.icon ? <span style={{ fontSize: 26 }}>{activeZone.icon}</span> : <Leaf className="w-6 h-6" style={{ color: '#bef264' }} />}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <span>{t('foraging.searching')}</span>
                    <span style={{ color: '#d9f99d', fontWeight: 800 }}>{activeZone.name}</span>
                  </h3>
                  <p className="text-[var(--text-secondary)] text-xs font-mono mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-lime-400" />
                    <span>{(activeZone.interval / 1000).toFixed(1)} сек. за цикл</span>
                    <span style={{ color: '#d9f99d' }}>· сессия +{formatNumber(sessionXp)} XP</span>
                  </p>
                </div>
              </div>

              <button
                onClick={stop}
                className="shrink-0 px-5 py-2.5 bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white border border-red-500/40 font-bold rounded-2xl transition-all text-xs active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t('foraging.stop')}</span>
              </button>
            </div>

            <div className="pt-1">
              <ActionProgressBar height="h-3" color="green" />
            </div>
          </div>
        ) : (
          <div className="text-center text-[var(--text-secondary)] flex flex-col items-center gap-2 py-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-light)' }}
            >
              <Leaf className="w-6 h-6 text-[var(--text-muted)]" />
            </div>
            <p className="text-xs font-medium" style={{ color: '#d9f99d', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{t('foraging.selectSpot')}</p>
          </div>
        )}
      </div>

      {/* Характеристики профессии */}
      <div className="rounded-2xl p-4" style={{ background: '#1c1108', border: '1px solid #3a2b1a' }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-extrabold uppercase tracking-widest font-mono text-[#bef264]">Характеристики «Сбора»</h2>
          <span className="text-[10px] font-mono text-[#a07030]">Ур. {level}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {stats.map(stat => (
            <div key={stat.def.id} style={{ padding: '8px 10px', borderRadius: 10, background: stat.unlocked ? 'rgba(200,136,10,0.1)' : 'rgba(0,0,0,0.15)', border: `1px solid ${stat.unlocked ? 'rgba(200,136,10,0.35)' : '#2a1a0c'}`, opacity: stat.unlocked ? 1 : 0.55 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 800, color: stat.unlocked ? '#f0c840' : '#8a6a42' }}>
                <span>{stat.def.icon}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stat.def.nameRu}</span>
              </div>
              <div style={{ fontFamily: 'var(--app-font-mono)', fontSize: 13, fontWeight: 900, color: stat.unlocked ? '#f5d060' : '#a07030', marginTop: 2 }}>
                {stat.unlocked ? (stat.def.kind === 'flat' ? `${stat.value}` : `${stat.value}%`) : `Ур. ${stat.def.unlockLevel}`}
              </div>
              <div style={{ fontSize: 9, color: '#a07030', fontFamily: 'var(--app-font-mono)' }}>
                {stat.def.tier === 'master' ? 'мастер' : 'старт'} · от {stat.def.unlockLevel} ур.
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Сетка зон */}
      <div className="flex items-center justify-between px-1 pt-1">
        <h2 className="text-xs font-extrabold uppercase tracking-widest font-mono flex items-center gap-1.5" style={{ color: '#bef264', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
          <span>🌿</span> {t('foraging.availableSpots')}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {FORAGING_ZONES.map(zone => (
          <ZoneCard
            key={zone.id}
            zone={zone}
            level={level}
            active={activeSkill === 'foraging' && activeActionId === zone.id}
            onToggle={() => handleToggle(zone.id)}
          />
        ))}
      </div>

      {/* Лента находок */}
      {lootFeed.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: '#1c1108', border: '1px solid #3a2b1a' }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-extrabold uppercase tracking-widest font-mono text-[#bef264]">Лента находок</h2>
            <button
              type="button"
              onClick={() => useForagingStore.getState().clearLootFeed()}
              className="text-[11px] font-mono text-[#a07030] hover:text-[#f0c840] transition-colors flex items-center gap-1"
            >
              <X size={12} /> Очистить
            </button>
          </div>
          <div className="space-y-1.5">
            {lootFeed.map(entry => <FeedRow key={entry.id} entry={entry} />)}
          </div>
        </div>
      )}
    </div>
  );
}
