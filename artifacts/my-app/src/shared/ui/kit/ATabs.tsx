import React from 'react';

/**
 * `ATabs` — единые вкладки игры (шаг 9 аудита).
 * Два вида по канону «Стекло таверны»:
 *   - `pills` — горизонтальные пилюли разделов (хаб героя: Тело/Экип/Нити/Путь);
 *     с `direction="column"` — вертикальный список (сумки админки);
 *   - `rail` — узкая колонка иконок с подписями (рейл админки).
 * Раньше те же роли играли свои классы hero-hub__tab и admin-nui__icon/__bag —
 * теперь примитив один, а цвета только из темы.
 */
export interface ATabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  title?: string;
}

export interface ATabsProps {
  tabs: readonly ATabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'pills' | 'rail';
  direction?: 'row' | 'column';
  ariaLabel?: string;
  className?: string;
}

export function ATabs({
  tabs,
  activeId,
  onChange,
  variant = 'pills',
  direction = 'row',
  ariaLabel = 'Вкладки',
  className = '',
}: ATabsProps) {
  return (
    <nav
      className={`a-tabs a-tabs--${variant}${direction === 'column' ? ' a-tabs--column' : ''} ${className}`}
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`a-tabs__tab${activeId === tab.id ? ' is-on' : ''}`}
          title={tab.title}
          aria-current={activeId === tab.id ? 'page' : undefined}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon && <span className="a-tabs__icon" aria-hidden>{tab.icon}</span>}
          <span className="a-tabs__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
