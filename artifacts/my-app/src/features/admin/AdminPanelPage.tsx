import { useLocation } from 'wouter';
import { AdminItemsPage } from '@/features/admin/AdminItemsPage';
import { AdminSettingsPanel } from '@/features/admin/AdminSettingsPanel';

const TABS = [
  { key: 'items', href: '/admin', label: 'Каталог предметов', icon: '📦' },
  { key: 'settings', href: '/admin/settings', label: 'Настройки игры', icon: '⚙️' },
];

export function AdminPanelPage() {
  const [location, navigate] = useLocation();
  const path = location.split(/[?#]/)[0];
  const activeTab = path.startsWith('/admin/settings') || path === '/admin/settings' ? 'settings' : 'items';
  const active = TABS.find(t => t.key === activeTab) ?? TABS[0];

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl p-4 sm:p-5" style={{ background: 'var(--bg-card)', border: '1px solid #3a2b1a', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl border border-violet-500/30 flex items-center justify-center text-2xl shrink-0">
            🛡️
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-black text-[var(--text-primary)]">Админ-панель</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Просмотр и правка предметов, настройки игры и рейтов — прямо в игре.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-xl" style={{ background: '#1c1108', border: '1px solid #3a2b1a' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => navigate(tab.href)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2 ${
              active.key === tab.key
                ? 'bg-stone-800 text-violet-300 border border-violet-500/40 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-dark)]'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {active.key === 'items' ? <AdminItemsPage /> : <AdminSettingsPanel />}
    </div>
  );
}
