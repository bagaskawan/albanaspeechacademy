# Design system admin Albana Speech Academy

> **Dokumen rujukan.** Pedoman yang berlaku dan dipakai untuk implementasi ada di [albana-docs/admin/design-system.md](../albana-docs/admin/design-system.md). Halaman ini dipertahankan sebagai arsip; jika berbeda, dokumen tersebut yang menang.

Panduan untuk dashboard, formulir operasional dan CMS akademi. Berlaku untuk tema terang dan gelap.

---

## 0. Filosofi Desain

Operator harus bisa melihat apa yang perlu diisi, kapan pendaftaran dibuka, dan apakah perubahan sudah tersimpan. Gunakan ruang putih untuk mengelompokkan data dan beri warna pada tindakan atau status yang perlu dibedakan.

| Aspek | Web Komunitas | Admin CMS |
|---|---|---|
| **Pengguna** | Publik / Kreator | Internal / Operator |
| **Mood** | Bold, Provocative, Editorial | Clean, Data-Driven, Professional |
| **Navigasi** | — | Sidebar desktop dan menu geser di ponsel |
| **Warna** | Editorial + biru fungsional + stabilo | Biru Albana untuk aksi + netral + stabilo + aksen pastel |
| **Corner** | Sharp (0px) | Besar & lembut (16–20px pada kartu) |
| **Bayangan** | Tidak ada | Sangat tipis, hampir tak terlihat |
| **Tipografi angka** | — | Raksasa, berat ekstrem (number display) |

> Kelompokkan pertanyaan menurut pekerjaan operator. Tempatkan ringkasan dan satu aksi utama di akhir tiap tahap.

---

## 1. Visual Theme & Atmosphere

Permukaan utama tetap netral agar data mudah dipindai.

- Gunakan biru Albana `#2F5C86` (hover `#24486A`, dari `--color-button`) untuk aksi dan fokus, stabilo `#FFE78A` untuk satu frasa penekanan, hijau untuk berhasil, amber untuk menunggu, dan merah untuk galat.
- Tambahkan aksen pastel sage `#A7B7A9`, sand `#E6D9C4`, clay `#C58A78`, sun `#E7C75D`, dan biru panel `#D5E7FF` sebagai latar chip, panel info, dan grafik. Jangan untuk teks atau tombol utama.
- Hindari indigo, ungu, gradient ungu-biru, glassmorphism, emoji sebagai ikon, dan angka karangan.
- **White Cards on Light Gray:** Latar belakang halaman adalah abu-abu sangat terang (`#F2F4F7`). Kartu konten adalah putih bersih (`#FFFFFF`). Kontras antara background dan kartu sangat subtle — tidak ada bayangan dramatis.
- **Number Display Typography:** Angka statistik utama ditampilkan dalam ukuran raksasa (`38–56px`) dengan font weight `800–900`. Ini adalah elemen paling menonjol di halaman.
- Gunakan header untuk identitas, breadcrumb dan akun. Sidebar menunjukkan modul aktif dan berubah menjadi drawer di ponsel.
- **Large Rounded Cards:** Semua kartu menggunakan `border-radius: 16–20px` — sudut yang cukup besar untuk terasa modern dan ramah, namun tidak berlebihan.
- **Minimal Chrome:** Tidak ada dekorasi yang tidak perlu. Setiap piksel di UI memiliki fungsi informasi.

---

## 2. Color Palette & Roles

### 2.1 Background & Surface

| Nama | Kode Hex | Peran |
|---|---|---|
| **Page Background** | `#F2F4F7` | Latar belakang seluruh halaman — abu-abu biru sangat terang |
| **Card Surface** | `#FFFFFF` | Semua kartu, top nav bar, panel dropdown |
| **Input Background** | Transparan | Field garis mengikuti permukaan induk. Pencarian toolbar memakai latar netral. |
| **Row Hover** | `#F8F9FA` | Baris tabel saat di-hover |
| **Aksen pastel** | Sage `#A7B7A9` · Sand `#E6D9C4` · Clay `#C58A78` · Sun `#E7C75D` · Blue panel `#D5E7FF` | Latar chip, panel info, dan grafik. Bukan warna teks. |
| **Stabilo** | `#FFE78A` | Satu frasa per judul; pakai `.highlight-stabilo`. |

