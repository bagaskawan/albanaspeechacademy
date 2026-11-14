# Status pekerjaan dan rencana lanjutan revisi website Albana

**Tanggal:** 13 November 2026  
**Status:** dokumen lanjutan saja. Tidak ada perintah untuk meneruskan implementasi, migrasi Hostinger, QA, atau deploy berdasarkan dokumen ini.

## Dokumen yang sudah ditulis

1. [Audit dan strategi rilis](../project/2026-11-13-release-audit.md) merangkum selisih spesifikasi dengan aplikasi, urutan Hero → Program, alur konfirmasi bank, pengecualian kompresi video, batas Hostinger Unlimited, serta gerbang QA dan rilis.
2. [Implementation plan](./2026-11-13-website-revision-implementation-plan.md) memecah pekerjaan menjadi inventaris, beranda/katalog, pendaftaran/tagihan, media, migrasi akhir ke MariaDB, pembersihan kode lama, QA, dan deploy bersyarat. Harga bundling diisi admin; rekening berasal dari data kontak/rekening CMS; aset yang disediakan pemilik proyek dinyatakan berizin.

## Perubahan yang telanjur dilakukan sebelum ruang lingkup diluruskan

Bagian ini mencatat keadaan nyata, **bukan** persetujuan untuk meneruskan plan. Perubahan kode masih berada di working tree dan belum di-commit. Percobaan `git restore` meminta izin tambahan dan ditolak; karena itu perubahan tersebut belum dibatalkan.

| Area | Yang sudah dibuat/diubah | Status verifikasi |
|---|---|---|
| Beranda | Hero memakai logo dan pesan manfaat; Program dipindah tepat setelah Hero; kontrol tema publik ditambahkan. | Pemeriksaan tampilan akhir belum dilakukan. |
| Katalog | Slug Series dan Speaker dikoreksi; dua program awal Sertifikasi dan Inhouse ditambahkan dengan konten dasar. Redirect `basic-to-advance` dibuat ke Speaker. | Pemetaan dua batch ke program sudah dibaca kembali di Supabase. Konten dasar Sertifikasi/Inhouse masih perlu ditinjau pemilik konten. |
| Pendaftaran | Endpoint `POST /api/registrations`, validasi kiriman, idempotensi, snapshot harga, kode unik per rekening, halaman konfirmasi bertoken, dan halaman admin tagihan/bundling ditulis. | Uji transaksi SQL dalam blok rollback lulus untuk lunas, retry, DP, verifikasi, dan tagihan pelunasan. Belum ada uji browser end-to-end. |
| Media | Upload lama yang menulis ke folder deployment diganti pada kode dengan pemeriksaan admin, kompresi gambar Sharp, pemeriksaan MP4, penyimpanan Supabase Storage, metadata, YouTube, dan panel media. | Uji unit gambar dan URL YouTube lulus. Belum diuji unggah nyata, pemutaran video, atau persistensi sesudah redeploy. |
| Inhouse dan admin | Halaman program membaca media terbit; Inhouse memakai CTA konsultasi dan daftar partner; modul partner dibuat. Penugasan Trainer–Batch yang kosong dilepas. | Belum ada logo partner atau dokumentasi yang diterbitkan melalui CMS. |
| Konfigurasi lokal | Kunci service role pada `.env` lokal dipindah dari nama `NEXT_PUBLIC_` ke variabel server dan rahasia token lokal dibuat; nilai tidak ditulis dalam dokumen. | Kunci lama sudah pernah memakai nama publik, sehingga perlu rotasi sebelum rilis. |

### Perubahan Supabase yang sudah terjadi

Pada proyek yang dipakai aplikasi saat ini, migrasi berikut **sudah diterapkan**: tabel/ fungsi pendaftaran dan tagihan, kebijakan publikasi media tanpa pemeriksaan izin per aset, koreksi slug dengan salinan dua program/batch di skema `albana_migration_backup`, penambahan program Sertifikasi dan Inhouse serta tabel partner, dan penghapusan tabel penugasan Trainer–Batch yang saat diperiksa berisi nol baris. Sesudah uji SQL dengan rollback, rekening aktif, pendaftaran, tagihan, dan baris rate limit masing-masing tetap **nol**. Belum ada harga bundling atau rekening yang diisi.

Perubahan ini tidak dibalik pada giliran ini karena permintaan terbaru adalah **tidak mengeksekusi plan**. Bila keadaan Supabase dan kode perlu dikembalikan persis seperti sebelum sesi, buat dan tinjau rencana rollback terpisah terlebih dahulu; jangan menghapus tabel atau data baru tanpa pemeriksaan ulang.

## Yang belum selesai dan masih berupa rencana

1. Inventaris aset Albana yang benar-benar final. Workspace berisi logo Albana, foto Alan, folder `images/preview`, dan aset `assets/landing-page` dari kode lama. Tidak ada berkas video atau logo partner terpisah yang ditemukan lewat inventaris ekstensi umum. Jangan menyebut foto `preview` atau aset Panggung Kreator sebagai dokumentasi kegiatan Albana tanpa penetapan yang jelas.
2. Isi konten final Sertifikasi dan Inhouse, foto/video tiap Public Training, dokumentasi Inhouse, daftar partner, rekening aktif, serta harga bundling melalui CMS. Bundling tetap nonaktif sampai admin mengisi harga dan kedua batch tersedia.
3. Uji formulir dan media end-to-end, konflik harga, pengiriman serentak, kode unik habis, autentikasi admin, akses tanda terima, ukuran unggahan, keyboard, ponsel, dan tema. Pemeriksaan tipe terakhir menemukan dua kesalahan yang kemudian diedit tetapi belum diuji ulang. Lint penuh pada baseline masih mencatat 542 error dan 345 warning. Build Turbopack dan percobaan webpack tidak selesai dan dihentikan.
4. Buktikan akses staging Hostinger, lokasi media yang tetap ada setelah redeploy, batas unggahan, kemampuan build Next.js, dan akses MariaDB. Konfigurasi MCP Hostinger terdeteksi, tetapi alat Hostinger tidak tersedia dalam sesi ini dan percobaan membuka hPanel melalui browser gagal. **Belum ada migrasi atau deploy Hostinger.**
5. Setelah fitur dan konten lulus di Supabase, lakukan backup/restore percobaan, migrasi data dan login ke MariaDB, rekonsiliasi nominal/status/waktu WIB, QA final pada stack Hostinger, lalu alih domain hanya jika semua gerbang lulus. Target 16–17 November tetap bersyarat.

## Keputusan untuk kelanjutan

Dokumen ini hanya laporan dan rencana. Jangan menjalankan butir yang belum selesai, membalik migrasi, mengisi rekening/harga, atau deploy berdasarkan catatan ini tanpa permintaan implementasi baru dari pemilik proyek.
