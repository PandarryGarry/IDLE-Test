import React from 'react';

export type StatColor = 'amber' | 'emerald' | 'rose' | 'blue' | 'purple' | 'slate';

interface StatPillProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  color?: StatColor;
  className?: string;
}

const COLOR_MAP: Record<StatColor, { bg: string; border: string; text: string; iconBg: string }> = {
  amber:   { bg: 'bg-slate-950/80', border: 'border-slate-800',       text: 'text-amber-300',   iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400' },
  emerald: { bg: 'bg-slate-950/80', border: 'border-emerald-500/30', text: 'text-emerald-300', iconBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' },
  rose:    { bg: 'bg-slate-950/80', border: 'border-rose-500/30',    text: 'text-rose-300',    iconBg: 'bg-rose-500/15 border-rose-500/40 text-rose-400' },
  blue:    { bg: 'bg-slate-950/80', border: 'border-blue-500/30',    text: 'text-blue-300',    iconBg: 'bg-blue-500/15 border-blue-500/40 text-blue-400' },
  purple:  { bg: 'bg-slate-950/80', border: 'border-purple-500/30',  text: 'text-purple-300',  iconBg: 'bg-purple-500/15 border-purple-500/40 text-purple-400' },
  slate:   { bg: 'bg-slate-950/80', border: 'border-slate-800',       text: 'text-slate-200',   iconBg: 'bg-slate-800 border-slate-700 text-slate-300' },
};

export function StatPill({
  icon,
  label,
  value,
  color = 'amber',
  className = '',
}: StatPillProps) {
  const scheme = COLOR_MAP[color] || COLOR_MAP.slate;

  return (
    <div className={`border rounded-2xl p-2.5 flex items-center gap-2.5 shadow-sm ${scheme.bg} ${scheme.border} ${className}`}>
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${scheme.iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-slate-400 font-mono uppercase font-bold truncate">{label}</div>
        <div className={`text-xs font-mono font-black ${scheme.text}`}>{value}</div>
      </div>
    </div>
  );
}
