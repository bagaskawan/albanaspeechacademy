# Restrukturisasi & Redesign Admin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memecah admin CMS menjadi 12 modul bernama dan menerapkan design-system desktop + admin-mobile responsive.

**Architecture:** Route group `app/admin/(cms)` membawa shell (sidebar/topbar) dan semua halaman berautentikasi; `login` tetap di luar. Daftar dan detail memakai komponen bersama; aturan data tetap di `lib/cms-fields.ts` dan `lib/server/cms-data.ts`. Koleksi dipetakan ke URL oleh satu registry `lib/admin-modules.ts`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Supabase REST yang sudah ada.

**Spec:** `docs/archive/working-notes/superpowers/specs/2026-11-10-admin-restructure-design.md`

## Global Constraints

- Jangan menambah dependency atau font baru. Ikon SVG inline.
- Jangan mengubah halaman publik, token publik, endpoint, validasi, atau RLS.
- Semua halaman `(cms)` wajib `export const instant = false` karena membaca cookie.
- Nama file komponen/utility baru memakai kebab-case; komponen PascalCase.
- Copy antarmuka berbahasa Indonesia; tanggal WIB.
- Tidak ada `any`, `@ts-ignore`, atau tombol duplikat.

## Review Focus

- Kunci baris yang mengandung karakter URL (`slug` aneh, kunci gabungan) harus tetap membuka record yang benar, bukan 404.
- Koleksi tanpa izin create (`academy`) tidak boleh menampilkan tombol Tambah dan `/admin/profil-akademi/baru` harus 404.
- Record yang hilang atau kunci rusak harus 404, bukan halaman kosong.
- Halaman tanpa cookie harus redirect ke login, termasuk URL lama `/admin/konten/[table]`.
- Pencarian dan pagination tidak boleh menampilkan baris di luar hasil filter atau melewati halaman terakhir.

---

### Task 1: Token admin, ikon, registry modul, helper kunci & daftar

**Files:**
- Modify: `web/app/globals.css`
- Create: `web/components/admin/admin-icon.tsx`
- Create: `web/lib/admin-modules.ts`
- Create: `web/lib/cms-key.ts`
- Test: `web/lib/cms-key.test.mjs`
- Create: `web/lib/admin-list.ts`
- Test: `web/lib/admin-list.test.mjs`

**Interfaces:**
- `adminModules: AdminModule[]`, `adminGroups: string[]`, `moduleForSlug(slug: string): AdminModule | undefined`, `moduleForTable(table: CmsTable): AdminModule`
- `NEW_RECORD_KEY = "baru"`, `encodeCmsKey(key: Record<string, unknown>, names: string[]): string`, `decodeCmsKey(value: string, names: string[]): Record<string, string>`
- `ADMIN_PAGE_SIZE = 10`, `listFields(collection)`, `primaryValue(row, collection)`, `displayValue(field, row)`, `statusOf(collection, row)`, `filterRows(rows, collection, query)`, `paginateRows(rows, page)`

- [x] **Step 1: Write failing tests** for key round-trip (single + composite + invalid) and list helpers (filter, status, pagination, display).
- [x] **Step 2: Run tests, verify they fail** (`node --test lib/cms-key.test.mjs lib/admin-list.test.mjs`).
- [x] **Step 3: Implement tokens, icon, registry, and helpers** per the interfaces above.
- [x] **Step 4: Run tests, verify pass.**
- [x] **Step 5: Commit.**

### Task 2: Shell admin, login, loading

**Files:**
- Create: `web/components/admin/admin-shell.tsx`
- Create: `web/components/admin/admin-nav.tsx`
- Create: `web/components/admin/admin-topbar.tsx`
- Create: `web/app/admin/(cms)/layout.tsx`
- Create: `web/app/admin/(cms)/loading.tsx`
- Modify: `web/app/admin/login/page.tsx`
- Modify: `web/components/admin/admin-login-form.tsx`
- Modify: `web/components/admin/admin-sign-out-button.tsx`

