# Rate & Anggaran — Website Albana Speech Academy

|                     |                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| **Tanggal**         | 4 November 2026                                                                                  |
| **Cakupan dokumen** | Biaya infrastruktur (domain, hosting, storage, payment), rate jasa referensi, struktur penawaran |
| **Di luar cakupan** | Desain visual                                                                                    |

**Keterangan tingkat verifikasi harga**
- **[Resmi]** dibaca langsung dari halaman penyedia pada 4 November 2026
- **[Sekunder]** dari artikel, daftar perbandingan, atau cuplikan; perlu dicek ulang
- **[Belum]** tidak berhasil saya verifikasi

> Semua harga di bawah adalah **harga sebelum PPN**. Halaman domain DomaiNesia menyebut harga belum termasuk PPN 11%, dan kemungkinan penyedia lain serupa. Cek di halaman checkout. Harga promo dapat berubah kapan saja.

---

## 0. Jawaban Cepat

1. **Biaya infrastruktur tahun pertama** untuk web kelas dengan payment dan dashboard (skenario S2): **±Rp0,43–0,87 juta** (sudah termasuk PPN 11%), tergantung siklus langganan. Ini sejalan dengan perkiraan teman ("masih di bawah 1 juta, apalagi tahun pertama").
2. **Provider yang saya sarankan:** **DomaiNesia paket Nimbus Go** (harga perpanjangan sama dengan harga promo, mendukung Laravel/Node/SSH, domain .com gratis tahun pertama). **Alternatif:** Hostinger (pilihan teman) dengan catatan perpanjangan jauh lebih mahal.
3. **Storage bukan masalah** jika video ditaruh di YouTube dan foto dikompres. Paket 15 GB cukup untuk beberapa tahun dokumentasi foto.
4. **Payment gateway tidak punya biaya bulanan** (Midtrans menyebut tanpa biaya awal/integrasi), tetapi ada **potongan per transaksi**: kira-kira Rp3.000–17.000 per peserta, tergantung metode.
   **Mayar.id** (Bagian 5.5): tanpa biaya bulanan di paket Starter, tetapi ada **biaya platform 1,5–4%** di atas biaya channel, jadi lebih mahal per transaksi daripada gateway langsung. **Klien wajib verifikasi (KYC)**; untuk pemilik perorangan cukup KTP, selfie dengan KTP, dan bukti rekening (NPWP opsional).
5. **Rate jasa referensi teman:** landing/company Rp1,5–2 juta, paket payment+dashboard Rp3–5 juta (ia biasa menarik Rp3–4 juta), custom Rp5–10 juta. Untuk proyek portofolio ini, tampilkan sebagai **nilai proyek dengan potongan 100%**, sedangkan klien hanya membayar infrastruktur.

---

## 1. Masukan dari Chat Teman dan Dampaknya

| Poin dari chat | Artinya | Dampak ke anggaran |
|---|---|---|
| "Kaya Web Training Public Speaking", "kemungkinan BE sampai paymentnya" | Ada pendaftaran dan pembayaran online, bukan hanya halaman informasi | Naik ke kategori "paket 2" teman; hosting harus mendukung aplikasi dan database |
| "Dashboard, dll" | Ada panel admin (kelola peserta, jadwal, pembayaran) | Menambah jam kerja dan butuh hosting yang kuat |
| "Yang dipikirin malah di storage-nya, bakalan banyak dokumentasi" | Foto dan video kelas akan banyak | Perlu strategi storage (Bagian 4) |
| "FE-nya dulu gapapa, biar ada gambaran" | Presentasi awal dengan tampilan, belum sistem penuh | Fase 1 (FE) dibuat dulu; BE dan payment masuk fase berikutnya |
| LP company 1,5–2 jt (termasuk domain dan hosting) | Patokan harga paket paling sederhana | Dipakai sebagai batas bawah |
| Paket 2 (payment + dashboard) 3–5 jt termasuk hosting dan domain; ia biasa menarik 3–4 jt | Patokan paket menengah | Patokan nilai proyek ini |
| Custom 5–10 jt | Patokan sistem yang lebih besar | Batas atas jika fitur membesar |
| "Paket hosting + domain yang cukup masih under 1 jt, apalagi tahun pertama" | Estimasi infrastruktur | Terbukti sejalan (Bagian 6) |
| Provider yang biasa dipakai: Hostinger | Preferensi pribadi teman | Dibandingkan di Bagian 3 |
| Posisi Anda: sudah menetapkan biaya di luar jasa | Klien hanya membayar infrastruktur | Struktur penawaran di Bagian 8 |

---

## 2. Kebutuhan yang Menentukan Biaya

### 2.1 Tingkat dashboard (mohon dikonfirmasi ke klien)

| Level | Isi | Teknologi umum | Hosting yang cukup | Beban kerja |
|---|---|---|---|---|
| **L1: Admin dasar** | Admin melihat daftar pendaftar, mengubah jadwal dan kuota | WordPress + plugin, atau aplikasi kecil | Paket menengah | Rendah-sedang |
| **L2: Pendaftaran + pembayaran otomatis** | L1 + status bayar otomatis lewat payment gateway, notifikasi, ekspor data | Aplikasi sendiri (Laravel/Node) atau WordPress + WooCommerce | Paket yang mendukung PHP/Node, database, SSH | Sedang-tinggi |
| **L3: Akun peserta + materi** | L2 + login peserta, materi/rekaman, sertifikat otomatis | LMS atau aplikasi khusus | Paket besar atau cloud/VPS | Tinggi |

Dugaan dari chat teman: kebutuhan klien berada di **L2**.

