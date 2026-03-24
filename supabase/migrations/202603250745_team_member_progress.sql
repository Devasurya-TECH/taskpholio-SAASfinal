-- Team member progress tracking for team-assigned tasks

alter table public.tasks
  add column if not exists team_progress jsonb not null default '[]'::jsonb;

drop policy if exists "tasks_update" on public.tasks;

create policy "tasks_update" on public.tasks for update
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('ceo','cto')
  )
  or assigned_to = auth.uid()
  or (
    visibility = 'team'
    and assigned_team = (select team from public.profiles where id = auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('ceo','cto')
  )
  or assigned_to = auth.uid()
  or (
    visibility = 'team'
    and assigned_team = (select team from public.profiles where id = auth.uid())
  )
);
