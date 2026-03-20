-- 0005_leads.sql
-- Lead Desk MVP schema for manual intake, review, quoting, and follow-up workflow

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),

  full_name text not null,
  phone text not null,
  email text,
  source text not null check (source in ('meta', 'whatsapp', 'email', 'referral', 'walk_in', 'other')),
  country text,
  procedure_interest text,

  status text not null default 'new'
    check (status in ('new', 'contacted', 'awaiting_review', 'review_ready', 'quoted', 'follow_up', 'booked', 'lost')),
  owner_name text,

  first_contact_at timestamptz,
  first_contact_channel text
    check (first_contact_channel in ('whatsapp', 'phone', 'email', 'other')),
  first_contact_summary text,

  boss_review_status text not null default 'not_requested'
    check (boss_review_status in ('not_requested', 'pending', 'approved', 'needs_info', 'declined')),
  boss_review_requested_at timestamptz,
  boss_review_completed_at timestamptz,

  consultation_summary text,
  medical_summary text,

  quote_status text not null default 'not_prepared'
    check (quote_status in ('not_prepared', 'drafted', 'sent', 'accepted', 'declined')),
  quote_amount numeric(10, 2),
  quote_currency text
    check (quote_currency in ('GBP', 'EUR', 'USD', 'TRY')),
  quote_summary text,

  follow_up_due_date date,
  follow_up_owner_name text,
  follow_up_status text not null default 'none'
    check (follow_up_status in ('none', 'scheduled', 'overdue', 'completed')),

  lost_reason text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);

create table if not exists public.lead_followups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  follow_up_date date not null,
  channel text not null check (channel in ('whatsapp', 'phone', 'email', 'other')),
  status text not null default 'completed' check (status in ('scheduled', 'completed', 'canceled')),
  summary text not null,
  next_due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);

create index if not exists idx_leads_status on public.leads (status);
create index if not exists idx_leads_boss_review_status on public.leads (boss_review_status);
create index if not exists idx_leads_quote_status on public.leads (quote_status);
create index if not exists idx_leads_follow_up_due_date on public.leads (follow_up_due_date);
create index if not exists idx_leads_created_at on public.leads (created_at desc);
create index if not exists idx_leads_full_name_lower on public.leads ((lower(full_name)));
create index if not exists idx_leads_phone_lower on public.leads ((lower(phone)));
create index if not exists idx_lead_followups_lead_date on public.lead_followups (lead_id, follow_up_date desc);

drop trigger if exists trg_leads_set_updated_at on public.leads;
create trigger trg_leads_set_updated_at
before update on public.leads
for each row
execute function public.set_updated_at();

drop trigger if exists trg_leads_set_created_by on public.leads;
create trigger trg_leads_set_created_by
before insert on public.leads
for each row
execute function public.set_created_by_on_insert();

drop trigger if exists trg_lead_followups_set_updated_at on public.lead_followups;
create trigger trg_lead_followups_set_updated_at
before update on public.lead_followups
for each row
execute function public.set_updated_at();

drop trigger if exists trg_lead_followups_set_created_by on public.lead_followups;
create trigger trg_lead_followups_set_created_by
before insert on public.lead_followups
for each row
execute function public.set_created_by_on_insert();

create or replace function public.audit_leads_changes()
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
    values ('leads', new.id, 'INSERT', v_actor_user_id, null, to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.audit_log (table_name, record_id, action, actor_user_id, old_data, new_data)
    values ('leads', new.id, 'UPDATE', v_actor_user_id, to_jsonb(old), to_jsonb(new));
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.audit_log (table_name, record_id, action, actor_user_id, old_data, new_data)
    values ('leads', old.id, 'DELETE', v_actor_user_id, to_jsonb(old), null);
    return old;
  end if;

  return null;
end;
$$;

create or replace function public.audit_lead_followups_changes()
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
    values ('lead_followups', new.id, 'INSERT', v_actor_user_id, null, to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.audit_log (table_name, record_id, action, actor_user_id, old_data, new_data)
    values ('lead_followups', new.id, 'UPDATE', v_actor_user_id, to_jsonb(old), to_jsonb(new));
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.audit_log (table_name, record_id, action, actor_user_id, old_data, new_data)
    values ('lead_followups', old.id, 'DELETE', v_actor_user_id, to_jsonb(old), null);
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_leads_audit on public.leads;
create trigger trg_leads_audit
after insert or update or delete on public.leads
for each row
execute function public.audit_leads_changes();

drop trigger if exists trg_lead_followups_audit on public.lead_followups;
create trigger trg_lead_followups_audit
after insert or update or delete on public.lead_followups
for each row
execute function public.audit_lead_followups_changes();

alter table public.leads enable row level security;
alter table public.lead_followups enable row level security;

drop policy if exists "leads_auth_all" on public.leads;
create policy "leads_auth_all"
on public.leads
for all
to authenticated
using (true)
with check (true);

drop policy if exists "lead_followups_auth_all" on public.lead_followups;
create policy "lead_followups_auth_all"
on public.lead_followups
for all
to authenticated
using (true)
with check (true);
