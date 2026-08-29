# 📓 Aethelia RPG — DEVLOG (журнал разработки)

> **Назначение файла:** память между чат-сессиями Arena.
> Каждый новый чат агент ЧИТАЕТ этот файл ПЕРВЫМ ДЕЛОМ, а в конце сессии —
> ОБНОВЛЯЕТ его (новая запись сверху в «Журнале сессий») и мержит в main вместе с кодом.

---

## ⚙️ КАК МЫ РАБОТАЕМ (правила процесса — читать агенту в начале каждого чата)

### Участники
- **Разработчик (владелец):** PandarryGarry — контролирует всё, тестирует в Replit на iPhone.
- **Агент (Arena):** пишет код, работает в клоне репозитория, пушит через свою ветку.

### Жизненный цикл одного чата = один этап работы
1. Агент читает `DEVLOG.md` (этот файл), `ROADMAP.md`, `git log --oneline -15` — восстанавливает контекст.
2. Агент работает: код → коммиты → push в свою ветку `arena/...` → открывает PR.
3. Владелец тестирует: в Replit подтягивает ветку PR (`git fetch` + checkout) или ждёт мержа.
4. Правки по фидбеку — агент пушит в ту же ветку, PR обновляется сам.
5. **В САМОМ КОНЦЕ чата** (по команде владельца «мержи»):
   - агент обновляет `DEVLOG.md` (запись о сессии) и `ROADMAP.md` (галочки),
   - коммитит, пушит, мержит PR в `main`.
6. ⚠️ **После мержа PR сессия «запечатывается»** — push в GitHub больше не работает.
   Поэтому мерж — строго ПОСЛЕДНЕЕ действие. Всё, что после мержа — потеряется
   (придётся переносить руками через Replit).
7. Владелец в Replit: `git pull` → тестирует в Webview (превью Arena на iPhone не работает).

### Технические правила
- **Тестирование владельцем — только через Replit** (превью Arena на iOS показывает
  «Preview Unavailable» — известное ограничение, не чинится со стороны агента).
- **Хардкод цветов запрещён** — только CSS-переменные (`index.css`) / токены (`tokens.ts`).
- **Новые экраны — только на примитивах** `src/shared/ui/gameUI.tsx` (GButton, GModal, GCard...).
- **`pnpm typecheck` должен быть чистым** перед каждым мержем.
- **Changelog** (`src/data/changelog.ts`) — только важные для игрока изменения.
- **Коммиты подробные** — они тоже часть памяти между сессиями.
- Токены/секреты в чат НЕ вставлять никогда. Supabase-ключи — через Secrets в Replit / .env.

### Структура репозитория (главное)
- `artifacts/my-app/` — игра (Vite + React + TS + Tailwind + zustand + wouter).
  Запуск: `cd artifacts/my-app && pnpm dev` (порт 3000).
- `artifacts/my-app/public/assets/icons/` — 900+ иконок (уже в репо, структурированы).
- `artifacts/my-app/public/assets/art/` — заставочные арты (WebP wide/tall/square).
- `ROADMAP.md` — план из 8 этапов с принятыми решениями.
- `DEVLOG.md` — этот файл.

---

## 📍 ТЕКУЩИЙ СТАТУС

**Завершены: Этапы 1 и 2. Этап 3 (auth foundation) реализован и смёржен в main; awaits owner's live testing in Replit. Следующий этап — 4 (создание персонажа).**

Где продолжать следующему агенту:
- сначала прочитать `DEVLOG.md`, `ROADMAP.md`, `STAGE3_AUTH_HANDOFF.md` (или создать `STAGE4_CHARACTER_HANDOFF.md`);
- в Replit у владельца уже должны быть Secrets: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (инструкция `SUPABASE_SETUP.md`);
- первый шаг нового чата: владелец тестирует `/login`, `/register`, guest-realm, session restore, Google OAuth, sign out;
- после подтверждения этапа 4: экран создания персонажа, nickname + аватар, start-характеристики, переход в игру.

Что уже зафиксировано по Stage 3:
- visual auth-shell: `AuthPage.tsx`, routes `/auth`, `/login`, `/register`, `index.css` (frameless glass, compact controls, mobile focus на камине/гербе, reduced-motion);
- assets: `public/assets/art/auth_tavern_background.webp`, `public/assets/icons/ui/auth/aethelia_seal_clean.*`;
- Supabase: `@supabase/supabase-js`, `src/lib/supabase.ts`, `src/store/authStore.ts`, `src/lib/guestMode.ts`, `src/lib/authActions.ts`;
- AuthGate: незалогиненный → `/login`, гость → limited shell, registered → full shell;
- guest mode: sessionStorage, лесорубство+рыбалка+24 слота, без боя/крафта/mining/расширения инвентаря, баннер «Зарегистрируйся, чтобы сохранить прогресс.»;
- helper-документ: `SUPABASE_SETUP.md`.

