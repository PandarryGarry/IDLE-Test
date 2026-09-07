import type { CatalogItem } from '../types.ts';

/**
 * Минералы. Реальные названия из ITEMS_CATALOG.md.
 * На диске coal_t01…t04 (древесный / каменный / антрацит / тлеющий)
 * и stone. Батч 1: вводим четыре сорта угля + камень.
 */
export const MINERALS: CatalogItem[] = [
  { id: 'coal_charcoal', name: 'Уголь · Древесный', description: 'Древесный уголь из пережжённой древесины. Даёт ровный жар без дыма.', category: 'mineral', tier: 1, sellValue: 8, canSell: true, stackable: true, iconPath: 'materials/minerals/coal_t01', icon: '🖤' },
  { id: 'coal', name: 'Уголь · Каменный', description: 'Каменный уголь. Горит жарко и долго — кузнецу нужен для стали.', category: 'mineral', tier: 2, sellValue: 25, canSell: true, stackable: true, iconPath: 'materials/minerals/coal_t02', icon: '🖤' },
  { id: 'coal_anthracite', name: 'Уголь · Антрацит', description: 'Чёрный блестящий антрацит. Самая горячая и чистая горная порода.', category: 'mineral', tier: 3, sellValue: 60, canSell: true, stackable: true, iconPath: 'materials/minerals/coal_t03', icon: '🖤' },
  { id: 'coal_embers', name: 'Уголь · Тлеющий', description: 'Уголь, который ещё хранит живой жар. Редкая находка под землёй.', category: 'mineral', tier: 4, sellValue: 120, canSell: true, stackable: true, iconPath: 'materials/minerals/coal_t04', icon: '🔥' },
  { id: 'stone', name: 'Камень', description: 'Обычный булыжник, поднятый с земли. Пригодится в строительстве и ремесле.', category: 'mineral', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/minerals/stone', icon: '🪨' },
];