### 2.2 Dampak setiap kebutuhan

| Kebutuhan | Pengaruh ke hosting | Pengaruh ke jasa |
|---|---|---|
| Halaman informasi (FE) | Paket kecil cukup | Dasar |
| Formulir pendaftaran | Database kecil | Kecil |
| Payment gateway | Harus HTTPS; aplikasi harus menerima notifikasi pembayaran (webhook) | Menambah jam kerja dan pengujian |
| Dashboard admin | Butuh database dan runtime aplikasi | Menambah jam kerja paling besar |
| Dokumentasi banyak | Storage dan bandwidth | Strategi unggah dan kompres |
| Email domain | Biasanya termasuk | Kecil |

---

## 3. Analisis Provider

### 3.1 Domain

| Penyedia | Harga yang ditemukan | Tingkat | Catatan |
|---|---|---|---|
| **DomaiNesia** | `.ID` mulai Rp9.900 per tahun (promo), domain murah mulai Rp68.000; **.com sekitar Rp139.000 tahun pertama, Rp209.000 perpanjangan** | .id: [Resmi]; .com: [Sekunder] | Tabel harga lengkap di situsnya dimuat lewat skrip sehingga tidak terbaca; cek langsung. Paket Nimbus Go/Plus memberi **domain .com gratis tahun pertama** (min. langganan 1 tahun) [Resmi]. Ada juga promo "beli 1 gratis 1" untuk domain kedua (.my.id/.biz.id/.web.id) |
| **Rumahweb** | .com ±Rp121.900 per tahun | [Sekunder] | Paket Small ke atas menyebut gratis domain |
| **IDCloudHost** | .com ±Rp185.000; .id ±Rp210.000 | [Sekunder] | |
| **Hostinger** | Domain gratis tahun pertama pada paket tertentu; perpanjangan .com sekitar **US$17–18 per tahun** | [Sekunder] | Dalam dolar, jadi ikut kurs |

Perkiraan: `.com` Rp120–210 ribu per tahun, `.id` Rp210–250 ribu per tahun (perpanjangan, bukan promo). Domain dengan harga promo sangat murah (misal .id Rp9.900) biasanya hanya tahun pertama.

### 3.2 Hosting (kelas yang relevan untuk web dengan aplikasi)

| Penyedia | Paket | Harga promo/bulan | Harga perpanjangan/bulan | Storage | Cocok untuk | Tingkat |
|---|---|---|---|---|---|---|
| **DomaiNesia** | Nimbus One | Rp18.000 (normal Rp30.000) | Rp18.000 | 2 GB NVMe | 1 situs sederhana, ±25 ribu pengunjung/bulan | [Resmi] |
| | **Nimbus Go** | **Rp32.000** (normal Rp65.000) | **Rp32.000** | 15 GB NVMe | Situs bisnis, toko online; Laravel, Node.js, Redis, SSH, unlimited database, domain .com gratis | [Resmi] |
| | Nimbus Plus | Rp59.000 (normal Rp120.000) | Rp59.000 | 25 GB NVMe | Trafik lebih tinggi, WooCommerce, Python/Mongo | [Resmi] |
| | Cloud Hosting | Rp112.500 (normal Rp225.000) | Rp112.500 | 40 GB, semi-dedicated | LMS/CRM/aplikasi lebih berat | [Resmi] |
| **Rumahweb** | Entry | Rp15.000 | tidak diverifikasi | 1 GB NVMe, 3 situs | Situs kecil | [Resmi: promo] |
| | Small | Rp17.900 | ±Rp50.000 (reguler) | unlimited NVMe* | Situs bisnis kecil | [Resmi/Sekunder] |
| | Medium | Rp29.900 | ±Rp90.000 (reguler) | unlimited NVMe* | Banyak situs, SSH | [Resmi/Sekunder] |
| | Large | Rp49.900 | ±Rp140.000 (reguler) | unlimited NVMe*, 2 core, 3 GB RAM, Node/Python | Aplikasi | [Resmi/Sekunder] |
| **Hostinger (Indonesia)** | Paket terkelola entry (50 situs, 50 GB NVMe, 3 GB RAM) | **Rp1.867.200 dibayar sekaligus untuk 48 bulan** (±Rp38.900/bln) | **Rp121.900** | 50 GB | WordPress/aplikasi web terkelola | [Resmi] |
| | Cloud Startup | Rp116.900 (langganan 48 bulan) | **Rp310.900** | cloud | Trafik tinggi | [Resmi] |
| **IDCloudHost** | Cloud Hosting Starter Pro → Entrepreneur Pro | Rp15.000 (1 GB) → Rp75.000 (7 GB) | tidak diverifikasi | 1–7 GB | Mulai kecil | [Sekunder] |
| **Dewaweb** | Starter | ±Rp40.000 | tidak diverifikasi | 5 GB | Bisnis dengan performa | [Sekunder] |

\*"Unlimited" pada shared hosting tetap dibatasi kebijakan pemakaian wajar.

**Catatan penting**
- **Niagahoster** dalam satu daftar pembanding disebut sudah tidak aktif dan dialihkan ke Hostinger [Sekunder]. Jadi pilihan teman (Hostinger) praktis merupakan penerus Niagahoster di Indonesia.
- **Harga promo bergantung pada siklus langganan.** Tautan beli DomaiNesia untuk paket promo memakai siklus 24 bulan; Hostinger mensyaratkan 48 bulan. Jadi uang yang harus disiapkan di awal lebih besar dari "harga per bulan".
- **Persentase kenaikan perpanjangan** Hostinger sangat tinggi (Rp38.900 menjadi Rp121.900 per bulan, sekitar 3 kali lipat). Ulasan pihak ketiga juga mencatat lonjakan 260–345% untuk paket sejenis [Sekunder].
- Harga paket 12 bulan DomaiNesia (tanpa promo siklus 24 bulan) dan paket Premium/Business Hostinger Indonesia tidak berhasil saya verifikasi [Belum].

