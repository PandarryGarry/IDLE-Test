# Aethelia IDLE RPG

Браузерная IDLE RPG в сеттинге тёмного фэнтези: профессии-ремёсла, бой,
оффлайн-прогресс и герой с четырьмя столпами характеристик.

## Run & Operate

- `pnpm --filter @workspace/my-app run dev` — игра (порт 8080 в Replit, 3000 локально)
- `pnpm run typecheck` — полная проверка типов (libs + приложение + scripts)
- `pnpm --filter @workspace/my-app run test:pillars` — тесты Четырёх Столпов
- `pnpm run build` — typecheck + сборка всех пакетов
- Required env (Secrets в Replit): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  — инструкция `SUPABASE_SETUP.md`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Vite + React + Tailwind + Radix (UI-примитивы `src/shared/ui/gameUI.tsx`)
- State: zustand; роутер: wouter
- Supabase: auth + таблица персонажей (`artifacts/my-app/SUPABASE_STAGE4.sql`)

## Where things live

- `artifacts/my-app/src/` — игра. Карта файлов: `README.md` → «Структура проекта».
- `artifacts/my-app/src/data/balance/` — **все числа Этапа 5** (нигде больше).
- `artifacts/my-app/public/assets/` — runtime WebP; мастер-исходники артов —
  `artifacts/my-app/art_masters/` (вечный архив, в сборку не попадает).
- `scripts/qa/` — headless-браузер и прогоны без облака.
- `scripts/assets/optimize.mjs` — конвейер картинок (мастер PNG → runtime WebP).
- Документы и хандоффы — в корне репозитория, указатель в конце `README.md`.

## Architecture decisions

- **Один герой на аккаунт, персонажи в облаке**: `characterStore` + `characterSave`
  (сверка local/cloud, отложенный cloud-save). Гостевой режим — sessionStorage.
- **Четыре Столпа вместо класс-ярлыка**: Стойкость / Мощь / Сноровка / Чутьё;
  профессии — ремёсла и дают бонусы, а не название на карточке.
- **Все числа характеристик — только в `src/data/balance/`**, расчёт — чистые
  функции `src/lib/characterAttributes.ts` (без React).
- **Картинки — только WebP через `iconUrl()` / `getAvatarPath()`**; мастер-PNG в
  `<img>` не уходит никогда.

## Product

- Профессии: рубка, горное дело, рыбалка, готовка, кузнечество, костры + бой.
- Герой: доска тела с паутиной из 36 узлов (ветви и пассивки), экипировка,
  перекрёстные нити-синергии, respec.
- Онбординг: знак → пролог → вход → правила → создание героя → город.

## User preferences

- **Git Workflow**: NEVER use `git push --force`. Держим линейную историю на
  `main` — владелец обновляет Replit кнопкой **Pull**. Рабочую ветку он смотрит
  через shell: `git fetch origin && git checkout <ветка>`.
- **Language**: Russian — основной язык интерфейса, текстов и комментариев.
- **Theme & Style**: тёмное фэнтези «деревянная таверна», тёплое золото на
  тёмном дереве, слоты-сквирклы; только токены и CSS-переменные, без хардкода цветов.
- **No Bank**: банка нет, единая сумка с кошельком и расширением слотов.
- **Темп**: не торопимся, одна задача за раз; непонятно — спросить, а не угадывать.

## Gotchas

- Превью Arena (iframe) у владельца белое — не чинить; тестирование в Replit.
- Google Fonts сняты: в Replit системный serif. Cinzel/Inter не возвращать без вопроса.
- Мерж PR закрывает GitHub-доступ прошлой сессии: мержим в самом конце чата.
- Секреты (ключи Supabase, пароли QA) — только в Secrets/`.env.local`, никогда не в чат.
- Мок без облака (`src/lib/qaMock.ts`) включается сам в dev без
  `VITE_SUPABASE_URL` — в Replit с ключами работает реальный Supabase.
- Агент не видит изображения: визуальные правки проверяются замерами и глазами
  владельца.

## Pointers

- Точка входа для нового чата: `NEXT_CHAT_HANDOFF.md`
- Журнал решений: `DEVLOG.md`; план: `ROADMAP.md`
- Контракт характеристик: `STAGE5_FOUR_PILLARS_HANDOFF.md`
