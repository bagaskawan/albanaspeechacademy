# Pola UI admin — Monochrome Soft

**Status:** rancangan, 16 November 2026; revisi navigasi sidebar, kepala halaman, dan tabel pada tanggal yang sama. Belum diterapkan. Dokumen ini **menggantikan arah visual** [design system admin](admin-design-system.md) untuk CMS: gaya baru mengikuti gambar referensi yang disetujui pemilik — kanvas putih monokrom dengan nada lembut sebagai pelengkap, font Plus Jakarta Sans, satu sidebar berisi item pil, tombol ikon bulat, dan kartu besar berbentuk lunak.

| Urusan | Sumber |
| --- | --- |
| Tampilan, token, komponen, gerak admin | **Dokumen ini** |
| Menu, rute, tabel, jalur tulis | [Struktur admin](../architecture/admin-structure.md) |
| Aksesibilitas, status simpan, aturan WhatsApp, editor artikel | [Design system admin](admin-design-system.md) §6.5–§6.10, §12 — tetap berlaku |
| Situs publik | [Design system akademi](academy-design-system.md) — **tidak** ikut berubah |

Bila design system admin berbeda dari dokumen ini soal warna, font, radius, atau susunan, **dokumen ini yang berlaku**.

## 1. Karakter

Tenang, padat informasi, dan terasa seperti alat kerja yang dirawat. Ruang abu muda, permukaan putih yang besar dan membulat, satu bidang hitam untuk hal terpenting di layar, dan kuning hanya untuk hal yang menuntut tindakan.

| Dari gambar | Diterapkan di CMS Albana |
| --- | --- |
| Kanvas abu muda di atas latar bertekstur | Kanvas `#EFEFEF` penuh layar; tanpa tekstur foto |
| Navigasi atas berupa pil putih, aktif hitam | Item sidebar berbentuk pil; aktif hitam teks putih. Header hanya berisi logo, tema, dan pengguna (§3.1) |
| Rail kiri berisi tombol bulat putih, aktif hitam | Diganti satu sidebar berisi grup dan sub-menu (§3.1) |
| Breadcrumb abu dengan ikon map dan panah panjang | Breadcrumb `Grup ⟶ Modul` |
| Judul besar ringan | Judul halaman Plus Jakarta Sans 400, 40–44 px |
| Tombol ikon bulat di kanan judul | Saring, cari, tanggal, aksi utama |
| Kartu hitam dengan kartu bertumpuk dan chip kuning | **Kartu sorotan**: satu per layar, untuk pekerjaan paling mendesak |
| Kartu putih dengan ikon berbingkai bulat + angka raksasa | Kartu metrik dan panel daftar |
| Angka dengan bagian akhir abu (99,**786**) | Rupiah: bagian ribuan terakhir lebih terang |
| Kapsul hitam berisi chip + tombol kuning | Grup saring cepat dengan aksi lanjut |
| Bilah bergaris diagonal | Pola untuk porsi “belum tercapai” pada bilah kemajuan |
| Kartu hijau mint | Bidang status berhasil |
| Kolom cari berbentuk pil abu | Semua kolom cari |
| Panah ↗ dalam lingkaran | Aksi “buka” pada kartu |
| Titik indikator carousel | Penanda halaman pada kartu sorotan bertumpuk |

Logo Albana tetap berwarna biru resminya; **biru tidak dipakai di UI admin selain logo**.

## 2. Token

### 2.1 Warna

Revisi 16 November 2026 ([rencana 3.6](../plans/2026-11-16-redesign-restructure-implementation-plan.md)): kanvas putih, kerangka monokrom, lima nada lembut sebagai pelengkap. **Tanpa biru.** Token di `app/globals.css` memakai awalan `--admin-` karena shadcn sudah memakai `--accent`, `--border`, dan `--card`.

| Token | Terang | Gelap | Pakai |
| --- | --- | --- | --- |
| `--admin-canvas` | `#FFFFFF` | `#0B0B0B` | Latar aplikasi |
| `--admin-surface` | `#F6F6F6` | `#161616` | Kartu, pil pasif, tombol bulat |
| `--admin-surface-muted` | `#EDEDED` | `#222222` | Input, kolom cari, chip pasif, hover |
| `--admin-ink` | `#0B0B0B` | `#F5F5F5` | Teks utama, pil aktif, tombol utama, kartu sorotan |
| `--admin-ink-soft` | `#2A2A2A` | `#D9D9D9` | Hover tombol utama, kartu bertumpuk |
| `--admin-on-ink` | `#FFFFFF` | `#0B0B0B` | Teks di atas `--admin-ink` |
| `--admin-text-secondary` | `#5C5C5C` | `#A8A8A8` | Meta, breadcrumb, label |
| `--admin-text-faint` | `#8F8F8F` | `#6E6E6E` | Hanya angka ≥ 32 px |
| `--admin-line` | `#E5E5E5` | `#2A2A2A` | Garis pemisah, tepi kartu |
| `--admin-line-strong` | `#C9C9C9` | `#3D3D3D` | Bingkai ikon bulat, tepi input saat hover |
| `--admin-danger` | `#B42318` | `#F97066` | Teks galat dan aksi hapus |

**Nada lembut** (`--admin-{nada}-soft`, `-ink`, `-dot`; utilitas `bg-admin-mint-soft`, dst.):

| Nada | `-soft` terang / gelap | `-ink` terang / gelap | `-dot` | Makna |
| --- | --- | --- | --- | --- |
| `mint` | `#DDF1E4` / `#15291D` | `#1E6A3C` / `#9FE0B5` | `#22A35A` | Terverifikasi, terbit, dibuka |
| `peach` | `#FDE7DA` / `#33201A` | `#9A4A1F` / `#F6B894` | `#E8833A` | Menunggu verifikasi, perlu tindakan |
| `rose` | `#FBE1E1` / `#331A1A` | `#A3282A` / `#F4A3A3` | `#E5484D` | Ditolak, dibatalkan, latar galat |
| `butter` | `#FBF6C8` / `#2E2B12` | `#6B5D00` / `#F2E58A` | `#E1C100` | Sorotan angka, isi grafik, penanda |
| `lilac` | `#ECE7FA` / `#221D33` | `#5B47A8` / `#C3B5F2` | `#7C66D9` | Kategori netral, deret kedua grafik, draf |

Aturan pakai:

- **Hitam adalah penekanan utama.** Pil aktif, tombol utama, dan satu kartu sorotan memakai `--admin-ink`.
- Nada lembut **hanya** dipakai untuk unsur kecil: chip status, titik 8 px, lencana hitungan, chip selisih, grafik, dan latar galat. Kartu, panel, pil, dan tombol tidak memakai nada.
- Satu nada membawa satu makna, dan paling banyak tiga nada di satu kartu.
- Teks di atas `-soft` memakai `-ink` nada yang sama.
- Lencana tagihan menunggu: latar `--admin-peach-dot`, teks `#0B0B0B`.

### 2.2 Tipografi

Plus Jakarta Sans untuk seluruh admin (revisi 16 November 2026, sebelumnya Poppins). Muat bobot **300, 400, 500, 600** lewat `next/font/google` pada route group `(admin)` dan `(auth)` sebagai `--font-admin`. Fallback: `ui-sans-serif, system-ui, sans-serif`.

| Peran | Ukuran / tinggi baris | Bobot | Contoh |
| --- | --- | --- | --- |
| Display angka | 64 / 1.0, `tabular-nums`, tracking −0.02em | 400 | Total tagihan menunggu |
| Judul halaman | 44 / 1.1 (ponsel 32), tracking −0.02em | 400 | “Tagihan” |
| Judul kartu | 22 / 1.3 | 500 | “Total Pendaftar” |
| Judul kartu sorotan | 22 / 1.3, putih | 500 | “Tagihan menunggu” |
| Judul seksi form | 15 / 1.4 | 600 | “Harga” |
| Isi, sel tabel, input | 15 / 1.5 | 400 | — |
| Label field | 13 / 1.4 | 500 | “Nama program” |
| Pil navigasi, tombol | 15 / 1 | 400 (aktif 500) | “Dashboard” |
| Meta, breadcrumb | 14 / 1.4 | 400 | “Katalog ⟶ Program” |
| Chip | 12 / 1 | 500 | “Perlu dicek” |
| Angka kecil di grafik | 11 / 1 | 500 | “62%” |

Judul memakai bobot **ringan** (400) dan ukuran besar — kontras datang dari skala, bukan ketebalan. Hindari 700 ke atas.

**Skala ponsel** (revisi 16 November 2026, diukur di 390 px). Ruang sempit menurunkan judul, tetapi tidak menurunkan teks isi:

| Peran | < 640 px | 640–767 px | ≥ 768 px |
| --- | --- | --- | --- |
| Judul halaman | 24 | 28 | 40 |
| Deskripsi halaman | 14 | 14 | 14 |
| Judul modal / lembar bawah | 18 | 20 | 20 |
| Judul panel (Pengaturan) | 18 | 18 | 20 |
| Angka statistik | 32 | 40 | 48 |
| Judul kartu daftar | 15 | 15 | — (tabel) |
| Isi, sel, nilai | 14 | 14 | 14 |
| Label field, label kolom kartu | 13 | 13 | 13 |
| Chip | 12 | 12 | 12 |
| **Input, textarea, select, kolom cari** | **16** | **16** | 14–15 |

- Input tidak pernah di bawah 16 px pada < 768 px: iOS Safari memperbesar halaman saat field di bawah 16 px difokuskan.
- Teks isi tidak turun di bawah 13 px; paragraf deskripsi minimal 14 px.
- Judul halaman muat dalam satu baris di 390 px untuk nama modul yang ada.

**Angka bertingkat.** Untuk angka display, bagian setelah pemisah ribuan terakhir memakai `--text-faint`: `Rp1.300.`**`137`** → `Rp1.300.` hitam, `137` abu. Pada tagihan, bagian abu itu kebetulan adalah kode unik, sehingga mata langsung menemukannya. Nilai lengkap tetap satu node teks dengan `aria-label` berisi angka utuh.

### 2.3 Bentuk dan ruang

