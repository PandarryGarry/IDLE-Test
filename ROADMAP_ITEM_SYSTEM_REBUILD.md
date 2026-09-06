# ДОРОГА: пересборка «Системы предметов (батч 1) + механика „Сбор“»

> Назначение: этот файл — **полная build-спека** для нового чата. Он воспроизводит
> работу, которая была сделана в запечатанном сешне (коммиты `97aff99`, `4464be6`
> на ветке `arena/01a075e0-idle-test`), но **не была запушена** на GitHub.
> `ITEM_SYSTEM_PLAN.md` — контракт/план (владелец его уже видел); здесь — только
> конкретика: точные файлы, точный код, точный ревайринг.
>
> **Стартовая точка:** ветка от `main` (= `fb2bea7`), чистый clone. Никакого
> «поспешного маппинга тиров» (PR #14) — его откатили. Начинаем с нуля по плану.

---

## 0. Правила этого захода (напомню, что НЕ делать)

- Greenfield: старые id предметов не сохраняем, alias-слоёв не делаем.
- Тир — данное поле 1–12; источник истины — число в имени файла (`t05` → tier 5).
- Весь контент предметов — по-русски. Английский — позже через i18n.
- Картинки — только WebP через `iconUrl()`. `.png` в `<img>` запрещён.
- Каталог — в репо; таблиц БД не создаём.
- Вывеска (`lib/bootPreload.ts`) каталог НЕ грузит — не трогать.
- Тики XP, бой, новая схема БД, «данные-как-контент»/админка — НЕ в этом заходе.
- Одна задача за раз; если неясно — спросить владельца.

---

## 1. Порядок работы (чек-лист)

1. Модель: `src/data/types.ts` (шаг 2).
2. Каталог: новые файлы `src/domain/items/catalog/**` (шаг 3).
3. Точка входа: `src/domain/items/index.ts` + похудевший `items.ts` (шаг 4).
4. Перевести 13 импортёров на `@/domain/items` (шаг 5).
5. Иконки/тир: `itemIcons.ts` + `UniversalInfoModal.tsx` (шаг 6).
6. Ревайринг старых механик на новые id (шаг 7, таблица маппинга).
7. Механика «Сбор»: данные + обработчики + UI + навигация + i18n (шаг 8).
8. Проверки: typecheck / test / build / валидатор (шаг 9).

---

## 2. `src/data/types.ts` — точные правки

### 2.1. `SkillId` — добавить `'foraging'`

Было:
```ts
| 'woodcutting' | 'fishing' | 'firemaking' | 'cooking'
```
Стало:
```ts
| 'woodcutting' | 'foraging' | 'fishing' | 'firemaking' | 'cooking'
```

### 2.2. `GATHERING_SKILLS` — добавить `'foraging'`

Стало:
```ts
export const GATHERING_SKILLS: SkillId[] = ['woodcutting', 'foraging', 'fishing', 'mining'];
```

### 2.3. `ItemCategory` — добавить `'mineral' | 'foraging'` (в конец union)

```ts
| 'mineral' | 'foraging';
```

### 2.4. `ItemTier` и поля `Item`

Добавить тип:
```ts
export type ItemTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
```
В интерфейс `Item` добавить (после `icon?: string;`):
```ts
  /**
   * Тир — качество/«уровень» предмета, 1..12 (данное поле, не вычисление).
   * У легаси-предметов отсутствует (тир определяется по id) — по мере переноса
   * семейств в каталог тир становится обязательным (`CatalogItem`).
   */
  tier?: ItemTier;
  /**
   * Иконка предмета в `public/assets/icons` — путь БЕЗ расширения и без
   * `assets/icons` (например `weapons/sword_1h/t02`). В `<img>` отдаётся
   * только через `iconUrl()`, никогда сырым `.png`.
   */
  iconPath?: string;
```

### 2.5. Новые интерфейсы «Сбора» — сразу после `FishingSpot`

```ts
/** Одна находка в «Сборе»: предмет + вес + количество. */
export interface ForagingDrop {
  itemId: string;
  weight: number; // относительный вес в таблице находок
  quantity: [number, number]; // [min, max] за одно действие
}

/** Действие «Сбора»: персонаж прочёсывает участок и находит случайный лут. */
export interface ForagingAction extends SkillAction {
  drops: ForagingDrop[];
  /** Представительный предмет для карточки действия и оффлайн-добычи. */
  dropItemId: string;
}
```

---

## 3. Новые файлы каталога (`src/domain/items/catalog/`)

### 3.1. `types.ts`

```ts
import type { Item, ItemTier } from '../../../data/types.ts';

/**
 * Предмет каталога — полная запись с обязательными тиром и описанием.
 * `iconPath` — путь в `public/assets/icons` БЕЗ расширения; в `<img>`
 * отдаётся только через `iconUrl()` (см. `scripts/assets/README.md`).
 */
export interface CatalogItem extends Item {
  tier: ItemTier;
  description: string;
}
```

### 3.2. `resources/logs.ts` — 8 брёвен (t1–t8)

```ts
import type { CatalogItem } from '../types.ts';

/**
 * Брёвна — Лесорубство. Тиры 1–8 фармятся в базовых локациях,
 * 9–12 (экзотика) — дальние локации, появятся отдельным батчем.
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
```

### 3.3. `resources/ores.ts` — 12 руд (t1–t12)

```ts
import type { CatalogItem } from '../types.ts';

/**
 * Руды — Горное дело (id по §5: ore_copper … ore_dragon, экзотика — ore_t10…12).
 * Лестница металлов (§4, ПРЕДВАРИТЕЛЬНО): t01 медь · t02 олово · t03 железо ·
 * t04 серебро · t05 золото · t06 мифрил · t07 рунит · t08 адамантит · t09 дракон ·
 * t10–12 экзотика. ОТКРЫТО: порядок рунит/адамантит (по цвету), названия экзотики.
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
  { id: 'ore_dragon', name: 'Драконья руда', description: 'Руда, закалённая драконьим пламенем. Идёт на экипировку героев.', category: 'ore', tier: 9, sellValue: 400, canSell: true, stackable: true, iconPath: 'materials/metals/ore_t09', icon: '🔴' },
  { id: 'ore_t10', name: 'Экзотическая руда I', description: 'Редкая руда из дальних земель с пурпурным отливом. (Название уточняется.)', category: 'ore', tier: 10, sellValue: 600, canSell: true, stackable: true, iconPath: 'materials/metals/ore_t10', icon: '🟣' },
  { id: 'ore_t11', name: 'Экзотическая руда II', description: 'Загадочная руда глубокого фиолетового тона. (Название уточняется.)', category: 'ore', tier: 11, sellValue: 900, canSell: true, stackable: true, iconPath: 'materials/metals/ore_t11', icon: '🟪' },
  { id: 'ore_t12', name: 'Экзотическая руда III', description: 'Руда цвета запёкшейся крови — древнейшая и ценнейшая. (Название уточняется.)', category: 'ore', tier: 12, sellValue: 1300, canSell: true, stackable: true, iconPath: 'materials/metals/ore_t12', icon: '🩸' },
];
```

### 3.4. `resources/bars.ts` — 12 слитков (t1–t12)

```ts
import type { CatalogItem } from '../types.ts';

/**
 * Слитки — Кузнечное дело (id по §5: bar_copper … bar_dragon, экзотика — bar_t10…12).
 * t01 медь · t02 бронза · t03 железо · t04 сталь · t05 золото · t06 мифрил ·
 * t07 рунит · t08 адамантит · t09 дракон · t10–12 экзотика.
 * ОТКРЫТО: bar_copper (t1) в старой игре не было (медь+олово → бронза).
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
  { id: 'bar_dragon', name: 'Драконий слиток', description: 'Слиток, закалённый в пламени дракона. Высшая проба кузнеца.', category: 'bar', tier: 9, sellValue: 1950, canSell: true, stackable: true, iconPath: 'materials/metals/ingot_t09', icon: '🔴' },
  { id: 'bar_t10', name: 'Экзотический слиток I', description: 'Пурпурный металл из дальних земель. (Название уточняется.)', category: 'bar', tier: 10, sellValue: 2800, canSell: true, stackable: true, iconPath: 'materials/metals/ingot_t10', icon: '🟣' },
  { id: 'bar_t11', name: 'Экзотический слиток II', description: 'Глубокий фиолетовый металл невероятной твёрдости. (Название уточняется.)', category: 'bar', tier: 11, sellValue: 4200, canSell: true, stackable: true, iconPath: 'materials/metals/ingot_t11', icon: '🟪' },
  { id: 'bar_t12', name: 'Экзотический слиток III', description: 'Металл цвета запёкшейся крови — венец кузнечного дела. (Название уточняется.)', category: 'bar', tier: 12, sellValue: 6000, canSell: true, stackable: true, iconPath: 'materials/metals/ingot_t12', icon: '🩸' },
];
```

### 3.5. `resources/fish.ts` — 12 сырых + 12 готовых

```ts
import type { CatalogItem } from '../types.ts';

/**
 * Рыба — Рыбалка + Кулинария.
 * Тир = число в имени файла (fish_01 → tier 1 … fish_12 → tier 12).
 * Резерв fish_13..25 — будущие виды (в каталог не вводим).
 */
const RAW_SPECIES = [
  { n: 1,  id: 'shrimp',    ru: 'креветка',   raw: 3,   cooked: 5,    heal: 3  },
  { n: 2,  id: 'sardine',   ru: 'сардина',    raw: 7,   cooked: 10,   heal: 4  },
  { n: 3,  id: 'herring',   ru: 'сельдь',     raw: 12,  cooked: 15,   heal: 5  },
  { n: 4,  id: 'mackerel',  ru: 'скумбрия',   raw: 18,  cooked: 22,   heal: 7  },
  { n: 5,  id: 'trout',     ru: 'форель',     raw: 30,  cooked: 40,   heal: 9  },
  { n: 6,  id: 'salmon',    ru: 'лосось',     raw: 45,  cooked: 60,   heal: 12 },
  { n: 7,  id: 'lobster',   ru: 'омар',       raw: 80,  cooked: 100,  heal: 15 },
  { n: 8,  id: 'swordfish', ru: 'рыба-меч',   raw: 130, cooked: 170,  heal: 20 },
  { n: 9,  id: 'crab',      ru: 'краб',       raw: 160, cooked: 200,  heal: 22 },
  { n: 10, id: 'shark',     ru: 'акула',      raw: 210, cooked: 280,  heal: 25 },
  { n: 11, id: 'manta',     ru: 'скат-манта', raw: 500, cooked: 650,  heal: 30 },
  { n: 12, id: 'whale',     ru: 'кит',        raw: 800, cooked: 1000, heal: 35 },
] as const;

const raw = (s: (typeof RAW_SPECIES)[number]): CatalogItem => ({
  id: `fish_${s.id}_raw`,
  name: `Сырая ${s.ru}`,
  description: `Свежий улов — ${s.ru}. Съедобна только после готовки.`,
  category: 'raw_fish', tier: s.n as CatalogItem['tier'],
  sellValue: s.raw, canSell: true, stackable: true,
  iconPath: `materials/food/fish/fish_${String(s.n).padStart(2, '0')}_raw`,
  icon: '🐟',
});

const cooked = (s: (typeof RAW_SPECIES)[number]): CatalogItem => ({
  id: `fish_${s.id}_cooked`,
  name: s.ru.charAt(0).toUpperCase() + s.ru.slice(1),
  description: `Приготовленная ${s.ru}. Восстанавливает здоровье (+${s.heal}).`,
  category: 'cooked_fish', tier: s.n as CatalogItem['tier'],
  sellValue: s.cooked, canSell: true, stackable: true,
  healAmount: s.heal,
  iconPath: `materials/food/fish/fish_${String(s.n).padStart(2, '0')}_cooked`,
  icon: '🍽️',
});

export const RAW_FISH: CatalogItem[] = RAW_SPECIES.map(raw);
export const COOKED_FISH: CatalogItem[] = RAW_SPECIES.map(cooked);
export const FISH: CatalogItem[] = [...RAW_FISH, ...COOKED_FISH];
```

### 3.6. `resources/minerals.ts`

```ts
import type { CatalogItem } from '../types.ts';

/**
 * Минералы — камень и уголь (id по §5: `coal`, `stone`).
 * Уголь фармится в горном деле, камень — в «Сборе».
 */
export const MINERALS: CatalogItem[] = [
  { id: 'coal', name: 'Уголь', description: 'Каменный уголь. Горит жарко и долго — кузнецу нужен для стали.', category: 'mineral', tier: 1, sellValue: 25, canSell: true, stackable: true, iconPath: 'materials/minerals/coal_t01', icon: '🖤' },
  { id: 'stone', name: 'Камень', description: 'Обычный булыжник, поднятый с земли. Пригодится в строительстве и ремесле.', category: 'mineral', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/minerals/stone', icon: '🪨' },
];
```

### 3.7. `foraging/wood.ts` — ветки/палки/шишки/листья (12 шт., все tier 1)

```ts
import type { CatalogItem } from '../types.ts';

/**
 * «Сбор» — деревянная мелочь с земли. Число в id — вариант вида (v01..vNN),
 * НЕ тир: всё это базовый сбор, tier 1.
 */
export const FORAGE_WOOD: CatalogItem[] = [
  { id: 'branch_01', name: 'Ветка', description: 'Тонкая ветка, подобранная на дороге. Годится для розжига и поделок.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/branch_v01', icon: '🌿' },
  { id: 'branch_02', name: 'Толстая ветка', description: 'Крепкая ветка потолще. Сломать руками уже непросто.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/branch_v02', icon: '🌿' },
  { id: 'branch_03', name: 'Сухая ветка', description: 'Высохшая ветка — отличная растопка для костра.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/branch_v03', icon: '🌿' },
  { id: 'stick_01', name: 'Палка', description: 'Ровная палка, найденная под ногами.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/stick_v01', icon: '🪵' },
  { id: 'stick_02', name: 'Длинная палка', description: 'Длинная и прямая — будущее древко или опора.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/stick_v02', icon: '🪵' },
  { id: 'stick_03', name: 'Крепкая палка', description: 'Плотная палка, не гнётся и не трескается.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/stick_v03', icon: '🪵' },
  { id: 'stick_04', name: 'Обточенная палка', description: 'Палка с гладким концом — будто кто-то уже начал её обрабатывать.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/stick_v04', icon: '🪵' },
  { id: 'cone_01', name: 'Шишка', description: 'Обычная еловая шишка. Хорошая растопка и материал для поделок.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/cone_v01', icon: '🌲' },
  { id: 'cone_02', name: 'Большая шишка', description: 'Крупная шишка с тяжёлыми чешуйками.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/cone_v02', icon: '🌲' },
  { id: 'leaf_01', name: 'Лист', description: 'Зелёный лист с дерева. Сгодится для трав и обёртки.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/leaf_v01', icon: '🍃' },
  { id: 'leaf_02', name: 'Сухой лист', description: 'Шуршащий сухой лист — первая помощь при розжиге.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/leaf_v02', icon: '🍂' },
  { id: 'leaf_03', name: 'Крупный лист', description: 'Большой широкий лист. В него удобно заворачивать съестное.', category: 'foraging', tier: 1, sellValue: 1, canSell: true, stackable: true, iconPath: 'materials/wood/leaf_v03', icon: '🍃' },
];
```

### 3.8. `foraging/fungi.ts` — 10 грибов (raw, tier 1)

```ts
import type { CatalogItem } from '../types.ts';

/**
 * «Сбор» — грибы (сырые). Число в id — вид (shroom_01..10), НЕ тир: tier 1.
 * Названия — ПЛЕЙСХОЛДЕР для наглядности; поправить по картинкам при ревью.
 */
const SPECIES: [string, string][] = [
  ['боровик', 'Крепкий благородный гриб с толстой ножкой.'],
  ['лисичка', 'Рыжий гриб с волнистой шляпкой.'],
  ['опёнок', 'Мелкий гриб, растущий семьями на пнях.'],
  ['сыроежка', 'Хрупкий гриб с яркой шляпкой.'],
  ['моховик', 'Приземистый гриб, любящий мох и влагу.'],
  ['груздь', 'Плотный гриб, прячущийся в листве.'],
  ['рыжик', 'Оранжевый гриб с хвойным ароматом.'],
  ['шампиньон', 'Крепкий гриб с округлой шляпкой.'],
  ['сморчок', 'Сморщенный весенний гриб с необычной шляпкой.'],
  ['трюфель', 'Редкий подземный гриб, деликатес королей.'],
];

export const FORAGE_FUNGI: CatalogItem[] = SPECIES.map(([ru, desc], i) => ({
  id: `mushroom_${String(i + 1).padStart(2, '0')}`,
  name: `Сырой ${ru}`,
  description: `${desc} Пока не съедобен — нужна готовка.`,
  category: 'foraging', tier: 1, sellValue: 2, canSell: true, stackable: true,
  iconPath: `materials/food/mushrooms/shroom_${String(i + 1).padStart(2, '0')}_raw`,
  icon: '🍄',
}));
```

### 3.9. `foraging/bits.ts`

```ts
import type { CatalogItem } from '../types.ts';

/** «Сбор» — прочая мелочь с земли, не вошедшая в другие семьи. */
export const FORAGE_BITS: CatalogItem[] = [
  { id: 'quartz_sand', name: 'Кварцевый песок', description: 'Чистый песок, который плавится в стекло.', category: 'foraging', tier: 1, sellValue: 2, canSell: true, stackable: true, iconPath: 'materials/glass/quartz_sand', icon: '⏳' },
  { id: 'rope_fiber', name: 'Растительное волокно', description: 'Гибкое волокно для верёвок и плетения.', category: 'foraging', tier: 1, sellValue: 2, canSell: true, stackable: true, iconPath: 'materials/tailoring/rope_fiber', icon: '🧵' },
  { id: 'cord_sinew', name: 'Сухожилие', description: 'Крепкая жила. Незаменима для тетивы и прочных нитей.', category: 'foraging', tier: 1, sellValue: 3, canSell: true, stackable: true, iconPath: 'materials/tailoring/cord_sinew', icon: '🧵' },
];
```

### 3.10. `catalog/index.ts`

```ts
import type { Item } from '../../../data/types.ts';

import { LOGS } from './resources/logs.ts';
import { ORES } from './resources/ores.ts';
import { BARS } from './resources/bars.ts';
import { FISH } from './resources/fish.ts';
import { MINERALS } from './resources/minerals.ts';
import { FORAGE_WOOD } from './foraging/wood.ts';
import { FORAGE_FUNGI } from './foraging/fungi.ts';
import { FORAGE_BITS } from './foraging/bits.ts';

/** Полный каталог предметов (батч 1: ресурсы + «Сбор»). */
export const CATALOG: Item[] = [
  ...LOGS, ...ORES, ...BARS, ...FISH, ...MINERALS,
  ...FORAGE_WOOD, ...FORAGE_FUNGI, ...FORAGE_BITS,
];

/** Версия каталога — фундамент миграции на БД (§8 плана). */
export const CATALOG_VERSION = 1;
```

---

## 4. Точка входа и легаси

### 4.1. Новый `src/domain/items/index.ts`

```ts
import type { Item } from '../../data/types.ts';

import { CATALOG } from './catalog/index.ts';
import LEGACY_ITEMS from './items.ts';

/**
 * Единая точка доступа к предметам: сначала каталог (батч 1),
 * затем легаси-семейства, которые ещё не перенесены (оружие/броня/руны/…).
 * Замена источника (репозиторий → БД) затрагивает только этот модуль (§8).
 */
const CATALOG_BY_ID = new Map<string, Item>(CATALOG.map(i => [i.id, i]));

export function getItem(id: string): Item | undefined {
  return CATALOG_BY_ID.get(id) ?? LEGACY_ITEMS[id];
}

export function getAllItems(): Item[] {
  return [...CATALOG, ...Object.values(LEGACY_ITEMS)];
}
```

### 4.2. `src/domain/items/items.ts` — убрать перенесённое

- Заменить шапку на:
  ```ts
  import type { Item } from '../../data/types.ts';

  /**
   * ЛЕГАСИ-семейства, ещё не перенесённые в каталог (`catalog/`).
   * Ресурсы и рыба (батч 1) уже живут в каталоге — их id здесь НЕ хранятся.
   * Единая точка доступа — `getItem()` из `./index.ts` (каталог → легаси).
   */
  const ITEMS: Record<string, Item> = {
  ```
- **Удалить из `ITEMS` целиком секции:** `Logs` (8), `Ores` (9, включая `coal_ore`),
  `Bars` (8), `Raw Fish` (12), `Cooked Fish` (13, **кроме** `burnt_fish`).
- **Оставить:** `ash`, `burnt_fish` (перенести в отдельный блок «Byproducts» в начало),
  `bones`/`big_bones`/`dragon_bones`, все `runes`, все `gems`, все `herbs`,
  все `weapons`/`helms`/`platebodies`/`shields`, `mark_of_mastery`, `ancient_key`, `slayer_coin`.
- **Удалить в конце файла** функции `getItem` и `getAllItems` (они теперь в `index.ts`).
- Экспорт `export default ITEMS;` оставить.

---

## 5. Перевести 13 импортёров на `@/domain/items`

Везде заменить `from '@/domain/items/items'` → `from '@/domain/items'`:

1. `src/components/modals/UniversalInfoModal.tsx`
2. `src/features/bank/ItemIcon.tsx`
3. `src/features/bank/ItemInfoPopover.tsx`
4. `src/features/combat/CombatPage.tsx`
5. `src/features/hero/HeroHubPage.tsx`
6. `src/shared/icons/itemIcons.ts`
7. `src/shared/ui/kit/ActionCard.tsx`
8. `src/shared/ui/kit/SquircleSlot.tsx`
9. `src/store/combatStore.ts`
10. `src/store/gameStore.ts`
11. `src/store/inventoryStore.ts`
12. `src/store/playerStore.ts`

И внутри `src/domain/items/equipmentStats.ts` заменить
`from './items.ts'` → `from './index.ts'`.

---

## 6. Иконки и тир

### 6.1. `src/shared/icons/itemIcons.ts`

a) Импорт + `getItemVisual` — показывать картинку из данных:
```ts
import { getItem } from '@/domain/items';
import { iconUrl } from '@/lib/assetUrl';
import { EQUIP_SLOT_ICON } from '@/domain/attributes/attributeIcons';

export function getItemVisual(itemId: string): { type: 'image' | 'emoji'; value: string } {
  const item = getItem(itemId);

  // Картинка предмета — данные (`iconPath`), отдаётся только через iconUrl() (WebP).
  if (item?.iconPath) {
    return { type: 'image', value: iconUrl(item.iconPath) };
  }

  if (ITEM_IMAGE_URLS[itemId]) {
    return { type: 'image', value: ITEM_IMAGE_URLS[itemId] };
  }

  if (item?.equipSlot && EQUIP_SLOT_ICON[item.equipSlot]) {
    return { type: 'image', value: EQUIP_SLOT_ICON[item.equipSlot] };
  }
  // ... дальше без изменений (эмодзи-фоллбэки)
}
```

