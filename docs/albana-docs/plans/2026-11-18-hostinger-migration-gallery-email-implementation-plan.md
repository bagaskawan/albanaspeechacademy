# Rencana migrasi Hostinger, perbaikan galeri, dan pengiriman email Albana

**Proyek** Albana Speech Academy (`front/`)  
**Ditinjau** 18 November 2026  
**Status** Rencana implementasi. Pemeriksaan mencakup dokumen, kode lokal, dokumentasi penyedia, dan DNS publik.

## Ringkasan audit

| Temuan | Penyesuaian rencana |
| --- | --- |
| [Spesifikasi akun](../content/hostinger-spec.md) mencatat **Unlimited Web Hosting** berbasis shared hosting, PHP 8.3, dan SSH tidak aktif. Dokumentasi Hostinger mencantumkan **Node.js Web App terkelola** untuk Business/Unlimited. | Konfirmasi menu **Web App** di hPanel untuk paket aktif. Buktikan kompatibilitas proyek di staging sebelum memindahkan domain. |
| Aplikasi bergantung pada Next.js App Router, Supabase Auth, PostgreSQL, Storage, dan fungsi transaksi. | Pindahkan runtime terlebih dahulu bila staging lulus. Migrasi database, auth, dan storage tetap menjadi tahap tersendiri jika ada kebutuhan untuk melepas Supabase. |
| Direktori deployment dapat ditimpa saat redeploy. Lokasi, akses, dan backup disk persisten di akun belum terbukti. | Pertahankan bucket Supabase, termasuk bukti transfer privat. Jika storage kelak dipindah, buktikan izin, persistensi, dan pemulihannya di staging. |
| DNS publik yang diperiksa belum memperlihatkan MX dan SPF root. Query `_dmarc` mengembalikan nama tidak ada. | Verifikasi zona aktif dan status mailbox. Publikasikan record sesuai penyedia yang dipakai, lalu uji header dan penempatan pesan di mailbox tujuan. |
| Hero dan thumbnail jadwal memiliki fallback lintas galeri. Detail program belum menyaring `consent_at` pada query. | Perbaiki sumber data, filter, dan tie-breaker sebagai perubahan aplikasi yang bisa dirilis terpisah. |

## 1. Pengaturan dan migrasi Hostinger

### 1.1 Paket aktif dan keputusan deploy

Acuan akun adalah [hostinger-spec.md](../content/hostinger-spec.md) bertanggal 18 November 2026. Paket aktif tercatat sampai 4 November 2027, dengan LiteSpeed di Indonesia, 50 GB, 2 core, RAM 3 GB, 120 proses, 60 entry processes, 600.000 inode, hingga 150 database MariaDB, serta dukungan SSL, CDN, dan backup harian. PHP 8.3, File Manager, dan FTP tersedia untuk website yang kompatibel. SSH tercatat tidak aktif. Angka pemakaian di spesifikasi merupakan cuplikan saat pemeriksaan.

| Kondisi yang ditemukan di hPanel | Keputusan |
| --- | --- |
| **Websites → Create site → Web App** tersedia pada paket aktif dan preset **Next.js** bisa dipilih | Buat Web App staging pada hostname sementara atau subdomain staging. Hostinger mengelola proses Next.js. Paket tetap memiliki batas runtime shared hosting. |
| Menu Web App tidak tersedia, atau runtime gagal memenuhi uji staging | Pertahankan Next.js di Vercel dan arahkan domain ke sana hanya jika perubahan alamat situs memang disetujui. Mailbox dan zona DNS dapat tetap dikelola di Hostinger. |
| Kelak dibutuhkan Docker, root, worker selalu aktif, atau layanan lain di luar batas Web App | Evaluasi VPS sebagai proyek tersendiri beserta biaya, pemeliharaan, backup, dan prosedur pemulihan. |

