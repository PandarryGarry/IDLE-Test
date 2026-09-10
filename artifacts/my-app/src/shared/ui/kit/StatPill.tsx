import React from 'react';

export type StatColor = 'amber' | 'emerald' | 'rose' | 'blue' | 'purple' | 'slate';

interface StatPillProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  color?: StatColor;
  className?: string;
}

const COLOR_MAP: Record<StatColor, { border: string; iconBg: string; text: string }> = {
  amber:   { border: 'border-[var(--tag-gold-edge)]',   iconBg: '[background:var(--tag-gold-bg)] text-[var(--text-gold)]',      text: 'text-[var(--text-gold)]' },
  emerald: { border: 'border-[var(--tag-green-edge)]',  iconBg: '[background:var(--tag-green-bg)] text-[var(--badge-green-ink)]', text: 'text-[var(--badge-green-ink)]' },
  rose:    { border: 'border-[var(--tag-red-edge)]',    iconBg: '[background:var(--tag-red-bg)] text-[var(--badge-red-ink)]',     text: 'text-[var(--badge-red-ink)]' },
  blue:    { border: 'border-[var(--badge-blue-edge)]', iconBg: '[background:var(--badge-blue-bg)] text-[var(--badge-blue-ink)]', text: 'text-[var(--badge-blue-ink)]' },
  purple:  { border: 'border-[var(--badge-purple-edge)]', iconBg: '[background:var(--badge-purple-bg)] text-[var(--badge-purple-ink)]', text: 'text-[var(--badge-purple-ink)]' },
  slate:   { border: 'border-[var(--border-light)]',    iconBg: '[background:var(--glass-bg)] text-[var(--text-muted)]',          text: 'text-[var(--text-muted)]' },
};

export function StatPill({ icon, label, value, color = 'amber', className = '' }: StatPillProps) {
  const s = COLOR_MAP[color] ?? COLOR_MAP.slate;
  return (
    <div className={`flex items-center gap-2.5 rounded-xl border p-2.5 ${s.border} ${className}`}
      style={{ background: 'var(--stat-bg)', boxShadow: 'var(--stat-shadow)' }}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase font-bold tracking-wide truncate">{label}</div>
        <div className={`text-xs font-mono font-black ${s.text}`}>{value}</div>
      </div>
    </div>
  );
}
