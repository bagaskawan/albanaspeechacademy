# Pemisah Foto Galeri di Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyisipkan foto dokumentasi dari tabel/bucket `gallery` sebagai pemisah di tiga titik beranda (termasuk di dalam BenefitBand, antara angka 80%/3/BNSP dan kotak 01–04), dengan foto tetap (tidak berubah saat reload maupun saat admin mengunggah foto baru), rapi di mobile dan desktop.

**Architecture:** Foto pemisah dipatok lewat daftar ID galeri berurutan (`BREAK_PHOTO_IDS`) di `lib/server/home-data.ts`, mengikuti preseden `HERO_PHOTO_URL`. Helper murni `pickBreakPhotos` di `lib/home-derive.ts` memetakan ID ke foto dengan urutan array. ID tersebut dikecualikan dari `moments`, sehingga section lain tidak pernah memakai foto yang sama. Satu komponen server `PhotoBreak` (varian lebar atau berpasangan) merender slot. Gerak memakai jenis baru `data-motion="frame"` di `HomeScroll` (`lib/motion/scroll.ts`): bingkai terbuka + foto mengendap saat masuk layar, lalu foto bergeser halus mengikuti gulir di desktop.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, `node --test` (test `.test.mjs` di `front/lib/`).

**Spec:** permintaan klien 22 Nov 2026 (pemisah foto antarsection/box sebagai pengenalan akademi lewat dokumentasi; foto statis, urut berdasarkan array/ID; rapi, dokumentatif, tidak terlalu penuh) + [design system akademi](../design/academy-design-system.md) §5–6 (sudut 0–4px, media tanpa teks di atasnya).

## Estimasi jumlah gambar

Data `gallery` terbit per 22 Nov 2026: **16 foto** (ID 18–33, semua `title` kosong). ID 26 = foto hero.

| Kebutuhan | Foto | Sumber |
|---|---:|---|
| Hero (utama) | 1 | `HERO_PHOTO_URL` (ID 26) |
| Section lain (hero samping, tentang, cara belajar, jadwal fallback) | 7 | `moments[0..6]`, terbaru dulu (ID 33–27) |
| **Pemisah (plan ini)** | **4** | `BREAK_PHOTO_IDS` = ID 25, 24, 23, 22 |
| **Total beranda** | **12** | |
| Tersedia | 16 | sisa 4 (ID 21–18) cadangan pengganti |

Minimum agar semua slot pemisah terisi: 4 foto yang ID-nya dipatok dan masih terbit. Jika satu ID dihapus/ditarik dari CMS, slotnya mengecil (pasangan → tunggal, tunggal → hilang); tidak diganti otomatis agar tetap statis.

Syarat foto per slot: **tidak ada** — foto potret maupun landscape bisa dipakai di slot mana pun (lihat "Bingkai adaptif"). Disarankan lebar ≥ 1200px agar tajam di desktop.

## Bingkai adaptif (potret & landscape)

Tabel `gallery` tidak menyimpan lebar/tinggi foto, jadi orientasi tidak diketahui saat render server.

| Opsi | Cara | Untung | Rugi |
|---|---|---|---|
| **A (dipilih)** | Bingkai rasio tetap; foto utama `object-contain` di tengah; di belakangnya salinan foto yang sama `object-cover` + blur + redup mengisi sisa bingkai | Tanpa ubah skema/unggahan; subjek tidak pernah terpotong; tanpa layout shift; ritme halaman konsisten | Foto potret di bingkai lebar menyisakan bidang blur di kiri-kanan |
| B | Tambah kolom `width`/`height` di `gallery` (migrasi + isi saat unggah + backfill 16 baris), lalu bentuk slot dipilih per orientasi | Bentuk slot mengikuti foto | Migrasi DB produksi, ubah `/api/upload`, backfill; slot potret selebar kontainer jadi sangat tinggi dan merusak ritme |

Pilihan A: satu unduhan (latar dan foto utama memakai `src` yang sama, URL Supabase tidak dioptimasi ulang sehingga cache browser sama), tanpa JavaScript.

```
Landscape di bingkai 16:9          Potret di bingkai 16:9
[██████████████████████]           [░░░░░░░███████░░░░░░░]
[██████ foto penuh █████]           [░blur░░░█foto█░░░blur░]
[██████████████████████]           [░░░░░░░███████░░░░░░░]
```

## Penempatan (rapi, tidak terlalu penuh)

