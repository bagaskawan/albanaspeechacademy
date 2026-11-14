alter table public.programs
  add column if not exists description text,
  add column if not exists original_price_idr bigint,
  add column if not exists materials jsonb not null default '[]'::jsonb;

comment on column public.programs.description is 'Deskripsi program.';
comment on column public.programs.original_price_idr is 'Harga coret / harga asli (opsional).';
comment on column public.programs.materials is 'Daftar materi/benefit program (array of text).';
