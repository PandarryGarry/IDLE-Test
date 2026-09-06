/**
 * Валидатор каталога предметов (батч 1).
 *
 * Запуск из artifacts/my-app:
 *   node --experimental-strip-types validate-catalog.mjs
 *
 * Проверяет:
 *   - уникальность id;
 *   - непустое русское описание у каждой записи;
 *   - существование `.webp` для каждого `iconPath`;
 *   - совпадение `tier` с числом в имени файла (`t05` ↔ tier 5);
 *   - итоговую сводку по семействам.
 */
import fs from 'node:fs';
import { CATALOG } from './src/domain/items/catalog/index.ts';

const problems = [];
const seen = new Set();
const groups = {};

for (const item of CATALOG) {
  if (seen.has(item.id)) problems.push(`DUP id: ${item.id}`);
  seen.add(item.id);

  if (!item.description?.trim()) problems.push(`NO DESC: ${item.id}`);

  const webp = `public/assets/icons/${item.iconPath}.webp`;
  if (!fs.existsSync(webp)) problems.push(`MISSING: ${item.id} → ${webp}`);

  const m = item.iconPath.match(/t(\d+)(?!\d)/);
  if (m && Number(m[1]) !== item.tier) {
    problems.push(`TIER≠FILE: ${item.id} tier=${item.tier} path=${item.iconPath}`);
  }

  groups[item.category] = (groups[item.category] ?? 0) + 1;
}

const byFamily = {
  logs: groups['log'] ?? 0,
  ores: groups['ore'] ?? 0,
  bars: groups['bar'] ?? 0,
  rawFish: groups['raw_fish'] ?? 0,
  cookedFish: groups['cooked_fish'] ?? 0,
  minerals: groups['mineral'] ?? 0,
  foraging: groups['foraging'] ?? 0,
};

console.log(`✔ итого предметов: ${CATALOG.length}`);
console.log('   состав:', JSON.stringify(byFamily));

if (problems.length) {
  console.error('✖ ОШИБКИ:');
  for (const p of problems) console.error('   ', p);
  process.exit(1);
}

console.log('✔ ОШИБОК НЕТ — каталог валиден');
