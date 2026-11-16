-- Program menjadi sumber tunggal harga, DP, dan jenis formulir; batch hanya nama + jadwal.
-- Rancangan: docs/albana-docs/plans/2026-11-16-program-batch-bundling-design.md

alter table public.programs
  add column dp_percent smallint check (dp_percent is null or dp_percent between 1 and 99),
  add column form_kind text check (form_kind is null or form_kind in ('series', 'exclusive', 'bnsp')),
  add column fee_details text;

update public.programs set form_kind = 'series', dp_percent = 20 where slug = 'public-speaking-series';
update public.programs set form_kind = 'exclusive', dp_percent = 20 where slug = 'public-speaking-for-speakers';
update public.programs set form_kind = 'bnsp', dp_percent = 20, price_idr = 2000000
  where slug = 'sertifikasi-pembicara-profesional';

-- Satu penawaran paket; admin yang menyalakannya dari CMS.
insert into public.bundle_offers
  (slug, title, speaker_program_slug, certification_program_slug, price_idr, dp_percent,
   active, show_on_speaker, show_on_certification, placement_scope)
values
  ('paket-speaker-sertifikasi', 'Paket Speaker + Sertifikasi', 'public-speaking-for-speakers',
   'sertifikasi-pembicara-profesional', 2900000, 20, false, false, false, 'program')
on conflict (slug) do nothing;

-- Sakelar tunggal: "Buka pendaftaran" mengatur is_active sekaligus, dan membuka satu
-- batch menutup batch lain pada program yang sama. Trigger lama memaksa is_active pada
-- setiap INSERT, sehingga batch baru yang masih ditutup mematikan batch yang sedang dibuka.
drop trigger if exists batches_single_active on public.batches;
drop trigger if exists batches_reactivate_old_program on public.batches;
drop function if exists public.enforce_single_active_batch();
drop function if exists public.reactivate_old_program_batch();

create or replace function public.enforce_single_open_batch()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.is_active := new.registration_open;
  if new.registration_open then
    update public.batches
       set registration_open = false, is_active = false
     where program_slug = new.program_slug
       and slug is distinct from new.slug
       and (registration_open or is_active);
  end if;
  return new;
end;
$$;

create trigger batches_single_open
before insert or update of registration_open, is_active, program_slug on public.batches
for each row execute function public.enforce_single_open_batch();

update public.batches set is_active = registration_open where is_active is distinct from registration_open;

