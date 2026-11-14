insert into public.programs (slug, title, description, price_idr, materials)
values
  ('sertifikasi-pembicara-profesional', 'Sertifikasi Pembicara Profesional',
   'Program sertifikasi untuk pembicara profesional. Detail asesmen dan jadwal diumumkan oleh admin.', 0, '[]'::jsonb),
  ('inhouse-training', 'Inhouse Training',
   'Pelatihan komunikasi dan public speaking untuk kebutuhan tim, perusahaan, dan instansi. Konsultasikan tujuan serta format bersama Albana.', 0, '[]'::jsonb)
on conflict (slug) do nothing;

create table public.academy_partners (
  id bigint generated always as identity primary key,
  name text not null check (length(btrim(name)) between 1 and 160),
  logo_url text,
  sort_order integer not null default 0,
  published boolean not null default false
);
alter table public.academy_partners enable row level security;
create policy academy_partners_public on public.academy_partners for select to anon, authenticated
  using (published);
revoke all on public.academy_partners from anon, authenticated;
grant select on public.academy_partners to anon, authenticated;
grant all on public.academy_partners to service_role;
grant usage, select on sequence public.academy_partners_id_seq to service_role;
