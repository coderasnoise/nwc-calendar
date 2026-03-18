create table if not exists public.session_timeout_exempt_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.session_timeout_exempt_users enable row level security;

drop policy if exists session_timeout_exempt_users_select_self on public.session_timeout_exempt_users;
create policy session_timeout_exempt_users_select_self
on public.session_timeout_exempt_users
for select
to authenticated
using (user_id = auth.uid());
