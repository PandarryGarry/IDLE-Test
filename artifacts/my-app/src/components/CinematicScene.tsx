import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

export type CinematicSceneId = "entrance" | "departure";

interface SceneCopy {
  image: string;
  eyebrow: string;
  title: string;
  body: string;
  cue: string;
}

const SCENES: Record<CinematicSceneId, SceneCopy> = {
  entrance: {
    image: "/assets/art/cutscene_tavern_entrance.webp",
    eyebrow: "ЭТЕЛИЯ · НЕЗНАКОМЫЙ ГОРОД",
    title: "У всякой дороги есть первая дверь.",
    body: "За ней ждут огонь, голоса и место, с которого начинается путь.",
    cue: "Войти в таверну",
  },
  departure: {
    image: "/assets/art/cutscene_character_departure.webp",
    eyebrow: "ПЕРВЫЙ ШАГ",
    title: "Город ждёт твоего шага.",
    body: "За порогом — ремёсла, опасности и истории, которые станут твоими.",
    cue: "Навстречу Этелии",
  },
};

interface CinematicSceneProps {
  scene: CinematicSceneId;
  /** Короткая сцена не должна задерживать игрока: любой тап/клик или Escape её пропускает. */
  onComplete: () => void;
  durationMs?: number;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Максимум ожидания арта до старта отсчёта сцены (страховка от вечного экрана). */
const IMAGE_SETTLE_CAP_MS = 3500;

/**
 * Полноэкранная, но очень короткая кинематографичная перебивка.
 * Арт — отдельный ключевой кадр, движение — только CSS: лёгкий camera push,
 * свет, пыль и мягкое растворение. Так сцена работает быстро и на iOS.
 */
export function CinematicScene({
  scene,
  onComplete,
  durationMs = 1900,
}: CinematicSceneProps) {
  const copy = SCENES[scene];
  const [leaving, setLeaving] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  // Арт «решён» (загружен или упал): с этого момента стартует отсчёт сцены.
  // Иначе на медленной сети все 1.9 сек игрок смотрит тёмный фон без арта.
  const [imageSettled, setImageSettled] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const [reducedMotion] = useState(prefersReducedMotion);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // onLoad обычно приходит и для preloaded-файла, но complete закрывает редкий
  // случай, когда браузер успел взять изображение из cache до привязки обработчика.
  useEffect(() => {
    if (imageRef.current?.complete) setImageReady(true);
  }, [scene]);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setLeaving(true);
    window.setTimeout(() => onCompleteRef.current(), 340);
  }, []);

  // Никакого даже однокадрового flash для тех, кто отключил движение:
  // режиссёр сразу продолжает маршрут, а этот компонент ничего не рисует.
  useEffect(() => {
    if (!reducedMotion) return;
    const timer = window.setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onCompleteRef.current();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  // Страховка: если арт так и не пришёл (медленная сеть/ошибка) — не висеть
  // вечно, максимум IMAGE_SETTLE_CAP_MS ждём появления картинки.
  useEffect(() => {
    if (imageReady) {
      setImageSettled(true);
      return;
    }
    const timer = window.setTimeout(() => setImageSettled(true), IMAGE_SETTLE_CAP_MS);
    return () => window.clearTimeout(timer);
  }, [imageReady]);

  useEffect(() => {
    if (reducedMotion || !imageSettled) return;
    const timer = window.setTimeout(finish, durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs, finish, reducedMotion, imageSettled]);

  useEffect(() => {
    if (reducedMotion) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [finish, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <section
      className={`cinematic-scene cinematic-scene--${scene}${leaving ? " cinematic-scene--leaving" : ""}${imageReady ? " cinematic-scene--ready" : ""}`}
      aria-label={copy.cue}
      aria-live="polite"
      onClick={finish}
    >
      <img
        ref={imageRef}
        className="cinematic-scene__art"
        src={copy.image}
        alt=""
        onLoad={() => setImageReady(true)}
        onError={() => setImageReady(true)}
      />
      <div className="cinematic-scene__veil" aria-hidden="true" />
      <div className="cinematic-scene__flare" aria-hidden="true" />
      <div className="cinematic-scene__motes" aria-hidden="true">
        {Array.from({ length: 14 }, (_, index) => (
          <span
            key={index}
            style={
              {
                "--mote-index": index,
                "--mote-left": `${(index * 37) % 100}%`,
                "--mote-size": `${2 + (index % 3)}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="cinematic-scene__content">
        <span className="cinematic-scene__eyebrow">{copy.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>
        <span className="cinematic-scene__cue">{copy.cue}</span>
      </div>

      <button
        type="button"
        className="cinematic-scene__skip"
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

export default CinematicScene;