b) `RESOURCE_ICONS` / `CONSUMABLE_ICONS` — убрать старые id ресурсов/рыбы, оставить только легаси:
```ts
export const RESOURCE_ICONS: Record<string, string> = {
  sapphire: '💎', emerald: '💎', ruby: '💎', diamond: '💎', onyx: '💎',
};

export const CONSUMABLE_ICONS: Record<string, string> = {
  burnt_fish: '🔥',
  attack_potion: '🧪', strength_potion: '🧪', defence_potion: '🧪',
};
```

### 6.2. `src/components/modals/UniversalInfoModal.tsx`

a) `getItemTier` — тир из поля, эвристика только для легаси-экипа:
```ts
export function getItemTier(itemId: string, item?: Item): string {
  // Тир — данное поле каталога (1..12). Ниже — эвристика только для легаси
  // предметов без поля `tier` (исчезнет по мере переноса семейств в каталог).
  if (item?.tier) return `T${item.tier}`;
  const id = itemId.toLowerCase();
  // Легаси-металлы экипа (7 ступеней старой игры); рыба/дерево/руда — в каталоге.
  if (id.includes('dragon')) return 'T7';
  if (id.includes('runite')) return 'T6';
  if (id.includes('adamantite')) return 'T5';
  if (id.includes('mithril')) return 'T4';
  if (id.includes('steel')) return 'T3';
  if (id.includes('iron')) return 'T2';
  if (id.includes('bronze')) return 'T1';

  const val = item?.sellValue ?? 0;
  if (val >= 5000) return 'T7';
  if (val >= 1000) return 'T6';
  if (val >= 350) return 'T5';
  if (val >= 120) return 'T4';
  if (val >= 40) return 'T3';
  if (val >= 15) return 'T2';
  return 'T1';
}
```
(т.е. из списков условий выкинуть `redwood/whale/manta`, `magic_logs/shark`,
`mahogany/swordfish/crab`, `maple/lobster/gold_bar`, `willow/salmon/mackerel`,
`oak/trout/sardine`, `normal_logs/copper/tin/shrimp` — они теперь в каталоге с полем `tier`.)

