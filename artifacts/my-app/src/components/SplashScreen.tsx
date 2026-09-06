/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║          SplashScreen — загрузочный экран (Этап 2)          ║
 * ║                                                             ║
 * ║  • Живой арт-вывеска (canvas artEngine) или векторный герб  ║
 * ║  • РЕАЛЬНЫЙ прогресс: шрифты + арт + прогрев артов дороги   ║
 * ║    + мин. время показа + authReady (сессия и персонажи)     ║
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
import { pickSplashArt, ART_TINT } from '@/shared/artRegistry';
import { bootBackgroundUrls, bootGateUrls, waitDecoded, warmImages } from '@/lib/bootPreload';
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
  /**
   * Сессия восстановлена и персонажи загружены (или игрока нет).
   * Заставка — единственный основной загрузочный экран: не уходим
   * с вывески, пока authReady не станет true.
   */
  authReady?: boolean;
  /** Аватары уже известных героев — греем лицо и манекен до входа в шелл. */
  avatarIds?: readonly string[];
}

/** Сколько максимум ждём загрузку арта, чтобы не задерживать вход в игру. */
const ART_WAIT_CAP_MS = 1500;
/** Сколько максимум ждём шрифты (Cinzel/Inter/JetBrains с Google Fonts). */
const FONTS_WAIT_CAP_MS = 2500;
/** Сколько максимум греем дорогу + первый кадр героя. */
const BOOT_ARTS_WAIT_CAP_MS = 5000;

/**
 * Вес каждого этапа загрузки в итоговом проценте.
 * base — мгновенно (бандл уже исполнился), остальное — реальные задачи.
 */
const WEIGHTS = {
  base: 8,
  fonts: 16,
  art: 20,
  onboardingArts: 24,
  minTime: 12,
  auth: 20,
} as const;

export function SplashScreen({
  onLoaded,
  minDisplayTimeMs = 4000,
  authReady = false,
  avatarIds = [],
}: SplashScreenProps) {
  // Вариант арта выбираем один раз по пропорциям экрана (wide / tall / square).
  const [art] = useState(() =>
    pickSplashArt(
      typeof window !== 'undefined' ? window.innerWidth : 1,
      typeof window !== 'undefined' ? window.innerHeight : 1,
    ),
  );
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [tip] = useState(() => LORE_TIPS[Math.floor(Math.random() * LORE_TIPS.length)]);

  // ── Реальные задачи загрузки ──────────────────────────────────
  const [fontsReady, setFontsReady] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [artWaitTimedOut, setArtWaitTimedOut] = useState(false);
  const [onboardingArtsReady, setOnboardingArtsReady] = useState(false);

  // Режим заставки задан реестром ('sign'); ждём только факт загрузки файла.
  const probe = useArtMode(art.src, art.mode);
  const hasArt = probe.loaded && probe.mode !== null;
  // Фолбэк-герб показываем ТОЛЬКО если арт реально не загрузился (ошибка/таймаут).
  // Пока арт в пути — держим нейтральный тёмный фон, чтобы не мелькал «старый» экран.
  const artFailed = probe.error || (artWaitTimedOut && !hasArt);
  // Арт «решён»: файл реально декодирован, упал с ошибкой или вышли по таймауту.
  // fixed-mode знает режим сразу, но картинка ещё может быть в пути.
  const artSettled = probe.loaded || probe.error || artWaitTimedOut;

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

  // Дорога онбординга + иконки тела/аватары: пока шкала на экране.
  // Нити и глубинные пассивки греем без ожидания — вкладки откроются позже.
  const avatarKey = avatarIds.join('|');
  useEffect(() => {
    let disposed = false;
    setOnboardingArtsReady(false);
    warmImages(bootBackgroundUrls());
    // До сессии — только шелл. Аватары ждём, когда authReady уже знает список героев.
    if (!authReady) {
      void waitDecoded(bootGateUrls([]), BOOT_ARTS_WAIT_CAP_MS);
      return () => { disposed = true; };
    }
    void waitDecoded(bootGateUrls(avatarIds), BOOT_ARTS_WAIT_CAP_MS).then(() => {
      if (!disposed) setOnboardingArtsReady(true);
    });
    return () => { disposed = true; };
  }, [authReady, avatarKey, avatarIds]);

  // ── Плавная анимация процентов к реальной цели ────────────────
  const targetRef = useRef(0);
  targetRef.current =
    WEIGHTS.base +
    (fontsReady ? WEIGHTS.fonts : 0) +
    (artSettled ? WEIGHTS.art : 0) +
    (onboardingArtsReady ? WEIGHTS.onboardingArts : 0) +
    (minTimeElapsed ? WEIGHTS.minTime : 0) +
    (authReady ? WEIGHTS.auth : 0);

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
    }, 480);
    return () => clearTimeout(t);
  }, [progress, isDone, onLoaded]);

  if (isDone) return null;

  return (
    <div
      className={`splash-root${isFadingOut ? ' splash-root--out' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        overflow: 'hidden',
        userSelect: 'none',
        background: 'var(--bg-header)',
        transition: 'opacity 0.45s ease, transform 0.45s ease, filter 0.45s ease',
        opacity: isFadingOut ? 0 : 1,
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      {/* Оживлённый арт на весь экран — мягко проявляется из тёмного фона */}
      {hasArt && (
        <div className="splash-art-layer" style={{ position: 'absolute', inset: 0 }}>
          <AnimatedArt
            src={art.src}
            mode={art.mode}
            fit={art.fit}
            sigil={art.sigil}
            signMotion={art.signMotion}
            lightBlooms={art.lightBlooms}
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

        {!artFailed ? (
          /* Арт загружен или в пути — снизу только шкала и подсказка.
             Пока арт грузится, фон нейтральный тёмный: никакого «старого» экрана. */
          <div
            className="splash-bottom-hud"
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
              className="splash-percent"
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
                  className="splash-fallback-emblem"
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
                  <Sword className="splash-fallback-sword" size={40} style={{ color: 'var(--text-gold)' }} />
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
                className="splash-percent"
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
      role="progressbar"
      aria-label="Загрузка Aethelia"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
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
        className="splash-progress-fill"
        data-complete={progress >= 100}
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
      className="splash-tip-box"
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontFamily: 'var(--app-font-sans)',
          fontSize: 12,
          lineHeight: 1.6,
          color: 'var(--text-light)',
          margin: 0,
        }}
      >
        <Sparkles size={13} style={{ color: 'var(--text-gold)', flexShrink: 0 }} />
        {tip}
      </p>
    </div>
  );
}