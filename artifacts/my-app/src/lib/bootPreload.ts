/**
 * Прогрев картинок, пока на экране вывеска / акт 0.
 * Не грузим все 800 иконок — только то, без чего первый кадр пустой.
 */
import { ONBOARDING_ART_PRELOAD } from '@/shared/artRegistry';
import {
  BOARD_EMBLEM,
  BRANCH_ICON,
  HUB_NAV_ICON,
  PILLAR_ICON,
  PASSIVE_ICON,
  SYNERGY_ICON,
} from '@/domain/attributes/attributeIcons';
import { getAvatarPath, getDollPath, getDollPath2x } from '@/data/characters';

/** Дорога онбординга + первый кадр тела героя. */
export function bootGateUrls(avatarIds: readonly string[] = []): string[] {
  const urls = [
    ...ONBOARDING_ART_PRELOAD,
    BOARD_EMBLEM,
    ...Object.values(PILLAR_ICON),
    ...Object.values(BRANCH_ICON),
    ...Object.values(HUB_NAV_ICON),
  ];
  for (const id of avatarIds) {
    if (!id) continue;
    urls.push(getAvatarPath(id), getDollPath(id), getDollPath2x(id));
  }
  return unique(urls);
}

/** Нити и глубинные пассивки — греем в фоне, шкалу не держим. */
export function bootBackgroundUrls(): string[] {
  return unique([
    ...Object.values(PASSIVE_ICON),
    ...Object.values(SYNERGY_ICON),
    ...Object.values(EQUIP_SLOT_ICON),
    ...Object.values(SLOT_FRAME),
  ]);
}

/** Греем URL в кэш, не ждём. */
export function warmImages(urls: readonly string[]): void {
  if (typeof window === 'undefined') return;
  for (const src of urls) {
    const img = new Image();
    img.src = src;
  }
}

/** Ждём декод всех URL или cap. Ошибка файла не блокирует. */
export function waitDecoded(urls: readonly string[], capMs: number): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const list = unique([...urls]);
  if (list.length === 0) return Promise.resolve();
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(cap);
      resolve();
    };
    let left = list.length;
    const cap = window.setTimeout(done, capMs);
    for (const src of list) {
      const img = new Image();
      const one = () => {
        left -= 1;
        if (left <= 0) done();
      };
      img.onload = () => {
        if (typeof img.decode === 'function') img.decode().then(one, one);
        else one();
      };
      img.onerror = one;
      img.src = src;
    }
  });
}

function unique(urls: string[]): string[] {
  return [...new Set(urls.filter(Boolean))];
}
