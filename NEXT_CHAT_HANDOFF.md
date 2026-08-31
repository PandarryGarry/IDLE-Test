# Следующий чат — точка продолжения Aethelia

> **Главный принцип от владельца:** мы не торопимся. Создаём всё осторожно,
> корректно и правильно. Если что-то не понятно — сначала спрашиваем, а не
> пытаемся сделать всё и сразу, потому что потом придётся всё переделывать.

## ⚠️ ПЕРВЫЙ ШАГ — спросить владельца про дорогу. Не код.

PR #9 **смёржен в `main`** (2026-08-31). Эта сессия запечатана.

Владелец после мержа проверяет дорогу в **Replit** (`git pull` на `main`).
Превью Arena не использовать.

1. Прочитать этот файл, `DEVLOG.md` (Сессия 17), `STAGE5_FOUR_PILLARS_HANDOFF.md`,
   `scripts/qa/ACCEPTANCE.md`, `scripts/qa/README.md`, `scripts/assets/README.md`.
2. **Сразу спросить владельца:** дорога в Replit после мержа ок?
   Холодный 0→игра и возвращение того же героя. Если нет — чинить, 5A нет.
3. Если «всё отлично» — тогда изолированный **5A** строго по контракту.
   Не начинать 5A в том же дыхании, что вопрос, пока нет «ок».

## Что лежит в `main` после PR #9

- Hotfix дороги: нет экрана «Aethelia / Загрузка...»; вывеска и акт 0 —
  единственные загрузки; `authReady`; `loadedUserId`; finale только по флагу;
  прогрев артов пролога.
- После signIn/signUp: `loadCharacters`, затем `navigate('/rules')`.
- QA без облака: `src/lib/qaMock.ts` + `scripts/qa/tour.mjs`.
- Конвейер картинок: 994 WebP, `iconUrl()`, `scripts/assets/optimize.mjs`.
- Контракт Этапа 5 (смысл, не код): `STAGE5_FOUR_PILLARS_HANDOFF.md`.

Google Fonts сняты (Arena iframe всё равно белый). **Не чинить Arena.**
В Replit шрифт — системный serif. Cinzel/Inter не возвращать без вопроса.

## Тесты агента (документация + код)

Канон: `scripts/qa/README.md` и `scripts/qa/ACCEPTANCE.md`.

| Файл | Зачем |
| --- | --- |
| `scripts/qa/setup-browser.mjs` | Chromium в песочнице Arena (один раз) |
| `scripts/qa/tour.mjs` | холодный 0→игра + возвращение Каеля, **без Supabase** |
| `scripts/qa/road.mjs` | короче: акты 0–6 + возвращение |
| `scripts/qa/auth.mjs` | живой login/register (нужен реальный аккаунт в env) |
| `artifacts/my-app/src/lib/qaMock.ts` | мок auth/CRUD в localStorage вкладки |

**Браузер не Playwright и не apt.** Канон:

- `@sparticuz/chromium@131.0.1` + `puppeteer-core@23.11.1`
- **не** `@sparticuz/chromium@149` (ломает CJS)
- каталог браузера: `/home/user/ui_shot` (не в git)
- `LD_LIBRARY_PATH=/tmp/al2023/lib`, `FONTCONFIG_PATH=/tmp/fonts`

Прогон в Arena (если чинить дорогу):

```bash
corepack pnpm --dir artifacts/my-app typecheck
# dev фоном, не одноразовый bash:
corepack pnpm --dir artifacts/my-app dev --host 127.0.0.1 --port 3000
node scripts/qa/setup-browser.mjs   # если нет /tmp/chromium
node scripts/qa/tour.mjs            # ожидание: exit 0, ~45–60 с
```

Кадры: `/tmp/aethelia-qa-out/tour/` (или `QA_OUT`). Запрещён кадр
«Aethelia / Загрузка...».

Мок включается если:

- localhost + `localStorage.aethelia_qa_mock_v1=1` (ставит `tour.mjs`), или
- Vite DEV **без** `VITE_SUPABASE_URL`, или
- сборка `VITE_QA_MOCK=1`.

Replit с ключами — **реальный Supabase**, мок выключен.
Учётка тура (только мок): `qa.tour@aethelia.local`, герой `Каель`.

### Не ретраить

