# Albana Speech Academy · Spesifikasi desain

Dokumen ini menjadi acuan visual dan interaksi untuk Figma dan Stitch. [Konten Home](../content/home-page-content.md) menetapkan naskah Indonesia, urutan baca, dan syarat editorial untuk materi peserta. Ketentuan program mengikuti [brief](../project/project-brief.md) dan [model data](../data/database-reference.md).

## 1. Arah visual

Arahan pengguna pada 8 November 2026 mengganti bahasa bentuk ke arah referensi **“smooth”/lembut**: pewarnaan bersenyawa, tanpa `font-mono`, judul display besar, beberapa panel biru lembut, kotak biru muda dekoratif, sudut persegi (radius 0), kartu program bernomor, dan indeks seksi vertikal di tepi kiri desktop. Revisi kedua di hari yang sama menetapkan hero bergaya referensi, keluarga huruf Inter (judul) dan Montserrat (isi), serta penghapusan seluruh border radius. Fondasi Swiss Design (grid matematis, komposisi asimetris teratur, tipografi sans-serif, ruang negatif) tetap menjadi pengatur struktur. Yang berubah hanyalah bahasa permukaannya: panel dan kartu bersudut persegi, batas 1 px tetap sebagai pembentuk tepi, permukaan datar tanpa shadow dekoratif, dan aksen biru logo yang dilembutkan. Identitas, konten, dan bukti tetap berasal dari ASA; jangan menambah foto stok, testimoni karangan, statistik, atau logo mitra untuk meniru referensi.

Beranda memakai seksi yang dirender saat ini, berurutan: Hero, Perkenalan Alan, Program, Pilihan program, Cara ngajar, Trainer, Dokumentasi, Testimoni, Format pelatihan, dan Hubungi kami. Hero memakai komposisi terpusat: H1 display raksasa uppercase rata tengah, deskripsi, dua CTA, dua kotak biru muda sebagai aksen sudut, dan penunjuk “Gulir” di bawah; tanpa mosaik kartu, label video, atau foto profil. Perkenalan Alan memakai potret asli di dalam panel lembut. Program tampil sebagai tujuh bidang bernomor. Pilihan program menampilkan kartu program bernomor besar 01/02. Dokumentasi dan Testimoni tetap berlabel “Contoh pratinjau” sampai aset dan izinnya tersedia. Naskah publik mengikuti [Konten Home](../content/home-page-content.md); catatan editorial tetap berlaku. Keputusan pengguna 8 November 2026: materi proposal (poin Alan, bidang program, metode, daftar trainer, kanal kontak, format pelatihan) tampil sebagai konten terbit tanpa lencana verifikasi. Jangan mengarang foto, kutipan, angka, atau logo untuk mengisi slot yang belum berizin.

### 1.1. Fondasi Swiss Design

Padukan arah lembut di atas dengan **Swiss Design (International Typographic Style)**: grid matematis, komposisi asimetris teratur, tipografi sans-serif, ruang negatif, dan kontras tinggi. Ini adalah arahan pengguna pada 7 November 2026. Swiss Design mengatur struktur informasi; identitas ASA memakai kertas hangat, tinta gelap, dan satu keluarga biru fungsional. Jangan menggantinya dengan palet merah atau Helvetica hanya untuk menyerupai poster Swiss.

Prinsip wajib:

1. **Kejelasan informasi mengalahkan dekorasi.** Ukuran, posisi, dan bobot teks menunjukkan apa yang dibaca lebih dahulu. Satu aksi utama per konteks keputusan; CTA program boleh berulang pada header, hero, dan kartu program karena melayani titik baca berbeda.
2. **Asimetri mengikuti grid, bukan posisi acak.** Tepi judul, paragraf, media, dan aksi menempel pada garis kolom bersama. Gunakan pembagian seksi 5+7, 4+6, atau 6+6 pada desktop sesuai tabel komposisi. Hero memakai pengantar terpusat; judul seksi rata kiri.
3. **Ruang negatif membentuk kelompok.** Jarak dalam kelompok lebih kecil daripada jarak antarkelompok. Jangan mengisi kolom kosong dengan ornamen atau menambah tinggi layar untuk kesan premium.
4. **Kontras mendukung pembacaan dan tindakan.** Teks sekunder tetap terbaca; turunkan prioritas melalui ukuran dan posisi, bukan opacity. Foto tidak menjadi latar teks atau tombol.
5. **Fungsi membatasi ekspresi.** Formulir dan layar admin memakai tata letak tugas yang familiar. Bawa font, warna, radius, dan jarak ASA ke sana; jangan menyalin hero pemasaran ke layar kerja.
6. **Panel lembut adalah pengelompok, bukan hiasan.** Sudut tegas (radius 0 pada panel, kartu, dan kontrol), batas 1 px, bidang `Panel`/`Panel-soft`/`Card`, dan aksen biru logo hanya menandai kelompok atau satu fokus. Kotak biru muda dekoratif boleh melengkapi komposisi hero sebagai bidang `Panel`, tetapi tetap tanpa radius dan tidak menutupi teks. Jangan menumpuk kartu di dalam kartu, memberi shadow dekoratif, atau memakai biru muda untuk banyak elemen sekaligus. Satu geometri per peran: persegi untuk permukaan, bulat hanya untuk lingkaran/titik.


### 1.2. Konteks dan dasar keputusan

Audiens adalah mahasiswa hingga profesional muda, sesuai [brief](../project/project-brief.md). Tugas utama: memahami latihan dan trainer, mengenal program dan cara ngajar, menemukan batch, lalu mendaftar. Urutan informasi dan naskah mengikuti [Konten Home](../content/home-page-content.md). Pembayaran tetap manual dan pendaftaran belum terkonfirmasi sebelum verifikasi admin, sesuai [arsitektur teknis](../archive/legacy/technical-plan.md).

Sumber yang dibaca: spesifikasi ini, project/project-brief.md, home-content.md, tech.md, serta implementasi di web/app dan web/components. Nilai visual berasal dari spesifikasi dan referensi gambar pengguna, bukan hasil pengukuran layar. Implementasi saat revisi memakai Next.js App Router, Tailwind CSS, Inter untuk judul dan Montserrat untuk isi (tanpa font mono), grid 12/8/4, dan geometri bersudut persegi (radius 0). Potret Alan tersedia untuk pratinjau; belum ada foto kegiatan berizin, kutipan, atau statistik yang diverifikasi.

Keputusan: pertahankan identitas editorial dan struktur Swiss, lalu ganti bahasa bentuk ke arah lembut. Alternatif yang dibandingkan adalah restyle warna saja (tanpa mengubah tata letak) atau mengganti identitas sepenuhnya. Pengguna memilih **membangun ulang ke tata letak referensi** (opsi B). Gaya lama disimpan sebagai backup tulis di `docs/style-backup/` karena berkas gaya belum masuk git. Biayanya: disiplin alignment, risiko panel terasa seperti kumpulan kartu generik, dan potensi pembungkusan judul besar. Uji termurah: render 1440/834/390/320 px, lalu minta calon peserta menemukan program, jadwal, dan langkah setelah mengirim formulir.



