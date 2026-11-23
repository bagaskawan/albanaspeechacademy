-- Ubah batas jumlah kata kutipan testimoni menjadi maksimal 50 kata (tanpa batas minimal 20 kata).
alter table public.testimonials
  drop constraint if exists testimonials_quote_word_count;

alter table public.testimonials
  add constraint testimonials_quote_word_count
  check (
    btrim(quote) <> ''
    and array_length(regexp_split_to_array(btrim(quote), '\s+'), 1) <= 50
  );
