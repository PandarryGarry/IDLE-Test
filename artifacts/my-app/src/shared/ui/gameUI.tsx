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
 *   GProgressBar— полоса прогресса
 *   GDivider    — разделитель секций с заголовком
 *   GTooltip    — всплывающая подсказка (обёртка)
 *   GCard       — карточка с вариантами стиля
 *   GTag        — маленький тег/метка
 *   GEmptyState — заглушка пустого состояния
 */

import React, { useState, useRef, useEffect } from 'react';

/* ════════════════════════════════════════════════════════════════
   ЦВЕТА — берём из CSS-переменных (tokens.ts → index.css)
   Не используй hex напрямую в компонентах ниже!
════════════════════════════════════════════════════════════════ */
const C = {
  bgPanel:    'var(--bg-card)',
  bgDark:     'linear-gradient(160deg,#7a5028,#5a3818)',
  bgInput:    'linear-gradient(160deg,#3d2008,#2a1406)',
  bgSlot:     'linear-gradient(160deg,#2e1608,#1e0e04)',
  border:     '#5a3010',
  borderAccent:'#c8880a',
  borderLight: '#8b5020',
  gold:       '#f0c030',
  goldDark:   '#c8880a',
  text:       '#fff8d0',
  textMuted:  '#c8a050',
  textDim:    '#8b6030',
  shadow:     '0 4px 0 #3d1e08, 0 6px 20px rgba(10,4,0,0.35)',
  shadowBtn:  '0 3px 0 #2a1005',
  shadowDanger:'0 3px 0 #5a0a04',
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
      background: 'linear-gradient(160deg,#5a3810,#3a2208)',
      border: `2px solid ${C.borderAccent}`,
      boxShadow: `0 4px 0 #2a1005, 0 0 24px rgba(200,136,10,0.2)`,
    },
    combat: {
      background: 'linear-gradient(160deg,#5a1808,#3a0e06)',
      border: '2px solid #c83020',
      boxShadow: '0 4px 0 #2a0a04, 0 0 24px rgba(200,48,32,0.2)',
    },
    plain: {
      background: C.bgDark,
      border: `1px solid ${C.borderLight}`,
    },
    dark: {
      background: 'linear-gradient(160deg,#3a2008,#2a1406)',
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
      background: disabled
        ? 'linear-gradient(180deg,#6a5028,#4a3818)'
        : 'linear-gradient(180deg,#c8880a,#9a6008)',
      border: '2px solid #6b4008',
      color: disabled ? '#a07838' : '#fff8d0',
      boxShadow: disabled ? 'none' : C.shadowBtn,
    },
    secondary: {
      background: 'linear-gradient(160deg,#5a3010,#3a1e08)',
      border: `2px solid ${C.borderLight}`,
      color: C.textMuted,
      boxShadow: C.shadowBtn,
    },
    danger: {
      background: 'linear-gradient(180deg,#c83020,#a02010)',
      border: '2px solid #6b1808',
      color: '#fff8d0',
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
        border: `2px solid ${error ? '#c83020' : focused ? C.borderAccent : C.border}`,
        boxShadow: focused ? `0 0 0 2px rgba(200,136,10,0.2)` : 'inset 0 2px 4px rgba(0,0,0,0.35)',
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
        <span style={{ fontFamily: C.fontMono, fontSize: 10, color: '#ff7060' }}>
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
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Оверлей */}
      <div
        onClick={closeOnOverlay ? onClose : undefined}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(15,8,0,0.8)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.15s ease',
        }}
      />

      {/* Окно */}
      <div style={{
        position: 'fixed', zIndex: 201,
        left: '50%', top: '50%',
        transform: 'translate(-50%,-50%)',
        width: `min(${typeof width === 'number' ? width + 'px' : width}, 92vw)`,
        maxHeight: '85vh', overflowY: 'auto',
        background: 'linear-gradient(160deg,#7a5028,#4a2c10)',
        border: `2px solid ${C.borderAccent}`,
        borderRadius: 20,
        boxShadow: '0 8px 0 #2a1005, 0 12px 40px rgba(10,4,0,0.7)',
        animation: 'slideUp 0.2s ease',
      }}>
        {/* Шапка */}
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 18px 12px',
            borderBottom: `1px solid ${C.borderLight}`,
          }}>
            <span style={{
              fontFamily: C.fontDisplay, fontSize: 18, fontWeight: 900,
              color: C.text, textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}>{title}</span>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: C.textDim, fontSize: 20, padding: 4, lineHeight: 1,
              }}
            >✕</button>
          </div>
        )}

        {/* Контент */}
        <div style={{ padding: '14px 18px 18px' }}>
          {children}
        </div>
      </div>
    </>
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
  gold:   { background: 'rgba(200,136,10,0.2)', border: '1px solid #c8880a', color: '#f0c030' },
  red:    { background: 'rgba(200,40,20,0.2)',  border: '1px solid #c82818', color: '#ff8060' },
  green:  { background: 'rgba(30,160,80,0.2)',  border: '1px solid #1a9e5a', color: '#4ade80' },
  blue:   { background: 'rgba(30,100,200,0.2)', border: '1px solid #1860c0', color: '#60a0ff' },
  purple: { background: 'rgba(120,40,200,0.2)', border: '1px solid #7828c8', color: '#c080ff' },
  gray:   { background: 'rgba(100,70,40,0.3)',  border: '1px solid #6b4020', color: '#c8a050' },
  level:  { background: '#1e0c04',              border: '2px solid #8b5020', color: '#d4a840' },
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
  src, emoji, size = 48, borderColor = '#c8880a', glow = false, style,
}: GAvatarProps) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(160deg,#2e1608,#1e0e04)',
      border: `2px solid ${borderColor}`,
      boxShadow: glow ? `0 0 16px ${borderColor}88, inset 0 2px 6px rgba(0,0,0,0.5)` : 'inset 0 2px 6px rgba(0,0,0,0.5)',
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
  gold:   { from: '#c8880a', to: '#f0c030', glow: 'rgba(240,192,48,0.5)' },
  green:  { from: '#1a7a38', to: '#2ecc70', glow: 'rgba(46,204,112,0.5)' },
  red:    { from: '#b02020', to: '#e04040', glow: 'rgba(224,64,64,0.5)'  },
  blue:   { from: '#1848a0', to: '#4080e0', glow: 'rgba(64,128,224,0.5)' },
  purple: { from: '#6020a0', to: '#a050e0', glow: 'rgba(160,80,224,0.5)' },
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
        height, background: '#1a0a04',
        border: '1px solid #4a2810',
        borderRadius: 9999, overflow: 'hidden',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
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
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg,#8b5020,transparent)' }} />
      {icon && <span style={{ fontSize: 12 }}>{icon}</span>}
      {label && (
        <span style={{
          fontFamily: C.fontMono, fontSize: 10, fontWeight: 900,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          color: C.gold, textShadow: '0 0 12px rgba(240,192,48,0.4)',
          whiteSpace: 'nowrap',
        }}>{label}</span>
      )}
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,#8b5020,transparent)' }} />
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
        background: selected
          ? 'linear-gradient(160deg,#4a2c0a,#2e1a06)'
          : 'linear-gradient(160deg,#5a3010,#3a1e08)',
        border: `2px solid ${selected ? C.borderAccent : C.border}`,
        boxShadow: selected
          ? `0 3px 0 #2a1005, 0 0 14px rgba(200,136,10,0.3)`
          : '0 3px 0 #3d1e08',
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
    gold:  { background: 'rgba(200,136,10,0.15)', border: '1px solid rgba(200,136,10,0.4)', color: '#f0c030' },
    brown: { background: 'rgba(90,48,16,0.4)',    border: '1px solid #5a3010',              color: '#c8a050' },
    red:   { background: 'rgba(200,40,20,0.15)',  border: '1px solid rgba(200,40,20,0.4)',  color: '#ff8060' },
    green: { background: 'rgba(30,160,80,0.15)',  border: '1px solid rgba(30,160,80,0.4)', color: '#4ade80' },
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
          background: 'rgba(20,10,0,0.95)',
          border: '1px solid #5a3010',
          borderRadius: 8, padding: '5px 10px',
          fontFamily: C.fontMono, fontSize: 10, color: C.textMuted,
          whiteSpace: 'nowrap', zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
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
      <span style={{ fontFamily: C.fontMono, fontSize: 10, color: C.textDim }}>{label}</span>
      <span style={{ fontFamily: C.fontMono, fontSize: 11, fontWeight: 800, color: valueColor }}>{value}</span>
    </div>
  );
}
