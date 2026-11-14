# Langkah 1 — Landing page

## Hasil yang dituju

Pengunjung dapat membandingkan kedua program melalui kartu yang merangkum fokus, tanggal dan tempat batch yang sudah terbit.

## Prasyarat

Gunakan [layout program](../program-layout.md) untuk alur, [konten beranda](../home-content.md) untuk naskah dan izin, serta [spesifikasi desain](../design.md) untuk tampilan. Periksa dua program dan empat trainer di dev. Katalog menyediakan `academy`, `trainers`, `programs` beserta batch, sesi dan penugasan, `gallery` dan `testimonials`. Daftar kosong berbeda dari kegagalan HTTP 503.

## Checklist

- [ ] **Navigasi dan hero.** Arahkan Ganti “Lihat jadwal” jadi "Lihat Program" ke `/#program`. Tampilkan menu dokumentasi atau artikel hanya jika ada tujuan terbit.
- [ ] **Profil Alan.** Baca profil founder dari data trainer yang sama dengan daftar pengajar. Gunakan bio dan foto yang sudah disetujui.
- [ ] Pilih kemampuan komunikasi
- [ ] **Program.** Tampilkan dua kartu dengan fokus program dan ringkasan batch. Hubungkan “Lihat selengkapnya” ke [halaman detail program](./legacy-step-01b-program-detail.md). Aktifkan “Daftar Program” setelah formulir batch siap pada langkah 2.
- [ ] **Cara mengajar.** Ambil rumusan 70% praktik, 20% coaching dan 10% konsep dari profil akademi.
- [x] **Trainer.** Tampilkan nama dan Popup Detail
- [ ] Hapus bagian jadwal karena sudah ada di detail program nantinya
- [ ] **Dokumentasi.** Dalam bentuk bento grid acak acakan
- [ ] Tambahkan testimoni dengan bentuk card -> sementara dummy dulu
- [ ] **Kontak.** Pakai kanal yang disetujui untuk tampil. Bedakan alamat kantor dari lokasi batch. Pertahankan kontak terverifikasi sampai CMS menyediakan proyeksi kontak publik.
- [ ] **Footer.** Tautkan hanya tujuan yang tersedia. Tempatkan instruksi pembayaran pada alur daftar. Serahkan aktivasi CTA “Daftar” kepada [langkah 2](./legacy-step-02-registration-registration/registration-contract.md).

## Kriteria selesai

Kedua kartu menampilkan ringkasan program meski belum ada batch. Setelah langkah 1B tersedia, periksa tujuan “Lihat selengkapnya” dari tiap kartu. Uji keyboard, lebar 1440/834/390/320 px dan zoom sesuai spesifikasi desain.

## Keputusan yang masih terbuka

Pemilik mengonfirmasi sesi, tempat, harga, fasilitas, penugasan trainer, izin media dan keterangan sertifikasi sebelum informasi tersebut ditayangkan. Tanggal poster saja tidak membuktikan batch masih menerima peserta.
