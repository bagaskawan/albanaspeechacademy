# Beranda "Fitness Editorial" — Rencana Implementasi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Jalankan perintah dari folder `front/` kecuali disebut lain.

**Goal:** Merapikan beranda menjadi satu sistem visual yang tegas, berbasis acuan **Fitness** dengan tiga unsur dari **Cereen**. Hasilnya grid campuran foto, teks, dan data; satu aksen warna yang hemat; serta jarak, ukuran huruf, dan rasio foto yang mengikuti skala tetap.

**Architecture:** Lanjutan dari [Editorial bersih](./2026-11-17-landing-editorial-visual-plan.md), yang sudah dieksekusi (`c1ef897`…`914270a`). Data (`HomeData`, `moments`, `bentoLayout`), alur tujuh babak, dan mesin gerak (`lib/motion/scroll.ts`) **tetap**. Yang berubah adalah lapisan tampilan:
1. **Token tata letak baru**: skala jarak, kontainer, grid, ukuran huruf, rasio foto.
2. **Nada dipangkas** menjadi tiga (canvas, mist, night), ditambah satu aksen **sun**.
3. **Lima komponen dasar baru** yang dipakai ulang oleh semua seksi.

Setiap seksi lalu disusun ulang memakai komponen dasar itu.

**Tech Stack:** Next.js 16, React 19, Tailwind 4, GSAP ScrollTrigger + Lenis, `next/image`, `node --test`.

**Spec:** Bagian **Spesifikasi** di bawah, ditambah [Konten Home](../content/home-page-content.md) untuk naskah dan aturan data.

---

## Gambar acuan

Simpan dua gambar acuan di `docs/albana-docs/design/references/`. Tautan di bawah sudah disiapkan.

| Acuan | Berkas | Dipakai untuk |
| --- | --- | --- |
| **Fitness** (utama) | `references/fitness-editorial.webp` | Struktur grid, petak data, label bernomor, satu aksen warna, foto aksi, tautan "Lihat →" |
| **Cereen** (pendukung) | `references/cereen.webp` | Potret besar di Testimoni dan Trainer, bingkai garis pada satu frasa judul, chip topik |

![Acuan Fitness](../design/references/fitness-editorial.webp)

![Acuan Cereen](../design/references/cereen.webp)

Agen yang mengeksekusi: buka kedua gambar sebelum Task 3 dan setiap kali menyusun seksi. Bila gambar belum ada di path di atas, berhenti dan minta pemilik menyematkannya.

---

## Spesifikasi

### S1. Arah yang dipilih pemilik

| # | Keputusan |
| --- | --- |
| A1 | Dasar gaya: **Fitness**. Grid campuran (foto, teks, petak data dalam satu grid), label mikro bernomor `01`/`02`, tautan "Lihat →", satu aksen warna. |
| A2 | Dari **Cereen** hanya tiga unsur: **(a)** potret besar emosional di Testimoni dan Trainer, **(b)** satu frasa per judul diberi **bingkai garis 1px** (menggantikan aksen serif), **(c)** chip topik kecil. |
| A3 | **Ditolak dari Cereen:** kartu kaca di atas foto, palet mint/peach, kapital penuh di semua judul, statistik tanpa sumber. |
| A4 | Warna merek tetap biru. Aksen tunggal = **sun** `#e7c75d` (token `--color-sun` yang sudah ada), dipakai **hanya** untuk label nomor, petak sorotan, dan bar data. |
| A5 | Font tetap: Plus Jakarta Sans (judul, label), Inter (teks). **Playfair tidak dipakai lagi di beranda.** |
| A6 | Sudut **0–2px** untuk petak, foto, tombol, dan chip. Satu pengecualian: **foto bulat** (`rounded-full`) khusus untuk deret potret kecil (avatar trainer dan foto "titik" ala Fitness). |
| A7 | Teks di atas foto hanya di hero (aturan §1.4 tetap). |

### S2. Skala jarak (dasar 4 px)

Tailwind 4 memakai `--spacing: 0.25rem`, jadi kelas `p-6` = 24px. **Hanya nilai di tabel ini yang boleh dipakai** untuk padding, margin, dan gap di `components/home/*`. Nilai lain dan nilai arbitrer seperti `p-[13px]` atau `mt-[3.2rem]` dilarang.

| Token | px | Kelas Tailwind | Dipakai untuk |
| --- | --- | --- | --- |
| `2xs` | 4 | `1` | Celah antarfoto dalam bento, jarak ikon–teks |
| `xs` | 8 | `2` | Celah antarpetak grid Fitness, jarak label–nilai |
| `sm` | 12 | `3` | Jarak judul–paragraf dalam petak |
| `md` | 16 | `4` | Padding petak ponsel, gutter ponsel |
| `lg` | 24 | `6` | Padding petak desktop, gutter tablet/desktop |
| `xl` | 32 | `8` | Jarak kepala seksi → isi (ponsel) |
| `2xl` | 48 | `12` | Jarak kepala seksi → isi (desktop), antarblok dalam seksi (ponsel) |
| `3xl` | 64 | `16` | Padding vertikal seksi (ponsel), antarblok dalam seksi (desktop) |
| `4xl` | 96 | `24` | Padding vertikal seksi (tablet) |
| `5xl` | 128 | `32` | Padding vertikal seksi (desktop) |

### S3. Kontainer, grid, dan ritme seksi

| Unsur | < 640 px | 640–1023 px | ≥ 1024 px |
| --- | --- | --- | --- |
| Lebar maks kontainer | penuh | penuh | **1280px** (`max-w-7xl`) |
| Gutter samping | 16px | 24px | 40px |
| Kolom grid | 4 | 8 | 12 |
| Celah kolom | 16px | 24px | 24px |
| Padding vertikal seksi | 64px | 96px | 128px |
| Kepala seksi → isi | 32px | 40px | 48px |
| Antarblok dalam seksi | 48px | 64px | 64px |
| Celah antarpetak (grid Fitness) | 8px | 8px | 8px |
| Padding dalam petak | 16px | 20px | 24px |

Utilitas yang dibuat di Task 1: `.home-container` (lebar + gutter), `.home-grid` (kolom + celah), `.home-section` (padding vertikal), `.home-stack-head` (jarak kepala → isi), `.home-stack-block` (antarblok).

### S4. Skala huruf

