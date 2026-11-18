# Beranda "Editorial Bersih" — Rencana Implementasi Visual

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Jalankan perintah dari folder `front/` kecuali disebut lain.

**Goal:** Membuat beranda hasil Fase A terasa bersih dan premium: tipografi yang bercerita lewat kontras ukuran, foto yang lebih banyak, dan variasi warna latar per bab yang bekerja di mode terang dan gelap.

**Architecture:** Lapisan visual di atas [rencana redesign Fase A](./2026-11-17-landing-register-redesign-plan.md). Kontrak data `HomeData`, alur tujuh babak, `bentoLayout`, dan Fase B **tidak berubah**, kecuali satu field baru `moments` (Tugas 5). Ada tiga fondasi baru, dan semua komponen beranda dipindah ke fondasi ini: **nada seksi** (variabel CSS per bab yang berganti di `.dark`), **skala tipografi** (lima ukuran tetap), dan **`SectionIntro` dua nada**.

**Tech Stack:** Next.js 16, React 19, Tailwind 4, GSAP ScrollTrigger + Lenis (`lib/motion/scroll.ts`), `node --test`.

**Spec:** Keputusan pemilik 17 November 2026 di sesi ini (§Spesifikasi di bawah), [Konten Home](../content/home-page-content.md), dan tiga acuan visual: Spintip, ieaEnergy, Panggung Kreator.

---

## Spesifikasi

### Keputusan pemilik

| # | Keputusan |
| --- | --- |
| V1 | Arah gaya **perpaduan** dua sumber. **Struktur dan ruang** mengikuti ieaEnergy/Spintip: judul besar berhadapan paragraf kecil, grid campuran foto dan teks, latar seksi bergeser, whitespace lega. **Tipografi, kepadatan foto, dan bab gelap** mengikuti Panggung Kreator: judul dua nada, nomor besar, foto bercaption di bawahnya, satu frasa serif miring per bab. |
| V2 | **Sudut tajam 0–4px** untuk semua foto, petak, panel, tombol, dan label. Tidak ada `rounded-full`, `rounded-2xl`, atau `rounded-3xl` di beranda. Label pil diganti tag kotak `.eyebrow` yang sudah ada. |
| V3 | **Teks di atas foto hanya di hero**, dengan lapisan gelap yang menjamin kontras ≥ 4.5:1. Di tempat lain caption berada **di bawah** foto. |
| V4 | Warna latar seksi memakai **turunan palet yang ada**: canvas (putih), mist (biru pucat `panel-soft`), sand (`sand`), night (navy). Setiap nada punya pasangan mode gelap. Tidak ada warna merek baru. |
| V5 | Font tetap: **Plus Jakarta Sans** (judul), **Inter** (teks), **Playfair Display** miring sebagai aksen serif. Playfair sudah dimuat di `app/layout.tsx`. |
| V6 | Storytelling lewat **gerak dan tipografi**: kata bab berukuran raksasa, kontras besar–kecil yang tegas, dan gerak judul bab yang terikat gulir. |
| V7 | **Foto diperbanyak**, tetapi halaman tetap clean: foto menggantikan kotak berwarna, bukan menambah kotak baru. |

### Temuan di render Fase A (1024 px, `localhost:3000`, terang)

| # | Masalah | Penyebab di kode |
| --- | --- | --- |
| F1 | Semua H2 berukuran sama (~48 px) dan semua memakai stabilo, sehingga tidak ada yang menonjol. | `section-intro.tsx`: satu ukuran untuk semua H2 |
| F2 | Terasa boxy: daftar materi, kartu legalitas, testimoni, dan panel batch semuanya kotak biru pucat atau navy. | `program-story-section.tsx`, `legality-section.tsx`, `testimonial-chapter.tsx` |
| F3 | Warna berupa hex tertanam (`#10243F`, `#26599A`, `#47607D`, …) beserta varian `dark:` per elemen, di 45 tempat. | `grep -c "#[0-9A-F]{6}"` pada `hero`, `bento`, `program-story`, `inhouse`, `legality`, `benefit-band` |
| F4 | Sudut campur: `rounded-full` (17), `rounded-3xl`, `rounded-2xl`, sementara token `--radius-*` bernilai 0. | `components/home/*` |
| F5 | Hampir semua seksi berlatar putih, sehingga pergantian bab tidak terasa. | — |
| F6 | Foto hanya ramai di babak Program. Tentang, Cara belajar, Legalitas, Testimoni, dan Jadwal hampir semuanya teks. | — |
| F7 | Deret thumbnail kecil di bawah bento terlihat sempit. | `bento-gallery.tsx:30` (`extraTiles`) |
| F8 | Data contoh hanya punya **6 foto**, sehingga pengulangan foto terlihat begitu foto diperbanyak. | `lib/home-dummy.ts:4-9` |

