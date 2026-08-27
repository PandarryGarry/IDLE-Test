import React, { useEffect, useState } from 'react';
import { Sword, Sparkles, ShieldCheck } from 'lucide-react';

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

export function SplashScreen({ onLoaded, minDisplayTimeMs = 500 }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [tip] = useState(() => LORE_TIPS[Math.floor(Math.random() * LORE_TIPS.length)]);

  useEffect(() => {
    let currentPct = 0;
    const interval = setInterval(() => {
      currentPct += 10;
      setProgress(Math.min(100, currentPct));

      if (currentPct >= 100) {
        clearInterval(interval);
        setIsFadingOut(true);
        setTimeout(() => {
          setIsDone(true);
          onLoaded?.();
        }, 350);
      }
    }, Math.max(20, minDisplayTimeMs / 10));

    return () => clearInterval(interval);
  }, [minDisplayTimeMs, onLoaded]);

  if (isDone) return null;

  return (
    <div className={`fixed inset-0 z-[999] bg-stone-950 flex flex-col items-center justify-between p-6 select-none transition-opacity duration-300 ${
      isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      
      {/* Top version */}
      <div className="w-full flex justify-end">
        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/60" /> v1.0.0
        </span>
      </div>

      {/* Center: Crest & Title */}
      <div className="flex flex-col items-center text-center max-w-sm">
        
        {/* Animated Runic Crest */}
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

        {/* Loading Bar */}
        <div className="w-60 sm:w-72 h-2 bg-stone-900 rounded-full overflow-hidden border border-stone-800 p-0.5 shadow-inner mb-1.5">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 transition-all duration-75 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] font-mono font-bold text-amber-300/80">
          {progress}%
        </span>

      </div>

      {/* Bottom: Lore Tip */}
      <div className="max-w-md text-center bg-stone-900/70 border border-stone-800/80 rounded-2xl px-4 py-2.5 backdrop-blur-sm">
        <p className="text-xs text-stone-300 leading-relaxed font-sans">
          {tip}
        </p>
      </div>

    </div>
  );
}
