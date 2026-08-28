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

**Завершены: Этапы 1 и 2. Этап 3 начат: визуальный auth-shell для Login/Register внедрён, но Supabase-логика ещё НЕ подключена.**

Где продолжать следующему агенту:
- сначала прочитать `STAGE3_AUTH_HANDOFF.md`;
- затем проверить live routes `/login` и `/register` в Replit/Webview;
- если владелец подтверждает визуал — продолжать с Supabase foundation/authStore/AuthGate/guest restrictions.

Что уже зафиксировано по Stage 3 visual:
- approved background: тёплая живая таверна у камина с гербом Aethelia (топор + перо), bard, elf+dwarf, правая часть без пустой заглушки;
- runtime asset: `artifacts/my-app/public/assets/art/auth_tavern_background.webp`;
- clean seal asset оставлен: `artifacts/my-app/public/assets/icons/ui/auth/aethelia_seal_clean.webp` / `artifacts/my-app/public/assets/icons/ui/auth/aethelia_seal_clean.png`;
- auth routes: `/auth`, `/login`, `/register`;
- файлы реализации: `src/pages/AuthPage.tsx`, `src/App.tsx`, `src/index.css`;
- визуальный принцип: без общей рамки, без рамки auth-panel, прозрачный frameless glass/tint, компактные controls;
- mobile: фокус на камине/гербе, auth поднят выше, поля и кнопки короче/меньше, registration scroll-safe.

Для Supabase (следующий шаг):
- ключи только через Replit Secrets / `.env.local`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`;
- не просить секреты в чат и не использовать `service_role` во frontend;
- гостевой режим: sessionStorage, лесорубство+рыбалка+24 слота, без боя/крафта/облака, баннер «Зарегистрируйся, чтобы сохранить прогресс.»

После Этапа 3 → Этап 4 (создание персонажа), далее по роадмапу.
Параллельная большая задача (Этапы 7–8): привязка 900+ иконок к предметам —
агент сканирует папки скриптом, генерирует каркас данных (id/iconPath/тир из имён файлов),
пишет названия/описания/лор, владелец контролирует и правит.

---

## 📜 ЖУРНАЛ СЕССИЙ (новые записи — СВЕРХУ)

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
- `corepack pnpm --dir artifacts/my-app build` — успешно; остались только старые Vite warnings про sourcemap `tooltip.tsx` и chunk size >500 kB.
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