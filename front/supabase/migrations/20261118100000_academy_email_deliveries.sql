create table public.academy_email_deliveries (
  id bigint generated always as identity primary key,
  invoice_id bigint not null references public.academy_invoices(id) on delete cascade,
  kind text not null check (kind in ('payment_instructions', 'payment_confirmed', 'payment_rejected')),
  status text not null default 'sending' check (status in ('sending', 'sent', 'failed')),
  attempts smallint not null default 1 check (attempts between 1 and 20),
  message_id text,
  last_error text check (char_length(last_error) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (invoice_id, kind)
);

alter table public.academy_email_deliveries enable row level security;
revoke all on public.academy_email_deliveries from public, anon, authenticated;
grant select, insert, update on public.academy_email_deliveries to service_role;
