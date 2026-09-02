---
name: Aethelia Idle RPG Architecture
description: Key architectural decisions, patterns, and gotchas for the Aethelia Idle RPG in artifacts/my-app
---

## Routing
- `/inventory` — item storage (InventoryPage.tsx, uses bankStore for items/gp)
- `/bank` — GP management / slot upgrades (BankPage.tsx)
- `/combat`, `/woodcutting`, `/fishing`, `/mining`, `/cooking`, `/smithing`, `/firemaking`
- Uses `wouter` for routing with `WouterRouter base={import.meta.env.BASE_URL}`

## Stores
- `bankStore` — items[], gp, maxSlots. Methods: `addItem`, `removeItem`, `removeItems`, `addGp`, `spendGp` (NOT `removeGp`), `sellItem`, `upgradeSlots()` (no args, adds 12 slots), `lockItem`, `setSort`, `setSearch`
- `combatStore`, `playerStore`, `gameStore`, `notificationsStore`, `settingsStore`

## Timing rule
- Game loop: `performance.now()` everywhere
- Save/offline calc: `Date.now()` for wall-clock

## Progress bars
- `ActionProgressBar` — CSS animation, zero React re-renders during fill, used for skill actions
- `ProgressBar` — static width with CSS transition, used for HP and XP bars

## Combat scroll fix
- Remove `scrollIntoView` on the page — scroll ONLY the combat log div itself via `el.scrollTop = el.scrollHeight` on `el.parentElement` of `combatLogEndRef`

## Notifications
- `notificationsStore`: auto-dismiss all types (levelup: 6s, others: 4s)
- `NotificationToast`: glassmorphism `bg-black/50 backdrop-blur-xl`, MAX_VISIBLE=4, `flex-col-reverse` so newest at bottom, progress bar via `toast-shrink` CSS keyframe in index.css
- `ItemInfoPopover` is the shared click-friendly item detail surface; `ItemIcon` supports `showTooltip={false}` for nested popovers

## i18n
- `src/lib/i18n.ts`: flat key→string, `Partial<typeof en>` for ru, falls back to en
- ALL UI strings must use `t('key')` — no hardcoded English/Russian
- Renamed `cooking.inBank` → `cooking.inInventory`, `notif.bankFull` → `notif.inventoryFull`
- Bank keys now split: `inventory.*` for item storage page, `bank.*` for GP management page

## Sidebar / MobileNav
- Sidebar: `hidden md:block` wrapper in App.tsx
- MobileNav: fixed bottom-0 h-14, `md:hidden`
- Skills tab opens slide-up panel with only GATHERING + ARTISAN skill chips; Inventory ↔ Bank links live in their page headers
- Bottom nav tabs: Home / Combat / Skills(toggle) / Inventory / Settings

## Hero / attributes (Stage 5)
- Route `/hero` → `HeroHubPage.tsx`; board in `components/HeroBoard.tsx`.
- 4 pillars, 3 rays each; ray = branch node + 2 deep passives = 36 nodes total.
- Node rank 1..3 (`NODE_RANK_CAP` in `src/data/balance/pillars.ts`). Ladder: next
  node on a ray unlocks only when the previous is maxed (`isNodeUnlocked`).
- State: `pillarRanks` + `branchRanks` + `passiveRanks` in
  `save_data.attributes` (`characterAttributes.ts` migrates missing keys to 0).
- Spending: `spendBranchPoint(state, { kind: 'branch' | 'passive', id })`;
  UI reason string from `nodeBlockReason()`.
- Passive effects are NOT wired — UI says «Эффект: не подключён» on purpose.
- ALL balance numbers live in `src/data/balance/` — never inline in components.

## cn() location
- `import { cn } from '@/lib/utils'`

## QA screenshots (hero screen)
- `node scripts/qa/hero.mjs seed` once, then `node scripts/qa/hero.mjs` — shots of
  Тело/Экип/Нити/Путь. Seed file: `/tmp/aethelia-qa-hero-seed.json`.
- Direct `/hero` navigation fails: until a character is selected the road sends
  you to character select — the script goes through the game first.
- Two `a[href="/hero"]` links exist (sidebar + bottom nav); click the visible one.

## Agent has no vision
- Screenshots cannot be inspected directly. Verify layout via DOM measurements
  (bounding boxes, overflow, `data-*` flags) and ImageMagick pixel stats
  (`convert ... -crop ... -format '%[fx:mean]'`), then show frames to the owner.

## CSS keyframes
- `toast-shrink` keyframe in `src/index.css` for notification progress bar animation
- Combat stop preserves the combat log for review; CombatPage renders chronological entries, pauses auto-follow when scrolled up, and offers a latest-entry button
- `SkillAction.description` is optional metadata rendered in `ActionGrid`; action output IDs are inferred from typed action fields and open `ItemInfoPopover`
