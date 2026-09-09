import { useMemo, useState } from 'react';
import { getAllItems, getItem } from '@/domain/items';
import { useAdminConfigStore } from '@/store/adminConfigStore';
import { GearCatalogBrowser } from '@/shared/ui/kit/GearCatalogBrowser';
import { UniversalInfoModal } from '@/components/modals/UniversalInfoModal';
import { useAdminSession } from '@/features/admin/AdminSessionContext';
import { grantItemsToCharacter } from '@/features/admin/adminCharacterSave';
import { useNotificationsStore } from '@/store/notificationsStore';
import { Minus, Plus } from 'lucide-react';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { formatTierLabel } from '@/data/balance/gear';

export function AdminItemsPage() {
  const itemOverrides = useAdminConfigStore((s) => s.itemOverrides);
  const catalog = useMemo(() => {
    const seen = new Set<string>();
    return getAllItems().filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [itemOverrides]);

  const { target } = useAdminSession();
  const notify = useNotificationsStore((s) => s.notifyInfo);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [granting, setGranting] = useState(false);

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
    <div className="space-y-3">
      <p className="text-[11px] text-[var(--text-muted)] px-1">
        Каталог: {catalog.length} предметов. Сначала выбери героя в шапке, затем ячейку — «Выдать» сразу пишет в его сумку.
        Клик по ячейке выбирает, повторный клик открывает карточку (правка названия/цены).
      </p>

      <div className="rounded-2xl p-3 sm:p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <GearCatalogBrowser
          items={catalog}
          selectedId={selectedId}
          onSelect={(id) => {
            if (selectedId === id) setInspectId(id);
            else setSelectedId(id);
          }}
        />
      </div>

      <div className="admin-grant">
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
          </>
        ) : (
          <div className="admin-grant__meta">
            <strong>Предмет не выбран</strong>
            <small>Кликни ячейку в каталоге</small>
          </div>
        )}

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