### 2.2 Teks & Hierarki

| Nama | Kode Hex | Peran |
|---|---|---|
| **Primary Text** | `#111111` | Angka besar, judul kartu, teks utama |
| **Secondary Text** | `#6B7280` | Label deskriptif, sub-teks, metadata |
| **Placeholder** | `#9CA3AF` | Placeholder input, teks non-aktif |
| **Table Header** | `#6B7280` | Header kolom tabel |
| **Divider** | `#E5E7EB` | Border kartu, garis pemisah row tabel |

### 2.3 Aksen aksi

Tombol utama dan garis fokus memakai biru Albana `#2F5C86` (`--color-button`, hover `#24486A`) dengan teks putih; di tema gelap `#D5E7FF` dengan teks `#111111`. `variant="default"` membaca `--primary`; pada scope admin arahkan `--primary` ke `--color-button`, jangan membuat varian baru. Aksen pastel §2.1 hanya latar, bukan warna teks. Indigo, ungu, lime, dan salmon tidak dipakai untuk tombol maupun grafik pertumbuhan.

### 2.4 Status operasional

| Makna dan contoh label | Terang · teks / latar | Gelap · teks / latar |
|---|---|---|
| Draf · “Belum dibuka” | `#374151 / #F3F4F6` | `#E5E7EB / #27272A` |
| Aktif · “Sedang diedit” | `#44503F / #EAF0E6` | `#D6E3D0 / #22301C` |
| Berhasil · “Tersimpan”, “Terbit” | `#166534 / #DCFCE7` | `#BBF7D0 / #14532D` |
| Menunggu · “Menunggu verifikasi” | `#92400E / #FEF3C7` | `#FDE68A / #451A03` |
| Galat · “Jadwal bentrok” | `#991B1B / #FEE2E2` | `#FECACA / #450A0A` |

Sertakan kata yang menjelaskan status. Targetkan kontras teks normal minimal 4,5:1 dan indikator fokus minimal 3:1 terhadap permukaan di sebelahnya.

### 2.5 Chart Colors

| Elemen | Warna | Keterangan |
|---|---|---|
| **Bar Utama (Filled)** | `#2F5C86` | Batang chart data utama (biru aksi) |
| **Bar Sekunder** | Sage 40% di atas kartu | Batang chart perbandingan |
| **Donut Segment Utama** | `#2F5C86` | Segmen terbesar pada donut/pie chart |
| **Donut Segment Sekunder** | Sand, sage, `#E6EDF4` | Segmen lain (pastel lembut) |
| **Chart Grid Line** | `#F3F4F6` | Garis grid horizontal pada chart area |

---

## 3. Typography Rules

> **Tidak ada font Serif sama sekali.** Ini berbeda dari desain sebelumnya. Admin CMS versi ini sepenuhnya menggunakan Sans-serif.

### Font Family

- **Primary Font:** `"Montserrat"` lewat `--font-sans` — font antarmuka admin, dari judul hingga teks terkecil. Fallback `"Plus Jakarta Sans"`.
- **Angka display:** `"Inter"` lewat `--font-display`; aktifkan `tnum` pada tabel dan nominal.
- **Fallback:** `ui-sans-serif, system-ui, -apple-system, sans-serif`

### Hierarki Tipografi (Ukuran Standar)

