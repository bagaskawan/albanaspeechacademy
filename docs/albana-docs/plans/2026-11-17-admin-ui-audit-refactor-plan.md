# Audit dan Refactor UI Admin, Program, Media, dan Beranda — Rencana Implementasi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Revisi 3 — 17 November 2026.** Revisi 1 memuat Tugas 1–7 (audit UI admin). Revisi 2 menambah hapus Media, rombak Program, pipeline dokumentasi, dan beranda. **Revisi 3** mengganti gaya isian target dari Model A (pil 48 px) menjadi **komponen shadcn/ui yang sudah terpasang**, dan menetapkan **satu header per halaman form**. Tugas 1 Revisi 2 sudah dieksekusi di commit `34fefe7`; Tugas 1 di bawah ini adalah pengerjaan ulangnya.

**Goal:** Satu gaya isian (**shadcn/ui**: `Input`, `Textarea`, `Select`, `Label`) untuk seluruh form admin dan satu header per halaman form; daftar tagihan berbentuk tabel dengan modal Detail; semua modal admin menjadi bottom sheet di ponsel; modul Media hilang dan galeri dokumentasi pindah ke form tiap sub-program; sidebar menjadi Dashboard · Pendaftaran · Program · Konten; dan beranda menampilkan Public Training per program plus satu blok In House Training.

**Architecture:**

- **Gaya isian** memakai komponen shadcn/ui yang sudah ada di repo (`components.json`, style `radix-nova`): `components/ui/Input.tsx`, `textarea.tsx`, `select.tsx`, `label.tsx`. `.admin-shell` sudah memetakan token shadcn ke token admin (`--input` → `--admin-line`, `--ring` → `--admin-ink`), jadi tampilannya monokrom tanpa komponen baru. Yang harus dibuang adalah aturan CSS isian global admin dan `.admin-form-plain`: keduanya tidak berada di layer, sehingga selalu menang atas kelas utilitas shadcn.
- **Bottom sheet** sudah ada di `FormDialog`. Cangkangnya diangkat menjadi `AdminSheet` dan dipakai semua dialog admin.
- **Media** tidak punya layar sendiri lagi. Tabel `media_assets`, `POST /api/upload` (Sharp → WebP), dan `GET /api/media/[id]` (signed URL bucket privat) tetap menjadi lapisan penyimpanan; yang hilang adalah modul CMS-nya. Editor galeri menempel di form tiap program.
- **`/admin/program`** menjadi satu layar: Public Training (tiga program tetap, batch, tawaran paket) dan In House Training (Gallery Kegiatan dan Our Partner).
- **Beranda** memakai dua seksi baru yang menyusun ulang data yang sudah dibaca `lib/server/program-showcase.ts`, ditambah satu pembacaan galeri per program.
- Logika yang punya aturan nyata diletakkan di modul murni di `lib/` dan dites `node --test`: baris tagihan, batas jumlah media, dan daftar menu sidebar. Sisanya visual dan diverifikasi di peramban.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind 4, Radix Dialog, Motion, Supabase Storage, Sharp, `node --test`.

**Spec:** Permintaan pemilik 17 November 2026 (lima butir Revisi 1 dan empat butir Revisi 2), dengan [pola UI admin](../design/admin-ui-patterns.md) sebagai acuan bentuk dan [pipeline kompresi gambar](../../design-global/image-compression-storage-pipeline.md) sebagai acuan unggah. Tidak ada dokumen rancangan terpisah; tabel keputusan di bawah inilah yang mengikat.

## Keputusan pemilik

| # | Keputusan |
| --- | --- |
| K1 | *(Revisi 3)* `InputLine`, `TextareaLine`, `SelectLine`, dan Model A (`.admin-form-plain`, pil 48 px) **tidak dipakai lagi di admin**. Semua form admin memakai **shadcn/ui**: `Input`, `Textarea`, `Select` (Radix), dan `Label`, disusun dengan `Field`/`FieldGrid`. |
| K2 | *(Revisi 3)* Tipografi isian mengikuti shadcn: label **14 px medium, huruf kalimat** (bukan kapital); teks isian **14 px di desktop dan 16 px di bawah 768 px** (bawaan `text-base md:text-sm`, mencegah zoom Safari iOS). Menggantikan 11/12 px Revisi 2. |
| K3 | Tagihan desktop: **satu baris per tagihan**, kolom Dibuat · Nama · Program–batch · Tahap · Total · Status · Aksi. Tombol **Detail** membuka modal berisi data pendaftar dan seluruh tagihannya. |
| K4 | Semua modal admin menjadi **bottom sheet di bawah 640 px**. |
| K5 | Grup **Pengaturan hilang dari sidebar**. `/admin/profil-akademi`, `/admin/kontak`, dan `/admin/rekening` **dialihkan** ke `/admin/settings` dengan tab yang sesuai. |
| K6 | Cakupan hanya **modul Albana aktif**. Modul komunitas lama dibiarkan apa adanya; rutenya sudah 404 lewat `lib/albana-routes.ts`. |
| K7 | **Modul Media dihapus**: menu, rute `/admin/media`, halaman, dan komponennya. Galeri foto dan tautan YouTube **berada di form tiap sub-program**. |
| K8 | Menu **"Kelas" menjadi "Program"**. `/admin/program` memuat **Public Training** (Public Speaking Series; Public Speaking for Speakers dan Sertifikasi, keduanya mendukung tawaran paket) dan **In House Training** (Gallery Kegiatan dan Our Partner). Galeri dan Partner **keluar dari grup Konten**; sidebar menjadi Dashboard · Pendaftaran · Program · Konten (Artikel, Testimoni, Trainer). |
| K9 | Unggahan gambar **otomatis dikompresi ke WebP** dengan kualitas visual dijaga. |
| K10 | Per program: **maksimal 20 foto** (peringatan mulai 15) dan **1–2 tautan YouTube** unlisted atau private. |
| K11 | Beranda **Public Training**: judul makro + intro, lalu **satu seksi per program** berisi nama, deskripsi, galeri dokumentasi (foto dan video), serta CTA **Daftar** dan **Lihat Jadwal**. |
| K12 | Beranda **In House Training**: judul makro + intro, galeri dokumentasi kegiatan, dan grid logo **Our Partner**. Seksi Dokumentasi dan Partners Strip yang berdiri sendiri **dilebur** ke blok ini. |
| K13 | **Satu header per halaman form.** Header shell (judul modul + tombol kembali + breadcrumb) dipertahankan; header buatan form sendiri (`[ PENGATURAN PROGRAM ] Edit Program` beserta tombol kembali keduanya) dihapus. Label modul **"Program & Batch" menjadi "Program"**. |

## Keputusan pembangun rencana (koreksi bila keliru)

| # | Keputusan | Alasan |
| --- | --- | --- |
| P1 | `media_assets`, `/api/upload`, dan `/api/media/[id]` **tetap** menjadi penyimpanan galeri program. Yang dihapus hanya modul CMS Media. | K7 meminta galerinya ada di form per sub-program, dan galeri harus punya penyimpanan. Membuat penyimpanan baru berarti membuang pipeline WebP, bucket privat, dan signed URL yang sudah jalan, lalu kehilangan foto yang sudah ada. |
| P2 | Foto dan video yang ditambahkan dari form program **langsung terbit** (`published = true`); tidak ada gerbang draf per berkas. | Admin memilihnya sendiri di form program itu, jadi langkah terbit terpisah hanya menambah gesekan. Pemilik bisa minta gerbang draf kembali. |
| P3 | Kartu In House Training di `/admin/program` menampilkan ringkasan (**N foto**, **N logo**) dengan tombol **Kelola** ke `/admin/galeri` dan `/admin/partner`. Kedua rute tetap sebagai halaman, tetapi keluar dari sidebar. | Keduanya sudah punya CMS yang bekerja. Membangun ulang keduanya di dalam kartu berarti menulis dua layar baru tanpa tambahan kemampuan. Program tetap menjadi satu-satunya pintu masuk, sesuai K8. |
| P4 | Batas resolusi minimum unggahan **tidak lagi dapat diubah dari CMS** setelah modul Media hilang. `/api/upload` memakai nilai bawaan 1280×720 dan sisi pendek video 720 bila baris `system_settings` tidak ada. | Satu-satunya editornya adalah halaman Media. Perilaku fallback itu sudah ada di kode. |
| P5 | Tinggi isian admin **40 px di desktop dan 44 px di bawah 768 px**, lewat satu aturan `@layer components` berbasis `data-slot`. | Bawaan `Input` di repo ini `h-8` (32 px): rapi, tetapi di bawah target sentuh admin. Satu aturan berlapis lebih aman daripada menulis kelas tinggi di puluhan isian, dan kelas per isian tetap bisa menimpanya. |
| P6 | Form Program memakai `FormPage` + `FormSection` yang sudah ada, menggantikan kartu, header, dan footer buatannya sendiri. | Satu pola halaman form untuk seluruh admin; `FormPage` sudah memberi kartu putih, seksi bernomor, serta Batal + Simpan di kanan bawah. |

## Global Constraints

