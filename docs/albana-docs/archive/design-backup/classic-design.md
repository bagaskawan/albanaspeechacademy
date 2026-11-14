# Albana Speech Academy · Spesifikasi desain

Dokumen ini menjadi acuan visual dan interaksi untuk Figma dan Stitch. [Konten Home](home-content.md) menetapkan naskah Indonesia, urutan baca, dan syarat editorial untuk materi peserta. Ketentuan program mengikuti [brief](project/project-brief.md) dan [model data](database.md).

## 1. Arah visual

Gabungkan dua arah. Kerangka editorial ASA dan referensi FYLLA tetap memberi masthead kecil, judul geometris, indeks seksi, dan tipografi tenang. Arahan pengguna pada 8 November 2026 mengganti bahasa bentuk dari rounded menjadi **box minimalis**: panel dan kartu bersudut nol, batas garis 1 px sebagai pembentuk kotak, permukaan datar tanpa shadow, aksen biru logo yang terbatas, serta ruang negatif yang lega. Swiss Design mengatur grid dan kotak; referensi bento tetap memberi pengelompokan dan ritme bidang. Identitas, konten, dan bukti tetap berasal dari ASA.

Beranda memakai delapan seksi: Hero, Perkenalan Alan, Program, Cara ngajar, Trainer, Jadwal, Format pelatihan, dan Hubungi kami. Hero hanya berisi nama akademi, deskripsi, dan CTA jadwal, tanpa mosaik kartu. Perkenalan Alan memakai potret asli, bukan monogram. Trainer tampil sebagai kotak ringkas berisi profil Alan, bukan kutipan buatan. Jadwal menyatukan satu batch, empat sesi bertanggal, dan tempat. Dua seksi terakhir (Format pelatihan dan Hubungi kami) berasal dari proposal. Keputusan pengguna 8 November 2026: materi proposal disetujui untuk diterbitkan, sehingga poin Alan, bidang program, metode, daftar trainer, kanal kontak, dan format pelatihan tampil sebagai konten terbit tanpa lencana verifikasi. Foto kegiatan, kutipan, statistik, dan dokumentasi hanya dipakai setelah aset serta redaksinya disetujui. Jangan mengarang foto stok, testimoni, angka pencapaian, atau logo mitra untuk meniru referensi.

### 1.1. Fondasi Swiss Design

Padukan arah editorial ASA di atas dengan **Swiss Design (International Typographic Style)**: grid matematis, komposisi asimetris yang teratur, tipografi sans-serif, ruang negatif, dan kontras tinggi. Ini adalah arahan pengguna pada 7 November 2026. Swiss Design mengatur struktur informasi; identitas ASA tetap memakai kertas hangat, tinta gelap, aksen biru fungsional, dan dokumentasi asli. Jangan menggantinya dengan palet merah atau Helvetica hanya untuk menyerupai poster Swiss.

Prinsip wajib:

1. **Kejelasan informasi mengalahkan dekorasi.** Ukuran, posisi, dan bobot teks harus menunjukkan apa yang dibaca lebih dahulu. Satu aksi utama per konteks keputusan; CTA jadwal boleh berulang pada header, hero, dan penutup halaman panjang karena melayani titik baca berbeda.
2. **Asimetri mengikuti grid, bukan posisi acak.** Tepi judul, paragraf, media, dan aksi harus menempel pada garis kolom bersama. Gunakan pembagian seksi 5+7, 4+6, atau 6+6 pada desktop sesuai tabel komposisi. Hero memakai pengantar terpusat; judul seksi tetap rata kiri.
3. **Ruang negatif membentuk kelompok.** Jarak dalam kelompok lebih kecil daripada jarak antarkelompok. Jangan mengisi kolom kosong dengan ornamen atau menambah tinggi layar untuk memberi kesan premium.
4. **Kontras mendukung pembacaan dan tindakan.** Teks sekunder tetap terbaca; turunkan prioritas melalui ukuran dan posisi, bukan opacity. Foto tidak menjadi latar teks atau tombol.
5. **Fungsi membatasi ekspresi.** Formulir dan CMS memakai tata letak tugas yang familiar. Bawa font, warna, garis, dan jarak ASA ke sana; jangan menyalin hero pemasaran ke layar kerja.
6. **Kotak tipis adalah pengelompok, bukan hiasan.** Sudut nol, batas garis 1 px, bidang `Surface`/`Card`, dan aksen biru logo hanya menandai kelompok atau satu fokus. Jangan menumpuk kartu di dalam kartu, memberi shadow dekoratif, memakai sudut bulat, atau memakai biru muda untuk banyak elemen sekaligus.


### 1.2. Konteks dan dasar keputusan

Audiens adalah mahasiswa hingga profesional muda, sesuai [brief](project/project-brief.md). Tugas utama: memahami latihan dan trainer, mengenal program dan cara ngajar, menemukan batch, lalu mendaftar. Urutan informasi dan naskah mengikuti [Konten Home](home-content.md). Pembayaran tetap manual dan pendaftaran belum terkonfirmasi sebelum verifikasi admin, sesuai [arsitektur teknis](tech.md).

