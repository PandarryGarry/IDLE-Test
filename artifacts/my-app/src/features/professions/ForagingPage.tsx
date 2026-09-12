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
  rareFindChance,
  type ForagingZone,
} from '@/domain/professions/foraging';
import { MONSTERS_MAP, monsterIconPath } from '@/domain/combat/monsters';
import { getItem } from '@/domain/items';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { skillNameRu } from '@/lib/skillNames';
import { SkillHeader } from '@/features/professions/SkillHeader';
import { useTranslation } from '@/hooks/useTranslation';
import { GModal } from '@/shared/ui/gameUI';
import { GameButton } from '@/shared/ui/kit/GameButton';
import { Info, Leaf, Lock, Play, Square, X } from 'lucide-react';
import type { ForagingFeedEntry } from '@/store/foragingStore';

/* ── Общие куски стилей (все цвета — из токенов src/index.css) ── */

/** Тёмная плашка-панель внутри страницы/модалки. */
const PANEL_STYLE: React.CSSProperties = {
  background: 'color-mix(in srgb, var(--bg-header) 55%, transparent)',
  border: '1px solid var(--border-strong)',
};

/** Вложенная плашка (строка предмета, параметр и т.п.). */
const INSET_STYLE: React.CSSProperties = {
  background: 'color-mix(in srgb, var(--bg-slot) 38%, transparent)',
  border: '1px solid color-mix(in srgb, var(--border-default) 55%, transparent)',
};

/** Заголовок секции в модалках. */
const SECTION_TITLE_STYLE: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: 'var(--text-gold)',
  fontFamily: 'var(--app-font-mono)',
};

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
        background:
          'linear-gradient(160deg, color-mix(in srgb, var(--bg-slot) 60%, black), color-mix(in srgb, var(--bg-slot) 40%, black))',
        border: '1px solid color-mix(in srgb, var(--border-card) 75%, var(--bg-slot))',
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

/** Формат шанса за цикл: до 10% — с одним знаком, выше — целое. */
function chancePercent(value: number): string {
  const pct = Math.max(0, Math.min(100, value));
  return pct.toFixed(pct < 10 ? 1 : 0).replace('.', ',');
}

/** Шанс обычного предмета за цикл = его вес / сумма весов обычного дропа. */
function normalItemChance(entry: { weight: number }, zone: ForagingZone): number {
  return (Math.max(0, entry.weight) / Math.max(1, totalWeight(zone.lootTable))) * 100;
}

/**
 * Реальный (а не относительный) шанс редкого предмета за цикл:
 * сначала срабатывает отдельный бросок «редкая находка», потом вес внутри rareTable.
 * Поэтому обычный камень/ветка почти всегда имеют больший шанс, чем редкий гриб.
 */
