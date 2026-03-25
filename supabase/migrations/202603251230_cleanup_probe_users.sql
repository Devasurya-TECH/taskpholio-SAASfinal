-- Cleanup transient probe users created during function verification
delete from public.notifications
where ref_id in (
  select id from public.profiles where email like 'probe%@taskpholio.test'
);

delete from public.profiles
where email like 'probe%@taskpholio.test';

delete from auth.users
where email like 'probe%@taskpholio.test';

