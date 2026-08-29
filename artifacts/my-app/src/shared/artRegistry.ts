/**
 * Реестр ключевых артов и то, КАК их оживлять.
 *
 * Файлы лежат в `artifacts/my-app/public/assets/art/` и отдаются по абсолютному пути.
 * Режим задаётся явно (под конкретный арт), а не авто-детектом:
 *
 *  - 'sign'  — «вывеска на цепях»: покачивание-маятник, мерцание свечей, пыль, виньетка.
 *  - 'sigil' — «рунный круг»: надпись стоит, круг медленно вращается в круговой маске,
 *              пульс свечения в центре.
 *  - 'scene' / 'cutout' — универсальные режимы для будущих артов.
 *
 * Если файла нет — SplashScreen молча откатывается на векторный герб.
 */

import type { ArtMode, SigilConfig, SignMotionConfig, LightBloomConfig } from '@/components/art/artEngine';

export interface ArtEntry {
  src: string;
  mode: ArtMode;
  /** cover — на весь экран (для полноэкранных сцен), contain — целиком с полями. */
  fit?: 'cover' | 'contain';
  sigil?: SigilConfig;
  /** Точная область вывески/щита: качается отдельно от статичного фона. */
  signMotion?: SignMotionConfig;
  /** Мягкие пульсации света от фонарей/камина/свечей. */
  lightBlooms?: LightBloomConfig[];
}

const GENTLE_SIGN_SWAY = {
  amplitudeDeg: 0.42,
  periodMs: 8200,
  pointerDeg: 0.06,
  driftPx: 0.85,
  bobPx: 0.45,
  mask: 'shield',
} satisfies Omit<SignMotionConfig, 'region' | 'pivot'>;

const SPLASH_LIGHT_BLOOMS = {
  wide: [
    { x: 0.12, y: 0.35, radius: 0.16, alpha: 0.07, phase: 0.1 }, // левый фонарь
    { x: 0.77, y: 0.45, radius: 0.15, alpha: 0.045, phase: 1.8 }, // свечи на полке
    { x: 0.86, y: 0.72, radius: 0.22, alpha: 0.085, phase: 2.7 }, // камин
    { x: 0.27, y: 0.76, radius: 0.13, alpha: 0.04, phase: 4.1 }, // столовые свечи
  ],
  tall: [
    { x: 0.17, y: 0.49, radius: 0.16, alpha: 0.065, phase: 0.4 }, // левый фонарь
    { x: 0.74, y: 0.52, radius: 0.14, alpha: 0.045, phase: 1.6 }, // дальние свечи
    { x: 0.80, y: 0.66, radius: 0.20, alpha: 0.075, phase: 2.3 }, // камин
    { x: 0.50, y: 0.84, radius: 0.18, alpha: 0.07, phase: 3.4 }, // свечи на бочке
  ],
  square: [
    { x: 0.14, y: 0.46, radius: 0.16, alpha: 0.065, phase: 0.2 }, // левый фонарь
    { x: 0.78, y: 0.47, radius: 0.14, alpha: 0.045, phase: 1.5 }, // полка со свечами
    { x: 0.82, y: 0.70, radius: 0.22, alpha: 0.08, phase: 2.4 }, // камин/правые свечи
    { x: 0.31, y: 0.77, radius: 0.12, alpha: 0.04, phase: 3.8 }, // нижние свечи
  ],
} satisfies Record<'wide' | 'tall' | 'square', LightBloomConfig[]>;

/**
 * Заставочный арт — три варианта сцены таверны под разные экраны.
 * Все — лёгкие WebP (~110 КБ вместо 2.4 МБ PNG), грузятся быстро.
 *
 * signMotion задаёт не весь кадр, а именно щит/вывеску с цепями.
 * Так фон таверны остаётся спокойным, а тяжёлая деревянная вывеска едва покачивается.
 */
export const SPLASH_ART_VARIANTS: Record<'wide' | 'tall' | 'square', ArtEntry> = {
  /** Десктоп / ландшафт (16:9) */
  wide: {
    src: '/assets/art/splash_wide.webp',
    mode: 'sign',
    fit: 'cover',
    signMotion: {
      ...GENTLE_SIGN_SWAY,
      region: { x: 0.29, y: 0.02, w: 0.42, h: 0.88 },
      pivot: { x: 0.5, y: 0.08 },
    },
    lightBlooms: SPLASH_LIGHT_BLOOMS.wide,
  },
  /** Телефон / портрет (9:16) */
  tall: {
    src: '/assets/art/splash_tall.webp',
    mode: 'sign',
    fit: 'cover',
    signMotion: {
      ...GENTLE_SIGN_SWAY,
      region: { x: 0.22, y: 0.27, w: 0.58, h: 0.47 },
      pivot: { x: 0.5, y: 0.055 },
    },
    lightBlooms: SPLASH_LIGHT_BLOOMS.tall,
  },
  /** Квадратные и промежуточные экраны */
  square: {
    src: '/assets/art/splash_square.webp',
    mode: 'sign',
    fit: 'cover',
    signMotion: {
      ...GENTLE_SIGN_SWAY,
      region: { x: 0.18, y: 0.055, w: 0.66, h: 0.86 },
      pivot: { x: 0.5, y: 0.06 },
    },
    lightBlooms: SPLASH_LIGHT_BLOOMS.square,
  },
};

/** Выбирает вариант заставки под пропорции экрана. */
export function pickSplashArt(width: number, height: number): ArtEntry {
  const aspect = width / Math.max(1, height);
  if (aspect >= 1.15) return SPLASH_ART_VARIANTS.wide;
  if (aspect <= 0.85) return SPLASH_ART_VARIANTS.tall;
  return SPLASH_ART_VARIANTS.square;
}

/**
 * Ключевые арты «дороги» онбординга (вход → таверна → ложа → выход).
 * Заставка греет их в кэш заранее, чтобы катсцены и экраны правил/ложи
 * открывались без «пустого» фона на медленной сети.
 */
export const ONBOARDING_ART_PRELOAD: readonly string[] = [
  '/assets/art/cutscene_tavern_entrance.webp',
  '/assets/art/auth_tavern_background.webp',
  '/assets/art/character_creation_lodge.webp',
  '/assets/art/cutscene_character_departure.webp',
];

/** Заставочный арт (дефолт) — оставлен для обратной совместимости. */
export const SPLASH_ART: ArtEntry = SPLASH_ART_VARIANTS.square;

/** Палитра свечения/пылинок (amber-500 дизайн-системы). */
export const ART_TINT = { r: 245, g: 158, b: 11 };
