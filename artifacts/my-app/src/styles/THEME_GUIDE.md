# 🎨 Aethelia RPG — Гайд по теме и палитре

> Все цвета, стили и компоненты централизованы.
> **Меняй только `tokens.ts`** — всё обновится автоматически.

---

## 📁 Структура файлов темы

```
src/styles/
├── tokens.ts       ← ВСЕ цвета, тени, радиусы (МЕНЯЙ ЗДЕСЬ)
└── THEME_GUIDE.md  ← этот файл
src/index.css       ← CSS-переменные (генерируются из tokens.ts)
```

---

## 🔑 Как поменять цвет

### Например, хочешь изменить фон страницы:
```ts
// tokens.ts
bg: {
  page: '#f5ede0',  // ← меняй это
}
```
```css
/* index.css — тоже обнови соответствующую переменную */
--bg-page: #f5ede0;
```

> ⚠️ tokens.ts и index.css нужно держать синхронизированными.
> В будущем можно добавить скрипт-генератор.

---

## 🎨 Текущая палитра (Warm Light Fantasy)

| Роль             | CSS переменная        | Значение    | Где используется |
|------------------|-----------------------|-------------|------------------|
| Фон страницы     | `--bg-page`           | `#f5ede0`   | body, main       |
| Сайдбар          | `--bg-sidebar`        | `#2d1f0f`   | Sidebar.tsx      |
| Карточка         | `--bg-card`           | `#fdf5e8`   | g-card, ActionCard |
| Карточка тёмная  | `--bg-card-dark`      | `#e8d5b5`   | вложенные блоки  |
| Ячейка           | `--bg-slot`           | `#ede0c8`   | SquircleSlot, g-slot |
| Шапка (топбар)   | `--bg-header`         | `#3d2910`   | TopNavBar        |
| Граница обычная  | `--border-default`    | `#c8a878`   | большинство рамок|
| Граница карточки | `--border-card`       | `#d4b880`   | g-card           |
| Граница сильная  | `--border-strong`     | `#8b6030`   | активные элементы|
| Граница акцент   | `--border-accent`     | `#d4860a`   | hover, focus     |
| Текст основной   | `--text-primary`      | `#2d1f0f`   | заголовки, тело  |
| Текст вторичный  | `--text-secondary`    | `#6b4a28`   | подзаголовки     |
| Текст тихий      | `--text-muted`        | `#9a7450`   | метки, подписи   |
| Текст сайдбара   | `--text-sidebar`      | `#e8d0a8`   | Sidebar.tsx      |
| Золото (акцент)  | `--accent-gold`       | `#d4860a`   | кнопки, XP, иконки|
| Изумруд          | `--accent-emerald`    | `#1a9e5a`   | добыча, активно  |
| Рубин            | `--accent-ruby`       | `#c0281e`   | бой, урон, опасность|
| Сапфир           | `--accent-sapphire`   | `#1860c0`   | магия, инвентарь |
| Янтарь           | `--accent-amber`      | `#d06010`   | огонь, ремесло   |
| Бирюза           | `--accent-teal`       | `#0e8a7a`   | рыбалка          |

---

## 🧱 Готовые CSS-классы (используй в JSX)

### Карточки
```jsx
<div className="g-card">           // обычная карточка
<div className="g-card-active">    // активная (зелёная, добыча идёт)
<div className="g-card-gold">      // золотая (выделение)
<div className="g-card-combat">    // боевая (красная)
```

### Ячейки инвентаря
```jsx
<div className="g-slot">           // ячейка с предметом
<div className="g-slot-empty">     // пустая ячейка
```

### Кнопки
```jsx
<button className="g-btn-primary">  // золотая — главное действие
<button className="g-btn-secondary">// серая — второстепенное
<button className="g-btn-danger">   // красная — опасное действие
<button className="g-btn-ghost">    // прозрачная
```

### Полосы прогресса
```jsx
<div className="g-bar-track">
  <div className="g-bar-xp"      style={{ width: '60%' }} /> // XP — золото
  <div className="g-bar-hp"      style={{ width: '80%' }} /> // HP — красный
  <div className="g-bar-mastery" style={{ width: '40%' }} /> // Мастерство
</div>
```

### Редкость предметов
```jsx
<div className="g-rarity-common">
<div className="g-rarity-uncommon">
<div className="g-rarity-rare">
<div className="g-rarity-epic">
<div className="g-rarity-legendary">
<div className="g-rarity-mythic">
```

### Навигация (сайдбар)
```jsx
<div className="g-nav-item">       // обычный пункт
<div className="g-nav-item active">// активный пункт
```

---

## 🛠 Использование токенов в TypeScript

```ts
import { THEME, BARS, RARITY, barGradient } from '@/styles/tokens';

// Inline стили
<div style={{ background: THEME.bg.card, border: `1px solid ${THEME.border.card}` }}>

// Градиент полосы
<div style={{ background: barGradient(BARS.xp) }}>

// Редкость
const rs = RARITY.legendary;
<div style={{ border: `1px solid ${rs.border}`, background: rs.bg, boxShadow: rs.glow }}>
```

---

## 🎨 Цвета по навыкам

| Навык         | Акцент CSS var          | Hex       |
|---------------|-------------------------|-----------|
| Лесорубство   | `--accent-emerald`      | `#1a9e5a` |
| Горное дело   | `--accent-gold`         | `#d4860a` |
| Рыбалка       | `--accent-teal`         | `#0e8a7a` |
| Огонь         | `--accent-amber`        | `#d06010` |
| Кулинария     | `--accent-gold`         | `#d4860a` |
| Кузница       | `--text-muted` (серый)  | `#9a7450` |
| Бой           | `--accent-ruby`         | `#c0281e` |
| Магия         | `--accent-sapphire`     | `#1860c0` |

---

## ⚡ Быстрые примеры

### Поменять ВСЮ тему за 30 секунд:
```ts
// tokens.ts — меняй bg.page, bg.card, border.default, accent.gold
// index.css — меняй соответствующие --переменные
```

### Добавить новый акцентный цвет:
```ts
// tokens.ts
accent: {
  myColor: '#ff6600',
  myColorBg: '#fff0e0',
}
// index.css
--accent-my-color: #ff6600;
--accent-my-color-bg: #fff0e0;
```

### Добавить новый вариант карточки:
```css
/* index.css */
.g-card-magic {
  background: var(--accent-sapphire-bg);
  border: 1px solid var(--accent-sapphire);
  border-radius: var(--radius-lg);
  box-shadow: 0 0 20px rgba(24,96,192,0.2);
}
```

---

## 📌 Правило проекта

> **НИКАКИХ хардкод цветов в JSX-компонентах!**
> 
> ❌ `style={{ background: '#1a1108' }}`
> ✅ `style={{ background: 'var(--bg-page)' }}`
> 
> ❌ `className="bg-[#3d2e1e]"`
> ✅ `className="g-card"` или `style={{ background: 'var(--bg-card)' }}`