### 3.3 Perbandingan 4 tahun (hosting + domain, sebelum PPN)

Asumsi: kebutuhan setara Nimbus Go; domain .com Rp209.000 per tahun (DomaiNesia), US$17–18 per tahun untuk Hostinger dengan kurs perkiraan Rp16.500 (kurs tidak diverifikasi); gratis domain tahun 1.

| Penyedia | Hitungan | Total 4 tahun | Per tahun rata-rata |
|---|---|---|---|
| **DomaiNesia Nimbus Go** | 32.000 × 48 = 1.536.000 + domain tahun 2–4: 3 × 209.000 = 627.000 | **±Rp2,16 juta** | ±Rp0,54 juta |
| **Hostinger paket terkelola 48 bulan** | 1.867.200 + domain tahun 2–4: 3 × (Rp280.500–297.000) = Rp841.500–891.000 | **±Rp2,71–2,76 juta** | ±Rp0,68 juta |
| **Rumahweb Medium** (jika perpanjangan mengikuti harga reguler, belum terverifikasi) | 29.900 × 12 = 358.800 + 90.000 × 36 = 3.240.000 + domain tahun 2–4: 3 × 121.900 = 365.700 | **±Rp3,96 juta** | ±Rp0,99 juta |

Setelah 4 tahun, Hostinger terkelola berpindah ke Rp121.900 per bulan (±Rp1,46 juta per tahun). Dalam hitungan ini DomaiNesia lebih murah dan lebih mudah diprediksi, selama harga perpanjangan tetap seperti yang tertulis.

### 3.4 Ringkasan keunggulan dan kekurangan

| Penyedia | Keunggulan | Kekurangan |
|---|---|---|
| **DomaiNesia** | Perpanjangan sama dengan promo, server Indonesia (Jakarta), support 24 jam, garansi 30 hari, domain gratis tahun 1, cPanel (mudah untuk klien non-teknis), Node/Laravel/SSH | Promo biasanya 24 bulan di muka; paket 2 GB (Nimbus One) terlalu kecil untuk dokumentasi banyak |
| **Hostinger** | Merek besar dan familier bagi teman Anda, panel hPanel, fitur terkelola dan AI | Harus komit 48 bulan untuk harga terbaik, perpanjangan ±3×, domain dalam dolar |
| **Rumahweb** | Harga promo sangat murah, banyak paket | Selisih harga reguler besar; perlu cek harga perpanjangan |
| **IDCloudHost** | Cloud, harga awal rendah | Storage kecil di paket murah |

### 3.5 Rekomendasi

- **Utama:** DomaiNesia **Nimbus Go** dengan domain .com atau .id.
- **Alternatif jika ingin mengikuti kebiasaan teman:** Hostinger, tetapi sampaikan ke klien bahwa perpanjangan jauh lebih mahal dan komitmen awal besar.
- **Hindari** paket 2 GB untuk proyek ini kecuali dokumentasi benar-benar dipindah ke luar server.
- **Daftarkan atas nama klien** (domain dan hosting), dengan Anda sebagai pengelola.

---

## 4. Storage untuk Dokumentasi

### 4.1 Perkiraan kebutuhan (asumsi, bukan data klien)

| Skenario | Hitungan | Perkiraan |
|---|---|---|
| Foto dikompres (±300 KB, format WebP), 40 foto per batch, 12 batch per tahun | 480 foto × 0,3 MB | **±145 MB per tahun** |
| Galeri akumulasi 3.000 foto dikompres | 3.000 × 0,3 MB | **±0,9 GB** |
| Foto asli tanpa kompres (±6 MB), 480 foto per tahun | 480 × 6 MB | **±2,9 GB per tahun** |
| Video kelas | Jika disimpan di server (±500 MB per video, 12 per tahun) | ±6 GB per tahun |
| Video di YouTube lalu disematkan | | **0 GB di hosting** |
| Data dashboard (peserta, pembayaran, jadwal) | Teks | <100 MB |

### 4.2 Strategi

1. **Video ke YouTube** (publik atau tidak terdaftar), lalu sematkan di web. Ini paling hemat storage dan bandwidth.
2. **Foto dikompres otomatis saat diunggah** (ubah ke WebP, ukuran maksimal ±1.600 px).
3. **Arsip foto/video asli** disimpan di Google Drive klien atau object storage, bukan di hosting. DomaiNesia menawarkan Object Storage berprotokol S3 mulai Rp800 per bulan [Resmi]; harga untuk kapasitas tertentu perlu dicek.
4. **Batasi unggahan** di dashboard (ukuran maksimal, jenis file).
5. **Pantau pemakaian disk** dan siapkan opsi upgrade paket (DomaiNesia menyebut upgrade dapat dilakukan lewat dashboard tanpa memindahkan data [Resmi]).

Kesimpulan: dengan strategi di atas, paket **15 GB (Nimbus Go)** lebih dari cukup untuk beberapa tahun; **2 GB (Nimbus One)** hanya cukup jika video dan arsip asli sepenuhnya di luar server.

---

## 5. Biaya Payment Gateway

Tidak ada biaya hosting khusus untuk payment, tetapi ada **potongan per transaksi**.

### 5.1 Tarif yang ditemukan