| Level | Size | Weight | Warna | Keterangan |
|---|---|---|---|---|
| **Display Number** | `38–56px` | `800` (ExtraBold) | `#111111` | Angka statistik utama (e.g. 202,324 / $500,324) |
| **Page Title** | `24–28px` | `700` (Bold) | `#111111` | Judul halaman di content area ("Dashboard") |
| **Card Label** | `13–14px` | `500` (Medium) | `#6B7280` | Label di atas angka statistik ("Total Products Sales") |
| **Section Title** | `16–18px` | `600` (SemiBold) | `#111111` | Judul section ("Recant Orders", "Top Selling Products") |
| **Section Subtitle** | `12px` | `400` (Regular) | `#9CA3AF` | Sub-deskripsi section di bawah judul |
| **Table Header** | `12px` | `600` (SemiBold) | `#6B7280` | Header kolom tabel (Order id, Product Name, dll.) |
| **Table Body** | `13px` | `500` (Medium) | `#111111` | Isi data kolom utama tabel |
| **Table Body Meta** | `13px` | `400` (Regular) | `#374151` | Isi data kolom sekunder tabel |
| **Nav Label (Sidebar)** | `12–13px` | `600` (SemiBold) | `#374151` | Label item navigasi vertikal |
| **Nav Label Active** | `12–13px` | `700` (Bold) | `#111111` | Label item aktif di sidebar |
| **Button Text** | `13px` | `600` (SemiBold) | Sesuai konteks | Teks tombol aksi utama |
| **Badge Text** | `11–12px` | `600` (SemiBold) | Sesuai status | Teks badge growth indicator & status |
| **Link Action** | `13px` | `600` (SemiBold) | `#111111` | Teks link "View Sales Details →" |

> **Catatan:** Inter mendukung `font-feature-settings: "tnum"` (tabular numbers) yang **harus diaktifkan** untuk semua angka dalam tabel dan statistik agar kolom angka sejajar rapi.

---

## 4. Layout & Navigation System

### 4.1 Sidebar Navigation (Vertikal Kiri)

- **Ukuran desktop** mengikuti shell `w-56` (14 rem). Pada ponsel, tombol menu membuka drawer.
- **Background:** `#FFFFFF` dengan garis batas kanan `1px solid #E5E7EB`.
- **Nav Items:** Tersusun vertikal dengan padding vertical standar (`py-2`) dan ukuran teks standar (`text-xs font-semibold`).
- **Modul aktif** memakai garis tinta 3 px di kiri, label bold, stabilo `.highlight-stabilo`, dan `aria-current="page"`.
- **Isi sidebar** memuat modul yang tersedia bagi akun operator.

### 4.2 Top Header Bar

- **Tinggi header** mengikuti `h-18` pada shell aktif.
- **Lebar:** Memanjang penuh dari ujung kiri ke ujung kanan (**`w-full` / full width**).
- **Background:** `#FFFFFF` dengan border bawah `1px solid #E5E7EB`.
- **Identitas** memakai logo Albana versi terang atau gelap di layout admin.
- **Breadcrumbs (Kiri/Tengah):** Ditempatkan tepat di samping logo (dipisahkan garis pembatas vertikal) dengan format `[ ADMIN ] / BREADCRUMB / SUB-BREADCRUMB`.
- **User Profile Dropdown (Kanan):** Avatar bulat (`32px`), nama admin (`text-xs font-semibold`), dan chevron `∨`.
- **Peran Lain:** Menampung toggle dark-mode (w-8 h-8) dan notifikasi pending transaksi jika ada.

### 4.3 Content Area Layout

```
+--------------------------------------------------------------+
|                    TOP HEADER BAR (h-18)                     |
+--------------------------------------------------------------+
| SIDEBAR   |                                                  |
| (w-56)   |  Dashboard       [Search...] [Export CSV] [Report]|
|           |                                                  |
| Kiri      |  ┌────────────┐  ┌─────────────────┐  ┌────────┐ |
| Di bawah  |  │ Stat Card  │  │ Chart Card (bar)│  │ Donut  │ |
| Header    |  │ (narrow)   │  │ (wide)          │  │ Card   │ |
|           |  └────────────┘  └─────────────────┘  └────────┘ |
| Hanya     |                                                  |
| Menu      |  ┌─────────────────────────────┐  ┌────────────┐ |
| Nav       |  │ Table: Recent Orders        │  │ Upcoming   │ |
|           |  │ (2/3 width)                 │  │ Events     │ |
|           |  └─────────────────────────────┘  └────────────┘ |
+--------------------------------------------------------------+
```

- **Padding konten:** `24–32px` (kiri, kanan, atas dari topbar).
- **Grid atas:** 3 kolom — `1fr : 2fr : 1.5fr` (stat kecil : chart bar : donut chart).
- **Grid bawah:** `2fr : 1fr` (tabel orders : panel produk/event).
- **Gap antar kartu:** `16–24px`.

### 4.4 Page Header Section

