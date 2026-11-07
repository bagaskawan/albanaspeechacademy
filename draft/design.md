# Albana Speech Academy · Spesifikasi desain

Dokumen ini menjadi acuan visual dan interaksi untuk Figma dan Stitch. [Konten Home](home-content.md) menetapkan naskah Indonesia, urutan baca, dan syarat editorial untuk materi peserta. Ketentuan program mengikuti [brief](Brief.md) dan [model data](database.md).

## 1. Arah visual

Terjemahkan komposisi halaman krem pada referensi FYLLA menjadi halaman akademi. Pertahankan masthead kecil, judul geometris, foto candid di kanan, garis pembagi tipis, dan indeks editorial. Warna abu-abu di luar lembar adalah bingkai presentasi. Identitas, aktivitas, dan orang yang ditampilkan berasal dari ASA.

Hero menampilkan nama akademi, deskripsi kelas, CTA jadwal, dan akses ke video pengenalan. Potret kecil mengenalkan pendirinya. Alokasikan ruang lebih besar kepada ucapan peserta atau hasil kerja yang dapat dilihat. Foto galeri memberi konteks tentang proses belajar. Pakai aset dan atribusi asli dengan izin publikasi.

## 2. Grid dan ruang

Satuan grid dalam CSS px. Terapkan `box-sizing: border-box`. Satu pembungkus untuk header, main, dan footer. Lebar luar maksimum 1440 px, terpusat. Padding termasuk dalam lebar itu. Latar kertas mengisi viewport. Garis horizontal membentang sepanjang **lebar isi**.

| Properti | Ponsel 320–767 | Tablet 768–1023 | Desktop ≥1024 |
|---|---:|---:|---:|
| Kolom sama lebar | 4 | 8 | 12 |
| Padding pembungkus per sisi | 16 pada 320–359, lainnya 20 | 32 | 48 |
| Gutter | 12 | 20 | 24 |
| Padding blok hero per sisi atas/bawah | 32 | 40 | 48 |
| Padding blok seksi reguler per sisi atas/bawah | 32 | 40 | 48 |
| Padding blok baris bukti | 16 | 20 | 24 |
| Gap antargrup dalam seksi | 24 | 24 | 32 |
| Tinggi minimum masthead | 64 | 72 | 80 |

Pada frame 1440, isi 1344 px, satu kolom 90 px, kolom 7 mulai di x=732. Pada 390, isi 350 px. Gunakan CSS Grid dengan `repeat(n,minmax(0,1fr))`, item `min-width:0`; gutter Figma identik. Semua seksi memakai garis atas 1 px; hero memakai garis bawah masthead sebagai batas atasnya. Pertemuan dua seksi hanya menggambar satu garis.

Skala ruang 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px. Caption berjarak 8 dari foto, judul ke paragraf 16, paragraf ke aksi 24. Reset margin bawaan heading, list, figure, dan paragraf. Tinggi seksi mengikuti isi. Maksimum lebar paragraf 60ch, teks pembuka hero 42ch. Item membungkus bila teks diperbesar. Garis vertikal pembagi berada di tengah gutter dan berakhir di batas isi seksi.

## 3. Tipografi

**DM Sans** untuk judul, isi, navigasi, dan tombol. Bentuk huruf lebar dan bobot sedang menjaga judul tetap dekat dengan masthead editorial pada referensi. **IBM Plex Mono** untuk tanggal, waktu, harga, label kredensial, dan caption pendek. Digit sejajar memudahkan perbandingan batch. Fallback masing-masing `Arial, sans-serif` dan `ui-monospace, monospace`. Sediakan WOFF2 berlisensi, tampilkan fallback selama font dimuat. Gunakan root 100%, basis konversi 16 px. Ukuran implementasi dalam rem.

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

Satu H1, H2 per seksi, H3 untuk subtopik. H4–H6 tersedia bila hierarki memerlukannya. Judul dan tombol memakai kapitalisasi kalimat. Kapital penuh khusus label pendek seperti “PENGALAMAN”. H1 membungkus alami; sasaran 2–3 baris pada 1440. Izinkan baris tambahan pada 320 atau zoom.

## 4. Warna dan kontras

Gunakan nama token ini sebagai variables Figma dan custom properties CSS (`--color-primary`, dst.). Rasio berikut dihitung dari luminans relatif sRGB, berurutan pada Background / Surface.

