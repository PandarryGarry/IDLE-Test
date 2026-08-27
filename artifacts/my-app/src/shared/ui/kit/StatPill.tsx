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
  amber:   { border: 'border-amber-800/50',  iconBg: 'bg-amber-900/40 text-amber-400',   text: 'text-amber-300' },
  emerald: { border: 'border-emerald-800/50',iconBg: 'bg-emerald-900/40 text-emerald-400',text: 'text-emerald-300' },
  rose:    { border: 'border-rose-800/50',   iconBg: 'bg-rose-900/40 text-rose-400',     text: 'text-rose-300' },
  blue:    { border: 'border-blue-800/50',   iconBg: 'bg-blue-900/40 text-blue-400',     text: 'text-blue-300' },
  purple:  { border: 'border-purple-800/50', iconBg: 'bg-purple-900/40 text-purple-400', text: 'text-purple-300' },
  slate:   { border: 'border-stone-700/50',  iconBg: 'bg-stone-800/60 text-stone-400',   text: 'text-stone-300' },
};

export function StatPill({ icon, label, value, color = 'amber', className = '' }: StatPillProps) {
  const s = COLOR_MAP[color] ?? COLOR_MAP.slate;
  return (
    <div className={`flex items-center gap-2.5 rounded-xl border p-2.5 ${s.border} ${className}`}
      style={{ background: 'linear-gradient(160deg,#231a10,#1a1108)', boxShadow: 'inset 0 1px 0 rgba(255,220,130,0.04)' }}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-stone-500 font-mono uppercase font-bold tracking-wide truncate">{label}</div>
        <div className={`text-xs font-mono font-black ${s.text}`}>{value}</div>
      </div>
    </div>
  );
}
