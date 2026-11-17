# Audit dan Refactor UI Admin — Rencana Implementasi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Satu gaya isian untuk seluruh form admin Albana, daftar tagihan berbentuk tabel di desktop dengan modal Detail, semua modal admin menjadi bottom sheet di ponsel, dan grup Pengaturan hilang dari sidebar.

**Architecture:** Gaya isian sudah ada sebagai satu aturan CSS (`.admin-form-plain` di `app/globals.css`) plus komponen `Field`/`FieldGrid`. Refactor ini memindahkan setiap form admin yang masih memakai `InputLine`/`TextareaLine`/`SelectLine` atau kelas buatan sendiri ke pasangan itu, lalu mengubah tipografinya sekali di dua tempat. Bottom sheet juga sudah ada di `FormDialog`; cangkangnya diangkat menjadi satu komponen bersama yang dipakai dialog admin lain. Hanya dua bagian yang punya logika nyata dan karena itu dites: pembentukan baris tagihan dan daftar menu sidebar.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind 4, Radix Dialog, Motion, `node --test`.

**Spec:** Permintaan pemilik 17 November 2026 (lima butir di bawah) dengan [pola UI admin](../design/admin-ui-patterns.md) sebagai acuan bentuk. Tidak ada dokumen rancangan terpisah; keputusan pemilik dicatat di tabel berikut dan itulah yang mengikat.

## Keputusan pemilik

| # | Keputusan |
| --- | --- |
| K1 | `InputLine`, `TextareaLine`, dan `SelectLine` **tidak dipakai lagi di admin**. Semua form admin memakai `Field`/`FieldGrid` dengan kontrol polos yang distyle `.admin-form-plain` (tinggi 48 px, radius 999 px, latar `--admin-surface-muted`). |
| K2 | Tipografi isian: label **11 px kapital tebal**, teks isian **12 px** di desktop dan **16 px di bawah 768 px**. |
| K3 | Tagihan desktop: **satu baris per tagihan**, kolom Dibuat · Nama · Program–batch · Tahap · Total · Status · Aksi. Tombol **Detail** membuka modal berisi data pendaftar dan seluruh tagihannya. |
| K4 | Semua modal admin menjadi **bottom sheet di bawah 640 px**. |
| K5 | Grup **Pengaturan hilang dari sidebar**. `/admin/profil-akademi`, `/admin/kontak`, dan `/admin/rekening` **dialihkan** ke `/admin/settings` dengan tab yang sesuai. |
| K6 | Cakupan hanya **modul Albana aktif**. Modul komunitas lama dibiarkan apa adanya; rutenya sudah 404 lewat `lib/albana-routes.ts`. |

## Global Constraints

