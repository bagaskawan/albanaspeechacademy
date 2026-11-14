-- Nama gambar opsional; izin publikasi dicatat otomatis saat gambar dibuat.
alter table public.gallery alter column title drop not null;
alter table public.gallery alter column consent_at set default now();
