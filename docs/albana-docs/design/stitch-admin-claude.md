Rancang satu frame desktop 1440×900: Dashboard admin CMS Albana Speech Academy (lembaga pelatihan public speaking di Bandung). Pengguna: operator internal. Tiru KOMPOSISI gambar referensi terlampir (rail ikon bulat, navigasi pil di atas, judul besar, grid kartu bento), tetapi JANGAN meniru warna, font, produk, atau angkanya. Seluruh UI berbahasa Indonesia. High-fidelity, tema terang.

TOKEN WAJIB
- Halaman #F4F8FC; kartu #FFFFFF; well/search #EDF4FB; biru pucat #DCEBFA; garis #D8E4F0; teks utama #10243F; teks sekunder #425A73; teks muted #566B81.
- Aksi utama #26599A (hover #163E70), teks putih. Fokus: ring #26599A 2px offset 2px.
- Font: Plus Jakarta Sans 600–700 untuk judul, navigasi, tombol. Inter 400–600 untuk isi, label, tabel; Inter 700 tabular hanya untuk angka display. Tanpa Poppins, serif, atau monospace.
- Radius: kartu 16px, panel bento/chart 20px, tombol 14px, field 12px, pil/search/badge 999px, tombol ikon bulat 50%.
- Kedalaman dari border 1px #D8E4F0, tanpa bayangan pada kartu. Bayangan hanya untuk dropdown/dialog.
- Spasi kelipatan 4px: gap kartu 16px, padding kartu 20–24px, padding konten 32px.

PENGGANTI ELEMEN GAMBAR
- Hitam pada gambar → biru tua #163E70. Hijau mint → #DCEBFA. Kuning → tidak dipakai; aksen kecil memakai #DCEBFA dengan ikon #163E70, aksi utama #26599A.
- Latar kain abu di luar jendela → bidang polos #F4F8FC.
- Render 3D kamera/produk → tidak ada ilustrasi; isi dengan data jadwal batch.

SHELL
1) Rail kiri 64px: deretan tombol ikon bulat 48px, putih, border #D8E4F0, ikon garis 18px #425A73. Urutan dari atas: placeholder logo tipografi "ASA", tombol kembali, lalu menu Dashboard, Data Pendaftar, Program, Batch, Artikel. Item aktif (Dashboard): latar #DCEBFA, ikon #163E70, penanda biru 3px di sisi kiri. Label muncul sebagai tooltip.
2) Baris atas: empat pil navigasi tinggi 44px dengan ikon + label: "Dashboard" (aktif: latar #DCEBFA, teks #163E70, weight 700), "Pendaftar", "Tagihan", "Batch" (pasif: putih, border, teks #425A73). Kanan atas: toggle tema, notifikasi, avatar 32px + nama + chevron.
3) Breadcrumb: "[ ADMIN ] / DASHBOARD", Inter 11px uppercase, tracking 0.16em, segmen terakhir #10243F weight 600, ikon folder kecil dan panah tipis seperti gambar.
4) Judul halaman "Ringkasan Pendaftaran", Plus Jakarta Sans 32px 700 #10243F. Sejajar di kanan: tombol ikon bulat 44px "Filter" dan "Cari" (putih, border), lalu SATU tombol utama "Tambah batch" #26599A teks putih radius 14px.

GRID BENTO (dua kolom, kiri ±440px, kanan mengisi sisa, gap 16px)
A) Kiri atas — kartu "Batch berikutnya": latar #163E70, radius 20px, teks putih. Header: judul 18px 600, tiga titik paginasi, tombol ikon bulat panah ↗ di kanan. Di dalamnya satu kartu bertumpuk (dua lapis di belakang, opacity turun) berisi: badge pil dengan dot 6px "PENDAFTARAN DIBUKA", nama batch 22px, baris "Sesi pertama · Sabtu, 08.30 WIB", lokasi, dan tombol persegi 44px radius 12px latar #DCEBFA ikon #163E70 "Lihat batch".
B) Kiri bawah — kartu "Tagihan": latar #DCEBFA, radius 20px, teks #10243F, tombol ikon bulat ↗. Dua angka tabular berdampingan dengan label di bawahnya: "Menunggu" dan "Terverifikasi", masing-masing dengan bar kecil.
C) Kanan atas — kartu "Pendaftar baru": putih, radius 20px, border. Header: ikon dalam lingkaran berbingkai 40px + judul 18px 600. Label "dibanding bulan lalu" 13px #425A73. Angka utama Inter tabular 48px 700; tiga digit terakhir berwarna #9FB4CB seperti efek pudar pada gambar. Di kanan: bar chart vertikal — bar utama #26599A, bar pembanding #8AB4DF bermotif garis diagonal, radius atas 4px, grid #EDF4FB, label sumbu X 11px, badge pil persentase di atas bar. Di bawah angka: grup segmen berbentuk pil berlatar #163E70 berisi "Minggu", "Bulan", dan tombol bulat ↗ berlatar #DCEBFA.
D) Kanan bawah — kartu "Perlu ditindaklanjuti": putih, radius 20px, border. Header ikon lingkaran + judul. Search pil tinggi 44px latar #EDF4FB, ikon kaca pembesar, placeholder "Cari pendaftar…". Daftar maksimal 5 baris tinggi 72px: avatar inisial, nama, meta program/batch 13px, badge status di kanan, tombol ikon bulat WhatsApp. Tautan "Lihat semua" di bawah.

STATUS (badge pil, dot 6px, teks 10–11px uppercase 600, selalu dengan kata)
- Menunggu pembayaran: teks #92400E latar #FEF3C7
- Terverifikasi: teks #166534 latar #DCFCE7
- Perlu ditinjau ulang: teks #991B1B latar #FEE2E2
- Draf: teks #374151 latar #F3F4F6

ATURAN
- Semua data sintetis; beri label kecil "Data contoh untuk rancangan". Nama peserta fiktif, tanpa nomor telepon atau email penuh.
- Satu aksi utama per area. Target sentuh minimal 44px. Kontras teks minimal 4,5:1.
- Dilarang: gradien, glassmorphism, neumorphism cekung, ungu/indigo, kuning, hijau mint, lime, tooltip hitam, emoji sebagai ikon, foto stok, istilah e-commerce (sales, orders, keranjang).
- Hover 100–160 ms hanya warna/border; tanpa parallax atau animasi masuk.