| Unsur | Radius | Ukuran |
| --- | --- | --- |
| Kartu | 32 px | Padding 28 px (ponsel 20 px) |
| Kartu di dalam kartu (tumpukan) | 24 px | Padding 20 px |
| Pil navigasi | 999 px | Tinggi 56 px, padding 0 28 px, ikon 18 px + jarak 10 px |
| Tombol bulat besar (aksi judul) | 50% | 56 px |
| Tombol bulat kecil (↗ pada kartu) | 50% | 44 px |
| Tombol teks | 999 px | Tinggi 48 px, padding 0 24 px |
| Input, kolom cari | 999 px (satu baris) / 20 px (textarea) | Tinggi 52 px |
| Chip | 999 px | Tinggi 28 px, padding 0 12 px |
| Kapsul saring | 999 px | Tinggi 56 px, padding 6 px |
| Ikon berbingkai di judul kartu | 50% | 48 px, tepi 1 px `--line-strong` |
| Avatar | 50% | 40 px |

Spasi berbasis 4 px: jarak antarkartu **20 px**, antarbagian halaman **32 px**, kanvas ke tepi layar **40 px** (ponsel 16 px).

**Bayangan:** tidak ada pada kartu. Hanya lapisan terangkat:

| Lapisan | Bayangan |
| --- | --- |
| Dropdown, popover, tooltip | `0 12px 32px rgba(0,0,0,0.10)` |
| Dialog, panel samping | `0 32px 80px rgba(0,0,0,0.18)` |
| Kartu bertumpuk (lapisan belakang) | Tanpa bayangan; kedalaman dari selisih warna `--ink` → `--ink-soft` |

**Pola diagonal** untuk porsi kosong bilah kemajuan atau grafik:

```css
background: repeating-linear-gradient(-45deg, var(--line-strong) 0 6px, transparent 6px 14px);
```

### 2.4 Ikon

Lucide (sudah terpasang), garis 1,5 px, ukuran 18 px di pil dan 22 px di tombol bulat. Selalu garis, tidak pernah ikon isi atau ikon berwarna. Ikon tanpa teks wajib `aria-label`.

## 3. Kerangka aplikasi

Revisi 16 November 2026:
- **Navigasi** ada di satu sidebar berisi grup dan sub-menu, menggantikan pil grup di topbar dan rail ikon. Dua tingkat navigasi di dua tepi layar membuat kursor bolak-balik.
- **Header tetap ada**, tetapi hanya untuk identitas dan akun: logo di kiri, tombol tema dan menu pengguna di kanan. Header tidak berisi menu.

Gaya tetap sama: item berbentuk pil, aktif hitam, ikon garis, sudut lunak.

```text
╭──────────────────────────────────────────────────────────────────────────────╮
│ (◉) Albana CMS                                                    (◐)  (A) ˅ │ ← header 72 px
╰──────────────────────────────────────────────────────────────────────────────╯
╭──────────────╮
│ ▣ Dashboard  │   Konten  ⟶  Artikel
│              │   Artikel                 (⌕ Cari…) (⚲) (⇩ Ekspor) (● Tulis artikel)
│ Pendaftaran ˅│   Draf dan artikel terbit. Hanya artikel terbit tampil publik.
│   ○ Pendaftar│
│   ○ Tagihan 3│   ┌───────────────────────────────────────────────────────────┐
│ Kelas       ˅│   │ Judul                  Status    Terbit        Diperbarui   │ ← kepala tabel
│   ○ Program  │   └───────────────────────────────────────────────────────────┘
│   ○ Batch    │     Hallo semua            • Draf    —             11 Nov  (✎)(🗑)
│ Konten      ˅│   ─────────────────────────────────────────────────────────────
│   ● Artikel  │ ← item aktif: pil hitam, teks putih
│   ○ Media    │
╰──────────────╯
```

### 3.1 Header

| Unsur | Aturan |
| --- | --- |
| Wadah | Tinggi 72 px, latar `--admin-canvas`, garis bawah 1 px `--admin-line`. Lengket di atas; tidak bersembunyi saat gulir. Lebar penuh, di atas sidebar dan konten. |
| Kiri | Tombol bulat logo 44 px (latar `#0B0B0B`, logo putih) + "Albana CMS" 15/500. Tautan ke Dashboard. Di < 1024 px didahului tombol menu ☰ yang membuka laci sidebar. |
| Kanan | Tombol bulat tema 44 px, lalu tombol pengguna: avatar 36 px + username 14 px + chevron, membuka menu (username, Keluar). Di < 768 px hanya avatar. |
| Tidak boleh | Pil grup, tautan modul, breadcrumb, atau kolom cari global. |

### 3.2 Sidebar

| Unsur | Aturan |
| --- | --- |
| Wadah | Panel `--admin-surface` radius 32 px di bawah header, jarak 12 px dari tepi kiri dan bawah. Lebar 264 px. Lengket (`top` = tinggi header + 12 px); isi menu bergulir sendiri bila tidak muat. Tanpa logo, tema, dan akun (semuanya di header). |
| Dashboard | Item tunggal di atas grup. |
| Judul grup | 12/500 `--admin-text-secondary`, huruf biasa, tanpa kurung siku. Tombol yang membuka/menutup sub-menu, chevron 16 px di kanan, `aria-expanded`. |
| Item sub-menu | Pil tinggi 44 px, padding 0 14 px, ikon 18 px + label 15/400, jarak 2 px antaritem. Hover `--admin-surface-muted`. |
| Item aktif | Pil `--admin-ink`. **Ikon dan label** sama-sama `--admin-on-ink`, 500, dengan warna yang ditulis langsung pada label (tidak bergantung pada warisan) dan berada di atas pil (`position: relative; z-index: 1`). `aria-current="page"`. Kontras label ≥ 4,5:1 di kedua tema. |
| Lencana | Di ujung kanan item **Tagihan**: jumlah tagihan menunggu, latar `--admin-peach-dot`, teks `#0B0B0B`. Bila grup Pendaftaran tertutup, lencana pindah ke judul grup. |
| Buka/tutup grup | Grup yang memuat halaman aktif selalu terbuka. Grup lain mengingat keadaannya di `localStorage` (`admin-nav-open`). Bawaan: semua terbuka. |
| Kaki | Hanya tombol ⟷ ringkas/lebarkan (≥ 1024 px). |

| Grup | Modul |
| --- | --- |
| — | Dashboard |
| Pendaftaran | Pendaftar · Tagihan |
| Kelas | Program · Batch · Trainer |
| Konten | Artikel · Media · Galeri · Testimoni · Partner |
| Pengaturan | Profil akademi · Kontak · Rekening |

### 3.3 Kepala halaman

```text
Konten  ⟶  Artikel                                  ← breadcrumb 14 px, --admin-text-secondary
Artikel          (⌕ Cari…) (⚲) (⇩ Ekspor) (● Tulis artikel)   ← judul 40/400; bilah alat §8.2
Draf dan artikel terbit. Hanya artikel terbit tampil publik.   ← deskripsi 15, satu baris
```

- Kepala halaman dirender **sekali oleh shell**. Modul **tidak** membuat judul, eyebrow, atau deskripsi sendiri; judul ganda seperti "ARTIKEL" di bawah judul halaman dihapus.
- Deskripsi satu kalimat diambil dari daftar navigasi (`description` per modul). Halaman detail tidak menampilkan deskripsi.
- Sisi kanan memuat **bilah alat tabel** (§8.2) untuk modul daftar: Cari · Saring · Ekspor · Tambah. Modul menentukan tombol yang tampil lewat matriks §8.2; urutan tetap.
- Halaman detail: tombol bulat ← di kiri breadcrumb, menuju halaman daftar modul (§3.8 rencana).

### 3.4 Responsif

| Lebar | Header | Sidebar | Konten |
| --- | --- | --- | --- |
| ≥ 1280 px | Logo + nama; tema; avatar + username | Terbuka 264 px | Grid 12 kolom |
| 1024–1279 px | Sama | Ringkas 80 px: hanya ikon, judul grup menjadi garis pemisah, tooltip di kanan. Tombol ⟷ melebarkan. Pilihan diingat (`admin-nav-compact`). | Grid 8 kolom |
| 768–1023 px | ☰ + logo; tema; avatar + username | Laci dari kiri (300 px, latar gelap 30%); tutup dengan Escape, ketuk di luar, atau setelah memilih item | 1–2 kolom |
| < 768 px | ☰ + logo; tema; avatar saja | Laci | 1 kolom; judul 32 px |

### 3.5 Halaman Pengaturan (`/admin/settings`)

Dibuka dari menu akun → **Pengaturan**. Layar fokus tanpa sidebar navigasi; header tetap ada.

| Unsur | Aturan |
| --- | --- |
| Kepala | Tombol bulat ← (kembali ke Dashboard), judul, deskripsi; kanan: slot aksi tab aktif + tombol **Simpan perubahan** (nonaktif abu sampai ada perubahan; disembunyikan di < 768 px) |
| Tab | Daftar vertikal di kiri (≥ 1024 px): ikon bulat, judul, subjudul; tab aktif kartu putih dengan ikon hitam. < 1024 px: baris horizontal yang dapat digeser. **Pindah tab tidak memuat ulang halaman**; URL ikut `?tab=` lewat `history.replaceState` |
| Panel | Kartu putih dengan kepala ikon + judul. Semua panel tetap terpasang agar isian yang belum disimpan bertahan saat pindah tab; titik oranye di tab yang punya perubahan |
| Gulir | ≥ 1024 px: halaman setinggi layar; **hanya isi panel** yang bergulir |
| Simpan | Form melapor lewat `useSettingsForm` (dirty, save, reset). Ada perubahan → bilah hitam mengambang di bawah: "Perubahan belum disimpan" · **Buang** · **Simpan perubahan**. Simpan menyimpan semua form yang berubah, lalu toast |

Form di panel memakai gaya §7 (kartu putih, field pil abu). Rekening tidak ikut bilah simpan karena tambah/ubah tersimpan lewat modalnya sendiri.

## 4. Gerak

### 4.1 Token

