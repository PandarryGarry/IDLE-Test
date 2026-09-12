/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              AETHELIA RPG — GAME UI KIT                     ║
 * ║  Единый файл всех переиспользуемых UI-примитивов.           ║
 * ║  Используй ТОЛЬКО эти компоненты в новых экранах.           ║
 * ║  Не хардкодь цвета — всё через tokens.ts / CSS-переменные.  ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Список компонентов:
 *   GPanel      — базовый контейнер/панель
 *   GButton     — кнопка (primary | secondary | danger | ghost)
 *   GInput      — поле ввода (с иконкой, валидацией)
 *   GModal      — модальное окно
 *   GBadge      — значок (уровень, редкость, статус)
 *   GAvatar     — аватар персонажа
 *   GSlot       — квадратный слот фиксированного размера (иконка, не текст)
 *   GProgressBar— полоса прогресса
 *   GDivider    — разделитель секций с заголовком
 *   GTooltip    — всплывающая подсказка (обёртка)
 *   GCard       — карточка с вариантами стиля
 *   GTag        — маленький тег/метка
 *   GEmptyState — заглушка пустого состояния
 */

import React, { useState, useEffect } from 'react';
import { iconUrl } from '@/lib/assetUrl';
import { THEME } from '@/styles/tokens';
import { AWindow } from '@/shared/ui/kit/AWindow';

/* ════════════════════════════════════════════════════════════════
   ЦВЕТА — только роли канона «Стекло таверны» (THEME → index.css).
   Краски живут в :root, здесь — лишь короткие имена для компонентов.
   Не используй hex напрямую в компонентах ниже!
════════════════════════════════════════════════════════════════ */
const C = {
  bgDark:     THEME.card.cocoa,
  bgInput:    THEME.field.bg,
  border:     THEME.card.edge,
  borderAccent: THEME.edge.accent,
  borderLight: THEME.edge.light,
  gold:       THEME.ink.gold,
  goldDark:   THEME.edge.accent,
  text:       THEME.ink.bright,
  textMuted:  THEME.ink.dim,
  textDim:    THEME.ink.faint,
  shadow:     THEME.card.shadow,
  shadowBtn:  THEME.button.primaryShadow,
  shadowDanger: THEME.button.dangerShadow,
  radius:     14,
  radiusSm:   8,
  radiusMd:   10,
  radiusLg:   16,
  font:       'var(--app-font-sans)',
  fontMono:   'var(--app-font-mono)',
  fontDisplay:'var(--app-font-display)',
} as const;

/* ════════════════════════════════════════════════════════════════
   GPanel — базовый контейнер
════════════════════════════════════════════════════════════════ */
interface GPanelProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  /** gold = золотая рамка, combat = красная, plain = без тени */
  variant?: 'default' | 'gold' | 'combat' | 'plain' | 'dark';
  className?: string;
}

export function GPanel({ children, style, variant = 'default', className }: GPanelProps) {
  const variants: Record<string, React.CSSProperties> = {
    default: {
      background: C.bgDark,
      border: `2px solid ${C.border}`,
      boxShadow: C.shadow,
    },
    gold: {
      background: THEME.card.cocoaActive,
      border: `2px solid ${C.borderAccent}`,
      boxShadow: THEME.card.activeShadow,
    },
    combat: {
      background: THEME.combat.bg,
      border: `2px solid ${THEME.combat.edge}`,
      boxShadow: THEME.combat.shadow,
    },
    plain: {
      background: C.bgDark,
      border: `1px solid ${C.borderLight}`,
    },
    dark: {
      background: THEME.card.dark,
      border: `2px solid ${C.border}`,
      boxShadow: C.shadow,
    },
  };

  return (
    <div
      className={className}
      style={{
        borderRadius: C.radiusLg,
        padding: 14,
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   GButton — кнопка
════════════════════════════════════════════════════════════════ */
interface GButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
}

export function GButton({
  children, onClick, variant = 'primary', size = 'md',
  disabled = false, fullWidth = false, icon, style, type = 'button',
}: GButtonProps) {
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 11, borderRadius: 8 },
    md: { padding: '10px 18px', fontSize: 13, borderRadius: 10 },
    lg: { padding: '13px 24px', fontSize: 15, borderRadius: 12 },
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: disabled ? THEME.button.disabled : THEME.button.primary,
      border: `2px solid ${THEME.button.primaryEdge}`,
      color: disabled ? THEME.button.disabledInk : THEME.button.primaryInk,
      boxShadow: disabled ? 'none' : C.shadowBtn,
    },
    secondary: {
      background: THEME.button.secondary,
      border: `2px solid ${C.borderLight}`,
      color: C.textMuted,
      boxShadow: C.shadowBtn,
    },
    danger: {
      background: THEME.button.danger,
      border: `2px solid ${THEME.button.dangerEdge}`,
      color: THEME.ink.bright,
      boxShadow: C.shadowDanger,
    },
    ghost: {
      background: 'transparent',
      border: `1px solid ${C.borderLight}`,
      color: C.textMuted,
      boxShadow: 'none',
    },
  };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        width: fullWidth ? '100%' : undefined,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: C.font, fontWeight: 800,
        transition: 'all 0.12s ease',
        opacity: disabled ? 0.6 : 1,
        ...sizes[size],
        ...variants[variant],
        ...style,
      }}
      onMouseEnter={e => {
        if (!disabled && variant !== 'ghost') {
          (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)';
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.filter = '';
      }}
      onMouseDown={e => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(2px)';
      }}
      onMouseUp={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = '';
      }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════
   GInput — поле ввода
