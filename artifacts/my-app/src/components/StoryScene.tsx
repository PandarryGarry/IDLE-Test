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
  /** Кросс-растворение: предыдущий арт тает под новым при смене картины. */
  const [fadingImage, setFadingImage] = useState<string | null>(null);
  const [reducedMotion] = useState(prefersReducedMotion);

  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const imageRef = useRef<HTMLImageElement>(null);
  const prevImageRef = useRef<string | undefined>(beats[0]?.image);

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

  /* Смена картины — не срез, а растворение: прежний арт тает под новым. */
  useEffect(() => {
    const image = beat?.image;
    const previous = prevImageRef.current;
    prevImageRef.current = image;
    if (!image || !previous || image === previous) return;
    setFadingImage(previous);
    const timer = window.setTimeout(() => setFadingImage(null), 1000);
    return () => window.clearTimeout(timer);
  }, [beat?.image]);

  /* Арт бита: onLoad/onError/complete — картинка «решена». */
  useEffect(() => {
    setImageReady(false);
    setImageSettled(false);
    if (imageRef.current?.complete) setImageReady(true);
  }, [beat?.image]);

  /* Важно: зависимость и от арта. Без неё переход к закэшированной
     картинке мог «застрять»: imageReady за один батч проходил
     true→false→true (React не видел изменения), settled оставался false —
     и арт навсегда оставался прозрачным. Теперь эффект перезапускается
     на каждый новый арт: либо сразу проявляет его, либо честно ждёт cap. */
  useEffect(() => {
    if (imageReady) {
      setImageSettled(true);
      return;
    }
    const timer = window.setTimeout(() => setImageSettled(true), IMAGE_SETTLE_CAP_MS);
    return () => window.clearTimeout(timer);
  }, [imageReady, beat?.image]);

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
    /* Финальный бит уходит дольше: камера успевает «толкнуть дверь». */
    window.setTimeout(() => onCompleteRef.current(), beat?.finale ? 720 : 340);
  }, [beat?.finale]);

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
      className={`story-scene${leaving ? ' story-scene--leaving' : ''}${copyShown ? ' story-scene--ready' : ''}${beat.atmosphere === 'dawn' ? ' story-scene--dawn' : ''}${beat.atmosphere === 'road' ? ' story-scene--road' : ''}${beat.atmosphere === 'city' ? ' story-scene--city' : ''}${beat.atmosphere === 'threshold' ? ' story-scene--threshold' : ''}${beat.atmosphere === 'lodge' ? ' story-scene--lodge' : ''}${beat.atmosphere === 'morning' ? ' story-scene--morning' : ''}${isLast ? ' story-scene--finale' : ''}${beat.motion === 'ground' ? ' story-scene--ground' : ''}${beat.motion === 'push' ? ' story-scene--push' : ''}`}
      aria-label={ariaLabel ?? beat.title}
      aria-live="polite"
      onClick={(event) => {
        // Кнопки сами разбираются с кликами; остальная площадь — «далее».
        if ((event.target as HTMLElement).closest('button')) return;
        next();
      }}
    >
      {fadingImage && (
        <img className="story-scene__art story-scene__art--out" src={fadingImage} alt="" aria-hidden="true" />
      )}
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
      {beat.atmosphere === 'dawn' && (
        <div className="story-scene__dawn" aria-hidden="true">
          <span className="story-scene__cloud story-scene__cloud--far" />
          <span className="story-scene__cloud story-scene__cloud--near" />
          <span className="story-scene__fog" />
        </div>
      )}
      {beat.atmosphere === 'city' && (
        <div className="story-scene__city" aria-hidden="true">
          <span className="story-scene__streetglow" />
          <span className="story-scene__smoke story-scene__smoke--left" />
          <span className="story-scene__smoke story-scene__smoke--right" />
          <span className="story-scene__light story-scene__light--far" />
          <span className="story-scene__light story-scene__light--near" />
        </div>
      )}
      {beat.atmosphere === 'morning' && (
        <div className="story-scene__morning" aria-hidden="true">
          <span className="story-scene__morningglow" />
          <span className="story-scene__fog" />
        </div>
      )}
      {beat.atmosphere === 'lodge' && (
        <div className="story-scene__lodge" aria-hidden="true">
          <span className="story-scene__lampglow" />
          <span className="story-scene__lightshaft" />
        </div>
      )}
      {beat.atmosphere === 'threshold' && (
        <div className="story-scene__threshold" aria-hidden="true">
          <span className="story-scene__hearthglow" />
        </div>
      )}
      {beat.enter === 'glow' && (
        <div className="story-scene__glow-in" aria-hidden="true" key={beat.id} />
      )}
      {beat.enter === 'mist' && (
        <div className="story-scene__mist" aria-hidden="true" key={beat.id} />
      )}
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
