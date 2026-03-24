-- Non-destructive migration for Web Push support

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
