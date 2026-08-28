# Stage 3 Auth — handoff для следующего чата

Дата фиксации: **2026-08-29**  
Ветка Arena: `arena/01a049b7-idle-test`

## Текущий статус

Stage 3 начат с визуальной части авторизации/регистрации. После нескольких rejected-направлений утверждён новый визуальный подход и внедрён **визуальный auth-shell** в React/CSS.

Сейчас готово:
- полноэкранные routes `/auth`, `/login`, `/register`;
- отдельный auth-экран без игрового sidebar/topnav;
- approved tavern background в стиле Aethelia;
- прозрачная frameless auth-зона поверх фона;
- desktop login/register визуально зафиксированы;
- mobile login/register визуально зафиксированы как направление: фокус на камине/гербе, auth поднят выше, поля/кнопки короче и компактнее;
- лёгкие ambient-анимации: fire glow, embers/dust, soft entrance;
- `prefers-reduced-motion` учтён.

**Важно:** Supabase/authStore/AuthGate/реальная авторизация пока НЕ подключены. Формы сейчас визуальные: `submit` делает `preventDefault`, Google-кнопка не выполняет OAuth, guest-кнопка ведёт на `/`.

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

Основные изменения:
- `artifacts/my-app/src/pages/AuthPage.tsx` — визуальная auth-страница и переключение login/register;
- `artifacts/my-app/src/App.tsx` — routes `/auth`, `/login`, `/register` отрисовываются отдельным fullscreen auth-screen без game shell;
- `artifacts/my-app/src/index.css` — весь auth visual CSS, responsive rules, анимации и reduced-motion;
- `artifacts/my-app/public/assets/art/auth_tavern_background.webp` — approved фон таверны;
- `artifacts/my-app/public/assets/icons/ui/auth/aethelia_seal_clean.webp` / `artifacts/my-app/public/assets/icons/ui/auth/aethelia_seal_clean.png` — clean-печать.

## Что намеренно НЕ сделано

- Не установлен `@supabase/supabase-js`.
- Нет `src/lib/supabase.ts`.
- Нет `src/store/authStore.ts`.
- Нет route protection/AuthGate.
- Нет реального email/password login/register.
- Нет Google OAuth.
- Нет session restore/sign out.
- Нет guest-mode restrictions.
- Нет cloud-save/profiles.

## Следующие шаги

1. Владелец должен проверить live-визуал в Replit/Webview:
   - `/login`
   - `/register`
   - desktop/tablet/mobile widths.
2. Если визуал подтверждён — перейти к Supabase foundation:
   - добавить `@supabase/supabase-js`;
   - создать `src/lib/supabase.ts`;
   - читать только frontend env:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - при missing config показывать аккуратное состояние, не ломать UI.
3. Создать `src/store/authStore.ts`:
   - `session`, `user`, `profile`, `loading`, `isGuest`;
   - `restoreSession()`;
   - `signIn(email,password)`;
   - `signUp(email,password,metadata)`;
   - `signInWithGoogle()`;
   - `signOut()`;
   - `continueAsGuest()`.
4. Подключить AuthGate/route protection:
   - незалогиненный → `/login`;
   - guest mode допускает limited game shell;
   - registered user допускает полный game shell.
5. Guest mode правила владельца:
   - progress only in `sessionStorage`;
   - доступны: лесорубство + рыбалка + 24 inventory slots;
   - заблокированы: combat, crafting, inventory expansion, cloud save;
   - показывать сообщение: `Зарегистрируйся, чтобы сохранить прогресс.`
6. После Supabase — Stage 4: создание персонажа.

## Проверки/команды

В этом sandbox `pnpm` может быть не в PATH; работает `corepack pnpm`.

Проверки, которые прошли после внедрения visual auth-shell:

```bash
corepack pnpm --dir artifacts/my-app typecheck
corepack pnpm --dir artifacts/my-app build
```

Build прошёл успешно. Остались только старые предупреждения Vite:
- `src/components/ui/tooltip.tsx` sourcemap original location unresolved;
- chunk size > 500 kB.

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
