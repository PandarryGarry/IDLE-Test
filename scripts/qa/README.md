# QA-браузер Aethelia (песочница Arena)

Постоянные скрипты. Их **не переписываем** под каждый прогон:
учётка и URL — в env, сценарии — в этом каталоге.

| Скрипт | Зачем |
| --- | --- |
| `setup-browser.mjs` | Один раз на песочницу: Chromium из npm |
| `road.mjs` | Холодный старт 0–6 + возвращение, без «Aethelia / Загрузка...» |
| `auth.mjs login\|register` | Вход/регистрация живым UI |
| `tour.mjs` | Полный путь: холодный 0→игра + возвращение Каеля (без облака) |
| `ACCEPTANCE.md` | Приёмка PR #9: агентский тур + чеклист Replit |

Скриншоты эмблемы по-прежнему в `scripts/in-game-screenshots/` — тот же браузер.

## Почему не Playwright / apt

В Arena:

- root нет, `apt-get` недоступен;
- заблокированы `cdn.playwright.dev`, `deb.debian.org`, `objects.githubusercontent.com`;
- **работают** `registry.npmjs.org` и GitHub API.

Поэтому браузер — пакет `@sparticuz/chromium`, недостающие `.so` —
из его `al2023.tar.br`. Способ найден и проверен 2026-08-30
(снимки «Топор и Перо» в интерфейсе).

Браузер **не в git**: каталог `/home/user/ui_shot`.

## Установка (один раз после пересоздания песочницы)

```bash
node scripts/qa/setup-browser.mjs
```

Внутри: `npm i puppeteer-core@23.11.1 @sparticuz/chromium@131.0.1` в `QA_BROWSER_DIR`
(пара под Chrome 131; latest 149 ломает CJS require и протокол),
распаковка `al2023` + шрифтов, копирование DejaVu (кириллица).

Ручной эквивалент — `scripts/in-game-screenshots/README.md`.

Запуск Chromium всегда с:

- `LD_LIBRARY_PATH=/tmp/al2023/lib` (`libnss3.so` и соседние);
- `FONTCONFIG_PATH=/tmp/fonts`.

## Dev-сервер

Не через одноразовый `bash` (процесс убьётся по таймауту) — фоном:

```bash
cd artifacts/my-app && corepack pnpm dev --host 0.0.0.0 --port 3000
```

## Тестовая среда без Supabase

`tour.mjs` **не требует облака**. Скрипт ставит
`localStorage.aethelia_qa_mock_v1=1` до загрузки игры.

Мок (`src/lib/qaMock.ts`) включается если:

1. hostname localhost/127.0.0.1 **и** флаг в localStorage, или
2. Vite DEV **без** `VITE_SUPABASE_URL`, или
3. сборка с `VITE_QA_MOCK=1`.

В Replit с ключами — реальный Supabase. Регистрация/герой мока живут
в `localStorage.aethelia_qa_db_v1` вкладки.

Нужен **dev** на :3000 (`pnpm dev`), не `vite preview`.

```bash
node scripts/qa/tour.mjs          # холодный + возвращение
node scripts/qa/tour.mjs cold
node scripts/qa/tour.mjs returning
```

Приёмка и запреты: `scripts/qa/ACCEPTANCE.md`.

**Превью Arena** (iframe) у владельца белое / connection reset — не чинить.
Владелец тестирует в Replit.

## Учётка для auth (реальный Supabase)

Секреты в чат и в репозиторий не класть.

```bash
cp scripts/qa/env.example scripts/qa/.env.local
# впиши QA_EMAIL / QA_PASSWORD тестового аккаунта Supabase
```

`.env.local` в gitignore.

```bash
node scripts/qa/auth.mjs login
node scripts/qa/auth.mjs register
node scripts/qa/road.mjs
```

Снимки: `/tmp/aethelia-qa-out/` (или `QA_OUT`).

## Флаги, без которых прогон врёт

Через `evaluateOnNewDocument` **до** `goto`:

- `aethelia_prologue_seen_v1=1` — сразу вывеска, не акт 0;
- `aethelia_last_seen_version=0.2.0` — без модалки «Что нового».

Гость: `button.auth-link--guest`. Правила/создание для гостя не показываются.
