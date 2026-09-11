---
name: Aethelia workflow
description: Owner review loop, branch/session rules
---

## Owner

- Tests **only in Replit** (iPhone). Arena iframe is white — never fix it.
- `main` has Supabase secrets and the live hero. Feature work is on `arena/…`.
- Pull the **current session's** branch (its name comes with the Arena
  environment, e.g. `arena/01a08a68-idle-test`):
  `git fetch origin && git reset --hard origin/<session-branch>`
- Merge to `main` only when the owner says **«мержи»**, after they logged in
  with the real account on the branch.
- One task at a time. Not in a hurry. Ask if unclear.
- Next strategic stage after cleanup (owner, 2026-09-10): **UI/UX
  unification** (palette, centralized colors/cells/windows). Do NOT do
  spot color fixes before that stage. Bank — only per `BANK_FOUNDATION.md`.

## Agent

- Push only to this session's `arena/…` branch.
- No secrets in chat. No Google Fonts. No Playwright. Don't edit `.replit`
  without need. Don't wire ticks / unused item icons until asked.

## Checks

```bash
corepack pnpm --dir artifacts/my-app typecheck
corepack pnpm --dir artifacts/my-app test:pillars
```
