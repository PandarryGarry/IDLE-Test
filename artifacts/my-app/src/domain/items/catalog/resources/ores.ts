import type { CatalogItem } from '../types.ts';

/**
 * Руды — Горное дело. Батч 1: базовые тиры 1–8.
 * Тиры 9–12 (экзотика) НЕ вводим — нет дальних локаций.
 *
 * Лестница металлов (ПРЕДВАРИТЕЛЬНО, владелец смотрит в админ-каталоге):
 * t1 медь · t2 олово · t3 железо · t4 серебро · t5 золото · t6 мифрил ·
 * t7 рунит · t8 адамантит. Позиции рунит/адамантит — по цвету иконок, спорное.
 */
export const ORES: CatalogItem[] = [
  { id: 'ore_copper', name: 'Медная руда', description: 'Куски руды с медными прожилками. Первый металл, что берут в руки.', category: 'ore', tier: 1, sellValue: 5, canSell: true, stackable: true, iconPath: 'materials/metals/ore_t01', icon: '🟤' },
  { id: 'ore_tin', name: 'Оловянная руда', description: 'Мягкий светлый металл. С медью даёт прочную бронзу.', category: 'ore', tier: 2, sellValue: 5, canSell: true, stackable: true, iconPath: 'materials/metals/ore_t02', icon: '⚪' },
  { id: 'ore_iron', name: 'Железная руда', description: 'Тяжёлая руда с тёмным железом. Хлеб любого кузнеца.', category: 'ore', tier: 3, sellValue: 15, canSell: true, stackable: true, iconPath: 'materials/metals/ore_t03', icon: '🔩' },
  { id: 'ore_silver', name: 'Серебряная руда', description: 'Светлый благородный металл. Идёт на украшения и звонкую монету.', category: 'ore', tier: 4, sellValue: 30, canSell: true, stackable: true, iconPath: 'materials/metals/ore_t04', icon: '🥈' },
  { id: 'ore_gold', name: 'Золотая руда', description: 'Самородки с блеском благородного металла. Золото любят все.', category: 'ore', tier: 5, sellValue: 50, canSell: true, stackable: true, iconPath: 'materials/metals/ore_t05', icon: '🟡' },
  { id: 'ore_mithril', name: 'Мифриловая руда', description: 'Лёгкий металл с глубоким синим отливом. Куётся в лучшее оружие.', category: 'ore', tier: 6, sellValue: 80, canSell: true, stackable: true, iconPath: 'materials/metals/ore_t06', icon: '💙' },
  { id: 'ore_runite', name: 'Рунитовая руда', description: 'Редкий металл с холодным голубым свечением. Оружие из него не ржавеет.', category: 'ore', tier: 7, sellValue: 250, canSell: true, stackable: true, iconPath: 'materials/metals/ore_t07', icon: '🔵' },
  { id: 'ore_adamantite', name: 'Адамантитовая руда', description: 'Зеленоватый металл невероятной прочности. Кузнецы слагают о нём легенды.', category: 'ore', tier: 8, sellValue: 130, canSell: true, stackable: true, iconPath: 'materials/metals/ore_t08', icon: '💚' },
];
