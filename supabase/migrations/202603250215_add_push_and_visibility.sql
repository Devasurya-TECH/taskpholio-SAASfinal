-- Task visibility policy hardening + Web Push subscriptions

drop policy if exists "tasks_select" on public.tasks;

create policy "tasks_select" on public.tasks for select using (
  assigned_to = auth.uid()
  or created_by = auth.uid()
  or (
    visibility = 'team'
    and (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role in ('ceo','cto')
      )
      or assigned_team = (select team from public.profiles where id = auth.uid())
    )
  )
  or visibility = 'all'
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push_sub_select_own" on public.push_subscriptions;
drop policy if exists "push_sub_insert_own" on public.push_subscriptions;
drop policy if exists "push_sub_update_own" on public.push_subscriptions;
drop policy if exists "push_sub_delete_own" on public.push_subscriptions;

create policy "push_sub_select_own" on public.push_subscriptions for select using (user_id = auth.uid());
create policy "push_sub_insert_own" on public.push_subscriptions for insert with check (user_id = auth.uid());
create policy "push_sub_update_own" on public.push_subscriptions for update using (user_id = auth.uid());
create policy "push_sub_delete_own" on public.push_subscriptions for delete using (user_id = auth.uid());
