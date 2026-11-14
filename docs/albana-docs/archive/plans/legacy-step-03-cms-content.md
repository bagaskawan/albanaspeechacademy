# Langkah 3 — CMS dan konten akademi

**Status 10 November 2026:** editor konten, RLS admin, bucket media privat, unggahan tervalidasi, artikel publik, kanal kontak publik, serta galeri dan testimoni berbasis katalog telah diterapkan di Supabase dev dan aplikasi. Login admin teruji dengan akun allowlist. Uji browser penuh untuk unggahan media serta siklus artikel draf → terbit → tarik masih diperlukan sebelum dinyatakan selesai. Lihat [desain data CMS](../working-notes/archive/working-notes/superpowers/specs/2026-11-09-cms-database-design.md) dan [model aktual](../database.md).

## Hasil yang dituju

Admin dapat menyunting, meninjau, menerbitkan dan menarik konten. Perubahan terbit dapat dilihat pengunjung melalui halaman terkait.

## Prasyarat

Cocokkan kebutuhan [brief](../../project/project-brief.md) dengan [skema katalog](../../web/db/academy.sql) dan [konten editorial](../../web/db/academy-content.sql). Supabase Dashboard dapat dipakai untuk mengisi dev. Gunakan konfigurasi batch dan varian dari [langkah 2](./legacy-step-02-registration-registration/registration-contract.md).

## Checklist

- [x] Sediakan halaman login admin di `/admin/login`. Endpoint memeriksa sesi dan allowlist `public.admin_users` di server; provisioning akun dan rate limit login masih diperlukan sebelum produksi.
- [x] Sediakan editor profil akademi, metode belajar, profil Alan dan trainer. Kelola bio, peran, izin potret serta penugasan trainer per batch.
- [x] Kelola program melalui slug stabil, ringkasan, audiens, hasil, format, kelompok kurikulum dengan daftar `materi` terurut, fasilitas, sertifikasi dan FAQ.
- [x] Kelola batch, sesi, lokasi, status, tenggat, harga final, rincian promo, DP dan varian formulir. Waktu input WIB disimpan sebagai `timestamptz`; batch yang dibuka memerlukan program terbit dan sesi mendatang.
- [x] Pisahkan editor kanal kontak (alamat, Instagram, WhatsApp, email) dari rekening (bank, nomor sebagai teks, nama pemilik, status aktif). Hanya kanal `published` dibaca publik; nilai yang sebelumnya sudah tampil di situs disalin eksplisit ke kanal CMS.
- [x] Kelola galeri, testimoni dengan atribusi dan artikel draf/terbit. Catat izin media dan kutipan, validasi unggahan di server dan render artikel sebagai elemen React tanpa HTML mentah.
- [ ] Uji akses publik melalui katalog dan URL langsung: draf, batch batal, sesi dari program tersembunyi, serta media tanpa izin harus tidak dapat dibaca. Uji SQL rollback membuktikan baris draf dan batch tersembunyi; unggahan/storage URL belum diuji end-to-end.

## Kriteria selesai

Admin dapat mengubah satu konten, menerbitkannya, memeriksa hasil di situs, lalu menariknya. Pengunjung tidak dapat membaca rekening, data peserta atau draf, termasuk melalui permintaan API langsung. Uji bahwa pengguna tanpa sesi tidak bisa menjalankan mutasi admin. **Belum dinyatakan selesai:** siklus terbit/tarik konten nyata dan unggahan privat di browser belum diuji karena belum ada materi/izin publikasi yang disetujui.

## Keputusan yang masih terbuka

Pemilik menetapkan akun admin, kanal kontak publik, rekening aktif dan izin tiap aset. Artikel menunggu materi yang disetujui. Ikuti [rancangan teknis](../tech.md) saat memilih penyedia autentikasi dan media.
