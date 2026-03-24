-- Non-destructive migration for task workflow metadata and task policies

alter table public.tasks
  add column if not exists attachments jsonb not null default '[]'::jsonb,
  add column if not exists subtasks jsonb not null default '[]'::jsonb,
  add column if not exists comments jsonb not null default '[]'::jsonb,
  add column if not exists activity jsonb not null default '[]'::jsonb,
  add column if not exists tags jsonb not null default '[]'::jsonb,
  add column if not exists progress integer not null default 0,
  add column if not exists is_archived boolean not null default false;

drop policy if exists "tasks_select" on public.tasks;
drop policy if exists "tasks_insert" on public.tasks;

create policy "tasks_select" on public.tasks for select using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('ceo','cto')
  )
  or assigned_to = auth.uid()
  or created_by = auth.uid()
  or (
    visibility = 'team'
    and assigned_team = (select team from public.profiles where id = auth.uid())
  )
  or visibility = 'all'
);

create policy "tasks_insert" on public.tasks for insert with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('ceo','cto')
  )
  and created_by = auth.uid()
);
