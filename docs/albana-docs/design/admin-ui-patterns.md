# Pola UI admin — Monochrome Soft

**Status:** rancangan, 16 November 2026. Belum diterapkan. Dokumen ini **menggantikan arah visual** [design system admin](admin-design-system.md) untuk CMS: gaya baru mengikuti gambar referensi yang disetujui pemilik — monokrom dengan aksen kuning, font Poppins, navigasi pil, tombol ikon bulat, dan kartu besar berbentuk lunak.

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
| Navigasi atas berupa pil putih, aktif hitam | Pil modul utama di topbar; aktif hitam teks putih |
| Rail kiri berisi tombol bulat putih, aktif hitam | Rail aksi konteks modul (bukan daftar menu panjang) |
| Breadcrumb abu dengan ikon map dan panah panjang | Breadcrumb `Grup ⟶ Modul` |
| Judul besar ringan | Judul halaman Poppins 400, 44–48 px |
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

Poppins untuk seluruh admin. Muat bobot **300, 400, 500, 600** hanya pada route group `(admin)` dan `(auth)`; situs publik tetap Plus Jakarta Sans + Inter. Fallback: `ui-sans-serif, system-ui, sans-serif`.

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

**Angka bertingkat.** Untuk angka display, bagian setelah pemisah ribuan terakhir memakai `--text-faint`: `Rp1.300.`**`137`** → `Rp1.300.` hitam, `137` abu. Pada tagihan, bagian abu itu kebetulan adalah kode unik, sehingga mata langsung menemukannya. Nilai lengkap tetap satu node teks dengan `aria-label` berisi angka utuh.

### 2.3 Bentuk dan ruang

| Unsur | Radius | Ukuran |
| --- | --- | --- |
| Kartu | 32 px | Padding 28 px (ponsel 20 px) |
| Kartu di dalam kartu (tumpukan) | 24 px | Padding 20 px |
| Pil navigasi | 999 px | Tinggi 56 px, padding 0 28 px, ikon 18 px + jarak 10 px |
| Tombol bulat besar (rail, aksi judul) | 50% | 56 px |
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

```text
╭──────────────────────────────────────────────────────────────────────────────╮  kanvas #EFEFEF
│  (⌗)   ⬤ Dashboard   ○ Pendaftaran   ○ Kelas   ○ Konten   ○ Pengaturan   ◐ (A)│  ← topbar 96px
│                                                                              │
│  (←)   ▢ Kelas  ⟶  ▢ Program                                                 │
│        Program                                       (⚲) (⌕) (●+)            │  ← kepala halaman
│                                                                              │
│  (●)   ╭──────────────────────────────╮  ╭─────────────────────────────────╮ │
│  (✎)   │  KARTU SOROTAN (hitam)       │  │  ◯ Kartu putih                  │ │
│  (◫)   │                              │  │                                 │ │
│  (⧉)   ╰──────────────────────────────╯  ╰─────────────────────────────────╯ │
│  rail  ╭──────────────────────────────────────────────────────────────────╮  │
│  aksi  │  Panel daftar                                                    │  │
│        ╰──────────────────────────────────────────────────────────────────╯  │
╰──────────────────────────────────────────────────────────────────────────────╯
```

### 3.1 Topbar — navigasi modul berbentuk pil

- Kiri: tombol bulat 56 px berisi logo Albana (tautan ke Dashboard).
- Tengah: lima pil **grup** — Dashboard · Pendaftaran · Kelas · Konten · Pengaturan. Pil aktif `--ink` berteks putih; pasif `--surface`. Jarak antarpil 12 px.
- Kanan: tombol bulat tema, tombol bulat avatar (menu Profil, Keluar).
- Lencana kuning 20 px di pojok pil **Pendaftaran** bila ada tagihan menunggu.
- Topbar tidak lengket; ia ikut tergulir. Saat gulir naik, topbar muncul kembali (lihat §4).

### 3.2 Rail kiri — modul di dalam grup

Rail berisi tombol bulat 56 px, satu per **modul** dalam grup aktif, ditambah tombol ← kembali di atas. Modul aktif `--ink`, ikon putih. Tooltip berisi nama modul muncul saat hover/fokus di kanan tombol.