## Visual and motion language

```yaml
direction:
  id: asa-soft-reference
  name: Soft reference ASA dengan struktur Swiss
  status: combined
  authority: Permintaan pengguna, 2026-11-08 (revisi 1: tata letak mengikuti referensi lembut; revisi 2: hero referensi, Inter/Montserrat, radius 0; tanpa font mono)
  philosophy: Informasi jelas, bukti nyata, pewarnaan lembut, panel bersudut persegi
  grammar: Swiss; lembut; panel; asimetris; bersudut tegas; kotak biru muda; rail kiri; kepadatan seimbang
  grounding: Latihan berbicara dan dokumentasi kelas ASA
  category_default_declined: Hero generik dengan kartu manfaat, foto stok, dan klaim tanpa sumber
  weight_carrier: Nama akademi, logo resmi, dan potret Alan; dokumentasi kelas berizin bila tersedia
  asset: Logo resmi saat ini; foto dan video asli hanya setelah izin publikasi
  type:
    families: [Inter, Montserrat]
    roles: {display: Inter, body: Montserrat}
    weights: [400, 500, 600, 700, 800]
    scale: Lihat tabel tipografi bagian 3
    figures: tabular-nums untuk angka yang dibandingkan
  colour:
    scheme: Netral hangat bersenyawa dengan satu keluarga biru lembut
    neutrals_source: Palet kertas dan tinta yang dilembutkan pada revisi 8 November 2026
    roles: {background: '#F7F4EE', panel: '#CBD9E7', panel_soft: '#E6EDF4', card: '#FFFFFF', text: '#15171B', secondary: '#525A66', accent: '#2F5C86', accent_strong: '#24486A', highlight: '#CBD9E7', rule: '#DDE2E9', control: '#7C8695', hover: '#24486A', pressed: '#1A3350', sage: '#A7B7A9', sand: '#E6D9C4', clay: '#C58A78', sun: '#E7C75D'}
    contrast_pairs: Lihat bagian 4; ukur ulang setelah perubahan token
    bands: Panel-soft untuk kelompok; Panel untuk fokus besar; Card untuk kartu; pastel pendukung dipakai hemat
  shape: Panel, kartu, dan kontrol bersudut persegi (radius 0) dengan geometri konsisten per peran
  radius: [0]
  radius_default: 0 px pada seluruh panel, kartu, tombol, dan input (keputusan pengguna 8 November 2026, revisi kedua). Tidak ada border radius.
  radius_exception: Hanya lingkaran asli yang tetap bulat — titik indikator, media bulat berlencana putar, dan ikon bulat; bukan sudut membulat pada permukaan persegi.
  depth: Tanpa shadow dekoratif; batas 1 px dan bidang warna membentuk kedalaman
  spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128]
  layout: Grid 12/8/4 kolom; lebar luar maksimum 1440 px; rail indeks vertikal pada ≥1024 px
  background_rhythm: Bidang kertas berkesinambungan dengan panel lembut besar sebagai kelompok
  material: Datar; tanpa tekstur atau glassmorphism
  imagery: Logo resmi dan potret Alan; dokumentasi asli dengan izin; caption di luar gambar
  motion: Hero tampil bertahap per elemen (kata judul naik-memudar 0/90/180 ms, garis aksen 260 ms, kotak sudut, ikon kanal, deskripsi, tombol 320–500 ms, penunjuk “Gulir” 600 ms) dan kursor “Gulir” berdenyut turun 1,9 s berulang; isi setiap seksi beranda muncul bertahap per blok saat seksi naik melewati 60% atas viewport (tiap blok memudar+naik 1 rem dalam 480 ms, jeda 80 ms per blok, maksimal 400 ms; daftar panjang seperti kartu program, tile trainer, dan foto dokumentasi ikut mengalir satu per satu, kelas `.reveal-item`/`.reveal-in` dari IntersectionObserver dan tetap tampil tanpa JavaScript); kontrol tetap diam; versi statis untuk reduced motion.
  durations: [0, 150, 480, 620, 1900]
  signature: Hero terpusat — H1 display raksasa uppercase rata tengah, deskripsi, dua CTA, dua kotak biru muda sebagai aksen sudut, dan penunjuk “Gulir” — lalu kotak biru gelap pada Perkenalan Alan, kartu program bernomor 01/02, tile trainer pastel, dan rail indeks kiri
  avoid: [gradien dekoratif, glassmorphism, shadow kartu, foto stok, statistik fiktif, teks di atas foto, font mono]
  trade_off: Kartu batch panjang membutuhkan reflow; sudut lembut mengurangi kepadatan; aksen biru dan pastel harus dibatasi
```

Nilai numerik token adalah baseline revisi 8 November 2026. Aturan tambahan merupakan usulan operasional untuk menerapkan arah lembut; efektivitasnya menunggu render dan uji tugas. Tidak ada perubahan kebijakan bisnis dalam revisi ini.


## 2. Grid dan ruang

Satuan grid dalam CSS px. Terapkan `box-sizing: border-box`. Satu pembungkus untuk header, main, dan footer. Lebar luar maksimum 1440 px, terpusat. Padding termasuk dalam lebar itu. Latar kertas mengisi viewport. Garis horizontal hanya dipakai sebagai batas kartu dan header, tidak sebagai pemisah antarseksi.

| Properti | Ponsel 320–767 | Tablet 768–1023 | Desktop ≥1024 |
|---|---:|---:|---:|
| Kolom sama lebar | 4 | 8 | 12 |
| Padding pembungkus per sisi | 16 pada 320–359, lainnya 20 | 32 | 48 |
| Gutter | 12 | 20 | 24 |
| Padding atas hero | 40 | 56 | 80 |
| Padding bawah hero | 64 | 80 | 96 |
| Padding bawah seksi lain | 48 | 64 | 80 |
| Padding dalam kartu | 20 | 24 | 32 |
| Gap antarkelompok dalam satu panel | 12 | 12 | 12 |
| Gap antarkelompok dalam seksi | 32 | 32 | 40 |
| Tinggi minimum masthead | 64 | 72 | 80 |

Pada frame 1440, isi 1344 px, satu kolom 90 px, kolom 7 mulai di x=732. Pada 390, isi 350 px. Gunakan CSS Grid dengan `repeat(n,minmax(0,1fr))`, item `min-width:0`; gutter Figma identik. Seksi tidak memakai garis atas; kelompok dibentuk oleh jarak, panel, dan kartu. Garis 1 px hanya dipakai untuk batas kartu dan header.


### Rumus grid dan aturan alignment wajib

