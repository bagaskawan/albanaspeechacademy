# Laporan Spesifikasi Paket Hosting

## Identitas Layanan

- **Domain utama:** `albanaspeechacademy.com`
- **Nama paket:** **Unlimited Web Hosting**
- **Status:** Aktif
- **Masa aktif paket:** sampai **4 November 2027**
- **Jenis layanan:** Web hosting terkelola berbasis shared hosting
- **Server:** LiteSpeed
- **Lokasi server:** Indonesia
- **CDN:** Didukung

> Laporan ini dibuat berdasarkan pemeriksaan layanan pada **18 November 2026**. Angka kapasitas dan penggunaan dapat berubah ketika website, email, database, atau file mengalami perubahan.

---

## Ringkasan Kapasitas Utama

| Komponen | Spesifikasi paket | Pemakaian saat diperiksa |
|---|---:|---:|
| Penyimpanan hosting | 50 GB | Sekitar 0,161 GB |
| CPU | 2 core | Tergantung aktivitas website |
| RAM | 3 GB | Tergantung aktivitas website |
| Proses aktif | 120 | Batas paket |
| Entry processes | 60 | Batas resource proses web |
| Inode | 600.000 | 1.772 inode |
| Database | 150 | 0 database terpakai pada pemeriksaan |
| Subdomain | 100 | 0 subdomain terpakai pada pemeriksaan |
| Parked domain | 100 | Tergantung konfigurasi akun |
| Bandwidth | Tidak terbatas | Mengikuti kebijakan penggunaan wajar dan batas resource lainnya |

---

## 1. Penyimpanan File

Paket menyediakan **50 GB ruang penyimpanan** untuk seluruh data yang berada di akun hosting. Ruang ini dapat digunakan untuk berbagai kebutuhan website, antara lain:

- File HTML, CSS, JavaScript, PHP, dan aset website.
- Gambar, dokumen, audio, serta file video seperti `.mp4`.
- File instalasi CMS dan plugin.
- Database tidak dihitung sebagai folder biasa secara terpisah dalam pengelolaan, tetapi tetap menggunakan resource hosting secara keseluruhan.
- File email domain dan data lain yang disimpan oleh layanan hosting dapat ikut memengaruhi penggunaan ruang, tergantung konfigurasi layanan.

### Pemakaian saat pemeriksaan

Pemakaian terdeteksi sekitar **0,161 GB dari 50 GB**, sehingga ruang yang digunakan masih relatif kecil dibandingkan kapasitas total paket.

### Catatan teknis

Penyimpanan file video diperbolehkan dalam kapasitas hosting, tetapi menyimpan video berbeda dengan menyediakan layanan streaming video berskala tinggi. Streaming intensif, transcoding, pemrosesan FFmpeg, dan layanan video yang membutuhkan proses server persisten dapat memerlukan infrastruktur khusus atau VPS.

---

## 2. CPU dan RAM

### CPU

Paket menyediakan **2 core CPU** untuk menjalankan proses website, PHP, database, dan aktivitas hosting lain yang tersedia pada paket.

CPU digunakan ketika website melakukan pekerjaan seperti:

- Menjalankan kode PHP.
- Memproses permintaan pengunjung.
- Mengakses atau memperbarui database.
- Membuat thumbnail gambar.
- Menjalankan proses administrasi CMS.
- Memproses upload dan operasi file.

### RAM

Batas memori yang terdeteksi adalah sekitar **3 GB**. RAM digunakan secara dinamis oleh proses hosting, sehingga pemakaian aktual dapat berubah berdasarkan jumlah pengunjung, plugin, query database, ukuran file, dan proses yang sedang berjalan.

### Implikasi praktis

Kapasitas ini umumnya sesuai untuk website profil bisnis, website akademi, blog, landing page, toko online ringan, dan CMS dengan konfigurasi yang wajar. Beban tinggi yang berasal dari proses video, aplikasi backend persisten, crawling besar, atau proses komputasi berat dapat melampaui karakteristik web hosting biasa.

---

## 3. Batas Proses Web

### Proses aktif

