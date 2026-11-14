-- Skema awal MVP akademi untuk proyek Supabase kosong dengan Auth.
-- Jalankan sebagai pemilik skema. Seluruh instalasi dibatalkan bila ada benturan.
begin;

create table public.programs (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (btrim(title) <> ''),
  price_idr bigint not null check (price_idr >= 0)
);

-- Jadwal diurutkan dari pertemuan pertama, menggunakan waktu lokal WIB.
create function public.valid_session_schedule(schedule jsonb)
returns boolean language plpgsql immutable strict set search_path = '' as $$
declare
  session jsonb;
  starts timestamp;
  ends timestamp;
  previous_end timestamp;
begin
  if jsonb_typeof(schedule) <> 'array' or schedule = '[]'::jsonb then
    return false;
  end if;
  for session in select value from jsonb_array_elements(schedule) loop
    if coalesce(session->>'starts_at', '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T([01][0-9]|2[0-3]):[0-5][0-9]$'
       or coalesce(session->>'ends_at', '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T([01][0-9]|2[0-3]):[0-5][0-9]$' then
      return false;
    end if;
    starts := (session->>'starts_at')::timestamp;
    ends := (session->>'ends_at')::timestamp;
    if ends <= starts or starts < previous_end then return false; end if;
    previous_end := ends;
  end loop;
  return true;
end $$;

create table public.batches (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  program_slug text not null references public.programs(slug),
  title text not null check (btrim(title) <> ''),
  sessions jsonb not null check (public.valid_session_schedule(sessions)),
  registration_open boolean not null default false
);
create index batches_program on public.batches(program_slug);

create table public.trainers (
  slug text primary key,
  name text not null check (btrim(name) <> ''),
  bio text
);
create table public.articles (
  slug text primary key,
  title text not null check (btrim(title) <> ''),
  body text not null check (btrim(body) <> ''),
  published boolean not null default false
);
create table public.gallery (
  id bigint generated always as identity primary key,
  title text not null check (btrim(title) <> ''),
  image_url text not null check (image_url ~ '^https://[^[:space:]]+$'),
  consent_at timestamptz not null
);
create table public.contact_channels (
  kind text primary key check (kind in ('address','instagram','whatsapp','email')),
  value text not null check (btrim(value) <> '')
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table public.registrations (
  id bigint generated always as identity primary key,
  batch_slug text not null references public.batches(slug),
  full_name text not null check (length(btrim(full_name)) between 1 and 160),
  whatsapp text not null check (whatsapp ~ '^[+]?[0-9]{8,15}$'),
  email text not null check (
    email = lower(btrim(email)) and length(email) <= 254
    and email ~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'
  ),
  nickname text not null check (btrim(nickname) <> ''),
  domicile text not null check (btrim(domicile) <> ''),
  gender text not null check (gender in ('Perempuan','Laki-laki')),
  age smallint not null check (age between 1 and 150),
  profession text not null check (btrim(profession) <> ''),
  institution text not null check (btrim(institution) <> ''),
  socials text[] not null default '{}' check (
    socials <@ array['instagram','tiktok','facebook','linkedin','other']
    and cardinality(socials) <= 5 and array_position(socials, null) is null
  ),
  social_other text,
  social_name text,
  prior_experience boolean not null,
  goal text not null check (btrim(goal) <> ''),
  challenge text not null check (btrim(challenge) <> ''),
  source text not null check (source in ('instagram','whatsapp','referral','other')),
  source_other text,
  attendance text not null check (attendance in ('yes','maybe')),
  payment_method text not null check (payment_method in ('full','dp20')),
  price_idr_at_signup bigint not null check (price_idr_at_signup >= 0),
  initial_transfer_idr bigint generated always as (
    case when payment_method = 'dp20' then round(price_idr_at_signup * 0.20)::bigint
         else price_idr_at_signup end
  ) stored,
  remaining_after_transfer_idr bigint generated always as (
    case when payment_method = 'dp20' then price_idr_at_signup - round(price_idr_at_signup * 0.20)::bigint
         else 0 end
  ) stored,
  received_at timestamptz not null default now(),
  unique (batch_slug, email),
  check (not ('other' = any(socials)) or coalesce(btrim(social_other),'') <> ''),
  check (source <> 'other' or coalesce(btrim(source_other),'') <> '')
);

alter table public.programs enable row level security;
alter table public.batches enable row level security;
alter table public.trainers enable row level security;
alter table public.articles enable row level security;
alter table public.gallery enable row level security;
alter table public.contact_channels enable row level security;
alter table public.admin_users enable row level security;
alter table public.registrations enable row level security;

revoke all on public.programs, public.batches, public.trainers, public.articles,
  public.gallery, public.contact_channels, public.admin_users, public.registrations
  from public, anon, authenticated;
grant select on public.programs, public.batches, public.trainers, public.articles,
  public.gallery, public.contact_channels to anon, authenticated;
create policy programs_public on public.programs for select to anon, authenticated using (true);
create policy batches_public on public.batches for select to anon, authenticated using (true);
create policy trainers_public on public.trainers for select to anon, authenticated using (true);
create policy articles_public on public.articles for select to anon, authenticated using (published);
create policy gallery_public on public.gallery for select to anon, authenticated using (true);
create policy contacts_public on public.contact_channels for select to anon, authenticated using (true);

grant select on public.admin_users, public.registrations to authenticated;
create policy admin_self on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));
create policy registrations_admin_read on public.registrations for select to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

-- Sebutkan batch dan harga yang dilihat peserta. Pengiriman ulang tidak menimpa kontak.
create function public.receive_registration(
  batch text, expected_price bigint, participant jsonb, consent boolean
) returns text language plpgsql security invoker set search_path = '' as $$
declare
  offer record;
  answers public.registrations;
begin
  if consent is not true then raise exception 'Persetujuan wajib diisi'; end if;
  select * into answers from jsonb_populate_record(null::public.registrations, participant);
  select b.registration_open, (b.sessions->0->>'starts_at')::timestamp at time zone 'Asia/Jakarta' as starts_at,
         p.price_idr into offer
  from public.batches b join public.programs p on p.slug = b.program_slug
  where b.slug = batch for share of b, p;
  if not found or not offer.registration_open or offer.starts_at <= now() then return 'unavailable'; end if;
  if offer.price_idr is distinct from expected_price then return 'changed'; end if;
  insert into public.registrations(
    batch_slug, full_name, whatsapp, email, nickname, domicile, gender, age, profession,
    institution, socials, social_other, social_name, prior_experience, goal, challenge,
    source, source_other, attendance, payment_method, price_idr_at_signup
  ) values (
    batch, btrim(answers.full_name), btrim(answers.whatsapp), lower(btrim(answers.email)),
    answers.nickname, answers.domicile, answers.gender, answers.age, answers.profession,
    answers.institution, coalesce(answers.socials, '{}'), answers.social_other, answers.social_name,
    answers.prior_experience, answers.goal, answers.challenge, answers.source, answers.source_other,
    answers.attendance, answers.payment_method, offer.price_idr
  )
    on conflict on constraint registrations_batch_slug_email_key do nothing;
  if not found then return 'duplicate'; end if;
  return 'received';
end $$;
revoke all on function public.receive_registration(text,bigint,jsonb,boolean)
  from public, anon, authenticated;
grant execute on function public.receive_registration(text,bigint,jsonb,boolean) to service_role;
grant select, update on public.programs, public.batches to service_role;
grant insert, select (batch_slug, email) on public.registrations to service_role;
grant usage on sequence public.registrations_id_seq to service_role;

-- Gagalkan instalasi bila grant bawaan proyek membuka data atau mutasi pendaftar.
do $$
begin
  if has_table_privilege('anon', 'public.registrations', 'SELECT')
     or has_table_privilege('anon', 'public.registrations', 'INSERT, UPDATE, DELETE, TRUNCATE')
     or has_table_privilege('authenticated', 'public.registrations', 'INSERT, UPDATE, DELETE, TRUNCATE')
     or has_function_privilege('anon', 'public.receive_registration(text,bigint,jsonb,boolean)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.receive_registration(text,bigint,jsonb,boolean)', 'EXECUTE') then
    raise exception 'Hak akses pendaftar melebihi batas MVP';
  end if;
end $$;

commit;
