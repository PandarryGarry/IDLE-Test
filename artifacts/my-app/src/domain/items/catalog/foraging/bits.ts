import type { CatalogItem } from '../types.ts';

/** «Сбор» — прочая мелочь с земли. Реальные названия из ITEMS_CATALOG.md. */
export const FORAGE_BITS: CatalogItem[] = [
  { id: 'quartz_sand', name: 'Песок кварцевый', description: 'Чистый кварцевый песок, который плавится в стекло.', category: 'foraging', tier: 1, sellValue: 2, canSell: true, stackable: true, iconPath: 'materials/glass/quartz_sand', icon: '⏳' },
  { id: 'rope_fiber', name: 'Верёвка растительная', description: 'Гибкое растительное волокно для верёвок и плетения.', category: 'foraging', tier: 1, sellValue: 2, canSell: true, stackable: true, iconPath: 'materials/tailoring/rope_fiber', icon: '🧵' },
  { id: 'cord_sinew', name: 'Бечёвка жильная', description: 'Крепкая жильная бечёвка. Незаменима для тетивы и прочных нитей.', category: 'foraging', tier: 1, sellValue: 3, canSell: true, stackable: true, iconPath: 'materials/tailoring/cord_sinew', icon: '🧵' },
];