Enam ukuran. Semua teks di beranda memakai salah satunya lewat kelas `type-*`, bukan `text-xl`/`text-[…]` ad hoc.

| Kelas | Ukuran | Line-height | Letter-spacing | Berat | Font | Dipakai untuk |
| --- | --- | --- | --- | --- | --- | --- |
| `type-mega` | `clamp(3rem, 8vw, 7.5rem)` (48→120px) | 0.92 | −0.05em | 700 | Jakarta | Kata bab, angka 70/20/10 |
| `type-display` | `clamp(2.25rem, 4.2vw, 3.75rem)` (36→60px) | 1.02 | −0.04em | 600 | Jakarta | H2 seksi |
| `type-title` | `clamp(1.375rem, 2vw, 1.75rem)` (22→28px) | 1.15 | −0.02em | 600 | Jakarta | H3 nama program/trainer, nilai statistik |
| `type-lead` | `clamp(1.0625rem, 1.2vw, 1.1875rem)` (17→19px) | 1.55 | 0 | 400 | Inter | Paragraf pembuka, lead |
| `type-body` | `1rem` (16px) | 1.6 | 0 | 400 | Inter | Paragraf isi |
| `type-small` | `0.875rem` (14px) | 1.5 | 0 | 400/500 | Inter | Teks petak, caption |
| `.eyebrow` (sudah ada) | 12px | 1.5 | 0.1em kapital | 600 | Jakarta | Label seksi, label data |
| `type-micro` | 11px | 1 | 0.04em | 600 | Jakarta, `tabular-nums` | Isi chip nomor `01` |

Panjang baris: `type-lead` maks `36em`, `type-body` maks `62ch`, judul `type-display` maks `18ch`.

### S5. Nada dan aksen

`tone-sand` **dihapus**. Tiga nada tersisa dengan nilai yang sudah lolos tes kontras (Task 1 Editorial bersih), ditambah dua variabel baru per nada:

| Variabel baru | Terang (canvas/mist) | Gelap (canvas/mist) | night (terang & gelap) |
| --- | --- | --- | --- |
| `--tone-sun` | `#e7c75d` | `#e7c75d` | `#e7c75d` |
| `--tone-on-sun` | `#15171b` | `#15171b` | `#15171b` |

Aturan: `--tone-on-sun` di atas `--tone-sun` ≥ 4.5:1 (diuji). Sun **tidak** dipakai untuk teks di atas latar, hanya sebagai latar chip, petak sorotan, dan bar.

### S6. Rasio foto (daftar tertutup)

| Rasio | Kelas | Dipakai untuk |
| --- | --- | --- |
| 21:9 | `aspect-[21/9]` | Banner hero desktop |
| 4:5 | `aspect-[4/5]` | Hero ponsel, potret Testimoni/Trainer, strip Penutup |
| 4:3 | `aspect-[4/3]` | Petak foto Fitness, baris Cara belajar |
| 16:9 | `aspect-video` | Thumbnail Jadwal |
| 1:1 bulat | `aspect-square rounded-full` | Deret foto "titik", avatar |

Bento dokumentasi tetap memakai `bentoLayout` (tinggi baris tetap).

### S7. Komponen dasar

Dibuat di Task 2, di `front/components/home/ui/`:

| Komponen | Props | Bentuk |
| --- | --- | --- |
| `NumberChip` | `{ n: number }` | Kotak `--tone-sun`, teks `--tone-on-sun`, `type-micro`, tinggi 20px, padding x 6px, sudut 2px, isi `01` (dua digit) |
| `MoreLink` | `{ href: string; children: ReactNode }` | `type-small` 500, ikon panah `ArrowUpRight` 16px di **kiri**, garis bawah saat hover, target sentuh ≥ 44px |
| `StatTile` | `{ n: number; value: string; label: string }` | `NumberChip` → nilai `type-title tabular-nums` → label `type-small` muted; tanpa latar |
| `Tile` | `{ tone?: "plain" \| "tile" \| "sun" \| "night"; className?; children }` | Petak grid Fitness: padding S3, sudut 2px, latar sesuai `tone` (`--tone-tile`, `--tone-sun`, navy) |
| `AccentFrame` | `{ children }` | Pengganti `.accent-serif`: `<em>` normal (bukan miring), bingkai 1px `--tone-ink` dengan padding x 0.15em; gerak G2 menggambar bingkai |

### S8. Peta seksi baru

| # | Seksi | Nada | Komposisi (ikuti acuan) |
| --- | --- | --- | --- |
| 1 | Hero | foto full-bleed + canvas | Foto layar penuh dengan judul, lead, dan CTA di kiri bawah (S9) → baris statistik 3 zona sama lebar (statistik · statistik · petak foto) |
| 2 | Pita manfaat | canvas | 4 kolom bernomor `NumberChip`, garis pemisah 1px |
| 3 | Program (Public Training ×3) | canvas | Kepala seksi Fitness + per program: kepala → bento → **baris 3 petak batch** |
| 4 | Inhouse + Pernah melatih | night | Kata bab mega + foto besar kiri + teks/CTA kanan + bento + grid logo |
| 5 | Tentang + Cara belajar | mist | Tentang: potret + kartu Alan. Cara belajar: **petak bar ala "Evaluate your goals"** + 3 foto 4:3 |
| 6 | Legalitas | canvas | Daftar bergaris (tetap), kepala seksi Fitness |
| 7 | Testimoni | canvas | **Cereen**: potret 4:5 besar + kutipan; tanpa foto → monogram |
| 8 | Trainer | canvas | **Cereen**: potret 4:5 4 kolom + deret avatar bulat |
| 9 | Jadwal | mist | Baris jadwal: thumbnail 16:9 · data · harga · CTA |
| 10 | Cara daftar | canvas | 3 petak bernomor + garis penghubung G5 |
| 11 | Penutup | night | Strip 3 foto 4:5 → judul → CTA → kontak |

### S9. Foto selebar layar (full-bleed)

Tiga tempat memakai foto **tanpa kontainer dan tanpa padding samping**, dari tepi kiri sampai tepi kanan layar. Seksi lain tetap di `.home-container` agar tepi kiri isinya segaris.

