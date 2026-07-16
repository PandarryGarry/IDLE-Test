import { useRef, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';

interface ActionProgressBarProps {
  className?: string;
  height?: string; // tailwind height class e.g. 'h-3'
  color?: 'green' | 'blue' | 'amber' | 'red';
  showLabel?: boolean;
}

const COLOR_MAP = {
  green: { bar: 'bg-primary', glow: '0 0 12px rgba(34,197,94,0.6)', track: 'bg-primary/15' },
  blue:  { bar: 'bg-blue-500', glow: '0 0 12px rgba(59,130,246,0.6)', track: 'bg-blue-500/15' },
  amber: { bar: 'bg-amber-400', glow: '0 0 12px rgba(251,191,36,0.6)', track: 'bg-amber-400/15' },
  red:   { bar: 'bg-red-500', glow: '0 0 12px rgba(239,68,68,0.6)', track: 'bg-red-500/15' },
};

/**
 * CSS-animation–driven progress bar for active skill actions.
 *
 * Subscribes only to `actionStartTime`, `isRunning`, and `currentActionInterval`.
 * The animation runs entirely via CSS — ZERO React re-renders while the bar fills.
 * When `actionStartTime` changes (new action cycle starts) the useEffect re-runs
 * and restarts the animation from the correct mid-point if the component mounts
 * partway through an action.
 */
export function ActionProgressBar({
  className,
  height = 'h-3',
  color = 'green',
  showLabel = false,
}: ActionProgressBarProps) {
  const fillRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);

  const actionStartTime = useGameStore(s => s.actionStartTime);
  const isRunning = useGameStore(s => s.isRunning);
  const interval = useGameStore(s => s.currentActionInterval);

  const { bar: barClass, glow, track: trackClass } = COLOR_MAP[color];

  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;

    if (!isRunning) {
      fill.style.transition = 'none';
      fill.style.width = '0%';
      if (labelRef.current) labelRef.current.textContent = '0%';
      return;
    }

    // Compute how far through the current action cycle we are.
    const elapsed = performance.now() - actionStartTime;
    const pct = Math.min(100, (elapsed / interval) * 100);
    const remaining = Math.max(0, interval - elapsed);

    // 1. Snap to current position without animation.
    fill.style.transition = 'none';
    fill.style.width = `${pct.toFixed(2)}%`;

    // 2. Force a reflow so the browser commits the snap before we set the transition.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    fill.offsetWidth;

    // 3. Animate smoothly to 100% over the remaining duration.
    fill.style.transition = `width ${remaining.toFixed(0)}ms linear`;
    fill.style.width = '100%';

    // 4. If a label is requested, update it via rAF (lazy, doesn't block anything).
    if (showLabel && labelRef.current) {
      const updateLabel = () => {
        if (!labelRef.current || !isRunning) return;
        const e2 = performance.now() - actionStartTime;
        const p2 = Math.min(100, (e2 / interval) * 100);
        labelRef.current.textContent = `${p2.toFixed(0)}%`;
        rafRef.current = requestAnimationFrame(updateLabel);
      };
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateLabel);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [actionStartTime, isRunning, interval, showLabel]);

  return (
    <div className={cn('relative w-full overflow-hidden rounded-full', trackClass, height, className)}>
      <div
        ref={fillRef}
        className={cn('h-full rounded-full', barClass)}
        style={{ width: '0%', boxShadow: glow }}
      />
      {showLabel && (
        <span
          ref={labelRef}
          className="absolute inset-0 flex items-center justify-center text-xs font-bold font-mono text-white/90 drop-shadow"
        >
          0%
        </span>
      )}
    </div>
  );
}
