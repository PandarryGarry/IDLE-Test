# Архитектура `my-app/src`

Разложено по смыслу: где числа, где чистая логика, где экраны, где примитивы.

```
src/
  App.tsx          вывеска / акт 0 → Router. Маршруты не монтируются под заставкой.
  core/            движок: формулы, тики, offline, реестр навыков, таблица XP
  domain/          чистая логика, без React
    attributes/    столпы, 12 подхарактеристик, нити, расчёт, иконки столпов
    combat/        монстры, молитвы, заклинания
    items/         предметы, статы экипировки, наборы
    professions/   6 ремёсел
  data/            данные и числа
    balance/       ВСЕ числа баланса — единственный источник
    characters.ts  расы, аватары, манекены
  features/        экраны
    hero/ combat/ professions/ auth/ bank/ system/
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
`balance/xpRates.ts`. Канон — `BALANCE_FOUNDATION.md`.

**Импорты.** UI (`features/`, `components/`, `store/`, `hooks/`) — через `@/`.
Чистая логика (`domain/`, `data/`, `core/`) — относительными путями с `.ts`
(тесты Node без алиаса).

**Цвета** — только CSS-переменные и токены `index.css`.

**Картинки** — только WebP через `iconUrl()` / `getAvatarPath()`.

**Новые экраны** — на примитивах `shared/ui/gameUI.tsx`.

**Облако.** Аккаунт и герой — таблицы Supabase (`SUPABASE_STAGE4.sql`).
Прогресс героя — JSON `characters.save_data`. Мигратор атрибутов
(`domain/attributes/characterAttributes.ts`) поднимает старый сейв без новой SQL.

## Что осталось в корне репозитория и почему

`lib/db`, `lib/api-client-react`, `lib/api-spec`, `lib/api-zod`, `scripts/` —
workspace-пакеты pnpm (my-app + api-server). Внутрь `my-app` не переносить:
сломает api-server и Replit.

## Проверки перед мержем

```
pnpm typecheck          # чисто по всем пакетам
pnpm build              # в artifacts/my-app
pnpm test:pillars       # characterAttributes + xpRates + strikeRange + offlineAway
```

Владелец перед «мержи» заходит **своим** аккаунтом на ветке в Replit
(см. `NEXT_CHAT_HANDOFF.md`). Агент боевой БД не видит.
