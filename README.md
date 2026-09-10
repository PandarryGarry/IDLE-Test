# 🛡️ Aethelia IDLE RPG — Архитектура и руководство проекта

Браузерная IDLE RPG игра в сеттинге классического средневекового темного фэнтези (Dark Fantasy) в духе **World of Warcraft** и **Lineage 2**.

---

## 🧭 1. Структура проекта

Актуальная карта `src/` — **`artifacts/my-app/src/ARCHITECTURE.md`**.
Кратко: экраны в `features/`, числа в `data/balance/`, столпы в `domain/attributes/`,
движок в `core/`, вывеска греет первый кадр через `lib/bootPreload.ts`.

Runtime-картинки: `public/assets/art/` (дорога) и `public/assets/icons/` (WebP).
Мастер PNG не ставить в `<img>` — только `iconUrl()` / `getAvatarPath()`.

---

## 🛠️ 2. Как расширять игру

### Как добавить новый предмет:

Предметы живут в каталоге — `artifacts/my-app/src/domain/items/catalog/`
(ресурсы / «Сбор» / охота / снаряжение). Файлами по семействам, вход —
`src/domain/items/index.ts` (`getItem()` / `getAllItems()`).

1. **Обычный предмет** (ресурс, находка «Сбора», трофей): добавьте запись
   в файл семейства, например `catalog/foraging/bits.ts`:
```ts
{
  id: 'mythic_shard',
  name: 'Осколок мифрила',          // по-русски
  description: '…',                 // обязательно, проверяет валидатор
  category: 'mineral',
  tier: 5,                          // совпадает с t05 в пути иконки!
  sellValue: 120,
  canSell: true,
  stackable: true,
  iconPath: 'materials/metals/mythic_shard', // БЕЗ расширения, webp уже на диске
}
```
   Новое семейство — подключите его в `catalog/index.ts` (массив `CATALOG`).

2. **Снаряжение** (оружие/броня/бижутерия): руками по одному не добавляем —
   оно генерируется из таблиц `src/data/balance/gear.ts` (тир 1 = база,
   старшие тиры = `× gearTierScale`). Правьте таблицы, не `gearItems.ts`-вывод.

3. **Картинка**: мастер PNG в `public/assets/icons/…` →
   `node scripts/assets/optimize.mjs` → рядом появится `.webp`.
   В коде — только `iconPath` (рендер через `iconUrl()`). Никогда `.png` в `<img>`.
   Детали: `scripts/assets/README.md`.

4. **Проверка:** `pnpm --filter @workspace/my-app run validate:catalog`
   (id, описания, наличие `.webp`, совпадение `tier ↔ tNN`).

`src/shared/icons/itemIcons.ts` (`ITEM_IMAGE_URLS`/`EQUIPMENT_ICONS`) —
это фоллбэки для **легаси-предметов** из старых сейвов, новым предметам
туда ходить не нужно.

---

### Как изменить системную иконку:
- Откройте `src/shared/icons/uiIcons.tsx` и замените компонент нужной иконки на свой SVG или компонент.

---

## 🎮 Запуск и сборка

- **Запуск dev-сервера (локально)**: `pnpm --filter @workspace/my-app run dev` (порт 3000)
- **Запуск в Replit**: `PORT=8080 BASE_PATH=/ pnpm --filter @workspace/my-app run dev`
  — порт **8080**, API-сервер на **5000** (Canvas/mockup-sandbox удалён в сессии 31).
  Канон и причины: **`REPLIT_SETUP.md`**
  (расхождение портов = белое превью / `connection reset`).
- **Сборка проекта**: `pnpm --filter @workspace/my-app run build`

---

## 📚 Документы — что читать и зачем

| Файл | О чём | Когда открывать |
|---|---|---|
| `NEXT_CHAT_HANDOFF.md` | **Точка входа**: ветка, мерж, канон, карта документов | каждый чат |
| `DEVLOG.md` | Журнал всех сессий (новые записи сверху) | начало и конец чата |
| `artifacts/my-app/src/ARCHITECTURE.md` | Карта `src/` и закон вывески | любой код |
| `ROADMAP.md` | План, «Текущий статус», техдолг | планирование |
| `BANK_FOUNDATION.md` | Банк — будущая система; терминология «инвентарь ≠ банк» | путаница в названиях |
| `BALANCE_FOUNDATION.md` | Числа столпов / нитей / XP | баланс |
| `GEAR_TIER_FOUNDATION.md` | Снаряжение: диск → слоты → тиры (реализовано) | экип, тиры |
| `ITEM_SYSTEM_PLAN.md` | Контракт предметной системы (реализован; §12–15 — видение) | предметы |
| `FORAGING_V2_DESIGN.md` | Дизайн «Сбора» v2, 5 зон (реализован) | профессия |
| `COMBAT_MODEL_PILLARS.md` | Боевая модель на столпах — **проект**, бой не строен | будущий бой |
| `src/styles/THEME_GUIDE.md` + `RESPONSIVE_SYSTEM_PLAN.md` | Токены темы, план адаптива | этап UI/UX |
| `STAGE5_FOUR_PILLARS_HANDOFF.md` | Смысл Этапа 5 (код ушёл дальше — сверяй `balance/`) | характеристики |
| `SUPABASE_SETUP.md` + `SUPABASE_STAGE4.sql` | Ключи и схема `profiles`/`characters` | облако |
| `REPLIT_SETUP.md` | Порты **8080 (web) / 5000 (api)**; Canvas 8081 удалён | белый экран, `.replit` |
| `scripts/assets/README.md` | PNG → WebP | новая картинка |
| `scripts/qa/README.md` | Мок без облака | прогон агента |
| `STAGE3_*`, `STAGE4_*` | Исторические контракты auth/героя | не карта файлов |

**Законы проекта (коротко):** картинки — только WebP через `iconUrl()` /
`getAvatarPath()`; числа Этапа 5 — только `src/data/balance/`; новые экраны —
на примитивах `src/shared/ui/gameUI.tsx`; цвета — только токены и CSS-переменные;
перед мержем `pnpm typecheck` чистый.