b) В `CATEGORY_NAMES` добавить:
```ts
  mineral: 'Минерал',
  foraging: 'Сбор',
```

---

## 7. Ревайринг старых id (точная таблица old → new)

| old id | new id | Файлы |
|---|---|---|
| `normal_logs`…`redwood_logs` | `log_normal`…`log_redwood` | woodcutting.ts, firemaking.ts |
| `copper_ore` | `ore_copper` | mining.ts, smithing.ts, monsters.ts |
| `tin_ore` | `ore_tin` | mining.ts, smithing.ts |
| `iron_ore` | `ore_iron` | mining.ts, smithing.ts, monsters.ts |
| `coal_ore` | `coal` | mining.ts, smithing.ts, fishing.ts (JUNK_ITEMS), monsters.ts |
| `gold_ore` | `ore_gold` | mining.ts, smithing.ts |
| `mithril_ore` | `ore_mithril` | mining.ts, smithing.ts, monsters.ts |
| `adamantite_ore` | `ore_adamantite` | mining.ts, smithing.ts |
| `runite_ore` | `ore_runite` | mining.ts, smithing.ts |
| `dragonite_ore` | `ore_dragon` | mining.ts, smithing.ts |
| `bronze_bar` | `bar_bronze` | smithing.ts |
| `iron_bar` | `bar_iron` | smithing.ts |
| `steel_bar` | `bar_steel` | smithing.ts |
| `gold_bar` | `bar_gold` | smithing.ts |
| `mithril_bar` | `bar_mithril` | smithing.ts |
| `adamantite_bar` | `bar_adamantite` | smithing.ts |
| `runite_bar` | `bar_runite` | smithing.ts |
| `dragon_bar` | `bar_dragon` | smithing.ts, monsters.ts |
| `raw_shrimp` | `fish_shrimp_raw` | fishing.ts, cooking.ts |
| `raw_sardine` | `fish_sardine_raw` | fishing.ts, cooking.ts |
| `raw_herring` | `fish_herring_raw` | fishing.ts, cooking.ts |
| `raw_mackerel` | `fish_mackerel_raw` | fishing.ts, cooking.ts |
| `raw_trout` | `fish_trout_raw` | fishing.ts, cooking.ts |
| `raw_salmon` | `fish_salmon_raw` | fishing.ts, cooking.ts |
| `raw_lobster` | `fish_lobster_raw` | fishing.ts, cooking.ts |
| `raw_swordfish` | `fish_swordfish_raw` | fishing.ts, cooking.ts |
| `raw_crab` | `fish_crab_raw` | fishing.ts, cooking.ts |
| `raw_shark` | `fish_shark_raw` | fishing.ts, cooking.ts |
| `raw_manta_ray` | `fish_manta_raw` | fishing.ts, cooking.ts |
| `raw_whale` | `fish_whale_raw` | fishing.ts, cooking.ts |
| `shrimp` | `fish_shrimp_cooked` | cooking.ts |
| `sardine` | `fish_sardine_cooked` | cooking.ts |
| `herring` | `fish_herring_cooked` | cooking.ts |
| `mackerel` | `fish_mackerel_cooked` | cooking.ts |
| `trout` | `fish_trout_cooked` | cooking.ts |
| `salmon` | `fish_salmon_cooked` | cooking.ts |
| `lobster` | `fish_lobster_cooked` | cooking.ts |
| `swordfish` | `fish_swordfish_cooked` | cooking.ts |
| `cooked_crab` | `fish_crab_cooked` | cooking.ts |
| `shark` | `fish_shark_cooked` | cooking.ts |
| `manta_ray` | `fish_manta_cooked` | cooking.ts |
| `whale` | `fish_whale_cooked` | cooking.ts |
| `oak_logs` (в тесте) | `log_oak` | `src/domain/attributes/characterAttributes.test.ts` |