Paket memiliki batas sekitar **120 proses aktif**.

### Entry processes

Paket memiliki batas sekitar **60 entry processes**. Entry process menggambarkan jumlah proses yang sedang menangani permintaan masuk ke website pada waktu yang sama.

Resource ini penting ketika terjadi:

- Banyak pengunjung membuka halaman secara bersamaan.
- Query database berjalan lama.
- Plugin atau tema membutuhkan waktu eksekusi tinggi.
- Website menerima lonjakan request.
- Proses PHP tertahan oleh operasi eksternal atau file besar.

Batas proses berbeda dengan bandwidth. Website dapat memiliki bandwidth yang besar tetapi tetap mengalami keterbatasan ketika jumlah proses bersamaan atau waktu eksekusi terlalu tinggi.

---

## 4. Database

Paket menyediakan hingga **150 database**. Database dapat digunakan untuk:

- WordPress atau CMS lain.
- Website akademi atau sistem informasi sederhana.
- Data pengguna, artikel, katalog, formulir, dan transaksi.
- Beberapa instalasi website yang dipisahkan berdasarkan database.

Teknologi database yang tersedia menggunakan **MariaDB**.

### Pemakaian saat pemeriksaan

Tidak ada database yang tercatat terpakai pada pemeriksaan resource yang ditampilkan.

### Catatan arsitektur

Jumlah database yang besar tidak otomatis berarti kapasitas database tidak terbatas. Performa tetap dipengaruhi oleh ukuran database, indeks, jumlah query, kompleksitas query, dan penggunaan CPU/RAM.

---

## 5. Domain, Subdomain, dan Parked Domain

### Subdomain

Paket mendukung hingga **100 subdomain**. Contoh penggunaan:

- `www.albanaspeechacademy.com`
- `learn.albanaspeechacademy.com`
- `portal.albanaspeechacademy.com`
- `blog.albanaspeechacademy.com`

### Parked domain

Paket mendukung hingga **100 parked domain**. Parked domain digunakan untuk menambahkan domain tambahan yang diarahkan atau dikaitkan dengan layanan hosting sesuai konfigurasi akun.

### Pemakaian saat pemeriksaan

Subdomain terdeteksi **0 dari 100** pada pemeriksaan saat laporan dibuat.

---

## 6. Bandwidth

Paket tercatat memiliki **bandwidth tidak terbatas**. Artinya, paket tidak menetapkan angka kuota transfer bulanan sederhana seperti paket dengan batas bandwidth numerik.

Namun, bandwidth bukan satu-satunya batas teknis. Website tetap dipengaruhi oleh:

- CPU.
- RAM.
- Entry processes.
- Jumlah proses aktif.
- Kecepatan dan durasi query database.
- Ukuran file.
- Pola trafik dan jumlah request.
- Kebijakan penggunaan wajar layanan.

Karena itu, istilah bandwidth tidak terbatas tidak sama dengan kapasitas tanpa batas untuk streaming, transcoding, aplikasi real-time, atau beban server yang terus-menerus.

---

## 7. Web Server dan Performa

Paket menggunakan **LiteSpeed**, yang ditujukan untuk penyajian website berbasis web hosting. Konfigurasi ini cocok untuk website PHP dan CMS yang kompatibel dengan lingkungan hosting.

Dukungan CDN tersedia dan dapat membantu:

- Mengurangi latensi untuk aset statis.
- Menyajikan cache lebih dekat ke pengunjung.
- Mengurangi sebagian beban request aset statis ke server asal.
- Membantu performa gambar, CSS, JavaScript, dan konten cacheable.

CDN tidak menggantikan kebutuhan optimasi kode, database, gambar, atau kapasitas proses server.

---

## 8. PHP dan Aplikasi Website

Versi PHP aktif yang terdeteksi adalah **PHP 8.3**.

PHP digunakan untuk menjalankan aplikasi web seperti:

- WordPress.
- CMS berbasis PHP.
- Framework PHP yang kompatibel dengan konfigurasi shared hosting.
- Website custom berbasis PHP.

