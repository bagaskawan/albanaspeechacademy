# Audit spesifikasi revisi dan strategi rilis Albana

**Tanggal audit:** 13 November 2026  
**Sumber:** `dokumen_spesifikasi_revisi_website.md`, gambar referensi konfirmasi pembayaran, kode `front/`, dan keputusan percakapan 13 November.  
**Target:** QA penuh 16 November; deploy pagi 17 November hanya jika semua gerbang lulus. Dengan satu pengembang merangkap QA, tanggal dapat bergeser tanpa mengurangi cakupan yang disepakati.

## Keputusan produk

- Hero menampilkan logo, pertanyaan atau manfaat utama, tagline, dan CTA. **Program muncul tepat setelah hero**; uraian manfaat dapat mengikuti Program.
- Public Training terdiri dari Series, Speaker (menggantikan Basic to Advance Eksklusif), dan Sertifikasi. Speaker dan Sertifikasi menawarkan bundling **sebelum formulir**. Bundling memilih satu batch dari tiap program, memakai satu formulir dan satu tagihan paket.
- Inhouse Training memakai konsultasi langsung, dokumentasi kegiatan, dan partner; tidak masuk alur formulir Public Training.
- Pendaftaran selesai hanya setelah data tersimpan. Halaman konfirmasi dua kolom mengambil struktur dari gambar referensi, memakai identitas Albana, rekening bank sebagai pengganti QRIS, dan WhatsApp admin untuk bukti transfer. Pembayaran lunas dan DP memakai kode unik **per tagihan aktif**; pelunasan sesudah DP adalah tagihan baru.
- Harga program, batch, bundling, persentase DP, rekening, dan minimum resolusi unggahan dikelola dari CMS. Maksimum byte unggahan tetap dibatasi server.
- Rekening tujuan mengikuti data kontak/rekening yang dikelola admin; tidak ada rekening yang ditanam sebagai konstanta. Harga bundling diisi admin, sehingga penawaran bundling belum dapat dibuka sebelum harga dan kedua batch tersedia.
- Trainer dan Batch menjadi entitas mandiri, tanpa penugasan/relasi satu sama lain pada rilis ini.
- Aset yang disediakan pemilik proyek untuk Albana dinyatakan telah berizin untuk publikasi; admin tidak perlu meminta persetujuan ulang per aset. Aset contoh dan sisa Panggung Kreator tetap tidak dipakai sebagai konten Albana.

## Matriks audit

| Prioritas | Kebutuhan | Kondisi checkout saat audit | Pekerjaan dan bukti selesai |
|---|---|---|---|
| P0 | Pendaftaran tersimpan dan tagihan | Form memanggil `/api/registrations`; route itu belum ada. Tanda terima masih meminta peserta menunggu instruksi admin. | Route penerimaan, snapshot harga, idempotensi, tagihan dan kode unik transaksional, konfirmasi bertoken, serta verifikasi admin. Uji retry, konflik harga, DP/lunas, dan dua tagihan serentak. |
| P0 | Migrasi akhir | Katalog, login, CMS, dan media saat ini memakai Supabase. Rancangan MariaDB lama belum diterapkan. | Selesaikan fitur pada Supabase dahulu; setelah stabil, migrasikan data Albana aktif, login, dan media ke MariaDB/Hostinger. Jalankan QA ulang di stack tujuan **sebelum** alih domain. |
| P0 | Penyimpanan media produksi | Pustaka media membaca Supabase Storage. `POST /api/upload` menulis ke folder build `public/assets`; ini tidak aman untuk media produksi yang harus bertahan setelah redeploy. | Buktikan lokasi Hostinger yang dapat diakses aplikasi dan tetap ada setelah upload → redeploy → baca ulang. Jika tidak terbukti, rilis penuh berstatus no-go. |
| P1 | Program dan beranda | Beranda kini merender Hero → Alan → Program. Detail program baru memuat ringkasan, jadwal, materi, dan CTA. | Pindah Program tepat setelah Hero; lengkapi tiga Public Training dan Inhouse dengan konten, foto, video/YouTube, partner, dan CTA masing-masing. |
| P0 | Identitas program di data aktif | `basic-to-advance` justru berjudul Public Speaking Series, sedangkan `public-speaking-series` berjudul Public Speaking for Speakers; ini tidak sesuai slug. | Luruskan slug dan pemetaan batch secara terkendali, pertahankan tautan lama melalui redirect, lalu uji seluruh CTA program/form. |
| P1 | Tema | CSS terang/gelap sudah ada; header publik belum memiliki kontrol pengubah tema. | Tambahkan toggle yang menyimpan pilihan, menghormati preferensi sistem, dan diuji tanpa kilatan tema salah. |
| P1 | Media CMS | Pustaka media mengompresi gambar di browser dan mengirim file langsung ke Storage; validasi HD dan kompresi gambar backend belum ada. | Validasi klien **dan** server, kompresi gambar backend berkualitas tinggi, pengelolaan YouTube dan MP4 terbatas, izin publikasi, serta uji kualitas sampel. |
| P0 | Nilai penawaran aktif | Proyek Supabase berisi 2 program dan 2 batch, tetapi `bank_accounts`, `media_assets`, `registrations`, dan `payments` masih kosong. | Jangan menerbitkan tagihan tanpa rekening aktif; bundling tetap nonaktif sampai admin mengisi harga dan batch kedua tersedia. |
| P1 | Lint keseluruhan | Pemeriksaan `eslint .` pada checkout menghasilkan **542 error dan 345 warning** di banyak modul lama, termasuk route membership. Pemeriksaan tipe `tsc --noEmit` lulus. | Bersihkan modul lama yang benar-benar tak dipakai; lint file yang disentuh harus lulus, lalu ulangi lint keseluruhan pada gerbang rilis. Jangan menyebut lint hijau sebelum hasilnya benar-benar nol error. |
| P2 | Admin dan kode lama | Admin Trainer/Batch ada, tetapi aplikasi masih memuat banyak rute dan kode membership Panggung Kreator. | Rapikan alur admin Albana, lalu hapus bagian lama berdasarkan graf impor/rute setelah regresi lulus. Jangan menghapus komponen UI dasar yang masih dipakai. |