| Tempat | Ukuran | Isi di atas foto |
| --- | --- | --- |
| **Hero** | lebar 100%, tinggi `min-h-svh` (ponsel `min-h-[88svh]`). Header transparan di atasnya | Lapisan gelap + baris fokus, H1 logo putih, lead, tombol (§1.4 mengizinkan teks di atas foto di hero) |
| **Pembuka Inhouse** | lebar 100%, `aspect-[21/9]` (≥1024) / `aspect-[4/5]` (<640) / `aspect-video` (640–1023) | Tidak ada; kata bab dan teks di bawah foto |
| **Strip Penutup** | lebar 100%, 3 foto sama besar `aspect-[4/5]`, celah 4px | Tidak ada |

Utilitas `.home-bleed` (Task 1): `width: 100%; margin-inline: 0;` di luar `.home-container`. Foto full-bleed memakai `sizes="100vw"`.

### S10. Ukuran foto: tidak kecil dan simetris

| Aturan | Nilai |
| --- | --- |
| Lebar minimum foto (selain avatar bulat) | ≥ 1024px: **≥ 280px**; 640–1023: ≥ 220px; < 640: selebar kolom (≥ 160px bila 2 kolom) |
| Satu baris = satu ukuran | Semua foto dalam satu deret punya lebar **dan** rasio yang sama (strip Penutup, foto Cara belajar, potret Trainer, thumbnail Jadwal) |
| Bento simetris | Pola dibelah tengah: kiri dan kanan setara. Maksimal **4 petak**, sisanya lewat "Lihat semua dokumentasi". Lihat tabel di bawah |
| Avatar bulat | Hanya deret indeks Trainer, 48px, satu-satunya foto di bawah batas minimum |
| Foto tidak boleh menyusut | Pakai `object-cover` di wadah berasio tetap; jangan `w-auto` / `h-auto` pada foto di grid |

**Pola bento baru** (menggantikan tabel Editorial bersih §5; desktop 4 kolom `auto-rows-[13rem]`, ponsel 2 kolom `auto-rows-[10rem]`):

| Media | Petak tampil | Desktop | Ponsel |
| --- | --- | --- | --- |
| 1 | 1 | A 4×2 | A 2×2 |
| 2 | 2 | A 2×2 · B 2×2 | A 2×1 · B 2×1 |
| 3 | 3 | A 2×2 · B 2×1 · C 2×1 | A 2×1 · B 1×1 · C 1×1 |
| ≥ 4 | 4 | A 2×1 · B 2×1 · C 2×1 · D 2×1 (empat kuadran sama besar) | A–D 1×1 |

Video tetap di petak B. Sisa media (`rest`) dibuka lewat tombol "Lihat semua dokumentasi".

### S11. Copywriting yang lebih padat

Naskah Konten Home tetap sumber tunggal. Rencana ini **menambah naskah mikro** di slot yang sekarang kosong, supaya tiap petak dan foto punya konteks singkat. Semua baris di bawah adalah **usulan**: pemilik menyetujuinya, lalu baris disalin ke Konten Home (Task 10) sebelum dipakai di kode.

Aturan suara (Konten Home §1.2): sapaan **kamu**; kalimat ≤ 12 kata untuk naskah mikro; kata kerja latihan; tanpa janji hasil; tanpa angka karangan. Label ≤ 24 karakter, caption ≤ 60 karakter.

| Slot | Usulan naskah |
| --- | --- |
| Hero — label statistik 01 | **Program Public Training dibuka** |
| Hero — label statistik 02 | **Sesi pertama batch terdekat** |
| Hero — petak foto kecil | **Kelas berikutnya** · {program} · {batch} |
| Program — label statistik | **jalur latihan Public Training** |
| Program — deskripsi samping (kanan kepala) | **Pilih jalur sesuai situasi bicaramu. Setiap jalur dilatih lewat praktik, bukan hafalan.** |
| Program — label petak batch 1 / 2 / 3 | **Jadwal** / **Biaya** / **Langkah berikutnya** |
| Program — tanpa media | **Dokumentasi kelas ini tampil setelah batch pertama berjalan.** |
| Bento — tombol sisa | **Lihat semua dokumentasi ({n})** |
| Inhouse — label di bawah foto | **Pelatihan untuk tim, di tempatmu** |
| Inhouse — label Pernah melatih | **Pernah melatih** (sudah ada) |
| Cara belajar — judul petak bar | **Porsi waktu latihan** |
| Cara belajar — caption foto 70 / 20 / 10 | **Praktik di depan peserta lain** / **Masukan langsung dari trainer** / **Kerangka yang merapikan pesan** |
| Legalitas — deskripsi | **Dokumen ini bisa kamu cek sebelum mengajukan pelatihan untuk instansi.** |
| Testimoni — tanpa foto | Monogram inisial, tanpa teks tambahan |
| Trainer — label deret avatar | **Tim trainer** |
| Jadwal — label kolom | **Program** · **Sesi** · **Biaya** |
| Cara daftar — label petak | **Langkah** 01 / 02 / 03 (judul tetap dari §9.1) |
| Penutup — caption strip | Tidak ada (foto saja) |
| Registrasi — lihat S12 | — |

### S12. Halaman registrasi `/register/[program]`

Mengikuti sistem yang sama (S2–S7, S10). Logika form, validasi, langkah, dan pengiriman **tidak berubah**. Ringkasan batch tetap **hanya di langkah 1** (keputusan pemilik sebelumnya).

| Unsur | ≥ 1024px | < 1024px |
| --- | --- | --- |
| Latar halaman | `tone-mist` | `tone-mist` |
| Tata letak | `.home-container`, grid 12: **panel program** `col-span-4` (lengket, `top-8`) + **form** `col-span-8` di `Tile tone="plain"` latar `--tone-bg` canvas, padding 40px | Satu kolom: bar atas (logo + "Langkah n dari 4" + bar progres) → form, padding 20px |
| Panel program | Foto program 4:5 (media pertama dari `readProgramDetail(slug)`; tanpa media → tidak ada foto) → nama program `type-title` → daftar 4 langkah dengan `NumberChip` (langkah aktif: chip sun; selesai: chip `--tone-ink`; berikutnya: garis 1px) | Diganti bar progres di atas form |
| Kepala langkah | `.eyebrow` "Langkah {n} dari 4" → judul langkah `type-display` dikecilkan ke `type-title` | sama |
| Isian | Tinggi 48px, sudut 2px, border 1px `--tone-rule`, fokus border 2px `--tone-accent`; label `type-small` 500 di atas isian (jarak 8px); petunjuk/galat `.eyebrow` normal-case 12px (jarak 6px → 8px); teks isian 16px | sama |
| Jarak | antarisian 24px; antarkelompok 48px; kepala → isian pertama 32px | antarisian 20px; antarkelompok 40px |
| Tombol | Baris bawah: **Kembali** (outline tone) kiri, **Lanjut** / **Kirim pendaftaran** `button-primary` kanan, garis atas 1px, jarak atas 48px | Baris bawah **lengket** di dasar layar (`sticky bottom-0`), latar `--tone-bg`, garis atas 1px, padding 12px 16px |
| Ringkasan batch (langkah 1) | `Tile tone="tile"`: grid 2 kolom (Jadwal · Tempat), harga `type-title` + coret | 1 kolom |