Kesesuaian aplikasi tetap bergantung pada kebutuhan ekstensi PHP, versi framework, batas eksekusi, konsumsi memori, dan konfigurasi aplikasi.

---

## 9. SSL dan Keamanan Dasar

SSL terdeteksi **aktif dan berlaku seumur hidup** untuk layanan yang memenuhi cakupan konfigurasi domain. SSL mengenkripsi koneksi HTTPS antara pengunjung dan website.

Manfaat utama SSL:

- Melindungi data selama transmisi.
- Mengaktifkan HTTPS.
- Mengurangi peringatan keamanan browser.
- Membantu menjaga kepercayaan pengunjung.
- Menjadi bagian dari konfigurasi teknis SEO modern.

Paket juga mencakup perlindungan malware sebagai bagian dari fasilitas hosting yang tersedia pada paket.

SSL tidak berarti website otomatis bebas dari malware. Keamanan tetap dipengaruhi oleh pembaruan CMS, plugin, tema, password, izin file, dan praktik administrasi akun.

---

## 10. Backup dan Pemulihan

Paket menyediakan **backup otomatis harian**.

Backup berguna untuk membantu pemulihan ketika terjadi:

- Perubahan konfigurasi yang salah.
- Kerusakan file website.
- Pembaruan CMS atau plugin yang bermasalah.
- Penghapusan file secara tidak sengaja.
- Perubahan database yang perlu dikembalikan.

Backup bukan pengganti sistem version control atau strategi backup independen. Untuk data bisnis penting, disarankan tetap memiliki salinan terpisah dan menguji proses pemulihan secara berkala.

---

## 11. File Manager dan FTP

Paket mendukung pengelolaan file melalui:

- File Manager.
- FTP.
- Struktur direktori website pada folder publik domain.

Metode tersebut dapat digunakan untuk mengunggah file website, mengatur folder, mengelola aset statis, dan melakukan pemeliharaan file yang kompatibel dengan hosting.

---

## 12. Email Domain

Paket mendukung penggunaan email berbasis domain, misalnya alamat dengan domain `albanaspeechacademy.com`, sesuai mailbox dan kuota email yang tersedia pada akun.

Email domain terpisah secara fungsi dari website, tetapi konfigurasi DNS seperti MX, SPF, DKIM, dan DMARC dapat memengaruhi pengiriman dan penerimaan email.

---

## 13. Batasan Arsitektur: VPS, Root, SSH, dan Node.js

Paket ini adalah **web hosting**, bukan VPS.

Konsekuensi teknisnya:

- Tidak menyediakan akses root seperti VPS.
- Akses shell/SSH tidak aktif pada pemeriksaan paket.
- Tidak ditujukan untuk menjalankan daemon atau service server persisten.
- Tidak cocok untuk aplikasi server-side Node.js yang membutuhkan proses Node.js berjalan terus-menerus.
- Tidak cocok untuk Docker, transcoding video berat, FFmpeg persisten, atau layanan backend yang membutuhkan kontrol sistem operasi penuh.

Jika aplikasi memerlukan kontrol root, proses persisten, Docker, worker background, server Node.js, streaming khusus, atau transcoding, arsitektur yang sesuai adalah layanan VPS terpisah. Website berbasis file statis atau aplikasi yang sesuai dengan kemampuan web hosting tetap dapat menggunakan paket ini.

---

## 14. Evaluasi Kesesuaian untuk Albanaspeechacademy.com

Paket ini sesuai untuk:

- Website profil akademi atau lembaga pendidikan.
- Landing page promosi.
- Blog dan artikel.
- Halaman program kursus.
- Formulir kontak dan pendaftaran sederhana.
- CMS berbasis PHP.
- File gambar, dokumen, dan video dengan penggunaan yang wajar.
- Beberapa subdomain untuk area website yang berbeda.

Perlu evaluasi arsitektur tambahan jika website akan digunakan untuk:

- Streaming video intensif.
- Transcoding video otomatis.
- Aplikasi Node.js yang berjalan sebagai server.
- API backend persisten.
- Sistem real-time.
- Pekerjaan CPU berat atau proses background jangka panjang.
- Deployment berbasis Docker.