Sumber yang dibaca: spesifikasi ini sebelum revisi, project/project-brief.md, Result project/project-brief.md, home-content.md, tech.md, serta implementasi di web/app dan web/components. Nilai visual berasal dari spesifikasi dan referensi gambar pengguna, bukan hasil pengukuran layar. Implementasi saat revisi memakai Next.js App Router, Tailwind CSS, Franklin Gothic ATF, IBM Plex Mono, grid 12/8/4, kotak bersudut nol dengan batas 1 px, aksen biru logo, dan logo resmi ASA. Potret Alan tersedia untuk pratinjau; belum ada foto kegiatan berizin, kutipan, atau statistik yang diverifikasi pada revisi ini.

Keputusan: pertahankan identitas editorial, perketat struktur Swiss, lalu ganti bahasa bentuk ke box minimalis. Alternatif yang dibandingkan adalah mempertahankan spesifikasi editorial lama, mengganti identitas sepenuhnya, atau menyalin referensi secara literal. Pilihan gabungan mengikuti permintaan pengguna dan mempertahankan sistem token yang sudah ada. Bukti lokal kuat untuk keberadaan aturan dan kebutuhan produk; bukti efektivitas visual masih belum tersedia. Biayanya adalah disiplin alignment, risiko panel terasa seperti kumpulan kartu generik, dan potensi pembungkusan judul besar. Uji termurah: render 1440/834/390/320 px, lalu minta calon peserta menemukan jadwal dan langkah setelah mengirim formulir. Ubah komposisi bila mereka melewatkan informasi atau aksi utama.


## Visual and motion language

```yaml
direction:
  id: asa-box-minimalist
  name: Box minimalis ASA dengan struktur Swiss
  status: combined
  authority: Permintaan pengguna, 2026-11-08 (isi mengikuti home-content.md; bentuk dari rounded ke box minimalis)
  philosophy: Informasi jelas, bukti nyata, dekorasi minimum, permukaan kotak
  grammar: Swiss; minimalis; box; asimetris; bersudut nol; kepadatan seimbang
  grounding: Latihan berbicara dan dokumentasi kelas ASA
  category_default_declined: Hero generik dengan kartu manfaat, foto stok, dan klaim tanpa sumber
  weight_carrier: Nama akademi, logo resmi, dan potret Alan; dokumentasi kelas berizin bila tersedia
  asset: Logo resmi saat ini; foto dan video asli hanya setelah izin publikasi
  type:
    families: [Franklin Gothic ATF, IBM Plex Mono]
    weights: [400, 500, 600]
    scale: Lihat tabel tipografi bagian 3
    figures: tabular-nums untuk angka yang dibandingkan
  colour:
    scheme: Netral hangat monokromatik dengan aksen biru gelap dan biru muda dari logo
    neutrals_source: Palet kertas dan tinta pada spesifikasi ASA sebelum revisi
    roles: {background: '#F4F2ED', surface: '#E9E6DF', card: '#FBFAF7', text: '#191918', secondary: '#5B5751', accent: '#1F4E7A', highlight: '#D7E6F4', highlight_strong: '#2F6BA3', rule: '#D9D4CB', control: '#78726A', hover: '#2B2A27', pressed: '#0F0F0E'}
    contrast_pairs: Lihat bagian 4; ukur ulang setelah perubahan token
    bands: Background dominan; Surface untuk panel kelompok; Card untuk kartu; Highlight untuk satu fokus
  shape: Kartu, panel, dan aksi berbentuk kotak dengan sudut nol; geometri konsisten per peran
  radius: [0]
  radius_default: Seluruh kartu, panel, tombol, dan tautan memakai sudut nol (keputusan pengguna 8 November 2026: gaya box minimalis). Hanya titik indikator ±6 px yang tetap bulat.
  radius_exception: Hanya titik indikator kecil; tidak ada pil atau sudut membulat pada kontrol.
  depth: Tanpa shadow dekoratif; batas 1 px dan bidang warna membentuk kedalaman
  spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128]
  layout: Grid 12/8/4 kolom; lebar luar maksimum 1440 px
  background_rhythm: Bidang kertas berkesinambungan dengan panel dan kartu sebagai kelompok
  material: Datar; tanpa tekstur atau glassmorphism
  imagery: Logo resmi dan potret Alan; dokumentasi asli dengan izin; caption di luar gambar
  motion: Umpan balik warna dan border; ease-out; tanpa gerakan dekoratif
  durations: [0, 150]
  signature: Hero terpusat, kotak gelap Card/Intro pada Perkenalan Alan, kotak Trainer, satu kartu batch, aksi kotak
  avoid: [gradien dekoratif, glassmorphism, shadow kartu, foto stok, statistik fiktif, teks di atas foto]
  trade_off: Kartu batch panjang membutuhkan reflow; sudut besar mengurangi kepadatan; aksen biru harus dibatasi
```

Nilai numerik yang dipertahankan adalah baseline dari spesifikasi sebelumnya. Aturan tambahan merupakan usulan operasional untuk menerapkan arah gabungan pengguna; efektivitasnya menunggu render dan uji tugas. Tidak ada perubahan kebijakan bisnis dalam revisi ini.


## 2. Grid dan ruang

Satuan grid dalam CSS px. Terapkan `box-sizing: border-box`. Satu pembungkus untuk header, main, dan footer. Lebar luar maksimum 1440 px, terpusat. Padding termasuk dalam lebar itu. Latar kertas mengisi viewport. Garis horizontal hanya dipakai sebagai batas kartu, header, dan footer, tidak sebagai pemisah antarseksi.

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

