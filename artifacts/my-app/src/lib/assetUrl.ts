/**
 * Рантайм-URL картинок. Мастер — PNG; в браузер всегда уходит WebP
 * (см. scripts/assets/optimize.mjs).
 */

const ICONS = '/assets/icons/';

export function iconUrl(pathFromIcons: string): string {
  const trimmed = pathFromIcons
    .replace(/^\/+/, '')
    .replace(/^assets\/icons\//, '')
    .replace(/^icons\//, '')
    .replace(/\.(png|webp|jpe?g)$/i, '');
  return `${ICONS}${trimmed}.webp`;
}

export function prefetchImage(href: string): void {
  if (typeof document === 'undefined') return;
  const safe = href.replace(/"/g, '');
  if (document.querySelector(`link[rel="preload"][href="${safe}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = href;
  document.head.appendChild(link);
}
