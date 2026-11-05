# Arsitektur Teknis — Albana Speech Academy

Status: rancangan implementasi untuk [brief](Brief.md), 5 November 2026. Target preview 8 November dan final 10 November 2026.

## Stack

| Lapisan | Pilihan | Alasan |
| --- | --- | --- |
| Frontend dan backend | Next.js App Router + TypeScript, satu aplikasi fullstack | Halaman publik, CMS, dan proses formulir berada dalam satu proyek. |
| Tampilan | Tailwind CSS | Mempercepat penerapan token visual dari [design.md](design.md) tanpa komponen UI tambahan. |
| Database | MySQL di Hostinger + Prisma ORM dan migrations | Relasi terstruktur untuk program, batch, pendaftaran, pembayaran manual, dan konten. [Hostinger menyediakan MySQL pada web/cloud hosting](https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/). |
| Login CMS | Auth.js Credentials, satu akun admin Alan; kata sandi di-hash | Area admin hanya untuk pengelola. Login peserta tidak diperlukan. |
| Media | Cloudinary untuk foto/video yang diunggah; tautan YouTube untuk video eksternal | Memenuhi pola video hibrida. [Cloudinary mendukung upload dan optimasi video](https://cloudinary.com/documentation/node_image_and_video_upload). |
| Hosting | Hostinger Business Web Hosting atau Cloud yang mendukung Node.js/Next.js; Node.js 22 | [Paket yang mendukung aplikasi Node.js](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/) harus dipastikan sebelum implementasi. |

Pilihan ini adalah rancangan, belum berarti layanan dan akun sudah tersedia. Cek paket Hostinger milik klien, kapasitas MySQL, kuota Cloudinary, domain, dan aksesnya sebelum mengunci deployment.

## Struktur aplikasi

- Publik: beranda; program dan detailnya; jadwal; dokumentasi; profil trainer; artikel dan detailnya; pendaftaran. Metode pengajaran, lokasi, dan pembayaran dapat menjadi bagian pada beranda/detail program/alur daftar agar navigasi tetap ringkas.
- Admin: login; kelola profil dan metode pengajaran, program, batch dan pertemuan, lokasi, dokumentasi, testimoni, artikel, media, serta status pendaftaran dan pembayaran.
- Backend: Server Components untuk membaca konten publik; Server Actions/Route Handlers untuk mutasi yang memvalidasi input dan otorisasi. Form pendaftaran mengikuti [panduan resmi Next.js](https://nextjs.org/docs/app/guides/forms).
- Data: struktur dan aturan relasi di [database.md](database.md). Jangan membuat API terpisah atau akun peserta untuk cakupan saat ini.

## Alur utama

1. Pengunjung memilih program dan batch yang masih menerima pendaftaran.
2. Form mengirim data minimal yang disetujui klien. Server memvalidasi dan menyimpan pendaftaran; tampilkan hasil berhasil atau kesalahan yang bisa diperbaiki.
3. Admin menghubungi peserta, mengirim petunjuk pembayaran manual, lalu mencatat dan memverifikasi pembayarannya di CMS. Status peserta menjadi terkonfirmasi hanya setelah verifikasi.
4. Materi peserta dibagikan melalui grup WhatsApp. Situs tidak menyimpan materi peserta atau memproses transaksi kartu.
5. Permintaan penjadwalan ulang ditangani admin berdasarkan aturan yang perlu ditetapkan klien; riwayat perpindahan batch dicatat.

Form Google yang ditautkan dalam brief adalah acuan pengumpulan data, tetapi isinya belum dapat diakses saat penyusunan dokumen ini. Cocokkan kolom final sebelum membangun form.

## Media dan konten

- Admin dapat memilih tautan YouTube atau mengunggah video/foto melalui Cloudinary. Video yang diunggah perlu dikompresi sebelum upload; Cloudinary mengoptimalkan versi yang ditayangkan, tetapi [file asli tetap tersimpan](https://cloudinary.com/documentation/video_optimization). Simpan ID aset dan metadata dalam MySQL, bukan berkas video dalam database.
- Unggahan harus dibatasi berdasarkan jenis, ukuran, dan hak akses. Gunakan upload bertanda tangan yang hanya bisa diminta admin. Tampilkan video dengan ukuran dan kualitas yang dioptimalkan.
- Unggahan tidak disimpan di folder deployment Hostinger: [file aplikasi ditimpa saat deploy ulang](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/).
- Artikel disimpan sebagai teks terstruktur/Markdown yang dirender aman; status draft dan terbit. Konten publik hanya menampilkan yang terbit.

## Keamanan dan operasional

- Validasi semua input di server; batasi percobaan login dan pengiriman formulir; gunakan HTTPS, cookie aman, otorisasi pada setiap mutasi admin, dan rahasia aplikasi di environment variables.
- Simpan hash kata sandi, bukan kata sandi asli. Jangan tampilkan data pendaftar atau bukti pembayaran di halaman publik. Batasi akses media pribadi bila kelak ada.
- Tambahkan persetujuan pemrosesan data pada form dan izin publikasi untuk dokumentasi/testimoni. Aturan retensi data perlu keputusan klien.
- Backup MySQL dan data media; uji pemulihan. Jalankan migration sebelum versi baru, lalu uji login, pendaftaran, konfirmasi pembayaran, dan pembaruan CMS di lingkungan hosting.
- Cek batas ukuran request dan kuota layanan sebelum mengaktifkan unggahan video; video besar sebaiknya langsung ke penyedia media, bukan melewati server Next.js.

## Tenggat dan pemeriksaan

| Tenggat | Hasil yang harus dapat diperiksa |
| --- | --- |
| 8 Nov — preview | Navigasi, gaya visual, sembilan kelompok konten dari brief, dan contoh alur pendaftaran pada ponsel dan desktop. Konten yang belum diberikan klien ditandai sebagai belum terbit, tanpa testimoni atau klaim buatan. |
| 10 Nov — final | Konten yang disetujui, form tersimpan di database, CMS admin, status pembayaran manual, artikel, media, responsivitas, serta uji alur utama di Hostinger. |

Risiko jadwal terbesar: aset dan aturan pembayaran/penjadwalan ulang belum lengkap, paket Hostinger belum diverifikasi, dan layanan penyimpanan media belum disiapkan. Prioritaskan alur daftar dan konten yang nyata sebelum penyempurnaan visual.
