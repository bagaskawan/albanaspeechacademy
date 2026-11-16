# Lingkungan dan operasi — Albana Speech Academy

**Status:** 15 November 2026. Panduan menjalankan aplikasi, mengelola proyek Supabase `clgjsekfnexmanjdxmqy`, dan menyiapkan rilis. Tidak ada nilai rahasia di dokumen ini; nilai disimpan di `front/.env` (tidak masuk git) dan di panel hosting.

## 1. Prasyarat dan menjalankan

Node.js 20 atau lebih baru dan npm. Aplikasi berada di `front/`.

```bash
cd front
npm install
npm run dev
```

| Perintah | Guna |
| --- | --- |
| `npm run dev` | Server pengembangan di `http://localhost:3000`. |
| `npm run build` | Build produksi. Percobaan terakhir (13 November) tidak selesai; harus lulus sebelum rilis. |
| `npm run start` | Menjalankan hasil build. |
| `npm run lint` | ESLint. Baseline: 542 galat, 345 peringatan — sebagian besar dari kode warisan. |
| `node --test lib/` | Uji unit `lib/*.test.mjs`. |

## 2. Variabel lingkungan

Repo belum punya `.env.example`. Daftar berikut diambil dari pemakaian `process.env` di kode.

### Wajib untuk Albana

| Variabel | Terlihat browser | Guna |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Ya | `https://clgjsekfnexmanjdxmqy.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Ya | Anon/publishable key. |
| `SUPABASE_URL` | Tidak | URL yang sama untuk klien server. |
| `SUPABASE_PUBLISHABLE_KEY` | Tidak | Publishable key untuk klien server. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Tidak** | Melewati RLS. Tidak boleh memakai awalan `NEXT_PUBLIC_`. |
| `REGISTRATION_RECEIPT_SECRET` | **Tidak** | Menandatangani token halaman konfirmasi. Tanpa ini pendaftaran menjawab 503. |
| `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_APP_URL` | Ya | URL kanonik situs. |
| `SUPABASE_ADMIN_USERNAME`, `SUPABASE_ADMIN_EMAIL` | Tidak | Pemetaan username admin ke email. |

### Warisan (boleh kosong untuk Albana)

`REGISTRATION_INTAKE_KEY` (alur pendaftaran lama), `NEXT_PUBLIC_ADMIN_URL`, `NEXT_PUBLIC_USERNAME_ADMIN`, `USERNAME_ADMIN`, `SUPER_ADMIN_EMAIL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `PROD_SUPABASE_URL`, `PROD_SUPABASE_ANON_KEY`, `PROD_SUPABASE_SERVICE_ROLE_KEY`.

**Rotasi wajib sebelum rilis:** kunci service role pernah disimpan dengan nama berawalan `NEXT_PUBLIC_`. Buat kunci baru di Supabase → Settings → API, perbarui `.env` dan panel hosting, lalu cabut kunci lama.

## 3. Proyek Supabase

| Butir | Nilai |
| --- | --- |
| Project ref | `clgjsekfnexmanjdxmqy` |
| Skema aplikasi | `public` (40 tabel), `albana_migration_backup` (cadangan slug) |
| Bucket | `academy-media` (privat), `gallery`, `testimonials` (publik) |
| Pengguna Auth | 1 (admin) |
| Ekstensi | `pgcrypto`, `uuid-ossp`, `pg_stat_statements`, `supabase_vault` |

`front/supabase/config.toml` masih berisi `project_id = "front"` (bawaan `supabase init`) dan belum ditautkan ke proyek ini.

## 4. Migrasi database

**Riwayat di repo dan di remote tidak sama.** Jangan menjalankan `supabase db push` sebelum keduanya diselaraskan.

| Sumber | Isi |
| --- | --- |
| Remote (`supabase_migrations`) | 27 migrasi, `20261110094110_initial_albana_schema` s.d. `20261113062024_independent_trainers_batches`. |
| Repo (`front/supabase/migrations/`) | 32 berkas. 19 berkas pertama (`20260705…` s.d. `20260923…`) adalah migrasi **proyek komunitas** yang tidak pernah diterapkan ke proyek ini. 13 berkas terakhir (`202611…`) berpadanan dengan migrasi Albana tetapi bercap waktu berbeda dari remote. |

Akibatnya: `db push` akan mencoba menerapkan skema komunitas, dan migrasi awal Albana (`initial_albana_schema`, seed admin, grant, sidebar) tidak ada sebagai berkas di repo.

**Penyelarasan yang disarankan (belum dikerjakan):**

1. Pindahkan 19 berkas komunitas ke luar `supabase/migrations/`.
2. Tautkan proyek dan tarik riwayat remote:

