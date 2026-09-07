import { useMemo, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useForagingStore } from '@/store/foragingStore';
import { usePlayerStore } from '@/store/playerStore';
import { useProfessionStatsStore, getEffectiveProfessionStats, type EffectiveProfessionStat } from '@/store/professionStatsStore';
import {
  FORAGING_ZONES,
  FORAGING_ZONES_MAP,
  mobIconUrl,
  getForagingAttributeSnapshot,
  type ForagingZone,
} from '@/domain/professions/foraging';
import { getItem } from '@/domain/items';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { SkillHeader } from '@/features/professions/SkillHeader';
import { useTranslation } from '@/hooks/useTranslation';
import { GModal } from '@/shared/ui/gameUI';
import { Info, Leaf, Lock, Play, Square, Swords, X } from 'lucide-react';
import type { ForagingFeedEntry } from '@/store/foragingStore';

/* ── Утилиты / мелкие компоненты ─────────────────────────────── */

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

function totalWeight(items: { weight: number }[]): number {
  return items.reduce((sum, e) => sum + Math.max(0, e.weight), 0);
}

function weightPercent(weight: number, total: number): string {
  const pct = total > 0 ? (Math.max(0, weight) / total) * 100 : 0;
  return pct.toFixed(pct >= 10 ? 0 : 1).replace('.', ',');
}

function formatStatValue(stat: EffectiveProfessionStat): string {
  if (stat.def.kind === 'flat') return `${stat.value}`;
  const pct = stat.value.toFixed(stat.value >= 10 ? 0 : 1).replace('.', ',');
  return `${pct}%`;
}

function StatChip({ itemId, percent, title }: { itemId: string; percent: string; title: string }) {
  return (
    <span
      title={title}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 7px', borderRadius: 9999, background: 'rgba(22,11,3,0.55)', border: '1px solid #5a3210' }}
    >
      <ItemVisual itemId={itemId} size={22} />
      <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 10, fontWeight: 700, color: '#f0c030' }}>{percent}%</span>
    </span>
  );
}