| Token | HEX | Penggunaan | Rasio |
|---|---|---|---|
| Primary | #1C1B19 | Isi tombol utama dan wordmark teks | 16.81 / 14.64 |
| Secondary | #55514B | Deskripsi, caption dan metadata | 7.70 / 6.70 |
| Background | #FFFCF6 | Kertas utama, teks pada tombol gelap | 16.81 pada Primary |
| Surface | #F1ECE4 | Panel menu, bidang sementara media, hover baris | 14.64 dengan Text |
| Text | #1C1B19 | Judul dan isi utama | 16.81 / 14.64 |
| Accent | #245A9A | Fokus keyboard, tautan dalam paragraf, aksen logo resmi | 6.83 / 5.94 |
| Rule | #C9C2B8 | Garis pembagi dekoratif | Dekorasi |
| Control | #817B73 | Batas kontrol yang diperlukan untuk mengenali tombol | 4.09 / 3.56 |
| Hover / Pressed | #393631 / #10100F | Isi tombol utama saat interaksi | Teks Background 11.75 / 18.59 |

Target minimum 4.5:1 untuk seluruh teks aktif, 3:1 untuk batas kontrol dan indikator fokus terhadap latar yang bersebelahan. Gunakan underline pada tautan dalam paragraf. Status selalu memiliki kata yang dapat dibaca. Letakkan caption di bawah foto, pada bidang kertas.

## 5. Komposisi per seksi

Gunakan urutan DOM yang sama dengan urutan berikut. Salin naskah publik dari dokumen konten.

| Seksi | Desktop | Tablet dan ponsel |
|---|---|---|
| Masthead | Wordmark kiri, maksimum 176 × 32 px; menu dan aksi jadwal rata kanan, gap 24 px. Fallback wordmark teks DM Sans 600, 16 px. Header mengikuti gulir. | Di bawah 1024 gunakan disclosure “Menu”. Panel terbuka mendorong konten ke bawah. |
| Hero | Di kolom 1–6, susun H1 “Albana Speech Academy”, deskripsi, lalu CTA “Lihat jadwal” ke #jadwal. Sejajarkan thumbnail lingkaran Ø 240 px di awal kolom 7–12, ikon putar di tengah dan label “Tonton video pengenalan” di bawah. | Tablet 4+4, diameter 176 px. Ponsel susun judul, deskripsi, CTA, lalu thumbnail Ø 128 px dengan gap 24 px setelah CTA. Tanpa video terbit, hilangkan kontrol video. |
| Founder · #alan | Tepat sesudah hero. Satu baris dengan potret 80 × 100 px, gap 16, lalu nama (H2 bergaya H4), peran, dan maksimal satu kalimat reputasi. Padding blok 20 px. Tautan profil opsional bergaya teks. | Tablet sama. Ponsel potret 64 × 80 px di kiri, teks fleksibel di kanan; teks membungkus. Bila foto belum berizin, mulai teks dari tepi kiri. |
| Dokumentasi · #dokumentasi | Judul di 1–4, foto atau cuplikan utama 16:10 di 5–12. Hingga dua caption pendamping. Letakkan satu karya atau kutipan peserta dengan atribusi di akhir urutan dokumentasi. | Tablet 2+6. Ponsel urutkan media, caption, lalu hasil latihan. Tanpa media, gunakan bukti terbit saja. Tanpa materi terbit, hilangkan seksi dan tautan. |
| Cara mengajar · #cara-belajar | H2 dan pengantar di 1–4. Tiga tahap satu latihan dalam daftar berurutan di 5–12. | Tablet 2+6. Ponsel pertahankan urutan latihan, masukan, dan pengulangan. |
| Program · #program | Judul dan ringkasan di 1–4, modul program terbit di 5–12. | Tablet 3+5. Ponsel modul mengikuti ringkasan. |
| Jadwal kelas · #jadwal | Judul di 1–4, batch per program di 5–12. Dahulukan pertemuan terdekat yang bisa didaftari. Satu aksi daftar per batch. | Tablet 3+5. Ponsel aksi mengikuti status. Anchor tetap tersedia ketika jadwal kosong. |
| Tempat kelas · #tempat | Nama batch dan ruang di 1–4, alamat, petunjuk dan tautan peta di 5–12. Tautkan tiap batch ke lokasi terkait. | Tablet 3+5. Ponsel urutkan nama, alamat, petunjuk, peta. Sembunyikan lokasi yang belum terverifikasi beserta tautannya. |
| Cara daftar · #cara-daftar | Judul di 1–4, langkah bernomor di 5–12. | Tablet 2+6. Ponsel tampilkan langkah setelah pengantar. |
| Cara bayar · #cara-bayar | Judul di 1–4, petunjuk pembayaran manual dan kebijakan di 5–12. Kebijakan selalu terbaca. | Tablet 2+6. Ponsel susun proses verifikasi lalu kebijakan. |
| Artikel · #artikel | Judul dan deskripsi di 1–4, hingga tiga tulisan di 5–12 menurut tanggal terbit terbaru. Judul tertaut dan satu pengantar per tulisan. | Tablet 2+6. Ponsel satu daftar, diikuti tautan ke arsip. Hilangkan seksi dan navigasinya bila kosong. |
| CTA dan footer | Judul CTA kiri, tombol kanan. Footer dua grup rata ujung dengan garis atas dan latar kertas. | Ponsel susun vertikal, gap 24 px sebelum aksi. Footer hanya menampilkan tujuan yang tersedia. |