Naskah mikro baru di registrasi (usulan, perlu persetujuan seperti S11):

| Slot | Usulan |
| --- | --- |
| Panel program — label | **Kamu mendaftar untuk** |
| Bar progres ponsel | **Langkah {n} dari 4 · {nama langkah}** |
| Tombol akhir | **Kirim pendaftaran** (cek naskah §11 Konten Home; bila sudah ada label lain, pakai yang ada) |

## Global Constraints

- Jarak hanya dari S2; kontainer/grid/ritme dari S3; huruf dari S4; rasio foto dari S6. **Tanpa nilai arbitrer** `p-[…]`, `m-[…]`, `gap-[…]`, `text-[…]` di `components/home/*`. Kecuali: `aspect-[…]` dari S6 dan warna `[var(--tone-*)]`.
- Warna hanya `var(--tone-*)` atau token `@theme`; tanpa hex di `className`.
- Sudut 0–2px; `rounded-full` hanya untuk foto bulat (A6).
- Satu tombol utama per seksi. Naskah disalin apa adanya dari Konten Home. Data contoh hanya di `lib/home-dummy.ts` dan berlabel.
- Gerak hanya G1–G8, hanya `transform`/`opacity`; reduced motion → fade 150 ms.
- Tidak ada statistik tanpa sumber (A3).
- Foto full-bleed hanya di tiga tempat S9; ukuran foto mengikuti S10.
- Naskah mikro S11/S12 dipakai **hanya setelah** pemilik menyetujuinya dan baris itu masuk Konten Home (Task 10). Sebelum itu, slot memakai naskah yang sudah ada atau dibiarkan kosong.
- Halaman registrasi: logika, validasi, dan langkah form tidak diubah (S12).

## Review Focus

1. **Grid Fitness pecah di 768–1023px** (8 kolom): petak yang di desktop 4 kolom bisa menjadi sempit. Task 4–5 menguji pada lebar 768px.
2. **Chip sun di mode gelap** terlihat seperti tombol. Tes kontras Task 1, dan Task 10 memeriksa visual dua tema.
3. **Bingkai `AccentFrame` patah di dua baris** pada ponsel. Pakai `box-decoration-break: clone`, diperiksa di 360px pada Task 10.
4. **Foto bulat tanpa wajah di tengah** (crop memotong kepala). Pakai `object-position: center 30%` untuk potret, diperiksa di Task 8.
5. **Nilai arbitrer menyusup kembali.** Gerbang grep di Task 10 menolak `p-[`, `m-[`, `gap-[`, `text-[` selain warna dan aspek.

---

## Struktur berkas

| Berkas | Aksi | Tanggung jawab |
| --- | --- | --- |
| `front/app/globals.css` | Modify | Token S2–S5, utilitas S3, kelas `type-*` S4, hapus `tone-sand` dan `.accent-serif`, tambah `.accent-frame` |
| `front/lib/tones.test.mjs` | Modify | 3 nada + `--tone-sun`/`--tone-on-sun` |
| `front/lib/home-layout.test.mjs` | Create | Gerbang grep nilai arbitrer + rounded + Playfair |
| `front/components/home/ui/{number-chip,more-link,stat-tile,tile,accent-frame}.tsx` | Create | Komponen dasar S7 |
| `front/components/home/section-intro.tsx` | Modify | Kepala seksi Fitness |
| `front/components/home/*.tsx` (seksi) | Modify | Susun ulang per S8 |
| `front/lib/motion/scroll.ts` | Modify | G2 untuk `.accent-frame` |
| `front/lib/bento.ts`, `front/lib/bento.test.mjs` | Modify | Pola bento simetris S10 |
| `front/components/register/*.tsx`, `front/components/ui/field.tsx`, `front/app/(web)/register/[program]/page.tsx` | Modify | Halaman registrasi S12 |
| `docs/albana-docs/design/academy-design-system.md`, `docs/albana-docs/content/home-page-content.md` | Modify | Dokumentasi |

---

### Task 1: Token tata letak, huruf, dan nada

**Files:**
- Modify: `front/app/globals.css`
- Modify: `front/lib/tones.test.mjs`

**Interfaces:**
- Produces: kelas `.home-container`, `.home-grid`, `.home-section`, `.home-stack-head`, `.home-stack-block`; `type-mega|display|title|lead|body|small|micro`; nada `tone-canvas|tone-mist|tone-night` dengan `--tone-sun`, `--tone-on-sun`; `.accent-frame`.

- [x] **Step 1: Ubah tes** `tones.test.mjs`. Daftar nada menjadi `["canvas","mist","night"]`; tiap nada × 2 mode wajib punya 8 variabel (`bg, ink, muted, rule, accent, tile, sun, on-sun`). Tambah `test("teks di atas sun terbaca")`: kontras `on-sun/sun` ≥ 4.5. Tambah `test("tone-sand sudah dihapus")`: `globals.css` tidak memuat `.tone-sand`.
- [x] **Step 2:** `node --test lib/tones.test.mjs` → **FAIL**.
- [x] **Step 3: CSS.** Tambah variabel S5 ke tiga nada (terang dan gelap); hapus blok `.tone-sand` dan `.dark .tone-sand`. Tulis ulang nilai `type-*` sesuai S4 dan tambah `type-body`, `type-small`, `type-micro`. Tambah utilitas S3 dengan media query `640px` dan `1024px`:

```css
.home-container { margin-inline: auto; width: 100%; max-width: 80rem; padding-inline: 1rem; }
@media (min-width: 640px) { .home-container { padding-inline: 1.5rem; } }
@media (min-width: 1024px) { .home-container { padding-inline: 2.5rem; } }
/* .home-grid: 4/8/12 kolom, column-gap 1rem/1.5rem/1.5rem; .home-section: padding-block 4/6/8rem;
   .home-stack-head > * + * margin-top 2/2.5/3rem; .home-stack-block > * + * margin-top 3/4/4rem */
```

  Ganti `.accent-serif` dengan `.accent-frame`: `font-style: normal; padding-inline: .15em; box-decoration-break: clone; position: relative;`. Bingkai 1px memakai `::after { inset: 0; border: 1px solid currentColor; transform-origin: left; }`, dan aturan `html.motion-ready` memberi `scaleX(0)` sampai `.is-drawn` (pola yang sama dengan aksen lama).
- [x] **Step 4:** `node --test lib/tones.test.mjs` → **PASS**.
- [ ] **Step 5:** Commit `style(web): token jarak, grid, huruf, dan aksen sun beranda (fitness-1)`.

### Task 2: Komponen dasar

**Files:**
- Create: `front/components/home/ui/number-chip.tsx`, `more-link.tsx`, `stat-tile.tsx`, `tile.tsx`, `accent-frame.tsx`

**Interfaces:**
- Consumes: kelas Task 1.
- Produces: signature persis seperti tabel S7. `NumberChip` merender `String(n).padStart(2, "0")`. `MoreLink` memakai `next/link`. `AccentFrame` merender `<em className="accent-frame">`.

- [x] **Step 1:** Tulis kelima komponen. Masing-masing ≤ 30 baris dan tanpa state.
- [x] **Step 2:** `npx tsc --noEmit` dan eslint pada folder `components/home/ui`.
- [ ] **Step 3:** Commit `feat(web): komponen dasar beranda Fitness (fitness-2)`.

### Task 3: Kepala seksi + gerbang kerapian

**Files:**
- Modify: `front/components/home/section-intro.tsx` dan semua pemanggilnya
- Create: `front/lib/home-layout.test.mjs`
- Modify: `front/lib/motion/scroll.ts` (selector `.accent-serif` → `.accent-frame`)

**Interfaces:**
- Produces: `SectionIntro` dengan props `{ eyebrow: string; title: ReactNode; titleId: string; description?: string; stats?: { value: string; label: string }[]; action?: { href: string; label: string } }`.

- [x] **Step 1: Tulis tes gerbang** `lib/home-layout.test.mjs`. Tes membaca semua `components/home/**/*.tsx` yang dirender dari `home-page.tsx` (daftar berkas ditulis eksplisit di tes), lalu memeriksa:
  - `test("tanpa jarak arbitrer")`: regex `/\b(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y)-\[/` tidak cocok.
  - `test("tanpa ukuran huruf arbitrer")`: `/\btext-\[(?!var\()/` tidak cocok.
  - `test("sudut sesuai aturan")`: `/rounded-(sm|md|lg|xl|2xl|3xl)/` tidak cocok; `rounded-full` hanya muncul pada baris yang juga memuat `aspect-square`.
  - `test("tanpa Playfair dan aksen serif")`: `accent-serif` dan `font-serif` tidak muncul.
- [x] **Step 2:** `node --test lib/home-layout.test.mjs` → **FAIL** (masih banyak pelanggaran). Catat jumlah pelanggaran per berkas di laporan; Task 4–9 menurunkannya ke nol.
- [x] **Step 3: `SectionIntro` gaya Fitness** (lihat acuan Fitness, blok "Social Fitness Challenges"):
  - ≥1024: grid 12. Kiri `col-span-6`: `.eyebrow` → H2 `type-display`. Tengah `col-span-2`: `stats` sebagai `StatTile` bertumpuk. Kanan `col-span-4 self-end`: `description` `type-small` muted (maks 36ch) → `action` sebagai `MoreLink`.
  - 640–1023: judul `col-span-8`, lalu statistik dan deskripsi berdampingan masing-masing `col-span-4`.
  - <640: bertumpuk, jarak S3 "kepala → isi".
  - Frasa naskah ▓…▓ dibungkus `<AccentFrame>`.
- [x] **Step 4:** Ganti semua `<em className="accent-serif">` menjadi `<AccentFrame>`; `scroll.ts` memakai `.accent-frame`.
- [ ] **Step 5:** `npx tsc --noEmit`, lalu commit `style(web): kepala seksi Fitness dan gerbang kerapian (fitness-3)`. Tes gerbang **boleh masih merah** di commit ini.

### Task 4: Hero + pita manfaat

**Files:** Modify `hero-section.tsx`, `benefit-band.tsx`

Acuan: Fitness, bagian atas (banner foto → baris judul/statistik/petak foto).

- [x] **Step 1: Hero full-bleed (S9).** `<section>` tanpa `.home-container`; foto `hero.photo` `fill` di wadah `.home-bleed relative min-h-svh max-sm:min-h-[88svh]`, tanpa sudut, `sizes="100vw"`, `preload`. Header situs transparan di atas hero sampai pengunjung menggulir melewati titik tengahnya (perilaku header §3.1 tetap). Lapisan gelap dari bawah: `0.88 0%` → `0.60 55%` → `transparent 90%` (pakai nilai yang sudah lolos kontras di Editorial bersih).
- [x] **Step 2: Isi di atas foto** (kiri bawah, di dalam `.home-container` yang diposisikan `absolute inset-x-0 bottom-0`, padding bawah 48px ponsel / 96px desktop): baris fokus `.eyebrow` putih **Presentasi · Diskusi · MC** → H1 logo putih (lebar `clamp(14rem, 26vw, 22rem)`) → lead `type-lead` putih (maks 36em) → baris tombol: **Lihat jadwal** (putih, teks `--color-accent-strong`, sudut 2px) + tautan WhatsApp sebagai `MoreLink` putih.
- [x] **Step 2b: Baris statistik** di bawah hero (nada canvas, `.home-container`, padding vertikal 32px/48px), `.home-grid`:
  Tiga zona sama lebar agar simetris (S10): `col-span-4 sm:col-span-8 lg:col-span-4` masing-masing.
  - Zona 1: `StatTile n=1` = `{openPrograms} program`, label S11 "Program Public Training dibuka".
  - Zona 2: `StatTile n=2` = `firstDateLabel`, label S11 "Sesi pertama batch terdekat". Tanpa batch, nilai diganti teks naskah "Jadwal kelas berikutnya belum tersedia."
  - Zona 3: `Tile tone="tile"` berisi foto `moments[10]` 4:3 (lebar ≥ 280px di desktop sesuai S10) (indeks 0–5 dipakai Cara belajar dan Penutup, 6–9 cadangan thumbnail Jadwal), di bawahnya `type-small` "{programTitle} · {batchName}" + `MoreLink` "Lihat jadwal" ke `#jadwal`.