**ВНИМАНИЕ к cooking.ts:** заменять id ТОЧНО (строковые литералы в `rawItemId`/`cookedItemId`).
НЕ трогать id действий (`cook_shrimp`, `shrimp_spot`, `cook_manta_ray` и т.п.) —
это имена действий, не предметов. `burnt_fish` не менять (он в легаси).

---

## 8. Механика «Сбор»

### 8.1. Новый файл `src/domain/professions/foraging.ts` — **дословно**

```ts
import type { ForagingAction } from '../../data/types.ts';

/**
 * «Сбор» (foraging) — персонаж по пути прочёсывает участок земли
 * и подбирает мелкий лут: ветки, палки, шишки, листья, грибы, камень…
 * Все находки — тир 1; рейты/названия — черновые, владелец скорректирует.
 */
export const FORAGE_ACTIONS: ForagingAction[] = [
  {
    id: 'forage_trail', name: 'Осмотреть тропу',
    description: 'Обычная лесная тропа: ветки, палки и опавшие листья.',
    levelRequired: 1, xp: 5, masteryXp: 2, interval: 2200,
    dropItemId: 'branch_01',
    drops: [
      { itemId: 'branch_01', weight: 3, quantity: [1, 1] },
      { itemId: 'branch_02', weight: 2, quantity: [1, 1] },
      { itemId: 'branch_03', weight: 1, quantity: [1, 1] },
      { itemId: 'stick_01',  weight: 2, quantity: [1, 1] },
      { itemId: 'stick_02',  weight: 2, quantity: [1, 1] },
      { itemId: 'leaf_01',   weight: 3, quantity: [1, 2] },
      { itemId: 'leaf_02',   weight: 2, quantity: [1, 2] },
      { itemId: 'stone',     weight: 2, quantity: [1, 1] },
    ],
  },
  {
    id: 'forage_forest_floor', name: 'Лесная подстилка',
    description: 'Под старыми деревьями: шишки, крепкие палки и первые грибы.',
    levelRequired: 5, xp: 8, masteryXp: 2, interval: 2400,
    dropItemId: 'cone_01',
    drops: [
      { itemId: 'stick_03',     weight: 2, quantity: [1, 1] },
      { itemId: 'stick_04',     weight: 1, quantity: [1, 1] },
      { itemId: 'cone_01',      weight: 3, quantity: [1, 1] },
      { itemId: 'leaf_02',      weight: 2, quantity: [1, 2] },
      { itemId: 'leaf_03',      weight: 2, quantity: [1, 1] },
      { itemId: 'mushroom_01',  weight: 1, quantity: [1, 1] },
      { itemId: 'mushroom_02',  weight: 1, quantity: [1, 1] },
      { itemId: 'mushroom_03',  weight: 1, quantity: [1, 1] },
    ],
  },
  {
    id: 'forage_mushrooms', name: 'Грибная поляна',
    description: 'Влажная поляна, богатая грибами.',
    levelRequired: 10, xp: 12, masteryXp: 3, interval: 2600,
    dropItemId: 'mushroom_01',
    drops: [
      { itemId: 'mushroom_01', weight: 4, quantity: [1, 1] },
      { itemId: 'mushroom_02', weight: 3, quantity: [1, 1] },
      { itemId: 'mushroom_03', weight: 3, quantity: [1, 1] },
      { itemId: 'mushroom_04', weight: 2, quantity: [1, 1] },
      { itemId: 'mushroom_05', weight: 2, quantity: [1, 1] },
    ],
  },
  {
    id: 'forage_riverbank', name: 'Берег реки',
    description: 'Галька, песок и выброшенные водой волокна.',
    levelRequired: 15, xp: 14, masteryXp: 3, interval: 2600,
    dropItemId: 'stone',
    drops: [
      { itemId: 'stone',        weight: 3, quantity: [1, 2] },
      { itemId: 'quartz_sand',  weight: 2, quantity: [1, 2] },
      { itemId: 'rope_fiber',   weight: 2, quantity: [1, 1] },
      { itemId: 'cord_sinew',   weight: 1, quantity: [1, 1] },
    ],
  },
  {
    id: 'forage_deepwood', name: 'Глухая чаща',
    description: 'Дикая чаща с редкими грибами и крепкими палками.',
    levelRequired: 25, xp: 20, masteryXp: 4, interval: 3000,
    dropItemId: 'cone_02',
    drops: [
      { itemId: 'cone_02',      weight: 2, quantity: [1, 1] },
      { itemId: 'stick_04',     weight: 2, quantity: [1, 1] },
      { itemId: 'mushroom_06',  weight: 2, quantity: [1, 1] },
      { itemId: 'mushroom_07',  weight: 2, quantity: [1, 1] },
      { itemId: 'mushroom_08',  weight: 2, quantity: [1, 1] },
      { itemId: 'mushroom_09',  weight: 2, quantity: [1, 1] },
      { itemId: 'mushroom_10',  weight: 1, quantity: [1, 1] },
      { itemId: 'cord_sinew',   weight: 1, quantity: [1, 1] },
    ],
  },
];

export const FORAGING_MAP = Object.fromEntries(FORAGE_ACTIONS.map(a => [a.id, a]));
```

