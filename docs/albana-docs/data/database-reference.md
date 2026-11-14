# Model data — Albana Speech Academy

**Acuan MVP per 10 November 2026** adalah [skema instalasi akademi](./albana-schema.sql) dan [kontrak formulir serta akses admin](../registration/registration-contract.md). Uraian berikut mendokumentasikan skema dev sebelumnya, termasuk tabel sesi, pembayaran, dan modul CMS lama.

> **Status terverifikasi 11 November 2026:** proyek `clgjsekfnexmanjdxmqy` hanya berisi skema `data/albana-schema.sql` ditambah kolom aditif batch/artikel. Bentuk nyata tabel, constraint, RPC, dan izin ada di [audit kontrak data langkah 1](../archive/plans/2026-11-11-step-1-data-contract-audit.md). Uraian di bawah dipertahankan sebagai riwayat rancangan, bukan deskripsi database saat ini.

Catatan 10 November 2026: aplikasi dev memakai PostgreSQL di Supabase. Berkas SQL lama yang disebut dalam catatan historis ini tidak lagi berada di repo; migrasi yang tersedia saat ini ada di [front/supabase/migrations](../../../front/supabase/migrations/). Endpoint pendaftaran saat ini ada di [route API](../../../front/app/api/registrations/route.ts). Rancangan MySQL/Prisma dalam [arsitektur sistem](./system-architecture.md) masih perlu dicocokkan dengan implementasi. Jangan menggunakan uraian skema historis di bawah sebagai gambaran database aktif tanpa verifikasi.

## Kepemilikan dan akses

| Area | Tabel terpasang | Akses dan penggunaan |
| --- | --- | --- |
| Profil | `public.academy` | Nama, metode mengajar, kebijakan reschedule. Baca publik, tulis terbatas admin. |
| Program | `public.programs` | Slug adalah PK stabil; judul, ringkasan, audiens, hasil, format, `curriculum` JSONB, fasilitas, sertifikasi, `faq` JSONB, `published`. Hanya baris terbit dapat dibaca `anon`/`authenticated`. |
| Trainer | `public.trainers` | Slug, nama, peran, bio, URL potret, `photo_consent_at`, `published`. Potret tidak boleh diisi tanpa izin. |
| Batch | `public.batches`, `public.sessions`, `public.batch_trainers` | Batch mengacu ke program dengan slug; sesi berurutan dan disimpan sebagai `timestamptz`; penugasan trainer per batch. Status draft/batal dan sesi dari program tersembunyi tidak tampil lewat kebijakan RLS. |
| Konten editorial | `public.gallery`, `public.testimonials`, `public.articles` | Galeri/testimoni perlu `consent_at` sebelum terbit. Artikel baru berstatus `draft`/`published`, dengan `published_at`; hanya terbit dapat dibaca publik. Markdown artikel harus dirender aman oleh aplikasi. |
| Kanal kontak | `public.contact_details`, `public.contact_channels` | Detail lama tetap internal melalui RLS/grant; kanal baru berjenis address/instagram/whatsapp/email dan hanya baris `published` yang dapat dibaca publik. Jangan menyalin detail lama menjadi terbit otomatis. |
| Media | `public.media_assets` | Provider, jenis, object key, alt, waktu izin, status terbit. RLS membatasi baca publik pada baris terbit berizin. Bucket `academy-media` privat; unggahan admin disimpan sebagai draf. Object key aset yang terbit berizin dapat terlihat untuk pemeriksaan kebijakan Storage; berkasnya diakses melalui URL bertanda tangan. |
| Admin | `public.admin_users` | Allowlist `user_id` ke `auth.users` dengan kolom `role` (`admin`/`adminsuper`); login username dipetakan server-side melalui `SUPABASE_ADMIN_USERNAME` dan `SUPABASE_ADMIN_EMAIL`. Hanya `adminsuper` yang lolos kebijakan hapus CMS. Tabel tetap internal melalui RLS/grant. |
| Keuangan/peserta | `public.bank_accounts`, `registrations`, `payments`, `intake_key` | `bank_accounts` hanya dapat dibaca/diubah admin allowlist melalui RLS, tanpa akses anonim. Tiga tabel lain tidak diberi grant baca/tulis untuk `anon`/`authenticated`; RPC intake adalah pengecualian eksekusi terbatas. |

Semua harga rupiah memakai `numeric(12,0)`. Waktu disimpan `timestamptz`, lalu diformat WIB pada antarmuka. Tabel internal berada di schema `public`; akses masing-masing dibatasi grant dan RLS. Mutasi CMS mensyaratkan sesi Auth dalam allowlist `admin_users`. Perubahan berkas migrasi di `front/supabase/migrations/` tidak otomatis mengubah database; migrasi harus diterapkan ke proyek Supabase yang sesuai, lalu kondisi database diverifikasi kembali.

