import type { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { Leaf, Package, Settings, Shield, User } from 'lucide-react';
import { AdminTargetBar } from '@/features/admin/AdminSessionContext';
import { ADMIN_ITEM_BAGS, parseAdminItemBag } from '@/features/admin/adminCatalog';
import { ATabs } from '@/shared/ui/kit/ATabs';

export type AdminSection = 'items' | 'characters' | 'professions' | 'settings';

const SECTIONS: readonly { key: AdminSection; href: string; label: string; Icon: typeof Package }[] = [
  { key: 'items', href: '/admin', label: 'Предметы', Icon: Package },
  { key: 'characters', href: '/admin/characters', label: 'Персонажи', Icon: User },
  { key: 'professions', href: '/admin/professions', label: 'Профессии', Icon: Leaf },
  { key: 'settings', href: '/admin/settings', label: 'Настройки', Icon: Settings },
];

export function adminSectionFromPath(path: string): AdminSection {
  if (path.startsWith('/admin/characters')) return 'characters';
  if (path.startsWith('/admin/professions')) return 'professions';
  if (path.startsWith('/admin/settings')) return 'settings';
  return 'items';
}

const TITLES: Record<AdminSection, string> = {
  items: 'Каталог',
  characters: 'Персонажи',
  professions: 'Профессии',
  settings: 'Настройки игры',
};

export function AdminShell({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const path = location.split(/[?#]/)[0];
  const section = adminSectionFromPath(path);
  const bag = parseAdminItemBag(path);
  const bagLabel = ADMIN_ITEM_BAGS.find((b) => b.id === bag)?.label ?? 'Все';

  return (
    <div className="admin-nui">
      <nav className="admin-nui__rail" aria-label="Разделы админки">
        <ATabs
          variant="rail"
          ariaLabel="Разделы админки"
          tabs={SECTIONS.map((s) => ({
            id: s.key,
            label: s.label,
            title: s.label,
            icon: <s.Icon size={18} />,
          }))}
          activeId={section}
          onChange={(id) => {
            const target = SECTIONS.find((s) => s.key === id);
            if (target) navigate(target.href);
          }}
        />
      </nav>

      {section === 'items' && (
        <aside className="admin-nui__sub" aria-label="Сумки предметов">
          <p className="admin-nui__sub-head">Предметы</p>
          <ATabs
            direction="column"
            ariaLabel="Сумки предметов"
            tabs={ADMIN_ITEM_BAGS.map((b) => ({ id: b.id, label: b.label }))}
            activeId={bag}
            onChange={(id) => {
              const target = ADMIN_ITEM_BAGS.find((b) => b.id === id);
              if (target) navigate(target.href);
            }}
          />
        </aside>
      )}

      <div className="admin-nui__stage">
        <header className="admin-nui__top">
          <div className="admin-nui__brand">
            <span className="admin-nui__mark" aria-hidden><Shield size={16} /></span>
            <div>
              <h1>
                {TITLES[section]}
                {section === 'items' && bag !== 'all' ? <em> · {bagLabel}</em> : null}
              </h1>
              <p>цель всегда в шапке · выдача пишет в сумку героя</p>
            </div>
          </div>
          <AdminTargetBar />
        </header>
        <div className="admin-nui__body">{children}</div>
      </div>
    </div>
  );
}