Пока не сделано (намеренно, на следующий этап):
- cloud save / profile-логика (запись/чтение прогресса через Supabase);
- google provider в Supabase может быть ещё не настроен, но код `signInWithGoogle` готов;
- этап 4: создание персонажа.

Параллельная большая задача (Этапы 7–8): привязка 900+ иконок к предметам —
агент сканирует папки скриптом, генерирует каркас данных (id/iconPath/тир из имён файлов),
пишет названия/описания/лор, владелец контролирует и правит.

---

## 📜 ЖУРНАЛ СЕССИЙ (новые записи — СВЕРХУ)

### Сессия 7 — 2026-08-29 — Согласование Этапа 4 (персонаж) + контракт реализации
**Ветка:** `arena/01a04ceb-idle-test`

**Обсуждено и согласовано (без кода) — Этап 4 «создание персонажа»:**
- **Один персонаж на аккаунт.** Создание нового жёстко удаляет старого (перс + инвентарь).
  Это убирает лазейку «оффлайн-фарм за всех» и мультипликатор экономики.
- **Раса + аватар (двухступенчатый выбор):** сначала раса (1 из 5), потом **ровно 6
  аватаров этой расы**; перевыбор расы на лету. Бонусы расы — структура «2+ / 1−»
  (конкретика настраивается позже, сейчас влияния на формулы нет).
- **Никнейм = персонажу**, не аккаунту; глобально уникален (RPC `is_nickname_taken`).
  Поле «Имя» из регистрации убираем.
- **Аккаунт и персонаж — в РАЗНЫХ таблицах** (`profiles` + `characters`), чтобы было
  проще управлять и сразу применять изменения (напр. донат-валюта).
- **Донат-валюта — на аккаунте** (`profiles.donate_currency`), при удалении персонажа
  не теряется.
- **Админ-отметка** — `profiles.role` (`user` | `admin`), задел под будущую админ-панель.
- **Правила** — `profiles.rules_accepted_at` + `rules_version`; окно правил **после
  регистрации** (привязано к аккаунту).
- **Характеристики/профессии/скиллы — РАЗНЫЕ системы** (сейчас свалены в «навыки»).
  Полноценные характеристики и скиллы проектируем с нуля в СЛЕДУЮЩИЕ этапы. В Этап 4 —
  только каркас + раса + бонусы расы + время в карточке.
- **Сейвы** — трёхуровневые: память (тик) → локальный (~30 сек) → облако (~3 мин +
  pagehide). При старте берётся более свежий локальный и пушится в облако.
- **Кинопревью мира** — отложено; закладывается только точка расширения (интро-шаг).
- **Melvor → Aethelia** — переименовать ВСЁ и сразу, без миграции ключа сейва.

**Написано:** `STAGE4_CHARACTER_HANDOFF.md` (полный контракт), обновлены README/ROADMAP.
Правки в самом коде НЕ начинались (по договорённости — сначала контракт).

### Сессия 8 — 2026-08-29 — Этап 4: реализация кода персонажа (онбординг, выбор, перс в игре, сейвы)
**Ветка:** `arena/01a04ceb-idle-test`

**Сделано (код Этапа 4):**
- `src/data/characters.ts` — 5 рас, бонусы строго «2+ / 1−» (значения черновые), 30 аватаров
  (`{race}/{gender}_{NN}.png` в `avatars/`), хелперы `getAvatarPath`/`getAvatarsForRace`/`raceIdFromAvatar`.
  Исправлены подпапки аватаров: `humans/elves/dwarves/orcs/beastfolk` (не совпадают с raceId).
- `src/data/rules.ts` — `RULES_VERSION='1.0.0'`, блоки правил, локальный кэш принятия.
- `src/lib/characterApi.ts` — CRUD `characters`, `is_nickname_taken` (RPC), облачные сейвы,
  `setSelectedCharacter`, мягкое удаление; поля `profiles` (role/donate/rules/selected).
- `src/store/characterStore.ts` — load/select/create/rename/avatar/delete; один перс + мягкое
  удаление старого при создании; `resetGameToFresh` при создании (общие старт-статы).
- Онбординг: `RulesPage` (галочка принять), `CreateCharacterPage` (раса → 6 аватаров → ник,
  двойной confirm при замене), `SelectCharacterPage` (карточки + время в игре, always_select).