```css
.admin-shell {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-spring: cubic-bezier(0.34, 1.36, 0.64, 1); /* sedikit memantul, hanya pil & tombol bulat */
  --dur-press: 90ms;
  --dur-hover: 140ms;
  --dur-micro: 180ms;
  --dur-pop: 220ms;
  --dur-overlay: 280ms;
  --dur-exit: 180ms;
}
@media (prefers-reduced-motion: reduce) {
  .admin-shell *, .admin-shell *::before, .admin-shell *::after {
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
  }
}
```

### 4.2 Gerak khas gaya ini

| Unsur | Gerak |
| --- | --- |
| **Item aktif sidebar berpindah** | Pil hitam **meluncur** vertikal dari item lama ke item baru (`layoutId`), 280 ms `--ease-in-out`. Teks berubah warna saat pil lewat. |
| **Tombol bulat ditekan** | `scale(0.92)` 90 ms → kembali dengan `--ease-spring` 220 ms. |
| **Tombol bulat hover** | Ikon berputar/geser kecil sesuai maknanya: ↗ geser 2 px ke kanan atas; ← geser 2 px ke kiri; + berputar 90°. 180 ms. |
| **Sub-menu buka/tutup** | Tinggi `0 ↔ auto` 200 ms `--ease-out` dengan `overflow: hidden`; chevron berputar 180°. Item tidak dianimasikan satu per satu. |
| **Kartu sorotan bertumpuk** | Kartu depan bergeser ke kiri dan memudar; kartu belakang naik ke depan (`translateY(-12px) scale(0.96)→0 1`), 360 ms `--ease-out`. Titik indikator: titik aktif memanjang menjadi garis (`scaleX`). Usap horizontal di ponsel. |
| **Angka display berubah** | Digit lama naik keluar, digit baru naik masuk per digit (masker `overflow: hidden`), 260 ms, jeda 30 ms antardigit dari kanan. Hanya saat nilai berubah karena tindakan, bukan saat memuat. |
| **Laci sidebar (< 1024 px)** | `translateX(-100%)→0` 280 ms `--ease-out`; keluar 180 ms. Latar memudar. |
| **Kepala halaman saat pindah modul** | Judul baru langsung memudar masuk + `translateY(6px)→0` 160 ms, **tanpa menunggu** judul lama keluar. Isi halaman memudar masuk 160 ms (`opacity` saja). Sidebar tidak bergerak. |
| **Kartu masuk saat halaman dimuat** | Satu kali per kunjungan halaman: kartu `opacity` + `translateY(16px)→0` + `scale(0.98)→1`, 420 ms `--ease-out`, jeda 50 ms, maksimal 6 kartu. Kunjungan berikutnya dalam sesi yang sama: langsung tampil. |

### 4.3 Aturan

- Hanya `transform` dan `opacity`; warna dan border boleh pada hover/aktif.
- `--ease-spring` hanya untuk tombol bulat dan pil — tidak untuk dialog, kartu, atau daftar.
- Tidak ada gerak pada ketikan, hasil saring, ganti halaman tabel, pengurutan.
- Keluar selalu lebih cepat dari masuk.
- Fokus keyboard pindah seketika; tidak pernah menunggu animasi.

## 5. Empat templat halaman

### T1 — Daftar

```text
Pendaftaran ⟶ Tagihan
Tagihan                                                (⚲) (⌕) (● Ekspor)
Cocokkan bukti transfer dan nominal sebelum memverifikasi.

( Semua 46 )  • Menunggu 3   • Terverifikasi 41   • Ditolak 2          ← tab saring

┌──────────────────────────────────────────────────────────────────────────┐
│ Peserta               Program – batch       Total        Status      Aksi │ ← kepala tabel
└──────────────────────────────────────────────────────────────────────────┘
  Rina Putri            Speaker – Batch 9     Rp260.137   • Menunggu     ⋯
  rina@contoh.id · 2 jam lalu
 ───────────────────────────────────────────────────────────────────────────
  Budi Santoso          Series – Batch 9      Rp300.214   • Terverifikasi ⋯
 ───────────────────────────────────────────────────────────────────────────
Menampilkan 1–20 dari 46                                         ( ‹ ) ( › )
```

- **Tab saring** (pola §2.1 aturan 5): tab aktif `--admin-surface-muted` dengan hitungan di lencana putih; tab pasif diawali titik nada sesuai makna.
- **Tabel** mengikuti §8.3: kepala tabel berlatar abu dan bersudut, baris di atas kanvas dipisah satu garis tipis, tanpa garis vertikal dan tanpa kartu pembungkus.
- Status berupa chip nada lembut dengan titik: Menunggu `peach`, Terverifikasi/Terbit/Dibuka `mint`, Ditolak/Dibatalkan `rose`, Draf/Ditutup abu.
- Aksi baris: satu aksi utama sebagai tombol ikon bulat 36 px (mis. ✎ ubah) dengan tooltip, atau menu ⋯ bila aksinya lebih dari satu.

### T2 — Form halaman

```text
(←)  ▢ Kelas ⟶ ▢ Program
     Ubah program                         ● Belum tersimpan   [Batal]  [■ Simpan]

╭──────────────────────────────────────────────╮  ╭── KARTU SOROTAN (hitam) ──────╮
│ ◯ Informasi dasar                            │  │ Kesiapan program        ●─── │
│                                              │  │                              │
│ Nama program                                 │  │  ╭ ───────────────────────╮  │
│ ( Public Speaking Series                 )   │  │  │ [Perlu dilengkapi]     │  │
│                                              │  │  │ Deskripsi masih kosong │  │
│ Deskripsi                                    │  │  │                 (■ →)  │  │
│ ╭──────────────────────────────────────╮     │  │  ╰────────────────────────╯  │
│ ╰──────────────────────────────────────╯     │  ╰──────────────────────────────╯
╰──────────────────────────────────────────────╯  ╭──────────────────────────────╮
╭──────────────────────────────────────────────╮  │ ◯ Ringkasan                  │
│ ◯ Harga                                      │  │ 1 batch aktif · Rp1.500.000  │
│ ( Rp 1.500.000 )      ( Rp ———— )            │  ╰──────────────────────────────╯
╰──────────────────────────────────────────────╯
```

- Setiap kelompok field adalah **kartu putih tersendiri** dengan ikon berbingkai bulat + judul kartu 22 px — bukan satu formulir panjang bergaris.
- Kolom kanan (4 dari 12) lengket: **kartu sorotan hitam “Kesiapan”** berisi daftar yang masih kurang sebagai kartu bertumpuk; tombol kuning ■→ melompat ke field terkait. Bila semua lengkap, kartu sorotan berubah menjadi mint dengan teks **“Siap dibuka”**.
- Bilah simpan: titik status + teks, **Batal** (pil putih), **Simpan** (pil hitam). Lengket di atas saat menggulir.
- < 1024 px: kartu kesiapan pindah ke atas sebagai kartu ringkas yang dapat dilipat; bilah simpan menempel di bawah layar.
- **Ukuran tipografi, kepala, kartu, bagian, dan isian halaman form mengikuti §7.0** (revisi 17 November 2026). Bila uraian di atas berbeda dengan §7.0, §7.0 yang berlaku.

### T3 — Detail di panel samping

```text
                                      ╭──────────────────────────────── 520px ─╮
       (daftar tetap terlihat,        │ (×)                          (⋯)       │
        diredupkan 40%)               │                                        │
                                      │ Tagihan #2041                          │
                                      │ Rina Putri  · ● online WA              │
                                      │                                        │
                                      │ Rp260.137                              │  ← 64px; "137" abu
                                      │ Speaker · Batch 9 · DP awal            │
                                      │                                        │
                                      │ ╭ kapsul ───────────────────────────╮  │
                                      │ │ (BCA 123…) (Salin)           (↗)  │  │
                                      │ ╰───────────────────────────────────╯  │
                                      │                                        │
                                      │ ◯ Jawaban formulir                     │
                                      │ …                                      │
                                      │────────────────────────────────────────│
                                      │        [Tolak]        [■ Verifikasi]   │
                                      ╰────────────────────────────────────────╯
```

Panel menempel di kanan dengan jarak 16 px dari tepi kanvas (bukan menempel layar), radius 32 px. < 768 px: lembar bawah penuh, radius atas 32 px.

### T4 — Dashboard

```text
⬤ Dashboard
Selamat pagi, Alan                                              (⌕) (◐)

╭─ SOROTAN (hitam) ─────────────╮ ╭──────────────────────────╮ ╭──────────────────╮
│ Tagihan menunggu    ●──  (↗)  │ │ ◯ Pendaftar 7 hari       │ │ ◯ Batch aktif     │
│  ╭───────────────────────╮    │ │                          │ │                  │
│  │[Perlu dicek]          │    │ │  12                      │ │  2               │
│  │ Rina Putri            │    │ │                          │ │                  │
│  │ Rp260.137        (■)  │    │ │ ( Series 7 )( Speaker 5 )│ │ Sesi berikutnya  │
│  ╰───────────────────────╯    │ │                    (↗)   │ │ Sab 21 Nov  (↗)  │
╰───────────────────────────────╯ ╰──────────────────────────╯ ╰──────────────────╯
╭─ mint ────────────────────────╮ ╭──────────────────────────────────────────────╮
│ Terverifikasi minggu ini (↗)  │ │ ◯ Perlu dilengkapi                           │
│                       41      │ │ ( ⌕ Cari … )                                 │
│                    Rp12,4 jt  │ │ (P) Sertifikasi — belum ada batch      (→)   │
╰───────────────────────────────╯ │ (R) Rekening aktif belum diisi         (→)   │
                                  ╰──────────────────────────────────────────────╯
```

- Satu **kartu sorotan hitam** di kiri atas: tumpukan tagihan menunggu, satu tagihan per kartu, digeser dengan titik indikator. Tombol kuning ■ membuka panel verifikasi langsung.
- Kartu mint hanya untuk ringkasan yang **sudah beres**.
- Kartu putih memakai ikon berbingkai + angka display 64 px + kapsul chip pembagi di bawahnya.
- Bilah bergaris diagonal untuk porsi kuota/target yang belum tercapai, bila kelak ada kuota.
- Tanpa grafik dekoratif. Grafik hanya bila datanya cukup untuk dibaca.

### Peta modul ke templat