Format data memakai tanggal Indonesia lengkap, waktu WIB, dan rupiah tanpa desimal. Tombol jadwal menuju #jadwal. Menu mengarah ke #dokumentasi, #cara-belajar, #program, dan #artikel. Tombol daftar pada batch membawa pilihan batch ke formulir. Video menunggu aktivasi pengguna, menyediakan teks pendamping untuk isi lisan dan tautan sumber yang valid jika pemutar gagal.

## 6. Komponen dan interaksi

| Komponen | Anatomi dan ukuran | Default, hover, aktif, fokus |
|---|---|---|
| Button/Primary | Inline-flex, min-height 44, padding 12 × 20 (vertikal × horizontal), gap 8, radius 4, tanpa shadow | Primary + teks Background. Hover Hover, saat ditekan Pressed. Focus-visible outline Accent 2 px offset 3. |
| Button/Secondary | Geometri Primary, latar Background, border Control 1 px, teks Text | Hover Surface, aktif border Primary. Fokus sama. Pakai untuk “Coba lagi”. |
| Link/Nav | Area sentuh min 44 × 44, padding horizontal 8, baseline tengah | Teks Text, hover underline offset 4, aktif warna Accent. Fokus sama. Link isi selalu bergaris bawah. |
| Card/Batch | Artikel datar, radius 0, elevation 0 (`box-shadow:none`), border-top Rule 1, padding 24 px 0 | Baris statis. Fokus, hover, dan aktivasi hanya pada tautan tindakan. |
| Hero/Video | Thumbnail dan label membentuk satu button. Ikon putar 48 px di atas bidang Primary. Jika video tersedia tanpa poster, gunakan bidang Surface dengan ikon yang sama. | Klik, Enter atau Space membuka dialog “Video pengenalan Albana Speech Academy” dengan pemutar 16:9, kontrol dan takarir. Jaga fokus di dialog. Tombol “Tutup” atau Escape menghentikan video dan mengembalikan fokus ke pemicu. |
| Card/Media | Figure radius 0, foto radius 6 px, elevation 0, caption di luar gambar | Foto statis tetap sama saat disorot. Thumbnail video punya tombol play 48 × 48 di bidang Primary. |
| Menu | Tombol 44 px, panel lebar penuh Surface, padding 16, tautan vertikal min-height 44 | Disclosure inline dengan aria-expanded dan aria-controls. Enter/Space membuka. Escape menutup dan mengembalikan fokus ke Menu. Pilih anchor menutup panel dan memindahkan fokus ke tujuan. |

Aksi navigasi menggunakan anchor beralamat, aksi lokal menggunakan button. Selama retry data, tombol menampilkan “Memuat…” dan menahan klik berulang, status diumumkan dengan aria-live polite. Tombol disabled memakai Surface dan teks Secondary. Fokus tetap dapat dikenali pada semua kontrol aktif. Transisi warna/border 150 ms ease-out, tanpa perpindahan posisi. Pada prefers-reduced-motion gunakan durasi 0. Tautan pertama saat Tab adalah “Lewati ke konten” menuju main.

## 7. Data, keadaan dan media

