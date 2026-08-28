/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           AETHELIA RPG — CHANGELOG                          ║
 * ║                                                             ║
 * ║  Правила заполнения:                                        ║
 * ║  • Только ВАЖНЫЕ изменения для игрока                       ║
 * ║  • НЕ пишем: "починили рамку", "поменяли цвет кнопки"      ║
 * ║  • Пишем: новые механики, предметы, навыки, балансировку    ║
 * ║  • Версия = MAJOR.MINOR.PATCH                               ║
 * ║  • date = ISO строка                                        ║
 * ║  • Максимум 5 записей на версию (выбираем главное)          ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type ChangeType =
  | 'new'      // 🆕 Новая механика / контент
  | 'improve'  // ⚡ Улучшение существующего
  | 'balance'  // ⚖️ Балансировка (XP, дроп, время)
  | 'fix'      // 🔧 Исправление важного бага
  | 'event';   // 🎉 Событие / акция

export interface ChangeEntry {
  type: ChangeType;
  text: string;
}

export interface VersionEntry {
  version: string;
  date: string;        // ISO: "2026-08-28"
  title: string;       // Название патча (напр. "Эпоха Железа")
  changes: ChangeEntry[];
}

// ── ИКОНКИ ПО ТИПУ ──────────────────────────────────────────────
export const CHANGE_ICONS: Record<ChangeType, string> = {
  new:     '🆕',
  improve: '⚡',
  balance: '⚖️',
  fix:     '🔧',
  event:   '🎉',
};

export const CHANGE_COLORS: Record<ChangeType, string> = {
  new:     '#4ade80',   // зелёный — новое
  improve: '#f0c030',   // золото — улучшение
  balance: '#60a0ff',   // синий — баланс
  fix:     '#ff8060',   // оранжевый — фикс
  event:   '#e060ff',   // фиолетовый — событие
};

// ════════════════════════════════════════════════════════════════
//  ИСТОРИЯ ВЕРСИЙ — добавляй новые СВЕРХУ
// ════════════════════════════════════════════════════════════════
export const CHANGELOG: VersionEntry[] = [
  {
    version: '0.1.0',
    date: '2026-08-28',
    title: 'Рождение мира',
    changes: [
      { type: 'new', text: 'Запуск Aethelia RPG — мир Этелии открыт для искателей приключений' },
      { type: 'new', text: 'Доступны 6 профессий: Лесорубство, Горное дело, Рыбалка, Кулинария, Кузнечество, Огонь' },
      { type: 'new', text: 'Боевая система: сражения с монстрами на Боевой арене' },
      { type: 'new', text: 'Оффлайн-прогресс: персонаж продолжает работать пока ты отдыхаешь' },
      { type: 'new', text: 'Инвентарь с системой расширения слотов' },
    ],
  },

  // ── ШАБЛОН ДЛЯ СЛЕДУЮЩЕЙ ВЕРСИИ ────────────────────────────
  // {
  //   version: '0.2.0',
  //   date: '2026-XX-XX',
  //   title: 'Название патча',
  //   changes: [
  //     { type: 'new',     text: '...' },
  //     { type: 'improve', text: '...' },
  //     { type: 'balance', text: '...' },
  //     { type: 'fix',     text: '...' },
  //   ],
  // },
];

// ── УТИЛИТЫ ─────────────────────────────────────────────────────

/** Текущая версия игры */
export const CURRENT_VERSION = CHANGELOG[0]?.version ?? '0.0.1';

/** Последний патч */
export const LATEST_PATCH = CHANGELOG[0];

/**
 * Возвращает записи changelog которые игрок ещё не видел.
 * Сравниваем lastSeenVersion из localStorage с текущей.
 */
export function getUnseenChangelog(): VersionEntry[] {
  try {
    const lastSeen = localStorage.getItem('aethelia_last_seen_version');
    if (!lastSeen) return CHANGELOG.slice(0, 1); // показываем только последний патч новым игрокам
    if (lastSeen === CURRENT_VERSION) return [];

    // Находим все версии новее lastSeen
    const lastIdx = CHANGELOG.findIndex(v => v.version === lastSeen);
    if (lastIdx === -1) return CHANGELOG.slice(0, 1);
    return CHANGELOG.slice(0, lastIdx);
  } catch {
    return [];
  }
}

/** Отмечаем что игрок видел текущую версию */
export function markChangelogSeen(): void {
  try {
    localStorage.setItem('aethelia_last_seen_version', CURRENT_VERSION);
  } catch {}
}
