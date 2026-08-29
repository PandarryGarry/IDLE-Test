import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import type { StoryBeat } from '@/data/onboardingStory';

/**
 * StoryScene — катсцена-история из битов, темпом управляет игрок.
 *
 * Утверждённая владельцем модель:
 * - тап по сцене = следующий бит (на последнем — завершение);
 * - «Пропустить» в углу — мгновенный пропуск всей истории;
 * - «Далее» проявляется ПОСЛЕ полного появления текста и мягко мигает;
 *   на последнем бите превращается в смысловое действие («Войти в таверну»);
 * - Enter/Space = далее, Escape = пропустить всё;
 * - prefers-reduced-motion: без движения камеры и пылинок, но тексты
 *   и «Далее» остаются — игрок ничего не теряет, темп ведь его.
 */

interface StorySceneProps {
  beats: StoryBeat[];
  onComplete: () => void;
  ariaLabel?: string;
}

/** Пауза перед появлением «Далее»: текст успевает проявиться целиком. */
const COPY_REVEAL_MS = 1250;
/** Страховочный ожидание арта бита: без него бит не стартует. */
const IMAGE_SETTLE_CAP_MS = 3500;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function StoryScene({ beats, onComplete, ariaLabel }: StorySceneProps) {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [imageSettled, setImageSettled] = useState(false);
  const [copyShown, setCopyShown] = useState(false);
  const [reducedMotion] = useState(prefersReducedMotion);

  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const beat = beats.length > 0 ? beats[Math.min(index, beats.length - 1)] : undefined;
  const isLast = index === beats.length - 1;

  /* Страховка: пустой список битов не должен блокировать «дорогу». */
  useEffect(() => {
    if (beats.length > 0 || completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current();
  }, [beats.length]);

  /* Арт бита: onLoad/onError/complete — картинка «решена». */
  useEffect(() => {
    setImageReady(false);
    setImageSettled(false);
    if (imageRef.current?.complete) setImageReady(true);
  }, [beat?.image]);

  useEffect(() => {
    if (imageReady) {
      setImageSettled(true);
      return;
    }
    const timer = window.setTimeout(() => setImageSettled(true), IMAGE_SETTLE_CAP_MS);
    return () => window.clearTimeout(timer);
  }, [imageReady]);

  /* Текст проявился — можно показывать «Далее». */
  useEffect(() => {
    setCopyShown(false);
    if (reducedMotion) {
      setCopyShown(true);
      return;
    }
    const timer = window.setTimeout(() => setCopyShown(true), COPY_REVEAL_MS);
    return () => window.clearTimeout(timer);
  }, [index, reducedMotion]);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setLeaving(true);
    window.setTimeout(() => onCompleteRef.current(), 340);
  }, []);

  const next = useCallback(() => {
    if (completedRef.current) return;
    if (isLast) {
      finish();
      return;
    }
    setIndex((prev) => Math.min(prev + 1, beats.length - 1));
  }, [beats.length, finish, isLast]);

  /* Клавиатура: Enter/Space — далее, Escape — пропустить всё. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        finish();
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [finish, next]);

  /* Все хуки выше; пустая история рендерит «ничего» и тут же завершается. */
  if (!beat) return null;

  return (
    <section
      className={`story-scene${leaving ? ' story-scene--leaving' : ''}${copyShown ? ' story-scene--ready' : ''}`}
      aria-label={ariaLabel ?? beat.title}
      aria-live="polite"
      onClick={(event) => {
        // Кнопки сами разбираются с кликами; остальная площадь — «далее».
        if ((event.target as HTMLElement).closest('button')) return;
        next();
      }}
    >
      <img
        key={beat.image}
        ref={imageRef}
        className={`story-scene__art${imageSettled ? ' story-scene__art--ready' : ''}`}
        src={beat.image}
        style={beat.imagePosition ? { objectPosition: beat.imagePosition } : undefined}
        alt=""
        onLoad={() => setImageReady(true)}
        onError={() => setImageReady(true)}
      />
      <div className="story-scene__veil" aria-hidden="true" />
      <div className="story-scene__flare" aria-hidden="true" />
      <div className="story-scene__motes" aria-hidden="true">
        {Array.from({ length: 14 }, (_, moteIndex) => (
          <span
            key={moteIndex}
            style={
              {
                '--mote-index': moteIndex,
                '--mote-left': `${(moteIndex * 37) % 100}%`,
                '--mote-size': `${2 + (moteIndex % 3)}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="story-scene__content" key={beat.id}>
        <span className="story-scene__eyebrow">{beat.eyebrow}</span>
        <h1>{beat.title}</h1>
        <p>{beat.body}</p>

        <div className="story-scene__progress" aria-hidden="true">
          {beats.map((item, dotIndex) => (
            <span
              key={item.id}
              className={dotIndex === index ? 'is-active' : dotIndex < index ? 'is-done' : ''}
            />
          ))}
        </div>

        <button
          type="button"
          className="story-scene__next"
          onClick={(event) => {
            event.stopPropagation();
            next();
          }}
        >
          {isLast ? beat.action ?? 'Продолжить' : 'Далее'}
        </button>
      </div>

      <button
        type="button"
        className="story-scene__skip"
        onClick={(event) => {
          event.stopPropagation();
          finish();
        }}
      >
        Пропустить
      </button>
    </section>
  );
}

export default StoryScene;