════════════════════════════════════════════════════════════════ */
interface GInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  type?: string;
  maxLength?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function GInput({
  value, onChange, placeholder, label, error, hint,
  icon, type = 'text', maxLength, disabled = false, autoFocus = false,
}: GInputProps) {
  const [focused, setFocused] = useState(false);
  const text = typeof value === 'string' ? value : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{
          fontFamily: C.fontMono, fontSize: 9, fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.1em', color: C.textDim,
        }}>
          {label}
        </label>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 12px', borderRadius: C.radiusMd,
        background: C.bgInput,
        border: `2px solid ${error ? THEME.field.error : focused ? C.borderAccent : C.border}`,
        boxShadow: focused ? THEME.field.focusGlow : THEME.field.shadow,
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}>
        {icon && (
          <span style={{ color: C.textDim, display: 'flex', flexShrink: 0 }}>{icon}</span>
        )}
        <input
          type={type}
          value={text}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            fontFamily: C.font, fontSize: 14, fontWeight: 600,
            color: disabled ? C.textDim : C.text,
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
        {maxLength && (
          <span style={{
            fontFamily: C.fontMono, fontSize: 10, color: C.textDim, flexShrink: 0,
          }}>
            {text.length}/{maxLength}
          </span>
        )}
      </div>

      {error && (
        <span style={{ fontFamily: C.fontMono, fontSize: 10, color: THEME.field.errorInk }}>
          ⚠ {error}
        </span>
      )}
      {hint && !error && (
        <span style={{ fontFamily: C.fontMono, fontSize: 10, color: C.textDim }}>
          {hint}
        </span>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   GModal — модальное окно
════════════════════════════════════════════════════════════════ */
interface GModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number | string;
  /** Закрывать ли по клику на оверлей */
  closeOnOverlay?: boolean;
}

export function GModal({ open, onClose, title, children, width = 340, closeOnOverlay = true }: GModalProps) {
  // Каркас единый — kit/AWindow (стекло эталона, шаг 8 аудита).
  return (
    <AWindow
      open={open}
      onClose={onClose}
      title={title}
      width={width}
      closeOnOverlay={closeOnOverlay}
    >
      {children}
    </AWindow>
  );
}

/* ════════════════════════════════════════════════════════════════
   GBadge — значок / тег
════════════════════════════════════════════════════════════════ */
type BadgeVariant = 'gold' | 'red' | 'green' | 'blue' | 'purple' | 'gray' | 'level';

interface GBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

const BADGE_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  gold:   { background: THEME.badge.goldBg, border: `1px solid ${THEME.badge.goldEdge}`, color: THEME.badge.goldInk },
  red:    { background: THEME.badge.redBg,  border: `1px solid ${THEME.badge.redEdge}`,  color: THEME.badge.redInk },
  green:  { background: THEME.badge.greenBg, border: `1px solid ${THEME.badge.greenEdge}`, color: THEME.badge.greenInk },
  blue:   { background: THEME.badge.blueBg, border: `1px solid ${THEME.badge.blueEdge}`, color: THEME.badge.blueInk },
  purple: { background: THEME.badge.purpleBg, border: `1px solid ${THEME.badge.purpleEdge}`, color: THEME.badge.purpleInk },
  gray:   { background: THEME.badge.grayBg, border: `1px solid ${THEME.badge.grayEdge}`, color: THEME.badge.grayInk },
  level:  { background: THEME.badge.levelBg, border: `2px solid ${THEME.badge.levelEdge}`, color: THEME.badge.levelInk },
};