| Penyedia | Virtual Account | QRIS | Kartu kredit | Tingkat |
|---|---|---|---|---|
| **Xendit** | Rp4.000 per transaksi | 0,7% | 2,9% + Rp2.000 | [Sekunder, "diverifikasi Mei 2026"] |
| **Duitku** | Rp1.500–5.000 tergantung bank (Mandiri Rp4.000, BCA Rp5.000, lainnya Rp3.000) | tidak ditemukan | 2,9% + Rp2.500 | [Sekunder, halaman tanpa tanggal] |
| **Midtrans** | tidak diverifikasi | tidak diverifikasi | tidak diverifikasi | **Tanpa biaya awal atau integrasi** [Resmi] |

### 5.2 Perubahan tarif QRIS (berlaku 1 Oktober 2026)
Untuk sektor pendidikan, MDR QRIS ditetapkan **0% untuk transaksi sampai Rp100 ribu dan 0,6% di atasnya** [Sekunder, laporan Metro TV]. Bank Indonesia juga memperluas MDR 0% hingga Rp100 ribu untuk semua kategori merchant. MDR tidak boleh dibebankan ke konsumen. **Belum dipastikan** apakah akademi ini terklasifikasi sebagai sektor pendidikan dan berapa biaya tambahan dari penyedia jasa pembayaran.

### 5.3 Contoh hitung per peserta (harga kelas hanya contoh, bukan data klien)

| Harga kelas contoh | VA Rp4.000 | QRIS 0,7% | QRIS 0,6% | Kartu 2,9% + Rp2.000 |
|---|---|---|---|---|
| Rp500.000 | Rp4.000 (0,8%) | Rp3.500 | Rp3.000 | Rp16.500 |
| Rp1.000.000 | Rp4.000 (0,4%) | Rp7.000 | Rp6.000 | Rp31.000 |

Contoh 15 peserta per batch dengan VA dan harga Rp500.000: potongan ±Rp60.000 per batch.

### 5.4 Opsi
- **Otomatis (payment gateway):** status bayar masuk dashboard sendiri; ada potongan per transaksi dan perlu verifikasi merchant (dokumen usaha).
- **Manual (transfer dan konfirmasi WhatsApp/unggah bukti):** tanpa potongan, tetapi admin memeriksa satu per satu. Bisa dipakai di fase awal dan diganti gateway di fase berikutnya.

### 5.5 Analisis Mayar.id

**Apa itu Mayar.** Platform commerce lokal (PT Mayar Kernel Supernova, berkantor di Bandung, terdaftar PSE Kominfo). Mayar menyebut dirinya **bukan bank dan bukan payment gateway sendiri**; pembayaran diproses lewat mitra penyedia jasa pembayaran berlisensi. Fiturnya mencakup halaman produk dan checkout, payment link, invoice, pengingat pembayaran, landing page, portal pelanggan, ekspor data CSV, notifikasi WhatsApp/Telegram, pelacakan Meta Pixel/UTM, serta API, webhook, dan headless API. Jenis produk yang didukung termasuk **event, webinar, coaching, bootcamp, membership, dan kelas online** [Resmi: mayar.id/pricing dan mayar.id/faq].

> Fitur di halaman harga ditampilkan per paket, tetapi centang ketersediaannya tidak terbaca otomatis. **Ketersediaan webhook, headless API, custom domain, dan WhatsApp per paket (Starter/Business) belum terverifikasi.** Tanyakan ke Mayar sebelum merancang integrasi.

#### a. Biaya

| Paket | Biaya bulanan |
|---|---|
| Starter | Rp0 |
| Business | Rp349.000 |
| Enterprise | Hubungi Mayar |

**Biaya platform (per jenis produk)** [Resmi]

| Jenis produk | Starter | Business |
|---|---|---|
| Link Pembayaran, Invoicing, PayMe, Pay Request | 1,5% | 1% |
| Produk fisik, Webinar, **Event**, **Coaching**, **Bootcamp** | 3% | 2% |
| Digital, e-book, podcast, audiobook, software | 4% | 3% |
| Galang dana, **Kelas Online**, Membership, SaaS | 4% | 3% |

**Biaya channel (pemrosesan)** [Resmi]

| Channel | Biaya |
|---|---|
| QRIS | 0,7% |
| Virtual Account (transfer bank) | Rp4.000 |
| E-wallet | 1,5% (Jenius dan GoPay 2%) |
| Kartu kredit | 2,6% + Rp2.000 |
| Minimarket (Alfamart/Indomaret) | Rp5.000–7.500 |
| PayLater (Akulaku) | 1,7% |

**Lain-lain**
- Biaya channel **belum termasuk pajak**.
- Biaya penarikan saldo **Rp2.775** per penarikan; tidak ada minimum pencairan [Resmi, docs.mayar.id/mor/fees dan mayar.id/pricing].
- Biaya platform dan biaya channel **bisa dibebankan ke pembeli** (jumlah transaksi tetap utuh, biaya ditambahkan ke total bayar pembeli).
- **Waktu settlement:** Virtual Account real-time; QRIS dan e-wallet H+3 hari kerja; kartu kredit dan minimarket H+5 hari kerja [Resmi, mayar.id/faq].
- Tarif QRIS 0,7% di Mayar belum terlihat disesuaikan dengan skema MDR baru 1 Oktober 2026 (pendidikan 0% sampai Rp100 ribu, 0,6% di atasnya). **Perlu ditanyakan** apakah berlaku untuk akun akademi.

#### b. Contoh hitung per peserta (harga kelas contoh Rp500.000, bukan data klien)