| Modul | Daftar | Tambah / ubah | Detail |
| --- | --- | --- | --- |
| Dashboard | T4 | — | — |
| Pendaftar | T1 | — | T3 |
| Tagihan | T1 | — | T3 + dialog konfirmasi |
| Program | T1 kartu besar | T2 | — |
| Batch | T1 (pil per program di atas daftar) | T2 | — |
| Trainer | T1 kartu dengan potret bulat besar | Dialog M | — |
| Artikel | T1 | T2 (editor) | — |
| Media, Galeri | T1 grid kartu radius 24 px | Dialog unggah | Dialog pratinjau |
| Testimoni | T1 kartu kutipan | Dialog M | — |
| Partner | T1 kartu logo | Dialog S | — |
| Kontak | T2 ringkas | — | — |
| Rekening | T1 | Dialog S | — |

## 6. Dialog

Primitif: `components/ui/dialog.tsx`, `alert-dialog.tsx`, `DeleteConfirmDialog.tsx`.

### 6.1 Modal atau halaman baru

Setiap form admin memakai salah satu dari dua wadah. Pilih dengan aturan berikut, dari atas ke bawah; aturan pertama yang cocok menentukan.

| # | Bila form… | Wadah |
| --- | --- | --- |
| 1 | memuat editor teks kaya, baris berulang (sesi, materi, benefit), unggah lebih dari satu berkas, atau lebih dari satu bagian bernomor | **Halaman baru** (T2) |
| 2 | punya lebih dari **6 field** | **Halaman baru** (T2) |
| 3 | perlu dibuka dari bookmark atau dibagikan tautannya (mis. ubah artikel) | **Halaman baru** (T2) |
| 4 | selain itu (≤ 6 field sederhana: teks, angka, rupiah, pilihan, satu unggah) | **Modal** |

Konfirmasi (hapus, verifikasi) selalu modal konfirmasi, bukan form.

**Lebar modal** (desktop):

| Ukuran | Lebar | Pakai |
| --- | --- | --- |
| `sm` | 440 px | Konfirmasi; form 1–2 field. **Satu kolom.** |
| `md` | 560 px | Form 3–6 field — **bawaan**. **Satu kolom.** |
| `lg` | 720 px | Form 3–6 field dengan pasangan yang dibaca bersama (mis. tipe + nilai diskon), atau satu unggah gambar dengan pratinjau. Boleh dua kolom. |

**Lebar halaman form**: kartu form `max-w-[760px]` untuk form satu kolom, `max-w-[960px]` bila ada bagian dua kolom. Kartu rata kiri di area konten, tidak dipusatkan.

Contoh pemetaan modul saat ini:

| Form | Field | Wadah |
| --- | --- | --- |
| Rekening (bank, nomor, atas nama) | 3 | Modal `md`, satu kolom |
| Partner (nama, logo, urutan) | 3 | Modal `md` |
| Trainer (nama, keahlian, foto, bio) | 4 | Modal `lg` (ada unggah foto) |
| Testimoni | 5 | Modal `md` |
| Kontak, Profil akademi | 4 / 3 | Panel di halaman Pengaturan (bukan modal) |
| Program (deskripsi, harga, materi berulang) | > 6 + baris berulang | Halaman baru |
| Batch (sesi berulang) | > 6 + baris berulang | Halaman baru |
| Artikel (editor) | editor | Halaman baru |

### 6.2 Anatomi modal

```text
╭──────────────────────────────────────────────────╮
│  (■)  Buat voucher baru                     (×)  │  ← ikon dalam bulatan hitam 44 px + judul 20/600
│       Tambahkan kode voucher promosi baru.       │    + subjudul 14 --admin-text-secondary
│ ──────────────────────────────────────────────── │  ← garis --admin-line
│  Kode voucher *                                  │
│  ( ____________________________________ )        │
│  Tipe diskon            Nilai diskon *           │  ← dua kolom bila field pendek berpasangan
│  ( ________________ )   ( ________________ )     │
│  Maksimal penggunaan                             │
│  ( ____________________________________ )        │
│  Isi 0 jika kuota tidak dibatasi.                │
│ ──────────────────────────────────────────────── │
│  (       Batal       )  (■     Simpan       )    │  ← dua pil sama lebar, tinggi 48 px
╰──────────────────────────────────────────────────╯
```

- **Wadah:** radius 32 px, latar `--admin-canvas`, bayangan `--admin-shadow-overlay`, backdrop `rgba(14,14,14,0.45)` + `backdrop-filter: blur(4px)`.
- **Kepala:** bulatan 44 px `--admin-ink` berisi ikon putih 20 px, judul 20/600, subjudul satu kalimat 14 `--admin-text-secondary`, tombol tutup bulat 40 px bergaris `--admin-line`.
- **Badan:** padding 24 px (ponsel 20 px), jarak antarfield 20 px. Kepala dan kaki tetap; badan menggulir sendiri; tinggi maksimal `min(760px, 100dvh − 48px)`.
- **Kaki:** dua pil sama lebar. **Batal** bergaris `--admin-line-strong` di kiri, aksi utama `--admin-ink` di kanan, label berupa kata kerja ("Simpan rekening", "Buat voucher").
- **Konfirmasi merusak:** kartu `--admin-ink` berteks putih; tombol aksi berlatar `--admin-danger`, Batal pil `--admin-ink-soft`.
- **Konfirmasi verifikasi:** modal putih dengan angka display tagihan di tengah dan tombol **Ya, verifikasi** hitam.

**< 640 px — lembar bawah** (seperti contoh ponsel pemilik):

```text
│ (konten halaman, diredupkan)                │
╭─────────────────────────────────────────────╮
│                  ──────                     │  ← pegangan 40×4 px
│  (■)  Buat voucher baru                (×)  │
│ ─────────────────────────────────────────── │
│  …field, selalu satu kolom…                 │
│ ─────────────────────────────────────────── │
│  (■          Simpan               )         │  ← aksi utama di atas, lebar penuh
│  (           Batal                )         │  ← Batal di bawahnya, lebar penuh
╰─────────────────────────────────────────────╯   ← menempel ke tepi bawah, padding aman bawah
```

- Lebar penuh, radius atas 28 px, menempel ke tepi bawah, `padding-bottom: max(20px, env(safe-area-inset-bottom))`.
- Tinggi maksimal `92dvh`; badan menggulir sendiri.
- Kaki menumpuk: aksi utama di atas, Batal di bawah, keduanya lebar penuh 48 px. Jempol paling dekat dengan aksi utama.
- Bisa diseret turun lewat pegangan untuk menutup (dengan aturan "Buang perubahan?" yang sama).
- Semua field menjadi satu kolom.

### 6.3 Gerak

| Momen | Backdrop | Wadah |
| --- | --- | --- |
| Masuk | `opacity 0→1`, 280 ms | `opacity` + `translateY(24px)→0` + `scale(0.96)→1`, 280 ms `--ease-out`, `transform-origin` ke pemicu |
| Keluar | 180 ms | `opacity` + `scale(0.98)` + `translateY(8px)`, 180 ms |
| Lembar bawah | sama | `translateY(100%)→0`, 320 ms `--ease-out`; dapat diseret turun untuk menutup |
| Panel samping | `opacity` | `translateX(calc(100% + 16px))→0`, 320 ms `--ease-out` |
| Isi dialog | — | Setelah wadah 60% terbuka, badan `opacity` + `translateY(8px)→0` 200 ms (satu kelompok) |

`globals.css` sudah memiliki `dialog-zoom-in` / `dialog-zoom-out`; ubah keduanya pada scope `.admin-shell`, jangan menambah pasangan baru.

### 6.4 Perilaku

| Situasi | Perilaku |
| --- | --- |
| Buka | Fokus ke field pertama, atau ke **Batal** pada konfirmasi merusak — seketika. |
| Escape / backdrop / × | Menutup bila form belum berubah; bila berubah, dialog konfirmasi “Buang perubahan?”. |
| Simpan | Pil Simpan menyusut menjadi lingkaran berisi spinner (lebar → 48 px, `scaleX` pada latar, label memudar), field dinonaktifkan. |
| Berhasil | Lingkaran berubah menjadi centang 300 ms → dialog menutup → toast → baris disorot. |
| Gagal validasi | Dialog bergetar horizontal sekali (`translateX` ±6 px, 3 siklus, 300 ms); fokus ke galat pertama. Getar dimatikan pada reduced motion. |
| Gagal server | Banner `--danger-bg` di atas field pertama + **Coba lagi**; isian utuh. |
| Tutup | Fokus kembali ke pemicu. |

## 7. Formulir

**Revisi 17 November 2026 (acuan desain).** Ukuran di bab ini diukur dari tangkapan layar form **"Tambah Paket Baru"** yang dipilih pemilik sebagai acuan (render admin lama pada 1920 px, skala 1×). Kode sumber form itu (`components/admin/PackageForm.tsx`) **bukan** acuan: kelasnya (`h-10 rounded-xl text-xs`, label 11 px) tertimpa CSS global saat tangkapan itu dibuat, jadi yang dipakai adalah ukuran yang tampil.

Primitif dari shadcn/ui yang sudah terpasang (`components/ui/Input.tsx`, `textarea.tsx`, `select.tsx`, `label.tsx`, `checkbox.tsx`), **selalu lewat kontrol admin** di `components/admin/ui/form/controls.tsx` (§7.2b). Halaman dan form admin tidak memakai `Input`/`Textarea` shadcn secara langsung, tidak memakai `style-line`, dan tidak menulis kelas isian sendiri.

### 7.0 Halaman form (T2) — ukuran

```text
(←)  [ PROGRAM ]                                                  ← satu-satunya kepala halaman (kepala shell)
     Ubah Public Speaking Series
──────────────────────────────────────────────────────────────────────
╭─ kartu putih · radius 28 · padding 40 ────────────────────────────╮
│ (1) INFORMASI UTAMA                                                │
│ ────────────────────────────────────────────────────────────────── │
│ Nama program *                                                     │
│ (  Public Speaking Series                                      )   │
│                                                                    │
│ Deskripsi                                                          │
│ ╭────────────────────────────────────────────────────────────╮     │
│ │  Bicara, Berkarya, Berpenghasilan                          │     │
│ │                                                            │     │
│ ╰────────────────────────────────────────────────────────────╯     │
│                                                                    │
│ Biaya *                           Harga coret                      │
│ (  Rp  1.500.000              )   (  Rp  1.800.000             )   │
│ DP                                                                 │
│ (  20                    %  )                                      │
│ ────────────────────────────────────────────────────────────────── │
│ (2) FORMULIR PENDAFTARAN                                           │
│ …                                                                  │
│ ────────────────────────────────────────────────────────────────── │
│                                          ( Batal )  ( ▣ Simpan )   │
╰────────────────────────────────────────────────────────────────────╯
```

