-- WARNING: Destructive reset migration.
-- Keeps only the specified admin auth user + profile, removes all other application/auth records.

do $$
declare
  keep_email text := 'admin@taskpholio.com';
  keep_user_id uuid;
begin
  select id
    into keep_user_id
  from auth.users
  where lower(email) = lower(keep_email)
  limit 1;

  if keep_user_id is null then
    raise exception 'Reset aborted: admin auth account % not found.', keep_email;
  end if;

  -- Public dataset reset
  delete from public.notifications;
  delete from public.push_subscriptions;
  delete from public.daily_activity;
  delete from public.meetings;
  delete from public.tasks;
  delete from public.teams;

  -- Keep only admin profile
  delete from public.profiles where id <> keep_user_id;

  -- Auth cleanup (keep only admin credentials)
  delete from auth.users where id::text <> keep_user_id::text;

  -- Ensure admin profile role/access is correct
  insert into public.profiles (id, full_name, email, role, team, is_active, created_at)
  values (keep_user_id, 'Taskpholio Admin', keep_email, 'ceo', null, true, now())
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    role = 'ceo',
    team = null,
    is_active = true;

  -- Keep admin metadata normalized
  update auth.users
  set
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
      'full_name', 'Taskpholio Admin',
      'role', 'ceo'
    )
  where id = keep_user_id;
end
$$;
