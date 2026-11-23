-- Tambah kolom flyer_url untuk poster/flyer per batch (opsional; fallback ke galeri program).
alter table public.batches
  add column if not exists flyer_url text;

-- Bersihkan alamat dummy bawaan seed agar fallback ke alamat Kontak hingga admin mengisinya.
update public.batches
   set address = null
 where address = 'Jl. Contoh No. 1, Jakarta';
