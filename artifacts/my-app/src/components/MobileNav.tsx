import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { useCombatStore } from '@/store/combatStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/authStore';
import { GUEST_NOTICE } from '@/lib/guestMode';
import { iconUrl } from '@/lib/assetUrl';
import { skillNameRu } from '@/lib/skillNames';
import type { TranslationKey } from '@/lib/i18n';
import type { SkillId } from '@/data/types';

interface MobileNavProps {
  className?: string;
}

/** Пункт раскрывающегося подменю (шита) нижней панели. */
interface NavSheetTarget {
  id: string;
  label: string;
  href: string;
  skillId?: SkillId;
}

/**
 * Пункт нижней навигации (шаг 10 аудита).
 * Три поведения — задел на будущее по решению владельца:
 *  - `href`  — прямая ссылка (Бой, Инвентарь, Настройки);
 *  - `sheet` — нижний шит с выбором раздела (Город: Площадь/Профессии;
 *              позже — навигация по городу, выбор локации боя, виды квестов);
 *  - `soon`  — заглушка «скоро» через тост (Мир, Квесты — системы ещё нет).
 */
interface NavItem {
  id: string;
  labelKey: TranslationKey;
  icon: ReturnType<typeof iconUrl>;
  href?: string;
  sheet?: readonly NavSheetTarget[];
  /** Совпадение текущего пути (и путей подменю) для подсветки. */
  isActive: (path: string) => boolean;
}

const CITY_SHEET: readonly NavSheetTarget[] = [
  { id: 'square', label: 'Площадь', href: '/' },
  { id: 'professions', label: 'Профессии', href: '/foraging', skillId: 'foraging' },
];

const NAV_ITEMS: readonly NavItem[] = [
  { id: 'city', labelKey: 'nav.tab.city', icon: iconUrl('menu/nav_city'), sheet: CITY_SHEET,
    isActive: (p) => p === '/' || p.startsWith('/foraging') },
  { id: 'combat', labelKey: 'nav.tab.combat', icon: iconUrl('menu/nav_arena'), href: '/combat',
    isActive: (p) => p.startsWith('/combat') },
  { id: 'world', labelKey: 'nav.tab.world', icon: iconUrl('menu/nav_world'),
    isActive: () => false },
  { id: 'quests', labelKey: 'nav.tab.quests', icon: iconUrl('menu/nav_quests'),
    isActive: () => false },
  { id: 'inventory', labelKey: 'nav.tab.inventory', icon: iconUrl('menu/nav_inventory'), href: '/inventory',
    isActive: (p) => p.startsWith('/inventory') },
  { id: 'settings', labelKey: 'nav.tab.settings', icon: iconUrl('menu/nav_settings'), href: '/settings',
    isActive: (p) => p.startsWith('/settings') },
];

const SOON_TEXT: Record<string, string> = {
  world: 'Карта мира Аетелии появится позже.',
  quests: 'Квесты появятся позже — ежедневные, основные и побочные.',
};

export function MobileNav({ className = '' }: MobileNavProps) {
  const [location] = useLocation();
  const { t } = useTranslation();
  const [sheetItems, setSheetItems] = useState<readonly NavSheetTarget[] | null>(null);

  const activeSkill = useGameStore((s) => s.activeSkill);
  const inCombat = useCombatStore((s) => s.inCombat);
  const isGuest = useAuthStore((s) => s.isGuest);
  const notifyInfo = useNotificationsStore((s) => s.notifyInfo);

  const path = location.split(/[?#]/)[0];

  function handlePress(item: NavItem) {
    if (item.sheet) {
      setSheetItems(sheetItems === item.sheet ? null : item.sheet);
      return;
    }
    const soon = SOON_TEXT[item.id];
    if (soon) {
      notifyInfo(soon);
      return;
    }
  }

  return (
    <>
      {/* Нижний шит пункта (подменю): сейчас — навигация города,
          дальше на том же каркасе — локации боя и виды квестов. */}
      {sheetItems && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 animate-in fade-in"
            style={{ background: 'rgba(10, 5, 2, 0.72)', backdropFilter: 'blur(3px)' }}
            onClick={() => setSheetItems(null)}
          />
          <div
            className="relative z-10 mx-2 mb-[74px] rounded-2xl p-3 animate-in slide-in-from-bottom"
            style={{
              maxHeight: '70vh', overflowY: 'auto',
              background: 'var(--glass-bg)', border: '1px solid var(--glass-edge)',
              boxShadow: 'var(--shadow-card)', backdropFilter: 'var(--glass-filter)',
            }}
          >
            <div className="flex items-center justify-between pb-2 pt-1 px-1 mb-1"
              style={{ borderBottom: '1px solid var(--border-default)' }}>
              <span className="mobile-nav__sheet-title">{t('nav.tab.city')}</span>
              <button
                onClick={() => setSheetItems(null)}
                className="p-1.5 rounded-full"
                style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}
                aria-label="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5 pb-1">
              {sheetItems.map((target) => (
                <NavSheetRow
                  key={target.id}
                  target={target}
                  onPicked={() => setSheetItems(null)}
                />
              ))}
            </div>

            {isGuest && (
              <div className="mt-2 text-[11px] font-mono leading-tight rounded-xl p-3"
                style={{ color: 'var(--text-gold)', background: 'var(--badge-gold-bg)', border: '1px solid var(--border-accent)' }}>
                {GUEST_NOTICE}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Стеклянная панель слоя 1 — в потоке рамки (не fixed), всегда видна. */}
      <nav className={`mobile-nav ${className}`} aria-label="Нижняя навигация">
        <div className="mobile-nav__row">
          {NAV_ITEMS.map((item) => {
            const direct = Boolean(item.href);
            const body = (
              <>
                {item.id === 'combat' && inCombat && (
                  <span className="mobile-nav__dot mobile-nav__dot--combat" aria-hidden />
                )}
                {item.id === 'city' && activeSkill && (
                  <span className="mobile-nav__dot mobile-nav__dot--skill" aria-hidden />
                )}
                <img className="mobile-nav__icon" src={item.icon} alt="" draggable={false} />
                <span className="mobile-nav__label">{t(item.labelKey)}</span>
              </>
            );
            const cls = `mobile-nav__item${item.isActive(path) ? ' is-on' : ''}${sheetItems && item.sheet ? ' is-on' : ''}`;
            if (direct) {
              return (
                <Link key={item.id} href={item.href!} className={cls}>
                  {body}
                </Link>
              );
            }
            return (
              <button key={item.id} type="button" onClick={() => handlePress(item)} className={cls}>
                {body}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

/** Строка нижнего шита пункта (раздел города, позже — локации и квесты). */
function NavSheetRow({ target, onPicked }: { target: NavSheetTarget; onPicked: () => void }) {
  const skillLevel = usePlayerStore((s) =>
    target.skillId ? (s.skills[target.skillId]?.level ?? 1) : null,
  );
  const activeSkill = useGameStore((s) => s.activeSkill);
  const training = target.skillId != null && activeSkill === target.skillId;

  return (
    <Link
      href={target.href}
      onClick={onPicked}
      className="mobile-nav__sheet-row"
    >
      <span className="mobile-nav__sheet-name">
        {target.skillId ? skillNameRu(target.skillId) : target.label}
      </span>
      <span className="mobile-nav__sheet-meta">
        {target.skillId ? `Уровень ${skillLevel}` : ''}
        {training && <span className="mobile-nav__dot mobile-nav__dot--skill mobile-nav__dot--inline" aria-hidden />}
      </span>
    </Link>
  );
}
