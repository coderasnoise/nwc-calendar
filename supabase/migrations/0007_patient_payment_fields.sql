alter table public.patients
  add column if not exists payment_method text
    check (payment_method in ('cash', 'bank_transfer', 'card')),
  add column if not exists payment_currency text
    check (payment_currency in ('GBP', 'AUD', 'USD', 'EUR')),
  add column if not exists payment_amount numeric(12, 2);

alter table public.patients
  drop constraint if exists patients_payment_currency_amount_pair_chk;

alter table public.patients
  add constraint patients_payment_currency_amount_pair_chk
  check (
    (payment_currency is null and payment_amount is null)
    or (payment_currency is not null and payment_amount is not null)
  );