```
Dashboard                          [🔍 Search product...]  [↑ Export CSV]  [↓ Download Report]
```

- **Judul halaman:** Montserrat `24px`, `font-weight: 700`, warna `#111111`.
- **Search bar:** Lebar `w-full sm:w-[280px]`, background `#F5F5F5` (`bg-bg-well`), border `1px solid #E5E7EB`, `border-radius: 999px` (pill/rounded-full), padding `py-4 pl-10 pr-4` (vertical 16px), text `14px` (`text-sm`).
- **Action buttons:** memakai `front/components/ui/Button.tsx` (`variant="default"` untuk aksi utama, `outline` untuk sekunder), radius 14px, teks 12–13px weight 600–700.
  - Program statis dua; tidak ada tombol “Buat program”. Aksi utama di halaman batch adalah “Tambah batch”.

---

## 5. Border Radius System

> **Konsistensi ketat.** Setiap komponen memiliki nilai radius yang spesifik dan tidak boleh berubah-ubah.

| Komponen | Border Radius | Catatan |
|---|---|---|
| **Kartu konten (cards)** | `16px` | Semua kartu data, chart, tabel |
| **Kartu panel lebar** | `20px` | Kartu chart bar & donut yang lebih besar |
| **Top nav bar** | `0px` | Bar navigasi, no rounding |
| **Tombol (Export, Download)** | `14px` (`--radius-lg`) | Mengikuti `Button.tsx` |
| **Search bar** | `999px` (rounded-full) | Penuh, kapsul sempurna |
| **Status badges (tabel)** | `999px` | Pill, dot 6px |
| **Growth badges (+10%, -12%)** | `999px` | Pill penuh |
| **Avatar user** | `50%` | Bulat sempurna |
| **Thumbnail produk di tabel** | `8px` | Sedikit melengkung |
| **Input field** | `0px` | Field data memakai garis bawah dan label tetap |
| **Dropdown menus** | `12px` | Panel dropdown |

---

## 6. Component Anatomy

### Form input admin

Gunakan komponen dari [style-line](../../front/components/ui/style-line/). Tampilkan satu label tetap, tanda wajib bila perlu, petunjuk singkat, lalu galat di bawah kontrol. Hubungkan label, petunjuk, dan galat ke kontrol yang menerima fokus.

| Data | Kontrol |
|---|---|
| Nama, angka, rupiah, jam | `InputLine` dengan tipe atau inputMode yang sesuai. Tampilkan “Rp” satu kali. |
| Jawaban panjang | `TextareaLine` |
| Pilihan tunggal, jamak, atau pilihan yang perlu terlihat bersamaan | `SelectLine`, `MultiSelectLine`, `RadioGroupLine` |
| Tanggal, telepon | `DatePickerLine`, `PhoneNumberLine`. Pasangkan tanggal dengan jam untuk sesi WIB. |
| Boolean, gambar galeri, isi artikel | Checkbox berlabel, input file khusus gambar, atau BlockNote. Input file hanya untuk gambar galeri/artikel — bukan bukti transfer. Letakkan label dan pesan pada posisi yang sama dengan field garis. |

Pada ponsel pakai satu kolom. Di desktop pasangkan field terkait, misalnya mulai dan selesai sesi. Sediakan area sentuh sekitar 44 px, fokus terlihat, dan pertahankan nilai saat validasi gagal.

Wadah dan menu memakai primitif Shadcn yang sudah terpasang (`dialog.tsx`, `select.tsx`, `popover.tsx`, `table.tsx`, `badge.tsx`, `sonner.tsx`). Field tetap style-line; jangan memakai input kotak untuk form baru.

Letakkan galat spesifik di bawah field yang salah. Galat umum diletakkan di bawah judul dan di atas field pertama, bukan toast. Simpan berhasil memunculkan toast (`sonner`), satu per aksi.

Wadah form: modal untuk form pendek (trainer, galeri, venue, partner, acara, member, ≤ 12 field). Halaman untuk batch (sesi berulang + pratinjau) dan artikel (BlockNote).

Bukti transfer tidak diunggah. Langkah bayar menampilkan rekening dan nominal; tanda terima menampilkan ID pendaftaran dan tombol “Kirim bukti via WhatsApp” dengan pesan terisi ke nomor admin **0857-1779-7637** (`wa.me/6285717797637`).

