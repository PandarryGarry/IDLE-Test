-- ============================================================================
-- Aethelia Idle RPG — защита привилегий и донат-валюты на profiles
-- ----------------------------------------------------------------------------
-- Пробел, который закрывает этот файл:
--   политика «Users can update own profile» разрешает владельцу строки
--   менять ЛЮБУЮ колонку, включая role ('user' | 'admin') и donate_currency.
--   То есть игрок может сам себе выдать админку и накрутить донат-валюту,
--   которая уже показывается в UI («На балансе: N 💎», HeroSettingsModal) и
--   закладывает платную смену ника/аватара.
--
-- Решение: BEFORE UPDATE-триггер, который возвращает защищённые колонки к
-- прежнему значению для запросов через API (роли JWT `anon`/`authenticated`).
-- Прямой заход из SQL Editor и будущий сервисный RPC — свободны. Обычные права
-- (rules_accepted_at, rules_version, selected_character_id, email) — как были,
-- ничего в приложении не ломается.
--
-- Выполняется в Supabase → SQL Editor → Run. Идемпотентно, можно повторять.
-- service_role (серверный ключ) по-прежнему не используется клиентом:
-- правку role/donate_currency сможет делать только админ через дашборд или
-- будущий серверный RPC.
-- ============================================================================

begin;

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
as $$
begin
  -- Ограничиваем только запросы через API (роль JWT). Прямой заход из
  -- SQL Editor / из будущего серверного RPC (service_role) — свободен:
  -- иначе админ не смог бы выдать роль даже легально, и откатывал бы триггер.
  if coalesce(current_setting('request.jwt.claim.role', true), '')
     not in ('anon', 'authenticated') then
    return new;
  end if;

  new.role            := old.role;
  new.donate_currency := old.donate_currency;
  return new;
end;
$$;

drop trigger if exists profiles_protect_privileges on public.profiles;
create trigger profiles_protect_privileges
  before update on public.profiles
  for each row execute function public.protect_profile_privileges();

-- Подстраховка на уровне данных: неизвестная роль невозможна в принципе.
-- (CHECK не помечен как NOT VALID — значения 'user'/'admin' в таблице уже есть.)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_role_allowed' and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_role_allowed check (role in ('user', 'admin'));
  end if;
end $$;

-- Значение по умолчанию и «не отнимать» на вставке: новый аккаунт — всегда user.
alter table public.profiles alter column role set default 'user';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_donate_currency_non_negative'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_donate_currency_non_negative check (donate_currency >= 0);
  end if;
end $$;

commit;

-- ----------------------------------------------------------------------------
-- Как проверить. Из SQL Editor триггер НЕ мешает (проверка на роль JWT),
-- поэтому «запрет» виден только через API/браузер. В SQL Editor удобно
-- проверить, что легальные правки живы:
--   -- 1) легальная правка своих полей работает:
--   update public.profiles set rules_version = 'v1' where id = auth.uid();
--   select role, rules_version from public.profiles where id = auth.uid();
--
--   -- 2) попытка игрока через API (браузер, anon/authenticated key):
--   update profiles set role='admin' where id = auth.uid();
--   -- запрос пройдёт и молча ничего не изменит в role/donate_currency
--
--   -- 3) выдать админа официально теперь можно отсюда, из SQL Editor:
--   update public.profiles set role = 'admin' where email = 'me@example.com';
--
-- Откат (если что-то из этого мешает):
--   drop trigger if exists profiles_protect_privileges on public.profiles;
--   drop function if exists public.protect_profile_privileges();
-- ----------------------------------------------------------------------------