Pada frame 1440, isi 1344 px, satu kolom 90 px, kolom 7 mulai di x=732. Pada 390, isi 350 px. Gunakan CSS Grid dengan `repeat(n,minmax(0,1fr))`, item `min-width:0`; gutter Figma identik. Seksi tidak memakai garis atas; kelompok dibentuk oleh jarak, panel, dan kartu. Garis 1 px hanya dipakai untuk batas kartu, header, dan footer.


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

Skala ruang 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96 px. Caption berjarak 8 dari foto, judul ke paragraf 16, paragraf ke aksi 24. Reset margin bawaan heading, list, figure, dan paragraf. Tinggi seksi mengikuti isi. Maksimum lebar paragraf 60ch, teks pembuka hero 42ch. Item membungkus bila teks diperbesar. Panel dan kartu memakai sudut nol dengan batas garis 1 px; pemisah antarkelompok berasal dari jarak dan garis, bukan sudut membulat.

### Minimalisme fungsional dan ruang negatif

Gunakan jarak 8–16 px untuk hubungan dalam satu kelompok, 24–40 px untuk kelompok berbeda, dan 48–80 px antarseksi, sesuai peran di atas. Padding seksi mengikuti breakpoint, bukan angka baru per seksi. Batasi baris isi agar sasaran sekitar 45–75 karakter terbaca pada desktop; ukur hasil render karena `ch` bukan jumlah karakter aktual. Pada ponsel biarkan baris lebih pendek. Jangan melebarkan paragraf untuk mengisi ruang kosong.

Setiap border, ikon, bidang, dan animasi harus menjelaskan kelompok, tindakan, atau keadaan. Hapus yang tidak memiliki fungsi tersebut. Hindari kartu di dalam kartu, deretan kotak identik untuk seluruh seksi, gradien, glow, blur, atau ilustrasi stok sebagai pengganti bukti. Jangan menyembunyikan harga, kebijakan, label, atau petunjuk kesalahan demi tampilan ringkas. Struktur datar tetap harus memperlihatkan mana yang dapat diklik.

## 3. Tipografi

**Franklin Gothic ATF** untuk judul, isi, navigasi, dan tombol. Bentuk huruf lebar dan bobot sedang menjaga judul tetap dekat dengan masthead editorial pada referensi. **IBM Plex Mono** untuk tanggal, waktu, harga, label kredensial, dan caption pendek. Digit sejajar memudahkan perbandingan batch. Fallback sans `"Franklin Gothic Medium", "ITC Franklin Gothic", Arial, sans-serif` dan mono `ui-monospace, monospace`. Franklin Gothic ATF adalah font komersial (ATF/FontShop) yang tidak tersedia di Google Fonts; sampai berkas WOFF2 berlisensi disediakan dan dimuat lewat `next/font/local`, pengunjung tanpa font ini melihat fallback. Gunakan root 100%, basis konversi 16 px. Ukuran implementasi dalam rem.

| Peran | Desktop px/rem | Tablet px/rem | Ponsel px/rem | Weight | Line-height | Tracking |
|---|---|---|---|---:|---:|---:|
| H1 | 80/5 | 56/3.5 | 44/2.75 | 500 | 1.04 | −0.045em |
| H2 | 48/3 | 40/2.5 | 32/2 | 500 | 1.10 | −0.035em |
| H3 | 28/1.75 | 26/1.625 | 24/1.5 | 500 | 1.20 | −0.02em |
| H4 | 22/1.375 | 22/1.375 | 20/1.25 | 600 | 1.30 | −0.01em |
| H5 | 18/1.125 | 18/1.125 | 18/1.125 | 600 | 1.40 | 0 |
| H6 | 16/1 | 16/1 | 16/1 | 600 | 1.40 | 0 |
| Lead | 20/1.25 | 18/1.125 | 18/1.125 | 400 | 1.50 | 0 |
| Body | 16/1 | 16/1 | 16/1 | 400 | 1.55 | 0 |
| Navigasi, tombol | 14/0.875 | 14/0.875 | 14/0.875 | 600 | 1.40 | 0 |
| Label, caption mono | 12/0.75 | 12/0.75 | 12/0.75 | 500 | 1.50 | +0.04em |
| Tanggal, waktu, harga mono | 14/0.875 | 14/0.875 | 14/0.875 | 400 | 1.50 | 0 |

Satu H1 per halaman, satu H2 per seksi, H3 untuk subtopik. H4–H6 tersedia bila hierarki memerlukannya. Judul dan tombol memakai kapitalisasi kalimat. Kapital penuh khusus label pendek seperti “PENGALAMAN”. H1 membungkus alami; sasaran 2–3 baris pada 1440. Izinkan baris tambahan pada 320 atau zoom.

Hero boleh memusatkan H1, deskripsi, CTA, dan satu baris fokus. Seksi lain tetap rata kiri agar asimetri Swiss terjaga. Angka yang ditampilkan harus berasal dari konten yang disetujui; jangan menambahkan tanda plus, pangsa, atau pencapaian yang tidak memiliki sumber.

Kontras ukuran dipakai secara sengaja: judul seksi tampil besar, sedangkan label mono, nomor, dan catatan tampil kecil (0.75–0.875 rem). Pertahankan body minimal 1 rem; jangan mengecilkan teks isi demi kontras. Perkenalan Alan memakai skala H2 yang sama dengan seksi lain; kontras datang dari judul besar terhadap label mono dan nomor kecil.

Aturan tipografi Swiss wajib:

