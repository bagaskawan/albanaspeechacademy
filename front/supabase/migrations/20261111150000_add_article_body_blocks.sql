alter table public.articles add column if not exists body_blocks jsonb;
alter table public.articles add column if not exists updated_at timestamptz not null default now();

alter table public.articles drop constraint if exists articles_body_blocks_array;
alter table public.articles add constraint articles_body_blocks_array
  check (body_blocks is null or jsonb_typeof(body_blocks) = 'array');

-- Artikel lama tanpa ringkasan memakai paragraf pertamanya.
update public.articles
set excerpt = left(regexp_replace(split_part(btrim(body), E'\n\n', 1), '\s+', ' ', 'g'), 240)
where (excerpt is null or btrim(excerpt) = '') and btrim(coalesce(body, '')) <> '';