| Skema | Biaya platform | Biaya channel | Total | Persentase |
|---|---|---|---|---|
| Mayar, **Link Pembayaran** (1,5%), bayar VA | Rp7.500 | Rp4.000 | **Rp11.500** | 2,3% |
| Mayar, Link Pembayaran, bayar QRIS | Rp7.500 | Rp3.500 | **Rp11.000** | 2,2% |
| Mayar, **Event/Bootcamp/Coaching** (3%), bayar VA | Rp15.000 | Rp4.000 | **Rp19.000** | 3,8% |
| Mayar, Event/Bootcamp/Coaching, bayar QRIS | Rp15.000 | Rp3.500 | **Rp18.500** | 3,7% |
| Mayar, **Kelas Online** (4%), bayar VA | Rp20.000 | Rp4.000 | **Rp24.000** | 4,8% |
| Gateway langsung (Xendit, VA) | tidak ada | Rp4.000 | **Rp4.000** | 0,8% |

Semua angka sebelum pajak. Jenis produk yang dipakai menentukan biaya platform; **apakah kelas tatap muka boleh didaftarkan sebagai "Link Pembayaran" atau harus "Event/Bootcamp" perlu dikonfirmasi** ke Mayar (kebijakan klasifikasi tidak saya temukan).

#### c. Contoh hitung per tahun (asumsi: 12 batch × 15 peserta × Rp500.000 = Rp90 juta, semua lewat VA)

| Skema | Hitungan | Total per tahun |
|---|---|---|
| Mayar Starter, Event (3%) | 3% × 90.000.000 = 2.700.000 + 180 × 4.000 = 720.000 | **±Rp3,42 juta** |
| Mayar Starter, Link Pembayaran (1,5%) | 1.350.000 + 720.000 | **±Rp2,07 juta** |
| Mayar Business, Event (2%) | 1.800.000 + 720.000 + 12 × 349.000 = 4.188.000 | **±Rp6,71 juta** |
| Gateway langsung (VA Rp4.000) | 180 × 4.000 | **±Rp0,72 juta** (+ biaya pembuatan) |

Biaya penarikan (12 kali × Rp2.775 = ±Rp33 ribu) dan pajak belum dihitung.

**Poin penting**
- **Business (Rp349 ribu per bulan) hanya hemat jika omzet melewati ±Rp34,9 juta per bulan** untuk produk 3%/2% (selisih 1% × omzet harus lebih besar dari Rp349.000). Di skala contoh (Rp7,5 juta per bulan), Starter jauh lebih murah.
- Selisih Mayar (Event) dibanding gateway langsung ±Rp2,7 juta per tahun. Dibandingkan nilai jasa pembuatan backend payment sekali bayar (Rp3–4 juta, Bagian 7), **titik impasnya sekitar 1,1–1,5 tahun** (belum menghitung perawatan kode). Setelah itu gateway langsung lebih murah, bila volume tetap.
- Dengan Mayar, **sebagian beban backend dan dashboard hilang** karena Mayar sudah punya halaman checkout, daftar order, invoice, dan ekspor data. Jam kerja backend berkurang, tetapi besarnya bergantung pada apakah dashboard sendiri tetap dibuat.

#### d. Apakah klien perlu verifikasi? **Ya, wajib.**

Dokumentasi Mayar menyatakan verifikasi bisnis (KYC) adalah langkah penting menyiapkan akun, dan **halaman checkout baru bisa diakses setelah verifikasi disetujui** [Resmi, docs.mayar.id/businessverify]. Pendaftaran akun sendiri gratis dan bisa memakai Google Sign-in, tetapi menerima pembayaran membutuhkan verifikasi.

**Lima jenis verifikasi:** Individual, Business (firma/CV), Foundation (yayasan), PT, dan PT Perorangan.

| Jenis | Cocok jika | Dokumen |
|---|---|---|
| **Individual** | Usaha perorangan tanpa badan hukum | **KTP, selfie dengan KTP, NPWP (opsional), halaman depan buku tabungan atau tangkapan layar yang menampilkan nama dan nomor rekening.** Data isian: nama sesuai KTP, nomor KTP, nama bisnis, deskripsi bisnis (sertakan media sosial atau situs), alamat bisnis, situs web |
| Business (firma/CV) | Sudah berbentuk CV atau firma | KTP penanggung jawab, selfie dengan KTP, akta, SK Kemenkumham, TDP, NIB, SIUP, NPWP perusahaan, bukti rekening |
| PT | Sudah berbentuk PT | KTP pemilik atau direktur, NPWP perusahaan, NIB, akta pengangkatan direksi terakhir, SK Kemenkumham pengangkatan direksi, bukti rekening (izin industri opsional) |
| PT Perorangan | PT satu pemilik | KTP, NPWP, NIB, surat pernyataan pendirian, sertifikat pendaftaran, bukti rekening |
| Yayasan | Lembaga nirlaba | KTP pengurus, akta yayasan, SK Kemenkumham, TDY, NPWP yayasan, bukti rekening |

**Status verifikasi:** Pending (sedang ditinjau), Revision Required (ada yang perlu dilengkapi, info dikirim lewat email), Verified (selesai, dapat dipakai penuh), Rejected (ditolak, bisa diajukan ulang atau menghubungi dukungan).

**Untuk akademi ini:** jika Albana Speech Academy belum berbadan hukum, **Individual adalah jalur paling ringan**: cukup KTP pemilik, selfie dengan KTP, dan bukti rekening. Jika sudah berbentuk CV/PT/yayasan, gunakan jenis yang sesuai. Jenis ini perlu dikonfirmasi ke klien.

