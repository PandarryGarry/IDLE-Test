import React, { useEffect, useRef, useState } from 'react';
import { Sword, Sparkles, ShieldCheck } from 'lucide-react';
import { AnimatedArt } from '@/components/art/AnimatedArt';
import { useArtMode } from '@/hooks/useArtMode';
import { SPLASH_ART, ART_TINT } from '@/shared/artRegistry';

const LORE_TIPS = [
  'Совет: Не забывайте брать жареную рыбу перед походом в опасные подземелья.',
  'Совет: Запирайте ценное оружие и броню на замок 🔒 в инвентаре, чтобы случайно не продать.',
  'Совет: Повышение мастерства навыка открывает шанс на удвоенный сбор ресурсов.',
  'Совет: Плавка чистых слитков в кузнице приносит стабильный доход на рынке.',
  'Совет: Улучшайте вместимость сумки прямо из инвентаря за накопленные монеты.',
];

interface SplashScreenProps {
  onLoaded?: () => void;
  minDisplayTimeMs?: number;
}

/** Сколько максимум ждём загрузку арта, чтобы не задерживать вход в игру. */
const ART_WAIT_CAP_MS = 1500;

export function SplashScreen({ onLoaded, minDisplayTimeMs = 500 }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [tip] = useState(() => LORE_TIPS[Math.floor(Math.random() * LORE_TIPS.length)]);

  // Режим заставки задан реестром ('sign'); ждём только факт загрузки файла.
  const probe = useArtMode(SPLASH_ART.src, SPLASH_ART.mode);
  const hasArt = probe.loaded && probe.mode !== null;

  const [barDone, setBarDone] = useState(false);
  const [artWaitTimedOut, setArtWaitTimedOut] = useState(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    let currentPct = 0;
    const interval = setInterval(() => {
      currentPct += 10;
      setProgress(Math.min(100, currentPct));
      if (currentPct >= 100) {
        clearInterval(interval);
        setBarDone(true);
      }
    }, Math.max(20, minDisplayTimeMs / 10));

    return () => clearInterval(interval);
  }, [minDisplayTimeMs]);

  // Финал: шкала заполнена И арт определён (или файла нет / вышли по таймауту).
  useEffect(() => {
    if (!barDone || isDone || finishedRef.current) return;
    if (probe.mode === null && !probe.error && !artWaitTimedOut) return;
    finishedRef.current = true;
    setIsFadingOut(true);
    const t = setTimeout(() => {
      setIsDone(true);
      onLoaded?.();
    }, 350);
    return () => clearTimeout(t);
  }, [barDone, isDone, probe.mode, probe.error, artWaitTimedOut, onLoaded]);

  // Страховка: не держим игрока на заставке, если арт грузится слишком долго.
  useEffect(() => {
    if (probe.mode !== null || probe.error || artWaitTimedOut) return;
    const t = setTimeout(() => setArtWaitTimedOut(true), ART_WAIT_CAP_MS);
    return () => clearTimeout(t);
  }, [probe.mode, probe.error, artWaitTimedOut]);

  if (isDone) return null;

  return (
    <div
      className={`fixed inset-0 z-[999] bg-stone-950 overflow-hidden select-none transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Оживлённый арт на весь экран */}
      {hasArt && (
        <div className="absolute inset-0">
          <AnimatedArt
            src={SPLASH_ART.src}
            mode={SPLASH_ART.mode}
            sigil={SPLASH_ART.sigil}
            tint={ART_TINT}
            intensity={1}
            className="absolute inset-0 w-full h-full"
          />
          {/* Мягкий градиент снизу для читаемости шкалы и подсказки */}
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-stone-950/85 to-transparent" />
        </div>
      )}

      {/* Контент */}
      <div className="relative h-full w-full flex flex-col items-center justify-between p-6">
        {/* Top version */}
        <div className="w-full flex justify-end">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/60" /> v1.0.0
          </span>
        </div>

        {hasArt ? (
          /* Логотип уже на арте — снизу только шкала и подсказка */
          <div className="w-full max-w-md flex flex-col items-center gap-3 pb-1">
            <div className="w-60 sm:w-80 h-2 bg-stone-900/80 rounded-full overflow-hidden border border-stone-700/60 p-0.5 shadow-inner backdrop-blur-sm">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 transition-all duration-75 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-300/90">{progress}%</span>
            <div className="max-w-md text-center bg-stone-900/60 border border-stone-800/70 rounded-2xl px-4 py-2.5 backdrop-blur-sm">
              <p className="text-xs text-stone-300 leading-relaxed font-sans">{tip}</p>
            </div>
          </div>
        ) : (
          /* Фолбэк без арта: старый герб + заголовок */
          <>
            <div className="flex flex-col items-center text-center max-w-sm">
              <div className="relative mb-5">
                <div className="absolute inset-0 bg-amber-500/20 rounded-3xl blur-2xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border-2 border-amber-500/50 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                  <Sword className="w-10 h-10 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.7)]" />
                </div>
              </div>

              <h1 className="font-display font-black text-2xl tracking-widest text-stone-100 mb-1">
                AETHELIA <span className="text-amber-400 font-sans font-extrabold text-lg">IDLE</span>
              </h1>
              <p className="text-xs text-stone-500 font-mono tracking-wider mb-5 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" /> Инициализация средневекового мира...
              </p>

              <div className="w-60 sm:w-72 h-2 bg-stone-900 rounded-full overflow-hidden border border-stone-800 p-0.5 shadow-inner mb-1.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 transition-all duration-75 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-300/80">
                {progress}%{probe.error ? ' · арт не найден' : ''}
              </span>
            </div>

            <div className="max-w-md text-center bg-stone-900/70 border border-stone-800/80 rounded-2xl px-4 py-2.5 backdrop-blur-sm">
              <p className="text-xs text-stone-300 leading-relaxed font-sans">{tip}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