Aturan: maksimal **3 titik, 4 foto**; titik pemisah tidak boleh bersebelahan langsung dengan blok foto besar; bentuk berselang (lebar → pasangan → lebar); tidak ada pemisah setelah hero maupun sebelum penutup.

| Slot | ID (urut) | Posisi | Tetangga | Bentuk | `tone` |
|---|---|---|---|---|---|
| 1 | `[25]` | di dalam `BenefitBand`, antara `<dl>` angka dan `<ol>` 01–04 | angka ↔ kotak teks | lebar | — (ikut section) |
| 2 | `[24, 23]` | antara `ProgramChapter` dan `AboutSection` | marquee logo mitra ↔ judul Tentang | pasangan | `mist` |
| 3 | `[22]` | antara `TestimonialChapter` dan `TrainerSection` | slider testimoni ↔ judul Trainer | lebar | `canvas` |

Ditolak: setelah `LearningMethodChapter` (sudah 2 foto), antara `TrainerSection` dan `ScheduleSection` (keduanya berfoto), setelah hero.

```
Desktop                                   Mobile (375)
[ 80%  |  3  |  BNSP ]                    [ 80% ] [ 3 ] [ BNSP ]
[ ====== foto lebar 16:9 ====== ]         [ foto 4:3 ]
[01][02][03][04]                          [01] [02] [03] [04]
...Program + Inhouse (marquee)...         ...
[ foto 7/12 h-96 ][ foto 5/12 h-96 ]      [ foto 4:3 ]  (foto kedua disembunyikan)
...Tentang...Cara belajar...Testimoni...  ...
[ ====== foto lebar 16:9 ====== ]         [ foto 4:3 ]
...Trainer...
```

## Global Constraints

- Foto pemisah hanya dari `contentGallery` (tabel `gallery`, `consent_verified_at` tidak null). ID dipatok di `BREAK_PHOTO_IDS: number[][] = [[25], [24, 23], [22]]` (ID mentah tabel `gallery`).
- Urutan tampil = urutan array; tidak ada acak, tidak bergantung waktu/reload/unggahan baru.
- ID pemisah dikecualikan dari `moments` → `moments[0..6]` tetap ID 33–27 (tidak ada perubahan tampilan section lain).
- Tidak ada foto tampil dua kali di beranda. Slot tanpa foto tidak dirender (tanpa placeholder/kotak kosong/jarak sisa).
- File di `components/home/` lolos aturan `lib/home-layout.test.mjs`: tanpa jarak arbitrer (`p-[`, `gap-[`, `mt-[` …), tanpa `text-[` selain `text-[var(…)]`, sudut hanya `rounded-xs`/`rounded-none`.
- Warna hanya `var(--tone-*)`; tanpa hex di `className`.
- **Tanpa caption** — tidak ada `figcaption`, label, atau teks apa pun di sekitar/atas foto pemisah. `alt` foto utama = `photo.alt`; foto latar `alt=""` + `aria-hidden`.
- Gambar memakai `SkeletonImage` (`components/home/skeleton-image.tsx`), `fill`, lazy (tanpa `preload`); foto utama `object-contain`, latar `object-cover` (bingkai adaptif opsi A).
- Mobile (<640px): pasangan hanya menampilkan foto pertama.
- Gerak hanya `transform` dan `opacity` (tanpa animasi `filter`, `clip-path`, `width/height`); GSAP + ScrollTrigger yang sudah ada, tanpa pustaka baru; Lenis tetap satu-satunya mesin smooth scroll.
- `prefers-reduced-motion: reduce` → foto tampil langsung, tanpa reveal dan tanpa geser.

## Gerak foto pemisah

Gerak bawaan `data-motion="media"` (fade + naik 20px + scale bingkai 1.06→1) sama untuk semua media di halaman dan menskalakan bingkai berikut sudutnya — itu yang terasa kaku. Pemisah memakai gerak sendiri, mengikuti G4 "Bingkai" di [konten beranda §1.3](../content/home-page-content.md): bingkai dan foto bergerak terpisah.

| Fase | Target | Desktop (≥768px, pointer halus) | Mobile (<768px) / pointer kasar |
|---|---|---|---|
| Reveal (sekali, saat bingkai `top 85%`) | bingkai `[data-motion="frame"]` | `autoAlpha 0→1`, `yPercent 8→0`, 1.1s `expo.out` | `autoAlpha 0→1`, 0.8s `power3.out` |
| | lapisan foto `[data-frame-inner]` | `scale 1.16→1.08`, 1.4s `expo.out` | `scale 1.06→1`, 1s `expo.out` |
| Pasangan | foto kedua | jeda 0.12s | — (disembunyikan) |
| Geser ikut gulir | `[data-frame-inner]` | `yPercent -4→4`, `scrub: 0.6`, dari `top bottom` ke `bottom top`, `ease: "none"` | tidak ada |
| Reduced motion | semua | langsung tampil, tanpa transform | sama |

