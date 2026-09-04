# 🚀 REPLIT_SETUP.md — порты и запуск (канон)

> **Назначение файла:** единственная правда о том, на каких портах что слушает
> и почему. Правки конфигов Replit — сюда, иначе проект снова стартует
> с белым экраном / `connection reset`.
>
> Основание: коммит `d64df08` (владелец, 2026-09-04) — «Пришлось некоторые
> настройки исправлять в реплит». Ниже задокументировано что именно и почему.

---

## 1. Карта портов — ЗАПОМНИТЬ

| Артефакт | `kind` | `localPort` | Env в конфиге | Что реально слушает |
|---|---|---|---|---|
| `artifacts/my-app` | `web` | **8080** | `PORT=8080`, `BASE_PATH=/` | Vite: `process.env.PORT \|\| '3000'`, `strictPort: true`, `host: 0.0.0.0` |
| `artifacts/api-server` | `api` | **5000** | (в dev — не задаётся) | Express: `process.env.PORT_API \|\| 5000`, `0.0.0.0` |
| `artifacts/mockup-sandbox` | `design` | **8081** | `PORT=8081`, `BASE_PATH=/__mockup` | Vite; **без `PORT` бросает исключение** (см. `vite.config.ts`) |

Занятые порты: **8080 (web), 5000 (api), 8081 (design-canvas)**.
Вне Replit (локально, без `PORT`) веб-приложение встаёт на **3000** — это норма.

---

## 2. Что было сломано и как починил владелец (`d64df08`)

### Правка 1 — `artifacts/my-app/.replit-artifact/artifact.toml`

```diff
 [[services]]
 name = "web"
 paths = [ "/" ]
-localPort = 19621
+localPort = 8080

 [services.env]
-PORT = "19621"
+PORT = "8080"
 BASE_PATH = "/"
```

**Почему это критично.** В `.replit` воркфлоу запускает dev-сервер так:

```toml
[[workflows.workflow.tasks]]
task = "shell.exec"
args = "PORT=8080 BASE_PATH=/ pnpm --filter @workspace/my-app run dev"
waitForPort = 8080
```

То есть Replit ждёт порт **8080** и проксирует `/` на **8080**, а артефакт
объявлял **19621**. Расхождение даёт ровно тот симптом, который мы видели:
роутер стучится на порт, где никто не слушает → `connection reset` / белое
превью. Усугубляется тем, что у Vite стоит `strictPort: true` — он **не**
переезжает на свободный порт, а падает.

> **Порт веб-приложения — 8080 — обязан совпадать в ТРЁХ местах сразу:**
> 1. `.replit` → `args = "PORT=8080 ..."`
> 2. `.replit` → `waitForPort = 8080`
> 3. `artifacts/my-app/.replit-artifact/artifact.toml` → `localPort` **и** `[services.env] PORT`
>
> Меняешь одно — меняй все три. Это и есть «залог стабильного запуска».

### Правка 2 — `artifacts/api-server/.replit-artifact/artifact.toml`

```diff
 [[services]]
-localPort = 8080
+localPort = 5000
 name = "API Server"
 paths = ["/api"]
```

**Почему это критично.** API-сервер объявлял 8080 — тот же порт, что веб.
Конфликт двух сервисов на одном порту. При этом код всегда слушал 5000:

```ts
// artifacts/api-server/src/index.ts
const port = Number(process.env["PORT_API"]) || 5000;
app.listen(port, "0.0.0.0", ...);
```

Правка привела объявление в соответствие с кодом. **Обрати внимание: код
читает `PORT_API`, а НЕ `PORT`.**

---

## 3. Законы (не нарушать)

1. **8080 = только web.** Никакой другой сервис его не объявляет.
2. **5000 = только api.** Меняется через `PORT_API`, совпадает с `localPort`.
3. **8081 = только mockup-sandbox** (Canvas, `/__mockup`).
4. **`strictPort: true` у Vite не снимать** — иначе порт «уедет» молча,
   и Replit снова будет проксировать в пустоту. Пусть лучше упадёт заметно.
