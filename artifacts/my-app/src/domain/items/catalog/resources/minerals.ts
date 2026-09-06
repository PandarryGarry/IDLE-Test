import type { CatalogItem } from '../types.ts';

/**
 * Минералы — камень и уголь (id по §5: `coal`, `stone`).
 * Уголь фармится в горном деле, камень — в «Сборе».
 */
export const MINERALS: CatalogItem[] = [
  { id: 'coal', name: 'Уголь', description: 'Каменный уголь. Горит жарко и долго — кузнецу нужен для стали.', category: 'mineral', tier: 1, sellValue: 25, canSell: true, stackable: true, iconPath: 'materials/minerals/coal_t01', icon: '🖤' },
  { id: 'stone', name: 'Камень', description: 'Обычный булыжник, поднятый с земли. Пригодится в строительстве и ремесле.', category: 'mineral', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/minerals/stone', icon: '🪨' },
];
