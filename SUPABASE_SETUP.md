# 🔑 Supabase — подключение в Replit

> Для Aethelia нужны только **frontend** данные:
> - `VITE_SUPABASE_URL`
> - `VITE_SUPABASE_ANON_KEY`
>
> `service_role` в браузер НЕ вставлять и НЕ использовать. Ключи в чат не пишем.

---

## 1. Что взять из Supabase

1. Открой свой Supabase dashboard → выбранный проект.
2. Слева: **Project Settings → API** (или **Settings → API**).
3. Скопируй:
   - `Project URL` → это `VITE_SUPABASE_URL`
     - обычно: `https://xxxx.supabase.co`
   - `anon` / `public` key → это `VITE_SUPABASE_ANON_KEY`
     - начинается с `eyJ...`
4. **НЕ** копируй `service_role` / `secret` key.

---

## 2. Вставить в Replit

В Replit открыть **Tools → Secrets** (или левое меню → Secrets).

Добавь ровно 2 секрета:

```
VITE_SUPABASE_URL=https://XXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Пример значения URL:
```
VITE_SUPABASE_URL=https://abcdefghijkl.supabase.co
```

ВАЖНО:
- Ключ `anon` НЕ является секретом в смысле безопасности frontend-ключей — он именно для браузера.
- Если положишь в `.env.local` вместо Secrets — проверь, что файл не попадёт в git.
- Для Replit рекомендую Secrets: они сразу попадают в окружение рантайма и в переменные сборки Vite.

Если используешь `.env.local` (локально), формат такой:

```env
VITE_SUPABASE_URL=https://abcdefghijkl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

---

## 3. Проверить код ветки

Уже закоммичено и запушено в PR #4. В Replit, после добавления секретов:

```bash
git fetch origin
git checkout arena/01a04c15-idle-test
corepack pnpm --dir artifacts/my-app install   # или pnpm install
corepack pnpm --dir artifacts/my-app dev
```

В Webview проверь:
- `/login` — вход
- `/register` — регистрация
- `/` — после входа
- `/combat` и `/cooking`, `/smithing`, `/firemaking`, `/mining` — для гостя заблокированы
- guest-режим: кнопка «Войти гостем»

---

## 4. Настройки Auth в Supabase

Слева **Authentication → Sign In / Providers**:

### Email / Password
- `Email` должен быть включён (обычно включён по умолчанию).
- Если хочешь быстрый тест без почты — можно временно выключить **Confirm email**.
- Если оставишь включённым, после регистрации нужно подтвердить email из письма.

### Site URL
Слева **Authentication → URL Configuration**:
- `Site URL`: URL твоего Replit (например `https://my-app.xxxx.replit.app`)
- `Additional Redirect URLs`: добавь локальный `http://localhost:3000` (для dev, если нужно).

---

## 5. Google OAuth (опционально, но уже есть кнопка)

Если кнопку Google пока не настраивать — она будет показывать ошибку из Supabase (это нормально до настройки).

Чтобы работала:

### 5.1 В Supabase
1. **Authentication → Providers → Google**.
2. Включи Google.
3. Оставь пустыми `Client ID` и `Secret`.
4. Скопируй Redirect URL: `https://XXXX.supabase.co/auth/v1/callback`.

### 5.2 В Google Cloud
1. https://console.cloud.google.com/apis/credentials
2. **Create credentials → OAuth client ID** → Web application.
3. В `Authorized redirect URIs` вставь Supabase callback URL из пункта 5.1.
4. Скопируй `Client ID` и `Client Secret`.
5. Вернись в Supabase → Google provider → вставь их → Save.

---

## 6. Profil-таблица (рекомендуется, но не блокирует)

Код при успешной авторизации пытается прочитать `profiles` из таблицы. Если таблицы нет — игра продолжает работать, просто `profile` берётся из `user_metadata`.

Для полноценного профиля можно создать таблицу в Supabase SQL Editor:

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nickname text,
  avatar_id text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
```

---

## 7. Как понять, что подключилось

- Открой Webview → `/login`.
- После успешного входа ты попадёшь на `/` (если сессия активна).
- Если Supabase не настроен — на `/login` появится жёлтое предупреждение:
  `Supabase не настроен. Добавьте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY`.
- В консоли браузера при ошибке может быть `AuthApiError`/`fetch failed` — это значит, что URL/key не подхватились или неверные.

---

## ⚠️ НЕ делать

- Не вставлять `service_role` / secret key.
- Не вставлять ключи в чат.
- Не коммитить `.env.local`.
- Не создавать никакой бэкенд-сервер: весь auth выполняется напрямую в браузере через Supabase JS.