### 8.2. `src/core/skillRegistry.ts`

a) Импорт: добавить `ForagingAction` в type-импорт и
```ts
import { FORAGING_MAP } from '../domain/professions/foraging.ts';
```

b) Добавить helper (после интерфейса `SkillHandler`):
```ts
/** Взвешенный выбор одной находки из таблицы «Сбора». */
function pickForagingDrop(action: ForagingAction) {
  const total = action.drops.reduce((sum, d) => sum + d.weight, 0);
  let rng = Math.random() * total;
  for (const drop of action.drops) {
    rng -= drop.weight;
    if (rng <= 0) return drop;
  }
  return action.drops[action.drops.length - 1];
}
```

c) Добавить запись `foraging` в `skillRegistry` (сразу после `fishing`):
```ts
  foraging: {
    isGathering: true,
    process: (actionId) => {
      const action = FORAGING_MAP[actionId];
      if (!action) return null;
      const playerLevel = usePlayerStore.getState().getSkillLevel('foraging');
      if (playerLevel < action.levelRequired) return null;
      const drop = pickForagingDrop(action);
      const qty = randomRange(drop.quantity[0], drop.quantity[1]);
      return { items: [{ itemId: drop.itemId, quantity: qty }], xpGained: action.xp, masteryXpGained: action.masteryXp ?? 3 };
    },
    getInterval: (actionId) => FORAGING_MAP[actionId]?.interval ?? 2500,
    getXpPerAction: (actionId) => FORAGING_MAP[actionId]?.xp ?? 0,
    getOutputItem: (actionId) => {
      const action = FORAGING_MAP[actionId];
      return action ? { itemId: action.dropItemId, qty: 1 } : null;
    },
  },
```

