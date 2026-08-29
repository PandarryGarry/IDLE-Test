# Stage 4 Character Creation — handoff для следующего чата

Дата фиксации: **2026-08-29**
Предыдущий этап: **Stage 3 (auth foundation)** смёржен в `main` через PR #4.

## Цель этапа

Экран создания персонажа после первой регистрации/входа.

## Открытые данные из роадмапа

**Решено:** Никнейм + готовые аватары + без классов.

**Что нужно:**
1. Экран создания после первой регистрации.
2. Поле никнейма (проверка уникальности через Supabase).
3. Выбор аватара из готовых (иконки `public/assets/icons/characters/heroes/`).
4. Начальные характеристики — отображаем, не даём выбирать (стартуют одинаково).
5. Анимированный переход в игру после создания.

**Данные персонажа (расширить `playerStore`):**
```ts
nickname: string
avatarId: string       // 'char_archer', 'char_mage' и т.д.
createdAt: number
userId: string         // из Supabase
```

**Решено владельцем:**
- Никнейм и аватар можно сменить 1 раз бесплатно (в настройках).
- Последующие смены — за донат-валюту (когда появится).
- Логика: `hasChangedNickname: bool` + `hasChangedAvatar: bool` в профиле.

## Что уже готово к этапу 4

- Auth: `src/store/authStore.ts` уже имеет `user`, `profile`, `session`.
- `profile` загружается из `profiles` (если таблица есть) или из `user_metadata` (fallback).
- Есть `public/assets/icons/characters/heroes/` (использовать готовые иконки).
- `src/store/playerStore.ts` — текущий герой/навыки/экипировка.
- `SUPABASE_SETUP.md` — как настроить Supabase/Google.

## Следующие действия для агента

1. Прочитать перед началом: `DEVLOG.md`, `ROADMAP.md`, `STAGE3_AUTH_HANDOFF.md`, `STAGE4_CHARACTER_HANDOFF.md`.
2. Уточнить у владельца, когда после регистрации показывать создание персонажа:
   - сразу после `signUp` / `signIn`, если профиля ещё нет.
3. Проверить иконки аватаров в `public/assets/icons/characters/heroes/` и привязку к `avatarId`.
4. Добавить экран `/create-character` (или modal) с:
   - никнейм;
   - выбор аватара;
   - стартовые характеристики (не редактируемые);
   - анимированный переход в `/`.
5. Понять, где хранить `nickname`/`avatarId`:
   - Supabase `profiles.nickname` / `profiles.avatar_id`, при отсутствии профиля — создавать после первого входа.
6. Учесть guest mode: создание персонажа только для зарегистрированных.
7. После реализации — `pnpm typecheck` и `build`, затем открыть PR.

## Проверки после успешного этапа

- `corepack pnpm --dir artifacts/my-app typecheck`
- `corepack pnpm --dir artifacts/my-app build`
- В Replit: `/register` → Create Character → переход в игру.
- Guest: не должен попадать в создание персонажа.
