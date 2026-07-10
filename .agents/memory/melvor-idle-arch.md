---
name: Melvor Idle Clone Architecture
description: Key decisions and gotchas for the Melvor Idle clone in artifacts/my-app
---

## Timing clock — use performance.now() everywhere
All game-loop timing (startSkillAction, tick, nextActionTime, actionStartTime) uses `performance.now()` (monotonic). `Date.now()` is only used for persistence metadata (savedAt timestamps). Mixing the two clocks causes action completion checks to never fire.

**Why:** tickManager passes performance.now() from rAF into gameStore.tick(). If startSkillAction used Date.now(), nextActionTime would be in epoch ms while the tick clock is in monotonic ms — mismatched by billions.

**How to apply:** Any new action scheduling must use performance.now(). Only saveManager/offlineCalc may use Date.now() for wall-clock purposes.

## Offline calc — gathering skills only get items
offlineCalc.ts grants items offline only for gathering skills (woodcutting, mining, fishing). Artisan skills (cooking, smithing, firemaking) get XP only — their offline item grants would violate game economy (output without consuming inputs).

**Why:** Artisan skills consume inputs that may not have been present during the offline period. Granting 50% output as a "shortcut" creates items from nothing.

## Equip/unequip — transactional
unequipItem() adds the item to bank FIRST, then removes from equipment. If bank is full, it returns null without unequipping. equipItem() checks bank capacity before displacing a previously equipped item. Never remove from equipment first.

## Combat tick — capped at 10 iterations/frame
tickManager caps combat catch-up to MAX_COMBAT_TICKS_PER_FRAME=10 to prevent frame-freeze after tab suspension. Excess accumulator is drained (reset to 0) to prevent future runaway.

## Store structure
- playerStore: skills + equipment + prayer points
- bankStore: items + GP + slots
- gameStore: active skill/action + tick loop
- combatStore: combat state + log
- notificationsStore: toast queue
- settingsStore: user preferences

## cn() utility
cn() (clsx + tailwind-merge) is exported from @/lib/utils. All shadcn/ui components import it from there. This must remain — removing it breaks all UI components.

## ALL_SKILL_IDS constant
Exported from @/data/types.ts as a flat union of COMBAT_SKILLS + GATHERING_SKILLS + CRAFTING_SKILLS + OTHER_SKILLS. Pages that need to iterate all skills import it from there.
