alter table public.patients
  add column if not exists consultation_time time;

create index if not exists idx_patients_consultation_time on public.patients (consultation_time);