---

## 15. Kesimpulan Teknis

**Unlimited Web Hosting** memberikan fondasi web hosting yang kuat untuk website bisnis dan akademi berbasis web, dengan penyimpanan 50 GB, 2 core CPU, RAM 3 GB, LiteSpeed, CDN, SSL, backup harian, database MariaDB, dukungan PHP 8.3, domain email, serta batas domain dan database yang besar.

Kata “Unlimited” terutama berkaitan dengan bandwidth pada paket, bukan berarti semua resource server tidak memiliki batas. CPU, RAM, proses aktif, entry processes, inode, penyimpanan, jumlah database, dan konfigurasi aplikasi tetap memiliki batas teknis.

Untuk website akademi yang berfokus pada halaman informasi, pendaftaran, artikel, CMS, dan aset media dengan beban wajar, paket ini memadai. Untuk aplikasi backend persisten, Node.js server, Docker, streaming/transcoding intensif, atau kebutuhan root, diperlukan arsitektur VPS atau layanan khusus yang terpisah.

---

## 16. Penggunaan MCP pada Hostinger

### 16.1 Apa itu MCP?

**MCP atau Model Context Protocol** adalah protokol yang memungkinkan aplikasi AI seperti IDE berbasis AI atau agen AI terhubung ke layanan eksternal melalui server MCP.

Dalam konteks Hostinger, MCP berfungsi sebagai lapisan koneksi antara klien AI dan layanan Hostinger. Klien AI dapat meminta operasi yang tersedia melalui MCP, lalu MCP meneruskan permintaan tersebut ke API Hostinger setelah proses otorisasi.

Contoh kemampuan yang dapat disediakan melalui Hostinger MCP meliputi:

- Membaca dan mengelola website.
- Mengelola website WordPress melalui MCP khusus per website.
- Mengelola domain dan DNS.
- Mengelola VPS.
- Mengelola email marketing atau Reach.
- Mengakses informasi subscription dan pembayaran tertentu.
- Mengelola fitur ecommerce yang tersedia melalui API.

MCP bukan pengganti hosting, bukan VPS, dan bukan akses root. MCP adalah mekanisme otomatisasi dan integrasi untuk mengontrol fungsi Hostinger yang memang diekspos melalui API.

### 16.2 Hubungan MCP dengan paket Unlimited Web Hosting

Paket **Unlimited Web Hosting** dapat menjadi target pengelolaan melalui MCP pada tingkat website dan layanan Hostinger yang tersedia di API. Namun, koneksi MCP tidak mengubah karakteristik paket.

MCP tidak dapat secara otomatis:

- Mengubah shared hosting menjadi VPS.
- Memberikan akses root.
- Mengaktifkan SSH atau shell jika paket tidak menyediakannya.
- Menjalankan Docker pada shared hosting.
- Menjalankan service Node.js persisten pada paket web hosting.
- Menambah CPU, RAM, storage, inode, entry processes, atau database di luar batas paket.
- Memberikan akses sistem operasi Linux penuh.

Dengan demikian, MCP dapat membantu mengatur layanan yang tersedia, tetapi tidak menghapus batas resource dan batas arsitektur paket.

### 16.3 Dua model penggunaan MCP

#### Model A: Hostinger MCP untuk mengelola akun dan layanan

Pada model ini, MCP berjalan sebagai connector atau server MCP yang terhubung ke Hostinger API. Aplikasi AI di komputer pengguna dapat menjalankan operasi yang tersedia, seperti membaca website, mengelola domain atau DNS, serta operasi Hostinger lain yang diizinkan.

Arsitektur sederhananya:

```text
Aplikasi AI / IDE
        |
        v
Hostinger MCP Connector atau Hostinger MCP Server
        |
        v
Hostinger API
        |
        v
Website, domain, DNS, email, VPS, dan layanan Hostinger
```

Model ini cocok untuk:

- Otomatisasi konfigurasi website.
- Membaca status domain dan website.
- Mengelola DNS menggunakan instruksi bahasa alami.
- Membantu operasi WordPress.
- Mengatur resource atau layanan Hostinger yang diekspos oleh API.

#### Model B: Aplikasi pelanggan menggunakan MCP sebagai bagian dari sistem aplikasi

Pada model ini, pelanggan membangun aplikasi AI atau backend sendiri yang menggunakan MCP untuk menghubungkan AI dengan data atau operasi tertentu.

Shared hosting tetap dapat menampung website PHP atau aset aplikasi yang kompatibel. Namun, server MCP yang harus berjalan terus-menerus sebagai service biasanya memerlukan runtime persisten dan kontrol server yang tidak tersedia pada paket ini.

Untuk server MCP persisten, gunakan lingkungan yang menyediakan:

- Proses aplikasi jangka panjang.
- Runtime Node.js atau runtime lain yang dibutuhkan.
- Akses environment variable.
- Kontrol port dan proses.
- Akses filesystem dan dependency yang memadai.
- Pengelolaan service seperti worker atau daemon.

Kebutuhan tersebut lebih sesuai dengan VPS daripada shared hosting ini.

### 16.4 MCP dan pengaturan hosting

MCP dapat digunakan untuk membantu pengaturan yang tersedia melalui Hostinger API, misalnya:

- Membaca website yang ada di akun.
- Mengidentifikasi website, domain, atau layanan terkait.
- Mengelola domain dan DNS apabila operasi tersebut tersedia dan diizinkan.
- Membantu konfigurasi WordPress melalui MCP WordPress per website.
- Membaca informasi VPS apabila akun memiliki VPS.
- Mengelola layanan lain yang terhubung ke Hostinger API.

Setiap operasi perubahan tetap harus diperlakukan sebagai perubahan konfigurasi nyata. Sebelum menjalankan perubahan, pastikan target domain, website, record DNS, dan nilai konfigurasi benar.

MCP sebaiknya digunakan dengan prinsip least privilege:

1. Aktifkan hanya produk yang benar-benar diperlukan.
2. Gunakan OAuth melalui Hostinger Connector jika tersedia.
3. Jika memakai API token, batasi masa berlaku dan ruang lingkupnya.
4. Jangan menaruh token di file website publik, repository publik, JavaScript frontend, atau file konfigurasi yang dapat diunduh pengunjung.
5. Hapus atau rotasi token apabila token pernah terekspos.
6. Pisahkan token pengembangan dan produksi.

### 16.5 Konfigurasi Hostinger MCP menggunakan Connector

Metode yang direkomendasikan adalah menggunakan **Hostinger Connector** melalui halaman integrasi atau Developer Tools/API di hPanel.

Alur umumnya:

1. Buka area **Dev tools** atau **API** di hPanel.
2. Pilih IDE atau klien AI yang ingin digunakan.
3. Pilih instalasi atau koneksi Hostinger Connector.
4. Otorisasi akun Hostinger menggunakan OAuth.
5. Pilih produk Hostinger yang memang diperlukan.
6. Sinkronkan website jika klien menyediakan opsi sinkronisasi.
7. Uji dengan operasi baca terlebih dahulu sebelum menjalankan perubahan.

OAuth lebih aman untuk penggunaan agen AI karena token tidak perlu ditempelkan secara manual ke banyak file konfigurasi.

### 16.6 Konfigurasi manual pada klien MCP lokal

Jika klien AI memerlukan konfigurasi manual, contoh struktur konfigurasi berikut dapat digunakan sebagai pola:

```json
{
  "mcpServers": {
    "hostinger-mcp": {
      "command": "npx",
      "args": ["hostinger-api-mcp@latest"],
      "env": {
        "API_TOKEN": "YOUR_HOSTINGER_API_TOKEN"
      }
    }
  }
}
```

Nilai `YOUR_HOSTINGER_API_TOKEN` adalah placeholder dan harus diganti menggunakan token yang dibuat melalui area API Hostinger. Token tidak boleh ditulis di website, tidak boleh dikomit ke Git, dan tidak boleh dibagikan di chat atau log publik.