export function GBadge({ children, variant = 'gold', size = 'md', style }: GBadgeProps) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: size === 'sm' ? '1px 6px' : '2px 8px',
      borderRadius: 9999,
      fontFamily: C.fontMono,
      fontSize: size === 'sm' ? 9 : 11,
      fontWeight: 800,
      lineHeight: 1.4,
      ...BADGE_STYLES[variant],
      ...style,
    }}>
      {children}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════
   GAvatar — аватар персонажа
════════════════════════════════════════════════════════════════ */
interface GAvatarProps {
  /** Путь к изображению или эмодзи */
  src?: string;
  emoji?: string;
  size?: number;
  /** Цвет рамки (обычно по редкости или классу) */
  borderColor?: string;
  glow?: boolean;
  style?: React.CSSProperties;
}

export function GAvatar({
  src, emoji, size = 48, borderColor = 'var(--border-accent)', glow = false, style,
}: GAvatarProps) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'var(--bg-slot)',
      border: `2px solid ${borderColor}`,
      boxShadow: glow ? 'var(--shadow-gold), var(--shadow-slot)' : 'var(--shadow-slot)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      ...style,
    }}>
      {src ? (
        <img src={src} alt="" decoding="async" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
      ) : (
        <span style={{ fontSize: Math.round(size * 0.5), lineHeight: 1 }}>{emoji ?? '🛡️'}</span>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   GSlot — квадрат фиксированного px: рамка-WebP, иконка внутри,
   подпись снаружи. Без hover-translate (иначе сетка дёргается).
════════════════════════════════════════════════════════════════ */
const SLOT_FRAME = {
  empty: iconUrl('ui/slots/slot_parchment_empty'),
  common: iconUrl('ui/slots/slot_parchment_common'),
  uncommon: iconUrl('ui/slots/slot_parchment_uncommon'),
  rare: iconUrl('ui/slots/slot_parchment_rare'),
  epic: iconUrl('ui/slots/slot_parchment_epic'),
  legendary: iconUrl('ui/slots/slot_parchment_legendary'),
  locked: iconUrl('ui/slots/slot_parchment_locked'),
  active: iconUrl('ui/slots/slot_parchment_legendary'),
} as const;

interface GSlotProps {
  src?: string;
  emoji?: string;
  size?: number;
  selected?: boolean;
  disabled?: boolean;
  badge?: React.ReactNode;
  label?: string;
  title?: string;
  frame?: keyof typeof SLOT_FRAME;
  dimmed?: boolean;
  onClick?: () => void;
  className?: string;
}

export function GSlot({
  src, emoji, size = 48, selected = false, disabled = false,
  badge, label, title, frame: frameKey, dimmed = false, onClick, className,
}: GSlotProps) {
  const lit = selected && !dimmed;
  const frame = SLOT_FRAME[frameKey ?? (lit ? 'active' : (src || emoji) ? 'common' : 'empty')];
  const iconPad = Math.round(size * 0.18);
  const faceStyle: React.CSSProperties = {
    position: 'relative',
    width: size,
    height: size,
    padding: 0,
    border: 0,
    outline: 'none',
    background: 'transparent',
    backgroundImage: `url(${frame})`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    boxShadow: lit ? '0 0 0 1px var(--border-accent), var(--shadow-gold)' : 'none',
    cursor: disabled ? 'not-allowed' : onClick ? 'pointer' : 'default',
    opacity: disabled || dimmed ? 0.42 : 1,
    filter: dimmed ? 'grayscale(0.35) saturate(0.7)' : undefined,
    flexShrink: 0,
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        width: size,
        flexShrink: 0,
      }}
    >
      {onClick ? (
        <button
          type="button"
          title={title}
          aria-label={title || label}
          aria-pressed={selected}
          disabled={disabled}
          onClick={disabled ? undefined : onClick}
          style={faceStyle}
        >
          <GSlotFace src={src} emoji={emoji} size={size} iconPad={iconPad} badge={badge} />
        </button>
      ) : (
        <div title={title} aria-label={title || label} style={faceStyle}>
          <GSlotFace src={src} emoji={emoji} size={size} iconPad={iconPad} badge={badge} />
        </div>
      )}
      {label && (
        <span
          style={{
            width: size,
            overflow: 'hidden',
            color: selected ? 'var(--text-gold)' : 'var(--text-muted)',
            fontFamily: C.fontMono,
            fontSize: 11,
            fontWeight: 800,
            lineHeight: 1.1,
            textAlign: 'center',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

function GSlotFace({
  src, emoji, size, iconPad, badge,
}: {
  src?: string;
  emoji?: string;
  size: number;
  iconPad: number;
  badge?: React.ReactNode;
}) {
  return (
    <>
      <span
        style={{
          position: 'absolute',
          inset: iconPad,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {src ? (
          <img
            src={src}
            alt=""
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : emoji ? (
          <span style={{ fontSize: Math.round(size * 0.42), lineHeight: 1 }}>{emoji}</span>
        ) : null}
      </span>
      {badge != null && (
        <span
          style={{
            position: 'absolute',
            right: 1,
            bottom: 1,
            minWidth: 14,
            height: 14,
            padding: '0 3px',
            borderRadius: 4,
            background: 'var(--bg-header)',
            color: 'var(--text-gold)',
            fontFamily: C.fontMono,
            fontSize: 9,
            fontWeight: 800,
            lineHeight: '14px',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          {badge}
        </span>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   GProgressBar — полоса прогресса
════════════════════════════════════════════════════════════════ */
interface GProgressBarProps {
  value: number;     // 0..1
  color?: 'gold' | 'green' | 'red' | 'blue' | 'purple';
  height?: number;
  showLabel?: boolean;
  label?: string;
  style?: React.CSSProperties;
}

const BAR_COLORS: Record<string, { from: string; to: string; glow: string }> = {
  gold:   { from: THEME.bar.goldFrom, to: THEME.bar.goldTo, glow: THEME.bar.goldGlow },
  green:  { from: THEME.bar.greenFrom, to: THEME.bar.greenTo, glow: THEME.bar.greenGlow },
  red:    { from: THEME.bar.redFrom, to: THEME.bar.redTo, glow: THEME.bar.redGlow },
  blue:   { from: THEME.bar.blueFrom, to: THEME.bar.blueTo, glow: THEME.bar.blueGlow },
  purple: { from: THEME.bar.purpleFrom, to: THEME.bar.purpleTo, glow: THEME.bar.purpleGlow },
};

export function GProgressBar({ value, color = 'gold', height = 8, showLabel, label, style }: GProgressBarProps) {
  const c = BAR_COLORS[color];
  const pct = Math.min(100, Math.max(0, value * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, ...style }}>
      {(showLabel || label) && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {label && <span style={{ fontFamily: C.fontMono, fontSize: 9, color: C.textDim }}>{label}</span>}
          {showLabel && <span style={{ fontFamily: C.fontMono, fontSize: 9, color: C.textDim }}>{pct.toFixed(0)}%</span>}
        </div>
      )}
      <div style={{
        height, background: THEME.bar.track,
        border: `1px solid ${THEME.bar.trackEdge}`,
        borderRadius: 9999, overflow: 'hidden',
        boxShadow: THEME.bar.trackShadow,
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${c.from}, ${c.to})`,
          borderRadius: 9999,
          boxShadow: `0 0 6px ${c.glow}`,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   GDivider — разделитель секций
════════════════════════════════════════════════════════════════ */
interface GDividerProps {
  label?: string;
  icon?: string;
  style?: React.CSSProperties;
}

export function GDivider({ label, icon, style }: GDividerProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      margin: '4px 0',
      ...style,
    }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(270deg,${C.borderLight},transparent)` }} />
      {icon && <span style={{ fontSize: 12 }}>{icon}</span>}
      {label && (
        <span style={{
          fontFamily: C.fontMono, fontSize: 10, fontWeight: 900,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          color: C.gold, textShadow: THEME.glow.goldSoft,
          whiteSpace: 'nowrap',
        }}>{label}</span>
      )}
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.borderLight},transparent)` }} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   GCard — карточка (например, для аватаров, предметов)
════════════════════════════════════════════════════════════════ */
interface GCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  hoverEffect?: boolean;
}

export function GCard({ children, onClick, selected, disabled, style, className, hoverEffect = true }: GCardProps) {
  return (
    <div
      className={className}
      onClick={disabled ? undefined : onClick}
      style={{
        borderRadius: C.radiusMd,
        background: selected ? THEME.card.select : THEME.card.cocoaDeep,
        border: `2px solid ${selected ? C.borderAccent : C.border}`,
        boxShadow: selected ? THEME.card.selectShadow : THEME.card.shadowSm,
        cursor: disabled ? 'not-allowed' : onClick ? 'pointer' : 'default',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.12s ease',
        ...style,
      }}
      onMouseEnter={e => {
        if (!disabled && !selected && hoverEffect && onClick) {
          (e.currentTarget as HTMLDivElement).style.borderColor = C.borderAccent;
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={e => {
        if (!disabled && !selected && hoverEffect && onClick) {
          (e.currentTarget as HTMLDivElement).style.borderColor = C.border;
          (e.currentTarget as HTMLDivElement).style.transform = '';
        }
      }}
    >
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   GTag — маленькая метка/тег
════════════════════════════════════════════════════════════════ */
interface GTagProps {
  children: React.ReactNode;
  color?: 'gold' | 'brown' | 'red' | 'green';
}

export function GTag({ children, color = 'brown' }: GTagProps) {
  const colors: Record<string, React.CSSProperties> = {
    gold:  { background: THEME.tag.goldBg, border: `1px solid ${THEME.tag.goldEdge}`, color: THEME.tag.goldInk },
    brown: { background: THEME.tag.brownBg, border: `1px solid ${THEME.tag.brownEdge}`, color: THEME.tag.brownInk },
    red:   { background: THEME.tag.redBg, border: `1px solid ${THEME.tag.redEdge}`, color: THEME.tag.redInk },
    green: { background: THEME.tag.greenBg, border: `1px solid ${THEME.tag.greenEdge}`, color: THEME.tag.greenInk },
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 6,
      fontFamily: C.fontMono, fontSize: 9, fontWeight: 800,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      lineHeight: 1.6,
      ...colors[color],
    }}>
      {children}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════
   GEmptyState — заглушка пустого состояния
════════════════════════════════════════════════════════════════ */
interface GEmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function GEmptyState({ icon = '📦', title, description, action }: GEmptyStateProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 10, padding: '32px 16px', textAlign: 'center',
    }}>
      <span style={{ fontSize: 40, opacity: 0.5, filter: 'grayscale(0.5)' }}>{icon}</span>
      <div>
        <div style={{ fontFamily: C.fontDisplay, fontSize: 16, fontWeight: 900, color: C.textMuted, marginBottom: 4 }}>
          {title}
        </div>
        {description && (
          <div style={{ fontFamily: C.font, fontSize: 12, color: C.textDim, lineHeight: 1.5 }}>
            {description}
          </div>
        )}
      </div>
      {action && (
        <GButton onClick={action.onClick} variant="secondary" size="sm">
          {action.label}
        </GButton>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   GTooltip — всплывающая подсказка
════════════════════════════════════════════════════════════════ */
interface GTooltipProps {
  content: string;
  children: React.ReactNode;
  placement?: 'top' | 'bottom';
}

export function GTooltip({ content, children, placement = 'top' }: GTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div style={{
          position: 'absolute',
          [placement === 'top' ? 'bottom' : 'top']: 'calc(100% + 6px)',
          left: '50%', transform: 'translateX(-50%)',
          background: THEME.tooltip.bg,
          border: `1px solid ${C.border}`,
          borderRadius: 8, padding: '5px 10px',
          fontFamily: C.fontMono, fontSize: 10, color: C.textMuted,
          whiteSpace: 'nowrap', zIndex: 1000,
          boxShadow: THEME.tooltip.shadow,
          pointerEvents: 'none',
        }}>
          {content}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   GSeparator — простой горизонтальный разделитель
════════════════════════════════════════════════════════════════ */
export function GSeparator({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{
      height: 1,
      background: `linear-gradient(90deg, transparent, ${C.borderLight}, transparent)`,
      margin: '8px 0',
      ...style,
    }} />
  );
}

/* ════════════════════════════════════════════════════════════════
   GInfoRow — строка ключ-значение (для попапов предметов и т.д.)
════════════════════════════════════════════════════════════════ */
interface GInfoRowProps {
  label: string;
  value: React.ReactNode;
  valueColor?: string;
}

export function GInfoRow({ label, value, valueColor = C.gold }: GInfoRowProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
      {/* Подпись — тёплый приглушённый крем эталона: старый серый textDim
          на коричневом фоне окна не читался (замечание аудита §3.1, столп). */}
      <span style={{ fontFamily: C.fontMono, fontSize: 11, color: 'var(--cinematic-copy)', letterSpacing: '0.02em' }}>{label}</span>
      <span style={{ fontFamily: C.fontMono, fontSize: 11, fontWeight: 800, color: valueColor }}>{value}</span>
    </div>
  );
}
