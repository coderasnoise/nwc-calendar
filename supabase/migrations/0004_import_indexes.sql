-- 0004_import_indexes.sql
-- Optional index to speed up duplicate checks during .ics imports

create index if not exists idx_patients_import_dedupe
on public.patients (lower(full_name), surgery_date, phone);