Skala diam 1.08 di desktop memberi ruang ±4% sehingga tepi foto tidak pernah terlihat saat bergeser. Lompatan anchor yang melewati bingkai tidak boleh meninggalkannya tersembunyi (`onLeave`/`onLeaveBack` → tampilkan keadaan akhir, sama seperti batch reveal yang ada). Bingkai yang sudah terlihat saat halaman dimuat (`top < 92% viewport`) tidak disembunyikan.

```
masuk layar:   ┌ bingkai naik 8% + fade ┐   foto di dalam mengecil 1.16→1.08
saat gulir:    foto bergeser -4% … +4% di dalam bingkai (bingkai diam)
```

## Review Focus

1. ID dipatok dihapus/ditarik dari CMS → slot mengecil tanpa sisa jarak; pasangan dengan 1 foto tersisa tampil sebagai foto tunggal. (Task 1 test `ID hilang`.)
2. Foto duplikat antara pemisah dan section lain → test `buildMoments mengecualikan ID pemisah` di Task 1; QA JS cek `src` unik di Task 3.
3. Foto potret di slot lebar atau pasangan → subjek utuh (tidak terpotong), sisa bingkai berupa latar blur, tinggi pasangan tetap sejajar. (QA Task 3 dengan foto potret.)
4. Scroll horizontal di 375px → QA Task 3 cek `document.documentElement.scrollWidth === innerWidth`.
5. Lompatan anchor (menu header ke `#jadwal`) melewati pemisah lalu gulir balik → bingkai terlihat, bukan kosong; reduced motion → tampil tanpa gerak. (QA Task 4.)

---

### Task 1: Data foto pemisah statis

**Files:**
- Modify: `front/lib/home-derive.ts` (tambah di akhir file)
- Modify: `front/lib/home-data.ts` (tambah `breaks: HomeMedia[][]` ke `HomeData`)
- Modify: `front/lib/server/home-sources.ts` (ekspor `CONTENT_GALLERY_ID_OFFSET = 200000`, dipakai `readContentGallery`)
- Modify: `front/lib/server/home-data.ts`
- Test: `front/lib/home-derive.test.mjs`

**Interfaces:**
- Produces: `export function pickBreakPhotos(gallery: HomeMedia[], slots: number[][]): HomeMedia[][]` — tiap slot berisi foto `gallery` yang `id`-nya ada di slot, **berurutan sesuai array slot**; ID yang tidak ditemukan dibuang.
- Produces: `HomeData["breaks"]` = hasil `pickBreakPhotos(contentGallery, BREAK_PHOTO_IDS.map((slot) => slot.map((id) => CONTENT_GALLERY_ID_OFFSET + id)))`.
- `moments = buildMoments([], contentGallery, [heroPhoto.id, ...breaks.flat().map((p) => p.id)])`.

- [ ] **Step 1: Tulis test gagal** di `home-derive.test.mjs` (`m(id)` → `{ id, kind: "image", src: \`/g/${id}.webp\`, poster: null, alt: \`foto ${id}\` }`; galeri `[m(33), m(32), …, m(18)]` urutan ID menurun seperti `readGalleryTable`):
  - `test("pickBreakPhotos mengikuti urutan array, bukan urutan galeri")`: slots `[[25],[24,23],[22]]` → ID `[[25],[24,23],[22]]`; slots `[[23,24]]` → `[[23,24]]`.
  - `test("pickBreakPhotos ID hilang")`: galeri tanpa ID 24 → `[[25],[23],[22]]`; galeri kosong → `[[],[],[]]`.
  - `test("buildMoments mengecualikan ID pemisah")`: `buildMoments([], galeri, [26, 25, 24, 23, 22])` tidak memuat ID 22–26 dan 7 item pertama = ID 33–27.
- [ ] **Step 2: Jalankan** `node --test lib/home-derive.test.mjs` dari `front/` → FAIL (`pickBreakPhotos` tidak diekspor).
- [ ] **Step 3: Implementasi** `pickBreakPhotos`, `CONTENT_GALLERY_ID_OFFSET`, `BREAK_PHOTO_IDS` (satu komentar baris: ID tabel `gallery`, urutan = urutan tampil), field `breaks`, dan pengecualian di `buildMoments`.
- [ ] **Step 4: Jalankan ulang** test → PASS; `npx tsc --noEmit` → bersih.
- [ ] **Step 5: Commit** `feat(web): foto pemisah beranda dipatok per ID galeri`.

