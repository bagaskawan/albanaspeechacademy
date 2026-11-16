# Prompt Stitch — Admin CMS Albana Speech Academy

Dokumen ini berisi prompt **siap tempel** untuk membuat rancangan visual di [Stitch](https://stitch.withgoogle.com/). Mulai dari Prompt 1 dalam satu proyek Stitch, lalu kirim Prompt 2–4 sebagai lanjutan pada proyek yang sama agar komponen dan warna tetap konsisten. Jika Stitch hanya menghasilkan sebagian layar, minta layar yang belum dibuat dengan prompt lanjutan; jangan memadatkan semua pekerjaan ke satu kanvas.

**Acuan proyek:** [menu backend yang disarankan](../architecture/README.md), [design system admin](admin-design-system.md), dan [aturan visual lintas kanal](visual-design.md). Prompt ini meminta **rancangan UI dan prototipe**, bukan implementasi backend. Beberapa menu masih berupa usulan; khususnya daftar Pendaftar Albana belum memakai sumber data baru yang sama dengan Tagihan Albana di kode saat ini.

## Prompt 1 — Fondasi visual dan pekerjaan harian

Salin seluruh blok ini ke Stitch:

```text
Rancang antarmuka web admin CMS untuk Albana Speech Academy, lembaga pelatihan public speaking di Bandung. Penggunanya adalah Alan dan operator internal yang mengelola kelas, konten, pendaftar, serta tagihan pembayaran manual. Tujuan desain: operator cepat memahami pekerjaan hari ini, dapat mengubah data tanpa ragu, dan jelas melihat apakah perubahan tersimpan. Buat desain high-fidelity yang terasa premium, tenang, profesional, dan mudah dipakai berulang kali. Seluruh UI berbahasa Indonesia.

Identitas visual wajib:
- Warna brand/aksi utama #26599A, hover #163E70, navy teks #10243F, kanvas kerja #F4F8FC, kartu putih #FFFFFF, bidang input/search #EDF4FB, stabilo/pil aktif #DCEBFA, garis #D8E4F0. Warna status sukses/peringatan/galat boleh berbeda tetapi selalu disertai teks.
- Judul halaman, judul kartu, navigasi, dan tombol: Plus Jakarta Sans 600–700. Paragraf, label form, isi input, tabel, angka, dan metadata: Inter 400–600. Angka nominal gunakan tabular figures. Tidak ada serif atau monospace untuk label UI.
- Admin memakai Soft UI yang fungsional: field terisi biru pucat/putih, border yang terlihat, radius 12px, tinggi kontrol minimal 44px, ring fokus biru 2px. Kartu radius 16px, panel/tabel 20px, tombol 14px. Kedalaman berasal dari perbedaan permukaan dan garis halus. Gunakan bayangan hanya pada dropdown atau dialog yang terangkat. Jangan gunakan gaya form garis bawah milik website academy publik.
- Desktop: sidebar berlabel sekitar 224–256px, topbar 64–72px, konten maksimum 1280px, ruang antarbagian lega. Sidebar dapat diperkecil jika label tetap tersedia melalui tooltip yang dapat diakses. Mobile: sidebar menjadi drawer; konten satu kolom, tombol utama mudah disentuh. Tema terang adalah tampilan utama.
- Tidak memakai gradien, glassmorphism, efek cekung neumorphism, ilustrasi medis/fintech, foto stok dekoratif, kartu statistik dengan angka fiktif yang tampak nyata, ataupun warna hijau/ungu sebagai identitas utama. Bila logo resmi tidak diberikan ke Stitch, gunakan placeholder tipografi “ALBANA SPEECH ACADEMY”; jangan menggambar ulang logo.

Struktur navigasi sidebar yang ingin divisualkan:
Dashboard;
OPERASIONAL: Pendaftar Albana, Tagihan & Pembayaran;
KELAS & PENAWARAN: Program, Batch & Jadwal, Bundling, Trainer;
KONTEN WEBSITE: Profil Akademi, Artikel, Media & Dokumentasi, Testimoni, Partner;
PENGATURAN: Kontak Publik, Rekening Pembayaran, Akun & Hak Akses.
Menu akun di topbar berisi Profil Saya, Tema, dan Keluar. Tampilkan satu item aktif dengan latar #DCEBFA, teks #163E70, dan garis kiri biru 3px. Sidebar panjang boleh digulir tanpa membuat konten utama terpotong.

Buat empat frame desktop 1440×900 yang memakai komponen dan shell yang sama:

1) DASHBOARD ALBANA. Header “Selamat datang, Alan” atau sapaan netral, tanggal dalam WIB, dan satu tindakan utama yang relevan. Tampilkan tiga ringkasan kerja: pendaftaran baru, tagihan menunggu pemeriksaan, dan batch mendatang. Di bawahnya: daftar “Perlu ditindaklanjuti” yang lebih dominan daripada grafik, jadwal batch terdekat, dan status konten draf. Bila angka belum ada, tampilkan tanda kosong “—” dan pesan yang jujur; jangan membuat metrik keberhasilan atau grafik pertumbuhan palsu.

2) PENDAFTAR ALBANA — DAFTAR. Tabel desktop dengan kolom waktu masuk (WIB), nama, program/batch, kontak, status tindak lanjut, dan aksi “Lihat detail”. Sediakan search, filter program, status, dan tanggal; filter aktif terlihat jelas. Tampilkan contoh data sintetis yang diberi label “Data contoh untuk rancangan”, bukan identitas peserta nyata. Email/WhatsApp di tabel tidak perlu ditampilkan penuh; detail privat hanya muncul di halaman detail. Buat keadaan kosong yang menjelaskan langkah berikutnya.

3) DETAIL PENDAFTAR. Halaman detail, bukan dialog kecil. Kiri: identitas dan jawaban formulir yang berkelompok (data diri, kebutuhan latihan, pilihan kelas). Kanan: ringkasan batch, harga saat mendaftar sebagai snapshot, status tagihan, dan catatan tindak lanjut. Tampilkan tautan ke Tagihan. Bedakan jelas “Formulir diterima”, “Pembayaran menunggu verifikasi”, dan “Pembayaran terverifikasi”; jangan menyebut formulir yang terkirim sebagai kursi atau pembayaran yang sudah pasti.

4) TAGIHAN & PEMBAYARAN. Daftar tagihan dengan tab/segmen Menunggu, Terverifikasi, Ditolak. Setiap item menampilkan ID, peserta contoh, program/batch, tahap Awal atau Pelunasan, subtotal, kode unik, total transfer, rekening yang terkait, dan waktu WIB. Pada detail tagihan, beri ruang untuk memeriksa bukti yang dikirim peserta lewat WhatsApp secara manual. Sediakan tombol “Verifikasi” dan “Tolak” hanya ketika status masih Menunggu; tindakan membuka dialog konfirmasi yang meminta operator mencocokkan nominal persis dan identitas tagihan. Untuk pembayaran DP awal yang diverifikasi, tampilkan kemungkinan tagihan Pelunasan berikutnya. Tidak ada unggahan bukti peserta di CMS dan tidak ada verifikasi otomatis.

Pada semua frame: satu CTA utama per konteks, breadcrumb pendek, label dan pesan galat tepat di dekat field, status simpan sebagai toast yang jelas, loading skeleton yang mengikuti bentuk konten, keadaan gagal memuat dengan aksi Coba lagi, serta fokus keyboard terlihat. Gunakan micro-interaction halus: hover 100–160ms, filter 150–220ms, dialog 200–300ms, hanya opacity dan transform kecil; hormati reduced motion. Tampilkan hasil sebagai kumpulan layar yang konsisten dan sambungkan alur Dashboard → Pendaftar → Detail → Tagihan sebagai prototipe klik bila tersedia.
```

## Prompt 2 — Katalog dan penyusunan kelas

Kirim setelah Prompt 1 selesai dalam proyek yang sama:

```text
Lanjutkan proyek CMS Albana sebelumnya. Pertahankan shell, Plus Jakarta Sans + Inter, biru #26599A, Soft UI admin, komponen, jarak, dan pola status yang sama. Buat empat frame desktop tambahan; jangan mendesain ulang Dashboard.

1) PROGRAM — DAFTAR: program sebagai daftar yang mudah dibandingkan, bukan kartu pemasaran. Kolom nama, jenis program, harga dasar bila ada, status draf/terbit, tanggal pembaruan, dan aksi. Tombol utama “Tambah program”. Ada search dan filter status. Saat daftar kosong, beri penjelasan dan aksi tambah.
2) EDIT PROGRAM: halaman editor panjang dengan kelompok Identitas, Manfaat & audiens, Materi/kurikulum, Fasilitas, FAQ, dan Publikasi. Field Soft UI terisi radius 12px; label di atas field; petunjuk dan error tepat di bawahnya. Sticky action bar yang tidak menutupi isian: “Simpan draf”, “Pratinjau”, “Terbitkan” sesuai kondisi. Tampilkan state galat validasi dan state berhasil tersimpan.
3) BATCH & JADWAL: satu halaman editor yang memilih Program, nama batch, lokasi, sesi pertemuan dalam WIB, harga yang berlaku, DP bila ada, dan status buka pendaftaran. Tambah/hapus sesi di dalam halaman ini, bukan menu Sesi terpisah. Tampilkan validasi ketika jam selesai mendahului jam mulai atau sesi bertabrakan. Sisi kanan memuat ringkasan yang akan dilihat calon peserta. Aksi membuka pendaftaran hanya tersedia jika informasi wajib lengkap.
4) BUNDLING & TRAINER: buat dua panel contoh pada satu frame bila ruang masih nyaman; jika terlalu padat, pecah menjadi dua frame. Bundling memilih penawaran dan harga yang telah disetujui, dengan penjelasan ketergantungan batch. Trainer menampilkan daftar profil dan form edit bio, keahlian, serta foto yang telah disetujui. Jangan mengarang sertifikasi atau mengklaim semua trainer mengajar setiap batch.

Semua data contoh harus jelas sebagai simulasi. Jangan membuat dashboard e-commerce, keranjang, kupon, checkout otomatis, atau menu sertifikasi sebagai produk.
```

## Prompt 3 — Konten dan media

Kirim setelah Prompt 2:

```text
Lanjutkan sistem visual CMS Albana yang sama. Buat layar untuk kelompok KONTEN WEBSITE, tetap dengan desktop 1440×900 dan satu contoh mobile untuk pustaka media.

1) MEDIA & DOKUMENTASI: satu menu sidebar, dua tab yang tetap mewakili sumber data berbeda: “Galeri beranda” dan “Media program/batch”. Galeri beranda mengelola dokumentasi umum; media program mengelola aset per program/batch. Jangan menggabungkan tabel datanya secara visual seolah satu record. Tampilkan grid thumbnail yang rapi, filter jenis/status/program, dan panel detail aset. Form unggah admin meminta gambar atau MP4, program/batch bila aset program, teks alternatif untuk gambar, serta status Draf/Terbit. Gambar sumber maksimal 10 MiB, MP4 maksimal 25 MiB; beri petunjuk resolusi minimum yang dapat diubah admin. Jelaskan bahwa gambar dioptimalkan, sedangkan MP4 tidak dikompresi ulang oleh server. Sediakan alur menambahkan URL YouTube sebagai pilihan terpisah. Terbit/tarik perlu status yang jelas. Media hero beranda masih statis dan tidak perlu tab atau toggle CMS hero.
2) ARTIKEL: daftar draf/terbit dan editor artikel pada halaman penuh. Judul, ringkasan, isi blok, gambar pendukung, pratinjau, simpan draf, terbitkan. Hindari toolbar berlebihan; area menulis cukup lebar dan nyaman.
3) PROFIL AKADEMI: rancangan pengaturan identitas dan metode belajar yang muncul di website. Tandai sebagai “Konsep menu baru” agar tidak terkesan sudah terpasang. Profil Alan dikelola pada Trainer, jadi jangan membuat dua editor bio Alan.
4) TESTIMONI & PARTNER: dua daftar sederhana untuk meninjau kutipan/atribusi dan identitas/logo partner. Beri penanda status dan catatan izin publikasi. Jangan mengarang testimoni, nama partner, logo, jumlah peserta, atau bukti hasil.

Tunjukkan keadaan media kosong dan media terisi menggunakan placeholder generik yang jelas diberi label “Contoh tampilan”. Foto contoh tidak boleh tampak seperti dokumentasi Albana yang sungguhan. Pada mobile, gunakan satu kolom dan drawer sidebar; thumbnail tetap bisa dibaca, aksi terbit tidak tersembunyi di hover.
```

## Prompt 4 — Pengaturan, mobile, dan penyempurnaan

Kirim setelah layar utama terbentuk:

```text
Pertahankan seluruh design system CMS Albana dari frame sebelumnya. Tambahkan layar PENGATURAN dan cek konsistensi responsif, aksesibilitas, serta keadaan kerja.

1) KONTAK PUBLIK: form untuk WhatsApp, email, Instagram, dan alamat publik. Preview ringkas memperlihatkan bagaimana kanal akan tampil di website. Setiap field berlabel jelas dan punya state validasi. Jangan letakkan nomor rekening di panel ini.
2) REKENING PEMBAYARAN: layar privat yang terpisah dari Kontak Publik. Tampilkan nama bank, pemilik rekening, nomor rekening yang sebagian dimask di daftar, status aktif, dan konfirmasi sebelum mengubah rekening aktif. Gunakan data placeholder; jangan menampilkan nomor rekening nyata. Beri petunjuk bahwa perubahan ini memengaruhi tagihan baru, bukan riwayat tagihan lama.
3) AKUN & HAK AKSES: konsep layar admin untuk daftar pengelola dan izin modul. Tandai sebagai rancangan yang memerlukan audit rute lama sebelum diimplementasikan. Jangan menyatakan bahwa menyembunyikan menu sudah cukup untuk melindungi data.
4) TIGA FRAME MOBILE sekitar 390px: Dashboard, Pendaftar, dan Tagihan. Sidebar menjadi drawer dengan tombol menu yang jelas. Tabel berubah menjadi kartu berlabel tanpa scroll horizontal. Tombol utama dan target sentuh minimal 44px. Footer aksi tidak menutupi konten atau keyboard.

Periksa semua frame: title/heading Plus Jakarta Sans, body/field Inter; field admin tetap Soft UI (bukan garis bawah); warna brand #26599A konsisten; kontras teks normal minimal 4.5:1; fokus keyboard terlihat; warna bukan satu-satunya penanda status; loading, kosong, gagal, berhasil, draf, terbit, menunggu, diverifikasi, dan ditolak punya tampilan yang berbeda. Kurangi dekorasi yang tidak membantu tugas operator. Buat prototipe klik untuk navigasi utama, membuka detail, menyimpan draf, serta dialog verifikasi tagihan bila Stitch mendukungnya.
```

## Saat meninjau hasil Stitch

Periksa apakah sidebar benar-benar terkelompok, tabel mudah dipindai, dan status pendaftaran berbeda dari status pembayaran. Bila Stitch membuat semua layar terlalu padat, minta satu layar per iterasi sambil merujuk ke frame Dashboard sebagai acuan visual. Jangan menerapkan hasil desain langsung sebagai bukti fitur CMS sudah berfungsi; [peta status implementasi](../architecture/README.md) mencatat selisihnya.
