-- Generate random 3-digit unique codes (100..999) instead of sequential 1, 2, 3...
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
  signup_email text;
  signup_phone text;
  blocking_at timestamptz;
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

  -- Kunci per identitas: email lalu WhatsApp, urutan tetap agar tidak deadlock.
  signup_email := lower(btrim(request->>'email'));
  signup_phone := regexp_replace(regexp_replace(coalesce(request->>'whatsapp', ''), '\D', '', 'g'), '^62', '0');
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('albana-email:' || signup_email, 0));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('albana-wa:' || signup_phone, 0));
  select i.created_at into blocking_at
    from public.academy_invoices i
    join public.academy_registrations r on r.id = i.registration_id
    where i.stage = 'initial' and i.status = 'pending'
      and i.created_at > now() - interval '30 minutes'
      and (r.email = signup_email
        or regexp_replace(regexp_replace(r.whatsapp, '\D', '', 'g'), '^62', '0') = signup_phone)
    order by i.created_at desc limit 1;
  if found then
    return jsonb_build_object('status', 'locked', 'retryAfterSeconds',
      greatest(1, ceil(extract(epoch from blocking_at + interval '30 minutes' - now())))::int);
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
  select candidate into code from generate_series(100, 999) candidate
    where not exists (
      select 1 from public.academy_invoices i
      where i.bank_account_id = bank_id and i.unique_code = candidate and i.status = 'pending'
    ) order by random() limit 1;
  if code is null then raise exception 'Semua kode unik sedang dipakai'; end if;

  insert into public.academy_invoices (registration_id, bank_account_id, stage, subtotal_idr, unique_code)
    values (registration_id, bank_id, 'initial', subtotal, code) returning id into invoice_id;
  return jsonb_build_object('status', 'received', 'registrationId', registration_id, 'invoiceId', invoice_id);
end
$function$;

create or replace function public.resolve_academy_invoice(
  target_invoice_id bigint,
  decision text,
  reviewer text,
  received_idr bigint default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  bill record;
  bank_id bigint;
  remaining bigint;
  code smallint;
  next_id bigint;
begin
  if decision not in ('verified', 'rejected') or nullif(btrim(reviewer), '') is null then
    return jsonb_build_object('status', 'invalid');
  end if;
  select i.*, r.price_idr_at_signup, r.payment_method into bill
    from public.academy_invoices i
    join public.academy_registrations r on r.id = i.registration_id
    where i.id = target_invoice_id for update of i;
  if not found or bill.status <> 'pending' then
    return jsonb_build_object('status', 'changed');
  end if;
  if decision = 'verified' and received_idr is distinct from bill.total_idr then
    return jsonb_build_object('status', 'amount_mismatch');
  end if;
  select id into bank_id from public.bank_accounts where id = bill.bank_account_id for update;
  update public.academy_invoices
    set status = decision,
        reviewed_by = reviewer,
        reviewed_at = now(),
        received_idr = case when decision = 'verified' then resolve_academy_invoice.received_idr else null end
    where id = target_invoice_id;
  if decision = 'verified' and bill.stage = 'initial' and bill.payment_method = 'dp' then
    remaining := bill.price_idr_at_signup - bill.subtotal_idr;
    select candidate into code from generate_series(100, 999) candidate
      where candidate <> bill.unique_code and not exists (
        select 1 from public.academy_invoices i where i.bank_account_id = bank_id
          and i.unique_code = candidate and i.status = 'pending'
      ) order by random() limit 1;
    if code is null then raise exception 'Semua kode unik sedang dipakai'; end if;
    insert into public.academy_invoices (registration_id, bank_account_id, stage, subtotal_idr, unique_code)
      values (bill.registration_id, bank_id, 'remaining', remaining, code)
      returning id into next_id;
  end if;
  return jsonb_build_object('status', 'resolved', 'nextInvoiceId', next_id);
end
$function$;