Untuk penggunaan remote MCP, klien yang kompatibel dapat menggunakan server MCP Hostinger dan menyelesaikan otorisasi OAuth sesuai alur klien tersebut.

### 16.7 MCP dan database MariaDB

Paket ini menggunakan **MariaDB** dan menyediakan hingga **150 database**. Database tetap berada di lingkungan hosting dan aksesnya harus mengikuti kredensial, hostname, port, hak akses, serta pembatasan layanan.

MCP dapat membantu operasi database hanya apabila operasi tersebut secara eksplisit tersedia melalui connector atau API yang digunakan. Jangan mengasumsikan bahwa MCP secara otomatis memberikan akses SQL arbitrer ke semua database.

Pemisahan fungsi yang disarankan:

```text
MCP Hostinger
  -> Mengelola website, layanan, konfigurasi, atau operasi API yang tersedia

Aplikasi website
  -> Terhubung ke MariaDB menggunakan kredensial database aplikasi

Admin database
  -> Mengelola database melalui phpMyAdmin atau mekanisme database yang disediakan
```

Untuk operasi database yang membutuhkan SQL khusus, import, export, perubahan schema, atau pemeriksaan isi tabel, gunakan mekanisme database yang memang disediakan Hostinger, seperti phpMyAdmin atau fitur database di hPanel. MCP hanya boleh digunakan untuk operasi database apabila connector/API secara jelas mendukungnya.

### 16.7.1 Apakah MariaDB dapat diakses langsung melalui MCP?

**Tidak secara langsung melalui Hostinger API MCP resmi untuk menjalankan SQL arbitrer.**

Hostinger MCP resmi berfokus pada layanan yang diekspos melalui API, seperti website, WordPress per website, domain dan DNS, VPS, email marketing, subscription, pembayaran, dan ecommerce. Akses langsung ke isi database MariaDB, phpMyAdmin, serta eksekusi query SQL bebas bukan fungsi database yang otomatis diberikan oleh Hostinger MCP.

Artinya, MCP tidak otomatis dapat:

- Membuka seluruh tabel MariaDB.
- Menjalankan query `SELECT`, `INSERT`, `UPDATE`, atau `DELETE` tanpa connector khusus.
- Melakukan import atau export database.
- Mengubah schema dan struktur tabel.
- Mengganti password database.
- Mengoptimalkan atau memperbaiki tabel secara langsung.
- Menggantikan phpMyAdmin.

Untuk pekerjaan database tersebut, gunakan **phpMyAdmin** atau fitur **Database Management** di hPanel. MCP hanya dapat mengelola MariaDB apabila connector atau API yang digunakan memang secara eksplisit menyediakan operasi database tersebut.

### 16.7.2 Pilihan jika ingin AI mengakses MariaDB

Jika ingin AI membaca atau mengolah data MariaDB, ada dua pola yang lebih tepat:

#### Opsi A: MCP custom di komputer lokal

MCP server custom berjalan di komputer lokal dan terhubung ke database menggunakan akses remote MySQL yang diizinkan. MCP tersebut harus dibuat dengan fungsi yang dibatasi, misalnya hanya query baca atau hanya tabel tertentu.

```text
AI / IDE
   ↓
MCP Server custom di komputer lokal
   ↓
Remote MySQL / MariaDB
   ↓
Database Hostinger
```

#### Opsi B: MCP custom di VPS

Jika MCP harus berjalan terus-menerus, menangani banyak permintaan, atau menjadi bagian dari aplikasi produksi, jalankan MCP custom di VPS. VPS menyediakan runtime persisten, environment variable, kontrol proses, dan konfigurasi jaringan yang lebih sesuai.

Shared hosting ini tidak cocok untuk menjalankan MCP server persisten karena akses shell tidak aktif, tidak ada root, dan paket tidak dirancang untuk service Node.js, Docker, daemon, atau worker background.

### 16.7.3 Persyaratan koneksi MariaDB dari MCP custom

MCP custom yang mengakses database memerlukan:

