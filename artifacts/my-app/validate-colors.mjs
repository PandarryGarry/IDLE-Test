/**
 * Страж цветов (аудит, шаг 12): «шестнадцатеричный цвет вне темы = ошибка».
 *
 * Запуск из artifacts/my-app:
 *   pnpm validate:colors        (или node validate-colors.mjs)
 *
 * Закон (src/styles/THEME_GUIDE.md): значения цветов живут ТОЛЬКО в
 * src/index.css (:root), в коде — var(--роль) через карту src/styles/tokens.ts.
 *
 * Как чинить нарушение: добавить переменную в :root index.css (секция канона),
 * строку в tokens.ts (var(--имя)), использовать роль в коде. Добавлять новые
 * значения в LEGACY ниже ЗАПРЕЩЕНО — список только сокращается по мере
 * миграции легаси-файлов на токены (запас зафиксирован 2026-09-11).
 *
 * Проверяет:
 *   - ни одного hex-литерала вне src/index.css, кроме листка запаса LEGACY;
 *   - листок подсказывает, что сократился (предупреждение, не ошибка).
 */
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve('src');
const THEME_HOME = path.join('src', 'index.css');

/**
 * Листок запаса: файл → разрешённые hex-значения (нижний регистр).
 * Точная инвентаризация 2026-09-11 (шаг 12): значения легаси-хрома,
 * админских листов и пары данных (changelog) — переезжают в тему отдельными
 * визуальными причёсками, не стражей. Только СОКРАЩАТЬ. Расширять = нарушение.
 */
const LEGACY = new Map(Object.entries({
  'features/system/DashboardPage.tsx': ['#1e0c04','#1e0e04','#2a1005','#2a1406','#2a1a06','#2e1608','#3a2808','#3d1e08','#3d2008','#4a2808','#5a3010','#5a3818','#7a5028','#7a5820','#8b6030','#a07838','#c8880a','#c8a050','#f0d070','#f5d060','#fff8d0'],
  'components/Sidebar.tsx': ['#1a9e5a','#1e0e04','#2a1508','#2e1608','#2e1a06','#3d2005','#3f7d12','#4a0e06','#4a2c0a','#5a3010','#6b1808','#8a1c10','#9a6008','#a07838','#b52a1a','#c8880a','#d4860a','#e04040','#f0a820','#f5d880','#fff','#fff8ee'],
  'features/professions/SkillHeader.tsx': ['#1a0804','#1a0a04','#2a1005','#2e1608','#3d1e08','#3f6212','#4a2810','#5a3010','#5a3818','#7a5028','#84cc16','#8b5020','#a07030','#bef264','#c8a050','#d4a840','#e0c060','#f5d060','#fff8d0'],
  'components/TopNavBar.tsx': ['#1a6028','#2a0e33','#2a1005','#2a8a38','#3a1444','#3d1e08','#5a2a6a','#5a3010','#7a4818','#7aff90','#c8a050','#d9a6ff','#f0c030','#f0d070'],
  'features/admin/AdminCharactersPanel.tsx': ['#150c04','#1c1108','#241408','#241a05','#2a1c0e','#3a2b1a','#4a3520','#6b5a3d','#7a5610','#8a6b42','#c2a374','#f0c030','#f5ead0'],
  'features/admin/AdminItemEditor.tsx': ['#1a1207','#231302','#3a2b1a','#5a3408','#8a5a10','#b97710','#d4a017','#e0a32e'],
  'features/inventory/InventoryPage.tsx': ['#1a1108','#1c1108','#2a1e0e','#3a2b1a','#3d2e1e','#d97706','#f59e0b'],
  'features/combat/CombatPage.tsx': ['#8b5020','#c8a050','#f0d070','#f5e0b0','#ff8060','#ff9070','#ffb090'],
  'features/admin/AdminProfessionsPanel.tsx': ['#3a2b1a'],
  'data/changelog.ts': ['#4ade80','#60a0ff','#e060ff','#f0c030','#ff8060'],
  'features/admin/AdminSettingsPanel.tsx': ['#3a2b1a'],
  'components/art/artEngine.ts': ['#060504','#fff'],
}));

const SCAN_EXT = new Set(['.ts', '.tsx', '.css']);
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (SCAN_EXT.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

const errors = [];
const notes = [];
let stockCount = 0;

for (const file of walk(SRC)) {
  const rel = path.relative('.', file).split(path.sep).join('/');
  if (rel === THEME_HOME.split(path.sep).join('/')) continue;
  if (rel.endsWith('.test.ts')) continue;

  const text = fs.readFileSync(file, 'utf8');
  const hits = [...text.matchAll(HEX_RE)];
  if (!hits.length) continue;

  const allowed = new Set(LEGACY.get(rel) ?? []);
  const fileRel = rel.replace(/^src\//, '');
  const fileAllowed = new Set(LEGACY.get(fileRel) ?? []);
  const used = new Set();

  for (const hit of hits) {
    const value = hit[0].toLowerCase();
    if (allowed.has(value)) { used.add(value); stockCount++; continue; }
    if (fileAllowed.has(value)) { used.add(value); stockCount++; continue; }
    // строка нарушения для отчёта
    const lineNo = text.slice(0, hit.index).split('\n').length;
    errors.push(`${rel}:${lineNo} — ${hit[0]} вне темы (цвет только через токен: :root в index.css → строка в tokens.ts, гайд src/styles/THEME_GUIDE.md)`);
  }

  // Листок должен сокращаться: подсказываем, какие строки уже мертвы.
  const granted = new Set([...allowed, ...fileAllowed]);
  if (granted.size) {
    const dead = [...granted].filter(v => !used.has(v));
    for (const v of dead) notes.push(`${rel}: значение ${v} из листка больше не встречается — убрать строку из validate-colors.mjs`);
  }
}

// Файлы, вышедшие на чистую воду: весь листок просрочен.
for (const [rel, values] of LEGACY) {
  const full = path.join('src', rel);
  if (!fs.existsSync(full)) {
    notes.push(`${rel}: файл не найден — убрать запись из листка`);
    continue;
  }
  const text = fs.readFileSync(full, 'utf8');
  const anyUsed = values.some(v => text.toLowerCase().includes(v));
  if (!anyUsed) notes.push(`${rel}: файл чист — всю запись убрать из листка`);
}

console.log(`Страж цветов: запас легаси ${stockCount} лиц в ${LEGACY.size} файлах, новых нарушений: ${errors.length}.`);
for (const e of errors) console.error(`ОШИБКА  ${e}`);
for (const n of notes) console.warn(`подсказка: ${n}`);

if (errors.length) {
  console.error('СТРАЖ ОСТАНОВИЛ СБОРКУ: шестнадцатеричный цвет вне темы.');
  process.exit(1);
}
console.log('Страж спокоен: вся палитра по теме.');
