import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { getAllItems, getItem } from '@/domain/items';
import { useAdminConfigStore } from '@/store/adminConfigStore';
import { UniversalInfoModal } from '@/components/modals/UniversalInfoModal';
import { useAdminSession } from '@/features/admin/AdminSessionContext';
import { grantItemsToCharacter } from '@/features/admin/adminCharacterSave';
import { useNotificationsStore } from '@/store/notificationsStore';
import { Minus, Plus, Search, X } from 'lucide-react';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { formatTierLabel } from '@/data/balance/gear';
import { SquircleSlot } from '@/shared/ui/kit/SquircleSlot';
import { AdminDropdown } from '@/features/admin/AdminDropdown';
import {
  applyFilterChange,
  EMPTY_ADMIN_ITEM_FILTERS,
  filterAdminItems,
  filtersForBag,
  filterValue,
  itemsInBag,
  parseAdminItemBag,
} from '@/features/admin/adminCatalog';

export function AdminItemsPage() {
  const [location] = useLocation();
  const bag = parseAdminItemBag(location.split(/[?#]/)[0]);
  const itemOverrides = useAdminConfigStore((s) => s.itemOverrides);
  const catalog = useMemo(() => {
    const seen = new Set<string>();
    return getAllItems().filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [itemOverrides]);

  const pool = useMemo(() => itemsInBag(catalog, bag), [catalog, bag]);
  const specs = useMemo(() => filtersForBag(bag, pool), [bag, pool]);

  const { target } = useAdminSession();
  const notify = useNotificationsStore((s) => s.notifyInfo);
  const [filters, setFilters] = useState(EMPTY_ADMIN_ITEM_FILTERS);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [granting, setGranting] = useState(false);

  useEffect(() => {
    setFilters(EMPTY_ADMIN_ITEM_FILTERS);
    setSearchOpen(false);
    setSelectedId(null);
  }, [bag]);

  const visible = useMemo(() => filterAdminItems(pool, bag, filters), [pool, bag, filters]);
  const selected = selectedId ? getItem(selectedId) ?? catalog.find((i) => i.id === selectedId) ?? null : null;
  const visual = selected ? getItemVisual(selected.id) : null;

  const grant = async () => {
    if (!selected) return;
    if (!target) {
      notify('Сначала выбери персонажа в шапке «Кому выдаём»');
      return;
    }
    const n = Math.max(1, Math.floor(qty) || 1);
    setGranting(true);
    try {
      await grantItemsToCharacter(target.id, [{ itemId: selected.id, qty: n }]);
      notify(`Выдано ${target.nickname}: ${selected.name} ×${n}`);
    } catch (e) {
      notify(`Не удалось выдать: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setGranting(false);
    }
  };

  return (
    <div className="admin-items">
      <div className="admin-items__catalog">
        <div className="admin-items__toolbar">
          {specs.map((spec) => (
            <AdminDropdown
              key={spec.key}
              label={spec.label}
              value={filterValue(filters, spec.key)}
              options={spec.options}
              onChange={(id) => setFilters((prev) => applyFilterChange(prev, spec.key, id))}
            />
          ))}
          <div className="admin-items__search">
            {searchOpen ? (
              <div className="admin-items__search-field">
                <input
                  type="text"
                  autoFocus
                  placeholder="Поиск…"
                  value={filters.query}
                  onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, query: '' }));
                    setSearchOpen(false);
                  }}
                  aria-label="Закрыть поиск"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="admin-items__loupe"
                title="Поиск предмета"
                onClick={() => setSearchOpen(true)}
              >
                <Search size={16} />
              </button>
            )}
          </div>
          <span className="admin-items__count">{visible.length}</span>
        </div>

        {visible.length === 0 ? (
          <p className="admin-items__empty">Ничего не подошло — сбрось фильтр или поиск.</p>
        ) : (
          <div className="admin-items__grid">
            {visible.map((it) => (
              <SquircleSlot
                key={it.id}
                itemId={it.id}
                selected={selectedId === it.id}
                onClick={() => {
                  if (selectedId === it.id) setInspectId(it.id);
                  else setSelectedId(it.id);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <aside className="admin-items__inspect">
        {selected ? (
          <>
            <span className="admin-grant__art">
              {visual?.type === 'image' ? <img src={visual.value} alt="" /> : <span>{visual?.value}</span>}
            </span>
            <div className="admin-grant__meta">
              <strong>{selected.name}</strong>
              <small>
                {selected.id}
                {selected.tier ? ` · ${formatTierLabel(selected.tier)}` : ''}
                {typeof selected.maxDurability === 'number' ? ` · прочность ${selected.maxDurability}` : ''}
              </small>
            </div>
            <button type="button" className="admin-items__card-btn" onClick={() => setInspectId(selected.id)}>
              Карточка
            </button>
          </>
        ) : (
          <div className="admin-grant__meta">
            <strong>Предмет не выбран</strong>
            <small>Кликни ячейку — повторный клик откроет карточку</small>
          </div>
        )}

        <div className="admin-grant admin-grant--pane">
          <div className="admin-grant__qty">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Меньше">
              <Minus size={14} />
            </button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            />
            <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Больше">
              <Plus size={14} />
            </button>
          </div>
          <button
            type="button"
            className="admin-grant__go"
            disabled={!selected || !target || granting}
            onClick={() => void grant()}
          >
            {granting ? 'Выдаю…' : target ? `Выдать → ${target.nickname}` : 'Нет героя'}
          </button>
        </div>
      </aside>

      {inspectId && (
        <UniversalInfoModal
          itemId={inspectId}
          readOnly
          adminEditable
          onClose={() => setInspectId(null)}
        />
      )}
    </div>
  );
}
