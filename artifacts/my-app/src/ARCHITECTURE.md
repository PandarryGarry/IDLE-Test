# Архитектура `my-app/src`

Разложено по смыслу: где числа, где чистая логика, где экраны, где примитивы.

```
src/
  App.tsx          вывеска / акт 0 → Router. Маршруты не монтируются под заставкой.
  core/            движок: формулы, тики, offline, реестр навыков, таблица XP
  domain/          чистая логика, без React
    attributes/    столпы, 12 подхарактеристик, нити, расчёт, иконки столпов
    combat/        монстры + чистая модель боя Combat 2.0 (формулы/риски/намерения)
    items/         предметы, статы экипировки, наборы
    professions/   единственное ремесло — «Сбор» (foraging) и его статы
  data/            данные и числа
    balance/       ВСЕ числа баланса — единственный источник
                  (professions.ts теперь только foraging)
    combat/        экосистема боя: зоны + мобы по отдельным файлам
                  (описание, картинка, роли, способности, телеграфы)
    characters.ts  расы, аватары, манекены
  features/        экраны
    hero/ combat/ professions/ auth/ inventory/ system/
  components/      навигация, сцены, модалки, SplashScreen, FirstLaunchIntro
    ui/            примитивы shadcn (только используемые)
    art/ modals/
  shared/ui/       игровые примитивы gameUI.tsx — основа новых экранов
  store/           zustand
  hooks/ lib/ styles/
  lib/bootPreload.ts   что греть, пока на экране вывеска
```

## Вывеска — что считается «игра готова»

Пока шкала на экране (`SplashScreen` / акт 0), декодируем **первый кадр**, не каталог:

| Ждём (гейт) | Не ждём |
|---|---|
| арт вывески, шрифты (свои cap) | 800+ иконок предметов |
| дорога онбординга | вкладки Нити / глубинные пассивки (фон) |
| 4 столпа, 12 веток, иконки хаба, герб | профессии и инвентарь (`loading="lazy"`) |
| аватар + манекен известных героев, после `authReady` | силуэты экипа (фон) |

Cap пакета героя ~5 с — страховка сети, не «можно отпустить пустым».
Список URL: `bootGateUrls` / `bootBackgroundUrls` в `lib/bootPreload.ts`.

## Правила

**Числа — только в `data/balance/`.** В компонентах хардкода чисел нет.
Фундамент: `balance/substats.ts`, `balance/threads.ts`, `balance/branchEffects.ts`,
`balance/xpRates.ts`, `balance/combat.ts`. Канон — `BALANCE_FOUNDATION.md`.
Combat 2.0: чистые расчёты (`domain/combat/combatModel.ts`) не импортируют сторы;
`data/combat/mobs/*` хранит мобов как отдельные записи с картинкой/описанием/
способностями; `store/combatStore.ts` — только адаптер тиков, лута, еды,
уведомлений и save-safe runtime-состояния боя.

**Импорты.** UI (`features/`, `components/`, `store/`, `hooks/`) — через `@/`.
Чистая логика (`domain/`, `data/`, `core/`) — относительными путями с `.ts`
(тесты Node без алиаса).

**Домен не знает про сторы.** `domain/` обязан запускаться `node --test` без
`node_modules`. Нужен внешний факт из zustand-мира (админ-правки, эффективные
статы профессии) — добавь порт в `src/domain/runtimePorts.ts` и подпиши его из
стора (`store/adminConfigStore.ts`, `store/professionStatsStore.ts`), а НЕ
импортируй стор в домен. Иначе `pnpm test:pillars` снова станет тестом «с
установленными зависимостями», а не проверкой чистой логики.
Исключение, осознанное: `domain/items/gearSets.ts` (`saveGearSet`/`loadGearSet`
— мутации экипа и сумки, они живут рядом с окном героя).

**Сейв — недоверенный ввод.** Единственная воронка «сейв → сторы» —
`lib/saveSchema.ts`: `normalizeSaveData()` чинит битые поля (чужой `gameMode`,
`maxSlots`, `NaN`, мусор в сумке), `isFullSaveShape()` решает, что считать
полным сейвом (один критерий для `saveManager` и для облачного reconcile),
`parseSaveInput()` принимает и наш Base64, и голый JSON из файла экспорта.
Новые поля сейва: нормализовать в `saveSchema`, а не читать `data.foo?.bar`
наивной ссылкой — иначе следующий «голый» или чужой сейв снова сотрёт сумку.

**Цвета** — только CSS-переменные и токены `index.css`. Шестнадцатеричное
значение в коде вне `index.css` — ошибка, а не вкусовщина: за законом следит
страж `pnpm validate:colors` (запуск из `artifacts/my-app`; листок легаси-запаса
внутри `validate-colors.mjs` только сокращается — расширять запрещено).
Порядок нового цвета: переменная в `:root` → строка в `styles/tokens.ts` →
потребитель. Гайд: `src/styles/THEME_GUIDE.md`.

**Картинки** — только WebP через `iconUrl()` / `getAvatarPath()`.

**Новые экраны** — на примитивах `shared/ui/gameUI.tsx`.

**Облако.** Аккаунт и герой — таблицы Supabase (`SUPABASE_STAGE4.sql`).
Прогресс героя — JSON `characters.save_data`. Мигратор атрибутов
(`domain/attributes/characterAttributes.ts`) поднимает старый сейв без новой SQL.
Авторитетный сейв — самый свежий (`reconcileCharacterSave`).

**Инвентарь.** Сумка героя — `/inventory` ( термины: «инвентарь»/«сумка»).
«Банк» как система **не существует** — будущая отдельная фича, контракт
терминов и рамка: `BANK_FOUNDATION.md` (корень репо). Слово `bank` в коде —
только legacy-чтение старых сейвов, не трогать.

## Что осталось в корне репозитория и почему

`lib/db`, `lib/api-client-react`, `lib/api-spec`, `lib/api-zod`, `scripts/` —
workspace-пакеты pnpm (my-app + api-server). Внутрь `my-app` не переносить:
сломает api-server и Replit.

Честный статус: это **скелет шаблона Replit**. Игрой они не используются
(my-app ходит в Supabase напрямую, `lib/db` пуст, api-server — health-check,
`api-client-react` объявлен в deps, но в `src/` не импортируется).
Не подключать и не удалять без решения владельца.

## Проверки перед мержем

```
pnpm typecheck          # чисто по всем пакетам
pnpm build              # в artifacts/my-app
pnpm test:pillars       # characterAttributes + equipmentSubstats + gear + xpRates + …
pnpm validate:catalog   # каталог предметов: id, описания, webp, tier↔tNN
```

Владелец перед «мержи» заходит **своим** аккаунтом на ветке в Replit
(см. `NEXT_CHAT_HANDOFF.md`). Агент боевой БД не видит.