- Semua perintah dari `front/`. Baca `front/AGENTS.md`; untuk API Next.js baca `node_modules/next/dist/docs/`.
- Nilai tipografi isian, tepat: label `text-[11px] font-bold uppercase tracking-wider`, petunjuk dan pesan galat `text-[12px]`, teks isian `12px` dengan `16px` di `max-width: 767px`.
- `input.admin-search` (TableToolbar) **tidak diubah**: tetap 14 px, 16 px di bawah 768 px. Itu kolom cari, bukan isian form, dan punya paragrafnya sendiri di pola UI admin §8.2.
- Token admin saja: `--admin-*`. Tidak ada warna biru, tidak ada kelas `zinc-*`, dan tidak ada token situs publik (`border-rule`, `bg-card`, `text-muted`, `button-primary`) di dalam `.admin-shell`.
- Target sentuh minimal 44 px. Setiap isian punya `<label htmlFor>` atau `aria-label`; pesan galat memakai `role="alert"`.
- Setiap halaman dan Server Action admin memanggil `requireAdminMember()`. Hapus tetap `requireAdminMember("adminsuper")`.
- Data peserta, tagihan, rekening, dan token privat: jangan ke props client yang tidak perlu, jangan ke log.
- Modul yang masuk cakupan: Program, Trainer, Testimoni, Galeri, Media, Partner, Artikel, Pendaftar, Tagihan, Kontak, Profil akademi, Rekening, Settings. **Di luar cakupan:** `app/(admin)/admin/{acara,members,mentoring,venue,voucher,referral,attendance,payment,resources,revenue,transactions,admins,affiliate-payout,confirmation,funnel,logs,packages}` dan berkas berikut yang masih terkompilasi tetapi tidak dirender rute mana pun: `app/(admin)/admin/settings/{SettingsClient.tsx,panels/}`, `galeri/GaleriCMSClient.tsx`, `galeri/addGallery/`, `partner/PartnerClient.tsx`, `partner/addPartner/`, `media/MediaLibraryClient.tsx`, `pendaftar/PendaftarClient.tsx`. Jangan diubah dan jangan dihapus di rencana ini; sebut saja bila ditemukan.
- Satu tugas = satu commit; pesan menyebut nomor tugas `admin-ui-N`. Akhiri pesan commit dengan `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- Pohon kerja memuat perubahan pemilik yang belum di-commit, antara lain di `app/globals.css`, `app/layout.tsx`, `components/admin/shell/AdminShell.tsx`, `app/(admin)/admin/galeri/page.tsx`, `app/(admin)/admin/media/*`, `components/admin/cms/CmsCollectionClient.tsx`, dan beberapa berkas `components/home/`. Jangan dibuang; `git add` hanya berkas tugas itu, dan laporkan bila commit ikut membawanya.
- Pemeriksaan tiap tugas: `npx tsc --noEmit`, `npx eslint <berkas yang disentuh>`, dan tes `.test.mjs` yang relevan. `npm run build` pada Tugas 1, 5, dan 7.
- **Dua berkas tes sudah merah sebelum pekerjaan ini** karena mengimpor modul tanpa akhiran `.ts`: `lib/admin-list.test.mjs` (`./format`) dan `lib/cms-validation.test.mjs` (`./cms-fields`). Jangan diperbaiki di rencana ini; laporkan apa adanya.
- Pemeriksaan visual: `preview_start` nama `front`. **Port 3000 dipegang proses `next dev` yatim**, jadi `.claude/launch.json` memakai 3002. Halaman admin perlu sesi pemilik; jangan mengetik kredensial.

## Keadaan sekarang (hasil audit 17 November 2026)

Tiga gaya isian hidup berdampingan di admin aktif:

| Gaya | Bentuk | Dipakai oleh |
| --- | --- | --- |
| A — `.admin-form-plain` (target) | Pil 48 px, radius 999, latar abu, label `Field` 13 px, teks 15 px | `FormDialog`, `FormPage` → modal Rekening, modal Batch dan Paket |
| B — `InputLine`/`TextareaLine`/`SelectLine` | Garis bawah, label 11 px kapital, teks 12 px, **fokus biru `#2F5C86`** | `components/admin/ProgramForm.tsx`, `components/admin/cms/CmsCollectionClient.tsx` → Trainer, Testimoni, Galeri |
| C — kelas buatan sendiri | `rounded-xl border px-3.5 py-2.5 text-sm`, label 12 px kapital | `kontak/KontakClient.tsx`, `profil-akademi/ProfilAkademiClient.tsx` (keduanya membungkus `admin-form-plain` lalu menimpanya), `partner/page.tsx`, `media/page.tsx`, `media/AlbanaMediaUpload.tsx` |

Lainnya:

- `app/(admin)/admin/tagihan/page.tsx` menampilkan kartu `<article>` di semua lebar, memakai token situs publik.
- `FormDialog` sudah bottom sheet di bawah 640 px. `components/ui/dialog.tsx` **tidak**: `DialogContent` selalu di tengah (`rounded-none sm:rounded-[24px]`). Di admin aktif dipakai `DeleteConfirmDialog` (lewat `RowActions`, jadi ada di semua daftar), dialog form `CmsCollectionClient`, dan dialog konfirmasi `ArticleEditor`.
- `AdminShell.tsx` merender `const [dashboard, ...groups] = adminNavGroups` lalu `groups.map`, dan menyaring modul ber-`hidden`. Grup `pengaturan` berisi Profil akademi, Kontak, Rekening, dan Pengaturan (hidden).
- `/admin/settings` sudah menerima `?tab=`, dan `app/(admin)/admin/settings/page.tsx` merender ketiga **module page** sebagai panel. Karena itu ketiga `page.tsx` tidak bisa langsung menjadi pengalihan tanpa memindahkan pemuat datanya lebih dulu (Tugas 6).

## Review Focus

1. **Safari iOS nge-zoom saat isian difokus.** Teks 12 px harus tetap menjadi 16 px di bawah 768 px; aturan media query harus berada **sesudah** deklarasi 12 px di `globals.css`, bukan sebelum. → langkah eksplisit di Tugas 1 dan pengukuran di peramban pada 390 px.
2. **Pemilih tanggal dan jam bawaan pada 12 px.** `type="date"` dan `type="time"` di modal Batch bisa memotong ikon atau teksnya saat font dikecilkan. → diperiksa di peramban pada Tugas 1.
3. **`SelectLine` diganti `<select>` polos.** Harus ikut gaya admin, tidak berfokus biru, dan tetap bisa dipakai dari papan tuts. → diperiksa di peramban pada Tugas 2.
4. **Bottom sheet konfirmasi hapus di layar 360 px.** Tombol Hapus tidak boleh jatuh di bawah lipatan dan sheet tidak boleh mengunci gulir halaman. → diperiksa pada Tugas 4.
5. **Pendaftaran tanpa tagihan hilang dari tabel per-tagihan.** Satu baris per tagihan berarti pendaftaran yang belum punya tagihan tidak punya baris. → tes `invoiceRows` dengan daftar tagihan kosong pada Tugas 5.
6. **Breadcrumb dan judul halaman setelah grup Pengaturan hilang dari sidebar.** `resolveAdminNav` membaca daftar yang sama, jadi menghapus grupnya akan membuat `/admin/settings` jatuh ke Dashboard. → tes di Tugas 6.

---

### Task 1: Tipografi isian dan Program form ke gaya target

**Files:**
- Modify: `front/app/globals.css` (blok `.admin-form-plain`, sekitar baris 1653–1699)
- Modify: `front/components/admin/ui/form/fields.tsx` (`Field`)
- Modify: `front/components/admin/ProgramForm.tsx`
- Modify: `front/docs`— tidak ada; dokumen diperbarui di Tugas 7

**Interfaces:**
- Produces: `.admin-form-plain` dengan teks isian 12 px (16 px < 768 px); `Field` dengan label `text-[11px] font-bold uppercase tracking-wider` dan petunjuk/galat `text-[12px]`. Bentuk props `Field`, `FieldGrid`, `FormSection`, `FormPage` **tidak berubah**.
- Consumes: `INHOUSE_SLUG` dari `@/lib/bundle` (sudah dipakai `ProgramForm`).

- [ ] **Step 1: Ubah tipografi di `globals.css`**

Pada aturan `:is(.admin-shell, body:has(.admin-shell)) .admin-form-plain :is(input…, textarea, select)`: `font-size: 15px` → `font-size: 12px`. Tinggi 48 px, radius 999 px, latar, dan padding tidak diubah. Media query `@media (max-width: 767px)` yang menaikkan ke 16 px **tetap di posisinya yang sekarang, sesudah aturan itu**; jangan dipindahkan.

- [ ] **Step 2: Ubah label `Field`**

Di `components/admin/ui/form/fields.tsx`, label `Field`: `text-[13px] font-medium text-admin-ink` → `text-[11px] font-bold uppercase tracking-wider text-admin-text-secondary`. Paragraf galat dan petunjuk: `text-[13px]` → `text-[12px]`.

- [ ] **Step 3: Pindahkan `ProgramForm` ke `Field` + kontrol polos**

Hapus impor `InputLine` dan `TextareaLine`. Bungkus form dengan `admin-form-plain`. Ganti tiap isian dengan `Field` + `<input>`/`<textarea>` polos, `id` dan `htmlFor` sama seperti nama kolomnya. Susun dengan `FieldGrid columns={2} breakpoint="md"` untuk pasangan Biaya/Harga coret, `columns={1}` untuk sisanya. Pertahankan persis: `isInhouse` menyembunyikan Biaya, Harga coret, DP, Rincian biaya, dan seluruh seksi Formulir Pendaftaran; nomor seksi Materi `{isInhouse ? 2 : 3}`; semua validasi dan pesan galat yang ada; `handleMoneyChange` dan `formatNumber`. Jangan ubah header, footer, atau seksi Materi & Benefit.

- [ ] **Step 4: Periksa**

Run: `npx tsc --noEmit && npx eslint components/admin/ProgramForm.tsx components/admin/ui/form/fields.tsx && npm run build`
Expected: tanpa galat, build selesai.

- [ ] **Step 5: Ukur di peramban**

Buka `/admin/program/public-speaking-for-speakers/edit`, `/admin/program/inhouse-training/edit`, dan modal Tambah batch di `/admin/program`, pada 1280 px lalu 390 px. Yang harus benar:
- label 11 px kapital, teks isian 12 px pada 1280 px dan **16 px pada 390 px** (baca `getComputedStyle(el).fontSize`, jangan ditaksir);
- isian Inhouse tetap tersembunyi;
- `type="date"` dan `type="time"` di modal batch tidak terpotong dan masih bisa dipilih (Review Focus 2);
- tidak ada gulir mendatar pada 360 px.

- [ ] **Step 6: Commit**

```bash
git add front/app/globals.css front/components/admin/ui/form/fields.tsx front/components/admin/ProgramForm.tsx
git commit -m "style(admin): tipografi isian 11/12 px dan form Program memakai Field (admin-ui-1)"
```

---

### Task 2: CmsCollectionClient ke kontrol polos

**Files:**
- Modify: `front/components/admin/cms/CmsCollectionClient.tsx`

Berkas ini melayani Trainer, Testimoni, dan Galeri, jadi satu perubahan menyelesaikan ketiganya.

**Interfaces:**
- Consumes: `Field`, `FieldGrid` dari `@/components/admin/ui/form/fields` (Tugas 1).
- Produces: tipe `CmsField` dan props `CmsCollectionClient` **tidak berubah**, sehingga `trainer/page.tsx`, `testimoni/page.tsx`, dan `galeri/page.tsx` tidak perlu disentuh.

- [ ] **Step 1: Ganti renderer isian**

Hapus impor `InputLine`, `TextareaLine`, dan `SelectLine`. Di fungsi perender isian (sekitar baris 660–880):
- `type="select"` → `Field` + `<select>` polos dengan `<option>` dari `options`/`labels`;
- `type="textarea"` → `Field` + `<textarea>`;
- sisanya → `Field` + `<input>` dengan `type` yang sesuai (`text`, `number`, `date`, `url`).

`Field` menerima `label`, `htmlFor`, `required`, `hint` (dari `field.help`), dan `error`. Jangan ubah tipe isian khusus yang sudah punya UI sendiri: `sessions`, `gallery`, `consent`, `member`, `boolean`, `price`.

- [ ] **Step 2: Pastikan wadah form memakai `admin-form-plain`**

Tambahkan kelas `admin-form-plain` pada elemen `<form>` di dalam `DialogContent`, dan ganti `bg-bg-card border-border-default` pada `DialogContent` menjadi `bg-admin-canvas` tanpa kelas border legacy.

- [ ] **Step 3: Periksa**

Run: `npx tsc --noEmit && npx eslint components/admin/cms/CmsCollectionClient.tsx`
Expected: tanpa galat.

- [ ] **Step 4: Ukur di peramban**

Buka `/admin/trainer`, `/admin/testimoni`, dan `/admin/galeri`, lalu buka form Tambah dan Ubah pada 1280 px dan 390 px:
- isian dan select memakai pil abu 48 px, label 11 px kapital;
- **fokus select tidak biru** dan select bisa dibuka serta dipilih dari papan tuts (Review Focus 3);
- validasi yang gagal masih menampilkan pesan `role="alert"` dan memindahkan fokus ke isian pertama yang salah;
- simpan dan hapus satu baris uji di Testimoni, lalu kembalikan.

- [ ] **Step 5: Commit**

```bash
git add front/components/admin/cms/CmsCollectionClient.tsx
git commit -m "style(admin): form CMS Trainer, Testimoni, dan Galeri memakai Field (admin-ui-2)"
```

---

### Task 3: Kontak, Profil akademi, Partner, dan Media ke gaya target

**Files:**
- Modify: `front/app/(admin)/admin/kontak/KontakClient.tsx`
- Modify: `front/app/(admin)/admin/profil-akademi/ProfilAkademiClient.tsx`
- Modify: `front/app/(admin)/admin/partner/page.tsx`
- Modify: `front/app/(admin)/admin/media/page.tsx`
- Modify: `front/app/(admin)/admin/media/AlbanaMediaUpload.tsx`

- [ ] **Step 1: Kontak dan Profil akademi**

Keduanya sudah membungkus `admin-form-plain` lalu menimpanya. Hapus kelas isian buatan sendiri (`mt-1.5 block w-full rounded-xl border border-admin-line px-3.5 py-2.5 text-sm text-admin-ink focus:border-admin-ink focus:outline-none`) dan `<label>` buatan sendiri, ganti dengan `Field` + kontrol polos di dalam `FieldGrid columns={1}`. Pertahankan persis: `formatPhoneNumber`, state `saved` dan `dirty`, `useSettingsForm`, blok `statusMessage`, dan tombol simpan yang hanya tampil saat `!inSettings`.

- [ ] **Step 2: Partner**

Hapus konstanta `field`. Bungkus `<form action={savePartner}>` dengan `admin-form-plain`, ganti ketiga `<label className="grid gap-2 …">` menjadi `Field` + `<input>`, dan ganti wadahnya memakai token kartu admin yang sudah dipakai halaman itu.

- [ ] **Step 3: Media**

Di `media/page.tsx` dan `AlbanaMediaUpload.tsx`, hapus kelas isian inline (`min-h-11 border …`) pada setiap `<input>` dan `<select>`, bungkus tiap `<form>` dengan `admin-form-plain`, dan ganti `<label className="grid gap-2 text-sm">` menjadi `Field`. Ganti token situs publik `border-rule bg-card` pada kartu form menjadi token admin. `type="file"` tetap di luar aturan `.admin-form-plain` (sudah dikecualikan selektornya), jadi beri kelas sendiri yang konsisten dan sebutkan di Tugas 7.

- [ ] **Step 4: Periksa**

Run: `npx tsc --noEmit && npx eslint "app/(admin)/admin/kontak" "app/(admin)/admin/profil-akademi" "app/(admin)/admin/partner/page.tsx" "app/(admin)/admin/media"`
Expected: tanpa galat.

- [ ] **Step 5: Ukur di peramban**

Buka `/admin/settings` (tab Profil akademi dan Kontak), `/admin/partner?tambah=1`, dan `/admin/media` pada 1280 px dan 390 px. Yang harus benar: satu bentuk isian di semua halaman itu; bilah "Perubahan belum disimpan" di Settings masih muncul saat ada perubahan dan Simpan masih bekerja; unggah media masih menolak berkas di luar tipe yang diizinkan.

- [ ] **Step 6: Commit**

```bash
git add "front/app/(admin)/admin/kontak" "front/app/(admin)/admin/profil-akademi" "front/app/(admin)/admin/partner/page.tsx" "front/app/(admin)/admin/media"
git commit -m "style(admin): Kontak, Profil akademi, Partner, dan Media memakai Field (admin-ui-3)"
```

---

### Task 4: Semua modal admin menjadi bottom sheet di ponsel

**Files:**
- Create: `front/components/admin/ui/AdminSheet.tsx`
- Modify: `front/components/admin/ui/form/FormDialog.tsx`
- Modify: `front/components/admin/ui/row-actions.tsx`
- Modify: `front/components/admin/cms/CmsCollectionClient.tsx`
- Modify: `front/components/admin/article/ArticleEditor.tsx`

`components/ui/dialog.tsx` dan `components/ui/DeleteConfirmDialog.tsx` **tidak diubah**: keduanya masih dipakai modul komunitas lama di luar cakupan.

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

Pindahkan ke `AdminSheet` apa adanya: `useIsSheet` dengan `SHEET_QUERY = "(max-width: 639px)"`, `Dialog.Portal forceMount`, overlay, animasi masuk dan keluar, `drag="y"` dengan `dragControls` serta ambang tutup `offset.y > 120 || velocity.y > 600`, pegangan geser, `max-h-[92dvh]`, dan peta lebar `sm 440 / md 560 / lg 720`. Isi dan footer menjadi `children` dan `footer`.

- [ ] **Step 2: `FormDialog` memakai `AdminSheet`**

`FormDialog` tinggal membungkus `AdminSheet` dengan `<form onSubmit>` di dalamnya dan footer Batal + tombol kirim seperti sekarang (`h-12 w-full shrink-0 sm:w-auto sm:flex-1`). Props publik `FormDialog` **tidak berubah**, sehingga `RekeningClient` dan `ProgramBatchBoard` tidak perlu disentuh.

- [ ] **Step 3: Konfirmasi hapus admin memakai `AdminSheet`**

Di `components/admin/ui/row-actions.tsx`, ganti `DeleteConfirmDialog` dengan `AdminSheet` bertone `danger`, ikon `Trash2`, judul `Hapus {itemName}?`, deskripsi `Tindakan ini tidak dapat dibatalkan.`, dan footer Batal + Hapus. Perilaku `onConfirm` tidak berubah: tutup, jalankan, toast galat atau sukses, lalu `router.refresh()`. Di `CmsCollectionClient`, ganti kedua pemakaian `DeleteConfirmDialog` dengan cara yang sama. Hapus impor `DeleteConfirmDialog` dari kedua berkas.

- [ ] **Step 4: Dialog form CMS dan konfirmasi artikel**

Ganti `DialogContent` di `CmsCollectionClient` dengan `AdminSheet` (`size="lg"` bila `twoColumns`, selain itu `md`), dan `DialogContent` konfirmasi terbit di `ArticleEditor` dengan `AdminSheet`. Hapus kelas `zinc-*` dan `amber-*` pada tombolnya, ganti dengan token admin.

- [ ] **Step 5: Periksa**

Run: `npx tsc --noEmit && npx eslint components/admin/ui components/admin/cms/CmsCollectionClient.tsx components/admin/article/ArticleEditor.tsx`
Expected: tanpa galat.

- [ ] **Step 6: Ukur di peramban**

Pada 390 px lalu 360 px, buka: modal Tambah batch dan Paket (`/admin/program`), modal Rekening (`/admin/settings` tab Rekening), form Tambah di `/admin/testimoni`, konfirmasi hapus dari `RowActions` di `/admin/partner`, dan konfirmasi terbit di editor artikel. Yang harus benar:
- semuanya menempel di bawah layar dengan pegangan geser, dan geser ke bawah menutupnya;
- **tombol utama terlihat tanpa menggulir di 360 px**, dan gulir halaman di belakang sheet tidak terkunci setelah sheet ditutup (Review Focus 4);
- pada 1280 px semuanya tetap di tengah seperti sebelumnya.

- [ ] **Step 7: Commit**

```bash
git add front/components/admin/ui front/components/admin/cms/CmsCollectionClient.tsx front/components/admin/article/ArticleEditor.tsx
git commit -m "feat(admin): semua modal admin jadi bottom sheet di ponsel (admin-ui-4)"
```

---

### Task 5: Tagihan sebagai tabel dengan modal Detail

**Files:**
- Create: `front/lib/billing-rows.ts`
- Create: `front/lib/billing-rows.test.mjs`
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
    total_idr: number | string; status: string; reviewed_by: string | null; reviewed_at: string | null;
  }[];
};
export type BillingRow = {
  invoiceId: number | null;
  registration: BillingRegistration;
  stageLabel: string;      // "Awal" | "Pelunasan" | "—"
  totalIdr: number | null;
  status: string;          // status tagihan, atau "belum ada tagihan"
  createdAt: string;       // ISO; tagihan belum ada -> received_at pendaftaran
};
/** Satu baris per tagihan, terbaru dulu. Pendaftaran tanpa tagihan tetap mendapat satu baris. */
export function invoiceRows(registrations: readonly BillingRegistration[]): BillingRow[];
```

- Consumes: `resolveInvoice` dari `./actions`; `DataTable`, `StatusChip` dari `@/components/admin/ui/data-table`; `AdminSheet` (Tugas 4); `TableToolbar`, `EmptyState`.

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

`page.tsx`: `requireAdminMember()`, kueri yang ada **tidak diubah** (tambahkan `created_at` pada `academy_invoices`), lalu render `<TagihanClient rows={invoiceRows(data ?? [])} searching={Boolean(q)} />`. `TableToolbar` dan `EmptyState` tetap seperti sekarang.

`TagihanClient` ("use client"): `DataTable caption="Tagihan" stackOnMobile` dengan kolom **Dibuat (WIB) · Nama · Program – batch · Tahap · Total · Status · Aksi**. `StatusChip`: `verified` → `mint`, `pending` → `peach`, `rejected` → `rose`, tanpa tagihan → `neutral`. Kolom Aksi: tombol **Detail** (pil `rowPillClass`) selalu ada; **Verifikasi** dan **Tolak** hanya saat `status === "pending"`, masing-masing `<form action={resolveInvoice}>` dengan `invoiceId` dan `decision` tersembunyi seperti sekarang. Tiap `<td>` memberi `data-label` karena `stackOnMobile`.

Modal Detail memakai `AdminSheet` (`size="md"`): nama, email, WhatsApp, program dan seluruh batch, waktu masuk, lalu daftar seluruh tagihan pendaftaran itu dengan subtotal, kode unik tiga digit, total, status, dan waktu diperiksa bila ada.

- [ ] **Step 6: Periksa**

Run: `node --test lib/billing-rows.test.mjs && npx tsc --noEmit && npx eslint lib/billing-rows.ts "app/(admin)/admin/tagihan" && npm run build`
Expected: PASS, tanpa galat, build selesai.

- [ ] **Step 7: Ukur di peramban**

`/admin/tagihan` pada 1280 px: tabel dengan tujuh kolom, satu baris per tagihan, Detail membuka modal berisi kedua pendaftaran uji. Pada 390 px: baris menjadi kartu `data-label`, Detail menjadi bottom sheet. Cari masih menyaring. Jangan menekan Verifikasi atau Tolak pada data pemilik.

- [ ] **Step 8: Commit**

```bash
git add front/lib/billing-rows.ts front/lib/billing-rows.test.mjs "front/app/(admin)/admin/tagihan"
git commit -m "feat(admin): tagihan jadi tabel dengan modal detail (admin-ui-5)"
```

---

### Task 6: Pengaturan keluar dari sidebar, tiga rute dialihkan

**Files:**
- Modify: `front/lib/admin-nav.ts`, `front/lib/admin-nav.test.mjs`
- Create: `front/app/(admin)/admin/profil-akademi/panel.tsx`, `front/app/(admin)/admin/kontak/panel.tsx`, `front/app/(admin)/admin/rekening/panel.tsx`
- Modify: `front/app/(admin)/admin/profil-akademi/page.tsx`, `front/app/(admin)/admin/kontak/page.tsx`, `front/app/(admin)/admin/rekening/page.tsx`
- Modify: `front/app/(admin)/admin/settings/page.tsx`
- Modify: `front/lib/albana-routes.test.mjs`

**Interfaces:**
- Produces: `AdminNavGroup` bertambah `sidebarHidden?: boolean`; grup `pengaturan` memakainya. `resolveAdminNav` **tetap** mengenali `/admin/settings`, `/admin/kontak`, `/admin/rekening`, dan `/admin/profil-akademi`.

- [ ] **Step 1: Tulis tes yang gagal**

Tambahkan ke `lib/admin-nav.test.mjs`:

```js
test("sidebar menampilkan tiga grup; Pengaturan hanya dari menu akun", () => {
  const sidebar = adminNavGroups.filter((group) => group.id !== "dashboard" && !group.sidebarHidden);
  assert.deepEqual(sidebar.map((group) => group.label), ["Pendaftaran", "Kelas", "Konten"]);
  assert.equal(adminNavGroups.find((group) => group.id === "pengaturan").sidebarHidden, true);
});

