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
    edge:         v('card-edge'),
    edgeActive:   v('card-edge-active'),
    shadow:       v('card-shadow'),
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
    strong: v('ink-strong'),  // Основной текст (крем)
    body:   v('ink-body'),    // Вторичный текст
    dim:    v('ink-dim'),     // Приглушённый
    danger: v('ink-danger'),
  },

  // ─── ОДИН янтарь-главный (все primary-кнопки игры) ──────
  button: {
    primary:       v('btn-primary'),
    primaryEdge:   v('btn-primary-edge'),
    primaryShadow: v('btn-primary-shadow'),
    primaryInk:    v('btn-primary-ink'),
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

} as const;

export type RarityId = keyof typeof THEME.rarity;

// ─── УТИЛИТЫ ────────────────────────────────────────────────

/** CSS-переменная как строка для вставки в style: cssVar('glass-bg') */
export function cssVar(name: string) {
  return v(name);
}