### Task 2: Komponen `PhotoBreak`

**Files:**
- Create: `front/components/home/photo-break.tsx`
- Modify: `front/lib/home-layout.test.mjs` (tambah `"components/home/photo-break.tsx"` ke `HOME_FILES`)

**Interfaces:**
- Consumes: `HomeMedia` (`@/lib/home-data`), `SkeletonImage`.
- Produces: `export function PhotoBreak({ photos, tone }: { photos: HomeMedia[]; tone?: "canvas" | "mist" }): JSX.Element | null`.

Perilaku yang ditetapkan:
- `photos.length === 0` → `null`.
- Tanpa `figure`/`figcaption`/teks apa pun.
- Bingkai tiap foto: `<div data-photo-break data-motion="frame" className="relative overflow-hidden rounded-xs bg-[var(--tone-tile)] …">` berisi satu pembungkus `<div data-frame-inner className="absolute inset-0 will-change-transform">` dengan dua lapis, urut:
  1. latar: `SkeletonImage fill src={photo.src} alt="" aria-hidden className="scale-110 object-cover opacity-50 blur-2xl"` (sama `sizes` dengan foto utama);
  2. foto utama: `SkeletonImage fill src={photo.src} alt={photo.alt} blurDataURL={photo.blurDataURL ?? undefined} className="object-contain"`.
- 1 foto (lebar): `aspect-[4/3] sm:aspect-video`; `sizes="(min-width: 1280px) 1200px, 100vw"`. (Bukan 21:9: terlalu sempit untuk foto potret.)
- 2 foto (pasangan): grid `grid gap-4 sm:grid-cols-12 lg:gap-6`; foto 1 `sm:col-span-7`, foto 2 `hidden sm:block sm:col-span-5`; kedua wadah `aspect-[4/3] sm:aspect-auto sm:h-72 lg:h-96`; `sizes` foto 1 `"(min-width: 640px) 58vw, 100vw"`, foto 2 `"40vw"`.
- `tone` ada → bungkus `<div className={\`tone-${tone}\`}><div className="home-container pt-16 lg:pt-24">…</div></div>` (jarak bawah dari `home-section` berikutnya). `tone` kosong → hanya isi (dipakai di dalam container section lain).

- [ ] **Step 1: Tambah path ke `HOME_FILES`**, jalankan `node --test lib/home-layout.test.mjs` → gagal `ENOENT photo-break.tsx`.
- [ ] **Step 2: Buat komponen** sesuai perilaku di atas.
- [ ] **Step 3: Jalankan** `node --test lib/home-layout.test.mjs` → baris gagal **tidak** menyebut `photo-break.tsx`. (Baseline 22 Nov sudah gagal di `hero-section.tsx` `text-[` dan `learning-method-chapter.tsx:56` `rounded-full`; di luar plan ini.)
- [ ] **Step 4: Jalankan** `npx tsc --noEmit` dan `npx eslint components/home/photo-break.tsx` dari `front/` → tanpa error.
- [ ] **Step 5: Commit** `feat(web): komponen PhotoBreak untuk jeda foto beranda`.

### Task 3: Pasang di beranda + QA visual

**Files:**
- Modify: `front/components/home/benefit-band.tsx` (prop baru, sisip setelah `</dl>`)
- Modify: `front/components/home/home-page.tsx`

**Interfaces:**
- Consumes: `HomeData["breaks"]`, `PhotoBreak`.
- `BenefitBand({ programCount, photos }: { programCount: number; photos: HomeMedia[] })` → `<PhotoBreak photos={photos} />` tepat setelah `</dl>`.
- `home-page.tsx`: `const [band = [], afterProgram = [], afterTestimonial = []] = data.breaks;` lalu pasang sesuai tabel Penempatan (`tone="mist"` sebelum `AboutSection`, `tone="canvas"` sebelum `TrainerSection`).

