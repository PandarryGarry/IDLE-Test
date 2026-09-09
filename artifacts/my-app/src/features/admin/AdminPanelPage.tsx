import { useLocation } from 'wouter';
import { AdminItemsPage } from '@/features/admin/AdminItemsPage';
import { AdminSettingsPanel } from '@/features/admin/AdminSettingsPanel';
import { AdminProfessionsPanel } from '@/features/admin/AdminProfessionsPanel';
import { AdminCharactersPanel } from '@/features/admin/AdminCharactersPanel';
import { AdminSessionProvider, AdminTargetBar } from '@/features/admin/AdminSessionContext';

const TABS = [
  { key: 'items', href: '/admin', label: 'Каталог предметов', icon: '📦' },
  { key: 'characters', href: '/admin/characters', label: 'Персонажи', icon: '👤' },
  { key: 'professions', href: '/admin/professions', label: 'Профессии', icon: '🌿' },
  { key: 'settings', href: '/admin/settings', label: 'Настройки игры', icon: '⚙️' },
];

export function AdminPanelPage() {
  const [location, navigate] = useLocation();
  const path = location.split(/[?#]/)[0];
  const activeTab = path.startsWith('/admin/characters') || path === '/admin/characters'
    ? 'characters'
    : path.startsWith('/admin/professions') || path === '/admin/professions'
      ? 'professions'
      : path.startsWith('/admin/settings') || path === '/admin/settings'
        ? 'settings'
        : 'items';
  const active = TABS.find(t => t.key === activeTab) ?? TABS[0];

  const renderActive = active.key === 'items'
    ? <AdminItemsPage />
    : active.key === 'characters'
      ? <AdminCharactersPanel />
      : active.key === 'professions'
        ? <AdminProfessionsPanel />
        : <AdminSettingsPanel />;

  return (
    <AdminSessionProvider>
      <div className="space-y-4 max-w-6xl mx-auto">
        <div className="rounded-2xl p-3 sm:p-4" style={{ background: 'var(--bg-header)', border: '1px solid var(--border-default)', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: 'var(--bg-slot)', border: '1px solid var(--border-accent)' }}>
                🛡️
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-display font-black text-[var(--text-primary)]">Админ-панель</h1>
                <p className="text-[11px] text-[var(--text-muted)] truncate">каталог · выдача · персонажи · рейты</p>
              </div>
            </div>

            <AdminTargetBar />

            <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background: 'var(--bg-slot)', border: '1px solid var(--border-default)' }}>
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => navigate(tab.href)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 ${
                    active.key === tab.key
                      ? 'text-amber-300 border'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-dark)]'
                  }`}
                  style={active.key === tab.key ? { background: 'var(--bg-card-dark)', borderColor: 'var(--border-accent)' } : { borderColor: 'transparent' }}
                >
                  <span className="text-base leading-none">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {renderActive}
      </div>
    </AdminSessionProvider>
  );
}
