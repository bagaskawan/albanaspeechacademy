# Redesign Beranda dan Halaman Daftar — Rencana Implementasi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Jalankan semua perintah dari folder `front/` kecuali disebut lain.

**Revisi 3 — 17 November 2026.** Pekerjaan dibagi **dua fase**:

- **Fase A — Dummy (dikerjakan sekarang).** Seluruh bentuk beranda baru dibangun dengan **data contoh** dari satu berkas, `lib/home-dummy.ts`, supaya pemilik bisa melihat tata letak, alur, bento, dan gerak secara utuh. Halaman daftar langsung memakai perilaku final (data batch-nya sudah nyata).
- **Fase B — Data dinamis (menyusul).** Data contoh diganti pembacaan database satu per satu, kompresi gambar dipasang, lalu `lib/home-dummy.ts` dan banner pratinjau dihapus.

Komponen di Fase A **menerima data lewat props** dengan tipe yang sama dengan data asli. Akibatnya, Fase B hanya mengganti **sumber** data di satu fungsi (`readHomeData()`); markup tidak ditulis ulang.

**Lapisan visual berikutnya:** [Beranda "Editorial Bersih"](./2026-11-17-landing-editorial-visual-plan.md) — dikerjakan di atas Fase A sebelum Fase B; menambah field `HomeData.moments` yang ikut diisi di Tugas B2.

**Revisi 4 (17 Nov 2026):** Fase B ditulis ulang berdasarkan audit admin — peta kebutuhan beranda ↔ modul admin (D1–D17), enam celah (C1–C6), dan Tugas B0–B9 yang bisa langsung dieksekusi.

**Riwayat.** Revisi 1: rencana awal. Revisi 2: enam masukan pemilik (ringkasan daftar hanya di langkah 1; setelah hero langsung Public Training, testimoni wajib ada; batch terdekat sesudah bento; alur ikut Konten Home §1.1; foto terpilih dan terkompresi; warna dan font tetap). Revisi 3: pembagian Fase A dummy / Fase B dinamis.

