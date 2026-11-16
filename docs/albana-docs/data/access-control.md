# Kontrol akses — proyek Supabase `clgjsekfnexmanjdxmqy`

> **Arsip audit sebelum pembersihan skema.** Tabel komunitas/transisi, `members`, dan `privilege_*` yang disebut di bawah sudah dihapus pada 15 November 2026. Untuk daftar tabel terkini lihat [skema database](database-schema.md). Kebijakan tabel yang tersisa perlu diaudit ulang sebelum dokumen ini dipakai sebagai acuan rilis.

**Sumber:** `pg_policies`, grant tabel dan kolom, grant fungsi, dan advisor keamanan Supabase, dibaca 15 November 2026. Struktur tabel ada di [skema database](database-schema.md).

## 1. Model

Akses ke sebuah baris memerlukan **dua** izin sekaligus: grant tabel untuk peran (`anon` atau `authenticated`) **dan** kebijakan RLS yang lolos. Service role melewati keduanya. RLS aktif pada seluruh 40 tabel `public`.

| Peran | Siapa | Kunci |
| --- | --- | --- |
| `anon` | Pengunjung; Server Component publik | Anon/publishable key |
| `authenticated` | Pengguna login. Menjadi admin hanya bila `auth.uid()` ada di `admin_users`. | Sesi Supabase Auth |
| `service_role` | Kode server sesudah guard admin, dan route pendaftaran | `SUPABASE_SERVICE_ROLE_KEY` — hanya di server |

Predikat admin yang dipakai semua kebijakan:

```sql
EXISTS (SELECT 1 FROM admin_users a WHERE a.user_id = (SELECT auth.uid()))
```

Kebijakan hapus pada tabel CMS inti menambah `AND a.role = 'adminsuper'`.

## 2. Matriks akses tabel aktif

B = baca, T = tambah, U = ubah, H = hapus. “—” berarti tidak ada akses lewat peran itu.

| Tabel | `anon` | Admin (`authenticated` + `admin_users`) | Jalur tulis yang dipakai |
| --- | --- | --- | --- |
| `programs` | B semua | B T U H | CMS langsung |
| `batches` | B semua | B T U H | CMS langsung |
| `trainers` | B semua | B T U H | CMS langsung |
| `articles` | B bila `published` | B T U H | CMS langsung |
| `gallery` | B semua | B T U H | CMS langsung |
| `contact_channels` | B semua | B T U H | CMS langsung |
| `academy` | B semua | B T U; H hanya `adminsuper` | CMS langsung |
| `testimonials` | B bila `published`, kolom terbatas (catatan 1) | B T U; H hanya `adminsuper` | CMS langsung |
| `media_assets` | B bila `published`, kolom terbatas (catatan 1) | B T U; H hanya `adminsuper` | Service role |
| `bank_accounts` | — | B T U; H hanya `adminsuper` | CMS langsung |
| `bundle_offers` | B bila `active` dan berharga | B saja | Service role |
| `academy_partners` | B bila `published` | B saja | Service role |
| `academy_registrations` | — | — | Service role (RPC) |
| `academy_registration_items` | — | — | Service role (RPC) |
| `academy_invoices` | — | — | Service role (RPC) |
| `academy_intake_limits` | — | — | Service role (RPC) |
| `admin_users` | — | B baris sendiri, kolom `user_id` dan `role` (catatan 2) | SQL manual |
| `members` | — | B T U H; pengguna biasa B baris sendiri | Warisan |
| `privilege_groups`, `privilege_items`, `privilege_actions` | — | B T U H | CMS langsung |
| `system_settings` | — | B T U H | Service role |

**Catatan 1.** `anon` memegang grant `SELECT` **per kolom**, bukan per tabel. Kolom yang terbuka:

- `testimonials`: `id`, `attribution`, `quote`, `role_label`, `result_highlight`, `is_featured`, `order_index`, `published`. Kolom `photo_url`, `member_id`, dan `consent_at` **tidak** terbuka — `select *` dengan anon key gagal, dan foto testimoni tidak dapat dibaca klien anon.
- `media_assets`: `id`, `provider`, `kind`, `object_key`, `alt_text`, `consent_at`, `published`. Kolom `program_slug`, `batch_slug`, dan `created_at` tidak terbuka, sehingga penyaringan media per program harus lewat klien server berhak.

Saat menambah kolom yang perlu tampil publik pada dua tabel ini, tambahkan juga grant kolomnya.

**Catatan 2.** `authenticated` memegang grant `SELECT` hanya pada kolom `user_id`, `role`, dan `username` di `admin_users`. Grant ini wajib ada: subquery `admin_users` di dalam kebijakan tabel lain dievaluasi dengan hak pengguna yang menjalankan kueri, dan kebijakan `admin_self` membatasinya ke baris sendiri. `username` dipakai oleh guard dan menu akun CMS. Mencabut grant ini mematahkan akses CMS.

Tabel transisi dan warisan (`registrations`, `payments`, `intake_key`, `sessions`, `contact_details`, `trainer_contacts`, `gallery_albums`, serta 11 tabel komunitas) tidak dapat dibaca `anon`. Sebagian besar membuka B T U H untuk admin lewat kebijakan `legacy_admin_all`.

