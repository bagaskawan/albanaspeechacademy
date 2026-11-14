-- Testimoni admin: foto testimoner, nama otomatis dari data member, dan batas 20–30 kata.

alter table public.testimonials
  add column if not exists member_id uuid references public.members(id) on delete set null,
  add column if not exists photo_url text;

create index if not exists testimonials_member_id_idx
  on public.testimonials (member_id);

-- Terbit dan izin publikasi terisi otomatis; tidak perlu diisi lewat form.
alter table public.testimonials
  alter column published set default true,
  alter column consent_at set default now();

update public.testimonials
set published = true,
    consent_at = coalesce(consent_at, now())
where published = false or consent_at is null;

-- Nama testimoner selalu mengikuti nama member yang dipilih.
create or replace function public.testimonials_set_attribution()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.member_id is not null then
    select full_name into new.attribution
    from public.members
    where id = new.member_id;
  end if;
  return new;
end;
$$;

drop trigger if exists testimonials_set_attribution on public.testimonials;
create trigger testimonials_set_attribution
  before insert or update of member_id on public.testimonials
  for each row execute function public.testimonials_set_attribution();

-- Trigger function tidak perlu dipanggil lewat API.
revoke all on function public.testimonials_set_attribution() from public, anon, authenticated;

-- Kutipan dibatasi 20–30 kata.
alter table public.testimonials
  drop constraint if exists testimonials_quote_word_count;
alter table public.testimonials
  add constraint testimonials_quote_word_count
  check (array_length(regexp_split_to_array(btrim(quote), '\s+'), 1) between 20 and 30);

-- Bucket foto testimoni (publik untuk dibaca, unggah khusus admin).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('testimonials', 'testimonials', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists testimonials_public_select on storage.objects;
create policy testimonials_public_select on storage.objects
  for select using (bucket_id = 'testimonials');

drop policy if exists testimonials_admin_insert on storage.objects;
create policy testimonials_admin_insert on storage.objects
  for insert with check (
    bucket_id = 'testimonials'
    and exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()))
  );

drop policy if exists testimonials_admin_update on storage.objects;
create policy testimonials_admin_update on storage.objects
  for update using (
    bucket_id = 'testimonials'
    and exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()))
  );

drop policy if exists testimonials_admin_delete on storage.objects;
create policy testimonials_admin_delete on storage.objects
  for delete using (
    bucket_id = 'testimonials'
    and exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()))
  );

-- Menu sidebar Testimoni.
insert into public.privilege_items (group_id, name, href, icon_name, slug, sort_order, status)
select g.id, 'Testimoni', '/admin/testimoni', 'file-text', 'testimoni', 6, 'active'
from public.privilege_groups g
where g.name = 'KATALOG'
  and not exists (select 1 from public.privilege_items i where i.slug = 'testimoni');