- Franklin Gothic ATF adalah keluarga sans-serif utama. IBM Plex Mono hanya untuk metadata pendek; jangan memakainya untuk paragraf, judul, atau navigasi. Jangan menambah keluarga atau bobot di luar 400/500/600.
- Bedakan hierarki melalui ukuran, bobot, posisi, dan ruang. Jangan memakai warna sebagai satu-satunya penanda tingkat heading.
- Gunakan satu peran display, yaitu H1 hero. Skala H1–H6 adalah pilihan semantik, bukan kewajiban menampilkan semua ukuran; heading CMS harus lebih ringkas daripada hero publik.
- Pertahankan body minimal 1rem dan line-height 1.55. Caption 0.75rem hanya untuk catatan pendek nonkritis; harga, tanggal, instruksi, dan label form tidak boleh memakai ukuran caption.
- Gunakan `font-variant-numeric: tabular-nums` pada jadwal, statistik, dan angka pembanding. Ratakan kolom harga ke kanan bila berbentuk tabel.
- Gunakan `text-wrap: balance` bila tersedia untuk heading, tanpa `<br>` paksa untuk satu viewport. Jangan memotong judul, harga, atau informasi wajib dengan ellipsis.
- Jangan render teks informatif sebagai gambar. Uji fallback font, zoom teks 200%, dan perubahan text spacing tanpa kehilangan isi atau kontrol.

## 4. Warna dan kontras

Gunakan nama token ini sebagai variables Figma dan custom properties CSS (`--color-ink`, dst.). Rasio berikut dihitung dari luminans relatif sRGB, berurutan pada Background / Surface / Card.

| Token | HEX | Penggunaan | Rasio |
|---|---|---|---|
| Primary / Text | #191918 | Isi tombol utama, wordmark teks, judul, dan isi utama | 15.73 / 14.12 / 16.86 |
| Secondary | #5B5751 | Deskripsi, caption, metadata, dan label kartu | 6.41 / 5.76 / 6.87 |
| Background | #F4F2ED | Kertas utama dan teks pada tombol gelap | 15.73 dengan Text |
| Surface | #E9E6DF | Kotak kartu, hover baris, dan lencana label | 14.12 dengan Text |
| Card | #FBFAF7 | Kartu kecil, header, footer, dan panel menu | 16.86 dengan Text |
| Accent | #1F4E7A | Fokus keyboard, tautan dalam paragraf, dan aksen logo resmi | 7.73 / 6.94 / 8.28 |
| Highlight | #D7E6F4 | Satu kartu fokus, panel penutup, dan lingkaran angka; selalu dengan teks Primary | Teks Primary 13.84 |
| Highlight Strong | #2F6BA3 | Hover/aktif tombol highlight dan titik status dekoratif | Teks Background 4.87 |
| Rule | #D9D4CB | Batas kartu, header, footer, dan pembagi di dalam panel | Dekorasi |
| Control | #78726A | Batas kontrol yang diperlukan untuk mengenali tombol | 4.25 / 3.82 / 4.56 |
| Hover / Pressed | #2B2A27 / #0F0F0E | Isi tombol utama saat interaksi | Teks Background 12.83 / 17.14 |

Target minimum 4.5:1 untuk seluruh teks aktif, 3:1 untuk batas kontrol dan indikator fokus terhadap latar yang bersebelahan. Gunakan underline pada tautan dalam paragraf. Status selalu memiliki kata yang dapat dibaca. Letakkan caption di bawah foto, pada bidang kertas.

Palet wajib tetap netral hangat dengan satu keluarga biru logo: biru gelap untuk fokus dan tautan, biru muda untuk bidang highlight. Kontras tinggi berasal dari tinta terhadap kertas, bukan menambah banyak warna jenuh. Highlight biru muda hanya dipakai sebagai latar dengan teks Primary; jangan memakai biru muda sebagai warna teks di atas Background, Surface, atau Card. `Rule` hanya untuk dekorasi; jangan memakainya sebagai batas input, ikon penting, teks, atau indikator fokus. Jangan memakai opacity untuk melemahkan teks atau kontrol aktif.

Aksen biru harus berada pada Background/Surface/Card atau pasangan lain yang telah diukur; jangan menaruhnya di atas Primary tanpa verifikasi. Pada panel Primary, indikator fokus memakai Highlight (13.84:1 terhadap Primary) atau warna kertas, bukan Accent. Batasi Highlight pada satu bidang besar per layar agar tetap menjadi fokus, bukan latar dekoratif.

Ukur setiap pasangan aktual pada default, hover, pressed, focus, error, dan loading sebelum handoff UI. Warna status baru harus mendapat token semantik, label teks, dan pemeriksaan kontras; jangan mengarang warna per komponen. Tidak ada tema gelap yang ditetapkan oleh spesifikasi ini. Tema tambahan memerlukan token dan pengujian seluruh state.

Dasar pengujian: [WCAG 2.2 Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), dan [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html). Target proyek 4.5:1 juga berlaku untuk heading besar, lebih ketat daripada pengecualian 3:1 untuk teks besar pada standar.

## 5. Komposisi per seksi

Gunakan urutan DOM yang sama dengan urutan berikut. Salin naskah publik dari dokumen konten. Isi tiap seksi (kecuali masthead, hero, dan footer) dibatasi `max-w-5xl` (64 rem) dan ditengahkan, sehingga kolom isi lebih sempit daripada pembungkus 90 rem. Hero memakai pengantar terpusat `max-w-4xl`.

