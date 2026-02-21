-- 0003_storage.sql
-- Storage bucket + policies for passport photos
-- Path convention in bucket: patients/<patient_id>/passport/<filename>

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'passport-photos',
  'passport-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

drop policy if exists "passport_photos_auth_select" on storage.objects;
create policy "passport_photos_auth_select"
on storage.objects
for select
to authenticated
using (bucket_id = 'passport-photos');

drop policy if exists "passport_photos_auth_insert" on storage.objects;
create policy "passport_photos_auth_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'passport-photos'
  and name like 'patients/%/passport/%'
);

drop policy if exists "passport_photos_auth_update" on storage.objects;
create policy "passport_photos_auth_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'passport-photos')
with check (
  bucket_id = 'passport-photos'
  and name like 'patients/%/passport/%'
);

drop policy if exists "passport_photos_auth_delete" on storage.objects;
create policy "passport_photos_auth_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'passport-photos');
