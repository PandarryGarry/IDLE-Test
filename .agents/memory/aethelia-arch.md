---
name: Aethelia Idle RPG Architecture
description: Key architectural decisions for artifacts/my-app
---

## Layout

See `artifacts/my-app/src/ARCHITECTURE.md` and
`.agents/memory/aethelia-arch.md`. Screens live in `features/`,
numbers in `data/balance/`, pillars in `domain/attributes/`. There is no
`src/pages/` and no `gameEngine/` — those names are historical.

After round 6 the only profession is **«Сбор»** (`foraging`); combat is
built on the four pillars. Legacy skills/domains were removed and must not
be reintroduced.

## Splash / first frame

`lib/bootPreload.ts`: while the sign is up, decode onboarding art + pillar/branch
hub icons + known hero avatars/dolls. Do not wait for 800 item icons.
`loading="lazy"` remains on profession/inventory slots. Do not change
`minDisplayTimeMs=4000` or `SIGN_MIN_MS` without the owner.

## Routing

- `/hero` — HeroHubPage (Тело / Экип / Нити / Путь)
- `/inventory` — InventoryPage (items + gp). **Банка нет** и в ближайшее
  время не планируется; «банк» в коде — только legacy-чтение старых
  сейвов (3 места, см. `BANK_FOUNDATION.md`). Мёртвый редирект
  `/inventory`→`/inventory` в App.tsx известен — чинится вместе с банком.
- `/combat`, `/foraging`, `/settings`, `/admin/*`, auth + onboarding fullscreen

`wouter`; routes must not mount under the splash (iOS autofill).

## Saves / Supabase

- Account: `profiles`. Hero row: `characters` (`SUPABASE_STAGE4.sql`).
- Progress: one JSON `save_data`. Migrator in `characterAttributes.ts`.
- Local ~30s, cloud ~3 min + pagehide. **Авторитетный сейв — самый свежий**
  (`reconcileCharacterSave`, PR #17): слепое применение облачного слепка
  запрещено.
- Replit `main` has live keys; this
  sandbox usually does not. Agent does not log into the owner's account.

## Repo notes

- Items catalog: `domain/items/catalog/` (630 шт.), вход `domain/items/index.ts`.
  Тиры снаряжения 1–12 генерируются из `data/balance/gear.ts`; уники — `gearUnique`.
- Canvas/`artifacts/mockup-sandbox` удалён 2026-09-10 (мокапы реализованы).
  Порт 8081 свободен; канон портов — 8080 web / 5000 api (`REPLIT_SETUP.md`).
- `lib/db`, `api-server`, `api-*` — шаблонные пакеты Replit, игра их не вызывает
  (my-app ходит в Supabase напрямую). Не переносить, не подключать без владельца.

## Hero / attributes

- Start pillars **4/3/2/1** (not percent 2+/1−).
- Player-facing copy: `ruleRu`. Unwired effects: honest «не действует».
- XP table in `data/balance/xpRates.ts` — **not** wired to ticks.
- Passive combat effects not wired.

## Images

WebP only via `iconUrl()` / `getAvatarPath()`. Pipeline: `scripts/assets/README.md`.

## Agent has no vision

Verify with DOM / ImageMagick, then the owner looks in Replit. Never fix the
Arena iframe.