/* ── Карточка зоны ───────────────────────────────────────────── */

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
    ? { background: 'linear-gradient(180deg,#1b120a,#160d06)', border: '1px solid #2a1c10', opacity: 0.72, filter: 'grayscale(0.4)', cursor: 'not-allowed' }
    : active
      ? { background: 'linear-gradient(180deg,#27170a,#1d1005)', border: '1px solid #c8880a', boxShadow: '0 0 0 1px rgba(200,136,10,0.25), 0 0 22px rgba(200,136,10,0.16)' }
      : { background: 'linear-gradient(180deg,#241408,#1a0e05)', border: '1px solid #4a2c15', boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset', cursor: 'pointer' };

  return (
    <div
      role="button"
      tabIndex={locked ? -1 : 0}
      onClick={() => { if (!locked) onToggle(); }}
      onKeyDown={e => { if (!locked && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onToggle(); } }}
      style={{ ...cardStyle, borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.18s ease', userSelect: 'none', position: 'relative' }}
      onMouseEnter={e => { if (!locked && !active) { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.borderColor = '#c8880a'; } }}
      onMouseLeave={e => { if (!locked && !active) { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.borderColor = ''; } }}
    >
      {active && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#c8880a,#f0c030)' }} />}

      <div style={{ padding: '14px 14px 13px', display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
        {/* Шапка */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
            <span style={{
              width: 38, height: 38, borderRadius: 11, flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(160deg,#2a1508,#1c0d04)', border: '1px solid #6b3c16',
            }}>{zone.icon}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: locked ? '#9a7a50' : '#fff8d0', lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {zone.name}
              </div>
              <div style={{ fontSize: 10, color: locked ? '#9a7a50' : '#a97836', fontFamily: 'var(--app-font-mono)', fontWeight: 700, marginTop: 2 }}>
                {t('skill.foraging')} · {zone.levelRequired} ур.
              </div>
            </div>
          </div>

          {locked ? (
            <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 9999, fontSize: 10, fontFamily: 'var(--app-font-mono)', fontWeight: 800, color: '#ff7060', background: 'rgba(200,40,20,0.14)', border: '1px solid rgba(200,40,20,0.25)' }}>
              <Lock size={11} /> {zone.levelRequired}
            </span>
          ) : active ? (
            <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 9999, fontSize: 10, fontFamily: 'var(--app-font-mono)', fontWeight: 800, color: '#4ade80', background: 'rgba(30,160,80,0.12)', border: '1px solid rgba(30,160,80,0.3)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px rgba(74,222,128,0.8)' }} /> идёт сбор
            </span>
          ) : (
            <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 9999, fontSize: 10, fontFamily: 'var(--app-font-mono)', fontWeight: 800, color: '#c8a050', background: 'rgba(200,136,10,0.1)', border: '1px solid rgba(200,136,10,0.22)' }}>
              {zone.danger.enemyChance}% {t('foraging.danger')}
            </span>
          )}
        </div>

        {/* Описание */}
        <p style={{ fontSize: 11, color: locked ? '#9a7a50' : '#c8a050', lineHeight: 1.45, margin: 0 }}>
          {zone.description}
        </p>

        {/* Возможная добыча */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9a7a50', fontFamily: 'var(--app-font-mono)' }}>
            {t('foraging.yields')}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {zone.previewItemIds.map(itemId => {
              const entry = zone.lootTable.find(e => e.itemId === itemId);
              const pct = entry ? weightPercent(entry.weight, totalLoot) : '';
              const qty = entry && entry.quantity[0] !== entry.quantity[1] ? `, ${entry.quantity[0]}–${entry.quantity[1]} шт.` : '';
              return <StatChip key={itemId} itemId={itemId} percent={pct} title={`${getItem(itemId)?.name ?? itemId} — ${pct}%${qty}`} />;
            })}
          </div>
          {hasRare && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 9, color: '#c8880a', fontFamily: 'var(--app-font-mono)', fontWeight: 800, letterSpacing: '0.08em' }}>✦ {t('foraging.rare')}</span>
              {rareEntries.map(entry => (
                <StatChip key={entry.itemId} itemId={entry.itemId} percent={weightPercent(entry.weight, totalWeight(zone.rareTable))} title={`${getItem(entry.itemId)?.name ?? entry.itemId}`} />
              ))}
            </div>
          )}
        </div>

        {/* Опасность: только иконки мобов, реальный шанс встречи уже в шапке */}
        {zone.danger.enemies.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Swords size={13} style={{ color: '#9a7a50', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {zone.danger.enemies.map((enemy, i) => (
                <span
                  key={`${enemy.monsterId}-${i}`}
                  title={enemy.boss ? 'Босс зоны' : 'Моб зоны'}
                  style={{ display: 'inline-flex', padding: 4, borderRadius: 9999, background: 'rgba(46,26,12,0.85)', border: `1px solid ${enemy.boss ? '#c8880a' : '#6b3d1c'}` }}
                >
                  <img src={mobIconUrl(enemy.iconPath)} alt="" style={{ width: 22, height: 22, objectFit: 'contain', filter: enemy.boss ? 'drop-shadow(0 0 4px rgba(240,192,48,0.6))' : 'none' }} />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Низ: статы + кнопка */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, paddingTop: 10, borderTop: '1px solid rgba(90,50,16,0.35)', fontFamily: 'var(--app-font-mono)', fontSize: 10 }}>
            <div>
              <div style={{ fontSize: 9, color: '#9a7a50' }}>Опыт</div>
              <div style={{ fontWeight: 800, color: '#c8a050' }}>{zone.xp} XP</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: '#9a7a50' }}>Время</div>
              <div style={{ fontWeight: 700, color: '#c8a050' }}>{(zone.interval / 1000).toFixed(1)} с</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: '#9a7a50' }}>Мастер.</div>
              <div style={{ fontWeight: 700, color: '#c8a050' }}>+{zone.masteryXp}</div>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            {locked ? (
              <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#9a7a50', background: 'rgba(30,16,6,0.6)', border: '1px solid rgba(90,50,16,0.5)', borderRadius: 12, padding: '9px 0' }}>
                🔒 Нужен уровень {zone.levelRequired}
              </div>
            ) : active ? (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onToggle(); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 12, fontWeight: 800, color: '#fff8d0', background: 'linear-gradient(180deg,#d03624,#a32012)', border: '1px solid #6b1808', borderRadius: 12, padding: '10px 0', cursor: 'pointer' }}
              >
                <Square size={13} fill="currentColor" /> {t('foraging.stop')}
              </button>
            ) : (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onToggle(); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 12, fontWeight: 800, color: '#fff8d0', background: 'linear-gradient(180deg,#c8880a,#9a6008)', border: '1px solid #6b4008', borderRadius: 12, padding: '10px 0', cursor: 'pointer', boxShadow: '0 3px 0 #3a2404' }}
              >
                <Play size={13} fill="currentColor" /> {t('foraging.start')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Инфо-окно «О профессии» ─────────────────────────────────── */

function ForagingInfoModal({ open, onClose, level, stats }: { open: boolean; onClose: () => void; level: number; stats: EffectiveProfessionStat[] }) {
  const attr = getForagingAttributeSnapshot();

  return (
    <GModal open={open} onClose={onClose} title="Сбор — как это работает" width={440}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Характеристики профессии */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#f0c030', marginBottom: 8, fontFamily: 'var(--app-font-mono)' }}>
            Характеристики профессии
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {stats.map(stat => (
              <div key={stat.def.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', borderRadius: 12, background: 'rgba(22,11,3,0.5)', border: '1px solid #4a2c15' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{stat.def.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: stat.unlocked ? '#fff8d0' : '#c8a050' }}>{stat.def.nameRu}</div>
                  <div style={{ fontSize: 10, color: '#9a7a50', marginTop: 1, lineHeight: 1.3 }}>
                    {stat.unlocked
                      ? (stat.def.cap != null && stat.def.kind !== 'flat' ? `до ${stat.def.cap}%` : stat.def.descriptionRu)
                      : `откроется на ${stat.def.unlockLevel} ур.`}
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 13, fontWeight: 900, color: stat.unlocked ? '#f5d060' : '#9a7a50', flexShrink: 0 }}>
                  {stat.unlocked ? formatStatValue(stat) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Характеристики героя, которые влияют на Сбор */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#f0c030', marginBottom: 8, fontFamily: 'var(--app-font-mono)' }}>
            Что ускоряет сбор
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Темп', value: `${Math.round(attr.tempo)}`, note: '→ скорость цикла' },
              { label: 'Находчивость', value: `${Math.round(attr.resourcefulness)}`, note: '→ редкая находка (+0,05 %/очко)' },
              { label: 'Удача', value: `${attr.luck.toFixed(1).replace('.', ',')}%`, note: '→ двойной лут (+0,1 %/очко)' },
              { label: 'Интуиция', value: `${Math.round(attr.intuition)}`, note: '→ внимание: меньше пустых циклов' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '7px 11px', borderRadius: 10, background: 'rgba(22,11,3,0.4)', border: '1px solid rgba(90,50,16,0.5)' }}>
                <div style={{ fontSize: 12, color: '#fff8d0', fontWeight: 700 }}>{row.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: '#9a7a50' }}>{row.note}</span>
                  <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 12, fontWeight: 900, color: '#f0c030' }}>{row.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ margin: 0, fontSize: 10, color: '#9a7a50', lineHeight: 1.5 }}>
          Сбор не трогает цены продажи. Скидка на покупку и «Мастер-собиратель» открываются на высоких уровнях профессии.
        </p>
      </div>
    </GModal>
  );
}