- Перс в игре: Dashboard (Герой), Sidebar (карточка перса), Settings (секция «Персонаж»:
  смена ника/аватара 1× бесплатно, смена/удаление с двойным confirm).
- Сейвы 3-уровневые: `characterSave.ts` (reconcile «кто новее» + push в облако ~3 мин +
  pagehide/visibilitychange), локальный 30с остаётся на `saveManager`.
- `authStore.acceptRules` + профили; роутинг в `App.tsx` с гейтингом правил и персонажа.
- `pnpm typecheck` + `pnpm build` — чисто.

**Отложено/осознанно не сделано:** lz-string (опционально), «Что нового» как отдельный
онбординг-шаг (используется существующая модалка Changelog), кинопревью/интро (deferred),
полная система характеристик/профессий/скиллов (в следующие этапы), трата донат-валюты
при смене ника/аватара во 2-й раз (заглушка, система доната позже).

**Ожидается:** тест владельцем в Replit (найти VITE_SUPABASE_URL/ANON_KEY в Secrets, схему
`SUPABASE_STAGE4.sql` уже вставил). Далее — команда «мержи».

### Сессия 6 — 2026-08-29 — Мобильная доводка auth-экрана (login/register) + разбор «Load failed»
**Ветка:** `arena/01a04ceb-idle-test`

**Диагноз «Load failed» при регистрации — РЕШЁН владельцем:**
- Причина была НЕ в коде и НЕ в отсутствии SQL. Опечатка в `VITE_SUPABASE_URL`:
  владелец вставил `https://dnygpoldmtrhpspacipt.supabase.comm` — лишняя буква `m` в конце.
  После исправления на `https://dnygpoldmtrhpspacipt.supabase.co` регистрация работает.
- Симптом «Load failed» на iPhone/WebView — это сетевой сбой запроса к Supabase
  (не наш текст; в коде такой строки нет). Это полезный маркер для будущих
  диагностик: если «Supabase не настроен» предупреждения нет, а «Load failed» есть —
  значит переменные подхватились, но URL/key неверные или проект недоступен.

**Что проверено владельцем:** регистрация (email/password) считается завершённой.

**Что осталось проверить (по STAGE3 handoff):**
- session restore после перезагрузки (не выкидывает на /login);
- guest mode: лесорубство+рыбалка, 24 слота, блок остального, баннер «Зарегистрируйся...»;
- sign out из Sidebar и Settings;
- Google OAuth (после настройки Google provider в Supabase).

**Сделано (по фидбеку владельца из скриншотов на iPhone):**
- Переработана мобильная раскладка авторизации: вместо жёстких абсолютных координат
  (`.auth-card { top: 30.75rem }` и т.п.) теперь flex-центрирование по вертикали/горизонтали
  с `justify-content: safe center` — контент централизован и не требует прокрутки вниз,
  а при переполнении аккуратно уходит наверх (без обрезки формы).
- Поля ввода/кнопки на мобильных сделаны аккуратными и читаемыми: поднят контраст фона
  и рамки поля, увеличен размер шрифта инпута, подсветка фокуса, аккуратные радиусы.
- **Кнопки вместо текстовых ссылок:** «Войти» (primary) → «Создать аккаунт» (secondary) →
  разделитель «или» → «Google» → внизу мелким текстом «Войти гостем».
  На регистрации: «Создать» (primary) → «Уже есть аккаунт? Войти» (secondary), гость не показывается.
- Добавлены `describeAuthError()` и логирование ошибок API в консоль (для диагностики сетевых сбоев).
- Проверки: `corepack pnpm --dir artifacts/my-app typecheck` — чисто; `build` — чисто.

**Что НЕ сделано (намеренно):**
- Этап 4 (создание персонажа) — не начинался; аватары и уникальность никнейма отложены.
- SQL `profiles`/`is_nickname_taken` — будут в Этапе 4 + `SUPABASE_SETUP.md`.

### Сессия 5 — 2026-08-29 — Этап 3: Supabase foundation + AuthGate + guest mode (готово, смёржено)
**Ветка/PR:** `arena/01a04c15-idle-test` → PR #4.

