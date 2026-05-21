-- Run this in your Supabase SQL editor
-- Enable RLS on all tables

-- 1. Slack setup (bot connection + role-channel mappings per user)
create table if not exists slack_setup (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null unique,
  bot_connected boolean default false,
  mappings     jsonb default '[]'::jsonb,
  updated_at   timestamptz default now()
);

alter table slack_setup enable row level security;

create policy "Users manage their own slack setup"
  on slack_setup for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. Onboarding runs log
create table if not exists onboarding_runs (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  employee_name  text,
  employee_email text not null,
  employee_role  text not null,
  message        text,
  status         text default 'pending',
  result         jsonb,
  created_at     timestamptz default now()
);

alter table onboarding_runs enable row level security;

create policy "Users see their own runs"
  on onboarding_runs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. Trigger to keep updated_at fresh on slack_setup
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger slack_setup_updated_at
  before update on slack_setup
  for each row execute function update_updated_at();
