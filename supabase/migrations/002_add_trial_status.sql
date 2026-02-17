-- Add 'trial' to subscription status check constraint
alter table public.subscriptions
  drop constraint subscriptions_status_check,
  add constraint subscriptions_status_check
    check (status in ('active', 'cancelled', 'expired', 'pending', 'trial'));

-- Add trial_end column
alter table public.subscriptions
  add column if not exists trial_end timestamptz;

-- Allow trial users to create projects (same as active)
create or replace function public.check_project_limit()
returns trigger as $$
declare
  user_plan text;
  project_count integer;
begin
  select plan into user_plan
  from public.subscriptions
  where user_id = new.user_id and status in ('active', 'trial');

  if user_plan = 'free' then
    select count(*) into project_count
    from public.projects
    where user_id = new.user_id;

    if project_count >= 1 then
      raise exception 'Free plan allows only 1 project. Upgrade to create more.';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;