- Host database.
- Port database, yaitu `3306` untuk koneksi MySQL/MariaDB Hostinger.
- Nama database.
- Username database.
- Password database.
- Daftar alamat IP yang diizinkan untuk koneksi remote, jika fitur remote MySQL digunakan.

Untuk koneksi dari website yang berada pada hosting yang sama, aplikasi biasanya menggunakan hostname `localhost`. Untuk MCP yang berjalan di luar hosting, diperlukan konfigurasi remote MySQL dan aturan akses yang sesuai.

### 16.7.4 Rekomendasi keamanan untuk MCP dan MariaDB

Gunakan desain database yang membatasi dampak jika MCP mengalami kesalahan atau prompt injection:

1. Buat user database khusus untuk MCP.
2. Gunakan hak akses **read-only** terlebih dahulu.
3. Batasi akses ke database dan tabel yang diperlukan.
4. Jangan berikan hak `DROP`, `ALTER`, atau `DELETE` kecuali benar-benar dibutuhkan.
5. Gunakan allowlist query atau stored procedure jika memungkinkan.
6. Jangan menyimpan password database di prompt, repository publik, frontend, atau log.
7. Simpan credential melalui environment variable atau secret manager.
8. Batasi alamat IP yang boleh melakukan koneksi remote.
9. Catat query dan aktivitas MCP untuk audit.
10. Uji MCP pada database salinan sebelum digunakan pada database produksi.
11. Siapkan backup sebelum menjalankan operasi perubahan.
12. Rotasi password atau token jika pernah terekspos.

### 16.7.5 Kesimpulan akses MariaDB melalui MCP

Kesimpulan praktisnya:

- **Hostinger MCP resmi:** tidak memberikan akses SQL MariaDB langsung secara otomatis.
- **phpMyAdmin:** digunakan untuk mengelola isi database secara langsung.
- **Website di hosting:** dapat mengakses MariaDB menggunakan konfigurasi aplikasi dan kredensial database.
- **MCP custom lokal:** dapat mengakses MariaDB melalui remote MySQL jika dikonfigurasi dan diamankan.
- **MCP custom produksi:** lebih sesuai dijalankan di VPS.
- **Unlimited Web Hosting:** tetap memiliki batas storage, database, CPU, RAM, proses, dan akses sistem operasi meskipun dikendalikan melalui MCP.

### 16.8 Koneksi aplikasi ke database

Konfigurasi aplikasi biasanya membutuhkan:

- Nama database.
- Username database.
- Password database.
- Host database.
- Port database.

Untuk koneksi lokal dari website ke database pada paket web hosting, hostname yang umum digunakan adalah `localhost`. Untuk koneksi remote, Hostinger menggunakan port `3306` pada layanan web dan cloud hosting, tetapi akses remote tetap bergantung pada fitur dan konfigurasi yang tersedia.

Jangan menaruh password database di prompt AI, repository publik, file JavaScript frontend, atau konfigurasi yang bisa diakses melalui browser.

### 16.9 MCP dan storage hosting

MCP tidak menjadikan storage hosting sebagai object storage atau penyimpanan tanpa batas. Storage paket tetap memiliki kapasitas **50 GB** dan dibatasi oleh inode serta resource lain.

MCP dapat membantu operasi file hanya apabila fitur file atau operasi website yang dibutuhkan tersedia melalui integrasi yang digunakan. Untuk pengelolaan file yang tidak diekspos melalui MCP, gunakan File Manager, FTP, deployment tool, atau mekanisme lain yang disediakan Hostinger.

Batas penting:

- File video dapat disimpan selama masih berada dalam kapasitas storage.
- Penyimpanan file tidak sama dengan layanan streaming.
- MCP tidak memperbesar kapasitas 50 GB.
- MCP tidak menghilangkan batas inode 600.000.
- MCP tidak cocok dijadikan jalur untuk upload massal tanpa memperhatikan CPU, proses, bandwidth, dan batas akun.
- Video streaming intensif, transcoding, dan pemrosesan FFmpeg persisten tetap memerlukan arsitektur yang sesuai.

