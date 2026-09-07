import type { CatalogItem } from '../types.ts';

/**
 * «Сбор» — грибы. На диске shroom_01…10, у каждого сырой (`_raw`) и готовый
 * (`_cooked`) файл — это ОДИН вид в двух состояниях, а не два разных тира.
 *
 * Тир = редкость вида. Грибы создавались как отдельные «виды редкости»,
 * поэтому тир у каждого свой (t1..t7, без экзотики батча 1).
 */
type MushroomSpecies = {
  n: number;
  rawName: string;
  cookedName: string;
  tier: 1 | 2 | 3 | 4 | 5 | 6 | 7;
};

const rawSell = (tier: number) => 2 + tier * 2;
const cookedSell = (tier: number) => 4 + tier * 2;

const SPECIES: MushroomSpecies[] = [
  { n: 1,  rawName: 'Белый гриб',      cookedName: 'Жареный белый гриб',      tier: 4 },
  { n: 2,  rawName: 'Лисичка',         cookedName: 'Жареная лисичка',         tier: 2 },
  { n: 3,  rawName: 'Мухомор',         cookedName: 'Жареный мухомор',         tier: 5 },
  { n: 4,  rawName: 'Шампиньон',       cookedName: 'Жареный шампиньон',       tier: 1 },
  { n: 5,  rawName: 'Опёнок',          cookedName: 'Жареный опёнок',          tier: 1 },
  { n: 6,  rawName: 'Сморчок',         cookedName: 'Жареный сморчок',         tier: 4 },
  { n: 7,  rawName: 'Подосиновик',     cookedName: 'Жареный подосиновик',     tier: 2 },
  { n: 8,  rawName: 'Трюфель',         cookedName: 'Жареный трюфель',         tier: 7 },
  { n: 9,  rawName: 'Зеленушка',       cookedName: 'Жареная зеленушка',       tier: 3 },
  { n: 10, rawName: 'Светящийся гриб', cookedName: 'Жареный светящийся гриб', tier: 6 },
];

const pad = (n: number) => String(n).padStart(2, '0');

const raw = (s: MushroomSpecies): CatalogItem => ({
  id: `mushroom_${pad(s.n)}_raw`,
  name: s.rawName,
  description: `${s.rawName}. Найдено на земле — перед едой нужно приготовить.`,
  category: 'foraging',
  tier: s.tier,
  sellValue: rawSell(s.tier),
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
  tier: s.tier,
  sellValue: cookedSell(s.tier),
  canSell: true,
  stackable: true,
  iconPath: `materials/food/mushrooms/shroom_${pad(s.n)}_cooked`,
  icon: '🍄',
});

export const FORAGE_FUNGI: CatalogItem[] = [
  ...SPECIES.map(raw),
  ...SPECIES.map(cooked),
];