| Grup (pil) | Modul (tombol rail) |
| --- | --- |
| Dashboard | — (rail berisi pintasan: Tagihan menunggu, Batch aktif) |
| Pendaftaran | Pendaftar · Tagihan |
| Kelas | Program · Batch · Trainer |
| Konten | Artikel · Media · Galeri · Testimoni · Partner |
| Pengaturan | Profil akademi · Kontak · Rekening · Akun admin |

Ini memisahkan dua tingkat navigasi secara visual: **pil = di mana saya**, **rail = bagian mana**. Sidebar 224 px lama tidak dipakai.

### 3.3 Kepala halaman

```text
▢ Kelas  ⟶  ▢ Program                              ← breadcrumb 14px, --text-secondary
Program                         (⚲)  (⌕)  (●+)     ← judul 44px/400; tombol bulat 56px
```

- Tombol bulat kanan, urutan tetap: **Saring** (⚲) · **Cari** (⌕) · **Aksi utama** (hitam, ikon +).
- Aksi utama berupa tombol bulat hitam; label teksnya muncul sebagai tooltip dan `aria-label` (“Tambah program”). Pada ≥ 1280 px boleh melebar menjadi pil hitam berlabel.
- **Cari** saat ditekan melebar menjadi kolom pil 320 px di tempat (bukan dialog); Escape menutup.
- Tidak ada eyebrow dalam kurung siku dan tidak ada garis pembagi di bawah judul.

### 3.4 Responsif

| Lebar | Topbar | Rail | Konten |
| --- | --- | --- | --- |
| ≥ 1280 px | Lima pil berlabel | Kiri, vertikal | Grid 12 kolom, kartu 2–3 per baris |
| 1024–1279 px | Pil berlabel, padding 20 px | Kiri | Grid 8 kolom |
| 768–1023 px | Pil hanya ikon kecuali aktif | Pindah ke bawah judul sebagai deret horizontal tombol bulat | 1–2 kartu per baris |
| < 768 px | Logo + judul grup aktif + tombol menu; grup dibuka sebagai lembar bawah berisi pil | Deret horizontal dapat digulir di bawah judul | 1 kolom; judul 32 px |

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
| **Pil aktif berpindah** | Bidang hitam pil **meluncur** dari pil lama ke pil baru (`transform: translateX` + lebar via `scaleX` pada pseudo-elemen), 320 ms `--ease-in-out`. Teks berubah warna saat bidang lewat di bawahnya. |
| **Tombol bulat ditekan** | `scale(0.92)` 90 ms → kembali dengan `--ease-spring` 220 ms. |
| **Tombol bulat hover** | Ikon berputar/geser kecil sesuai maknanya: ↗ geser 2 px ke kanan atas; ← geser 2 px ke kiri; + berputar 90°. 180 ms. |
| **Rail berganti grup** | Tombol lama keluar `opacity` + `scale 0.8` serentak 140 ms; tombol baru masuk satu per satu dari atas, `scale 0.8→1` + `opacity`, jeda 40 ms, `--ease-spring`. |
| **Kartu sorotan bertumpuk** | Kartu depan bergeser ke kiri dan memudar; kartu belakang naik ke depan (`translateY(-12px) scale(0.96)→0 1`), 360 ms `--ease-out`. Titik indikator: titik aktif memanjang menjadi garis (`scaleX`). Usap horizontal di ponsel. |
| **Angka display berubah** | Digit lama naik keluar, digit baru naik masuk per digit (masker `overflow: hidden`), 260 ms, jeda 30 ms antardigit dari kanan. Hanya saat nilai berubah karena tindakan, bukan saat memuat. |
| **Topbar saat gulir** | Ikut tergulir ke atas; saat pengguna gulir naik ≥ 8 px, topbar turun kembali (`translateY(-100%)→0`) 240 ms. |
| **Kepala halaman saat pindah modul** | Judul *crossfade* + `translateY(8px)→0` 220 ms; breadcrumb ikut. Shell tidak bergerak. |
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
▢ Pendaftaran ⟶ ▢ Tagihan
Tagihan                                                    (⚲) (⌕) (●↓)

