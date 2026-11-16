-- Tepat satu rekening aktif; RPC tagihan memilih rekening aktif.
create unique index if not exists bank_accounts_one_active
  on public.bank_accounts ((true)) where active;

-- Baris profil akademi (tabel satu baris, id = 1).
insert into public.academy (id, name, teaching_method, reschedule_policy)
values (
  1,
  'Albana Speech Academy',
  '70% praktik dan simulasi, 20% coaching dan feedback, 10% konsep dan kerangka.',
  'Peserta yang berhalangan dapat mengajukan penjadwalan ulang melalui admin. Pembayaran tidak dikembalikan.'
)
on conflict (id) do nothing;

-- Fungsi trigger SECURITY DEFINER tidak perlu dapat dipanggil lewat REST.
revoke execute on function public.enforce_single_active_batch() from public, anon, authenticated;
revoke execute on function public.reactivate_old_program_batch() from public, anon, authenticated;
