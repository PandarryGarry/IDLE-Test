---
name: Aethelia workflow
description: Owner review loop, branch/session rules
---

## Owner

- Tests **only in Replit** (iPhone). Arena iframe is white — never fix it.
- `main` has Supabase secrets and the live hero. Feature work is on `arena/…`.
- Pull this branch: `git fetch origin arena/01a07240-idle-test && git reset --hard origin/arena/01a07240-idle-test`
- Merge to `main` only when the owner says **«мержи»**, after they logged in
  with the real account on the branch.
- One task at a time. Not in a hurry. Ask if unclear.

## Agent

- Push only to this session's `arena/…` branch.
- No secrets in chat. No Google Fonts. No Playwright. Don't edit `.replit`
  without need. Don't wire ticks / unused item icons until asked.

## Checks

```bash
corepack pnpm --dir artifacts/my-app typecheck
corepack pnpm --dir artifacts/my-app test:pillars
```