### Peta bab dan nada

Kolom Gerak memakai kode G1–G7 dari [Konten Home §1.3](../content/home-page-content.md#13-kosakata-gerak); G8 adalah gerak baru dari rencana ini.

| Urutan | Seksi | Nada | Foto (baru = **tebal**) | Gerak khas |
| --- | --- | --- | --- | --- |
| 1 | Hero | — (foto penuh) | foto hero layar penuh, teks di atasnya | G1 judul, G4 foto |
| 2 | Pita manfaat + strip fakta | canvas | — | G6 |
| 3 | Pembuka Program + Public Training ×3 | canvas | bento per program | **G8** kata "Public Training" |
| 4 | Inhouse + Pernah melatih | **night** | bento Inhouse | **G8** kata "Inhouse Training" |
| 5 | Tentang + Cara belajar | **sand** | potret Alan + **satu foto per baris 70/20/10** | G5 bilah, G7 angka |
| 6 | Legalitas | canvas | — (dibuat ringkas, tanpa kartu) | G3 |
| 7 | Testimoni | mist | foto peserta **hanya dari `photo_url` nyata** | G1 kutipan |
| 8 | Trainer | canvas | potret trainer | G6 |
| 9 | Jadwal | mist | **thumbnail program per panel** | G3, G6 |
| 10 | Tiga langkah + dua jalur | canvas | — | G5 |
| 11 | Penutup + kontak | **night** | **strip 3 foto di atas ajakan** | G4, G1 |

Nada yang sama tidak boleh berurutan, kecuali canvas di urutan 2→3. Pita manfaat dan pembuka Program bersambung tanpa pemisah karena sama-sama bagian dari "momen → jalan".

### Skala tipografi

Lima ukuran. Ukuran lain di beranda diganti ke salah satunya.

| Token | Nilai | Dipakai untuk |
| --- | --- | --- |
| `--text-mega` | `clamp(3.25rem, 9vw, 8.5rem)`, `line-height: 0.92`, `letter-spacing: -0.055em`, tebal 700 | Kata bab (**Public Training**, **Inhouse Training**), angka 70/20/10 |
| `--text-display` | `clamp(2.25rem, 5vw, 4.25rem)`, `line-height: 1`, `-0.045em`, 600 | H2, judul hero |
| `--text-title` | `clamp(1.5rem, 2.6vw, 2.25rem)`, `line-height: 1.1`, `-0.03em`, 600 | H3 nama program, nama trainer |
| `--text-lead` | `clamp(1.0625rem, 1.3vw, 1.25rem)`, `line-height: 1.55` | lead, paragraf kanan |
| `--text-meta` | `0.75rem`, `letter-spacing: 0.1em`, kapital | `.eyebrow`, caption, label |

Kontras inti dari acuan ieaEnergy: H2 (`display`) di kiri berhadapan paragraf `lead` di kanan, minimal **3:1** ukuran huruf.

### Nada seksi

Kelas `.tone-canvas`, `.tone-mist`, `.tone-sand`, `.tone-night`. Setiap kelas menetapkan enam variabel dan memasang `background: var(--tone-bg); color: var(--tone-ink)`.

| Nada | Mode | `--tone-bg` | `--tone-ink` | `--tone-muted` | `--tone-rule` | `--tone-accent` | `--tone-tile` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| canvas | terang | `#ffffff` | `#15171b` | `#525a66` | `#dde2e9` | `#2f5c86` | `#f3f6f9` |
| canvas | gelap | `#0d1829` | `#f0f5fa` | `#a3b8d0` | `#233856` | `#9cc4ee` | `#132238` |
| mist | terang | `#e6edf4` | `#15171b` | `#4a5563` | `#cbd6e2` | `#24486a` | `#ffffff` |
| mist | gelap | `#132238` | `#f0f5fa` | `#a3b8d0` | `#2a4466` | `#9cc4ee` | `#0d1829` |
| sand | terang | `#efe6d6` | `#1d1a15` | `#5c5243` | `#d9cbb2` | `#24486a` | `#f8f3ea` |
| sand | gelap | `#221d16` | `#f3ece0` | `#c4b79f` | `#3a3125` | `#e6d9c4` | `#2b251c` |
| night | terang | `#10243f` | `#f0f5fa` | `#b5c7db` | `#2a4466` | `#cbd9e7` | `#163052` |
| night | gelap | `#070f1c` | `#f0f5fa` | `#a3b8d0` | `#1c2c44` | `#cbd9e7` | `#0f1d33` |

Nilai di tabel adalah titik awal. Yang mengikat adalah tesnya: `--tone-ink` dan `--tone-muted` di atas `--tone-bg` serta `--tone-tile` harus berkontras **≥ 4.5:1**, dan `--tone-accent` di atas `--tone-bg` **≥ 3:1**. Bila tes gagal, geser nilainya; jangan melonggarkan tesnya.

### Aksen serif dan stabilo

Frasa yang ditandai ▓…▓ di Konten Home **tidak lagi** memakai latar stabilo. Gantinya `<em className="accent-serif">`: Playfair Display miring, tebal 400, warna `--tone-accent`, dan garis bawah 2 px di bawah frasa. Gerak **G2** pindah dari latar ke garis bawah: `scaleX 0→1`, origin kiri, 450 ms, hanya `transform`. **Satu frasa per H2**, sesuai aturan G2.

### Gerak baru G8 — Skala bab

Kata bab ukuran `mega` (urutan 3 dan 4 di peta) bergerak terikat gulir saat seksinya melintas dari `top 90%` ke `top 35%`: `scale 0.86→1`, `opacity 0.2→1`, `x -4%→0`, `scrub: 0.6`. Ini hanya `transform` dan `opacity`, satu lapisan, jadi bukan parallax. Hanya berlaku di ≥ 1024 px. Di ponsel dan saat `prefers-reduced-motion` dipakai G1 biasa.

## Global Constraints

- Hanya token nada (`var(--tone-*)`) atau token yang sudah ada di `@theme`. **Tanpa hex di `className`** di `components/home/*`.
- Sudut 0–4px (V2). Tanpa bayangan besar, tanpa kartu melayang, tanpa gradien dekoratif. Satu-satunya gradien adalah lapisan gelap hero (V3).
- Gerak hanya G1–G8; hanya `transform` dan `opacity`; reduced motion → fade 150 ms (Konten Home §1.3).
- Satu tombol utama per seksi; naskah disalin apa adanya dari Konten Home; data contoh hanya di `lib/home-dummy.ts` dan berlabel (aturan Fase A §0).
- Foto orang di testimoni hanya dari `photo_url` nyata. Data contoh **tidak boleh** memakai wajah sebagai "peserta".

## Review Focus

1. **Mode gelap pada nada sand dan night**: teks redup atau logo partner tak terbaca → tes kontras Tugas 1 + pemeriksaan dua tema di Tugas 9.
2. **Teks hero di atas bagian foto yang terang** (langit, dinding putih) → lapisan gelap harus menjamin kontras di titik paling terang; diukur di Tugas 3 Step 4.
3. **Kata `mega` melebar keluar layar di 360 px** ("Inhouse Training" adalah kata terpanjang) → Tugas 4 Step 5.
4. **G8 tertinggal di posisi `scale 0.86`** setelah lompat anchor atau gulir cepat ke atas → Tugas 7 Step 3.
5. **Foto contoh berulang terlihat sama** setelah foto diperbanyak → kumpulan ≥ 18 foto berbeda (Tugas 5 Step 1) dan tes keunikan.

---

## Tugas

### Task 1: Nada seksi + skala tipografi

**Files:**
- Modify: `front/app/globals.css` (tambah blok `.tone-*`, `.dark .tone-*`, `--text-*`, `.accent-serif`, kelas `.type-mega/.type-display/.type-title/.type-lead`)
- Create: `front/lib/tones.test.mjs`

**Interfaces:**
- Produces: kelas `tone-canvas | tone-mist | tone-sand | tone-night`; variabel `--tone-bg|ink|muted|rule|accent|tile`; kelas `type-mega`, `type-display`, `type-title`, `type-lead`; kelas `accent-serif`. Dipakai semua tugas berikutnya.

- [ ] **Step 1: Tulis tes** `lib/tones.test.mjs`. Tes membaca `app/globals.css` dengan `fs`, mengekstrak tiap blok `.tone-<nama> {` dan `.dark .tone-<nama> {` dengan regex variabel `--tone-(\w+):\s*(#[0-9a-f]{6})`, lalu memeriksa:
  - `test("setiap nada punya enam variabel di terang dan gelap")`: 4 nada × 2 mode × 6 variabel.
  - `test("teks utama dan muted terbaca")`: kontras WCAG `ink/bg`, `muted/bg`, `ink/tile`, `muted/tile` ≥ 4.5.
  - `test("aksen terlihat")`: `accent/bg` ≥ 3.
  - Rumus kontras WCAG 2.x (luminans relatif) ditulis di berkas tes; tidak perlu dependensi.
- [ ] **Step 2:** `node --test lib/tones.test.mjs` → **FAIL** (blok belum ada).
- [ ] **Step 3:** Tambahkan blok CSS sesuai tabel Nada seksi dan Skala tipografi. Letakkan di `@layer` yang sama dengan `.eyebrow` supaya kelas utilitas per elemen tetap bisa menimpanya. `.accent-serif`: `position: relative; font-family: var(--font-serif); font-style: italic; font-weight: 400; color: var(--tone-accent);`. Garis bawahnya `::after` (`position: absolute; inset-inline: 0; bottom: 0.04em; height: 2px; background: currentColor; transform-origin: left;`), sehingga G2 cukup menganimasikan `transform` (Tugas 7).
- [ ] **Step 4:** `node --test lib/tones.test.mjs` → **PASS**. Bila ada kontras yang gagal, geser nilai warnanya, bukan ambang tesnya.
- [ ] **Step 5:** commit `style(web): nada seksi dan skala tipografi beranda (editorial-1)`.

### Task 2: `SectionIntro` dua nada

**Files:**
- Modify: `front/components/home/section-intro.tsx`
- Modify: setiap pemanggil `SectionIntro` di `components/home/` (cari dengan `grep -rn "SectionIntro" components/home`)

**Interfaces:**
- Produces:

```tsx
type SectionIntroProps = {
  eyebrow: string;            // tag kotak, mis. "[ PROGRAM ]"
  title: ReactNode;           // baris pertama, warna --tone-ink; frasa naskah ▓…▓ dibungkus <em className="accent-serif">
  titleMuted?: ReactNode;     // baris kedua opsional, warna --tone-muted (judul dua nada)
  titleId: string;
  description?: string;      // diletakkan di kolom kanan, ukuran type-lead
  layout?: "split" | "stack"; // bawaan "split"
  className?: string;
};
```

- [ ] **Step 1:** `split` (≥1024 px): grid 12 kolom. Eyebrow di baris atas `col-span-12`; judul `type-display` di `col-span-7`; deskripsi di `col-start-9 col-span-4 self-end`, warna `--tone-muted`. Di ponsel bertumpuk. `stack` = satu kolom (dipakai di dalam kolom sempit).
- [ ] **Step 2:** Ganti semua `<mark className="bg-highlight …">` di pemanggil menjadi `<em className="accent-serif">` **pada frasa yang sama** (naskah tidak berubah).
- [ ] **Step 3:** `titleMuted` hanya dipakai bila naskah Konten Home memang punya dua kalimat judul. Jangan menambah kalimat baru.
- [ ] **Step 4:** `npx tsc --noEmit`, lalu commit `style(web): judul seksi dua nada dengan aksen serif (editorial-2)`.

### Task 3: Hero foto penuh

**Files:**
- Modify: `front/components/home/hero-section.tsx`
- Modify: `front/components/home/benefit-band.tsx` (strip fakta pindah ke sini, di bawah hero)

**Interfaces:**
- Consumes: `HomeData["hero"]` tanpa perubahan.

- [ ] **Step 1: Bingkai.** `<section id="beranda">` berisi satu wadah foto `relative min-h-[min(88svh,52rem)] max-lg:min-h-[36rem]` dengan sudut tajam, selebar `Container max-w-7xl` (bukan full-bleed tepi layar, mengikuti Spintip). `hero.photo` sebagai `<Image fill preload sizes="(min-width:1280px) 1280px, 100vw" className="object-cover">` dengan `data-motion="media"`.
- [ ] **Step 2: Lapisan gelap.** `<div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgb(7_15_28/0.88)_0%,rgb(7_15_28/0.55)_45%,transparent_75%)]">`. Teks selalu putih di kedua tema.
- [ ] **Step 3: Isi di kiri bawah** (`absolute inset-x-0 bottom-0 p-6 md:p-12`, maksimal `max-w-[44rem]`): `.eyebrow` putih **Presentasi · Diskusi · MC** → H1 logo **versi putih** (`BrandLogo src="/logo-white.png"`, `role="img" aria-label="Albana Speech Academy"`, lebar `clamp(14rem, 30vw, 24rem)`) → lead naskah §3.1 dengan `type-lead` → tombol utama **Lihat jadwal**: putih dengan teks navy, sudut tajam.
- [ ] **Step 4: Ukur kontras.** Dengan DevTools, ambil warna piksel foto tepat di belakang baris lead (titik paling terang) setelah lapisan, lalu hitung kontras terhadap putih. Harus ≥ 4.5:1 untuk foto hero contoh mana pun dari kumpulan Tugas 5. Gagal → naikkan opasitas 45%.
- [ ] **Step 5: Strip fakta** di bawah foto (nada canvas): tiga kolom dipisah garis vertikal 1 px `--tone-rule` (pola strip Panggung Kreator). Isi = `<dl>` fakta R4 yang sekarang ada di hero. Angka/tanggal `type-title`, label `.eyebrow`. Pita manfaat empat sel tetap di bawahnya, dengan gerak G6.
- [ ] **Step 6:** Tanpa foto → wadah memakai latar nada night dan isi yang sama, sehingga tata letak tidak rusak. Commit `style(web): hero foto penuh dengan strip fakta (editorial-3)`.

### Task 4: Babak Program dan Inhouse

**Files:**
- Modify: `front/components/home/program-chapter.tsx`, `program-story-section.tsx`, `inhouse-training-section.tsx`, `bento-gallery.tsx`

- [ ] **Step 1: Kata bab.** Setelah `SectionIntro` Program, tampilkan **Public Training** sebagai `<h3 className="type-mega" data-motion="chapter">`, dengan "03 program" `.eyebrow` sejajar baris dasar di kanan. Inhouse sama, dengan kata **Inhouse Training**.
- [ ] **Step 2: Seksi program.** Ganti label pil "Program 01" dengan nomor `type-mega` berwarna `--tone-rule` di atas nama (pola 01/02/03 Panggung Kreator). Nama program `type-title`. Daftar materi **tanpa kotak**: daftar bernomor dengan garis 1 px `--tone-rule` antarbaris. Panel batch **tanpa navy**: latar `--tone-tile`, garis atas 2 px `--tone-accent`, harga `type-title` tabular, tombol **Daftar** utama dan **Selengkapnya** sekunder. Urutan isi R6 dan sisi bergantian tetap.
- [ ] **Step 3: Bento.** Hapus deret `extraTiles` (`bento-gallery.tsx:30` dan render-nya). Sisa media hanya dapat dibuka lewat tombol **Lihat semua dokumentasi ({total})** sebagai tautan teks bergaris bawah (sekunder). Petak bersudut tajam dengan celah 4 px (`gap-1`). `bentoLayout` dan tesnya **tidak diubah**.
- [ ] **Step 4: Inhouse nada night.** Seluruh blok `#inhouse-training` memakai `tone-night`. Grid partner: wadah `bg-[var(--tone-rule)] gap-px`, sel `bg-[var(--tone-tile)] h-24`. Logo memakai filter `grayscale` + `opacity-80` dan menjadi berwarna saat hover. Logo yang tidak terbaca di latar gelap mendapat sel `bg-white` (aturan per logo, tidak menyeluruh).
- [ ] **Step 5: Uji 360 px.** "Inhouse Training" dalam `type-mega` tidak boleh meluap: `scrollWidth === innerWidth`. Bila meluap, pecah dua baris dengan `<br className="sm:hidden">` di antara kata, jangan memperkecil token.
- [ ] **Step 6:** Hapus semua hex di empat berkas ini: `grep -nE "#[0-9A-Fa-f]{6}" components/home/{program-chapter,program-story-section,inhouse-training-section,bento-gallery}.tsx` → kosong. Commit `style(web): babak Program editorial dengan kata bab raksasa (editorial-4)`.

### Task 5: Kumpulan foto + field `moments`

**Files:**
- Modify: `front/lib/home-data.ts` (tambah `moments`), `front/lib/home-dummy.ts`, `front/lib/server/home-data.ts`
- Create: `front/lib/home-dummy.test.mjs`
- Modify: `front/next.config.ts` (hanya bila sumber foto contoh di luar `images.unsplash.com`)

**Interfaces:**
- Produces: `HomeData.moments: HomeMedia[]`, yaitu kumpulan foto umum (≥ 6) untuk Cara belajar, thumbnail Jadwal, dan strip Penutup. **Fase B** mengisinya dari `readProgramGalleries()` (semua program, foto saja) + `gallery`, urutan `created_at desc`. Catat ini sebagai satu baris tambahan di Tugas B2 rencana redesign.

- [ ] **Step 1: Kumpulan contoh.** Prasyarat terbaik: pemilik memberi ≥ 18 foto dokumentasi asli lewat admin, sehingga data contoh tidak dibutuhkan untuk bagian ini. Sampai itu ada, `home-dummy.ts` memakai **≥ 18 foto berbeda**: 6 foto lokal `/images/preview/*` + foto berlisensi bebas dari `images.unsplash.com` (sudah ada di `remotePatterns`) bertema kelas, presentasi, panggung, dan diskusi. Setiap foto Unsplash dicatat dengan URL halaman foto dan nama fotografernya dalam komentar satu baris. Semua `alt` berakhiran **"— contoh visual, bukan dokumentasi kelas Albana"**.
- [ ] **Step 2: Tulis tes** `lib/home-dummy.test.mjs`:
  - `test("tidak ada foto berulang dalam satu bento")`: untuk tiap program dan Inhouse, `new Set(media.map(m => m.src)).size === media.length`.
  - `test("hero, bento, dan moments tidak memakai foto yang sama")`: `hero.photo.src` tidak muncul di `moments`; `moments` tidak berbagi `src` dengan bento mana pun.
  - `test("semua foto contoh berlabel")`: setiap `alt` diakhiri penanda di atas.
- [ ] **Step 3:** `node --test lib/home-dummy.test.mjs` → **FAIL**. Isi data sampai **PASS**.
- [ ] **Step 4:** `npx tsc --noEmit`, commit `feat(web): kumpulan foto beranda dan field moments (editorial-5)`.

### Task 6: Foto di bab yang sekarang hanya teks

**Files:**
- Modify: `front/components/home/learning-method-chapter.tsx`, `about-section.tsx`, `legality-section.tsx`, `testimonial-chapter.tsx`, `schedule-section.tsx`, `closing-section.tsx`, `home-page.tsx`

**Interfaces:**
- Consumes: `HomeData.moments` (Tugas 5); `HomeData.programs` untuk thumbnail jadwal. `home-page.tsx` meneruskan `moments` ke komponen yang membutuhkan.

- [ ] **Step 1: Tentang + Cara belajar** dalam satu blok `tone-sand`. Tiga baris 70/20/10: angka `type-mega` (G7), judul, isi, bilah G5, dan **satu foto 4:3** dari `moments[0..2]` di kolom kanan tiap baris dengan caption `.eyebrow` di bawahnya (`moments[i].alt` tanpa penanda dummy di mode nyata). Di ponsel foto di bawah teks. Potret Alan tetap; kartu Alan berlatar `--tone-tile`, bukan navy.
- [ ] **Step 2: Legalitas ringkas** (`tone-canvas`): empat kartu diganti **tabel dua kolom** bergaris 1 px (nama dokumen · nomor · penerbit). Tanpa ikon dalam kotak.
- [ ] **Step 3: Testimoni** (`tone-mist`): kutipan unggulan `type-display` dengan tanda kutip serif, dua pendukung tanpa kotak, dipisah garis. Foto **hanya** bila `photo_url` nyata ada; data contoh tidak berfoto.
- [ ] **Step 4: Jadwal** (`tone-mist`): tiap panel program diberi thumbnail 16:9 (media foto pertama program itu dari `programs`, fallback `moments`) di sisi kiri pada ≥ 1024 px, di atas pada ponsel. Panel berlatar `--tone-tile`, sudut tajam.
- [ ] **Step 5: Penutup** (`tone-night`): strip 3 foto (`moments[3..5]`) rasio 4:5, celah 4 px, di atas ajakan, dengan gerak G4 berurutan. Teks ajakan tetap di luar foto.
- [ ] **Step 6:** `grep -nE "#[0-9A-Fa-f]{6}|rounded-(full|xl|2xl|3xl)" components/home/*.tsx` → kosong. Commit `style(web): foto di Cara belajar, Jadwal, dan Penutup; bab teks diringkas (editorial-6)`.

### Task 7: Gerak G8 dan G2 baru

**Files:**
- Modify: `front/lib/motion/scroll.ts`
- Modify: `front/lib/motion.test.mjs` (bila fungsi murni ditambah)

- [ ] **Step 1: G8.** Di `setup()`, elemen `[data-motion="chapter"]` mendapat `ScrollTrigger` dengan `scrub: 0.6`, `start: "top 90%"`, `end: "top 35%"`, animasi `fromTo({ scale: 0.86, opacity: 0.2, xPercent: -4 }, { scale: 1, opacity: 1, xPercent: 0, ease: "none" })`, `transformOrigin: "left bottom"`. Hanya bila `!reduced && innerWidth >= 1024`. Selain itu elemen diperlakukan sebagai `heading` (G1).
- [ ] **Step 2: G2.** `.accent-serif::after` mulai `scaleX(0)`, lalu ScrollTrigger yang sama dengan H2 induknya menambah kelas `is-drawn` 200 ms setelah G1 selesai. Transisi CSS 450 ms `--ease-out`. Reduced motion → garis langsung tampil.
- [ ] **Step 3: Uji lompat.** Klik `/#program` dari header saat berada di bawah halaman, lalu gulir cepat ke atas dan ke bawah 3 kali. Kata bab harus berakhir di `scale 1, opacity 1` saat berada di tengah layar (`getComputedStyle(el).transform` = `none` atau matriks identitas).
- [ ] **Step 4:** `node --test lib/motion.test.mjs` tetap lulus; commit `feat(web): gerak skala bab dan garis aksen serif (editorial-7)`.

### Task 8: Perbarui dokumen desain dan naskah

**Files:**
- Modify: `docs/albana-docs/content/home-page-content.md`, `docs/albana-docs/design/academy-design-system.md`

- [ ] Konten Home §1.3: tambah baris **G8 Skala bab** (nilai dari Spesifikasi); ubah G2 dari "stabilo menyapu" menjadi "garis bawah frasa serif".
- [ ] Konten Home §1.4: "teks di atas foto" → "teks di atas foto **kecuali hero**, dengan lapisan gelap kontras ≥ 4.5:1".
- [ ] Konten Home §3.1: hero foto penuh, isi di kiri bawah, strip fakta di bawah foto.
- [ ] Konten Home §5.2, §8, §10.1: foto per baris 70/20/10, thumbnail jadwal, strip foto penutup.
- [ ] Design system: tabel Nada seksi, Skala tipografi, aturan sudut 0–4px, `.accent-serif`.
- [ ] Commit `docs: arah visual editorial bersih untuk beranda (editorial-8)`.

### Task 9: Verifikasi

Panel peramban harus **terlihat**. Lebar **1440, 1280, 1024, 768, 390, 360** × tema **terang dan gelap**.

- [ ] `node --test lib/tones.test.mjs lib/home-dummy.test.mjs lib/bento.test.mjs lib/motion.test.mjs` → semua PASS.
- [ ] `npx tsc --noEmit && npx eslint components/home lib && npm run build` → lulus.
- [ ] Tidak ada gulir mendatar (`scrollWidth === innerWidth`) di keenam lebar.
- [ ] Nada berganti sesuai peta; tidak ada dua nada sama berurutan selain canvas 2→3.
- [ ] Hero: teks terbaca di kedua tema; satu tombol utama; kontras diukur (Tugas 3 Step 4).
- [ ] Semua H2 memakai satu aksen serif dengan garis bawah yang tergambar; tidak ada stabilo tersisa (`grep -rn "bg-highlight\|highlight-stabilo" components/home` kosong).
- [ ] Kata bab G8 di 1280 px: membesar mengikuti gulir dan berakhir di skala 1. Di 390 px dan reduced motion: G1 biasa.
- [ ] Foto: tidak ada foto berulang yang terlihat dalam satu layar; caption di bawah foto, kecuali hero.
- [ ] Mode gelap: sand dan night terbaca, logo partner terlihat, garis `--tone-rule` tidak hilang.
- [ ] Tangkapan layar 1280 px dan 390 px, terang dan gelap, untuk ditinjau pemilik.