### 6.1 Stat Card (Kartu Statistik Kecil)

```
┌────────────────────────────────┐
│  Total Products Sales    [ikon]│
│                                │
│  202,324  [+10% ↑]             │
│                                │
│  View Sales Details       →    │
└────────────────────────────────┘
```

- **Container:** `border-radius: 16px`, background `#FFFFFF`, `border: 1px solid #E5E7EB`, padding `20–24px`.
- **Label:** Montserrat `13px`, `font-weight: 500`, warna `#6B7280`, di atas angka.
- **Angka Utama:** Inter `38–56px`, `font-weight: 800`, warna `#111111`, `letter-spacing: -0.02em`.
- **Growth Badge:** Pill `border-radius: 999px`. Positif: background `#DCFCE7`, teks `#166534`, `11px` `font-weight: 600`. Negatif: background `#FEE2E2`, teks `#991B1B`.
- **Ikon Dekorasi (pojok kanan atas):** Kotak abu-abu kecil `border-radius: 8px`, background `#F3F4F6`, ikon outline `20px` warna `#6B7280`.
- **Link "View Details":** Teks `13px` `font-weight: 500` warna `#111111`, ikon `→` di kanan. Separator: garis tipis di atas link area.

### 6.2 Chart Bar Card

- **Container:** `border-radius: 20px`, background `#FFFFFF`, `border: 1px solid #E5E7EB`, padding `24px`.
- **Header:** Label + angka besar + growth badge + menu `...` (titik tiga).
- **Legend:** Bulatan kecil + label teks, font `12px`, warna `#6B7280`.
- **Bar Chart:**
  - Bar solid biru `#2F5C86` = data utama (Total Revenue)
  - Bar arsir sage 40% = data pembanding (Total Profit)
  - Grid horizontal: garis `1px solid #F3F4F6`
  - Label sumbu X (bulan): `10px` `#6B7280`
  - Tidak ada label sumbu Y di luar area chart
  - Bar memiliki `border-radius: 4px` di atas

### 6.3 Donut Chart Card

- **Container:** `border-radius: 20px`, background `#FFFFFF`, `border: 1px solid #E5E7EB`.
- **Header:** "Total Sales Statistics" + dropdown "Monthly ∨".
- **Donut Chart:**
  - Segmen utama: `#2F5C86` (biru aksi)
  - Segmen lain: sand, sage, atau `#E6EDF4`
  - Label tengah: angka besar + growth badge
- **Legend kanan dan kiri:** Label kategori + angka `font-weight: 600`, teks kategori `12px` `#6B7280`.
- **Sub-total bawah:** "Total Number of Sales" label kecil + angka `32px` `font-weight: 800`.

### 6.4 Tabel (Tabular Data & Recent Orders)

- **Container:** `border-radius: 16px`, background `#FFFFFF`, `border: 1px solid #E5E7EB`.
- **Section Header:**
  - Judul: Montserrat `18px`, `font-weight: 600`, `#111111`
  - Sub-teks: Montserrat `12px`, `#9CA3AF`
  - Tombol "View All →": pill tombol kecil, `border: 1px solid #E5E7EB`, `border-radius: 999px`, font `12px`
- **Table Header Cells (`th`):**
  - Padding: `py-4 px-6` (tinggi baris longgar).
  - Borders: Memiliki garis pembatas bawah (**`border-b`**) dan kanan (**`border-r`**) dengan ketebalan tipis (`border-zinc-400/70 dark:border-zinc-800/60`).
  - Background: Warna latar belakang lembut `bg-zinc-50/50 dark:bg-zinc-900/30`.
  - Font: `12px` (`text-xs`), `font-weight: 600` (`font-semibold`), warna `text-zinc-650 dark:text-zinc-400`.
- **Table Body Cells (`td`):**
  - Padding: `py-4 px-6`.
  - Borders: Menggunakan pembatas sel penuh. Setiap kolom dipisahkan oleh garis kanan (**`border-r`**, kolom terakhir dikecualikan dengan `last:border-r-0`). Setiap baris dipisahkan oleh garis bawah (**`border-b`**, baris terakhir dikecualikan agar tidak memiliki border bawah ganda di kaki kontainer).
  - Warna Border Sel: `border-zinc-100 dark:border-zinc-800/40`.
  - Hover Row: Baris tabel berganti latar belakang saat di-hover dengan `hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20` dengan efek transisi warna (`transition-colors`).
