# Design System Albana Speech Academy — Blue Editorial

## 1. Tujuan dan cakupan

Dokumen ini menjadi acuan visual untuk halaman publik Albana Speech Academy (ASA). Struktur editorial mengambil pelajaran dari dokumen lama `docs/web-komunitas/design-system.md` dan `docs/design-global/design_system.md`, tetapi identitas warnanya mengikuti **logo biru-putih ASA yang diberikan klien**. Kedua dokumen lama tersebut sudah tidak ada pada checkout saat ini; aturan yang masih relevan dirangkum di sini. [Brief proyek](../project/project-brief.md), [revisi kebutuhan 11 November](../project/website-revision-specification.md), dan [konten beranda](../content/home-page-content.md) menentukan audiens, urutan informasi, serta batas klaim.

Gambar memperlihatkan situs **Panggung Kreator**. Nama, logo, slogan, program, jumlah anggota, mitra, foto, serta detail kontak di gambar adalah **konten referensi**, bukan data Albana Academy. Gunakan identitas dan konten Albana yang sudah disetujui ketika desain diterapkan. Angka, testimoni, logo mitra, dan klaim hanya boleh tampil jika datanya tersedia dan dapat diverifikasi.

Dokumen ini mengatur halaman publik akademi: beranda, detail program, dokumentasi, trainer, jadwal, serta ajakan mendaftar atau berkonsultasi. Formulir academy memakai **line style** yang selaras dengan halaman editorial; admin memakai Soft UI dengan aturan formulir sendiri. Untuk warna dan arah halaman publik, dokumen ini menjadi acuan kanal bersama [spesifikasi visual lintas kanal](visual-design.md); aturan bisnis dan naskah pada dokumen lain tetap menjadi sumbernya.

### Cara membaca spesifikasi

- **Referensi editorial** berarti keputusan tata letak diambil dari gambar situs Panggung Kreator pada percakapan sebelumnya.
- **Referensi identitas** berarti warna dan karakter merek diambil dari gambar logo ASA yang diberikan klien pada percakapan ini.
- **Nilai implementasi** berarti token yang dipilih untuk desain ASA; sebagian merupakan penyesuaian dari logo dan harus diuji pada aset logo resmi, perangkat, serta media nyata.

Urutan keputusan jika sumber berbeda: **permintaan klien dan logo ASA → kebutuhan audiens serta konten Albana → aksesibilitas → pola editorial referensi**. Stabilo kuning, bidang hitam, dan warna pastel non-biru dari sumber lama tidak dipakai sebagai identitas ASA. Gambar logo terlampir menampilkan beberapa nuansa biru akibat bentuk dan pemrosesan gambar; `#26599A` dipilih sebagai biru dasar yang dekat dengan bagian dominannya, bukan sebagai klaim nilai merek resmi yang sudah ditetapkan klien.

### Sasaran desain dan target pasar

Brief menetapkan **mahasiswa hingga profesional muda** yang ingin meningkatkan kemampuan berbicara sebagai audiens utama. Revisi kebutuhan juga menetapkan jalur **in-house training** untuk organisasi atau klien korporat. Karena itu halaman harus terasa cukup segar untuk calon peserta individu, sekaligus cukup rapi dan tepercaya untuk pengambil keputusan di perusahaan.

| Pengunjung                                           | Yang perlu diputuskan                                                              | Bukti dan tindakan yang perlu mudah ditemukan                                                                       |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Mahasiswa dan profesional muda                       | Apakah latihan ini cocok, bagaimana cara belajar, kapan bisa ikut, berapa biayanya | Manfaat konkret, materi, contoh latihan, trainer, dokumentasi berizin, jadwal/harga terbit, tombol daftar.          |
| Pembicara yang ingin mengembangkan peran profesional | Apa beda program, apa syaratnya, bagaimana alur berikutnya                         | Perbandingan program, cakupan materi, detail sertifikasi yang telah dikonfirmasi, batch dan status.                 |
| Perwakilan organisasi                                | Apakah materi dapat disesuaikan dan siapa yang melatih tim                         | Format in-house, pendekatan pengajaran, pengalaman trainer yang terverifikasi, dokumentasi serta kontak konsultasi. |

Kesan **premium** dibangun lewat ketelitian: hierarki informasi yang tenang, ruang putih, foto asli berkualitas, komposisi biru yang terkendali, naskah ringkas, dan tindakan yang jelas. Premium tidak berarti seluruh layar dipenuhi warna biru, animasi, bayangan, atau klaim besar.

## 2. Karakter visual

Halaman terasa seperti editorial pendidikan profesional: putih bersih sebagai kanvas, judul biru tua atau tinta navy, foto kegiatan sebagai bukti, dan garis tipis biru-abu sebagai ritme. Bidang biru gelap menjadi jeda kuat untuk ajakan dan footer. Panel, foto, teks, dan statistik mengikuti batas grid. Logo ASA harus tampil jelas sebagai identitas, bukan sekadar ikon kecil yang tenggelam di antara dekorasi.

Prinsip yang harus tetap terbaca meski konten berubah:

1. **Tipografi memimpin.** Judul besar, padat, kapital, dan rapat; label kecil menjadi penanda konteks.
2. **Grid terlihat.** Garis horizontal dan vertikal membentuk komposisi, bukan sekadar menghias kartu.
3. **Satu keluarga biru.** Biru logo menandai merek dan aksi; biru pucat memberi highlight; navy menopang teks dan bidang gelap.
4. **Sudut tegas pada struktur.** Hero, foto, dan grid mempertahankan sudut siku; tombol dan kartu mandiri boleh memakai radius kecil. Field formulir publik tetap bergaris bawah tanpa radius.
5. **Tipografi selaras logo.** Sans tebal memuat pesan utama; perubahan ukuran, berat, dan ruang memberi jeda tanpa menambah font dekoratif.

## 3. Warna dan penggunaan

| Peran | Nilai acuan | Pemakaian |
|---|---|---|
| Putih / kanvas | `#FFFFFF` | Latar utama, bidang kartu, dan teks pada tombol atau panel biru gelap. |
| Navy / tinta | `#10243F` | Paragraf, judul pada bidang terang, dan teks pada stabilo. |
| Biru logo / utama | `#26599A` | Tautan utama, tombol utama, penanda aktif, dan elemen identitas pendukung. |
| Biru muda logo | `#3B72B5` | Detail kecil atau bidang grafis; jangan menjadi teks kecil di atas putih tanpa uji kontras. |
| Biru tua / bidang kuat | `#163E70` | Ajakan, footer, hover/pressed tombol, dan panel penting. |
| Biru pucat / stabilo | `#DCEBFA` | Sapuan di belakang frasa hero, kutipan pendek, atau label pilihan. |
| Biru sangat pucat | `#F3F7FC` | Panel pendukung agar halaman putih tidak monoton. |
| Teks sekunder | `#47607D` | Deskripsi, caption, metadata yang tetap perlu terbaca. |
| Garis halus | `#D8E4F0` | Pemisah grid di atas putih; dekoratif, bukan tepi kontrol. |
| Garis kuat | `#7895B8` | Tepi input/select (3,09:1 di atas putih) dan pembatas bidang yang perlu lebih jelas; gunakan hemat. |

Token biru utama dipilih dari rentang biru yang tampak pada gambar logo; token lain adalah turunan desain untuk hierarki dan aksesibilitas. Gunakan **aset logo asli** untuk masthead dan footer; jangan mengganti bentuk atau mewarnai ulang logo dari CSS. Bila klien memberikan brand guide resmi, cocokkan kembali token dengan nilai yang disahkan. Semua token biru tetap berada dalam satu keluarga; tidak ada kuning, hijau, merah, ungu, atau pastel hangat sebagai aksen dekoratif. Warna semantik untuk error/sukses formulir boleh berbeda karena menyampaikan status, bukan identitas merek.

### Proporsi dan pasangan warna