- Semua perintah dari `front/`. Baca `front/AGENTS.md`; untuk API Next.js baca `node_modules/next/dist/docs/`.
- Isian admin memakai **shadcn/ui**, tepat: `import { Input } from "@/components/ui/Input"` (huruf besar **I**, sesuai nama berkas; build Linux peka huruf), `Textarea` dari `@/components/ui/textarea`, `Label` dari `@/components/ui/label`, `Select`/`SelectTrigger`/`SelectValue`/`SelectContent`/`SelectItem` dari `@/components/ui/select`. Label 14 px medium huruf kalimat; petunjuk dan galat `text-[13px]`; teks isian bawaan shadcn (`text-base md:text-sm`). Checkbox dan radio tetap kontrol bawaan dengan `accent-[var(--admin-ink)]`.
- `input.admin-search` (TableToolbar) **tidak diubah**: tetap 14 px, 16 px di bawah 768 px. Itu kolom cari, bukan isian form, dan punya paragrafnya sendiri di pola UI admin §8.2.
- Token admin saja di dalam `.admin-shell`: `--admin-*`. Tidak ada warna biru, tidak ada kelas `zinc-*`, dan tidak ada token situs publik (`border-rule`, `bg-card`, `text-muted`, `button-primary`).
- Beranda memakai token situs publik seperti sekarang; jangan membawa token `--admin-*` ke sana.
- Target sentuh minimal 44 px. Setiap isian punya `<label htmlFor>` atau `aria-label`; pesan galat memakai `role="alert"`. Setiap gambar punya `alt` yang bermakna, dan sematan YouTube punya `title`.
- Setiap halaman dan Server Action admin memanggil `requireAdminMember()`. Hapus tetap `requireAdminMember("adminsuper")`.
- **Batas jumlah media dipaksakan di server**, di `POST /api/upload` dan di Server Action penambahan video, bukan hanya di UI. UI hanya mencegah lebih awal.
- Data peserta, tagihan, rekening, dan token privat: jangan ke props client yang tidak perlu, jangan ke log, jangan ke halaman publik.
- Perubahan skema lewat migrasi baru di `front/supabase/migrations/`, bukan dengan mengubah tipe atau kueri aplikasi saja.
- Modul yang masuk cakupan: Program, Trainer, Testimoni, Galeri, Partner, Artikel, Pendaftar, Tagihan, Kontak, Profil akademi, Rekening, Settings, dan beranda publik. **Di luar cakupan:** `app/(admin)/admin/{acara,members,mentoring,venue,voucher,referral,attendance,payment,resources,revenue,transactions,admins,affiliate-payout,confirmation,funnel,logs,packages}` dan berkas berikut yang masih terkompilasi tetapi tidak dirender rute mana pun: `app/(admin)/admin/settings/{SettingsClient.tsx,panels/}`, `galeri/GaleriCMSClient.tsx`, `galeri/addGallery/`, `partner/PartnerClient.tsx`, `partner/addPartner/`, `pendaftar/PendaftarClient.tsx`. Jangan diubah dan jangan dihapus di rencana ini; sebut saja bila ditemukan.
- Satu tugas = satu commit; pesan menyebut nomor tugas `admin-ui-N`. Akhiri pesan commit dengan `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- Pohon kerja memuat perubahan pemilik yang belum di-commit, antara lain di `app/globals.css`, `app/layout.tsx`, `components/admin/shell/AdminShell.tsx`, `app/(admin)/admin/galeri/page.tsx`, `components/admin/cms/CmsCollectionClient.tsx`, dan beberapa berkas `components/home/`. Jangan dibuang; `git add` hanya berkas tugas itu, dan laporkan bila commit ikut membawanya.
- Pemeriksaan tiap tugas: `npx tsc --noEmit`, `npx eslint <berkas yang disentuh>`, dan tes `.test.mjs` yang relevan. `npm run build` pada Tugas 1, 5, 7, 8, dan 10.
- **Dua berkas tes sudah merah sebelum pekerjaan ini** karena mengimpor modul tanpa akhiran `.ts`: `lib/admin-list.test.mjs` (`./format`) dan `lib/cms-validation.test.mjs` (`./cms-fields`). Jangan diperbaiki di rencana ini; laporkan apa adanya.
- Pemeriksaan visual: `preview_start` nama `front`. **Port 3000 dipegang proses `next dev` yatim**, jadi `.claude/launch.json` memakai 3002. Halaman admin perlu sesi pemilik; jangan mengetik kredensial.

## Keadaan sekarang (hasil audit 17 November 2026)

### Gaya isian

Tiga gaya hidup berdampingan di admin aktif:

| Gaya                                        | Bentuk                                                                 | Dipakai oleh                                                                                                                                                                                      |
| ------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A — `.admin-form-plain` (dibuang, Revisi 3)        | Pil 48 px, radius 999, latar abu, label `Field`, kontrol polos         | `FormDialog`, `FormPage` → modal Rekening, modal Batch dan Paket                                                                                                                                  |
| B — `InputLine`/`TextareaLine`/`SelectLine` | Garis bawah, label 11 px kapital, teks 12 px, **fokus biru `#2F5C86`** | `components/admin/ProgramForm.tsx`, `components/admin/cms/CmsCollectionClient.tsx` → Trainer, Testimoni, Galeri                                                                                   |
| C — kelas buatan sendiri                    | `rounded-xl border px-3.5 py-2.5 text-sm`, label 12 px kapital         | `kontak/KontakClient.tsx`, `profil-akademi/ProfilAkademiClient.tsx` (keduanya membungkus `admin-form-plain` lalu menimpanya), `partner/page.tsx`, `media/page.tsx`, `media/AlbanaMediaUpload.tsx` |

### Lainnya

- `app/(admin)/admin/tagihan/page.tsx` menampilkan kartu `<article>` di semua lebar, memakai token situs publik.
- `FormDialog` sudah bottom sheet di bawah 640 px. `components/ui/dialog.tsx` **tidak**: `DialogContent` selalu di tengah (`rounded-none sm:rounded-[24px]`). Di admin aktif dipakai `DeleteConfirmDialog` (lewat `RowActions`, jadi ada di semua daftar), dialog form `CmsCollectionClient`, dan dialog konfirmasi `ArticleEditor`.
- `AdminShell.tsx` merender `const [dashboard, ...groups] = adminNavGroups` lalu `groups.map`, dan menyaring modul ber-`hidden`.
- `/admin/settings` sudah menerima `?tab=`, dan `settings/page.tsx` merender ketiga **module page** sebagai panel. Karena itu ketiga `page.tsx` tidak bisa langsung menjadi pengalihan tanpa memindahkan pemuat datanya lebih dulu (Tugas 6).
- **Kompresi WebP sudah jalan.** `POST /api/upload` memanggil `prepareImage()` di `lib/media-prepare.ts`: Sharp membaca metadata, menolak format di luar JPEG/PNG/WebP dan gambar beranimasi, lalu mencoba kualitas `[90, 84, 78, 72]` sampai ukurannya masuk. Minimum resolusi dibaca dari `system_settings`, dengan fallback 1280×720 dan sisi pendek video 720. Bucket `academy-media` privat untuk media program; bucket `gallery` publik untuk `purpose=landing`. Jadi K9 **tidak perlu kode baru**; yang perlu hanya unggah banyak berkas dan batas jumlah.
- `media_assets` sudah punya `program_slug`, `batch_slug`, `provider` (`supabase_storage` atau `youtube`), `kind` (`image` atau `video`), `object_key`, `alt_text`, `published`, `created_at`.
- `lib/server/program-showcase.ts` sudah menyediakan `readProgramDetail(slug)` yang membaca media terbit per program; `readProgramShowcase()` belum membaca media.
- Beranda sekarang: `HeroSection`, `BenefitBand`, `ProgramShowcaseSection` (tiga kartu + Inhouse), `PracticePreviewSection`, `AboutSection`, `LearningMethodChapter`, `PartnersStrip`, `TestimonialChapter`, `DocumentationSection`, `TrainerSection`, `ScheduleSection`, `RegistrationStepsSection`, `ClosingSection`.

## Review Focus

1. **Safari iOS nge-zoom saat isian difokus.** Teks isian harus 16 px di bawah 768 px. Bawaan shadcn `text-base md:text-sm` sudah memberikannya; jangan menimpanya dengan kelas ukuran font per isian. → Tugas 1, diukur di 390 px.
2. **Pemilih tanggal dan jam bawaan pada 12 px.** `type="date"` dan `type="time"` di modal Batch bisa memotong ikon atau teksnya. → Tugas 1.
3. **`SelectLine` diganti `Select` shadcn.** Harus ikut token admin, tidak berfokus biru, tetap bisa dipakai dari papan tuts (Radix menangani panah, ketik-cari, dan Escape), dan isinya tidak terpotong saat dibuka di dalam bottom sheet. → Tugas 2.
4. **Bottom sheet konfirmasi hapus di layar 360 px.** Tombol Hapus tidak boleh jatuh di bawah lipatan dan sheet tidak boleh mengunci gulir halaman setelah ditutup. → Tugas 4.
5. **Pendaftaran tanpa tagihan hilang dari tabel per-tagihan.** → tes `invoiceRows` dengan daftar tagihan kosong, Tugas 5.
6. **Breadcrumb dan judul halaman setelah grup Pengaturan hilang dari sidebar.** `resolveAdminNav` membaca daftar yang sama. → tes di Tugas 6.
7. **Batas 20 foto ditembus lewat permintaan langsung.** UI boleh mencegah, tetapi `POST /api/upload` adalah batas kepercayaan: dua unggahan serentak pada foto ke-20 tidak boleh menghasilkan 21 baris. → tes `mediaCapacity` dan penghitungan ulang di server, Tugas 8.
8. **Galeri program publik mati setelah modul Media dihapus.** `/api/media/[id]` dan `media_assets` tetap dipakai halaman detail program dan beranda. → Tugas 7 memeriksa `/program/[slug]` masih menampilkan medianya.
9. **`system_settings` tidak lagi punya editor.** `/api/upload` harus tetap bekerja saat ketiga barisnya hilang atau bernilai di luar rentang. → Tugas 7.
10. **CTA Daftar pada program tanpa batch dibuka.** Tombol tidak boleh menuju formulir yang kemudian menolak. → Tugas 10, memakai `registrationUrl` yang sudah `null` dalam keadaan itu.
11. **Program tanpa foto atau tanpa video.** Seksi beranda tidak boleh menyisakan kerangka galeri kosong, dan tata letaknya tidak boleh rusak. → Tugas 10, diperiksa pada Series yang belum punya media.
12. **Alamat lama yang di-bookmark.** `/admin/media` hilang, `/admin/galeri` dan `/admin/partner` keluar dari sidebar tetapi tetap hidup. `/admin/media` harus memberi 404 yang wajar, bukan galat server. → Tugas 7.
13. **CSS isian global admin menimpa kelas shadcn.** Tailwind 4 menaruh utilitas di `@layer utilities`, sedangkan aturan isian admin dan `.admin-form-plain` ada di luar layer, sehingga selalu menang tanpa peduli spesifisitas. Bila satu aturan tertinggal, `Input` shadcn tampil seperti gaya lama dan `Textarea` tetap berbentuk pil. → Tugas 1 Step 2, diukur lewat `getComputedStyle`.
14. **Cincin fokus shadcn memakai `--ring`.** Harus tetap monokrom karena `.admin-shell` memetakannya ke `--admin-ink`, di mode terang **dan** gelap; dialog yang di-portal ke luar `.admin-shell` dijangkau lewat `body:has(.admin-shell)`. → Tugas 1 Step 2 dan 7.