- **Kolom Order ID:** Font `13px`, `font-weight: 600`, `#111111`, diawali `#`.
- **Kolom Product Name:** Thumbnail gambar `32x32px` `border-radius: 8px` + nama produk. Font `13px`, `font-weight: 500`.
- **Kolom tanggal, payment:** Font `13px`, `font-weight: 400`, `#374151`.
- **Kolom Amount:** Font `13px`, `font-weight: 600`, `#111111`.
- **Kolom Status (Badge):**
  - `border-radius: 999px`
  - Padding: `4px 10px`
  - Font: `11px`, `font-weight: 500`
  - Warna sesuai tabel status di seksi 2.4
- **Kolom Action:** Ikon `...` (titik tiga) atau tombol aksi ikonik dengan background warna lunak (seperti edit/hapus). Hover: warna berubah lebih tegas.

### 6.5 Top Selling Panel (Kanan Bawah)

- **Container:** `border-radius: 16px`, background `#FFFFFF`, `border: 1px solid #E5E7EB`.
- **Header:** "Top Selling Products" + dropdown "Monthly ∨".
- **Product Card:** Thumbnail gambar `48x48px` `border-radius: 8px` + nama produk bold + brand + stok + harga.
- **Mini Bar Chart:** Chart batang horizontal sederhana dengan label hari (Tue, Wed, Thu, Fri) dan nilai. Bar warna `#2F5C86`, tipis dan minimalis.

---

## 7. Elevation & Shadow System

> **Prinsip utama:** Bayangan adalah musuh. Pembeda elemen dicapai melalui **border tipis** dan **perbedaan background warna**, bukan shadow.

| Level | CSS Value | Penggunaan |
|---|---|---|
| **0 (Flat)** | `none` | Default semua elemen |
| **1 (Card)** | `0 1px 2px rgba(0,0,0,0.04)` | Kartu konten — hanya digunakan jika tidak ada border |
| **2 (Popover)** | `0 4px 12px rgba(0,0,0,0.06)` | Dropdown, tooltip, menu |
| **3 (Modal)** | `0 20px 60px rgba(0,0,0,0.10)` | Modal, dialog |

> Semua kartu menggunakan `border: 1px solid #E5E7EB` **ATAU** `box-shadow: elevation-1`, tidak keduanya.

---

## 8. Spacing System (Base 4px Grid)

| Token | Nilai | Contoh Penggunaan |
|---|---|---|
| `space-1` | `4px` | Jarak ikon ke teks dalam badge |
| `space-2` | `8px` | Padding badge, gap legend chart |
| `space-3` | `12px` | Padding vertikal tombol kecil, gap antar badge |
| `space-4` | `16px` | Padding card kecil, gap antar kartu |
| `space-5` | `20px` | Padding standard dalam kartu |
| `space-6` | `24px` | Padding kartu utama, gap section |
| `space-8` | `32px` | Jarak antar baris grid utama |

---

## 9. Interactive States

| State | Efek |
|---|---|
| **Hover (Tombol)** | Background berubah ke `#F5F5F5`, transisi `100ms ease` |
| **Hover (Table Row)** | Background berubah ke `#F8F9FA`, transisi `80ms ease` |
| **Hover (Nav Item)** | Teks warna berubah ke `#111111`, transisi `100ms` |
| **Active (Nav Item)** | Garis kiri tinta 3 px, label bold, stabilo |
| **Focus (Input)** | Garis fokus biru 2 px. Trigger tombol menampilkan ring `:focus-visible` dengan offset. |
| **Click (Button)** | `transform: scale(0.98)`, durasi `80ms ease-in` |
| **Hover (Link "View All")** | Teks `#111111` dengan underline |

---

## 10. Animation Specifications

Gunakan transisi CSS pada elemen yang berinteraksi dengan operator.

