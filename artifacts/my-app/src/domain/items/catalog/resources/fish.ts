import type { CatalogItem } from '../types.ts';
import type { ItemTier } from '../../../../data/types.ts';

/**
 * Рыба — Рыбалка + Кулинария.
 * На диске fish_01…25, у каждого сырой (`_raw`) и готовый (`_cooked`) файл —
 * это ОДИН вид в двух состояниях, а не два отдельных тира.
 *
 * Батч 1: вводим все 25 видов (решение владельца «Все»).
 * Вид определён визуально по картинкам из `public/assets/icons/materials/food/fish/`.
 * Тир — предварительный (t01..t12, с 13-го вида упирается в максимум).
 * Владелец смотрит на картинки в админ-каталоге и правит названия/тир.
 */
type FishSpecies = {
  n: number;
  rawName: string;
  cookedName: string;
};

const SPECIES: FishSpecies[] = [
  { n: 1,  rawName: 'Линь',                  cookedName: 'Жареный линь' },
  { n: 2,  rawName: 'Радужная форель',       cookedName: 'Жареная радужная форель' },
  { n: 3,  rawName: 'Ручьевая форель',       cookedName: 'Жареная ручьевая форель' },
  { n: 4,  rawName: 'Тунец',                 cookedName: 'Жареный тунец' },
  { n: 5,  rawName: 'Щука',                  cookedName: 'Жареная щука' },
  { n: 6,  rawName: 'Угорь',                 cookedName: 'Жареный угорь' },
  { n: 7,  rawName: 'Иглобрюх',              cookedName: 'Жареный иглобрюх' },
  { n: 8,  rawName: 'Марлин',                cookedName: 'Жареный марлин' },
  { n: 9,  rawName: 'Скат манта',            cookedName: 'Жареный скат манта' },
  { n: 10, rawName: 'Медуза',                cookedName: 'Жареная медуза' },
  { n: 11, rawName: 'Лобстер',               cookedName: 'Жареный лобстер' },
  { n: 12, rawName: 'Осьминог',              cookedName: 'Жареный осьминог' },
  { n: 13, rawName: 'Краб',                  cookedName: 'Жареный краб' },
  { n: 14, rawName: 'Горбуша',               cookedName: 'Жареная горбуша' },
  { n: 15, rawName: 'Камбала',               cookedName: 'Жареная камбала' },
  { n: 16, rawName: 'Осётр',                 cookedName: 'Жареный осётр' },
  { n: 17, rawName: 'Лещ',                   cookedName: 'Жареный лещ' },
  { n: 18, rawName: 'Карась',                cookedName: 'Жареный карась' },
  { n: 19, rawName: 'Морской окунь',         cookedName: 'Жареный морской окунь' },
  { n: 20, rawName: 'Корюшка',               cookedName: 'Жареная корюшка' },
  { n: 21, rawName: 'Панцирная щука',        cookedName: 'Жареная панцирная щука' },
  { n: 22, rawName: 'Карп кои',              cookedName: 'Жареный карп кои' },
  { n: 23, rawName: 'Рыба-звездочёт',        cookedName: 'Жареная рыба-звездочёт' },
  { n: 24, rawName: 'Удильщик',              cookedName: 'Жареный удильщик' },
  { n: 25, rawName: 'Скорпена',              cookedName: 'Жареная скорпена' },
];

const pad = (n: number) => String(n).padStart(2, '0');

const raw = (s: FishSpecies): CatalogItem => ({
  id: `fish_${pad(s.n)}_raw`,
  name: s.rawName,
  description: `${s.rawName}. Свежий улов — перед едой нужно приготовить.`,
  category: 'raw_fish',
  tier: Math.min(12, s.n) as ItemTier,
  sellValue: 3 + s.n * 2,
  canSell: true,
  stackable: true,
  iconPath: `materials/food/fish/fish_${pad(s.n)}_raw`,
  icon: '🐟',
});

const cooked = (s: FishSpecies): CatalogItem => ({
  id: `fish_${pad(s.n)}_cooked`,
  name: s.cookedName,
  description: `${s.cookedName}. Приготовлено на огне, готово к употреблению.`,
  category: 'cooked_fish',
  tier: Math.min(12, s.n) as ItemTier,
  sellValue: 5 + s.n * 2,
  canSell: true,
  stackable: true,
  iconPath: `materials/food/fish/fish_${pad(s.n)}_cooked`,
  icon: '🍽️',
});

export const RAW_FISH: CatalogItem[] = SPECIES.map(raw);
export const COOKED_FISH: CatalogItem[] = SPECIES.map(cooked);
export const FISH: CatalogItem[] = [...RAW_FISH, ...COOKED_FISH];