### 8.3. `src/store/gameStore.ts`

a) Импорт: `import { FORAGING_MAP } from '@/domain/professions/foraging';`

b) Добавить после `processFishing`:
```ts
function processForaging(actionId: string): ActionResult | null {
  const action = FORAGING_MAP[actionId];
  if (!action) return null;
  const playerLevel = usePlayerStore.getState().getSkillLevel('foraging');
  if (playerLevel < action.levelRequired) return null;
  const total = action.drops.reduce((sum, d) => sum + d.weight, 0);
  let rng = Math.random() * total;
  let pick = action.drops[0];
  for (const drop of action.drops) {
    rng -= drop.weight;
    if (rng <= 0) { pick = drop; break; }
  }
  const qty = randomRange(pick.quantity[0], pick.quantity[1]);
  return { items: [{ itemId: pick.itemId, quantity: qty }], xpGained: action.xp, masteryXpGained: action.masteryXp ?? 3 };
}
```

c) В `processAction` добавить: `case 'foraging': return processForaging(actionId);`
d) В `getActionInterval` добавить: `case 'foraging': return FORAGING_MAP[actionId]?.interval ?? 2500;`

### 8.4. `src/store/playerStore.ts`

В `ALL_SKILL_IDS` вставить `'foraging'` (после `'woodcutting'`):
```ts
  'woodcutting', 'foraging', 'fishing', 'firemaking', 'cooking',
```