**Сделано:**
- Установлен `@supabase/supabase-js`.
- `src/lib/supabase.ts` — frontend-safe клиент (только `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`), graceful missing-config state, `service_role` не используется.
- `src/store/authStore.ts` — `session/user/profile/loading/isGuest`, `restoreSession`, `signIn`, `signUp`, `signInWithGoogle`, `signOut`, `continueAsGuest`, подписка `onAuthStateChange`.
- `AuthPage` подключён к реальным формам: email/password, регистрация, Google OAuth, guest-вход, валидация и сообщения об ошибках/подтверждении.
- `App.tsx` — AuthGate: незалогиненный → `/login`, гость → limited game shell, зарегистрированный → full shell; session restore при старте.
- Guest mode в `src/lib/guestMode.ts` и `src/store/*`:
  - прогресс в `sessionStorage` (изменён `saveManager.ts`);
  - доступны лесорубство + рыбалка + 24 слота;
  - заблокированы бой, крафт/cooking/firemaking/smithing, горное дело, расширение инвентаря;
  - баннер «Зарегистрируйся, чтобы сохранить прогресс.» в Dashboard/Sidebar/MobileNav/Inventory/Settings.
- `Sidebar`/`MobileNav` скрывают недоступные гостю разделы; в Sidebar/Settings добавлены статус аккаунта и sign out.
- `vite.config.ts` — отдельный vendor-chunk для Supabase; build чистый.
- Добавлен `SUPABASE_SETUP.md` — инструкция по подключению в Replit (URL + anon key, email/Google provider, таблица `profiles`).
- `.gitignore` — исключены `.env`, `.env.local`, `.env.*.local`.

**Проверки:**
- `corepack pnpm --dir artifacts/my-app typecheck` — успешно.
- `corepack pnpm --dir artifacts/my-app build` — успешно, без Vite warnings.

**Что НЕ сделано (намеренно):**
- Cloud save / профиль прогресса через Supabase (следующий этап).
- Google provider может требовать настройки в Supabase (код готов, реальность зависит от владельца).
- Этап 4 (создание персонажа).

**Следующий шаг после мержа:**
- Новый чат начинает с тестирования в Replit: `/login`, `/register`, guest-режим, session restore, Google OAuth, sign out.
- Затем Этап 4: создание персонажа (nickname, аватар из `icons/characters/heroes/`, стартовые характеристики, переход в игру).

### Сессия 4 — 2026-08-29 — Этап 3: визуальный auth-shell Login/Register (внедрён, Supabase ещё нет)
**Ветка:** `arena/01a049b7-idle-test`

**Сделано:**
- После серии визуальных итераций утверждён auth background: тёплая таверна у камина, герб Aethelia с топором+пером над камином, bard, elf+dwarf, правая часть без пустой заглушки.
- Approved background оптимизирован и добавлен в приложение: `public/assets/art/auth_tavern_background.webp`.
- Clean-печать сохранена отдельным asset-файлом: `public/assets/icons/ui/auth/aethelia_seal_clean.webp` / `public/assets/icons/ui/auth/aethelia_seal_clean.png`; в маленькую auth-форму её не ставить, т.к. на малом размере выглядит шумно/криво.
- Добавлена страница `src/pages/AuthPage.tsx` с визуальными режимами login/register.
- `App.tsx`: routes `/auth`, `/login`, `/register` выводят fullscreen auth-screen без sidebar/topnav.
- `index.css`: добавлены стили Stage 3 visual auth — прозрачный frameless glass/tint, компактные поля/кнопки, desktop/mobile адаптив, fire glow, embers/dust, soft entrance, reduced-motion.
- Mobile-правка владельца учтена: поля и кнопки короче и меньше, auth поднят выше, фокус crop на камине/гербе.
- Временные review-мокапи удалены перед коммитом; подробный handoff оставлен в `STAGE3_AUTH_HANDOFF.md`.

**Проверки:**
- `corepack pnpm --dir artifacts/my-app typecheck` — успешно.
- `corepack pnpm --dir artifacts/my-app build` — успешно, без Vite warnings после тех-правки `tooltip.tsx`/`vite.config.ts`.
- Dev preview поднимался командой `corepack pnpm --dir artifacts/my-app dev --host 0.0.0.0`; маршруты `/login` и `/register` отдавали HTML 200.

**Что ещё НЕ сделано:**
- Supabase клиент/пакет не добавлен.
- `authStore`, session restore, Google OAuth, sign out, AuthGate и guest restrictions ещё не реализованы.

**Следующий шаг:**
Сначала владелец проверяет live-визуал `/login` и `/register`; после подтверждения — Supabase foundation по `STAGE3_AUTH_HANDOFF.md` и `ROADMAP.md`.

### Сессия 3 — 2026-08-28 — Этап 2: финальная полировка SplashScreen (завершён)
**Ветка:** `arena/01a049b7-idle-test`

