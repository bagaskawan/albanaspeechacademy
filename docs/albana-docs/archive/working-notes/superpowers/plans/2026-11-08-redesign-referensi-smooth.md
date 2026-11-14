# Redesign referensi "smooth" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (native) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ganti bahasa visual beranda `/` dan `/register` ke arah referensi (pewarnaan lembut, tanpa `font-mono`, panel besar, kartu bernomor, rail kiri) tanpa mengubah naskah atau logika data.

**Architecture:** Token warna/bentuk/tipografi baru di `web/app/globals.css`; pewarnaan memakai utility Tailwind v4 yang dihasilkan dari token (`bg-panel`, `text-muted`, dll). Mono dihapus dengan membuang impor font di `layout.tsx` dan mengganti tiap pemakaian `font-mono`/`.eyebrow` ke sans. Tata letak B diterapkan lewat className di komponen seksi; satu komponen baru untuk rail kiri.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4 (plugin `@tailwindcss/turbopack`), tanpa test runner.

**Spec:** `docs/archive/working-notes/superpowers/specs/2026-11-08-redesign-referensi-smooth-design.md`

## Global Constraints

- Palet: canvas `#F7F4EE`, panel `#CBD9E7`, panel-soft `#E6EDF4`, card `#FFFFFF`, ink `#15171B`, muted `#5C6470`, accent `#2F5C86`, accent-strong `#24486A`, rule `#DDE2E9`; pastel sage `#A7B7A9`, sand `#E6D9C4`, clay `#C58A78`, sun `#E7C75D`.
- Radius: panel/kartu `12px`, kontrol `10px`.
- Tanpa IBM Plex Mono; satu keluarga sans (Franklin Gothic ATF, fallback Arial).
- Kontras teks ≥4.5:1, kontrol/fokus ≥3:1; target 44 px; focus terlihat; reduced motion.
- Naskah, urutan seksi, aturan editorial, dan logika data tidak berubah.
- Tidak menambah dependensi.
- Verifikasi gaya lama tetap di `docs/style-backup/`.

## Review Focus (kemungkinan gagal yang harus dipin)

1. Judul program panjang / teks diperbesar 200% tidak memotong atau menimbulkan scroll horizontal pada 320 px.
2. Palet lembut menurunkan kontras di bawah 4.5:1 (khusus `muted` di atas `panel`/`panel-soft`).
3. Kartu program berdampingan (flex) dengan isi tidak sama panjang: tinggi tidak rata / tombol tidak sejajar.
4. Fokus keyboard pada rail kiri dan tautan vertikal harus terlihat dan tidak terpotong.
5. Placeholder media (foto belum berizin) runtuh bersih tanpa menyisakan ruang kosong.

---

### Task 1: Fondasi token, bentuk, dan hapus mono

**Files:**
- Modify: `web/app/globals.css` (`@theme inline`, `.eyebrow`, `.card`, `:root`, base)
- Modify: `web/app/layout.tsx` (hapus impor IBM Plex Mono)
- Modify: komponen pemakai `font-mono` (ganti ke sans)

**Interfaces:**
- Produces token warna/radius (lihat Global Constraints) + `.eyebrow` sans.
- Produces: tidak ada kelas `font-mono` tersisa.

- [ ] **Step 1:** Ganti blok `@theme inline` di `globals.css` ke palet/radius baru; tambah token pastel.
- [ ] **Step 2:** Ubah `.eyebrow` (dan pemakaian `font-mono`) menjadi sans dengan tracking; hapus token `--font-mono`.
- [ ] **Step 3:** Di `layout.tsx`, hapus `import { IBM_Plex_Mono }`, konstanta, dan `className` variabel pada `<body>`.
- [ ] **Step 4:** Verifikasi: `Select-String font-mono web/**/*.tsx` kosong; `npx --no-install tsc --noEmit` exit 0; `npm run lint` 0 error; `npm run build` sukses dan CSS memuat token baru.

### Task 2: Rail kiri (desktop ≥1024)

**Files:**
- Create: `web/components/layout/section-rail.tsx`
- Modify: `web/components/home/home-page.tsx` (render rail)

**Interfaces:**
- Produces: `SectionRail()` — `<nav>` tetap di kiri, label seksi vertikal + tautan Instagram; hanya tampil ≥1024 px.

- [ ] **Step 1:** Buat `SectionRail` dengan label seksi (`Alan, Program, Cara ngajar, Trainer, Kontak`) vertikal dan tautan Instagram; `aria-label` jelas.
- [ ] **Step 2:** Render di `HomePage` di dalam wrapper, `hidden lg:flex`.
- [ ] **Step 3:** Verifikasi: render ≥1024 menampilkan rail, <1024 tersembunyi; fokus terlihat; `npm run build` sukses.

### Task 3: Hero + Perkenalan Alan (panel & display besar)

**Files:**
- Modify: `web/components/home/hero-section.tsx`, `web/components/home/alan-intro-section.tsx`

**Interfaces:** Consumes token Task 1.

- [ ] **Step 1:** Hero: H1 display besar (bobot/tracking tinggi), dua kolom teks kecil, bidang `bg-panel`; potret/bentuk tanpa foto stok.
- [ ] **Step 2:** Alan intro: bungkus panel lembut; ganti label mono ke `.eyebrow` sans.
- [ ] **Step 3:** Verifikasi: render 1440/834/390/320 tanpa scroll horizontal; `npm run build` sukses.

### Task 4: Program + kartu program bernomor

**Files:**
- Modify: `web/components/home/program-section.tsx`, `web/components/home/program-showcase-section.tsx`, `web/components/home/program-card.tsx`

- [ ] **Step 1:** Bidang program bernomor indeks; kartu program menampilkan nomor besar 01/02 di bidang panel.
- [ ] **Step 2:** Verifikasi: dua kartu berdampingan (flex) sama tinggi; tombol sejajar; tanpa `font-mono`.

### Task 5: Cara ngajar, Trainer, Dokumentasi, Testimoni

**Files:**
- Modify: `learning-method-section.tsx`, `trainer-section.tsx`, `trainer-gallery.tsx`, `documentation-section.tsx`, `testimonial-section.tsx`

- [ ] **Step 1:** Panel lembut; angka besar pakai sans; placeholder monogram di bidang pastel.
- [ ] **Step 2:** Verifikasi: label "Contoh pratinjau" tetap; gambar gagal runtuh bersih.

### Task 6: Format pelatihan, Kontak, Footer, Header

**Files:**
- Modify: `training-format-section.tsx`, `contact-section.tsx`, `site-header.tsx`, `site-footer.tsx`

- [ ] **Step 1:** Dua panel; header/footer memakai permukaan lembut dan radius baru.
- [ ] **Step 2:** Verifikasi: nav keyboard, panel menu, tautan footer; build sukses.

### Task 7: `/register` paritas

**Files:**
- Modify: `web/components/register/register-page.tsx`, `web/components/registration/batch-card.tsx`, `web/components/ui/preview-notice.tsx`

- [ ] **Step 1:** Terapkan token + hpus mono + radius; jaga alur & validasi.
- [ ] **Step 2:** Verifikasi: render `/register`, build sukses.

### Task 8: Dokumen & verifikasi akhir

**Files:**
- Modify: `docs/design.md` (arah visual baru; gaya lama tetap di `docs/style-backup/`)

- [ ] **Step 1:** Tulis ulang bagian arah visual/tipografi/warna `design.md` ke bahasa baru.
- [ ] **Step 2:** Verifikasi akhir: `npx --no-install tsc --noEmit`, `npm run lint`, `npm run build` lulus; grep `font-mono` kosong; render 1440/834/390/320.
