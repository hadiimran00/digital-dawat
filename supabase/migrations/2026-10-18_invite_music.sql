-- Customers' own songs for their invitation (2026-10-18). Run in the Supabase SQL editor.
-- A public bucket like invite-photos: guests play the song by URL; each customer can only write to their own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('invite-music', 'invite-music', true, 10485760, array['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "owner uploads invite music" on storage.objects;
create policy "owner uploads invite music" on storage.objects for insert to authenticated
  with check (bucket_id = 'invite-music' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "owner reads own invite music" on storage.objects;
create policy "owner reads own invite music" on storage.objects for select to authenticated
  using (bucket_id = 'invite-music' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
drop policy if exists "owner deletes own invite music" on storage.objects;
create policy "owner deletes own invite music" on storage.objects for delete to authenticated
  using (bucket_id = 'invite-music' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
