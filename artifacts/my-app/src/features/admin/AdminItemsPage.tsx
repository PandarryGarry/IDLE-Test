import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CATALOG, CATALOG_SUMMARY } from '@/domain/items';
import type { CatalogItem } from '@/domain/items';
import { iconUrl } from '@/lib/assetUrl';
import { formatNumber } from '@/lib/utils';

const CATEGORY_LABELS: Record<string, string> = {
  log: 'Дерево',
  ore: 'Руда',
  bar: 'Слиток',
  raw_fish: 'Сырая рыба',
  cooked_fish: 'Жареная рыба',
  mineral: 'Минерал',
  foraging: 'Сбор',
};

function Cell({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
      <span className="text-xs text-[var(--text-primary)]">{children}</span>
    </div>
  );
}

function ItemCard({ item }: { item: CatalogItem }) {
  const cat = CATEGORY_LABELS[item.category] ?? item.category;
  return (
    <div
      className="rounded-2xl p-3 flex flex-col gap-2 min-w-0"
      style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-default)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
          style={{ background: 'var(--bg-slot)', border: '1px solid var(--border-default)' }}
        >
          {item.iconPath ? (
            <img
              src={iconUrl(item.iconPath)}
              alt={item.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-2xl">{item.icon ?? '📦'}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-bold text-[var(--text-primary)] leading-tight truncate">{item.name}</div>
              <div className="text-[11px] font-mono text-[var(--text-muted)] truncate">{item.id}</div>
            </div>
            <span
              className="shrink-0 text-[11px] font-black font-mono rounded-lg px-2 py-1"
              style={{ background: 'rgba(220,160,80,0.15)', color: '#e0a868', border: '1px solid rgba(220,160,80,0.25)' }}
            >
              T{item.tier}
            </span>
          </div>
          <p className="text-[11px] leading-snug text-[var(--text-secondary)] mt-1 line-clamp-3">{item.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-default)]">
        <Cell label="Категория" children={cat} />
        <Cell label="Цена" children={`${formatNumber(item.sellValue)} GP`} />
        <Cell label="Стак" children={item.stackable ? 'Да' : 'Нет'} />
        <Cell label="Иконка" children={<code className="text-[10px] break-all">{item.iconPath}</code>} />
      </div>
    </div>
  );
}

export function AdminItemsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [onlyWithImage, setOnlyWithImage] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(CATALOG.map(i => i.category))).sort(),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG.filter(item => {
      if (category !== 'all' && item.category !== category) return false;
      if (onlyWithImage && !item.iconPath) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
  }, [query, category, onlyWithImage]);

  return (
    <div className="max-w-6xl mx-auto space-y-4 p-4">
      <div className="rounded-2xl p-4 sm:p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <h1 className="text-xl font-display font-black text-[var(--text-primary)]">Админ-панель · Каталог предметов</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Основа для будущей админки: здесь видны все предметы батча 1. Это не игровой инвентарь — каталог для сверки и последующей доработки.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            ['Всего', CATALOG.length],
            ['Брёвна', CATALOG_SUMMARY.logs],
            ['Руда', CATALOG_SUMMARY.ores],
            ['Слитки', CATALOG_SUMMARY.bars],
            ['Рыба raw', CATALOG_SUMMARY.rawFish],
            ['Рыба cooked', CATALOG_SUMMARY.cookedFish],
            ['Минералы', CATALOG_SUMMARY.minerals],
            ['Сбор · дерево', CATALOG_SUMMARY.forageWood],
            ['Сбор · грибы', CATALOG_SUMMARY.forageFungi],
            ['Сбор · прочее', CATALOG_SUMMARY.forageBits],
          ].map(([label, value]) => (
            <span key={label} className="text-[11px] font-mono rounded-xl px-2.5 py-1.5" style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
              {label}: <b style={{ color: 'var(--text-primary)' }}>{value}</b>
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-3 flex flex-wrap items-center gap-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <input
          type="text"
          placeholder="Поиск по имени / id / описанию..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 rounded-xl text-sm text-[var(--text-primary)] bg-[var(--bg-slot)] border border-[var(--border-default)] focus:outline-none"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm text-[var(--text-primary)] bg-[var(--bg-slot)] border border-[var(--border-default)] focus:outline-none"
        >
          <option value="all">Все категории</option>
          {categories.map(c => (
            <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] px-2 cursor-pointer">
          <input type="checkbox" checked={onlyWithImage} onChange={e => setOnlyWithImage(e.target.checked)} />
          Только с картинкой
        </label>
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
        <span>Показано: <b style={{ color: 'var(--text-primary)' }}>{filtered.length}</b> из {CATALOG.length}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(item => <ItemCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}
