import type { CatalogItem } from '../types.ts';

/**
 * Руды — Горное дело. Реальные названия материалов из ITEMS_CATALOG.md.
 * Картинки остаются существующими (ore_t01 … ore_t08) до генерации по каталогу.
 * Тиры 9–12 (экзотика) в батч 1 НЕ вводим — для них нет дальних локаций.
 *
 * Лестница: t1 медь · t2 бронза · t3 железо · t4 серебро · t5 золото ·
 * t6 воронёная сталь · t7 мифрил · t8 орихалк.
 */
export const ORES: CatalogItem[] = [
  { id: 'ore_copper', name: 'Руда · Медь', description: 'Куски руды с медными прожилками. Первый металл, что берут в руки.', category: 'ore', tier: 1, sellValue: 5, canSell: true, stackable: true, iconPath: 'materials/metals/ore_t01', icon: '🟤' },
  { id: 'ore_bronze', name: 'Руда · Бронза', description: 'Руда, дающая бронзу. Первый твёрдый сплав в руках кузнеца.', category: 'ore', tier: 2, sellValue: 5, canSell: true, stackable: true, iconPath: 'materials/metals/ore_t02', icon: '⚪' },
  { id: 'ore_iron', name: 'Руда · Железо', description: 'Тяжёлая руда с тёмным железом. Хлеб любого кузнеца.', category: 'ore', tier: 3, sellValue: 15, canSell: true, stackable: true, iconPath: 'materials/metals/ore_t03', icon: '🔩' },
  { id: 'ore_silver', name: 'Руда · Серебро', description: 'Светлый благородный металл. Идёт на украшения и звонкую монету.', category: 'ore', tier: 4, sellValue: 30, canSell: true, stackable: true, iconPath: 'materials/metals/ore_t04', icon: '🥈' },
  { id: 'ore_gold', name: 'Руда · Золото', description: 'Самородки с блеском благородного металла. Золото любят все.', category: 'ore', tier: 5, sellValue: 50, canSell: true, stackable: true, iconPath: 'materials/metals/ore_t05', icon: '🟡' },
  { id: 'ore_blacksteel', name: 'Руда · Воронёная сталь', description: 'Металл глубокого чёрного блеска. Легче и прочнее обычной стали.', category: 'ore', tier: 6, sellValue: 130, canSell: true, stackable: true, iconPath: 'materials/metals/ore_t06', icon: '🔩' },
  { id: 'ore_mithril', name: 'Руда · Мифрил', description: 'Лёгкий металл с глубоким синим отливом. Куётся в лучшее оружие.', category: 'ore', tier: 7, sellValue: 250, canSell: true, stackable: true, iconPath: 'materials/metals/ore_t07', icon: '💙' },
  { id: 'ore_orichalcum', name: 'Руда · Орихалк', description: 'Редкий золотисто-зелёный металл древних мастеров. Легенда кузнецов.', category: 'ore', tier: 8, sellValue: 400, canSell: true, stackable: true, iconPath: 'materials/metals/ore_t08', icon: '💚' },
];
