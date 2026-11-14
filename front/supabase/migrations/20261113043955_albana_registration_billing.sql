create table public.bundle_offers (
  slug text primary key,
  title text not null,
  speaker_program_slug text not null references public.programs(slug),
  certification_program_slug text not null references public.programs(slug),
  price_idr bigint,
  dp_percent smallint check (dp_percent between 1 and 99),
  active boolean not null default false,
  updated_at timestamptz not null default now(),
  check (price_idr is null or price_idr > 0),
  check (speaker_program_slug <> certification_program_slug)
);

create table public.academy_registrations (
  id bigint generated always as identity primary key,
  primary_batch_slug text not null references public.batches(slug),
  offer_slug text references public.bundle_offers(slug),
  offer_title text not null,
  full_name text not null,
  email text not null,
  whatsapp text not null,
  answers jsonb not null,
  payment_method text not null check (payment_method in ('full', 'dp')),
  price_idr_at_signup bigint not null check (price_idr_at_signup > 0),
  dp_percent_at_signup smallint check (dp_percent_at_signup between 1 and 99),
  idempotency_key uuid not null unique,
  submission_hash text not null,
  received_at timestamptz not null default now(),
  check (email = lower(btrim(email))),
  check (payment_method = 'full' or dp_percent_at_signup is not null)
);

create table public.academy_registration_items (
  registration_id bigint not null references public.academy_registrations(id) on delete cascade,
  batch_slug text not null references public.batches(slug),
  primary key (registration_id, batch_slug)
);

create table public.academy_intake_limits (
  source_hash text not null,
  window_start timestamptz not null,
  attempts integer not null check (attempts > 0),
  primary key (source_hash, window_start)
);

create table public.academy_invoices (
  id bigint generated always as identity primary key,
  registration_id bigint not null references public.academy_registrations(id),
  bank_account_id bigint not null references public.bank_accounts(id),
  stage text not null check (stage in ('initial', 'remaining')),
  subtotal_idr bigint not null check (subtotal_idr > 0),
  unique_code smallint not null check (unique_code between 1 and 999),
  total_idr bigint generated always as (subtotal_idr + unique_code) stored,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected', 'cancelled')),
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (registration_id, stage),
  check (status = 'pending' or (reviewed_by is not null and reviewed_at is not null))
);

create unique index academy_invoice_active_code
  on public.academy_invoices (bank_account_id, unique_code)
  where status = 'pending';

alter table public.bundle_offers enable row level security;
alter table public.academy_registrations enable row level security;
alter table public.academy_registration_items enable row level security;
alter table public.academy_intake_limits enable row level security;
alter table public.academy_invoices enable row level security;

create policy bundle_offers_public_active on public.bundle_offers for select to anon, authenticated
  using (active and price_idr is not null);

revoke all on public.bundle_offers, public.academy_registrations,
  public.academy_registration_items, public.academy_invoices,
  public.academy_intake_limits from anon, authenticated;
grant select on public.bundle_offers to anon, authenticated;
grant all on public.bundle_offers, public.academy_registrations,
  public.academy_registration_items, public.academy_invoices,
  public.academy_intake_limits to service_role;
grant usage, select on all sequences in schema public to service_role;

create function public.receive_academy_registration(request jsonb)
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

  select b.slug, b.program_slug, b.registration_open, b.is_active, b.dp_percent, b.form_kind,
         coalesce(b.price_idr, p.price_idr) as price_idr, p.title,
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
    if not offer.active or offer.price_idr is null or second_slug is null
      or first_batch.program_slug <> offer.speaker_program_slug then
      return jsonb_build_object('status', 'unavailable');
    end if;
    select b.slug, b.program_slug, b.registration_open, b.is_active,
           (b.sessions->0->>'starts_at')::timestamp at time zone 'Asia/Jakarta' as starts_at
      into second_batch from public.batches b where b.slug = second_slug for share;
    if not found then return jsonb_build_object('status', 'unavailable'); end if;
    if not second_batch.registration_open or not second_batch.is_active or second_batch.starts_at is null
      or second_batch.starts_at <= now()
      or second_batch.program_slug <> offer.certification_program_slug then
      return jsonb_build_object('status', 'unavailable');
    end if;
    offer_price := offer.price_idr;
    selected_title := offer.title;
    percent := offer.dp_percent;
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
    btrim(request->>'fullName'), lower(btrim(request->>'email')), btrim(request->>'whatsapp'),
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

revoke all on function public.receive_academy_registration(jsonb) from public, anon, authenticated;
grant execute on function public.receive_academy_registration(jsonb) to service_role;

create function public.resolve_academy_invoice(target_invoice_id bigint, decision text, reviewer text)
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
  if not found or bill.status <> 'pending' then return jsonb_build_object('status', 'changed'); end if;
  select id into bank_id from public.bank_accounts where id = bill.bank_account_id for update;
  update public.academy_invoices set status = decision, reviewed_by = reviewer,
    reviewed_at = now() where id = target_invoice_id;
  if decision = 'verified' and bill.stage = 'initial' and bill.payment_method = 'dp' then
    remaining := bill.price_idr_at_signup - bill.subtotal_idr;
    select candidate into code from generate_series(1, 999) candidate
      where candidate <> bill.unique_code and not exists (
        select 1 from public.academy_invoices i where i.bank_account_id = bank_id
          and i.unique_code = candidate and i.status = 'pending'
      ) order by candidate limit 1;
    if code is null then raise exception 'Semua kode unik sedang dipakai'; end if;
    insert into public.academy_invoices (registration_id, bank_account_id, stage, subtotal_idr, unique_code)
      values (bill.registration_id, bank_id, 'remaining', remaining, code)
      returning id into next_id;
  end if;
  return jsonb_build_object('status', 'resolved', 'nextInvoiceId', next_id);
end
$function$;

revoke all on function public.resolve_academy_invoice(bigint, text, text) from public, anon, authenticated;
grant execute on function public.resolve_academy_invoice(bigint, text, text) to service_role;
