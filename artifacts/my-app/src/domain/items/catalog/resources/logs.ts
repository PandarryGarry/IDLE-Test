import type { CatalogItem } from '../types.ts';

/**
 * Брёвна — Лесорубство. Тиры 1–8 фармятся в базовых локациях.
 * Тиры 9–12 (экзотика) в батч 1 НЕ вводим — для них нет дальних локаций.
 * Тир = число в имени файла (log_t01 → tier 1).
 */
export const LOGS: CatalogItem[] = [
  { id: 'log_normal', name: 'Обычное бревно', description: 'Простое бревно из молодого дерева. Горит ровно и годится для первой растопки.', category: 'log', tier: 1, sellValue: 5, canSell: true, stackable: true, iconPath: 'materials/wood/log_t01', icon: '🪵' },
  { id: 'log_oak', name: 'Дубовое бревно', description: 'Крепкое бревно из старого дуба. Излюбленный материал плотников.', category: 'log', tier: 2, sellValue: 15, canSell: true, stackable: true, iconPath: 'materials/wood/log_t02', icon: '🪵' },
  { id: 'log_willow', name: 'Ивовое бревно', description: 'Лёгкое и гибкое бревно ивы. Ценится за податливость при обработке.', category: 'log', tier: 3, sellValue: 25, canSell: true, stackable: true, iconPath: 'materials/wood/log_t03', icon: '🪵' },
  { id: 'log_teak', name: 'Тиковое бревно', description: 'Плотная древесина тика с тёплым оттенком. Хороша и для стройки, и для костра.', category: 'log', tier: 4, sellValue: 40, canSell: true, stackable: true, iconPath: 'materials/wood/log_t04', icon: '🪵' },
  { id: 'log_maple', name: 'Кленовое бревно', description: 'Твёрдое бревно клёна. Уважают ремесленники за гладкую текстуру.', category: 'log', tier: 5, sellValue: 65, canSell: true, stackable: true, iconPath: 'materials/wood/log_t05', icon: '🪵' },
  { id: 'log_mahogany', name: 'Бревно красного дерева', description: 'Редкое красное дерево. Тяжёлое, красивое и очень дорогое.', category: 'log', tier: 6, sellValue: 90, canSell: true, stackable: true, iconPath: 'materials/wood/log_t06', icon: '🪵' },
  { id: 'log_magic', name: 'Магическое бревно', description: 'Древесина, пропитанная магией. Горит синим пламенем и отдаёт мощный жар.', category: 'log', tier: 7, sellValue: 200, canSell: true, stackable: true, iconPath: 'materials/wood/log_t07', icon: '✨' },
  { id: 'log_redwood', name: 'Бревно секвойи', description: 'Исполинское бревно древней секвойи. Мечта каждого лесоруба.', category: 'log', tier: 8, sellValue: 350, canSell: true, stackable: true, iconPath: 'materials/wood/log_t08', icon: '🪵' },
];