/* ── Лента находок ───────────────────────────────────────────── */

function FeedRow({ entry }: { entry: ForagingFeedEntry }) {
  const item = (id: string) => getItem(id);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '8px 10px', borderRadius: 12, background: 'rgba(22,11,3,0.45)', border: '1px solid #3a2412' }}>
      <span style={{ fontSize: 13, lineHeight: 1.3, flexShrink: 0, fontFamily: 'var(--app-font-mono)', color: '#c8a050', fontWeight: 800 }}>
        {FORAGING_ZONES_MAP[entry.zoneId]?.icon ?? '🌿'}
      </span>
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--app-font-mono)', color: '#9a7a50', display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          <span>{FORAGING_ZONES_MAP[entry.zoneId]?.name ?? entry.zoneId}</span>
          <span>{new Date(entry.ts).toLocaleTimeString()}</span>
        </div>
        {entry.items.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {entry.items.map((it, i) => (
              <span key={`${entry.id}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <ItemVisual itemId={it.itemId} size={20} />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#fff8d0' }}>{item(it.itemId)?.name ?? it.itemId}</span>
                <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 10, fontWeight: 800, color: '#f0c030' }}>×{it.quantity}</span>
              </span>
            ))}
          </div>
        ) : entry.empty ? (
          <span style={{ fontSize: 11, color: '#9a7a50' }}>Пустой цикл — ничего не нашлось.</span>
        ) : null}
        {entry.encounter && (
          <span style={{ fontSize: 11, color: '#fda4af', fontWeight: 700 }}>⚔ Моб преградил путь → бой</span>
        )}
      </div>
    </div>
  );
}

/* ── Страница ────────────────────────────────────────────────── */

export function ForagingPage() {
  const { t } = useTranslation();
  const level = usePlayerStore(s => s.skills.foraging?.level ?? 1);
  const activeSkill = useGameStore(s => s.activeSkill);
  const activeActionId = useGameStore(s => s.activeActionId);
  const activeZoneId = useForagingStore(s => s.activeZoneId);
  const lootFeed = useForagingStore(s => s.lootFeed);
  const start = useForagingStore(s => s.start);
  const stop = useForagingStore(s => s.stop);
  const statTouched = useProfessionStatsStore(s => s.touchedAt);
  const [infoOpen, setInfoOpen] = useState(false);

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

      {/* Заголовок зон + кнопка «инфо» */}
      <div className="flex items-center justify-between px-1 pt-1">
        <h2 className="text-xs font-extrabold uppercase tracking-widest font-mono flex items-center gap-1.5" style={{ color: '#f0c030', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
          <Leaf size={14} /> {t('foraging.availableSpots')}
        </h2>
        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 9999, fontSize: 10, fontWeight: 800, color: '#f0c030', background: 'rgba(15,8,0,0.62)', border: '1px solid #6b4020', cursor: 'pointer', fontFamily: 'var(--app-font-mono)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}
        >
          <Info size={12} /> {t('foraging.info')}
        </button>
      </div>

      {/* Сетка зон */}
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
            <h2 className="text-xs font-extrabold uppercase tracking-widest font-mono text-[#f0c030]">Лента находок</h2>
            <button
              type="button"
              onClick={() => useForagingStore.getState().clearLootFeed()}
              className="text-[11px] font-mono text-[#9a7a50] hover:text-[#f0c030] transition-colors flex items-center gap-1"
            >
              <X size={12} /> {t('foraging.clear')}
            </button>
          </div>
          <div className="space-y-2">
            {lootFeed.map(entry => <FeedRow key={entry.id} entry={entry} />)}
          </div>
        </div>
      )}

      <ForagingInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} level={level} stats={stats} />
    </div>
  );
}