### 16.10 Apakah MCP dapat di-host di paket ini?

Untuk MCP yang hanya digunakan sebagai connector dari komputer lokal atau klien remote, paket hosting ini tidak harus menjalankan server MCP sendiri.

Namun, apabila yang dimaksud adalah menjalankan **server MCP persisten di dalam hosting**, paket ini memiliki keterbatasan penting:

- Akses shell tidak aktif.
- Tidak ada akses root.
- Paket bukan VPS.
- Paket tidak ditujukan untuk service Node.js persisten.
- Tidak ditujukan untuk daemon, worker background, atau Docker.

Kesimpulannya, **Hostinger MCP dapat digunakan untuk mengelola layanan Hostinger dari klien AI**, tetapi menjalankan MCP server persisten di dalam paket Unlimited Web Hosting bukan arsitektur yang sesuai. Gunakan connector lokal atau lingkungan VPS apabila MCP server perlu berjalan sebagai aplikasi persisten.

### 16.11 Rekomendasi arsitektur untuk Albanaspeechacademy.com

#### Website informasi atau CMS PHP

Gunakan:

- Unlimited Web Hosting untuk website.
- MariaDB untuk data CMS.
- Hostinger MCP Connector untuk pengelolaan website, domain, DNS, atau operasi API yang tersedia.
- File Manager atau FTP untuk operasi file yang tidak tersedia melalui MCP.

#### Website dengan AI assistant yang memanggil data database

Gunakan:

- Website pada Unlimited Web Hosting untuk frontend dan backend PHP yang kompatibel.
- MariaDB untuk data aplikasi.
- MCP atau AI gateway pada layanan terpisah jika membutuhkan proses persisten.
- API terbatas untuk mengakses data yang memang diperlukan.
- Authentication, rate limiting, dan logging.

#### Aplikasi Node.js, agent, Docker, atau MCP server persisten

Gunakan VPS atau lingkungan yang mendukung runtime persisten. Jangan memaksa proses tersebut berjalan pada shared hosting karena batas shell, proses, runtime, dan kontrol sistem operasi.

### 16.12 Checklist keamanan MCP

- [ ] Gunakan OAuth jika tersedia.
- [ ] Jika memakai API token, buat token dengan masa berlaku terbatas.
- [ ] Aktifkan hanya produk Hostinger yang diperlukan.
- [ ] Jangan menaruh token di repository publik.
- [ ] Jangan menaruh token pada file frontend.
- [ ] Jangan menyalin password database ke prompt AI.
- [ ] Uji operasi baca sebelum operasi perubahan.
- [ ] Pastikan target domain dan website benar.
- [ ] Simpan backup sebelum perubahan besar pada website atau database.
- [ ] Rotasi token jika ada indikasi kebocoran.
- [ ] Gunakan VPS untuk MCP server atau worker yang berjalan persisten.

### Kesimpulan MCP

MCP paling tepat digunakan sebagai **lapisan otomasi dan kontrol API Hostinger**, bukan sebagai cara untuk mengubah paket Unlimited Web Hosting menjadi VPS. MCP dapat membantu mengelola website, domain, DNS, WordPress, dan layanan lain yang diekspos melalui API. Database MariaDB dan storage 50 GB tetap mengikuti batas, kredensial, dan metode akses masing-masing.

Untuk kebutuhan website akademi berbasis PHP atau CMS, gunakan MCP Connector dari klien AI dan tetap jalankan website pada hosting yang ada. Untuk MCP server persisten, Node.js server, Docker, worker, streaming, transcoding, atau akses root, gunakan arsitektur VPS.

---

## Data Penggunaan Saat Pemeriksaan

| Resource | Nilai |
|---|---:|
| Penyimpanan terpakai | 0,161 GB dari 50 GB |
| Inode terpakai | 1.772 dari 600.000 |
| Database terpakai | 0 dari 150 |
| Subdomain terpakai | 0 dari 100 |

Penggunaan tersebut adalah kondisi pada saat pemeriksaan, bukan jaminan bahwa nilainya akan tetap sama di masa mendatang.