## 3. Fungsi

| Fungsi | `anon` | `authenticated` | `service_role` |
| --- | --- | --- | --- |
| `receive_academy_registration` | — | — | ✔ |
| `resolve_academy_invoice` | — | — | ✔ |
| `receive_registration` (lama) | — | — | ✔ |
| `testimonials_set_attribution` | — | — | ✔ |
| `get_email_by_username` | ✔ | ✔ | ✔ |
| `enforce_single_active_batch`, `reactivate_old_program_batch` | ✔ | ✔ | ✔ |
| `set_catalog_slug`, `sync_program_slug`, `valid_session_schedule` | ✔ | ✔ | ✔ |

## 4. Storage

| Bucket | Baca | Tulis |
| --- | --- | --- |
| `academy-media` (privat) | `anon`: hanya objek yang punya baris `media_assets` terbit dengan `object_key` sama. Admin: semua. | Admin: tambah. Tidak ada kebijakan ubah/hapus — penghapusan lewat service role. |
| `gallery` (publik) | Semua. | Admin: tambah, ubah, hapus. |
| `testimonials` (publik) | Semua. | Admin: tambah, ubah, hapus. |

Kebijakan bucket `testimonials` ditujukan ke peran `public` (bukan `authenticated`); predikat admin tetap membatasinya, tetapi samakan dengan dua bucket lain saat perapian.

## 5. Temuan advisor keamanan

| Tingkat | Temuan | Penilaian | Tindakan |
| --- | --- | --- | --- |
| WARN | `get_email_by_username` adalah `SECURITY DEFINER` dan dapat dipanggil `anon` lewat `/rest/v1/rpc/`. | **Nyata.** Siapa pun dapat menukar username menjadi alamat email (enumerasi akun). | Cabut `EXECUTE` dari `anon` dan `authenticated`; panggil dari server dengan service role saat login. |
| WARN | `enforce_single_active_batch` dan `reactivate_old_program_batch` (`SECURITY DEFINER`) dapat dipanggil `anon`/`authenticated`. | Risiko rendah — fungsi trigger gagal bila dipanggil langsung — tetapi tidak perlu terbuka. | `REVOKE EXECUTE … FROM PUBLIC, anon, authenticated`. |
| WARN | Perlindungan kata sandi bocor (HaveIBeenPwned) nonaktif. | Berlaku untuk akun admin. | Aktifkan di Auth → Password security. |
| INFO | RLS aktif tanpa kebijakan pada `academy_registrations`, `academy_registration_items`, `academy_invoices`, `academy_intake_limits`, `payments`, `intake_key`, `contact_details`. | **Disengaja** untuk empat tabel `academy_*`: hanya service role yang boleh menyentuhnya. | Tidak ada; catat sebagai keputusan. Tiga tabel lain hilang saat pembersihan. |

Rujukan: [lint 0028](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable) · [lint 0029](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) · [lint 0008](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) · [perlindungan kata sandi](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

SQL perbaikan yang diusulkan (belum diterapkan):

```sql
revoke execute on function public.get_email_by_username(text) from public, anon, authenticated;
revoke execute on function public.enforce_single_active_batch() from public, anon, authenticated;
revoke execute on function public.reactivate_old_program_batch() from public, anon, authenticated;
```

Mencabut `get_email_by_username` dari `anon` akan mematahkan login dengan username bila kode memanggilnya dari klien anon; pindahkan pemanggilan ke server lebih dulu.

## 6. Risiko di luar advisor

| Risiko | Penjelasan | Tindakan |
| --- | --- | --- |
| Dua definisi admin | RLS memakai `admin_users`; guard kode (`requireAdminMember`, `/api/upload`, `/api/media/[id]`) memakai `members.role = 'admin'`. Satu baris di masing-masing tabel saat ini. | Samakan ke `admin_users` sebelum menambah admin kedua. |
| Jalur service role | Pendaftaran, tagihan, bundling, partner, dan media tidak dijaga RLS. | Setiap action/handler memanggil guard admin di baris pertama; tinjau saat code review. |
| Kunci service role pernah bernama `NEXT_PUBLIC_` | Nilainya mungkin pernah ikut bundel browser. | Rotasi kunci sebelum rilis. |
| Tabel warisan terbuka untuk admin | 11 tabel komunitas dapat ditulis admin lewat `legacy_admin_all`. | Hapus bersama pembersihan kode. |
| `programs`, `batches`, `gallery` tanpa status terbit | Baris baru langsung tampil publik. | Terima untuk rilis ini; tambah `published` bila alur draf diperlukan. |

## 7. Daftar periksa saat menambah tabel

1. Aktifkan RLS pada migrasi yang sama dengan `CREATE TABLE`.
2. Putuskan jalur tulis: CMS langsung (butuh grant + kebijakan admin) atau service role (tanpa grant, tanpa kebijakan).
3. Beri grant `SELECT` ke `anon` hanya bila ada kebijakan `*_public` yang menyaring baris terbit.
4. Fungsi baru: `SECURITY INVOKER` kecuali ada alasan tertulis; cabut `EXECUTE` dari `PUBLIC`.
5. Jalankan advisor keamanan sesudah migrasi dan catat hasilnya di dokumen ini.
