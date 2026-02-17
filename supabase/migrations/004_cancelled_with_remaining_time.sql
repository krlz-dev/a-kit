-- Allow cancelled users with remaining paid time to create projects
create or replace function public.check_project_limit()
returns trigger as $$
declare
  user_sub record;
  project_count integer;
begin
  select plan, status, current_period_end into user_sub
  from public.subscriptions
  where user_id = new.user_id;

  -- Paid plans (active or trial) → unlimited
  if user_sub.plan in ('monthly', 'lifetime') and user_sub.status in ('active', 'trial') then
    return new;
  end if;

  -- Cancelled but still within paid period → unlimited
  if user_sub.status = 'cancelled' and user_sub.plan = 'monthly'
     and user_sub.current_period_end > now() then
    return new;
  end if;

  -- Free plan or expired → limit to 1 project
  select count(*) into project_count
  from public.projects
  where user_id = new.user_id;

  if project_count >= 1 then
    raise exception 'Free plan allows only 1 project. Upgrade to create more.';
  end if;

  return new;
end;
$$ language plpgsql security definer;