**Interfaces:**
- `AdminShell({ email: string, children: ReactNode })`
- `AdminNav({ onNavigate?: () => void })`
- `AdminTopbar({ email: string })`
- Layout: `requireAdmin()` lalu render `AdminShell`.

- [x] **Step 1: Implement shell/topbar/nav** (sidebar 220px, topbar 56px, drawer `<dialog>` mobile, active border 3px).
- [x] **Step 2: Implement layout + loading skeleton.**
- [x] **Step 3: Restyle login page/form/sign-out** ke token admin.
- [x] **Step 4: Lint + typecheck.**

### Task 3: Hub ringkasan

**Files:**
- Move: `web/app/admin/page.tsx` → `web/app/admin/(cms)/page.tsx`

**Interfaces:**
- Memakai `adminModules`/`adminGroups`; kartu tautan per modul, tanpa statistik.

- [x] **Step 1: Implement hub** dengan tagline, judul, dan grid kartu per grup.
- [x] **Step 2: Lint + typecheck.**

### Task 4: Daftar koleksi + 12 rute daftar + redirect URL lama

**Files:**
- Create: `web/components/admin/admin-collection-page.tsx`
- Create: `web/components/admin/admin-collection-list.tsx`
- Create: `web/components/admin/admin-upload-panel.tsx` (bungkus `CmsUploadForm` untuk media)
- Create: `web/app/admin/(cms)/{profil-akademi,program,trainer,batch,sesi,penugasan-trainer,gallery,testimoni,artikel,media,kontak,rekening}/page.tsx`
- Move: `web/app/admin/konten/[table]/page.tsx` → `web/app/admin/(cms)/konten/[table]/page.tsx` (jadi redirect)

**Interfaces:**
- `AdminCollectionPage({ table: CmsTable })`: `requireAdminAccess` + `listCmsRows`, error card 503, render `CmsUploadForm` bila `media_assets`.
- `AdminCollectionList({ collection, module, rows, table })`: pencarian, tabel desktop, kartu mobile, pagination 10, dock Tambah mobile.

- [x] **Step 1: Implement collection page + list** (desktop table, mobile cards, empty state, search, pagination, detail links via `encodeCmsKey`).
- [x] **Step 2: Create 12 list routes** (metadata + `instant = false`).
- [x] **Step 3: Implement legacy redirect** `/admin/konten/[table]` → `/admin/<slug>`, unknown → 404.
- [x] **Step 4: Lint + typecheck.**

### Task 5: Detail/create + restyle editor

**Files:**
- Create: `web/components/admin/admin-record-page.tsx`
- Create: `web/app/admin/(cms)/{...}/[key]/page.tsx` untuk 12 modul
- Modify: `web/components/admin/cms-editor.tsx`
- Modify: `web/components/admin/cms-upload-form.tsx`

**Interfaces:**
- `AdminRecordPage({ table: CmsTable, recordKey: string })`: `baru` → create (404 bila `!collection.create`), selain itu `decodeCmsKey` + `findCmsRow`, 404 bila hilang.
- `CmsEditor` tambah props `cancelHref?: string` dan `afterCreateHref?: string`; tombol Batal + Simpan `h-10`.

- [x] **Step 1: Implement record page** (back link, judul, error 503, form).
- [x] **Step 2: Restyle editor + upload form** (mobile transparan, field admin, footer aksi).
- [x] **Step 3: Create 12 detail routes.**
- [x] **Step 4: Lint + typecheck.**

### Task 6: Verifikasi menyeluruh + dokumentasi

**Files:**
- Modify: `project/docs/data/system-architecture.md`

- [x] **Step 1: `npm run lint`.**
- [x] **Step 2: `npx --no-install tsc --noEmit`.**
- [x] **Step 3: `npm run build`.**
- [x] **Step 4: `node --test lib/cms-key.test.mjs lib/admin-list.test.mjs`.**
- [x] **Step 5: Update status rute di `docs/data/system-architecture.md`** agar sesuai implementasi.
- [x] **Step 6: Commit akhir.**
