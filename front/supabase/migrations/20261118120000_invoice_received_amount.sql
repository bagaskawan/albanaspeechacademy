alter table public.academy_invoices
  add column if not exists received_idr bigint check (received_idr > 0);

revoke all on function public.resolve_academy_invoice(bigint, text, text) from public, anon, authenticated, service_role;

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

revoke all on function public.resolve_academy_invoice(bigint, text, text, bigint) from public, anon, authenticated;
grant execute on function public.resolve_academy_invoice(bigint, text, text, bigint) to service_role;