Untuk viewport `V`, lebar pembungkus `W = min(V, 1440)`, padding per sisi `P`, jumlah kolom `N`, dan gutter `G` dari tabel:

```text
Lebar isi C        = W - 2P
Lebar kolom K      = (C - (N - 1)G) / N
Lebar span s       = sK + (s - 1)G
Awal kolom i      = (V - W) / 2 + P + (i - 1)(K + G)
```

Indeks kolom dimulai dari 1. Pertahankan pecahan piksel; jangan membulatkan tiap kolom secara terpisah. Pada 834 px, `C=770`, `K=78.75`, dan kolom 3 mulai pada `x=229.5`. Pada 320 px, `C=288`, `K=63`. Rumus berlaku pada area layout tanpa scrollbar; ukur lebar tersedia pada browser.

- Semua seksi wajib memakai pembungkus dan gutter yang sama; nested grid harus mewarisi garis atau memakai perhitungan span yang sama.
- Judul seksi dan isi utama rata kiri dengan sisi kanan bebas. Hero boleh memakai pengantar terpusat; jangan memusatkan seluruh seksi. Jangan justify paragraf atau memakai spasi manual untuk alignment.
- Perbedaan lebar kolom membentuk asimetri; jangan memakai negative margin, transform, atau absolute positioning untuk menata konten utama.
- Ponsel memakai alur satu kolom penuh selebar empat kolom grid. Pertahankan urutan DOM, bukan CSS `order` yang mengubah urutan visual terhadap fokus.
- Gunakan ritme vertikal berbasis 4 px untuk padding dan gap. Line-height teks tetap mengikuti keterbacaan; jangan memaksa seluruh baseline teks ke kelipatan 4 px.
- Tidak boleh ada tinggi seksi tetap, tinggi kartu yang memotong isi, teks terpotong, atau scroll horizontal halaman. Kartu boleh memakai tinggi minimum selama isi tetap menentukan tinggi akhir. Uji juga reflow setara 320 CSS px pada zoom browser 400% dari 1280 px.

Skala ruang 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96 px. Caption berjarak 8 dari foto, judul ke paragraf 16, paragraf ke aksi 24. Reset margin bawaan heading, list, figure, dan paragraf. Tinggi seksi mengikuti isi. Maksimum lebar paragraf 60ch, teks pembuka hero 42ch. Item membungkus bila teks diperbesar. Panel dan kartu memakai sudut persegi (radius 0) dengan batas garis 1 px; pemisah antarkelompok berasal dari jarak, panel, dan garis.

### Minimalisme fungsional dan ruang negatif

Gunakan jarak 8–16 px untuk hubungan dalam satu kelompok, 24–40 px untuk kelompok berbeda, dan 48–80 px antarseksi, sesuai peran di atas. Padding seksi mengikuti breakpoint, bukan angka baru per seksi. Batasi baris isi agar sasaran sekitar 45–75 karakter terbaca pada desktop; ukur hasil render karena `ch` bukan jumlah karakter aktual. Pada ponsel biarkan baris lebih pendek. Jangan melebarkan paragraf untuk mengisi ruang kosong.

Setiap border, ikon, bidang, dan animasi harus menjelaskan kelompok, tindakan, atau keadaan. Hapus yang tidak memiliki fungsi tersebut. Hindari kartu di dalam kartu, deretan kotak identik untuk seluruh seksi, gradien, glow, blur, atau ilustrasi stok sebagai pengganti bukti. Jangan menyembunyikan harga, kebijakan, label, atau petunjuk kesalahan demi tampilan ringkas. Struktur datar tetap harus memperlihatkan mana yang dapat diklik.

## 3. Tipografi

**Inter** dipakai untuk judul (heading display), label uppercase (`.eyebrow`), navigasi, dan tombol; **Montserrat** dipakai untuk isi paragraf dan teks berjalan. Keputusan pengguna 8 November 2026 (revisi kedua) menetapkan pembagian peran ini dan menggantikan Franklin Gothic ATF. Revisi yang sama tetap menghapus **IBM Plex Mono**: label, nomor, tanggal, dan caption memakai keluarga ini dengan huruf besar dan tracking kecil, bukan font mono. Bobot tinggi (700–800) menjaga judul display tetap tegas pada arah lembut. Digit sejajar (`tabular-nums`) memudahkan perbandingan batch. Kedua font dimuat lewat `next/font/google` sebagai variabel `--font-inter` (dipetakan ke `--font-display`) dan `--font-montserrat` (dipetakan ke `--font-sans`); kelas variabel diletakkan pada elemen `<html>` agar token `--font-sans` dan `--font-display` dapat mewarisi nilainya. Fallback `system-ui, sans-serif` bila font gagal dimuat. Gunakan root 100%, basis konversi 16 px. Ukuran implementasi dalam rem.

| Peran | Desktop px/rem | Tablet px/rem | Ponsel px/rem | Weight | Line-height | Tracking |
|---|---|---|---|---:|---:|---:|
| H1 display | 88/5.5 | 56/3.5 | 44/2.75 | 800 | 0.95 | −0.045em |
| H2 | 52/3.25 | 40/2.5 | 32/2 | 600 | 1.05 | −0.045em |
| H3 | 28/1.75 | 26/1.625 | 24/1.5 | 600 | 1.15 | −0.03em |
| H4 | 22/1.375 | 22/1.375 | 20/1.25 | 600 | 1.30 | −0.02em |
| H5 | 18/1.125 | 18/1.125 | 18/1.125 | 600 | 1.40 | 0 |
| H6 | 16/1 | 16/1 | 16/1 | 600 | 1.40 | 0 |
| Lead | 20/1.25 | 18/1.125 | 18/1.125 | 400 | 1.60 | 0 |
| Body | 16/1 | 16/1 | 16/1 | 400 | 1.55 | 0 |
| Navigasi, tombol | 14/0.875 | 14/0.875 | 14/0.875 | 600 | 1.40 | 0 |
| Label, caption | 12/0.75 | 12/0.75 | 12/0.75 | 600 | 1.50 | +0.08em |
| Angka persen, nomor program | 36–56/2.25–3.5 | 40/2.5 | 32/2 | 600 | 1.00 | −0.04em |

Satu H1 per halaman, satu H2 per seksi, H3 untuk subtopik. H4–H6 tersedia bila hierarki memerlukannya. Judul dan tombol memakai kapitalisasi kalimat, kecuali H1 hero yang memakai kapital penuh dan boleh dibagi menjadi baris pendek. Kapital penuh lain khusus label pendek seperti “PROGRAM” atau “TRAINER”. Label uppercase (`.eyebrow`) memakai keluarga display (Inter), bobot 600, tracking +0.08–0.1em. H1 dan judul display membungkus alami; izinkan baris tambahan pada 320 px atau zoom.

