# Langkah 1B — Halaman detail program

## Hasil yang dituju

Dari “Lihat selengkapnya” di beranda atau tautan langsung, pengunjung dapat membaca materi satu program, memeriksa biaya dan membandingkan jadwal batch. Halaman tetap berguna sebelum pendaftaran dibuka.

## Prasyarat

Gunakan slug dari kartu pada [langkah 1](./legacy-step-01-landing-page.md), data terbit dari [katalog](../../web/lib/server/catalog.ts), dan urutan konten bagian 5 pada [layout program](../program-layout.md). Ikuti [spesifikasi desain](../design.md) untuk grid, fokus, warna, dan reflow.

## Checklist

- [ ] **Rute dan navigasi.** Buka `/program/[slug]` di dalam layout publik. Sediakan “Kembali ke semua program” menuju `/#program`. Tampilkan 404 untuk slug tak dikenal atau draf. Saat katalog gagal dimuat, tampilkan pesan gagal dan aksi “Coba lagi”.
- [ ] **Ringkasan.** Tampilkan nama, ringkasan dan format program. Gunakan data batch untuk durasi, tempat dan status. Jika antarbatch berbeda, sajikan faktanya pada batch masing-masing.
- [ ] **Audiens, hasil dan metode.** Jelaskan untuk siapa program ditujukan dan apa yang akan dipelajari sesuai naskah terbit. Gunakan rumusan 70/20/10 dari profil akademi.
- [ ] **Kurikulum.** Tampilkan lima materi Series sebagai satu daftar. Untuk For Speakers, pertahankan urutan dan pengelompokan materi yang diterbitkan di katalog.
- [ ] **Jadwal dan trainer.** Tampilkan satu panel per batch, berisi sesi terurut, tanggal, jam WIB, tempat, alamat, status dan trainer yang ditugaskan. Jika tidak ada batch terbit, tampilkan “Jadwal program ini belum tersedia.”
- [ ] **Biaya, fasilitas dan sertifikasi.** Tampilkan nominal final dan rincian biaya pada batch terkait sebelum tombol daftar. Tampilkan fasilitas, syarat dan keterangan BNSP hanya jika disetujui untuk program tersebut. Biarkan harga yang belum tersedia tanpa nominal. Sembunyikan bagian opsional yang kosong, termasuk FAQ.
- [ ] **Pendaftaran.** Setelah [formulir langkah 2](./legacy-step-02-registration-registration/registration-contract.md) siap, gunakan `accepting_registrations` untuk menentukan CTA. Untuk satu batch yang menerima peserta, arahkan “Daftar” ke formulir batch itu sesuai rute langkah 2. Jika ada beberapa pilihan, arahkan ke daftar batch di halaman detail; berikan tombol pada masing-masing batch yang terbuka. Terapkan aturan yang sama pada bilah ponsel. Jika semua batch tertutup, pertahankan statusnya tanpa tombol daftar.

## Kriteria selesai

Uji kedua program lewat kartu, URL langsung, tombol Back browser dan “Kembali ke semua program”. Periksa nol batch, beberapa batch dengan status berbeda, semua batch tertutup, slug salah, draf, serta gangguan katalog. Sebelum langkah 2 siap, kedua detail harus tetap dapat dibaca. Sesudahnya, cek bahwa setiap CTA membawa identitas program dan batch yang tepat.

Uji navigasi keyboard dan fokus, lebar 1440/834/390/320 px, pembesaran teks 200%, serta reflow pada zoom 400% dari lebar 1280 px. Pastikan bilah ponsel tidak menutupi konten atau kontrol yang mendapat fokus.

## Keputusan yang masih terbuka

Pemilik mengesahkan profil audiens, hasil belajar, penugasan trainer, harga, fasilitas serta syarat sertifikasi sebelum ditayangkan. Tanggal poster tidak menentukan status pendaftaran. Publikasikan bagian yang sudah terkonfirmasi sambil menunggu kelengkapan lainnya.