## Batas paket Hostinger Unlimited

Paket aktif `albanaspeechacademy.com` adalah **Unlimited Web Hosting**, dengan MariaDB, 50 GB penyimpanan, FTP/File Manager, SSL, CDN, dan backup harian; **tanpa VPS, root, atau SSH**. Hostinger mendukung Node.js/Next.js pada paket Business/Unlimited, tetapi folder `hbuilds/` dan `public_html` milik deployment Node.js ditimpa saat redeploy. Hostinger juga menyatakan FFmpeg/codecs untuk transcoding hanya didukung pada VPS. Rujukan: [deployment Node.js](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/), [dukungan media](https://www.hostinger.com/support/which-media-compression-and-web-applications-are-supported-at-hostinger/), [batas Node.js](https://www.hostinger.com/support/hostinger-node-js-limits-for-web-and-cloud-plans/).

**Pengecualian eksplisit terhadap spesifikasi awal:** video dapat berupa tautan YouTube atau MP4 yang sudah diperkecil oleh admin sebelum unggah. CMS menolak MP4 di atas **25 MiB** atau di bawah **720p**; backend **tidak** melakukan transcode/kompresi otomatis video. Menyimpan MP4 pada hosting tidak berarti paket ini menyediakan pemrosesan atau streaming video intensif. Gambar sumber maksimal **10 MiB**, minimal **1280×720** secara bawaan, dikompresi di backend dengan Sharp dan ditargetkan maksimal **5 MiB** tanpa memperbesar dimensi. Batas sumber/hasil diuji pada hosting sebelum dikunci untuk produksi.

## Strategi satu pengembang

1. **13–15 November — fitur pada Supabase saat ini:** selesaikan alur pengunjung, katalog/CMS, tagihan, dan media; masukkan aset Albana yang disediakan pemilik proyek. Jalankan pengujian per perubahan, lint, pemeriksaan tipe, dan build.
2. **Tahap akhir pengembangan — staging Hostinger:** backup Supabase; ekspor/impor hanya data Albana aktif; ganti adapter data/login/media; cocokkan jumlah dan nominal; uji media tetap ada sesudah redeploy. Tahap ini harus selesai **sebelum QA final**, bukan sesudahnya.
3. **16 November — QA di stack target:** uji end to end pengunjung dan admin pada ponsel/desktop, kedua tema, keyboard, harga berubah, retry, DP/pelunasan, kode unik serentak, serta pemulihan media. Catat setiap hasil dan perbaiki P0/P1.
4. **17 November pagi — cutover bersyarat:** backup akhir, hentikan tulisan di sumber lama, impor delta, rekonsiliasi, alih domain, dan smoke test. Jika gerbang migrasi atau QA gagal, jangan alihkan domain; tetapkan tanggal baru berdasarkan sisa pekerjaan terukur.

## Gerbang no-go dan rollback

No-go berlaku bila route pendaftaran tidak menyimpan secara atomik; tagihan dapat terduplikasi/kode unik bentrok; data privat terbuka; login admin gagal; media hilang setelah redeploy; data migrasi tidak cocok; atau alur utama gagal pada QA. Rollback langsung ke sumber lama hanya aman sebelum stack baru menerima tulisan. Sesudah ada pendaftaran/pembayaran baru, rekonsiliasi delta wajib dilakukan sebelum berpindah kembali.
