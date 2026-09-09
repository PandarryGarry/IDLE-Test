# Рука помощи новому чату — 2026-09-09

Репозиторий: `https://github.com/PandarryGarry/IDLE-Test.git`
Приложение: `artifacts/my-app` (Vite + React + TS, Tailwind v4). Запуск в песочнице:
`corepack pnpm dev` (Vite, порт 3000). Node ≥ 22 + corepack (`corepack pnpm install`).

## Что смержено в `main` (ветка `arena/01a08236-idle-test`, быстрый ff, 14 коммитов / 58 файлов)

1. **Чистка предметов** — в каталоге/админке остались только НАСТОЯЩИЕ предметы с картинками
   (`iconPath` → `/assets/icons/...`). Мелворовское легаси-снаряжение без своих картинок
   (Bronze Sword и т.п.) больше не попадает в `getAllItems()` (админ-каталог, окно выдачи),
   но `getItem()` всё ещё достаёт его из старых сейвов и дропов боя. `validate-catalog.mjs`: 162 предмета.
2. **Слово «банк» убрано полностью** — инвентарь везде `inventory`/«сумка». Legacy-чтение `src.bank`
   из старых сейвов сохранено в `saveManager.ts`/`characterSave.ts`/`AdminCharactersPanel.tsx`.
3. **Экип → 12 подхарактеристик тела** — новый мост `domain/attributes/equipmentSubstats.ts`
   (`sumEquipmentBonuses` / `foldBonusesIntoRaw`); тир-1 снаряжение на реальных картинках
   (`catalog/gear/gearItems.ts`, `data/balance/gear.ts`).
4. **UI «Экип» героя** (`HeroHubPage.tsx`): реальные картинки предметов в слотах/сумке,
   ожерелье рядом со шлемом, виден второй браслет, бонусы снаряжения показываются.
5. **Админка**: только настоящие картинки (без «фавиконов»-силуэтов/эмодзи), легаси не выводится;
   в «Персонажи → Снаряжение» рамка выбора не вылезает из ячейки (inset-кольцо), ячейки компактные,
   у предметов показан **тир**. Регрессионный фикс сохранения (сумка/XP/Сбор не теряются).

Зелёные проверки на текущем HEAD: `pnpm typecheck` 0, `pnpm build` 0, `pnpm test:pillars` 48/48,
`pnpm validate:catalog` — 162, ОШИБОК НЕТ.

## Куда двигаться дальше (по договорённости с владельцем)

Владелец зафиксировал: **материал = «прочность»** оружия/экипировки/бижутерии/инструментов;
чем выше тир (материал), тем больше прочность и дольше служит. Тиры планируются 1–12, сейчас заведён 1.

1. **Ввод тиров 2–12** по схеме «слот → тир → семья»: расширить `GEAR_TIERS_NOW` в
   `domain/items/catalog/gear/gearItems.ts`; статы и прочность растут от тира формулой из
   `data/balance/gear.ts` (`gearTierScale`, `scaleTierMap`). Требование владельца: весь тир-1 уже есть,
   готовить фундамент именно на тире 1, тиры — масштабом.
2. Поле **прочности**, растущей от тира (`maxDurability`); пока без боевого износа (бой экип не тратит),
   данные+показ готовы, износ прикрутить вместе с боем.
3. **Единая фасовка выбора** (админ + «Экип»): группировка по слоту → тиру → семье + фильтры
   «слот/тир/вес» и поиск; одна и та же ячейка (картинка + Тир N + редкость + прочность) везде.

Полезные пути:
- Данные снаряжения/тиров: `artifacts/my-app/src/data/balance/gear.ts`,
  `artifacts/my-app/src/domain/items/catalog/gear/gearItems.ts`.
- Мост экип→тело: `artifacts/my-app/src/domain/attributes/equipmentSubstats.ts`.
- UI экипа: `artifacts/my-app/src/features/hero/HeroHubPage.tsx`, CSS `index.css` (классы `hero-gear2*`/`hero-sq-slot*`).
- Админка: `artifacts/my-app/src/features/admin/` (`AdminCharactersPanel.tsx`, `AdminItemsPage.tsx`).
