import type { CatalogItem } from '../types.ts';

/**
 * «Сбор» — деревянная мелочь с земли. Реальные названия из ITEMS_CATALOG.md.
 * Число в id — вариант вида (v01..vNN), это НЕ тир: базовый сбор, tier 1.
 * Картинки существующие (branch_v01…, stick_v01…, cone_v01…, leaf_v01…).
 */
export const FORAGE_WOOD: CatalogItem[] = [
  { id: 'branch_01', name: 'Ветка сухая', description: 'Сухая ветка с прошлогоднего дерева. Отличная растопка для костра.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/branch_v01', icon: '🌿' },
  { id: 'branch_02', name: 'Ветка зелёная', description: 'Свежая зелёная ветка. Гнётся, но не ломается — пригодится в ремесле.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/branch_v02', icon: '🌿' },
  { id: 'branch_03', name: 'Ветка хвойная', description: 'Хвойная ветка с хвоей. Пахнет смолой и годится на поделки.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/branch_v03', icon: '🌿' },
  { id: 'stick_01', name: 'Палка сучковатая', description: 'Сучковатая палка с узелками. Заготовка для древка или игрушки.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/stick_v01', icon: '🪵' },
  { id: 'stick_02', name: 'Палка оструганная', description: 'Ровно оструганная палка. Будто кто-то уже начал делать из неё орудие.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/stick_v02', icon: '🪵' },
  { id: 'stick_03', name: 'Палка-дубинка', description: 'Тяжёлая дубинка со сбитым утолщением. Держит удар.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/stick_v03', icon: '🪵' },
  { id: 'stick_04', name: 'Палка с обмоткой', description: 'Палка с кожаной обмоткой. Хватка не скользит даже в перчатках.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/stick_v04', icon: '🪵' },
  { id: 'cone_01', name: 'Шишка сосновая', description: 'Сосновая шишка. Сухая, звонкая, хорошо горит.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/cone_v01', icon: '🌲' },
  { id: 'cone_02', name: 'Шишка еловая', description: 'Плотная еловая шишка с тяжёлыми чешуйками.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/cone_v02', icon: '🌲' },
  { id: 'leaf_01', name: 'Лист дубовый', description: 'Широкий дубовый лист. Крепкий, с резным краем.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/leaf_v01', icon: '🍃' },
  { id: 'leaf_02', name: 'Лист кленовый', description: 'Кленовый лист с острыми лопастями. Говорят, приносит удачу.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/leaf_v02', icon: '🍂' },
  { id: 'leaf_03', name: 'Лист берёзовый', description: 'Лёгкий берёзовый лист. Почти невесомый и очень мягкий.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/leaf_v03', icon: '🍃' },
];
