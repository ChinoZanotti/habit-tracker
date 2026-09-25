-- Habit Tracker — esquema para Supabase (Postgres)
-- Pegar completo en Supabase → SQL Editor → New query → Run.
-- Se puede volver a correr: no rompe nada si ya existe.

-- ---------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------

create table if not exists public.habits (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(btrim(name)) between 1 and 80),
  -- Primer día del mes desde el que el hábito se dejó de seguir (NULL = activo).
  -- "Eliminar solo desde este mes" guarda acá, p. ej. 2026-09-01.
  ended_from  date check (ended_from is null or extract(day from ended_from) = 1),
  created_at  timestamptz not null default now()
);

create table if not exists public.habit_days (
  habit_id  bigint not null references public.habits (id) on delete cascade,
  user_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day       date not null,
  primary key (habit_id, day)
);

create index if not exists habits_user_idx on public.habits (user_id, created_at);
create index if not exists habit_days_user_day_idx on public.habit_days (user_id, day);

-- ---------------------------------------------------------------
-- Seguridad: cada usuario ve y modifica solo lo suyo (Row Level Security)
-- ---------------------------------------------------------------

alter table public.habits enable row level security;
alter table public.habit_days enable row level security;

drop policy if exists "habits: solo el dueño" on public.habits;
create policy "habits: solo el dueño"
  on public.habits
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "habit_days: solo el dueño" on public.habit_days;
create policy "habit_days: solo el dueño"
  on public.habit_days
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.habits h
      where h.id = habit_id and h.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------
-- Permisos de la API (Supabase ya no expone tablas nuevas automáticamente)
-- Solo usuarios con sesión iniciada; nada para "anon".
-- ---------------------------------------------------------------

revoke all on public.habits, public.habit_days from anon;
grant select, insert, update, delete on public.habits to authenticated;
grant select, insert, delete on public.habit_days to authenticated;
