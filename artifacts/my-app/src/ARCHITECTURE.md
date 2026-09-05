# Архитектура `my-app/src`

Разложено по смыслу: где числа, где чистая логика, где экраны, где примитивы.

```
src/
  core/        движок: формулы, тики, offline, реестр навыков, таблица XP
  domain/      чистая логика предметной области, без React
    attributes/  ФУНДАМЕНТ: столпы, 12 подхарактеристик, нити, расчёт
    combat/      монстры, молитвы, заклинания
    items/       предметы, статы экипировки, наборы
    professions/ 6 ремёсел
  data/        данные и числа
    balance/     ВСЕ числа баланса — единственный источник
  features/    экраны по смыслу
    hero/ combat/ professions/ auth/ bank/ system/
  components/  общие компоненты приложения (навигация, сцены, модалки)
    ui/          примитивы shadcn (только используемые)
    art/ modals/
  shared/ui/   игровые примитивы gameUI.tsx — основа новых экранов
  store/       zustand-хранилища
  hooks/ lib/ styles/
```

## Правила

**Числа — только в `data/balance/`.** В компонентах и логике хардкода чисел нет.
Фундамент характеристик: `balance/substats.ts`, `balance/threads.ts`, `balance/branchEffects.ts`.
Канон и обоснование — `BALANCE_FOUNDATION.md` в корне репозитория.

**Импорты.** UI-слой (`features/`, `components/`, `store/`, `hooks/`) — через алиас `@/`.
Чистая логика (`domain/`, `data/`, `core/`) — относительными путями с расширением `.ts`:
эти модули запускаются тестами напрямую в Node, где алиас не резолвится.

**Цвета** — только CSS-переменные и токены `index.css`, хардкод запрещён.

**Картинки** — только WebP через `iconUrl()` / `getAvatarPath()`.

**Новые экраны** — на примитивах `shared/ui/gameUI.tsx`.

## Что осталось в корне репозитория и почему

`lib/db`, `lib/api-client-react`, `lib/api-spec`, `lib/api-zod`, `scripts/` — это
workspace-пакеты pnpm, они шарятся между `my-app` и `api-server`. Перенос внутрь
`my-app` сломает api-server и конфиг Replit, поэтому они остаются на месте.

## Проверки перед мержем

```
pnpm typecheck          # чисто по всем пакетам
pnpm build              # в artifacts/my-app
pnpm test:pillars       # 15/15
```