- [ ] **Step 1: Ubah `BenefitBand`** dan **`home-page.tsx`**.
- [ ] **Step 2: Jalankan** `npx tsc --noEmit`, `npx eslint components/home/benefit-band.tsx components/home/home-page.tsx`, `node --test lib/home-derive.test.mjs` → bersih/PASS.
- [ ] **Step 3: QA browser** di `http://localhost:3000/` (dev server yang sudah jalan), lebar 375 dan 1280, tema terang dan gelap:
  - tidak ada teks di dalam/sekitar pemisah: `[...document.querySelectorAll('[data-photo-break]')].every(e => e.textContent.trim() === '' && !e.closest('figure'))` → `true`;
  - uji potret: ganti sementara via console `document.querySelectorAll('[data-photo-break] img').forEach(i => { i.removeAttribute('srcset'); i.src = '/images/alan-albana-profile-blue-background.png'; })` → screenshot 375 dan 1280: subjek utuh, sisa bingkai blur, pasangan sejajar, tanpa scroll horizontal; reload untuk kembali;
  - reload 3× → `src` keempat foto pemisah identik;
  - `const s=[...document.querySelectorAll('main img')].map(i=>i.currentSrc||i.src).filter(Boolean); s.length===new Set(s).size` → `true`;
  - `document.documentElement.scrollWidth === innerWidth` → `true` di 375;
  - pasangan sejajar tinggi di 1280, hanya satu foto di 375;
  - screenshot 375 dan 1280 untuk laporan.
- [ ] **Step 4: Commit** `feat(web): foto galeri sebagai pemisah section beranda`.

### Task 4: Gerak `frame` di `HomeScroll`

**Files:**
- Modify: `front/lib/motion/scroll.ts`

**Interfaces:**
- Consumes: `[data-motion="frame"]` dan `[data-frame-inner]` dari Task 2.
- Produces: cabang `kind === "frame"` di `setup()`, ditangani terpisah seperti `bar`/`count` (sebelum jalur `REVEAL_KINDS`), karena `revealTo` memakai `overwrite: true` + `clearProps: "transform"` yang akan mematikan geser ikut gulir. Semua `ScrollTrigger` baru masuk ke array `triggers` agar dibersihkan saat unmount; cleanup juga `clearProps` pada `[data-frame-inner]`.

Nilai gerak = tabel "Gerak foto pemisah". `desktopMotion = !reduced && finePointer && !compact`. Reduced → `return` tanpa `gsap.set` (bingkai tetap tampil).

- [ ] **Step 1: Implementasi** cabang `frame`: `gsap.set` keadaan awal (kecuali bingkai sudah `top < innerHeight * 0.92`); `ScrollTrigger.create({ trigger: frame, start: "top 85%", once: true, onEnter: reveal })` plus `onLeave`/`onLeaveBack` → `gsap.set` keadaan akhir; bila `desktopMotion`, `gsap.fromTo(inner, { yPercent: -4 }, { yPercent: 4, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: 0.6 } })`. Jeda foto kedua pasangan: hitung dari urutan bingkai di induk yang sama (`0.12 * index`).
- [ ] **Step 2: Jalankan** `npx tsc --noEmit` dan `npx eslint lib/motion/scroll.ts` dari `front/` → bersih.
- [ ] **Step 3: QA browser** (`http://localhost:3000/`, 1280 lalu 375):
  - gulir ke pemisah BenefitBand, tunggu 1.6s → `getComputedStyle(frame).opacity === "1"` untuk semua `[data-photo-break]` yang sudah dilewati;
  - 1280: catat `getComputedStyle(inner).transform` di dua posisi gulir berbeda saat bingkai di layar → nilainya berbeda (geser aktif); tepi foto tidak terlihat (screenshot);
  - 375: `transform` inner sama di dua posisi gulir (tanpa geser);
  - klik menu ke `#jadwal` dari atas, lalu gulir balik ke tiap pemisah → semua bingkai opacity 1;
  - emulasi `prefers-reduced-motion: reduce` + reload → semua bingkai opacity 1, inner `transform` = `none`;
  - DevTools Performance saat gulir di 1280 (CPU 4× lebih lambat): tidak ada frame merah berulang di area pemisah; bila ada, hapus geser ikut gulir dan pertahankan reveal saja.
- [ ] **Step 4: Commit** `feat(web): gerak bingkai dan geser halus untuk foto pemisah`.

## Catatan

- Foto section lain (`moments`) tetap urut terbaru dulu (`order=id.desc`), jadi unggahan baru tetap menggeser foto di hero samping/tentang/cara belajar/jadwal. Plan ini hanya mematok foto pemisah; mematok foto section lain di luar cakupan.
- Mengganti foto pemisah = ubah `BREAK_PHOTO_IDS` (tanpa menu CMS baru).
