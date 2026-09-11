#!/bin/bash
set -e
pnpm install --frozen-lockfile

# Шаблонный drizzle-push. В workspace пакет называется `@workspace/db`
# (фильтр `db` не матчился → хук падал и шумел после каждого `git pull`),
# а сам `lib/db` — пустая заготовка: живая БД это Supabase, схема правится
# SQL-файлами вручную (SUPABASE_STAGE4*.sql), а не автопушем.
# Вызов сохранён, но не роняет хук: автоматический push к боевой БД опаснее,
# чем пропущенный. Возвращать сюда push можно только вместе с серверной схемой.
pnpm --filter @workspace/db --if-present run push \
  || echo "[post-merge] db push пропущен: схема Supabase правится SQL-файлами вручную"
