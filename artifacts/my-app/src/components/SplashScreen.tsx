/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║          SplashScreen — загрузочный экран (Этап 2)          ║
 * ║                                                             ║
 * ║  • Живой арт-вывеска (canvas artEngine) или векторный герб  ║
 * ║  • РЕАЛЬНЫЙ прогресс: шрифты + заставочный арт + мин. время ║
 * ║  • Случайный совет внизу                                    ║
 * ║  • Плавный fade-out по готовности                           ║
 * ║  • Версия — из data/changelog.ts (единый источник правды)   ║
 * ║                                                             ║
 * ║  Цвета — ТОЛЬКО токены / CSS-переменные (правило №3).      ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import React, { useEffect, useRef, useState } from 'react';
import { Sword, Sparkles, ShieldCheck } from 'lucide-react';
import { AnimatedArt } from '@/components/art/AnimatedArt';
import { useArtMode } from '@/hooks/useArtMode';
import { SPLASH_ART, ART_TINT } from '@/shared/artRegistry';
import { CURRENT_VERSION } from '@/data/changelog';

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
/** Сколько максимум ждём шрифты (Cinzel/Inter/JetBrains с Google Fonts). */
const FONTS_WAIT_CAP_MS = 2500;

/**
 * Вес каждого этапа загрузки в итоговом проценте.
 * base — мгновенно (бандл уже исполнился), остальное — реальные задачи.
 */
const WEIGHTS = { base: 15, fonts: 30, art: 40, minTime: 15 } as const;