**Siapa yang harus mengurus:** **klien (pemilik usaha) sendiri**, bukan pembuat web. Alasannya: dokumen identitas dan selfie bersifat pribadi, dana masuk ke rekening klien, dan tanggung jawab hukum ada pada pemilik akun. Pembuat web cukup mendampingi (misalnya membagikan panduan dan memeriksa kelengkapan) tanpa memegang KTP atau selfie klien.

**Belum diketahui (tidak disebutkan di dokumentasi yang saya baca):** lama waktu proses verifikasi, apakah nama pemilik rekening harus sama dengan nama di KTP, dan batas pencairan sebelum atau sesudah verifikasi penuh. Tanyakan ke Mayar atau cek langsung saat mendaftar.

**Catatan pembanding:** untuk gateway langsung (Midtrans, Xendit), dokumen verifikasi umumnya lebih berat dan sering meminta dokumen usaha, tetapi **saya belum memverifikasi persyaratan resminya**. Jika klien belum punya badan usaha, itu bisa menjadi keunggulan Mayar.

#### e. Pro dan kontra untuk proyek ini

| Pro | Kontra |
|---|---|
| Tanpa coding; bisa aktif cepat | Biaya platform 1,5–4% di atas biaya channel, jauh lebih mahal daripada gateway langsung pada volume besar |
| KYC perorangan ringan | Tampilan checkout mengikuti template Mayar; kustomisasi dan branding terbatas |
| Sudah ada invoice, pengingat bayar, portal pelanggan, ekspor data, notifikasi WhatsApp | Data pendaftar tersimpan di Mayar; sinkron ke dashboard sendiri perlu webhook/API |
| Mendukung event, bootcamp, coaching, kelas online | QRIS dan e-wallet cair H+3 hari kerja; ada biaya tarik Rp2.775 |
| Perusahaan lokal di Bandung, dokumentasi API tersedia | Ketergantungan pada satu platform; ketersediaan fitur per paket belum jelas |

#### f. Opsi integrasi dengan web ini

| Opsi | Cara kerja | Beban backend | Cocok untuk |
|---|---|---|---|
| **A. Mayar penuh** | Tombol "Daftar" di web menuju halaman produk/payment link Mayar; admin memakai dashboard Mayar | Sangat rendah | Fase awal, volume kecil, mengejar waktu |
| **B. Hybrid** | Web sendiri + API/webhook Mayar untuk menyinkronkan data peserta dan status bayar ke dashboard sendiri | Sedang | Butuh dashboard sendiri tetapi tidak mau mengurus payment |
| **C. Gateway langsung** | Web dan dashboard sendiri terhubung ke Midtrans/Xendit/Duitku | Tinggi | Volume tinggi atau butuh kontrol penuh |

**Rekomendasi:** mulai dari **Opsi A dengan Mayar Starter** pada fase payment, karena paling cepat, hemat jam kerja, dan KYC ringan. Evaluasi pindah ke B atau C jika omzet melewati ±Rp35 juta per bulan atau butuh checkout kustom penuh. Pastikan **struktur data peserta bisa diekspor** (CSV) agar migrasi kelak mudah.

---

## 6. Skenario Anggaran Infrastruktur (dibayar klien)

Rumus dan asumsi dituliskan agar bisa dihitung ulang. Angka sudah memakai **PPN 11%** pada kolom "dengan PPN".

| | **S1: Landing / info** | **S2: Kelas + payment + dashboard (rekomendasi)** | **S3: Pertumbuhan (LMS/trafik tinggi)** |
|---|---|---|---|
| Paket | DomaiNesia Nimbus One | DomaiNesia **Nimbus Go** | Nimbus Plus atau Cloud Hosting |
| Hosting per bulan (promo) | Rp18.000 | Rp32.000 | Rp59.000 / Rp112.500 |
| Domain tahun 1 | .com promo Rp139.000 | .com **gratis** | .com gratis (Plus) / .cloud gratis (Cloud) |
| **Tahun 1, sebelum PPN** | 18.000 × 12 + 139.000 = **Rp355.000** | 32.000 × 12 = **Rp384.000** | 59.000 × 12 = Rp708.000 / 112.500 × 12 = Rp1.350.000 |
| **Tahun 1, dengan PPN** | **±Rp0,39 juta** | **±Rp0,43 juta** | **±Rp0,79 juta / ±Rp1,50 juta** |
| Tahun 1 jika siklus 12 bulan tanpa promo (batas atas, harga normal) | n.a. | 65.000 × 12 = Rp780.000, dengan PPN **±Rp0,87 juta** | 120.000 × 12 = Rp1.440.000, dengan PPN ±Rp1,60 juta (Plus) |
| Uang awal jika siklus 24 bulan | | 32.000 × 24 = Rp768.000, dengan PPN **±Rp0,85 juta** | |
| **Tahun 2 (hosting + perpanjangan .com Rp209.000), dengan PPN** | ±Rp0,47 juta | **±Rp0,66 juta** | ±Rp1,02 juta (Plus) |
| Tambahan opsional | Email hosting Rp3.500 per bulan jika perlu lebih dari paket | Object storage dari Rp800 per bulan | |
| Biaya variabel | Tidak ada | Potongan payment (Bagian 5) | Potongan payment |

**Yang tidak tercakup:** iklan, plugin/tema berbayar, foto stok, lisensi font, perawatan oleh pihak ketiga.

**Kesimpulan:** S2 untuk tahun pertama berkisar **Rp0,43–0,87 juta** (sudah PPN), yaitu bergantung pada apakah harga promo siklus 24 bulan bisa dipakai. Ini konsisten dengan perkiraan teman Anda (di bawah Rp1 juta).

