import { useEffect, useRef, useState } from 'react';
import { StoryScene } from '@/components/StoryScene';
import {
  PROLOGUE_FULL,
  collectBeatImages,
} from '@/data/onboardingStory';
import { markFullPrologueSeen } from '@/lib/cinematicState';

/**
 * FirstLaunchIntro — самый первый «кадр» игры для нового устройства.
 *
 * Руна-карточка (мини-загрузка артов пролога) → пролог в темпе игрока →
 * далее App переключается на обычную заставку, которая в этой версии
 * «дороги» и есть вход в таверну.
 *
 * Руна-карточка собрана из токенов/CSS (стиль sigil-режима artEngine:
 * медленно вращающийся рунный круг и пульс свечения в центре). Если
 * владелец пришлёт исходный арт «большая руна, чёрный фон» — карточка
 * примет его без изменения логики.
 */

interface FirstLaunchIntroProps {
  onFinished: () => void;
}

/** Минимальное время руна-карточки: она задаёт дыхание первого кадра. */
const RUNE_MIN_MS = 2800;
/** Страховка: не держим руну дольше, даже если сеть медленная. */
const RUNE_CAP_MS = 4800;

export function FirstLaunchIntro({ onFinished }: FirstLaunchIntroProps) {
  const [phase, setPhase] = useState<'rune' | 'story'>('rune');
  const [artsReady, setArtsReady] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const [progress, setProgress] = useState(0);
  const finishedRef = useRef(false);

  /* Мини-загрузка: греем только арты пролога (они лёгкие, WebP). */
  useEffect(() => {
    let disposed = false;
    const images = collectBeatImages(PROLOGUE_FULL).map((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        if (!disposed) setArtsReady(true);
      };
      img.src = src;
      return img;
    });
    const cap = window.setTimeout(() => {
      if (!disposed) setArtsReady(true);
    }, RUNE_CAP_MS);
    return () => {
      disposed = true;
      window.clearTimeout(cap);
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setMinElapsed(true), RUNE_MIN_MS);
    return () => window.clearTimeout(timer);
  }, []);

  /* Плавная шкала к реальной цели. */
  useEffect(() => {
    const target = 20 + (minElapsed ? 45 : 0) + (artsReady ? 35 : 0);
    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= target) return prev;
        return Math.min(target, prev + Math.max(1, Math.round((target - prev) * 0.2)));
      });
    }, 40);
    return () => window.clearInterval(interval);
  }, [artsReady, minElapsed]);

  /* Руна дышит минимум RUNE_MIN_MS и доигрывает до готовности артов. */
  useEffect(() => {
    if (!minElapsed || !artsReady) return;
    const timer = window.setTimeout(() => setPhase('story'), 360);
    return () => window.clearTimeout(timer);
  }, [artsReady, minElapsed]);

  const finishPrologue = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    markFullPrologueSeen();
    onFinished();
  };

  if (phase !== 'rune') {
    return <StoryScene beats={PROLOGUE_FULL} onComplete={finishPrologue} ariaLabel="Пролог Aethelia" />;
  }

  return (
    <section className="rune-intro" aria-label="Aethelia">
      <div className="rune-intro__glow" aria-hidden="true" />

      <div className="rune-intro__sigil" aria-hidden="true">
        <svg className="rune-intro__ring" viewBox="0 0 200 200" role="presentation">
          <circle cx="100" cy="100" r="92" fill="none" strokeDasharray="3 9" />
          <circle cx="100" cy="100" r="78" fill="none" strokeDasharray="1 14" opacity="0.55" />
        </svg>
        {/* Руна «Ансуз» — знак начал и путей: вертикаль и две ветви. */}
        <svg className="rune-intro__rune" viewBox="0 0 48 88" role="presentation">
          <line x1="16" y1="4" x2="16" y2="84" />
          <line x1="16" y1="18" x2="44" y2="34" />
          <line x1="16" y1="38" x2="44" y2="54" />
        </svg>
      </div>

      <div className="rune-intro__title">
        <span className="rune-intro__eyebrow">КОНТИНЕНТ ВТОРЫХ ШАНСОВ</span>
        <h1>ЭТЕЛИЯ</h1>
      </div>

      <div className="rune-intro__load">
        <div className="rune-intro__bar" role="progressbar" aria-label="Пробуждение мира"
             aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <span className="rune-intro__hint">Мир пробуждается…</span>
      </div>
    </section>
  );
}

export default FirstLaunchIntro;
