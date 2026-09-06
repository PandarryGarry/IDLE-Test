import { useMemo, useState } from 'react';
import { CATALOG } from '@/domain/items';
import { SquircleSlot } from '@/shared/ui/kit/SquircleSlot';
import { UniversalInfoModal } from '@/components/modals/UniversalInfoModal';
import { Search, X } from 'lucide-react';

const CATEGORY_ORDER = ['log', 'ore', 'bar', 'raw_fish', 'cooked_fish', 'mineral', 'foraging'];

const CATEGORY_LABELS: Record<string, string> = {
  log: 'Дерево',
  ore: 'Руда',
  bar: 'Слиток',
  raw_fish: 'Сырая рыба',
  cooked_fish: 'Жареная рыба',
  mineral: 'Минерал',
  foraging: 'Сбор',
};

const CATEGORY_ICONS: Record<string, string> = {
  log: '🪵',
  ore: '⛏️',
  bar: '🔨',
  raw_fish: '🐟',
  cooked_fish: '🍽️',
  mineral: '🪨',
  foraging: '🌿',
};

export function AdminItemsPage() {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATEGORY_ORDER
      .map(category => ({
        category,
        items: CATALOG.filter(item => {
          if (category !== 'all' && item.category !== category) return false;
          if (!q) return true;
          return (
            item.name.toLowerCase().includes(q) ||
            item.id.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q)
          );
        }),
      }))
      .filter(group => group.items.length > 0);
  }, [query]);

  const total = CATALOG.length;

  const FILTERS = [
    { key: 'all', label: 'Все', icon: '📦' },
    ...CATEGORY_ORDER.map(category => ({
      key: category,
      label: CATEGORY_LABELS[category],
      icon: CATEGORY_ICONS[category],
    })),
  ];

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl p-4 sm:p-5" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl border border-violet-500/30 flex items-center justify-center text-2xl shrink-0">
            🛡️
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-black text-[var(--text-primary)]">Админ-панель · Каталог предметов</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Как в инвентаре: клик по ячейке открывает карточку с описанием и характеристиками.
            </p>
          </div>
        </div>
      </div>

      {/* Filters + search */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl" style={{ background: '#1c1108', border: '1px solid #3a2b1a' }}>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
          {FILTERS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 active:scale-95 ${
                activeCategory === key
                  ? 'bg-stone-800 text-violet-300 border border-violet-500/40 shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-dark)]'
              }`}
            >
              <span className="text-base">{icon}</span>
              <span className="hidden sm:inline text-[11px]">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center pl-1 border-l border-stone-800 shrink-0">
          {isSearchOpen ? (
            <div className="relative flex items-center">
              <input
                type="text"
                autoFocus
                placeholder="Поиск..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-32 sm:w-48 pl-2.5 pr-7 py-1.5 bg-[var(--bg-slot)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={() => { setQuery(''); setIsSearchOpen(false); }}
                className="absolute right-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-dark)] transition-all active:scale-95"
              title="Поиск предмета"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Groups */}
      {groups.length === 0 && (
        <div className="text-center py-20 text-slate-500 flex flex-col items-center gap-2">
          <div className="text-5xl opacity-30">📦</div>
          <p className="text-xs font-mono">Ничего не найдено</p>
        </div>
      )}

      {groups.map(group => (
        <div key={group.category} className="space-y-2">
          <div className="flex items-center justify-between px-1 pt-1">
            <h2 className="text-xs font-extrabold uppercase tracking-widest font-mono flex items-center gap-1.5" style={{ color: '#c084fc', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
              <span>{CATEGORY_ICONS[group.category]}</span> {CATEGORY_LABELS[group.category]}
            </h2>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">{group.items.length}</span>
          </div>

          <div className="rounded-2xl p-3 sm:p-4" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.35)' }}>
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-2.5 sm:gap-3">
              {group.items.map(item => (
                <SquircleSlot
                  key={item.id}
                  itemId={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                />
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="text-center text-[11px] font-mono text-[var(--text-muted)] pb-2">
        Всего предметов в каталоге: {total}
      </div>

      {selectedItemId && (
        <UniversalInfoModal
          itemId={selectedItemId}
          readOnly
          onClose={() => setSelectedItemId(null)}
        />
      )}
    </div>
  );
}