- **Dominan:** putih, sekitar dua pertiga bidang visual. Biru sangat pucat hanya untuk kelompok konten yang butuh pemisahan.
- **Identitas:** biru logo pada logo, tautan, satu CTA utama per konteks, dan beberapa penanda kunci.
- **Jeda kuat:** biru tua untuk satu atau dua panel besar, terutama ajakan dan footer. Hindari setiap seksi berganti putih-biru tua.
- **Sorotan:** biru pucat hanya pada satu frasa hero dan beberapa momen editorial yang sengaja dipilih. Stabilo tidak menandai seluruh judul atau setiap tombol.

| Teks / elemen | Latar | Rasio kontras acuan | Penggunaan |
|---|---|---:|---|
| `#10243F` | `#FFFFFF` | 15.60:1 | Teks utama. |
| `#26599A` | `#FFFFFF` | 7.05:1 | Tautan dan label biru. |
| `#47607D` | `#FFFFFF` | 6.49:1 | Teks sekunder. |
| `#FFFFFF` | `#26599A` | 7.05:1 | Tombol utama. |
| `#FFFFFF` | `#163E70` | 10.73:1 | Panel gelap dan footer. |
| `#163E70` | `#DCEBFA` | 8.84:1 | Teks di atas stabilo. |

Rasio dihitung untuk warna datar yang tercantum. Foto, transparansi, hover, dan hasil ekspor logo harus diuji terpisah. Garis dekoratif boleh lebih halus; tepi kontrol dan indikator fokus yang diperlukan untuk mengenali fungsi perlu kontras yang memadai.

### Aturan kontras

- Teks isi menggunakan navy atau teks sekunder yang cukup gelap. Label yang tampak sangat pudar pada tangkapan layar editorial tidak dijadikan target kontras.
- Jangan menaruh biru muda sebagai teks kecil di atas putih atau teks biru utama di atas panel biru tua.
- Stabilo biru pucat adalah **latar sapuan**, dengan navy atau biru tua sebagai teks di atasnya. Jangan jadikan biru pucat warna teks pada putih.
- Gunakan garis halus untuk ritme; gunakan garis kuat hanya untuk batas area yang perlu jelas. Border yang terlalu banyak dan terlalu gelap membuat halaman terasa seperti tabel.
- Palet ini tidak mengatur warna status formulir. Kesalahan, keberhasilan, dan fokus harus tetap dapat dibedakan dengan teks, ikon, atau bentuk, bukan warna saja.

## 4. Tipografi

### Keluarga huruf

| Peran | Acuan | Sifat |
|---|---|---|
| Judul `h1`–`h3`, angka editorial, navigasi, tombol | **Plus Jakarta Sans**, 600–800 | Bentuk tegas dan kontemporer; pakai 700 untuk judul, 600 untuk kontrol. |
| Paragraf, deskripsi, caption, label formulir | **Inter**, 400–600 | Nyaman untuk membaca syarat, jadwal, dan materi panjang. |
| Tabel, harga, tanggal, angka pembanding | **Inter** dengan `font-variant-numeric: tabular-nums` | Kolom angka stabil; tidak memakai font mono. |

Pasangan ini berlaku untuk situs publik. Admin CMS memakai Poppins sejak 16 November 2026 — lihat [pola UI admin](admin-ui-patterns.md). Serif miring pada gambar Panggung Kreator dan Poppins pada referensi style guide tidak menjadi font Albana. Kutipan memakai Inter dengan ukuran lebih lega; logo tetap memakai bentuk huruf pada aset resminya. Muat hanya bobot yang benar-benar dipakai dan gunakan fallback `system-ui, sans-serif` agar perubahan font tidak menggeser layout secara berlebihan.

### Hierarki

Kesan premium datang dari **jarak antar-tingkat yang lebar dan jumlah ukuran yang sedikit**: judul sangat besar dan rapat, label sangat kecil dan renggang, isi tenang di tengah. Sepuluh peran di bawah adalah seluruh skala; jangan menambah ukuran antara.

| Token | Peran | Ukuran (ponsel → desktop) | Font / bobot | Tinggi baris | Tracking |
|---|---|---|---|---:|---:|
| `--text-display` | Hero `h1` | `clamp(2.75rem, 1.5rem + 5.5vw, 6rem)` · 44 → 96px | Plus Jakarta Sans 800 | 0.98 | −0.035em |
| `--text-h2` | Judul bagian | `clamp(2rem, 1.25rem + 3vw, 3.5rem)` · 32 → 56px | Plus Jakarta Sans 700 | 1.08 | −0.025em |
| `--text-h3` | Judul kartu, subbagian | `clamp(1.375rem, 1.2rem + 0.7vw, 1.75rem)` · 22 → 28px | Plus Jakarta Sans 700 | 1.2 | −0.015em |
| `--text-h4` | Judul kecil, nama trainer | `1.125rem` → `1.25rem` · 18 → 20px | Plus Jakarta Sans 600 | 1.3 | −0.01em |
| `--text-numeral` | Nomor program, angka terverifikasi, harga utama | `clamp(3rem, 2rem + 4vw, 5rem)` · 48 → 80px | Plus Jakarta Sans 800, `tabular-nums` | 1 | −0.04em |
| `--text-quote` | Kutipan | `clamp(1.5rem, 1.2rem + 1.4vw, 2.25rem)` · 24 → 36px | Inter 400 | 1.35 | −0.01em |
| `--text-lead` | Paragraf pembuka hero dan bagian | `clamp(1.125rem, 1.05rem + 0.4vw, 1.375rem)` · 18 → 22px | Inter 400 | 1.55 | 0 |
| `--text-body` | Isi, deskripsi, formulir | `1rem` → `1.0625rem` · 16 → 17px | Inter 400 (500 untuk penekanan) | 1.65 | 0 |
| `--text-small` | Caption, metadata, teks bantuan | `0.875rem` · 14px | Inter 500 | 1.5 | 0 |
| `--text-label` | Overline `[ ... ]`, kategori | `0.75rem` · 12px, kapital | Plus Jakarta Sans 700 | 1.3 | +0.14em |

Navigasi dan tombol memakai Plus Jakarta Sans 600 pada `0.9375rem` (15px), tracking 0. Nilai `clamp` mencapai batas atas pada lebar sekitar 1200–1310px; di atas itu ukuran tetap.

Aturan yang membuat skala ini terbaca premium:

1. **Lompatan minimal 1,5×** antara dua tingkat yang bersebelahan dalam satu blok. Label 12px di atas `h2` 56px, lead 22px di bawah display 96px. Dua ukuran yang hampir sama (mis. 18 dan 20px berdampingan) terlihat ragu-ragu.
2. **Makin besar, makin rapat.** Tracking negatif hanya pada 22px ke atas; isi dan teks kecil tetap 0; hanya label kapital yang direnggangkan.
3. **Paling banyak tiga ukuran dan dua bobot per layar pertama** suatu bagian: label, judul, isi.
4. **Lebar baris dikunci:** isi 60–68ch, lead 44–52ch, display 12–16ch per baris. Gunakan `text-wrap: balance` pada judul dan `text-wrap: pretty` pada paragraf.
5. **Harga, tanggal, dan instruksi tidak pernah memakai `--text-small` atau `--text-label`.** Yang penting bagi keputusan minimal `--text-body`.
6. **Angka memakai `--text-numeral` dengan labelnya di `--text-label`**, bukan angka sedang dengan label sedang.
7. **Font tidak boleh menggeser layout.** Muat berkas variable lewat `next/font` dengan fallback yang metriknya disesuaikan. Bobot yang dipakai halaman publik: Inter 400, 500, 600 dan Plus Jakarta Sans 600, 700, 800; tabel per kanal ada di [spesifikasi visual](visual-design.md).

Teks kapital dipakai untuk label, navigasi, tombol pendek, dan judul pendek yang membutuhkan tekanan. Paragraf panjang dan judul informatif memakai kapitalisasi normal agar mudah dibaca. Jangan memaksakan pemenggalan baris dari gambar ke teks Albana; atur `max-width` atau lebar kolom agar ritme judul tetap terjaga pada setiap layar.

