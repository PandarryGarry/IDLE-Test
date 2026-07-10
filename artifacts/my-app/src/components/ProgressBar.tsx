import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0 to 1
  className?: string;
  showText?: boolean;
  label?: string;
  colorClass?: string;
}

export function ProgressBar({ value, className, showText, label, colorClass = "bg-primary" }: ProgressBarProps) {
  const percent = Math.min(Math.max(value * 100, 0), 100);
  
  return (
    <div className={cn("relative h-6 w-full overflow-hidden rounded-md bg-muted border border-border", className)}>
      <div 
        className={cn(
          "h-full transition-all duration-100 ease-linear", 
          colorClass,
          value > 0 && colorClass === 'bg-primary' ? "shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "",
          value > 0 && colorClass === 'bg-destructive' ? "shadow-[0_0_10px_rgba(239,68,68,0.5)]" : ""
        )} 
        style={{ width: `${percent}%` }} 
      />
      {(showText || label) && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md z-10 font-mono">
          {label ? label : `${percent.toFixed(1)}%`}
        </div>
      )}
    </div>
  );
}