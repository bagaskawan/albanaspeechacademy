# Implementasi revisi website Albana

> **Untuk pelaksana:** kerjakan tugas berurutan; setiap perubahan perilaku memakai uji gagal → implementasi → uji lulus. Periksa [audit dan strategi](../project/2026-11-13-release-audit.md) serta [spesifikasi revisi](../project/website-revision-specification.md). Keputusan percakapan 13 November pada audit mengungguli rencana lama yang bertentangan.

**Tujuan:** website Albana menampilkan tiga Public Training dan Inhouse, menerima pendaftaran/bundling dengan pembayaran manual yang dapat diverifikasi, mengelola media, lalu berjalan di Hostinger Unlimited + MariaDB setelah QA target stack.  
**Stack pengembangan:** Next.js 16, React 19, TypeScript, Tailwind, Supabase yang sudah dipakai checkout.  
**Stack rilis:** Next.js pada Hostinger Unlimited Web Hosting, MariaDB, media Hostinger persisten yang terbukti; YouTube untuk video yang ditonton banyak orang.

## Tugas dan kontrak

### 1. Inventaris dan baseline

- [ ] Catat status Git, route aktif Albana, tabel/kolom Supabase yang benar-benar terpasang, jumlah data Albana aktif, lokasi aset Albana dari pemilik proyek, rekening, nomor WhatsApp resmi, serta target staging. Jangan salin kredensial ke dokumen. Aset Albana yang disediakan pemilik proyek sudah dinyatakan berizin; jangan meminta izin ulang per aset.
- [ ] Jalankan tes Node yang ada, `npm run lint`, `npx --no-install tsc --noEmit`, dan `npm run build` dari `front/`; pisahkan kegagalan baseline dari regresi baru.
- [ ] Buktikan paket Hostinger dapat menjalankan build Next.js dan temukan lokasi media **di luar folder deployment** yang dapat ditulis dan dibaca aplikasi. Uji upload → redeploy → baca ulang pada staging sebelum memilih lokasi produksi.

### 2. Beranda, katalog, dan halaman program

- [ ] Ubah `components/home/home-page.tsx` agar Hero langsung diikuti Program. Hero menampilkan logo, pertanyaan/manfaat, tagline, dan CTA. Tempatkan rincian manfaat setelah Program.
- [ ] Tambahkan kontrol tema publik yang dapat dipakai keyboard, mengingat pilihan, menghormati preferensi sistem, dan tidak mengubah tema admin secara tak sengaja.
- [ ] Jadikan Series, Speaker, Sertifikasi, dan Inhouse sebagai penawaran yang dapat dikelola; migrasikan label Basic to Advance ke Speaker tanpa memutus tautan lama. Detail Public Training menampilkan rincian, foto batch, video berizin/YouTube, jadwal/harga, serta CTA form. Inhouse menampilkan dokumentasi, partner, dan CTA konsultasi.
- [ ] Benahi data aktif yang slugs-nya tertukar (`basic-to-advance` berjudul Series; `public-speaking-series` berjudul Speakers). Perbaiki pemetaan batch dengan backup dan redirect tautan lama sebelum membuka pendaftaran.
- [ ] Pastikan Trainer dan Batch tidak ditautkan lewat modul penugasan; batch tetap terkait **Program** dan dapat dibuat/diedit dari CMS.
- [ ] Uji urutan DOM beranda, deep link lama, konten kosong/gagal, dan CTA Inhouse yang tidak membuka form publik.

### 3. Penawaran, form, dan tagihan

