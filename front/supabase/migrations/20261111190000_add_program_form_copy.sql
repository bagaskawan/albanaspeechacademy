alter table public.programs
  add column if not exists form_prior_experience text,
  add column if not exists form_goal text,
  add column if not exists form_challenge text;

comment on column public.programs.form_prior_experience is 'Teks pertanyaan pengalaman sebelumnya pada formulir pendaftaran. Kosong = pakai naskah varian form_kind.';
comment on column public.programs.form_goal is 'Teks pertanyaan tujuan mengikuti program. Kosong = pakai naskah varian form_kind.';
comment on column public.programs.form_challenge is 'Teks pertanyaan tantangan. Kosong = pakai naskah varian form_kind; tidak dipakai untuk varian bnsp.';