---

## 7. Rate Jasa (Referensi)

### 7.1 Patokan dari teman
| Paket | Isi (kutipan teman) | Harga (sudah termasuk domain + hosting) | Setelah dikurangi infrastruktur (perkiraan saya) |
|---|---|---|---|
| Paket 1 | LP/company profile | Rp1,5–2 juta | ±Rp1,0–1,6 juta |
| **Paket 2** | **Ada payment, dashboard, dll** | **Rp3–5 juta** (ia biasa menarik Rp3–4 juta) | **±Rp2,1–4,6 juta** |
| Custom | Sistem lebih besar | Rp5–10 juta | ±Rp3,5–9,2 juta |

Pengurangan memakai biaya infrastruktur dari Bagian 6 (S1 Rp0,39–0,47 juta, S2 Rp0,43–0,87 juta, S3 Rp0,79–1,5 juta).

### 7.2 Pembanding pasar
Artikel vendor lokal menyebut kisaran company profile 5–10 halaman Rp8–25 juta dan landing page Rp3–8 juta (sumber: next-it.co.id, dibahas di percakapan sebelumnya) [Sekunder]. Patokan teman berada **di bawah** kisaran tersebut, wajar untuk freelancer dan pasar kenalan.

### 7.3 Uji kewajaran per jam
Perkiraan jam kerja (asumsi saya, bukan data klien): FE ±85–115 jam (dari brief) + backend, payment, dan dashboard ±40–70 jam = **±125–185 jam**.
- Rp3.000.000 ÷ 185 jam ≈ **Rp16 ribu per jam**
- Rp4.000.000 ÷ 125 jam ≈ **Rp32 ribu per jam**

Patokan teman setara **Rp16–32 ribu per jam**. Untuk proyek portofolio tidak masalah, tetapi jangan dijadikan patokan tarif jangka panjang.

**Catatan:** jika payment memakai Mayar (Bagian 5.5, Opsi A), sebagian jam backend dan dashboard berkurang karena checkout dan daftar order sudah disediakan Mayar. Nilai proyek dan rate perlu dihitung ulang sesuai opsi integrasi yang dipilih.

### 7.4 Untuk proyek ini
- **Nilai proyek (referensi): Rp3–4 juta** untuk paket payment + dashboard, ditulis di surat kesepakatan.
- **Potongan program portofolio:** 100% (jasa Rp0), dengan imbal balik: izin tampil, testimoni, data hasil, kredit di footer.
- **Opsi jika ingin lebih adil:** tarif simbolis 30–50% (±Rp0,9–2 juta) atau pertukaran jasa (misalnya kelas gratis untuk tim).
- Hitung ulang dengan tarif Anda sendiri: **jam × tarif per jam + cadangan 15%**.

---

## 8. Usulan Struktur Penawaran ke Klien

| | **Paket Kelas** | **Paket Kelas + Pembayaran (rekomendasi)** | **Paket Sistem Penuh** |
|---|---|---|---|
| Isi | Web informasi, jadwal, formulir ke WhatsApp | + pendaftaran, pembayaran, dashboard admin (L2) | + akun peserta, materi, sertifikat (L3) |
| Infrastruktur klien, tahun 1 | ±Rp0,4 juta | **±Rp0,43–0,87 juta** | ±Rp0,8–1,5 juta |
| Nilai jasa (referensi) | Rp1,0–1,6 juta | **Rp3–4 juta** | Rp5–10 juta |
| Jasa untuk klien | Potongan portofolio | **Potongan portofolio** | Dibicarakan terpisah |
| Biaya variabel | — | Potongan payment per transaksi | Sama |

**Fase yang disarankan (sesuai chat: FE dulu)**
1. **Fase 1: Front-end dan formulir sederhana.** Memberi gambaran ke klien; biaya infrastruktur minimal.
2. **Fase 2: Dashboard dan payment** setelah kebutuhan dan alur disetujui.
3. **Fase 3: Fitur lanjutan** (akun peserta, sertifikat, kelas online) sebagai add-on terpisah.

**Biaya tetap yang perlu dijelaskan jelas ke klien**
- Domain dan hosting dibayar dan **diperpanjang oleh klien** (atas nama klien), dengan tanggal jatuh tempo dicatat.
- Perawatan setelah peluncuran (update jadwal, backup, perbaikan): gratis terbatas atau berbayar, **ditentukan sebelum mulai**.
- Potongan payment gateway ditanggung merchant (klien).

---

## 9. Checklist

### 9.1 Pertanyaan ke klien (khusus anggaran dan teknis)
- [ ] Apa tingkat dashboard yang dimau: L1, L2, atau L3 (Bagian 2.1)?
- [ ] Harga kelas dan perkiraan peserta per batch, jumlah batch per bulan?
- [ ] Metode bayar yang diinginkan: transfer manual, virtual account, QRIS, kartu, e-wallet?
- [ ] Sudah punya badan usaha/rekening usaha untuk verifikasi payment gateway?
- [ ] **Bentuk usaha akademi:** perorangan, CV, PT, atau yayasan? (menentukan jenis verifikasi Mayar)
- [ ] Siapa pemilik akun dan rekening penerima dana? Nama di KTP dan nama rekening sama?
- [ ] Pemilik bersedia melakukan verifikasi sendiri (KTP, selfie dengan KTP, bukti rekening, NPWP jika ada)?
- [ ] Setuju memakai Mayar untuk fase awal, atau lebih suka gateway langsung?
- [ ] Biaya platform dan channel ditanggung akademi atau dibebankan ke peserta?
- [ ] Siapa yang menanggung potongan transaksi?
- [ ] Rencana jumlah dokumentasi: berapa foto/video per bulan, perlu semua di web atau cukup pilihan terbaik?
- [ ] Apakah video ditaruh di YouTube?
- [ ] Domain yang diinginkan: .com atau .id? Sudah punya domain/hosting/email?
- [ ] Siapa pemegang akun dan pembayar domain/hosting?
- [ ] Apakah klien siap membayar infrastruktur ±Rp0,4–0,9 juta untuk tahun pertama dan perpanjangan tiap tahun?
- [ ] Siapa admin yang mengelola dashboard sehari-hari?
- [ ] Target waktu peluncuran FE dan sistem penuh?
- [ ] Setuju skema: jasa tanpa biaya (portofolio) dengan imbal balik di Bagian 7.4?
- [ ] Perawatan setelah peluncuran: apakah ingin ditawarkan opsi berbayar?

