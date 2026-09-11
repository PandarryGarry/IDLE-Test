import type { CatalogItem } from '../types.ts';

/**
 * Слитки — металлическое сырьё. Названия зафиксированы здесь (исторический каталог имён удалён в сессии 31).
 * Картинки остаются существующими (ingot_t01 … ingot_t08) до генерации по каталогу.
 * Тиры 9–12 (экзотика) в батч 1 НЕ вводим — для них нет дальних локаций.
 *
 * Лестница: t1 медь · t2 бронза · t3 железо · t4 серебро · t5 золото ·
 * t6 воронёная сталь · t7 мифрил · t8 орихалк.
 */
export const BARS: CatalogItem[] = [
  { id: 'bar_copper', name: 'Слиток · Медь', description: 'Чистая медь, расплавленная в ровный брусок. Основа сплавов.', category: 'bar', tier: 1, sellValue: 8, canSell: true, stackable: true, iconPath: 'materials/metals/ingot_t01', icon: '🟧' },
  { id: 'bar_bronze', name: 'Слиток · Бронза', description: 'Сплав меди с оловом. Первый прочный металл в руках кузнеца.', category: 'bar', tier: 2, sellValue: 20, canSell: true, stackable: true, iconPath: 'materials/metals/ingot_t02', icon: '🟫' },
  { id: 'bar_iron', name: 'Слиток · Железо', description: 'Надёжное железо — рабочий металл простых воинов.', category: 'bar', tier: 3, sellValue: 60, canSell: true, stackable: true, iconPath: 'materials/metals/ingot_t03', icon: '⬜' },
  { id: 'bar_silver', name: 'Слиток · Серебро', description: 'Благородное серебро. Идёт на украшения и чеканную монету.', category: 'bar', tier: 4, sellValue: 120, canSell: true, stackable: true, iconPath: 'materials/metals/ingot_t04', icon: '🔘' },
  { id: 'bar_gold', name: 'Слиток · Золото', description: 'Чистое золото. Богатство и основа роскошных украшений.', category: 'bar', tier: 5, sellValue: 200, canSell: true, stackable: true, iconPath: 'materials/metals/ingot_t05', icon: '🟨' },
  { id: 'bar_blacksteel', name: 'Слиток · Воронёная сталь', description: 'Тёмный воронёный слиток. Легче и острее обычной стали.', category: 'bar', tier: 6, sellValue: 530, canSell: true, stackable: true, iconPath: 'materials/metals/ingot_t06', icon: '🔵' },
  { id: 'bar_mithril', name: 'Слиток · Мифрил', description: 'Лёгкий синий металл эльфийских мастеров. Ценится на вес золота.', category: 'bar', tier: 7, sellValue: 1000, canSell: true, stackable: true, iconPath: 'materials/metals/ingot_t07', icon: '🔵' },
  { id: 'bar_orichalcum', name: 'Слиток · Орихалк', description: 'Золотисто-зелёный слиток древней эпохи. Почти невозможен в обработке.', category: 'bar', tier: 8, sellValue: 1950, canSell: true, stackable: true, iconPath: 'materials/metals/ingot_t08', icon: '💚' },
];