5. **`server.host: '0.0.0.0'`, `allowedHosts: true`, `cors: true`, `hmr: false`**
   в `artifacts/my-app/vite.config.ts` — не трогать. Это то, что позволяет
   открывать приложение в iframe-превью (без `hmr: false` WebSocket клиента
   роняет страницу → белый экран).
6. **Только pnpm.** Корневой `preinstall` намеренно ломает `npm`/`yarn`
   (`Use pnpm instead`). Воркспейс + `catalog:` в `pnpm-workspace.yaml`.
7. **`minimumReleaseAge: 1440` не отключать** — защита от supply-chain атак.
   Исключения — только в `minimumReleaseAgeExclude`.
8. **`BASE_PATH=/`** для web — из него Vite берёт `base`. Для Canvas — `/__mockup`.

---

## 4. Остаточная несогласованность (НАБЛЮДЕНИЕ, не правили)

`artifacts/api-server/.replit-artifact/artifact.toml`:

```toml
[services.production.run.env]
PORT = "8080"        # ← мёртвая строка: код читает PORT_API
NODE_ENV = "production"
```

В проде сервер всё равно встанет на **5000** (fallback в коде), что совпадает
с новым `localPort = 5000`, — то есть **работает правильно**, но строка
`PORT = "8080"` вводит в заблуждение и выглядит как незакрытый конфликт.
Чистый вариант — `PORT_API = "5000"`.

⚠️ **Не правили без команды владельца** (правило «одна задача за раз»).
Скажи — поправим отдельным коммитом.

---

## 5. Прочий каркас Replit

`.replit`:

| Ключ | Значение | Зачем |
|---|---|---|
| `modules` | `nodejs-24`, `python-base-3.13` | Node для игры, Python для конвейера манекенов |
| `[deployment] router` | `application` | Роутинг по `paths` из артефактов |
| `[deployment] deploymentTarget` | `autoscale` | — |
| `[deployment.postBuild]` | `pnpm store prune`, `CI=true` | Не тащить стор в образ |
| `[workflows] runButton` | `Project` → `Aethelia Idle RPG` | Кнопка Run |
| `[agent] stack` | `PNPM_WORKSPACE`, `expertMode = true` | — |
| `[postMerge]` | `scripts/post-merge.sh`, 20 000 мс | `pnpm install --frozen-lockfile` + `pnpm --filter db push` |

`.replitignore` — из образа деплоя исключён `.local` (pnpm store, чтобы не
хранить его дважды). `.gitignore` — `dist/`, `node_modules/`, `.env*`,
`qa_inspect/`, `.shots/`, `artifacts/qa-review/`, `.cache/`, `__pycache__/`.

Продакшен web собирается статикой:

```toml
[services.production]
build = [ "pnpm", "--filter", "@workspace/my-app", "run", "build" ]
serve = "static"
publicDir = "artifacts/my-app/dist/public"
[[services.production.rewrites]]   # SPA: всё на index.html
from = "/*"
to = "/index.html"
```

Продакшен api: сборка `build.mjs` → запуск `node --enable-source-maps
artifacts/api-server/dist/index.mjs` (не через pnpm — быстрее старт),
health-check `/api/healthz`.

---

## 6. Чек-лист запуска с нуля (новая песочница / клон)

```bash
# 1. Зависимости (только pnpm)
corepack enable
pnpm install --frozen-lockfile

# 2. Секреты Supabase — НЕ в чат и НЕ в git (см. SUPABASE_SETUP.md)
#    VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

# 3. Запуск web (Replit: кнопка Run; руками:)
PORT=8080 BASE_PATH=/ pnpm --filter @workspace/my-app run dev

# 4. Проверка, что порты живые
curl -sI http://localhost:8080/ | head -n 1        # web  → 200
curl -s   http://localhost:5000/api/healthz        # api  → ok
```

**Если превью белое / `connection reset`** — первым делом сверь три места
порта 8080 (§2, правка 1) и убедись, что api-server не объявил 8080 (§2,
правка 2). В 9 случаях из 10 дело в расхождении `localPort` ↔ `PORT` ↔
`waitForPort`.