- [ ] Di CMS, kelola harga per batch, penawaran bundling Speaker–Sertifikasi, DP, rekening aktif, dan status buka. Pilihan bundling muncul **sebelum** form; paket memilih dua batch dan mengirim satu pendaftaran.
- [ ] Rekening tujuan dibaca dari data kontak/rekening aktif yang dikelola admin, tanpa konstanta nomor rekening. Bundling tidak dapat dibuka sampai admin mengisi harga dan kedua batch tersedia; pendaftaran tidak dapat diterima saat belum ada rekening aktif.
- [ ] Tambahkan `POST /api/registrations`. Request memuat `offerId`, satu atau dua `batchIds`, `paymentMethod: "full" | "dp"`, `answers`, `offerVersion`, dan `idempotencyKey`; respons sukses memuat `registrationId`, `invoiceId`, dan `receiptToken`. Server memvalidasi ulang semua harga, batch, dan rekening; `409` untuk penawaran berubah/tutup, `422` untuk input salah, `429` untuk batas laju. Retry identik mengembalikan hasil yang sama tanpa membuka data pendaftar lain.
- [ ] Simpan snapshot harga serta item batch per pendaftaran. Buat tagihan awal lunas/DP secara atomik. Alokasikan kode `001`–`999` yang belum dipakai **tagihan aktif pada rekening yang sama**; simpan subtotal, kode, dan total sebagai integer rupiah. Jika kode habis, tolak penerbitan dan beri admin status yang dapat ditindaklanjuti. Pelunasan DP dibuat setelah verifikasi awal sebagai tagihan baru dengan kode baru.
- [ ] Tambahkan halaman `/register/konfirmasi/[token]` dengan token acak yang tidak dapat ditebak. Kolom kiri berisi status, nama program/bundling, subtotal, kode, total, tiga langkah, dan CTA WhatsApp; kolom kanan berisi bank, nomor salin, dan pemilik rekening. Jangan tampilkan QRIS atau identitas Panggung Kreator. Token salah/kedaluwarsa tidak mengungkap data peserta.
- [ ] Admin melihat ID, dua batch paket bila ada, nominal dan status tagihan; verifikasi mencatat admin/waktu. Bukti tetap di WhatsApp, bukan di-upload ke situs.
- [ ] Uji tiga program tunggal dan bundling; lunas, DP, pelunasan; konflik harga; batch tutup; dua submit paralel; retry; 999 kode terpakai; dan akses tanda terima tanpa token.

### 4. Media dan konten

- [ ] Ubah upload gambar agar server memeriksa MIME/signature, ukuran ≤10 MiB, dan dimensi minimum bawaan 1280×720, lalu mengompresi memakai Sharp tanpa upscaling. Terbitkan hanya output berkualitas yang ≤5 MiB; bila tidak tercapai, tolak dengan pesan yang jelas. Minimum resolusi dapat diubah dari CMS; maksimum byte tetap di server.
- [ ] Untuk MP4, verifikasi MIME/signature, ukuran ≤25 MiB dan minimum 720p; admin mengecilkan file sebelum unggah. Dukung URL YouTube tervalidasi. **Tidak ada klaim kompresi otomatis video** pada UI atau dokumentasi.
- [ ] Simpan metadata, izin publikasi, dan rujukan media di CMS. Uji file rusak, file terlalu kecil/besar, media privat, output gambar, dan kelangsungan file sesudah redeploy staging.

### 5. Migrasi final, pembersihan, dan rilis

- [ ] Setelah fitur Supabase stabil, backup dan uji restore. Petakan data Albana aktif ke migrasi SQL MariaDB; pertahankan ID/slug, dua batch bundling, snapshot biaya, status pembayaran, dan waktu WIB. Login admin dibuat ulang dengan password hash dan pemeriksaan peran; kata sandi Supabase tidak disalin.
- [ ] Alihkan akses katalog, CMS, pendaftaran, tagihan, dan media ke adapter MariaDB/Hostinger. Terapkan validasi/otorisasi server karena RLS Supabase tidak berlaku di MariaDB. Cocokkan jumlah baris, relasi, checksum atau total nominal, dan pembacaan setiap konten publik di staging.
- [ ] Hapus route, dependensi, dan aset Panggung Kreator yang tidak dipakai setelah graf impor dan regresi Albana lulus; pertahankan komponen UI umum yang masih digunakan.
- [ ] QA final di Hostinger: lint, tipe, build, skenario tugas 2–4, layar 320/390 px dan desktop, zoom 200%, keyboard, tema, reduced motion, serta upload → redeploy → baca ulang. Catat bukti dan status setiap gerbang.
- [ ] Deploy hanya bila semua P0/P1 lulus. Bekukan tulisan sumber, impor delta, rekonsiliasi, alihkan domain, dan smoke test produksi. Jika gagal, jangan alihkan domain; rollback setelah tulisan baru memerlukan rekonsiliasi.

## Batasan dan keputusan rilis

Satu pengembang merangkap QA; jadwal 16–17 November adalah target bersyarat. Tidak memakai VPS, SSH, FFmpeg, Cloudinary, atau penyedia video lain. YouTube diutamakan untuk pemutaran publik; MP4 Hostinger hanya untuk file berukuran kecil dan lalu lintas ringan. Kemampuan media persisten serta batas upload Node.js harus dibuktikan pada akun Hostinger aktual sebelum rilis.
