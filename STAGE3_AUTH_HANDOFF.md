# Stage 3 Auth — handoff для следующего чата

Дата фиксации: **2026-08-29**  
Ветка Arena: `arena/01a04c15-idle-test`  
Статус: **Supabase/auth foundation реализован и смёржен (PR #4); остаётся тест в Replit.**

> 🔄 **Обновление (Сессия 5):** Supabase больше НЕ «визуальный» — добавлены
> `@supabase/supabase-js`, `src/lib/supabase.ts`, `src/store/authStore.ts`,
> `src/lib/guestMode.ts`, `src/lib/authActions.ts`, AuthGate в `App.tsx`,
> реальные email/password + Google OAuth + guest-mode. Инструкция для владельца:
> `SUPABASE_SETUP.md`.
> Следующий этап: **Этап 4 — создание персонажа**.

## Текущий статус

Визуальная часть auth-экрана утверждена и сохранена. Поверх неё подключён реальный auth-фундамент.

Сейчас готово:
- полноэкранные routes `/auth`, `/login`, `/register`;
- отдельный auth-экран без игрового sidebar/topnav;
- approved tavern background в стиле Aethelia;
- прозрачная frameless auth-зона поверх фона;
- desktop login/register визуально зафиксированы;
- mobile login/register визуально зафиксированы как направление: фокус на камине/гербе, auth поднят выше, поля/кнопки короче и компактнее;
- лёгкие ambient-анимации: fire glow, embers/dust, soft entrance;
- `prefers-reduced-motion` учтён;
- реальная авторизация: email/password, Google OAuth, session restore, sign out;
- guest mode с ограничениями и сообщением «Зарегистрируйся, чтобы сохранить прогресс.».

## Утверждённая визуальная концепция

### Фон

Утверждённый фон — живая тёплая таверна у камина:
- камин и герб со знаком Aethelia сверху;
- знак игры: **топор + перо**;
- bard у камина;
- люди отдыхают/пьют/общаются;
- присутствует разнообразие рас: elf + dwarf;
- правая часть — живая, но спокойная часть таверны, не пустая auth-заглушка;
- палитра: тёмное дерево, бронза, старое золото, пергамент, amber firelight;
- без синевы/cyan magic, без замков, без подвала/лаборатории зелий.

Файл в приложении:
- `artifacts/my-app/public/assets/art/auth_tavern_background.webp`

Исходный approved PNG сохранён в рабочей истории review во время разработки, но временные review-папки можно не восстанавливать. Runtime использует WebP из `public/assets/art/`.

### Печать

Печать нужна игре как отдельный UI-ассет, но **не используется маленькой внутри текущей auth-формы**, потому что на малом размере выглядела криво/шумно. Её нужно использовать только там, где она достаточно крупная и не портит композицию.

Файл в приложении:
- `artifacts/my-app/public/assets/icons/ui/auth/aethelia_seal_clean.webp` / `artifacts/my-app/public/assets/icons/ui/auth/aethelia_seal_clean.png`

Правило: если снова использовать печать — не кропать заново из source на глаз; использовать готовый clean asset.

### Desktop auth

Утверждённое направление desktop:
- нет общей декоративной рамки экрана;
- нет рамки вокруг auth-panel — только прозрачный `glass/tint`;
- фон должен хорошо читаться сквозь auth-зону;
- форма компактная;
- поля и кнопки не растянуты;
- Google-кнопка короткая: `Google`, не `Продолжить через Google`;
- небольшие заголовки и текст;
- left-story copy небольшой, не занимает пол-экрана.

Текущие CSS-позиции:
- login card: `.auth-card` top примерно `23vh`, right `9.6vw`, width `16.125rem`;
- register card: `.auth-screen--register .auth-card`, width `18.375rem`;
- desktop field height `2rem`, button height `2rem`.

### Mobile auth

Ключевое требование владельца: **на мобильной версии обязательно уменьшать длину ячеек и кнопок**.

Текущее направление mobile:
- background-position держит фокус на камине/гербе: `26.5% center`;
- story text расположен выше формы;
- login/register auth подняты выше, не прилипают к нижнему краю;
- форма без рамки, только мягкий transparent tint;
- поля/кнопки короче, не во всю ширину экрана;
- mobile `.auth-card__content` width ограничен примерно `17rem`, то есть controls уже, чем экран;
- mobile field height `1.7rem`;
- mobile button height `1.75rem`;
- registration должна быть `scroll-safe` на маленьких высотах.

## Реализованные файлы

Основные изменения (visual + auth):
- `artifacts/my-app/src/pages/AuthPage.tsx` — auth-страница login/register + реальные формы;
- `artifacts/my-app/src/App.tsx` — auth routes + AuthGate/protected routes;
- `artifacts/my-app/src/index.css` — auth visual CSS, responsive, анимации, reduced-motion, сообщения auth;
- `artifacts/my-app/public/assets/art/auth_tavern_background.webp` — approved фон таверны;
- `artifacts/my-app/public/assets/icons/ui/auth/aethelia_seal_clean.webp` / `aethelia_seal_clean.png` — clean-печать;
- `artifacts/my-app/src/lib/supabase.ts` — Supabase-клиент и missing-config state;
- `artifacts/my-app/src/store/authStore.ts` — auth-стейт и методы;
- `artifacts/my-app/src/lib/guestMode.ts` — guest-ограничения;
- `artifacts/my-app/src/lib/authActions.ts` — сброс/остановка действий при смене аккаунта;
- `artifacts/my-app/SUPABASE_SETUP.md` — инструкция подключения в Replit.

## Что намеренно НЕ сделано

- Cloud save / профиль прогресса (запись/чтение сейвов в Supabase) — отложено.
- Google provider может быть ещё не настроен в Supabase (код `signInWithGoogle` готов).
- Этап 4 (создание персонажа).

## Следующие шаги

1. Владелец проверяет в Replit на ветке `arena/01a04c15-idle-test`:
   - `/login` и `/register` (email/password, ошибки/подтверждение);
   - session restore после перезагрузки;
   - Google OAuth (если provider настроен);
   - guest mode: лесорубство+рыбалка+24 слота, блок остального, сообщение «Зарегистрируйся, чтобы сохранить прогресс.»;
   - sign out из Sidebar и Settings;
   - desktop/tablet/mobile widths.
2. Если тест успешен — начать Этап 4: создание персонажа.
3. Cloud-save/profile можно оформить либо внутри Этапа 4 (при привязке профиля), либо отдельным шагом после авторизации.

## Проверки/команды

В этом sandbox `pnpm` может быть не в PATH; работает `corepack pnpm`.

Проверки, которые прошли после внедрения visual auth-shell:

```bash
corepack pnpm --dir artifacts/my-app typecheck
corepack pnpm --dir artifacts/my-app build
```

Build прошёл успешно. Vite warnings устранены:
- из `src/components/ui/tooltip.tsx` убрана лишняя Next.js-директива `'use client'`, которая в Vite не нужна;
- в `vite.config.ts` добавлен `manualChunks` для `node_modules` → `vendor`, поэтому основной app chunk стал меньше 500 kB.

Dev server:

```bash
corepack pnpm --dir artifacts/my-app dev --host 0.0.0.0
```

## Секреты Supabase

Никогда не просить и не вставлять ключи в чат. Использовать Replit Secrets или `.env.local`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Никогда не использовать `service_role` во frontend.

## Важные rejected-направления — не повторять

- Blue/cyan castle/floating-world auth direction — rejected.
- Большая общая рамка вокруг всего auth-интерфейса — rejected.
- Тяжёлые непрозрачные auth-panels, которые скрывают фон — rejected.
- Большая мутная mobile glass-panel — rejected.
- Длинные mobile поля/кнопки во всю ширину — rejected.
- Маленькая печать внутри формы — rejected как визуально криво/шумно.
- Пустая большая auth-заглушка справа в фоне — rejected.
- Подвальные комнаты с книжными полками/зельями как auth background — rejected.
