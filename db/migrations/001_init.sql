create extension if not exists pgcrypto;

create type public.airport_code as enum ('IST', 'SAW');

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  arrival_date date,
  arrival_time time,
  arrival_airport public.airport_code,
  arrival_flight_code text,
  consultation_date date,
  surgery_date date,
  surgeries_text text,
  return_date date,
  return_time time,
  return_flight_code text,
  transfer_arranged boolean not null default false,
  transfer_driver_name text,
  hotel_arranged boolean not null default false,
  hotel_room_type text,
  booked_with_assistant boolean not null default false,
  patient_passport_number text,
  patient_passport_photo_path text,
  companion_full_name text,
  companion_passport_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patients_arrival_date on public.patients(arrival_date);
create index if not exists idx_patients_consultation_date on public.patients(consultation_date);
create index if not exists idx_patients_surgery_date on public.patients(surgery_date);
create index if not exists idx_patients_return_date on public.patients(return_date);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  operation text not null check (operation in ('INSERT', 'UPDATE', 'DELETE')),
  actor_user_id uuid,
  changed_columns text[],
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_patients_set_updated_at
before update on public.patients
for each row
execute function public.set_updated_at();

create or replace function public.jsonb_changed_keys(old_row jsonb, new_row jsonb)
returns text[]
language sql
immutable
as $$
  select coalesce(array_agg(key order by key), '{}'::text[])
  from (
    select coalesce(o.key, n.key) as key,
           o.value as old_val,
           n.value as new_val
    from jsonb_each(old_row) o
    full outer join jsonb_each(new_row) n using (key)
  ) t
  where old_val is distinct from new_val;
$$;

create or replace function public.audit_patients_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid;
  old_row jsonb;
  new_row jsonb;
  changed text[];
begin
  actor := coalesce(auth.uid(), nullif(current_setting('request.jwt.claim.sub', true), '')::uuid);

  if tg_op = 'INSERT' then
    old_row := null;
    new_row := to_jsonb(new);
    changed := null;
  elsif tg_op = 'UPDATE' then
    old_row := to_jsonb(old);
    new_row := to_jsonb(new);
    changed := public.jsonb_changed_keys(old_row, new_row);
  elsif tg_op = 'DELETE' then
    old_row := to_jsonb(old);
    new_row := null;
    changed := null;
  end if;

  insert into public.audit_logs (table_name, record_id, operation, actor_user_id, changed_columns, old_data, new_data)
  values ('patients', coalesce(new.id, old.id), tg_op, actor, changed, old_row, new_row);

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger trg_patients_audit
after insert or update or delete on public.patients
for each row
execute function public.audit_patients_changes();

alter table public.patients enable row level security;
alter table public.audit_logs enable row level security;

create policy "authenticated_can_manage_patients"
on public.patients
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "authenticated_can_read_audit_logs"
on public.audit_logs
for select
using (auth.role() = 'authenticated');

insert into storage.buckets (id, name, public)
values ('passport-photos', 'passport-photos', false)
on conflict (id) do nothing;

create policy "authenticated_upload_passport_photos"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'passport-photos');

create policy "authenticated_read_passport_photos"
on storage.objects
for select
to authenticated
using (bucket_id = 'passport-photos');

create policy "authenticated_update_passport_photos"
on storage.objects
for update
to authenticated
using (bucket_id = 'passport-photos')
with check (bucket_id = 'passport-photos');

drop policy if exists "authenticated_delete_passport_photos" on storage.objects;
create policy "authenticated_delete_passport_photos"
on storage.objects
for delete
to authenticated
using (bucket_id = 'passport-photos');
