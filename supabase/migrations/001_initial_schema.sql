-- ============================================================
-- kit-a: Initial Schema
-- ============================================================

-- ── Projects table ──────────────────────────────────────────
create table public.projects (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null default 'Untitled',
  type       text not null check (type in ('arch', 'gantt')),
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_projects_user on public.projects(user_id);

-- ── Subscriptions table ─────────────────────────────────────
create table public.subscriptions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null unique references auth.users(id) on delete cascade,
  plan                 text not null default 'free' check (plan in ('free', 'monthly', 'lifetime')),
  status               text not null default 'active' check (status in ('active', 'cancelled', 'expired', 'pending')),
  flow_customer_id     text,
  flow_subscription_id text,
  current_period_start timestamptz,
  current_period_end   timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ── Flow payments log ───────────────────────────────────────
create table public.flow_payments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  flow_order   bigint,
  flow_token   text,
  amount       integer not null,
  currency     text not null default 'CLP',
  payment_type text not null check (payment_type in ('monthly', 'lifetime')),
  status       integer not null default 1, -- 1=pending, 2=paid, 3=rejected, 4=cancelled
  raw_response jsonb,
  created_at   timestamptz not null default now()
);

create index idx_flow_payments_user on public.flow_payments(user_id);

-- ============================================================
-- RLS Policies
-- ============================================================

alter table public.projects enable row level security;
alter table public.subscriptions enable row level security;
alter table public.flow_payments enable row level security;

-- Projects: users CRUD own rows
create policy "Users can select own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Subscriptions: users read own, service_role writes
create policy "Users can select own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Note: INSERT/UPDATE for subscriptions handled by service_role (edge functions) or triggers

-- Flow payments: users read own, service_role writes
create policy "Users can select own payments"
  on public.flow_payments for select
  using (auth.uid() = user_id);

-- ============================================================
-- Triggers
-- ============================================================

-- Auto-update updated_at on projects
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_project_updated
  before update on public.projects
  for each row execute function public.handle_updated_at();

create trigger on_subscription_updated
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

-- Auto-create subscription row for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enforce project limit for free plan
create or replace function public.check_project_limit()
returns trigger as $$
declare
  user_plan text;
  project_count integer;
begin
  select plan into user_plan
  from public.subscriptions
  where user_id = new.user_id and status = 'active';

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

create trigger on_project_insert_check_limit
  before insert on public.projects
  for each row execute function public.check_project_limit();