| Keadaan | Tampilan dan tujuan |
|---|---|
| Program terbit dan batch menerima peserta | Baris “Pendaftaran dibuka”. “Daftar kelas ini” membuka formulir dengan batch terpilih. Periksa ulang ketersediaan saat formulir dibuka dan dikirim. |
| Batch ditutup, tenggat lewat, atau penuh terkonfirmasi | Tampilkan alasan aktual “Pendaftaran ditutup” atau “Kelas penuh”. Tawarkan “Lihat jadwal lain” hanya bila ada batch lain. |
| Draf, arsip, dibatalkan | Keluarkan dari daftar pilihan publik. Harga kosong tidak boleh diformat sebagai Rp0. Tampilkan angka kursi hanya bila perhitungannya disepakati. |
| Jadwal kosong | #jadwal tetap ada. “Jadwal kelas berikutnya belum tersedia.” Hero dan header tetap mengantar ke informasi jadwal. CTA penutup “Tanyakan jadwal” menuju WhatsApp resmi jika tersedia. Tanpa kontak terverifikasi, tiadakan CTA penutup. |
| Gagal memuat jadwal | Pertahankan judul, tampilkan “Jadwal belum bisa dimuat.” dan tombol “Coba lagi”. Setelah berhasil, ganti pesan dengan daftar atau keadaan kosong. |
| Data sedang dimuat | Pertahankan anchor dan ruang satu baris 96 px, teks “Memuat jadwal…”. Jika data sudah tersedia saat render awal, tampilkan langsung. |
| Foto, kutipan atau karya belum berizin | Preview internal memakai slot beranotasi. Publik menjalankan fallback per seksi. Jika file gagal dimuat, lepaskan slot yang gagal tanpa menutup teks atau aksi. |
| Formulir berhasil dikirim | Konfirmasi penerimaan dan langkah pembayaran manual. Status peserta dikonfirmasi setelah admin memverifikasi pembayaran. Jika batch berubah, arahkan kembali ke pilihan jadwal. |

Gunakan program PUBLISHED, batch OPEN yang memenuhi syarat pendaftaran, lokasi terbit, dan media dengan izin tercatat. Status diambil dari data pada waktu kunjungan. Alamat, harga, kuota, nomor admin, fasilitas, dan ketentuan rinci reschedule menunggu data final. Simpan draf historis batch November (7, 14, 21, 28 November 2026 pukul 15.00–18.00 WIB) sebagai referensi konten internal. Isi jadwal publik berasal dari CMS.

| Aset | Ekspor sasaran | Pengolahan dan alt |
|---|---|---|
| Poster video pengenalan | WebP 720 × 720, varian lebar 256/480/720 | Ambil frame asli video. Crop 1:1 dengan radius 50%, pertahankan wajah dalam area lingkaran. Alt kosong karena tombol memiliki label terlihat. |
| Potret Alan | 960 × 1200, WebP, varian lebar 320/480/960 | Pusatkan wajah dengan focal point aset. Alt “Alan Albana” untuk potret tunggal. |
| Dokumentasi utama / pendamping | 1440 × 900 / 900 × 600, WebP | Caption di luar foto. Gunakan alt untuk detail visual relevan yang belum terdapat pada caption. |

Set aspect-ratio sebelum unduh, gunakan object-fit:cover dan srcset/sizes sesuai lebar slot. Foto hero dimuat segera, foto di bawah layar memakai lazy loading. Logo resmi mempertahankan warna dan proporsi asli.

## 8. Prompt bersama untuk Figma dan Stitch

Tempel prompt yang sama di kedua alat. Sertakan kedua dokumen Markdown, gambar referensi, dan aset ASA yang sudah tersedia.