### 9.2 Keputusan yang harus diambil
- [ ] Provider: DomaiNesia (rekomendasi) atau Hostinger?
- [ ] Paket: Nimbus Go (rekomendasi) atau lainnya?
- [ ] Domain: .com atau .id; cek ketersediaan nama (belum saya cek)
- [ ] Siklus langganan: 12 atau 24 bulan (cek harga di checkout)
- [ ] Payment: gateway otomatis atau manual dulu
- [ ] Penyedia payment: **Mayar (Opsi A/B)**, atau Midtrans/Xendit/Duitku (Opsi C); cek tarif resmi
- [ ] Jika Mayar: jenis produk yang dipakai (Link Pembayaran, Event, Bootcamp, atau Kelas Online) dan paket (Starter atau Business)
- [ ] Teknologi: WordPress + plugin atau aplikasi sendiri (Laravel/Node)

### 9.3 Yang perlu diverifikasi ulang sebelum membayar
- [ ] Harga per siklus di halaman checkout (termasuk PPN)
- [ ] Harga perpanjangan domain .com dan .id di penyedia yang dipilih
- [ ] Syarat domain gratis dan siklus minimum
- [ ] Tarif resmi payment gateway pilihan, serta klasifikasi QRIS pendidikan
- [ ] Mayar: lama proses verifikasi, syarat kesesuaian nama rekening dan KTP, serta ketersediaan webhook/API/custom domain di paket Starter
- [ ] Mayar: apakah kelas tatap muka boleh memakai produk Link Pembayaran (1,5%) atau harus Event/Bootcamp (3%)
- [ ] Mayar: apakah tarif QRIS mengikuti skema MDR 1 Oktober 2026
- [ ] Batas pemakaian "unlimited" dan batas proses (entry process) paket hosting

---

## 10. Asumsi dan Batasan

- Harga diambil 4 November 2026 dan dapat berubah, terutama promo.
- Kurs Rp16.500 per US$ hanya perkiraan untuk membandingkan domain Hostinger.
- Harga perpanjangan .com DomaiNesia (Rp209.000), domain Rumahweb dan IDCloudHost berasal dari sumber sekunder; tabel domain DomaiNesia tidak terbaca otomatis.
- Perkiraan jam kerja dan kebutuhan storage adalah asumsi saya, belum didasarkan data klien.
- Rate jasa teman adalah patokan pribadi, bukan standar pasar, dan tidak mencakup rincian cakupan.
- Harga paket 12 bulan DomaiNesia dan paket Hostinger Premium/Business Indonesia tidak terverifikasi.
- Tarif Midtrans tidak ditemukan; tarif Xendit dan Duitku dari sumber sekunder.
- Data Mayar dibaca dari halaman resmi (harga, FAQ, dokumentasi) pada 4 November 2026; tampilan centang fitur per paket tidak terbaca. Persyaratan verifikasi Midtrans dan Xendit tidak diperiksa.
- Provider lain (misalnya Jagoan Hosting, Qwords) tidak diperiksa.

### Sumber utama
- DomaiNesia hosting: https://www.domainesia.com/hosting/
- DomaiNesia harga domain: https://www.domainesia.com/harga-domain/
- Rumahweb hosting murah: https://www.rumahweb.com/hosting-murah/
- Hostinger CMS hosting: https://www.hostinger.com/id/cms-hosting
- Hostinger cloud hosting: https://www.hostinger.com/id/cloud-hosting?niaga=1
- Perbandingan Niagahoster dan Rumahweb (whtop): https://www.whtop.com/compare/niagahoster.co.id,rumahweb
- Review IDCloudHost dan perbandingan hosting (cekipsaya): https://cekipsaya.com/artikel/idcloudhost-review-2026/ dan https://cekipsaya.com/artikel/hosting-indonesia-terbaik-2026/
- Mayar harga: https://mayar.id/pricing
- Mayar FAQ: https://mayar.id/faq
- Mayar verifikasi bisnis: https://docs.mayar.id/businessverify
- Mayar biaya (dokumentasi): https://docs.mayar.id/mor/fees
- Midtrans: https://midtrans.com/id/change-language/en
- Duitku: https://duitku.com/?p=722
- Xendit (ringkasan tarif): https://learnwithhasan.com/payment-gateways/country/indonesia/
- QRIS MDR 1 Oktober 2026: https://www.metrotvnews.com/read/bw6CAd3Z-berlaku-1-oktober-2026-ini-ketentuan-terbaru-biaya-transaksi-qris dan https://katadata.co.id/foto/6a882ffd488a8/foto-bi-perluas-mdr-qris-0-mulai-oktober-2026