| Elemen | ≥ 768 px | < 768 px | Kelas |
| --- | --- | --- | --- |
| Eyebrow modul | 11 / 600, kapital, spasi huruf 0.2em, `--admin-text-secondary`, dalam kurung siku `[ PROGRAM ]` | sama | `text-[11px] font-semibold uppercase tracking-[0.2em]` |
| Judul halaman | 30 / 700, spasi −0.02em, tinggi baris 1.15 | 24 / 700 | `text-[24px] md:text-[30px] font-bold tracking-[-0.02em] leading-[1.15]` |
| Tombol kembali | 44 px bulat, tepi 1 px `--admin-line-strong`, latar `--admin-canvas`, ikon 18 px | sama | `size-11` |
| Jarak kepala → kartu | garis 1 px `--admin-line`, lalu 32 px | 24 px | |
| Kartu form | radius 28, padding 40, tepi 1 px `--admin-line`, latar `--admin-canvas` | radius 24, padding 20 | `rounded-[28px] border p-10 max-md:rounded-[24px] max-md:p-5` |
| Lebar kartu | `single` 760 px · `double` 1120 px | lebar penuh | `FormPage width` |
| Lencana nomor bagian | 28 px bulat, latar `--admin-surface-muted`, angka 13 / 700 | sama | `size-7` |
| Judul bagian | 16 / 700, kapital, spasi 0.04em | 15 / 700 | `text-[15px] md:text-[16px] font-bold uppercase tracking-[0.04em]` |
| Garis bawah judul bagian | 1 px `--admin-line`; 24 px ke field pertama | sama | |
| Antar bagian | garis 1 px `--admin-line` + 32 px di atasnya | sama | |
| Label | 13 / 500 `--admin-ink`, huruf kalimat, `*` `--admin-danger` | sama | `text-[13px] font-medium` |
| Label → kontrol | 8 px | sama | `gap-2` |
| Teks isian | 14 / 400 `--admin-ink` | **16 / 400** (mencegah zoom Safari iOS) | `text-base md:text-sm` |
| Placeholder | sama dengan teks isian, `--admin-text-faint` | sama | |
| Petunjuk dan galat | 12 / 400; galat `--admin-danger` | sama | `text-[12px]` |
| Antar field | 20 px vertikal, 20 px antar kolom | 20 px | `gap-5` |
| Tombol kaki | tinggi 48, 15 / 600, rata kanan | lebar penuh, menumpuk, aksi utama di atas | |

Satu halaman form punya **satu** kepala: kepala shell (§3.3). Form tidak boleh merender judul, eyebrow, atau tombol kembali sendiri. Judul spesifik halaman (mis. "Ubah Public Speaking Series") dikirim lewat `AdminPageTitle`; tanpa itu, judul jatuh ke label modul. Status simpan dan aksi sekunder masuk lewat `AdminPageActions` di sisi kanan kepala.

### 7.1 Anatomi field

```text
Nama program *                                   ← label 13/500 --admin-ink · * --admin-danger · 8 px ke kontrol
╭──────────────────────────────────────────╮
│  Public Speaking Series                  │     ← pil 48 px · latar --admin-surface · tepi 1 px --admin-line
╰──────────────────────────────────────────╯       padding kiri-kanan 18 px · teks 14 px (16 px < 768 px)
Tampil sebagai judul kartu di beranda.           ← petunjuk 12/400 --admin-text-secondary
```

| Bagian | Nilai |
| --- | --- |
| Tinggi isian satu baris dan `SelectTrigger` | **48 px** di semua lebar (`h-12`), jadi sekaligus memenuhi target sentuh 44 px |
| Radius isian satu baris | 999 px (pil) |
| Padding isian | 0 18 px (`px-[18px]`) |
| Textarea | radius **20 px**; padding **14 px atas-bawah, 18 px kiri-kanan** (`px-[18px] py-[14px]`); tinggi baris 1.6; tinggi minimal **104 px** (tiga baris); `resize-y`. Baris pertama teks berada 14 px di bawah tepi atas — **tidak menempel ke atas** |
| Latar | `--admin-surface` (abu sangat muda) di atas kartu putih |
| Tepi | 1 px `--admin-line` |
| Teks | 14 / 400 `--admin-ink`; 16 px di bawah 768 px |

- Kartu form selalu **putih**; isian **abu sangat muda** dengan tepi tipis. Kontras abu-di-atas-putih memisahkan isian tanpa bayangan.
- Label huruf kalimat ("Kode voucher", bukan "KODE VOUCHER"); hanya judul bagian yang kapital.
- Isian wajib: `*` merah di label dan `aria-required="true"` pada kontrol.
- Placeholder hanya contoh format ("0812-3456-7890", "Misal: Batch Desember"), tidak pernah pengganti label.

### 7.2 Keadaan

| Keadaan | Latar | Tepi | Cincin | Gerak |
| --- | --- | --- | --- | --- |
| Diam | `--admin-surface` | 1 px `--admin-line` | — | — |
| Hover | `--admin-surface` | 1 px `--admin-line-strong` | — | 140 ms |
| **Fokus** | `--admin-canvas` | 1 px `--admin-ink` | **2 px `--admin-ink` 8%** | 140 ms |
| Galat | `--admin-rose-soft` | 1 px `--admin-danger` | saat fokus: 2 px `--admin-danger` 15% | pesan masuk `translateY(-4px)→0` 180 ms |
| Nonaktif | `--admin-canvas` | 1 px `--admin-line` | — | teks `--admin-text-faint`, `cursor-not-allowed`, alasan di petunjuk |
| Hanya baca | transparan | tidak ada | — | untuk slug dan nilai turunan |

Kelas fokus yang tepat: `focus-visible:border-admin-ink focus-visible:bg-admin-canvas focus-visible:ring-2 focus-visible:ring-admin-ink/8 outline-none`.

- **Fokus isian tipis**: tepi 1 px berganti hitam ditambah cincin 2 px yang sangat pudar. Jangan pakai `outline` 2 px, jangan pakai `ring-3` bawaan shadcn, dan jangan pakai halo 3 px 12% dari pedoman lama — semuanya terlalu tebal untuk isian yang berdempetan.
- **Fokus tombol berbeda**: tombol dan tautan tetap `outline` 2 px `--admin-ink` dengan offset 2 px, karena tombol tidak punya tepi yang bisa berganti warna.
- Fokus harus tetap terlihat: kontras tepi hitam terhadap latar putih ≥ 3:1 (WCAG 1.4.11). Cincin pudar hanya tambahan, bukan satu-satunya penanda.
- Ruang pesan galat dicadangkan (`min-h-5`) supaya tata letak tidak meloncat.

### 7.2a Lebar field dan kolom ganda

Form memakai grid `FieldGrid`. **Modal `sm` dan `md` selalu satu kolom** (`columns={1}`): lebarnya terlalu sempit untuk dua field berdampingan. Dua kolom hanya untuk modal `lg` (mulai 640 px) dan halaman form (mulai 768 px). Setiap field memilih lebarnya:

| Lebar | Pakai |
| --- | --- |
| Penuh (`span="full"`) — bawaan | Teks bebas, nama, URL, alamat, textarea, unggah, pilihan yang labelnya panjang |
| Setengah (`span="half"`) | Pasangan yang dibaca bersama: harga + harga coret, tanggal + jam, bank + nomor rekening |
| Sempit (`span="narrow"`, 160 px) | Persen, jumlah, urutan, kuota — angka pendek |

Aturan:

1. Field setengah **selalu berpasangan** dalam satu baris; jangan tinggalkan setengah baris kosong.
2. Urutan baca kiri→kanan, lalu ke bawah.
3. Di bawah titik patah, semua field menjadi penuh, sesuai urutan sumber.
4. Halaman form dibagi menjadi **bagian bernomor** (`FormSection`, ukuran §7.0), maksimal 5 bagian. Kaki halaman: **Batal** (pil abu `--admin-surface`, tanpa tepi) dan aksi utama (pil hitam dengan ikon simpan) rata kanan; di ponsel keduanya lebar penuh menumpuk dengan aksi utama di atas.

### 7.2b Komponen

Semua form admin memakai komponen di `components/admin/ui/form/`, bukan menulis kelas sendiri:

| Komponen | Berkas | Isi |
| --- | --- | --- |
| `FormDialog` | `FormDialog.tsx` | Modal §6.2 di desktop, lembar bawah di < 640 px |
| `FormPage` + `FormSection` | `fields.tsx` | Kartu halaman form §7.0, bagian bernomor, kaki aksi. Prop `width` (`single` 760 / `double` 1120) |
| `FieldGrid` + `Field` | `fields.tsx` | Grid §7.2a dan anatomi §7.1: label, `*`, kontrol, petunjuk, galat |
| `AdminInput` | `controls.tsx` | `Input` shadcn dengan geometri §7.1 dan keadaan §7.2. Untuk teks, email, URL, angka biasa, tanggal, jam |
| `AdminTextarea` | `controls.tsx` | `Textarea` shadcn, radius 20, padding 14/18, minimal 104 px |
| `AdminSelect` | `controls.tsx` | `Select` shadcn; pemicu sama dengan `AdminInput`, daftar di popover radius 20, butir 40 px 14/400 |
| `PriceInput` | `controls.tsx` | Rupiah §7.4 |
| `PercentInput` | `controls.tsx` | Persen §7.4 |
| `PhoneInput` | `controls.tsx` | Nomor telepon/WhatsApp §7.4 |
| `CheckboxCard` | `controls.tsx` | Kotak centang berkartu §7.4 |
| Pemformat | `lib/input-format.ts` | Fungsi murni untuk Rupiah, persen, telepon, dan posisi kursor; dites `node --test` |