### Stabilo pada judul

Pada gambar editorial, stabilo memberi titik perhatian pada satu frasa. Untuk ASA, gunakan **biru pucat `#DCEBFA`**, dengan teks navy `#10243F` atau biru tua `#163E70`. Sapuan mengikuti setiap baris jika frasa membungkus; tampilannya harus tetap terbaca sebelum animasi berjalan dan saat animasi dimatikan. Jangan menyalin frasa dari merek lain.

```css
.editorial-highlight {
  background: linear-gradient(transparent 42%, #dcebfa 42%, #dcebfa 86%, transparent 86%);
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}
```

Kode tersebut hanya contoh perlakuan visual. Atur posisi sapuan terhadap metrik font yang dipakai agar tidak menutupi huruf. Hindari highlight pada setiap judul atau CTA. Biru logo yang lebih pekat **tidak** dipakai sebagai sapuan di belakang teks biru karena menurunkan keterbacaan.

## 5. Grid, ruang, dan garis

### Keputusan bentuk untuk profesional dan eksekutif muda

**Zero radius pada seluruh situs terlalu kaku** untuk pengalaman belajar dan pendaftaran yang ditujukan juga kepada profesional muda. Pertahankan sudut siku pada kerangka editorial—hero, bidang foto, garis pembagi, pita warna, dan footer—agar identitasnya tetap tegas. Beri pembulatan kecil hanya pada bagian yang disentuh atau menjadi kelompok tugas. Ini menjaga kesan terarah tanpa membuat akademi terasa seperti dashboard.

| Peran | Radius | Alasan |
|---|---:|---|
| Hero, foto editorial, pita/stabilo, garis pembagi, footer | `0` | Menjaga komposisi editorial dan tepi grid. |
| Kartu program dan panel informasi yang berdiri sendiri | `8px` | Memisahkan kelompok tanpa efek kartu mengambang. |
| Tombol dan kartu mandiri | `8px` | Memperhalus area tindakan tanpa mengubah grid editorial. |
| Input, select, textarea pendaftaran | `0` | Field line style memakai garis bawah, bukan kotak. |
| Dialog pendaftaran | `12px` | Memisahkan lapisan sementara dari halaman. |
| Chip kategori/status | `999px` hanya jika berfungsi sebagai chip | Mudah dibedakan dari panel dan tombol. |
| Potret/avatar yang memang berbentuk lingkaran | `50%` | Mengikuti bentuk aset, bukan mengubah foto kegiatan. |

Jangan menambah radius pada setiap kotak. Sebuah kartu yang menjadi satu sel dalam grid bergaris dapat tetap `0`; pilih `8px` hanya bila kartu benar-benar berdiri sendiri dan konsisten dalam satu kelompok. Gunakan border halus untuk struktur; bayangan bukan pengganti hierarki.

### Sistem halaman

- **Kanvas luar:** bidang putih penuh selebar viewport. Header, hero, deret kartu, panel biru tua, dan footer dibatasi garis horizontal seperlunya.
- **Konten dalam:** batasi lebar teks dan elemen navigasi agar tetap nyaman dibaca. `max-w-7xl` dengan padding horizontal sekitar `1.5rem` adalah titik awal dari desain global; bagian foto atau grid dapat melebar sampai tepi bidang jika komposisinya menuntut.
- **Hero:** gunakan komposisi dua bidang: identitas, pesan, dan CTA di kiri; satu foto kegiatan atau poster video dokumentasi yang berizin di kanan. Jika belum ada media kegiatan yang layak terbit, potret Alan boleh menjadi fallback yang diberi konteks sebagai profil, bukan dokumentasi kelas.
- **Judul bagian:** label kecil di atas judul kiri; penjelasan singkat berada di kanan atau di bawahnya. Garis bawah menutup blok sebelum konten berikutnya.
- **Kartu berulang:** tidak memakai sela yang tampak seperti kartu mengambang. Pembatas antar kolom dan baris membangun satu matriks.
- **Ruang kosong:** sisakan bidang putih yang nyata, terutama pada hero dan antarbab. Jangan mengisi setiap ruang dengan badge atau dekorasi.

Ukuran pada gambar adalah komposisi referensi, bukan spesifikasi piksel. Untuk awal implementasi, gunakan padding bagian sekitar `4–6rem` pada desktop dan `2.5–4rem` pada mobile; sesuaikan terhadap panjang teks dan tinggi foto. Garis struktur sekitar `1px`. Pertahankan sudut siku, tanpa bayangan dekoratif. Hindari kotak biru pucat pada setiap seksi; ruang putihlah yang membuat bidang biru terasa penting.

### Komposisi hero dengan dokumentasi

Media hero pada halaman terbit menampilkan **kegiatan Albana yang nyata**, idealnya peserta sedang berlatih berbicara atau menerima umpan balik. Pilih satu frame utama yang kuat; video pendek boleh menggantikannya bila rekamannya berizin, punya poster yang jelas, dan pengunjung memulai pemutaran sendiri. Jangan membuat kolase kecil yang mengalahkan H1. Untuk tahap desain, satu media dummy boleh mengisi bidang ini dengan penanda terlihat **“Contoh visual — bukan dokumentasi kelas Albana”**. Pilihan media hero saat ini bersifat statis di halaman; menu CMS khusus hero belum dibutuhkan sampai ada instruksi beralih ke data dinamis. Potret Alan `front/public/images/alan-albana-profile-blue-background.png` adalah fallback profil bila belum ada dokumentasi kegiatan yang siap terbit; jangan memberi caption seolah-olah itu foto kelas. Pindahkan pengantar Alan yang lebih panjang ke seksi profil agar hero tetap membahas manfaat peserta.

| Bagian | Desktop ≥1024px | Tablet 768–1023px | Ponsel <768px |
|---|---|---|---|
| Susunan | Grid 12 kolom: isi kiri 5, media kanan 7; kedua tepi mengikuti kontainer halaman | Dua kolom sekitar 45:55 bila teks masih lega; bila tidak, tumpuk | Satu kolom: identitas, H1, uraian, CTA, lalu media |
| Isi | Logo resmi di atas H1, label singkat bila perlu, H1, satu paragraf, dua CTA | Kurangi ukuran H1 dan jarak; jangan mengecilkan CTA | Logo dan manfaat dapat dibaca sebelum foto; CTA membungkus atau bertumpuk penuh lebar |
| Media | Foto/thumbnail video 16:10 atau 4:3 dengan titik perhatian jelas; satu caption singkat di bawah | Rasio 4:3 bila crop aman; tombol putar tetap terlihat | Media selebar kolom, 4:3 atau rasio asli yang tidak memotong subjek penting |
| Pemisah | Ruang putih dan satu garis `#D8E4F0` bila perlu | Hilangkan garis saat kolom mengecil | Tidak perlu garis jika jarak sudah memisahkan teks dan media |

Pada desktop, mulai dengan kontainer sekitar `max-w-7xl`, padding horizontal `1.5–3rem`, dan jarak antarkolom sekitar `2–4rem`. Media harus cukup besar untuk memperlihatkan tindakan dan suasana kelas, tetapi tidak menimpa judul atau menjadi latar CTA. Teks pada foto hanya boleh berupa caption di luar bidang media. Jangan memberi bingkai bulat atau bayangan dekoratif. Saat video belum diputar, tampilkan poster dan tombol putar berlabel; jangan memuat video berat sebelum interaksi.

Urutan baca kiri: logo/identitas → H1 → penjelasan manfaat latihan → CTA utama → CTA sekunder → media. [Naskah beranda](../content/home-page-content.md) adalah sumber teks dan tujuan tautan. Dengan H1 saat ini, stabilo `#DCEBFA` cukup pada kata **“Speech”**. Jangan menambah angka peserta, badge sertifikasi, atau testimoni pada hero hanya untuk mengisi ruang. Bila media gagal dimuat, teks dan CTA tetap utuh; pertahankan rasio bidang dan sediakan pesan pemulihan yang tepat untuk video.