```text
Create the responsive Home page for Albana Speech Academy (ASA), an Indonesian public speaking academy for young executives. A visitor should understand what they will practise, see credible evidence from learners, compare schedules, and choose an available class. Use design.md for all visual and interaction decisions and home-content.md for the exact Indonesian interface copy. Keep the same information order, labels, states, and visual proportions in Figma and Stitch.

Art direction. Use the inner page of the supplied FYLLA reference: warm paper, ink typography, compact masthead, a circular video still opposite the academy name, fine rules, an open two-column index, and a featured documentary image. Use ASA's own wordmark and real approved assets. Exclude the grey presentation surround and the reference agency's identity. Keep photography in natural colour. Set body and headings in DM Sans, metadata in IBM Plex Mono. Bind colours to the specification: paper #FFFCF6, surface #F1ECE4, ink #1C1B19, secondary #55514B, focus #245A9A. Use the published type scale, including H1 at 80/56/44 px across desktop/tablet/phone. Keep copy and captions off the photos.

Layout. Use a centred outer wrapper capped at 1440 px. At 1024 px and up use 12 columns, 48 px side padding, 24 px gutters. From 768 to 1023 use 8 columns, 32 px padding, 20 px gutters. Below 768 use 4 columns, 20 px padding and 12 px gutters; reduce padding to 16 px below 360. Use auto-height sections, single 1 px rules, flat schedule rows, 6 px photo corners and 4 px button corners. Produce review views at 1440, 834 and 390; check reflow at 320 and at 200% text zoom.

Composition, in reading order:
1. Compact masthead with the ASA identity, published section links and “Lihat jadwal”. Below 1024 use an inline disclosure menu.
2. Set the only H1 to “Albana Speech Academy”. Place the supplied Indonesian description directly below it and the primary “Lihat jadwal” link underneath. Use a circular introduction-video thumbnail opposite the text (240 px desktop, 176 px tablet, 128 px phone). Stack it below the CTA on phones. Centre the play icon and place the visible label “Tonton video pengenalan” below the circle. Both activate one accessible button that opens a labelled video dialog. Closing the dialog stops playback and restores focus. Hide the trigger until a video is published.
3. Immediately after the hero, add a small founder byline. Use Alan's approved 4:5 portrait, his name, “Founder Albana Speech Academy”, and at most one approved sentence about his radio experience. Keep the portrait at 80 px wide on desktop/tablet and 64 px on phones. A published profile can have a quiet text link. Keep this treatment visibly smaller than the participant evidence.
4. Show classroom documentation as a short sequence: a participant proposes a venue, the audience asks a question, and the participant tries a clearer opening. This sequence is mock content. Match public captions to approved footage. End the section with one approved participant work sample or attributed testimonial. If only a testimonial exists, show it on its own. If no evidence exists, omit the section and its link.
5. Explain the teaching method in three ordered steps using the same speaking exercise. Follow with the published program and modules. Give schedules a distinct section with dates, WIB time, price, availability and registration action. Then show verified venue details for the relevant batch with directions and an available map link.
6. Explain registration and manual payment in successive sections. Make clear that the form is received first and enrolment is confirmed after payment verification. Display the rescheduling and refund policy.
7. Add up to three latest articles published by Alan through the CMS. Use linked titles and excerpts. Keep drafts private and collapse the section when empty. End with the schedule CTA and footer.

Interactions and handoff. Keep #jadwal available even when schedules are empty. Include the empty, loading, failed/retry, closed and full states defined in design.md. Only expose actions with valid destinations. Honour reduced motion, visible keyboard focus, 44 px targets and contextual alternative text. Missing media must collapse cleanly in public views. Keep review-only annotations outside the page. In Figma, express this layout as editable Auto Layout frames, variables, text styles and component variants with prototype anchors. In Stitch, express the same composition as semantic responsive components and CSS tokens; use supplied data bindings and destinations. Demonstrate the same responsive menu, article links and schedule interactions in either output.
```

## 9. Kriteria penerimaan handoff

| Pemeriksaan | Syarat lulus |
|---|---|
| Hierarki | Pada desktop, nama akademi mendominasi hero, diikuti deskripsi dan CTA jadwal. Thumbnail lingkaran membuka video pengenalan. Seksi berikutnya mempertemukan nama, wajah, dan bio Alan. Cerita peserta atau karya terdokumentasi menjadi bukti utama akademi. |
| Grid | Di 1440, masthead, judul hero dan judul seksi dimulai di x=48. Tepi kiri thumbnail hero di x=732. Di 320, lebar isi 288 px. |
| Konten panjang | Nama program dua baris, daftar empat tanggal, fallback font, dan zoom 200% tidak memotong teks, tombol atau fokus. Tidak ada scroll horizontal halaman. |
| Interaksi | Dengan keyboard, buka dan tutup menu, pindah ke jadwal, buka artikel terbit, pilih batch yang tersedia. Urutan fokus mengikuti urutan baca. |
| Data | Uji satu batch tersedia, penuh, tenggat lewat, data kosong, dan kegagalan lalu retry. Tiap pilihan menghasilkan aksi sesuai tabel. |
| Kepercayaan | Cek izin, sumber karya, keutuhan kutipan dan atribusi sebelum publikasi. Uji penghapusan seluruh media atau bukti opsional, termasuk tautan nav. |
| Kontras | Pasangan token pada tabel memenuhi target tertulis. Uji outline pada semua surface dan state ketika frame atau build tersedia. |
| Uji tugas | Minta calon peserta menemukan nama trainer, jadwal, harga, serta langkah setelah mengirim formulir dari ponsel. Catat bagian yang membuatnya berhenti atau salah memilih. |

**Status verifikasi:** struktur, rumus grid, rasio kontras, dan sumber aturan pendaftaran diperiksa pada spesifikasi. Hasil render Figma/Stitch, navigasi keyboard, reflow aktual, dan uji dengan peserta menunggu eksekusi desain.