### 7.3 Validasi

1. Saat blur: periksa field itu.
2. Saat mengetik pada field galat: hapus galat begitu sah.
3. Saat simpan: periksa semua; gulir dan fokus ke galat pertama; banner "3 isian perlu diperbaiki".
4. Field yang belum disentuh tidak divalidasi sebelum simpan pertama.

### 7.4 Kontrol khusus

#### Rupiah — `PriceInput`

```text
Biaya *
(  Rp  1.500.000                          )
   ↑ awalan "Rp" 14/500 --admin-text-secondary, 18 px dari kiri, aria-hidden
```

- Awalan **"Rp"** di dalam pil, tidak bisa disunting; isian bergeser `pl-[46px]`.
- Pemisah ribuan titik saat mengetik (`id-ID`); **tanpa** desimal; `inputMode="numeric"`, `autoComplete="off"`, `tabular-nums`.
- Nilai di state adalah **string digit** (`"1500000"`); simpan sebagai integer (`Number(digits)`), atau `null` bila kosong pada isian opsional.
- Maksimal 12 digit (Rp999.999.999.999).

| Diketik atau ditempel | Tampil | Disimpan |
| --- | --- | --- |
| `1500000` | `1.500.000` | `1500000` |
| `Rp 1.500.000` | `1.500.000` | `1500000` |
| `1.500.000,00` | `1.500.000` | `1500000` (bagian setelah koma dibuang, **bukan** digabung) |
| `007` | `7` | `7` |
| `abc` atau kosong | kosong | `null` / galat "wajib" bila wajib |
| 13 digit | dipotong menjadi 12 digit | |

#### Persen — `PercentInput`

- Pil sempit (`span="narrow"`), akhiran **"%"** di kanan 18 px, `aria-hidden`.
- Hanya digit, maksimal 2 digit; sah 1–99; kosong berarti tanpa DP.
- Di bawahnya petunjuk hasil bila biaya diketahui: "= Rp300.000 saat DP".

#### Telepon dan WhatsApp — `PhoneInput`

- `type="tel"`, `inputMode="tel"`, `autoComplete="tel"`, placeholder `0812-3456-7890`.
- Format nomor Indonesia saat mengetik: hanya digit; awalan `+62` atau `62` menjadi `0`; nomor yang dimulai `8` diberi `0` di depan; maksimal 13 digit; dikelompokkan 4-4-sisa dengan tanda hubung.
- Disimpan seperti yang tampil (`0812-3456-7890`); tautan `wa.me` dibuat dari digitnya oleh `contactHref`.

| Diketik atau ditempel | Tampil |
| --- | --- |
| `081234567890` | `0812-3456-7890` |
| `+62 812 3456 7890` | `0812-3456-7890` |
| `6281234567890` | `0812-3456-7890` |
| `812345` | `0812-345` |
| `0812345678901` (13 digit) | `0812-3456-78901` |
| 14 digit atau lebih | dipotong di 13 digit |

#### Posisi kursor pada isian berformat

Rupiah dan telepon memformat ulang setiap ketikan. Kursor **tidak boleh melompat ke ujung** saat menyunting di tengah: hitung jumlah digit di kiri kursor sebelum format, lalu letakkan kursor sesudah digit ke-n yang sama pada teks hasil format (`caretFromDigits`). Hapus (Backspace) tepat di belakang pemisah menghapus digit sebelumnya, bukan pemisahnya.

#### Kontrol lain

| Data | Kontrol |
| --- | --- |
| Nomor rekening | `AdminInput` `inputMode="numeric"`, hanya digit, **tanpa** pengelompokan (format bank berbeda-beda), `font-mono tabular-nums` |
| Pilihan 2–4 | Pil segmen dalam kapsul `--admin-surface-muted`; pilihan aktif pil `--admin-ink` |
| Pilihan > 4 | `AdminSelect` |
| Tanggal dan jam | `AdminInput type="date"` / `type="time"`; jadwal sesi berderet tanggal · mulai · selesai |
| Teks panjang | `AdminTextarea`; penghitung karakter di kanan bawah bila ada batas |
| Ya/tidak dengan akibat | `CheckboxCard` |

#### `CheckboxCard`

```text
╭──────────────────────────────────────────────────────╮
│  ☑  Buka pendaftaran                                 │   ← min 56 px · radius 20 · padding 0 20 px
│     Membuka batch ini menutup batch lain.            │      judul 14/500 · keterangan 12/400
╰──────────────────────────────────────────────────────╯
```

| Bagian | Nilai |
| --- | --- |
| Kotak | `Checkbox` shadcn 18 px; tercentang latar `--admin-ink` |
| Kartu | tinggi minimal 56 px, radius 20, tepi 1 px `--admin-line`, latar `--admin-canvas`; tercentang tepi `--admin-ink` |
| Nada | `neutral` (bawaan); `mint` untuk status aktif/terbit (latar `--admin-mint-soft`, teks `--admin-mint-ink`); `peach` untuk sorotan (latar `--admin-peach-soft`, teks `--admin-peach-ink`) |
| Seluruh kartu | dapat diklik (`<label htmlFor>`) |

#### Tombol tambah dan daftar kosong di dalam form

- **Tambah baris** (mis. "+ Tambah materi"): pil lebar penuh 48 px, tepi putus-putus 1 px `--admin-line-strong`, teks 14 / 600 `--admin-ink`, ikon 16 px.
- **Daftar kosong** di dalam bagian: kotak putus-putus radius 20, padding 32 px, teks 13 / 400 `--admin-text-secondary` rata tengah.

### 7.5 Baris berulang

```text
╭────────────────────────────────────────────────────────────────╮
│ (⠿) Sesi 1  ( Sab, 7 Nov 2026 ) ( 15.00 ) – ( 18.00 ) WIB   (×) │
│ (⠿) Sesi 2  ( Sab, 14 Nov 2026 )( 15.00 ) – ( 18.00 ) WIB   (×) │
╰────────────────────────────────────────────────────────────────╯
( + Tambah sesi )   ( ⟳ Isi 4 pertemuan mingguan )
```

| Aksi | Gerak |
| --- | --- |
| Tambah | Baris `opacity` + `translateY(-8px)→0` + `scale(0.98)→1`, 220 ms; fokus ke field pertamanya |
| Isi 4 mingguan | Tiga baris baru masuk berurutan, jeda 60 ms |
| Hapus | `opacity` + `scale(0.96)` 160 ms; toast **Urungkan** 5 detik |
| Seret | Baris terangkat (`scale 1.02` + bayangan dropdown); lainnya bergeser `transform` 220 ms `--ease-in-out`. Keyboard: Spasi angkat, panah pindah, Spasi letakkan |
| Bentrok | Kedua baris berlatar `--danger-bg` + pesan di bawah baris kedua |

### 7.6 Unggah media

```text
╭──────────────────────────────────────────────╮
│                    (⬆)                       │   ← kartu --surface-muted, tepi putus-putus
│           Seret gambar ke sini               │
│         atau  [■ Pilih berkas]               │
│  JPEG, PNG, WebP · min 1280×720 · maks 5 MB  │
╰──────────────────────────────────────────────╯
```

| Keadaan | Tampilan |
| --- | --- |
| Diam | Tepi putus-putus `--line-strong`, radius 24 px |
| Berkas di atas | Bidang `--ink`, teks putih, ikon ⬆ memantul sekali (`--ease-spring`) |
| Mengunggah | Pratinjau bulat + nama + bilah progres hitam di atas pola diagonal + persen + (×) |
| Memproses | Bilah penuh, pola diagonal bergerak pelan (`background-position`, 1 s linear) + “Memproses…” |
| Selesai | Pratinjau memudar masuk 220 ms + chip mint **Siap** + **Ganti** / **Hapus** |
| Ditolak | Banner galat spesifik; zona kembali diam |

### 7.7 Bilah simpan

| Keadaan | Status | Tombol Simpan |
| --- | --- | --- |
| Belum berubah | — | Pil `--surface-muted`, teks `--text-faint`, nonaktif |
| Berubah | Titik kuning + **Belum tersimpan** | Pil `--ink` aktif; transisi warna 220 ms |
| Menyimpan | **Menyimpan…** | Menyusut menjadi lingkaran + spinner |
| Tersimpan | Titik mint + **Tersimpan 14.32** (4 detik) | Centang 300 ms → kembali nonaktif |
| Gagal | Banner di atas form | Kembali aktif + **Coba lagi** |

Meninggalkan halaman dengan perubahan memunculkan “Buang perubahan?”. Ctrl/⌘+S menyimpan.

## 8. Daftar data

Primitif: `table.tsx`, `AdminPagination.tsx`, `badge.tsx`, `dropdown-menu.tsx`, `tabs.tsx`.

### 8.1 Bentuk

| Bentuk | Bila |
| --- | --- |
| **Tabel** (T1, §8.3) | Data dibandingkan per kolom: Pendaftar, Tagihan, Batch, Artikel, Rekening |
| **Kartu besar** radius 32 px, 2–3 per baris | Program, Trainer, Partner, Testimoni |
| **Grid media** radius 24 px, 4:3 | Media, Galeri |

Kartu program memuat ikon berbingkai, nama 22/500, angka display (jumlah pendaftar batch aktif), kapsul chip (status batch, harga), dan tombol bulat ↗.

< 768 px: setiap baris tabel menjadi **kartu ringkas** `--admin-surface` radius 20 px, jarak antarkartu 8 px:

```text
╭──────────────────────────────────────────╮
│ Mengenal Public Speaking         (✎) (🗑) │  ← kolom pertama 15/500 + baris kedua 13; aksi kanan atas
│ Ringkasan artikel terbit…                │
│ ──────────────────────────────────────── │  ← garis --admin-line
│ Status                          • Terbit │  ← satu baris per kolom: label 13 kiri, nilai 14 kanan
│ Terbit                5 Nov 2026, 10.00  │
│ Diperbarui           11 Nov 2026, 14.05  │
╰──────────────────────────────────────────╯
```

