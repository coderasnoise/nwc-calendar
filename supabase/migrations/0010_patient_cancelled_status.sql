alter table public.patients
  add column if not exists is_cancelled boolean not null default false;

create index if not exists idx_patients_is_cancelled on public.patients (is_cancelled);