- [x] **Step 3: Pita manfaat:** `.home-grid`, 4 sel (`col-span-4 sm:col-span-4 lg:col-span-3`), tiap sel: `NumberChip` → teks naskah `type-small`, garis kiri 1px `--tone-rule` mulai sel ke-2 (≥1024). Padding vertikal 24px, garis atas dan bawah 1px.
- [ ] **Step 4:** Hapus strip fakta lama di `benefit-band.tsx` (pindah ke baris statistik Step 2b). `npx tsc --noEmit`, lalu commit `style(web): hero Fitness dengan statistik dan petak foto (fitness-4)`.

### Task 5: Babak Program

**Files:** Modify `program-chapter.tsx`, `program-story-section.tsx`, `bento-gallery.tsx`

Acuan: Fitness, bagian "CHALLENGE FEATURES" (foto besar kiri + teks + 3 petak).

- [x] **Step 1: Kepala babak:** `SectionIntro` dengan naskah §4.1, `stats` = `[{value: "03", label: "program Public Training"}]`, `action` ke `#jadwal`. Di bawahnya kata bab **Public Training** `type-mega` (`data-motion="chapter"`).
- [x] **Step 2: Seksi program** (dipisah garis atas 1px, padding vertikal 64px/96px):
  - Baris kepala `.home-grid`: kiri `col-span-12 lg:col-span-5`: `NumberChip n={index+1}` → nama `type-title` → "untuk siapa" `type-body` muted → daftar 3 fokus bernomor `type-small` dengan garis 1px antarbaris. Kanan `col-span-12 lg:col-span-7`: bento (`bentoLayout` tetap).
  - Sisi bergantian dipertahankan (≥1024).
  - **Baris batch** di bawah bento, tetap di kolom kanan: grid 3 petak `gap-2` (ponsel 1 kolom, ≥640 3 kolom):
    1. `Tile tone="tile"`: `.eyebrow` "Jadwal" → tanggal sesi `type-small` → nama batch muted.
    2. `Tile tone="sun"`: status (mis. "Pendaftaran dibuka") `type-small` 600 → harga `type-title tabular-nums` → harga coret `type-small`.
    3. `Tile tone="plain"` bergaris 1px: **Daftar** `button-primary` (bila `registrationUrl`), `MoreLink` "Selengkapnya", dan catatan paket.
  - Tanpa batch: petak 1–2 diganti satu `Tile tone="tile"` "Jadwal menyusul".
- [x] **Step 3a: Tes bento simetris dulu.** Ubah `lib/bento.test.mjs` sesuai tabel bento S10:
  - `tiles.length` = `min(n, 4)`;
  - jumlah sel desktop = 8 untuk n ≥ 1;
  - **simetri**: untuk n ≥ 2, total sel di kolom 1–2 sama dengan di kolom 3–4 (hitung dari urutan penempatan grid);
  - video di indeks 1;
  - `rest = n − tiles.length`.
  Jalankan → **FAIL**.
- [x] **Step 3b:** Ubah tabel konstan di `lib/bento.ts` ke pola S10 dan `auto-rows` di `bento-gallery.tsx` ke `13rem`/`10rem`. Tes → **PASS**. Periksa `lib/home-dummy.test.mjs` masih lulus.
- [x] **Step 3c: Bento:** celah 4px, sudut 2px pada wadah luar saja; tombol "Lihat semua dokumentasi ({n})" menjadi `<button>` bergaya `MoreLink`.
- [x] **Step 4: Uji 768px** (Review Focus 1): baris batch 3 kolom tidak lebih sempit dari 200px per petak. Bila lebih sempit, baris batch memakai 1 kolom di bawah 1024.
- [ ] **Step 5:** commit `style(web): babak Program grid Fitness dengan petak batch (fitness-5)`.

### Task 6: Inhouse + Pernah melatih

**Files:** Modify `inhouse-training-section.tsx`

- [x] **Step 1:** Nada night. Pembuka: foto `inhouse.media[0]` **full-bleed** sesuai S9 (`.home-bleed`, rasio per lebar, `sizes="100vw"`, tanpa teks di atasnya). Di bawah foto, `.home-container` dengan padding atas 48px/64px: kata bab **Inhouse Training** `type-mega`, lalu `.home-grid`: kiri `col-span-12 lg:col-span-5` label S11 "Pelatihan untuk tim, di tempatmu" `.eyebrow` + teks naskah `type-lead`; kanan `col-span-12 lg:col-span-7 self-end`: **Konsultasi via WhatsApp** (putih, teks `--color-accent-strong`, sudut 2px) + `MoreLink` "Selengkapnya".
- [x] **Step 2:** Bento dokumentasi memakai media sisa (`media.slice(1)`), jarak atas 48px.
- [x] **Step 3: Pernah melatih:** `.eyebrow` → grid `grid-cols-3 sm:grid-cols-4 lg:grid-cols-6`, `gap-px` di atas latar `--tone-rule`, sel `h-24` (96px) `--tone-tile`, logo `max-h-10` (40px) `object-contain`.
- [ ] **Step 4:** commit `style(web): Inhouse foto besar dan grid logo (fitness-6)`.

### Task 7: Tentang + Cara belajar + Legalitas

**Files:** Modify `about-section.tsx`, `learning-method-chapter.tsx`, `legality-section.tsx`

Acuan: Fitness, petak "Evaluate your goals" (bar) dan "Track health metrics".