- Playwright / apt / chromium 149.
- `enableQaMock({reset})` на каждый document (стирает БД на Vite reload).
- Returning + `dropSession` + логин + `navigate('/rules')` → пустой `#root`.
- Менять `minDisplayTimeMs` (4000) и `SIGN_MIN_MS` без владельца.
- Чинить белый экран Arena iframe.

Владелец тестирует только Replit. В Replit: `git pull` на `main`
(ветка PR после мержа не нужна).

## Дорога (не переписывать)

```text
ПЕРВЫЙ ЗАПУСК:
акт 0 «ЗНАК» → пролог 6 битов → толчок в auth (без вывески) →
rules → ложа → create → утро и первый шаг → игра

ПОВТОРНЫЙ ВИЗИТ:
вывеска ~4с → «Знакомый скрип вывески.» → выбор героя →
«Снова в путь, {ник}.» → игра
```

Пролог один раз на устройство (`aethelia_prologue_seen_v1`).
Закон арта: полный кадр без обрезки.

## Контракт Этапа 5 — смысл закрыт, кода нет

Канон: `STAGE5_FOUR_PILLARS_HANDOFF.md`.

- Нет ярлыка класса. Профессии = ремёсла, дают бонусы к столпам.
- Энергия, не мана. Бой/опасная зона — да; спокойный крафт — нет.
- Репутация добро/зло, старт 0. Не rebirth.
- Offline: еда → работа; без еды: 1 отдых, 2 — город без сознания,
  −15–25% лута **этой ночи**.
- Очки: старт **0**. +1 столп / уровень. +1 ветвь / 5 уровней (первое на 5-м).
- % расы от скрытой базы тела (иначе 0 очков = одинаковые расы).
- 1 бесплатный respec; не во время похода. Выход без еды — предупреждение, не блок.
- Паутина ветвей + паутина пассивов + полный экран героя — **не 5A**.
- Цифры только `src/data/balance/`. Открыто: XP-кривая, % профессий,
  1+/1− репутации, золотой тик, mapping Attack/Strength.

### 5A (только после «дорога ок»)

Типы 4 столпов / 12 ветвей, матрица рас вместо `StatKey`, versioned
`attributes` + мигратор, calculator + тесты, каркас `src/data/balance/`
с заглушками. Без паутины, без боя, без выдуманных процентов в UI.

## Что нельзя

- Хардкод цветов; новые экраны не на `gameUI.tsx`.
- `.png` в `<img>` — только `iconUrl()` / `getAvatarPath()`.
- Секреты в чат. Просить ключи — запрещено.
- Монтировать маршруты под заставкой (iOS autofill).
- 5A до «ок» владельца по дороге в Replit.

## Замечено на кадрах (не блокер, спросить)

- У части пунктов правил нет иконки.
- На дашборде много пустого поля под карточкой героя.
- «ЭТЕЛИЯ» системным serif (Google Fonts сняты).

## Обязательно прочитать

1. `DEVLOG.md` — Сессия 17.
2. Этот файл.
3. `scripts/qa/ACCEPTANCE.md` + `scripts/qa/README.md`.
4. `scripts/assets/README.md`.
5. `STAGE5_FOUR_PILLARS_HANDOFF.md`.
6. `ROADMAP.md`.
7. `STAGE4_CHARACTER_HANDOFF.md`.

## Стартовая фраза — вставить в новый чат

```text
Продолжаем Aethelia. PR #9 смёржен в main.

Прочитай DEVLOG.md (Сессия 17), NEXT_CHAT_HANDOFF.md,
STAGE5_FOUR_PILLARS_HANDOFF.md, scripts/qa/ACCEPTANCE.md,
scripts/qa/README.md, scripts/assets/README.md.

ПЕРВЫМ ДЕЛОМ спроси меня: дорога в Replit после мержа ок?
(холодный 0→игра и возвращение того же героя). 5A не начинать,
пока я не скажу, что дорога отличная.

Если дорога красная — чини в новой arena-ветке, тесты:
typecheck + node scripts/qa/tour.mjs (мок, без Supabase;
браузер @sparticuz/chromium@131.0.1, не Playwright).
Превью Arena не чинить. Секреты в чат не просить.

Если дорога ок — тогда только 5A по контракту (типы, мигратор,
калькулятор, balance-заглушки). Паутину и полный UI героя не делать.

Мы не торопимся.
```
