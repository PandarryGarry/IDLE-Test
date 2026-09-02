---
name: Aethelia workflow
description: How the owner reviews work, branch/session rules, and the verification loop for an agent without vision
---

## Owner's review loop

- Owner tests **only in Replit**; the Arena iframe preview is white — never fix it.
- Replit updates via the **Pull** button on `main`. Work on a branch is reviewed
  through the shell: `git fetch origin && git checkout <branch>`, back with `git checkout main`.
- Merging a PR seals GitHub access for the old session → merge at the very end of
  the chat.
- Rule from the owner: **one task at a time, no parallel work**. Not in a hurry;
  if something is unclear — ask, don't guess.

## Session/branch rules

- Each chat gets its own `arena/…` branch; you may only push to your own branch.
- To continue work from a previous session's branch, reset your branch onto its
  tip (`git reset --hard origin/<old-branch>`) and open a fresh PR; close the old
  one with a pointer (precedent: PR #5 closed in favour of #6).

## Verification loop (agent has no vision)

- Never trust a screenshot you cannot see. Verify with:
  - DOM measurements in the headless browser (bounding boxes, overflow, `data-*`
    flags, element counts);
  - ImageMagick pixel stats: `convert img.jpg -crop WxH+X+Y +repage -format '%[fx:mean]' info:`;
  - `compare -metric AE a.jpg b.jpg null:` for how much actually changed.
- Then hand the frames to the owner (`present_file`) and wait for wording-level feedback.
- Before "removing a background" from an image, check alpha first:
  `convert img.webp -alpha extract -format '%[fx:mean]' info:` — `1` means opaque.

## Commands that work here

```bash
corepack pnpm install --frozen-lockfile          # deps (~10 s)
corepack pnpm --dir artifacts/my-app typecheck   # types
corepack pnpm --dir artifacts/my-app test:pillars
corepack pnpm --dir artifacts/my-app dev --host 127.0.0.1 --port 3000   # background
node scripts/qa/setup-browser.mjs                # chromium, once per sandbox
```
`pnpm` alone is not on PATH — always `corepack pnpm`.