Setelah hero, tampilkan **Program** sebagai jawaban pertama, lalu satu bukti visual singkat tentang proses latihan sebelum uraian metode yang lebih panjang. Potret Alan ditempatkan pada seksi profil, bukan diulang sebagai dokumentasi. Saat tema gelap aktif, media tetap memakai warna alaminya, sementara kanvas dan garis mengikuti token tema gelap.

### Pola grid menurut konten

| Pola | Penggunaan pada gambar | Adaptasi |
|---|---|---|
| Dua bidang | Pesan dan foto pada referensi | Hero ASA memakai pesan kiri dan dokumentasi utama kanan; tumpuk pesan lalu media pada layar sempit. |
| Tiga kolom | Pilar dan deret program | Boleh menjadi dua lalu satu kolom sesuai ruang nyata. |
| Empat kolom | Tahap perkembangan | Tumpuk atau buat dua kolom bila teks masih nyaman. |
| Lima sel statistik | Angka anggota dan empat nilai/keunggulan | Jangan memaksakan lima kolom pada tablet; susun ulang. |
| Galeri editorial | Dokumentasi besar dan kecil | Foto utama lebar, rangkaian foto pendukung, dan video yang punya poster; jumlah kolom mengikuti media serta caption yang benar-benar tersedia. |

Dokumen web komunitas menyebut empat kolom untuk pilar, tetapi **gambar menampilkan tiga pilar**. Jumlah kolom mengikuti jumlah konten yang benar-benar ditampilkan Albana, bukan angka tetap dari dokumen sumber.

## 6. Gambar dan media

Gambar rujukan memakai dokumentasi manusia dan aktivitas nyata. Menurut pengguna, semua foto yang diunggah telah berizin; pemilihan foto/video untuk tiap konteks dan publikasi tetap perlu dilakukan. Di ASA, dokumentasi kelas menjadi bahan utama landing page ketika media yang sesuai sudah dipilih. Media tidak ditumpuk hanya di galeri akhir: satu visual utama di hero, satu bukti singkat dekat pilihan program, potongan proses di bagian cara belajar, lalu galeri lebih lengkap. Setiap foto/video harus menjelaskan kegiatan atau suasana yang berbeda; jangan mengulang satu aset demi memenuhi grid. Selama desain memakai dummy, tampilkan penanda pratinjau yang terbaca pada setiap kelompok media, termasuk dialog foto. Gambar `front/public/images/preview/` adalah pratinjau, bukan bukti kelas Albana.

- **Hero:** satu foto kegiatan atau poster video menjadi media terbesar. Pada tahap desain, pilih dummy statis tanpa membuat menu CMS hero; beri penanda “Contoh visual — bukan dokumentasi kelas Albana”. Potret Alan hanya fallback profil jika dokumentasi belum siap; jangan menyebutnya suasana kelas.
- **Program:** satu foto relevan dapat mendampingi ringkasan program; tanpa foto, blok program tetap utuh dan setara. Jangan menyiratkan suatu foto merekam batch tertentu jika tidak demikian.
- **Cara belajar:** tampilkan rangkaian 2–3 foto yang memperlihatkan latihan, umpan balik, dan hasil praktik; satu video pendek dapat menggantikan salah satu foto bila isinya menambah penjelasan.
- **Dokumentasi:** galeri editorial menampilkan foto besar dan kecil sesuai jumlah aset nyata. Video mendapat kartu dengan poster, durasi, tombol putar, caption, dan transkrip/subtitel bila memuat ucapan. Jangan memaksa pola enam foto saat hanya dua yang tersedia.
- **Logo mitra:** tampil sebagai logo asli dengan ruang kosong yang cukup. Jangan menambah logo atau menyatakan kerja sama tanpa persetujuan pemiliknya.

Titik fokus foto harus tetap terlihat saat dipotong di mobile. Sediakan `alt` yang menjelaskan kegiatan jika foto membawa informasi; gunakan `alt=""` untuk foto dekoratif yang sudah dijelaskan oleh teks di dekatnya. Hindari teks penting yang menjadi bagian dari bitmap. Sediakan rasio gambar atau ukuran eksplisit agar susunan halaman tidak melompat saat media dimuat. Video tidak autoplay dengan suara; poster dapat dimuat lebih dulu, video setelah pengguna menekan putar. Sediakan kontrol jeda, subtitel untuk percakapan, dan transkrip ringkas bila isi video penting untuk memahami program. Pilih media tajam, pencahayaan wajar, dan manusia dalam situasi latihan yang nyata; jangan menambahkan tint biru tebal di semua foto.

## 7. Komponen editorial

### Navigasi dan header

Header putih dan tipis, dengan **logo resmi berukuran cukup untuk dikenali** di kiri, tautan utama di tengah atau kanan, satu tombol biru untuk tindakan utama, serta pengubah tema yang diminta klien. Navigasi menggunakan Plus Jakarta Sans dan tracking secukupnya. Garis biru-abu memisahkannya dari hero. Tautan aktif perlu terlihat melalui garis, bobot, atau penanda lain; jangan mengandalkan warna pudar. Pada mobile, pertahankan akses ke semua tautan dengan menu yang dapat dipakai lewat keyboard.

### Label dalam kurung siku

Format `[ NAMA BAGIAN ]` berfungsi sebagai overline sebelum judul atau sebagai penanda metadata. Pakai jarak huruf lebar dan ukuran lebih kecil dari deskripsi. Jangan gunakan label sebagai satu-satunya judul semantik suatu bagian.

### Kartu pilar

Setiap bidang keahlian memuat nomor besar, nama, ringkasan, lalu contoh kegiatan pendek yang dipisah garis. Gambar menampilkan tiga pilar merek lain; **jangan** menyalin public speaking, content creation, dan personal branding sebagai tiga program ASA. [Konten beranda](../content/home-page-content.md) membedakan bidang pelatihan, dua pilihan program yang dijual, dan format pelatihan. Jumlah kolom mengikuti isi yang terbit.

### Kartu program

Susunan kartu program ASA: nomor atau kategori → nama program → untuk siapa → materi dan manfaat → status batch/harga yang telah disahkan → tindakan. Foto kegiatan berizin dapat masuk sebagai bukti, tetapi kartu tetap lengkap bila foto belum tersedia. Dua program publik pada [konten beranda](../content/home-page-content.md) dibedakan lewat teks, bukan warna yang berbeda-beda. Jika kartu dapat diklik, seluruh area interaktif harus punya nama yang jelas dan keadaan fokus yang terlihat. Detail program menyediakan tempat untuk dokumentasi foto dan video yang telah disetujui, sesuai [revisi kebutuhan](../project/website-revision-specification.md).

### Statistik dan klaim

Angka besar dengan label dan penjelasan pendek membentuk deret ringkas. Hanya gunakan angka yang punya sumber dan masa berlaku. Angka tidak perlu dianimasikan agar dapat dipahami; animasi hitung naik boleh ditambahkan jika tidak menghalangi pembacaan nilai akhir.

### Tahap perkembangan

Nomor fase besar, judul tindakan, dan ringkasan menjelaskan proses belajar ASA. Foto hanya bila tersedia dan berizin. Urutannya harus bermakna dan tetap terbaca ketika kartu ditumpuk pada mobile. Jumlah fase mengikuti metode yang benar-benar dipakai; jangan meminjam empat fase dari gambar referensi.

### Kutipan

Kutipan atau pernyataan singkat dapat ditempatkan pada bidang putih yang tenang, memakai Inter lebih besar dan satu frasa dengan stabilo **biru pucat**. Jika dikaitkan dengan peserta atau trainer, gunakan nama serta izin publikasi yang benar. Jika belum ada kutipan berizin, hilangkan blok ini; jangan mengarang testimoni untuk melengkapi komposisi.

### Ajakan bergabung dan footer

