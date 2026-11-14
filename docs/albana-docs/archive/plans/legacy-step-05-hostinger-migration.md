# Langkah 5 — Migrasi Hostinger dan pemulihan

## Hasil yang dituju

Aplikasi berjalan di Hostinger. Jumlah peserta, relasi batch, status pembayaran, waktu kelas dan biaya historis sesuai dengan sumber.

## Prasyarat

Tuntaskan pengujian alur publik dan admin dari langkah 1–4. Periksa [arsitektur target](../tech.md) dan [model data](../database.md). Untuk basis data PostgreSQL dev **baru**, urutan SQL adalah [katalog](../../web/db/academy.sql), [penerimaan](../../web/db/registration-intake.sql), lalu [konten editorial](../../web/db/academy-content.sql). Ketiganya sudah diterapkan di proyek dev saat ini.

Konfigurasi sementara dibaca server dari `web/.env` yang diabaikan Git: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `REGISTRATION_INTAKE_KEY`. Untuk lingkungan Supabase baru, buat kunci intake acak 32 byte, simpan teks Base64 di penyimpanan rahasia dan pasang SHA-256 dari teks tersebut pada baris id 1 di `public.intake_key` melalui koneksi admin.

## Checklist

- [ ] Verifikasi paket Hostinger, dukungan Node.js, mesin dan versi database, domain, akses staging, serta mekanisme backup.
- [ ] Backup database dan media privat. Uji pemulihan salinan sebelum memakai data untuk latihan migrasi.
- [ ] Jika target MySQL, petakan JSONB ke JSON, TIMESTAMPTZ ke DATETIME UTC dan identity ke AUTO_INCREMENT. Ganti RLS/grants serta RPC dengan otorisasi server, transaksi dan kunci baris. Pertahankan kontrak katalog dan pendaftaran saat mengganti adapter. Uji batas satu pembayaran terverifikasi karena MySQL tidak memiliki partial unique index setara.
- [ ] Impor ke staging sesuai urutan foreign key. Cocokkan jumlah baris, relasi peserta dengan pembayaran, waktu WIB, nominal saat pendaftaran, status verifikasi dan izin akses privat.
- [ ] Dari `web/`, jalankan uji Node untuk ketiga varian, lint, TypeScript dan build. Di staging, uji login, publikasi katalog, submit paralel, kirim ulang, petunjuk WhatsApp setelah daftar dan pencatatan verifikasi manual oleh admin.
- [ ] Siapkan pembatasan kiriman per sumber di ingress produksi. Pertahankan perilaku batas intake saat ini (30 penerimaan baru per batch per menit) dan pantau kegagalan tanpa merekam data peserta.
- [ ] Bekukan penulisan, ekspor perubahan terakhir, cocokkan ulang data, lalu alihkan koneksi produksi. Uji alur utama sebelum membuka kembali penulisan.
- [ ] Jika pemeriksaan gagal, pulihkan koneksi lama. Jika target sudah menerima kiriman, rekonsiliasi perubahan sebelum beralih kembali agar pendaftaran dan pembayaran tidak hilang.

## Kriteria selesai

Latihan migrasi dan rollback berhasil di staging. Di produksi, pemeriksaan data cocok dengan sumber dan uji alur daftar hingga verifikasi pembayaran berhasil. Catat waktu ekspor terakhir, hasil pencocokan dan titik pemulihan.

## Keputusan yang masih terbuka

Pemilik mengonfirmasi paket Hostinger, mesin database, akses dan waktu perpindahan. Gunakan hasil verifikasi tersebut untuk menetapkan jadwal penghentian penulisan dan pembukaan kembali layanan.