| Interaksi | Gerak dan durasi |
|---|---|
| Hover, fokus dan respons tombol | Warna garis atau latar 100–120 ms |
| Buka dialog, ganti langkah, tambah sesi | Opacity 0 → 1 dan translateY 4 px → 0 selama 160 ms ease-out |
| Simpan atau gagal | Pesan muncul 120 ms dan diumumkan melalui status atau alert |
| Memuat | Satu indikator pada aksi yang menunggu. Tabel dan grafik tetap stabil saat data diperbarui. |

Pada `prefers-reduced-motion: reduce`, tampilkan keadaan akhir seketika dan gunakan teks “Menyimpan…” untuk proses yang masih berlangsung. Batasi transisi ke properti terkait dan putar animasi masuk sekali per interaksi.

---

## 11. Dark Mode Tokens

| Token CSS | Light Mode | Dark Mode |
|---|---|---|
| `--bg-page` | `#F2F4F7` | `#0F1117` |
| `--bg-card` | `#FFFFFF` | `#1A1D27` |
| `--bg-input` | `#F5F5F5` | `#22263A` |
| `--text-primary` | `#111111` | `#F0F0F0` |
| `--text-secondary` | `#6B7280` | `#8B8FA8` |
| `--text-placeholder` | `#9CA3AF` | `#55596E` |
| `--border-default` | `#E5E7EB` | `#2A2E42` |
| `--accent-green` | `#BAFF6A` | `#A3E85A` |
| `--accent-red` | `#FF6B6B` | `#FF5252` |
| Aksi & fokus | `#2F5C86` | `#D5E7FF` |
| Stabilo | `#FFE78A` | `rgba(116,135,87,0.45)` |
| `--chart-main` | `#2F5C86` | `#D5E7FF` |
| `--chart-secondary` | Sage 40% | Sage 30% |

`--accent-green` dan `--accent-red` adalah token lama; status memakai pasangan warna §2.4, bukan token ini.

Dark mode toggle berada di area profil user di kanan nav bar.

---

## 12. Perbandingan dengan Versi Sebelumnya

| Elemen | Versi Sebelumnya (PayPen-style) | Versi Ini (Ecomora-style) |
|---|---|---|
| **Navigasi** | Sidebar vertikal | Sidebar desktop dan drawer mobile |
| **Font heading section** | Playfair Display Serif italic | **Montserrat sans-serif bold** - tidak ada serif |
| **Aksen warna** | Dark Teal `#2D6A5E` | Biru Albana + stabilo + aksen pastel pada §2 |
| **Border radius kartu** | 8–10px (konservatif) | **16–20px (modern & lembut)** |
| **Angka statistik** | Regular card layout | **Display number raksasa 48–56px** |
| **Chart style** | Area chart berwarna teal | **Bar/area chart biru + sage** |
| **Welcome banner** | Ada, latar gelap | **Tidak ada** |
| **Background halaman** | `#F0F0EE` warm off-white | **`#F2F4F7` cool gray** |
| **Shadow kartu** | `shadow-sm` ada | **Border tipis, shadow minimal/tidak ada** |
| **Serif DNA** | Playfair Display heading section | **Dihilangkan sepenuhnya** |

---

## 13. Verifikasi penerapan

Periksa satu form sederhana, editor batch, editor artikel, serta satu tabel dengan keyboard di tema terang dan gelap. Pada lebar 360 px, coba kirim data kosong, perbaiki kesalahan pertama, lalu simpan. Ulangi dengan preferensi gerak dikurangi. Aksi utama, status simpan, dan pesan galat harus tetap terbaca sepanjang alur.

- [ ] Program hanya dua (Public Speaking Series, Basic to Advance); tidak ada tombol buat/ubah program.
- [ ] Form pendek terbuka sebagai modal; batch dan artikel membuka halaman.
- [ ] Galat field muncul di bawah field; galat umum di atas field pertama; sukses memunculkan toast.
- [ ] Tombol biru `#2F5C86`, stabilo, dan label form konsisten; tidak ada indigo atau gradient sisa.
- [ ] Tanda terima menampilkan ID dan tombol WhatsApp berisi pesan terisi; tidak ada file input bukti.
- [ ] Bukti transfer tidak disimpan di storage aplikasi.
