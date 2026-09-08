import type { CatalogItem } from '../types.ts';

/**
 * «Сбор» — особые находки. Это НЕ материалы других профессий: они нужны
 * в будущем для готовки, крафта и зельеварения.
 * Картинки свои (`materials/forage/*`).
 */
export const FORAGE_SPECIAL: CatalogItem[] = [
  { id: 'wild_berries', name: 'Дикие ягоды', description: 'Сладкие лесные ягоды. Основа для ягодных блюд и простых напитков.', category: 'foraging', tier: 1, sellValue: 6, canSell: true, stackable: true, iconPath: 'materials/forage/berry_wild', icon: '🍓' },
  { id: 'healing_herbs', name: 'Целебные травы', description: 'Пучок пахучих трав. Идут в аптекарские смеси и будущее зельеварение.', category: 'foraging', tier: 2, sellValue: 12, canSell: true, stackable: true, iconPath: 'materials/forage/herb_healing', icon: '🌿' },
  { id: 'pine_resin', name: 'Смола', description: 'Липкая хвойная смола. Пригодится в крафте и алхимии.', category: 'foraging', tier: 3, sellValue: 25, canSell: true, stackable: true, iconPath: 'materials/forage/resin_pine', icon: '🧴' },
  { id: 'clay_lump', name: 'Глина', description: 'Вязкая глина. Сырьё для гончарного дела и будущих ремесленных рецептов.', category: 'foraging', tier: 3, sellValue: 18, canSell: true, stackable: true, iconPath: 'materials/forage/clay_lump', icon: '🧱' },
  { id: 'glow_berry', name: 'Светящаяся ягода', description: 'Редкая светящаяся в темноте ягода. Нужна для магических зелий.', category: 'foraging', tier: 5, sellValue: 60, canSell: true, stackable: true, iconPath: 'materials/forage/berry_glow', icon: '💠' },
  { id: 'heart_root', name: 'Корень-сердечник', description: 'Ценный корень в форме сердца. Считается основой сильнейших алхимических эликсиров.', category: 'foraging', tier: 6, sellValue: 120, canSell: true, stackable: true, iconPath: 'materials/forage/root_heart', icon: '❤️' },
];