function rareItemChance(entry: { weight: number }, zone: ForagingZone, rareChance: number): number {
  const share = Math.max(0, entry.weight) / Math.max(1, totalWeight(zone.rareTable));
  return (rareChance * share);
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
    ? {
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--bg-header) 75%, black), color-mix(in srgb, var(--bg-header) 60%, black))',
        border: '1px solid color-mix(in srgb, var(--border-strong) 70%, black)',
        opacity: 0.72,
        filter: 'grayscale(0.4)',
        cursor: 'not-allowed',
      }
    : active
      ? {
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--bg-slot) 48%, black), color-mix(in srgb, var(--bg-slot) 30%, black))',
          border: '1px solid var(--border-accent)',
          boxShadow: '0 0 0 1px color-mix(in srgb, var(--border-accent) 25%, transparent), 0 0 22px color-mix(in srgb, var(--border-accent) 16%, transparent)',
        }
      : {
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--bg-header) 88%, black), color-mix(in srgb, var(--bg-header) 70%, black))',
          border: '1px solid var(--border-strong)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset',
          cursor: 'pointer',
        };

  return (
    <div
      role="button"
      tabIndex={locked ? -1 : 0}
      onClick={() => { if (!locked) onToggle(); }}
      onKeyDown={e => { if (!locked && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onToggle(); } }}
      style={{ ...cardStyle, borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.18s ease', userSelect: 'none', position: 'relative' }}
      onMouseEnter={e => { if (!locked && !active) { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-accent)'; } }}
      onMouseLeave={e => { if (!locked && !active) { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.borderColor = ''; } }}
    >
      {active && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--border-accent), var(--text-gold))' }} />}

      <div style={{ padding: '11px 11px 10px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {/* Шапка: имя и иконка на всю ширину карточки */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(160deg, var(--bg-header), color-mix(in srgb, var(--bg-header) 70%, black))',
            border: '1px solid var(--border-card)',
            fontSize: 17,
          }}>{zone.icon}</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: locked ? 'var(--text-faint)' : 'var(--text-primary)', lineHeight: 1.18, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {zone.name}
            </div>
            <div style={{ fontSize: 9, color: locked ? 'var(--text-faint)' : 'color-mix(in srgb, var(--text-muted) 82%, black)', fontFamily: 'var(--app-font-mono)', fontWeight: 700, marginTop: 2 }}>
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
            style={{ width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9999, fontSize: 10, fontFamily: 'var(--app-font-mono)', fontWeight: 800, color: 'var(--text-gold)', background: 'var(--bg-overlay)', border: '1px solid var(--border-card)', cursor: 'pointer', padding: 0 }}
          >
            <Info size={12} />
          </button>

          {locked ? (
            <span
              title={`Нужен уровень Сбора ${zone.levelRequired}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 9999, fontSize: 10, fontFamily: 'var(--app-font-mono)', fontWeight: 800, color: 'var(--badge-red-ink)', background: 'var(--badge-red-bg)', border: '1px solid color-mix(in srgb, var(--badge-red-ink) 30%, transparent)' }}
            >
              <Lock size={11} /> {zone.levelRequired} ур.
            </span>
          ) : active ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 9999, fontSize: 10, fontFamily: 'var(--app-font-mono)', fontWeight: 800, color: 'var(--badge-green-ink)', background: 'var(--badge-green-bg)', border: '1px solid color-mix(in srgb, var(--badge-green-ink) 35%, transparent)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--badge-green-ink)', boxShadow: '0 0 6px var(--badge-green-ink)' }} /> идёт сбор
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 9999, fontSize: 10, fontFamily: 'var(--app-font-mono)', fontWeight: 800, color: 'var(--text-muted)', background: 'color-mix(in srgb, var(--border-accent) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--border-accent) 22%, transparent)' }}>
              {zone.danger.enemyChance}% <span className="hidden sm:inline">{t('foraging.danger')}</span>
            </span>
          )}
        </div>

        {/* Описание и добыча в карточке скрыты — они изучаются в инфо-окне зоны */}
        {/* Низ: компактные мета-данные + кнопка */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, paddingTop: 8, borderTop: '1px solid color-mix(in srgb, var(--border-default) 35%, transparent)', fontFamily: 'var(--app-font-mono)', fontSize: 9 }}>
            <span style={{ color: 'var(--text-faint)' }}>Опыт <b style={{ color: 'var(--text-muted)' }}>+{zone.xp}</b></span>
            <span style={{ color: 'var(--text-faint)' }}>{(zone.interval / 1000).toFixed(1)} с</span>
            <span style={{ color: 'var(--text-faint)' }}>Мастер. <b style={{ color: 'var(--text-muted)' }}>+{zone.masteryXp}</b></span>
          </div>

          <div style={{ marginTop: 7 }}>
            {locked ? (
              <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-faint)', background: 'color-mix(in srgb, var(--bg-header) 60%, transparent)', border: '1px solid color-mix(in srgb, var(--border-default) 45%, transparent)', borderRadius: 12, padding: '9px 0' }}>
                🔒 Нужен уровень {zone.levelRequired}
              </div>
            ) : active ? (
              <GameButton
                variant="danger"
                size="sm"
                className="w-full whitespace-nowrap"
                icon={<Square size={13} fill="currentColor" />}
                onClick={e => { e.stopPropagation(); onToggle(); }}
              >
                {t('foraging.stop')}
              </GameButton>
            ) : (
              <GameButton
                variant="primary"
                size="sm"
                className="w-full whitespace-nowrap"
                icon={<Play size={13} fill="currentColor" />}
                onClick={e => { e.stopPropagation(); onToggle(); }}
              >
                {t('foraging.start')}
              </GameButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Инфо-карточка отдельной зоны ────────────────────────────── */

function ZoneInfoModal({ zone, rareChance, onClose }: { zone: ForagingZone | null; rareChance: number; onClose: () => void }) {
  if (!zone) return null;

  return (
    <GModal open onClose={onClose} title={`${zone.icon} ${zone.name}`} width={460}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Описание */}
        <div className="rounded-xl px-3 py-2.5" style={PANEL_STYLE}>
          <div style={{ ...SECTION_TITLE_STYLE, marginBottom: 4 }}>
            Описание
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'color-mix(in srgb, var(--text-primary) 88%, black)', lineHeight: 1.5 }}>{zone.description}</p>
        </div>

        {/* Характеристики зоны */}
        <div className="rounded-xl px-3 py-2.5" style={PANEL_STYLE}>
          <div style={{ ...SECTION_TITLE_STYLE, marginBottom: 7 }}>
            Параметры
          </div>
          <div className="grid grid-cols-3 gap-2" style={{ fontFamily: 'var(--app-font-mono)' }}>
            <div className="rounded-lg px-2 py-1.5 text-center" style={INSET_STYLE}>
              <div style={{ fontSize: 9, color: 'var(--text-faint)' }}>Требуется</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-secondary)' }}>{zone.levelRequired} ур.</div>
            </div>
            <div className="rounded-lg px-2 py-1.5 text-center" style={INSET_STYLE}>
              <div style={{ fontSize: 9, color: 'var(--text-faint)' }}>Опыт</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-secondary)' }}>+{zone.xp}</div>
            </div>
            <div className="rounded-lg px-2 py-1.5 text-center" style={INSET_STYLE}>
              <div style={{ fontSize: 9, color: 'var(--text-faint)' }}>Цикл</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-secondary)' }}>{(zone.interval / 1000).toFixed(1)} с</div>
            </div>
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: 'var(--text-faint)' }}>Мастерство за цикл: <b style={{ color: 'var(--text-muted)' }}>+{zone.masteryXp}</b></div>
        </div>

        {/* Добыча: шансы считаются за цикл, а не внутри своей таблицы */}
        <div className="rounded-xl px-3 py-2.5" style={PANEL_STYLE}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <div style={SECTION_TITLE_STYLE}>
              Обычная добыча ({zone.lootTable.length})
            </div>
            <span style={{ fontSize: 9, fontFamily: 'var(--app-font-mono)', color: 'var(--text-faint)' }}>шанс за цикл</span>
          </div>
          <div className="space-y-1.5">
            {zone.lootTable.map(entry => {
              const percent = chancePercent(normalItemChance(entry, zone));
              const qty = entry.quantity[0] !== entry.quantity[1]
                ? ` · ${entry.quantity[0]}–${entry.quantity[1]} шт.`
                : ` · ${entry.quantity[0]} шт.`;
              return (
                <div key={entry.itemId} className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={INSET_STYLE}>
                  <ItemVisual itemId={entry.itemId} size={26} />
                  <span style={{ flex: 1, minWidth: 0, fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getItem(entry.itemId)?.name ?? entry.itemId}
                  </span>
                  <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 11, fontWeight: 800, color: 'var(--text-gold)', flexShrink: 0 }}>{percent}%</span>
                  <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 9, color: 'var(--text-faint)', flexShrink: 0 }}>{qty}</span>
                </div>
              );
            })}
          </div>

          {zone.rareTable.length > 0 && (
            <>
              <div className="flex items-center justify-between gap-2 mt-3 mb-1">
                <div style={{ ...SECTION_TITLE_STYLE, color: 'var(--border-accent)' }}>
                  ✦ Редкие ({zone.rareTable.length})
                </div>
                <span style={{ fontSize: 9, fontFamily: 'var(--app-font-mono)', color: 'var(--border-accent)' }}>общий шанс {chancePercent(rareChance)}%</span>
              </div>
              <div className="space-y-1.5">
                {zone.rareTable.map(entry => {
                  const percent = chancePercent(rareItemChance(entry, zone, rareChance));
                  const qty = entry.quantity[0] !== entry.quantity[1]
                    ? ` · ${entry.quantity[0]}–${entry.quantity[1]} шт.`
                    : ` · ${entry.quantity[0]} шт.`;
                  return (
                    <div key={entry.itemId} className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: 'color-mix(in srgb, var(--bg-slot) 45%, transparent)', border: '1px solid color-mix(in srgb, var(--border-accent) 30%, transparent)' }}>
                      <ItemVisual itemId={entry.itemId} size={26} />
                      <span style={{ flex: 1, minWidth: 0, fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getItem(entry.itemId)?.name ?? entry.itemId}
                      </span>
                      <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 11, fontWeight: 800, color: 'var(--text-gold)', flexShrink: 0 }}>{percent}%</span>
                      <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 9, color: 'var(--text-faint)', flexShrink: 0 }}>{qty}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Опасность */}
        <div className="rounded-xl px-3 py-2.5" style={PANEL_STYLE}>
          <div style={{ ...SECTION_TITLE_STYLE, color: 'var(--badge-red-ink)', marginBottom: 7 }}>
            Опасность — встреча {zone.danger.enemyChance}%
          </div>
          {zone.danger.enemies.length > 0 ? (
            <div className="space-y-1.5">
              {zone.danger.enemies.map((enemy, i) => {
                const monster = MONSTERS_MAP[enemy.monsterId];
                const role = enemy.boss ? 'Босс зоны' : (monster?.role === 'skirmisher' ? 'Быстрый' : monster?.role === 'sentinel' ? 'Страж' : monster?.role === 'controller' ? 'Контроль' : 'Моб зоны');
                return (
                  <div key={`${enemy.monsterId}-${i}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={enemy.boss
                    ? { background: 'color-mix(in srgb, var(--bg-slot) 38%, transparent)', border: '1px solid color-mix(in srgb, var(--border-accent) 40%, transparent)' }
                    : INSET_STYLE}>
                    <img src={mobIconUrl(enemy.iconPath || monsterIconPath(enemy.monsterId))} alt="" style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} />
                    <span style={{ flex: 1, minWidth: 0, fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {monster?.name ?? enemy.monsterId}
                    </span>
                    <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 10, color: enemy.boss ? 'var(--text-gold)' : 'var(--border-accent)', flexShrink: 0 }}>
                      {role} · вес {enemy.weight}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-faint)' }}>В этой зоне безопасно — монстры не встречаются.</p>
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
          <div style={{ ...SECTION_TITLE_STYLE, fontSize: 11, marginBottom: 8 }}>
            Характеристики профессии
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {stats.map(stat => (
              <div key={stat.def.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', borderRadius: 12, ...PANEL_STYLE }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{stat.def.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: stat.unlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>{stat.def.nameRu}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 1, lineHeight: 1.3 }}>
                    {stat.unlocked
                      ? (stat.def.cap != null && stat.def.kind !== 'flat' ? `до ${stat.def.cap}%` : stat.def.descriptionRu)
                      : `откроется на ${stat.def.unlockLevel} ур.`}
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 13, fontWeight: 900, color: stat.unlocked ? 'var(--text-secondary)' : 'var(--text-faint)', flexShrink: 0 }}>
                  {stat.unlocked ? formatStatValue(stat) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Характеристики героя, которые влияют на Сбор */}
        <div>
          <div style={{ ...SECTION_TITLE_STYLE, fontSize: 11, marginBottom: 8 }}>
            Что ускоряет сбор
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Темп', value: `${Math.round(attr.tempo)}`, note: '→ скорость цикла' },
              { label: 'Находчивость', value: `${Math.round(attr.resourcefulness)}`, note: '→ редкая находка (+0,05 %/очко)' },
              { label: 'Удача', value: `${attr.luck.toFixed(1).replace('.', ',')}%`, note: '→ двойной лут (+0,1 %/очко)' },
              { label: 'Интуиция', value: `${Math.round(attr.intuition)}`, note: '→ внимание: меньше пустых циклов' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '7px 11px', borderRadius: 10, ...INSET_STYLE }}>
                <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700 }}>{row.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>{row.note}</span>
                  <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 12, fontWeight: 900, color: 'var(--text-gold)' }}>{row.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ margin: 0, fontSize: 10, color: 'var(--text-faint)', lineHeight: 1.5 }}>
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
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '8px 10px', borderRadius: 12, ...INSET_STYLE }}>
      <span style={{ fontSize: 13, lineHeight: 1.3, flexShrink: 0, fontFamily: 'var(--app-font-mono)', color: 'var(--text-muted)', fontWeight: 800 }}>
        {FORAGING_ZONES_MAP[entry.zoneId]?.icon ?? '🌿'}
      </span>
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--app-font-mono)', color: 'var(--text-faint)', display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          <span>{FORAGING_ZONES_MAP[entry.zoneId]?.name ?? entry.zoneId}</span>
          <span>{new Date(entry.ts).toLocaleTimeString()}</span>
        </div>
        {entry.items.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {entry.items.map((it, i) => (
              <span key={`${entry.id}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <ItemVisual itemId={it.itemId} size={20} />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{item(it.itemId)?.name ?? it.itemId}</span>
                <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 10, fontWeight: 800, color: 'var(--text-gold)' }}>×{it.quantity}</span>
              </span>
            ))}
          </div>
        ) : entry.empty ? (
          <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Пустой цикл — ничего не нашлось.</span>
        ) : null}
        {entry.encounter && (
          <span style={{ fontSize: 11, color: 'var(--badge-red-ink)', fontWeight: 700 }}>⚔ Моб преградил путь → бой</span>
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
  const rareChance = useMemo(() => rareFindChance(level), [level]);

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
    /* Рамка «один экран»: заголовок и «О профессии» прибиты, сетка зон
       прокручивается своим окном, лента находок всегда видна внизу. */
    <div className="a-page">
      <SkillHeader skillId="foraging" skillName={t('skill.foraging')} skillIcon="🌿" compact />

      {/* Заголовок зон + кнопка «инфо» */}
      <div className="flex items-center justify-between px-1 pt-1">
        <h2 className="text-xs font-extrabold uppercase tracking-widest font-mono flex items-center gap-1.5" style={{ color: 'var(--text-gold)', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
          <Leaf size={14} /> Участки поиска
        </h2>
        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 9999, fontSize: 10, fontWeight: 800, color: 'var(--text-gold)', background: 'var(--bg-overlay)', border: '1px solid var(--border-card)', cursor: 'pointer', fontFamily: 'var(--app-font-mono)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}
        >
          <Info size={12} /> О профессии
        </button>
      </div>

      {/* Сетка зон — прокручиваемое окно; кнопки Старт/Стоп остаются в нём */}
      <div className="a-page__scroll grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 content-start">
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

      {/* Лента находок — прибита к низу страницы, всегда на виду */}
      {lootFeed.length > 0 && (
        <div className="a-page__foot rounded-2xl p-4" style={{ background: 'color-mix(in srgb, var(--bg-header) 82%, black)', border: '1px solid color-mix(in srgb, var(--border-strong) 80%, var(--border-card))' }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-extrabold uppercase tracking-widest font-mono text-[var(--text-gold)]">Лента находок</h2>
            <button
              type="button"
              onClick={() => useForagingStore.getState().clearLootFeed()}
              className="text-[11px] font-mono text-[var(--text-faint)] hover:text-[var(--text-gold)] transition-colors flex items-center gap-1"
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
      <ZoneInfoModal zone={zoneInfoId ? FORAGING_ZONES_MAP[zoneInfoId] ?? null : null} rareChance={rareChance} onClose={() => setZoneInfoId(null)} />
    </div>
  );
}