---

### Task 1: Isian admin ke shadcn/ui dan header tunggal di form Program

**Status:** pengerjaan ulang. Versi Revisi 2 dari tugas ini sudah di-commit di `34fefe7` (Model A, label 11 px kapital, teks 12 px). Hasilnya terlihat di tangkapan layar pemilik: dua header bertumpuk di layar edit Program, dan `Textarea` berbentuk pil dengan sudut 999 px. Tugas ini membongkar Model A dan memasang shadcn.

**Files:**
- Modify: `front/app/globals.css` — hapus aturan isian global admin (sekitar baris 1633–1650: `.admin-shell :is(input…, textarea, select, [role="combobox"])`, `:focus-visible`-nya, `[aria-invalid]`-nya, dan dua aturan `div.border-b:has(> input|textarea)`) serta seluruh blok `.admin-form-plain` (sekitar 1653–1699). **Pertahankan** `input.admin-search` dan media query 16 px-nya.
- Modify: `front/components/admin/ui/form/fields.tsx` (`Field` memakai `Label` shadcn; `FormPage` tanpa `admin-form-plain`)
- Modify: `front/components/admin/ui/form/FormDialog.tsx` (tanpa `admin-form-plain`)
- Modify: `front/components/admin/ProgramForm.tsx`
- Modify: `front/app/(admin)/admin/rekening/RekeningClient.tsx`
- Modify: `front/components/admin/program/ProgramBatchBoard.tsx`
- Modify: `front/lib/admin-nav.ts`, `front/lib/admin-nav.test.mjs`

**Interfaces:**
- Produces: `Field({ label, htmlFor, required, hint, error, span, breakpoint, children })` — props **tidak berubah**; label dirender dengan `Label` shadcn. `FieldGrid`, `FormSection`, `FormPage`, `FormDialog` — props tidak berubah. Modul nav `/admin/program` berlabel `"Program"`.
- Consumes: `Input`, `Textarea`, `Label` dari `components/ui/`; `AdminPageTitle` dari `@/components/admin/PageHeader`; `INHOUSE_SLUG` dari `@/lib/bundle`.

- [ ] **Step 1: Tes label modul (gagal dulu)**

Di `lib/admin-nav.test.mjs`, ubah asersi yang ada `resolveAdminNav("/admin/program").module?.label` dari `"Program & Batch"` menjadi `"Program"`, begitu juga daftar modul grup `kelas` menjadi `["Program", "Trainer"]`.

Run: `node --test lib/admin-nav.test.mjs`
Expected: FAIL — `actual: 'Program & Batch'`.

Lalu di `lib/admin-nav.ts` ganti label modul `"Program & Batch"` menjadi `"Program"`. Run lagi → PASS. Label grup (`Kelas`) baru diubah di Tugas 6.

- [ ] **Step 2: Buang CSS isian lama, pasang tinggi shadcn**

Hapus aturan yang disebut di daftar Files. Lalu tambahkan, **di dalam `@layer components`** supaya kelas per isian masih bisa menimpanya (P5):

```css
@layer components {
  /* Admin fields are shadcn controls: 44 px below 768 px (touch), 40 px from 768 px. */
  :is(.admin-shell, body:has(.admin-shell)) :is([data-slot="input"], [data-slot="select-trigger"]) { height: 2.75rem; }
  @media (min-width: 768px) {
    :is(.admin-shell, body:has(.admin-shell)) :is([data-slot="input"], [data-slot="select-trigger"]) { height: 2.5rem; }
  }
}
```

Periksa `data-slot` pada `SelectTrigger` di `components/ui/select.tsx`; sesuaikan selektornya bila namanya lain. Periksa juga blok `.admin-shell` terang **dan** gelap (sekitar baris 1380–1430) memetakan `--input`, `--ring`, `--border`, `--muted-foreground`, dan `--destructive` ke token admin; tambahkan yang belum ada supaya cincin fokus tidak pernah biru.

- [ ] **Step 3: `Field`, `FormPage`, `FormDialog`**

`Field`: ganti `<label className="mb-2 block text-[11px] font-bold uppercase …">` dengan `<Label htmlFor={htmlFor}>` shadcn, bungkus anak dengan `grid gap-2`; tanda wajib tetap `*` merah `aria-hidden`. Petunjuk `text-[13px] text-admin-text-secondary`, galat `text-[13px] text-admin-danger` dengan `role="alert"`. `FormPage` dan `FormDialog`: hapus kelas `admin-form-plain` dari `<form>`.

- [ ] **Step 4: Form Program — satu header, `FormPage`, shadcn**

Di `components/admin/ProgramForm.tsx`:
- **hapus** blok header buatan sendiri: tombol kembali bulat, teks `[ PENGATURAN PROGRAM ]`, dan `<h1>Edit Program</h1>`, beserta impor `ArrowLeft` dan `Link` bila tidak dipakai lagi. Header shell (judul modul **Program** + tombol kembali) sudah ada di atasnya (K13);
- render `<AdminPageTitle>{initialData.title}</AdminPageTitle>` supaya breadcrumb berakhir dengan nama program;
- ganti kartu, footer, dan tombol buatan sendiri dengan `FormPage` (`cancelHref="/admin/program"`, `submitLabel="Simpan program"`, `pending={isSubmitting}`, `onSubmit={handleSubmit}`) dan `FormSection` bernomor (P6): **1 Informasi utama**, **2 Formulir pendaftaran** (tidak dirender untuk Inhouse), **3 Materi & benefit** (nomor 2 untuk Inhouse);
- semua `<input>` jadi `<Input>`, semua `<textarea>` jadi `<Textarea rows={3}>` — termasuk Deskripsi, yang sekarang berbentuk pil dan dicoret di tangkapan layar. Pasangan Biaya / Harga coret memakai `FieldGrid columns={2} breakpoint="md"`; DP memakai `span="narrow"`;
- isian daftar materi juga `Input`; tombol hapus materi memakai `rowDangerActionClass`, tombol tambah materi memakai pil sekunder admin;
- banner galat di atas form memakai token admin (`bg-admin-rose-soft text-admin-danger`, `role="alert"`);
- pertahankan persis: `isInhouse`, validasi dan pesan galatnya, `handleMoneyChange`, `formatNumber`, dan payload simpan.

- [ ] **Step 5: Pengguna Model A lainnya**

Begitu `.admin-form-plain` hilang, kontrol polos di dalamnya kehilangan gaya. Ganti ke shadcn pada:
- `RekeningClient.tsx`: ketiga `<input>` → `<Input>`; checkbox "Jadikan rekening aktif" tetap;
- `ProgramBatchBoard.tsx`: nama batch, harga paket, DP paket → `<Input>`; penjelasan paket → `<Textarea>`; tanggal/jam di `SessionRows` → `<Input type="date|time">`; checkbox tetap.

- [ ] **Step 6: Periksa**

Run: `node --test lib/admin-nav.test.mjs && npx tsc --noEmit && npx eslint app/globals.css components/admin/ui/form components/admin/ProgramForm.tsx "app/(admin)/admin/rekening/RekeningClient.tsx" components/admin/program/ProgramBatchBoard.tsx lib/admin-nav.ts && npm run build`
Expected: PASS, tanpa galat, build selesai. Lalu `grep -rn "admin-form-plain" front/app/globals.css front/components/admin/ui front/components/admin/ProgramForm.tsx front/components/admin/program "front/app/(admin)/admin/rekening"` → tidak ada hasil.

- [ ] **Step 7: Ukur di peramban**

`/admin/program/public-speaking-series/edit`, `/admin/program/inhouse-training/edit`, modal Tambah batch dan Paket di `/admin/program`, dan modal Rekening di `/admin/settings?tab=rekening`, pada 1280 px lalu 390 px, mode terang lalu gelap:
- **hanya satu header**: judul shell "Program" dengan tombol kembali; tidak ada `[ PENGATURAN PROGRAM ]` maupun "Edit Program"; breadcrumb berakhir dengan nama program;
- Deskripsi berupa `Textarea` sudut `rounded-lg`, bukan pil — baca `getComputedStyle(el).borderRadius`, harus jauh di bawah `999px` (Review Focus 13);
- tinggi `Input` 40 px pada 1280 px dan 44 px pada 390 px; ukuran font 14 px dan 16 px — baca `getComputedStyle`, jangan ditaksir (Review Focus 1);
- cincin fokus monokrom di terang dan gelap, tidak biru (Review Focus 14);
- `type="date"` dan `type="time"` di modal batch tidak terpotong (Review Focus 2);
- isian Inhouse tetap tersembunyi; simpan Program masih bekerja;
- tidak ada gulir mendatar pada 360 px.

- [ ] **Step 8: Commit**

```bash
git add front/app/globals.css front/components/admin/ui/form front/components/admin/ProgramForm.tsx "front/app/(admin)/admin/rekening/RekeningClient.tsx" front/components/admin/program/ProgramBatchBoard.tsx front/lib/admin-nav.ts front/lib/admin-nav.test.mjs
git commit -m "style(admin): isian admin pakai shadcn/ui, satu header di form Program (admin-ui-1)"
```

---

### Task 2: CmsCollectionClient ke shadcn/ui

**Files:**
- Modify: `front/components/admin/cms/CmsCollectionClient.tsx`

Berkas ini melayani Trainer, Testimoni, dan Galeri, jadi satu perubahan menyelesaikan ketiganya.

**Interfaces:**
- Consumes: `Field`, `FieldGrid` (Tugas 1).
- Produces: tipe `CmsField` dan props `CmsCollectionClient` **tidak berubah**, sehingga `trainer/page.tsx`, `testimoni/page.tsx`, dan `galeri/page.tsx` tidak perlu disentuh.

- [ ] **Step 1: Ganti renderer isian**

Hapus impor `InputLine`, `TextareaLine`, dan `SelectLine`. Di fungsi perender isian (sekitar baris 660–880):
- `type="select"` → `Field` + shadcn `Select` (`SelectTrigger` dengan `id` yang sama dengan `htmlFor`, `SelectValue`, `SelectContent`, satu `SelectItem` per opsi dari `options`/`labels`);
- `type="textarea"` → `Field` + `Textarea`;
- sisanya → `Field` + `Input` dengan `type` yang sesuai (`text`, `number`, `date`, `url`).