Rencana ini menggantikan **Task 10** di [rencana audit UI admin](./2026-11-17-admin-ui-audit-refactor-plan.md#task-10-beranda--public-training-per-program-dan-blok-in-house). K11 dan K12 di sana tetap berlaku. **Jangan eksekusi Task 10 lama.**

---

## 0. Baca dulu (untuk agen yang mengeksekusi)

Wajib dibaca sebelum Tugas A1, dalam urutan ini:

| Dokumen | Kenapa |
| --- | --- |
| `CLAUDE.md` (root repo) dan `front/AGENTS.md` | Aturan kerja, peta kode, batas data privat |
| [Konten Home](../content/home-page-content.md) **§0, §1.1–§1.4** | Sumber tunggal naskah, alur 7 babak, **kosakata gerak G1–G7**, daftar larangan |
| [Design system akademi](../design/academy-design-system.md) | Token warna, font, easing — **dipakai apa adanya** |
| `front/node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md` | Next.js 16: `preload` menggantikan `priority`; `images.qualities`, `localPatterns`, `maximumRedirects` (dipakai Fase B) |

**Aturan yang tidak boleh dilanggar** (sumber: Konten Home §0, §1.3, §1.4, `AGENTS.md`):

- Naskah di Konten Home disalin **apa adanya**. Teks baru hanya yang tertulis di rencana ini.
- Gerak hanya **G1–G7**. Hanya `transform` dan `opacity`; **tanpa `clip-path`**, tanpa `filter`, tanpa animasi lebar/tinggi.
- **Tanpa teks di atas foto**, tanpa kartu melayang berbayangan besar, tanpa carousel otomatis, tanpa marquee.
- **Satu tombol utama per seksi**; tombol lain berupa `button-secondary` atau tautan teks.
- Token warna/font di `app/globals.css` **tidak diubah**.

**Aturan khusus data contoh (Fase A):**

- Semua data contoh hanya boleh berada di **`front/lib/home-dummy.ts`**. Komponen tidak boleh berisi data contoh sendiri.
- Data contoh harus **terlihat sebagai contoh** oleh pengunjung. Ini mengikuti preseden `components/home/testimonial-section.tsx` dan aturan Konten Home §0 (dummy memakai penanda):
  - banner pratinjau di atas beranda (Tugas A2);
  - setiap foto contoh memakai caption/alt berakhiran **"— contoh visual, bukan dokumentasi kelas Albana"**;
  - kutipan testimoni contoh berbunyi **"Kutipan peserta {program} akan tampil di sini setelah disetujui."** dengan nama **"Peserta {program}"** — tidak mengarang nama orang;
  - partner contoh berupa petak bertuliskan **"Logo partner"**, bukan nama perusahaan nyata;
  - nama batch contoh memakai kata **"Contoh"** (mis. "Batch Contoh 1").
- **Fase A tidak boleh di-deploy ke produksi.** Banner pratinjau adalah penanda; Fase B menghapusnya. Bila beranda harus dirilis sebelum Fase B selesai, ganti dulu sumber data yang sudah siap (Tugas B2–B5) — jangan rilis dengan data contoh.

---

## 1. Tujuan

**Goal:** Beranda yang mengikuti tujuh babak Konten Home, dengan:

- hero dua kolom yang informatif tanpa marquee;
- satu seksi per sub-program Public Training (**Series**, **for Speakers**, **Sertifikasi**) berisi nama, deskripsi, fokus latihan, **bento dokumentasi**, lalu **batch terdekat**;
- blok Inhouse Training berisi dokumentasi kegiatan dan Pernah melatih (partner);
- testimoni di babak Bukti;
- halaman daftar yang menampilkan ringkasan batch hanya di langkah 1.

**Fase A selesai bila:** checklist Tugas A9 tercentang, `npx tsc --noEmit` dan `npm run build` lulus, `node --test lib/bento.test.mjs` lulus, dan pemilik sudah melihat beranda contoh di `localhost`.

**Fase B selesai bila:** checklist Tugas B7 tercentang, `grep -rn "home-dummy" front/app front/components front/lib` kosong, dan banner pratinjau hilang.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind 4, GSAP + ScrollTrigger + Lenis (sudah terpasang di `lib/motion/scroll.ts`), `next/image`, `node --test`.

---

## 2. Kondisi sekarang (temuan)

Sumber: kode di `front/components/home/*`, `front/components/register/*`, `front/lib/motion/scroll.ts`, `front/app/api/{upload,media}`, `front/lib/media-prepare.ts`, dan ukuran DOM di `localhost:3000` lebar 1024 px.

| # | Temuan | Bukti |
| --- | --- | --- |
| T1 | Beranda punya 13 seksi; urutannya tidak sama dengan 7 babak Konten Home. | `components/home/home-page.tsx` |
| T2 | Hero: logo terpusat, satu paragraf, satu CTA, marquee 6 foto **contoh**. Tidak ada info program atau batch. | `hero-section.tsx`, `components/ui/hero-3.tsx` |
| T3 | Seksi Program setinggi **1.821 px** di 1024 px: tiga kartu panjang berdampingan, In House hanya satu paragraf. | `program-showcase-section.tsx`, `program-card.tsx` |
| T4 | Dokumentasi berdiri sendiri, tidak terhubung ke program. Partner di seksi lain. | `documentation-section.tsx`, `partners-strip.tsx` |
| T5 | **Testimoni tidak tampil**: `TestimonialChapter` mengembalikan `null` karena belum ada testimoni terbit berizin. | ukur DOM: tidak ada `#hasil` |
| T6 | Foto diunggah sebagai WebP **resolusi penuh** dan dikirim apa adanya lewat `/api/media/[id]` → 302 ke signed URL. Petak bento kecil akan mengunduh berkas besar. | `lib/media-prepare.ts:21-22`, `app/api/media/[id]/route.ts` |
| T7 | Halaman daftar: `RegistrationOverview` dirender di atas form **di semua langkah** (1–4). | `registration-choice.tsx` |

---

## 3. Keputusan desain

| # | Keputusan |
| --- | --- |
| R1 | **Urutan beranda = 7 babak Konten Home §1.1.** Lihat §4. |
| R2 | Dihapus dari beranda: `PracticePreviewSection`, `DocumentationSection`, `PartnersStrip`, `ProgramShowcaseSection` + `ProgramCardView`. |
| R3 | **Hero dua kolom** (≥1024 px). Kiri: baris fokus, H1 logo, lead, deret fakta, CTA. Kanan: satu foto, di bawahnya panel **Batch terdekat** menempel (bukan melayang, tanpa bayangan, tidak menumpuk di atas foto). Ponsel: kiri dulu, lalu foto 4:5, lalu panel batch. **Tanpa marquee.** Naskah baris fokus, lead, dan CTA **tetap** dari Konten Home §3.1. |
| R4 | Fakta di hero: jumlah program Public Training yang punya batch dibuka, nama + tanggal sesi pertama batch terdekat, format batch. Tanpa angka alumni/rating. Tanpa batch dibuka → panel berisi **"Jadwal kelas berikutnya belum tersedia."** (naskah §8). |
| R5 | Hero: **satu tombol utama** "Lihat jadwal" → `#jadwal`. |
| R6 | **Seksi sub-program**, urutan isi tetap (atas → bawah): ① nomor 01/02/03 · ② nama program (`h3`) · ③ "untuk siapa" (naskah §4.1) · ④ tiga fokus latihan (naskah §4.1) + "Lihat materi lainnya" · ⑤ **bento dokumentasi** · ⑥ **panel batch terdekat**: status → nama batch → tanggal sesi → harga (+ coret) → catatan paket bila ada → **Daftar** (utama) + **Selengkapnya** (sekunder).<br>Desktop: ①–④ kolom kiri (5/12), ⑤–⑥ kolom kanan (7/12); **sisi bergantian** (program ke-2 teks di kanan). Ponsel: satu kolom ①→⑥. |
| R7 | Keadaan panel batch (naskah §4.1): menerima → **Pendaftaran dibuka** + Daftar + Selengkapnya; tertutup → **Pendaftaran ditutup** + Selengkapnya; tanpa batch → **Jadwal menyusul**, harga "—", Selengkapnya. Daftar hanya bila `registrationUrl` tidak `null`. |
| R8 | **Bento** (§5): maksimal **5 petak**; sisa media → tombol sekunder **"Lihat semua dokumentasi"** di bawah bento (naskah §6.2). Tidak ada label "+N" di atas foto. Video tampil sebagai poster + ikon putar; `iframe` hanya dimuat di lightbox. |
| R9 | Program tanpa media: **tidak ada kerangka bento**; kolom kanan hanya panel batch. |
| R10 | **Inhouse Training** (bagian babak 2, sesudah tiga sub-program): judul **Inhouse Training**, teks + aksi naskah §4.1 (**Konsultasi via WhatsApp** utama, **Selengkapnya** sekunder), bento dokumentasi kegiatan, lalu label **Pernah melatih** + grid logo partner. Bagian kosong tidak dirender. |
| R11 | **Testimoni** di babak 4 (naskah §6.1). Data kosong → seksi hilang. Fase A memakai 3 slot contoh berlabel agar bentuknya terlihat. |
| R12 | **Gerak** memakai G1–G7 yang sudah ada di `scroll.ts` (`data-motion` = `heading`/`rise`/`slide`/`media`/`bar`/`count`). Satu tambahan: petak bento G4 berurutan, jeda 120 ms (§6.2). Perilaku dua arah (`onLeave`/`onLeaveBack`) **dipertahankan** sesuai §1.3. |
| R13 | **Halaman daftar**: `RegistrationOverview` dirender **hanya saat `step === 0`**. Logika form, validasi, dan pengiriman **tidak diubah**. |
| R14 | Anchor dipertahankan: `#program` membungkus Public + Inhouse; `#tentang`, `#trainer`, `#jadwal`, `#daftar`, `#kontak` tetap. |
| R15 | **Kompresi foto** (Fase B, §6): `next/image` mengirim AVIF/WebP seukuran petak, bento `quality={85}`, lightbox `quality={90}`. Berkas asli di Storage tidak diubah. |

---

## 4. Alur beranda (target)

Sumber: Konten Home §1.1. Kolom "Data Fase A" menjelaskan asal data selama dummy.

| Babak | Anchor | Isi | Komponen (`components/home/`) | Data Fase A |
| --- | --- | --- | --- | --- |
| 1 · Momen | `#beranda` | Hero + Pita manfaat | `hero-section.tsx` (tulis ulang), `benefit-band.tsx` | contoh |
| 2 · Jalan | `#program` | Pembuka **[ PROGRAM ]** → **Public Training** (Series, for Speakers, Sertifikasi) → **Inhouse Training** (dokumentasi + Pernah melatih) | `program-chapter.tsx`, `program-story-section.tsx` ×3, `inhouse-training-section.tsx` (baru) | contoh |
| 3 · Pemandu | `#tentang` | Tentang + Cara belajar | `about-section.tsx`, `learning-method-chapter.tsx` | nyata (tidak diubah) |
| 4 · Bukti | `#tentang` | Testimoni | `testimonial-chapter.tsx` (terima props) | contoh |
| 5 · Pendamping | `#trainer` | Trainer | `trainer-section.tsx` | nyata (tidak diubah) |
| 6 · Keputusan | `#jadwal` | Jadwal & biaya | `schedule-section.tsx` | nyata (tidak diubah) |
| 7 · Langkah pertama | `#daftar` | Tiga langkah + dua jalur | `registration-steps-section.tsx` | nyata (tidak diubah) |
| Penutup | `#kontak` | Ajakan + kontak | `closing-section.tsx` | nyata (tidak diubah) |

Pembuka babak 2 memakai naskah §4.1 apa adanya: eyebrow **[ PROGRAM ]**, H2 **Setiap situasi bicara butuh ▓latihan yang berbeda▓**, lead **Mempresentasikan gagasan, memandu acara, atau melatih tim — mulai dari situasi yang paling dekat dengan kebutuhanmu.** Sub-judul **Public Training** dan **Inhouse Training** tampil sebagai `h3` besar di awal tiap kelompok.

---

## 5. Pola bento

Grid desktop (≥1024 px): 4 kolom, `auto-rows-[11rem]`, `gap-3`. Ponsel/tablet (<1024 px): 2 kolom, `auto-rows-[9rem]`, `gap-2`. Notasi `kolom×baris`. Petak A = media pertama.

| Media | Petak tampil | Desktop (4 kolom) | Ponsel (2 kolom) |
| --- | --- | --- | --- |
| 1 | 1 | A 4×2 | A 2×2 |
| 2 | 2 | A 2×2, B 2×2 | A 2×2, B 2×1 |
| 3 | 3 | A 2×2, B 2×1, C 2×1 | A 2×2, B 1×1, C 1×1 |
| 4 | 4 | A 2×2, B 2×1, C 1×1, D 1×1 | A 2×2, B 1×1, C 1×1, D 2×1 |
| ≥5, tanpa video | 5 | A 2×2, B 1×1, C 1×1, D 1×1, E 1×1 | A 2×2, B–E 1×1 |
| ≥5, ada video | 4 | pola 4 (video di B 2×1) | pola 4 |

Aturan:

- Setiap pola mengisi persegi penuh: desktop 8 sel (4×2); ponsel jumlah sel genap tanpa lubang.
- **Video selalu di petak B.** Hanya video tanpa foto → video di petak A.
- **Pemilihan media:** foto teratas dalam urutan yang diberikan (Fase B: `created_at desc`), video disisipkan ke posisi B. Tidak menambah kolom database.
- Semua petak `object-cover`, sehingga tinggi deret seragam untuk foto potret maupun lanskap.
- Kelas Tailwind ditulis **utuh** di tabel konstan (mis. `"col-span-2 row-span-2 lg:col-span-4 lg:row-span-2"`), bukan dirangkai dari angka.

---

## 6. Kontrak data (dipakai kedua fase)

Satu tipe untuk seluruh data beranda yang dirombak. Fase A mengisinya dari `lib/home-dummy.ts`; Fase B dari database. **Komponen hanya mengenal tipe ini.**

```ts
// front/lib/home-data.ts  (tipe saja, aman diimpor komponen client maupun server)
import type { ProgramCard } from "@/lib/server/program-showcase"; // tipe saja: pakai `import type`

export type HomeMedia = {
  id: number;                 // negatif untuk data contoh
  kind: "image" | "video";
  src: string;                // foto: URL gambar; video: URL embed youtube-nocookie, atau "" untuk contoh
  poster: string | null;      // video: URL poster; foto: null
  alt: string;
};

export type HomeProgram = { card: ProgramCard; media: HomeMedia[]; bundleNote?: string };
export type HomePartner = { id: number; name: string; logoUrl: string | null };
export type HomeTestimonial = { id: number; quote: string; attribution: string; roleLabel: string | null };

export type HomeData = {
  preview: boolean;           // true = data contoh → banner pratinjau tampil
  hero: {
    photo: HomeMedia | null;
    openPrograms: number;     // program Public Training dengan batch dibuka
    nextBatch: { programTitle: string; batchName: string; firstDateLabel: string; formatLabel: string; statusLabel: string } | null;
  };
  programs: HomeProgram[] | "failed"; // urutan: series, for speakers, sertifikasi
  inhouse: { card: ProgramCard | null; whatsappHref: string | null; media: HomeMedia[]; partners: HomePartner[] };
  testimonials: HomeTestimonial[];
};
```

```ts
// front/lib/server/home-data.ts
import "server-only";
/** Fase A: mengembalikan HOME_DUMMY. Fase B: membaca database. */
export async function readHomeData(): Promise<HomeData>;
```

`home-page.tsx` memanggil `readHomeData()` satu kali dan meneruskan potongan datanya ke `HeroSection`, `ProgramChapter`, dan `TestimonialChapter`.

---

# FASE A — DUMMY

## A. Struktur berkas Fase A

| Berkas | Aksi | Isi |
| --- | --- | --- |
| `front/lib/bento.ts` + `bento.test.mjs` | Create | pola §5 + tes |
| `front/lib/home-data.ts` | Create | tipe §6 |
| `front/lib/home-dummy.ts` | Create | `HOME_DUMMY: HomeData` — **satu-satunya** tempat data contoh |
| `front/lib/server/home-data.ts` | Create | `readHomeData()` → `HOME_DUMMY` |
| `front/components/home/preview-banner.tsx` | Create | banner "Mode pratinjau" |
| `front/components/home/bento-gallery.tsx` | Create | bento + lightbox (dipindah dari `documentation-gallery.tsx`) |
| `front/components/home/hero-section.tsx` | Rewrite | R3–R5, terima props |
| `front/components/home/program-chapter.tsx` | Create | pembuka babak 2 + Public + Inhouse |
| `front/components/home/program-story-section.tsx` | Create | satu sub-program R6–R9 |
| `front/components/home/inhouse-training-section.tsx` | Create | R10 |
| `front/components/home/testimonial-chapter.tsx` | Modify | terima `testimonials` lewat props; pembacaan DB pindah ke Fase B |
| `front/components/home/home-page.tsx` | Modify | urutan §4 |
| `front/lib/motion/scroll.ts` | Modify | jeda berurutan petak bento |
| `front/components/register/registration-choice.tsx` + `registration-form.tsx` | Modify | R13 |
| Delete | — | `program-showcase-section.tsx`, `program-card.tsx`, `documentation-section.tsx`, `documentation-gallery.tsx`, `partners-strip.tsx`, `practice-preview-section.tsx`, `components/ui/hero-3.tsx`* , `program-section.tsx`*, `training-format-section.tsx`* |

\* hapus hanya bila `grep -rn "<NamaKomponen>" front/app front/components` tidak menemukan pemakai lain.

### Tugas A1: `bentoLayout` + tes

**Interface:**

```ts
// front/lib/bento.ts
export type BentoMedia = { id: number; kind: "image" | "video" };
export type BentoTile<T extends BentoMedia> = { media: T; className: string };
/** Urutkan (video ke petak B), pilih petak tampil, beri kelas span. */
export function bentoLayout<T extends BentoMedia>(media: T[]): { tiles: BentoTile<T>[]; ordered: T[]; rest: number };
```

`ordered` = seluruh media dalam urutan tampil (dipakai lightbox). `rest` = `ordered.length − tiles.length`.

- [x] **Step 1: Tulis tes** `front/lib/bento.test.mjs`, impor seperti `lib/billing-rows.test.mjs` (`import { bentoLayout } from "./bento.ts";`). Kasus jumlah 0–8, masing-masing tanpa video dan dengan 1 video:
  - [x] (a) `tiles.length` = `min(n, 5)`, atau `min(n, 4)` bila ada video dan n ≥ 5; n = 0 → `tiles` kosong.
  - [x] (b) jumlah sel desktop = 8 untuk n ≥ 1; jumlah sel ponsel genap. Hitung dari kelas `col-span-X row-span-Y` dan `lg:col-span-X lg:row-span-Y`.
  - [x] (c) `rest` = n − `tiles.length`.
  - [x] (d) ada video dan n ≥ 2 → `tiles[1].media.kind === "video"`; hanya video → `tiles[0]`.
- [x] **Step 2:** `node --test lib/bento.test.mjs` → **gagal** (berkas belum ada).
- [x] **Step 3:** Implementasi tabel §5 sebagai objek konstan `{ [jumlahPetak]: { mobile: string[]; desktop: string[] } }`.
- [x] **Step 4:** tes **lulus**.
- [ ] **Step 5:** commit `feat(web): pola petak bento dokumentasi (landing-a1)`.

### Tugas A2: Kontrak data, data contoh, banner

- [x] **Step 1:** `lib/home-data.ts` sesuai §6 (tipe saja).
- [x] **Step 2:** `lib/home-dummy.ts` → `export const HOME_DUMMY: HomeData`. Isi wajib, supaya semua keadaan tata letak terlihat:

  | Bagian | Isi contoh | Kenapa |
  | --- | --- | --- |
  | `preview` | `true` | memunculkan banner |
  | `hero.photo` | `/images/preview/praktik-berbicara.jpg` | hero berfoto |
  | `hero.nextBatch` | program "Public Speaking for Speakers", batch "Batch Contoh 1", tanggal "Minggu, 7 Desember 2026", format "1 pertemuan", status "Pendaftaran dibuka" | panel batch terisi |
  | `programs[0]` Series | **6 foto** + **1 video** → bento pola 4 + tombol "Lihat semua dokumentasi"; batch **dibuka** dengan harga dan harga coret | keadaan terpenuh |
  | `programs[1]` for Speakers | **3 foto**; batch **dibuka**; `bundleNote` "Tersedia paket dengan Sertifikasi" | pola 3 + catatan paket |
  | `programs[2]` Sertifikasi | **0 media**; `batch: null`, status "Jadwal menyusul", `topics: []` | keadaan kosong R7, R9 |
  | `inhouse` | `card` contoh slug `inhouse-training`; `whatsappHref: "#kontak"` (bukan nomor nyata, cukup agar tombol terlihat); **4 foto**; **6 partner** `{ name: "Logo partner", logoUrl: null }` | grid partner terlihat |
  | `testimonials` | 3 slot: Series, for Speakers, Sertifikasi, kalimat penanda sesuai §0 | bentuk testimoni terlihat |

  - Foto contoh: siklus enam berkas `/images/preview/*.jpg`. `alt` = `"{kegiatan} — contoh visual, bukan dokumentasi kelas Albana"`.
  - Video contoh: `kind: "video"`, `src: ""`, `poster: "/images/preview/simulasi-panggung.jpg"`, `alt: "Contoh video kegiatan — sematan YouTube tampil setelah data asli tersedia"`. Lightbox merender teks `alt` sebagai pengganti `iframe` bila `src` kosong.
  - `ProgramCard` contoh mengisi semua kolom tipe aslinya (`slug`, `title`, `summary`, `topics`, `statusLabel`, `registrationUrl`, `batch`). Slug memakai slug asli (`public-speaking-series`, `public-speaking-for-speakers`, `sertifikasi-pembicara-profesional`) agar tautan **Selengkapnya** dan **Daftar** menuju halaman nyata.
- [x] **Step 3:** `lib/server/home-data.ts` → `readHomeData()` mengembalikan `HOME_DUMMY`. Beri komentar satu baris: `// shortcut: data contoh Fase A; diganti pembacaan database di Fase B (Tugas B2–B5).`
- [x] **Step 4:** `PreviewBanner` — tampil hanya bila `preview === true`. Satu baris di atas hero, latar `bg-highlight`, teks `text-ink`: **"Mode pratinjau — foto, batch, testimoni, dan partner di beranda ini adalah data contoh."** Tidak bisa ditutup.
- [ ] **Step 5:** `npx tsc --noEmit`, commit `feat(web): kontrak data beranda dan data contoh Fase A (landing-a2)`.

### Tugas A3: `BentoGallery` + lightbox

Props: `{ media: HomeMedia[]; label: string }` (`"use client"`).

- [x] **Step 1:** `bentoLayout(media)`; `n = 0` → `null`.
- [x] **Step 2:** `<ul data-bento>` grid sesuai §5. Tiap petak `<li data-motion="media">` berisi `<button type="button" aria-label="Perbesar: {alt}" aria-haspopup="dialog">`.
- [x] **Step 3:** Foto: `<Image fill src={src} alt={alt} sizes=... className="object-cover" />`. `sizes`: petak 2×2 dan 2×1 `(min-width:1024px) 34vw, 100vw`; petak 1×1 `(min-width:1024px) 17vw, 50vw`; petak 4×2 `(min-width:1024px) 58vw, 100vw`.
- [x] **Step 4:** Video: `<Image fill src={poster}>` + ikon putar (`lucide-react` `Play`, `aria-hidden`) di tengah. Ikon bukan teks.
- [x] **Step 5:** `rest > 0` → `button-secondary` **"Lihat semua dokumentasi"** di bawah grid, membuka lightbox di indeks `tiles.length`.
- [x] **Step 6: Lightbox** — pindahkan `<dialog>` dari `documentation-gallery.tsx` (fokus kembali ke pemicu dipertahankan). Tambah tombol **"Sebelumnya"**, **"Berikutnya"**, **"Tutup"** (naskah §6.2), panah kiri/kanan papan tuts. Foto: `<Image sizes="(min-width:1024px) 72rem, 100vw">`. Video: `iframe` `title={alt}` hanya untuk media yang sedang dibuka; `src` kosong → teks `alt`.
- [ ] **Step 7:** `npx tsc --noEmit && npx eslint components/home lib`, commit `feat(web): galeri bento dengan lightbox (landing-a3)`.

### Tugas A4: Hero

Props: `{ hero: HomeData["hero"] }`.

- [x] **Step 1: Kolom kiri** (urutan): baris fokus **Presentasi · Diskusi · MC** → H1 logo (markup logo sekarang dipertahankan: `academy-hero-logo-blue` untuk terang, `BrandLogo` putih untuk gelap, `role="img" aria-label="Albana Speech Academy"`) → lead naskah §3.1 → `<dl>` fakta R4 → tombol utama **Lihat jadwal** (`#jadwal`).
- [x] **Step 2: Kolom kanan:** `hero.photo` `aspect-[4/5]`, `<Image preload sizes="(min-width:1024px) 40vw, 100vw">`, `data-motion="media"`. Di bawahnya panel **Batch terdekat** (border `border-rule`, `bg-card`, tanpa bayangan): program · batch · tanggal · format · status. Tanpa foto → panel saja. `nextBatch === null` → teks R4.
- [x] **Step 3: Tata letak:** `lg:grid lg:grid-cols-12 lg:items-center`; kiri `lg:col-span-6`, kanan `lg:col-span-5 lg:col-start-8`. Tinggi ≤ `100svh` di 1280×800. Di 390×844, H1 + lead + tombol terlihat tanpa gulir.
- [x] **Step 4: Gerak:** perilaku masuk hero sekarang (baris fokus, logo, lead, fakta, tombol fade berurutan); foto G4.
- [ ] **Step 5:** `grep -rn "AnimatedMarqueeHero\|hero-3" front/app front/components` kosong → hapus `components/ui/hero-3.tsx`. Commit `feat(web): hero dua kolom dengan batch terdekat (landing-a4)`.

### Tugas A5: Seksi sub-program

Props `ProgramStorySection`: `{ program: HomeProgram; index: number }`.

- [x] **Step 1:** Pindahkan konstanta `copy` (untuk siapa + tiga fokus) dan perilaku "Lihat materi lainnya" dari `program-card.tsx`. Naskah §4.1 tanpa diubah. Tanpa materi → **"Materi diumumkan bersama jadwal."**
- [x] **Step 2:** `<section id={card.slug}>` dengan urutan R6 ①–⑥.
- [x] **Step 3: Panel batch terdekat (⑥)** sesudah bento, keadaan R7: status (titik aksen + label) · nama batch · `batch.dateLabels` · harga `font-display tabular-nums` + harga normal dicoret · `bundleNote` · aksi. Tanpa jam/tempat (ada di `#jadwal`).
- [x] **Step 4: Tata letak:** `lg:grid lg:grid-cols-12 lg:gap-x-12`; teks `lg:col-span-5`; media + batch `lg:col-span-7`. Indeks ganjil: teks `lg:order-last lg:col-start-8`. Antarprogram `border-t border-rule`, `py-14 lg:py-24`. Tanpa media → kolom kanan hanya panel batch.
- [x] **Step 5: Gerak:** nama program G1; untuk siapa + fokus G3; petak bento G4 berurutan; panel batch G3; harga tidak dianimasikan.

### Tugas A6: Babak 2 (`ProgramChapter`) + Inhouse

Props `ProgramChapter`: `{ programs: HomeData["programs"]; inhouse: HomeData["inhouse"] }`.

- [x] **Step 1:** `<section id="program">`: `SectionIntro` naskah §4.1 → `h3` **Public Training** → `ProgramStorySection` per program dalam urutan data. `programs === "failed"` → **"Program belum bisa dimuat."** + `RetryButton`.
- [x] **Step 2: `InhouseTrainingSection`** (`{ inhouse }`), sesudah Public Training:
  - [x] `h3` **Inhouse Training** + teks naskah §4.1 + **Konsultasi via WhatsApp** (utama, bila `whatsappHref`) + **Selengkapnya** (sekunder → `/program/inhouse-training`).
  - [x] `BentoGallery` dengan `inhouse.media`.
  - [x] **Pernah melatih**: eyebrow + grid `grid-cols-3 sm:grid-cols-4 lg:grid-cols-6`, petak `h-20` sama tinggi, border `border-rule`. `logoUrl` ada → `<Image object-contain alt={name}>`, grayscale → warna saat hover (pointer halus). `logoUrl` null → teks nama di tengah petak (`text-sm text-muted`).
  - [x] Bagian yang kosong tidak dirender, termasuk judulnya.
- [ ] **Step 3:** `npx tsc --noEmit`, commit `feat(web): babak Program per sub-program dan Inhouse (landing-a6)`.

### Tugas A7: Testimoni + susunan beranda + gerak

- [x] **Step 1:** `TestimonialChapter` menerima `{ testimonials: HomeTestimonial[] }`. Pindahkan query `testimonials?...` yang ada ke komentar di `lib/server/home-data.ts` sebagai catatan Fase B (Tugas B4). Markup dan naskah §6.1 tidak diubah. Kosong → `null`.
- [x] **Step 2:** `home-page.tsx`: `const data = await readHomeData();` lalu urutan §4: `PreviewBanner`, `HeroSection`, `BenefitBand`, `ProgramChapter`, `AboutSection`, `LearningMethodChapter`, `TestimonialChapter`, `TrainerSection`, `ScheduleSection`, `RegistrationStepsSection`, `ClosingSection`. `HomePage` menjadi `async`.
- [x] **Step 3:** `scroll.ts`: elemen `data-motion="media"` di dalam `[data-bento]` yang sama mendapat `delay = index × 0.12` pada `run()`. Tidak ada perubahan lain.
- [x] **Step 4:** Hapus berkas daftar Delete. `grep -rn "ProgramShowcaseSection\|ProgramCardView\|PartnersStrip\|DocumentationSection\|DocumentationGallery\|PracticePreviewSection\|AnimatedMarqueeHero" front/app front/components front/lib` → **kosong**.
- [ ] **Step 5:** `npx tsc --noEmit && npx eslint components/home lib && npm run build` lulus. Commit `feat(web): beranda tujuh babak dengan data contoh (landing-a7)`.

### Tugas A8: Halaman daftar — ringkasan hanya di langkah 1

Data halaman daftar sudah nyata; tugas ini **final**, tidak diulang di Fase B.

- [x] **Step 1:** `RegistrationForm` menerima prop `overview: React.ReactNode`, render `{step === 0 ? overview : null}` tepat di atas judul langkah (`<h2 ref={headingRef}>`) di dalam `<form>`.
- [x] **Step 2:** `RegistrationChoice` berhenti merender `<RegistrationOverview>` di luar form; kirim `overview={<RegistrationOverview batch={batch} />}`.
- [x] **Step 3:** Pindah langkah tetap memfokuskan judul langkah. "Kembali" ke langkah 1 → ringkasan tampil lagi.
- [x] **Step 4:** Langkah 4 tetap menampilkan ringkasan pembayaran (`paymentSummary`).
- [ ] **Step 5:** `npx tsc --noEmit && npx eslint components/register`, commit `fix(register): ringkasan batch hanya di langkah pertama (landing-a8)`.

### Tugas A9: Verifikasi Fase A di peramban

Panel peramban harus **terlihat** (tangkapan layar kosong bila tersembunyi). Lebar **1440, 1280, 1024, 768, 390, 360**; tema terang dan gelap.

- [ ] Banner pratinjau tampil di atas hero.
- [ ] Tidak ada gulir mendatar (`document.documentElement.scrollWidth === innerWidth`).
- [ ] Urutan seksi di DOM sama dengan §4.
- [ ] Hero: tanpa marquee, satu tombol utama, panel batch tidak menumpuk di atas foto.
- [ ] Series: bento pola 4 dengan video di B + tombol "Lihat semua dokumentasi"; batch dibuka sesudah bento.
- [ ] for Speakers: bento pola 3, catatan paket tampil; sisi teks di kanan pada ≥1024 px.
- [ ] Sertifikasi: tanpa bento, panel "Jadwal menyusul", "Materi diumumkan bersama jadwal."
- [ ] Lightbox: buka dari petak dan dari tombol; Sebelumnya/Berikutnya, panah, Escape, **Tutup**; fokus kembali ke pemicu; video contoh menampilkan teks pengganti.
- [ ] Inhouse: bento 4 foto + grid 6 petak "Logo partner".
- [ ] Testimoni: 3 slot contoh tampil di babak 4.
- [ ] Gerak: petak bento masuk berurutan; `prefers-reduced-motion: reduce` → fade 150 ms saja.
- [ ] `/#program` dari header dan footer mendarat di babak 2.
- [ ] Halaman daftar `/register/public-speaking-for-speakers`: ringkasan di langkah 1 saja; kembali ke langkah 1 → tampil lagi; 390 px isian 16 px.
- [ ] Ambil tangkapan layar 1280 px dan 390 px untuk ditinjau pemilik. **Fase B dimulai setelah pemilik menyetujui bentuknya.**

---

# FASE B — DATA DINAMIS

**Revisi 4 — 17 November 2026.** Bagian ini ditulis ulang setelah audit admin dan setelah tampilan beranda dirombak (judul serif, galeri per program, jeda video, slider testimoni, Legalitas berpratinjau dokumen; lihat [Konten Home §12](../content/home-page-content.md)). Tugas B lama diganti seluruhnya oleh Tugas B0–B9 di bawah. Agen yang mengeksekusi cukup membaca bagian ini, `front/AGENTS.md`, Konten Home §12, dan berkas yang disebut di tiap tugas. Aturan visual §0 (tanpa marquee, token tetap) sudah digantikan keputusan pemilik di Konten Home §12; yang tetap berlaku dari §0 hanyalah aturan data contoh.

**Prasyarat:** pemilik sudah menyetujui tampilan Fase A. Kerjakan dari folder `front/`. Satu commit per tugas. Pesan commit diakhiri baris `Co-Authored-By` sesuai instruksi sesi.

## B. Peta kebutuhan beranda ↔ admin

Kolom **Status** menandai apa yang harus dikerjakan: **siap** = data dan admin sudah ada, tinggal dibaca; **celah** = ada yang harus dibuat atau diperbaiki dulu.

| # | Kebutuhan beranda (komponen) | Sumber data | Modul admin yang mengisi | Status |
| --- | --- | --- | --- | --- |
| D1 | Kartu program, batch terdekat, status, harga, harga coret (`program-story-section`, `schedule-section`, hero `nextBatch`) | `programs`, `batches`, `sessions` lewat `readProgramShowcase()` | `/admin/program` (Program & Batch) | siap |
| D2 | Catatan paket (`bundleNote`) | `bundle_offers` (`placement_scope=program`, `active`) | `/admin/program` (tawaran paket) | siap |
| D3 | Foto dokumentasi per program (pratinjau 2 foto + galeri mosaik) | `media_assets` `provider=supabase_storage`, `kind=image`, `program_slug`, `published`, `consent_at` → `src=/api/media/{id}` | `/admin/program/[slug]` bagian Dokumentasi (unggah lewat `POST /api/upload`, sudah mengisi `published` + `consent_at`) | siap |
| D4 | Video per program (jeda video `video-break.tsx`) | `media_assets` `provider=youtube`, `kind=video` | `/admin/program/[slug]` (`addProgramVideo`) | **celah C1**: insert tanpa `consent_at` melanggar constraint `media_assets_published_has_consent` → video gagal disimpan |
| D5 | Poster video | `https://i.ytimg.com/vi/{youtubeId}/hqdefault.jpg` | — (turunan) | **celah C2**: host `i.ytimg.com` belum ada di `next.config.ts` `remotePatterns` |
| D6 | Inhouse: kartu + WhatsApp | `programs` slug `inhouse-training`; `contact_channels` kind `whatsapp` | `/admin/program`, `/admin/kontak` | siap |
| D7 | Inhouse: foto kegiatan (2 foto bertumpuk + galeri) | `gallery` (`image_url`, `title`, `consent_verified_at`) **ditambah** `media_assets` `program_slug=inhouse-training` (foto + video) | `/admin/galeri`; `/admin/program/inhouse-training` | siap (dua sumber digabung, lihat B3) |
| D8 | Pernah melatih (logo partner) | `academy_partners` `published`, `sort_order`, `logo_url` (`https://…` atau `/api/media/{id}`) | `/admin/partner` | siap |
| D9 | Tentang: nama akademi, potret Alan | `academy.name`; `trainers` slug `alan-albana` `photo_url` | `/admin/profil-akademi`, `/admin/trainer` | siap (sudah dibaca langsung oleh `about-section.tsx`) |
| D10 | Cara belajar: teks metode | `academy.teaching_method` | `/admin/profil-akademi` | siap (angka 80/20 tetap statis di kode; bila teks metode berubah, angka tidak ikut — dicatat, bukan dikerjakan) |
| D11 | Legalitas: gambar dokumen | `academy.legality` JSON `{ akta_url, nib_url, skt_url, npwp_front_url, npwp_back_url }` (unggah `purpose=legality` → bucket publik `legality`) | `/admin/settings` › Legalitas (`saveAcademyLegality`) | **celah C3**: tidak ada migrasi di repo yang membuat kolom `academy.legality` maupun bucket `legality`; harus diverifikasi di database |
| D12 | Legalitas: nama, nomor, penerbit dokumen | statis di `legality-section.tsx` | — | siap (fakta hukum jarang berubah; tetap di kode) |
| D13 | Testimoni (slider) | `testimonials` `attribution`, `quote`, `role_label`, `photo_url`, `published`, `consent_at` | `/admin/testimoni` | **celah C4**: `HomeTestimonial` belum punya `photoUrl`; slider belum menampilkan foto |
| D14 | Trainer | `trainers` `slug, name, expertise, bio, photo_url` | `/admin/trainer` | **celah C5**: kueri `trainer-section.tsx` tidak menyaring `published`; trainer draf ikut tampil bila kolomnya ada |
| D15 | Kontak penutup + footer | `contact_channels` | `/admin/kontak` | siap |
| D16 | Foto hero + kumpulan `moments` (Cara belajar, Penutup, Tentang, hero kecil) | turunan dari D3 + D7 (tidak ada modul "pilih foto hero") | — | siap (aturan turunan di B2) |
| D17 | Kompresi gambar | `next/image` → `/_next/image` | — | **celah C6**: `images.qualities`, `formats`, `localPatterns` belum diatur (lihat B1) |

## B0. Verifikasi database (wajib sebelum menulis kode)

Pakai alat Supabase MCP yang tersedia di sesi (`list_tables`, `execute_sql` **hanya SELECT**). Jangan mengubah database di langkah ini.

- [ ] **Step 1:** Jalankan dan catat hasilnya di laporan:

```sql
select column_name, data_type from information_schema.columns
 where table_schema='public' and table_name in ('academy','media_assets','testimonials','trainers','gallery','academy_partners')
 order by table_name, ordinal_position;
select id, public from storage.buckets
 where id in ('legality','gallery','testimonials','academy-media','public-speaking-series','public-speaking-for-speakers','sertifikasi-pembicara-profesional');
select column_default from information_schema.columns
 where table_schema='public' and table_name='media_assets' and column_name='consent_at';
```

- [ ] **Step 2:** Putuskan per celah:
  - `academy.legality` **tidak ada** → buat migrasi `supabase/migrations/<timestamp>_academy_legality.sql`: `alter table public.academy add column if not exists legality jsonb not null default '{}'::jsonb;`. Bucket `legality` tidak ada → tambahkan di migrasi yang sama: `insert into storage.buckets (id, name, public) values ('legality','legality', true) on conflict (id) do nothing;`. Jangan menjalankan migrasi ke database produksi tanpa izin pemilik; cukup tulis berkasnya dan laporkan.
  - Bucket program tidak ada → laporkan ke pemilik (unggah foto program di admin akan gagal), jangan dibuat diam-diam.
  - `trainers.published` tidak ada → C5 cukup dicatat, kueri tidak diubah.
- [ ] **Step 3:** Tidak ada commit kecuali migrasi dibuat: `chore(db): kolom legalitas akademi dan bucket legality (landing-b0)`.

## B1. Perbaikan admin yang memblokir data beranda (C1)

**Files:** Modify `app/(admin)/admin/program/actions.ts`

- [ ] **Step 1:** Di `addProgramVideo`, insert `media_assets` menambah `consent_at: new Date().toISOString()` (sama seperti `app/api/upload/route.ts:92`). Pemilik menempelkan tautan video yang sudah berizin; tidak ada perubahan UI.
- [ ] **Step 2:** `npx tsc --noEmit`; commit `fix(admin): video program menyimpan consent agar lolos constraint publikasi (landing-b1)`.

## B2. Kompresi gambar (C2, C6)

**Files:** Modify `next.config.ts`

- [ ] **Step 1:** Baca `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md` (bagian `qualities`, `localPatterns`, `remotePatterns`).
- [ ] **Step 2:** `images.qualities: [75, 85, 90]`, `images.formats: ["image/avif", "image/webp"]`, `remotePatterns` tambah `{ protocol: "https", hostname: "i.ytimg.com" }`. Bila memakai `localPatterns`, ikutkan `/api/media/**`, `/images/**`, `/logo-white.png`, dan path lokal lain yang ditemukan dengan `grep -rn 'src="/' components app`.
- [ ] **Step 3:** Petak galeri `quality={85}`; lightbox `quality={90}`; foto hero `quality={85}` (berkas: `bento-gallery.tsx`, `hero-section.tsx`).
- [ ] **Step 4:** Verifikasi dengan satu media terbit: `curl -sI "http://localhost:3000/_next/image?url=%2Fapi%2Fmedia%2F<id>&w=828&q=85"` → 200, `content-type: image/avif|webp`. Gagal mengikuti redirect 302 → fallback: `readHomeData()` membuat signed URL Supabase (umur ≥ 1 jam) dan `src` memakai URL itu (`**.supabase.co` sudah ada di `remotePatterns`). Catat jalur yang dipakai di pesan commit.
- [ ] **Step 5:** commit `perf(web): gambar beranda terkompresi dan poster YouTube diizinkan (landing-b2)`.

## B3. Kontrak data diperbarui (C4)

**Files:** Modify `lib/home-data.ts`, `lib/home-dummy.ts`, `components/home/testimonial-slider.tsx`

- [ ] **Step 1:** `HomeTestimonial` tambah `photoUrl: string | null`. `HomeData` tambah `legality: { akta: string | null; nib: string | null; skt: string | null; npwpFront: string | null; npwpBack: string | null }`.
- [ ] **Step 2:** `home-dummy.ts`: testimoni `photoUrl: null` (data contoh tidak memakai wajah); `legality` semua `null`.
- [ ] **Step 3:** Slider: bila `photoUrl` ada, tampilkan foto bulat 44px (`aspect-square rounded-full`, `object-cover`) menggantikan monogram; bila tidak, monogram tetap.
- [ ] **Step 4:** `node --test lib/home-dummy.test.mjs lib/home-layout.test.mjs`, `npx tsc --noEmit`; commit `feat(web): kontrak data beranda memuat foto testimoni dan legalitas (landing-b3)`.

## B4. Pembaca data beranda

**Files:** Create `lib/server/home-sources.ts`; Modify `lib/server/program-galleries.ts`, `lib/server/home-data.ts`; Create `lib/home-derive.ts` + `lib/home-derive.test.mjs`

**Interfaces (Produces):**

```ts
// lib/home-derive.ts (murni, tanpa server-only — dites node --test)
export function toHomeMedia(item: ProgramMediaItem): HomeMedia;           // poster video = i.ytimg.com/vi/{youtubeId}/hqdefault.jpg
export function pickHeroPhoto(programs: HomeProgram[], inhouse: HomeMedia[]): HomeMedia | null; // foto pertama: series → speakers → sertifikasi → inhouse
export function buildMoments(programs: HomeProgram[], inhouse: HomeMedia[], exclude: number[]): HomeMedia[]; // semua foto unik, tanpa id di exclude, urutan bergantian antarprogram
export function nextBatchOf(cards: ProgramCard[]): HomeData["hero"]["nextBatch"]; // kartu dengan registrationUrl, tanggal sesi pertama paling awal
```

- [ ] **Step 1: Tes dulu** `lib/home-derive.test.mjs`:
  - `pickHeroPhoto` mengembalikan foto pertama series; tanpa foto series → speakers; semua kosong → `null`.
  - `buildMoments` tidak memuat id hero, tidak ada `src` ganda, foto video tidak ikut.
  - `nextBatchOf` memilih tanggal paling awal di antara kartu yang dibuka; tidak ada yang dibuka → `null`.
  - `toHomeMedia` video → `poster` berisi `i.ytimg.com`, foto → `poster: null`.
  Jalankan → FAIL.
- [ ] **Step 2:** Implementasi `lib/home-derive.ts` → tes PASS.
- [ ] **Step 3:** `program-galleries.ts`: kueri tambah `&consent_at=not.is.null` (RLS sudah menyaring, tetapi pembacaan service tidak). Hasil tetap `Record<slug, ProgramGallery>`.
- [ ] **Step 4:** `lib/server/home-sources.ts` (`import "server-only"`), masing-masing `try/catch` → nilai kosong, tidak pernah melempar:
  - `readInhouseGallery(): Promise<HomeMedia[]>` — `gallery?select=id,image_url,title&consent_verified_at=not.is.null&order=id.desc` → `{ id: 100000 + id, kind: "image", src: image_url, poster: null, alt: title ?? "Dokumentasi Inhouse Training" }` (id digeser agar tidak bentrok dengan `media_assets`).
  - `readPartners(): Promise<HomePartner[]>` — `academy_partners?select=id,name,logo_url&published=eq.true&order=sort_order,id`.
  - `readTestimonials(): Promise<HomeTestimonial[]>` — `testimonials?select=id,attribution,quote,role_label,photo_url&published=eq.true&consent_at=not.is.null&order=id.desc&limit=12`.
  - `readLegality(): Promise<HomeData["legality"]>` — `academy?select=legality&id=eq.1&limit=1`; kolom tidak ada atau kosong → semua `null`.
- [ ] **Step 5:** `readHomeData()` merakit semuanya:
  - `programs`: `readProgramShowcase()` (gagal → `"failed"`), tiga slug Public Training berurutan; `media` = foto + video `readProgramGalleries()[slug]` lewat `toHomeMedia`; `bundleNote` dari `bundle_offers?select=speaker_program_slug,certification_program_slug&active=eq.true&placement_scope=eq.program` (logika teks: kartu speaker → "Tersedia paket dengan Sertifikasi", kartu sertifikasi → "Tersedia paket dengan Speaker").
  - `inhouse`: kartu `inhouse-training`, `whatsappHref` dari `readPublishedContacts()` + `contactHref`, `media` = `readInhouseGallery()` + galeri `inhouse-training`, `partners` = `readPartners()`.
  - `hero`: `photo = pickHeroPhoto(...)`, `openPrograms` = jumlah kartu Public Training dengan `registrationUrl`, `nextBatch = nextBatchOf(...)`.
  - `moments = buildMoments(programs, inhouse.media, [hero.photo.id])`. Komponen membaca indeks tetap (0–2 Cara belajar, 3–5 Penutup, 10 hero kecil, 11 Tentang); indeks yang tidak ada → bagian itu tidak dirender (sudah ditangani komponen dengan `?? null`).
  - `testimonials = readTestimonials()`, `legality = readLegality()`, `preview: false`.
  - Hapus impor `HOME_DUMMY` dari berkas ini.
- [ ] **Step 6:** `npx tsc --noEmit`, `node --test lib/home-derive.test.mjs`; commit `feat(web): beranda membaca data program, galeri, partner, testimoni, dan legalitas (landing-b4)`.

## B5. Komponen memakai data nyata

**Files:** Modify `components/home/legality-section.tsx`, `components/home/trainer-section.tsx`, `components/home/home-page.tsx`

- [ ] **Step 1: Legalitas.** `LegalitySection({ legality })`. Pemetaan gambar: Akta → `akta`, NIB → `nib`, SKT → `skt`, NPWP → `npwpFront` (bila `npwpBack` ada, tampilkan sebagai foto kedua kecil di bawahnya). URL `null` → kartu tanpa gambar (hanya teks; **jangan** memakai gambar contoh). Hapus `SAMPLE_PREVIEW` dan baris "Contoh tampilan dokumen". Gambar dari bucket publik memakai `next/image` biasa (bukan `unoptimized`).
- [ ] **Step 2: Trainer (C5).** Bila B0 menemukan kolom `trainers.published`, tambahkan `&published=eq.true` ke kueri. Bila tidak ada, biarkan dan catat.
- [ ] **Step 3:** `home-page.tsx` meneruskan `data.legality` ke `LegalitySection`.
- [ ] **Step 4:** `npx tsc --noEmit`, `npx eslint components/home`; commit `feat(web): legalitas dan trainer beranda memakai data admin (landing-b5)`.

## B6. Keadaan kosong dan gagal

Uji di data dev, kembalikan data setelahnya. Bila ada yang rusak, perbaiki di komponen terkait.

- [ ] Program tanpa foto → kotak "Dokumentasi kelas ini tampil setelah batch pertama berjalan.", tanpa galeri, tanpa jeda video.
- [ ] Program dengan 1, 2, 3, 4, 8, 10, 20 foto → pratinjau 2 foto + galeri (1–3 foto satu baris penuh; 4/8/10 mosaik; sisa lewat "Lihat semua dokumentasi").
- [ ] Program dengan video → jeda video setelah seksinya; klik memuat `iframe` YouTube.
- [ ] Program tanpa batch → "Jadwal menyusul", harga "—", tanpa tombol Daftar.
- [ ] Tidak ada testimoni terbit → seksi testimoni hilang.
- [ ] Tidak ada partner terbit → bagian "Pernah melatih" hilang.
- [ ] Legalitas tanpa URL → kartu teks saja.
- [ ] Supabase tidak terjangkau → "Program belum bisa dimuat." + tombol coba lagi; seksi lain kosong tanpa galat.

## B7. Hapus data contoh

- [ ] **Step 1:** Hapus `lib/home-dummy.ts`, `lib/home-dummy.test.mjs`, `components/home/preview-banner.tsx`, field `preview` di `HomeData`, `public/images/preview/dokumen-contoh.svg`. Entri `testimonial-slider` dan galeri di `lib/home-layout.test.mjs` tetap.
- [ ] **Step 2:** `grep -rn "home-dummy\|HOME_DUMMY\|PreviewBanner\|contoh visual\|dokumen-contoh" app components lib` → kosong.
- [ ] **Step 3:** `/images/preview/*` tidak lagi dirujuk oleh komponen beranda (`grep -rn "images/preview" components/home lib`). Berkasnya **tidak** dihapus (dipakai halaman pratinjau register).
- [ ] **Step 4:** `npx tsc --noEmit && npm run build`; commit `feat(web): beranda tanpa data contoh (landing-b7)`.

## B8. Perbarui dokumen

- [ ] Konten Home §12: hapus kalimat yang menyebut data contoh; tambahkan tabel D1–D17 ringkas ("data dari modul admin …") agar pemilik tahu di mana mengubah tiap bagian.
- [ ] `front/AGENTS.md` baris "Beranda dan konten publik": tambahkan `lib/server/home-data.ts` dan `lib/home-derive.ts` sebagai titik masuk data.
- [ ] Commit `docs: peta data beranda ke modul admin (landing-b8)`.

## B9. Verifikasi akhir

Panel peramban harus terlihat. Lebar 1280 dan 390, tema terang dan gelap.

- [ ] Tidak ada banner pratinjau; tidak ada teks "contoh".
- [ ] Foto program, galeri, video, partner, testimoni, legalitas berasal dari data admin (cek satu per satu dengan mengubah satu data di admin dan memuat ulang beranda).
- [ ] `/_next/image` mengirim AVIF/WebP (B2 Step 4).
- [ ] Tidak ada gulir mendatar; tidak ada gambar rusak (`[...document.images].filter(i => i.complete && !i.naturalWidth).length === 0`).
- [ ] `node --test lib/*.test.mjs` untuk berkas beranda (`bento*`, `home-*`, `tones`, `motion`) → PASS; `npm run build` → sukses.

---

## 7. Risiko dan Review Focus

1. **Fase A ter-deploy dengan data contoh** → banner pratinjau dan aturan §0; Fase B Tugas B6 menghapus semua jejak.
2. **Data contoh terbaca sebagai fakta** (nama orang, nama perusahaan, harga) → aturan §0: penanda pada foto, testimoni tanpa nama orang, partner tanpa nama perusahaan, batch berlabel "Contoh".
3. **Lubang di bento** → tes A1 (b).
4. **Optimizer Next tidak mengikuti redirect `/api/media/[id]`** → B2 Step 4.
10. **Video program gagal tersimpan** karena constraint `media_assets_published_has_consent` → B1.
11. **Kolom `academy.legality` / bucket `legality` tidak ada di database** → B0 Step 2.
5. **Kerangka kosong** untuk program tanpa media atau tanpa batch → R7, R9; Sertifikasi contoh menguji ini di Fase A.
6. **Testimoni tidak muncul di Fase B** karena data kosong, bukan bug → B6.
7. **Dua tombol utama dalam satu seksi** — hero, panel batch, Inhouse.
8. **Ringkasan daftar tidak kembali** saat "Kembali" ke langkah 1 → A8 Step 3.
9. **Logo partner putih tak terbaca** di salah satu tema → uji dua tema.

## 8. Di luar cakupan

- Warna, font, dan token (`app/globals.css`).
- Admin dan unggahan media (`/api/upload`, `lib/media-prepare.ts`), **kecuali** satu perbaikan `consent_at` di `addProgramVideo` (Tugas B1).
- Logika, validasi, dan isi langkah form daftar.
- Isi seksi babak 3, 5, 6, 7, dan penutup — hanya urutannya yang dipastikan; datanya sudah nyata.
- Halaman `/program/[slug]` — hanya ikut memakai `toProgramMedia` di Fase B.