### 8.5. `src/shared/icons/skillIcons.ts`

В `SKILL_ICONS`: `foraging: '🌿',` (между woodcutting и fishing).
В `SKILL_SHORT_NAMES`: `foraging: 'Сбор',`.

### 8.6. `src/store/notificationsStore.ts`

В `SKILL_ICONS`: `foraging: '🌿',` (между woodcutting и fishing).

### 8.7. `src/lib/i18n.ts`

ru:
```ts
  'skill.foraging': 'Сбор',
  'skill.foragingDesc': 'Подбирай по пути ветки, грибы и камни — мелочь, что кормит ремесло.',

  'foraging.foraging': 'Поиск находок',
  'foraging.selectAction': 'Выберите участок для поиска в списке ниже.',
  'foraging.stop': 'Прекратить поиск',
  'foraging.availableActions': 'Участки для поиска',
```
en (в `Partial`-словарь): `'skill.foraging': 'Foraging',`

### 8.8. `src/features/professions/SkillHeader.tsx`

a) В `SKILL_DESCRIPTION_KEYS`: `foraging: 'skill.foragingDesc',`
b) В `SKILL_THEME`:
```ts
  foraging:    { barFrom: '#3f6212', barTo: '#84cc16', accent: '#a3e635' },
```

### 8.9. Новый файл `src/features/professions/ForagingPage.tsx` — дословно

```tsx
import { useGameStore } from '@/store/gameStore';
import { FORAGE_ACTIONS, FORAGING_MAP } from '@/domain/professions/foraging';
import { SkillHeader } from '@/features/professions/SkillHeader';
import { ActionProgressBar } from '@/features/professions/ActionProgressBar';
import { ActionGrid } from '@/features/professions/ActionGrid';
import { useTranslation } from '@/hooks/useTranslation';
import { Square, Leaf, Clock } from 'lucide-react';

export function ForagingPage() {
  const { t } = useTranslation();

  const startSkillAction = useGameStore(s => s.startSkillAction);
  const stopAction = useGameStore(s => s.stopAction);
  const activeSkill = useGameStore(s => s.activeSkill);
  const activeActionId = useGameStore(s => s.activeActionId);

  const handleActionClick = (actionId: string) => {
    if (activeSkill === 'foraging' && activeActionId === actionId) {
      stopAction();
    } else {
      startSkillAction('foraging', actionId);
    }
  };

  const activeAction = activeActionId ? FORAGING_MAP[activeActionId] : undefined;
  const isTraining = activeSkill === 'foraging' && !!activeAction;

  return (
    <div className="space-y-4">
      <SkillHeader skillId="foraging" skillName={t('skill.foraging')} skillIcon="🌿" />

      {/* Active Action Panel */}
      <div className='rounded-2xl p-4 sm:p-5 relative overflow-hidden transition-all'
      style={{ background: isTraining ? 'linear-gradient(160deg, #334a12, #22310c)' : 'linear-gradient(160deg, #4a6b24, #385218)', border: isTraining ? '2px solid #9ecf34' : '2px solid #2c3d12', boxShadow: isTraining ? '0 3px 0 #141f08, 0 0 20px rgba(158,207,52,0.25)' : '0 3px 0 #1c2808' }}>
        {isTraining && activeAction ? (
          <div className="space-y-3.5 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(158,207,52,0.2)', border: '2px solid rgba(158,207,52,0.5)', boxShadow: '0 0 12px rgba(158,207,52,0.3)' }}>
                  <Leaf className='w-6 h-6' style={{ color: '#d3f26a' }} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <span>{t('foraging.foraging')}</span>
                    <span style={{ color: '#d3f26a', fontWeight: 800 }} className=''>{activeAction.name}</span>
                  </h3>
                  <p className="text-[var(--text-secondary)] text-xs font-mono mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-lime-400" />
                    <span>{(activeAction.interval / 1000).toFixed(1)} сек. за действие</span>
                  </p>
                </div>
              </div>

              <button
                onClick={stopAction}
                className="shrink-0 px-5 py-2.5 bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white border border-red-500/40 font-bold rounded-2xl transition-all text-xs active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t('foraging.stop')}</span>
              </button>
            </div>

            <div className="pt-1">
              <ActionProgressBar height="h-3" color="green" />
            </div>
          </div>
        ) : (
          <div className="text-center text-[var(--text-secondary)] flex flex-col items-center gap-2 py-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-light)' }}>
              <Leaf className="w-6 h-6 text-[var(--text-muted)]" />
            </div>
            <p className="text-xs font-medium" style={{ color: '#d3f26a', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{t('foraging.selectAction')}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-1 pt-1">
        <h2 className="text-xs font-extrabold uppercase tracking-widest font-mono flex items-center gap-1.5" style={{ color: '#a3e635', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
          <span>🌿</span> {t('foraging.availableActions')}
        </h2>
      </div>

      <ActionGrid skillId="foraging" actions={FORAGE_ACTIONS} onActionClick={handleActionClick} />
    </div>
  );
}
```

