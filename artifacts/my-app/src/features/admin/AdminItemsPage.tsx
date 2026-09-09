import { useMemo, useState } from 'react';
import { getAllItems } from '@/domain/items';
import { useAdminConfigStore } from '@/store/adminConfigStore';
import { SquircleSlot } from '@/shared/ui/kit/SquircleSlot';
import { UniversalInfoModal } from '@/components/modals/UniversalInfoModal';
import { Search, X } from 'lucide-react';
import type { ItemCategory } from '@/data/types';

const CATEGORY_ORDER: ItemCategory[] = [
  'log', 'ore', 'bar', 'raw_fish', 'cooked_fish', 'mineral', 'foraging',
  'food', 'misc',
  'weapon', 'helm', 'platebody', 'shield',
];
const CATEGORY_INDEX = new Map<ItemCategory, number>(CATEGORY_ORDER.map((category, index) => [category, index]));

const CATEGORY_LABELS: Record<string, string> = {
  log: 'Дерево',
  ore: 'Руда',
  bar: 'Слиток',
  raw_fish: 'Сырая рыба',
  cooked_fish: 'Жареная рыба',
  mineral: 'Минерал',
  foraging: 'Сбор',
  food: 'Еда',
  misc: 'Трофеи',
  weapon: 'Оружие',
  helm: 'Шлемы',
  platebody: 'Нагрудники',
  shield: 'Щиты',
};

const CATEGORY_ICONS: Record<string, string> = {
  log: '🪵',
  ore: '⛏️',
  bar: '🔨',
  raw_fish: '🐟',
  cooked_fish: '🍽️',
  mineral: '🪨',
  foraging: '🌿',
  food: '🍖',
  misc: '🏆',
  weapon: '⚔️',
  helm: '⛑️',
  platebody: '🛡️',
  shield: '🛡️',
};

export function AdminItemsPage() {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ItemCategory | 'all'>('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Правки предметов из админки обновляют каталог через getItem()/getAllItems().
  // getAllItems() отдаёт только настоящий каталог (ресурсы/сбор/снаряжение) —
  // все предметы с реальными картинками; легаси без своих картинок сюда не входит.
  const itemOverrides = useAdminConfigStore(s => s.itemOverrides);
  const catalog = useMemo(() => {
    const seen = new Set<string>();
    return getAllItems().filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [itemOverrides]);

  // Единый порядок: категория (из CATEGORY_ORDER, неизвестные — в конец),
  // затем тир, затем id. Никаких дублирующих подкатегорий-заголовков.
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog
      .filter(item => {
        if (activeCategory !== 'all' && item.category !== activeCategory) return false;
        if (!q) return true;
        return (
          item.name.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const catA = CATEGORY_INDEX.get(a.category) ?? 999;
        const catB = CATEGORY_INDEX.get(b.category) ?? 999;
        if (catA !== catB) return catA - catB;
        const tierA = a.tier ?? 0;
        const tierB = b.tier ?? 0;
        if (tierA !== tierB) return tierA - tierB;
        return a.id.localeCompare(b.id);
      });
  }, [activeCategory, catalog, query]);

  const total = catalog.length;
  const groupLabel = activeCategory === 'all' ? 'Все предметы' : (CATEGORY_LABELS[activeCategory] ?? activeCategory);
  const groupIcon = activeCategory === 'all' ? '📦' : (CATEGORY_ICONS[activeCategory] ?? '📦');

  const FILTERS: { key: ItemCategory | 'all'; label: string; icon: string }[] = [
    { key: 'all', label: 'Все', icon: '📦' },
    ...CATEGORY_ORDER.map(category => ({
      key: category,
      label: CATEGORY_LABELS[category],
      icon: CATEGORY_ICONS[category],
    })),
  ];

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Filters + search */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl" style={{ background: '#1c1108', border: '1px solid #3a2b1a' }}>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
          {FILTERS.map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveCategory(key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 active:scale-95 ${
                activeCategory === key
                  ? 'bg-[#3a2b1a] text-amber-300 border border-amber-500/40 shadow-sm'
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
                className="w-32 sm:w-48 pl-2.5 pr-7 py-1.5 bg-[var(--bg-slot)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
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

      {/* One sorted grid */}
      {items.length === 0 && (
        <div className="text-center py-20 text-slate-500 flex flex-col items-center gap-2">
          <div className="text-5xl opacity-30">📦</div>
          <p className="text-xs font-mono">Ничего не найдено</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 pt-1">
            <h2 className="text-xs font-extrabold uppercase tracking-widest font-mono flex items-center gap-1.5 text-amber-400">
              <span>{groupIcon}</span> {groupLabel}
            </h2>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">{items.length}</span>
          </div>

          <div className="rounded-2xl p-3 sm:p-4" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.35)' }}>
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-2.5 sm:gap-3">
              {items.map(item => (
                <SquircleSlot
                  key={item.id}
                  itemId={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-[11px] font-mono text-[var(--text-muted)] pb-2">
        Всего предметов в каталоге: {total}
      </div>

      {selectedItemId && (
        <UniversalInfoModal
          itemId={selectedItemId}
          readOnly
          adminEditable
          onClose={() => setSelectedItemId(null)}
        />
      )}
    </div>
  );
}
