alter table public.media_assets
  add column if not exists program_slug text references public.programs(slug) on update cascade,
  add column if not exists batch_slug text references public.batches(slug) on update cascade;

drop policy if exists media_assets_approved on public.media_assets;
create policy media_assets_approved on public.media_assets for select to anon, authenticated
  using (published);

drop policy if exists testimonials_approved on public.testimonials;
create policy testimonials_approved on public.testimonials for select to anon, authenticated
  using (published);

drop policy if exists academy_media_public_select on storage.objects;
create policy academy_media_public_select on storage.objects for select to anon, authenticated
  using (bucket_id = 'academy-media' and exists (
    select 1 from public.media_assets m where m.provider = 'supabase_storage'
      and m.object_key = name and m.published
  ));
