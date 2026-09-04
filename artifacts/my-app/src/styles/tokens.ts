/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║         AETHELIA RPG — DESIGN TOKENS                    ║
 * ║  Единый источник правды для всей палитры игры.          ║
 * ║  Меняй здесь — меняется везде.                          ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * СТИЛЬ: Warm Light Fantasy — светлый, живой, уютный RPG.
 * Вдохновение: классические fantasy UI.
 */

export const THEME = {

  // ─── ФОНЫ ───────────────────────────────────────────────
  bg: {
    page:       '#f5ede0',   // Базовый фон страницы — светлый пергамент
    sidebar:    '#2d1f0f',   // Сайдбар — тёмный дуб
    card:       '#fdf5e8',   // Карточка/панель — кремовый
    cardHover:  '#fff8ef',   // Карточка при наведении
    cardDark:   '#e8d5b5',   // Карточка второго уровня
    slot:       '#ede0c8',   // Ячейка инвентаря — пустая
    slotHover:  '#f5e8cc',   // Ячейка при наведении
    input:      '#fdf5e8',   // Поле ввода
    overlay:    'rgba(45, 31, 15, 0.75)', // Оверлей/модал
    header:     '#3d2910',   // Шапка (топ-бар)
  },

  // ─── БОРДЕРЫ ────────────────────────────────────────────
  border: {
    default:    '#c8a878',   // Обычная граница — бронза
    light:      '#e0c898',   // Лёгкая граница
    strong:     '#8b6030',   // Акцентная граница
    accent:     '#d4860a',   // Золотая граница
    sidebar:    '#4a3018',   // Граница сайдбара
    card:       '#d4b880',   // Граница карточки
    slot:       '#b8966a',   // Граница ячейки
    slotEmpty:  '#c8a870',   // Граница пустой ячейки (dashed)
  },

  // ─── ТЕКСТ ──────────────────────────────────────────────
  text: {
    primary:    '#2d1f0f',   // Основной — тёмный шоколад
    secondary:  '#6b4a28',   // Вторичный — тёплый коричневый
    muted:      '#9a7450',   // Приглушённый
    light:      '#c8a878',   // Светлый (на тёмном фоне)
    white:      '#fdf5e8',   // Белый (на тёмном)
    accent:     '#c8780a',   // Акцент — янтарь
    gold:       '#d4860a',   // Золотой
    sidebar:    '#e8d0a8',   // Текст сайдбара
    sidebarMuted: '#9a7850', // Приглушённый текст сайдбара
  },

  // ─── АКЦЕНТНЫЕ ЦВЕТА (навыки, статусы) ─────────────────
  accent: {
    gold:       '#d4860a',   // Золото — основной акцент
    goldLight:  '#f0a820',   // Светлое золото
    goldBg:     '#fef3d0',   // Фон золотого акцента
    emerald:    '#1a9e5a',   // Изумруд — добыча/природа
    emeraldBg:  '#d0f0e0',   // Фон изумруда
    ruby:       '#c0281e',   // Рубин — бой/урон
    rubyBg:     '#fde8e8',   // Фон рубина
    sapphire:   '#1860c0',   // Сапфир — магия/вода
    sapphireBg: '#e0eeff',   // Фон сапфира
    amber:      '#d06010',   // Янтарь — огонь/ремесло
    amberBg:    '#fff0d8',   // Фон янтаря
    teal:       '#0e8a7a',   // Бирюза — рыбалка
    tealBg:     '#d0f5f0',   // Фон бирюзы
    purple:     '#7030b0',   // Фиолет — магия
    purpleBg:   '#f0e0ff',   // Фон фиолета
  },

  // ─── РЕДКОСТЬ ПРЕДМЕТОВ ─────────────────────────────────
  rarity: {
    common:    { border: '#b8a080', bg: '#f5eedd', text: '#6b5030', glow: 'none' },
    uncommon:  { border: '#3a9e50', bg: '#e0f5e8', text: '#1a6e30', glow: '0 0 8px rgba(58,158,80,0.3)' },
    rare:      { border: '#2060c0', bg: '#e0eeff', text: '#1040a0', glow: '0 0 10px rgba(32,96,192,0.3)' },
    epic:      { border: '#8040c0', bg: '#f0e0ff', text: '#6020a0', glow: '0 0 12px rgba(128,64,192,0.35)' },
    legendary: { border: '#c07010', bg: '#fff0c0', text: '#904800', glow: '0 0 14px rgba(192,112,16,0.45)' },
    mythic:    { border: '#c02840', bg: '#ffe0e8', text: '#900020', glow: '0 0 16px rgba(192,40,64,0.5)' },
  },

  // ─── ПОЛОСЫ ПРОГРЕССА ───────────────────────────────────
  bar: {
    track:      '#dcc8a0',   // Фон полосы
    trackBorder:'#c0a070',   // Граница фона
    xp:         { from: '#d4860a', to: '#f0b830' },  // XP — золото
    hp:         { from: '#b02020', to: '#e04040' },  // HP — красный
    mana:       { from: '#2050b0', to: '#4080e0' },  // Мана — синий
    mastery:    { from: '#c07010', to: '#e0a030' },  // Мастерство — янтарь
    combat:     { from: '#c02828', to: '#e05050' },  // Боевой — красный
    wood:       { from: '#2e7d32', to: '#4caf50' },  // Лесорубство
    mining:     { from: '#c07010', to: '#e0a030' },  // Горное дело
    fishing:    { from: '#0e7a8a', to: '#20a0b8' },  // Рыбалка
    cooking:    { from: '#b05010', to: '#e07830' },  // Кулинария
    smithing:   { from: '#607080', to: '#8090a0' },  // Кузница
    fire:       { from: '#c04010', to: '#e06020' },  // Огонь
  },

  // ─── КНОПКИ ─────────────────────────────────────────────
  button: {
    primary:    { bg: '#d4860a', bgHover: '#e09820', border: '#b06008', text: '#fff8ee' },
    secondary:  { bg: '#e8d5b5', bgHover: '#f0e0c0', border: '#c0a070', text: '#4a2e10' },
    danger:     { bg: '#fde8e8', bgHover: '#c02828', border: '#c05050', text: '#900020' },
    success:    { bg: '#e0f5e8', bgHover: '#2e8b40', border: '#3a9e50', text: '#1a5e28' },
    ghost:      { bg: 'transparent', bgHover: '#f0e0c8', border: '#c8a878', text: '#6b4a28' },
  },

  // ─── ТЕНИ И ЭФФЕКТЫ ─────────────────────────────────────
  shadow: {
    card:   '0 2px 12px rgba(45,31,15,0.12), 0 1px 4px rgba(45,31,15,0.08)',
    cardHover: '0 6px 24px rgba(45,31,15,0.18)',
    slot:   'inset 0 2px 4px rgba(45,31,15,0.12)',
    gold:   '0 0 16px rgba(212,134,10,0.4)',
    active: '0 0 20px rgba(26,158,90,0.3)',
    combat: '0 0 20px rgba(192,40,30,0.3)',
  },

  // ─── РАДИУСЫ ────────────────────────────────────────────
  radius: {
    sm:   '6px',
    md:   '10px',
    lg:   '14px',
    xl:   '18px',
    full: '9999px',
  },

  // ─── ШРИФТЫ ─────────────────────────────────────────────
  font: {
    display: "'Cinzel', serif",
    sans:    "'Inter', sans-serif",
    mono:    "'JetBrains Mono', monospace",
  },

} as const;

// ─── УТИЛИТЫ ────────────────────────────────────────────────

/** Градиент для полосы прогресса */
export function barGradient(bar: { from: string; to: string }) {
  return `linear-gradient(90deg, ${bar.from}, ${bar.to})`;
}

/** CSS-переменные как строка для вставки в style */
export function cssVar(name: string) {
  return `var(--${name})`;
}

// Экспорт отдельных групп для удобства
export const COLORS   = THEME;
export const RARITY   = THEME.rarity;
export const BARS     = THEME.bar;
export const BUTTONS  = THEME.button;
export const SHADOWS  = THEME.shadow;
