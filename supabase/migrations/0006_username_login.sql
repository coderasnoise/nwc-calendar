-- Username-based login support (maps username to email for Supabase Auth sign-in)

create table if not exists public.auth_usernames (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  username text not null unique,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint auth_usernames_username_lowercase check (username = lower(username))
);

create index if not exists auth_usernames_username_idx on public.auth_usernames (username);

alter table public.auth_usernames enable row level security;

-- No direct table access for anon/authenticated; lookups go through RPC only.
drop policy if exists auth_usernames_no_direct_access on public.auth_usernames;
create policy auth_usernames_no_direct_access
on public.auth_usernames
for all
to authenticated
using (false)
with check (false);

create or replace function public.get_login_email_by_username(p_username text)
returns text
language sql
security definer
set search_path = public
as $$
  select au.email
  from public.auth_usernames au
  where au.username = lower(trim(p_username))
  limit 1
$$;

revoke all on function public.get_login_email_by_username(text) from public;
grant execute on function public.get_login_email_by_username(text) to anon;
grant execute on function public.get_login_email_by_username(text) to authenticated;
