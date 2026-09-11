# 🎨 Aethelia RPG — Гайд по теме «Стекло таверны»

> **Источник правды — `src/index.css` (:root).** Значения цветов, теней,
> радиусов меняются только там. Из TS-кода к ним идут через карту ролей
> `src/styles/tokens.ts` (она экспортирует `var(--…)`-строки).
> Канон утверждён владельцем 2026-09-10: эталон — экран «Ложа таверны»
> (создание персонажа). Полный разбор: `UI_UX_AUDIT.md`, разделы 0 и 5.

---

## Закон (коротко)

1. **Цветов в коде не пишем буквами** (`#d4860a` в компоненте = нарушение).
   Только роли: `var(--glass-bg)` в CSS или `THEME.glass.bg` в TS.
   Нарушение ловит **страж цветов**: `pnpm validate:colors` (шаг 12 плана;
   листок легаси-запаса внутри `validate-colors.mjs` — только сокращается).
2. **Новая роль** — сначала переменная в `:root` (секция «КАНОН „СТЕКЛО
   ТАВЕРНЫ“»), потом строка в `tokens.ts`, потом потребитель.
3. **Один янтарь-главный** для всех primary-кнопок (`--btn-primary*`).
4. Старые переменные выше `:root` (`--bg-page` и друзья) живут до конца
   миграции — не удалять без шага плана.

## Пять слоёв канона

| Слой | Роль | Переменные |
|---|---|---|
| 0. Картина | Фон-полотно + вуаль | `--art-backdrop`, `--art-veil` |
| 1. Стекло | Панели/листы/каркас | `--glass-bg/edge/shadow/filter` |
| 2. Карточка | Тёплое какао внутри листа | `--card-cocoa*`, `--card-edge*` |
| 3. Ячейка | Рама «каштан» едина; пустая = стекло | `--cell-*` |
| 4. Краски | Чернила и золото | `--ink-*`, `--btn-primary-*` |

Плюс шкалы: редкость `--rarity-*`, уник `--unique-*`, радиусы
`--radius-tag/cell/card-canon/sheet`.

## Акценты объявлений (шаги 11–12)

Цветная кромка тоста и карточки колокольчика — `THEME.announce.*`
(`--announce-levelup|mastery|combat|warning|info`). Кромки «находок»
повторяют шкалу редкости (`THEME.rarity.*`) — язык ячеек и тостов один,
отдельных оттенков у находок не заводим. Хром переключателей шапки —
`THEME.chrome.*` (`--chrome-btn*`).

## Роли примитивов (шаг 3 плана, секция «ШАГ 3» в `:root`)

Живые краски `gameUI`/`kit` получили имена один в один (вид не менялся):

| Область | Роли | Карта |
|---|---|---|
| Кайма общая | `--edge-light/accent` | `THEME.edge.*` |
| Поля ввода | `--field-bg/shadow/focus-glow/error*` | `THEME.field.*` |
| Кнопки 2/3 | `--btn-secondary/danger*/disabled*` | `THEME.button.*` |
| Карты тёмные | `--card-cocoa-deep/select*/shadow-sm/dark/active-shadow` | `THEME.card.*` |
| Бой | `--combat-bg/edge/shadow` | `THEME.combat.*` |
| Модалка | `--modal-veil/bg/shadow/title-shadow` | `THEME.modal.*` |
| Тултип | `--tooltip-bg/shadow` | `THEME.tooltip.*` |
| Свечения | `--glow-gold-soft` | `THEME.glow.*` |
| Пилюли | `--badge-{gold,red,green,blue,purple,gray,level}-*` | `THEME.badge.*` |
| Теги | `--tag-{gold,brown,red,green}-*` (чернила — из пилюль) | `THEME.tag.*` |
| Полосы | `--progress-track*`, `--bar-{color}-{from,to,glow}` | `THEME.bar.*` |
| Пилюля статов | `--stat-bg/shadow` | `THEME.stat.*` |

В `kit` роли подключаются tailwind-синтаксисом `[background:var(--…)]` /
`text-[var(--…)]` / `border-[var(--…)]` — размеры и стекло компонентов
при этом не трогаем.

## Как поменять цвет (пример)

Хочешь другой оттенок стеклянной панели:

```css
/* src/index.css, :root */
--glass-bg: var(--onboarding-panel);  /* ← правится значение здесь */
```

После миграции все потребители ссылаются на `--glass-bg` — меняется везде.

## Использование в TS

```tsx
import { THEME } from '@/styles/tokens';

<div style={{
  background: THEME.glass.bg,
  border: `1px solid ${THEME.glass.edge}`,
  boxShadow: THEME.glass.shadow,
  backdropFilter: THEME.glass.filter,
  color: THEME.ink.strong,
}} />
```

## Чего больше нет

- Светлой темы «Warm Light Fantasy» в `tokens.ts` — была «второй правдой»
  без потребителей, удалена (2026-09-10).
- Пилюли «УНИК» — уникальный предмет помечается золотой звездой-эмблемой
  (решение владельца; подключается шагом 6 плана `UI_UX_AUDIT.md`).