Hero memakai komposisi terpusat: H1 display rata tengah, deskripsi, dan dua CTA; tanpa label media, foto profil, atau pemutar video. Seksi lain tetap rata kiri agar asimetri Swiss terjaga. Angka yang ditampilkan harus berasal dari konten yang disetujui; jangan menambahkan tanda plus, pangsa, atau pencapaian yang tidak memiliki sumber.

Kontras ukuran dipakai secara sengaja: judul display tampil besar, sedangkan label, nomor kecil, dan catatan tampil kecil (0.75–0.875 rem). Pertahankan body minimal 1 rem; jangan mengecilkan teks isi demi kontras.

Aturan tipografi wajib:

- Dua keluarga saja: Inter (judul display, label uppercase, navigasi, tombol) dan Montserrat (isi berjalan). Jangan menambah keluarga lain, font mono, atau bobot di luar 400/500/600/700/800.
- Bedakan hierarki melalui ukuran, bobot, posisi, dan ruang. Jangan memakai warna sebagai satu-satunya penanda tingkat heading.
- Gunakan satu peran display, yaitu H1 hero. Skala H1–H6 adalah pilihan semantik, bukan kewajiban menampilkan semua ukuran; heading CMS harus lebih ringkas daripada hero publik.
- Pertahankan body minimal 1rem dan line-height 1.55. Caption 0.75rem hanya untuk catatan pendek nonkritis; harga, tanggal, instruksi, dan label form tidak boleh memakai ukuran caption.
- Gunakan `font-variant-numeric: tabular-nums` pada jadwal, statistik, dan angka pembanding. Ratakan kolom harga ke kanan bila berbentuk tabel.
- Gunakan `text-wrap: balance` bila tersedia untuk heading, tanpa `<br>` paksa untuk satu viewport. Jangan memotong judul, harga, atau informasi wajib dengan ellipsis.
- Jangan render teks informatif sebagai gambar. Uji fallback font, zoom teks 200%, dan perubahan text spacing tanpa kehilangan isi atau kontrol.

## 4. Warna dan kontras

Gunakan nama token ini sebagai variables Figma dan custom properties CSS (`--color-ink`, dst.). Rasio berikut dihitung dari luminans relatif sRGB, berurutan pada Canvas `#F7F4EE` / Panel-soft `#E6EDF4` / Card `#FFFFFF` / Panel `#CBD9E7`.

| Token | HEX | Penggunaan | Rasio |
|---|---|---|---|
| Ink (Text) | #15171B | Teks utama, judul, isi tombol/panel gelap | 16.35 / 15.20 / 17.94 / 12.49 |
| Muted (Secondary) | #525A66 | Deskripsi, caption, metadata, dan label | 6.35 / 5.90 / 6.97 / 4.85 |
| Canvas (Background) | #F7F4EE | Kertas utama dan teks pada tombol/panel gelap | 16.35 dengan Ink; 6.39 dengan Accent |
| Panel-soft | #E6EDF4 | Panel kelompok, kotak info, header, hubungi kami | 15.20 dengan Ink |
| Panel | #CBD9E7 | Kotak pelengkap hero, panel fokus, dan lencana | 12.49 dengan Ink |
| Card | #FFFFFF | Kartu kecil di atas panel dan panel menu | 17.94 dengan Ink |
| Accent | #2F5C86 | Fokus keyboard, tautan dalam paragraf, dan aksen | 6.39 / 5.94 / 7.01 / 4.88 |
| Accent Strong | #24486A | Hover tombol utama; panel gelap pada Perkenalan Alan dan footer | Teks Canvas 8.66 |
| Highlight | #CBD9E7 | Titik/aksen dekoratif; selalu dengan teks Ink | 12.49 dengan Ink |
| Rule | #DDE2E9 | Batas kartu, header, dan pembagi di dalam panel | Dekorasi |
| Control | #7C8695 | Batas kontrol yang diperlukan untuk mengenali tombol | 3.36 / 3.12 / 3.68 |
| Hover / Pressed | #24486A / #1A3350 | Isi tombol utama saat interaksi | Teks Canvas 8.66 / 11.71 |
| Sage / Sand / Clay / Sun | #A7B7A9 / #E6D9C4 / #C58A78 / #E7C75D | Bidang pastel pendukung (dipakai hemat) | Dekorasi |

Target minimum 4.5:1 untuk seluruh teks aktif, 3:1 untuk batas kontrol dan indikator fokus terhadap latar yang bersebelahan. Gunakan underline pada tautan dalam paragraf. Status selalu memiliki kata yang dapat dibaca. Letakkan caption di bawah foto, pada bidang kertas.

Palet wajib tetap netral hangat dengan satu keluarga biru lembut: biru sedang untuk fokus dan tautan, bidang biru muda untuk panel. Kelembutan datang dari bidang pastel dan kontras rendah antarpermukaan, bukan dari menambah banyak warna jenuh. Highlight biru muda hanya dipakai sebagai latar dengan teks Ink; jangan memakainya sebagai warna teks di atas Canvas, Panel-soft, atau Card. `Rule` dan pastel (`sage`, `sand`, `clay`, `sun`) hanya untuk dekorasi; jangan memakainya sebagai batas input, ikon penting, teks, atau indikator fokus. Jangan memakai opacity untuk melemahkan teks atau kontrol aktif.

Aksen biru harus berada pada Canvas/Panel-soft/Card/Panel atau pasangan lain yang telah diukur. Pada panel gelap Accent-strong, indikator fokus memakai Canvas atau Highlight (8.66:1 / 6.61:1 terhadap Accent-strong), bukan Accent. Batasi panel biru lembut besar pada beberapa bidang per halaman agar tetap menjadi fokus, bukan latar dekoratif.

Ukur setiap pasangan aktual pada default, hover, pressed, focus, error, dan loading sebelum handoff UI. Warna status baru harus mendapat token semantik, label teks, dan pemeriksaan kontras; jangan mengarang warna per komponen. Tidak ada tema gelap yang ditetapkan oleh spesifikasi ini. Tema tambahan memerlukan token dan pengujian seluruh state.

Dasar pengujian: [WCAG 2.2 Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), dan [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html). Target proyek 4.5:1 juga berlaku untuk heading besar, lebih ketat daripada pengecualian 3:1 untuk teks besar pada standar.

## 5. Komposisi per seksi

Gunakan urutan DOM yang sama dengan urutan berikut. Salin naskah publik dari dokumen konten. Isi tiap seksi (kecuali masthead, hero, footer, dan Trainer) dibatasi `max-w-5xl` (64 rem) dan ditengahkan, sehingga kolom isi lebih sempit daripada pembungkus 90 rem; seksi Trainer memakai `max-w-7xl` (80 rem) agar empat tile tetap berjejer lebih besar. Hero memakai H1 rata tengah (komposisi terpusat).