- [x] **Step 1: Tentang** (nada mist, menggantikan sand): `SectionIntro`. `.home-grid`: potret Alan `col-span-12 lg:col-span-5` `aspect-[4/5]` (`object-position: center 30%`); kanan `lg:col-span-7`: visi/misi `type-body`, lalu `Tile tone="tile"` kartu Alan (nama `type-title`, peran `.eyebrow`, 3 poin `type-small` bergaris).
- [x] **Step 2: Cara belajar** (mist, langsung lanjut tanpa padding atas ganda; gunakan `pt-0`):
  - Satu `Tile tone="tile"` lebar `lg:col-span-5`: judul petak "Porsi latihan" `.eyebrow`, lalu **3 bar vertikal** setinggi 160px (lebar 40px, celah 24px). Isi bar `--tone-sun` setinggi 70/20/10%, ditambah angka `type-title` (G7) dan label `type-small` di bawah tiap bar. Gerak G5 (`scaleY`, origin bawah).
  - Kanan `lg:col-span-7`: 3 baris `.home-grid` dalam (judul `type-title` + isi `type-small`), masing-masing berpasangan dengan foto `moments[i]` `aspect-[4/3]` lebar 40% dan caption `type-small`.
  - Kerangka 4 tingkat dan bidang pelatihan: chip topik ala Cereen (`.eyebrow`, border 1px, padding 4px 8px, sudut 2px, celah 8px).
- [x] **Step 3: Legalitas** (canvas): `SectionIntro` + daftar bergaris yang ada, kolom `type-small`, nomor dokumen `tabular-nums`. Hanya jarak dari S2.
- [ ] **Step 4:** commit `style(web): Tentang, Cara belajar bar, dan Legalitas mengikuti grid (fitness-7)`.

### Task 8: Testimoni + Trainer (unsur Cereen)

**Files:** Modify `testimonial-chapter.tsx`, `trainer-section.tsx`, `trainer-gallery.tsx`

Acuan: Cereen (potret besar, wajah).

- [x] **Step 1: Testimoni** (canvas): `.home-grid`. Kiri `lg:col-span-5`: potret 4:5 bila `photo_url` nyata ada, atau **monogram** inisial `type-mega` di `Tile tone="tile"` 4:5 bila tidak. Kanan `lg:col-span-7`: kutipan unggulan `type-display` (tanda kutip `“` `--tone-accent`), nama `type-title`, peran `.eyebrow`. Dua kutipan pendukung di bawah, 2 kolom, `type-body`, garis atas 1px.
- [x] **Step 2: Trainer** (canvas): `SectionIntro` → grid `grid-cols-2 lg:grid-cols-4 gap-2`. Kartu: potret `aspect-[4/5]` (`center 30%`) → nama `type-title` → peran `type-small` muted → `MoreLink` "Lihat profil". Di atas grid: deret avatar bulat 48px (`aspect-square rounded-full`) bertumpuk −8px, berfungsi sebagai indeks trainer (A6).
- [x] **Step 3:** Dialog profil trainer: nada canvas, foto 4:5 kiri (≥640), isi kanan, padding 24px.
- [ ] **Step 4:** commit `style(web): Testimoni dan Trainer berpotret besar (fitness-8)`.

### Task 9: Jadwal + Cara daftar + Penutup

**Files:** Modify `schedule-section.tsx`, `registration-steps-section.tsx`, `closing-section.tsx`

- [x] **Step 1: Jadwal** (mist): tiap program satu baris `Tile tone="tile"`, grid ≥1024 `[16rem_1fr_14rem]`: thumbnail 16:9 · (nama program `type-title`, batch, sesi `type-small` tabular) · (status chip `NumberChip`-style sun, harga `type-title`, DP `type-small`, **Daftar kelas ini** `button-primary`). <1024: bertumpuk. Celah antarbaris 8px.
- [x] **Step 2: Cara daftar** (canvas): 3 `Tile tone="tile"` (`lg:grid-cols-3 gap-2`): `NumberChip` → judul `type-title` → isi `type-small`; garis penghubung G5 tetap. Dua jalur: 2 petak, kiri `Tile tone="tile"`, kanan `Tile tone="night"`; satu CTA per petak.
- [x] **Step 3: Penutup** (night): strip 3 foto `moments[3..5]` **full-bleed** (S9: `.home-bleed grid grid-cols-3 gap-1`, tiap foto `aspect-[4/5]`, `sizes="34vw"`; di < 640 tetap 3 kolom agar simetris) → `.home-container`: H2 `type-display` → **Lihat jadwal** (putih) → kontak 4 kolom `type-small`.
- [x] **Step 4:** `node --test lib/home-layout.test.mjs` → **PASS**. Bila masih merah, perbaiki pelanggaran yang tersisa di berkas mana pun dalam daftar tes.
- [ ] **Step 5:** commit `style(web): Jadwal, Cara daftar, dan Penutup mengikuti grid (fitness-9)`.

### Task 10: Copywriting padat (S11)

**Files:** Modify `docs/albana-docs/content/home-page-content.md`, lalu komponen yang memakai slot S11

Task ini berjalan **sebelum** naskah mikro dipakai di kode. Task 4–9 membiarkan slot S11 memakai naskah lama atau kosong.

- [ ] **Step 1: Minta persetujuan.** Kirim tabel S11 dan S12 (naskah mikro) ke pemilik. Catat setiap baris sebagai disetujui, diubah (dengan teks baru), atau ditolak. **Jangan lanjut ke Step 2 tanpa jawaban.**
- [ ] **Step 2:** Tulis baris yang disetujui ke Konten Home, di bawah seksi masing-masing, dengan blok **Naskah** seperti format dokumen itu.
- [ ] **Step 3:** Pasang naskah di komponen. Setiap teks disalin persis; slot yang ditolak tetap kosong.
- [ ] **Step 4: Cek panjang:** label ≤ 24 karakter, caption ≤ 60, kalimat mikro ≤ 12 kata. Tulis hasilnya di laporan.
- [ ] **Step 5:** commit `copy(web): naskah mikro beranda dan registrasi (fitness-10)`.

### Task 11: Halaman registrasi (S12)

**Files:**
- Modify: `front/components/register/register-page.tsx`, `registration-choice.tsx`, `registration-form.tsx`, `registration-overview.tsx`, `registration-steps.tsx`
- Modify: `front/components/ui/field.tsx` (hanya dipakai `registration-steps.tsx`; cek ulang dengan `grep -rn "components/ui/field" front/app front/components` sebelum mengubah)
- Modify: `front/app/(web)/register/[program]/page.tsx` (bila perlu meneruskan media program)
- Modify: `front/lib/home-layout.test.mjs` (tambah berkas `components/register/*` ke gerbang)

