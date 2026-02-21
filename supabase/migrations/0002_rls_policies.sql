-- 0002_rls_policies.sql
-- RLS policies: any authenticated user can fully manage patients and audit_log

alter table public.patients enable row level security;
alter table public.audit_log enable row level security;

drop policy if exists "patients_auth_all" on public.patients;
create policy "patients_auth_all"
on public.patients
for all
to authenticated
using (true)
with check (true);

drop policy if exists "audit_log_auth_all" on public.audit_log;
create policy "audit_log_auth_all"
on public.audit_log
for all
to authenticated
using (true)
with check (true);