| Seksi | Desktop | Tablet dan ponsel |
|---|---|---|
| Masthead | Panel lembut lengket (`Panel-soft`, `rounded-panel`) dengan batas 1 px, logo resmi kiri, menu dan aksi program di kanan, gap 8 px. Tinggi 64/72/80 px. Tautan: Alan, Program, Cara ngajar, Trainer. | Di bawah 1024 gunakan disclosure “Menu” dengan panel `rounded-panel`. Panel menutup saat tautan dipilih atau Escape. |
| Hero · #hero | H1 “Albana Speech Academy” rata tengah. Tiga kata bergerak sedikit secara berurutan, garis biru menekankan “Speech”. Situasi membuka presentasi diikuti aksi utama “Lihat jadwal” dan tautan “Lihat cara mengajar”. Penunjuk “Gulir” menuju Alan. | Teks dan tautan langsung tersedia. Judul membungkus per kata, tombol membungkus sesuai ruang. |
| Perkenalan Alan · #alan | Panel `Panel-soft` `rounded-panel`; foto Alan di 6 kolom kiri, kanan label, H2 “Alan Albana”, peran, lalu kotak biru gelap (`Accent-strong`, `rounded-card`) menumpuk tepi foto berisi tiga poin bernomor dan tautan “Lihat cara mengajar”. | Tablet 4+4. Ponsel foto penuh, lalu label, judul, peran, dan kotak di bawahnya. |
| Program · #program | Judul dan deskripsi di 5 kolom kiri. Indeks bidang 01–07 di 6 kolom kanan memakai pemisah tipis. Baris informatif tidak memiliki efek hover. | Tablet 4+4. Ponsel intro lalu daftar bidang. |
| Pilihan program · #program-pilihan | Judul dan deskripsi; dua kartu program berdampingan (flex, sama tinggi). Tiap kartu menampilkan nomor program 01/02 sebagai blok warna berbeda (`Panel` dan `Sand`, teks `Ink`) agar kedua program mudah dibedakan, judul, ringkasan, tiga materi utama, disclosure “Lihat … materi lainnya”, status batch, aksi utama “Daftar program”, dan aksi sekunder “Lihat selengkapnya”. | Tablet dan ponsel kartu bertumpuk; tinggi mengikuti isi dan disclosure serta kedua aksi tetap dapat dioperasikan dengan keyboard. |
| Cara ngajar · #cara-ngajar | Satu bidang `Panel-soft` berisi tiga baris. Angka, kegiatan, dan keterangannya sejajar. Ketiga angka mulai serentak dari 0 begitu seksi masuk layar; angka kecil (10) selesai lebih dulu daripada 20 dan 70, sehingga tidak berhenti serempak. Bilah menggambar dari kiri mengikuti durasi angkanya masing-masing. | Keterangan turun ke baris tersendiri. Tanpa dukungan animasi atau saat reduced motion aktif, bilah dan angka langsung tampil pada nilai akhirnya. |
| Trainer · #trainer | Label, H2 “Kenali trainer”, dan deskripsi. Kontainer seksi memakai `max-w-7xl` (lebih lebar dari seksi lain) supaya empat tile rasio 3:4 tetap berjejer dan lebih besar (grid 4 kolom, gap) dengan bidang `Panel-soft`, nama, dan peran di tengah. Tile punya hover (bidang jadi `Accent-strong`, teks jadi Canvas) dan membuka dialog data trainer (`rounded-panel`: monogram 4:5 di kiri, nama, peran, bio di kanan; tutup lewat ×, klik latar, atau Escape, fokus kembali ke tile). Selama foto belum disetujui, tile memakai monogram inisial. | Ponsel grid 2×2, judul dan deskripsi lalu strip. |
| Dokumentasi · #dokumentasi | Label “Contoh pratinjau”; bento grid dua kolom (empat kolom ≥768 px) berisi enam foto contoh Pexels berlisensi bebas: satu foto utama 2×2, empat foto 1×1, dan satu panorama selebar grid, dengan caption di bawah foto dan sudut `rounded-card`. Setiap foto adalah tombol yang membuka dialog gambar besar (tutup lewat ×, klik latar, atau Escape, fokus kembali ke foto pemicu); dialog menyebut bahwa foto contoh bukan dokumentasi Albana. Tidak ada paragraf catatan di bawah grid. Galeri foto berizin menggantikan foto contoh saat tersedia. | Ponsel dua kolom; foto utama tetap 2×2 dan panorama selebar grid. |
| Testimoni · #testimoni | Label “Contoh pratinjau”; seksi berlatar `Panel-soft`. Carousel horizontal `snap-x` berisi tiga kartu `Card` berbatas `Rule` dengan tanda kutip, placeholder kutipan, avatar inisial `Highlight`, nama program, dan dua tombol panah 44 px di bawah (latar `Card`, hover `Highlight`, nonaktif `Card` bertepi `Rule`; mendukung `prefers-reduced-motion`). Kartu bisa digeser dengan swipe/scroll. | Ponsel satu kartu dengan tepi kartu berikutnya terlihat; tablet dan desktop beberapa kartu. |
| Format pelatihan · #format | Judul dan deskripsi selebar 42 rem; dua panel `Panel-soft` `rounded-panel` berdampingan (Public training dengan tautan “Lihat program”; In-house training dengan tautan “Hubungi kami”). | Ponsel judul, deskripsi, lalu dua panel bertumpuk. |
| Hubungi kami · #kontak | Panel `Panel-soft` selebar isi dengan teks `Ink`: judul dan deskripsi di 5 kolom kiri (eyebrow `Accent`, deskripsi `Muted`), tombol `Primary` “Chat lewat WhatsApp” menempel di bawah kolom pada ≥768 px; kanal di 6 kolom kanan sebagai daftar bergaris `Rule` (label `Muted`, alamat sebagai teks dengan catatan “Bukan lokasi kelas.”, email dan Instagram sebagai tautan tab baru bertanda ↗ dengan garis bawah aksen). | Tablet 4+4. Ponsel panel satu kolom: intro, tombol, lalu daftar kanal. |
| Detail program · /program/[slug] | Tautan kembali, nama dan ringkasan program di 7 kolom, status atau jadwal di 5 kolom, aksi “Daftar program”, lalu daftar materi berindeks. Slug tidak dikenal memakai keadaan 404; katalog gagal memakai keadaan coba lagi. | Semua bagian bertumpuk dengan urutan baca yang sama. |
| Pendaftaran · /register/<slug-program> | Satu panel terpusat berisi logo ASA, nama halaman yang tersedia bagi pembaca layar, ringkasan batch singkat, lalu empat langkah isian tanpa layar pembuka: Data diri, Latar belakang dan motivasi, Informasi teknis, Pembayaran dan persetujuan. Tidak ada judul pengantar atau tautan kembali di bagian atas. Setiap langkah menampilkan judul, “Langkah n dari 4”, bilah progres aksesibel, input garis bawah, error berteks di dekat field, serta tombol Lanjut/Kembali. Biaya dan kebijakan pembayaran terlihat sebelum pengiriman; tanda terima menjelaskan tindak lanjut admin. Tanpa header/footer situs, bayangan dekoratif, atau pengalih tema. Batch dipilih server dari slug program; program tanpa batch menerima atau katalog gagal menampilkan pemulihan tanpa form. | Panel tetap satu kolom pada tablet dan ponsel; kelompok data singkat boleh dua kolom hanya jika cukup lebar. |
| Footer | Panel `Accent-strong` penuh lebar dengan teks `Canvas`, satu tumpukan terpusat: logo putih, baris navigasi uppercase kecil (Program, Jadwal, Cara ngajar, Trainer, Hubungi kami), tiga ikon kanal (Instagram, Email, WhatsApp), lalu hak cipta `Canvas/75`. Warna fokus di dalam panel memakai `Canvas` karena berada di atas latar gelap. Tanpa kolom, tanpa bagian “Pendaftaran”/“Cara daftar”, tanpa tautan kembali ke atas. | Ponsel tetap terpusat; tautan navigasi membungkus ke beberapa baris dengan jarak rapat; hanya tampilkan tujuan yang tersedia. |
| Rail kiri · ≥1024 | Indeks seksi vertikal (Alan, Program, Cara ngajar, Trainer, Kontak) di margin kiri dengan `writing-mode: vertical-rl` dan `aria-label` “Indeks seksi”. Tersembunyi di bawah 1024 px. | Tidak dirender. |