**Interfaces:**
- Consumes: `NumberChip`, `Tile` (Task 2), kelas Task 1, `readProgramDetail(slug)` dari `@/lib/server/program-showcase` untuk foto panel (ambil `media.find(m => m.kind === "image")`).
- Produces: `RegisterPage({ selection, programPhoto? })`, dengan `programPhoto?: { src: string; alt: string } | null`.

- [x] **Step 1: Gerbang dulu.** Tambahkan berkas `components/register/*.tsx` dan `components/ui/field.tsx` ke daftar `home-layout.test.mjs`, jalankan → **FAIL** (catat jumlah pelanggaran).
- [x] **Step 2: Data foto.** Di `page.tsx`, saat `selection.status === "ready"` atau `"program"`, baca `readProgramDetail(slug)` dalam `try/catch`; gagal atau tanpa foto → `programPhoto = null`. Tidak ada foto contoh di halaman registrasi.
- [x] **Step 3: Tata letak S12.** `tone-mist` di `<main>`; `.home-container` padding vertikal 32px/64px. ≥1024: grid 12 dengan panel program `col-span-4 lg:sticky lg:top-8 self-start` dan form `col-span-8`. Status `program`/`loading`/`failed`/`missing` tetap satu kolom penuh tanpa panel.
- [x] **Step 4: Panel program.** Foto 4:5 (bila ada) → label S11 "Kamu mendaftar untuk" `.eyebrow` → nama program `type-title` → daftar 4 langkah (`NumberChip` + nama langkah `type-small`), status aktif/selesai/berikutnya sesuai S12. Langkah aktif diteruskan dari state form: angkat `step` dari `RegistrationForm` lewat callback `onStepChange(step: number)` ke `RegistrationChoice`, yang meneruskannya ke panel. Logika langkah tidak diubah.
- [x] **Step 5: Bar progres ponsel** (< 1024): logo → "Langkah {n} dari 4 · {nama}" `.eyebrow` → bar 4px `--tone-sun` di atas `--tone-rule`. Bar lama (`h-1 bg-rule` di `registration-form.tsx`) diganti, bukan diduplikasi.
- [x] **Step 6: Isian (`field.tsx`).** Tinggi 48px, sudut 2px, border 1px `--tone-rule`, fokus border 2px `--tone-accent` (tanpa ring biru bawaan), label `type-small` 500, jarak label → isian 8px, petunjuk/galat 12px dengan jarak 8px. Teks isian 16px (mencegah zoom iOS). Radio: kotak opsi 48px tinggi dengan border 1px, opsi terpilih border 2px `--tone-accent`.
- [x] **Step 7: Jarak form** sesuai S12 (antarisian 24/20px, antarkelompok 48/40px). Baris tombol: ≥1024 di akhir form, garis atas 1px; < 1024 `sticky bottom-0` dengan latar `--tone-bg`, padding 12px 16px, `padding-bottom: max(12px, env(safe-area-inset-bottom))`.
- [x] **Step 8: Ringkasan batch langkah 1** (`registration-overview.tsx`): `Tile tone="tile"`, grid 2 kolom ≥640, harga `type-title` tabular + harga coret `type-small`. Tetap dirender hanya `step === 0`.
- [x] **Step 9: Cek perilaku tidak berubah.**
  - `node --test lib/registration.test.mjs lib/registration-form.test.mjs lib/registration-input.test.mjs lib/registration-feedback.test.mjs lib/bundle.test.mjs` → PASS.
  - Di peramban: isi langkah 1→4 pada `/register/public-speaking-for-speakers`; validasi galat tampil di bawah isian, fokus pindah ke judul langkah, tombol Kembali mengembalikan ringkasan di langkah 1. Jangan kirim pendaftaran asli kecuali di data dev.
- [x] **Step 10:** `node --test lib/home-layout.test.mjs` → PASS; `npx tsc --noEmit`; commit `style(register): halaman registrasi mengikuti sistem Fitness (fitness-11)`.

### Task 12: Dokumen + verifikasi

**Files:** Modify `docs/albana-docs/design/academy-design-system.md`, `docs/albana-docs/content/home-page-content.md`

- [ ] **Step 1: Dokumen:**
  - Design system: tabel S2–S7 menggantikan bagian Editorial bersih; hapus `tone-sand` dan aksen serif.
  - Konten Home §1.3: G2 menjadi "bingkai frasa"; §3.1 hero Fitness; §4.1 baris 3 petak batch; §5.2 petak bar; §6.1 dan §7 potret.
- [ ] **Step 2: Pemeriksaan otomatis:** `node --test lib/tones.test.mjs lib/home-layout.test.mjs lib/home-dummy.test.mjs lib/bento.test.mjs lib/motion.test.mjs` → semua PASS; `npx tsc --noEmit`; `npm run build`.
- [ ] **Step 3: Peramban** (panel **harus terlihat**; cek `requestAnimationFrame` > 0/detik). Lebar 1440, 1280, 1024, 768, 390, 360 × terang/gelap:
  - [ ] tanpa gulir mendatar;
  - [ ] tepi kiri isi setiap seksi segaris (`getBoundingClientRect().left` sama untuk semua `.home-container` di satu lebar);
  - [ ] padding vertikal seksi = 64/96/128px sesuai lebar (ukur `getComputedStyle`);
  - [ ] chip sun terbaca di dua tema; bingkai `AccentFrame` utuh saat patah baris di 360px;
  - [ ] potret tidak memotong kepala;
  - [ ] kata bab G8 berakhir di skala 1 setelah lompat `/#program`;
  - [ ] hero, pembuka Inhouse, dan strip Penutup benar-benar dari tepi ke tepi (`getBoundingClientRect().width === innerWidth`), tanpa gulir mendatar;
  - [ ] tidak ada foto selain avatar yang lebih sempit dari batas S10 (ukur semua `main img` yang bukan `rounded-full`);
  - [ ] foto dalam satu deret berukuran sama (selisih lebar ≤ 1px);
  - [ ] bento simetris di 1280 dan 390 untuk 1, 2, 3, dan ≥ 4 media;
  - [ ] registrasi: panel lengket di 1280; bar progres dan tombol lengket di 390 tidak menutupi isian yang sedang difokus.
- [ ] **Step 4:** Tangkapan layar beranda dan registrasi di 1280 dan 390 (terang dan gelap) disandingkan dengan dua gambar acuan untuk ditinjau pemilik.
- [ ] **Step 5:** commit `docs: sistem visual Fitness editorial beranda dan registrasi (fitness-12)`.
