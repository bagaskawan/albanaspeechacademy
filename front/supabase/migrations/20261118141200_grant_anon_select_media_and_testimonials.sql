-- Izinkan peran anon membaca media_assets dan testimonials (disaring oleh RLS published + consent_at).
grant select on public.media_assets to anon;
grant select on public.testimonials to anon;