| Seksi | Desktop | Tablet dan ponsel |
|---|---|---|
| Masthead | Bilah kotak lengket dengan batas 1 px, logo resmi kiri, menu dan aksi jadwal kotak di kanan, gap 8 px. Tinggi 80 px. Tautan: Alan, Program, Cara ngajar, Trainer, Jadwal. | Di bawah 1024 gunakan disclosure “Menu” dengan panel kotak. Panel terbuka menutup saat tautan dipilih atau Escape. |
| Hero · #hero | Pengantar terpusat: label mono, H1 “Albana Speech Academy”, deskripsi maksimum 36 rem, CTA kotak “Lihat jadwal”, lalu satu baris metadata mono “Presentasi · Diskusi · MC”. Tanpa mosaik. | Tablet dan ponsel sama; satu kolom, H1 mengikuti skala. |
| Perkenalan Alan · #alan | Foto persegi (rasio 1:1) di 6 kolom kiri; label mono, H2 “Kenalan dengan Alan Albana”, peran mono kecil, dan deskripsi di 6 kolom kanan. Kotak Card/Intro gelap menumpuk tepi kanan foto di kanan bawah, berisi tiga poin dan tautan “Lihat cara mengajar”. | Tablet 4+4. Ponsel foto persegi penuh, lalu label, judul, peran, deskripsi, dan kotak di bawahnya. |
| Program · #program | Judul dan deskripsi di 5 kolom kiri. Tujuh bidang pelatihan berlabel mono 01–07 di 6 kolom kanan, dipisah garis 1 px. Catatan “ketersediaan mengikuti batch yang terbit” dan tautan “Lihat jadwal”. | Tablet 4+4. Ponsel intro lalu daftar bidang. |
| Cara ngajar · #cara-ngajar | Judul dan deskripsi selebar 42 rem. Satu kotak berisi tiga pendekatan yang dipisah garis 1 px (vertikal di ponsel); tiap kartu menampilkan angka persen besar (70/20/10) dan bilah proporsi tipis. | Ponsel judul, deskripsi, lalu kartu pendekatan satu kolom. |
| Trainer · #trainer | Label mono, H2 “Kenali trainer”, dan deskripsi. Strip empat potret rasio 4:5 berdampingan (grid 4 kolom), tiap kartu dipisah garis tipis 1 px, dengan nama dan peran mono di tengah. Kartu punya hover (bidang jadi Ink, nama jadi Accent) dan bisa diklik untuk membuka dialog data trainer (dialog kotak: foto 4:5 di kiri, nama, peran, dan deskripsi di kanan; tutup lewat tombol ×, klik latar, atau Escape, fokus kembali ke kartu). Selama foto belum disetujui, slot potret memakai placeholder monogram inisial. Di bawah strip ada tombol “Lihat jadwal”. | Ponsel grid 2×2, judul dan deskripsi lalu strip, lalu tombol. |
| Jadwal · #jadwal | Judul “Jadwal kelas”, deskripsi, catatan pratinjau, dan tautan “Cara daftar dan pembayaran” di 5 kolom kiri; kartu batch 6 kolom kanan berisi empat sesi bertanggal, waktu, dan tempat, dengan aksi “Daftar kelas ini” menuju /register. | Tablet 4+4. Ponsel intro lalu kartu batch. |
| Format pelatihan · #format | Judul dan deskripsi selebar 42 rem; dua kotak berdampingan (Public training dengan tautan “Lihat jadwal”; In-house training dengan tautan “Hubungi kami”) dipisah garis 1 px. | Ponsel judul, deskripsi, lalu dua kotak bertumpuk. |
| Hubungi kami · #kontak | Judul dan deskripsi di 5 kolom kiri; daftar kanal di 6 kolom kanan sebagai teks dengan WhatsApp, email, dan Instagram sebagai tautan aktif (tab baru), sedangkan alamat tetap teks. | Tablet 4+4. Ponsel intro lalu daftar kanal. |
| Pendaftaran · /register | H1 “Daftar kelas”, ringkasan batch, langkah “Setelah formulir dikirim”, dan kebijakan penjadwalan ulang di kolom kiri; kartu formulir menetap (sticky) di kolom kanan dengan aksi ke formulir pendaftaran yang aktif. | Tablet 4+4. Ponsel ringkasan batch, langkah, lalu kartu formulir. |
| Footer | Identitas dan deskripsi di 5 kolom, tautan kotak rata kanan di 7 kolom, garis atas 1 px. Tautan: Program, Cara ngajar, Trainer, Jadwal, Hubungi kami, Profil Alan, Cara daftar, Cara bayar. | Ponsel tautan membungkus dua baris; hanya tampilkan tujuan yang tersedia. |


Format data memakai tanggal Indonesia lengkap dan waktu WIB. Rupiah hanya ditampilkan setelah harga terbit; batch pratinjau tidak menampilkan harga. Menu mengarah ke #alan, #program, #cara-ngajar, #trainer, dan #jadwal; tombol “Lihat jadwal” mengarah ke #jadwal; aksi batch mengarah ke halaman /register; seksi Format pelatihan memakai #format dan Hubungi kami memakai #kontak. Seksi Dokumentasi, Artikel, dan penutup belum dirender pada beranda ini; tampilkan hanya setelah materi berizin dan tulisan terbit tersedia. Video menunggu aktivasi pengguna, menyediakan teks pendamping untuk isi lisan dan tautan sumber yang valid jika pemutar gagal.

## 6. Komponen dan interaksi