test("rute pengaturan tetap punya judul dan breadcrumb", () => {
  assert.equal(resolveAdminNav("/admin/settings").module?.label, "Pengaturan");
  assert.equal(resolveAdminNav("/admin/kontak").group.id, "pengaturan");
});
```

Dan ke `lib/albana-routes.test.mjs`: pastikan `/admin/profil-akademi`, `/admin/kontak`, dan `/admin/rekening` masih diizinkan, supaya pengalihannya terjangkau.

Run: `node --test lib/admin-nav.test.mjs lib/albana-routes.test.mjs`
Expected: FAIL pada tes pertama — `sidebarHidden` belum ada, dan sidebar masih memuat empat grup.

- [ ] **Step 2: `admin-nav.ts`**

Tambahkan `sidebarHidden?: boolean` ke tipe `AdminNavGroup`, dan `sidebarHidden: true` pada grup `pengaturan`. Grupnya tetap di `adminNavGroups` supaya `resolveAdminNav` tetap memberi judul dan breadcrumb. Run tes → PASS.

- [ ] **Step 3: `AdminShell` menyaring grup**

Di `components/admin/shell/AdminShell.tsx`, ganti `const [dashboard, ...groups] = adminNavGroups;` menjadi bentuk yang juga membuang grup ber-`sidebarHidden`. Tidak ada perubahan lain di berkas itu; menu akun sudah menautkan `/admin/settings`.

- [ ] **Step 4: Pindahkan pemuat data ke `panel.tsx`**

Untuk tiap modul (`profil-akademi`, `kontak`, `rekening`): pindahkan isi `page.tsx` sekarang — guard, kueri, dan render client-nya — ke `panel.tsx` di folder yang sama, diekspor sebagai komponen server bawaan. `rekening/panel.tsx` tetap membawa `AdminPageActions` "Tambah rekening" seperti sekarang, karena `SettingsTabs` menampilkannya untuk tab Rekening.

- [ ] **Step 5: Ketiga `page.tsx` menjadi pengalihan**

Isi tiap `page.tsx`: `await requireAdminMember();` lalu `redirect("/admin/settings?tab=<profil|kontak|rekening>")`, mengikuti pola `app/(admin)/admin/bundling/page.tsx`. Hapus `loading.tsx` di folder itu bila ada.

- [ ] **Step 6: `settings/page.tsx` mengimpor panel**

Ganti ketiga impor `../<modul>/page` menjadi `../<modul>/panel`. Bagian lain tidak berubah.

- [ ] **Step 7: Periksa**

Run: `node --test lib/admin-nav.test.mjs lib/albana-routes.test.mjs && npx tsc --noEmit && npx eslint front/lib/admin-nav.ts components/admin/shell/AdminShell.tsx "app/(admin)/admin/settings" "app/(admin)/admin/kontak" "app/(admin)/admin/rekening" "app/(admin)/admin/profil-akademi"`
Expected: PASS, tanpa galat.

- [ ] **Step 8: Ukur di peramban**

Sidebar hanya memuat Dashboard, Pendaftaran, Kelas, Konten — pada mode penuh, mode ringkas, dan drawer di bawah 1024 px. `/admin/kontak` beralih ke `/admin/settings?tab=kontak` dengan tab Kontak aktif; begitu juga dua rute lainnya. Menu akun → Pengaturan tetap bekerja, dan "Tambah rekening" masih muncul di tab Rekening.

- [ ] **Step 9: Commit**

```bash
git add front/lib/admin-nav.ts front/lib/admin-nav.test.mjs front/lib/albana-routes.test.mjs front/components/admin/shell/AdminShell.tsx "front/app/(admin)/admin/settings" "front/app/(admin)/admin/kontak" "front/app/(admin)/admin/rekening" "front/app/(admin)/admin/profil-akademi"
git commit -m "feat(admin): Pengaturan keluar dari sidebar, tiga rutenya dialihkan ke /admin/settings (admin-ui-6)"
```

---

### Task 7: Dokumen

**Files:**
- Modify: `docs/albana-docs/design/admin-ui-patterns.md` (§6.2 cakupan sheet, §7.1 tipografi isian, §8.2 matriks, §8.3 tagihan)
- Modify: `docs/albana-docs/data/database-schema.md` (bagian `gallery` dan `media_assets`)
- Modify: `front/AGENTS.md` (baris Admin Albana dan Media)
- Modify: `docs/albana-docs/plans/2026-11-16-redesign-restructure-implementation-plan.md` (tautan ke rencana ini)

- [ ] **Step 1: Pola UI admin**

- §7.1: tipografi isian baru (label 11 px kapital tebal, teks 12 px, 16 px di bawah 768 px), dan catatan bahwa `input.admin-search` tetap 14 px.
- §6.2: bottom sheet berlaku untuk **semua** modal admin, lewat `AdminSheet`; `components/ui/dialog.tsx` hanya untuk modul komunitas lama.
- §7: `InputLine`, `TextareaLine`, dan `SelectLine` dinyatakan tidak dipakai di admin, beserta alasannya (fokus biru dan label yang berbeda).
- §8.2: baris Pengaturan dihapus dari matriks modul; tambahkan bahwa grupnya tidak ada di sidebar.
- §8.3: bentuk tabel tagihan, kolomnya, dan tombol Detail.

- [ ] **Step 2: Bedakan Galeri dan Media**

Tambahkan satu bagian ringkas pada `database-schema.md` (dan satu baris pada `AGENTS.md`) yang membedakan keduanya:

| | **Galeri** (`/admin/galeri`) | **Media** (`/admin/media`) |
| --- | --- | --- |
| Tabel | `gallery` | `media_assets` |
| Isi | Foto dokumentasi kegiatan | Foto dan video per program atau batch |
| Terikat program | Tidak | Ya, `program_slug` dan `batch_slug` opsional |
| Sumber | Unggahan gambar | Unggahan gambar atau video, atau tautan YouTube |
| Penyimpanan | Bucket `gallery`, URL publik | Bucket privat, disajikan lewat `/api/media/[id]` sebagai signed URL; YouTube disematkan `youtube-nocookie` |
| Alur terbit | Begitu ada izin publikasi, tampil | Masuk sebagai **draf**, admin menerbitkannya |
| Isian khusus | `consent_verified_at` (izin publikasi) | Batas resolusi minimum di `system_settings` |
| Tampil di | Dokumentasi di beranda | Halaman detail program |

- [ ] **Step 3: Periksa dan commit**

Run: `node --test lib/*.test.mjs` — catat hasil sebenarnya; dua kegagalan pre-existing di `admin-list` dan `cms-validation` tetap ada. Lalu `npx tsc --noEmit && npm run build`.

```bash
git add docs/albana-docs/design/admin-ui-patterns.md docs/albana-docs/data/database-schema.md docs/albana-docs/plans/2026-11-17-admin-ui-audit-refactor-plan.md docs/albana-docs/plans/2026-11-16-redesign-restructure-implementation-plan.md front/AGENTS.md
git commit -m "docs: tipografi isian admin, cakupan bottom sheet, tabel tagihan, dan bedanya Galeri dengan Media (admin-ui-7)"
```

---

## Cakupan permintaan

| Butir permintaan | Tugas |
| --- | --- |
| 1. Samakan gaya semua isian form admin | 1, 2, 3 |
| 2. Rapikan tagihan desktop menjadi tabel | 5 |
| 3. Modal menjadi bottom sheet di ponsel | 4 |
| 4. Hapus menu Pengaturan dari sidebar | 6 |
| 5. Jelaskan bedanya Galeri dan Media | 7 |

## Catatan verifikasi

Sebagian besar pekerjaan ini bersifat visual, dan repo hanya punya harness `node --test` untuk fungsi murni di `lib/`. Yang betul-betul dites: `invoiceRows` (Tugas 5) dan daftar menu sidebar (Tugas 6). Sisanya diverifikasi dengan `tsc`, eslint, `npm run build`, dan pengukuran di peramban pada 1280, 390, dan 360 px — termasuk membaca `getComputedStyle` untuk ukuran font, bukan menaksirnya. Itu batas yang jujur: refactor tampilan ini tidak punya tes regresi otomatis, jadi pemeriksaan di peramban adalah satu-satunya jaring untuk pergeseran tata letak.