Format data memakai tanggal Indonesia lengkap dan waktu WIB. Rupiah hanya ditampilkan setelah harga terbit; batch pratinjau tidak menampilkan harga. Menu mengarah ke #alan, #program, #cara-ngajar, dan #trainer; tombol “Lihat Program” mengarah ke #program; aksi program mengarah ke halaman /register/<slug-program>. Format pelatihan memakai #format, Hubungi kami #kontak, Dokumentasi #dokumentasi, Testimoni #testimoni, dan Pilihan program #program-pilihan. Dokumentasi dan Testimoni tetap berlabel “Contoh pratinjau” sampai materi berizin dan tulisan terbit tersedia. Video menunggu aktivasi pengguna, menyediakan teks pendamping untuk isi lisan dan tautan sumber yang valid jika pemutar gagal.

## 6. Komponen dan interaksi

| Komponen | Anatomi dan ukuran | Default, hover, aktif, fokus |
|---|---|---|
| Button/Primary | Inline-flex, min-height 44, padding 12 × 22 (vertikal × horizontal), gap 8, radius 0, tanpa shadow | Latar Accent + teks Canvas. Hover Accent-strong, saat ditekan Pressed. Focus-visible outline Accent 2 px offset 3. Di atas panel gelap gunakan outline Canvas. |
| Button/Highlight | Geometri Primary, latar Highlight, teks Ink, radius 0 | Hover Highlight Strong (teks Canvas), aktif Highlight Strong. Focus-visible outline Accent 2 px offset 3. Dipakai di dalam panel gelap dan bukan sebagai aksi utama global. |
| Button/Secondary | Geometri Primary, latar Card, border Control 1 px, teks Ink | Hover Panel-soft, aktif border Ink. Fokus sama. Pakai untuk “Coba lagi”. |
| Link/Nav | Area sentuh min 44 × 44, padding horizontal 12, radius 0, baseline tengah | Teks Ink, hover Card, aktif warna Accent. Fokus outline Accent. Link isi selalu bergaris bawah. |
| Card/Batch | Artikel radius 0, border Rule 1 px, padding 20–32, elevation 0 (`box-shadow:none`), varian Panel-soft untuk footer aksi | Bidang statis. Fokus, hover, dan aktivasi hanya pada tautan tindakan di dalamnya. |
| Card/Intro | Kotak radius 0, latar Accent-strong, border Rule 1 px, teks Canvas, padding 20–32; pada ≥768 px menumpuk tepi kanan foto sebesar 64–80 px | Bidang statis berisi daftar poin bernomor dan satu tautan. Fokus tautan memakai outline Canvas/Highlight karena berada di atas latar gelap. Kontras teks Canvas di atas Accent-strong 8,66:1. |
| Card/Media | Figure radius 0, foto radius 0, elevation 0, caption di luar gambar | Foto statis tetap sama saat disorot. |
| Menu | Tombol 44 px, panel radius 0 dengan border Rule, padding 8, tautan min-height 44 | Disclosure inline dengan aria-expanded dan aria-controls. Enter/Space membuka. Escape menutup dan mengembalikan fokus ke Menu. Pilih anchor menutup panel dan memindahkan fokus ke tujuan. |


Aksi navigasi menggunakan anchor beralamat, aksi lokal menggunakan button. Selama retry data, tombol menampilkan “Memuat…” dan menahan klik berulang, status diumumkan dengan aria-live polite. Tombol disabled memakai Panel-soft dan teks Muted. Fokus tetap dapat dikenali pada semua kontrol aktif. Transisi warna/border 150 ms ease-out, tanpa perpindahan posisi. Pada prefers-reduced-motion gunakan durasi 0. Tautan pertama saat Tab adalah “Lewati ke konten” menuju main. Saat anchor seksi dibuka, eyebrow atau awal panel berhenti 16 px di bawah masthead lengket; padding seksi tidak boleh menambah ruang kosong di atas judul. Kemunculan isi seksi (`.reveal-item` di dalam `.reveal-in`) hanya menambahkan kelas dari sisi klien lewat IntersectionObserver, jadi tanpa JavaScript seluruh isi tetap tampil; seksi baru menjalankan kaskade setelah tepinya naik melewati 60% atas viewport atau sekitar 40% dari bawah (tanpa jalur “langsung tampil”, supaya seksi yang menempel di bawah hero ikut beranimasi saat digulir; sisa yang belum tampil dibuka saat halaman mencapai dasar), dan `prefers-reduced-motion` mematikan transisi serta mengembalikan posisi.

## 7. Data, keadaan dan media