| Komponen | Anatomi dan ukuran | Default, hover, aktif, fokus |
|---|---|---|
| Button/Primary | Inline-flex, min-height 44, padding 12 × 22 (vertikal × horizontal), gap 8, sudut nol (kotak), tanpa shadow | Primary + teks Background. Hover Hover, saat ditekan Pressed. Focus-visible outline Accent 2 px offset 3. Di atas panel gelap gunakan outline Highlight. |
| Button/Highlight | Geometri Primary, latar Highlight, teks Primary | Hover Highlight Strong, aktif Highlight Strong. Focus-visible outline Accent 2 px offset 3. Dipakai di dalam kotak gelap Card/Intro dan bukan sebagai aksi utama global. |
| Button/Secondary | Geometri Primary, latar Card, border Control 1 px, teks Primary | Hover Surface, aktif border Primary. Fokus sama. Pakai untuk “Coba lagi”. |
| Link/Nav | Area sentuh min 44 × 44, padding horizontal 12, sudut nol, baseline tengah | Teks Primary, hover Surface, aktif warna Accent. Fokus outline Accent. Link isi selalu bergaris bawah. |
| Card/Batch | Artikel sudut nol, border Rule 1 px, padding 20–32, elevation 0 (`box-shadow:none`), varian Surface untuk footer aksi | Bidang statis. Fokus, hover, dan aktivasi hanya pada tautan tindakan di dalamnya. |
| Card/Intro | Kotak sudut nol, latar Ink gelap, border Rule 1 px, teks Background, padding 20–32; pada ≥768 px menumpuk tepi kanan foto sebesar 64–80 px | Bidang statis berisi daftar poin bernomor dan satu tautan. Fokus tautan memakai outline Highlight karena berada di atas latar gelap. Kontras teks Background di atas Ink 16,86:1. |
| Hero/Video | Bila video tersedia, thumbnail dan label membentuk satu button di area hero. Ikon putar 48 px di atas bidang Primary. | Klik, Enter atau Space membuka dialog “Video pengenalan Albana Speech Academy” dengan pemutar 16:9, kontrol dan takarir. Jaga fokus di dialog. Tombol “Tutup” atau Escape menghentikan video dan mengembalikan fokus ke pemicu. |
| Card/Media | Figure sudut nol, foto sudut nol, elevation 0, caption di luar gambar | Foto statis tetap sama saat disorot. Thumbnail video punya tombol play 48 × 48 di bidang Primary. |
| Menu | Tombol 44 px, panel kotak sudut nol dengan border Rule, padding 8, tautan kotak min-height 44 | Disclosure inline dengan aria-expanded dan aria-controls. Enter/Space membuka. Escape menutup dan mengembalikan fokus ke Menu. Pilih anchor menutup panel dan memindahkan fokus ke tujuan. |


Aksi navigasi menggunakan anchor beralamat, aksi lokal menggunakan button. Selama retry data, tombol menampilkan “Memuat…” dan menahan klik berulang, status diumumkan dengan aria-live polite. Tombol disabled memakai Surface dan teks Secondary. Fokus tetap dapat dikenali pada semua kontrol aktif. Transisi warna/border 150 ms ease-out, tanpa perpindahan posisi. Pada prefers-reduced-motion gunakan durasi 0. Tautan pertama saat Tab adalah “Lewati ke konten” menuju main.

## 7. Data, keadaan dan media

| Keadaan | Tampilan dan tujuan |
|---|---|
| Program terbit dan batch menerima peserta | Baris “Pendaftaran dibuka”. “Daftar kelas ini” menuju halaman /register, yang merangkum batch lalu membuka formulir pendaftaran aktif. Periksa ulang ketersediaan saat formulir dibuka dan dikirim. |
| Batch pratinjau (tanpa data terbit) | Kartu batch menampilkan lencana kotak “Contoh pratinjau”, catatan tanggal dan tempat belum terbit, tanpa harga. Aksi daftar tetap tersedia menuju /register yang menjelaskan status pratinjau. |
| Batch ditutup, tenggat lewat, atau penuh terkonfirmasi | Tampilkan alasan aktual “Pendaftaran ditutup” atau “Kelas penuh”. Tawarkan “Lihat jadwal lain” hanya bila ada batch lain. |
| Draf, arsip, dibatalkan | Keluarkan dari daftar pilihan publik. Harga kosong tidak boleh diformat sebagai Rp0. Tampilkan angka kursi hanya bila perhitungannya disepakati. |
| Jadwal kosong | #jadwal tetap ada. “Jadwal kelas berikutnya belum tersedia.” Hero dan header tetap mengantar ke informasi jadwal. CTA penutup “Tanyakan jadwal” menuju WhatsApp resmi jika tersedia; tanpa kontak terverifikasi, seksi penutup dihilangkan dan halaman berakhir di footer. |
| Gagal memuat jadwal | Pertahankan judul, tampilkan “Jadwal belum bisa dimuat.” dan tombol “Coba lagi”. Setelah berhasil, ganti pesan dengan daftar atau keadaan kosong. |
| Data sedang dimuat | Pertahankan anchor dan ruang satu baris 96 px, teks “Memuat jadwal…”. Jika data sudah tersedia saat render awal, tampilkan langsung. |
| Foto, kutipan atau karya belum berizin | Preview internal memakai slot beranotasi. Publik menjalankan fallback per seksi. Jika file gagal dimuat, lepaskan slot yang gagal tanpa menutup teks atau aksi. |
| Formulir berhasil dikirim | Konfirmasi penerimaan dan langkah pembayaran manual. Status peserta dikonfirmasi setelah admin memverifikasi pembayaran. Jika batch berubah, arahkan kembali ke pilihan jadwal. |

