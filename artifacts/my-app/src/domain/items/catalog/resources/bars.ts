import type { CatalogItem } from '../types.ts';

/**
 * Слитки — Кузнечное дело. Батч 1: базовые тиры 1–8.
 * Тиры 9–12 (экзотика) НЕ вводим — нет дальних локаций.
 *
 * Лестница (ПРЕДВАРИТЕЛЬНО, владелец смотрит в админ-каталоге):
 * t1 медь · t2 бронза · t3 железо · t4 сталь · t5 золото · t6 мифрил ·
 * t7 рунит · t8 адамантит. Медный слиток и серебро — новые для игры.
 */
export const BARS: CatalogItem[] = [
  { id: 'bar_copper', name: 'Медный слиток', description: 'Чистая медь, расплавленная в ровный брусок. Основа сплавов.', category: 'bar', tier: 1, sellValue: 8, canSell: true, stackable: true, iconPath: 'materials/metals/ingot_t01', icon: '🟧' },
  { id: 'bar_bronze', name: 'Бронзовый слиток', description: 'Сплав меди и олова. Первый прочный металл в руках кузнеца.', category: 'bar', tier: 2, sellValue: 20, canSell: true, stackable: true, iconPath: 'materials/metals/ingot_t02', icon: '🟫' },
  { id: 'bar_iron', name: 'Железный слиток', description: 'Надёжное железо — рабочий металл простых воинов.', category: 'bar', tier: 3, sellValue: 60, canSell: true, stackable: true, iconPath: 'materials/metals/ingot_t03', icon: '⬜' },
  { id: 'bar_steel', name: 'Стальной слиток', description: 'Железо, закалённое углём. Острее и крепче простого железа.', category: 'bar', tier: 4, sellValue: 120, canSell: true, stackable: true, iconPath: 'materials/metals/ingot_t04', icon: '🔘' },
  { id: 'bar_gold', name: 'Золотой слиток', description: 'Чистое золото. Богатство и основа роскошных украшений.', category: 'bar', tier: 5, sellValue: 200, canSell: true, stackable: true, iconPath: 'materials/metals/ingot_t05', icon: '🟨' },
  { id: 'bar_mithril', name: 'Мифриловый слиток', description: 'Лёгкий синий металл эльфийских мастеров. Ценится на вес золота.', category: 'bar', tier: 6, sellValue: 320, canSell: true, stackable: true, iconPath: 'materials/metals/ingot_t06', icon: '🔵' },
  { id: 'bar_runite', name: 'Рунитовый слиток', description: 'Голубой металл, кующий легендарное оружие. Очень редок.', category: 'bar', tier: 7, sellValue: 1000, canSell: true, stackable: true, iconPath: 'materials/metals/ingot_t07', icon: '🔵' },
  { id: 'bar_adamantite', name: 'Адамантитовый слиток', description: 'Зеленоватый слиток почти несокрушимого металла.', category: 'bar', tier: 8, sellValue: 530, canSell: true, stackable: true, iconPath: 'materials/metals/ingot_t08', icon: '💚' },
];