| Keadaan | Tampilan dan tujuan |
|---|---|
| Program terbit dan batch menerima peserta | Baris “Pendaftaran dibuka”. Aksi “Daftar” menuju /register/<slug-program>, yang merangkum batch lalu menampilkan formulir pendaftaran di dalam situs. Periksa ulang ketersediaan saat formulir dibuka dan dikirim. |
| Batch pratinjau (tanpa data terbit) | Tampilkan status “Jadwal program ini belum tersedia.” tanpa aksi daftar. Materi program tetap dapat dibaca. |
| Batch ditutup, tenggat lewat, atau penuh terkonfirmasi | Tampilkan alasan aktual “Pendaftaran ditutup” atau “Kelas penuh”. Tawarkan “Lihat program lain” hanya bila ada batch lain. |
| Draf, arsip, dibatalkan | Keluarkan dari daftar pilihan publik. Harga kosong tidak boleh diformat sebagai Rp0. Tampilkan angka kursi hanya bila perhitungannya disepakati. |
| Program kosong | #program-pilihan tetap ada. “Program belum tersedia. Jadwal kelas berikutnya akan diumumkan di sini.” Hero dan bagian program tetap mengantar ke informasi program. |
| Gagal memuat program | Pertahankan judul, tampilkan “Program belum bisa dimuat.” dan tombol “Coba lagi”. Setelah berhasil, ganti pesan dengan daftar atau keadaan kosong. |
| Data sedang dimuat | Pertahankan anchor dan ruang satu baris 96 px, teks “Memuat program…”. Jika data sudah tersedia saat render awal, tampilkan langsung. |
| Foto, kutipan atau karya belum berizin | Preview internal memakai slot beranotasi. Publik menjalankan fallback per seksi. Jika file gagal dimuat, lepaskan slot yang gagal tanpa menutup teks atau aksi. |
| Formulir berhasil dikirim | Konfirmasi penerimaan dan langkah pembayaran manual. Status peserta dikonfirmasi setelah admin memverifikasi pembayaran. Jika batch berubah, arahkan kembali ke pilihan program. |

Gunakan program PUBLISHED, batch OPEN yang memenuhi syarat pendaftaran, lokasi terbit, dan media dengan izin tercatat. Status diambil dari data pada waktu kunjungan. Alamat, harga, kuota, nomor admin, fasilitas, dan ketentuan rinci reschedule menunggu data final. Simpan draf historis batch November (7, 14, 21, 28 November 2026 pukul 15.00–18.00 WIB) sebagai referensi konten internal. Isi jadwal publik berasal dari CMS.

| Aset | Ekspor sasaran | Pengolahan dan alt |
|---|---|---|
| Logo resmi ASA | PNG transparan; kotak aset 104–115 px di masthead dan footer. Footer memakai varian putih (`Albana-Speech-Academy-Logo-White.png`) di atas latar gelap. | Pertahankan warna dan proporsi asli. Crop hanya padding transparan agar mark dan teks tetap utuh. Alt “Albana Speech Academy”. Jangan memotong mark atau mewarnai ulang logo. |
| Poster video pengenalan | WebP 720 × 720, varian lebar 256/480/720 | Hanya bila video disetujui. Ambil frame asli video, pertahankan wajah dalam area aman. Alt kosong karena tombol memiliki label terlihat. |
| Foto Alan (perkenalan) | PNG pratinjau 500 × 500 berlatar biru muda; ditampilkan persegi (1:1), 288–448 px. Ganti dengan potret berizin saat tersedia. | Pusatkan wajah dengan `object-cover`. Alt “Alan Albana, founder Albana Speech Academy”. |
| Dokumentasi utama / pendamping | 1440 × 900 / 900 × 600, WebP | Hanya aset berizin. Caption di luar foto. Gunakan alt untuk detail visual relevan yang belum terdapat pada caption. |

Set aspect-ratio sebelum unduh, gunakan object-fit:cover dan srcset/sizes sesuai lebar slot. Logo pada masthead dimuat segera; media di bawah layar memakai lazy loading. Jangan mengisi slot aset yang belum tersedia dengan foto stok atau potret hasil generasi.

## 8. Prompt bersama untuk Figma dan Stitch

Tempel prompt yang sama di kedua alat. Sertakan kedua dokumen Markdown, gambar referensi, dan aset ASA yang sudah tersedia.

```text
Create the responsive Home page for Albana Speech Academy (ASA), an Indonesian public speaking academy for young executives. A visitor should understand what they will practise, meet the trainer, review the programme and teaching method, and choose an available class. Use design.md for all visual and interaction decisions and home-content.md for the exact Indonesian interface copy. Keep the same information order, labels, states, and visual proportions in Figma and Stitch.

Art direction. Combine ASA's warm editorial identity with the supplied soft reference: a warm paper background, large soft blue panels, square-cornered cards and controls (0 px radius), one restrained logo-blue family, ink typography, and generous whitespace. Use the real ASA logo and approved assets only. Do not invent photography, testimonials, partner logos, statistics, or achievement numbers to fill image and stat slots; use the logo, the approved Alan portrait, and factual counts from home-content.md. Set headings, labels, navigation, and buttons in Inter and running body text in Montserrat; there is no monospace family. Bind colours to the specification: canvas #F7F4EE, panel-soft #E6EDF4, panel #CBD9E7, card #FFFFFF, ink #15171B, secondary #525A66, accent #2F5C86, accent-strong #24486A. Use the published type scale, including the H1 display at 88/56/44 px across desktop/tablet/phone. Keep copy and captions off photos.

Layout. Use a centred outer wrapper capped at 1440 px. At 1024 px and up use 12 columns, 48 px side padding, 24 px gutters. From 768 to 1023 use 8 columns, 32 px padding, 20 px gutters. Below 768 use 4 columns, 20 px padding and 12 px gutters; reduce padding to 16 px below 360. Use auto-height sections, 40–64 px section spacing, 20–32 px card padding, and square cards and controls (0 px radius; only indicator dots and circular media stay round). Render a vertical section rail in the left margin at 1024 px and up, hidden below. Produce review views at 1440, 834 and 390; check reflow at 320 and at 200% text zoom.

Swiss discipline. Apply International Typographic Style through the mathematical grid and section spans in design.md. Keep editorial asymmetry, shared left edges, ragged-right paragraphs, a single display heading role, and whitespace from the spacing scale. The hero introduction sits left aligned inside a soft panel; all section headings stay left aligned. The soft logo blue marks a few large focus panels per page and always carries ink text. Do not substitute red, a new type family, monospace metadata, arbitrary offsets, nested cards, glassmorphism, or decorative shadows. Check reflow at 400% browser zoom from 1280 px as well. Measure all text pairs at 4.5:1 and meaningful control/focus cues at 3:1 against adjacent backgrounds; on the dark blue Alan panel use a pale outline, not the medium accent.

Composition, in reading order:
1. Sticky soft masthead with the ASA identity, published section links and “Lihat Program”. Below 1024 use an inline disclosure menu inside a square panel.
2. Lead with the only H1 “Albana Speech Academy” as a giant uppercase, left-aligned display heading (no panel), a right column with the “Tonton” / “Cuplikan Kelas” label, the description, a circular preview with a play badge, and the two buttons “Daftar Kelas” and “Lihat Program”; add two square light-blue Panel blocks (top-right and bottom-left) and a “Gulir” cue. Do not add a card mosaic.
3. Introduce Alan Albana in a Panel-soft container with the approved portrait beside his name, his role, three factual points inside a dark blue square panel, and a “Lihat cara mengajar” link.
4. Present the programme as seven numbered fields, then the two programme cards with large 01/02 numbers, a status panel, and a “Daftar” action.
5. Explain the teaching method in one Panel-soft container with three ordered steps.
6. Give the trainers a wider four-tile pastel strip (the section uses a broader container than the others) with initials placeholders that open a detail dialog.
7. Show documentation as a clearly labelled “Contoh pratinjau” photo gallery with licensed stock previews and a note that they are not Albana documentation; show testimonials as preview cards until approved assets exist. A programme card opens the /register/<slug-program> page, which summarises the batch, explains the steps after submission and the payment policy, and renders the in-site registration form.
8. End at the Accent-strong footer.

Interactions and handoff. Keep the programme section available even when no batch is published. Include the empty, loading, failed/retry, closed and full states defined in design.md. Only expose actions with valid destinations. Honour reduced motion, visible keyboard focus, 44 px targets and contextual alternative text. Missing media must collapse cleanly in public views. Keep review-only annotations outside the page. In Figma, express this layout as editable Auto Layout frames, variables, text styles and component variants with prototype anchors. In Stitch, express the same composition as semantic responsive components and CSS tokens; use supplied data bindings and destinations. Demonstrate the same responsive menu, programme links and batch interactions in either output.
```


