import { useLocation } from 'wouter';
import { AdminItemsPage } from '@/features/admin/AdminItemsPage';
import { AdminSettingsPanel } from '@/features/admin/AdminSettingsPanel';
import { AdminProfessionsPanel } from '@/features/admin/AdminProfessionsPanel';
import { AdminCharactersPanel } from '@/features/admin/AdminCharactersPanel';
import { AdminSessionProvider } from '@/features/admin/AdminSessionContext';
import { AdminShell, adminSectionFromPath } from '@/features/admin/AdminShell';

export function AdminPanelPage() {
  const [location] = useLocation();
  const path = location.split(/[?#]/)[0];
  const section = adminSectionFromPath(path);

  const body = section === 'items'
    ? <AdminItemsPage />
    : section === 'characters'
      ? <AdminCharactersPanel />
      : section === 'professions'
        ? <AdminProfessionsPanel />
        : <AdminSettingsPanel />;

  return (
    <AdminSessionProvider>
      <AdminShell>{body}</AdminShell>
    </AdminSessionProvider>
  );
}
