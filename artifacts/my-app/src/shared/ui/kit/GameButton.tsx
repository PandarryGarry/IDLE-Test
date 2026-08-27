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
  primary:   'bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.25)] border border-amber-400/40',
  secondary: 'bg-stone-800/90 hover:bg-slate-700 text-stone-200 hover:text-white font-bold border border-stone-700 shadow-sm',
  success:   'bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.25)] border border-emerald-400/30',
  danger:    'bg-red-500/15 hover:bg-red-500 text-red-300 hover:text-white font-bold border border-red-500/30 shadow-sm',
  ghost:     'bg-transparent hover:bg-stone-800 text-stone-500 hover:text-stone-100 font-semibold',
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
