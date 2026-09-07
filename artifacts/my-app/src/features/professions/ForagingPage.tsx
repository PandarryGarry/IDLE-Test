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
import { skillNameRu } from '@/lib/skillNames';
import { SkillHeader } from '@/features/professions/SkillHeader';
import { useTranslation } from '@/hooks/useTranslation';
import { GModal } from '@/shared/ui/gameUI';
import { Info, Leaf, Lock, Play, Square, X } from 'lucide-react';
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

/* ── Карточка зоны ───────────────────────────────────────────── */

function ZoneCard({
  zone,
  level,
  active,
  onToggle,
  onInfo,
}: {
  zone: ForagingZone;
  level: number;
  active: boolean;
  onToggle: () => void;
  onInfo: () => void;
}) {
  const { t } = useTranslation();
  const locked = level < zone.levelRequired;

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

      <div style={{ padding: '11px 11px 10px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {/* Шапка: имя и иконка на всю ширину карточки */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(160deg,#2a1508,#1c0d04)', border: '1px solid #6b3c16',
            fontSize: 17,
          }}>{zone.icon}</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: locked ? '#9a7a50' : '#fff8d0', lineHeight: 1.18, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {zone.name}
            </div>
            <div style={{ fontSize: 9, color: locked ? '#9a7a50' : '#a97836', fontFamily: 'var(--app-font-mono)', fontWeight: 700, marginTop: 2 }}>
              {skillNameRu('foraging')} · {zone.levelRequired} ур.
            </div>
          </div>
        </div>

        {/* Нижняя строка шапки: инфо + статус */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            title={`${zone.name} — добыча, опасность и описание`}
            onClick={e => { e.stopPropagation(); onInfo(); }}
            style={{ width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9999, fontSize: 10, fontFamily: 'var(--app-font-mono)', fontWeight: 800, color: '#f0c030', background: 'rgba(15,8,0,0.62)', border: '1px solid #6b4020', cursor: 'pointer', padding: 0 }}
          >
            <Info size={12} />
          </button>

          {locked ? (
            <span
              title={`Нужен уровень Сбора ${zone.levelRequired}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 9999, fontSize: 10, fontFamily: 'var(--app-font-mono)', fontWeight: 800, color: '#ff7060', background: 'rgba(200,40,20,0.14)', border: '1px solid rgba(200,40,20,0.25)' }}
            >
              <Lock size={11} /> {zone.levelRequired} ур.
            </span>
          ) : active ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 9999, fontSize: 10, fontFamily: 'var(--app-font-mono)', fontWeight: 800, color: '#4ade80', background: 'rgba(30,160,80,0.12)', border: '1px solid rgba(30,160,80,0.3)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px rgba(74,222,128,0.8)' }} /> идёт сбор
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 9999, fontSize: 10, fontFamily: 'var(--app-font-mono)', fontWeight: 800, color: '#c8a050', background: 'rgba(200,136,10,0.1)', border: '1px solid rgba(200,136,10,0.22)' }}>
              {zone.danger.enemyChance}% <span className="hidden sm:inline">{t('foraging.danger')}</span>
            </span>
          )}
        </div>

        {/* Описание и добыча в карточке скрыты — они изучаются в инфо-окне зоны */}
        {/* Низ: компактные мета-данные + кнопка */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, paddingTop: 8, borderTop: '1px solid rgba(90,50,16,0.35)', fontFamily: 'var(--app-font-mono)', fontSize: 9 }}>
            <span style={{ color: '#9a7a50' }}>Опыт <b style={{ color: '#c8a050' }}>+{zone.xp}</b></span>
            <span style={{ color: '#9a7a50' }}>{(zone.interval / 1000).toFixed(1)} с</span>
            <span style={{ color: '#9a7a50' }}>Мастер. <b style={{ color: '#c8a050' }}>+{zone.masteryXp}</b></span>
          </div>

          <div style={{ marginTop: 7 }}>
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

/* ── Инфо-карточка отдельной зоны ────────────────────────────── */

function ZoneInfoModal({ zone, onClose }: { zone: ForagingZone | null; onClose: () => void }) {
  if (!zone) return null;
  const totalLoot = totalWeight(zone.lootTable);
  const rareTotal = totalWeight(zone.rareTable);

  return (
    <GModal open onClose={onClose} title={`${zone.icon} ${zone.name}`} width={460}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Описание */}
        <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(22,11,3,0.5)', border: '1px solid #4a2c15' }}>
          <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#f0c030', marginBottom: 4, fontFamily: 'var(--app-font-mono)' }}>
            Описание
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#e8d0a0', lineHeight: 1.5 }}>{zone.description}</p>
        </div>

        {/* Характеристики зоны */}
        <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(22,11,3,0.5)', border: '1px solid #4a2c15' }}>
          <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#f0c030', marginBottom: 7, fontFamily: 'var(--app-font-mono)' }}>
            Параметры
          </div>
          <div className="grid grid-cols-3 gap-2" style={{ fontFamily: 'var(--app-font-mono)' }}>
            <div className="rounded-lg px-2 py-1.5 text-center" style={{ background: 'rgba(30,16,6,0.6)', border: '1px solid rgba(90,50,16,0.5)' }}>
              <div style={{ fontSize: 9, color: '#9a7a50' }}>Требуется</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#f5d060' }}>{zone.levelRequired} ур.</div>
            </div>
            <div className="rounded-lg px-2 py-1.5 text-center" style={{ background: 'rgba(30,16,6,0.6)', border: '1px solid rgba(90,50,16,0.5)' }}>
              <div style={{ fontSize: 9, color: '#9a7a50' }}>Опыт</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#f5d060' }}>+{zone.xp}</div>
            </div>
            <div className="rounded-lg px-2 py-1.5 text-center" style={{ background: 'rgba(30,16,6,0.6)', border: '1px solid rgba(90,50,16,0.5)' }}>
              <div style={{ fontSize: 9, color: '#9a7a50' }}>Цикл</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#f5d060' }}>{(zone.interval / 1000).toFixed(1)} с</div>
            </div>
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: '#9a7a50' }}>Мастерство за цикл: <b style={{ color: '#c8a050' }}>+{zone.masteryXp}</b></div>
        </div>

        {/* Добыча */}
        <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(22,11,3,0.5)', border: '1px solid #4a2c15' }}>
          <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#f0c030', marginBottom: 7, fontFamily: 'var(--app-font-mono)' }}>
            Добыча ({zone.lootTable.length})
          </div>
          <div className="space-y-1.5">
            {zone.lootTable.map(entry => {
              const percent = weightPercent(entry.weight, totalLoot);
              const qty = entry.quantity[0] !== entry.quantity[1]
                ? ` · ${entry.quantity[0]}–${entry.quantity[1]} шт.`
                : ` · ${entry.quantity[0]} шт.`;
              return (
                <div key={entry.itemId} className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: 'rgba(30,16,6,0.55)', border: '1px solid rgba(90,50,16,0.35)' }}>
                  <ItemVisual itemId={entry.itemId} size={26} />
                  <span style={{ flex: 1, minWidth: 0, fontSize: 11, fontWeight: 600, color: '#fff8d0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getItem(entry.itemId)?.name ?? entry.itemId}
                  </span>
                  <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 11, fontWeight: 800, color: '#f0c030', flexShrink: 0 }}>{percent}%</span>
                  <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 9, color: '#9a7a50', flexShrink: 0 }}>{qty}</span>
                </div>
              );
            })}
          </div>

          {zone.rareTable.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#c8880a', margin: '10px 0 6px', fontFamily: 'var(--app-font-mono)' }}>
                ✦ Редкие находки ({zone.rareTable.length})
              </div>
              <div className="space-y-1.5">
                {zone.rareTable.map(entry => {
                  const percent = weightPercent(entry.weight, rareTotal);
                  return (
                    <div key={entry.itemId} className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: 'rgba(46,26,12,0.6)', border: '1px solid rgba(200,136,10,0.3)' }}>
                      <ItemVisual itemId={entry.itemId} size={26} />
                      <span style={{ flex: 1, minWidth: 0, fontSize: 11, fontWeight: 600, color: '#fff8d0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getItem(entry.itemId)?.name ?? entry.itemId}
                      </span>
                      <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 11, fontWeight: 800, color: '#f0c030', flexShrink: 0 }}>{percent}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Опасность */}
        <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(22,11,3,0.5)', border: '1px solid #4a2c15' }}>
          <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#fda4af', marginBottom: 7, fontFamily: 'var(--app-font-mono)' }}>
            Опасность — встреча {zone.danger.enemyChance}%
          </div>
          {zone.danger.enemies.length > 0 ? (
            <div className="space-y-1.5">
              {zone.danger.enemies.map((enemy, i) => (
                <div key={`${enemy.monsterId}-${i}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: 'rgba(30,16,6,0.55)', border: `1px solid ${enemy.boss ? 'rgba(200,136,10,0.4)' : 'rgba(90,50,16,0.35)'}` }}>
                  <img src={mobIconUrl(enemy.iconPath)} alt="" style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} />
                  <span style={{ flex: 1, minWidth: 0, fontSize: 11, fontWeight: 600, color: '#fff8d0' }}>
                    {enemy.boss ? 'Босс зоны' : 'Моб зоны'}
                  </span>
                  <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 10, color: enemy.boss ? '#f0c030' : '#c8880a' }}>
                    вес {enemy.weight}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 11, color: '#9a7a50' }}>В этой зоне безопасно — монстры не встречаются.</p>
          )}
        </div>
      </div>
    </GModal>
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
  const [zoneInfoId, setZoneInfoId] = useState<string | null>(null);

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
      <SkillHeader skillId="foraging" skillName={t('skill.foraging')} skillIcon="🌿" compact />

      {/* Заголовок зон + кнопка «инфо» */}
      <div className="flex items-center justify-between px-1 pt-1">
        <h2 className="text-xs font-extrabold uppercase tracking-widest font-mono flex items-center gap-1.5" style={{ color: '#f0c030', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
          <Leaf size={14} /> Участки поиска
        </h2>
        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 9999, fontSize: 10, fontWeight: 800, color: '#f0c030', background: 'rgba(15,8,0,0.62)', border: '1px solid #6b4020', cursor: 'pointer', fontFamily: 'var(--app-font-mono)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}
        >
          <Info size={12} /> О профессии
        </button>
      </div>

      {/* Сетка зон — компактная, чтобы страница помещалась на экран */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
        {FORAGING_ZONES.map(zone => (
          <ZoneCard
            key={zone.id}
            zone={zone}
            level={level}
            active={activeSkill === 'foraging' && activeActionId === zone.id}
            onToggle={() => handleToggle(zone.id)}
            onInfo={() => setZoneInfoId(zone.id)}
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
          <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
            {lootFeed.slice(0, 12).map(entry => <FeedRow key={entry.id} entry={entry} />)}
          </div>
        </div>
      )}

      <ForagingInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} level={level} stats={stats} />
      <ZoneInfoModal zone={zoneInfoId ? FORAGING_ZONES_MAP[zoneInfoId] ?? null : null} onClose={() => setZoneInfoId(null)} />
    </div>
  );
}
