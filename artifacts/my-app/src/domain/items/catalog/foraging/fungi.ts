import type { CatalogItem } from '../types.ts';

/**
 * «Сбор» — грибы. На диске shroom_01…10, у каждого сырой (`_raw`) и готовый
 * (`_cooked`) файл — это ОДИН вид в двух состояниях, а не два разных тира.
 * Батч 1: вводим все 10 пар (решение владельца «Все»).
 * Вид определён визуально по картинкам из `public/assets/icons/materials/food/mushrooms/`.
 */
type MushroomSpecies = {
  n: number;
  rawName: string;
  cookedName: string;
};

const SPECIES: MushroomSpecies[] = [
  { n: 1,  rawName: 'Белый гриб',        cookedName: 'Жареный белый гриб' },
  { n: 2,  rawName: 'Лисичка',           cookedName: 'Жареная лисичка' },
  { n: 3,  rawName: 'Мухомор',           cookedName: 'Жареный мухомор' },
  { n: 4,  rawName: 'Шампиньон',         cookedName: 'Жареный шампиньон' },
  { n: 5,  rawName: 'Опёнок',            cookedName: 'Жареный опёнок' },
  { n: 6,  rawName: 'Сморчок',           cookedName: 'Жареный сморчок' },
  { n: 7,  rawName: 'Подосиновик',       cookedName: 'Жареный подосиновик' },
  { n: 8,  rawName: 'Трюфель',           cookedName: 'Жареный трюфель' },
  { n: 9,  rawName: 'Зеленушка',         cookedName: 'Жареная зеленушка' },
  { n: 10, rawName: 'Светящийся гриб',   cookedName: 'Жареный светящийся гриб' },
];

const pad = (n: number) => String(n).padStart(2, '0');

const raw = (s: MushroomSpecies): CatalogItem => ({
  id: `mushroom_${pad(s.n)}_raw`,
  name: s.rawName,
  description: `${s.rawName}. Найдено на земле — перед едой нужно приготовить.`,
  category: 'foraging',
  tier: 1,
  sellValue: 2,
  canSell: true,
  stackable: true,
  iconPath: `materials/food/mushrooms/shroom_${pad(s.n)}_raw`,
  icon: '🍄',
});

const cooked = (s: MushroomSpecies): CatalogItem => ({
  id: `mushroom_${pad(s.n)}_cooked`,
  name: s.cookedName,
  description: `${s.cookedName}. Приготовлено на огне, готово к употреблению.`,
  category: 'foraging',
  tier: 1,
  sellValue: 4,
  canSell: true,
  stackable: true,
  iconPath: `materials/food/mushrooms/shroom_${pad(s.n)}_cooked`,
  icon: '🍄',
});

export const FORAGE_FUNGI: CatalogItem[] = [
  ...SPECIES.map(raw),
  ...SPECIES.map(cooked),
];
