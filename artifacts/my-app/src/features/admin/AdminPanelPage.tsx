import { useLocation } from 'wouter';
import { AdminItemsPage } from '@/features/admin/AdminItemsPage';
import { AdminSettingsPanel } from '@/features/admin/AdminSettingsPanel';
import { AdminProfessionsPanel } from '@/features/admin/AdminProfessionsPanel';
import { AdminCharactersPanel } from '@/features/admin/AdminCharactersPanel';

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
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header + tabs — всё в одной тёмной панели, без двойных/разноцветных шапок */}
      <div className="rounded-2xl p-3 sm:p-4" style={{ background: '#1c1108', border: '1px solid #3a2b1a', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#2a1a0c] border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
              🛡️
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-display font-black text-[var(--text-primary)]">Админ-панель</h1>
              <p className="text-[11px] text-[var(--text-muted)] truncate">предметы · персонажи · профессии · рейты</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#150c04] border border-[#3a2b1a]">
            {TABS.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => navigate(tab.href)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 ${
                  active.key === tab.key
                    ? 'bg-[#3a2b1a] text-amber-300 border border-amber-500/30'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-dark)]'
                }`}
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
  );
}
