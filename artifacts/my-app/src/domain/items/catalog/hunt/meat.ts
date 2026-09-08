import type { CatalogItem } from '../types.ts';

/**
 * Охота — сырое мясо с монстров. Добыча боя (`domain/combat/monsters.ts`).
 * Картинки существующие (`materials/food/meat/*`, только сырьё).
 * Сырое мясо не лечит — его ещё нужно приготовить.
 */
export const HUNT_MEAT: CatalogItem[] = [
  { id: 'meat_poultry', name: 'Тушка птицы', description: 'Ощипанная тушка птицы. Просится в котёл с кореньями.', category: 'food', tier: 1, sellValue: 6, canSell: true, stackable: true, iconPath: 'materials/food/meat/meat_poultry', icon: '🍗' },
  { id: 'meat_haunch', name: 'Окорочок сырой', description: 'Сырой окорочок на кости. Румяным станет только на огне.', category: 'food', tier: 1, sellValue: 8, canSell: true, stackable: true, iconPath: 'materials/food/meat/meat_haunch', icon: '🍖' },
  { id: 'meat_ribs', name: 'Рёбрышки сырые', description: 'Свежие рёбрышки. Мяса немного, но наваристого.', category: 'food', tier: 2, sellValue: 14, canSell: true, stackable: true, iconPath: 'materials/food/meat/meat_ribs', icon: '🥩' },
  { id: 'meat_steak', name: 'Стейк сырой', description: 'Толстый кусок сырой говядины. С кровью есть не советуем.', category: 'food', tier: 2, sellValue: 18, canSell: true, stackable: true, iconPath: 'materials/food/meat/meat_steak', icon: '🥩' },
];