```bash
npx supabase link --project-ref clgjsekfnexmanjdxmqy
```

```bash
npx supabase migration fetch
```

3. Bandingkan hasilnya dengan 13 berkas `202611…` lokal, lalu simpan satu set saja.

**Aturan sesudah selaras:** setiap perubahan skema adalah satu berkas migrasi bernama `YYYYMMDDHHMMSS_deskripsi_singkat.sql`; uji dulu di cabang Supabase atau dalam blok `BEGIN … ROLLBACK`; jalankan advisor keamanan sesudahnya; perbarui [skema database](../data/database-schema.md) dan [kontrol akses](../data/access-control.md).

## 5. Data awal yang harus ada sebelum pendaftaran dibuka

| Urutan | Data | Tabel | Keadaan |
| --- | --- | --- | --- |
| 1 | Kanal kontak (WhatsApp wajib) | `contact_channels` | Terisi (4 baris) |
| 2 | **Satu rekening aktif** | `bank_accounts` | **Kosong** — pendaftaran ditolak |
| 3 | Program dengan harga | `programs` | 2 dari 4 berharga |
| 4 | Batch aktif, terbuka, bersesi, ber-`form_kind` | `batches` | 2 batch siap |
| 5 | Penawaran bundling (opsional) | `bundle_offers` | Kosong |
| 6 | Profil akademi | `academy` | Kosong |

## 6. Menambah admin

Akses admin hanya ditentukan tabel `admin_users` (tabel `members` sudah dihapus).

1. Buat pengguna di Supabase → Authentication → Users (email + kata sandi kuat).
2. Jalankan di SQL Editor, ganti nilainya:

```sql
insert into public.admin_users (user_id, role)
values ('<uuid pengguna>', 'admin');          -- atau 'adminsuper'
```

3. Uji login, buka `/admin/program`, lalu simpan satu perubahan kecil untuk memastikan RLS meloloskan tulis.

Mencabut akses: hapus baris dari `admin_users`, lalu nonaktifkan pengguna di Auth.

## 7. Deployment

Target bisnis adalah Hostinger; belum ada deployment. Yang masih harus dibuktikan sebelum memilih jalur:

| Pertanyaan | Mengapa penting |
| --- | --- |
| Apakah paket mendukung aplikasi Next.js/Node.js berumur panjang? | Aplikasi memakai Server Components, Route Handler, dan Sharp; ekspor statis tidak cukup. |
| Apakah server dapat menjangkau `*.supabase.co`? | Seluruh data dan media ada di Supabase. |
| Berapa batas ukuran unggahan permintaan? | Video hingga 25 MiB. |
| Apakah domain produksi cocok dengan `proxy.ts`? | Proxy kini hanya mengizinkan rute Albana; uji `/register`, `/login`, `/admin`, dan API pendaftaran pada domain tujuan. |

Migrasi ke MariaDB yang disebut di [rencana implementasi](../plans/2026-11-13-website-revision-implementation-plan.md) akan menghilangkan RLS, Auth, Storage, dan RPC yang menjadi dasar rancangan ini. Untuk rilis 17 November, jalur berisiko paling kecil adalah **aplikasi di hosting Node.js + data tetap di Supabase**.

## 8. Daftar periksa rilis

- [ ] Kunci service role dirotasi; tidak ada rahasia berawalan `NEXT_PUBLIC_`.
- [ ] `REGISTRATION_RECEIPT_SECRET` diisi di hosting.
- [ ] Rekening aktif diisi; satu pendaftaran uji lunas dan satu DP berhasil sampai halaman konfirmasi.
- [ ] Verifikasi DP di `/admin/tagihan` membuat tagihan pelunasan.
- [ ] `/admin/pendaftar` menampilkan pendaftaran uji.
- [ ] Tiga `REVOKE` pada [kontrol akses](../data/access-control.md#5-temuan-advisor-keamanan) diterapkan; perlindungan kata sandi bocor aktif.
- [ ] Unggah gambar dan MP4 nyata; aset tampil sesudah diterbitkan dan tetap ada sesudah redeploy.
- [ ] `npm run build` selesai tanpa galat.
- [ ] Data uji (pendaftaran, tagihan, batas laju) dihapus sebelum domain dialihkan.
- [ ] Cadangan database diunduh dan disimpan di luar Supabase.

## 9. Cadangan dan pemulihan

Belum ada prosedur yang diuji. Minimum sebelum rilis: unduh cadangan dari Supabase → Database → Backups (atau `pg_dump` lewat connection string), salin isi tiga bucket, dan catat tanggalnya di [status pekerjaan](../plans/2026-11-13-status-and-next-steps.md). Uji pemulihan ke proyek Supabase kosong sekurangnya sekali.
