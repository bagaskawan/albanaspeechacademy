# Implementation plan verifikasi email dan QA pendaftaran tiga program

**Tanggal** 20 November 2026  
**Tujuan** Buktikan email tagihan masuk Inbox pada mailbox uji, lalu uji pendaftaran Public Speaking Series, Public Speaking for Speakers, dan Sertifikasi Professional Speakers by BNSP dari formulir hingga konfirmasi pembayaran.  
**Lingkungan** Next.js staging pada runtime yang akan dirilis dan proyek Supabase uji. Jika perpindahan ke Hostinger sedang berlangsung, gunakan Web App Hostinger melalui GitHub dengan root `front` dan hostname sementara.  
**Acuan** [Rencana migrasi Hostinger dan email](2026-11-18-hostinger-migration-gallery-email-implementation-plan.md), [spesifikasi paket Hostinger](../content/hostinger-spec.md), dan [kontrak pendaftaran](../registration/registration-contract.md). Nama kolom, respons API, dan perilaku tagihan di bawah mengikuti implementasi repo.

## Urutan dan batas pengujian

**Siapkan email → pilot Inbox tanpa submit formulir → QA tiga program → keputusan rilis.** Fase QA formulir hanya dimulai setelah pilot Gmail dan Outlook lulus. Siapkan konfigurasi staging dan fixture minimum yang dibutuhkan pilot saat menyiapkan email.

- Kirim email pendaftaran dan tagihan satu-per-satu lewat **Gmail SMTP** menggunakan akun `@gmail.com` gratis yang dikelola Albana. Nama tampilan pengirim adalah **Albana Speech Academy**. Gunakan jalur ini selama pilot dan QA membuktikan pesan sampai ke Inbox penerima.
- Gunakan akun admin QA, alamat email dan nomor WhatsApp yang dikendalikan tim, serta data pembayaran dummy. Batasi akses ke staging. Bukti transfer uji berupa PNG 800 × 600 px bertuliskan **QA — SIMULASI**. Semua pencatatan pembayaran dilakukan di staging.
- Catat commit deploy, hostname, project ref uji, penyedia kirim, dan tanggal uji. Cocokkan project ref dan kredensial backend sebelum membuat fixture. Ambil baseline tabel dan migrasi dari proyek uji yang disetujui. Periksa fungsi pendaftaran, fungsi tagihan, dan tabel `academy_email_deliveries` pada proyek itu. Riwayat lokal dan remote pernah berbeda, sehingga audit dulu sebelum menerapkan migrasi. [Referensi lingkungan](../project/environment-setup.md).
- Simpan rahasia di environment runtime. Catatan QA memakai ID pendaftaran, ID tagihan, jenis email, dan bukti yang sudah disamarkan. Tautan kuitansi mengandung token akses dan harus disunting dari log, tangkapan layar, serta tiket.

## Fase 1 — Siapkan akun Gmail pengirim