`Field` menerima `label`, `htmlFor`, `required`, `hint` (dari `field.help`), dan `error`. Jangan ubah tipe isian khusus yang sudah punya UI sendiri: `sessions`, `gallery`, `consent`, `member`, `boolean`, `price`.

- [ ] **Step 2: Wadah form tanpa token lama**

Hapus `admin-form-plain` dari `<form>` bila ada, dan ganti `bg-bg-card border-border-default` pada `DialogContent` menjadi `bg-admin-canvas` tanpa kelas border legacy (Tugas 4 kemudian mengganti `DialogContent` dengan `AdminSheet`).

- [ ] **Step 3: Periksa**

Run: `npx tsc --noEmit && npx eslint components/admin/cms/CmsCollectionClient.tsx`
Expected: tanpa galat.

- [ ] **Step 4: Ukur di peramban**

`/admin/trainer`, `/admin/testimoni`, `/admin/galeri`; buka form Tambah dan Ubah pada 1280 px dan 390 px:
- isian dan select memakai shadcn: sudut `rounded-lg`, tinggi 40/44 px, label 14 px huruf kalimat;
- **fokus select tidak biru**, dan select bisa dibuka serta dipilih dari papan tuts (Review Focus 3);
- validasi yang gagal masih menampilkan `role="alert"` dan memindahkan fokus ke isian pertama yang salah;
- simpan dan hapus satu baris uji di Testimoni, lalu kembalikan.

- [ ] **Step 5: Commit**

```bash
git add front/components/admin/cms/CmsCollectionClient.tsx
git commit -m "style(admin): form CMS Trainer, Testimoni, dan Galeri memakai shadcn/ui (admin-ui-2)"
```

---

### Task 3: Kontak, Profil akademi, dan Partner ke shadcn/ui

**Files:**
- Modify: `front/app/(admin)/admin/kontak/KontakClient.tsx`
- Modify: `front/app/(admin)/admin/profil-akademi/ProfilAkademiClient.tsx`
- Modify: `front/app/(admin)/admin/partner/page.tsx`

Form Media **tidak** dikerjakan di sini: modulnya dihapus pada Tugas 7.

- [ ] **Step 1: Kontak dan Profil akademi**

Hapus `admin-form-plain` dari `<form>`, kelas isian buatan sendiri (`mt-1.5 block w-full rounded-xl border border-admin-line px-3.5 py-2.5 text-sm text-admin-ink focus:border-admin-ink focus:outline-none`), dan `<label>` buatan sendiri; ganti dengan `Field` + `Input`/`Textarea` di dalam `FieldGrid columns={1}`. Pertahankan persis: `formatPhoneNumber`, state `saved` dan `dirty`, `useSettingsForm`, blok `statusMessage`, dan tombol simpan yang hanya tampil saat `!inSettings`.

- [ ] **Step 2: Partner**

Hapus konstanta `field`. Ganti ketiga `<label className="grid gap-2 …">` menjadi `Field` + `Input`, dan pakai token kartu admin yang sudah dipakai halaman itu.

- [ ] **Step 3: Periksa**

Run: `npx tsc --noEmit && npx eslint "app/(admin)/admin/kontak" "app/(admin)/admin/profil-akademi" "app/(admin)/admin/partner/page.tsx"`
Expected: tanpa galat.

- [ ] **Step 4: Ukur di peramban**

`/admin/settings` (tab Profil akademi dan Kontak) dan `/admin/partner?tambah=1` pada 1280 px dan 390 px. Satu bentuk isian di semuanya; bilah "Perubahan belum disimpan" di Settings masih muncul saat ada perubahan dan Simpan masih bekerja.

- [ ] **Step 5: Commit**

```bash
git add "front/app/(admin)/admin/kontak" "front/app/(admin)/admin/profil-akademi" "front/app/(admin)/admin/partner/page.tsx"
git commit -m "style(admin): Kontak, Profil akademi, dan Partner memakai shadcn/ui (admin-ui-3)"
```

---

### Task 4: Semua modal admin menjadi bottom sheet di ponsel

**Files:**
- Create: `front/components/admin/ui/AdminSheet.tsx`
- Modify: `front/components/admin/ui/form/FormDialog.tsx`
- Modify: `front/components/admin/ui/row-actions.tsx`
- Modify: `front/components/admin/cms/CmsCollectionClient.tsx`
- Modify: `front/components/admin/article/ArticleEditor.tsx`

`components/ui/dialog.tsx` dan `components/ui/DeleteConfirmDialog.tsx` **tidak diubah**: masih dipakai modul komunitas lama di luar cakupan.

**Interfaces:**
- Produces:

```tsx
// components/admin/ui/AdminSheet.tsx ("use client")
/** Cangkang Radix Dialog admin: di tengah ≥ 640 px, bottom sheet dengan pegangan geser < 640 px. */
export function AdminSheet(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: React.ReactNode;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  /** Tone kepala: "ink" (bawaan) atau "danger" untuk konfirmasi hapus. */
  tone?: "ink" | "danger";
  footer: React.ReactNode;
  children: React.ReactNode;
}): React.JSX.Element;
```

- Consumes: `ease`, `transition` dari `@/lib/motion/tokens`.

- [ ] **Step 1: Angkat cangkang `FormDialog` menjadi `AdminSheet`**

Pindahkan apa adanya: `useIsSheet` dengan `SHEET_QUERY = "(max-width: 639px)"`, `Dialog.Portal forceMount`, overlay, animasi masuk dan keluar, `drag="y"` dengan `dragControls` serta ambang tutup `offset.y > 120 || velocity.y > 600`, pegangan geser, `max-h-[92dvh]`, peta lebar `sm 440 / md 560 / lg 720`. Isi dan footer menjadi `children` dan `footer`.

- [ ] **Step 2: `FormDialog` memakai `AdminSheet`**

`FormDialog` tinggal membungkus `AdminSheet` dengan `<form onSubmit>` di dalamnya dan footer Batal + tombol kirim seperti sekarang (`h-12 w-full shrink-0 sm:w-auto sm:flex-1`). Props publik `FormDialog` **tidak berubah**, sehingga `RekeningClient` dan `ProgramBatchBoard` tidak perlu disentuh.

- [ ] **Step 3: Konfirmasi hapus admin memakai `AdminSheet`**

Di `components/admin/ui/row-actions.tsx`, ganti `DeleteConfirmDialog` dengan `AdminSheet` bertone `danger`, ikon `Trash2`, judul `Hapus {itemName}?`, deskripsi `Tindakan ini tidak dapat dibatalkan.`, footer Batal + Hapus. Perilaku `onConfirm` tidak berubah: tutup, jalankan, toast galat atau sukses, lalu `router.refresh()`. Di `CmsCollectionClient`, ganti kedua pemakaian `DeleteConfirmDialog` dengan cara yang sama, lalu hapus impornya dari kedua berkas.

- [ ] **Step 4: Dialog form CMS dan konfirmasi artikel**

Ganti `DialogContent` di `CmsCollectionClient` dengan `AdminSheet` (`size="lg"` bila `twoColumns`, selain itu `md`), dan `DialogContent` konfirmasi terbit di `ArticleEditor` dengan `AdminSheet`. Hapus kelas `zinc-*` dan `amber-*` pada tombolnya, ganti dengan token admin.

- [ ] **Step 5: Periksa**

Run: `npx tsc --noEmit && npx eslint components/admin/ui components/admin/cms/CmsCollectionClient.tsx components/admin/article/ArticleEditor.tsx`
Expected: tanpa galat.

- [ ] **Step 6: Ukur di peramban**

Pada 390 px lalu 360 px: modal Tambah batch dan Paket (`/admin/program`), modal Rekening (`/admin/settings` tab Rekening), form Tambah di `/admin/testimoni`, konfirmasi hapus dari `RowActions` di `/admin/partner`, konfirmasi terbit di editor artikel. Yang harus benar:
- semuanya menempel di bawah layar dengan pegangan geser, dan geser ke bawah menutupnya;
- **tombol utama terlihat tanpa menggulir di 360 px**, dan gulir halaman di belakang tidak terkunci setelah sheet ditutup (Review Focus 4);
- pada 1280 px semuanya tetap di tengah seperti sebelumnya.

- [ ] **Step 7: Commit**

```bash
git add front/components/admin/ui front/components/admin/cms/CmsCollectionClient.tsx front/components/admin/article/ArticleEditor.tsx
git commit -m "feat(admin): semua modal admin jadi bottom sheet di ponsel (admin-ui-4)"
```

---

### Task 5: Tagihan sebagai tabel dengan modal Detail

**Files:**
- Create: `front/lib/billing-rows.ts`, `front/lib/billing-rows.test.mjs`
- Create: `front/app/(admin)/admin/tagihan/TagihanClient.tsx`
- Modify: `front/app/(admin)/admin/tagihan/page.tsx`

**Interfaces:**
- Produces:

```ts
// lib/billing-rows.ts
export type BillingRegistration = {
  id: number; full_name: string; email: string; whatsapp: string;
  offer_title: string; received_at: string;
  academy_registration_items: { batch_slug: string }[];
  academy_invoices: {
    id: number; stage: string; subtotal_idr: number | string; unique_code: number | string;
    total_idr: number | string; status: string; reviewed_by: string | null;
    reviewed_at: string | null; created_at: string;
  }[];
};
export type BillingRow = {
  invoiceId: number | null;
  registration: BillingRegistration;
  stageLabel: string;      // "Awal" | "Pelunasan" | "—"
  totalIdr: number | null;
  status: string;          // status tagihan, atau "belum ada tagihan"
  createdAt: string;       // ISO; tanpa tagihan -> received_at pendaftaran
};
/** Satu baris per tagihan, terbaru dulu. Pendaftaran tanpa tagihan tetap mendapat satu baris. */
export function invoiceRows(registrations: readonly BillingRegistration[]): BillingRow[];
```

- Consumes: `resolveInvoice` dari `./actions`; `DataTable`, `StatusChip`, `rowPillClass`; `AdminSheet` (Tugas 4); `TableToolbar`, `EmptyState`.

- [ ] **Step 1: Tulis tes yang gagal**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { invoiceRows } from "./billing-rows.ts";

