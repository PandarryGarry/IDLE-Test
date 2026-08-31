-- ============================================================================
-- Aethelia Idle RPG — Stage 4 SQL (characters + account profile extensions)
-- ----------------------------------------------------------------------------
-- Выполняется в Supabase: SQL Editor -> Run (весь файл, можно повторно —
-- всё идемпотентно: IF NOT EXISTS / DO-блоки).
-- Ключи браузеру НЕ нужны; service_role НЕ используется.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1) ACCOUNT: profiles (id = auth.users.id)
--    Дополняем таблицу аккаунта полями из контракта Этапа 4.
--    Поля добавляются, только если их нет (безопасно для существующей таблицы).
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text,
  role              text default 'user',      -- 'user' | 'admin' (задел под админ-панель)
  donate_currency   bigint default 0,         -- ДОНАТ-ВАЛЮТА на аккаунте (не на персе)
  rules_accepted_at timestamptz,              -- когда принял правила
  rules_version     text,                     -- версия правил (для повторного согласия)
  selected_character_id uuid,                 -- активный персонаж
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Ник/аватар больше НЕ на аккаунте (они на персонаже). Оставляем legacy-поля
-- в profiles, если они уже есть — не мешают, но не используются.
--
-- Если таблица уже существовала со старым куском из SUPABASE_SETUP.md §6,
-- CREATE TABLE IF NOT EXISTS её не трогает. Колонки этапа 4 добираем так:

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists role text default 'user';
alter table public.profiles add column if not exists donate_currency bigint default 0;
alter table public.profiles add column if not exists rules_accepted_at timestamptz;
alter table public.profiles add column if not exists rules_version text;
alter table public.profiles add column if not exists selected_character_id uuid;
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

alter table public.profiles enable row level security;

-- Политики для profiles (создаём, только если их ещё нет)
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Users can view own profile') then
    create policy "Users can view own profile" on public.profiles
      for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Users can insert own profile') then
    create policy "Users can insert own profile" on public.profiles
      for insert with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Users can update own profile') then
    create policy "Users can update own profile" on public.profiles
      for update using (auth.uid() = id) with check (auth.uid() = id);
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 2) CHARACTERS: персонаж (сейчас 1 на аккаунт; задел на N)
-- ----------------------------------------------------------------------------
create table if not exists public.characters (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  nickname             text not null,
  avatar_id            text not null,          -- 'human_male_01' и т.д.
  race_id              text not null,          -- 'human'|'elf'|'dwarf'|'orc'|'beastfolk'
  save_data            jsonb default '{}'::jsonb,
  has_changed_nickname boolean default false,  -- «1 раз бесплатно»
  has_changed_avatar   boolean default false,  -- «1 раз бесплатно»
  selected             boolean default false,  -- активный персонаж
  last_saved_at        timestamptz default now(),
  created_at           timestamptz default now(),
  updated_at           timestamptz default now(),
  is_deleted           boolean default false,  -- мягкое удаление
  deleted_at           timestamptz
);

-- Глобальная уникальность ника среди «живых» персонажей.
create unique index if not exists characters_nickname_active_key
  on public.characters (nickname)
  where not is_deleted;

-- Индекс по владельцу для быстрых запросов.
create index if not exists characters_user_id_idx on public.characters (user_id);

alter table public.characters enable row level security;

-- Политики characters: пользователь управляет только своими персонажами.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='characters' and policyname='Users manage own characters') then
    create policy "Users manage own characters" on public.characters
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 3) RPC: глобальная проверка уникальности ника
--    security definer — обходит RLS, чтобы клиент мог проверить занятость
--    ника ДО создания (запрос «чужих» строк под RLS всё равно вернул бы пусто).
-- ----------------------------------------------------------------------------
create or replace function public.is_nickname_taken(candidate text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.characters
    where lower(nickname) = lower(btrim(candidate))
      and not is_deleted
  );
$$;

-- Разрешаем вызвать функцию анонимной роли (frontend через anon key).
grant execute on function public.is_nickname_taken(text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4) Авто-обновление updated_at (если нужно) — триггер на characters.
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists characters_set_updated_at on public.characters;
create trigger characters_set_updated_at
  before update on public.characters
  for each row execute function public.set_updated_at();

commit;