Gunakan program PUBLISHED, batch OPEN yang memenuhi syarat pendaftaran, lokasi terbit, dan media dengan izin tercatat. Status diambil dari data pada waktu kunjungan. Alamat, harga, kuota, nomor admin, fasilitas, dan ketentuan rinci reschedule menunggu data final. Simpan draf historis batch November (7, 14, 21, 28 November 2026 pukul 15.00–18.00 WIB) sebagai referensi konten internal. Isi jadwal publik berasal dari CMS.

| Aset | Ekspor sasaran | Pengolahan dan alt |
|---|---|---|
| Logo resmi ASA | PNG transparan; kotak aset 104–115 px di masthead dan footer | Pertahankan warna dan proporsi asli. Crop hanya padding transparan agar mark dan teks tetap utuh. Alt “Albana Speech Academy”. Jangan memotong mark atau mewarnai ulang logo. |
| Poster video pengenalan | WebP 720 × 720, varian lebar 256/480/720 | Hanya bila video disetujui. Ambil frame asli video, pertahankan wajah dalam area aman. Alt kosong karena tombol memiliki label terlihat. |
| Foto Alan (perkenalan) | PNG pratinjau 500 × 500 berlatar biru muda; ditampilkan persegi (1:1), 288–448 px. Ganti dengan potret berizin saat tersedia. | Pusatkan wajah dengan `object-cover`. Alt “Alan Albana, founder Albana Speech Academy”. |
| Dokumentasi utama / pendamping | 1440 × 900 / 900 × 600, WebP | Hanya aset berizin. Caption di luar foto. Gunakan alt untuk detail visual relevan yang belum terdapat pada caption. |

Set aspect-ratio sebelum unduh, gunakan object-fit:cover dan srcset/sizes sesuai lebar slot. Logo pada masthead dimuat segera; media di bawah layar memakai lazy loading. Jangan mengisi slot aset yang belum tersedia dengan foto stok atau potret hasil generasi.

## 8. Prompt bersama untuk Figma dan Stitch

Tempel prompt yang sama di kedua alat. Sertakan kedua dokumen Markdown, gambar referensi, dan aset ASA yang sudah tersedia.

```text
Create the responsive Home page for Albana Speech Academy (ASA), an Indonesian public speaking academy for young executives. A visitor should understand what they will practise, meet the trainer, review the programme and teaching method, and choose an available class. Use design.md for all visual and interaction decisions and home-content.md for the exact Indonesian interface copy. Keep the same information order, labels, states, and visual proportions in Figma and Stitch.

Art direction. Combine ASA's warm editorial identity with the supplied minimalist reference: warm paper background, square-bordered boxes and one batch card, a restrained logo-blue highlight, ink typography, square actions, and generous whitespace. Use the real ASA logo and approved assets only. Do not invent photography, testimonials, partner logos, statistics, or achievement numbers to fill image and stat slots; use the logo, the approved Alan portrait, and factual counts from home-content.md. Set body and headings in Franklin Gothic ATF, metadata in IBM Plex Mono. Bind colours to the specification: background #F4F2ED, surface #E9E6DF, card #FBFAF7, ink #191918, secondary #5B5751, focus #1F4E7A, highlight #D7E6F4. Use the published type scale, including H1 at 80/56/44 px across desktop/tablet/phone. Keep copy and captions off photos.

Layout. Use a centred outer wrapper capped at 1440 px. At 1024 px and up use 12 columns, 48 px side padding, 24 px gutters. From 768 to 1023 use 8 columns, 32 px padding, 20 px gutters. Below 768 use 4 columns, 20 px padding and 12 px gutters; reduce padding to 16 px below 360. Use auto-height sections, 48–80 px section spacing, 20–32 px card padding, and square (zero-radius) cards and actions. Produce review views at 1440, 834 and 390; check reflow at 320 and at 200% text zoom.

Swiss discipline. Apply International Typographic Style through the mathematical grid and section spans in design.md. Keep editorial asymmetry, shared left edges, ragged-right paragraphs, a single display heading role, and whitespace from the spacing scale. The hero introduction may be centred; all section headings stay left aligned. The pale logo blue marks one focus per screen and always carries ink text. Do not substitute red, a new type family, centred sections below the hero, arbitrary offsets, nested cards, glassmorphism, or decorative shadows. Check reflow at 400% browser zoom from 1280 px as well. Measure all text pairs at 4.5:1 and meaningful control/focus cues at 3:1 against adjacent backgrounds; on the dark Trainer panel use a pale logo-blue focus outline, not the dark blue accent.

Composition, in reading order:
1. Sticky square masthead with the ASA identity, published section links and “Lihat jadwal”. Below 1024 use an inline disclosure menu inside a square card.
2. Centre the only H1 “Albana Speech Academy”, the Indonesian description, the primary “Lihat jadwal” button, and one quiet mono line “Presentasi · Diskusi · MC”. Do not add a card mosaic.
3. Introduce Alan Albana with the approved portrait beside his name, role, the approved sentence about RRI Pro 1 Bandung, three factual points, and a “Lihat cara mengajar” link.
4. Present the programme as three focus rows (Presentasi, Diskusi, MC) with the note that final modules follow the published batch.
5. Explain the teaching method in one Surface panel with three ordered steps.
6. Give the trainer a Primary panel: name, role, three facts (background, approach, focus), and a Highlight “Lihat jadwal” action.
7. Show one batch in a Card/Batch with four dated sessions, the time, and the merged venue details, marked “Contoh pratinjau” and without a price. Its action opens the /register page, which summarises the batch, explains the steps after submission and the payment policy, and links to the active registration form.
8. End at the footer. Render Documentation, Articles, and the closing CTA only once approved assets and published articles exist.

Interactions and handoff. Keep #jadwal available even when schedules are empty. Include the empty, loading, failed/retry, closed and full states defined in design.md. Only expose actions with valid destinations. Honour reduced motion, visible keyboard focus, 44 px targets and contextual alternative text. Missing media must collapse cleanly in public views. Keep review-only annotations outside the page. In Figma, express this layout as editable Auto Layout frames, variables, text styles and component variants with prototype anchors. In Stitch, express the same composition as semantic responsive components and CSS tokens; use supplied data bindings and destinations. Demonstrate the same responsive menu, article links and schedule interactions in either output.
```


