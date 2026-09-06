import type { CatalogItem } from '../types.ts';

/**
 * «Сбор» — грибы. На диске shroom_01…10, у каждого сырой (`_raw`) и готовый
 * (`_cooked`) файл — это ОДИН вид в двух состояниях, а не два разных тира.
 * Батч 1: вводим все 10 пар (решение владельца «Все»).
 * Названия — плейсхолдеры; владелец смотрит на картинки в админ-каталоге.
 */
const SPECIES = Array.from({ length: 10 }, (_, i) => i + 1);
const pad = (n: number) => String(n).padStart(2, '0');

const raw = (n: number): CatalogItem => ({
  id: `mushroom_${pad(n)}_raw`,
  name: `Сырой гриб ${pad(n)}`,
  description: `Гриб №${pad(n)}, собранный на земле. Название и свойства уточняются.`,
  category: 'foraging',
  tier: 1,
  sellValue: 2,
  canSell: true,
  stackable: true,
  iconPath: `materials/food/mushrooms/shroom_${pad(n)}_raw`,
  icon: '🍄',
});

const cooked = (n: number): CatalogItem => ({
  id: `mushroom_${pad(n)}_cooked`,
  name: `Жареный гриб ${pad(n)}`,
  description: `Гриб №${pad(n)}, приготовленный на огне. Готов к употреблению.`,
  category: 'foraging',
  tier: 1,
  sellValue: 4,
  canSell: true,
  stackable: true,
  iconPath: `materials/food/mushrooms/shroom_${pad(n)}_cooked`,
  icon: '🍄',
});

export const FORAGE_FUNGI: CatalogItem[] = [
  ...SPECIES.map(raw),
  ...SPECIES.map(cooked),
];