## 9. Kriteria penerimaan handoff

| Pemeriksaan | Syarat lulus |
|---|---|
| Hierarki | Pada desktop, nama akademi mendominasi hero sebagai judul display besar tanpa panel, diikuti deskripsi dan dua CTA program, semuanya terpusat. Perkenalan Alan menampilkan potret, peran, dan tiga poin fakta. Program, cara ngajar, pilihan program, dan Trainer memakai hierarki judul yang sama. Kartu program menampilkan nomor besar, ringkasan, dan aksi tanpa harga; kartu batch menampilkan empat sesi bertanggal dan tempat dengan label pratinjau. |
| Grid | Di 1440, masthead dan judul seksi dimulai di x=48; konten hero terpusat di dalam pembungkus. Di 320, lebar isi 288 px. |
| Asimetri Swiss | Span seksi mengikuti tabel; judul seksi dan isi rata kiri, tanpa justify. Bandingkan tepi grid di 1440, 834, 390, dan 320 px; tidak ada offset arbitrer atau perubahan urutan fokus. |
| Sudut | Tidak ada border radius pada panel, kartu, tombol, atau input. Hanya lingkaran asli (titik indikator dan media bulat) yang bulat. Kotak biru muda dekoratif di hero tetap persegi dan berada di dalam `overflow-hidden`. |
| Ruang negatif | Padding/gap berasal dari skala; ruang kosong memisahkan kelompok. Tidak ada tinggi layar paksa, ornamen pengisi, kartu bertumpuk, atau shadow dekoratif. |
| Tipografi | Dua keluarga (Inter untuk judul, label, navigasi, tombol; Montserrat untuk isi) dan bobot 400–800; tidak ada font mono; body minimal 1rem, metadata kritis bukan caption. Angka statistik berasal dari konten terbit. Periksa fallback, text spacing, dan zoom. |
| Konten panjang | Nama program dua baris, daftar bidang bernomor, fallback font, dan zoom 200% tidak memotong teks, tombol atau fokus. Tidak ada scroll horizontal halaman. |
| Interaksi | Dengan keyboard, buka dan tutup menu, tab ke rail indeks, buka dialog trainer, dan pilih program yang tersedia. Urutan fokus mengikuti urutan baca. |
| Data | Uji satu batch tersedia, penuh, tenggat lewat, data kosong, dan kegagalan lalu retry. Tiap pilihan menghasilkan aksi sesuai tabel. Saat program kosong, keadaan kosong ditampilkan tanpa memutus tautan navigasi. |
| Kepercayaan | Cek izin, sumber karya, keutuhan kutipan dan atribusi sebelum publikasi. Jangan memakai foto stok, logo mitra, atau angka pencapaian untuk mengisi slot referensi. Uji penghapusan seluruh media atau bukti opsional, termasuk tautan nav. |
| Kontras | Pasangan token pada tabel memenuhi target tertulis. Bidang lembut biru hanya menjadi latar dengan teks Ink. Fokus pada panel gelap memakai Canvas atau Highlight. Uji outline pada semua surface dan state ketika frame atau build tersedia. |
| Uji tugas | Minta calon peserta menemukan nama trainer, program, tempat, serta langkah setelah mengirim formulir dari ponsel. Catat bagian yang membuatnya berhenti atau salah memilih. |

**Status verifikasi:** struktur, rumus grid, rasio kontras, dan sumber aturan pendaftaran diperiksa pada spesifikasi. Susunan beranda mengikuti seksi yang dirender: Hero, Perkenalan Alan, Program, Pilihan program, Cara ngajar, Trainer, Dokumentasi, Testimoni, Format pelatihan, dan Hubungi kami, dengan rail indeks kiri pada ≥1024 px. Logo resmi tampil di masthead dan footer; potret Alan tampil di seksi perkenalan. Revisi terakhir menetapkan: palet bersenyawa (canvas `#F7F4EE`, panel `#CBD9E7`, panel-soft `#E6EDF4`), seluruh panel, kartu, dan kontrol bersudut persegi (radius 0; hanya lingkaran asli yang bulat), huruf Inter untuk judul/label/navigasi/tombol dan Montserrat untuk isi (tanpa `font-mono`), hero terpusat (H1 display uppercase rata tengah, deskripsi, dua CTA, dua kotak biru muda sebagai aksen sudut, penunjuk “Gulir”, tanpa label video dan tanpa foto profil), kartu program bernomor 01/02, isi seksi dibatasi `max-w-5xl` dan ditengahkan, seksi Hubungi kami memakai `Panel-soft` bertombol `Primary`, footer memakai `Accent-strong` dengan logo putih dan tautan `Canvas`, isi setiap seksi beranda muncul bertahap per blok saat digulir, angka metode 70/20/10 menghitung naik saat seksi tampil dengan angka kecil selesai lebih dulu, serta padding antarseksi 40–64 px. Materi dari proposal (poin Alan, tujuh bidang program, metode 70/20/10, profil trainer, kanal kontak, dan format pelatihan) disetujui pengguna dan ditampilkan sebagai konten terbit tanpa lencana verifikasi; Dokumentasi, Testimoni, dan kartu batch tetap berlabel “Contoh pratinjau”. Halaman /register/<slug-program> dirender dengan ringkasan batch dan formulir pendaftaran di dalam situs. Gaya lama tersimpan di `docs/style-backup/`. Verifikasi build produksi: `eslint`, `tsc --noEmit`, dan `next build` lulus; render produksi dikonfirmasi pada satu lebar desktop (tanpa overflow horizontal, Inter/Montserrat aktif, dua kotak panel persegi tampil). Uji lebar 1440/834/390/320, zoom teks 200%, reflow 400%, Figma/Stitch, dan uji dengan calon peserta belum dijalankan pada revisi ini.
