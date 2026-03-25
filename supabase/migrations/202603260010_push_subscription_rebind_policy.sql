-- Allow authenticated users to rebind an existing endpoint to their own account.
-- This fixes mobile/shared-device cases where endpoint ownership changes after login switch.

drop policy if exists "push_sub_update_own" on public.push_subscriptions;
drop policy if exists "push_sub_update_rebind" on public.push_subscriptions;

create policy "push_sub_update_rebind"
on public.push_subscriptions
for update
using (auth.uid() is not null)
with check (user_id = auth.uid());
