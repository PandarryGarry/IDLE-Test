import { useEffect, useRef, useState } from 'react';
import { ArtEngine, detectMode, DEFAULT_TINT, type ArtMode, type ArtTint, type SigilConfig } from './artEngine';

export type { ArtMode, ArtTint, SigilConfig } from './artEngine';
export { ArtEngine, detectMode } from './artEngine';

/**
 * AnimatedArt — React-обёртка над artEngine.
 *
 * Отвечает только за «обвязку»: загрузка картинки, DPR/resize, параллакс от курсора,
 * requestAnimationFrame-цикл и prefers-reduced-motion. Сама отрисовка — в artEngine.ts.
 *
 *  - 'scene'  — непрозрачная иллюстрация: ken-burns, лучи света, пыль, виньетка.
 *  - 'cutout' — PNG с альфой: парение, пульсирующее свечение, блик по силуэту, искры.
 */

export interface AnimatedArtProps {
  /** Путь к картинке (public/... или любой URL). */
  src: string;
  /** 'auto' определяет режим по альфа-каналу. */
  mode?: 'auto' | ArtMode;
  className?: string;
  /** Общая сила эффектов: 0 — почти статично, 1 — норма, 2 — максимум. */
  intensity?: number;
  /** Цвет свечения и пылинок. */
  tint?: ArtTint;
  /** 'cover' — на весь экран с обрезкой, 'contain' (дефолт) — целиком с полями. */
  fit?: 'cover' | 'contain';
  /** Геометрия рунного круга для режима 'sigil'. */
  sigil?: SigilConfig;
  onModeDetected?: (mode: ArtMode) => void;
  onReady?: (info: { width: number; height: number; mode: ArtMode }) => void;
  onError?: () => void;
}

export function AnimatedArt({
  src,
  mode = 'auto',
  className,
  intensity = 1,
  tint = DEFAULT_TINT,
  fit,
  sigil,
  onModeDetected,
  onReady,
  onError,
}: AnimatedArtProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Живые параметры для rAF-цикла: меняются без пересборки эффекта.
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const intensityRef = useRef(intensity);
  const tintRef = useRef(tint);
  const callbacksRef = useRef({ onModeDetected, onReady, onError });
  const reducedMotion = useRef(false);

  useEffect(() => {
    intensityRef.current = intensity;
    tintRef.current = tint;
    callbacksRef.current = { onModeDetected, onReady, onError };
  });

  useEffect(() => {
    reducedMotion.current =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let engine: ArtEngine | null = null;
    let raf = 0;
    let disposed = false;
    let last = 0;

    const img = new Image();
    img.decoding = 'async';

    const resize = () => {
      if (!engine) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      engine.resize(rect.width, rect.height);
      if (reducedMotion.current) engine.render(ctx, 0, 16, { x: 0, y: 0 });
    };

    const frame = (t: number) => {
      if (disposed || !engine) return;
      const dt = last === 0 ? 16 : Math.min(64, t - last);
      last = t;

      const p = pointer.current;
      p.x += (p.tx - p.x) * Math.min(1, dt / 180);
      p.y += (p.ty - p.y) * Math.min(1, dt / 180);

      engine.intensity = intensityRef.current;
      engine.tint = tintRef.current;
      engine.render(ctx, t, dt, { x: p.x, y: p.y });

      raf = requestAnimationFrame(frame);
    };

    img.onload = () => {
      if (disposed) return;
      const resolved = mode === 'auto' ? detectMode(img) : mode;
      engine = new ArtEngine(img, {
        mode: resolved,
        tint: tintRef.current,
        intensity: intensityRef.current,
        sigil,
        fit,
      });
      setStatus('ready');
      callbacksRef.current.onModeDetected?.(resolved);
      callbacksRef.current.onReady?.({ width: img.width, height: img.height, mode: resolved });
      resize();
      if (!reducedMotion.current) raf = requestAnimationFrame(frame);
    };

    img.onerror = () => {
      if (disposed) return;
      setStatus('error');
      callbacksRef.current.onError?.();
    };
    img.src = src;

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => resize()) : null;
    observer?.observe(canvas);

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const p = pointer.current;
      p.tx = Math.max(-1, Math.min(1, (e.clientX - cx) / Math.max(1, rect.width / 2)));
      p.ty = Math.max(-1, Math.min(1, (e.clientY - cy) / Math.max(1, rect.height / 2)));
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [src, mode, sigil, fit]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      data-status={status}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}
