import type { CatalogItem } from '../types.ts';

/**
 * «Сбор» — деревянная мелочь с земли. Число в id — вариант вида (v01..vNN),
 * НЕ тир: всё это базовый сбор, tier 1.
 */
export const FORAGE_WOOD: CatalogItem[] = [
  { id: 'branch_01', name: 'Ветка', description: 'Тонкая ветка, подобранная на дороге. Годится для розжига и поделок.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/branch_v01', icon: '🌿' },
  { id: 'branch_02', name: 'Толстая ветка', description: 'Крепкая ветка потолще. Сломать руками уже непросто.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/branch_v02', icon: '🌿' },
  { id: 'branch_03', name: 'Сухая ветка', description: 'Высохшая ветка — отличная растопка для костра.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/branch_v03', icon: '🌿' },
  { id: 'stick_01', name: 'Палка', description: 'Ровная палка, найденная под ногами.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/stick_v01', icon: '🪵' },
  { id: 'stick_02', name: 'Длинная палка', description: 'Длинная и прямая — будущее древко или опора.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/stick_v02', icon: '🪵' },
  { id: 'stick_03', name: 'Крепкая палка', description: 'Плотная палка, не гнётся и не трескается.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/stick_v03', icon: '🪵' },
  { id: 'stick_04', name: 'Обточенная палка', description: 'Палка с гладким концом — будто кто-то уже начал её обрабатывать.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/stick_v04', icon: '🪵' },
  { id: 'cone_01', name: 'Шишка', description: 'Обычная еловая шишка. Хорошая растопка и материал для поделок.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/cone_v01', icon: '🌲' },
  { id: 'cone_02', name: 'Большая шишка', description: 'Крупная шишка с тяжёлыми чешуйками.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/cone_v02', icon: '🌲' },
  { id: 'leaf_01', name: 'Лист', description: 'Зелёный лист с дерева. Сгодится для трав и обёртки.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/leaf_v01', icon: '🍃' },
  { id: 'leaf_02', name: 'Сухой лист', description: 'Шуршащий сухой лист — первая помощь при розжиге.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/leaf_v02', icon: '🍂' },
  { id: 'leaf_03', name: 'Крупный лист', description: 'Большой широкий лист. В него удобно заворачивать съестное.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/leaf_v03', icon: '🍃' },
];
