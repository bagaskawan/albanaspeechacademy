create table public.academy_invoice_payments (
  id bigint generated always as identity primary key,
  invoice_id bigint not null references public.academy_invoices(id) on delete cascade,
  amount_idr bigint not null check (amount_idr > 0 and amount_idr <= 1000000000),
  paid_total_after_idr bigint not null,
  balance_after_idr bigint not null,
  proof_object_key text not null check (proof_object_key ~ '^invoice-[0-9]+/[0-9a-f-]{36}\.webp$'),
  note text check (char_length(note) <= 300),
  recorded_by text not null,
  recorded_at timestamptz not null default now(),
  voided_by text,
  voided_at timestamptz,
  check ((voided_by is null) = (voided_at is null))
);

create index academy_invoice_payments_invoice_idx on public.academy_invoice_payments (invoice_id);
alter table public.academy_invoice_payments enable row level security;
revoke all on public.academy_invoice_payments from public, anon, authenticated;
grant select, insert, update on public.academy_invoice_payments to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-proofs', 'payment-proofs', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create function public.record_invoice_payment(
  target_invoice_id bigint,
  amount_idr bigint,
  proof_key text,
  note text,
  recorder text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  bill record;
  existing_paid bigint;
  paid_after bigint;
  balance_after bigint;
  payment_id bigint;
  clean_note text := nullif(btrim(note), '');
begin
  if amount_idr is null or amount_idr <= 0 or amount_idr > 1000000000
    or nullif(btrim(proof_key), '') is null
    or nullif(btrim(recorder), '') is null
    or (clean_note is not null and char_length(clean_note) > 300) then
    return jsonb_build_object('status', 'invalid');
  end if;

  select id, total_idr, status into bill
    from public.academy_invoices
    where id = target_invoice_id
    for update;
  if not found or bill.status <> 'pending' then
    return jsonb_build_object('status', 'changed');
  end if;

  select coalesce(sum(p.amount_idr), 0) into existing_paid
    from public.academy_invoice_payments p
    where p.invoice_id = target_invoice_id and p.voided_at is null;

  paid_after := existing_paid + amount_idr;
  balance_after := bill.total_idr - paid_after;

  insert into public.academy_invoice_payments (
    invoice_id, amount_idr, paid_total_after_idr, balance_after_idr,
    proof_object_key, note, recorded_by
  ) values (
    target_invoice_id, amount_idr, paid_after, balance_after,
    proof_key, clean_note, recorder
  ) returning id into payment_id;

  return jsonb_build_object(
    'status', 'recorded',
    'paymentId', payment_id,
    'paidTotalIdr', paid_after,
    'balanceIdr', balance_after
  );
end
$function$;

revoke all on function public.record_invoice_payment(bigint, bigint, text, text, text) from public, anon, authenticated;
grant execute on function public.record_invoice_payment(bigint, bigint, text, text, text) to service_role;

create function public.void_invoice_payment(
  target_payment_id bigint,
  reviewer text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  entry record;
begin
  if nullif(btrim(reviewer), '') is null then
    return jsonb_build_object('status', 'invalid');
  end if;

  select p.id, p.voided_at, i.status as invoice_status into entry
    from public.academy_invoice_payments p
    join public.academy_invoices i on i.id = p.invoice_id
    where p.id = target_payment_id
    for update of p, i;

  if not found or entry.voided_at is not null or entry.invoice_status <> 'pending' then
    return jsonb_build_object('status', 'changed');
  end if;

  update public.academy_invoice_payments
    set voided_by = reviewer,
        voided_at = now()
    where id = target_payment_id;

  return jsonb_build_object('status', 'voided');
end
$function$;

revoke all on function public.void_invoice_payment(bigint, text) from public, anon, authenticated;
grant execute on function public.void_invoice_payment(bigint, text) to service_role;