-- RPC: harga, DP, dan jenis formulir dibaca dari Program; paket diterima dari dua arah
-- (Speaker -> Sertifikasi dan sebaliknya) dan harga paketnya diperiksa ulang di server.
create or replace function public.receive_academy_registration(request jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  existing record;
  first_batch record;
  second_batch record;
  offer record;
  bank_id bigint;
  registration_id bigint;
  invoice_id bigint;
  offer_price bigint;
  selected_title text;
  percent smallint;
  subtotal bigint;
  code smallint;
  attempts_count integer;
  partner_slug text;
  partner_price bigint;
  first_slug text := request->>'primaryBatchSlug';
  second_slug text := request->>'secondaryBatchSlug';
  selected_offer text := request->>'offerSlug';
  key uuid := (request->>'idempotencyKey')::uuid;
  request_hash text := request->>'submissionHash';
begin
  insert into public.academy_intake_limits (source_hash, window_start, attempts)
    values (request->>'sourceHash', date_trunc('minute', now()), 1)
    on conflict (source_hash, window_start)
    do update set attempts = public.academy_intake_limits.attempts + 1
    returning attempts into attempts_count;
  if attempts_count > 20 then return jsonb_build_object('status', 'busy'); end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(key::text, 0));
  select r.id, r.submission_hash, i.id as invoice_id into existing
    from public.academy_registrations r
    join public.academy_invoices i on i.registration_id = r.id and i.stage = 'initial'
    where r.idempotency_key = key;
  if found then
    if existing.submission_hash <> request_hash then return jsonb_build_object('status', 'changed'); end if;
    return jsonb_build_object('status', 'received', 'registrationId', existing.id, 'invoiceId', existing.invoice_id);
  end if;

  select b.slug, b.program_slug, b.registration_open, b.is_active, p.dp_percent, p.form_kind,
         p.price_idr, p.title,
         (b.sessions->0->>'starts_at')::timestamp at time zone 'Asia/Jakarta' as starts_at
    into first_batch from public.batches b join public.programs p on p.slug = b.program_slug
    where b.slug = first_slug for share of b, p;
  if not found then return jsonb_build_object('status', 'unavailable'); end if;
  if not first_batch.registration_open or not first_batch.is_active or first_batch.starts_at is null
    or first_batch.starts_at <= now() or first_batch.form_kind is distinct from request->>'formKind' then
    return jsonb_build_object('status', 'unavailable');
  end if;

  if selected_offer is not null then
    select * into offer from public.bundle_offers where slug = selected_offer for share;
    if not found then return jsonb_build_object('status', 'unavailable'); end if;
    if not offer.active or offer.placement_scope <> 'program' or offer.price_idr is null
      or second_slug is null then
      return jsonb_build_object('status', 'unavailable');
    end if;
    if first_batch.program_slug = offer.speaker_program_slug then
      partner_slug := offer.certification_program_slug;
    elsif first_batch.program_slug = offer.certification_program_slug then
      partner_slug := offer.speaker_program_slug;
    else
      return jsonb_build_object('status', 'unavailable');
    end if;
    select b.slug, b.program_slug, b.registration_open, b.is_active,
           (b.sessions->0->>'starts_at')::timestamp at time zone 'Asia/Jakarta' as starts_at
      into second_batch from public.batches b where b.slug = second_slug for share;
    if not found then return jsonb_build_object('status', 'unavailable'); end if;
    if not second_batch.registration_open or not second_batch.is_active or second_batch.starts_at is null
      or second_batch.starts_at <= now()
      or second_batch.program_slug <> partner_slug then
      return jsonb_build_object('status', 'unavailable');
    end if;
    select p.price_idr into partner_price from public.programs p where p.slug = partner_slug for share;
    if not found or partner_price is null or first_batch.price_idr is null
      or offer.price_idr <= first_batch.price_idr or offer.price_idr <= partner_price
      or offer.price_idr >= first_batch.price_idr + partner_price then
      return jsonb_build_object('status', 'unavailable');
    end if;
    offer_price := offer.price_idr;
    selected_title := offer.title;
    percent := coalesce(offer.dp_percent, first_batch.dp_percent);
  else
    if second_slug is not null then return jsonb_build_object('status', 'unavailable'); end if;
    offer_price := first_batch.price_idr;
    selected_title := first_batch.title;
    percent := first_batch.dp_percent;
  end if;

  if offer_price is null or offer_price <= 0 or offer_price <> (request->>'expectedPriceIdr')::bigint
    or (request->>'paymentMethod' = 'dp' and percent is distinct from (request->>'expectedDpPercent')::smallint) then
    return jsonb_build_object('status', 'changed');
  end if;
  if coalesce(request->>'paymentMethod', '') not in ('full', 'dp')
    or (request->>'paymentMethod' = 'dp' and percent is null) then
    return jsonb_build_object('status', 'unavailable');
  end if;

  select id into bank_id from public.bank_accounts where active = true order by id limit 1 for update;
  if not found then return jsonb_build_object('status', 'unavailable'); end if;

  insert into public.academy_registrations (
    primary_batch_slug, offer_slug, offer_title, full_name, email, whatsapp, answers,
    payment_method, price_idr_at_signup, dp_percent_at_signup, idempotency_key, submission_hash
  ) values (
    first_slug, selected_offer, selected_title,
    btrim(request->>'fullName'), lower(btrim(request->>'email')),
    btrim(request->>'whatsapp'),
    request->'answers', request->>'paymentMethod', offer_price,
    case when request->>'paymentMethod' = 'dp' then percent else null end,
    key, request_hash
  ) returning id into registration_id;

  insert into public.academy_registration_items values (registration_id, first_slug);
  if second_slug is not null then
    insert into public.academy_registration_items values (registration_id, second_slug);
  end if;

  subtotal := case when request->>'paymentMethod' = 'dp'
    then round(offer_price::numeric * percent / 100)::bigint else offer_price end;
  select candidate into code from generate_series(1, 999) candidate
    where not exists (
      select 1 from public.academy_invoices i
      where i.bank_account_id = bank_id and i.unique_code = candidate and i.status = 'pending'
    ) order by candidate limit 1;
  if code is null then raise exception 'Semua kode unik sedang dipakai'; end if;

  insert into public.academy_invoices (registration_id, bank_account_id, stage, subtotal_idr, unique_code)
    values (registration_id, bank_id, 'initial', subtotal, code) returning id into invoice_id;
  return jsonb_build_object('status', 'received', 'registrationId', registration_id, 'invoiceId', invoice_id);
end
$function$;