`academy.hidden_admin_modules` menyimpan array slug modul yang disembunyikan dari navigasi admin. Nilainya global untuk semua admin, hanya memengaruhi tampilan navigasi, dan tidak mengubah otorisasi rute. Nilai kosong atau data yang tidak valid membuat aplikasi menampilkan seluruh modul. Kolom ditambahkan secara expand-only melalui `admin-sidebar-settings.sql` dan memakai kebijakan admin tabel `academy` yang sudah ada.

## Batch dan penerimaan

`batches` memiliki `slug`, `program_slug`, `title`, `venue`, `address`, `price_idr`, `fee_details`, `capacity`, `closes_at`, `status`, `form_kind`, `dp_percent`, `proof_on_followup`. Status yang ada: `draft`, `scheduled`, `open`, `running`, `running_open`, `full`, `closed`, `cancelled`. `accepting_registrations` benar hanya bila program terbit, batch berstatus menerima, rincian wajib lengkap, masih dalam waktu, memiliki sesi, dan kapasitas `NULL`. Kuota non-NULL belum dibuka karena aturan kursi belum disahkan. `proof_on_followup` saat ini merupakan gerbang kompatibilitas RPC; bukti pembayaran dikirim ke WhatsApp admin, tidak diunggah ke situs.

`public.receive_registration` mengunci batch, memeriksa status/harga/varian/DP ulang, menolak duplikasi `(batch_slug,email)` dan membatasi laju per batch. Route [`POST /api/registrations`](../../../front/app/api/registrations/route.ts) memvalidasi input dan persetujuan, lalu memakai kunci intake server. Kiriman yang diterima belum berarti kepesertaan terkonfirmasi. Nilai lama tidak dihapus ketika batch diedit.

## Pemetaan tiga formulir

| Sumber | `form_kind` | Jawaban yang tersimpan pada `registrations.answers` |
| --- | --- | --- |
| [Public Speaking Series](../registration/forms/01-public-speaking-series.md) | `series` | `priorExperience` berarti pernah mengikuti pelatihan public speaking; `goal` tujuan Series; `challenge` tantangan public speaking; `attendance` kesediaan empat pertemuan. |
| [Basic to Advance Eksklusif](../registration/forms/02-speaker-training.md) | `exclusive` | `priorExperience` berarti pernah mengikuti pelatihan Speaker; `goal` tujuan training; `challenge` tantangan sebagai speaker; `attendance` kesediaan pelatihan penuh. |
| [Professional Speakers by BNSP](../registration/forms/03-professional-speakers-certification.md) | `bnsp` | `priorExperience` berarti pernah mengikuti sertifikasi BNSP; `goal` tujuan sertifikasi; `challenge` NULL; `attendance` kesediaan pelatihan penuh. Sertifikasi masih di luar penjualan awal menurut [konten yang disetujui](../content/home-page-content.md). |

Untuk ketiganya, kolom langsung menyimpan `batch_slug`, `full_name`, email ternormalisasi, WhatsApp sebagai teks, `form_kind`, `payment_method` (`full`/`dp`), `dp_percent_at_signup`, `price_idr_at_signup`, `fee_details_at_signup`, `consent_at`, dan `received_at`. JSONB `answers` menyimpan `nickname`, `domicile`, `gender`, `age`, `profession`, `institution` opsional, `socials`/`socialOther`/`socialName` opsional, `priorExperience`, `goal`, `challenge`, `source`/`sourceOther`, dan `attendance`. Naskah pertanyaan yang berbeda ditetapkan oleh `form_kind` pada aplikasi; bila CMS kelak dapat mengubah naskah itu, tambahkan snapshot versi formulir terlebih dahulu.

Nominal, promo, DP 20%, rekening, waktu H-2, dan unggahan bukti dalam dokumen formulir adalah data historis contoh, bukan data terbit. BNSP memiliki dua pos biaya yang belum disahkan menjadi satu harga final. `price_idr` dan `fee_details` batch hanya diisi setelah pemilik mengonfirmasi rincian. Bukti transfer ditangani admin di WhatsApp; `payments.proof_object_key` tetap kosong dalam alur ini.

## Status CMS

Login, editor, endpoint mutasi, artikel publik, kanal kontak pada situs, bucket privat, unggahan admin, dan URL media bertanda tangan telah dibangun. Mutasi memakai sesi Supabase Auth dan allowlist `admin_users`, dengan validasi di server. Rate limit login khusus aplikasi dan pengujian browser menyeluruh untuk unggah serta siklus terbit/tarik masih diperlukan sebelum produksi. Konten draf, URL media tanpa izin, rekening, dan jawaban peserta tidak boleh lolos melalui API langsung. ID aset disimpan terpisah dari URL provider agar perpindahan penyimpanan media tidak mengubah relasi konten.

Keputusan pemilik yang belum ada: rekening aktif, izin masing-masing aset dan kutipan, artikel, jadwal/biaya/DP batch nyata, serta aturan kapasitas dan reschedule. Akun admin dan kanal kontak yang sebelumnya sudah tampil di situs telah dikonfigurasi untuk dev. Pertahankan draf atau keadaan kosong sampai keputusan tersedia.
