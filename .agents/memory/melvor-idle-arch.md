---
name: Melvor Idle Clone Architecture
description: Key architectural decisions, patterns, and gotchas for the Melvor Idle clone in artifacts/my-app
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

## cn() location
- `import { cn } from '@/lib/utils'`

## CSS keyframes
- `toast-shrink` keyframe in `src/index.css` for notification progress bar animation
- Combat stop preserves the combat log for review; CombatPage renders chronological entries, pauses auto-follow when scrolled up, and offers a latest-entry button
- `SkillAction.description` is optional metadata rendered in `ActionGrid`; action output IDs are inferred from typed action fields and open `ItemInfoPopover`
