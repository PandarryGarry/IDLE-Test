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
1. Откройте `src/data/items.ts` и добавьте объект предмета:
```ts
mythic_sword: {
  id: 'mythic_sword',
  name: 'Меч Погибели',
  category: 'weapon',
  sellValue: 12000,
  canSell: true,
  stackable: false,
  equipSlot: 'weapon',
  combatStats: { attackBonus: 45, strengthBonus: 38 },
}
```
2. Откройте `src/shared/icons/itemIcons.ts`:
- Для эмодзи/иконки добавьте в `EQUIPMENT_ICONS`: `mythic_sword: '⚔️'`
- Для кастомной картинки добавьте в `ITEM_IMAGE_URLS`: `mythic_sword: '/assets/items/mythic_sword.png'`

---

### Как изменить системную иконку:
- Откройте `src/shared/icons/uiIcons.tsx` и замените компонент нужной иконки на свой SVG или компонент.

---

## 🎮 Запуск и сборка

- **Запуск dev-сервера (локально)**: `pnpm --filter @workspace/my-app run dev` (порт 3000)
- **Запуск в Replit**: `PORT=8080 BASE_PATH=/ pnpm --filter @workspace/my-app run dev`
  — порт **8080**, API-сервер на **5000**, Canvas на **8081**. Канон и причины:
  **`REPLIT_SETUP.md`** (расхождение портов = белое превью / `connection reset`).
- **Сборка проекта**: `pnpm --filter @workspace/my-app run build`

---

## 📚 Документы — что читать и зачем

| Файл | О чём | Когда открывать |
|---|---|---|
| `NEXT_CHAT_HANDOFF.md` | **Точка входа**: ветка, мерж, вывеска, что дальше | каждый чат |
| `DEVLOG.md` | Журнал сессий (новые записи сверху) | начало и конец чата |
| `artifacts/my-app/src/ARCHITECTURE.md` | Карта `src/` и закон вывески | любой код |
| `ROADMAP.md` | 8 этапов | планирование |
| `BALANCE_FOUNDATION.md` | Числа столпов / нитей / XP | баланс |
| `STAGE5_FOUR_PILLARS_HANDOFF.md` | Смысл Этапа 5 (код ушёл дальше — сверяй `balance/`) | характеристики |
| `SUPABASE_SETUP.md` + `SUPABASE_STAGE4.sql` | Ключи и схема `profiles`/`characters` | облако |
| `REPLIT_SETUP.md` | Порты 8080 / 5000 / 8081 | белый экран, `.replit` |
| `scripts/assets/README.md` | PNG → WebP | новая картинка |
| `scripts/qa/README.md` | Мок без облака | прогон агента |
| `STAGE3_*`, `STAGE4_*` | Исторические контракты auth/героя | не карта файлов |

**Законы проекта (коротко):** картинки — только WebP через `iconUrl()` /
`getAvatarPath()`; числа Этапа 5 — только `src/data/balance/`; новые экраны —
на примитивах `src/shared/ui/gameUI.tsx`; цвета — только токены и CSS-переменные;
перед мержем `pnpm typecheck` чистый.