- Label dan nilai berada dalam **satu baris** (label kiri, nilai rata kanan), bukan label di atas nilai; ini memangkas tinggi kartu sekitar 45%.
- Label selalu memakai huruf admin, meski nilainya mono (nomor rekening).
- Kolom yang dapat dibuka (judul) tetap tautan; aksi memakai `RowActions` yang sama dengan desktop.
- Diterapkan otomatis oleh `DataTable stackOnMobile`; setiap `<td>` selain kolom pertama dan kolom aksi wajib memberi `data-label`.

### 8.2 Bilah alat dan aksi per tabel

Setiap modul daftar memakai satu templat bilah alat di kepala halaman (§3.3), urutan tetap dari kiri ke kanan:

| Tombol | Bentuk | Perilaku |
| --- | --- | --- |
| **Cari** | Kolom pil 280 px berikon ⌕ di desktop; di < 768 px mengisi sisa lebar baris. Kelas `admin-search`: abu, tepi 1 px `--admin-line-strong`, ikon 44 px dari kiri | Saring di klien/server setelah jeda 250 ms; `?q=` di URL; Escape mengosongkan. **Ada di setiap halaman daftar**, termasuk Pendaftar, Tagihan, Rekening, dan Media |
| **Saring** | Tombol bulat ⚲ dengan lencana jumlah saringan aktif | Membuka popover berisi pilihan modul (program, batch, status); tersimpan di URL |
| **Ekspor** | Pil bergaris (`--admin-line-strong`, teks `--admin-ink`) berikon ⇩ + "Ekspor" | Mengunduh CSV dari data **yang sedang tersaring** (§8.7) |
| **Tambah** | Pil hitam berikon + dan label modul ("Tambah program", "Tulis artikel", "Unggah media"). **< 768 px: FAB** bulat 56 px di kanan bawah (20 px dari kanan, ≥ 24 px dari bawah, mengikuti area aman), berbayang | Membuka formulir: dialog untuk data ringkas, halaman T2 untuk data panjang |

Di < 768 px bilah alat adalah **satu baris**: kolom cari lentur, lalu tombol bulat Saring dan Ekspor 48 px. Tambah keluar dari baris itu sebagai FAB. Halaman memberi ruang bawah 112 px agar kartu terakhir tidak tertutup FAB.

**Aksi baris (templat)** — kolom terakhir setiap tabel:

| Tombol | Bentuk | Perilaku |
| --- | --- | --- |
| **Ubah** | Tombol ikon bulat 36 px ✎ | Membuka dialog atau halaman ubah yang sama dengan Tambah, terisi data baris |
| **Hapus** | Tombol ikon bulat 36 px 🗑 `--admin-danger` | Dialog konfirmasi berisi nama data, kalimat "Tindakan ini tidak dapat dibatalkan", tombol "Hapus" merah. Hanya tampil untuk `adminsuper` (RLS juga membatasi) |
| Aksi khusus | Pil teks 13/500 di kiri ikon (mis. "Aktifkan", "Terbitkan") | Hanya bila modul memerlukannya |

Bila lebih dari dua ikon + satu aksi khusus, sisanya masuk menu ⋯.

**Matriks per modul**

| Modul | Cari | Saring | Ekspor | Tambah | Ubah | Hapus | Aksi khusus |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pendaftar | ✓ | — | ✓ | — | — | — | — |
| Tagihan | ✓ | — | ✓ | — | — | — | Verifikasi · Tolak (alur tagihan, §11) |
| Program & Batch | — | — | — | — (empat program tetap) | ✓ halaman (program) · ✓ dialog (batch, paket) | ✓ batch | Tambah batch · Buka pendaftaran |
| Trainer | ✓ | — | ✓ | ✓ Tambah trainer | ✓ dialog | ✓ | — |
| Artikel | ✓ | Draf / Terbit | ✓ | ✓ Tulis artikel | ✓ halaman | ✓ | — |
| Media | ✓ | Program, status | — | ✓ Unggah media | ✓ dialog | ✓ | Terbitkan / Tarik |
| Galeri | ✓ | — | — | ✓ Tambah gambar | ✓ dialog | ✓ | — |
| Testimoni | ✓ | Draf / Terbit | ✓ | ✓ Tambah testimoni | ✓ dialog | ✓ | Terbitkan / Tarik |
| Partner | ✓ | — | ✓ | ✓ Tambah partner | ✓ dialog | ✓ | Terbitkan / Tarik |
| Rekening | ✓ | — | — | ✓ Tambah rekening | ✓ dialog | ✓ | Aktifkan |

- **Menu Pendaftaran** (Pendaftar dan Tagihan) hanya punya tombol **Ekspor** di bilah alat, ditambah kolom **Cari** (input, bukan tombol aksi). Pendaftaran berasal dari formulir publik, sehingga tidak ditambah, diubah, atau dihapus dari CMS. Pembatalan lewat status tagihan `cancelled`. Baris Pendaftar tetap dapat dibuka untuk membaca detail jawaban (rencana 2.1), dan Tagihan tetap memakai Verifikasi/Tolak di barisnya.
- Media dan Galeri tidak diekspor karena isinya berkas. Rekening tidak diekspor karena datanya sensitif.
- Kontak dan Profil akademi adalah formulir (T2), bukan tabel.

### 8.3 Tabel

Satu komponen bersama (`components/admin/ui/data-table.tsx`) dipakai semua modul. Modul tidak menulis kelas tabel sendiri.

**Tata letak**

| Unsur | Aturan |
| --- | --- |
| Wadah | Tanpa kartu, tanpa tepi luar, lebar penuh area konten. Gulir horizontal hanya di dalam wadah tabel bila kolom tidak muat. |
| Kepala tabel | Latar `--admin-surface`, tinggi 48 px. Sel pertama radius kiri 16 px, sel terakhir radius kanan 16 px. Lengket di atas saat tabel digulir. |
| Baris | Tinggi minimal 64 px (72 px bila ada baris kedua). Garis bawah 1 px `--admin-line`; baris terakhir tanpa garis. Tanpa garis vertikal, tanpa zebra. |
| Padding sel | 0 16 px; sel pertama 20 px di kiri, sel terakhir 20 px di kanan. Teks rata tengah vertikal. |
| Hover | Latar `--admin-surface` 140 ms. Baris yang dapat diklik memakai kursor penunjuk dan bisa dibuka dengan Enter. |
| Terpilih | Latar `--admin-surface-muted`; kotak centang terisi hitam. |
| Lebar kolom | Kolom identitas lentur (min 240 px). Kolom tetap: kotak centang 44, status 140, tanggal 168, angka 140, aksi 64. Teks panjang dipotong dengan elipsis dan `title` berisi teks penuh. |

**Tipografi**

| Unsur | Gaya |
| --- | --- |
| Judul kolom | 13/500 `--admin-text-secondary`, huruf biasa ("Diperbarui", bukan "DIPERBARUI"), tanpa jarak huruf tambahan |
| Isi utama | 14/400 `--admin-ink`, tinggi baris 1.45 |
| Identitas (kolom pertama) | Baris 1: 14/500 `--admin-ink`. Baris 2: 13/400 `--admin-text-secondary` (ringkasan, email, atau meta), satu baris terpotong |
| Angka dan rupiah | 14/400 `tabular-nums`, rata kanan; judul kolomnya juga rata kanan. Rupiah memakai angka bertingkat §2.2 |
| Tanggal | 14/400 `--admin-text-secondary`, format "11 Nov 2026, 14.55" WIB; < 24 jam menjadi relatif ("2 jam lalu") dengan `title` tanggal lengkap |
| Nilai kosong | "—" `--admin-text-faint` |
| Chip status | Tinggi 26 px, 12/500, huruf biasa ("Draf", "Terbit"), titik 6 px + teks, nada §2.1 |

**Aksi**

- Mengikuti templat aksi baris §8.2: ✎ Ubah lalu 🗑 Hapus, tombol ikon bulat 36 px tanpa latar (hover `--admin-surface-muted`; hapus `--admin-rose-soft`), ikon 18 px, `aria-label` berisi nama data ("Ubah Batch 9") + tooltip.
- Kolom aksi rata kanan, tanpa judul kolom yang terlihat (judul "Aksi" hanya untuk pembaca layar).

**Aksesibilitas**: `<table>` asli dengan `<th scope="col">`, `aria-sort` pada kolom yang dapat diurutkan, dan `<caption class="sr-only">` berisi nama modul.

### 8.4 Perubahan pada daftar

| Peristiwa | Gerak |
| --- | --- |
| Baris baru | Disisipkan; latar kuning pucat `color-mix(--accent 35%, --surface)` memudar ke normal 1,2 detik |
| Baris diubah | Sorotan sama, tanpa geser |
| Baris dihapus | `opacity` + `scale(0.98)` 180 ms, lalu baris di bawahnya naik dengan `transform` 220 ms |
| Status berubah | Chip *crossfade* + `scale 0.9→1` `--ease-spring`; bila keluar dari saringan, baris memudar setelah 600 ms |
| Saring / cari / ganti halaman | Tanpa animasi baris; isi lama diredupkan 50% |
| Muat ulang latar | Garis progres 2 px di tepi atas kartu daftar |

### 8.5 Aksi massal

Kotak centang bulat 22 px. Saat ≥ 1 terpilih, **kapsul hitam mengambang** muncul di tengah bawah layar (`translateY(120%)→0`, 280 ms `--ease-spring`): “3 dipilih · (Terbitkan) (Tarik) · (×)”. Tombol aksi di dalamnya kuning.

### 8.6 Paginasi

20 per halaman. Tombol bulat ‹ › dan indikator titik-garis (titik aktif memanjang). Teks “1–20 dari 46” di kiri.

### 8.7 Ekspor CSV

