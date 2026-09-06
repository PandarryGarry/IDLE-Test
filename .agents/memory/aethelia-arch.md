---
name: Aethelia Idle RPG Architecture
description: Key architectural decisions for artifacts/my-app
---

## Layout

See `artifacts/my-app/src/ARCHITECTURE.md`. Screens live in `features/`,
numbers in `data/balance/`, pillars in `domain/attributes/`. There is no
`src/pages/` and no `gameEngine/` — those names are historical.

## Splash / first frame

`lib/bootPreload.ts`: while the sign is up, decode onboarding art + pillar/branch
hub icons + known hero avatars/dolls. Do not wait for 800 item icons.
`loading="lazy"` remains on profession/inventory slots. Do not change
`minDisplayTimeMs=4000` or `SIGN_MIN_MS` without the owner.

## Routing

- `/hero` — HeroHubPage (Тело / Экип / Нити / Путь)
- `/inventory` — InventoryPage (items + gp). `/bank` redirects here.
- `/combat`, gathering/artisan routes, `/settings`, auth + onboarding fullscreen

`wouter`; routes must not mount under the splash (iOS autofill).

## Saves / Supabase

- Account: `profiles`. Hero row: `characters` (`SUPABASE_STAGE4.sql`).
- Progress: one JSON `save_data`. Migrator in `characterAttributes.ts`.
- Local ~30s, cloud ~3 min + pagehide. Replit `main` has live keys; this
  sandbox usually does not. Agent does not log into the owner's account.

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
