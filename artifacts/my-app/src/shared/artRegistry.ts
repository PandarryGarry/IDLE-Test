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

import type { ArtMode, SigilConfig } from '@/components/art/artEngine';

export interface ArtEntry {
  src: string;
  mode: ArtMode;
  /** cover — на весь экран (для полноэкранных сцен), contain — целиком с полями. */
  fit?: 'cover' | 'contain';
  sigil?: SigilConfig;
}

/**
 * Заставочный арт — три варианта сцены таверны под разные экраны.
 * Все — лёгкие WebP (~110 КБ вместо 2.4 МБ PNG), грузятся быстро.
 */
export const SPLASH_ART_VARIANTS: Record<'wide' | 'tall' | 'square', ArtEntry> = {
  /** Десктоп / ландшафт (16:9) */
  wide:   { src: '/assets/art/splash_wide.webp',   mode: 'sign', fit: 'cover' },
  /** Телефон / портрет (9:16) */
  tall:   { src: '/assets/art/splash_tall.webp',   mode: 'sign', fit: 'cover' },
  /** Квадратные и промежуточные экраны */
  square: { src: '/assets/art/splash_square.webp', mode: 'sign', fit: 'cover' },
};

/** Выбирает вариант заставки под пропорции экрана. */
export function pickSplashArt(width: number, height: number): ArtEntry {
  const aspect = width / Math.max(1, height);
  if (aspect >= 1.15) return SPLASH_ART_VARIANTS.wide;
  if (aspect <= 0.85) return SPLASH_ART_VARIANTS.tall;
  return SPLASH_ART_VARIANTS.square;
}

/** Заставочный арт (дефолт) — оставлен для обратной совместимости. */
export const SPLASH_ART: ArtEntry = SPLASH_ART_VARIANTS.square;

/** Второй арт — рунный круг (под будущий экран: призыв/босс/магия). */
export const RESERVED_ART: ArtEntry = {
  src: '/assets/art/reserved.png',
  mode: 'sigil',
  sigil: { cx: 0.5, cy: 0.4, r: 0.36 },
};

/** Палитра свечения/пылинок (amber-500 дизайн-системы). */
export const ART_TINT = { r: 245, g: 158, b: 11 };
