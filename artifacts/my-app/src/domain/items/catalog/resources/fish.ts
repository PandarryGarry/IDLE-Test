import type { CatalogItem } from '../types.ts';
import type { ItemTier } from '../../../../data/types.ts';

/**
 * Рыба — Рыбалка + Кулинария.
 * На диске fish_01…25, у каждого сырой (`_raw`) и готовый (`_cooked`) файл —
 * это ОДИН вид в двух состояниях, а не два отдельных тира.
 *
 * Батч 1: вводим все 25 видов (решение владельца «Все»).
 * Тир — предварительный (t01..t12, с 13-го вида упирается в максимум).
 * Владелец смотрит на картинки в админ-каталоге и правит названия/тир.
 */
const SPECIES = Array.from({ length: 25 }, (_, i) => i + 1);

const pad = (n: number) => String(n).padStart(2, '0');

const raw = (n: number): CatalogItem => ({
  id: `fish_${pad(n)}_raw`,
  name: `Сырая рыба ${pad(n)}`,
  description: `Свежий улов — рыба №${pad(n)}. Перед едой нужно приготовить.`,
  category: 'raw_fish',
  tier: Math.min(12, n) as ItemTier,
  sellValue: 3 + n * 2,
  canSell: true,
  stackable: true,
  iconPath: `materials/food/fish/fish_${pad(n)}_raw`,
  icon: '🐟',
});

const cooked = (n: number): CatalogItem => ({
  id: `fish_${pad(n)}_cooked`,
  name: `Жареная рыба ${pad(n)}`,
  description: `Рыба №${pad(n)}, приготовленная на огне. Готова к употреблению.`,
  category: 'cooked_fish',
  tier: Math.min(12, n) as ItemTier,
  sellValue: 5 + n * 2,
  canSell: true,
  stackable: true,
  iconPath: `materials/food/fish/fish_${pad(n)}_cooked`,
  icon: '🍽️',
});

export const RAW_FISH: CatalogItem[] = SPECIES.map(raw);
export const COOKED_FISH: CatalogItem[] = SPECIES.map(cooked);
export const FISH: CatalogItem[] = [...RAW_FISH, ...COOKED_FISH];