Panel ajakan memakai **biru tua `#163E70`**, judul putih besar, ringkasan manfaat, dan satu tindakan utama yang jelas. Untuk individu, tindakan menuju batch terbuka atau penjelasan program; untuk organisasi, menuju konsultasi in-house. Hindari tombol yang tampak aktif tetapi belum menuju tujuan. Footer melanjutkan biru tua dengan **versi logo putih resmi**, navigasi, kontak yang benar, dan informasi legal. Teks isi di atas biru tua harus cukup terang, termasuk label kecil.

### Tombol, tautan, dan kontrol

| Komponen | Normal | Hover / aktif | Fokus |
|---|---|---|---|
| Tombol utama | Latar `#26599A`, teks putih, radius `8px` | Latar `#163E70`; label tetap | Outline jelas dengan offset; pada bidang biru tua gunakan outline putih. |
| Tombol sekunder | Putih, teks dan border `#26599A` | Biru sangat pucat `#F3F7FC` | Outline biru tua. |
| Tautan isi | Biru logo dengan garis bawah | Biru tua, garis bawah tetap | Outline biru tua. |
| Input, select, textarea publik | Latar transparan, hanya garis bawah `1px #7895B8`, radius `0` | Garis bawah `#26599A` | Garis 2px biru + ring fokus yang tidak tertutup; galat memakai warna status dan pesan teks. |
| Pilihan aktif | Garis/bobot serta teks, bukan hanya isian biru | Keadaan tetap dikenali setelah hover | Fokus terpisah dari penanda aktif. |

Target sentuh minimal sekitar `44 × 44px`. Gunakan label tindakan yang menjelaskan hasilnya, seperti “Lihat jadwal”, “Daftar program”, atau “Konsultasi in-house”. Jangan menampilkan tombol daftar untuk batch tertutup seolah-olah masih terbuka.

### Formulir academy: line style

Formulir pendaftaran, konsultasi, dan field publik lain memakai **line style** sebagai bagian dari bahasa editorial academy. Label Inter 14–16px selalu terlihat di atas garis; nilai, petunjuk, dan pesan galat juga Inter. Field tidak memakai panel terisi, radius kartu, atau bayangan Soft UI admin. Select, date picker, dan textarea mempertahankan garis bawah yang sama; menu popover boleh memakai permukaan putih dengan border dan radius 8–12px agar daftar pilihan terbaca. Checkbox/radio tetap memiliki bentuk asli dan label yang dapat diklik.

Sediakan ruang vertikal yang cukup sehingga garis bawah tidak terasa seperti teks biasa. Keadaan wajib: kosong, terisi, fokus, disabled, valid, galat, dan loading. Galat berada tepat di bawah field, terkait melalui `aria-describedby`; jangan hanya mengubah warna garis. Fokus keyboard harus terlihat pada latar putih dan biru muda. Pada ponsel setiap field satu kolom dengan area sentuh minimal 44px. Ringkasan batch, harga, dan kebijakan tetap berada di atas isian tanpa disembunyikan oleh animasi langkah.

## 8. Urutan dan ritme halaman Albana

Urutan informasi mengikuti pertanyaan pengunjung pada [revisi kebutuhan](../project/website-revision-specification.md) dan naskah yang tersedia di [konten beranda](../content/home-page-content.md). Komposisi editorial gambar tetap menjadi rujukan ritme, **bukan** susunan atau isi yang disalin persis. Jika ada perubahan urutan publik, perbarui dokumen konten dan navigasi bersamaan.

| Urutan | Bagian ASA | Fungsi desain dan perlakuan biru-putih |
|---|---|---|
| 1 | **Manfaat training** — hero dan pita manfaat | H1 dan CTA berada di kiri; foto kegiatan atau poster video berizin di kanan. Bila belum ada dokumentasi, fallback potret Alan dilabeli sebagai profil. Empat hasil yang dituju menyusul sebagai pita bergaris di bawah hero. |
| 2 | **Program training** — pilihan program dan bukti proses | Tiga program Public Training serta panel Inhouse mudah dibandingkan; satu foto relevan boleh mendampingi tiap program bila tersedia. Satu media lebar tentang latihan nyata menutup bab ini; hilangkan bila belum ada media berizin. |
| 3 | **Kredibilitas lembaga** — tentang ASA dan Alan, cara belajar, pita klien | Bidang permukaan sekunder. Potret Alan berizin dan narasi lembaga (jangan mengulang foto hero); model 70/20/10 dan kerangka empat tingkat; pita klien hanya bila izin tercatat. |
| 4 | **Testimoni & hasil** — testimoni dan dokumentasi | Kutipan berizin, lalu galeri editorial foto serta video dengan caption, poster, dan kontrol pemutaran; jumlah sel mengikuti aset nyata. Tanpa testimoni terbit, bab ini hanya berisi dokumentasi. |
| 5 | **Trainer / mentor** | Profil yang benar dan sesuai program; potret resmi hanya bila izin tersedia. |
| 6 | **Harga & jadwal** | Bidang permukaan sekunder. Data terbit yang mudah dipindai; keadaan terbuka, penuh, tutup, dan belum ada jadwal terlihat jelas. |
| 7 | **Cara pendaftaran** — tiga langkah dan dua jalur | Jelaskan alur formulir, tagihan, dan verifikasi; bedakan jalur Public Training dan in-house. Formulir publik memakai line style. |
| — | Ajakan terakhir, kontak, dan footer | Bidang biru tua untuk tindakan yang tersedia, diikuti kontak terverifikasi dan logo putih resmi. |

Urutan 1–7 mengikuti tujuh prioritas pada [revisi kebutuhan §I.3](../project/website-revision-specification.md). Susunan tiap seksi per lebar layar ada di [layout landing page](academy-landing-layout.md).

Ritmenya berganti antara pengantar tipografis, grid padat, jeda putih, foto nyata, dan satu bidang biru tua. Jangan menyusun semua bagian menjadi kartu yang sama tinggi atau menambah bagian hanya untuk mengejar panjang halaman referensi. Pada halaman detail program, urutkan: manfaat dan kecocokan → materi → bukti foto/video → trainer → jadwal/harga/status → pendaftaran. Untuk in-house, tindakan utamanya konsultasi, bukan formulir batch publik.

### Tema terang dan gelap

[Revisi kebutuhan](../project/website-revision-specification.md) meminta pengubah Light Mode dan Dark Mode. **Tema terang adalah tampilan utama merek**: putih, navy, biru logo, dan stabilo biru pucat. Tema gelap tetap biru-putih, tanpa berubah menjadi hitam generik atau neon.

| Peran | Terang | Gelap |
|---|---|---|
| Kanvas | `#FFFFFF` | `#10243F` |
| Permukaan sekunder | `#F3F7FC` | `#163E70` |
| Teks utama | `#10243F` | `#FFFFFF` |
| Teks sekunder | `#47607D` | `#DCEBFA` |
| Aksen/tautan | `#26599A` | `#BBD7F5` |
| Stabilo | `#DCEBFA` + teks `#163E70` | `#26599A` + teks putih |
| Garis | `#D8E4F0` | `#7895B8` |

Pada tema gelap, gunakan logo putih resmi bila tersedia; jangan membalik warna file logo biru secara otomatis. Tombol utama dapat memakai putih dengan teks navy pada panel biru tua, atau biru muda dengan teks navy setelah kontras diverifikasi. Simpan pilihan tema dan hormati preferensi sistem bila belum ada pilihan pengguna. Uji semua keadaan kontrol, foto, overlay, dan fokus pada kedua tema.

## 9. Responsif

| Lebar | Keputusan tata letak |
|---|---|
| Desktop lebar | Hero dua bidang dengan isi kiri dan media utama kanan; program dapat dua kolom; dokumentasi memakai satu frame besar dan beberapa frame pendukung sesuai aset. |
| Tablet | Kurangi jumlah kolom sesuai lebar isi. Pindahkan deskripsi judul bagian ke bawah bila kolom kanan terlalu sempit. |
| Ponsel | Logo, manfaat, dan CTA tampil sebelum media; judul tidak terpotong; program satu kolom; galeri satu kolom atau dua hanya jika caption tetap jelas; video tidak memulai unduhan besar sebelum diputar. |

