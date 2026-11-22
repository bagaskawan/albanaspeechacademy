# Implementation Plan Artikel CMS dan Publik

**Tujuan** — Memudahkan admin menulis dan mengelola artikel dari desktop maupun ponsel, serta memberi pembaca pengalaman editorial yang bersih dengan gambar ringan. Arah UX mengikuti prinsip Medium: konten di depan, satu kolom baca, tampilan antarmuka sesedikit mungkin, dan tipografi yang memimpin. Warna, font, dan identitasnya tetap milik Albana.

**Arsitektur** — Gunakan rute `/admin/artikel` dan `/artikel` yang sudah ada. BlockNote tetap editor client-only. `articles.body_blocks` menyimpan isi terstruktur, `body` tetap menjadi proyeksi teks dan fallback artikel lama, dan `ArticleBody` merender konten di server. Gambar disimpan sekali di Supabase Storage privat dan ditayangkan melalui endpoint yang memeriksa status artikel. Editor dan halaman baca memakai **satu set kelas tipografi bersama** (`.article-prose`) agar tulisan di CMS tampil sama seperti yang dibaca publik.

**Stack** — Next.js 16 App Router, React 19, TypeScript, Tailwind 4, BlockNote 0.50, Sharp 0.34, Supabase Postgres dan Storage. Gunakan dependensi dan token Albana yang sudah tersedia. [Pola admin](../design/admin-ui-patterns.md) · [Sistem desain publik](../design/academy-design-system.md)

## Keputusan desain dan storage