╭─ kapsul saring (hitam) ──────────────────────────────────╮
│ ( Semua 46 ) ( ◉ Menunggu 3 ) ( Terverifikasi 41 ) ( Ditolak 2 )  (↗) │
╰──────────────────────────────────────────────────────────╯

╭──────────────────────────────────────────────────────────────────────╮
│  (A)  Rina Putri             Speaker · Batch 9     Rp260.137   [Menunggu] (↗) │
│       0812…  · 2 jam lalu                                              │
│  ────────────────────────────────────────────────────────────────────  │
│  (B)  Budi Santoso           Series · Batch 9      Rp300.214   [Menunggu] (↗) │
╰──────────────────────────────────────────────────────────────────────╯
         Menampilkan 1–20 dari 46              ( ‹ )  ●───  ( › )
```

- **Kapsul saring** (gaya kapsul hitam di gambar): wadah `--ink`, chip pasif `--ink-soft` teks putih, chip aktif `--surface` teks hitam, tombol ↗ kuning di ujung membuka saringan lanjutan.
- Panel daftar satu kartu putih radius 32 px; baris dipisah garis `--line` yang tidak menyentuh tepi kartu (inset 28 px).
- Kolom identitas: avatar bulat berisi inisial (`--surface-muted`) + nama 15/500 + meta 14 `--text-secondary`.
- Status berupa chip: Menunggu = kuning; Terverifikasi / Terbit / Dibuka = mint; Ditolak = `--danger-bg`; Draf / Ditutup = `--surface-muted`.
- Aksi baris: tombol bulat 44 px ↗ membuka detail; menu ⋯ untuk aksi lain.
- Paginasi: dua tombol bulat dengan indikator titik-garis di tengah.

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

### 6.1 Wadah

| Kebutuhan | Wadah | Lebar |
| --- | --- | --- |
| Konfirmasi | Dialog konfirmasi | 440 px |
| Form ≤ 5 field | Dialog S | 520 px |
| Form 6–12 field | Dialog M | 680 px |
| Unggah / pratinjau media | Dialog L | 920 px |
| Membaca detail sambil melihat daftar | Panel samping T3 | 520 px |
| Baris berulang, editor, > 1 layar | Halaman T2 | — |

### 6.2 Anatomi

```text
╭──────────────────────────────────────────────────╮
│  ◯  Tambah trainer                          (×)  │  ← ikon berbingkai + judul 22/500
│     Profil tampil di beranda setelah disimpan.   │
│                                                  │
│  Nama                                            │
│  ( ____________________________________ )        │
│  …                                               │
│                                                  │
│                      [Batal]   [■ Simpan]        │  ← pil, kanan
╰──────────────────────────────────────────────────╯
```

- Radius 32 px, latar `--surface`, bayangan dialog, backdrop `rgba(14,14,14,0.45)` + `backdrop-filter: blur(4px)` (blur pada backdrop saja, bukan animasi).
- Tombol tutup bulat 44 px `--surface-muted`.
- Kepala dan kaki tetap; badan menggulir; tinggi maksimal `min(760px, 100dvh − 48px)`.
- **Konfirmasi merusak** memakai kartu hitam: dialog `--ink` berteks putih, tombol aksi berlatar `--danger`, Batal pil `--ink-soft`. Kontras warna langsung membedakannya dari dialog biasa.
- **Konfirmasi verifikasi** memakai dialog putih dengan angka display tagihan di tengah dan tombol **Ya, verifikasi** hitam.
- < 640 px: lembar bawah, radius atas 32 px, pegangan geser 40×4 px di atas.

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

Primitif: `field.tsx`, `label.tsx`, `input.tsx`, `textarea.tsx`, `select.tsx`, `DatePicker.tsx`, `TimePicker.tsx`, `checkbox.tsx`, `radio-group.tsx`, `switch.tsx`. Gaya diterapkan pada scope `.admin-shell`; kontrol `style-line` publik tidak disentuh.

### 7.1 Anatomi field

```text
Nama program                                    ← 13/500, --text-secondary, 8px ke kontrol
╭───────────────────────────────────────────╮
│  Public Speaking Series                   │   ← pil 52px, --surface-muted, tanpa border
╰───────────────────────────────────────────╯
Tampil sebagai judul kartu di beranda.          ← 13/400, --text-secondary
```

Field **tanpa border** dalam keadaan diam — bidang abu di atas kartu putih sudah cukup memisahkan, seperti kolom cari di gambar.

### 7.2 Keadaan

| Keadaan | Bidang | Tepi | Gerak |
| --- | --- | --- | --- |
| Diam | `--surface-muted` | Tidak ada | — |
| Hover | `--surface-muted` | 1 px `--line-strong` | 140 ms |
| Fokus | `--surface` | 2 px `--ink` + ring 4 px `rgba(11,11,11,0.08)` | Ring tumbuh dari 0, 180 ms |
| Terisi | `--surface-muted` | Tidak ada | — |
| Galat | `--danger-bg` | 2 px `--danger` | Pesan masuk `translateY(-4px)→0` 180 ms |
| Nonaktif | `--canvas` | Tidak ada | Teks `--text-faint`; alasan di petunjuk |
| Hanya baca | Transparan | Tidak ada | Untuk slug |

Ruang pesan galat dicadangkan (min-height 20 px). Label tetap terlihat; placeholder hanya contoh format.

### 7.3 Validasi

1. Saat blur: periksa field itu.
2. Saat mengetik pada field galat: hapus galat begitu sah.
3. Saat simpan: periksa semua; gulir dan fokus ke galat pertama; banner “3 isian perlu diperbaiki”.
4. Field yang belum disentuh tidak divalidasi sebelum simpan pertama.

### 7.4 Kontrol khusus

| Data | Kontrol |
| --- | --- |
| Rupiah | Pil dengan awalan “Rp” abu; pemisah ribuan saat mengetik; `inputMode="numeric"`; simpan integer |
| Persen DP | Pil sempit 120 px dengan akhiran “%”; di sampingnya chip hasil: **= Rp300.000** |
| Pilihan 2–4 (Bundling Ya/Tidak, jenis formulir) | **Pil segmen** dalam kapsul `--surface-muted`; pilihan aktif pil `--ink` yang meluncur (gerak sama dengan topbar) |
| Pilihan > 4 | Select berbentuk pil; daftar di popover radius 24 px |
| Ya/tidak berdampak | `switch` 52×32 px, aktif `--ink`; teks akibat di sampingnya |
| Tanggal + jam sesi | Tiga pil berderet: tanggal · mulai · selesai, akhiran “WIB” |
| Teks 20–30 kata | Textarea radius 20 px + penghitung chip di pojok kanan bawah (kuning bila di luar rentang) |
| Isian bersyarat | Muncul `opacity` + `translateY(-8px)→0` 220 ms; nilai disimpan saat disembunyikan |

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
| **Baris dalam satu kartu** (T1) | Data dibandingkan: Pendaftar, Tagihan, Batch, Artikel, Rekening |
| **Kartu besar** radius 32 px, 2–3 per baris | Program, Trainer, Partner, Testimoni |
| **Grid media** radius 24 px, 4:3 | Media, Galeri |

Kartu program meniru kartu putih di gambar: ikon berbingkai + nama 22/500, angka display (jumlah pendaftar batch aktif), kapsul chip (status batch, harga), tombol bulat ↗.

< 768 px: baris menjadi kartu radius 24 px bertumpuk, jarak 12 px.

### 8.2 Bilah alat

- **Kapsul saring hitam** (§5 T1) menggantikan tab. Chip aktif putih **meluncur** antarchip, 320 ms `--ease-in-out`.
- Cari: tombol bulat yang melebar menjadi pil 320 px (`scaleX` dari kanan pada latar, lalu input memudar masuk), 260 ms. Menunggu 250 ms setelah ketikan terakhir.
- Saringan tersimpan di URL (`?status=pending&q=…`).

### 8.3 Baris

| Unsur | Aturan |
| --- | --- |
| Tinggi | 76 px |
| Identitas | Avatar inisial bulat 40 px + nama 15/500 + meta 14 |
| Angka | Rata kanan, `tabular-nums`; rupiah dengan tiga digit akhir `--text-faint` |
| Kosong | “—” |
| Tanggal | “16 Nov 2026, 14.32”; relatif untuk < 24 jam |
| Status | Chip berkata (kuning / mint / jingga / abu) |
| Aksi | Tombol bulat ↗ 44 px; menu ⋯ untuk lainnya |
| Hover | Latar `--surface-muted` dengan radius 20 px di dalam kartu (inset 8 px), 140 ms; tombol ↗ berubah hitam |
| Terpilih (panel terbuka) | Latar `--ink`, teks putih, chip tetap berwarna |

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

## 9. Memuat, kosong, galat

### 9.1 Pilihan indikator

| Tunggu | Indikator |
| --- | --- |
| < 300 ms | Tidak ada |
| Navigasi | Pil topbar aktif berdenyut halus (`opacity 1↔0.7`, 900 ms) + skeleton konten |
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
| Tidak di-skeleton | Topbar, rail, breadcrumb, judul halaman, tombol bulat kepala, kapsul saring |
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

```text
╭────────────────────────────────────────────╮
│                                            │
│                   ◯ ✦                      │   ← ikon berbingkai 64 px
│          Belum ada testimoni               │   ← 22/500
│   Tambahkan kutipan peserta yang sudah     │
│         memberi izin tampil.               │
│                                            │
│           [■ + Tambah testimoni]           │
╰────────────────────────────────────────────╯
```

| Jenis | Naskah | Aksi |
| --- | --- | --- |
| Belum ada data | “Belum ada …” + satu kalimat guna | Aksi utama modul (pil hitam) |
| Hasil saring kosong | “Tidak ada yang cocok dengan ‘…’ ” | **Hapus saringan** (pil putih) |
| Menunggu prasyarat | Kartu **kuning**: “Tambahkan rekening aktif agar pendaftaran dapat diterima.” | Tombol bulat hitam → modul prasyarat |

Ikon masuk `scale 0.8→1` `--ease-spring` 320 ms; teks fade 200 ms.

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
- Poppins dimuat sekali untuk route group `(admin)` dan `(auth)` — melalui `next/font/google` di layout server pembungkus, atau mekanisme Google Fonts yang sudah dipakai — dan dipasang sebagai `--font-admin` pada `.admin-shell`.
- Komponen `components/ui/*` tetap dipakai; gaya admin diterapkan lewat scope, bukan salinan komponen.
- Sidebar 224 px pada `app/(admin)/admin/layout.tsx` diganti topbar pil + rail; daftar grup dan modul tetap berupa konstanta di kode (tabel `privilege_*` sudah dihapus) dengan pemetaan grup di §3.2.

## 13. Daftar periksa per layar

- [ ] Satu kartu sorotan hitam paling banyak; kuning maksimal tiga unsur; mint hanya untuk berhasil.
- [ ] Biru hanya pada logo.
- [ ] Poppins di semua teks admin; judul 400, bukan tebal.
- [ ] Semua tombol ikon bulat; semua tombol teks dan input berbentuk pil.
- [ ] Teks kecil memakai `--text-secondary` (bukan `--text-faint`).
- [ ] Templat T1–T4; aksi utama di tombol bulat hitam kanan judul.
- [ ] Skeleton berujung bulat; kepala halaman tidak di-skeleton.
- [ ] Dialog: fokus awal, Escape, fokus kembali, tidak menutup diam-diam saat form berubah.
- [ ] Pil aktif meluncur; tanpa gerak saat ketik, saring, atau ganti halaman.
- [ ] Reduced motion: tanpa spring, getar, kilau, atau luncur; keadaan akhir langsung.
- [ ] Kontras: teks ≥ 4,5:1; chip kuning dan mint berteks gelap; fokus terlihat di kedua tema.
- [ ] Diuji 360, 768, 1280 px, zoom 200%, keyboard saja, kedua tema.
