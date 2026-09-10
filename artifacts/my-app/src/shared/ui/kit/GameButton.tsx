import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:   '[background:var(--btn-primary)] hover:brightness-110 text-[var(--btn-primary-ink)] font-extrabold [box-shadow:var(--btn-primary-shadow)] border border-[var(--btn-primary-edge)]',
  secondary: '[background:var(--btn-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] font-bold border border-[var(--border-light)] [box-shadow:var(--btn-primary-shadow)]',
  success:   '[background:var(--btn-secondary)] text-[var(--badge-green-ink)] hover:text-[var(--text-primary)] font-extrabold border border-[var(--accent-emerald)] [box-shadow:var(--btn-primary-shadow)]',
  danger:    '[background:var(--btn-danger)] text-[var(--text-primary)] font-bold border border-[var(--btn-danger-edge)] [box-shadow:var(--btn-danger-shadow)]',
  ghost:     'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] font-semibold',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
  md: 'px-4 py-2.5 text-xs sm:text-sm rounded-2xl gap-2',
  lg: 'px-6 py-3.5 text-sm sm:text-base rounded-2xl gap-2.5 font-black',
};

export function GameButton({
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  children,
  ...props
}: GameButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center select-none transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
