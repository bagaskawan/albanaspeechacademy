# Indeks pengerjaan Albana Speech Academy

**Fondasi tersedia.** Proyek Supabase PostgreSQL `albanaspeechacademy-dev` sudah memiliki katalog awal dua program dan empat trainer. [GET /api/catalog](../../web/app/api/catalog/route.ts) membaca konten terbit. [POST /api/registrations](../../web/app/api/registrations/route.ts) menerima formulir sesuai batch. Beranda dan halaman daftar masih memakai data pratinjau dan satu Google Form.

| Langkah dan checklist | Hasil | Status awal | Prasyarat |
| --- | --- | --- | --- |
| [1. Landing page](./legacy-step-01-landing-page.md) | Pengunjung membandingkan dua program dan melihat ringkasan batch. | Siap dikerjakan | Katalog dev dan naskah beranda tersedia. |
| [1B. Halaman detail program](./legacy-step-01b-program-detail.md) | Pengunjung membaca materi, biaya dan jadwal lengkap per program. | Rute detail belum tersedia | Katalog terbit dan tautan dari kartu program. |
| [2. Form pendaftaran](./legacy-step-02-registration-registration/registration-contract.md) | Peserta memilih batch, mengisi formulir dan mendapat tanda terima. | Backend tersedia; UI belum terhubung | Konteks program dan batch dari langkah 1B. |
| [3. CMS dan konten](./legacy-step-03-cms-content.md) | Admin dapat mengubah dan menerbitkan konten. | Pengelolaan sementara melalui Supabase Dashboard | Skema katalog dan konfigurasi formulir dari langkah 1–2. |
| [4. Pembayaran dan peserta](./legacy-step-04-payment-participants.md) | Admin memverifikasi pembayaran dan menangani reschedule. | Tabel pembayaran tersedia; alur admin belum tersedia | Penerimaan formulir langkah 2 dan akses admin langkah 3. |
| [5. Migrasi Hostinger](./legacy-step-05-hostinger-migration.md) | Aplikasi berjalan di Hostinger dengan data terverifikasi dan prosedur pemulihan. | Menunggu verifikasi hosting | Alur publik dan admin dari langkah 1–4 dapat diuji. |

Mulai dari langkah 1 meski belum ada batch terbuka. Centang butir setelah hasilnya diperiksa. Perbarui status pada indeks setelah kriteria selesai langkah tersebut terpenuhi.