Breakpoint adalah alat, bukan tujuan. Uji berdasarkan saat judul, foto, atau teks mulai bertabrakan. Garis vertikal di desktop berubah menjadi garis horizontal ketika bidang bertumpuk. Hindari scroll horizontal halaman. Sediakan target sentuh yang nyaman dan ruang antar tautan yang cukup. Bila satu kartu memuat teks panjang, biarkan tingginya bertambah daripada memangkas informasi penting.

## 10. Interaksi, gerak, dan keadaan

Gerak membantu pengunjung memahami perubahan keadaan dan urutan baca. Ambil prinsip dari [animate](https://github.com/emilkowalski/skills/blob/main/skills/animate/SKILL.md) dan [animation-performance](https://github.com/emilkowalski/skills/blob/main/skills/animation-performance/SKILL.md) milik Emil Kowalski: pilih dahulu tujuan gerak, gunakan `transform`/`opacity`, batasi durasi UI, dan hormati preferensi reduced motion. Perintah `npx skills@latest add emilkowalski/skills` adalah cara mengambil sumber skill tersebut; panduan ini merangkum prinsipnya, tidak mewajibkan paket runtime baru.

| Momen | Gerak yang dipakai | Durasi awal | Batas |
|---|---|---:|---|
| Respons tombol/tautan | Warna dan border dengan `ease`; press dapat sedikit menekan | 100–160 ms | Fokus keyboard muncul langsung; tidak ada delay klik. |
| Hero: penjelasan dan CTA | Memudar dan naik maksimal 12px; mulai saat judul mulai terbaca, tidak menunggu semua baris selesai | 350 ms; jeda 60 ms | W1–W3 dapat berjalan bersamaan. Teks dan CTA sudah ada di DOM serta dapat dipakai sejak awal. |
| Isi seksi saat scroll | Satu kelompok memudar dan bergeser searah gulir; berulang saat digulir turun **dan** naik | 600 ms; jeda 70 ms | Diperbarui 16 November 2026: gerak beranda dua arah dengan kosakata G1–G7 di [konten beranda §1.3](../content/home-page-content.md). Bukan parallax. |
| Ganti gambar/slide yang dipicu pengguna | Crossfade ringan; arah tetap jelas | 180–280 ms | Teks alternatif dan kontrol tetap dapat dipakai. |
| Dialog/lembar pendaftaran | Opacity + translasi kecil dari sumber interaksi | 200–300 ms | Fokus dipindah segera dan tetap terperangkap. |
| Navigasi anchor | Gulir halus hanya saat dipicu pengguna | mengikuti jarak, terasa singkat | Beri `scroll-margin-top` untuk header; jangan menjalankan dua mesin smooth scroll. |

Gunakan `--ease-out` untuk elemen masuk, `--ease-in-out` untuk perpindahan yang tetap terlihat, dan `--ease-expo` hanya untuk gerak khas. Gunakan CSS transition untuk interaksi sederhana. GSAP/Lenis yang sudah ada boleh dipakai bila memang diperlukan untuk koordinasi yang lebih rumit; jangan memasang pustaka motion baru hanya untuk fade. Hindari `transition: all`, animasi `width`/`height`/`top`/`left`, parallax besar, marquee otomatis, dan gerak berulang yang mengganggu membaca.

Terapkan reveal hanya bila elemen benar-benar terlihat, tanpa menyembunyikan konten jika JavaScript atau observer gagal. Untuk `prefers-reduced-motion: reduce`, matikan translasi dan smooth scroll; jika penanda keadaan masih perlu, gunakan perubahan opacity singkat atau tampilkan keadaan akhir seketika. Efek hover yang bergerak hanya aktif pada `@media (hover: hover) and (pointer: fine)`. Uji di ponsel kelas menengah agar gulir tetap lancar; bila foto besar atau konten panjang menyebabkan frame tersendat, hilangkan efeknya dahulu.

### Token gerak

```css
:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);     /* masuk biasa */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1); /* perpindahan */
  --ease-expo: cubic-bezier(0.16, 1, 0.3, 1);     /* masuk yang tegas, gerak khas */
  --dur-instant: 100ms;  /* press */
  --dur-fast: 160ms;     /* hover, warna */
  --dur-base: 250ms;     /* dialog, langkah formulir, sapuan tombol */
  --dur-slow: 450ms;     /* reveal isi, stabilo */
  --dur-sig: 800ms;      /* gerak khas: judul, potret, panel */
  --stagger-line: 80ms;  /* antarbaris judul */
  --stagger-item: 60ms;  /* antarelemen isi */
}
```

Durasi mengikuti ukuran teks: makin besar hurufnya, makin panjang dan tegas geraknya. `--text-display` 800 ms, `--text-h2` 700 ms, isi dan lead 450 ms, label 250 ms. Label masuk lebih dulu, judul menyusul, isi terakhir; urutan gerak sama dengan urutan baca.

### Gerak khas

Satu lapis gerak khas berjalan di atas gerak dasar. Gagasannya diambil dari subjek akademi: **penekanan saat berbicara**. Teks masuk seperti kalimat yang diucapkan baris demi baris, stabilo menyapu seperti kata yang ditekan. Kekuatan datang dari satu momen yang tegas, bukan dari jumlah efek; karena itu gerak khas dibagi tiga tingkat.

**Tingkat Wajib** — pola dasar saat pengguna mengizinkan gerak. Reduced motion mengikuti aturan di bawah. Gerak masuk memakai `transform` dan `opacity`; warna kontrol adalah respons visual terpisah.

| # | Momen | Gerak | Durasi / easing | Catatan |
|---|---|---|---|---|
| W1 | Hero `h1` | Tiap baris naik dari balik masker (`overflow: hidden`, `translateY(105%) → 0`), bergiliran | 700 ms, `--ease-expo`, jeda 80 ms | Gerak khas utama situs. CSS menjalankan animasi hanya jika kelas `motion-ready` sudah aktif sebelum paint pertama; jika terlambat, tampilkan judul tanpa animasi. CTA tetap dapat dipakai sejak awal. |
| W2 | Stabilo “Speech” | Sapuan `scaleX(0 → 1)` dari kiri, `transform-origin: left`, setelah baris yang disorot mulai terlihat | 350 ms, `--ease-out` | Berjalan di belakang teks dan boleh tumpang tindih dengan W1; teks tidak ikut bergerak. |
| W3 | Media hero | Wadah `overflow: hidden`; foto atau poster video naik `translateY(8%) → 0` dengan `scale(1.06 → 1)` dan `opacity 0 → 1` | 800 ms, `--ease-expo` | Mulai bersama W1; poster tidak berganti menjadi video otomatis. Wadah memakai rasio tetap sehingga tidak ada pergeseran layout. |
| W4 | Tombol utama (hover) | Isian `#163E70` menyapu dari kiri lewat pseudo-elemen `scaleX` | 250 ms, `--ease-out` | Press tetap `scale(0.98)` 100 ms. Hanya pointer yang mendukung hover. |
| W5 | Langkah formulir | Geser 16px searah maju/mundur dengan fade; bilah progres `scaleX` | 250 ms, `--ease-out` | Fokus pindah ke judul langkah segera, tidak menunggu animasi. |

**Tingkat Per halaman** — dipakai hanya bila ada alasan tertulis untuk halaman itu dan lolos uji gugur di bawah.

| # | Momen | Gerak | Durasi / easing | Alasan yang sah |
|---|---|---|---|---|
| P1 | Judul seksi saat scroll | Masker per baris seperti W1; garis pembagi `scaleX(0 → 1)` | 700 ms; garis 600 ms | Halaman panjang yang butuh penanda pergantian bab. Sekali per seksi. |
| P2 | Angka terverifikasi | Hitung naik dengan `tabular-nums`, lebar kolom dikunci | 900–1200 ms, `--ease-out`, sekali | Angka bersumber dan menjadi isi utama seksi. Nilai akhir sudah ada di HTML. |
| P3 | Kartu program (hover) | Foto `scale(1.04)`, panah geser 4px, garis bawah judul menggambar | 500 ms foto; 200 ms sisanya | Kartu dapat diklik dan punya foto berizin. Hanya `@media (hover: hover) and (pointer: fine)`. |
| P4 | Tanda terima pendaftaran | Centang digambar (`stroke-dashoffset`), lalu ID pendaftaran muncul | 600 ms, sekali | Menandai tugas selesai. Satu-satunya momen perayaan; tanpa confetti. |

**Tingkat Eksperimen** — tidak dibangun sampai dua tingkat di atas stabil di perangkat nyata. Tiap butir butuh prototipe dan uji sendiri.

| # | Momen | Gerak | Risiko yang harus diuji |
|---|---|---|---|
| E1 | “Cara belajar” di desktop | Seksi di-pin; langkah berganti mengikuti scroll (GSAP ScrollTrigger, pin ≤ 2 viewport, hanya ≥ 1024px) | Membajak scroll; bentrok dengan Lenis; keyboard dan zoom. |
| E2 | Kartu program → detail | View Transition untuk judul dan foto, 350 ms | Dukungan Next.js dan browser; harus tetap berfungsi sebagai navigasi biasa. |
| E3 | Panel ajakan biru tua | Bidang naik dari balik masker `overflow: hidden` + `translateY`, lalu judul per baris | Dua gerak besar berurutan dekat CTA terakhir. |
| E4 | Header | Sembunyi saat scroll turun, muncul saat scroll naik (`translateY`, 200 ms) | **Diadopsi untuk beranda 16 November 2026** (lihat [konten beranda §1.3](../content/home-page-content.md)); tetap muncul saat fokus keyboard berada di header. |

Aturan saat efek bertemu dalam satu layar:

1. **Paling banyak satu gerak khas berjalan pada satu waktu.** Sisanya turun menjadi fade dasar.
2. **Tingkat lebih tinggi menang:** Wajib di atas Per halaman, Per halaman di atas Eksperimen.
3. **Bila setingkat, yang lebih dekat ke tindakan utama menang.** Di hero, W1–W3 dihitung satu komposisi yang saling tumpang tindih, bukan tiga tahap berurutan. Uji waktu akhir pada jumlah baris nyata di 320px dan desktop; jangan membuat CTA menunggu gerak.
4. **Hover (W4, P3) tidak dihitung** karena dipicu pengguna dan berlangsung ≤ 500 ms.

Batas teknis:

- **Utamakan `transform` dan `opacity` untuk gerak masuk.** Masker dibuat dengan `overflow: hidden` pada wadah; `clip-path` tidak dipakai karena akselerasinya bergantung pada kondisi browser. Perubahan warna pada kontrol boleh dianimasikan singkat. `stroke-dashoffset` pada P4 dan perubahan teks angka pada P2 adalah pengecualian opsional yang harus diuji pada perangkat nyata. Larangan animasi `width`/`height`/`top`/`left` dan `transition: all` tetap berlaku.
- **Tanpa pustaka baru.** GSAP 3.15 (termasuk ScrollTrigger dan SplitText) dan Lenis 1.3 sudah terpasang di `front/package.json`. Tingkat Wajib cukup CSS; GSAP hanya untuk P1, P2, dan Eksperimen.
- **Satu mesin scroll.** Bila Lenis aktif, ScrollTrigger disinkronkan dengannya; anchor memakai Lenis, bukan `scroll-behavior: smooth`.
- **Konten tidak menunggu gerak.** Gaya dasar menampilkan semua teks dan CTA tanpa JavaScript. Jika `motion-ready` tidak dapat dipasang sebelum paint pertama, lewati animasi hero agar teks yang sudah terlihat tidak mendadak melompat ke posisi awal. Kelas itu tidak boleh membuat konten tetap tersembunyi jika efek gagal atau pengguna memilih reduced motion.
- **Reduced motion:** masker, pin, hitung naik, dan View Transition dimatikan; yang tersisa fade 150 ms atau keadaan akhir langsung.
- **Uji gugur:** rekam scroll di ponsel kelas menengah. Jika gerak khas menimbulkan frame yang tersendat berulang atau menghambat pembacaan/aksi, ganti dengan fade dasar. Periksa juga pada layar 60 Hz dan, bila tersedia, 120 Hz; satu angka FPS rata-rata tidak cukup untuk menyatakan gerak lancar.

Parallax latar, marquee otomatis, kursor khusus, dan tombol magnetik tetap **tidak dipakai**: semuanya menarik perhatian ke efek, bukan ke isi.

## 11. Aksesibilitas dan kualitas konten

1. Gunakan satu `h1` untuk pesan utama halaman. Setiap bagian memiliki `h2` yang menjelaskan isinya; judul kartu turun secara berurutan.
2. Pertahankan kontras teks normal sedikitnya 4.5:1, teks besar sedikitnya 3:1, dan batas kontrol penting sedikitnya 3:1. Opasitas rendah pada gambar editorial tidak dijadikan instruksi untuk memudarkan informasi. Uji kedua tema.
3. Semua fungsi yang terlihat dapat dipakai dengan keyboard dan memiliki label yang dapat dipahami pembaca layar.
4. Tempatkan paragraf dan caption di bidang padat putih atau biru tua. Jika teks singkat menumpang pada foto, gunakan lapisan biru tua yang cukup dan uji pada area foto paling terang.
5. Isi alt foto, status tautan, angka, dan nama program dari data nyata. Jangan memakai teks placeholder saat halaman dipublikasikan.
6. Uji pada desktop, tablet, ponsel, tema terang dan gelap, zoom teks, keadaan foto gagal dimuat, dan judul lebih panjang dari contoh. Uji apakah calon peserta dapat menemukan program, jadwal, biaya, serta langkah setelah formulir dikirim.

## 12. Panduan penerapan cepat

Sebuah halaman dianggap mengikuti sistem ini bila:

- Hero memiliki identitas dan pesan yang dominan di kiri, satu media utama di kanan pada desktop, serta urutan pesan sebelum media pada ponsel; dummy berlabel jelas selama masih dipakai dan diganti ketika dokumentasi pengganti dipilih. Potret Alan hanya fallback profil yang diberi konteks benar.
- Bukti visual hadir di hero, dekat program/metode, dan di galeri akhir tanpa mengulang satu aset sebagai beberapa kegiatan. Video memiliki poster, kontrol, dan subtitel/transkrip bila berisi ucapan.
- Formulir academy memakai field line style tanpa radius; admin memakai Soft UI sesuai dokumennya. Judul/heading memakai Plus Jakarta Sans, isi dan field memakai Inter.
- Bagian berulang tersusun dalam grid dengan pembatas yang sengaja dipilih; kartu mandiri boleh memakai radius `8px` tanpa bayangan besar.
- Ukuran teks hanya berasal dari sepuluh token §4, dan gerak dari token §10 dengan paling banyak satu gerak khas per layar.
- Biru logo menjadi warna utama tindakan; stabilo biru pucat hanya menekankan frasa penting; Plus Jakarta Sans pada judul dan Inter pada isi menjaga konsistensi identitas.
- Foto menjelaskan kegiatan Albana yang nyata, dengan teks pendukung yang benar dan dapat dibaca.
- Bidang biru tua memberi jeda dan tindakan yang nyata; footer memakai logo putih resmi dan kontak yang telah diverifikasi.
- Pilihan individu, organisasi, dan keadaan batch dapat dibedakan melalui isi serta label, bukan lewat warna saja.
- Tata letak tetap terbaca dan dapat dioperasikan pada ponsel serta dengan keyboard.

## 13. Jejak keputusan terhadap dua sumber

| Keputusan | Dasar | Hasil untuk Albana |
|---|---|---|
| Editorial monokrom, judul besar, grid tegas, sudut siku | Kedua dokumen dan gambar editorial | Struktur dipertahankan; kontrol dan kartu mandiri mendapat radius kecil sesuai kebutuhan audiens. |
| Biru logo `#26599A` dan putih | Gambar logo ASA yang diberikan klien | Menjadi identitas utama; nilai token perlu dicocokkan lagi jika brand guide resmi tersedia. |
| Stabilo kuning | Gambar editorial dan desain global §2.3/§7.2 | **Diganti** biru pucat `#DCEBFA` dengan teks biru tua. |
| Serif miring / Poppins referensi | Kedua dokumen dan gambar style guide | **Tidak dibawa** ke ASA; Plus Jakarta Sans untuk judul dan Inter untuk isi. |
| Tiga pilar pada gambar | Gambar; dokumen web komunitas memberi contoh empat kolom | Jumlah kolom mengikuti konten Albana. |
| Garis tipis dan foto nyata | Gambar, dengan prinsip grid dari kedua sumber | Garis biru-abu; foto asli berizin, bukan stok yang menyamar sebagai dokumentasi. |
| GSAP, Lenis, marquee | Kedua dokumen sumber | Pilihan implementasi, bukan syarat kecocokan visual pada gambar diam. |
| Soft UI admin | Referensi CMS pengguna | Hanya berlaku pada ruang kerja admin; halaman publik memakai radius kecil dan bidang editorial. |
| Audiens, program, dan alur utama | Brief, revisi kebutuhan, konten beranda ASA | Manfaat → program → bukti/trainer → jadwal/harga → daftar atau konsultasi. |
| Tema terang dan gelap | Revisi kebutuhan klien 11 November | Keduanya memakai keluarga biru-putih dan memerlukan pengujian kontras sendiri. |

### Referensi

- `docs/web-komunitas/design-system.md` (referensi lama, sudah tidak ada pada checkout ini): struktur editorial, grid, foto, dan animasi.
- `docs/design-global/design_system.md` (referensi lama, sudah tidak ada pada checkout ini): pola Community / Landing dan teknik stabilo yang diadaptasi warnanya.
- [Brief proyek](../project/project-brief.md), [revisi kebutuhan](../project/website-revision-specification.md), [konten beranda](../content/home-page-content.md), dan [aturan visual lintas kanal](visual-design.md): audiens, fungsi, naskah, serta keputusan lama yang perlu diselaraskan.
- Gambar editorial dan gambar logo ASA yang disertakan pengguna dalam percakapan: rujukan komposisi dan identitas. Berkas gambar sementara tidak ditautkan sebagai aset proyek.

## 14. Usulan: penajaman untuk eksekutif muda dan motion signature

**Status: usulan 15 November 2026, belum normatif.** Bagian ini menambah arah, bukan mengganti aturan §1–§13. §14.3 sudah disetujui dan menjadi bagian §10; skala tipografi premium ada di §4. Sisanya masih usulan. Butir bertanda **[konfirmasi klien]** menyangkut fakta bisnis yang belum ada di brief dan tidak boleh tampil sebelum dikonfirmasi.

### 14.1 Siapa “eksekutif muda” dalam dokumen ini

Brief menulis “mahasiswa hingga profesional muda”; catatan hasil brief lama menyebut “eksekutif muda → anak kuliah sampai kerja”. Usulan ini memakai **profesional awal sampai menengah karier** sebagai pembaca utama dan mahasiswa tingkat akhir sebagai pembaca kedua. Ini asumsi kerja, bukan hasil riset; sahkan ke klien sebelum naskah dan foto diarahkan ke sana.

| Ciri (asumsi) | Akibat pada desain |
|---|---|
| Waktu sempit, membuka situs dari ponsel di sela kerja | Jawaban “apa, kapan, berapa lama, berapa biaya” terbaca dalam satu layar pertama dan satu ringkasan program. |
| Menilai dari hasil kerja: presentasi, rapat, pitching, memimpin tim | Manfaat ditulis sebagai situasi kerja, bukan sifat diri (“percaya diri”). Naskah tetap bersumber dari dokumen konten. |
| Terbiasa dengan produk digital yang rapi | Detail kecil dinilai: perataan angka, kecepatan muat, keadaan fokus, respons tombol. |
| Sering perlu meyakinkan atasan atau HR | Halaman program dapat dibagikan sebagai tautan yang berdiri sendiri: ringkasan, jadwal, biaya, trainer. |

### 14.2 Saran desain

1. **Ringkasan keputusan di kartu dan detail program.** Empat baris tetap dengan angka tabular: durasi, jadwal, lokasi/format, biaya. Hanya menampilkan data terbit; baris tanpa data disembunyikan, bukan diisi “segera”.
2. **Batang aksi lengket di ponsel** pada detail program: status batch di kiri, satu tombol di kanan, tinggi 56–64px, muncul setelah CTA hero keluar layar. Tidak tampil untuk batch tertutup.
3. **Navy memegang bobot lebih besar.** Judul `h1`/`h2` memakai `#10243F`, biru logo `#26599A` disimpan untuk aksi dan tautan. Hasilnya lebih dewasa daripada halaman yang serba biru sedang; palet tidak berubah.
4. **Angka sebagai elemen tipografi.** Nomor program, tanggal, dan harga memakai Plus Jakarta Sans 700–800 dengan `tabular-nums` dan ukuran minimal 1,5× labelnya. Angka yang rapi adalah tanda ketelitian bagi pembaca ini.
5. **Arah foto/video:** situasi kerja nyata (peserta berdiri mempresentasikan, sesi umpan balik, ruang rapat), cahaya alami, tanpa pose buatan. Pilih satu media dominan per kelompok dan beberapa pendukung bila masing-masing menambah cerita; jangan mengulang aset atau memaksa mosaik. Aturan izin §6 tetap berlaku.
6. **Stabilo dipakai lebih jarang:** satu kali di hero, satu kali di panel ajakan. Pengulangan di setiap judul menurunkan kesan premium.
7. **Jalur organisasi terlihat sejak hero** sebagai tautan teks kecil di bawah CTA (“Untuk tim perusahaan”), bukan tombol ketiga.
8. **Anggaran performa sebagai aturan desain:** LCP ≤ 2,5 detik pada 4G, tanpa pergeseran layout saat font dan foto dimuat. Gerak khas §10 gugur lebih dulu bila anggaran ini terlampaui.
9. **[konfirmasi klien]** Sertifikat yang bisa ditautkan ke LinkedIn, invoice atas nama perusahaan, dan kelas akhir pekan/malam. Bila benar tersedia, ketiganya layak masuk ringkasan keputusan; bila tidak, jangan disebut.

### 14.3 Motion signature

Disetujui dan dipindahkan ke §10 “Gerak khas” pada 15 November 2026.

### 14.4 Admin CMS

Admin tidak mendapat gerak khas; operator mengulang aksi yang sama puluhan kali dan [Admin §10](admin-design-system.md) sudah tepat. Tiga tambahan kecil yang membantu pekerjaan:

1. Indikator tab/pil filter **bergeser** ke pilihan baru (`transform`, 200 ms, `--ease-in-out`) alih-alih berpindah seketika.
2. Baris yang baru disimpan diberi kilas latar `#DCEBFA` yang memudar dalam 800 ms, sehingga operator melihat baris mana yang berubah.
3. Angka kartu statistik menghitung naik **hanya pada muat pertama dashboard** (600 ms); pembaruan data berikutnya langsung menampilkan nilai akhir.

### 14.5 Cara menguji usulan

Asumsi paling berisiko: gerak khas menaikkan kesan premium tanpa memperlambat orang menemukan jadwal dan biaya. Uji termurah: dua versi beranda (dengan dan tanpa gerak khas §10) diberikan ke lima profesional muda lewat ponsel, dengan tugas “temukan jadwal dan biaya program, lalu mulai mendaftar”. Usulan diterima bila waktu tugas tidak lebih lambat dan peserta tidak menyebut animasi sebagai gangguan; bila lebih lambat, pertahankan tingkat Wajib saja.