## 9. Kriteria penerimaan handoff

| Pemeriksaan | Syarat lulus |
|---|---|
| Hierarki | Pada desktop, nama akademi mendominasi hero, diikuti deskripsi, CTA jadwal, dan satu baris fokus. Perkenalan Alan menampilkan potret, peran, dan tiga poin fakta. Program, cara ngajar, dan Trainer memakai hierarki judul yang sama. Kartu batch menampilkan empat sesi bertanggal dan tempat, tanpa harga, dengan label pratinjau. |
| Grid | Di 1440, masthead, judul seksi, dan tepi kiri konten dimulai di x=48. H1 hero boleh terpusat di dalam lebar isi. Di 320, lebar isi 288 px. |
| Asimetri Swiss | Span seksi mengikuti tabel; judul seksi dan isi rata kiri, tanpa justify, kecuali pengantar hero yang terpusat. Bandingkan tepi grid di 1440, 834, 390, dan 320 px; tidak ada offset arbitrer atau perubahan urutan fokus. |
| Ruang negatif | Padding/gap berasal dari skala; ruang kosong memisahkan kelompok. Tidak ada tinggi layar paksa, ornamen pengisi, kartu bertumpuk, atau shadow dekoratif. |
| Tipografi | Hanya dua keluarga dan tiga bobot yang ditetapkan; body minimal 1rem, metadata kritis bukan caption. Angka statistik berasal dari konten terbit. Periksa fallback, text spacing, dan zoom. |
| Konten panjang | Nama program dua baris, daftar empat tanggal, fallback font, dan zoom 200% tidak memotong teks, tombol atau fokus. Tidak ada scroll horizontal halaman. |
| Interaksi | Dengan keyboard, buka dan tutup menu, pindah ke jadwal, buka artikel terbit, pilih batch yang tersedia. Urutan fokus mengikuti urutan baca. |
| Data | Uji satu batch tersedia, penuh, tenggat lewat, data kosong, dan kegagalan lalu retry. Tiap pilihan menghasilkan aksi sesuai tabel. Saat jadwal kosong, penutup tidak dirender tanpa kontak terverifikasi. |
| Kepercayaan | Cek izin, sumber karya, keutuhan kutipan dan atribusi sebelum publikasi. Jangan memakai foto stok, logo mitra, atau angka pencapaian untuk mengisi slot referensi. Uji penghapusan seluruh media atau bukti opsional, termasuk tautan nav. |
| Kontras | Pasangan token pada tabel memenuhi target tertulis. Bidang highlight biru muda hanya menjadi latar dengan teks Primary. Fokus pada panel Primary memakai Highlight. Uji outline pada semua surface dan state ketika frame atau build tersedia. |
| Uji tugas | Minta calon peserta menemukan nama trainer, jadwal, tempat, serta langkah setelah mengirim formulir dari ponsel. Catat bagian yang membuatnya berhenti atau salah memilih. |

**Status verifikasi:** struktur, rumus grid, rasio kontras, dan sumber aturan pendaftaran diperiksa pada spesifikasi. Susunan beranda mengikuti delapan seksi: Hero, Perkenalan Alan, Program, Cara ngajar, Trainer, Jadwal, Format pelatihan, dan Hubungi kami. Logo resmi tampil di masthead dan footer; potret Alan tampil di seksi perkenalan. Revisi terakhir (8 November 2026) mengikuti naskah home-content.md: gaya box minimalis (sudut nol, batas 1 px), foto Alan persegi dengan kotak gelap Card/Intro menumpuk tepi foto berisi tiga poin, isi seksi dibatasi `max-w-5xl` dan ditengahkan, padding antarseksi 48–80 px. Materi dari proposal (poin Alan, tujuh bidang program, metode 70/20/10, profil trainer, kanal kontak, dan format pelatihan) disetujui pengguna dan ditampilkan sebagai konten terbit tanpa lencana verifikasi; kartu batch tetap berlabel “Contoh pratinjau” karena tanggal dan tempatnya masih simulasi. Halaman /register dirender dengan ringkasan batch dan tautan ke formulir aktif. Implementasi web dirender pada 1440, 1024, 834, 390, dan 320 px; tidak ada scroll horizontal, menu seluler menutup dengan Escape dan mengembalikan fokus, serta `npm run lint`, `tsc --noEmit`, dan `npm run build` lulus. Uji Figma/Stitch, zoom teks 200%, reflow 400%, dan uji dengan calon peserta belum dijalankan.
