/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║   AETHELIA — КАРТА РОЛЕЙ ТЕМЫ «СТЕКЛО ТАВЕРНЫ»           ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * ЗАКОН (UI_UX_AUDIT.md §5, утверждено владельцем 2026-09-10):
 *
 * - Значения цветов/теней/радиусов живут ТОЛЬКО в src/index.css (:root).
 *   Этот файл — типизированный способ добраться до них из TS-кода:
 *
 *     import { THEME } from '@/styles/tokens';
 *     <div style={{ background: THEME.glass.bg, color: THEME.ink.strong }} />
 *     // → background: var(--glass-bg)
 *
 * - ЗАПРЕЩЕНО класть в этот файл конкретные значения (#…, rgba()).
 *   Нужна новая роль? Сначала объяви переменную в :root, потом — строку тут.
 *
 * ИСТОРИЯ: здесь была светлая тема «Warm Light Fantasy», заявленная как
 * «единый источник правды», но не имевшая ни одного импорта (0 потребителей)
 * и расходившаяся с игрой. Стерта при утверждении канона «Стекло таверны».
 */

const v = (name: string) => `var(--${name})`;

/** Слои канона «Стекло таверны» (по убыванию глубины). */
export const THEME = {

  // ─── Слой 0. Картина (фон приложения) ───────────────────
  art: {
    backdrop: v('art-backdrop'),  // Полотно фона — выбор в одной точке
    veil:     v('art-veil'),      // Затемняющая вуаль над полотном
  },

  // ─── Слой 1. Стекло (панели, листы окон, каркас) ────────
  glass: {
    bg:     v('glass-bg'),
    edge:   v('glass-edge'),
    shadow: v('glass-shadow'),
    filter: v('glass-filter'),    // backdrop-filter рецепта эталона
  },

  // ─── Слой 2. Карточка (тёплое какао внутри листа) ───────
  card: {
    cocoa:        v('card-cocoa'),
    cocoaActive:  v('card-cocoa-active'),
    cocoaDeep:    v('card-cocoa-deep'),   // Глубокое какао панелей/вторичных кнопок
    edge:         v('card-edge'),
    edgeActive:   v('card-edge-active'),
    shadow:       v('card-shadow'),
    shadowSm:     v('card-shadow-sm'),
    select:       v('card-select'),       // Выбранная карточка каталога
    selectShadow: v('card-select-shadow'),
    dark:         v('card-dark'),         // Тёмная панель (GPanel dark)
    activeShadow: v('card-active-shadow'),// Золотое свечение выбранной панели
  },

  // ─── Слой 3. Ячейка предмета ────────────────────────────
  cell: {
    frame:      v('cell-frame'),        // Рама «каштан» — едина у всех ячеек
    frameHover: v('cell-frame-hover'),
    empty:      v('cell-empty'),        // Пустая подкладка — приглушённое стекло
    emptyEdge:  v('cell-empty-edge'),
  },

  // ─── Слой 4. Краски (чернила и золото) ──────────────────
  ink: {
    hero:   v('ink-hero'),    // Золото заголовков/выделенного
    gold:   v('ink-gold'),    // Сплошное золото подписей и мелкой каймы
    bright: v('ink-bright'),  // Яркие сливочные чернила (текст на тёмном)
    strong: v('ink-strong'),  // Основной текст (крем)
    body:   v('ink-body'),    // Вторичный текст
    dim:    v('ink-dim'),     // Приглушённый
    faint:  v('ink-faint'),   // Самая тихая ступень (подписи полей)
    danger: v('ink-danger'),
  },

  // ─── Кайма общего назначения (не карточная) ──────────────
  edge: {
    light:  v('edge-light'),
    accent: v('edge-accent'),
  },

  // ─── Кнопки: ОДИН янтарь-главный + вторичная/опасная ─────
  button: {
    primary:       v('btn-primary'),
    primaryEdge:   v('btn-primary-edge'),
    primaryShadow: v('btn-primary-shadow'),
    primaryInk:    v('btn-primary-ink'),
    secondary:     v('btn-secondary'),     // Глубокое какао
    danger:        v('btn-danger'),
    dangerEdge:    v('btn-danger-edge'),
    dangerShadow:  v('btn-danger-shadow'),
    disabled:      v('btn-disabled'),      // Выключенная главная
    disabledInk:   v('btn-disabled-ink'),
  },

  // ─── Поля ввода ───────────────────────────────────────────
  field: {
    bg:        v('field-bg'),
    shadow:    v('field-shadow'),
    focusGlow: v('field-focus-glow'),
    error:     v('field-error'),
    errorInk:  v('field-error-ink'),
  },

  // ─── Бой и тревога ────────────────────────────────────────
  combat: {
    bg:     v('combat-bg'),
    edge:   v('combat-edge'),
    shadow: v('combat-shadow'),
  },

  // ─── Модалка (рецепт эталона — шаг 8, сейчас 1:1) ────────
  modal: {
    veil:        v('modal-veil'),
    bg:          v('modal-bg'),
    shadow:      v('modal-shadow'),
    titleShadow: v('modal-title-shadow'),
  },

  // ─── Тултип ───────────────────────────────────────────────
  tooltip: {
    bg:     v('tooltip-bg'),
    shadow: v('tooltip-shadow'),
  },

  // ─── Свечения ─────────────────────────────────────────────
  glow: {
    goldSoft: v('glow-gold-soft'),
  },

  // ─── Пилюли (значки): фон + край + чернила ────────────────
  badge: {
    goldBg:    v('badge-gold-bg'),
    goldEdge:  v('border-accent'),
    goldInk:   v('text-gold'),
    redBg:     v('badge-red-bg'),
    redEdge:   v('badge-red-edge'),
    redInk:    v('badge-red-ink'),
    greenBg:   v('badge-green-bg'),
    greenEdge: v('accent-emerald'),
    greenInk:  v('badge-green-ink'),
    blueBg:    v('badge-blue-bg'),
    blueEdge:  v('accent-sapphire'),
    blueInk:   v('badge-blue-ink'),
    purpleBg:    v('badge-purple-bg'),
    purpleEdge:  v('badge-purple-edge'),
    purpleInk:   v('badge-purple-ink'),
    grayBg:    v('badge-gray-bg'),
    grayEdge:  v('badge-gray-edge'),
    grayInk:   v('text-muted'),
    levelBg:   v('badge-level-bg'),
    levelEdge: v('border-light'),
    levelInk:  v('badge-level-ink'),
  },

  // ─── Теги: свои фоны/края, чернила делит с пилюлями ───────
  tag: {
    goldBg:   v('tag-gold-bg'),
    goldEdge: v('tag-gold-edge'),
    goldInk:  v('text-gold'),
    brownBg:   v('tag-brown-bg'),
    brownEdge: v('card-edge'),
    brownInk:  v('text-muted'),
    redBg:   v('tag-red-bg'),
    redEdge: v('tag-red-edge'),
    redInk:  v('badge-red-ink'),
    greenBg:   v('tag-green-bg'),
    greenEdge: v('tag-green-edge'),
    greenInk:  v('badge-green-ink'),
  },

  // ─── Полосы прогресса: лоток + градиент и блик ────────────
  bar: {
    track:       v('progress-track'),
    trackEdge:   v('progress-track-edge'),
    trackShadow: v('progress-track-shadow'),
    goldFrom:   v('border-accent'),
    goldTo:     v('text-gold'),
    goldGlow:   v('bar-gold-glow'),
    greenFrom:  v('bar-green-from'),
    greenTo:    v('bar-green-to'),
    greenGlow:  v('bar-green-glow'),
    redFrom:  v('bar-hp-from'),
    redTo:    v('bar-hp-to'),
    redGlow:  v('bar-red-glow'),
    blueFrom:  v('bar-blue-from'),
    blueTo:    v('bar-blue-to'),
    blueGlow:  v('bar-blue-glow'),
    purpleFrom:  v('bar-purple-from'),
    purpleTo:    v('bar-purple-to'),
    purpleGlow:  v('bar-purple-glow'),
  },

  // ─── Пилюля статистики ────────────────────────────────────
  stat: {
    bg:     v('stat-bg'),
    shadow: v('stat-shadow'),
  },

  // ─── Редкость предметов (единая шкала) ──────────────────
  rarity: {
    common:    v('rarity-common'),
    uncommon:  v('rarity-uncommon'),
    rare:      v('rarity-rare'),
    epic:      v('rarity-epic'),
    legendary: v('rarity-legendary'),
    mythic:    v('rarity-mythic'),
  } as const,

  // ─── «Уникальный предмет» (золотая звезда-эмблема) ──────
  unique: {
    gold: v('unique-gold'),
    glow: v('unique-glow'),
  },

  // ─── Радиусы канона ─────────────────────────────────────
  radius: {
    tag:   v('radius-tag'),        // 8 — метки/пилюли
    cell:  v('radius-cell'),       // 12 — ячейки/поля
    card:  v('radius-card-canon'), // 14 — карточки
    sheet: v('radius-sheet'),      // 22 — окна/листы
  },

  // ─── Шрифтовые роли ─────────────────────────────────────
  font: {
    display: v('app-font-display'),
    sans:    v('app-font-sans'),
    mono:    v('app-font-mono'),
  },

  // ─── Объявления двух уровней (шаги 11–12): цветная кромка по типу ──
  announce: {
    levelup: v('announce-levelup'),   // уровень навыка — золото
    mastery: v('announce-mastery'),   // мастерство зоны — мёд
    combat:  v('announce-combat'),    // бой/нападение — кровь
    warning: v('announce-warning'),   // предупреждение, сумка полна — апельсин
    info:    v('announce-info'),      // нейтральная заметка — дерево
  },

  // ─── Хром переключателей топбара (живые значения шапки) ─
  chrome: {
    btn:       v('chrome-btn'),
    btnOpen:   v('chrome-btn-open'),
    btnEdge:   v('chrome-btn-edge'),
    btnInk:    v('chrome-btn-ink'),
    btnShadow: v('chrome-btn-shadow'),
  },

} as const;

export type RarityId = keyof typeof THEME.rarity;

// ─── УТИЛИТЫ ────────────────────────────────────────────────

/** CSS-переменная как строка для вставки в style: cssVar('glass-bg') */
export function cssVar(name: string) {
  return v(name);
}
