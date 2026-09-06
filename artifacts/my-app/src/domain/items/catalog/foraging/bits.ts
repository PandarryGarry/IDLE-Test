import type { CatalogItem } from '../types.ts';

/** «Сбор» — прочая мелочь с земли, не вошедшая в другие семьи. */
export const FORAGE_BITS: CatalogItem[] = [
  { id: 'quartz_sand', name: 'Кварцевый песок', description: 'Чистый песок, который плавится в стекло.', category: 'foraging', tier: 1, sellValue: 2, canSell: true, stackable: true, iconPath: 'materials/glass/quartz_sand', icon: '⏳' },
  { id: 'rope_fiber', name: 'Растительное волокно', description: 'Гибкое волокно для верёвок и плетения.', category: 'foraging', tier: 1, sellValue: 2, canSell: true, stackable: true, iconPath: 'materials/tailoring/rope_fiber', icon: '🧵' },
  { id: 'cord_sinew', name: 'Сухожилие', description: 'Крепкая жила. Незаменима для тетивы и прочных нитей.', category: 'foraging', tier: 1, sellValue: 3, canSell: true, stackable: true, iconPath: 'materials/tailoring/cord_sinew', icon: '🧵' },
];
