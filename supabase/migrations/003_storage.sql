-- ITEX 🚀 — 003: Rasmlar uchun Storage bucket va siyosatlar.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('itex-media', 'itex-media', true, 5242880,
        array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "itex media public read" on storage.objects;
create policy "itex media public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'itex-media');

drop policy if exists "itex media admin insert" on storage.objects;
create policy "itex media admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'itex-media' and public.is_admin());

drop policy if exists "itex media admin update" on storage.objects;
create policy "itex media admin update" on storage.objects
  for update to authenticated using (bucket_id = 'itex-media' and public.is_admin())
  with check (bucket_id = 'itex-media' and public.is_admin());

drop policy if exists "itex media admin delete" on storage.objects;
create policy "itex media admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'itex-media' and public.is_admin());
