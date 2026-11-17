-- Old gallery.consent_at timestamps were auto-filled, so they do not prove permission.
alter table public.gallery add column consent_verified_at timestamptz;

drop policy if exists gallery_public on public.gallery;
create policy gallery_public on public.gallery for select to anon, authenticated
  using (consent_verified_at is not null);

alter table public.media_assets
  add constraint media_assets_published_has_consent check (not published or consent_at is not null);

drop policy if exists media_assets_approved on public.media_assets;
create policy media_assets_approved on public.media_assets for select to anon, authenticated
  using (published and consent_at is not null);
