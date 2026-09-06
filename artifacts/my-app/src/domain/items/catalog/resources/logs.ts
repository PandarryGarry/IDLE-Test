import type { CatalogItem } from '../types.ts';

/**
 * Брёвна — Лесорубство. Реальные названия материалов из ITEMS_CATALOG.md.
 * Картинки остаются существующими (log_t01 … log_t08) до генерации по каталогу.
 * Тиры 9–12 (экзотика) в батч 1 НЕ вводим — для них нет дальних локаций.
 */
export const LOGS: CatalogItem[] = [
  { id: 'log_oak', name: 'Бревно · Дуб', description: 'Простая и надёжная древесина дуба. Годится для растопки и плотницких работ.', category: 'log', tier: 1, sellValue: 5, canSell: true, stackable: true, iconPath: 'materials/wood/log_t01', icon: '🪵' },
  { id: 'log_birch', name: 'Бревно · Берёза', description: 'Светлая древесина берёзы. Лёгкая в обработке, звонко горит.', category: 'log', tier: 2, sellValue: 15, canSell: true, stackable: true, iconPath: 'materials/wood/log_t02', icon: '🪵' },
  { id: 'log_pine', name: 'Бревно · Сосна', description: 'Смолистая сосна. Сильно пахнет хвоей и хорошо разгорается.', category: 'log', tier: 3, sellValue: 25, canSell: true, stackable: true, iconPath: 'materials/wood/log_t03', icon: '🪵' },
  { id: 'log_yew', name: 'Бревно · Тис', description: 'Плотный тёмный тис. Ценится за тонкую текстуру и упругость.', category: 'log', tier: 4, sellValue: 40, canSell: true, stackable: true, iconPath: 'materials/wood/log_t04', icon: '🪵' },
  { id: 'log_maple', name: 'Бревно · Клён', description: 'Твёрдое кленовое бревно. Уважают ремесленники за гладкую текстуру.', category: 'log', tier: 5, sellValue: 65, canSell: true, stackable: true, iconPath: 'materials/wood/log_t05', icon: '🪵' },
  { id: 'log_ironwood', name: 'Бревно · Железное дерево', description: 'Древесина невероятной плотности. Почти не поддаётся топору.', category: 'log', tier: 6, sellValue: 90, canSell: true, stackable: true, iconPath: 'materials/wood/log_t06', icon: '🪵' },
  { id: 'log_elvenwood', name: 'Бревно · Эльфийское дерево', description: 'Лёгкая светящаяся древесина эльфийских лесов. Дар природы.', category: 'log', tier: 7, sellValue: 200, canSell: true, stackable: true, iconPath: 'materials/wood/log_t07', icon: '✨' },
  { id: 'log_ancient', name: 'Бревно · Древнее дерево', description: 'Обломок древней реликтовой древесины. Помнит времена до людей.', category: 'log', tier: 8, sellValue: 350, canSell: true, stackable: true, iconPath: 'materials/wood/log_t08', icon: '🪵' },
];
