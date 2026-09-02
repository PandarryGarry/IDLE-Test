# 🛡️ Aethelia IDLE RPG — Архитектура и руководство проекта

Браузерная IDLE RPG игра в сеттинге классического средневекового темного фэнтези (Dark Fantasy) в духе **World of Warcraft** и **Lineage 2**.

---

## 🧭 1. Структура проекта (Карта файлов)

```
artifacts/my-app/src/
├── App.tsx                     # Главный роутер, провайдеры и инициализация игры
├── main.tsx                    # Точка входа React
├── index.css                   # Глобальные токены тем, дизайн-система, свечения и рамки
│
├── components/                 # Компоненты интерфейса игры
│   ├── SplashScreen.tsx        # Загрузочный экран с анимированным гербом и подсказками
│   ├── CinematicDirector.tsx   # Очередь коротких сцен входа/выхода
│   ├── CinematicScene.tsx      # Полноэкранная перебивка: арт, текст, свет, пропуск
│   ├── OnboardingScene.tsx     # Общая атмосферная подложка Rules/Create/Select
│   ├── TopNavBar.tsx           # Верхняя статус-панель (уровень боя, золото, сумка, сейв)
│   ├── Sidebar.tsx             # Боковая панель навигации (для ПК)
│   ├── MobileNav.tsx           # Нижняя панель и шторка профессий (для смартфонов)
│   ├── GlobalActiveBar.tsx     # Плавающий виджет текущей деятельности на всех экранах
│   ├── SkillHeader.tsx         # Тематическая шапка профессии с уровнем и шкалой XP
│   ├── ActionGrid.tsx          # Интерактивная сетка действий с мастерством и затратами
│   ├── ActionProgressBar.tsx   # Плавный RAF/CSS прогресс-бар действия
│   ├── ItemIcon.tsx            # Иконка предмета с рамками редкости и тултипом
│   ├── ItemInfoPopover.tsx     # Карточка предмета со сравнением статов
│   ├── HeroBoard.tsx           # Доска тела: 4 столпа, 3 луча, 36 узлов (пан/зум)
│   └── ui/                     # Базовые UI-примитивы (Radix / Tailwind)
│
├── shared/                     # Централизованные ресурсы и реестры
│   └── icons/
│       ├── uiIcons.tsx         # Системные иконки (золото, бой, настройки и т.д.)
│       ├── skillIcons.ts       # Иконки всех профессий и навыков
│       └── itemIcons.ts        # Модульный реестр иконок предметов (оружие, броня, еда, руда)
│
├── data/                       # Данные игры
│   ├── attributes.ts           # 4 столпа, 12 ветвей, 24 пассивки, матрица рас
│   ├── attributeIcons.ts       # Иконки столпов/ветвей/пассивок (WebP через iconUrl)
│   ├── synergies.ts            # 6 перекрёстных нитей
│   └── balance/                # ВСЕ числа Этапа 5 (нигде больше)
│
├── public/assets/              # Runtime-ассеты
│   ├── art/                    # Splash, auth и утверждённые сцены онбординга (WebP)
│   └── icons/characters/       # Аватары и персонажи
│       ├── avatars/            # 30 аватаров: 5 рас × 6 (avatars/<race>/<race>_male_01..03.png)
│       └── heroes/             # Заготовки героев (для будущих систем)
│
├── pages/                      # Экраны игры
│   ├── AuthPage.tsx            # Вход / регистрация
│   ├── RulesPage.tsx           # Принятие правил перед созданием героя
│   ├── CreateCharacterPage.tsx # Двухшаговое создание: раса → облик + ник
│   ├── SelectCharacterPage.tsx # Выбор созданного героя у выхода в город
│   ├── DashboardPage.tsx       # Командный центр героя (сводка, статус, обзор навыков)
│   ├── HeroHubPage.tsx         # Герой: Тело / Экип / Нити / Путь (Этап 5B)
│   ├── CombatPage.tsx          # Боевая арена (дуэль, кукла экипировки, лог урона)
│   ├── InventoryPage.tsx       # Сумка и казна героя (фильтры, продажа, улучшение слотов)
│   ├── WoodcuttingPage.tsx     # Рубка леса
│   ├── MiningPage.tsx          # Горное дело
│   ├── FishingPage.tsx         # Рыбная ловля
│   ├── CookingPage.tsx         # Кулинария и готовка еды
│   ├── SmithingPage.tsx        # Кузнечное дело и плавка слитков
│   ├── FiremakingPage.tsx      # Разжигание костров
│   └── SettingsPage.tsx        # Настройки игры и экспорт/импорт сохранений
│
├── store/                      # Zustand хранилища состояния
│   ├── inventoryStore.ts       # Управление инвентарем, золотом и слотами (ранее Bank)
│   ├── playerStore.ts          # Характеристики героя, уровни навыков, экипировка
│   ├── gameStore.ts            # Игровой цикл, активное действие, прирост опыта
│   ├── combatStore.ts          # Боевой движок, монстры, расчет урона, авто-еда
│   ├── settingsStore.ts        # Пользовательские настройки (язык, автосохранение)
│   ├── authStore.ts            # Сессия Supabase, профиль, правила, guest mode
│   ├── characterStore.ts       # Герои аккаунта, выбор, создание и мягкое удаление
│   └── notificationsStore.ts   # Всплывающие уведомления о добыче и level up
│
├── gameEngine/                 # Математика и системные модули
│   ├── tickManager.ts          # Высокоточный таймер тиков (60 FPS)
│   ├── formulas.ts             # Формулы урона, шанса сжечь еду, темпа XP/час
│   ├── xpTable.ts              # Таблица опыта до 99 уровня
│   ├── offlineCalc.ts          # Расчет наград за время оффлайна
│   └── skillRegistry.ts        # Реестр логики профессий
│
└── lib/                        # Утилиты и локализация
    ├── i18n.ts                 # Словарь локализации (Русский — основной)
    ├── saveManager.ts          # Менеджер локального сохранения и загрузки
    ├── characterApi.ts         # Supabase CRUD профиля/персонажей
    ├── characterSave.ts        # Сверка local/cloud и отложенный cloud-save
    ├── cinematicState.ts       # Короткая очередь переходных сцен (sessionStorage)
    └── utils.ts                # Форматирование чисел, времени и случайных чисел
```

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