### 8.10. Навигация и роутинг

- `src/App.tsx`: импорт `ForagingPage`; добавить `<Route path="/foraging" component={ForagingPage} />` после `/woodcutting`.
- `src/components/Sidebar.tsx`: импорт `Leaf` из lucide; после пункта woodcutting добавить:
  ```tsx
  <NavItem href="/foraging" icon={<Leaf size={15} />} label={t('skill.foraging')} skillId="foraging" dotColor="#84cc16" />
  ```
- `src/components/MobileNav.tsx`: в `allSkillsList` добавить `{ href: '/foraging', name: t('skill.foraging'), id: 'foraging' }` (после woodcutting); в фильтре гостей разрешить `'foraging'`.
- `src/components/GlobalActiveBar.tsx`: импорт `FORAGING_MAP`; в `SKILL_THEMES` добавить
  `foraging: { nameKey: 'skill.foraging', icon: '🌿', path: '/foraging', color: 'green', accent: 'text-lime-400 border-lime-500/30 bg-lime-500/10' }`; в `getActionName` — `case 'foraging': return FORAGING_MAP[actionId]?.name ?? actionId;`
- `src/lib/guestMode.ts`: `GUEST_ALLOWED_SKILLS` → `['woodcutting', 'foraging', 'fishing']` (чтобы тестировать без регистрации).
- `src/lib/saveManager.ts`: в `skillNames`/`skillIcons` добавить `foraging: 'Сбор'` / `foraging: '🌿'`.
- `src/shared/ui/kit/SkillCard.tsx`: в `SKILL_LINKS` — `foraging:'/foraging'`; в `SKILL_DESC` — `foraging: 'Подбор веток, грибов и камней по пути.'`.
- `src/shared/ui/kit/ActionCard.tsx`: в строку `resolvedItemId` добавить `|| action.dropItemId` (чтобы карточка «Сбора» показывала представительную находку).
- `src/store/inventoryStore.ts`: в фильтре `case 'resources':` добавить `'mineral', 'foraging'` в список категорий.

---

## 9. Проверки (обязательно перед PR)

```bash
cd /home/user/IDLE-Test          # в новом сешне путь тот же
corepack pnpm install --prefer-offline
corepack pnpm --filter my-app typecheck      # должен быть ЧИСТЫМ
corepack pnpm --filter my-app test:pillars   # 36/36
corepack pnpm --filter my-app build          # зелёный
```

Валидатор каталога — зафиксирован в репозитории как `artifacts/my-app/validate-catalog.mjs`
(проверяет: 83 предмета, состав семейств, уникальность id, русские name/description,
наличие `.webp` для каждого `iconPath`, резолв всех дропов «Сбора» на каталог):
```bash
cd artifacts/my-app
node --experimental-strip-types validate-catalog.mjs
```
Ожидание: `✔ итого предметов: 83` … `✔ ОШИБОК НЕТ — каталог валиден`
(состав: 8 log · 12 ore · 12 bar · 12 raw_fish · 12 cooked_fish · 2 mineral · 25 foraging).

Однострочный fallback (если файл не перенёсся):
```bash
cd artifacts/my-app
node --experimental-strip-types --input-type=module -e '
import fs from "fs";
import { CATALOG } from "./src/domain/items/catalog/index.ts";
let problems = 0; const seen = new Set();
for (const it of CATALOG) {
  if (seen.has(it.id)) { console.log("DUP:", it.id); problems++; }
  seen.add(it.id);
  if (!it.description?.trim()) { console.log("NO DESC:", it.id); problems++; }
  const webp = `public/assets/icons/${it.iconPath}.webp`;
  if (!fs.existsSync(webp)) { console.log("MISSING:", it.id, webp); problems++; }
  const m = it.iconPath.match(/t(\d+)(?!\d)/);
  if (m && Number(m[1]) !== it.tier) { console.log("TIER≠FILE:", it.id, it.tier, it.iconPath); problems++; }
}
console.log("items:", CATALOG.length, "| problems:", problems);
' 2>&1 | grep -v ExperimentalWarning
```
Ожидание: `items: 83 | problems: 0` (8 log, 12 ore, 12 bar, 12 raw_fish, 12 cooked_fish, 2 mineral, 25 foraging).

---

## 10. Решения, требующие подтверждения владельца (помечены флажками)

1. **Порядок рунит/адамантит** — t07 рунит (циан) / t08 адамантит (зелёный) выведен
   из ЦВЕТА иконок; в старой игре адамантит был «проще» рунита (70 vs 85 лвл).
2. **Серебро** (руда t4) и **медный слиток** (`bar_copper` t1) — их не было в старой игре;
   у серебра нет жилы, у медного слитка нет рецепта (появятся с батчем «крафт»).
3. **Экзотика t10–12** — временные названия «Экзотическая руда I–III», id по тиру
   (`ore_t10..12`, `bar_t10..12`) — стабильные, меняются только `name`/`description`.
4. **Грибы** — названия плейсхолдеры (боровик…трюфель), сверить с картинками.
5. **Цены и рейты «Сбора»** — черновые, владелец правит.
6. **Гостям «Сбор» открыт** (как рубка/рыбалка) — для удобства теста; при желании
   закрыть гостям — убрать `'foraging'` из `GUEST_ALLOWED_SKILLS` и списка MobileNav.

---

## 11. Стартовая фраза для нового чата

```text
Продолжаем Aethelia. Ветка arena/01a075e0-idle-test, база = main (fb2bea7).
Восстанови работу по ROADMAP_ITEM_SYSTEM_REBUILD.md (точная build-спека):
система предметов (батч 1, каталог 83 предмета + getItem()) и механика «Сбор».
Контракт — ITEM_SYSTEM_PLAN.md.

Прочитай NEXT_CHAT_HANDOFF.md, DEVLOG.md (верх), ITEM_SYSTEM_PLAN.md,
ROADMAP_ITEM_SYSTEM_REBUILD.md, git log --oneline -5.
Мы не торопимся. Одна задача. Секреты не просить. Превью Arena не чинить.
Мерж только по слову «мержи».
```
