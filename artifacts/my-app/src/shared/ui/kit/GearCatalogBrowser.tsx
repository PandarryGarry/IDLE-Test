import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { EquipSlot, GearWeight, Item, ItemTier } from '@/data/types';
import { EQUIP_SLOT_LABELS_RU, formatTierLabel, GEAR_WEIGHT_NAME_RU } from '@/data/balance/gear';
import {
  EMPTY_GEAR_BROWSE,
  filterGearItems,
  GEAR_BROWSE_TIERS,
  GEAR_BROWSE_WEIGHTS,
  groupGearItems,
  groupLooseItems,
  slotsPresent,
  type GearBrowseFilters,
} from '@/domain/items/catalog/gear/gearBrowse';
import { GearItemCell } from '@/shared/ui/kit/GearItemCell';

interface GearCatalogBrowserProps {
  items: Item[];
  selectedId: string | null;
  onSelect: (itemId: string) => void;
}

/**
 * Единая фасовка выбора: фильтры слот / тир / вес + поиск,
 * группы «слот → тир → семья».
 */
export function GearCatalogBrowser({ items, selectedId, onSelect }: GearCatalogBrowserProps) {
  const [kind, setKind] = useState<'all' | 'gear' | 'resources'>('all');
  const [filters, setFilters] = useState<GearBrowseFilters>(EMPTY_GEAR_BROWSE);
  const scoped = useMemo(() => {
    if (kind === 'gear') return items.filter((it) => Boolean(it.equipSlot));
    if (kind === 'resources') return items.filter((it) => !it.equipSlot);
    return items;
  }, [items, kind]);
  const slots = useMemo(() => slotsPresent(scoped), [scoped]);
  const hasWeight = useMemo(() => scoped.some((it) => Boolean(it.gearWeight)), [scoped]);
  const hasTiers = useMemo(() => scoped.some((it) => typeof it.tier === 'number'), [scoped]);
  const hasBoth = useMemo(
    () => items.some((it) => it.equipSlot) && items.some((it) => !it.equipSlot),
    [items],
  );

  const visible = useMemo(() => filterGearItems(scoped, filters), [scoped, filters]);
  const groups = useMemo(() => groupGearItems(visible), [visible]);
  const looseGroups = useMemo(() => groupLooseItems(visible), [visible]);

  const setSlot = (slot: EquipSlot | 'all') => setFilters((f) => ({ ...f, slot }));
  const setTier = (tier: ItemTier | 'all') => setFilters((f) => ({ ...f, tier }));
  const setWeight = (weight: GearWeight | 'all') => setFilters((f) => ({ ...f, weight }));

  return (
    <div className="gear-browse">
      <div className="gear-browse__search">
        <Search size={14} aria-hidden />
        <input
          autoFocus
          placeholder="Поиск по названию, id, семье…"
          value={filters.query}
          onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
        />
      </div>

      {hasBoth && (
        <div className="gear-browse__pills" role="tablist" aria-label="Тип">
          {([
            ['all', 'Все'],
            ['gear', 'Экип'],
            ['resources', 'Ресурсы'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={kind === id ? 'is-on' : ''}
              onClick={() => setKind(id)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {slots.length > 1 && (
        <div className="gear-browse__pills" role="tablist" aria-label="Слот">
          <button
            type="button"
            className={filters.slot === 'all' ? 'is-on' : ''}
            onClick={() => setSlot('all')}
          >
            Все слоты
          </button>
          {slots.map((s) => (
            <button
              key={s}
              type="button"
              className={filters.slot === s ? 'is-on' : ''}
              onClick={() => setSlot(s)}
            >
              {EQUIP_SLOT_LABELS_RU[s]}
            </button>
          ))}
        </div>
      )}

      {hasTiers && (
        <div className="gear-browse__pills" role="tablist" aria-label="Тир">
          <button
            type="button"
            className={filters.tier === 'all' ? 'is-on' : ''}
            onClick={() => setTier('all')}
          >
            Все тиры
          </button>
          {GEAR_BROWSE_TIERS.map((t) => (
            <button
              key={t}
              type="button"
              className={filters.tier === t ? 'is-on' : ''}
              onClick={() => setTier(t)}
            >
              {formatTierLabel(t)}
            </button>
          ))}
        </div>
      )}

      {hasWeight && (
        <div className="gear-browse__pills" role="tablist" aria-label="Вес">
          <button
            type="button"
            className={filters.weight === 'all' ? 'is-on' : ''}
            onClick={() => setWeight('all')}
          >
            Любой вес
          </button>
          {GEAR_BROWSE_WEIGHTS.map((w) => (
            <button
              key={w}
              type="button"
              className={filters.weight === w ? 'is-on' : ''}
              onClick={() => setWeight(w)}
            >
              {GEAR_WEIGHT_NAME_RU[w]}
            </button>
          ))}
        </div>
      )}

      <div className="gear-browse__scroll">
        {groups.map((g) => (
          <section key={`${g.slot}-${g.tier}-${g.family}`} className="gear-browse__group">
            <header className="gear-browse__head">
              <span>{g.slotLabel}</span>
              {g.tier > 0 && <span>{formatTierLabel(g.tier as ItemTier)}</span>}
              <span>{g.familyLabel}</span>
              <em>{g.items.length}</em>
            </header>
            <div className="gear-browse__grid">
              {g.items.map((it) => (
                <GearItemCell
                  key={it.id}
                  item={it}
                  selected={selectedId === it.id}
                  onClick={() => onSelect(it.id)}
                />
              ))}
            </div>
          </section>
        ))}

        {looseGroups.map((g) => (
          <section key={g.category} className="gear-browse__group">
            <header className="gear-browse__head">
              <span>{g.label}</span>
              <em>{g.items.length}</em>
            </header>
            <div className="gear-browse__grid">
              {g.items.map((it) => (
                <GearItemCell
                  key={it.id}
                  item={it}
                  selected={selectedId === it.id}
                  onClick={() => onSelect(it.id)}
                />
              ))}
            </div>
          </section>
        ))}

        {visible.length === 0 && (
          <p className="gear-browse__empty">Ничего не найдено — сбрось фильтры или поиск.</p>
        )}
      </div>
    </div>
  );
}