- [x] Gunakan akun `@gmail.com` khusus Albana yang bisa dikelola tim. Jika perlu membuat akun baru, buat akun Google gratis dan simpan akses pemulihannya pada pemilik akun yang ditunjuk. Pastikan mailbox menerima balasan dan pesan gagal kirim.
- [x] Aktifkan **Verifikasi 2 Langkah**, lalu buat **App Password** khusus SMTP staging. Gunakan App Password sebagai `SMTP_PASS` dan simpan di pengaturan environment runtime. Jika App Password tidak tersedia untuk akun yang dipilih, selesaikan akses akun pengirim sebelum melanjutkan pilot. [Panduan App Password Google](https://support.google.com/accounts/answer/185833?hl=en).
- [x] Perkirakan volume pada hari tersibuk, termasuk pesan hasil verifikasi, pelunasan, dan kirim ulang. Google mencantumkan batas umum 500 email per hari untuk Gmail pribadi. Tinjau juga galat pembatasan akun dan kestabilan SMTP pada runtime tujuan. [Batas pengiriman Gmail](https://support.google.com/mail/answer/22839?hl=en) · [Panduan Gmail SMTP Nodemailer](https://nodemailer.com/guides/using-gmail).

## Fase 2 — Konfigurasi Gmail SMTP dan buktikan email masuk Inbox

### 2.1 Siapkan SMTP di staging

- [x] Isi setelan melalui environment pada runtime staging, misalnya **Environment variables** di hPanel jika staging memakai Hostinger. Gunakan `REGISTRATION_RECEIPT_SECRET` khusus uji dan kredensial Supabase yang menunjuk proyek uji.
- [x] Gunakan [konfigurasi email](../../../front/lib/mail-config.ts) dan [mailer Nodemailer](../../../front/lib/server/mailer.ts) yang sudah ada. Aplikasi mengambil alamat `From` dari akun Gmail pada `SMTP_USER`. Autentikasi pengirim menggunakan `gmail.com`, sehingga tahap ini tidak memerlukan perubahan DNS `albanaspeechacademy.com`. [Contoh environment](../../../front/.env.example) · [Panduan Gmail SMTP Nodemailer](https://nodemailer.com/guides/using-gmail).

| Setelan | Nilai staging |
| --- | --- |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_SECURE` | `true` |
| `SMTP_USER` | Alamat lengkap akun `@gmail.com` yang dipilih |
| `SMTP_PASS` | App Password akun pengirim |
| `EMAIL_REPLY_TO` | Akun Gmail yang sama, atau mailbox tim yang dipantau |
| `SITE_URL` | URL HTTPS staging tanpa garis miring penutup |

- [x] Jalankan dari `front/` dan simpan hasilnya. Targetnya semua tes lulus serta pemeriksaan tipe selesai tanpa galat.

```powershell
node --test lib/mail-config.test.mjs lib/registration-email.test.mjs
npx tsc --noEmit
```

### 2.2 Pilot email dari runtime staging, sebelum QA formulir

- [x] Siapkan satu batch dan rekening dummy seperti di Fase 3.1. Buat dua fixture `QA PILOT` dari backend staging, satu untuk Gmail dan satu untuk Outlook, melalui RPC `receive_academy_registration`. Gunakan bentuk argumen RPC dari [API pendaftaran](../../../front/app/api/registrations/route.ts), termasuk `sourceHash` sintetis, `submissionHash`, dan UUID idempotensi berbeda per fixture. Simpan ID registrasi dan invoice yang dikembalikan. Buat satu baris `academy_email_deliveries` per tagihan dengan `kind=payment_instructions`, `status=failed`, dan `attempts=1` agar tombol **Kirim ulang** tampil dan memakai jalur email aplikasi yang sama. Gerbang ini bisa dijalankan tanpa membuka formulir.
- [ ] Dari **Admin → Tagihan → Detail → Kirim ulang**, kirim satu email instruksi ke akun Gmail penerima yang berbeda dari pengirim dan satu email ke Outlook. Catat `sent` dan `message_id` aplikasi, lalu buka pesan di **Inbox** kedua mailbox. Periksa Gmail **Tampilkan versi asli** dan header Outlook untuk `spf=pass`, `dkim=pass`, `dmarc=pass`, serta alignment domain `gmail.com` pada `From` dengan DKIM atau SPF. Catat folder dan kategori Inbox. Pesan yang masuk Spam/Junk, hilang, bounce, atau tiba melewati target dua menit gagal pada putaran ini. Gunakan mailbox tanpa filter khusus atau allowlist dan biarkan pesan di folder tempat pesan diterima. [Panduan pengirim Gmail](https://support.google.com/mail/answer/81126?hl=en).
- [ ] Cocokkan pengirim, `Reply-To`, identitas program dummy, rekening dummy, kode unik, dan nominal. Buka tautan pembayaran dan pastikan HTTPS mengarah ke checkout fixture yang benar di staging. Balas dari satu mailbox uji dan konfirmasi balasan diterima admin.
- [ ] Bila pilot gagal, cek App Password, koneksi TLS dari runtime staging, dan pemberitahuan keamanan Google. Jika SMTP menerima pesan tetapi pesan belum terlihat di Inbox, periksa header, pesan gagal kirim di akun pengirim, serta folder dan filter di mailbox tujuan. Uji ulang dengan fixture baru setelah perbaikan. Simpan bukti yang sudah disamarkan dan keputusan **LULUS** sebelum masuk Fase 3. Jika Gmail SMTP masih gagal memenuhi gerbang Inbox, tahan QA formulir dan rilis sampai jalur pengiriman berhasil diuji.

## Fase 3 — QA pendaftaran setelah pilot email lulus

### 3.1 Siapkan fixture katalog dan peserta

- [x] Di CMS staging, buat satu batch aktif dan terbuka untuk setiap program, dengan sesi pertama di masa depan dan zona waktu WIB. Gunakan tanggal **D+14** dari awal pengujian, pukul **08.30–12.00 WIB** untuk Series dan **08.30–18.00 WIB** untuk dua program lain. Jika memasukkan beberapa sesi Series, isi urutan sesi secara konsisten. Pastikan slug batch unik dan catat batch yang benar-benar dipilih frontend. Setel harga dan DP pada Program, serta satu rekening aktif berlabel **QA Bank / QA SIMULASI** dengan nomor fixture. Siapkan kanal WhatsApp dummy yang dikendalikan tim jika akan menguji CTA.
- [x] Setel harga khusus staging seperti tabel di bawah. Nilai ini fixture untuk mengecek perhitungan, tanpa mengacu pada harga di produksi. Biarkan paket nonaktif untuk uji program tunggal. Baru aktifkan tawaran Speaker + Sertifikasi di CMS ketika menguji paket. Untuk paket, setel harga **Rp2.600.000**, DP **20%**, dan pastikan kedua batch siap daftar.

| Rute | Jenis formulir | Batch staging | Harga fixture | Subtotal DP | Sisa pokok |
| --- | --- | --- | ---: | ---: | ---: |
| `/register/public-speaking-series` | `series` | `qa-series` | Rp1.200.000 | Rp240.000 | Rp960.000 |
| `/register/public-speaking-for-speakers` | `exclusive` | `qa-speakers` | Rp1.800.000 | Rp360.000 | Rp1.440.000 |
| `/register/sertifikasi-pembicara-profesional` | `bnsp` | `qa-sertifikasi` | Rp2.100.000 | Rp420.000 | Rp1.680.000 |

| Data dummy | Series | Speakers | Sertifikasi |
| --- | --- | --- | --- |
| Nama / panggilan | QA Nadia Pratama / Nadia | QA Raka Wibawa / Raka | QA Diah Kartika / Diah |
| Domisili / usia / gender | Kota Bandung / 22 / Perempuan | Kota Surabaya / 31 / Laki-laki | Kota Yogyakarta / 37 / Perempuan |
| Profesi / instansi | Pelajar atau mahasiswa / Kampus QA | Profesional mandiri / Studio QA | Lainnya, isi **Fasilitator pelatihan** / Komunitas QA |
| Pengalaman sebelumnya | Tidak pernah mengikuti pelatihan public speaking | Pernah mengikuti pelatihan speaker | Belum pernah mengikuti sertifikasi BNSP |
| Tujuan | Percaya diri menyampaikan presentasi kampus selama lima menit. | Menyusun materi dan mengelola sesi tanya jawab sebagai pembicara seminar. | Mempersiapkan asesmen kompetensi pembicara profesional. |
| Tantangan | Gugup saat membuka presentasi. | Menjaga interaksi ketika audiens pasif. | Pertanyaan ini tidak tampil untuk `bnsp`. |
| Sumber / kesediaan | Instagram / Ya | Teman atau Kerabat / Ya | Lainnya, isi **Komunitas QA** / Mungkin |

- [x] Pakai email yang benar-benar dapat menerima pesan dan nomor yang dikuasai tim. Buat pasangan email/WhatsApp berbeda untuk setiap percobaan yang harus sukses, termasuk lunas, DP, paket dan penolakan. Alias email dapat dipakai setelah pilot menunjukkan alias itu benar-benar masuk ke mailbox QA. Siapkan variasi nama berakhiran `SER-FULL`, `SER-DP`, `SPK-FULL`, `SPK-DP`, `BNSP-FULL`, atau `BNSP-DP`. Kosongkan sosial media opsional pada satu kasus, lalu isi satu handle sintetis pada kasus lain. Centang persetujuan data hanya saat kasus siap dikirim.

### 3.2 Jalankan enam alur utama

- [x] Lakukan **Lunas dan DP untuk ketiga program**. Sebarkan skenario antara Gmail dan Outlook, desktop dan ponsel. Masuk dari CTA program dan cek rute serta batch. Isi empat langkah, kembali satu langkah untuk memeriksa jawaban tetap ada, pilih metode pembayaran, centang persetujuan, lalu klik **Tinjau & kirim**. Cocokkan ringkasan modal. Uji **Cek Lagi** pada minimal satu kasus, lalu konfirmasi **Yakin**. Harus mendapat HTTP 200, diarahkan ke `/register/konfirmasi/[token]`, dan tercatat sekali di **Admin → Pendaftar** serta **Admin → Tagihan**. [Wizard](../../../front/components/register/registration-form.tsx) · [API pendaftaran](../../../front/app/api/registrations/route.ts).
- [x] Cocokkan subtotal, kode unik (1–999), total transfer, rekening dummy, program/batch, status `pending`, dan ID tagihan di checkout, admin, DB, dan email instruksi. **Total = subtotal + kode unik**. Kode tidak boleh bentrok antartagihan `pending` pada rekening sama. Pastikan email benar-benar terlihat di Inbox dalam dua menit dan tombol checkout membuka tagihan terkait.
- [x] Untuk semua jalur lunas, verifikasi nominal simulasi yang tepat di **Admin → Tagihan**. Tagihan menjadi `verified`, alur pendaftaran selesai, dan satu `payment_confirmed` masuk Inbox. Pastikan jadwal yang dicantumkan benar dan tidak ada tagihan `remaining`.
- [x] Untuk semua jalur DP, verifikasi total DP. Pastikan satu tagihan `remaining` dibuat dengan subtotal sisa pokok di tabel, kode unik baru terhadap DP, dan total pelunasan sesuai subtotal + kode unik. Email **DP diterima** masuk Inbox dan menunjukkan rincian pelunasan yang sama dengan checkout. Verifikasi pelunasan dan pastikan varian email **Pelunasan diterima** masuk Inbox. Jumlah tagihan tetap dua. [Perhitungan billing](../../../front/lib/billing.ts) · [Aksi tagihan](../../../front/app/%28admin%29/admin/tagihan/actions.ts).

### 3.3 Uji percabangan dan kegagalan

| ID | Skenario | Hasil lulus |
| --- | --- | --- |
| QA-R01 | Lewati satu kolom wajib, masukkan email/WA tidak valid, pilih Lainnya tanpa teks, atau biarkan consent kosong. Di BNSP lanjutkan tanpa tantangan. | Wizard menahan input yang salah dan tidak membuat registrasi/email. BNSP dapat lanjut karena tantangan memang tidak berlaku. |
| QA-R02 | Pada Series, cek tawaran paket tidak tampil dengan konfigurasi fixture. Aktifkan paket Speaker + Sertifikasi dan uji **terima** dari rute Speaker serta Sertifikasi dengan dua identitas berbeda. Pada salah satu rute ulangi pilihan **program ini saja** sebelum submit. | Jawaban tetap ada ketika ganti pilihan. Tambahan dari Speaker Rp800.000, dari Sertifikasi Rp500.000. Jika paket diterima, dua batch tercatat pada satu registrasi dengan satu tagihan awal dan email yang memuat kedua batch. Jika pilih program saja, biaya kembali ke harga program tunggal. Dengan batch pasangan ditutup, paket tidak ditawarkan. |
| QA-R03 | Saat tagihan awal masih pending, kirim ulang payload sah dengan `idempotencyKey` sama. Kemudian coba submit baru dari program lain dengan email atau WhatsApp sama. | Replay mengembalikan ID registrasi dan invoice yang sama, dengan satu email instruksi. Submit baru menghasilkan 423 dengan `Retry-After` dan tanpa tagihan kedua. Uji bahwa identitas bisa dipakai pada program lain setelah tagihan awal diselesaikan, dengan kunci idempotensi baru. |
| QA-R04 | Buka formulir, lalu ubah harga di CMS staging sebelum submit. Ulangi dengan batch ditutup setelah halaman dimuat. | API mengembalikan 409, UI meminta pembaruan pilihan, dan tidak ada data tagihan atau email baru. Pulihkan fixture sebelum kasus berikutnya. |
| QA-R05 | Catat pembayaran simulasi kurang dari total lewat detail tagihan. Cek lampiran bukti dari sesi admin dan tanpa sesi. Uji nominal salah dari backend staging lewat RPC `resolve_academy_invoice` dengan `received_idr < total_idr`. Tombol Konfirmasi saat ini mengirim total tagihan otomatis. | Selisih terlihat pada detail. RPC memberi `amount_mismatch`, tagihan tetap pending, dan email konfirmasi belum terkirim. Bukti transfer hanya dapat dibuka admin. Setelah nominal simulasi lengkap dan diverifikasi, satu konfirmasi diterima. |
| QA-R06 | Pada invoice awal dummy yang terpisah, panggil RPC `resolve_academy_invoice` dari backend staging dengan `decision=rejected` dan ID admin QA. Tampilan Tagihan saat ini tidak menyediakan tombol Tolak. Buat baris delivery `payment_rejected` berstatus `failed` seperti pilot, lalu klik **Kirim ulang** dari detail tagihan. | Checkout menunjukkan tagihan ditolak, satu email `payment_rejected` masuk Inbox, dan tidak ada tagihan pelunasan. Catat bahwa cabang penolakan diuji lewat backend dan jalur email aktualnya lewat tombol kirim ulang. |
| QA-R07 | Pada staging yang terisolasi, simulasikan SMTP gagal untuk satu registrasi baru. Pulihkan konfigurasi dan klik **Kirim ulang** dari invoice pending. | Pendaftaran tetap berhasil, aplikasi mencatat kegagalan, dan tombol kirim ulang menghasilkan satu email instruksi yang masuk Inbox. Percobaan kirim ulang setelah status `sent` tidak membuat email kedua. |
| QA-R08 | Ubah satu karakter token checkout secara lokal dan buka URL hasil perubahan. | Checkout menolak token tersebut tanpa menampilkan data peserta atau tagihan. |

Jalankan tes regresi dari `front/` sesudah ada perbaikan dan sebelum menandai hasil QA akhir.

```powershell
node --test lib/registration.test.mjs lib/registration-form.test.mjs lib/registration-input.test.mjs lib/academy-registration-input.test.mjs lib/registration-feedback.test.mjs lib/billing.test.mjs lib/billing-rows.test.mjs lib/receipt-token.test.mjs lib/mail-config.test.mjs lib/registration-email.test.mjs
npx tsc --noEmit
```

## Fase 4 — Bukti dan keputusan rilis

- [x] Simpan catatan per kasus berisi ID skenario, commit/runtime, program/batch, metode, ID registrasi, ID invoice, jenis email, status aplikasi, `message_id` yang sudah disamarkan, folder Inbox aktual, waktu kirim sampai diterima, hasil autentikasi, dan hasil akhir. Catat temuan bersama langkah reproduksi dan hasil uji ulang. Hindari data pribadi atau token di catatan.
- [ ] Nyatakan **siap rilis** setelah pilot Gmail dan Outlook lulus, keenam alur lunas/DP selesai, cabang aktif lulus, dan data checkout/DB/email cocok. Duplikasi, email Spam/Junk, invoice salah, atau kebocoran bukti pembayaran memblokir rilis. Jika runtime atau konfigurasi pengirim berubah menjelang rilis, ulangi pilot email di runtime baru sebelum smoke test pendaftaran.
- [x] Setelah bukti disimpan, bersihkan hanya fixture staging milik run tersebut melalui mekanisme admin atau prosedur proyek uji yang disetujui. Pulihkan harga dan status batch yang diubah untuk QA. Simpan konfigurasi pengirim staging yang lulus, keputusan rilis, dan daftar temuan yang perlu ditindaklanjuti.
