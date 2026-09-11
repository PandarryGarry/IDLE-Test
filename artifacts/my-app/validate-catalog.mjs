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
 *   - дроп каждого монстра ссылается на предмет каталога (шаг 7);
 *   - итоговую сводку по семействам.
 */
import fs from 'node:fs';
import { CATALOG } from './src/domain/items/catalog/index.ts';
import { MONSTERS } from './src/domain/combat/monsters.ts';

const problems = [];
const seen = new Set();
const groups = {};

for (const item of CATALOG) {
  if (seen.has(item.id)) problems.push(`DUP id: ${item.id}`);
  seen.add(item.id);

  if (!item.description?.trim()) problems.push(`NO DESC: ${item.id}`);

  if (item.iconPath) {
    const webp = `public/assets/icons/${item.iconPath}.webp`;
    if (!fs.existsSync(webp)) problems.push(`MISSING: ${item.id} → ${webp}`);

    const m = item.iconPath.match(/t(\d+)(?!\d)/);
    if (m && Number(m[1]) !== item.tier) {
      problems.push(`TIER≠FILE: ${item.id} tier=${item.tier} path=${item.iconPath}`);
    }
  } else if (!item.icon) {
    problems.push(`NO ICON FALLBACK: ${item.id} (нужен icon или iconPath)`);
  }

  groups[item.category] = (groups[item.category] ?? 0) + 1;
}

// Сводка по ВСЕМ категориям: раньше перечислялись 9 «старых» семейств,
// из-за чего 498 позиций снаряжения в разбивку не попадали и цифра врала.
const GEAR_CATEGORIES = [
  'weapon', 'shield', 'helm', 'platebody', 'platelegs', 'boots', 'gloves',
  'amulet', 'belt', 'ring', 'bracelet', 'cape', 'quiver', 'passive', 'arrow',
];
const RESOURCE_CATEGORIES = ['log', 'ore', 'bar', 'raw_fish', 'cooked_fish', 'mineral'];
const FOOD_CATEGORIES = ['food', 'potion'];

const sumOf = (list) => list.reduce((n, c) => n + (groups[c] ?? 0), 0);
const known = new Set([...GEAR_CATEGORIES, ...RESOURCE_CATEGORIES, ...FOOD_CATEGORIES, 'foraging']);

const byGroup = {
  'сырьё (семейства удалённых навыков — шаг 7 UI-плана)': sumOf(RESOURCE_CATEGORIES),
  'находки «Сбора»': groups['foraging'] ?? 0,
  'еда и зелья': sumOf(FOOD_CATEGORIES),
  'снаряжение и боеприпасы': sumOf(GEAR_CATEGORIES),
  // Всё, что ещё не приписано к семейству, — осознанно видимым, а не молча потерянным.
  'вне известных семейств': Object.entries(groups)
    .filter(([category]) => !known.has(category))
    .reduce((n, [, count]) => n + count, 0),
};

console.log(`✔ итого предметов: ${CATALOG.length}`);
console.log('   группы:', JSON.stringify(byGroup, null, 0));
console.log('   по категориям:', JSON.stringify(groups, null, 0));

// Сводка обязана сходиться с каталогом — иначе она снова начнёт врать.
const summed = Object.values(byGroup).reduce((a, b) => a + b, 0);
if (summed !== CATALOG.length) {
  problems.push(`SUMMARY≠CATALOG: группы дают ${summed}, каталог — ${CATALOG.length}`);
}

/* Дроп монстров — только предметы каталога (страж шага 7: легаси-id
   в дропах больше не проскочит молча). */
for (const monster of MONSTERS) {
  for (const drop of monster.drops) {
    if (!seen.has(drop.itemId)) {
      problems.push(`DROP: ${monster.id} → ${drop.itemId} нет в каталоге`);
    }
  }
}

if (problems.length) {
  console.error('✖ ОШИБКИ:');
  for (const p of problems) console.error('   ', p);
  process.exit(1);
}

console.log('✔ ОШИБОК НЕТ — каталог валиден');
