alter table public.patients
  add column if not exists return_transfer_arranged boolean not null default false,
  add column if not exists surgeries_selected text[] not null default '{}';

create table if not exists public.surgery_options (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_surgery_options_name_lower on public.surgery_options ((lower(name)));

drop trigger if exists trg_surgery_options_set_updated_at on public.surgery_options;
create trigger trg_surgery_options_set_updated_at
before update on public.surgery_options
for each row
execute function public.set_updated_at();

alter table public.surgery_options enable row level security;

drop policy if exists surgery_options_authenticated_all on public.surgery_options;
create policy surgery_options_authenticated_all
on public.surgery_options
for all
to authenticated
using (true)
with check (true);
