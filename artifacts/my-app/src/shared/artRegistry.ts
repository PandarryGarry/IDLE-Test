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
  sigil?: SigilConfig;
}

/** Заставочный арт — деревянная вывеска таверны. */
export const SPLASH_ART: ArtEntry = {
  src: '/assets/art/splash.png',
  mode: 'sign',
};

/** Второй арт — рунный круг (под будущий экран: призыв/босс/магия). */
export const RESERVED_ART: ArtEntry = {
  src: '/assets/art/reserved.png',
  mode: 'sigil',
  sigil: { cx: 0.5, cy: 0.4, r: 0.36 },
};

/** Палитра свечения/пылинок (amber-500 дизайн-системы). */
export const ART_TINT = { r: 245, g: 158, b: 11 };
