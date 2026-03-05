alter table public.surgery_options
  add column if not exists category text not null default 'other'
    check (category in ('face', 'body', 'other'));

update public.surgery_options
set category = 'face'
where name in (
  'Deep Plane Face Lift',
  'Lower Face Lift',
  'Neck Lift',
  'Upper Eyelid',
  'Lower Eyelid',
  'Temporal Lift',
  'Mid Facelift',
  'Fat Injection',
  'Mini Facelift',
  'Rhinoplasty',
  'Brow Lift',
  'Lip Lift',
  'Chin Implant'
);

update public.surgery_options
set category = 'body'
where name in (
  'Breast Augmentation (Motiva)',
  'Breast Lift',
  'Implant',
  'Implant Exchange',
  '360° Liposuction',
  'Extended Tummy Tuck',
  'BBL',
  'Tummy Tuck',
  'Revision Liposuction',
  'Bariatric',
  'Blood Unit (if required)'
);

update public.surgery_options
set category = 'other'
where name in (
  'Teeth'
);

create index if not exists idx_surgery_options_category_name on public.surgery_options (category, name);