Bagian Node.js dalam spesifikasi akun mencatat batas akses dan proses pada shared hosting. Opsi **Web App terkelola** perlu diverifikasi terpisah di hPanel. Dokumentasi Hostinger menyebut timeout 120 detik per request, batas proses yang dipakai bersama, serta ketiadaan dukungan worker selalu aktif dan WebSocket inbound. Website Next.js ini membutuhkan runtime untuk sesi admin, Server Actions, API pendaftaran, media, dan `after()`. Static export tidak memenuhi fungsi tersebut. [Deployment Web App](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/) · [Batas Node.js](https://www.hostinger.com/support/hostinger-node-js-limits-for-web-and-cloud-plans/) · [Next.js Static Exports](https://nextjs.org/docs/app/guides/static-exports).

### 1.2 Staging Web App

| Setelan | Nilai atau cara memeriksa |
| --- | --- |
| Sumber | Pilih branch/commit yang sudah ditinjau. Gunakan alur **Web App** dari Git atau ZIP sumber sesuai hPanel. |
| Root dan preset | Root `front` untuk deploy dari root repo, preset **Next.js**, Node.js **22.x** sebagai pilihan awal staging, dan npm sesuai `front/package-lock.json`. |
| Build dan start | Jalankan `npm run build` dan gunakan preset Next.js full-stack dengan start produksi `npm run start` jika kolom perintah tersedia. Periksa log build Linux dan status Sharp. |
| Supabase | Staging menggunakan proyek uji. Saat produksi, atur `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, dan variabel terkait sesuai [referensi lingkungan](../project/environment-setup.md). Verifikasi callback/reset Auth dan login admin pada hostname target. |
| Rahasia dan URL | Masukkan secret melalui **Environment variables**. Gunakan `SITE_URL` HTTPS yang sesuai lingkungan. Pertahankan `REGISTRATION_RECEIPT_SECRET` produksi secara aman saat pindah runtime agar tautan konfirmasi yang belum kedaluwarsa tetap valid. Build ulang jika `NEXT_PUBLIC_*` berubah. |
| SSL dan cache | Uji HTTPS dan redirect untuk apex/`www` bila keduanya digunakan. Jika CDN diaktifkan, periksa cache aset publik serta respons admin, konfirmasi, dan bukti bayar yang harus tetap privat. |

Dokumentasi Hostinger menyebut perubahan manual pada direktori aplikasi dapat hilang saat redeploy. Simpan konfigurasi di repo atau panel sesuai fungsinya dan simpan unggahan di Supabase Storage selama tahap ini. Simpan backup independen untuk data yang tetap berada di Supabase. [Deploy monorepo](https://www.hostinger.com/support/how-to-deploy-monorepos-with-npm-yarn-or-pnpm-on-hostinger/) · [Variabel lingkungan](https://www.hostinger.com/support/how-to-add-environment-variables-during-node-js-application-deployment/).

### 1.3 Pemeriksaan sebelum alih domain

- [ ] Uji landing page, artikel, detail program, login/reset admin, otorisasi CMS, dan akses bukti transfer hanya oleh admin.
- [ ] Uji pendaftaran, retry dengan kunci idempotensi yang sama, penguncian 30 menit, tagihan lunas/DP, pelunasan, dan pembayaran serentak. Uji `after()` dan kirim ulang admin di runtime target.
- [ ] Uji Sharp dengan unggahan gambar mendekati batas 10 MiB, serta MP4 siap unggah hingga 25 MiB sesuai aturan kode. Catat batas request dari hosting, puncak penggunaan resource, dan respons 413/503 jika ada. Gunakan YouTube atau video yang sudah diproses di luar shared hosting. [Audit rilis dan batas media](../project/2026-11-13-release-audit.md).
- [ ] Lakukan satu redeploy staging. Verifikasi unggahan lama dan baru, sesi admin, serta pengiriman email setelah deploy. Cek log runtime dan penggunaan resource hPanel.
- [ ] Ekspor/simpan zona DNS dan catat target serta TTL lama. Setelah staging lulus, ubah hanya record web apex/`www` sesuai target yang diberikan panel. Periksa konfigurasi IPv4/IPv6, HTTPS, dan host kanonik. Pertahankan MX, SPF, DKIM, DMARC serta record verifikasi yang sah.
- [ ] Selama pemantauan awal, pertahankan deployment Vercel yang bisa dipulihkan. Bila kedua runtime masih memakai data produksi yang sama, rollback web mengembalikan target DNS dan konfigurasi runtime sebelumnya. Uji kompatibilitas versi aplikasi terhadap skema yang sama sebelum cutover.

### 1.4 Jika Supabase juga harus dipindahkan

Tahap ini mencakup PostgreSQL, autentikasi, kontrol akses, dan penyimpanan. Ukur kebutuhan bisnis dan validasi kapasitas target sebelum menulis adapter. Versi MariaDB, batas koneksi, hak pengguna, dan mekanisme akses database harus diperiksa pada akun. PHP 8.3 atau keberadaan MariaDB saja belum memenuhi dependensi aplikasi Next.js.

- **Inventaris dan backup.** Ambil daftar tabel, fungsi, FK, grant/RLS, urutan ID, proyek Auth, bucket, dan akses publik/privat dari lingkungan sumber saat itu. Cocokkan dengan [skema repo](../data/database-schema.md) dan migrasi setelah dokumen tersebut. Sertakan `academy_intake_limits`, `academy_email_deliveries`, histori pembayaran, serta media lama. Hitung objek dan byte, termasuk ruang staging/backup dan inode bila memakai disk lokal.
- **Kontrak transaksi.** Gunakan migrasi PostgreSQL sebagai acuan perilaku. MariaDB memerlukan porting RPC, tipe data, constraint, dan akses dari CMS. Pertahankan urutan lock, idempotensi sebelum membuat tagihan baru, dan atomisitas pembayaran. [Migrasi pending lock](../../../front/supabase/migrations/20261118110000_registration_pending_lock.sql) memakai batas **20 percobaan per menit per `source_hash`** serta status `busy`. Pastikan percobaan yang diblokir tetap tercatat. Uji constraint kode unik per rekening, satu batch aktif per program, satu rekening aktif, saldo DP, dan konkurensi MySQL/MariaDB terhadap fixture yang sama.
- **Auth dan akses.** Buktikan mekanisme login/reset, pemetaan akun admin, sesi, dan izin baca/tulis sebelum mengganti Supabase Auth. Pindahkan pemeriksaan otorisasi dari RLS ke jalur server yang sesuai jika memakai MariaDB. Pastikan setiap route dan Server Action terkait tetap memeriksa izin. Jika memakai PostgreSQL di VPS, uji restore skema dan dependensi fungsi. PostgREST, Auth, Storage, dan RLS terkait identitas tetap memerlukan rencana layanan dan konfigurasi.
- **File.** Pertahankan pemisahan bucket dan izin publik/privat. Disk lokal baru layak setelah hak akses, lokasi di luar build, persistensi lintas redeploy, dan restore benar-benar terbukti. Bukti transfer tidak boleh disajikan oleh route/CDN publik. Jika memakai object storage, pilih layanan yang benar-benar tersedia dan uji biaya, URL, hak akses, dan pemulihannya. Uji media lama, penggantian/hapus objek, dan tautan lama.
- **Cutover.** Salin ke staging, verifikasi relasi dan ID, bandingkan jumlah baris, saldo, total rupiah per status/rekening, serta ukuran dan checksum sampel/objek penting. Setelah uji restore dan simulasi cutover lulus, hentikan penulisan pada sumber, salin delta, rekonsiliasi, lalu buka penulisan di target. Tentukan durasi cutover dari hasil latihan. Jika target sudah menerima pendaftaran atau pembayaran baru, sinkronkan dan rekonsiliasi perubahan sebelum rollback.

### 1.5 MCP dan hPanel

Gunakan hPanel sebagai jalur utama untuk memeriksa hak paket, konfigurasi Web App, mailbox, dan nilai record DNS. Hostinger Connector via OAuth di `https://mcp.hostinger.com` dapat membantu untuk operasi akun yang memang tersedia dan diotorisasi. Gunakan phpMyAdmin atau jalur akses MariaDB yang didukung jika fase database dijalankan. Hostinger MCP resmi tidak menyediakan akses SQL arbitrer. Remote MySQL, bila diperlukan, dibatasi ke IP dan akun database yang sesuai. Gunakan dashboard penyedia email untuk verifikasi domain serta log pengiriman. [Spesifikasi MCP akun](../content/hostinger-spec.md#16-penggunaan-mcp-pada-hostinger) · [Hostinger API MCP](https://github.com/hostinger/api-mcp-server).

## 2. Galeri beranda dan detail program

| Area | Sumber dan aturan |
| --- | --- |
| Hero, Cara Belajar, Tentang Kami | `gallery` lewat `readContentGallery()`, hanya foto dengan `consent_verified_at`. Hero mengambil foto pertama, kemudian `moments` mengecualikan foto Hero. |
| Kartu, galeri, dan thumbnail Jadwal Public Training | `media_assets` untuk slug program terkait dengan `published = true` dan `consent_at IS NOT NULL`. Bila belum ada foto, tampilkan keadaan kosong yang sudah tersedia. |
| Seksi dan detail Inhouse Training | `inhouse_gallery` dengan persetujuan, serta media yang secara eksplisit memiliki `program_slug = 'inhouse-training'` dan lolos filter publikasi/persetujuan. |

- [ ] Di [home-data.ts](../../../front/lib/server/home-data.ts), gunakan `contentGallery` sebagai sumber Hero. Pertahankan panggilan `buildMoments([], contentGallery, …)` yang sudah memakai galeri umum. Periksa regresi ketika galeri umum kosong dan galeri program berisi foto.
- [ ] Di [schedule-section.tsx](../../../front/components/home/schedule-section.tsx), hapus fallback `moments[4 + cardIndex]` dan bersihkan prop bila sudah tanpa pemanggil. Uji kartu tanpa media.
- [ ] Di [program-galleries.ts](../../../front/lib/server/program-galleries.ts) dan [program-showcase.ts](../../../front/lib/server/program-showcase.ts), batasi galeri ke slug publik yang dipakai aplikasi. Selaraskan filter persetujuan dan urutan `created_at.asc,id.asc` dengan urutan CMS. Tambahkan `id` sebagai tie-breaker pada editor galeri Program dan panel Inhouse. Query galeri umum/inhouse sudah mengurutkan berdasarkan ID unik. Query partner sudah memakai `sort_order,id`.
- [ ] Jika mengganti URL bertanda tangan dengan `/api/media/{id}`, uji kebenaran gambar, perilaku optimizer, jumlah redirect, serta waktu muat sebelum mengadopsinya untuk seluruh galeri. [Route media](../../../front/app/api/media/%5Bid%5D/route.ts) saat ini mengirim redirect 302 `no-store` ke URL bertanda tangan yang berlaku 60 detik, dengan fallback bucket lama. URL sumber yang stabil saja belum membuktikan cache CDN. Periksa perilaku saat foto diganti, ditarik persetujuannya, atau dipindah ke draf.
- [ ] Samakan sumber foto Inhouse pada beranda dan detail. Pertahankan tautan YouTube yang valid. Uji timestamp sama, aset privat, aset lama di bucket fallback, serta galeri kosong. Jalankan tes `home-derive`, `bento`, dan `bento-mosaic` dari `front/`.

## 3. Email tagihan yang lebih mudah diterima peserta

### 3.1 Temuan dari hPanel, DNS dan kode

Tangkapan layar menunjukkan pilihan **Klaim email gratis**, **Setup email**, dan **Mulai email marketing gratis**. Klaim email membuka penyiapan mailbox domain untuk komunikasi satu-satu. Email marketing mengarah ke Hostinger Reach untuk kampanye pelanggan yang opt-in. Screenshot menunjukkan penawaran di panel. Status mailbox, jumlah akun, masa trial, dan kuota aktual perlu dicek lewat **Emails → Mailboxes → View limits**. [Penyiapan mailbox](https://www.hostinger.com/support/1583217-how-to-create-and-manage-mailboxes-for-hostinger-email/) · [Batas Hostinger Mail](https://www.hostinger.com/support/4625828-parameters-and-limits-of-hostinger-email/) · [Hostinger Reach](https://www.hostinger.com/support/hostinger-reach-choosing-the-right-plan-and-setup-faqs-explained/).

Pada pemeriksaan DNS publik tanggal 18 November 2026, NS terjawab sebagai `aurora.dns-parking.com` dan `nebula.dns-parking.com`. Resolver tidak mengembalikan MX eksplisit atau TXT SPF untuk apex `albanaspeechacademy.com`, dan `_dmarc.albanaspeechacademy.com` mengembalikan NXDOMAIN. Selector DKIM dan konfigurasi privat hPanel belum diperiksa. Konfirmasi ulang terhadap zona yang aktif sebelum memasang record.

[mail-config.ts](../../../front/lib/mail-config.ts) sekarang memakai Gmail sebagai default SMTP dan membentuk alamat `From` dari `SMTP_USER`. `EMAIL_REPLY_TO` sudah didukung. Penyedia produksi yang sedang aktif dan penyebab pesan masuk spam belum dapat disimpulkan tanpa header pesan yang diterima dan log kirim. Alignment DMARC membandingkan domain `From` dengan domain SPF envelope sender atau domain penanda tangan DKIM. Domain pada tautan email memengaruhi pengalaman penerima, tetapi berada di luar perhitungan alignment DMARC. [Panduan pengirim Gmail](https://support.google.com/mail/answer/81126?hl=en).

### 3.2 Pilihan pengiriman

| Layanan | Cocok untuk | Konsekuensi implementasi |
| --- | --- | --- |
| **Hostinger Mail SMTP** | Pilihan tercepat bila penawaran mailbox aktif, volume rendah, dan pilot inbox lulus. | Buat `admin@albanaspeechacademy.com` sebagai mailbox yang dipantau. Aplikasi bisa mengirim dari mailbox tersebut dengan konfigurasi yang sudah ada. Jika ingin `notifikasi@`, siapkan mailbox pengirim sesuai kuota. Hostinger mencantumkan 100/hari per mailbox untuk Free/Trial. Cek paket, masa aktif, kuota dan lonjakan trafik di akun. [Batas Hostinger Mail](https://www.hostinger.com/support/4625828-parameters-and-limits-of-hostinger-email/) · [Ketentuan email transaksional](https://www.hostinger.com/support/1583510-is-mass-mailing-supported-at-hostinger/). |
| **Resend SMTP + Hostinger Mail** | Rekomendasi untuk tagihan otomatis bila Albana membutuhkan log pengiriman dan diagnosis bounce. | Verifikasi `notif.albanaspeechacademy.com`, pakai `notifikasi@notif.albanaspeechacademy.com` sebagai `From`, dan arahkan `Reply-To` ke `admin@albanaspeechacademy.com`. Free mencantumkan 100 email/hari dan 3.000/bulan, dengan shared IP. Adapter cukup memakai Nodemailer yang sudah ada setelah `EMAIL_FROM` didukung. [Domain Resend](https://resend.com/docs/dashboard/domains/introduction) · [SMTP](https://resend.com/docs/send-with-smtp) · [Harga dan batas](https://resend.com/pricing). |
| **Brevo** | Alternatif bila kebutuhan melebihi kuota harian Resend Free dan paket Brevo memenuhi kebutuhan. | Paket Free mencantumkan 300 pengiriman per hari dan mendukung email transaksional. Verifikasi domain dan uji ulang header serta penempatan pesan memakai konfigurasi Brevo. [Paket Brevo](https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans). |

Kuota dihitung dalam jumlah pesan. Satu pendaftaran dapat memicu instruksi pembayaran, hasil verifikasi, dan percobaan ulang. Hostinger Reach dipakai untuk newsletter/kampanye yang opt-in. Alur tagihan tetap memakai kanal transaksional.

### 3.3 DNS untuk mailbox Hostinger dan Resend

1. Buka **Emails → Mailboxes → Domain settings** setelah mengecek jenis layanan email. Buat mailbox admin dan salin nilai yang ditampilkan panel untuk domain ini. Cocokkan changeset dengan record email dan verifikasi yang sudah ada. Gunakan **Domains → DNS Zone** jika panel tersebut memang mengelola nameserver aktif.
2. Untuk Resend, tambahkan `notif.albanaspeechacademy.com` sebagai domain kirim tersendiri. Salin tipe, nama, nilai, dan prioritas dari dashboard Resend untuk domain serta region yang dipilih. Pada editor yang meminta nama relatif, masukkan nama relatif ke `albanaspeechacademy.com` agar zona tidak ditambahkan dua kali.
3. Tambahkan atau gabungkan SPF hanya pada **hostname yang sama**. Untuk skema di bawah, SPF Hostinger berada pada apex dan SPF Resend pada hostname Return-Path. Jangan memasukkan `include:amazonses.com` ke SPF apex hanya karena Resend memakai SES di hostname Return-Path.

| Fungsi | Lokasi contoh di zona Albana | Nilai yang diambil |
| --- | --- | --- |
| Terima balasan peserta | MX `@` | MX Hostinger Mail sesuai **Domain settings**, jika Hostinger dipilih untuk menerima email apex. |
| Otorisasi pengiriman mailbox | TXT SPF `@`, CNAME DKIM pada selector Hostinger | Record yang diberikan Hostinger. Satu SPF per hostname, dengan semua pengirim sah pada hostname itu dipertahankan. |
| Tanda tangan Resend | TXT DKIM pada selector Resend di bawah `notif` | Nama dan kunci utuh dari dashboard. |
| Return-Path Resend | MX dan TXT SPF pada hostname dari dashboard, biasanya `send.notif` | Target MX/priority serta TXT SPF dari dashboard. MX ini menangani bounce Resend. |
| Kebijakan DMARC | TXT `_dmarc` di apex. Kebijakan apex biasanya diwarisi subdomain jika tidak ada kebijakan subdomain tersendiri. | Jika belum ada kebijakan, mulai dari `v=DMARC1; p=none`. Tambahkan `rua` hanya setelah alamat laporan tersedia dan dipantau. Tinjau laporan hingga mencakup seluruh jalur kirim sah sebelum menerapkan `quarantine` atau `reject`. Pertahankan kebijakan yang sudah berlaku bila ditemukan. |

[DNS Hostinger Mail](https://www.hostinger.com/support/8671319-set-up-a-domain-for-hostinger-email-manually/) · [Domain Resend](https://resend.com/docs/dashboard/domains/introduction) · [Return-Path Resend](https://resend.com/changelog/custom-return-path) · [Panduan pengirim Gmail](https://support.google.com/mail/answer/81126?hl=en).

### 3.4 Konfigurasi aplikasi

**Pilot Hostinger Mail dengan kode saat ini**

```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=admin@albanaspeechacademy.com
SMTP_PASS=
EMAIL_REPLY_TO=admin@albanaspeechacademy.com
SITE_URL=https://albanaspeechacademy.com
```

Isi `SMTP_PASS` di panel runtime dengan password mailbox. Gunakan nilai ini bila hPanel menunjukkan layanan **Hostinger Mail**. Jika produk email berbeda, gunakan pengaturan yang diberikan untuk produk tersebut. Jalankan pilot dari runtime yang akan mengirim, karena koneksi SMTP keluar juga perlu dibuktikan. [Pengaturan SMTP Hostinger](https://support.hostinger.com/en/articles/1575756-how-to-get-email-account-configuration-details-for-hostinger-email).

**Resend SMTP setelah perubahan `EMAIL_FROM`**

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=
EMAIL_FROM=notifikasi@notif.albanaspeechacademy.com
EMAIL_REPLY_TO=admin@albanaspeechacademy.com
SITE_URL=https://albanaspeechacademy.com
```

- [ ] Tambahkan `EMAIL_FROM` ke `readMailConfig()` dan [.env.example](../../../front/.env.example). Validasi sebagai satu alamat kirim dengan nama tampilan Albana. Jika kosong, fallback hanya saat `SMTP_USER` merupakan alamat email yang valid. Dengan login SMTP seperti `resend`, `EMAIL_FROM` wajib diisi. Gunakan API key berizin kirim yang disimpan server-side. Pertahankan Nodemailer dan pengaturan `Reply-To` yang sudah ada.
- [ ] Pertahankan email instruksi, pembayaran diterima, dan pembayaran perlu diperiksa, berikut klaim unik `(invoice_id, kind)` dan kirim ulang admin. Status internal `sent` berarti SMTP menerima pesan. Gunakan log penyedia untuk menelusuri bounce, complaint, atau penundaan sebelum mengirim ulang ketika hasil percobaan sebelumnya meragukan. [Status pengiriman Resend](https://resend.com/guides/email/users-never-got-login-code).
- [ ] Jaga email HTML dan teks polos, subjek sesuai transaksi, serta identitas dan kontak Albana yang bisa diverifikasi. Gunakan tautan HTTPS langsung ke halaman konfirmasi. Matikan click/open tracking untuk email tagihan, khususnya karena tautan membawa token. Hindari promosi atau pemendek URL di pesan tagihan. `X-Entity-Ref-ID` berkaitan dengan threading Gmail dan tidak diperlukan untuk autentikasi. [SMTP Resend](https://resend.com/docs/send-with-smtp) · [Deliverability Insights](https://resend.com/blog/deliverability-insights).
- [ ] Gunakan `SITE_URL` sesuai situs yang benar-benar melayani tautan konfirmasi. Untuk staging, gunakan alamat dan data uji. Simpan rahasia SMTP dan kunci penandatangan di server. Hindari mencatat token konfirmasi dan alamat peserta dalam log.

### 3.5 Kriteria pilot sebelum produksi

1. Lihat status **Connected/Verified** pada penyedia dan periksa DNS dari resolver publik. Cek MX apex, TXT SPF di hostname yang dipakai, selector DKIM yang diberikan panel, TXT DMARC, serta MX/TXT Return-Path jika menggunakan Resend.
2. Dari runtime target, kirim email instruksi dan hasil pembayaran uji ke mailbox Gmail dan Outlook yang dikendalikan tim, serta Yahoo bila tersedia. Catat apakah pesan tampil di Inbox, kategori lain, atau Spam. Periksa *Show original* atau header mentah untuk `SPF=pass`, `DKIM=pass`, `DMARC=pass` dan domain yang selaras dengan `From`. Balas dari mailbox uji dan pastikan masuk ke mailbox admin.
3. Uji saat pengiriman gagal atau kuota tercapai. Pendaftaran dan akses ke checkout harus tetap berhasil. Verifikasi status di **Admin → Tagihan**, kirim ulang yang wajar, serta pantau bounce, complaint, dan penempatan pesan pada volume nyata. Bila Google Postmaster Tools menampilkan data, ikuti ambang complaint di bawah 0,3%. Autentikasi mengurangi risiko spam, sementara penempatan tetap ditentukan penyedia mailbox penerima. [Panduan pengirim Gmail](https://support.google.com/mail/answer/81126?hl=en) · [Praktik pengirim Yahoo](https://senders.yahooinc.com/best-practices/?is_listing=false).

## 4. Urutan pengerjaan

1. **Galeri.** Kerjakan di runtime dan data yang sudah ada. Verifikasi sumber, consent, tie-breaker, dan keadaan kosong.
2. **Email.** Verifikasi mailbox dan DNS, pilih SMTP, lalu lakukan pilot. Pekerjaan ini dapat berjalan saat aplikasi masih di Vercel. Tes dari `front/` dengan `node --test lib/mail-config.test.mjs lib/registration-email.test.mjs`.
3. **Web App staging.** Jika tersedia di paket aktif, uji Next.js dengan Supabase, termasuk build, upload, email, redeploy, dan rollback. Alihkan domain web hanya setelah gerbang staging lulus.
4. **Data, auth, dan storage.** Jalankan evaluasi §1.4 bila keputusan proyek tetap mencakup pemindahan Supabase. Cutover data memiliki gerbang rekonsiliasi dan rollback sendiri.

Rencana [pendaftaran dan checkout](2026-11-18-registration-checkout-email-implementation-plan.md) merekam konfigurasi awal Gmail SMTP. Gunakan bagian email di dokumen ini untuk tahap pengiriman dengan domain Albana.
