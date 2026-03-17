create table if not exists public.login_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  user_email text,
  logged_in_at timestamptz not null default now(),
  ip_address text,
  user_agent text
);

create table if not exists public.login_log_viewers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_login_logs_logged_in_at on public.login_logs (logged_in_at desc);
create index if not exists idx_login_logs_user_id on public.login_logs (user_id);

alter table public.login_logs enable row level security;
alter table public.login_log_viewers enable row level security;

drop policy if exists login_logs_select_for_viewers on public.login_logs;
create policy login_logs_select_for_viewers
on public.login_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.login_log_viewers v
    where v.user_id = auth.uid()
  )
);

drop policy if exists login_log_viewers_select_self on public.login_log_viewers;
create policy login_log_viewers_select_self
on public.login_log_viewers
for select
to authenticated
using (user_id = auth.uid());

create or replace function public.log_login_event(
  p_user_id uuid,
  p_user_email text,
  p_ip_address text default null,
  p_user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.login_logs (user_id, user_email, ip_address, user_agent)
  values (p_user_id, p_user_email, p_ip_address, p_user_agent);
end;
$$;

revoke all on function public.log_login_event(uuid, text, text, text) from public;
grant execute on function public.log_login_event(uuid, text, text, text) to anon;
grant execute on function public.log_login_event(uuid, text, text, text) to authenticated;
