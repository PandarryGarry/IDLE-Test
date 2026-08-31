import { useEffect, useRef, useState } from 'react';
import { StoryScene } from '@/components/StoryScene';
import {
  PROLOGUE_FULL,
  collectBeatImages,
} from '@/data/onboardingStory';
import { markFullPrologueSeen } from '@/lib/cinematicState';

const SIGN_ART = '/assets/art/intro_sign.webp';

/**
 * FirstLaunchIntro — акт 0 «ЗНАК» дороги: самый первый кадр игры для
 * нового устройства.
 *
 * Утверждённый арт «Топор и Перо» во весь экран. Свет разгорается как
 * угли: темнота медленно поднимается с картины, знак проступает из тьмы,
 * «ЭТЕЛИЯ» собирается из разреженного трекинга. Карточка — одновременно
 * мини-загрузка артов пролога.
 *
 * Переход в пролог не обрывается, а «отдаёт свет»: карточка растворяется
 * золотым bloom-переходом, под ней уже монтируется StoryScene — рассвет
 * континента проступает сквозь тёплое свечение знака.
 *
 * Торжественный темп (решение владельца): минимум SIGN_MIN_MS карточка
 * дышит даже при пустом кэше; страховочный cap не держит игрока вечно.
 */

interface FirstLaunchIntroProps {
  onFinished: () => void;
  /**
   * Сессия восстановлена и персонажи загружены (или игрока нет).
   * Акт 0 «ЗНАК» — загрузочный экран первого запуска: карточка
   * держится, пока authReady не станет true. minDisplayTime
   * заставки не трогаем — это другой экран.
   */
  authReady?: boolean;
}

/** Минимальное время акта 0: дыхание первого кадра. */
const SIGN_MIN_MS = 6000;
/** Страховка: не держим карточку дольше, даже если сеть медленная. */
const SIGN_CAP_MS = 10000;
/** Длительность светового перехода знак → пролог. */
const BLOOM_MS = 1150;
/** Пауза перед переходом после готовности: даём знаку «договорить». */
const HOLD_MS = 900;

/** Золотая пыль акта 0 — редкая и медленная, как искры над углями. */
const MOTES = [
  { left: '12%', size: 3, delay: 0.4, duration: 11.0 },
  { left: '21%', size: 2, delay: 5.2, duration: 13.5 },
  { left: '29%', size: 4, delay: 2.8, duration: 10.5 },
  { left: '36%', size: 2, delay: 7.6, duration: 14.0 },
  { left: '43%', size: 3, delay: 1.6, duration: 12.0 },
  { left: '52%', size: 2, delay: 6.4, duration: 15.0 },
  { left: '60%', size: 4, delay: 3.4, duration: 11.5 },
  { left: '67%', size: 2, delay: 8.8, duration: 13.0 },
  { left: '74%', size: 3, delay: 0.8, duration: 12.5 },
  { left: '81%', size: 2, delay: 4.4, duration: 14.5 },
  { left: '88%', size: 3, delay: 7.0, duration: 10.0 },
  { left: '94%', size: 2, delay: 2.2, duration: 13.0 },
] as const;

export function FirstLaunchIntro({ onFinished, authReady = false }: FirstLaunchIntroProps) {
  const [phase, setPhase] = useState<'sign' | 'bloom' | 'story'>('sign');
  const [artsReady, setArtsReady] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const [progress, setProgress] = useState(0);
  const finishedRef = useRef(false);



  /* Мини-загрузка: греем ВСЕ арты пролога, не первый попавшийся. */
  useEffect(() => {
    let disposed = false;
    const sources = collectBeatImages(PROLOGUE_FULL);
    if (sources.length === 0) {
      setArtsReady(true);
      return;
    }
    let remaining = sources.length;
    const finishOne = () => {
      remaining -= 1;
      if (remaining <= 0 && !disposed) setArtsReady(true);
    };
    const images = sources.map((src) => {
      const img = new Image();
      img.onload = img.onerror = finishOne;
      img.src = src;
      return img;
    });
    const cap = window.setTimeout(() => {
      if (!disposed) setArtsReady(true);
    }, SIGN_CAP_MS);
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
    const timer = window.setTimeout(() => setMinElapsed(true), SIGN_MIN_MS);
    return () => window.clearTimeout(timer);
  }, []);

  /* Плавная шкала к реальной цели. */
  useEffect(() => {
    const target =
      10 + (minElapsed ? 30 : 0) + (artsReady ? 30 : 0) + (authReady ? 30 : 0);
    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= target) return prev;
        return Math.min(target, prev + Math.max(1, Math.round((target - prev) * 0.2)));
      });
    }, 40);
    return () => window.clearInterval(interval);
  }, [artsReady, authReady, minElapsed]);

  /* Знак дышит минимум SIGN_MIN_MS и ждёт арты + сессию/персонажей. */
  useEffect(() => {
    if (phase !== 'sign' || !minElapsed || !artsReady || !authReady) return;
    const timer = window.setTimeout(() => setPhase('bloom'), HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [artsReady, authReady, minElapsed, phase]);

  /* Световой переход: пролог уже монтируется под карточкой. */
  useEffect(() => {
    if (phase !== 'bloom') return;
    const timer = window.setTimeout(() => setPhase('story'), BLOOM_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const finishPrologue = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    markFullPrologueSeen();
    onFinished();
  };

  if (phase === 'story') {
    return <StoryScene beats={PROLOGUE_FULL} onComplete={finishPrologue} ariaLabel="Пролог Aethelia" />;
  }

  return (
    <>
      {phase === 'bloom' && (
        <StoryScene beats={PROLOGUE_FULL} onComplete={finishPrologue} ariaLabel="Пролог Aethelia" />
      )}
      <section
        className={`sign-intro${phase === 'bloom' ? ' sign-intro--leaving' : ''}`}
        aria-label="Aethelia"
      >
        <div className="sign-intro__scene" aria-hidden="true">
          <img
            className="sign-intro__art"
            src={SIGN_ART}
            alt=""
            draggable={false}
          />
        </div>
        {/* Свет разгорается как угли: темнота медленно поднимается с картины. */}
        <div className="sign-intro__kindle" aria-hidden="true" />
        <div className="sign-intro__vignette" aria-hidden="true" />
        <div className="sign-intro__motes" aria-hidden="true">
          {MOTES.map((mote, index) => (
            <span
              key={index}
              style={{
                '--mote-left': mote.left,
                '--mote-size': `${mote.size}px`,
                '--mote-delay': `${mote.delay}s`,
                '--mote-duration': `${mote.duration}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>
        {/* Золото знака «отдаётся» прологу. */}
        <div className="sign-intro__bloom" aria-hidden="true" />

        <div className="sign-intro__title">
          <span className="sign-intro__eyebrow">КОНТИНЕНТ ВТОРЫХ ШАНСОВ</span>
          <h1>ЭТЕЛИЯ</h1>
        </div>

        <div className="sign-intro__load">
          <div className="sign-intro__bar" role="progressbar" aria-label="Пробуждение мира"
               aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <span className="sign-intro__hint">Мир пробуждается…</span>
        </div>
      </section>
    </>
  );
}

export default FirstLaunchIntro;