- **Editor** — Satu kolom tulis ±68ch dengan judul dan isi terpisah secara visual. Teks isi 18–20 px dengan line-height 1,65. Tempatkan **Simpan draf** dan **Terbitkan** di kepala halaman. Untuk artikel terbit, sediakan **Tarik dari publik** dengan konfirmasi. Menu `/` dan tombol **Tambah blok** mendukung keyboard dan sentuhan. Di ponsel, toolbar membungkus baris, dan keyboard tidak menutupi kursor atau aksi yang sedang aktif. Detail di [§B](#b-cms-editor-artikel).
- **Daftar CMS** — Pertahankan tabel di desktop dan baris bertumpuk di ponsel. Urutan prioritas: judul, status teks Draf/Terbit, tanggal, lalu aksi. Gunakan ulang `TableToolbar`, `DataTable`, dan `RowActions` untuk mencari judul, menyaring status via URL, dan ekspor. Aksi barisnya Ubah, Lihat publik untuk artikel terbit, dan Hapus dengan konfirmasi khusus `adminsuper`. Detail di [§C](#c-cms-daftar-artikel).
- **Publik** — Indeks satu kolom: judul sebagai tautan, ringkasan, tanggal, dan thumbnail bila tersedia. Detail artikel memakai satu kolom baca ±68ch dengan gutter 16–24 px di ponsel. Body 18 px di ponsel dan 20 px di desktop, line-height ±1,7. Heading, kutipan, daftar, dan `figure` memakai elemen semantik. Detail di [§D](#d-publik-indeks-artikel) dan [§E](#e-publik-detail-artikel).
- **Thumbnail opsional** — Berguna untuk memindai indeks jika foto membantu membedakan topik. Artikel tanpa thumbnail tetap tampil sebagai baris teks penuh. Admin memilih gambar khusus untuk indeks. Gambar pertama di isi tetap utuh dan tidak otomatis disalin. Pratinjau potongan 4:3 tampil di CMS. Detail artikel memakai gambar inline sesuai konteks.
- **Optimasi saat upload** — Terima JPEG, PNG dan WebP statis hingga 10 MiB. Batasi input 40 MP sebelum decode. Validasi format aktual, koreksi orientasi EXIF, konversi ke sRGB, hapus metadata, dan pertahankan transparansi. Thumbnail maksimal 480 × 360 dengan crop 4:3. Gambar inline maksimal 1600 × 2400 dengan rasio asli. Keduanya tanpa upscale. Mulai dari WebP kualitas 85, lalu turunkan hingga 78 bila perlu. Target awal ≤120 KiB untuk thumbnail dan ≤500 KiB untuk inline. Bila target meleset pada batas kualitas, izinkan hingga 240/900 KiB. Di atas batas keras, tampilkan pesan agar admin mengganti file. Uji AVIF per profil. Pakai AVIF sebagai format tunggal hanya jika median berkas minimal 20% lebih kecil, teks dan detail tetap terbaca, browser target kompatibel, dan p95 waktu proses ≤2 detik di staging. Bucket menyimpan tepat satu hasil per unggahan. [Resize Sharp](https://sharp.pixelplumbing.com/api-resize/) · [Encoder Sharp](https://sharp.pixelplumbing.com/api-output/)
- **Akses dan siklus hidup** — Bucket privat `article-images` dengan object key berbasis UUID. Endpoint media mengambil objek dari server dan memeriksa ulang hak akses pada tiap permintaan. Gunakan `Cache-Control: private, no-store` untuk gambar artikel. Pakai `Image unoptimized` atau `<img>` agar hasil terbit tidak tertinggal di cache optimizer setelah artikel ditarik. Uji biaya akses per request di staging. [Bucket privat Supabase](https://supabase.com/docs/guides/storage/buckets/fundamentals) · [Cache optimizer Next.js](https://nextjs.org/docs/app/api-reference/components/image#minimumcachettl)

## Spesifikasi UI/UX — Responsive, gaya Medium

Bagian ini menjadi acuan visual dan interaksi untuk task 2–4. Nilai di sini menurunkan token yang sudah ada di [sistem desain publik](../design/academy-design-system.md) §3–§4 dan [pola UI admin](../design/admin-ui-patterns.md) §2. Bila nilai di sini berbeda dari dokumen tersebut, nilai di sini hanya berlaku untuk modul artikel.

### A. Prinsip dan pola responsif bersama

**Apa yang diambil dari Medium:**

1. **Konten adalah antarmuka.** Saat membaca dan menulis, layar hanya berisi teks, gambar, dan sesedikit mungkin kontrol. Metadata ditulis kecil dan tenang, tombol hanya muncul ketika dibutuhkan.
2. **Satu kolom baca.** Tidak ada sidebar di samping isi artikel pada ukuran layar apa pun. Mata pembaca hanya bergerak turun.
3. **Apa yang ditulis = apa yang dibaca.** Kanvas editor memakai tipografi publik Albana (Inter dan Plus Jakarta Sans, navy `#10243F`), bukan tipografi admin. Kerangka CMS di sekitarnya tetap monokrom admin.
4. **Ritme vertikal yang lega.** Jarak antarparagraf dan sebelum heading lebih besar daripada di halaman lain. Gambar diberi napas di atas dan bawah.
5. **Terbit itu momen tersendiri.** Menekan **Terbitkan** membuka dialog yang menampilkan pratinjau artikel di indeks, seperti alur publish Medium. Dengan begitu admin melihat hasilnya sebelum artikel muncul di publik.

**Yang tidak diambil:** clap, komentar, follow, paywall, rekomendasi personal, highlight, dan sidebar penulis. Fitur tersebut di luar cakupan plan ini.

**Breakpoint** — Gunakan breakpoint Tailwind yang sudah dipakai proyek. Tidak ada breakpoint baru.

| Rentang | Nama | Gutter halaman | Kolom baca | Catatan |
|---|---|---|---|---|
| 320–479 px | Ponsel kecil | 16 px | Penuh dikurangi gutter | Uji minimum 320 px tanpa scroll horizontal. |
| 480–767 px | Ponsel | 20 px | Penuh dikurangi gutter | Gambar inline melebar ke tepi layar (§E.4). |
| 768–1023 px (`md`) | Tablet | 32 px | Maks. 680 px, di tengah | Tata letak sama dengan desktop, ukuran huruf desktop. |
| ≥1024 px (`lg`) | Desktop | `--content-padding` | Maks. 680 px, di tengah | Ruang kosong di kiri-kanan dibiarkan kosong. |

**Lebar kolom baca** dikunci pada `max-width: 680px`. Pada body 20 px Inter, lebar ini setara ±66–70 karakter per baris. Pakai nilai px, bukan `ch`, agar editor dan halaman publik selalu sama lebar walaupun font belum termuat. Nilai ini dibagikan lewat satu variabel CSS `--article-measure: 680px`.

**Kelas tipografi bersama `.article-prose`** — Tambahkan di `front/app/globals.css`. Pakai kelas ini di `ArticleBody` dan di kanvas `.article-editor`. Tabel di bawah adalah seluruh skala artikel. Jangan menambah ukuran lain.

| Elemen | Ponsel (<768) | Desktop (≥768) | Font / bobot | Line-height | Jarak atas |
|---|---|---|---|---:|---|
| Judul artikel `h1` | 32 px | 44 px | Plus Jakarta Sans 700, tracking −0.02em | 1.15 | — |
| Ringkasan / subjudul | 18 px | 21 px | Inter 400, `#47607D` | 1.5 | 12 px |
| Heading blok level 1 → `h2` | 24 px | 30 px | Plus Jakarta Sans 700, tracking −0.015em | 1.25 | 2.0em |
| Heading blok level 2 → `h3` | 20 px | 24 px | Plus Jakarta Sans 700 | 1.3 | 1.75em |
| Heading blok level 3 → `h4` | 18 px | 20 px | Plus Jakarta Sans 600 | 1.35 | 1.5em |
| Paragraf | 18 px | 20 px | Inter 400, `#10243F` | 1.7 | 1.25em antarparagraf |
| Daftar `ul`/`ol` | 18 px | 20 px | Inter 400 | 1.7 | 1.25em; antaritem 0.5em; indent 1.5em |
| Kutipan | 20 px | 22 px | Inter 400 italic, `#10243F` | 1.55 | 1.75em atas-bawah |
| Caption gambar | 14 px | 14 px | Inter 500, `#47607D`, rata tengah | 1.5 | 10 px di bawah gambar |
| Kode inline | 0.9em | 0.9em | `--font-mono`, latar `#F3F7FC` | — | — |
| Metadata (tanggal, waktu baca) | 14 px | 14 px | Inter 500, `#47607D`, `tabular-nums` | 1.5 | — |

Aturan tambahan:

- Heading tepat setelah heading lain memakai jarak atas 0.75em agar tidak terlihat kosong.
- Elemen pertama di dalam `.article-prose` tidak punya jarak atas.
- Tautan di isi: `#26599A`, garis bawah 1 px dengan `text-underline-offset: 3px`. Saat hover garis menjadi 2 px. Tautan tetap bergaris bawah agar tidak hanya dibedakan lewat warna.
- Kutipan: garis kiri 3 px `#26599A`, padding kiri 20 px. Jangan memakai tanda kutip dekoratif besar.
- Paragraf memakai `text-wrap: pretty`, judul memakai `text-wrap: balance`. Kata dan URL panjang memakai `overflow-wrap: anywhere` agar tidak mendorong layout ke samping.
- `::selection` memakai latar stabilo `#DCEBFA` dengan teks `#10243F`.
- Fokus keyboard pada tautan dan tombol: outline 2 px `#26599A`, offset 2 px. Jangan pernah `outline: none` tanpa pengganti.
- Gerak: tidak ada animasi pada teks. Transisi hover maksimal 150 ms, dan dimatikan saat `prefers-reduced-motion: reduce`.

**Waktu baca** — Hitung dari `body` di server: jumlah kata ÷ 200, dibulatkan ke atas, minimal 1. Tampilkan sebagai `5 menit baca`. Jangan simpan ke database; hitung saat render indeks dan detail.

### B. CMS: editor artikel

Rute: `/admin/artikel/baru` dan `/admin/artikel/[slug]`. Kerangka admin (sidebar, header) tetap ada. Area kerja di dalamnya terasa seperti lembar kosong.

#### B.1 Tata letak per ukuran layar

**Desktop dan tablet (≥768 px):**

```
┌───────────────────────────────────────────────────────────────┐
│ ← Artikel     Draf · Tersimpan 10.42        [Detail] [Simpan draf] [Terbitkan] │  ← bilah editor, sticky top
├───────────────────────────────────────────────────────────────┤
│                 ┌──────────── 680 px ────────────┐            │
│                 │ Judul                           │            │
│                 │ Mulai menulis, atau ketik / …   │            │
│                 │                                 │            │
│                 └─────────────────────────────────┘            │
└───────────────────────────────────────────────────────────────┘
```

**Ponsel (<768 px):**

```
┌──────────────────────────────┐
│ ←  Tersimpan ✓   [Terbitkan] ⋯ │  ← bilah editor, sticky top, tinggi 56 px
├──────────────────────────────┤
│ Judul                         │
│ Mulai menulis…                │
│                               │
├──────────────────────────────┤
│ B  I  H  “  •  1.  🔗  🖼  ⌄    │  ← toolbar format, menempel di atas keyboard
└──────────────────────────────┘
```

#### B.2 Bilah editor (pengganti tombol melayang)

- Hapus tombol **Terbitkan** yang saat ini melayang di kanan bawah (`fixed bottom-6 right-5`). Semua aksi pindah ke satu bilah `position: sticky; top: 0` di atas kanvas, dengan latar `--admin-canvas` dan garis bawah `--admin-line` yang muncul hanya setelah halaman discroll.
- **Kiri:** tautan `← Artikel` ke daftar. Di ponsel hanya ikon panah dengan `aria-label="Kembali ke daftar artikel"`.
- **Tengah:** chip status artikel (`Draf` atau `Terbit`) dan status simpan. Status simpan memakai `role="status"` dan `aria-live="polite"` seperti sekarang. Nilainya:

| Status | Teks desktop | Teks ponsel | Ikon |
|---|---|---|---|
| Belum ada perubahan sejak dibuka | `Tersimpan` | `Tersimpan` | centang |
| Ada perubahan, menunggu autosave | `Belum tersimpan` | `Belum tersimpan` | titik |
| Sedang menyimpan | `Menyimpan…` | `Menyimpan…` | spinner (statis saat reduced motion) |
| Berhasil | `Tersimpan 10.42` | `Tersimpan` | centang |
| Sedang mengunggah gambar | `Menunggu unggahan gambar…` | `Mengunggah…` | spinner |
| Gagal | `Gagal menyimpan` + tautan **Coba lagi** | `Gagal` + **Coba lagi** | segitiga peringatan |
| Konflik | `Diubah di tab lain` + **Muat ulang** | `Konflik` + **Muat ulang** | segitiga peringatan |

- **Kanan, desktop:** tombol sekunder **Detail** (membuka panel §B.5), tombol sekunder **Simpan draf** (hanya untuk artikel draf), dan tombol utama **Terbitkan** (`--admin-ink`, teks `--admin-on-ink`). Untuk artikel terbit, tombol utama menjadi **Perbarui**, dan tombol **Simpan draf** diganti tautan **Lihat publik** (tab baru).
- **Kanan, ponsel:** hanya tombol utama dan tombol ikon `⋯` (`aria-label="Aksi lain"`). Menu `⋯` berisi: Detail & thumbnail, Simpan draf, Lihat publik, Tarik dari publik, Hapus (khusus `adminsuper`). Item yang tidak berlaku disembunyikan, bukan dinonaktifkan.
- Semua target sentuh minimal 44 × 44 px. Tinggi tombol visual boleh 36–40 px, tetapi area kliknya diperluas dengan padding.
- Saat mengedit artikel terbit, tampilkan satu baris informasi di bawah bilah: **Perubahan tersimpan langsung ke situs.** Latar `--admin-surface`, teks 13 px. Baris ini bisa ditutup dan tidak muncul lagi selama sesi tab yang sama.
- Pintasan keyboard: `Ctrl/⌘ + S` menyimpan sekarang (dan mencegah dialog simpan browser). Tampilkan pintasan di `title` tombol **Simpan draf**.

#### B.3 Kanvas tulis

- Lebar maksimal `--article-measure` (680 px), di tengah, dengan padding atas 48 px di desktop dan 24 px di ponsel. Padding bawah minimal 40vh agar baris terakhir bisa discroll ke tengah layar saat mengetik, seperti di Medium.
- **Judul** adalah `<textarea>` terpisah dengan `rows=1` dan tinggi otomatis, tanpa border, tanpa latar. Ukurannya mengikuti `h1` di `.article-prose`. Placeholder: `Judul`. Batas 120 karakter. Penghitung `87/120` hanya muncul setelah 100 karakter. `Enter` di judul tidak membuat baris baru; fokus pindah ke awal isi. Tempel teks multibaris di judul diubah menjadi satu baris.
- **Isi** adalah BlockNote di dalam `.article-editor.article-prose`. Placeholder blok kosong pertama: `Mulai menulis, atau ketik / untuk menyisipkan blok`. Placeholder blok kosong lain hanya muncul pada baris yang sedang fokus.
- Matikan latar, border, dan padding bawaan BlockNote. Sisakan hanya handle blok (`⋮⋮` dan `+`) yang muncul di kiri saat hover di desktop. Di ponsel, handle disembunyikan dan diganti tombol `+` pada toolbar format.
- Galat validasi muncul tepat di bawah field yang salah, 13 px, warna galat admin, dengan `role="alert"`. Saat validasi gagal, fokus pindah ke field pertama yang salah. Teks galat:
  - Judul kosong: `Isi judul artikel.`
  - Isi kosong: `Tulis minimal satu paragraf.`
  - Alt gambar kosong saat terbit: `Tambahkan teks alternatif untuk gambar ini.`

#### B.4 Toolbar format dan menu blok

- **Desktop:** pakai formatting toolbar BlockNote bawaan yang muncul saat teks dipilih. Isinya hanya yang didukung `ArticleBody`: Tebal, Miring, Garis bawah, Coret, Kode, Tautan, dan ubah blok ke Paragraf/H2/H3/H4/Kutipan/Daftar. Sembunyikan warna teks, perataan, dan tabel karena tidak dirender publik.
- **Menu `/`:** daftar blok dibatasi ke Paragraf, Heading 1–3, Daftar berpoin, Daftar bernomor, Kutipan, dan Gambar. Setiap item punya ikon, nama Bahasa Indonesia, dan alias pencarian Inggris (`h2`, `quote`, `image`). Menu dapat dinavigasi dengan panah, `Enter`, dan `Esc`.
- **Ponsel:** toolbar format statis menempel di atas keyboard virtual, tinggi 48 px, bisa digeser horizontal bila tidak muat. Isinya: `+` (menu blok), B, I, H2, H3, kutipan, daftar, daftar bernomor, tautan, gambar, dan `⌄` (tutup keyboard). Posisi dihitung dari `window.visualViewport` (`height` dan `offsetTop`) sehingga toolbar naik bersama keyboard di iOS dan Android. Saat keyboard tertutup, toolbar turun ke dasar layar dan memakai `padding-bottom: env(safe-area-inset-bottom)`.
- Setelah setiap ketikan, pastikan kursor tidak tertutup toolbar atau keyboard. Bila jarak kursor ke tepi atas toolbar <24 px, scroll kanvas agar kursor kembali berjarak 96 px.
- Dialog tautan: satu field URL dengan validasi `http(s)://` atau `mailto:`, tombol **Terapkan** dan **Hapus tautan**. Tidak menerima `javascript:`.

#### B.5 Panel Detail & thumbnail

- **Desktop:** panel samping kanan 360 px, dibuka tombol **Detail**. Kanvas tidak bergeser; panel menimpa ruang kosong kanan dan hanya mendorong kanvas bila lebar layar <1280 px.
- **Ponsel:** bottom sheet tinggi maksimal 85vh dengan handle tarik, judul `Detail artikel`, dan tombol tutup. Fokus terkunci di dalam sheet, `Esc` dan tombol tutup mengembalikan fokus ke tombol pembuka.
- Isi panel, urut dari atas:
  1. **Thumbnail indeks (opsional).** Area 4:3 dengan garis putus-putus. Kosong: ikon gambar dan teks `Pilih gambar untuk daftar artikel` serta keterangan `JPEG, PNG, atau WebP. Maks. 10 MB.` Klik atau sentuh membuka pemilih file (`accept="image/jpeg,image/png,image/webp"`). Di desktop, area ini juga menerima drag & drop. Terisi: pratinjau hasil crop 4:3 dengan tombol **Ganti** dan **Hapus**.
  2. **Pratinjau di indeks.** Kartu kecil yang meniru baris indeks publik (§D.2): tanggal, waktu baca, judul, ringkasan dua baris, dan thumbnail. Kartu diperbarui saat judul atau isi berubah.
  3. **Ringkasan.** Teks hanya-baca `Diambil otomatis dari paragraf pertama.` beserta ringkasan yang akan tampil. Ringkasan tidak dapat diedit di plan ini.
  4. **Alamat.** Slug hanya-baca `albanaspeech…/artikel/<slug>` dengan tombol **Salin**. Untuk draf baru sebelum tersimpan, tampilkan `Alamat dibuat saat draf pertama tersimpan.`
  5. **Riwayat.** `Terbit 12 November 2026` dan `Terakhir diubah 22 November 2026, 10.42`.

#### B.6 Blok gambar inline

- Sisipkan lewat menu `/` → **Gambar**, tombol gambar di toolbar ponsel, drag & drop file ke kanvas, atau paste gambar dari clipboard.
- **Kosong:** kotak setinggi 160 px dengan teks `Pilih gambar` dan keterangan format. Tidak menyediakan tab "tautkan URL", karena hanya URL internal yang diterima.
- **Mengunggah:** tampilkan pratinjau lokal (object URL) yang diredupkan 50%, bilah progres indeterminate di bawahnya, dan teks `Mengoptimalkan gambar…`. Simpan ditahan selama unggahan berlangsung (status bilah: `Menunggu unggahan gambar…`). Tersedia tombol **Batal**.
- **Gagal:** pratinjau tetap tampil dengan garis galat, pesan dari server (mis. `Ukuran gambar melebihi 10 MB. Pilih file lain.`), serta tombol **Coba lagi** dan **Ganti file**.
- **Siap:** gambar tampil selebar kolom dengan rasio aslinya. Di bawahnya:
  - Field caption inline tanpa border, placeholder `Tulis keterangan (opsional)`, gaya caption `.article-prose`.
  - Field **Teks alternatif** yang muncul saat gambar dipilih, label `Teks alternatif`, bantuan `Jelaskan isi gambar untuk pembaca yang tidak dapat melihatnya. Maks. 250 karakter.` Gambar tanpa alt diberi label kecil `Alt belum diisi` di pojok kiri atas agar mudah ditemukan sebelum terbit.
- Toolbar gambar (saat gambar dipilih): **Ganti**, **Teks alternatif**, **Hapus**. Di ponsel toolbar ini menggantikan isi toolbar format selama gambar terpilih.

#### B.7 Dialog Terbitkan, Tarik dari publik, dan Hapus

- **Terbitkan / Perbarui** membuka dialog (desktop: modal 560 px di tengah; ponsel: bottom sheet). Isinya:
  - Judul `Terbitkan artikel?` atau `Perbarui artikel terbit?`.
  - Kartu pratinjau indeks yang sama dengan §B.5.
  - Daftar periksa: judul terisi, isi terisi, semua gambar punya alt, thumbnail (opsional, ditandai `Opsional`). Item yang gagal memakai ikon peringatan dan tautan `Perbaiki` yang menutup dialog dan memfokuskan blok terkait.
  - Tombol **Terbitkan sekarang** aktif hanya bila semua item wajib lolos. Tombol **Batal** di sebelahnya.
  - Setelah berhasil: toast `Artikel diterbitkan.` dengan aksi **Lihat**.
- **Tarik dari publik:** dialog konfirmasi `Tarik artikel dari publik?` dengan teks `Artikel kembali menjadi draf dan alamatnya tidak dapat dibuka pengunjung. Isi tidak dihapus.` Tombol **Tarik dari publik** (gaya destruktif ringan) dan **Batal**. Fokus awal pada **Batal**.
- **Hapus** (`adminsuper`): dialog `Hapus artikel ini?` dengan teks `Artikel dan gambarnya dihapus permanen. Tindakan ini tidak dapat dibatalkan.` Tombol **Hapus permanen** (destruktif) dan **Batal**. Fokus awal pada **Batal**.
- Semua dialog: `role="dialog"`, `aria-modal`, fokus terkunci, `Esc` menutup, dan fokus kembali ke tombol pembuka.

#### B.8 Memuat, keluar, dan galat

- Selama BlockNote dimuat, tampilkan skeleton yang meniru kanvas (satu bar judul 60% lebar, empat bar paragraf), bukan teks `Memuat editor…`. Skeleton memakai `aria-busy="true"` dan statis saat reduced motion.
- Peringatan `beforeunload` saat ada perubahan belum tersimpan tetap dipertahankan. Untuk tautan `← Artikel` di dalam aplikasi, tampilkan dialog `Perubahan belum tersimpan` dengan pilihan **Simpan lalu keluar**, **Keluar tanpa menyimpan**, dan **Tetap di sini**.
- Saat offline (`navigator.onLine === false`), status simpan menjadi `Offline — perubahan disimpan saat tersambung` dan autosave menunggu event `online`.

### C. CMS: daftar artikel

Rute: `/admin/artikel`.

#### C.1 Kepala halaman dan filter

- Judul halaman `Artikel` memakai `AdminPageTitle`. Aksi utama **Tulis artikel** di `AdminPageActions`. Di ponsel aksi ini tetap di kepala halaman sebagai tombol bulat ikon `+` dengan `aria-label="Tulis artikel"`.
- Di bawah kepala: kolom cari pil (`Cari judul…`) dan grup chip status **Semua · Draf · Terbit** dengan jumlah per status (`Draf 3`). Chip aktif memakai `--admin-ink`. Semua nilai tersimpan di URL (`?q=&status=`), sehingga tautan bisa dibagikan dan tombol kembali browser bekerja.
- Ekspor tetap di `TableToolbar` dan mengikuti filter yang sama.

#### C.2 Desktop (≥768 px): tabel

| Kolom | Lebar | Isi |
|---|---|---|
| Artikel | fleksibel | Thumbnail 64 × 48 radius 8 px (atau kotak abu dengan ikon dokumen bila kosong), judul 15 px semibold maksimal 2 baris, dan di bawahnya ringkasan 13 px `--admin-text-secondary` 1 baris. |
| Status | 112 px | Chip teks `Draf` (`--admin-surface-muted`) atau `Terbit` (nada hijau lembut admin). Warna bukan satu-satunya pembeda; teks tetap tertulis. |
| Diperbarui | 160 px | Waktu relatif (`3 jam lalu`) dengan tanggal lengkap di `title` dan `<time dateTime>`. |
| Terbit | 140 px | Tanggal terbit pertama atau `—`. |
| Aksi | 56 px | `RowActions`: Ubah, Lihat publik (hanya terbit, tab baru), Hapus (hanya `adminsuper`). |

- Seluruh baris dapat diklik untuk membuka editor. Tautan sebenarnya berada pada judul, dan area baris memakai pola *stretched link* agar tetap satu tab stop per baris. Tombol `RowActions` berada di atas lapisan tautan.
- Hover baris: latar `--admin-surface`. Tinggi baris tidak berubah saat hover.

#### C.3 Ponsel (<768 px): baris bertumpuk

```
┌──────────────────────────────────────┐
│ Judul artikel yang cukup panjang  ┌──┐ │
│ hingga dua baris…                 │▧ │ │
│ Draf · Diubah 3 jam lalu      ⋯   └──┘ │
└──────────────────────────────────────┘
```

- Judul 15 px semibold maksimal 2 baris di kiri, thumbnail 56 × 42 di kanan (disembunyikan bila tidak ada, sehingga judul memakai lebar penuh).
- Baris meta: status · waktu diperbarui, 13 px. Tombol `⋯` 44 × 44 px membuka `RowActions` sebagai bottom sheet.
- Baris dipisah garis `--admin-line`, tanpa kartu bertumpuk, agar lebih banyak artikel terlihat dalam satu layar.

#### C.4 Kondisi kosong, hasil kosong, dan galat

| Kondisi | Teks | Aksi |
|---|---|---|
| Belum ada artikel | `Belum ada artikel. Tulisan pertama Anda akan muncul di sini.` | **Tulis artikel** |
| Filter tanpa hasil | `Tidak ada artikel yang cocok dengan “<q>”.` | **Hapus filter** |
| Gagal memuat | `Daftar artikel gagal dimuat.` | **Coba lagi** |

- `loading.tsx` menampilkan skeleton 6 baris sesuai layout aktif (tabel di desktop, baris bertumpuk di ponsel).

### D. Publik: indeks artikel

Rute: `/artikel`. Ganti grid kartu dua kolom yang ada dengan daftar satu kolom ala feed Medium.

#### D.1 Kepala halaman

- Kontainer `site-wrapper`, isi di tengah dengan lebar maksimal 720 px (sedikit lebih lebar dari kolom baca agar thumbnail muat).
- Label `[ ARTIKEL ]` (`--text-label`), `h1` `Artikel` memakai `--text-h2`, lalu satu kalimat lead `--text-lead` berisi tujuan rubrik. Naskah lead ditentukan pemilik konten; jangan membuat klaim baru.
- Padding atas 64 px di desktop, 40 px di ponsel. Jarak ke daftar 40 px.

#### D.2 Baris artikel

```
Desktop                                         Ponsel
┌───────────────────────────────────────────┐   ┌────────────────────────────┐
│ 12 November 2026 · 5 menit baca           │   │ 12 Nov 2026 · 5 menit baca │
│ Judul artikel dua baris         ┌───────┐ │   │ Judul artikel     ┌──────┐ │
│ maksimal di desktop             │  4:3  │ │   │ tiga baris maks.  │ 4:3  │ │
│ Ringkasan dua baris dengan …    │160×120│ │   │                   │96×72 │ │
│                                 └───────┘ │   │                   └──────┘ │
└───────────────────────────────────────────┘   └────────────────────────────┘
```

- Struktur: `<ul>` → `<li>` → `<article>`. Judul adalah `<h2>` berisi satu `<Link>`. Seluruh baris dapat diklik lewat *stretched link* (`::after` pada tautan judul), sehingga hanya ada **satu tab stop per artikel**. Hapus tautan kedua `Baca artikel` agar pembaca layar tidak mendengar tautan ganda.
- **Metadata** di atas judul: tanggal (`dateStyle: "long"` di desktop, `"medium"` di ponsel <480 px) · waktu baca. 14 px `#47607D`.
- **Judul:** Plus Jakarta Sans 700, 20 px di ponsel dan 24 px di desktop, line-height 1.25, `#10243F`. Maksimal 3 baris di ponsel dan 2 baris di desktop (`line-clamp`), dengan judul lengkap tetap ada di DOM.
- **Ringkasan:** Inter 400, 16 px, `#47607D`, line-height 1.55, maksimal 2 baris. **Disembunyikan di ponsel <480 px** agar baris tetap ringkas, seperti feed Medium di ponsel.
- **Thumbnail:** di kanan, rasio 4:3, radius 4 px. Ukuran tampil 96 × 72 px di ponsel dan 160 × 120 px di desktop. Selalu `width`/`height` eksplisit, `loading="lazy"` kecuali tiga baris pertama, dan `alt=""` karena judul sudah menjelaskan isinya. Tanpa thumbnail, kolom teks memakai lebar penuh; jangan menampilkan placeholder kosong.
- Jarak antarbaris: padding 24 px atas-bawah dengan garis pemisah 1 px `#D8E4F0`. Tanpa kartu, tanpa bayangan.
- Hover (perangkat pointer): judul berubah ke `#26599A` dengan garis bawah. Fokus keyboard: outline 2 px `#26599A` mengelilingi seluruh baris (`:focus-visible` pada tautan, outline digambar di `::after`).

#### D.3 Kondisi kosong dan galat

- Kosong: `Belum ada artikel yang diterbitkan.` di dalam kolom yang sama, dengan tautan kembali ke beranda.
- Galat: `Artikel belum dapat dimuat. Coba lagi beberapa saat.` dengan tombol **Muat ulang**. Pertahankan layout kepala halaman agar tidak terlihat seperti halaman rusak.
- Pagination di luar cakupan plan ini. Bila jumlah artikel melewati 30, catat sebagai pekerjaan lanjutan.

### E. Publik: detail artikel

Rute: `/artikel/[slug]`.

#### E.1 Struktur halaman

```
← Semua artikel                          (tautan kecil, 14 px)

Judul Artikel Besar yang Bisa            (h1, maks. 680 px)
Sampai Tiga Baris
Ringkasan sebagai subjudul abu-abu.

12 November 2026 · 5 menit baca          (metadata)
───────────────────────────────────────  (garis #D8E4F0, margin 32 px)

Paragraf pembuka…
[ gambar inline ]
   keterangan gambar
## Subjudul
…

───────────────────────────────────────
← Semua artikel        [ Lihat program ]  (penutup)
```

- Seluruh isi `<article>` berada di kolom `--article-measure` (680 px), di tengah. Padding atas 32 px di ponsel, 64 px di desktop.
- Tautan kembali di atas judul, 14 px, `#47607D`, target sentuh 44 px.
- `h1`, ringkasan, dan metadata memakai skala `.article-prose`. Ringkasan hanya tampil bila tidak sama persis dengan awal paragraf pertama, agar teks tidak terbaca dua kali.
- Bila artikel punya thumbnail, thumbnail **tidak** ditampilkan di atas judul. Thumbnail khusus untuk indeks dan pratinjau berbagi (Open Graph). Detail artikel hanya menampilkan gambar yang ditulis di isi.

#### E.2 Isi

- `ArticleBody` membungkus isi dengan `.article-prose` dan menghapus kelas `space-y-6 text-lg` yang sekarang, karena jarak sudah diatur per elemen.
- Pemetaan heading tetap: blok level 1 → `h2`, level 2 → `h3`, level 3 → `h4`. Hanya ada satu `h1` per halaman.
- Daftar bersarang memakai indent 1.5em per tingkat. Penanda daftar berwarna `#47607D`.

#### E.3 Penutup artikel

- Garis pemisah, lalu satu baris berisi tautan **← Semua artikel** di kiri dan satu CTA biru utama (**Lihat program**) di kanan. Di ponsel keduanya bertumpuk, CTA selebar penuh di atas.
- Hanya satu CTA biru di halaman ini, sesuai aturan proporsi warna sistem desain publik.

#### E.4 Gambar inline

- Markup: `<figure>` → `<img>` + `<figcaption>` opsional. `<img>` selalu memakai `width` dan `height` dari metadata, serta `style="aspect-ratio: w / h; height: auto; width: 100%"`, sehingga ruang tersedia sejak awal dan CLS 0.
- **Ponsel (<768 px):** gambar melebar ke tepi layar (`margin-inline: calc(-1 * gutter)`, `width: 100vw` dibatasi `max-width: none`), tanpa radius, seperti Medium. Caption tetap di dalam gutter.
- **Desktop:** gambar selebar kolom 680 px, radius 4 px. Gambar portrait dibatasi tinggi maksimal 80vh dan diletakkan di tengah dengan `object-fit: contain`, agar tidak memenuhi beberapa layar.
- Jarak: 2em di atas dan bawah `figure`.
- `loading="lazy"` dan `decoding="async"` untuk semua gambar kecuali gambar pertama bila berada dalam 600 px pertama isi.
- Latar placeholder `#F3F7FC` selama gambar dimuat. Bila gambar gagal dimuat, latar tetap dan alt tampil sebagai teks 14 px di tengah. Teks di sekitarnya tidak bergeser.

#### E.5 SEO dan berbagi

- **Metadata** — Pakai `SITE_URL` dari `front/lib/seo.ts` untuk canonical HTTPS absolut `/artikel` dan `/artikel/<slug>` tanpa parameter. Indeks memakai judul dan deskripsi sendiri. Detail memakai `generateMetadata` dengan `<judul> | Albana Speech Academy` serta deskripsi dari `excerpt`, atau teks pembuka untuk artikel lama yang ringkasannya kosong. Pertahankan slug saat judul diperbarui. [Metadata Next.js](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) · [Panduan snippet Google](https://developers.google.com/search/docs/appearance/snippet)
- **Pratinjau berbagi** — Isi Open Graph `article` dan Twitter Card dari metadata yang sama, termasuk `publishedTime` di Open Graph bila tanggal terbit tersedia. Gunakan thumbnail artikel dengan URL absolut jika layak untuk kartu, atau `HOME_OG_IMAGE` sebagai fallback. Verifikasi gambar bisa diakses tamu tanpa login. Gunakan aset teroptimasi yang sudah ada.
- **Data terstruktur** — Render `BlogPosting` JSON-LD melalui `serializeJsonLd` dengan `headline`, `description`, `mainEntityOfPage`, `inLanguage`, `publisher` Albana, dan `datePublished` bila tersedia. Tambahkan penulis bila atribusinya tampil di halaman, serta gambar bila relevan dan dapat dirayapi. Isi `dateModified` dan sitemap `lastmod` hanya jika waktu perubahan konten dapat dipercaya. [Data terstruktur artikel Google](https://developers.google.com/search/docs/appearance/structured-data/article) · [Panduan sitemap Google](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- **Penemuan dan indeks** — Tambahkan tautan **Artikel** ke footer publik agar indeks bisa ditemukan dari beranda dan halaman program. Judul pada indeks tetap berupa tautan HTML ke detail. Sitemap hanya memuat URL kanonis yang dapat diindeks, termasuk indeks dan artikel terbit. Artikel draf, ditarik, atau dihapus mengembalikan 404 untuk tamu dan keluar dari sitemap. CMS tetap di balik autentikasi. Preview atau staging yang dapat dibuka tanpa login memakai `noindex` yang bisa dibaca crawler. `robots.txt` produksi merujuk sitemap dan mengizinkan crawl halaman serta gambar artikel terbit. [Panduan noindex Google](https://developers.google.com/search/docs/crawling-indexing/block-indexing)

### F. Aksesibilitas dan kualitas (berlaku di seluruh modul)

- Kontras teks memakai pasangan warna yang sudah diukur di sistem desain publik §3 dan token admin. Jangan memakai `--admin-text-faint` atau biru muda `#3B72B5` untuk teks di bawah 32 px.
- Zoom 200% dan lebar 320 px: tidak ada scroll horizontal, tidak ada teks terpotong, dan toolbar ponsel tetap dapat digeser.
- Semua kontrol ikon punya `aria-label`. Semua dialog dan sheet mengunci dan mengembalikan fokus.
- Urutan fokus mengikuti urutan visual: bilah editor → judul → isi → panel (bila terbuka).
- Halaman baca publik tidak memuat bundle BlockNote (periksa tab Network).
- Target performa halaman detail di profil mobile staging: LCP ≤2,5 detik, CLS ≤0,1, INP ≤200 ms.

## Checklist implementasi

### 1. Kontrak gambar dan upload privat

- [ ] Buat migrasi baru di `front/supabase/migrations/` dengan bucket `article-images` dan kolom nullable `articles.thumbnail_image_id`. Buat juga tabel `article_images` berisi UUID, uploader, slug terkait, profil `thumbnail`/`inline`, object key, MIME, dimensi, ukuran byte, serta waktu siap, lepas, dan klaim pembersihan. Aktifkan RLS dan batasi tabel serta bucket ke jalur server yang berwenang. Baris lama tetap memiliki thumbnail `NULL`.
- [ ] Tambah `prepareArticleImage(bytes, profile)` di `front/lib/media-prepare.ts` dengan hasil `{ bytes, contentType, width, height }`. Tambahkan `purpose=article`, `profile`, dan `file` ke `POST /api/upload` di `front/app/api/upload/route.ts`. Cabang artikel memakai guard admin dan batas unggahan sebelum Sharp. Catat metadata sementara, unggah objek, lalu tandai siap sebelum mengembalikan `{ id, url, width, height }`. Jika gagal, bersihkan objek atau pertahankan metadata untuk pembersihan ulang. Pesan galat ditulis dalam Bahasa Indonesia dan siap ditampilkan langsung di blok gambar (§B.6).
- [ ] Tambah `front/app/api/article-images/[id]/route.ts` dan pola UUID spesifik di `front/lib/albana-routes.ts`. Tamu hanya mendapat gambar siap yang masih dirujuk artikel terbit. Admin dapat melihat gambar draf yang terpasang dan unggahan sementaranya sendiri. Akses tanpa izin menghasilkan 404. Endpoint mengirim MIME aktual dan `nosniff` tanpa mengungkap URL Storage.
- [ ] Verifikasi lewat `media-prepare.test.mjs` dan `albana-routes.test.mjs`. Uji EXIF, transparansi, gambar kecil/portrait, berkas rusak atau MIME palsu, batas byte/piksel, serta regresi unggah modul lain. Dari staging, buktikan URL draf tetap 404 untuk tamu dan non-admin, termasuk setelah URL itu pernah dibuka admin.

### 2. Editor BlockNote dan penyimpanan artikel

- [ ] Tambahkan `--article-measure` dan kelas `.article-prose` (§A) di `front/app/globals.css`. Ganti aturan `.article-editor` lama yang membesarkan blok pertama sebagai judul.
- [ ] Di `front/components/admin/article/ArticleEditor.tsx`, ganti tombol **Terbitkan** melayang dengan bilah editor sticky (§B.2), termasuk tampilan ponsel dengan menu `⋯`, status simpan lengkap, dan pintasan `Ctrl/⌘ + S`.
- [ ] Pisahkan judul menjadi `<textarea>` tinggi otomatis (§B.3). Pakai `titleBlock()` saat menyusun payload lama. Pindahkan galat validasi ke bawah field terkait dengan teks dari §B.3.
- [ ] Di `ArticleBlockEditor.tsx`, batasi formatting toolbar dan menu `/` ke blok yang didukung (§B.4). Tambahkan toolbar format ponsel yang menempel di atas keyboard via `visualViewport`, beserta penjagaan kursor agar tidak tertutup.
- [ ] Tambahkan panel **Detail & thumbnail** (§B.5): panel samping di desktop dan bottom sheet di ponsel, dengan unggah/ganti/hapus thumbnail, pratinjau baris indeks, ringkasan otomatis, slug, dan riwayat.
- [ ] Tambahkan blok gambar inline (§B.6) dengan `uploadFile` yang mengembalikan URL lokal `/api/article-images/<uuid>`. Sediakan input alt dan caption, pratinjau lokal saat mengunggah, galat, coba lagi, ganti, dan batal. Input file tersedia di ponsel, dengan drag & drop dan paste gambar sebagai jalur tambahan. [File Panel BlockNote](https://www.blocknotejs.org/docs/react/components/image-toolbar)
- [ ] Tambahkan dialog **Terbitkan/Perbarui** dengan pratinjau dan daftar periksa, dialog **Tarik dari publik**, dan dialog keluar tanpa menyimpan (§B.7–§B.8). Ganti teks `Memuat editor…` dengan skeleton kanvas.
- [ ] Di `front/lib/article-blocks.ts`, dukung blok `image` dengan `props.url`, `alt`, dan `caption`. Terima hanya URL gambar internal berformat kanonis. Wajibkan alt informatif (maks. 250 karakter) sebelum gambar tampil publik. Proyeksi teks dan ringkasan tetap berasal dari blok teks. Pertahankan fallback untuk artikel lama. Tambahkan helper `readingMinutes(body)` (§A) dengan uji unit.
- [ ] Di `front/lib/actions/article-actions.ts`, kirim `thumbnailImageId` bersama blok. Gunakan satu transaksi melalui RPC khusus service role setelah pemeriksaan admin. Di dalam RPC, kunci artikel dan metadata gambar, cek `expectedUpdatedAt`, dan cek profil serta kepemilikan unggahan baru atau keterikatannya pada artikel yang sama. Simpan blok, thumbnail, dan relasi gambar aktif sekaligus. Tandai gambar yang dilepas, dan lakukan hal yang sama saat artikel dihapus. Validasi status terbit dan media di server setiap kali menyimpan. Pertahankan slug dan tanggal terbit pertama.
- [ ] Pertahankan autosave 1,5 detik dan publikasi hanya setelah aksi eksplisit. Jalankan **Tarik dari publik** sebagai perubahan status atas versi tersimpan, dengan pemeriksaan konflik yang sama. Tampilkan **Perubahan tersimpan langsung ke situs** saat mengedit artikel terbit. Serialkan permintaan simpan. Pertahankan perubahan yang terjadi setelah snapshot simpan, termasuk saat draf pertama mendapat slug. Tahan simpan selama unggahan berlangsung, dan tunda autosave saat offline. Pada konflik, pertahankan tulisan lokal sampai penulis memilih memuat ulang. Pada gagal simpan, aksi coba lagi meneruskan aksi yang gagal tanpa loop otomatis.
- [ ] Verifikasi di `article-blocks.test.mjs` dan staging. Uji artikel lama, URL eksternal/base64, ID unggahan admin lain, alt kosong pada artikel terbit, ketikan selama request simpan, dan dua tab yang mengubah artikel bersamaan. Uji buat draf, muat ulang, terbitkan, dan ganti gambar dengan keyboard desktop serta ponsel sentuh. Di iOS Safari dan Chrome Android, buktikan toolbar format naik bersama keyboard dan kursor tidak tertutup saat menulis paragraf panjang.

### 3. Daftar CMS dan aksi cepat

- [ ] Di `front/app/(admin)/admin/artikel/page.tsx` dan `loading.tsx`, terapkan §C: chip status dengan jumlah, tabel desktop dengan kolom thumbnail+judul+ringkasan, baris bertumpuk di ponsel, *stretched link* per baris, dan aksi **Lihat publik** untuk artikel terbit melalui slot `RowActions`. Pertahankan filter `q` dan `status`, urutan berdasarkan waktu diperbarui, dan ekspor. Bedakan kondisi belum ada artikel, hasil kosong, dan gagal muat dengan teks §C.4.
- [ ] Verifikasi pencarian + filter dapat dibagikan lewat URL, reset mengembalikan daftar, ekspor mengikuti filter yang sama, dan aksi Hapus hanya muncul serta berhasil untuk `adminsuper`. Cek judul panjang, satu tab stop per baris, dan fokus keyboard pada lebar 320, 390, dan 1440 px.

### 4. Indeks dan pembaca publik

- [ ] Di `front/app/(web)/artikel/page.tsx` dan `front/lib/server/public-articles.ts`, ganti grid kartu dengan daftar satu kolom (§D). Ambil hanya metadata thumbnail dan `body` yang cukup untuk waktu baca. Hapus tautan ganda `Baca artikel`.
- [ ] Di `front/app/(web)/artikel/[slug]/page.tsx` dan `front/components/article/article-body.tsx`, terapkan struktur §E.1–E.4: kolom 680 px, `.article-prose`, metadata dengan waktu baca, dan penutup dengan satu CTA. Ambil dimensi aset yang dirujuk secara batch. Render gambar inline dengan alt, caption opsional, ruang sesuai rasio sejak awal, tampilan selebar layar di ponsel, dan lazy load di bawah viewport. Jika gambar gagal dimuat, isi teks tetap dapat dibaca.
- [ ] Verifikasi artikel lama, artikel tanpa thumbnail, artikel dengan foto panjang, daftar bertingkat, dan tautan panjang pada 320, 390, 768, dan 1440 px. Cek zoom 200%, urutan fokus, teks yang membungkus, dan CLS akibat gambar. Pastikan detail dan URL gambar mengembalikan 404 untuk tamu setelah **Tarik dari publik** atau **Hapus**, termasuk di browser yang sudah membuka artikel.

### 5. SEO, sitemap, dan pratinjau tautan

- [ ] Terapkan §E.5 di dua halaman publik Artikel dan `front/lib/seo.ts`. Bagikan pembacaan artikel terbit per request antara `generateMetadata` dan halaman. Uji canonical, fallback ringkasan/gambar, dan serialisasi JSON-LD di `front/lib/seo.test.mjs`. Tambahkan pengingat nonwajib di dialog terbit agar judul spesifik dan paragraf pembuka merangkum topik. Gunakan field yang sudah ada.
- [ ] Tambahkan tautan `/artikel` di `front/components/layout/site-footer.tsx`. Verifikasi dari beranda, footer program, dan judul di indeks, termasuk saat JavaScript dinonaktifkan.
- [ ] Tambahkan `front/app/sitemap.ts` dan `front/app/robots.ts`. Bangun entri artikel dari query ringan `slug` dengan `published=true` di `front/lib/server/public-articles.ts`. Baca status terkini saat sitemap diminta dan kembalikan 5xx bila sumber data gagal. Uji `/sitemap.xml` dan `/robots.txt` dari sesi anonim dan pastikan perubahan status langsung tercermin. [Sitemap Next.js](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [ ] Di staging, periksa respons HTML dan status HTTP untuk artikel lama, artikel terbit dengan/tanpa thumbnail, serta artikel ditarik. Cocokkan canonical pada halaman dengan sitemap, uji kartu berbagi, dan validasi JSON-LD melalui Rich Results Test dengan input HTML jika staging privat. Seusai rilis, kirim sitemap dan periksa sampel URL produksi di Search Console jika akses tersedia.

### 6. Rekonsiliasi storage dan QA staging

- [ ] Buat `front/scripts/prune-article-images.mjs` untuk dry run dan pembersihan eksplisit. Proses unggahan batal/gagal atau gambar yang terlepas ≥7 hari. Klaim kandidat secara atomik, cek ulang referensi, lalu hapus lewat Storage API. Penyimpanan artikel menolak ID yang sedang diklaim. Kegagalan hapus dapat dicoba ulang. Jalankan dry run di staging sebelum penghapusan pertama. [Penghapusan objek Supabase](https://supabase.com/docs/guides/storage/management/delete-objects)
- [ ] Bandingkan ukuran sumber/hasil, waktu encode, dan detail visual pada foto, screenshot berteks, serta PNG transparan. Uji WebP dan AVIF di Chrome, Firefox, Safari desktop, dan iOS. Catat hasilnya, termasuk waktu respons gambar serta LCP/CLS/INP di profil mobile staging, terhadap target §F.
- [ ] Jalankan matriks QA UI berikut dan lampirkan tangkapan layar setiap sel ke catatan rilis:

| Layar | 320 px | 390 px | 768 px | 1440 px |
|---|---|---|---|---|
| Editor: draf baru, mengetik, menyisipkan gambar | ✓ | ✓ (iOS & Android) | ✓ | ✓ |
| Editor: dialog Terbitkan dengan item gagal | ✓ | ✓ | ✓ | ✓ |
| Daftar CMS: kosong, terfilter, penuh | ✓ | ✓ | ✓ | ✓ |
| Indeks publik: dengan dan tanpa thumbnail | ✓ | ✓ | ✓ | ✓ |
| Detail publik: gambar landscape, portrait, gagal muat | ✓ | ✓ | ✓ | ✓ |

- [ ] Dari `front/`, jalankan `node --test lib/article-blocks.test.mjs lib/media-prepare.test.mjs lib/albana-routes.test.mjs lib/seo.test.mjs`, `npx tsc --noEmit`, ESLint untuk berkas yang diubah, dan `npm run build`. Sebelum rilis, cocokkan RLS/grant staging dengan migrasi. Uji ganti gambar, simpan konflik, tarik/hapus artikel, serta pembersihan yang berjalan bersamaan dengan simpan. Terapkan migrasi sebelum kode yang memakai kolom baru.

Eksekusi dimulai setelah konfirmasi pengguna.