- **Запуск dev-сервера**: `pnpm --filter @workspace/my-app run dev` (порт 3000)
- **Сборка проекта**: `pnpm --filter @workspace/my-app run build`

---

## 📚 Документы — что читать и зачем

| Файл | О чём | Когда открывать |
|---|---|---|
| `NEXT_CHAT_HANDOFF.md` | **Точка входа для нового чата**: где работа, что спросить у владельца | в начале каждого чата |
| `DEVLOG.md` | Журнал сессий (новые записи сверху) и правила процесса | в начале и в конце чата |
| `ROADMAP.md` | 8 этапов, принятые решения, текущий статус | планирование |
| `STAGE5_FOUR_PILLARS_HANDOFF.md` | Контракт Этапа 5: столпы, ветви, расы, синергии, паутина (§18) | любые правки характеристик |
| `scripts/qa/README.md` | Headless-браузер в песочнице, прогоны без облака | перед любым прогоном |
| `scripts/assets/README.md` | Конвейер картинок: мастер PNG → runtime WebP | новая картинка |
| `SUPABASE_SETUP.md` | Ключи и таблицы Supabase | настройка облака |
| `STAGE3_AUTH_HANDOFF.md`, `STAGE4_CHARACTER_HANDOFF.md` | Контракты Этапов 3–4 (история решений) | правки auth и персонажей |
| `RESPONSIVE_SYSTEM_PLAN.md` | План централизованного адаптива (слой 1 сделан) | новые экраны |

**Законы проекта (коротко):** картинки — только WebP через `iconUrl()` /
`getAvatarPath()`; числа Этапа 5 — только `src/data/balance/`; новые экраны —
на примитивах `src/shared/ui/gameUI.tsx`; цвета — только токены и CSS-переменные;
перед мержем `pnpm typecheck` чистый.