const reg = (id, invoices) => ({
  id, full_name: `Nama ${id}`, email: `n${id}@example.invalid`, whatsapp: "081200000000",
  offer_title: "Paket Speaker + Sertifikasi", received_at: "2026-11-17T09:00:00+07:00",
  academy_registration_items: [{ batch_slug: "asa-batch-1" }, { batch_slug: "batch-9-exclusive" }],
  academy_invoices: invoices,
});
const inv = (id, stage, total, status, created) => ({
  id, stage, subtotal_idr: total, unique_code: 1, total_idr: total, status,
  reviewed_by: null, reviewed_at: null, created_at: created,
});

test("satu baris per tagihan, terbaru dulu", () => {
  const rows = invoiceRows([reg(1, [
    inv(10, "initial", 580000, "verified", "2026-11-17T09:05:00+07:00"),
    inv(11, "remaining", 2320000, "pending", "2026-11-18T09:05:00+07:00"),
  ])]);
  assert.deepEqual(rows.map((row) => row.invoiceId), [11, 10]);
  assert.deepEqual(rows.map((row) => row.stageLabel), ["Pelunasan", "Awal"]);
  assert.equal(rows[0].totalIdr, 2320000);
  assert.equal(rows[1].status, "verified");
});

test("pendaftaran tanpa tagihan tetap punya satu baris", () => {
  const rows = invoiceRows([reg(2, [])]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].invoiceId, null);
  assert.equal(rows[0].totalIdr, null);
  assert.equal(rows[0].stageLabel, "—");
  assert.equal(rows[0].createdAt, "2026-11-17T09:00:00+07:00");
});

