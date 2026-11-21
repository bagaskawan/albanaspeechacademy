-- Human-readable, collision-resistant invoice number: INV-YYYYMMDD-XXXXXX (WIB date).
-- Suffix uses Crockford base32 (no I, L, O, U) so it reads cleanly over WhatsApp/phone.
-- The numeric id stays the primary key; every insert path (RPCs, admin actions) gets the
-- number through the column default, so no RPC needs to change.

create or replace function public.academy_invoice_number(issued_at timestamptz default now())
returns text
language plpgsql
volatile
set search_path = ''
as $function$
declare
  alphabet constant text := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  suffix text := '';
begin
  for i in 1..6 loop
    suffix := suffix || pg_catalog.substr(alphabet, 1 + pg_catalog.floor(pg_catalog.random() * 32)::int, 1);
  end loop;
  return 'INV-' || pg_catalog.to_char(issued_at at time zone 'Asia/Jakarta', 'YYYYMMDD') || '-' || suffix;
end;
$function$;

alter table public.academy_invoices add column invoice_number text;

update public.academy_invoices
  set invoice_number = public.academy_invoice_number(created_at)
  where invoice_number is null;

alter table public.academy_invoices
  alter column invoice_number set default public.academy_invoice_number(),
  alter column invoice_number set not null,
  add constraint academy_invoices_invoice_number_key unique (invoice_number),
  add constraint academy_invoices_invoice_number_format
    check (invoice_number ~ '^INV-[0-9]{8}-[0-9A-HJKMNP-TV-Z]{6}$');
