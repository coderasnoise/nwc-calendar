-- 0001_init.sql
-- Core schema + updated_at trigger + audit logging trigger for patients

create extension if not exists pgcrypto;

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),

  -- MVP fields
  full_name text not null,
  phone text not null,

  arrival_date date,
  arrival_time time,
  arrival_airport text check (arrival_airport in ('IST', 'SAW')),
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
  -- Storage path convention: patients/<patient_id>/passport/<filename>
  patient_passport_photo_path text
    check (
      patient_passport_photo_path is null
      or patient_passport_photo_path like 'patients/%/passport/%'
    ),

  companion_full_name text,
  companion_passport_number text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  actor_user_id uuid,
  timestamp timestamptz not null default now(),
  old_data jsonb,
  new_data jsonb
);

-- Useful indexes
create index if not exists idx_patients_phone on public.patients (phone);
create index if not exists idx_patients_phone_lower on public.patients ((lower(phone)));
create index if not exists idx_patients_arrival_date on public.patients (arrival_date);
create index if not exists idx_patients_consultation_date on public.patients (consultation_date);
create index if not exists idx_patients_surgery_date on public.patients (surgery_date);
create index if not exists idx_patients_return_date on public.patients (return_date);

create index if not exists idx_audit_log_table_record on public.audit_log (table_name, record_id);
create index if not exists idx_audit_log_timestamp on public.audit_log (timestamp desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_created_by_on_insert()
returns trigger
language plpgsql
as $$
begin
  if new.created_by is null then
    new.created_by := coalesce(auth.uid(), nullif(current_setting('request.jwt.claim.sub', true), '')::uuid);
  end if;
  return new;
end;
$$;

create or replace function public.audit_patients_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_user_id uuid;
begin
  v_actor_user_id := coalesce(auth.uid(), nullif(current_setting('request.jwt.claim.sub', true), '')::uuid);

  if tg_op = 'INSERT' then
    insert into public.audit_log (table_name, record_id, action, actor_user_id, old_data, new_data)
    values ('patients', new.id, 'INSERT', v_actor_user_id, null, to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.audit_log (table_name, record_id, action, actor_user_id, old_data, new_data)
    values ('patients', new.id, 'UPDATE', v_actor_user_id, to_jsonb(old), to_jsonb(new));
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.audit_log (table_name, record_id, action, actor_user_id, old_data, new_data)
    values ('patients', old.id, 'DELETE', v_actor_user_id, to_jsonb(old), null);
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_patients_set_updated_at on public.patients;
create trigger trg_patients_set_updated_at
before update on public.patients
for each row
execute function public.set_updated_at();

drop trigger if exists trg_patients_set_created_by on public.patients;
create trigger trg_patients_set_created_by
before insert on public.patients
for each row
execute function public.set_created_by_on_insert();

drop trigger if exists trg_patients_audit on public.patients;
create trigger trg_patients_audit
after insert or update or delete on public.patients
for each row
execute function public.audit_patients_changes();
