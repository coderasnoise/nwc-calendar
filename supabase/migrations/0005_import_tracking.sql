-- 0005_import_tracking.sql
-- Additive import tracking for Google ICS Parse & Review delete flow

alter table public.patients
  add column if not exists import_source text,
  add column if not exists import_batch_id uuid,
  add column if not exists import_event_uid text,
  add column if not exists imported_at timestamptz default now();

create table if not exists public.import_batches (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  filename text,
  imported_by uuid,
  imported_at timestamptz not null default now(),
  counts jsonb
);

create index if not exists idx_patients_import_source on public.patients (import_source);
create index if not exists idx_patients_import_event_uid on public.patients (import_event_uid);
create index if not exists idx_patients_import_batch_id on public.patients (import_batch_id);

create index if not exists idx_import_batches_source on public.import_batches (source);
create index if not exists idx_import_batches_imported_at on public.import_batches (imported_at desc);

alter table public.import_batches enable row level security;

drop policy if exists "import_batches_auth_all" on public.import_batches;
create policy "import_batches_auth_all"
on public.import_batches
for all
to authenticated
using (true)
with check (true);