test("baris dari beberapa pendaftaran diurutkan bersama", () => {
  const rows = invoiceRows([
    reg(1, [inv(10, "initial", 100, "pending", "2026-11-10T09:00:00+07:00")]),
    reg(2, [inv(20, "initial", 200, "pending", "2026-11-20T09:00:00+07:00")]),
  ]);
  assert.deepEqual(rows.map((row) => row.invoiceId), [20, 10]);
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `node --test lib/billing-rows.test.mjs`
Expected: FAIL dengan `ERR_MODULE_NOT_FOUND` untuk `./billing-rows.ts`.

- [ ] **Step 3: Implementasi `lib/billing-rows.ts`**

Ratakan tiap pendaftaran menjadi satu baris per tagihan; pendaftaran tanpa tagihan menghasilkan satu baris dengan `invoiceId: null`. Urutkan menurun berdasarkan `createdAt`. `stageLabel`: `remaining` → `"Pelunasan"`, selain itu `"Awal"`, dan `"—"` bila tidak ada tagihan.

- [ ] **Step 4: Jalankan, pastikan lulus**

Run: `node --test lib/billing-rows.test.mjs`
Expected: PASS 3 tes.

- [ ] **Step 5: `page.tsx` memuat data, `TagihanClient` merender**

`page.tsx`: `requireAdminMember()`, kueri yang ada **tidak diubah** selain menambahkan `created_at` pada `academy_invoices`, lalu render `<TagihanClient rows={invoiceRows(data ?? [])} searching={Boolean(q)} />`. `TableToolbar` dan `EmptyState` tetap seperti sekarang.

`TagihanClient` ("use client"): `DataTable caption="Tagihan" stackOnMobile` dengan kolom **Dibuat (WIB) · Nama · Program – batch · Tahap · Total · Status · Aksi**. `StatusChip`: `verified` → `mint`, `pending` → `peach`, `rejected` → `rose`, tanpa tagihan → `neutral`. Kolom Aksi: tombol **Detail** (`rowPillClass`) selalu ada; **Verifikasi** dan **Tolak** hanya saat `status === "pending"`, masing-masing `<form action={resolveInvoice}>` dengan `invoiceId` dan `decision` tersembunyi seperti sekarang. Tiap `<td>` memberi `data-label` karena `stackOnMobile`.

Modal Detail memakai `AdminSheet` (`size="md"`): nama, email, WhatsApp, program dan seluruh batch, waktu masuk, lalu daftar seluruh tagihan pendaftaran itu dengan subtotal, kode unik tiga digit, total, status, dan waktu diperiksa bila ada.

- [ ] **Step 6: Periksa**

Run: `node --test lib/billing-rows.test.mjs && npx tsc --noEmit && npx eslint lib/billing-rows.ts "app/(admin)/admin/tagihan" && npm run build`
Expected: PASS, tanpa galat, build selesai.

- [ ] **Step 7: Ukur di peramban**

`/admin/tagihan` pada 1280 px: tabel tujuh kolom, satu baris per tagihan, Detail membuka modal berisi kedua pendaftaran uji. Pada 390 px: baris menjadi kartu `data-label`, Detail menjadi bottom sheet. Cari masih menyaring. **Jangan menekan Verifikasi atau Tolak pada data pemilik.**

- [ ] **Step 8: Commit**

```bash
git add front/lib/billing-rows.ts front/lib/billing-rows.test.mjs "front/app/(admin)/admin/tagihan"
git commit -m "feat(admin): tagihan jadi tabel dengan modal detail (admin-ui-5)"
```

---

### Task 6: Navigasi — Program, Konten, dan Pengaturan

Satu tugas untuk seluruh perubahan sidebar supaya `admin-nav.ts` dan tesnya tidak ditulis dua kali.

**Files:**
- Modify: `front/lib/admin-nav.ts`, `front/lib/admin-nav.test.mjs`
- Modify: `front/components/admin/shell/AdminShell.tsx`
- Modify: `front/components/admin/PageHeader.tsx` (breadcrumb tidak mengulang label yang sama)
- Create: `front/app/(admin)/admin/profil-akademi/panel.tsx`, `front/app/(admin)/admin/kontak/panel.tsx`, `front/app/(admin)/admin/rekening/panel.tsx`
- Modify: `front/app/(admin)/admin/profil-akademi/page.tsx`, `front/app/(admin)/admin/kontak/page.tsx`, `front/app/(admin)/admin/rekening/page.tsx`
- Modify: `front/app/(admin)/admin/settings/page.tsx`
- Modify: `front/lib/albana-routes.test.mjs`

**Interfaces:**
- Produces: `AdminNavGroup` bertambah `sidebarHidden?: boolean`. Susunan akhir:

| Grup | Label | Modul di sidebar |
| --- | --- | --- |
| `dashboard` | Dashboard | — |
| `pendaftaran` | Pendaftaran | Pendaftar · Tagihan |
| `kelas` | **Program** | Program · Trainer |
| `konten` | Konten | Artikel · Testimoni |
| `pengaturan` | Pengaturan | **`sidebarHidden: true`** |

`Galeri`, `Partner`, dan `Media` tidak lagi menjadi modul sidebar. `Galeri` dan `Partner` tetap punya entri ber-`hidden: true` supaya judul dan breadcrumb-nya tetap benar; `Media` dihapus sama sekali (Tugas 7). `id` grup `kelas` dipertahankan agar `resolveAdminNav` dan tesnya tidak perlu diubah lebih dari labelnya.

- [ ] **Step 1: Tulis tes yang gagal**

Tambahkan ke `lib/admin-nav.test.mjs`:

```js
test("sidebar menampilkan tiga grup: Pendaftaran, Program, Konten", () => {
  const sidebar = adminNavGroups.filter((group) => group.id !== "dashboard" && !group.sidebarHidden);
  assert.deepEqual(sidebar.map((group) => group.label), ["Pendaftaran", "Program", "Konten"]);
  assert.equal(adminNavGroups.find((group) => group.id === "pengaturan").sidebarHidden, true);
});

test("Galeri dan Partner punya judul tetapi tidak di sidebar; Media tidak ada lagi", () => {
  assert.equal(resolveAdminNav("/admin/galeri").module?.hidden, true);
  assert.equal(resolveAdminNav("/admin/partner").module?.hidden, true);
  assert.equal(resolveAdminNav("/admin/media").module, undefined);
});

test("rute pengaturan tetap punya judul dan breadcrumb", () => {
  assert.equal(resolveAdminNav("/admin/settings").module?.label, "Pengaturan");
  assert.equal(resolveAdminNav("/admin/kontak").group.id, "pengaturan");
});
```

Dan ke `lib/albana-routes.test.mjs`: `/admin/profil-akademi`, `/admin/kontak`, dan `/admin/rekening` masih diizinkan supaya pengalihannya terjangkau; `/admin/galeri` dan `/admin/partner` masih diizinkan.

Run: `node --test lib/admin-nav.test.mjs lib/albana-routes.test.mjs`
Expected: FAIL — `sidebarHidden` belum ada, label masih "Kelas", dan Galeri/Partner/Media masih modul biasa.

- [ ] **Step 2: `admin-nav.ts`**

Tambahkan `sidebarHidden?: boolean` ke tipe `AdminNavGroup` dan pasang `sidebarHidden: true` pada grup `pengaturan`. Ganti label grup `kelas` menjadi `"Program"` dan deskripsinya. Pindahkan modul `Galeri` dan `Partner` dari grup `konten` ke grup `kelas` dengan `hidden: true`, dan hapus modul `Media`. Run tes → PASS.

- [ ] **Step 3: `AdminShell` menyaring grup, breadcrumb tanpa ulangan**

Di `PageHeader.tsx`: grup dan modul kini sama-sama berlabel "Program". Bila `group.label === module.label`, breadcrumb menampilkan label itu sekali, jadi layar edit menjadi `Program ⟶ Public Speaking Series`, bukan `Program ⟶ Program ⟶ …`.


Ganti `const [dashboard, ...groups] = adminNavGroups;` menjadi bentuk yang juga membuang grup ber-`sidebarHidden`. Tidak ada perubahan lain; menu akun sudah menautkan `/admin/settings`.

- [ ] **Step 4: Pindahkan pemuat data ke `panel.tsx`**

Untuk `profil-akademi`, `kontak`, dan `rekening`: pindahkan isi `page.tsx` sekarang — guard, kueri, dan render client-nya — ke `panel.tsx` di folder yang sama, diekspor sebagai komponen server bawaan. `rekening/panel.tsx` tetap membawa `AdminPageActions` "Tambah rekening", karena `SettingsTabs` menampilkannya untuk tab Rekening.

- [ ] **Step 5: Ketiga `page.tsx` menjadi pengalihan**

Isi tiap `page.tsx`: `await requireAdminMember();` lalu `redirect("/admin/settings?tab=<profil|kontak|rekening>")`, mengikuti pola `app/(admin)/admin/bundling/page.tsx`. Hapus `loading.tsx` di folder itu bila ada.

- [ ] **Step 6: `settings/page.tsx` mengimpor panel**

Ganti ketiga impor `../<modul>/page` menjadi `../<modul>/panel`. Bagian lain tidak berubah.

- [ ] **Step 7: Periksa**

Run: `node --test lib/admin-nav.test.mjs lib/albana-routes.test.mjs && npx tsc --noEmit && npx eslint lib/admin-nav.ts components/admin/shell/AdminShell.tsx "app/(admin)/admin/settings" "app/(admin)/admin/kontak" "app/(admin)/admin/rekening" "app/(admin)/admin/profil-akademi"`
Expected: PASS, tanpa galat.

- [ ] **Step 8: Ukur di peramban**

Sidebar: Dashboard, Pendaftaran, **Program**, Konten — pada mode penuh, mode ringkas, dan drawer di bawah 1024 px. `/admin/kontak` beralih ke `/admin/settings?tab=kontak` dengan tab Kontak aktif; begitu juga dua rute lainnya. `/admin/galeri` dan `/admin/partner` masih terbuka dengan judul dan breadcrumb yang benar meski tidak ada di sidebar. Menu akun → Pengaturan tetap bekerja, dan "Tambah rekening" masih muncul di tab Rekening.

- [ ] **Step 9: Commit**

```bash
git add front/lib/admin-nav.ts front/lib/admin-nav.test.mjs front/lib/albana-routes.test.mjs front/components/admin/shell/AdminShell.tsx "front/app/(admin)/admin/settings" "front/app/(admin)/admin/kontak" "front/app/(admin)/admin/rekening" "front/app/(admin)/admin/profil-akademi"
git commit -m "feat(admin): sidebar jadi Dashboard, Pendaftaran, Program, Konten (admin-ui-6)"
```

---

### Task 7: Hapus modul Media

**Files:**
- Delete: `front/app/(admin)/admin/media/` (seluruh folder: `page.tsx`, `actions.ts`, `AlbanaMediaUpload.tsx`, `MediaLibraryClient.tsx`, `loading.tsx`)
- Modify: `front/lib/albana-routes.ts`, `front/lib/albana-routes.test.mjs`

**Interfaces:**
- Produces: `/admin/media` tidak lagi diizinkan proxy, jadi memberi 404. `media_assets`, `POST /api/upload`, dan `GET /api/media/[id]` **tetap** (P1) dan masih dipakai `lib/server/program-showcase.ts`.
- Consumes: entri menu `Media` sudah dihapus pada Tugas 6.

- [ ] **Step 1: Tulis tes yang gagal**

Di `lib/albana-routes.test.mjs`, tambahkan asersi bahwa `/admin/media` **tidak** diizinkan, sementara `/api/upload` dan `/api/media/12` tetap diizinkan.

Run: `node --test lib/albana-routes.test.mjs`
Expected: FAIL — `/admin/media` masih ada di daftar izin.

- [ ] **Step 2: Hapus rute dari daftar izin**

Di `lib/albana-routes.ts`, buang `"/admin/media"` dari larik rute admin yang diizinkan. Jangan sentuh `/api/upload` maupun pola `/api/media/[0-9]+`. Run tes → PASS.

- [ ] **Step 3: Hapus folder modulnya**

```bash
git rm -r "front/app/(admin)/admin/media"
```

- [ ] **Step 4: Pastikan tidak ada acuan yang menggantung**

Run: `grep -rn "admin/media\|AlbanaMediaUpload\|MediaLibraryClient\|setMediaPublished\|saveMediaSettings\|addYoutube" front/app front/components front/lib`
Expected: tidak ada hasil kecuali `app/api/media/[id]/route.ts` (API publik, tetap) dan acuan di dokumen. Bila `addYoutube` masih dipakai, pindahkan logikanya pada Tugas 8 sebelum menghapusnya.

- [ ] **Step 5: Periksa fallback `system_settings`**

Review Focus 9. Jalankan satu kueri `execute_sql` untuk melihat ketiga baris `albana_media_min_*` masih ada; biarkan apa adanya. Lalu baca ulang `app/api/upload/route.ts` dan pastikan `minimums()` tetap memberi 1280 / 720 / 720 saat barisnya hilang atau di luar rentang 320–8192. Tidak ada kode yang perlu diubah; ini pemeriksaan, bukan perubahan.

- [ ] **Step 6: Periksa**

Run: `node --test lib/albana-routes.test.mjs && npx tsc --noEmit && npm run build`
Expected: PASS, tanpa galat, build selesai dan **tidak lagi memuat rute `/admin/media`** pada daftar rutenya.

- [ ] **Step 7: Ukur di peramban**

- `/admin/media` memberi 404, bukan galat server (Review Focus 12).
- Sidebar tidak lagi memuat Media.
- `/program/public-speaking-for-speakers` **masih menampilkan foto dan video** yang sudah ada, karena `/api/media/[id]` tetap hidup (Review Focus 8).

- [ ] **Step 8: Commit**

```bash
git add front/lib/albana-routes.ts front/lib/albana-routes.test.mjs
git commit -m "feat(admin): hapus modul Media; penyimpanan dan API medianya tetap (admin-ui-7)"
```

---

### Task 8: Galeri dokumentasi di form tiap program

**Files:**
- Create: `front/lib/program-media.ts`, `front/lib/program-media.test.mjs`
- Create: `front/components/admin/program/ProgramMediaEditor.tsx`
- Modify: `front/components/admin/ProgramForm.tsx`
- Modify: `front/app/(admin)/admin/program/[slug]/edit/page.tsx`
- Modify: `front/app/(admin)/admin/program/actions.ts`
- Modify: `front/app/api/upload/route.ts`

**Interfaces:**
- Produces:

```ts
// lib/program-media.ts
export const MAX_PROGRAM_PHOTOS = 20;
export const WARN_PROGRAM_PHOTOS = 15;
export const MAX_PROGRAM_VIDEOS = 2;

export type ProgramMediaItem = {
  id: number;
  kind: "image" | "video";
  provider: "supabase_storage" | "youtube";
  src: string;            // /api/media/<id> atau URL sematan youtube-nocookie
  alt: string;
  youtubeId: string | null;
};

/** Sisa kuota foto dan video, dan apakah sudah waktunya memperingatkan admin. */
export function mediaCapacity(items: readonly { kind: string }[]): {
  photos: number; videos: number;
  photoSlotsLeft: number; videoSlotsLeft: number;
  photoFull: boolean; videoFull: boolean; warnPhotos: boolean;
};
/** Pesan penolakan bila menambah `adding` foto melewati batas; null bila boleh. */
export function photoLimitError(current: number, adding: number): string | null;
/** Pesan penolakan bila menambah satu video melewati batas; null bila boleh. */
export function videoLimitError(current: number): string | null;
```

```ts
// app/(admin)/admin/program/actions.ts — tambahan
export async function addProgramVideo(input: { programSlug: string; url: string; title: string }): Promise<{ error?: string }>;
export async function removeProgramMedia(id: number): Promise<{ error?: string }>;
```

```tsx
// components/admin/program/ProgramMediaEditor.tsx ("use client")
export function ProgramMediaEditor(props: { programSlug: string; items: ProgramMediaItem[] }): React.JSX.Element;
```

- Consumes: `youtubeVideoId` dari `@/lib/youtube`; `Field`, `FieldGrid` (Tugas 1); `AdminSheet` (Tugas 4); `POST /api/upload` dengan `purpose=program`.

- [ ] **Step 1: Tulis tes yang gagal**

```js
import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_PROGRAM_PHOTOS, MAX_PROGRAM_VIDEOS, WARN_PROGRAM_PHOTOS,
  mediaCapacity, photoLimitError, videoLimitError,
} from "./program-media.ts";

const items = (photos, videos) => [
  ...Array.from({ length: photos }, () => ({ kind: "image" })),
  ...Array.from({ length: videos }, () => ({ kind: "video" })),
];

test("batasnya 20 foto dan 2 video, peringatan mulai 15 foto", () => {
  assert.equal(MAX_PROGRAM_PHOTOS, 20);
  assert.equal(MAX_PROGRAM_VIDEOS, 2);
  assert.equal(WARN_PROGRAM_PHOTOS, 15);
});

test("sisa kuota dihitung dari jenis tiap butir", () => {
  const empty = mediaCapacity([]);
  assert.deepEqual([empty.photoSlotsLeft, empty.videoSlotsLeft], [20, 2]);
  assert.equal(empty.warnPhotos, false);

  const warn = mediaCapacity(items(15, 1));
  assert.equal(warn.photos, 15);
  assert.equal(warn.photoSlotsLeft, 5);
  assert.equal(warn.warnPhotos, true);
  assert.equal(warn.videoFull, false);

  const full = mediaCapacity(items(20, 2));
  assert.equal(full.photoFull, true);
  assert.equal(full.videoFull, true);
  assert.equal(full.photoSlotsLeft, 0);
});

test("penambahan yang melewati batas ditolak dengan pesan", () => {
  assert.equal(photoLimitError(0, 20), null);
  assert.equal(photoLimitError(18, 2), null);
  assert.ok(photoLimitError(18, 3));
  assert.ok(photoLimitError(20, 1));
  assert.equal(videoLimitError(1), null);
  assert.ok(videoLimitError(2));
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `node --test lib/program-media.test.mjs`
Expected: FAIL dengan `ERR_MODULE_NOT_FOUND` untuk `./program-media.ts`.

- [ ] **Step 3: Implementasi `lib/program-media.ts`**

Hitung `photos` dan `videos` dari `kind`. `photoSlotsLeft = max(0, MAX − photos)`, begitu juga video. `warnPhotos` benar saat `photos >= WARN_PROGRAM_PHOTOS`. Pesan galat menyebut angkanya, misalnya `Maksimal 20 foto per program; sisa 2 slot.` dan `Maksimal 2 tautan YouTube per program.`

- [ ] **Step 4: Jalankan, pastikan lulus**

Run: `node --test lib/program-media.test.mjs`
Expected: PASS 3 tes.

- [ ] **Step 5: Paksakan batas di server**

Di `app/api/upload/route.ts`, cabang `purpose=program`: **sebelum** menulis ke Storage, hitung `media_assets` milik `programSlug` itu dengan `select("id", { count: "exact", head: true }).eq("program_slug", …).eq("kind", "image")`, lalu tolak dengan 409 dan pesan dari `photoLimitError(count, 1)` bila sudah penuh. Satu permintaan membawa satu berkas, jadi penghitungan ulang per permintaan menutup celah unggah serentak (Review Focus 7). Jangan ubah validasi tipe, ukuran, resolusi, atau pipeline WebP.

Di `actions.ts`, `addProgramVideo`: `requireAdminMember()`, validasi `programSlug` termasuk tiga slug Public Training atau Inhouse, parse URL dengan `youtubeVideoId()` dan tolak bila `null`, hitung video yang ada lalu terapkan `videoLimitError`, dan sisipkan baris `media_assets` dengan `provider: "youtube"`, `kind: "video"`, `object_key` berisi URL, `alt_text` berisi judul, `published: true` (P2). `removeProgramMedia`: `requireAdminMember("adminsuper")`, baca barisnya, hapus objek Storage bila `provider = "supabase_storage"`, lalu hapus barisnya. Keduanya `revalidatePath("/admin/program")` dan `revalidatePath("/", "layout")`.

- [ ] **Step 6: `ProgramMediaEditor`**

Satu seksi di form program, berjudul **Dokumentasi**:
- grid foto (rasio 4:3, `object-cover`) dengan tombol hapus bulat di tiap kartu, memakai `AdminSheet` tone `danger` untuk konfirmasi;
- `<input type="file" multiple accept="image/jpeg,image/png,image/webp">`; tiap berkas dikirim berurutan ke `/api/upload` dengan `purpose=program`, `programSlug`, dan `altText`; tampilkan kemajuan `n dari m` dan kumpulkan pesan galat per berkas tanpa menghentikan sisanya;
- penghitung `{photos} / 20 foto`, berwarna `--admin-peach-ink` saat `warnPhotos`, dan tombol unggah nonaktif saat `photoFull`;
- daftar video: tiap baris menampilkan judul dan tautan, dengan tombol hapus; isian **URL YouTube** + **Judul** memanggil `addProgramVideo`, nonaktif saat `videoFull`, dengan petunjuk "Gunakan tautan unlisted atau private.";
- `alt` wajib untuk foto — pakai satu isian "Keterangan gambar" yang berlaku untuk seluruh berkas pada unggahan itu, dan tolak di klien bila kosong.

Semua isian memakai shadcn `Input`/`Textarea`; input berkas memakai `Input type="file"` shadcn.

- [ ] **Step 7: Sambungkan ke form program**

`[slug]/edit/page.tsx`: baca `media_assets` milik program itu (`id,provider,kind,object_key,alt_text`) lewat `academyBillingClient()`, petakan ke `ProgramMediaItem` dengan aturan `src` yang sama seperti `readProgramDetail`, lalu teruskan ke `ProgramForm`. `ProgramForm` merender `<ProgramMediaEditor>` sebagai seksi setelah Materi & Benefit, untuk **semua** program termasuk Inhouse.

- [ ] **Step 8: Periksa**

Run: `node --test lib/program-media.test.mjs && npx tsc --noEmit && npx eslint lib/program-media.ts components/admin/program/ProgramMediaEditor.tsx components/admin/ProgramForm.tsx "app/(admin)/admin/program" "app/api/upload/route.ts" && npm run build`
Expected: PASS, tanpa galat, build selesai.

- [ ] **Step 9: Ukur di peramban**

Di `/admin/program/public-speaking-for-speakers/edit`:
- unggah tiga gambar sekaligus; ketiganya muncul di grid, dan pada Storage objeknya berakhiran `.webp` (periksa `object_key` lewat `execute_sql`);
- tambahkan satu tautan YouTube; muncul di daftar video. Tambahkan yang kedua; isiannya lalu nonaktif;
- hapus satu foto dan satu video, lalu pastikan barisnya hilang dan objek Storage-nya juga;
- pada 390 px grid menjadi dua kolom dan konfirmasi hapus menjadi bottom sheet.

Bersihkan media uji setelah selesai, dan **tanyakan pemilik lebih dulu bila ada media milik mereka** di program itu.

- [ ] **Step 10: Commit**

```bash
git add front/lib/program-media.ts front/lib/program-media.test.mjs front/components/admin/program/ProgramMediaEditor.tsx front/components/admin/ProgramForm.tsx "front/app/(admin)/admin/program" "front/app/api/upload/route.ts"
git commit -m "feat(admin): galeri foto dan YouTube per program di form program (admin-ui-8)"
```

---

### Task 9: `/admin/program` memuat In House Training

**Files:**
- Modify: `front/components/admin/program/ProgramBatchBoard.tsx`
- Modify: `front/app/(admin)/admin/program/page.tsx`

**Interfaces:**
- Produces: `ProgramBatchBoard` bertambah prop `inhouse: { galleryCount: number; partnerCount: number }`. Judul kelompok menjadi **Public Training** dan **In House Training**.
- Consumes: hitungan dari `loadBoard()` di `page.tsx`.

- [ ] **Step 1: `loadBoard()` membaca dua hitungan**

Tambahkan ke `Promise.all`: `supabase.from("gallery").select("id", { count: "exact", head: true })` dan `academyBillingClient().from("academy_partners").select("id", { count: "exact", head: true })`. Kembalikan `inhouse: { galleryCount, partnerCount }`. Jam permintaan tetap diambil di `loadBoard`, bukan saat render.

- [ ] **Step 2: Susun ulang papan**

Urutan akhir:

```text
Public Training
  ╭ Public Speaking Series        Rp1.500.000 · DP 20%            (✎) ╮
  ╭ Public Speaking for Speakers  Rp1.300.000 · DP 20%            (✎) ╮
  ╭ Sertifikasi Pembicara Prof.   Rp2.000.000 · DP 20%            (✎) ╮
  ╭ Paket Speaker + Sertifikasi   ● Ditawarkan   Rp2.900.000      (✎) ╮

In House Training
  ╭ Inhouse Training              Konsultasi langsung, tanpa batch (✎) ╮
  ╭ Gallery Kegiatan              12 foto                      Kelola ╮
  ╭ Our Partner                   8 logo                       Kelola ╮
```

Kartu Gallery Kegiatan dan Our Partner memakai bentuk kartu yang sama, menampilkan hitungan, dan tombol **Kelola** menautkan ke `/admin/galeri` dan `/admin/partner` (P3). Tambahkan peringatan `Warning` bila hitungannya nol: "Belum ada foto kegiatan." dan "Belum ada logo partner."

Kartu paket, modal batch, modal paket, peringatan program, dan `RowActions` batch **tidak berubah**.

- [ ] **Step 3: Periksa**

Run: `npx tsc --noEmit && npx eslint components/admin/program "app/(admin)/admin/program"`
Expected: tanpa galat.

- [ ] **Step 4: Ukur di peramban**

`/admin/program` pada 1280 px dan 390 px: dua judul kelompok, tujuh kartu dalam urutan di atas, hitungan foto dan logo cocok dengan basis data, dan Kelola membuka kedua halaman itu. Fungsi batch dan paket masih utuh.

- [ ] **Step 5: Commit**

```bash
git add front/components/admin/program/ProgramBatchBoard.tsx "front/app/(admin)/admin/program/page.tsx"
git commit -m "feat(admin): /admin/program memuat Public Training dan In House Training (admin-ui-9)"
```

---

### Task 10: Beranda — Public Training per program dan blok In House

**Files:**
- Create: `front/lib/server/program-galleries.ts`
- Create: `front/components/home/public-training-section.tsx`
- Create: `front/components/home/inhouse-training-section.tsx`
- Modify: `front/components/home/home-page.tsx`
- Delete: `front/components/home/program-showcase-section.tsx`, `front/components/home/documentation-section.tsx`, `front/components/home/partners-strip.tsx`

**Interfaces:**
- Produces:

```ts
// lib/server/program-galleries.ts
import "server-only";
export type ProgramGallery = { images: ProgramMediaItem[]; videos: ProgramMediaItem[] };
/** Media terbit per slug program, satu pembacaan untuk semua program. */
export async function readProgramGalleries(): Promise<Record<string, ProgramGallery>>;
```

```tsx
// components/home/public-training-section.tsx (komponen server)
export async function PublicTrainingSection(): Promise<React.JSX.Element>;
// components/home/inhouse-training-section.tsx (komponen server)
export async function InhouseTrainingSection(): Promise<React.JSX.Element>;
```

- Consumes: `readProgramShowcase()` dari `@/lib/server/program-showcase`; `readProgramGalleries()`; `readPublishedContacts`/`contactHref` untuk CTA WhatsApp Inhouse; tabel `gallery` dan `academy_partners` untuk blok In House; `ProgramMediaItem` dari `@/lib/program-media`.

- [ ] **Step 1: `readProgramGalleries()`**

Satu pembacaan `media_assets?select=id,provider,kind,object_key,alt_text,program_slug&published=eq.true&order=created_at.desc`, dikelompokkan per `program_slug`. Aturan `src` sama dengan `readProgramDetail`: `supabase_storage` → `/api/media/<id>`; `youtube` → `https://www.youtube-nocookie.com/embed/<id>`. Buang baris yang `src`-nya tidak terbentuk. Kegagalan pembacaan menghasilkan objek kosong, bukan galat — beranda harus tetap tampil.

- [ ] **Step 2: `PublicTrainingSection`**

Judul makro **Public Training** + satu paragraf intro, lalu satu `<section>` per program Public Training, dalam urutan Series, Speaker, Sertifikasi. Tiap seksi memuat:
- nama program sebagai `<h3>`, deskripsi dari `card.summary`;
- status dan jadwal ringkas dari `card.batch` bila ada;
- galeri: sampai empat foto sebagai grid responsif (satu kolom < 640 px, dua kolom ≥ 640 px, tiga ≥ 1024 px) dan satu sematan video bila ada, dengan `title` pada `<iframe>` dan `loading="lazy"`;
- CTA **Daftar** ke `card.registrationUrl` — bila `null`, tampilkan teks status (`card.statusLabel`) sebagai pengganti tombol, jangan tautkan ke formulir (Review Focus 10);
- CTA **Lihat Jadwal** ke `/program/<slug>`.

Program tanpa foto dan tanpa video **tidak merender kerangka galeri** sama sekali (Review Focus 11).

- [ ] **Step 3: `InhouseTrainingSection`**

Judul makro **In House Training** + intro, lalu:
- deskripsi program Inhouse dari `readProgramShowcase()` dan CTA konsultasi WhatsApp seperti yang dipakai `ProgramShowcaseSection` sekarang;
- **galeri dokumentasi kegiatan**: baris `gallery` yang punya `consent_verified_at`, memakai markup dari `documentation-section.tsx` yang ada;
- **Our Partner**: grid logo dari `academy_partners` yang `published`, memakai markup dari `partners-strip.tsx` yang ada.

Pindahkan markup kedua berkas itu ke sini, jangan tulis ulang dari nol, lalu hapus berkas aslinya.

- [ ] **Step 4: `home-page.tsx`**

Ganti `ProgramShowcaseSection` dengan `PublicTrainingSection`, dan hapus `PartnersStrip` serta `DocumentationSection` dari susunan; tambahkan `InhouseTrainingSection` sesudah `PublicTrainingSection`. Urutan akhir: Hero, BenefitBand, **PublicTraining**, **InhouseTraining**, PracticePreview, About, LearningMethod, Testimonial, Trainer, Schedule, RegistrationSteps, Closing.

- [ ] **Step 5: Periksa**

Run: `npx tsc --noEmit && npx eslint components/home lib/server/program-galleries.ts && npm run build`
Expected: tanpa galat, build selesai. Lalu `grep -rn "ProgramShowcaseSection\|PartnersStrip\|DocumentationSection" front/app front/components` → tidak ada hasil.

- [ ] **Step 6: Ukur di peramban**

Beranda pada 1280 px, 768 px, dan 390 px:
- judul makro Public Training, tiga seksi program dengan nama, deskripsi, galeri, dan dua CTA;
- Series yang belum punya media tidak menyisakan kotak galeri kosong;
- program tanpa batch dibuka menampilkan status, bukan tombol Daftar yang menyesatkan;
- blok In House Training memuat galeri kegiatan dan grid logo partner, dan **tidak ada** seksi dokumentasi atau partner yang kedua;
- tidak ada gulir mendatar pada 360 px; sematan video tidak melebihi lebar induknya.

- [ ] **Step 7: Commit**

```bash
git add front/lib/server/program-galleries.ts front/components/home front/components/home/home-page.tsx
git commit -m "feat(web): beranda memuat Public Training per program dan blok In House Training (admin-ui-10)"
```

---

### Task 11: Dokumen

**Files:**
- Modify: `docs/albana-docs/design/admin-ui-patterns.md` (§6.2, §7.1, §7, §8.2, §8.3)
- Modify: `docs/albana-docs/data/database-schema.md` (`gallery`, `media_assets`, `programs`)
- Modify: `docs/albana-docs/project/website-revision-specification.md` (susunan beranda)
- Modify: `front/AGENTS.md` (baris Admin Albana, Media, dan Beranda)
- Modify: `docs/albana-docs/plans/2026-11-16-redesign-restructure-implementation-plan.md` (tautan ke rencana ini)

- [ ] **Step 1: Pola UI admin**

- §7.1: tipografi isian shadcn (label 14 px medium huruf kalimat, teks 14 px desktop dan 16 px di bawah 768 px) dan tinggi isian 40/44 px (P5) dan catatan bahwa `input.admin-search` tetap 14 px.
- §7: `InputLine`, `TextareaLine`, `SelectLine`, dan Model A (`.admin-form-plain`) dinyatakan tidak dipakai di admin, beserta alasannya (fokus biru, label berbeda, `Textarea` pil). Pola target: **shadcn/ui** (`Input`, `Textarea`, `Select`, `Label`) di dalam `Field`, dengan modal Rekening sebagai contoh acuan. Catat juga aturan **satu header per halaman form** (K13).
- §6.2: bottom sheet berlaku untuk **semua** modal admin lewat `AdminSheet`; `components/ui/dialog.tsx` hanya untuk modul komunitas lama.
- §8.2: hapus baris Pengaturan dan Media dari matriks modul; tambahkan baris Program yang memuat In House; catat bahwa Galeri dan Partner tidak ada di sidebar dan dimasuki dari Program.
- §8.3: bentuk tabel tagihan, kolomnya, dan tombol Detail.
- Bagian baru **Dokumentasi program**: batas 20 foto dan 2 video, kompresi WebP otomatis, dan bahwa editor galeri berada di form program.

- [ ] **Step 2: Skema dan pipeline**

Di `database-schema.md`: catat bahwa `media_assets` **tidak punya CMS sendiri lagi** dan diisi dari form program dengan `published = true`; batas 20 foto dan 2 video per `program_slug` dipaksakan di `/api/upload` dan `addProgramVideo`; `system_settings.albana_media_min_*` tidak lagi dapat diubah dari CMS dan nilai bawaannya 1280 / 720 / 720. Lalu bedakan keduanya:

| | **Galeri Kegiatan** (`/admin/galeri`, dimasuki dari Program → In House) | **Dokumentasi program** (form program) |
| --- | --- | --- |
| Tabel | `gallery` | `media_assets` |
| Isi | Foto dokumentasi kegiatan In House | Foto dan video satu program |
| Terikat program | Tidak | Ya, `program_slug` dan `batch_slug` opsional |
| Sumber | Unggahan gambar | Unggahan gambar, atau tautan YouTube unlisted/private |
| Penyimpanan | Bucket `gallery`, URL publik | Bucket privat `academy-media` lewat `/api/media/[id]` sebagai signed URL; YouTube disematkan `youtube-nocookie` |
| Kompresi | WebP otomatis di `/api/upload` | WebP otomatis di `/api/upload` |
| Alur terbit | Tampil setelah izin publikasi terisi | Langsung terbit (P2) |
| Batas | — | 20 foto dan 2 video per program |
| Isian khusus | `consent_verified_at` | Keterangan gambar (`alt_text`) wajib |
| Tampil di | Blok In House Training di beranda | Seksi program di beranda dan halaman detail program |

- [ ] **Step 3: Beranda dan AGENTS**

Di `website-revision-specification.md`: susunan beranda yang baru dan isi tiap seksi program. Di `front/AGENTS.md`: baris Admin Albana menjadi `app/(admin)/admin/{program,trainer,artikel,testimoni,galeri,partner,pendaftar,tagihan,settings}/`; catat `/admin/media` sudah tidak ada; baris Beranda menyebut `public-training-section.tsx` dan `inhouse-training-section.tsx`.

- [ ] **Step 4: Periksa dan commit**

Run: `node --test lib/*.test.mjs` — catat hasil sebenarnya; dua kegagalan pre-existing di `admin-list` dan `cms-validation` tetap ada. Lalu `npx tsc --noEmit && npm run build`.

```bash
git add docs/albana-docs/design/admin-ui-patterns.md docs/albana-docs/data/database-schema.md docs/albana-docs/project/website-revision-specification.md docs/albana-docs/plans/2026-11-16-redesign-restructure-implementation-plan.md front/AGENTS.md
git commit -m "docs: shadcn/ui, bottom sheet, tabel tagihan, dokumentasi program, dan susunan beranda (admin-ui-11)"
```

---

## Cakupan permintaan

| Butir permintaan | Tugas |
| --- | --- |
| R1.1 Samakan gaya semua isian form admin (shadcn/ui, Revisi 3) | 1, 2, 3, 8 |
| R1.2 Rapikan tagihan desktop menjadi tabel | 5 |
| R1.3 Modal menjadi bottom sheet di ponsel | 4 |
| R1.4 Hapus menu Pengaturan dari sidebar | 6 |
| R1.5 Jelaskan bedanya Galeri dan Media | 11 |
| R2.1 Hapus fitur dan menu Media sepenuhnya | 6, 7 |
| R2.2 Menu Kelas menjadi Program, Public Training dan In House | 6, 9 |
| R2.3 Kompresi WebP otomatis | **sudah ada** (`lib/media-prepare.ts`); didokumentasikan di 11 |
| R2.4 Multiple upload 15–20 foto dan 1–2 YouTube | 8 |
| R2.5 Beranda Public Training per program | 10 |
| R2.6 Beranda In House Training: galeri kegiatan dan Our Partner | 10 |
| R3.1 Satu header di layar form; "Program & Batch" menjadi "Program" | 1, 6 |
| R3.2 Semua isian mengikuti shadcn/ui yang rapi | 1, 2, 3, 8 |

## Urutan eksekusi dan ketergantungan

```text
1 ──► 2 ──► 3        (shadcn; 1 membuang CSS lama dan memberi Field berlabel shadcn)
1 ──────────► 8      (8 menambah seksi Dokumentasi ke ProgramForm yang 1 tulis ulang)
4 ──────────► 5, 8   (5 dan 8 memakai AdminSheet)
6 ──────────► 7      (7 menghapus rute yang 6 keluarkan dari menu)
7 ──────────► 8      (8 memindahkan pekerjaan modul Media yang 7 hapus)
8 ──────────► 10     (10 memakai ProgramMediaItem dan data yang 8 isi)
9  bebas setelah 6
11 terakhir
```

Jalankan berurutan 1 → 11. Tugas 9 boleh dipindah lebih awal setelah Tugas 6 bila perlu.

## Catatan verifikasi

Sebagian besar pekerjaan ini visual, dan repo hanya punya harness `node --test` untuk fungsi murni di `lib/`. Yang betul-betul dites: `invoiceRows` (Tugas 5), daftar menu sidebar dan daftar izin rute (Tugas 6 dan 7), serta batas media `mediaCapacity`/`photoLimitError`/`videoLimitError` (Tugas 8). Sisanya diverifikasi dengan `tsc`, eslint, `npm run build`, dan pengukuran di peramban pada 1280, 768, 390, dan 360 px — termasuk membaca `getComputedStyle` untuk ukuran font, bukan menaksirnya. Itu batas yang jujur: refactor tampilan ini tidak punya tes regresi otomatis, jadi pemeriksaan di peramban adalah satu-satunya jaring untuk pergeseran tata letak.

Dua hal yang menyentuh data sungguhan dan karena itu perlu kehati-hatian: Tugas 7 menghapus satu-satunya editor `system_settings.albana_media_min_*` (nilainya dibiarkan, fallback kode yang menanggung), dan Tugas 8 menulis serta menghapus baris `media_assets` beserta objek Storage-nya. Jangan menghapus media milik pemilik tanpa menanyakannya lebih dulu.