| Aturan | Isi |
| --- | --- |
| Rute | `GET /api/admin/export/[modul]` dengan parameter saringan yang sama dengan URL halaman (`q`, `status`, `program`, `batch`). Wajib `requireAdminMember()`; tanpa sesi admin → 401. |
| Berkas | `albana-{modul}-{YYYY-MM-DD}.csv`, UTF-8 dengan BOM agar terbaca Excel, pemisah koma, baris pertama judul kolom berbahasa Indonesia. |
| Kolom | Didefinisikan per modul di satu berkas (`lib/admin-export.ts`). Tanggal WIB "2026-11-16 14:32"; rupiah angka bulat tanpa titik. Pendaftar menyertakan jawaban formulir berpilihan dan jawaban bebas sebagai kolom terpisah. |
| Keamanan | Sel yang diawali `=`, `+`, `-`, `@`, tab, atau CR diberi awalan `'` (mencegah injeksi rumus). Tidak ada token, kunci, atau `idempotency_key` dalam berkas. |
| Batas | 5.000 baris per ekspor; bila lebih, tombol menampilkan pesan agar saringan dipersempit. |
| Umpan balik | Tombol berubah "Menyiapkan…" dengan spinner; selesai = unduhan dimulai + toast "Ekspor siap". |
| Data kosong | Bila daftar yang tampil kosong (termasuk hasil cari/saring kosong), tombol Ekspor **nonaktif**: tepi `--admin-line`, ikon `--admin-text-faint`, kursor `not-allowed`, tooltip "Tidak ada data untuk diekspor". Prop `exportDisabled` pada `TableToolbar`. |


## 9. Memuat, kosong, galat

### 9.1 Pilihan indikator

| Tunggu | Indikator |
| --- | --- |
| < 300 ms | Tidak ada |
| Navigasi | Item sidebar yang dituju langsung aktif + skeleton konten |
| Muat pertama | Skeleton berbentuk isi akhir |
| Saring, cari, halaman | Isi lama diredupkan + garis progres kartu |
| Aksi tombol | Tombol menyusut menjadi lingkaran + spinner |
| Unggah | Bilah progres hitam di atas pola diagonal |

### 9.2 Skeleton

Bentuk mengikuti kartu dan pil: **semua blok berujung bulat**.

```text
▢ ▬▬▬▬ ⟶ ▢ ▬▬▬▬▬
▬▬▬▬▬▬▬▬▬▬▬                                   ◯  ◯  ●     ← judul & tombol tampil asli

╭──────────────────────────╮ ╭──────────────────────────╮
│ ◯  ▬▬▬▬▬▬▬▬              │ │ ◯  ▬▬▬▬▬▬▬▬              │
│                          │ │                          │
│ ▬▬▬▬▬▬▬▬▬▬▬▬             │ │ ▬▬▬▬▬▬▬                  │
│ (▬▬▬) (▬▬▬▬)          ◯  │ │ (▬▬▬) (▬▬▬▬)          ◯  │
╰──────────────────────────╯ ╰──────────────────────────╯
```

| Aturan | Nilai |
| --- | --- |
| Blok | `--surface-muted`; radius 999 px untuk teks dan chip, 50% untuk ikon, 24–32 px untuk media dan kartu |
| Kartu sorotan | Skeleton `--ink-soft` di atas `--ink` |
| Lebar teks | Bervariasi 35–85% |
| Jumlah | 6 baris, 6 kartu, 8 sel media, 4 kartu dashboard |
| Tidak di-skeleton | Sidebar, breadcrumb, judul halaman, tombol kepala, tab saring |
| Tunda | Muncul setelah 300 ms; bila muncul, minimal 400 ms |
| Aksesibilitas | Blok `aria-hidden`; wadah `aria-busy="true"` + teks tersembunyi |

**Kilau:** sapuan diagonal (−20°) bergerak satu kali melintasi **seluruh grid sekaligus** — satu pseudo-elemen di wadah, bukan per blok — 1,4 s linear, jeda 0,6 s.

```css
.admin-shell .skeleton-grid { position: relative; overflow: hidden; }
.admin-shell .skeleton-grid::after {
  content: ""; position: absolute; inset: -50% -100%;
  background: linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.55) 50%, transparent 60%);
  transform: translateX(-60%);
  animation: admin-sheen 2s linear infinite;
  pointer-events: none;
}
.dark .admin-shell .skeleton-grid::after {
  background: linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%);
}
@keyframes admin-sheen { 70%, 100% { transform: translateX(60%); } }
@media (prefers-reduced-motion: reduce) { .admin-shell .skeleton-grid::after { animation: none; } }
```

**Peralihan ke isi:** skeleton `opacity 1→0` dan kartu asli masuk dengan gerak “kartu masuk” §4.2 (sekali per kunjungan halaman). Kunjungan berikutnya: *crossfade* 200 ms saja.

### 9.3 Kosong

Komponen `EmptyState` (`components/admin/ui/empty-state.tsx`) dipakai **setiap** daftar yang kosong, menggantikan tabel dan kartu:

```text
╭ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ╮   ← tepi putus-putus --admin-line-strong, radius 32 px
│                                            │
│                    (□)                     │   ← ikon 24 px dalam bulatan --admin-surface 56 px
│             Belum ada artikel              │   ← 16/500 --admin-ink
│    Tulis artikel pertama; artikel tampil   │   ← 14 --admin-text-secondary, maks 40ch
│      di situs setelah diterbitkan.         │
│                                            │
╰ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ╯
```

- **Di tengah**, baik horizontal maupun vertikal, dalam area setinggi `min(420px, 55dvh)`. Tidak menempel di kiri atas.
- Bilah alat (Cari, Saring, Tambah) tetap tampil di atasnya, sehingga aksi utama tidak perlu diulang di dalam kotak.

| Jenis | Ikon | Naskah |
| --- | --- | --- |
| Belum ada data | Kotak masuk | Judul "Belum ada {data}" + satu kalimat cara mengisinya |
| Hasil cari/saring kosong (`searching`) | Kaca pembesar silang | "Tidak ada {data} yang cocok" + "Coba kata kunci lain" / "Ubah kata kunci atau saringan" |
| Menunggu prasyarat | — | Banner di atas daftar, mis. "Tambahkan rekening aktif agar pendaftaran dapat diterima." |

### 9.4 Galat

| Lingkup | Tampilan |
| --- | --- |
| Field | Bidang `--danger-bg` + pesan di bawah |
| Form / aksi | Banner pil `--danger-bg` di atas field pertama + **Coba lagi** |
| Kartu daftar gagal | Di dalam kartu: ikon berbingkai jingga + “Daftar belum bisa dimuat.” + **Coba lagi** |
| Halaman | Kartu hitam besar di tengah: judul putih + penjelasan + **Muat ulang** (kuning) + **Ke dashboard** |
| Sesi habis | Dialog: “Sesi berakhir. Masuk lagi untuk melanjutkan.”; isian dipertahankan |
| Tanpa izin | `/admin/denied` |

## 10. Umpan balik singkat

| Komponen | Tampilan dan gerak |
| --- | --- |
| Toast (`sonner`) | Kapsul hitam di tengah bawah, teks putih, ikon centang mint; masuk `translateY(16px)→0` + `scale(0.96)→1` 260 ms `--ease-spring`; 4 detik (8 detik dengan **Urungkan** kuning); berhenti saat hover |
| Tooltip | Pil hitam kecil, teks putih 13 px; tunda 400 ms; masuk 160 ms + 4 px |
| Dropdown / popover | Kartu putih radius 24 px, bayangan dropdown; butir pil 44 px; masuk dari pemicu `scale(0.95)→1` + `opacity`, 220 ms |
| Salin | Ikon salin → centang, tombol bulat berubah mint 1,5 detik; teks “Tersalin” |
| Sakelar | Jempol meluncur 220 ms `--ease-spring`; dikembalikan bila server menolak |
| Lencana kuning | Muncul `scale 0→1` `--ease-spring`; angka berganti tanpa animasi |

## 11. Alur contoh: verifikasi tagihan

1. Dashboard: kartu sorotan hitam menampilkan tumpukan tiga tagihan; tombol kuning ■ pada kartu depan.
2. Tekan ■ → panel samping meluncur dari kanan; angka display **Rp260.**`137` dengan kode unik abu.
3. **Verifikasi** → dialog putih: angka tagihan di tengah, “Tagihan pelunasan Rp1.040.000 akan dibuat.” Fokus di **Batal**.
4. **Ya, verifikasi** → pil menyusut menjadi lingkaran spinner → centang → dialog menutup.
5. Toast kapsul hitam “Pembayaran diverifikasi”. Di kartu sorotan, kartu depan bergeser keluar ke kiri, kartu berikutnya naik ke depan; angka lencana kuning di pil Pendaftaran turun menjadi 2.

## 12. Implementasi

- Token di §2 dideklarasikan pada `.admin-shell` dan `.dark .admin-shell` di `app/globals.css`, menggantikan token admin biru yang ada di sana. Situs publik tidak terdampak.
- Plus Jakarta Sans dimuat sekali untuk route group `(admin)` dan `(auth)` — melalui `next/font/google` di layout server pembungkus, atau mekanisme Google Fonts yang sudah dipakai — dan dipasang sebagai `--font-admin` pada `.admin-shell`.
- Komponen `components/ui/*` tetap dipakai; gaya admin diterapkan lewat scope, bukan salinan komponen.
- Kerangka: header logo/tema/pengguna (§3.1) dan satu sidebar navigasi (§3.2) di `components/admin/shell/AdminShell.tsx`; daftar grup dan modul berupa konstanta `lib/admin-nav.ts` (tabel `privilege_*` sudah dihapus).

## 13. Daftar periksa per layar

- [ ] Satu kartu sorotan hitam paling banyak; kuning maksimal tiga unsur; mint hanya untuk berhasil.
- [ ] Biru hanya pada logo.
- [ ] Plus Jakarta Sans di semua teks admin; judul 400, bukan tebal.
- [ ] Semua tombol ikon bulat; semua tombol teks dan input berbentuk pil.
- [ ] Teks kecil memakai `--text-secondary` (bukan `--text-faint`).
- [ ] Templat T1–T4; aksi utama di tombol bulat hitam kanan judul.
- [ ] Skeleton berujung bulat; kepala halaman tidak di-skeleton.
- [ ] Dialog: fokus awal, Escape, fokus kembali, tidak menutup diam-diam saat form berubah.
- [ ] Pil aktif meluncur; tanpa gerak saat ketik, saring, atau ganti halaman.
- [ ] Reduced motion: tanpa spring, getar, kilau, atau luncur; keadaan akhir langsung.
- [ ] Kontras: teks ≥ 4,5:1; chip kuning dan mint berteks gelap; fokus terlihat di kedua tema.
- [ ] Diuji 360, 768, 1280 px, zoom 200%, keyboard saja, kedua tema.
