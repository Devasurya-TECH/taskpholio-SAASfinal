-- ============================================================
-- TASKPHOLIO — PRODUCTION DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- CLEAN SLATE (Optional: Removes existing data)
drop table if exists public.daily_activity cascade;
drop table if exists public.meetings cascade;
drop table if exists public.notifications cascade;
drop table if exists public.push_subscriptions cascade;
drop table if exists public.tasks cascade;
drop table if exists public.profiles cascade;

drop function if exists public.handle_new_user cascade;
drop function if exists public.update_updated_at cascade;
drop function if exists public.increment_daily_completion cascade;
drop function if exists public.increment_daily_creation cascade;

-- TEAMS (Dynamic Squads)
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz default now()
);

-- PROFILES (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null check (role in ('ceo','cto','member')) default 'member',
  team text,
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- TASKS
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null check (status in ('pending','in_progress','completed','blocked')) default 'pending',
  priority text not null check (priority in ('low','medium','high','critical')) default 'medium',
  visibility text not null check (visibility in ('personal','team','all')) default 'team',
  assigned_to uuid references public.profiles(id) on delete set null,
  assigned_team text,
  created_by uuid references public.profiles(id) on delete set null,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null check (type in ('task_assigned','task_updated','task_completed','member_added','meeting_scheduled')),
  title text not null,
  body text,
  read boolean default false,
  ref_id uuid,
  created_at timestamptz default now()
);

-- PUSH SUBSCRIPTIONS (for background/mobile web push)
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- MEETINGS
create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  scheduled_at timestamptz not null,
  link text,
  team text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- DAILY ACTIVITY LOG (powers all charts)
create table public.daily_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  date date not null default current_date,
  tasks_completed integer default 0,
  tasks_created integer default 0,
  tasks_updated integer default 0,
  unique(user_id, date)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.notifications enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.meetings enable row level security;
alter table public.daily_activity enable row level security;

alter table public.teams enable row level security;

-- Teams
create policy "teams_select" on public.teams for select using (auth.uid() is not null);
create policy "teams_insert" on public.teams for insert with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('ceo','cto'))
);
create policy "teams_update" on public.teams for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('ceo','cto'))
);
create policy "teams_delete" on public.teams for delete using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('ceo','cto'))
);

-- Profiles
create policy "profiles_select" on public.profiles for select using (
  auth.uid() is not null
);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_admin" on public.profiles for insert with check (true);

-- Tasks
create policy "tasks_select" on public.tasks for select using (
  assigned_to = auth.uid()
  or created_by = auth.uid()
  or (
    visibility = 'team'
    and (
      exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('ceo','cto'))
      or assigned_team = (select team from public.profiles where id = auth.uid())
    )
  )
  or visibility = 'all'
);
create policy "tasks_insert" on public.tasks for insert with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('ceo','cto'))
);
create policy "tasks_update" on public.tasks for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('ceo','cto'))
  or assigned_to = auth.uid()
);
create policy "tasks_delete" on public.tasks for delete using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('ceo','cto'))
);

-- Notifications
create policy "notif_select" on public.notifications for select using (user_id = auth.uid());
create policy "notif_update" on public.notifications for update using (user_id = auth.uid());
create policy "notif_insert" on public.notifications for insert with check (true);

-- Push subscriptions
create policy "push_sub_select_own" on public.push_subscriptions for select using (user_id = auth.uid());
create policy "push_sub_insert_own" on public.push_subscriptions for insert with check (user_id = auth.uid());
create policy "push_sub_update_own" on public.push_subscriptions for update using (user_id = auth.uid());
create policy "push_sub_delete_own" on public.push_subscriptions for delete using (user_id = auth.uid());

-- Meetings
create policy "meetings_select" on public.meetings for select using (auth.uid() is not null);
create policy "meetings_insert" on public.meetings for insert with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('ceo','cto'))
);

-- Daily activity
create policy "activity_select" on public.daily_activity for select using (
  user_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('ceo','cto'))
);
create policy "activity_upsert" on public.daily_activity for all using (true) with check (true);

-- ============================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    NEW.id,
    coalesce(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    coalesce(NEW.raw_user_meta_data->>'role', 'member')
  )
  on conflict (id) do nothing;
  return NEW;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at trigger
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin NEW.updated_at = now(); return NEW; end;
$$;

create trigger tasks_updated_at before update on public.tasks
  for each row execute function update_updated_at();

-- Increment daily_activity on task completion
create or replace function increment_daily_completion()
returns trigger language plpgsql security definer as $$
begin
  if NEW.status = 'completed' and (OLD.status is null or OLD.status != 'completed') then
    if NEW.assigned_to is not null then
      insert into public.daily_activity(user_id, date, tasks_completed)
        values (NEW.assigned_to, current_date, 1)
        on conflict(user_id, date)
        do update set
          tasks_completed = daily_activity.tasks_completed + 1,
          tasks_updated = daily_activity.tasks_updated + 1;
    end if;
    NEW.completed_at = now();
  end if;
  return NEW;
end;
$$;

create trigger on_task_completed
  before update on public.tasks
  for each row execute function increment_daily_completion();

-- Increment daily_activity on task creation
create or replace function increment_daily_creation()
returns trigger language plpgsql security definer as $$
begin
  if NEW.assigned_to is not null then
    insert into public.daily_activity(user_id, date, tasks_created)
      values (NEW.assigned_to, current_date, 1)
      on conflict(user_id, date)
      do update set tasks_created = daily_activity.tasks_created + 1;
  end if;
  return NEW;
end;
$$;

create trigger on_task_created
  after insert on public.tasks
  for each row execute function increment_daily_creation();
