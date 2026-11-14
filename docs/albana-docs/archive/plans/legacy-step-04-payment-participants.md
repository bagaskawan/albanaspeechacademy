# Langkah 4 — Pembayaran manual dan peserta

## Hasil yang dituju

Admin bisa menindaklanjuti formulir yang diterima, memeriksa pembayaran dan menangani permintaan perubahan jadwal dengan riwayat yang dapat ditelusuri.

## Prasyarat

Gunakan [penerimaan formulir](../../web/db/registration-intake.sql), akses admin dari [langkah 3](./legacy-step-03-cms-content.md), dan [aturan model data](../database.md). Pendaftaran unik berdasarkan batch dan email yang dinormalisasi. Harga, rincian biaya, varian, DP, jawaban dan waktu persetujuan direkam saat penerimaan.

## Checklist

- [ ] Tampilkan daftar pendaftar untuk admin, bersama batch dan biaya yang tersimpan saat daftar. Admin menindaklanjuti peserta dan memberikan petunjuk transfer ke rekening aktif.
- [ ] Peserta mengirim bukti transfer langsung ke WhatsApp resmi admin. Admin memeriksanya di percakapan tersebut. Website tidak menerima atau menyimpan berkas, foto, tangkapan layar, atau tautan bukti. Biarkan kolom opsional `proof_object_key` kosong.
- [ ] Kaitkan setiap catatan pembayaran dengan pendaftaran. Catat nominal, status, pemeriksa dan waktu pemeriksaan. Pertahankan riwayat percobaan yang ditolak. Konfirmasikan peserta hanya setelah pembayaran terverifikasi.
- [ ] Terapkan aturan DP dan pelunasan setelah disepakati. Skema awal membatasi satu pembayaran terverifikasi per pendaftaran; sesuaikan aturan dan skema bersama sebelum menerima beberapa cicilan.
- [ ] Catat permintaan reschedule, batch asal dan tujuan, keputusan, admin dan waktu. Saat menyetujui, cek program, status, kapasitas serta selisih biaya dalam transaksi yang sama.
- [ ] Terapkan kebijakan retensi yang disetujui. Hindari mencatat isi formulir, token atau bukti transfer di log.

## Kriteria selesai

Uji pembayaran ditolak, pengajuan ulang dan verifikasi berulang. Pastikan formulir peserta dan CMS tidak menyediakan unggahan atau kolom tautan bukti. Periksa bahwa catatan pembayaran hanya dapat diakses admin berwenang. Uji reschedule diterima dan ditolak; perpindahan yang gagal mempertahankan batch asal dan pembayaran tetap terkait peserta yang benar.

## Keputusan yang masih terbuka

Pemilik menetapkan kapan kursi ditahan atau dilepas, kapan DP cukup untuk konfirmasi, dan cara mencatat pelunasan. Pastikan masa simpan data, syarat serta tenggat reschedule dan perlakuan selisih harga sebelum mengaktifkan alur terkait.