export function SplashScreen({ onLoaded, minDisplayTimeMs = 500 }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [tip] = useState(() => LORE_TIPS[Math.floor(Math.random() * LORE_TIPS.length)]);

  // ── Реальные задачи загрузки ──────────────────────────────────
  const [fontsReady, setFontsReady] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [artWaitTimedOut, setArtWaitTimedOut] = useState(false);

  // Режим заставки задан реестром ('sign'); ждём только факт загрузки файла.
  const probe = useArtMode(SPLASH_ART.src, SPLASH_ART.mode);
  const hasArt = probe.loaded && probe.mode !== null;
  // Арт «решён»: загрузился, упал с ошибкой или вышли по таймауту.
  const artSettled = probe.mode !== null || probe.error || artWaitTimedOut;

  const finishedRef = useRef(false);

  // Шрифты: ждём document.fonts.ready, но не дольше FONTS_WAIT_CAP_MS.
  useEffect(() => {
    let disposed = false;
    const done = () => { if (!disposed) setFontsReady(true); };
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(done).catch(done);
    } else {
      done();
    }
    const cap = setTimeout(done, FONTS_WAIT_CAP_MS);
    return () => { disposed = true; clearTimeout(cap); };
  }, []);

  // Минимальное время показа — чтобы заставка не «мигала».
  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), minDisplayTimeMs);
    return () => clearTimeout(t);
  }, [minDisplayTimeMs]);

  // Страховка: не держим игрока на заставке, если арт грузится слишком долго.
  useEffect(() => {
    if (artSettled) return;
    const t = setTimeout(() => setArtWaitTimedOut(true), ART_WAIT_CAP_MS);
    return () => clearTimeout(t);
  }, [artSettled]);

  // ── Плавная анимация процентов к реальной цели ────────────────
  const targetRef = useRef(0);
  targetRef.current =
    WEIGHTS.base +
    (fontsReady ? WEIGHTS.fonts : 0) +
    (artSettled ? WEIGHTS.art : 0) +
    (minTimeElapsed ? WEIGHTS.minTime : 0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const target = targetRef.current;
        if (prev >= target) return prev;
        // Плавно догоняем цель; последний рывок к 100 — быстрый.
        const step = Math.max(1, Math.round((target - prev) * 0.2));
        return Math.min(target, prev + step);
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Финал: все задачи выполнены и шкала дошла до 100.
  useEffect(() => {
    if (progress < 100 || isDone || finishedRef.current) return;
    finishedRef.current = true;
    setIsFadingOut(true);
    const t = setTimeout(() => {
      setIsDone(true);
      onLoaded?.();
    }, 350);
    return () => clearTimeout(t);
  }, [progress, isDone, onLoaded]);

  if (isDone) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        overflow: 'hidden',
        userSelect: 'none',
        background: 'var(--bg-header)',
        transition: 'opacity 0.3s ease',
        opacity: isFadingOut ? 0 : 1,
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      {/* Оживлённый арт на весь экран */}
      {hasArt && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <AnimatedArt
            src={SPLASH_ART.src}
            mode={SPLASH_ART.mode}
            sigil={SPLASH_ART.sigil}
            tint={ART_TINT}
            intensity={1}
            className="absolute inset-0 w-full h-full"
          />
          {/* Мягкий градиент снизу для читаемости шкалы и подсказки */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '40%',
              background: 'linear-gradient(to top, var(--bg-overlay), transparent)',
            }}
          />
        </div>
      )}

      {/* Контент */}
      <div
        style={{
          position: 'relative',
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 24,
        }}
      >
        {/* Версия сверху — из changelog.ts */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontFamily: 'var(--app-font-mono)',
              fontSize: 11,
              color: 'var(--text-muted)',
            }}
          >
            <ShieldCheck size={14} style={{ color: 'var(--accent-emerald)', opacity: 0.7 }} />
            v{CURRENT_VERSION}
          </span>
        </div>

        {hasArt ? (
          /* Логотип уже на арте — снизу только шкала и подсказка */
          <div
            style={{
              width: '100%',
              maxWidth: 448,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              paddingBottom: 4,
            }}
          >
            <SplashProgressBar progress={progress} />
            <span
              style={{
                fontFamily: 'var(--app-font-mono)',
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--text-gold)',
              }}
            >
              {progress}%
            </span>
            <TipBox tip={tip} />
          </div>
        ) : (
          /* Фолбэк без арта: герб + заголовок */
          <>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                maxWidth: 384,
              }}
            >
              <div style={{ position: 'relative', marginBottom: 20 }}>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'var(--radius-xl)',
                    background: 'var(--accent-gold)',
                    opacity: 0.2,
                    filter: 'blur(24px)',
                    animation: 'pulse-gold 2s ease-in-out infinite',
                  }}
                />
                <div
                  style={{
                    position: 'relative',
                    width: 80,
                    height: 80,
                    borderRadius: 'var(--radius-xl)',
                    background: 'linear-gradient(160deg, var(--bg-sidebar), var(--bg-header))',
                    border: '2px solid var(--border-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-gold)',
                  }}
                >
                  <Sword size={40} style={{ color: 'var(--text-gold)' }} />
                </div>
              </div>

              <h1
                style={{
                  fontFamily: 'var(--app-font-display)',
                  fontWeight: 900,
                  fontSize: 24,
                  letterSpacing: '0.1em',
                  color: 'var(--text-primary)',
                  margin: '0 0 4px',
                }}
              >
                AETHELIA{' '}
                <span
                  style={{
                    color: 'var(--text-gold)',
                    fontFamily: 'var(--app-font-sans)',
                    fontWeight: 800,
                    fontSize: 18,
                  }}
                >
                  IDLE
                </span>
              </h1>
              <p
                style={{
                  fontFamily: 'var(--app-font-mono)',
                  fontSize: 12,
                  letterSpacing: '0.05em',
                  color: 'var(--text-muted)',
                  margin: '0 0 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Sparkles size={12} style={{ color: 'var(--text-gold)' }} />
                Инициализация средневекового мира...
              </p>

              <SplashProgressBar progress={progress} />
              <span
                style={{
                  fontFamily: 'var(--app-font-mono)',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--text-gold)',
                  marginTop: 6,
                }}
              >
                {progress}%{probe.error ? ' · арт не найден' : ''}
              </span>
            </div>

            <TipBox tip={tip} />
          </>
        )}
      </div>
    </div>
  );
}

/* ── Внутренние блоки заставки ──────────────────────────────────── */

function SplashProgressBar({ progress }: { progress: number }) {
  return (
    <div
      style={{
        width: 'min(320px, 80vw)',
        height: 8,
        borderRadius: 'var(--radius-full, 9999px)',
        overflow: 'hidden',
        background: 'var(--bar-track)',
        border: '1px solid var(--border-light)',
        padding: 2,
        boxShadow: 'var(--shadow-slot)',
      }}
    >
      <div
        style={{
          height: '100%',
          borderRadius: 9999,
          width: `${progress}%`,
          background: 'linear-gradient(90deg, var(--bar-xp-from), var(--bar-xp-to))',
          boxShadow: 'var(--shadow-gold)',
          transition: 'width 0.15s ease',
        }}
      />
    </div>
  );
}

function TipBox({ tip }: { tip: string }) {
  return (
    <div
      style={{
        maxWidth: 448,
        textAlign: 'center',
        background: 'var(--bg-overlay)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)',
        padding: '10px 16px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--app-font-sans)',
          fontSize: 12,
          lineHeight: 1.6,
          color: 'var(--text-light)',
          margin: 0,
        }}
      >
        {tip}
      </p>
    </div>
  );
}