**Сделано:**
- По фидбеку владельца доработана ключевая анимация заставки: теперь спокойно и осторожно качается именно центральная вывеска/щит на цепях, а не весь фон таверны.
- `artEngine.ts`: добавлены `SignMotionConfig` и `LightBloomConfig`; слой вывески вырезается мягкой маской, рисуется отдельно от статичного фона, под ним создаётся clean-plate, чтобы не было двойного силуэта при микропокачивании.
- `artRegistry.ts`: для `splash_wide.webp`, `splash_tall.webp`, `splash_square.webp` заданы отдельные области вывески, pivot-точки и одинаково спокойные параметры движения (амплитуда < 1°, период ~8.2 сек).
- Добавлены локальные пульсации света от фонаря, камина и свечей; старые эффекты (пыль/искорки, виньетка, тёплое мерцание, fade-in/fade-out) сохранены.
- `SplashScreen.tsx`: в `AnimatedArt` передаются параметры `signMotion`/`lightBlooms`; исправлена готовность арта — прогресс считает арт завершённым только после реального decode/load, а не просто по известному режиму.
- `index.css`: мягкая полировка HUD заставки — reveal арта, появление нижнего блока, shimmer прогресс-бара, дыхание процентов/подсказки, fallback-анимация герба; учтён `prefers-reduced-motion`.
- Временные review-скриншоты/контакт-листы удалены из рабочего дерева, чтобы не тащить мусор в репозиторий.

**Проверки:**
- `pnpm typecheck` — чисто.
- `pnpm --filter ./artifacts/my-app build` — успешно; остались только старые предупреждения Vite про sourcemap/chunk size.

**Следующий шаг:**
ЭТАП 3 — Авторизация + Регистрация на Supabase: клиент, authStore, Login/Register на gameUI, protected routes, гостевой режим с ограничениями.

### Сессия 2 — 2026-08-28 — Этап 2: SplashScreen (завершён)
**Ветка/PR:** `arena/01a0494e-idle-test` → PR #2 (смёржен в main)

**Сделано:**
- `WhatsNewModal.tsx` — модалка «Что нового» на gameUI (GModal/GBadge/GButton/GDivider);
  показывается после fade-out заставки при непросмотренных версиях changelog;
  по закрытию `markChangelogSeen()`. Подключена в `App.tsx`.
- SplashScreen: реальный прогресс загрузки (шрифты `document.fonts.ready` + арт + мин. время
  ~2.6 сек) вместо фейкового таймера; переведён на CSS-переменные (правило №3);
  версия из `CURRENT_VERSION` (changelog.ts).
- Полноэкранный арт: 3 варианта сцены таверны — `splash_wide.webp` (16:9, десктоп),
  `splash_tall.webp` (9:16, телефон), `splash_square.webp`; выбор через `pickSplashArt(w,h)`
  в `artRegistry.ts`; artEngine получил режим `fit:'cover'` (запас 4% под покачивание).
- Оптимизация: WebP ~110 КБ вместо PNG 2.4 МБ (~20× быстрее загрузка);
  preload арта в `index.html` до исполнения JS-бандла.
- Фиксы typecheck: дубликат ключа `amber` в `ActionProgressBar.tsx`;
  `addSkillXp` → `addXp` в `offlineProgress.ts`. `pnpm typecheck` чистый.
- Фикс «двух загрузочных экранов»: фолбэк-герб теперь только при реальной ошибке
  загрузки арта (ошибка/таймаут 1.5с), пока арт в пути — нейтральный тёмный фон,
  арт проявляется через fadeIn 0.5s. (Перенесён владельцем руками через Replit,
  т.к. сессия была запечатана после мержа PR #2 — отсюда и родилось правило №6.)
- В `index.css` добавлены keyframes `fadeIn`/`slideUp` (их ожидал GModal).

**Уроки/грабли:**
- Мерж PR закрывает GitHub-доступ сессии → мержить только в самом конце чата.
- Превью Arena на iPhone не работает (заглушка) → тестируем через Replit Webview.
- Туннели наружу из песочницы агента невозможны (сеть закрыта, кроме GitHub).

**Как проверить модалку «Что нового» повторно:**
`localStorage.removeItem('aethelia_last_seen_version'); location.reload();`

### Сессия 1 — Этапы 0–1 (до ведения DEVLOG)
- Базовый геймплей (6 навыков + бой), тик-менеджер, оффлайн-прогресс, стиль Wooden Tavern.
- Этап 1: `src/shared/ui/gameUI.tsx` — все G-примитивы (GPanel, GButton, GInput, GModal,
  GBadge, GAvatar, GProgressBar, GDivider, GTooltip, GCard, GTag, GEmptyState и др.).
- `src/data/changelog.ts` — типы, цвета, версия 0.1.0 «Рождение мира», утилиты
  getUnseenChangelog/markChangelogSeen.
- PR #1: canvas-движок artEngine (режимы sign/sigil/scene/cutout) + splash.png.